"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ProductsContent from "./productContent";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
