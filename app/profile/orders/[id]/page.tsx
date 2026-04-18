"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!user) return;
      try {
        const docRef = doc(db, "orders", resolvedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().userId === user.uid) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [user, resolvedParams.id]);

  const handleReturnRequest = async () => {
    if (confirm("Are you sure you want to request a return for this order?")) {
      try {
        await updateDoc(doc(db, "orders", order.id), {
          status: "RETURN_REQUESTED"
        });
        setOrder({ ...order, status: "RETURN_REQUESTED" });
        alert("Return requested successfully.");
      } catch (error) {
        console.error("Error requesting return:", error);
        alert("Failed to request return.");
      }
    }
  };

  if (loading) return <div className="text-center py-20">Loading order...</div>;
  if (!order) return <div className="text-center py-20">Order not found.</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/profile/orders" className="text-teal-600 hover:text-teal-500 font-medium">
            &larr; Back to Orders
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Order #{order.id}
            </h3>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
              ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : ''}
              ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
              ${order.status === 'RETURN_REQUESTED' ? 'bg-orange-100 text-orange-800' : ''}
              ${order.status === 'RETURNED' ? 'bg-gray-100 text-gray-800' : ''}
            `}>
              {order.status}
            </span>
          </div>

          <div className="px-6 py-5 sm:px-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Items</h4>
            <ul className="mt-4 border-t border-b border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {order.items.map((item: any) => (
                <li key={item.id} className="py-4 flex">
                  <div className="h-16 w-16 relative rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Qty {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 py-5 sm:px-6 bg-gray-50 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipping Details</h4>
            <div className="mt-2 text-sm text-gray-900 dark:text-white">
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
            </div>
          </div>

          <div className="px-6 py-5 sm:px-6 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Total Amount</h4>
            <p className="text-lg font-bold text-gray-900 dark:text-white">${Number(order.totalAmount).toFixed(2)}</p>
          </div>

          {order.status === "DELIVERED" && (
            <div className="px-6 py-5 sm:px-6 border-t border-gray-200 dark:border-gray-700 text-right">
              <button
                onClick={handleReturnRequest}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Request Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
