const express = require("express");
// const { generate_population } = require('./../../../controllers/GA/Generate-timetable-v0.js')
const {
  generate_timetables,
} = require("./../../../controllers/GA/Generate-timetable.js");
const {
  generateFormateurTimetable,
} = require("../../../controllers/GA/Generate-timetable-formateur.js");

const router = express.Router();

router.post("/generate-timetable", generate_timetables);

router.post("/generate-timetable-formateurs", generateFormateurTimetable);

module.exports = router;
