const ModelInventory = require("../../models/inventory");

module.exports = async function (_req, res, next) {
  try {
    const userId = res.locals.user._id;

    let result = await ModelInventory.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $group: {
          _id: { barcode: "$barcode", unit: "$unit" },
          data: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          entryData: {
            $filter: {
              input: "$data",
              as: "item",
              cond: { $eq: ["$$item.process", "entry"] },
            },
          },
          checkoutData: {
            $filter: {
              input: "$data",
              as: "item",
              cond: { $eq: ["$$item.process", "checkout"] },
            },
          },
        },
      },
      {
        $addFields: {
          entryAverage: { $avg: "$entryData.unitprice" },
          moneyEarned: {
            $reduce: {
              input: "$checkoutData",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  { $multiply: ["$$this.quantity", "$$this.unitprice"] },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          profitLoss: {
            $cond: [
              { $eq: [{ $size: "$checkoutData" }, 0] },
              "-",
              {
                $sum: {
                  $map: {
                    input: "$checkoutData",
                    as: "item",
                    in: {
                      $multiply: [
                        { $subtract: ["$$item.unitprice", "$entryAverage"] },
                        "$$item.quantity",
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalProfitLoss: {
            $sum: {
              $cond: [{ $eq: ["$profitLoss", "-"] }, 0, "$profitLoss"],
            },
          },
          totalMoneyEarned: { $sum: "$moneyEarned" },
        },
      },
      {
        $project: {
          totalProfitLoss: 1,
          netProfitMargin: {
            $cond: [
              { $eq: ["$totalMoneyEarned", 0] },
              0,
              {
                $divide: [
                  {
                    $multiply: ["$totalProfitLoss", 100],
                  },
                  "$totalMoneyEarned",
                ],
              },
            ],
          },
        },
      },
    ]);

    return res.send(
      result.length > 0 ? result[0] : { totalProfitLoss: 0, netProfitMargin: 0 }
    );
  } catch (error) {
    return next(error);
  }
};
