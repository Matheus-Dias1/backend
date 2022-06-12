import mongoose, { Schema, Document } from "mongoose";
import { AccessibleRecordModel, accessibleRecordsPlugin } from "@casl/mongoose";

const userSchema = new Schema({
  username: { type: String, unique: true },
  name: String,
  password: String,
  admin: { type: Boolean, default: false },
});

export interface UserT extends Document {
  description: "User";
  username: string;
  name: string;
  password: string;
  admin: boolean;
}

userSchema.plugin(accessibleRecordsPlugin);

export const User = mongoose.model<UserT, AccessibleRecordModel<UserT>>(
  "User",
  userSchema
);
