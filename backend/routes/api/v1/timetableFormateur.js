const express = require("express");
const router = express.Router();
const {
  index,
  show
} = require("./../../../controllers/TimetableFormateurInYearController.js");

router.get("/timetable-formateurs", index);
router.get("/timetable-formateurs/:mle_formateur", show);



module.exports = router;
