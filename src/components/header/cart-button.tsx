'use client';

import Link from '../link';
import { Routes } from '@/constants/enums';
import { ShoppingCartIcon } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { selectCartItems } from '@/redux/features/cart/cartSlice';
import { getCartQuantity } from '@/lib/cart';
import { useLocale, localizedPath } from '@/hooks/useLocale';

const CartButton = () => {
  const cart = useAppSelector(selectCartItems);
  const cartQuantity = getCartQuantity(cart);
  const locale = useLocale();

  return (
    <Link
      href={localizedPath(locale, Routes.CART)}
      className="block relative group"
      aria-label={`Shopping cart, ${cartQuantity} items`}
    >
      {cartQuantity > 0 && (
        <span className="absolute -top-4 start-4 w-5 h-5 text-sm bg-primary rounded-full text-white text-center">
          {cartQuantity}
        </span>
      )}
      <ShoppingCartIcon className="text-accent group-hover:text-primary duration-200 transition-colors !w-6 !h-6" />
    </Link>
  );
};

export default CartButton;
