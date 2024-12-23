import express from "express"
import { turfController } from "../../interfaces/controllers/turfController"
import { productImage } from "../../interfaces/middlewares/imageUpload"
const router=express.Router()

router.post("/list",turfController.list)
router.post("/verify-otp",turfController.validateOtp)
router.post("/login",turfController.login)
router.post("/turfDetailsUpdate",productImage,turfController.updateTurfDetails)
router.get("/slots/:email",turfController.getSlots)
router.post("/slots",turfController.slotUpdate)
router.get("/slots/:email/:date",turfController.currentSlots)
router.delete("/delete-slots/:id",turfController.deleteSlot)
router.post("/get-booking",turfController.getBookings)
router.post("/add-location",turfController.addLocation)
router.post("/get-turfDetails",turfController.turfDetais)


export default router