"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { RichTextInput } from "@/components/inventory/RichTextInput";
import { ImageUploadInput } from "@/components/inventory/ImageUploadInput";
import { LoadingSpinner } from "@/components/inventory/LoadingSpinner";
import { useInventorySession } from "@/components/inventory/useInventorySession";

const createDetail = () => ({ key: "", valueHtml: "" });
const createSize = () => ({ size: "", quantity: 0, priceDelta: 0 });
const createVariant = () => ({
  color: "",
  images: [] as string[],
  sizes: [createSize()],
});

const TAGS = ["New Arrival", "Best Seller"];

export default function AddInventoryProductPage() {
  const { loading, authenticated } = useInventorySession();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    productCode: "",
    collection: "",
    collectionSlug: "",
    style: "",
    styleSlug: "",
    tags: [] as string[],
    purchasePrice: "",
    basePrice: "",
    details: [createDetail()],
    variants: [createVariant()],
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdSkus, setCreatedSkus] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProduct, setSavedProduct] = useState<any | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
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
    if (form.title) {
      const slug = form.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setForm((prev) => ({ ...prev, slug }));
    }
  }, [form.title]);

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [collectionsResponse, stylesResponse] = await Promise.all([
          fetch("/api/inventory/collections", { cache: "no-store" }),
          fetch("/api/inventory/styles", { cache: "no-store" }),
        ]);

        if (collectionsResponse.ok) {
          const data = await collectionsResponse.json();
          setCollections(data.collections || []);
        }

        if (stylesResponse.ok) {
          const data = await stylesResponse.json();
          setStyles(data.styles || []);
        }
      } catch (err) {
        setError("Unable to load collections or styles.");
      } finally {
        setLoadingOptions(false);
      }
    };

    if (authenticated) {
      loadOptions();
    }
  }, [authenticated]);

  const totalVariants = useMemo(() => {
    let count = 0;
    form.variants.forEach((variant) => {
      count += variant.sizes.length;
    });
    return count;
  }, [form.variants]);

  const updateDetail = (
    index: number,
    patch: Partial<ReturnType<typeof createDetail>>,
  ) => {
    setForm((prev) => {
      const details = [...prev.details];
      details[index] = { ...details[index], ...patch };
      return { ...prev, details };
    });
  };

  const updateVariant = (
    index: number,
    patch: Partial<ReturnType<typeof createVariant>>,
  ) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], ...patch };
      return { ...prev, variants };
    });
  };

  const updateSize = (
    variantIndex: number,
    sizeIndex: number,
    patch: Partial<ReturnType<typeof createSize>>,
  ) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      const sizes = [...variants[variantIndex].sizes];
      sizes[sizeIndex] = { ...sizes[sizeIndex], ...patch };
      variants[variantIndex] = { ...variants[variantIndex], sizes };
      return { ...prev, variants };
    });
  };

  const updateImage = (
    variantIndex: number,
    imageIndex: number,
    value: string,
  ) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      const images = [...variants[variantIndex].images];
      images[imageIndex] = value;
      variants[variantIndex] = { ...variants[variantIndex], images };
      return { ...prev, variants };
    });
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      const images = variants[variantIndex].images.filter(
        (_, i) => i !== imageIndex,
      );
      variants[variantIndex] = { ...variants[variantIndex], images };
      return { ...prev, variants };
    });
  };

  const removeSize = (variantIndex: number, sizeIndex: number) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      const sizes = variants[variantIndex].sizes.filter(
        (_, i) => i !== sizeIndex,
      );
      variants[variantIndex] = { ...variants[variantIndex], sizes };
      return { ...prev, variants };
    });
  };

  const removeVariant = (variantIndex: number) => {
    setForm((prev) => {
      const variants = prev.variants.filter((_, i) => i !== variantIndex);
      return { ...prev, variants };
    });
  };

  const removeDetail = (detailIndex: number) => {
    setForm((prev) => {
      const details = prev.details.filter((_, i) => i !== detailIndex);
      return { ...prev, details };
    });
  };

  // Get styles for the selected collection
  const getAvailableStyles = () => {
    if (!form.collection) {
      return styles;
    }

    const selectedCollection = collections.find(
      (coll) => coll.name === form.collection,
    );

    if (!selectedCollection || !Array.isArray(selectedCollection.styles)) {
      return styles;
    }

    return styles.filter((style) =>
      selectedCollection.styles.includes(style.name),
    );
  };

  const validateForm = () => {
    const errors: {
      basicInfo?: string;
      prices?: string;
      details?: string;
      variants?: { [key: number]: string };
    } = {};

    // Required fields validation
    if (!form.title.trim()) {
      errors.basicInfo = "Title is required.";
    } else if (!form.collection) {
      errors.basicInfo = "Collection is required.";
    } else if (!form.style) {
      errors.basicInfo = "Style is required.";
    }

    // Price validations
    const purchasePrice = Number(form.purchasePrice || 0);
    const basePrice = Number(form.basePrice || 0);

    if (!form.purchasePrice || purchasePrice < 0) {
      errors.prices = "Purchase price is required and cannot be negative.";
    } else if (!form.basePrice || basePrice <= 0) {
      errors.prices = "Base price is required and must be greater than zero.";
    } else if (basePrice < purchasePrice) {
      errors.prices = "Base price should be greater than or equal to purchase price.";
    }

    // Variant validations
    if (form.variants.length === 0) {
      errors.variants = { 0: "At least one variant is required." };
    } else {
      const variantErrors: { [key: number]: string } = {};

      for (let i = 0; i < form.variants.length; i++) {
        const variant = form.variants[i];

        if (!variant.color.trim()) {
          variantErrors[i] = "Color is required.";
          continue;
        }

        if (variant.sizes.length === 0) {
          variantErrors[i] = "At least one size is required.";
          continue;
        }

        for (let j = 0; j < variant.sizes.length; j++) {
          const size = variant.sizes[j];

          if (!size.size.trim()) {
            variantErrors[i] = `Size ${j + 1}: Size name is required.`;
            break;
          }

          if (Number(size.quantity) < 0) {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setError(null);
    setValidationErrors({});
    setCreatedSkus([]);
    setSavedProduct(null);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    const { collectionSlug, styleSlug, ...formWithoutSlugs } = form;
    const payload = {
      ...formWithoutSlugs,
      collection: form.collection,
      collectionSlug: form.collectionSlug,
      style: form.style,
      styleSlug: form.styleSlug,
      purchasePrice: Number(form.purchasePrice || 0),
      basePrice: Number(form.basePrice || 0),
      variants: form.variants.map((variant) => ({
        color: variant.color,
        images: variant.images
          .map((url) => ({ url: url.trim(), alt: `${variant.color} image` }))
          .filter((img) => img.url),
        sizes: variant.sizes.map((size) => ({
          ...size,
          quantity: Number(size.quantity || 0),
          priceDelta: Number(size.priceDelta || 0),
        })),
      })),
    };

    const response = await fetch("/api/inventory/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      handleError(data?.message || "Unable to save product.");
      setIsSaving(false);
      return;
    }

    const data = await response.json();
    const skus: string[] = [];
    data.product?.variants?.forEach((variant: any) => {
      variant.sizes?.forEach((size: any) => {
        if (size.sku) skus.push(size.sku);
      });
    });
    setCreatedSkus(skus);
    setSavedProduct(data.product);
    handleSuccess("Product Created Successfully");
    setIsSaving(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authenticated) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Sign in to add products.</p>
        <Link
          href="/inventory"
          className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-8">
      <div className="w-full max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Add Product</h1>
            <p className="text-sm text-slate-500">
              Create a new product with variants, images, and rich details.
            </p>
          </div>
          <Link
            href="/inventory"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to Home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Basic Info</h2>
            {validationErrors.basicInfo && (
              <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {validationErrors.basicInfo}
              </div>
            )}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                    validationErrors.basicInfo && !form.title.trim()
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Slug
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.slug}
                  readOnly
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  Short Description
                </label>
                <textarea
                  className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.shortDescription}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      shortDescription: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Product Code
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.productCode}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      productCode: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium  text-slate-600">
                  Tags
                </label>
                <div className="mt-1 flex flex-wrap py-2 gap-2">
                  {TAGS.map((tag) => (
                    <label key={tag} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.tags.includes(tag)}
                        onChange={(event) => {
                          setForm((prev) => ({
                            ...prev,
                            tags: event.target.checked
                              ? [...prev.tags, tag]
                              : prev.tags.filter((t) => t !== tag),
                          }));
                        }}
                        className="rounded border-slate-200"
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Collection <span className="text-red-600">*</span>
                </label>
                <select
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                    validationErrors.basicInfo && !form.collection
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                  value={form.collection}
                  onChange={(event) => {
                    const selectedCollection = collections.find(
                      (c) => c.name === event.target.value
                    );
                    setForm((prev) => ({
                      ...prev,
                      collection: event.target.value,
                      collectionSlug: selectedCollection?.slug || "",
                    }));
                  }}
                  disabled={loadingOptions}
                >
                  <option value="">Select a collection</option>
                  {collections.map((collection) => (
                    <option key={collection._id} value={collection.name}>
                      {collection.name}
                    </option>
                  ))}
                </select>
                {collections.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">
                    No collections yet. Add one from{" "}
                    <Link
                      href="/inventory/collections"
                      className="text-blue-600"
                    >
                      Collections
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Style <span className="text-red-600">*</span>
                </label>
                <select
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                    validationErrors.basicInfo && !form.style
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                  value={form.style}
                  onChange={(event) => {
                    const selectedStyle = getAvailableStyles().find(
                      (s) => s.name === event.target.value
                    );
                    setForm((prev) => ({
                      ...prev,
                      style: event.target.value,
                      styleSlug: selectedStyle?.slug || "",
                    }));
                  }}
                  disabled={!form.collection || loadingOptions}
                >
                  <option value="">
                    {form.collection
                      ? "Select a style"
                      : "Select a collection first"}
                  </option>
                  {getAvailableStyles().map((style) => (
                    <option key={style._id} value={style.name}>
                      {style.name}
                    </option>
                  ))}
                </select>
                {form.collection && getAvailableStyles().length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">
                    No styles in this collection. Add styles from{" "}
                    <Link href="/inventory/styles" className="text-blue-600">
                      Styles
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Purchase Price <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                    validationErrors.prices
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                  value={form.purchasePrice}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      purchasePrice: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Selling Base Price <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                    validationErrors.prices
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-blue-500'
                  }`}
                  value={form.basePrice}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      basePrice: event.target.value,
                    }))
                  }
                />
              </div>
            </div>            {validationErrors.prices && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {validationErrors.prices}
              </div>
            )}          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Detailed Description
              </h2>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    details: [...prev.details, createDetail()],
                  }))
                }
              >
                Add Detail Row
              </button>
            </div>
            {validationErrors.details && (
              <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {validationErrors.details}
              </div>
            )}
            <div className="mt-4 space-y-4">
              {form.details.map((detail, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Detail name (e.g., Fabric, Care, Fit)"
                    value={detail.key}
                    onChange={(event) =>
                      updateDetail(index, { key: event.target.value })
                    }
                    required
                  />
                  <div className="md:col-span-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <RichTextInput
                          value={detail.valueHtml}
                          onChange={(value) =>
                            updateDetail(index, { valueHtml: value })
                          }
                        />
                      </div>
                      {form.details.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeDetail(index)}
                          className="h-fit rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Variants
                </h2>
                <p className="text-xs text-slate-500">
                  {totalVariants} SKU entries will be generated.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    variants: [...prev.variants, createVariant()],
                  }))
                }
              >
                Add Color Variant
              </button>
            </div>

            <div className="mt-4 space-y-6">
              {form.variants.map((variant, variantIndex) => (
                <div
                  key={variantIndex}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  {validationErrors.variants?.[variantIndex] && (
                    <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      {validationErrors.variants[variantIndex]}
                    </div>
                  )}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-600">
                          Color <span className="text-red-600">*</span>
                        </label>
                        <input
                          className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                            validationErrors.variants?.[variantIndex]
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-slate-200 focus:ring-blue-500'
                          }`}
                          placeholder="Color (e.g. Black)"
                          value={variant.color}
                          onChange={(event) =>
                            updateVariant(variantIndex, {
                              color: event.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                        onClick={() =>
                          updateVariant(variantIndex, {
                            images: [...variant.images, ""],
                          })
                        }
                      >
                        Add Image
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                        onClick={() =>
                          updateVariant(variantIndex, {
                            sizes: [...variant.sizes, createSize()],
                          })
                        }
                      >
                        Add Size
                      </button>
                      {form.variants.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeVariant(variantIndex)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                        >
                          Remove Color
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-slate-500">
                      Images
                    </p>
                    <div className="space-y-2">
                      {variant.images.map((image, imageIndex) => (
                        <div key={imageIndex} className="flex gap-2">
                          <div className="flex-1">
                            <ImageUploadInput
                              value={image}
                              onUpload={(url) =>
                                updateImage(variantIndex, imageIndex, url)
                              }
                            />
                          </div>
                          {variant.images.length > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                removeImage(variantIndex, imageIndex)
                              }
                              className="h-fit rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-slate-500">
                      Sizes
                    </p>
                    <div className="grid gap-2 md:grid-cols-4">
                      {variant.sizes.map((size, sizeIndex) => (
                        <div
                          key={sizeIndex}
                          className="rounded-lg border border-slate-100 p-3"
                        >
                          <label className="block text-xs font-semibold text-slate-600">
                            Size <span className="text-red-600">*</span>
                          </label>
                          <input
                            className={`mt-1 w-full rounded-md border px-2 py-1 text-xs ${
                              validationErrors.variants?.[variantIndex]
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-slate-200 focus:ring-blue-500'
                            }`}
                            placeholder="XS, S, M, L, XL"
                            value={size.size}
                            onChange={(event) =>
                              updateSize(variantIndex, sizeIndex, {
                                size: event.target.value,
                              })
                            }
                          />
                          <label className="mt-2 block text-xs font-semibold text-slate-600">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
                            placeholder="0"
                            value={size.quantity}
                            onChange={(event) =>
                              updateSize(variantIndex, sizeIndex, {
                                quantity: Number(event.target.value),
                              })
                            }
                          />
                          <label className="mt-2 block text-xs font-semibold text-slate-600">
                            Price Adjustment
                          </label>
                          <input
                            type="number"
                            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
                            placeholder="0"
                            value={size.priceDelta}
                            onChange={(event) =>
                              updateSize(variantIndex, sizeIndex, {
                                priceDelta: Number(event.target.value),
                              })
                            }
                          />
                          {variant.sizes.length > 1 ? (
                            <button
                              type="button"
                              onClick={() =>
                                removeSize(variantIndex, sizeIndex)
                              }
                              className="mt-2 w-full rounded-md border border-red-200 bg-red-50 px-1 py-1 text-xs font-semibold text-red-600"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {status ? (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {status}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {createdSkus.length ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Generated SKUs</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {createdSkus.map((sku) => (
                  <span key={sku} className="rounded-full bg-white px-3 py-1">
                    {sku}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {savedProduct ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-emerald-800">
                    Product Created Successfully
                  </p>
                  <p className="text-xs text-emerald-600">
                    {savedProduct.title}
                  </p>
                </div>
                <Link
                  href={`/inventory/products/${savedProduct._id}`}
                  className="rounded-lg border border-emerald-300 bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  {createdSkus[0] ? `View (${createdSkus[0]})` : "View Product"}
                </Link>
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving Product..." : "Save Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
