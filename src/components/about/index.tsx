import { Routes } from "@/constants/enums";
import MainHeading from "../main-heading";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";

async function About() {
  const locale = await getCurrentLocale();
  const t = await getTrans(locale);

  return (
    <section className="section-gap" id={Routes.ABOUT}>
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <MainHeading
            subTitle={t.home.about.ourStory}
            title={t.home.about.aboutUs}
          />
          <div className="grid md:grid-cols-3 gap-8 mt-10 text-left">
            {Object.values(t.home.about.descriptions).map((text, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-4">
                  {i + 1}
                </div>
                <p className="text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
