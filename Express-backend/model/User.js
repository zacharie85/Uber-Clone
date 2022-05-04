const mongoose = require('mongoose');

const userShema = new mongoose.Schema({
    firstName: {
        type:String,
        required:true
    },
    lastName:  {
        type:String,
        required:true
    },
    email:  {
        type:String,
        required:true
    },
    password:  {
        type:String,
        required:true
    },
});

const User = mongoose.model('User',userShema);

module.exports = User;