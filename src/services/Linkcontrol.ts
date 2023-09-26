import { supabase } from "../db/Supabase";
import nodemailer from "nodemailer";
import mailAuditor from "./Mailauditor";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { log } from "console";
dotenv.config();
const OTP_DURATION = 60 * 1000;
const DB_NAME = "SignupVer";
const verification_Subject = "Reset your Hypercho Password";

const PASS_OTP_GEN = (): number => {
  return Math.floor(Math.random() * 90000000) + 100000000;
};

const convertNumAndIdToLongString = (num: number, id: string): string => {
  const saltEnd: any = process.env.SALT_TOKEN_END,
    saltStart: any = process.env.SALT_TOKEN_START,
    jwtToken: any = process.env.JWT_TOKEN;
  //convert num to string
  //salt it and sign it with jwt
  const numAndStr: string = `${id}/${num.toString()}`;
  const salted: string = saltStart + numAndStr + saltEnd;
  const signedData: string = jwt.sign(salted, jwtToken);
  return signedData;
};

const convertLongStringtoNumandId = (string: string): string[] => {
  const saltEnd: any = process.env.SALT_TOKEN_END,
    saltStart: any = process.env.SALT_TOKEN_START,
    jwtToken: any = process.env.JWT_TOKEN;
  //convert to normal string with jwt
  const signedData: any = jwt.verify(string, jwtToken);

  //remove salt from token 1 and 2
  const removedSalt1 = signedData.replace(saltEnd, "");
  const removedSalt2: string = removedSalt1.replace(saltStart, "");

  //split the data to id and num
  const data: string[] = removedSalt2.split("/");
  return data;
};

//Verify otp
export const verifyPassLink = async (link: string): Promise<{ status: number; message: string; userID?: string }> => {
  //convert link to otp code
  try {
    const generatedStr: string[] = convertLongStringtoNumandId(link);
    //get the user id
    const userID: string = generatedStr[0];
    //get the otp and turn it to a number
    const OTP: number = ~~generatedStr[1];
    const { data, error } = await supabase.from(DB_NAME).select("created_at, otp").match({ userid: userID });
    if (error !== null) throw new Error(error);
    if (data.length > 0) {
      //check for the time and if it hasn't expired
      const { created_at, otp }: { created_at: number; otp: number } = data[0];
      const time_difference: number = new Date().getTime() - created_at;
      const TIME_IN_MIN: number = time_difference / OTP_DURATION;
      //if 15min has elapsed
      if (TIME_IN_MIN > 15) {
        return { status: 410, message: `OTP Expired` };
      }
      //if it hasn't check if OTP matches
      else {
        const match = OTP === otp;
        if (match) {
          await deletePasswordOTP(userID);
          return { status: 200, message: "OTP matches", userID };
        }
        return { status: 409, message: "OTP does not match" };
      }
    } else {
      return { status: 200, message: `OTP doesn't exist` };
    }
  } catch (error: any) {
    log(error.message);
    if (error.message === "invalid signature") {
      return { status: 409, message: "OTP does not match" };
    }
    return { status: 404, message: error.message };
  }
};

//create otp
export const AddPassLink = async (userID: string): Promise<{ status: number; message: string; linkstring?: string }> => {
  const otp: number = PASS_OTP_GEN();
  const linkstring: string = convertNumAndIdToLongString(otp, userID);

  try {
    const { data, error } = await supabase.from(DB_NAME).update({ otp, created_at: new Date().getTime() }).match({ userid: userID });
    //data returns null if there is no matching id
    if (!data) {
      const { error } = await supabase.from(DB_NAME).insert({
        userid: userID,
        otp,
        created_at: new Date().getTime(),
      });
      return { status: 200, message: `OTP generated`, linkstring };
    }
    return { status: 200, message: `OTP generated`, linkstring };
  } catch (error) {
    log(error);
    return { status: 404, message: `An error occurred while generating OTP` };
  }
};

//Delete otp
const deletePasswordOTP = async (UserID: string): Promise<string> => {
  try {
    const { error } = await supabase.from(DB_NAME).delete().eq("userid", UserID);

    if (error === null) return "done";
    throw error;
  } catch (error) {
    log(error);
    return `userID doesn't exist`;
  }
};

//change password

//send mail
export const sendResetpasswordMail = async (
  email: string,
  firstName: string,
  linkstring: string
): Promise<{ status: number; message: string }> => {
  const SMTP_HOST: any = process.env.SMTP_HOST;
  const SMTP_USERNAME: any = process.env.SMTP_USERNAME;
  const SMTP_PASSWORD: any = process.env.SMTP_PASSWORD;
  const transporter = nodemailer.createTransport({
    port: 587,
    name: SMTP_HOST,
    host: SMTP_HOST,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD,
    },
    secure: false,
    // tls: { rejectUnauthorized: true },
  });
  try {
    transporter.sendMail({
      from: '"HYPERCHO" <contact@hypercho.com>',
      to: email, // receiver
      subject: verification_Subject, // Subject line
      html: await mailAuditor("reset.html", { firstName, linkstring }), // html body
    });
    return { status: 200, message: "Mail sent successfully" };
  } catch (error: any) {
    log(error);
    return { status: 404, message: error.message };
  }
};
