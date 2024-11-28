import express from "express"
import { userController } from "../../interfaces/controllers/userController"


const router=express.Router()

router.post("/register",userController.register)
router.post("/verify-otp",userController.validateOtp)
router.post("/login",userController.login)
router.get("/getTurf",userController.getTurf)
router.post("/resend-otp",userController.resendOtp)


export default router