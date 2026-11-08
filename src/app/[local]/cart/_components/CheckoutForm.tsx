'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/hooks/useLocale';
import { getTotalAmount } from '@/lib/cart';
import { formatCurrency } from '@/lib/formatters';
import {
  removeItemFromCart,
  selectCartItems,
} from '@/redux/features/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { FormEvent, useEffect, useState } from 'react';

type CheckoutResponse = {
  url?: string;
  error?: string;
  code?: string;
  unavailableIds?: string[];
};

function CheckoutForm() {
  const cart = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const totalAmount = getTotalAmount(cart);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-enable the button when the user comes back from Stripe with the
  // browser's back button (the page is restored from the back/forward cache).
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPending(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? '').trim();

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          cart: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity ?? 1,
            size: item.size ? { id: item.size.id } : null,
            extras: item.extras?.map((extra) => ({ id: extra.id })) ?? [],
          })),
          customerInfo: {
            phone: field('phone'),
            streetAddress: field('address'),
            postalCode: field('postal-code'),
            city: field('city'),
            country: field('country'),
          },
        }),
      });
      const data: CheckoutResponse | null = await res.json().catch(() => null);

      if (res.ok && data?.url) {
        window.location.assign(data.url);
        return; // keep the button disabled while the browser navigates
      }

      if (data?.code === 'ITEMS_UNAVAILABLE' && data.unavailableIds) {
        for (const id of data.unavailableIds) {
          dispatch(removeItemFromCart({ id }));
        }
      }
      setError(
        data?.error ??
          `Checkout failed (error ${res.status}). Please try again.`
      );
    } catch {
      setError('Network error. Please check your connection and try again.');
    }
    setPending(false);
  }

  if (!cart || cart.length === 0) return null;

  return (
    <div className='grid gap-6 bg-gray-100 rounded-md p-4'>
      <h2 className='text-2xl text-black font-semibold'>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className='grid gap-4'>
          <div className='grid gap-1'>
            <Label htmlFor='phone' className='text-accent'>
              Phone
            </Label>
            <Input
              id='phone'
              placeholder='Enter your phone'
              type='tel'
              name='phone'
              autoComplete='tel'
              required
            />
          </div>
          <div className='grid gap-1'>
            <Label htmlFor='address' className='text-accent'>
              Street address
            </Label>
            <Textarea
              id='address'
              placeholder='Enter your address'
              name='address'
              autoComplete='street-address'
              className='resize-none'
              required
            />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <div className='grid gap-1'>
              <Label htmlFor='postal-code' className='text-accent'>
                Postal code
              </Label>
              <Input
                type='text'
                id='postal-code'
                placeholder='Enter postal code'
                name='postal-code'
                autoComplete='postal-code'
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='city' className='text-accent'>
                City
              </Label>
              <Input
                type='text'
                id='city'
                placeholder='Enter your City'
                name='city'
                autoComplete='address-level2'
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='country' className='text-accent'>
                Country
              </Label>
              <Input
                type='text'
                id='country'
                placeholder='Enter your country'
                name='country'
                autoComplete='country-name'
              />
            </div>
          </div>
          {error && (
            <p role='alert' className='text-sm text-red-600'>
              {error}
            </p>
          )}
          <Button type='submit' className='h-10' disabled={pending}>
            {pending ? 'Redirecting to payment…' : `Pay ${formatCurrency(totalAmount)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutForm;
