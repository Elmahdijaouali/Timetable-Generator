const express = require("express");
const { index  , store} = require("../../../controllers/GroupsEnStageController.js");
const router = express.Router();

router.get('/groups-en-stage' , index)
router.post('/groups-en-stage' , store )

module.exports = router