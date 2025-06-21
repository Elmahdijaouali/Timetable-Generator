const express  = require('express')
const {Login, Register} = require('./../../../controllers/Auth/AuthController.js')
const { updateInfo , updatePassword, deleteAccount } = require('../../../controllers/Auth/AdministratorController.js')

const router = express.Router()

router.post('/login' , Login)
router.post('/register' , Register)

router.patch('/update-info-administrator' , updateInfo)
router.patch('/update-password' , updatePassword)
router.delete('/delete-account/:email' , deleteAccount)

module.exports = router