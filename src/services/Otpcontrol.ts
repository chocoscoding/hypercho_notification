import { supabase } from "../db/Supabase";
import nodemailer from "nodemailer";
import mailAuditor from "./Mailauditor";
import { updateVerificationStatus } from "./Accountcontrol";
import { log } from "console";
import dotenv from "dotenv";
dotenv.config();

const OTP_DURATION = 60 * 1000;
const DB_NAME = "RegVer";
const verification_Subject = "Verify your Hypercho account";

const OTP_GEN = (): number => {
  return Math.floor(Math.random() * 90000) + 100000;
};

//Verify otp
export const verifyOtp = async (userID: string, OTP: number): Promise<{ status: number; message: string }> => {
  try {
    const { data, error } = await supabase.from(DB_NAME).select("created_at, otp").match({ userid: userID });
    console.log(error);
    console.log(data);
    if (error !== null) throw new Error(error);
    log(error);
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
          const changeProcess = await Promise.allSettled([deleteOTP(userID), updateVerificationStatus(userID)]);
          if (changeProcess[1].status === "rejected") {
            return { status: 404, message: "We are sorry! OTP matches but we couldn't update your info. Try again later" };
          }
          return { status: 200, message: "OTP matches" };
        }
        return { status: 401, message: "OTP does not match" };
      }
    } else {
      return { status: 404, message: `OTP doesn't exist` };
    }
  } catch (error: any) {
    log(error);
    return { status: 404, message: error.message };
  }
};

//create otp
export const AddOtp = async (userID: string): Promise<{ status: number; message: string; otp?: number }> => {
  const otp = OTP_GEN();
  try {
    const { data, error } = await supabase.from(DB_NAME).update({ otp, created_at: new Date().getTime() }).match({ userid: userID });
    //data returns null if there is no matching id
    if (!data) {
      const { error } = await supabase.from(DB_NAME).insert({
        userid: userID,
        otp,
        created_at: new Date().getTime(),
      });

      return { status: 200, message: `OTP generated`, otp };
    }
    await supabase
      .from(DB_NAME)
      .update({
        otp,
        created_at: new Date().getTime(),
      })
      .match({
        userid: userID,
      });
    return { status: 200, message: `OTP generated`, otp };
  } catch (error) {
    log(error);
    return { status: 404, message: `An error occurred while generating OTP` };
  }
};

//Delete otp
const deleteOTP = async (UserID: string): Promise<string> => {
  try {
    const { error } = await supabase.from(DB_NAME).delete().eq("userid", UserID);

    if (error === null) return "done";
    throw error;
  } catch (error) {
    log(error);
    return `userID doesn't exist`;
  }
};

//send mail
export const sendVerificationMail = async (email: string, firstName: string, otp: number): Promise<{ status: number; message: string }> => {
  const SMTP_HOST: any = process.env.SMTP_HOST;
  const SMTP_USERNAME: any = process.env.SMTP_USERNAME;
  const SMTP_PASSWORD: any = process.env.SMTP_PASSWORD;
  const transporter = nodemailer.createTransport({
    port: 587,
    host: SMTP_HOST,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD,
    },
    secure: false,
    // tls: { rejectUnauthorized: true }
  });
  try {
    await transporter.sendMail({
      from: '"HYPERCHO" <contact@hypercho.com>',
      to: email, // receiver
      subject: verification_Subject, // Subject line
      html: await mailAuditor("verify.html", { firstName, otp }), // html body
    });
    log("Mail sent successfully");
    return { status: 200, message: "Mail sent successfully" };
  } catch (error: any) {
    log(error);
    return { status: 404, message: error.message };
  }
};
