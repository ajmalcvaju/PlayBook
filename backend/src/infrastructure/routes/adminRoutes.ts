import express from "express"
import { adminAuthController,adminController } from "../../interfaces/controllers/adminController"
import { AdminBookingController } from "../../interfaces/controllers/adminController"
import { authenticateToken } from "../../interfaces/middlewares/authenticateToken"
import { authorizeRoles } from "../../interfaces/middlewares/authorizeRoles"

const router=express.Router()
const adminBookingController = new AdminBookingController();

router.post("/login",adminAuthController.login)
router.get("/refresh-token",adminAuthController.refreshToken)

router.get("/get-users",authenticateToken,authorizeRoles(["admin"]),(req, res) => adminController.getUsers(req, res))
router.get("/get-turfs",authenticateToken,authorizeRoles(["admin"]),(req, res) => adminController.getTurfs(req, res))
router.patch("/block-user",authenticateToken,authorizeRoles(["admin"]),(req, res) => adminController.blockUser(req, res))
router.patch("/block-turf",authenticateToken,authorizeRoles(["admin"]),(req, res) => adminController.blockTurf(req, res))

router.get("/get-booking",authenticateToken,authorizeRoles(["admin"]),adminBookingController.getBookings.bind(adminBookingController))
router.post("/pay-balance",authenticateToken,authorizeRoles(["admin"]),adminBookingController.payBalance.bind(adminBookingController))
router.get("/reviews",authenticateToken,authorizeRoles(["admin"]),adminBookingController.getReviews.bind(adminBookingController))
router.delete("/delete-review/:id",authenticateToken,authorizeRoles(["admin"]),adminBookingController.deleteReview.bind(adminBookingController))


export default router
