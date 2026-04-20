"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { Package } from "lucide-react";

export default function UserOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user) return;
      try {
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        data.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserOrders();
  }, [user]);

  if (loading) return <div className="text-center py-20">Loading orders...</div>;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
            <div className="mt-6">
              <Link href="/products" className="text-teal-600 hover:text-teal-500 font-medium">
                Start shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 w-full">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date placed</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {order.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total amount</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        ${Number(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {order.id}
                      </p>
                    </div>
                    <div className="flex justify-end items-center">
                      <Link href={`/profile/orders/${order.id}`} className="w-full sm:w-auto flex items-center justify-center bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                      ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : ''}
                      ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                      ${order.status === 'RETURN_REQUESTED' ? 'bg-orange-100 text-orange-800' : ''}
                      ${order.status === 'RETURNED' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      Status: {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
