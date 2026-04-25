"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: any;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string | { address?: string; city?: string; zip?: string };
}

export default function OrderDetails() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatAddress = (address: string | { address?: string; city?: string; zip?: string } | undefined): string => {
    if (!address) return "Not provided";
    if (typeof address === "string") return address;
    const parts = [address.address, address.city, address.zip].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderDoc = await getDoc(doc(db, "orders", orderId));
        if (orderDoc.exists()) {
          const orderData = orderDoc.data() as Order;
          setOrder({ ...orderData, id: orderId });

          // Fetch user data
          if (orderData.userId) {
            const userDoc = await getDoc(doc(db, "users", orderData.userId));
            if (userDoc.exists()) {
              setUserData(userDoc.data() as UserData);
            }
          }
        } else {
          setError("Order not found");
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "RETURN_REQUESTED":
        return "bg-orange-100 text-orange-800";
      case "RETURNED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-900 dark:text-white">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-600">{error || "Order not found"}</div>
        <Link href="/admin/orders" className="text-teal-600 hover:text-teal-700">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/orders" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
        <ArrowLeft size={20} />
        Back to Orders
      </Link>

      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order #{order.id}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {order.createdAt?.toDate().toLocaleDateString()} {order.createdAt?.toDate().toLocaleTimeString()}
              </p>
            </div>
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Name</p>
                  <p className="text-gray-900 dark:text-white">{userData?.name || order.customerName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Email</p>
                  <p className="text-gray-900 dark:text-white break-all">{userData?.email || order.customerEmail || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Phone</p>
                  <p className="text-gray-900 dark:text-white">{userData?.phone || order.customerPhone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Shipping Address</p>
                  <p className="text-gray-900 dark:text-white">
                    {formatAddress(order.shippingAddress || userData?.address)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ordered Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items && order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.id}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          ${Number(item.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end">
                <div className="w-full sm:w-64">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">
                      ${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-lg">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
