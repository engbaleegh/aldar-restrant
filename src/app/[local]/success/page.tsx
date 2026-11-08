"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { clearCart } from "@/redux/features/cart/cartSlice";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";

function SuccessPageContent() {
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const requested = useRef(false);

  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [emailSent, setEmailSent] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    // Avoid confirming twice (React Strict Mode runs effects twice in dev).
    if (requested.current) return;
    requested.current = true;

    const confirmOrder = async () => {
      try {
        // Relative URL: works on any domain without depending on NEXT_PUBLIC_BASE_URL.
        const response = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json().catch(() => null);
        setEmailSent(data?.email === "sent");
        // Test mode (Ethereal): the email is not delivered, so link to it.
        if (
          typeof data?.emailPreviewUrl === "string" &&
          data.emailPreviewUrl.startsWith("https://ethereal.email/")
        ) {
          setEmailPreviewUrl(data.emailPreviewUrl);
        }

        dispatch(clearCart());
        setStatus("done");
      } catch (error) {
        console.error("Error confirming order:", error);
        setStatus("error");
      }
    };

    confirmOrder();
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
          {emailSent && (
            <p className="mt-1 text-sm text-muted-foreground">
              A confirmation email with your order details has been sent.
            </p>
          )}
          {emailPreviewUrl && (
            <a
              href={emailPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-primary underline"
            >
              View the confirmation email (test inbox)
            </a>
          )}
          <Link href={`/${locale}`} className="mt-4 underline">
            Back to Home
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold text-red-600">
            Something went wrong
          </h1>
          <p>We could not confirm your order. If you were charged, please contact us.</p>
          <Link href={`/${locale}`} className="underline mt-4">
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
