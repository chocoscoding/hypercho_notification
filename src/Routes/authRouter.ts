import { Router } from "express";
import { sendResetMail, verifyResetMail, sendVerifyMail, verifyVerifyMail } from "../controllers/Auth";
import auth from "../Middleware/Authenticated";
import { creationLimit, verificationLimit } from "../Middleware/Limit";

const router = Router();


router.post("/Send_verify", creationLimit, auth, sendVerifyMail);
router.post("/Verify_verify", verificationLimit, auth, verifyVerifyMail);
router.post("/Send_reset", creationLimit, auth, sendResetMail);
router.post("/Verify_reset", verificationLimit, verifyResetMail);

export default router;
