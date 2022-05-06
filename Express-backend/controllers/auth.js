const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.createUser = async (req, res) => {
    try {
        const {firstName,lastName,email,password} = req.body;

        if(await User.findOne({email})){
            return res.send(`this ${email} already exist !!`);
        };

        const haschedPassword = await bcrypt.hash(password,12);

        const user = new User({firstName,lastName,email,password:haschedPassword});

      const result = await user.save();
        res.send(result);
    } catch (error) {
        res.status(500).send(error)
    }

};

exports.loginUser =async (req,res) =>{
     const {email,password} = req.body;

    try{
        const user = await User.findOne({email});

        if(user){

            const isPasswordCorest =await bcrypt.compare(password, user.password);

            if(isPasswordCorest){

                const token = jwt.sign(user.email,"MySuperSecretPassword");

               return res.json({token:token});
            }
           return res.send("Password dosnt match!");
        }

       return res.send("this email dosnt exist!");
    }catch(error){

    } 
}