const express = require("express");
const router = express.Router();

router.use(require("../middlewares/auth"));

router.get("/", require("../controllers/inventory/list-all"));
router.get("/current", require("../controllers/inventory/list-current"));

router.get("/list/count", require("../controllers/inventory/list-count"));
router.get("/current/count", require("../controllers/inventory/current-count"));
router.get("/:barcode", require("../controllers/inventory/list-barcode"));

router.post("/", require("../controllers/inventory/entry-one"));
router.post("/:barcode", require("../controllers/inventory/checkout-one"));

module.exports = router;
