"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { COLORS, SIZES, PRODUCT_CATEGORIES } from "@/lib/data/constants";
import Image from "next/image";
import { getCloudFrontUrl } from "@/lib/utils";
import { Plus, X, Upload, Star } from "lucide-react";

interface ProductFormProps {
  mode: "new" | "edit";
  productId?: string;
  initialData?: any;
}

async function uploadImageToS3(file: File): Promise<string> {
  const uploadResponse = await fetch("/admin/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });
  if (!uploadResponse.ok) throw new Error("Failed to get upload URL");
  const { uploadUrl, key } = await uploadResponse.json();
  const uploadResult = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadResult.ok) throw new Error("Failed to upload image");
  return key;
}

const inputCls =
  "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const router = useRouter();

  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Variant toggles
  const [hasColors, setHasColors] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);

  // Colors & Sizes
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [defaultColor, setDefaultColor] = useState<string>("");
  const [defaultSize, setDefaultSize] = useState<string>("");

  // Images: { [colorId | "default"]: File | null }
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({});
  // Existing image URLs from DB: { [colorId | "default"]: string (s3 key) }
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Stock: { [colorId | "default"]: string }
  const [stock, setStock] = useState<Record<string, string>>({});

  // UI
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Dynamic categories from Firestore
  const [firestoreCategories, setFirestoreCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const snap = await getDocs(collection(db, "products"));
        const cats = new Set<string>();
        snap.docs.forEach(d => { if (d.data().category) cats.add(d.data().category); });
        setFirestoreCategories(Array.from(cats));
      } catch {}
    }
    fetchCategories();
  }, []);

  // Load existing product data for edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price?.toString() || "");

      const cat = initialData.category || "";
      const staticIds = PRODUCT_CATEGORIES.map(c => c.id);
      if (cat && !staticIds.includes(cat)) {
        setIsCustomCategory(true);
        setCustomCategory(cat);
        setCategory("__custom__");
      } else {
        setCategory(cat);
      }

      const hc = initialData.hasColors ?? (initialData.colors?.length > 0);
      const hs = initialData.hasSizes ?? (initialData.sizes?.length > 0);
      setHasColors(hc);
      setHasSizes(hs);
      setSelectedColors(initialData.colors || []);
      setSelectedSizes(initialData.sizes || []);
      setDefaultColor(initialData.defaultColor || "");
      setDefaultSize(initialData.defaultSize || "");

      // images map (new format) or legacy single imageUrl
      if (initialData.images && typeof initialData.images === "object") {
        setImageUrls(initialData.images);
      } else if (initialData.imageUrl) {
        setImageUrls({ default: initialData.imageUrl });
      }

      // stock map (new format) or legacy single number
      if (initialData.stock && typeof initialData.stock === "object") {
        const s: Record<string, string> = {};
        Object.entries(initialData.stock).forEach(([k, v]) => { s[k] = String(v); });
        setStock(s);
      } else if (initialData.stock !== undefined) {
        setStock({ default: String(initialData.stock) });
      }

      setLoading(false);
    } else if (mode === "new") {
      setLoading(false);
    }
  }, [mode, initialData]);

  // Ensure stock/image keys are consistent when colors change
  useEffect(() => {
    if (!hasColors) return;
    setStock(prev => {
      const next: Record<string, string> = {};
      selectedColors.forEach(c => { next[c] = prev[c] ?? ""; });
      return next;
    });
    setImageUrls(prev => {
      const next: Record<string, string> = {};
      selectedColors.forEach(c => { next[c] = prev[c] ?? ""; });
      return next;
    });
    setImageFiles(prev => {
      const next: Record<string, File | null> = {};
      selectedColors.forEach(c => { next[c] = prev[c] ?? null; });
      return next;
    });
  }, [selectedColors, hasColors]);

  const toggleColor = (colorId: string) => {
    setSelectedColors(prev =>
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    );
  };

  const toggleSize = (sizeId: string) => {
    setSelectedSizes(prev =>
      prev.includes(sizeId) ? prev.filter(s => s !== sizeId) : [...prev, sizeId]
    );
  };

  const finalCategory = isCustomCategory ? customCategory : category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Upload images
      const newImageUrls: Record<string, string> = { ...imageUrls };
      const keys = hasColors ? selectedColors : ["default"];
      for (const key of keys) {
        const file = imageFiles[key];
        if (file) {
          newImageUrls[key] = await uploadImageToS3(file);
        }
      }

      // Build stock map
      const stockMap: Record<string, number> = {};
      if (hasColors) {
        selectedColors.forEach(c => {
          stockMap[c] = parseInt(stock[c] || "0", 10);
        });
      } else {
        stockMap["default"] = parseInt(stock["default"] || "0", 10);
      }

      const data: any = {
        name,
        description,
        price: parseFloat(price),
        category: finalCategory,
        hasColors,
        hasSizes,
        colors: hasColors ? selectedColors : [],
        sizes: hasSizes ? selectedSizes : [],
        defaultColor: hasColors ? defaultColor : "",
        defaultSize: hasSizes ? defaultSize : "",
        images: newImageUrls,
        // Keep legacy imageUrl for backward compat (use default or first color)
        imageUrl: newImageUrls["default"] || newImageUrls[selectedColors[0]] || "",
        stock: stockMap,
        updatedAt: new Date(),
      };

      if (mode === "new") {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "products"), data);
      } else {
        await updateDoc(doc(db, "products", productId!), data);
      }

      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-900 dark:text-white p-8">Loading product...</div>;

  const allCategoryOptions = [
    ...PRODUCT_CATEGORIES.filter(c => c.id !== "all"),
    ...firestoreCategories
      .filter(fc => !PRODUCT_CATEGORIES.find(pc => pc.id === fc))
      .map(fc => ({ id: fc, name: fc })),
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {mode === "new" ? "Add New Product" : "Edit Product"}
      </h1>

      {error && <p className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Product Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Price (Rs.)</label>
            <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className={labelCls}>Category</label>
          <select
            value={isCustomCategory ? "__custom__" : category}
            onChange={e => {
              if (e.target.value === "__custom__") {
                setIsCustomCategory(true);
                setCategory("__custom__");
              } else {
                setIsCustomCategory(false);
                setCategory(e.target.value);
              }
            }}
            className={inputCls}
          >
            <option value="">— Select category —</option>
            {allCategoryOptions.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="__custom__">+ Add custom category</option>
          </select>
          {isCustomCategory && (
            <input
              type="text"
              placeholder="Enter custom category name"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              className={`${inputCls} mt-2`}
              required
            />
          )}
        </div>

        {/* Variant Toggles */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasColors}
              onChange={e => {
                setHasColors(e.target.checked);
                if (!e.target.checked) {
                  setSelectedColors([]);
                  setDefaultColor("");
                }
              }}
              className="w-5 h-5 text-teal-600 rounded"
            />
            <span className="font-medium text-gray-900 dark:text-white">Has Color Variants</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSizes}
              onChange={e => {
                setHasSizes(e.target.checked);
                if (!e.target.checked) {
                  setSelectedSizes([]);
                  setDefaultSize("");
                }
              }}
              className="w-5 h-5 text-teal-600 rounded"
            />
            <span className="font-medium text-gray-900 dark:text-white">Has Size Variants</span>
          </label>
        </div>

        {/* No colors/no sizes: single image + single stock */}
        {!hasColors && (
          <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white">Product Image & Stock</h3>
            <div>
              <label className={labelCls}>Image</label>
              {imageUrls["default"] && (
                <div className="mb-2 relative w-24 h-24 rounded overflow-hidden">
                  <Image src={getCloudFrontUrl(imageUrls["default"])} alt="product" fill className="object-cover" />
                </div>
              )}
              <input
                type="file" accept="image/*"
                onChange={e => setImageFiles(prev => ({ ...prev, default: e.target.files?.[0] ?? null }))}
                className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>
            <div>
              <label className={labelCls}>Stock Quantity</label>
              <input
                type="number" min="0"
                value={stock["default"] ?? ""}
                onChange={e => setStock(prev => ({ ...prev, default: e.target.value }))}
                className={inputCls}
                required
              />
            </div>
          </div>
        )}

        {/* Colors Section */}
        {hasColors && (
          <div className="space-y-4">
            <div>
              <label className={`${labelCls} mb-3 block`}>Select Available Colors</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color.id} type="button"
                    onClick={() => toggleColor(color.id)}
                    title={color.name}
                    className={`w-10 h-10 rounded-lg border-2 transition-all relative ${
                      selectedColors.includes(color.id)
                        ? "border-gray-900 dark:border-white ring-2 ring-teal-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {defaultColor === color.id && (
                      <Star className="absolute inset-0 m-auto w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedColors.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ⭐ Click "Set Default" to mark the default color. Upload an image and enter stock for each color.
                </p>
                {selectedColors.map(colorId => {
                  const colorDef = COLORS.find(c => c.id === colorId);
                  return (
                    <div key={colorId} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: colorDef?.hex }}
                          />
                          <span className="font-semibold text-gray-900 dark:text-white capitalize">{colorDef?.name || colorId}</span>
                          {defaultColor === colorId && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Default</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDefaultColor(defaultColor === colorId ? "" : colorId)}
                          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                            defaultColor === colorId
                              ? "bg-yellow-400 border-yellow-500 text-yellow-900"
                              : "border-gray-300 text-gray-600 dark:text-gray-400 hover:border-yellow-400 hover:text-yellow-600"
                          }`}
                        >
                          {defaultColor === colorId ? "★ Default" : "Set Default"}
                        </button>
                      </div>

                      {/* Image for this color */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Image</label>
                        {imageUrls[colorId] && !imageFiles[colorId] && (
                          <div className="mb-1 relative w-20 h-20 rounded overflow-hidden">
                            <Image src={getCloudFrontUrl(imageUrls[colorId])} alt={colorId} fill className="object-cover" />
                          </div>
                        )}
                        {imageFiles[colorId] && (
                          <div className="mb-1 text-xs text-teal-600 flex items-center gap-1">
                            <Upload size={12} /> {imageFiles[colorId]?.name}
                          </div>
                        )}
                        <input
                          type="file" accept="image/*"
                          onChange={e => setImageFiles(prev => ({ ...prev, [colorId]: e.target.files?.[0] ?? null }))}
                          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                        />
                      </div>

                      {/* Stock for this color */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Stock Quantity</label>
                        <input
                          type="number" min="0"
                          value={stock[colorId] ?? ""}
                          onChange={e => setStock(prev => ({ ...prev, [colorId]: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm px-3 py-1.5 border text-gray-900 dark:text-white"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sizes Section */}
        {hasSizes && (
          <div>
            <label className={`${labelCls} mb-3 block`}>Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => (
                <div key={size.id} className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleSize(size.id)}
                    className={`px-4 py-2 rounded border-2 font-semibold transition-all ${
                      selectedSizes.includes(size.id)
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {size.label}
                  </button>
                  {selectedSizes.includes(size.id) && (
                    <button
                      type="button"
                      onClick={() => setDefaultSize(defaultSize === size.id ? "" : size.id)}
                      className={`text-xs px-1 rounded transition-colors ${
                        defaultSize === size.id ? "text-yellow-600 font-bold" : "text-gray-400 hover:text-yellow-500"
                      }`}
                    >
                      {defaultSize === size.id ? "★ default" : "set default"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {defaultSize && (
              <p className="text-xs text-gray-500 mt-2">Default size: <strong>{SIZES.find(s => s.id === defaultSize)?.label}</strong></p>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit" disabled={saving}
            className="flex-1 flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-400 transition-colors"
          >
            {saving ? "Saving..." : mode === "new" ? "Create Product" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
