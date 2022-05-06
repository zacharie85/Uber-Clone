const jwt = require('jsonwebtoken');
const secretPasseotd = require('../config/jwtSecret');

module.exports = (req,res,next) =>{
    const autHeader =  req.get("Authorisation");

    if(!autHeader){
        return res.status(401).json({error: " Missing Authorization header"});
    }

    try {
        const token =  autHeader;
        jwt.verify(token,secretPasseotd);
        next();
    } catch (error) {
        res.status(401).json({error:error});
    }
  
};