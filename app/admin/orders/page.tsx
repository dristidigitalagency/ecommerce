"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { Eye } from "lucide-react";

export const DELIVERY_STATUSES = [
  { value: "PENDING",            label: "Pending",           color: "text-yellow-800 bg-yellow-100" },
  { value: "PROCESSING",         label: "Processing",        color: "text-orange-800 bg-orange-100" },
  { value: "PACKED",             label: "Packed",            color: "text-blue-800 bg-blue-100" },
  { value: "DISPATCHED",         label: "Dispatched",        color: "text-indigo-800 bg-indigo-100" },
  { value: "IN_TRANSIT",         label: "In Transit",        color: "text-purple-800 bg-purple-100" },
  { value: "OUT_FOR_DELIVERY",   label: "Out for Delivery",  color: "text-cyan-800 bg-cyan-100" },
  { value: "DELIVERED",          label: "Delivered",         color: "text-green-800 bg-green-100" },
  { value: "RETURN_REQUESTED",   label: "Return Requested",  color: "text-red-800 bg-red-100" },
  { value: "RETURNED",           label: "Returned",          color: "text-gray-800 bg-gray-100" },
];

export function getStatusColor(status: string) {
  return DELIVERY_STATUSES.find(s => s.value === status)?.color ?? "text-gray-800 bg-gray-100";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      data.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId);
      const now = new Date();
      const order = orders.find(o => o.id === orderId);
      const history = order?.statusHistory || [];
      await updateDoc(doc(db, "orders", orderId), {
        status,
        statusHistory: [...history, { status, timestamp: now, note: "" }],
        updatedAt: now,
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateTrackingNumber = async (orderId: string, trackingNumber: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { trackingNumber });
      setOrders(orders.map(o => o.id === orderId ? { ...o, trackingNumber } : o));
    } catch (error) {
      console.error("Error updating tracking:", error);
    }
  };

  if (loading) return <div className="text-gray-900 dark:text-white">Loading orders...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tracking No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">{order.id.substring(0, 8)}...</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {order.createdAt?.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Rs. {Number(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      defaultValue={order.trackingNumber || ""}
                      placeholder="Enter tracking #"
                      onBlur={(e) => {
                        if (e.target.value !== (order.trackingNumber || "")) {
                          updateTrackingNumber(order.id, e.target.value);
                        }
                      }}
                      className="w-36 text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className={`block rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm px-2 py-1 border disabled:opacity-50 font-medium ${getStatusColor(order.status)}`}
                    >
                      {DELIVERY_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-900 dark:hover:text-teal-400 transition-colors"
                      title="View order details"
                    >
                      <Eye size={18} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
