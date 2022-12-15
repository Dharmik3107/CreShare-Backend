const express = require("express");
const { register, login, logout, verify } = require("../Controllers/auth");

const router = express.Router();

router.post("/register", register);
router.get("/register/verify/:confirmationToken", verify);
router.post("login", login);
router.post("logout", logout);

module.exports = router;
