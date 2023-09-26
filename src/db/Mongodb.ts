import { connect } from "mongoose";
//connect to mongo db
const connectDB = (url: string) => {
  return connect(url)
};

export default connectDB;