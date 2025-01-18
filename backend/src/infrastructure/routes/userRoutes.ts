import express from "express"
import { userController } from "../../interfaces/controllers/userController"
import { authenticateToken } from "../../interfaces/middlewares/authenticateToken";
import { authorizeRoles } from "../../interfaces/middlewares/authorizeRoles";


const router=express.Router()


router.get("/get-slots",authenticateToken,authorizeRoles(["user"]),userController.getSlots);
router.post("/register",userController.register)
router.post("/verify-otp",userController.validateOtp)
router.post("/login",userController.login) 
router.post("/forgotpassword", userController.forgotPassword);
router.post("/change-forgotpassword", userController.changeForgottedPassword);
router.post("/verify-otp-forgotpassword", userController.verifyOtpForgotPassword);
router.post("/googleAuth",userController.googleAuth);
router.get("/getTurf",authenticateToken,authorizeRoles(["user"]),userController.getTurf)
router.get("/get-turf-details/:id",authenticateToken,authorizeRoles(["user"]),userController.getTurfDetails)
router.post("/resend-otp",userController.resendOtp)
router.post("/confirm-booking",authenticateToken,authorizeRoles(["user"]),userController.confirmBooking)
router.get("/get-booking/:email",authenticateToken,authorizeRoles(["user"]),userController.getBookings)
router.post("/chat",authenticateToken,authorizeRoles(["user"]),userController.chat)
router.post("/add-location",authenticateToken,authorizeRoles(["user"]),userController.addLocation)
router.get("/location",authenticateToken,authorizeRoles(["user"]),userController.getLocation)
router.patch("/cancel-booking",authenticateToken,authorizeRoles(["user"]),userController.cancellBooking)
router.get("/get-messages",authenticateToken,authorizeRoles(["user"]),userController.getMessages)
router.patch("/change-password",authenticateToken,authorizeRoles(["user"]),userController.changePassword)
router.post("/give-ratings",authenticateToken,authorizeRoles(["user"]),userController.giveRatings)
router.get("/get-ratings/:id",authenticateToken,authorizeRoles(["user"]),userController.getRatings)
router.post("/report",authenticateToken,authorizeRoles(["user"]),userController.report)





export default router