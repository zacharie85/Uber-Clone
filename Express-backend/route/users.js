const express = require("express");
const router = express.Router();
const UserController = require('../controller/Users');

router.get("/",UserController.getUser);

router.post("/",UserController.createUser);

module.exports = router;