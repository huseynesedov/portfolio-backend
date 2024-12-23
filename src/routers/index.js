const router = require("express").Router();

const works = require("../app/auth/product/router");
const about = require("../app/auth/about/router");

router.use("/works", works);
router.use("/about", about);

module.exports = router;