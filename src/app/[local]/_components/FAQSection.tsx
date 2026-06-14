import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "What are your opening hours?", a: "We are open daily from 11:00 AM to 11:00 PM." },
  { q: "Do you offer delivery?", a: "Yes! Order online and enjoy fast delivery to your doorstep." },
  { q: "Can I customize my order?", a: "Absolutely. Choose sizes and extra ingredients on any menu item." },
  { q: "How do I make a reservation?", a: "Use our reservation page or call us directly to book a table." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards via secure Stripe checkout." },
];

export default async function FAQSection() {
  return (
    <section className="section-gap bg-muted/30">
      <div className="container max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
