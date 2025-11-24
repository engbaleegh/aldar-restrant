"use client";

import React, { useEffect } from "react";
import { store } from "@/redux/store";
import { Provider, useDispatch } from "react-redux";
import { setCartItems } from "@/redux/features/cart/cartSlice";
import type { AppDispatch } from "@/redux/store";

function ClientHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cartItems");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dispatch(setCartItems(parsed));
        }
      }
    } catch (err) {
      // non-fatal; avoid breaking hydration
      // eslint-disable-next-line no-console
      console.warn("Failed to load cart from localStorage", err);
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <ClientHydrator>{children}</ClientHydrator>
    </Provider>
  );
}
