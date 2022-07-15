import mongoose, { Schema, Document } from "mongoose";
import { AccessibleRecordModel, accessibleRecordsPlugin } from "@casl/mongoose";

export const orderSchema = new Schema({
  client: String,
  batch: Schema.Types.ObjectId,
  createdAt: Date,
  deliverAt: Date,
  items: [
    new Schema(
      {
        item: { type: Schema.Types.ObjectId, ref: "Product" },
        amount: Number,
        measurementUnit: String,
      },
      { id: false }
    ),
  ],
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
