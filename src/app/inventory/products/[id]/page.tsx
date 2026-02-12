"use client";

import Link from "next/link";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { LoadingSpinner } from "@/components/inventory/LoadingSpinner";
import { useInventorySession } from "@/components/inventory/useInventorySession";
import { ImageUploadInput } from "@/components/inventory/ImageUploadInput";
import { QRCodeCanvas } from "qrcode.react";

export default function InventoryProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { loading, authenticated } = useInventorySession();
  const [product, setProduct] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    basicInfo?: string;
    prices?: string;
    details?: string;
    variants?: { [key: number]: string };
  }>({});

  const handleSuccess = (message: string) => {
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: message,
      confirmButtonColor: "#10b981",
    });
  };

  const handleError = (message: string) => {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: message,
      confirmButtonColor: "#ef4444",
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [productResponse, collectionsResponse, stylesResponse] = await Promise.all([
          fetch(`/api/inventory/products/${id}`, { cache: "no-store" }),
          fetch("/api/inventory/collections", { cache: "no-store" }),
          fetch("/api/inventory/styles", { cache: "no-store" }),
        ]);

        if (!productResponse.ok) {
          const data = await productResponse.json();
          setError(data?.message || "Unable to load product.");
          setFetching(false);
          return;
        }

        const productData = await productResponse.json();
        setProduct(productData.product);
        setEditData(productData.product);

        if (collectionsResponse.ok) {
          const collectionsData = await collectionsResponse.json();
          setCollections(collectionsData.collections || []);
        }

        if (stylesResponse.ok) {
          const stylesData = await stylesResponse.json();
          setStyles(stylesData.styles || []);
        }

        setFetching(false);
      } catch (err) {
        setError("Unable to load product.");
        setFetching(false);
      }
    };

    if (authenticated) {
      load();
    }
  }, [authenticated, id]);

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateEditData = () => {
    const errors: {
      basicInfo?: string;
      prices?: string;
      details?: string;
      variants?: { [key: number]: string };
    } = {};

    // Required fields
    if (!editData.title?.trim()) {
      errors.basicInfo = "Title is required.";
    } else if (!editData.slug?.trim()) {
      errors.basicInfo = "Slug is required.";
    } else if (!editData.collection) {
      errors.basicInfo = "Collection is required.";
    } else if (!Array.isArray(editData.style) || editData.style.length === 0) {
      errors.basicInfo = "At least one style is required.";
    }

    // Price validations
    const purchasePrice = Number(editData.purchasePrice || 0);
    const basePrice = Number(editData.basePrice || 0);

    if (purchasePrice < 0) {
      errors.prices = "Purchase price cannot be negative.";
    } else if (basePrice <= 0) {
      errors.prices = "Base price is required and must be greater than zero.";
    } else if (basePrice < purchasePrice) {
      errors.prices = "Base price should be greater than or equal to purchase price.";
    }

    // Variant validations
    if (!Array.isArray(editData.variants) || editData.variants.length === 0) {
      errors.variants = { 0: "At least one variant is required." };
    } else {
      const variantErrors: { [key: number]: string } = {};

      for (let i = 0; i < editData.variants.length; i++) {
        const variant = editData.variants[i];

        if (!variant.color?.trim()) {
          variantErrors[i] = "Color is required.";
          continue;
        }

        if (!Array.isArray(variant.sizes) || variant.sizes.length === 0) {
          variantErrors[i] = "At least one size is required.";
          continue;
        }

        for (let j = 0; j < variant.sizes.length; j++) {
          const size = variant.sizes[j];

          if (!size.size?.trim()) {
            variantErrors[i] = `Size ${j + 1}: Size name is required.`;
            break;
          }

          if (Number(size.quantity || 0) < 0) {
            variantErrors[i] = `Size ${size.size}: Quantity cannot be negative.`;
            break;
          }
        }
      }

      if (Object.keys(variantErrors).length > 0) {
        errors.variants = variantErrors;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setError(null);
    setValidationErrors({});

    if (!validateEditData()) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/inventory/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (!response.ok) {
        handleError(data?.message || "Failed to save product.");
        setIsSaving(false);
        return;
      }

      setProduct(data.product);
      setIsEditing(false);
      setError(null);
      handleSuccess("Product Updated Successfully");
    } catch (err) {
      handleError("Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/inventory/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        handleError(data?.message || "Failed to delete product.");
        setIsDeleting(false);
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Product Deleted Successfully",
        confirmButtonColor: "#10b981",
      });
      window.location.href = "/inventory/products";
    } catch (err) {
      handleError("Failed to delete product.");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditData(product);
    setIsEditing(false);
  };

  // Get styles for the selected collection
  const getAvailableStyles = () => {
    if (!editData?.collection) {
      return styles;
    }
    
    const selectedCollection = collections.find(
      (coll) => coll.name === editData.collection
    );
    
    if (!selectedCollection || !Array.isArray(selectedCollection.styles)) {
      return styles;
    }
    
    return styles.filter((style) =>
      selectedCollection.styles.includes(style.name)
    );
  };

  const handleVariantChange = (variantIndex: number, field: string, value: any) => {
    setEditData((prev: any) => {
      const updatedVariants = [...prev.variants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        [field]: value,
      };
      return { ...prev, variants: updatedVariants };
    });
  };

  const handleSizeChange = (variantIndex: number, sizeIndex: number, field: string, value: any) => {
    setEditData((prev: any) => {
      const updatedVariants = [...prev.variants];
      const updatedSizes = [...updatedVariants[variantIndex].sizes];
      updatedSizes[sizeIndex] = {
        ...updatedSizes[sizeIndex],
        [field]: value,
      };
      updatedVariants[variantIndex].sizes = updatedSizes;
      return { ...prev, variants: updatedVariants };
    });
  };

  const printBarcode = (size: any, product: any) => {
    // Get variant info to display color
    const variant = product.variants?.find((v: any) => 
      v.sizes?.some((s: any) => s.sku === size.sku)
    );
    const colorName = variant?.color || "N/A";
    
    // Calculate final price (basePrice + priceDelta)
    const basePrice = Number(product.basePrice || 0);
    const priceDelta = Number(size.priceDelta || 0);
    const finalPrice = (basePrice + priceDelta).toFixed(2);
    
    const printWindow = window.open("", "", "height=300,width=200");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Label - ${product.title}</title>
            <style>
              @page {
                size: 2in 3in;
                margin: 0;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body { 
                font-family: Arial, sans-serif; 
                width: 2in;
                height: 3in;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .label-container {
                width: 100%;
                height: 100%;
                border: 1px solid #000;
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                justify-content: center;
                align-items: center;
              }
              .qr-section {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 6px;
              }
              .info-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                width: 100%;
              }
              .product-name {
                font-size: 10px;
                font-weight: bold;
                line-height: 1.2;
                margin-bottom: 8px;
                word-wrap: break-word;
              }
              .product-details {
                font-size: 8px;
                line-height: 1.5;
                width: 100%;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
                padding: 2px 0;
              }
              .detail-label {
                font-weight: 600;
                color: #333;
              }
              .detail-value {
                color: #000;
                font-weight: 500;
              }
              .price {
                font-size: 14px;
                font-weight: bold;
                margin-top: 8px;
                color: #000;
                padding: 4px 8px;
                border-top: 1px solid #000;
              }
              canvas {
                display: block;
              }
              @media print { 
                body { 
                  margin: 0;
                  padding: 8px;
                }
              }
            </style>
          </head>
          <body>
            <div class="label-container">
              <div class="qr-section">
                <div id="barcode"></div>
              </div>
              <div class="info-section">
                <div>
                  <div class="product-name">${product.title}</div>
                  <div class="product-details">
                    <div class="detail-row">
                      <span class="detail-label">SKU:</span>
                      <span class="detail-value">${size.sku}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Color:</span>
                      <span class="detail-value">${colorName}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Size:</span>
                      <span class="detail-value">${size.size || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div class="price">$${finalPrice}</div>
              </div>
            </div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
            <script>
              new QRCode(document.getElementById('barcode'), {
                text: '${typeof window !== "undefined" ? window.location.origin : "https://tmustt.com"}/product/${product.slug}',
                width: 90,
                height: 90
              });
              setTimeout(() => window.print(), 500);
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading || fetching) {
    return <LoadingSpinner />;
  }

  if (!authenticated) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Sign in to view products.</p>
        <Link
          href="/inventory"
          className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{error || "Product not found."}</p>
        <Link
          href="/inventory/products"
          className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-8">
      <div className="w-full max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="text-sm text-slate-500">Product details</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/inventory/products"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to Products
          </Link>
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Basics</h2>
          {validationErrors.basicInfo && (
            <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {validationErrors.basicInfo}
            </div>
          )}
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Title: <span className="text-red-600">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData?.title || ""}
                  onChange={(e) => handleEditChange("title", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    validationErrors.basicInfo && !editData?.title?.trim()
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
              ) : (
                <span className="text-slate-900">{product.title}</span>
              )}
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Slug:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData?.slug || ""}
                  onChange={(e) => handleEditChange("slug", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="text-slate-900">{product.slug}</span>
              )}
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Collection: <span className="text-red-600">*</span>
              </label>
              {isEditing ? (
                <select
                  value={editData?.collection || ""}
                  onChange={(e) => handleEditChange("collection", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    validationErrors.basicInfo && !editData?.collection
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select a collection</option>
                  {collections.map((coll) => (
                    <option key={coll._id} value={coll.name}>
                      {coll.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-slate-900">{product.collection || "—"}</span>
              )}
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Styles: <span className="text-red-600">*</span>
              </label>
              {isEditing ? (
                <select
                  value={Array.isArray(editData?.style) && editData.style.length > 0 ? editData.style[0] : ""}
                  onChange={(e) => handleEditChange("style", e.target.value ? [e.target.value] : [])}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    validationErrors.basicInfo && (!Array.isArray(editData?.style) || editData.style.length === 0)
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                  disabled={!editData?.collection}
                >
                  <option value="">
                    {editData?.collection ? "Select a style" : "Please select a collection first"}
                  </option>
                  {getAvailableStyles().map((style) => (
                    <option key={style._id} value={style.name}>
                      {style.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-slate-900">
                  {Array.isArray(product.style) 
                    ? product.style.join(", ")
                    : product.style || "—"}
                </span>
              )}
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Tags:</label>
              {isEditing ? (
                <div className="flex flex-wrap gap-4 mt-2">
                  {["New Arrival", "Best Seller"].map((tag) => (
                    <label key={tag} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Array.isArray(editData?.tags) && editData.tags.includes(tag.toLowerCase())}
                        onChange={(e) => {
                          const currentTags = Array.isArray(editData?.tags) ? editData.tags : [];
                          if (e.target.checked) {
                            handleEditChange("tags", [...currentTags, tag.toLowerCase()]);
                          } else {
                            handleEditChange("tags", currentTags.filter((t: string) => t !== tag.toLowerCase()));
                          }
                        }}
                        className="rounded border-slate-200"
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <span className="text-slate-900">
                  {Array.isArray(product.tags) && product.tags.length
                    ? product.tags.join(", ")
                    : "—"}
                </span>
              )}
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Product Code:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData?.productCode || ""}
                  onChange={(e) => handleEditChange("productCode", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="text-slate-900">{product.productCode || "—"}</span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500">Pricing</h2>
          {validationErrors.prices && (
            <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {validationErrors.prices}
            </div>
          )}
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Purchase Price: <span className="text-red-600">*</span>
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editData?.purchasePrice || 0}
                  onChange={(e) => handleEditChange("purchasePrice", parseFloat(e.target.value))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    validationErrors.prices
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
              ) : (
                <span className="text-slate-900">${Number(product.purchasePrice || 0).toFixed(2)}</span>
              )}
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">
                Base Price: <span className="text-red-600">*</span>
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editData?.basePrice || 0}
                  onChange={(e) => handleEditChange("basePrice", parseFloat(e.target.value))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    validationErrors.prices
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
              ) : (
                <span className="text-slate-900">${Number(product.basePrice || 0).toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500">Short Description</h2>
        {isEditing ? (
          <textarea
            value={editData?.shortDescription || ""}
            onChange={(e) => handleEditChange("shortDescription", e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        ) : (
          <p className="mt-2 text-sm text-slate-700">
            {product.shortDescription || "—"}
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500">Detailed Description</h2>
        {validationErrors.details && (
          <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {validationErrors.details}
          </div>
        )}
        <div className="mt-3 space-y-3">
          {Array.isArray(product.details) && product.details.length ? (
            product.details.map((detail: any, index: number) => (
              <div key={index} className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs font-semibold text-slate-600">
                  {detail.key}
                </p>
                <div
                  className="prose prose-sm mt-2 max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: detail.valueHtml }}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No details added.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500">Variants</h2>
        <div className="mt-4 space-y-4">
          {Array.isArray(editData?.variants) && editData.variants.length ? (
            editData.variants.map((variant: any, variantIndex: number) => (
              <div key={variantIndex} className="rounded-xl border border-slate-100 p-4">
                {validationErrors.variants?.[variantIndex] && (
                  <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {validationErrors.variants[variantIndex]}
                  </div>
                )}
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Color: <span className="text-red-600">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={variant.color || ""}
                      onChange={(e) => handleVariantChange(variantIndex, "color", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                        validationErrors.variants?.[variantIndex]
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-200 focus:ring-blue-500'
                      }`}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{variant.color || "—"}</p>
                  )}
                </div>

                <div className="mb-4 pb-4 border-b border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Images:</label>
                  {isEditing ? (
                    <div className="space-y-3">
                      {Array.isArray(variant.images) && variant.images.map((img: any, imgIndex: number) => (
                        <div key={imgIndex} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-slate-500 font-medium">Image {imgIndex + 1}</label>
                            {Array.isArray(variant.images) && variant.images.length > 1 && (
                              <button
                                onClick={() => {
                                  const updatedImages = variant.images.filter((_: any, idx: number) => idx !== imgIndex);
                                  handleVariantChange(variantIndex, "images", updatedImages);
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-semibold"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <ImageUploadInput
                            value={img.url || ""}
                            onUpload={(url) => {
                              const updatedImages = [...variant.images];
                              updatedImages[imgIndex] = { url, alt: img.alt || "" };
                              handleVariantChange(variantIndex, "images", updatedImages);
                            }}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updatedImages = [...(variant.images || []), { url: "", alt: "" }];
                          handleVariantChange(variantIndex, "images", updatedImages);
                        }}
                        className="mt-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-100 transition"
                      >
                        + Add Image
                      </button>
                    </div>
                  ) : (
                    <>
                      {Array.isArray(variant.images) && variant.images.length ? (
                        <div className="flex flex-wrap gap-3">
                          {variant.images.map((img: any, imgIndex: number) => (
                            <div key={imgIndex} className="h-20 w-20 overflow-hidden rounded-lg border">
                              <Image
                                src={img.url}
                                alt={img.alt || "Product image"}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No images.</p>
                      )}
                    </>
                  )}
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-100">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-3 py-2">
                          Size <span className="text-red-600">*</span>
                        </th>
                        <th className="px-3 py-2">Quantity</th>
                        <th className="px-3 py-2">Price Delta</th>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">Barcode</th>
                        {!isEditing && <th className="px-3 py-2 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.isArray(variant.sizes) && variant.sizes.length ? (
                        variant.sizes.map((size: any, sizeIndex: number) => (
                          <tr key={sizeIndex} className={isEditing ? "bg-blue-50" : ""}>
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={size.size || ""}
                                  onChange={(e) => handleSizeChange(variantIndex, sizeIndex, "size", e.target.value)}
                                  className={`w-full rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1 ${
                                    validationErrors.variants?.[variantIndex]
                                      ? 'border-red-500 focus:ring-red-500'
                                      : 'border-slate-200 focus:ring-blue-500'
                                  }`}
                                />
                              ) : (
                                size.size || "—"
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={size.quantity ?? 0}
                                  onChange={(e) => handleSizeChange(variantIndex, sizeIndex, "quantity", parseInt(e.target.value))}
                                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              ) : (
                                size.quantity ?? 0
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={size.priceDelta ?? 0}
                                  onChange={(e) => handleSizeChange(variantIndex, sizeIndex, "priceDelta", parseFloat(e.target.value))}
                                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              ) : (
                                size.priceDelta ?? 0
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={size.sku || ""}
                                  onChange={(e) => handleSizeChange(variantIndex, sizeIndex, "sku", e.target.value)}
                                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              ) : (
                                size.sku || "—"
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={size.barcode || ""}
                                  onChange={(e) => handleSizeChange(variantIndex, sizeIndex, "barcode", e.target.value)}
                                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              ) : (
                                size.barcode ? (
                                  <div className="group relative cursor-pointer">
                                    <QRCodeCanvas
                                      value={`${typeof window !== "undefined" ? window.location.origin : "https://tmustt.com"}/product/${product.slug}`}
                                      size={64}
                                      bgColor="#ffffff"
                                      fgColor="#000000"
                                      level="M"
                                      includeMargin={false}
                                    />
                                    <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block z-10">
                                      SKU: {size.sku}
                                    </div>
                                  </div>
                                ) : (
                                  "—"
                                )
                              )}
                            </td>
                            {!isEditing && (
                              <td className="px-3 py-2 text-right">
                                {size.sku && size.barcode && product.slug && (
                                  <button
                                    onClick={() => printBarcode(size, product)}
                                    className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition"
                                  >
                                    Print
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-slate-400" colSpan={!isEditing ? 6 : 5}>
                            No sizes.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No variants added.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
