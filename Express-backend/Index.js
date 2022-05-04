const express = require("express");
const mongose = require("mongoose");
const bodyParser = require('body-parser');
const PORT = 4000;
const app = express();
const MongoDBCOnnectionString = require('./config/mongodb');
const UserRouter = require('./route/users');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/users",UserRouter);


mongose.connect(MongoDBCOnnectionString, { useNewUrlParser: true })
    .then(result => {
        console.log('connected to mongose');
        app.listen(PORT, () => {
            console.log('====================================');
            console.log("Server is listeneing on port " + PORT);
            console.log('====================================');
        })
    })
    .catch(err => {
        console.log('We have somme error ' + err)
    });



