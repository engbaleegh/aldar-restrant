import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const reservationSchema = z.object({
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(6),
  partySize: z.number().int().min(1).max(20),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = reservationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reservation data" }, { status: 400 });
  }

  const { guestName, guestEmail, guestPhone, partySize, date, time, notes } =
    parsed.data;

  const reservation = await db.reservation.create({
    data: {
      guestName,
      guestEmail,
      guestPhone,
      partySize,
      date: new Date(date),
      time,
      notes,
    },
  });

  return NextResponse.json({ reservation }, { status: 201 });
}

export async function GET() {
  const reservations = await db.reservation.findMany({
    orderBy: { date: "asc" },
    take: 50,
  });
  return NextResponse.json({ reservations });
}
