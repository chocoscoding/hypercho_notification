import { Response } from "express";
import { CustomRequest } from "../Middleware/Authenticated";
import User from "../models/Users";

export const updateVerificationStatus = async (id:string) => {
    const filter = { _id: id };
const update = { Verified: true };
    try {
        await User.findOneAndUpdate(filter, update);
        return 'done';
    } catch (error:any) {
        console.log(error);
        throw new Error(error.message)
    }
}