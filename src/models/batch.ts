import mongoose, { Schema, Document } from "mongoose";
import { AccessibleRecordModel, accessibleRecordsPlugin } from "@casl/mongoose";

const batchSchema = new Schema({
  number: Number,
  startDate: Date,
  endDate: Date,
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
});

export interface BatchT extends Document {
  description: "Batch";
  number: number;
  startDate: Date;
  endDate: Date;
  orders: mongoose.Types.ObjectId[];
}

batchSchema.plugin(accessibleRecordsPlugin);

export const Batch = mongoose.model<BatchT, AccessibleRecordModel<BatchT>>(
  "Batch",
  batchSchema
);
