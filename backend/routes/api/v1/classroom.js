const express  = require('express')
const { index , addClassroom , classroomsNonDisponible , updateAvailableClassroom , classroomsDisponible} = require('../../../controllers/ClassroomController.js')
const router = express.Router()


router.get('/classrooms' , index)
router.post('/add-classroom' , addClassroom)
router.get('/classrooms-disponible' , classroomsDisponible)
router.get('/classrooms-non-disponible' , classroomsNonDisponible )
router.patch('/classrooms-non-disponible/:classroomId' , updateAvailableClassroom )


module.exports = router 