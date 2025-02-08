import express from "express"
import { turfController } from "../../interfaces/controllers/turfController"
import { productImage } from "../../interfaces/middlewares/imageUpload"
import { authenticateToken } from "../../interfaces/middlewares/authenticateToken"
import { authorizeRoles } from "../../interfaces/middlewares/authorizeRoles"
const router=express.Router()

router.post("/list", turfController.list.bind(turfController));
router.post("/verify-otp", turfController.validateOtp.bind(turfController));
router.post("/resend-otp", turfController.resendOtp.bind(turfController));
router.post("/login", turfController.login.bind(turfController));
router.post("/forgot-password", turfController.forgotPassword.bind(turfController));
router.post("/change-forgotpassword", turfController.changeForgottenPassword.bind(turfController));
router.post("/verify-otp-forgotpassword", turfController.verifyOtpForgotPassword.bind(turfController));
// router.patch("/turfDetailsUpdate",authenticateToken,authorizeRoles(["turf"]),productImage,turfController.updateTurfDetails)
// router.get("/slots/:email",authenticateToken,authorizeRoles(["turf"]),turfController.getSlots)
// router.post("/slots",authenticateToken,authorizeRoles(["turf"]),turfController.slotUpdate)
// router.get("/slots/:email/:date",authenticateToken,authorizeRoles(["turf"]),turfController.currentSlots)
// router.delete("/delete-slots/:id",authenticateToken,authorizeRoles(["turf"]),turfController.deleteSlot)
// router.get("/get-booking/:email",authenticateToken,authorizeRoles(["turf"]),turfController.getBookings)
// router.patch("/add-location",authenticateToken,authorizeRoles(["turf"]),turfController.addLocation)
// router.get("/get-turfDetails/:email",authenticateToken,authorizeRoles(["turf"]),turfController.turfDetais)
// router.get("/get-messages",authenticateToken,authorizeRoles(["turf"]),turfController.getMessages)
// router.get("/get-users-chat",authenticateToken,authorizeRoles(["turf"]),turfController.getUserForChat)
// router.patch("/cancel-booking",authenticateToken,authorizeRoles(["turf"]),turfController.cancellBooking)

export default router