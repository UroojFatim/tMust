import mongoose, { Schema } from "mongoose";

const ImageSchema = new Schema(
  {
    url: { type: String },
    alt: { type: String },
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    color: { type: String },
    images: [ImageSchema],
    sizes: [
      new Schema(
        {
          size: { type: String },
          quantity: { type: Number },
          priceDelta: { type: Number },
          sku: { type: String },
          barcode: { type: String },
          label: { type: String },
        },
        { _id: false }
      ),
    ],
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    title: { type: String },
    slug: { type: String, index: true },
    shortDescription: { type: String },
    description: { type: String },
    basePrice: { type: Number },
    productCode: { type: String },
    collection: { type: String },
    collectionSlug: { type: String },
    images: [ImageSchema],
    variants: [VariantSchema],
  },
  {
    collection: "inventory_products",
    timestamps: false,
    strict: false,
  }
);

const Product =
  (mongoose.models.Product as mongoose.Model<any>) ||
  mongoose.model("Product", ProductSchema);

export default Product;
