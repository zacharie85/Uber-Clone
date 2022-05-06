const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwtk = require('jsonwebtoken');

exports.getUser = async (req, res) => {
    const usersFromDb = await User.find({});
    const users = usersFromDb.map((user) =>{
        const userWithoutPassword = {
            email :user.email,
            firstName: user.firstName,
            lastName : user.lastName
        }

        return userWithoutPassword;
    });

    return res.json({users : users});
};


