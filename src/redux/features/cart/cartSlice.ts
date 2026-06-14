"use client";

import { Extra, Size } from "@/generated/prisma";
import { RootState } from "@/redux/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  name: string;
  id: string;
  image: string;
  basePrice: number;
  quantity?: number;
  size?: Size;
  extras?: Extra[];
  cartKey?: string;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

function getCartKey(item: CartItem): string {
  const extrasKey =
    item.extras?.map((e) => e.id).sort().join("-") || "none";
  return `${item.id}-${item.size?.id || "default"}-${extrasKey}`;
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addCartItem: (state, action: PayloadAction<CartItem>) => {
      const cartKey = getCartKey(action.payload);
      const existingItem = state.items.find(
        (item) => (item.cartKey || item.id) === cartKey
      );
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + 1;
      } else {
        state.items.push({
          ...action.payload,
          cartKey,
          quantity: 1,
        });
      }
    },
    removeCartItem: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find(
        (item) => item.id === action.payload.id || item.cartKey === action.payload.id
      );
      if (item) {
        if (item.quantity === 1) {
          state.items = state.items.filter(
            (i) => i.cartKey !== item.cartKey && i.id !== action.payload.id
          );
        } else {
          item.quantity! -= 1;
        }
      }
    },
    removeItemFromCart: (state, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload.id && item.cartKey !== action.payload.id
      );
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (i) => i.cartKey === action.payload.id || i.id === action.payload.id
      );
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload || [];
    },
  },
});

export const {
  addCartItem,
  removeCartItem,
  removeItemFromCart,
  updateCartItemQuantity,
  clearCart,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
