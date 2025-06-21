const express = require("express");
const router = express.Router();
const {index , show} = require('./../../../controllers/TimetableGroupController.js')

router.get('/timetables/groups' , index )
router.get('/timetables/:id' , show )

module.exports = router