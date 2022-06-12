import mongoose, { Schema, Document } from "mongoose";
import { AccessibleRecordModel, accessibleRecordsPlugin } from "@casl/mongoose";

const orderSchema = new Schema({
  client: String,
  batch: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  deliverAt: Date,
  items: [mongoose.Schema.Types.Mixed],
  archived: Boolean,
});

export interface OrderT extends Document {
  description: "Order";
  client: string;
  batch: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  deliverAt: Date;
  items: {
    item: mongoose.Schema.Types.ObjectId;
    amount: number;
    measurementUnit: string;
  }[];
  archived: boolean;
}

orderSchema.plugin(accessibleRecordsPlugin);

export const Order = mongoose.model<OrderT, AccessibleRecordModel<OrderT>>(
  "Order",
  orderSchema
);
