const express = require("express");
const router = express.Router();
const {
  index,
  show,
  updateStateModule,
  updateNbrHoursPresentailInWeek,
} = require("./../../../controllers/GroupController.js");


router.get("/groups", index);
router.get("/groups/:id", show);
router.patch("/groups/:groupId/module/:moduleId", updateStateModule);
router.patch(
  "/groups/:groupId/module/:moduleId/edit-nbr-hours-presentail",
  updateNbrHoursPresentailInWeek
);


module.exports = router;
