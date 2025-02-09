import express from "express"
import { turfBookingController, turfController, turfInfoController } from "../../interfaces/controllers/turfController"
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


router.get("/slots/:email",authenticateToken,authorizeRoles(["turf"]),(req, res) => turfBookingController.getSlots(req, res))
router.post("/slots",authenticateToken,authorizeRoles(["turf"]),(req, res) => turfBookingController.slotUpdate(req, res))
router.get("/slots/:email/:date",authenticateToken,authorizeRoles(["turf"]),(req, res) => turfBookingController.currentSlots(req, res))
router.delete("/delete-slots/:id",authenticateToken,authorizeRoles(["turf"]),(req, res) => turfBookingController.deleteSlot(req, res))
router.get("/get-booking/:email",authenticateToken,authorizeRoles(["turf"]),(req, res) => turfBookingController.getBookings(req, res))
router.patch("/cancel-booking",authenticateToken,authorizeRoles(["turf"]),(req, res) => turfBookingController.cancelBooking(req, res))

router.patch("/add-location",authenticateToken,authorizeRoles(["turf"]),turfInfoController.addLocation)
router.get("/get-turfDetails/:email",authenticateToken,authorizeRoles(["turf"]),turfInfoController.getTurfDetails)
router.patch("/turfDetailsUpdate",authenticateToken,authorizeRoles(["turf"]),productImage,turfInfoController.updateTurfDetails)

// router.get("/get-messages",authenticateToken,authorizeRoles(["turf"]),turfController.getMessages)
// router.get("/get-users-chat",authenticateToken,authorizeRoles(["turf"]),turfController.getUserForChat)


export default router