const User = require('../model/User');

exports.getUser =  (req, res) => {
    res.send("You fetched a user!");
};

exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        console.log(req.body);
      const result = await user.save();
        res.send(result);
    } catch (error) {
        res.status(500).send(error)
    }

};

