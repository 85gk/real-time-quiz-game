'use strict';
const express = require("express");
const router = express.Router();
const { userController } = require('../../controllers');
const { authService } = require("../../services");

/** user login routes */
router.get("/checkServer", userController.checkServer);
router.post("/register", authService.register);
router.post("/login", authService.login);

module.exports = router;