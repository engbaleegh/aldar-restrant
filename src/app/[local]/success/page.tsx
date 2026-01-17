"use client";

export const dynamic = "force-dynamic";

// هذا لاستعمال useEffect و Hooks
import { useEffect, useState, Suspense } from "react";

// redux hooks لحذف السلة
import { useAppDispatch } from "@/redux/hooks";
import { clearCart } from "@/redux/features/cart/cartSlice";

// للتحقق من session_id من الرابط
import { useSearchParams } from "next/navigation";

// لعرض رسالة نجاح
import Link from "next/link";

function SuccessPageContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    // إذا لا يوجد session ID لا ننشئ طلب
    if (!sessionId) {
      console.log("Error: session_id is missing");
      setStatus("error");
      return;
    }

    const createOrder = async () => {
      try {
        // استدعاء API لإنشاء الطلب
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/create-order`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          },
        );

        if (!response.ok) throw new Error("Failed to create order");

        // عند النجاح نحذف السلة
        dispatch(clearCart());
        localStorage.removeItem("cartItems");

        setStatus("done");
      } catch (error) {
        console.error("Error creating order:", error);
        setStatus("error");
      }
    };

    createOrder();
  }, [sessionId, dispatch]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {status === "loading" && (
        <h2 className="text-lg">Processing your payment...</h2>
      )}
      {status === "done" && (
        <>
          <h1 className="text-2xl font-bold text-green-600">
            Payment Successful 🎉
          </h1>
          <p className="mt-2">Your order has been created successfully.</p>
          <Link href="/" className="mt-4 underline">
            Back to Home
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold text-red-600">
            Something went wrong
          </h1>
          <p>We could not process your order.</p>
          <Link href="/" className="underline mt-4">
            Back to Home
          </Link>
        </>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
