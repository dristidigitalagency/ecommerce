"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Package, ShoppingBag, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch products
        const productsSnap = await getDocs(collection(db, "products"));
        const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch orders
        const ordersSnap = await getDocs(collection(db, "orders"));
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        // Calculate stats
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const lowStockProducts = products.filter((p: any) => p.stock < 10).length;
        const pendingOrders = orders.filter((o: any) => o.status === "PENDING").length;
        const deliveredOrders = orders.filter((o: any) => o.status === "DELIVERED").length;

        // Get low stock items
        const lowStock = products
          .filter((p: any) => p.stock < 10)
          .sort((a: any, b: any) => a.stock - b.stock)
          .slice(0, 5);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          lowStockProducts: lowStockProducts,
          pendingOrders: pendingOrders,
          deliveredOrders: deliveredOrders,
        });
        setLowStockItems(lowStock);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-900 dark:text-white">Loading dashboard...</div>
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Products</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalProducts}</p>
            </div>
            <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-lg">
              <Package className="text-teal-600 dark:text-teal-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <ShoppingBag className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending Orders</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.pendingOrders}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Orders Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Delivered:</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">{stats.deliveredOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pending:</span>
              <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{stats.pendingOrders}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <Link
                href="/admin/orders"
                className="text-teal-600 hover:text-teal-700 dark:hover:text-teal-400 font-medium text-sm"
              >
                View all orders →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Low Stock Items:</span>
              <span className={`text-lg font-semibold ${stats.lowStockProducts > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {stats.lowStockProducts}
              </span>
            </div>
            {stats.lowStockProducts > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <Link
                  href="/admin/products"
                  className="text-orange-600 hover:text-orange-700 dark:hover:text-orange-400 font-medium text-sm"
                >
                  Manage inventory →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Low Stock Alert
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-red-200 dark:border-red-900">
                  <th className="text-left py-2 px-3 text-red-900 dark:text-red-300 font-medium">Product</th>
                  <th className="text-left py-2 px-3 text-red-900 dark:text-red-300 font-medium">Current Stock</th>
                  <th className="text-left py-2 px-3 text-red-900 dark:text-red-300 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item: any) => (
                  <tr key={item.id} className="border-b border-red-200 dark:border-red-900">
                    <td className="py-2 px-3 text-gray-900 dark:text-gray-300">{item.name}</td>
                    <td className="py-2 px-3">
                      <span className="bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-300 px-2 py-1 rounded text-xs font-semibold">
                        {item.stock} in stock
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        href={`/admin/products/${item.id}`}
                        className="text-teal-600 hover:text-teal-700 dark:hover:text-teal-400 font-medium text-xs"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
