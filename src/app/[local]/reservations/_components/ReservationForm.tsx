"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ReservationForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: form.get("guestName"),
          guestEmail: form.get("guestEmail"),
          guestPhone: form.get("guestPhone"),
          partySize: Number(form.get("partySize")),
          date: form.get("date"),
          time: form.get("time"),
          notes: form.get("notes") || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      toast({ title: "Reservation submitted!", description: "We'll confirm shortly." });
      e.currentTarget.reset();
    } catch {
      toast({ title: "Error", description: "Could not submit reservation.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg mx-auto">
      <div>
        <Label htmlFor="guestName">Name</Label>
        <Input id="guestName" name="guestName" required />
      </div>
      <div>
        <Label htmlFor="guestEmail">Email</Label>
        <Input id="guestEmail" name="guestEmail" type="email" required />
      </div>
      <div>
        <Label htmlFor="guestPhone">Phone</Label>
        <Input id="guestPhone" name="guestPhone" required />
      </div>
      <div>
        <Label htmlFor="partySize">Party Size</Label>
        <Input id="partySize" name="partySize" type="number" min={1} max={20} defaultValue={2} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input id="time" name="time" type="time" required />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Book Table"}
      </Button>
    </form>
  );
}
