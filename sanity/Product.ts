import { defineField, defineType } from "sanity";

export const Product = defineType({
  name: "product",
  type: "document",
  title: "Product",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Product Title",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title", maxLength: 50 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "description",
      type: "text",
      title: "Product Description",
      validation: (Rule) => Rule.required().min(10),
    }),

    defineField({
      name: "price",
      title: "Product Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image" }],
      options: { layout: "grid" },
      validation: (Rule) => Rule.min(1),
    }),

    defineField({
      name: "category",
      title: "Product Category",
      type: "string",
      options: {
        list: [
          { title: "New Arrivals", value: "new_arrivals" },
          { title: "Best Sellers", value: "best_sellers" },
          { title: "Casual Wears", value: "casual_wears" },
          { title: "Formal Wears", value: "formal_wears" },
          { title: "Fancy/Party Wear", value: "fancy_party_wear" },
          { title: "Traditional Wear", value: "traditional_wear" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "style",
      title: "Style",
      type: "string",
      options: {
        list: [
          { title: "Fancy", value: "fancy" },
          { title: "Casual", value: "casual" },
          { title: "Formal", value: "formal" },
          { title: "Traditional", value: "traditional" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // ✅ MULTI-SELECT SIZES
    defineField({
      name: "sizes",
      title: "Available Sizes",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "XS", value: "xs" },
          { title: "S", value: "s" },
          { title: "M", value: "m" },
          { title: "L", value: "l" },
          { title: "XL", value: "xl" },
          { title: "24", value: "24" },
          { title: "26", value: "26" },
          { title: "28", value: "28" },
          { title: "30", value: "30" },
          { title: "32", value: "32" },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),

    // ✅ MULTI-SELECT COLORS
    defineField({
      name: "colors",
      title: "Available Colors",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Black", value: "black" },
          { title: "White", value: "white" },
          { title: "Navy", value: "navy" },
          { title: "Gray", value: "gray" },
          { title: "Pink", value: "pink" },
          { title: "Red", value: "red" },
          { title: "Blue", value: "blue" },
          { title: "Beige", value: "beige" },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
});