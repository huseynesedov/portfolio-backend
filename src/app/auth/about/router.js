const router = require("express").Router();

const { getAbout, createAbout, editAbout } = require("./about.controller");

// const { tokenCheck } = require("../../../middlewares/auth");

router.get("/", getAbout);
router.post("/create", createAbout);
router.put("/:id", editAbout);

module.exports = router; 