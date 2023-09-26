import { Response } from "express";
import { CustomRequest } from "../Middleware/Authenticated";
import { AddPassLink, sendResetpasswordMail, verifyPassLink } from "../services/Linkcontrol";
import { AddOtp, sendVerificationMail, verifyOtp } from "../services/Otpcontrol";
const PORT = 3000;

export const sendVerifyMail = async (req: CustomRequest, res: Response) => {
  const { email }: { email: string | undefined } = req.body;
  if (!email) return res.status(404).send("Provide an email!");
  try {
    const { status, otp } = await AddOtp(req.UsersId!);
    if (status === 200) {
      const { status, message } = await sendVerificationMail(email, req.UsersFirstname!, otp!);

      return res.status(status).json({ status, message });
    }

    return res.status(404).json({ status: 404, message: "Something went wrong try again" });
  } catch (error) {
    return res.status(404).json({ status: 404, message: "Something went wrong try again" });
  }
};

//function to verify reset email
export const verifyVerifyMail = async (req: CustomRequest, res: Response) => {
  const { otp }: { otp: number | undefined } = req.body;
  if (!otp) return res.status(404).send("Provide an otp!");

  try {
    const { status, message } = await verifyOtp(req.UsersId!, otp);
    return res.status(status).json({ status, message });
  } catch (error) {
    return res.status(404).json({ status: 404, message: "Something went wrong try again" });
  }
};

//function to send password reset link
export const sendResetMail = async (req: CustomRequest, res: Response) => {
  //check if we are still in local host, if so... use localhost with the link, else... use the domain;
  const url = process.env.MAILTO; 

  const { email }: { email: string | undefined } = req.body;
  if (!email) return res.status(404).send("Provide an email!");
  try {
    const { status, linkstring } = await AddPassLink(req.UsersId!);
    if (status === 200) {
      //add the additional part to make it a full url
      const finalLink = `${url}/auth/Resetpassword/${linkstring!}`;
      const { status, message } = await sendResetpasswordMail(email, req.UsersFirstname!, finalLink);

      return res.status(status).json({ status, message });
    }

    return res.status(404).json({ status: 404, message: "Something went wrong try again" });
  } catch (error) {
    return res.status(404).json({ status: 404, message: "Something went wrong try again" });
  }
};

export const verifyResetMail = async (req: CustomRequest, res: Response) => {
  //verify the pass link with and return the userid
  const { string }: { string: string | undefined } = req.body;
  if (!string) return res.status(404).send("Provide the string!");

  try {
    //call the veifying function
    const responseData: { status: number; message: string; userID?: string } = await verifyPassLink(string);
    return res.status(responseData.status).json(responseData);
  } catch (error) {
    console.log(error);

    return res.status(404).json({ status: 404, message: "Something went wrong try again" });
  }
};
