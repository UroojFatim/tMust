import mongoose, { Schema } from "mongoose";

const CollectionSchema = new Schema(
  {
    name: { type: String },
    slug: { type: String, index: true },
    description: { type: String },
    shortDescription: { type: String },
  },
  {
    collection: "inventory_collections",
    timestamps: false,
    strict: false,
  }
);

const Collection =
  (mongoose.models.Collection as mongoose.Model<any>) ||
  mongoose.model("Collection", CollectionSchema);

export default Collection;
