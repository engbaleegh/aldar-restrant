import Link from "../link";
import { Routes } from "@/constants/enums";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";

const Footer = async () => {
  const locale = await getCurrentLocale();
  const t = await getTrans(locale);

  const links = [
    { label: t.navbar.home, href: `/${locale}` },
    { label: t.navbar.menu, href: `/${locale}/${Routes.MENU}` },
    { label: t.navbar.about, href: `/${locale}/${Routes.ABOUT}` },
    { label: t.navbar.contact, href: `/${locale}/${Routes.CONTACT}` },
    { label: "Reservations", href: `/${locale}/reservations` },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={`/${locale}`} className="text-2xl font-bold text-white">
              ALDAR
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Premium dining experience with the finest ingredients. Order online or reserve your table today.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" aria-label="Facebook" className="hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                123 Restaurant St, Riyadh
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                +966 50 123 4567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                hello@aldar.com
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Mon – Thu</span>
                <span className="text-white">11am – 10pm</span>
              </li>
              <li className="flex justify-between">
                <span>Fri – Sat</span>
                <span className="text-white">11am – 11pm</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-white">12pm – 9pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Aldar Restaurant. {t.copyRight}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
