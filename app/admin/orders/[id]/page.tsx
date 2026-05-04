"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { DELIVERY_STATUSES, getStatusColor } from "../page";

interface StatusHistory {
  status: string;
  timestamp: any;
  note: string;
}

interface Order {
  id: string;
  userId: string;
  items: any[];
  totalAmount: number;
  status: string;
  shippingAddress: any;
  createdAt: any;
  trackingNumber?: string;
  courierName?: string;
  statusHistory?: StatusHistory[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const STEPPER_STEPS = [
  "PENDING", "PROCESSING", "PACKED", "DISPATCHED",
  "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED",
];

function StepperIcon({ step }: { step: string }) {
  if (step === "DELIVERED") return <CheckCircle className="w-5 h-5" />;
  if (["IN_TRANSIT", "OUT_FOR_DELIVERY", "DISPATCHED"].includes(step)) return <Truck className="w-5 h-5" />;
  if (step === "PACKED") return <Package className="w-5 h-5" />;
  return <Clock className="w-5 h-5" />;
}

export default function OrderDetails() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderDoc = await getDoc(doc(db, "orders", orderId));
        if (orderDoc.exists()) {
          const data = orderDoc.data() as Order;
          const orderData = { ...data, id: orderId };
          setOrder(orderData);
          setTrackingNumber(data.trackingNumber || "");
          setCourierName(data.courierName || "");
          setSelectedStatus(data.status || "PENDING");
          if (data.userId) {
            const userDoc = await getDoc(doc(db, "users", data.userId));
            if (userDoc.exists()) setUserData(userDoc.data());
          }
        } else {
          setError("Order not found");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const formatAddress = (addr: any): string => {
    if (!addr) return "Not provided";
    if (typeof addr === "string") return addr;
    return [addr.address, addr.city, addr.zip].filter(Boolean).join(", ") || "Not provided";
  };

  const handleSaveTracking = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const now = new Date();
      const updates: any = { trackingNumber, courierName, updatedAt: now };
      if (selectedStatus !== order.status) {
        const history = order.statusHistory || [];
        updates.status = selectedStatus;
        updates.statusHistory = [...history, { status: selectedStatus, timestamp: now, note: statusNote }];
      }
      await updateDoc(doc(db, "orders", orderId), updates);
      setOrder(prev => prev ? { ...prev, ...updates } : prev);
      setStatusNote("");
      alert("Tracking info saved!");
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-900 dark:text-white">Loading order details...</div>;
  if (error || !order) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-red-600">{error || "Order not found"}</div>
      <Link href="/admin/orders" className="text-teal-600 hover:text-teal-700">Back to Orders</Link>
    </div>
  );

  const currentStepIndex = STEPPER_STEPS.indexOf(order.status);

  return (
    <div>
      <Link href="/admin/orders" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
        <ArrowLeft size={20} /> Back to Orders
      </Link>

      <div className="space-y-6">
        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Order #{order.id}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {order.createdAt?.toDate().toLocaleDateString()} {order.createdAt?.toDate().toLocaleTimeString()}
              </p>
            </div>
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {DELIVERY_STATUSES.find(s => s.value === order.status)?.label || order.status}
            </span>
          </div>
        </div>

        {/* Delivery Progress Stepper */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Delivery Progress</h2>
          <div className="flex items-center justify-between overflow-x-auto">
            {STEPPER_STEPS.map((step, index) => {
              const isDone = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const status = DELIVERY_STATUSES.find(s => s.value === step);
              return (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isDone
                        ? isCurrent
                          ? "bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900"
                          : "bg-teal-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    }`}>
                      <StepperIcon step={step} />
                    </div>
                    <span className={`mt-2 text-xs font-medium text-center leading-tight max-w-[70px] ${
                      isDone ? "text-teal-700 dark:text-teal-400" : "text-gray-400"
                    }`}>
                      {status?.label || step}
                    </span>
                  </div>
                  {index < STEPPER_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded transition-colors ${
                      index < currentStepIndex ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tracking Management */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Delivery Tracking</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number</label>
              <input
                type="text" value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="e.g. NP123456789"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Courier / Carrier</label>
              <input
                type="text" value={courierName}
                onChange={e => setCourierName(e.target.value)}
                placeholder="e.g. Blue Dart, DHL"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Update Status</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
              >
                {DELIVERY_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Note (optional)</label>
              <input
                type="text" value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="e.g. Parcel dispatched from warehouse"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={handleSaveTracking} disabled={saving}
            className="mt-4 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save Tracking Info"}
          </button>
        </div>

        {/* Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status History</h2>
            <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-4">
              {[...order.statusHistory].reverse().map((entry, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[1.375rem] top-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white dark:border-gray-800" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {DELIVERY_STATUSES.find(s => s.value === entry.status)?.label || entry.status}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.timestamp instanceof Date
                      ? entry.timestamp.toLocaleString()
                      : entry.timestamp?.toDate?.()?.toLocaleString() ?? ""}
                  </p>
                  {entry.note && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">{entry.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Name</p>
                  <p className="text-gray-900 dark:text-white">{userData?.name || order.customerName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Email</p>
                  <p className="text-gray-900 dark:text-white break-all">{userData?.email || order.customerEmail || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Phone</p>
                  <p className="text-gray-900 dark:text-white">{userData?.phone || order.customerPhone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Shipping Address</p>
                  <p className="text-gray-900 dark:text-white">{formatAddress(order.shippingAddress || userData?.address)}</p>
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
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                          {(item.color || item.size) && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.color && `Color: ${item.color}`}{item.color && item.size && " · "}{item.size && `Size: ${item.size}`}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">Rs. {Number(item.price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">Rs. {(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-lg">Rs. {Number(order.totalAmount).toFixed(2)}</span>
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
