"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, ArrowLeft } from "lucide-react";

const DELIVERY_STEPS = [
  { value: "PENDING",           label: "Pending",          icon: Clock,         desc: "Your order has been received." },
  { value: "PROCESSING",        label: "Processing",       icon: Package,       desc: "We are verifying your order." },
  { value: "PACKED",            label: "Packed",           icon: Package,       desc: "Your parcel is packed & ready." },
  { value: "DISPATCHED",        label: "Dispatched",       icon: Truck,         desc: "Handed over to courier." },
  { value: "IN_TRANSIT",        label: "In Transit",       icon: Truck,         desc: "Your parcel is on the way." },
  { value: "OUT_FOR_DELIVERY",  label: "Out for Delivery", icon: Truck,         desc: "Arriving today!" },
  { value: "DELIVERED",         label: "Delivered",        icon: CheckCircle,   desc: "Your order has been delivered." },
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

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);

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
      setReturning(true);
      try {
        await updateDoc(doc(db, "orders", order.id), {
          status: "RETURN_REQUESTED",
          statusHistory: [...(order.statusHistory || []), { status: "RETURN_REQUESTED", timestamp: new Date(), note: "Customer requested return" }],
        });
        setOrder({ ...order, status: "RETURN_REQUESTED" });
        alert("Return requested successfully.");
      } catch (error) {
        alert("Failed to request return.");
      } finally {
        setReturning(false);
      }
    }
  };

  if (loading) return <div className="text-center py-20">Loading order...</div>;
  if (!order) return <div className="text-center py-20">Order not found.</div>;

  const currentStepIndex = DELIVERY_STEPS.findIndex(s => s.value === order.status);
  const isReturn = order.status === "RETURN_REQUESTED" || order.status === "RETURNED";
  const currentStep = DELIVERY_STEPS[currentStepIndex];

  const formatAddress = (addr: any) => {
    if (!addr) return "Not provided";
    if (typeof addr === "string") return addr;
    return [addr.address, addr.city, addr.zip].filter(Boolean).join(", ");
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/profile/orders" className="flex items-center gap-2 text-teal-600 hover:text-teal-500 font-medium mb-8">
          <ArrowLeft size={18} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Placed on {order.createdAt?.toDate().toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(order.status)}`}>
              {currentStep?.label || order.status.replace(/_/g, " ")}
            </span>
          </div>

          {/* Tracking info */}
          {(order.trackingNumber || order.courierName) && (
            <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center gap-3">
              <Truck className="w-5 h-5 text-teal-600" />
              <div>
                {order.courierName && <p className="text-sm font-medium text-teal-800 dark:text-teal-300">{order.courierName}</p>}
                {order.trackingNumber && <p className="text-sm text-teal-700 dark:text-teal-400">Tracking: <span className="font-mono font-bold">{order.trackingNumber}</span></p>}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Stepper */}
        {!isReturn && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Delivery Progress</h2>
            <div className="space-y-0">
              {DELIVERY_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isDone = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isUpcoming = index > currentStepIndex;
                // find timestamp from history
                const historyEntry = order.statusHistory?.find((h: any) => h.status === step.value);
                return (
                  <div key={step.value} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isDone ? "bg-teal-500 text-white" :
                        isCurrent ? "bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900" :
                        "bg-gray-200 dark:bg-gray-700 text-gray-400"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < DELIVERY_STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 ${isDone ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                      )}
                    </div>
                    <div className="pb-6 pt-1.5 flex-1">
                      <p className={`text-sm font-semibold ${isUpcoming ? "text-gray-400" : "text-gray-900 dark:text-white"}`}>
                        {step.label}
                      </p>
                      {(isDone || isCurrent) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>
                      )}
                      {historyEntry && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {historyEntry.timestamp instanceof Date
                            ? historyEntry.timestamp.toLocaleString()
                            : historyEntry.timestamp?.toDate?.()?.toLocaleString() ?? ""}
                          {historyEntry.note && ` — ${historyEntry.note}`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isReturn && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-400 font-medium">
              {order.status === "RETURN_REQUESTED" ? "Return request submitted. We will process it soon." : "This order has been returned."}
            </p>
          </div>
        )}

        {/* Items */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Items</h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.items?.map((item: any) => (
              <li key={item.id} className="py-4 flex gap-4">
                <div className="h-16 w-16 relative rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  {(item.color || item.size) && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {item.color && `Color: ${item.color}`}{item.color && item.size && " · "}{item.size && `Size: ${item.size}`}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Rs.{Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{formatAddress(order.shippingAddress)}</p>
        </div>

        {/* Return */}
        {order.status === "DELIVERED" && (
          <div className="text-right">
            <button
              onClick={handleReturnRequest} disabled={returning}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
            >
              {returning ? "Submitting..." : "Request Return"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
