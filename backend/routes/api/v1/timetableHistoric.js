const express = require("express");
const { index , getAllUniqueValidFromDates  , filterTimetableHistoric} = require("../../../controllers/HistoricTimetables/HistoricTimetableGroupsController.js");
const router = express.Router();

router.get('/historic-timetables/groups' , index)

router.get('/get-all-unique-valid-from-dates' , getAllUniqueValidFromDates)

router.get('/historic-timetables/groups-filter' , filterTimetableHistoric)

module.exports = router
