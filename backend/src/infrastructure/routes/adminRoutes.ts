import express from "express"
import { adminController } from "../../interfaces/controllers/adminController"
import { authenticateToken } from "../../interfaces/middlewares/authenticateToken"
import { authorizeRoles } from "../../interfaces/middlewares/authorizeRoles"
const router=express.Router()

router.post("/login",adminController.login)
router.get("/refresh-token",adminController.refreshToken)

router.get("/get-users",authenticateToken,authorizeRoles(["admin"]),adminController.getUser)
router.get("/get-turfs",authenticateToken,authorizeRoles(["admin"]),adminController.getTurf)
router.get("/get-booking",authenticateToken,authorizeRoles(["admin"]),adminController.getBookings)
router.post("/pay-balance",authenticateToken,authorizeRoles(["admin"]),adminController.payBalance)
router.patch("/block-user",authenticateToken,authorizeRoles(["admin"]),adminController.blockUser)
router.patch("/block-turf",authenticateToken,authorizeRoles(["admin"]),adminController.blockTurf)
router.get("/reviews",authenticateToken,authorizeRoles(["admin"]),adminController.getReviews)
router.delete("/delete-review/:id",authenticateToken,authorizeRoles(["admin"]),adminController.deleteReview)

export default router
