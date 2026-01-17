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
};

type CartState = {
  items: CartItem[];
};
// const initialCartItems = localStorage.getItem("cartItems");
const initialCartItems =
  typeof window !== "undefined" ? localStorage.getItem("cartItems") : null;

const initialState: CartState = {
  items: initialCartItems ? JSON.parse(initialCartItems) : [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addCartItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + 1;
        existingItem.size = action.payload.size;
        existingItem.extras = action.payload.extras;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    removeCartItem: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        if (item.quantity === 1) {
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id,
          );
        } else {
          item.quantity! -= 1;
        }
      }

      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    removeItemFromCart: (state, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cartItems");
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
  clearCart,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;

// 'use client';

// import { Extra, Size } from "@/generated/prisma";
// import { RootState } from "@/redux/store";
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export type CartItem = {
//   name: string;
//   id: string;
//   image: string;
//   basePrice: number;
//   quantity?: number;
//   size?: Size;
//   extras?: Extra[];
// };

// type CartState = {
//   items: CartItem[];
// };

// // Do NOT read localStorage at module load time — that runs on the server
// // and causes hydration mismatches. Initialize empty here and load on client.
// const initialState: CartState = {
//   items: [],
// };

// export const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addCartItem: (state, action: PayloadAction<CartItem>) => {
//       const existingItem = state.items.find(
//         (item) => item.id === action.payload.id
//       );
//       if (existingItem) {
//         existingItem.quantity = (existingItem.quantity || 0) + 1;
//         existingItem.size = action.payload.size;
//         existingItem.extras = action.payload.extras;
//       } else {
//         state.items.push({ ...action.payload, quantity: 1 });
//       }
//     },
//     removeCartItem: (state, action: PayloadAction<{ id: string }>) => {
//       const item = state.items.find((item) => item.id === action.payload.id);
//       if (item) {
//         if (item.quantity === 1) {
//           state.items = state.items.filter(
//             (item) => item.id !== action.payload.id
//           );
//         } else {
//           item.quantity! -= 1;
//         }
//       }
//     },
//     removeItemFromCart: (state, action: PayloadAction<{ id: string }>) => {
//       state.items = state.items.filter((item) => item.id !== action.payload.id);
//     },
//     clearCart: (state) => {
//       state.items = [];
//     },
//     // Replace entire cart (used to hydrate from localStorage on client mount)
//     setCartItems: (state, action: PayloadAction<CartItem[]>) => {
//       state.items = action.payload || [];
//     },
//   },
// });

// export const { addCartItem, removeCartItem, removeItemFromCart, setCartItems, clearCart } =
//   cartSlice.actions;

// export default cartSlice.reducer;

// export const selectCartItems = (state: RootState) => state.cart.items;
