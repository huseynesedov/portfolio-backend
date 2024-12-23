const router = require("express").Router();

const { works, create, worksID, editWorksID, deleteWorksID } = require("./product.controller");

// const { tokenCheck } = require("../../../middlewares/auth");

router.get("/", works);
router.post("/create", create);
router.get("/:worksID", worksID);
router.put("/:worksID", editWorksID);
router.delete("/:worksID", deleteWorksID);

module.exports = router; 