import mongoose, { Schema, Document } from "mongoose";
import { AccessibleRecordModel, accessibleRecordsPlugin } from "@casl/mongoose";

const productSchema = new Schema({
  description: String,
  defaultMeasurementUnit: String,
  conversions: [
    {
      measurementUnit: String,
      oneDefaultEquals: Number,
    },
  ],
});

export interface ProductT extends Document {
  description: "Product";
  name: string;
  defaultMeasurementUnit: string;
  conversions: {
    measurementUnit: string;
    oneDefaultEquals: number;
  }[];
}

productSchema.plugin(accessibleRecordsPlugin);

export const Product = mongoose.model<
  ProductT,
  AccessibleRecordModel<ProductT>
>("Product", productSchema);
