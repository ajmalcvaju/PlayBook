import { Request,Response } from "express";
import { loginAdmin } from "../../application/usecases/loginAdmin";
import { UserModel } from "../../infrastructure/database/models/userModel";
import { getUsers } from "../../application/usecases/admin/getUsers";
import { AdminRepositoryImpl } from "../../infrastructure/database/repositories/AdminRepositoryImpl";
import { getTurfs } from "../../application/usecases/admin/getTurfs";
import { getBookings } from "../../application/usecases/admin/getBookings";
import { blockUser } from "../../application/usecases/admin/blockUser";
import { blockTurf } from "../../application/usecases/admin/blockTurf";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../infrastructure/services/token";
import { report } from "process";
import { getReviews } from "../../application/usecases/admin/getReviews";
import { deleteReview } from "../../application/usecases/admin/deleteReview";


export const adminController={
    login:async(req:Request,res:Response)=>{ 
        try {
            
            const {email,password}=req.body
            const token=await loginAdmin(email,password)
            const accessToken = generateAccessToken({ id: email, role: "admin" });
            res.cookie("accessToken", accessToken, {
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 5 * 60 * 1000,
            });
            const refreshToken = generateRefreshToken({
              id: email,
              role: "admin",
            });
            res.cookie("refreshToken", refreshToken, {
              httpOnly: false,
              secure: false,
              sameSite: "lax",
              maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            // res.cookie("auth_token", token, {httpOnly: true,maxAge: 86400000});
            res.status(200).json({message:"you can login now",token})
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    refreshToken:async(req:Request,res:Response)=>{ 
        try {
            const refreshToken = req.cookies.refreshToken;
            console.log(refreshToken)
            if (!refreshToken) {
              res.status(401).json({ message: "No refresh token provided" });
            }else{
                const decoded=verifyRefreshToken(refreshToken)
                const data=decoded?.data as string
                const role=decoded?.role as string
                console.log(role)
                const newAccessToken = generateAccessToken({ id:data, role:role });
                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 15 * 60 * 1000,
                  });
                res.status(200).json({ accessToken: newAccessToken });
            }   
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    getUser:async(req:Request,res:Response)=>{ 
        try {
            const users = await getUsers(AdminRepositoryImpl)
            const user = Array.isArray(users) && users[0] ? users[0] : [];
            const booking = Array.isArray(users) && users[1] ? users[1] : [];
            res.status(200).json({users:user,bookings:booking})
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    getTurf:async(req:Request,res:Response)=>{ 
        try {
            const turfs = await getTurfs(AdminRepositoryImpl)
            console.log(turfs);
            const turf = Array.isArray(turfs) && turfs[0] ? turfs[0] : [];
            const report = Array.isArray(turfs) && turfs[1] ? turfs[1] : [];
            const booking = Array.isArray(turfs) && turfs[2] ? turfs[2] : [];
            res.status(200).json({turfs:turf,reports:report,bookings:booking})
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    getBookings:async(req:Request,res:Response)=>{ 
        try {
            const bookings = await getBookings(AdminRepositoryImpl)
            res.status(200).json({bookings})
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    blockUser:async(req:Request,res:Response)=>{ 
        try {
            const {id,block}=req.body
            console.log(req.body)
            const users=await blockUser(AdminRepositoryImpl,id,Boolean(parseInt(block)))
            res.status(200).json(users)
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    blockTurf:async(req:Request,res:Response)=>{ 
        try {
            const {id,block}=req.body
            console.log(req.body)
            const turfs=await blockTurf(AdminRepositoryImpl,id,Boolean(parseInt(block)))
            res.status(200).json(turfs)
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    } ,
    getReviews:async(req:Request,res:Response)=>{ 
        try {
            const reviews=await getReviews(AdminRepositoryImpl)
            res.status(200).json(reviews)
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    },
    deleteReview:async(req:Request,res:Response)=>{ 
        try {
            const {id}=req.params
            await deleteReview(AdminRepositoryImpl,id)
            res.status(200).json({message:"review deleted successfully"})
        } catch (error:any) {
            res.status(400).json({message:error.message})
        }
    }
}
