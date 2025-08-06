import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  progress: { type: Object, default: {} },
  currentCourse: { type: String, default: "" },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
