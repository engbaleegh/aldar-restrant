import ReservationForm from "./_components/ReservationForm";

export default function ReservationsPage() {
  return (
    <main>
      <section className="section-gap">
        <div className="container text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Reserve a Table</h1>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Book your table at Aldar Restaurant for an unforgettable dining experience.
          </p>
          <ReservationForm />
        </div>
      </section>
    </main>
  );
}
