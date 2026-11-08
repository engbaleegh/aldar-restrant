import type { CartItem } from '@/redux/features/cart/cartSlice';

export const deliveryFee = 5;

export const getCartQuantity = (cart: CartItem[]) => {
  return cart.reduce((quantity, item) => (item.quantity ?? 1) + quantity, 0);
};

export const getItemQuantity = (id: string, cart: CartItem[]) => {
  return cart.find((item) => item.id === id)?.quantity || 0;
};

/** Price of one unit: base price + selected size + selected extras. */
export const getItemUnitPrice = (cartItem: CartItem) => {
  const extrasTotal =
    cartItem.extras?.reduce((sum, extra) => sum + (extra.price || 0), 0) ?? 0;
  return cartItem.basePrice + extrasTotal + (cartItem.size?.price || 0);
};

export const getSubTotal = (cart: CartItem[]) => {
  return cart.reduce(
    (total, cartItem) =>
      total + getItemUnitPrice(cartItem) * (cartItem.quantity ?? 1),
    0
  );
};

export const getTotalAmount = (cart: CartItem[]) => {
  return getSubTotal(cart) + deliveryFee;
};
