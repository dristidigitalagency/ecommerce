"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { COLORS, SIZES, PRODUCT_CATEGORIES } from "@/lib/data/constants";
import Image from "next/image";
import { getCloudFrontUrl } from "@/lib/utils";
import { Upload, Star } from "lucide-react";

interface ProductFormProps { mode: "new" | "edit"; productId?: string; initialData?: any; }

async function uploadImageToS3(file: File): Promise<string> {
  const r = await fetch("/admin/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, fileType: file.type }) });
  if (!r.ok) throw new Error("Failed to get upload URL");
  const { uploadUrl, key } = await r.json();
  const u = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!u.ok) throw new Error("Failed to upload image");
  return key;
}

function variantKey(hasColors: boolean, hasSizes: boolean, c: string, s: string) {
  if (hasColors && hasSizes) return `${c}|${s}`;
  if (hasColors) return c;
  if (hasSizes) return s;
  return "default";
}

const inp = "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white";
const lbl = "block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [hasColors, setHasColors] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [defaultColor, setDefaultColor] = useState("");
  const [defaultSize, setDefaultSize] = useState("");
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [stock, setStock] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [firestoreCats, setFirestoreCats] = useState<string[]>([]);

  useEffect(() => {
    getDocs(collection(db, "products")).then(snap => {
      const cats = new Set<string>();
      snap.docs.forEach(d => { if (d.data().category) cats.add(d.data().category); });
      setFirestoreCats(Array.from(cats));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price?.toString() || "");
      const cat = initialData.category || "";
      const staticIds = PRODUCT_CATEGORIES.map(c => c.id);
      if (cat && !staticIds.includes(cat)) { setIsCustomCategory(true); setCustomCategory(cat); setCategory("__custom__"); }
      else setCategory(cat);
      const hc = initialData.hasColors ?? (initialData.colors?.length > 0);
      const hs = initialData.hasSizes ?? (initialData.sizes?.length > 0);
      setHasColors(hc); setHasSizes(hs);
      setSelectedColors(initialData.colors || []);
      setSelectedSizes(initialData.sizes || []);
      setDefaultColor(initialData.defaultColor || "");
      setDefaultSize(initialData.defaultSize || "");
      if (initialData.images && typeof initialData.images === "object") setImageUrls(initialData.images);
      else if (initialData.imageUrl) setImageUrls({ default: initialData.imageUrl });
      if (initialData.stock && typeof initialData.stock === "object") {
        const s: Record<string, string> = {};
        Object.entries(initialData.stock).forEach(([k, v]) => { s[k] = String(v); });
        setStock(s);
      } else if (initialData.stock !== undefined) setStock({ default: String(initialData.stock) });
      setLoading(false);
    } else if (mode === "new") setLoading(false);
  }, [mode, initialData]);

  // Sync stock keys when colors/sizes change
  useEffect(() => {
    setStock(prev => {
      const next: Record<string, string> = {};
      if (hasColors && hasSizes) {
        selectedColors.forEach(c => selectedSizes.forEach(s => { const k = `${c}|${s}`; next[k] = prev[k] ?? ""; }));
      } else if (hasColors) {
        selectedColors.forEach(c => { next[c] = prev[c] ?? ""; });
      } else if (hasSizes) {
        selectedSizes.forEach(s => { next[s] = prev[s] ?? ""; });
      }
      return next;
    });
  }, [selectedColors, selectedSizes, hasColors, hasSizes]);

  // Sync image keys when colors change
  useEffect(() => {
    if (!hasColors) return;
    setImageUrls(prev => { const n: Record<string, string> = {}; selectedColors.forEach(c => { n[c] = prev[c] ?? ""; }); return n; });
    setImageFiles(prev => { const n: Record<string, File | null> = {}; selectedColors.forEach(c => { n[c] = prev[c] ?? null; }); return n; });
  }, [selectedColors, hasColors]);

  const finalCategory = isCustomCategory ? customCategory : category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const newImageUrls: Record<string, string> = { ...imageUrls };
      const imgKeys = hasColors ? selectedColors : ["default"];
      for (const k of imgKeys) { const f = imageFiles[k]; if (f) newImageUrls[k] = await uploadImageToS3(f); }
      const stockMap: Record<string, number> = {};
      if (hasColors && hasSizes) selectedColors.forEach(c => selectedSizes.forEach(s => { stockMap[`${c}|${s}`] = parseInt(stock[`${c}|${s}`] || "0", 10); }));
      else if (hasColors) selectedColors.forEach(c => { stockMap[c] = parseInt(stock[c] || "0", 10); });
      else if (hasSizes) selectedSizes.forEach(s => { stockMap[s] = parseInt(stock[s] || "0", 10); });
      else stockMap["default"] = parseInt(stock["default"] || "0", 10);
      const data: any = {
        name, description, price: parseFloat(price), category: finalCategory,
        hasColors, hasSizes,
        colors: hasColors ? selectedColors : [],
        sizes: hasSizes ? selectedSizes : [],
        defaultColor: hasColors ? defaultColor : "",
        defaultSize: hasSizes ? defaultSize : "",
        images: newImageUrls,
        imageUrl: newImageUrls["default"] || newImageUrls[selectedColors[0]] || "",
        stock: stockMap,
        updatedAt: new Date(),
      };
      if (mode === "new") { data.createdAt = serverTimestamp(); await addDoc(collection(db, "products"), data); }
      else await updateDoc(doc(db, "products", productId!), data);
      router.push("/admin/products");
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-gray-900 dark:text-white p-8">Loading...</div>;

  const allCats = [
    ...PRODUCT_CATEGORIES.filter(c => c.id !== "all"),
    ...firestoreCats.filter(fc => !PRODUCT_CATEGORIES.find(pc => pc.id === fc)).map(fc => ({ id: fc, name: fc })),
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{mode === "new" ? "Add New Product" : "Edit Product"}</h1>
      {error && <p className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic */}
        <div className="space-y-4">
          <div><label className={lbl}>Product Name</label><input required type="text" value={name} onChange={e => setName(e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Description</label><textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Price (Rs.)</label><input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className={inp} /></div>
        </div>
        {/* Category */}
        <div>
          <label className={lbl}>Category</label>
          <select value={isCustomCategory ? "__custom__" : category} onChange={e => { if (e.target.value === "__custom__") { setIsCustomCategory(true); setCategory("__custom__"); } else { setIsCustomCategory(false); setCategory(e.target.value); } }} className={inp}>
            <option value="">— Select category —</option>
            {allCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__custom__">+ Add custom category</option>
          </select>
          {isCustomCategory && <input type="text" placeholder="Enter custom category" value={customCategory} onChange={e => setCustomCategory(e.target.value)} className={`${inp} mt-2`} required />}
        </div>
        {/* Toggles */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={hasColors} onChange={e => { setHasColors(e.target.checked); if (!e.target.checked) { setSelectedColors([]); setDefaultColor(""); } }} className="w-5 h-5 text-teal-600 rounded" />
            <span className="font-medium text-gray-900 dark:text-white">Has Color Variants</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={hasSizes} onChange={e => { setHasSizes(e.target.checked); if (!e.target.checked) { setSelectedSizes([]); setDefaultSize(""); } }} className="w-5 h-5 text-teal-600 rounded" />
            <span className="font-medium text-gray-900 dark:text-white">Has Size Variants</span>
          </label>
        </div>
        {/* Single image + stock when no colors */}
        {!hasColors && (
          <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white">Default Image</h3>
            {imageUrls["default"] && <div className="relative w-24 h-24 rounded overflow-hidden"><Image src={getCloudFrontUrl(imageUrls["default"])} alt="product" fill className="object-cover" /></div>}
            <input type="file" accept="image/*" onChange={e => setImageFiles(prev => ({ ...prev, default: e.target.files?.[0] ?? null }))} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
          </div>
        )}
        {/* Colors: picker + per-color image */}
        {hasColors && (
          <div className="space-y-4">
            <div>
              <label className={`${lbl} mb-3 block`}>Select Colors</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button key={color.id} type="button" onClick={() => setSelectedColors(prev => prev.includes(color.id) ? prev.filter(c => c !== color.id) : [...prev, color.id])} title={color.name}
                    className={`w-10 h-10 rounded-lg border-2 transition-all relative ${selectedColors.includes(color.id) ? "border-gray-900 dark:border-white ring-2 ring-teal-600" : "border-gray-300 dark:border-gray-600"}`}
                    style={{ backgroundColor: color.hex }}>
                    {defaultColor === color.id && <Star className="absolute inset-0 m-auto w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
            {selectedColors.map(colorId => {
              const colorDef = COLORS.find(c => c.id === colorId);
              return (
                <div key={colorId} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: colorDef?.hex }} />
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">{colorDef?.name || colorId}</span>
                      {defaultColor === colorId && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Default</span>}
                    </div>
                    <button type="button" onClick={() => setDefaultColor(defaultColor === colorId ? "" : colorId)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${defaultColor === colorId ? "bg-yellow-400 border-yellow-500 text-yellow-900" : "border-gray-300 text-gray-600 dark:text-gray-400 hover:border-yellow-400"}`}>
                      {defaultColor === colorId ? "★ Default" : "Set Default"}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Image for this color</label>
                    {imageUrls[colorId] && !imageFiles[colorId] && <div className="mb-1 relative w-20 h-20 rounded overflow-hidden"><Image src={getCloudFrontUrl(imageUrls[colorId])} alt={colorId} fill className="object-cover" /></div>}
                    {imageFiles[colorId] && <div className="mb-1 text-xs text-teal-600 flex items-center gap-1"><Upload size={12} />{imageFiles[colorId]?.name}</div>}
                    <input type="file" accept="image/*" onChange={e => setImageFiles(prev => ({ ...prev, [colorId]: e.target.files?.[0] ?? null }))} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Sizes */}
        {hasSizes && (
          <div>
            <label className={`${lbl} mb-3 block`}>Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => (
                <div key={size.id} className="flex flex-col items-center gap-1">
                  <button type="button" onClick={() => setSelectedSizes(prev => prev.includes(size.id) ? prev.filter(s => s !== size.id) : [...prev, size.id])}
                    className={`px-4 py-2 rounded border-2 font-semibold transition-all ${selectedSizes.includes(size.id) ? "bg-teal-600 text-white border-teal-600" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"}`}>
                    {size.label}
                  </button>
                  {selectedSizes.includes(size.id) && (
                    <button type="button" onClick={() => setDefaultSize(defaultSize === size.id ? "" : size.id)}
                      className={`text-xs px-1 rounded ${defaultSize === size.id ? "text-yellow-600 font-bold" : "text-gray-400 hover:text-yellow-500"}`}>
                      {defaultSize === size.id ? "★ default" : "set default"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Stock Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Stock {hasColors && hasSizes ? "(per Color × Size)" : hasColors ? "(per Color)" : hasSizes ? "(per Size)" : ""}
          </h3>
          {/* Neither */}
          {!hasColors && !hasSizes && (
            <div>
              <label className={lbl}>Stock Quantity</label>
              <input type="number" min="0" value={stock["default"] ?? ""} onChange={e => setStock(prev => ({ ...prev, default: e.target.value }))} className={inp} required />
            </div>
          )}
          {/* Sizes only */}
          {!hasColors && hasSizes && selectedSizes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedSizes.map(sizeId => {
                const sizeDef = SIZES.find(s => s.id === sizeId);
                return (
                  <div key={sizeId}>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{sizeDef?.label}</label>
                    <input type="number" min="0" value={stock[sizeId] ?? ""} onChange={e => setStock(prev => ({ ...prev, [sizeId]: e.target.value }))} className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm px-3 py-1.5 border text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500" placeholder="0" required />
                  </div>
                );
              })}
            </div>
          )}
          {/* Colors only */}
          {hasColors && !hasSizes && selectedColors.length > 0 && (
            <div className="space-y-2">
              {selectedColors.map(colorId => {
                const colorDef = COLORS.find(c => c.id === colorId);
                return (
                  <div key={colorId} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: colorDef?.hex }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300 w-24 capitalize">{colorDef?.name || colorId}</span>
                    <input type="number" min="0" value={stock[colorId] ?? ""} onChange={e => setStock(prev => ({ ...prev, [colorId]: e.target.value }))} className="flex-1 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm px-3 py-1.5 border text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500" placeholder="0" required />
                  </div>
                );
              })}
            </div>
          )}
          {/* Matrix: Colors × Sizes */}
          {hasColors && hasSizes && selectedColors.length > 0 && selectedSizes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Color / Size</th>
                    {selectedSizes.map(sizeId => {
                      const s = SIZES.find(sz => sz.id === sizeId);
                      return <th key={sizeId} className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{s?.label || sizeId}</th>;
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {selectedColors.map(colorId => {
                    const colorDef = COLORS.find(c => c.id === colorId);
                    return (
                      <tr key={colorId} className="bg-white dark:bg-gray-800">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: colorDef?.hex }} />
                            <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">{colorDef?.name || colorId}</span>
                          </div>
                        </td>
                        {selectedSizes.map(sizeId => {
                          const k = `${colorId}|${sizeId}`;
                          return (
                            <td key={sizeId} className="px-2 py-2 text-center">
                              <input type="number" min="0" value={stock[k] ?? ""} onChange={e => setStock(prev => ({ ...prev, [k]: e.target.value }))}
                                className="w-16 text-center rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm px-2 py-1 border text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500" placeholder="0" required />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Enter 0 for unavailable combinations.</p>
            </div>
          )}
          {((hasColors && selectedColors.length === 0) || (hasSizes && selectedSizes.length === 0)) && (
            <p className="text-sm text-gray-400 italic">Select {hasColors && selectedColors.length === 0 ? "colors" : "sizes"} above to enter stock.</p>
          )}
        </div>
        {/* Submit */}
        <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="submit" disabled={saving} className="flex-1 flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-400 transition-colors">
            {saving ? "Saving..." : mode === "new" ? "Create Product" : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
