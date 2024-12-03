import express from "express"
import { adminController } from "../../interfaces/controllers/adminController"
const router=express.Router()

router.post("/login",adminController.login)
router.get("/get-users",adminController.getUser)
router.get("/get-turfs",adminController.getTurf)

export default router
