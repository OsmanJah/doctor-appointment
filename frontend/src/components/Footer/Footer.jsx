import { Link, useNavigate } from "react-router-dom";

import { RiLinkedinFill } from "react-icons/ri";
import { AiFillGithub, AiOutlineInstagram } from "react-icons/ai";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";

const socialLinks = [
  { icon: <AiFillGithub />, path: "https://github.com" },
  { icon: <AiOutlineInstagram />, path: "https://www.instagram.com" },
  { icon: <RiLinkedinFill />, path: "https://www.linkedin.com" },
];

const quickLinks = [
  { label: "Find a Doctor", path: "/doctors" },
  { label: "Pharmacy", path: "/pharmacy" },
  { label: "Pricing", path: "/home#pricing" },
  { label: "Reviews", path: "/home#reviews" },
];

const supportLinks = [
  { label: "Help Center", path: "/home#faq" },
  { label: "Terms & Conditions", path: "/home#terms" },
  { label: "Privacy Policy", path: "/home#privacy" },
  { label: "Contact", path: "/home#contact" },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  const handleNavigation = path => {
    if (!path) return;
    if (path.startsWith("http")) {
      window.open(path, "_self");
      return;
    }
    navigate(path);
  };

  return (
    <footer className="relative overflow-hidden pb-16 pt-14 bg-white/70 backdrop-blur-xl border-t border-white/60 mt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primaryColor/40 to-transparent" />
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-10 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div
              className="text-4xl font-extrabold bg-clip-text text-transparent bg-brand-diagonal animate-gradient-x"
              style={{ backgroundSize: "220% 220%" }}
            >
              MarieCare
            </div>
            <p className="text-[16px] leading-7 font-[400] text-textColor/90 max-w-sm">
              Premium healthcare experiences for patients and providers. Book, manage, and collaborate in one secure place.
            </p>
            <div className="flex items-center gap-3 mt-2">
              {socialLinks.map((link, index) => (
                <Link
                  to={link.path}
                  key={index}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-solid border-primaryColor/30 bg-white rounded-full flex items-center justify-center text-primaryColor hover:bg-primaryColor hover:text-white transition-all duration-300 shadow-panelShadow hover:shadow-glowSoft"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-headingColor font-semibold uppercase tracking-[0.3em] text-xs">
              Quick Links
            </h4>
            <ul className="space-y-3 text-textColor/80 text-sm">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => handleNavigation(link.path)}
                    className="hover:text-primaryColor transition-colors duration-200 text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-headingColor font-semibold uppercase tracking-[0.3em] text-xs">
              Support
            </h4>
            <ul className="space-y-3 text-textColor/80 text-sm">
              {supportLinks.map(link => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => handleNavigation(link.path)}
                    className="hover:text-primaryColor transition-colors duration-200 text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 text-sm text-textColor/80">
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <HiOutlineMail className="text-primaryColor" /> support@marie.health
              </p>
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <HiOutlinePhone className="text-primaryColor" /> +36 30 123 4567
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/60 text-center text-sm text-textColor/70">
          Copyright © {year} developed by Osman Jah. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
