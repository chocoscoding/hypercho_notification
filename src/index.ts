import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRouter from "./Routes/authRouter";
import cors from 'cors';
import { corsOptions } from "./Middleware/Cors";
import connectDB from "./db/Mongodb";

dotenv.config();

const PORT: number | string = process.env.PORT || 9987;
const app: Express = express();


app.use(cors(corsOptions()))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Welcome to the notification service</h1>");
});

const start = async () => {
  const MONGO_URI: any = process.env.MONGO_URI;
  try {
    await connectDB(MONGO_URI);
    app.listen(PORT, () =>
      console.log(`Running on http://localhost:${PORT} ⚡`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
