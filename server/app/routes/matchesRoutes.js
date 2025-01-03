const express = require("express");
const router = express.Router();
const { create, getAll, getById, update, concludeMatch, remove } = require("../controllers/matchesController");

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.put("/match_concluded/:id", concludeMatch);
router.delete("/:id", remove);

module.exports = router;
