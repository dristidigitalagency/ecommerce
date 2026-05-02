"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Truck, Lock, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="page-title">Login Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
            Please login to proceed with checkout
          </p>
          <Link
            href="/login"
            className="inline-block bg-mountain-600 hover:bg-mountain-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="page-title">Your Cart is Empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
            Add items to proceed with checkout
          </p>
          <Link
            href="/products"
            className="inline-block bg-mountain-600 hover:bg-mountain-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="page-title">Order Placed Successfully!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
            Thank you for your purchase. You'll receive an order confirmation email shortly.
          </p>
          <div className="space-y-3">
            <Link
              href="/profile/orders"
              className="block bg-mountain-600 hover:bg-mountain-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              View Your Orders
            </Link>
            <Link
              href="/"
              className="block border-2 border-mountain-600 text-mountain-600 dark:text-mountain-400 dark:border-mountain-400 hover:bg-mountain-50 dark:hover:bg-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate order processing
    setTimeout(() => {
      clearCart();
      setOrderComplete(true);
    }, 2000);
  };

  const subtotal = getTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="page-title mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {/* Step Indicator */}
              <div className="flex gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex items-center gap-2 pb-4 border-b-2 flex-1 cursor-pointer ${
                      step === s
                        ? "border-mountain-600 dark:border-mountain-400"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                    onClick={() => setStep(s)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        step === s
                          ? "bg-mountain-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {s}
                    </div>
                    <span className="text-sm font-semibold hidden sm:block">
                      {s === 1 ? "Shipping" : s === 2 ? "Payment" : "Review"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-mountain-600" />
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                    <input
                      type="text"
                      name="zip"
                      placeholder="ZIP Code"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-mountain-600 hover:bg-mountain-700 text-white font-semibold py-3 rounded-lg transition-colors mt-6"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Payment Information */}
              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-mountain-600" />
                    Payment Method
                  </h2>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="cardExpiry"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                    <input
                      type="text"
                      name="cardCVC"
                      placeholder="CVC"
                      value={formData.cardCVC}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 border-2 border-mountain-600 text-mountain-600 dark:text-mountain-400 dark:border-mountain-400 font-semibold py-3 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-mountain-600 hover:bg-mountain-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* Review Order */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-mountain-600" />
                    Review & Confirm
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Shipping to:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zip}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Email:</strong> {formData.email}
                    </p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 border-2 border-mountain-600 text-mountain-600 dark:text-mountain-400 dark:border-mountain-400 font-semibold py-3 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className={`flex-1 font-semibold py-3 rounded-lg transition-colors ${
                        isProcessing
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-mountain-600 hover:bg-mountain-700 text-white"
                      }`}
                    >
                      {isProcessing ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-mountain-600 dark:text-mountain-400">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//   if (items.length === 0) {
//     return null; // or loading UI
//   }

//   const handlePlaceOrder = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) {
//       alert("Please log in to place an order");
//       router.push("/login");
//       return;
//     }

//     setLoading(true);
//     try {
//       const orderData = {
//         userId: user.uid,
//         items: items,
//         totalAmount: getTotal() + 5, // including shipping
//         status: "PENDING",
//         shippingAddress: {
//           address,
//           city,
//           zip,
//         },
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       };

//       await addDoc(collection(db, "orders"), orderData);
//       clearCart();
//       router.push("/profile/orders");




//     } catch (error) {
//       console.error("Error placing order:", error);
//       alert("Failed to place order.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//           <div>
//             <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipping Information</h2>
//             <form onSubmit={handlePlaceOrder} className="space-y-6" id="checkout-form">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
//                 <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
//                   <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP</label>
//                   <input required type="text" value={zip} onChange={(e) => setZip(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
//                 </div>
//               </div>
//             </form>
//           </div>

//           <div>
//             <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h2>
//             <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
//               <ul className="divide-y divide-gray-200 dark:divide-gray-600 mb-4">
//                 {items.map((item) => (
//                   <li key={item.id} className="py-3 flex justify-between">
//                     <span className="text-sm text-gray-600 dark:text-gray-300">{item.name} x {item.quantity}</span>
//                     <span className="text-sm font-medium text-gray-900 dark:text-white">{(item.price * item.quantity).toFixed(2)}</span>
//                   </li>
//                 ))}
//               </ul>
//               <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600 dark:text-gray-300">Subtotal</span>
//                   <span className="text-sm font-medium text-gray-900 dark:text-white">{getTotal().toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600 dark:text-gray-300">Shipping</span>
//                   <span className="text-sm font-medium text-gray-900 dark:text-white">$5.00</span>
//                 </div>
//                 <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 text-gray-900 dark:text-white">
//                   <span>Total</span>
//                   <span>${(getTotal() + 5).toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>

//             <button
//               form="checkout-form"
//               type="submit"
//               disabled={loading}
//               className="mt-6 w-full bg-teal-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-teal-500 disabled:bg-gray-400"
//             >
//               {loading ? "Placing Order..." : "Place Order"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
