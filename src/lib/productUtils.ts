/**
 * Product utility functions for inventory management
 */

export interface ProductStyle {
  style: string;
  styleSlug: string;
}

export interface ProductCollection {
  collection: string;
  collectionSlug: string;
}

/**
 * Ensures a product has valid style and collection information
 */
export function validateProductCategoryInfo(product: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!product.collection || !product.collection.trim()) {
    errors.push("Product must have a collection name");
  }

  if (!product.collectionSlug || !product.collectionSlug.trim()) {
    errors.push("Product must have a collection slug");
  }

  if (!product.style || !product.style.trim()) {
    errors.push("Product must have a style");
  }

  if (!product.styleSlug || !product.styleSlug.trim()) {
    errors.push("Product must have a style slug");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets style and collection info from a product
 */
export function getProductCategoryInfo(
  product: any
): ProductStyle & ProductCollection {
  return {
    collection: product.collection || "Unknown Collection",
    collectionSlug: product.collectionSlug || "",
    style: product.style || "Unknown Style",
    styleSlug: product.styleSlug || "",
  };
}

/**
 * Filters products by collection
 */
export function filterProductsByCollection(
  products: any[],
  collectionSlug: string
) {
  return products.filter(
    (product) => product.collectionSlug === collectionSlug
  );
}

/**
 * Filters products by style
 */
export function filterProductsByStyle(products: any[], styleSlug: string) {
  return products.filter((product) => product.styleSlug === styleSlug);
}

/**
 * Filters products by both collection and style
 */
export function filterProductsByCollectionAndStyle(
  products: any[],
  collectionSlug: string,
  styleSlug: string
) {
  return products.filter(
    (product) =>
      product.collectionSlug === collectionSlug && product.styleSlug === styleSlug
  );
}
