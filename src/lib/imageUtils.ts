/**
 * Image URL utility for handling both MongoDB images and external URLs
 */

/**
 * Normalizes an image URL to ensure it can be displayed correctly
 * @param url - The image URL (can be /api/inventory/images/{id} or external URL)
 * @returns Normalized URL that can be used in img/Image tags
 */
export function normalizeImageUrl(url: string | undefined): string {
  if (!url) return "";

  // If it's already a relative URL to our API, return as-is
  if (url.startsWith("/api/inventory/images/")) {
    return url;
  }

  // If it's already an absolute URL, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If it's a relative path (e.g., /inventory-uploads/), make sure it's absolute
  if (url.startsWith("/")) {
    return url;
  }

  // Default return
  return url;
}

/**
 * Gets the image dimensions for Next/Image component
 * @param url - The image URL
 * @returns Object with width and height properties
 */
export function getImageDimensions(
  url: string
): { width: number; height: number } {
  // For API images, use standard dimensions
  if (url.startsWith("/api/inventory/images/")) {
    return { width: 500, height: 500 };
  }

  // For external images, use standard dimensions
  return { width: 500, height: 500 };
}

/**
 * Checks if an image URL is from the inventory API
 */
export function isInventoryImage(url: string): boolean {
  return url.startsWith("/api/inventory/images/");
}
