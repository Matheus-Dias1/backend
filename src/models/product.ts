import mongoose, { Schema, Document } from "mongoose";
import { AccessibleRecordModel, accessibleRecordsPlugin } from "@casl/mongoose";

export const productSchema = new Schema({
  description: String,
  defaultMeasurementUnit: String,
  conversions: [mongoose.Schema.Types.Mixed],
  archived: Boolean,
});

export interface ProductT extends Document {
  description: "Product";
  archived: boolean;
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
