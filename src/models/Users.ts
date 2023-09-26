import { model, Schema } from "mongoose";

interface IUser {
  Firstname: string;
  email: string;
  Verified: boolean;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  Firstname: { type: String, required: true },
  email: { type: String, required: true },
  Verified: { type: Boolean },
});

// 3. Create a Model.
const User = model<IUser>("User", userSchema);

export default User;
