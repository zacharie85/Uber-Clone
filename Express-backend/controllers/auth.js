const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.createUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (await User.findOne({ email })) {
            const error = new Error(`this ${email} already exist !!`);
            error.statusCode = 409;
            throw error;
        } else {

            const haschedPassword = await bcrypt.hash(password, 12);

            const user = new User({ firstName, lastName, email, password: haschedPassword });

            const result = await user.save();
            res.send(result);
        }

    } catch (err) {
        next(err);
    }

};

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user) {

            const isPasswordCorest = await bcrypt.compare(password, user.password);

            if (isPasswordCorest) {

                const token = jwt.sign(user.email, "MySuperSecretPassword");

                return res.json({ token: token });
            }

            const error = new Error(`Password dos not match email ${email}`);
            error.statusCode= 401;
            throw error;
        } else {
            const error = new Error(`this email ${email} does not exist`);
            error.statusCode = 401;
            throw error;
        }


    } catch (err) {
        next(err);
    }
}