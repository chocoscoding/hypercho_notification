import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongoose";
import User from "../models/Users";

//extend the request
export interface CustomRequest extends Request {
  UsersFirstname?: string;
  UsersId?: string;
}

interface UserData {
  _id: ObjectId;
  email: string;
  Firstname: string;
  Lastname: string;
  Country: string;
  channel: boolean;
  Age: number;
  Verified: boolean;
  Password: string;
  Reg_date: Date;
}

//function to check if users email is in the database
const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { email }: { email: string } = req.body;
  //check if email isn't valid
  if (!email) {
    return res.status(404).send({ error: "Kindly provide a valid email address" });
  }
  //else
  try {
    const UserData: null | UserData = await User.findOne({ email });
    //check if userData is true
    if (UserData) {
      //move to the next function

      req.UsersFirstname = UserData.Firstname;
      req.UsersId = UserData._id.toString();
      return next();
    }
    return res.status(401).send({ error: "User does not exist" });
  } catch (e) {
    //log errors to the console
    console.log(e);
  }
};

export default auth;
