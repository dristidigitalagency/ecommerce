"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, ChevronRight } from "lucide-react";

const DELIVERY_STEPS = [
  { value: "PENDING",           label: "Pending",          icon: Clock },
  { value: "PROCESSING",        label: "Processing",       icon: Package },
  { value: "PACKED",            label: "Packed",           icon: Package },
  { value: "DISPATCHED",        label: "Dispatched",       icon: Truck },
  { value: "IN_TRANSIT",        label: "In Transit",       icon: Truck },
  { value: "OUT_FOR_DELIVERY",  label: "Out for Delivery", icon: Truck },
  { value: "DELIVERED",         label: "Delivered",        icon: CheckCircle },
];

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-orange-100 text-orange-800",
    PACKED: "bg-blue-100 text-blue-800",
    DISPATCHED: "bg-indigo-100 text-indigo-800",
    IN_TRANSIT: "bg-purple-100 text-purple-800",
    OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800",
    DELIVERED: "bg-green-100 text-green-800",
    RETURN_REQUESTED: "bg-red-100 text-red-800",
    RETURNED: "bg-gray-100 text-gray-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
}

function MiniStepper({ status }: { status: string }) {
  const currentIndex = DELIVERY_STEPS.findIndex(s => s.value === status);
  const isReturn = status === "RETURN_REQUESTED" || status === "RETURNED";
  if (isReturn) return null;
  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto">
      {DELIVERY_STEPS.map((step, i) => (
        <div key={step.value} className="flex items-center">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            i <= currentIndex ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"
          }`} />
          {i < DELIVERY_STEPS.length - 1 && (
            <div className={`w-4 h-0.5 ${i < currentIndex ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {DELIVERY_STEPS[currentIndex]?.label || status}
      </span>
    </div>
  );
}

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven&apos;t placed any orders yet.</p>
            <div className="mt-6">
              <Link href="/products" className="text-teal-600 hover:text-teal-500 font-medium">Start shopping</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm text-gray-500 dark:text-gray-400">#{order.id.substring(0, 12)}...</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                          {DELIVERY_STEPS.find(s => s.value === order.status)?.label || order.status}
                        </span>
                        {order.trackingNumber && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            🚚 {order.trackingNumber}
                            {order.courierName && ` (${order.courierName})`}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {order.createdAt?.toDate().toLocaleDateString()} · {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""} · Rs. {Number(order.totalAmount).toFixed(2)}
                      </div>
                      <MiniStepper status={order.status} />
                    </div>
                    <Link
                      href={`/profile/orders/${order.id}`}
                      className="ml-4 flex items-center gap-1 text-teal-600 hover:text-teal-700 dark:text-teal-400 text-sm font-medium whitespace-nowrap"
                    >
                      Details <ChevronRight size={16} />
                    </Link>
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
