import rateLimit from "express-rate-limit";
export const creationLimit = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 min
	max: 10, // Limit each IP
	message:
		'Too request from this IP, please try again after 2 minutes',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
export const verificationLimit = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 min
	max: 10, // Limit each IP
	message:
		'Too request from this IP, please try again after 2 minutes',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
