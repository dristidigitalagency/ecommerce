"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export default function NewProduct() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl = "";

      if (image) {
        // Get presigned URL from API
        const uploadResponse = await fetch("/admin/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: image.name,
            fileType: image.type,
          }),
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to get upload URL");
        }

        const { uploadUrl, key } = await uploadResponse.json();

        // Upload file to S3
        const uploadResult = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!uploadResult.ok) {
          throw new Error("Failed to upload image to S3");
        }

        // Store only the S3 key, not the full URL
        imageUrl = key;
      }

      await addDoc(collection(db, "products"), {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock, 10),
        imageUrl,
        createdAt: serverTimestamp(),
      });

      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Product</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (Rs.)</label>
            <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
            <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Image</label>
          <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) setImage(e.target.files[0]) }} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
        </div>

        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400">
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
