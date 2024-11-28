import express from "express"
import { adminController } from "../../interfaces/controllers/adminController"
const router=express.Router()

router.post("/login",adminController.login)

export default router
