"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const docSnap = await getDoc(doc(db, "products", productId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setDescription(data.description || "");
          setPrice(data.price?.toString() || "");
          setCategory(data.category || "");
          setStock(data.stock?.toString() || "");
          setImageUrl(data.imageUrl || "");
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let newImageUrl = imageUrl;

      if (image) {
        const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, image);
        newImageUrl = await getDownloadURL(uploadTask.ref);
      }

      await updateDoc(doc(db, "products", productId), {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock, 10),
        imageUrl: newImageUrl,
        updatedAt: new Date(),
      });

      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-900 dark:text-white">Loading product...</div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/products" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
        <ArrowLeft size={20} />
        Back to Products
      </Link>

      <div className="max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Product</h1>

        {error && <p className="text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
              <input
                required
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
              <input
                required
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <input
              required
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Image</label>
            {imageUrl && (
              <div className="mb-4 relative w-32 h-32">
                <Image src={imageUrl} alt="Current product image" fill className="rounded-md object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) setImage(e.target.files[0]);
              }}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            <p className="text-xs text-gray-500 mt-2">Leave empty to keep current image</p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
