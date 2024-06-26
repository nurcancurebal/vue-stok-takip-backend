const md5 = require('md5');

const ModelUser = require("../../models/user");

module.exports = async function (req, res, next) {

    try {

        const body = req.body;

        if (!body?.username) throw new Error("Username not found!");
        if (!body?.password) throw new Error("Password not found!");
        if (!body?.firstname) throw new Error("Firstname not found!");
        if (!body?.lastname) throw new Error("Lastname not found!");
        if (!body?.birthdate) throw new Error("Birthdate not found!");

        body.birthdate = new Date(body.birthdate);
        body.birthdate.setHours(body.birthdate.getHours() - body.birthdate.getTimezoneOffset() / 60);

        const data = {
            username: body.username,
            password: md5(body.password),
            firstname: body.firstname,
            lastname: body.lastname,
            birthdate: body.birthdate
        };

        let result = await ModelUser.create(data);

        res.send(result);

    } catch (error) {

        error.status = 400;
        return next(error);

    };
};