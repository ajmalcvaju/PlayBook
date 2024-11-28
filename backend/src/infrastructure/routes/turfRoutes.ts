import express from "express"
import { turfController } from "../../interfaces/controllers/turfController"
const router=express.Router()

router.post("/list",turfController.list)
router.post("/verify-otp",turfController.validateOtp)
router.post("/login",turfController.login)
router.post("/turfDetailsUpdate",turfController.updateTurfDetails)


export default router