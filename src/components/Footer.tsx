import { forwardRef } from "react";
import { Link } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.svg";
import metaTechProvider from "@/assets/meta-tech-provider.webp";
import facebookIcon from "@/assets/social-facebook.svg";
import youtubeIcon from "@/assets/social-youtube.svg";
import instagramIcon from "@/assets/social-instagram.svg";
import linkedinIcon from "@/assets/social-linkedin.svg";
import { title } from "process";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const footerLinks = {
    Products: [
      { label: "Chatbot", href: "/chatbot", isRoute: true },
      { label: "Live Chat", href: "/live-chat", isRoute: true },
      { label: "Omni Channel", href: "/omni-channel", isRoute: true },
      { label: "WhatsApp AI", href: "/whatsapp-ai-chatbot", isRoute: true },
    ],
    "Agentic AI": [
      { label: "AI Strategy & Readiness Audit", href: "/services/ai-strategy-audit", isRoute: true },
      { label: "Agentic Systems & Process Automation", href: "/services/agentic-automation", isRoute: true },
      { label: "AI Voice Agents", href: "/services/ai-voice-agents", isRoute: true },
      { label: "Custom AI Agent Development", href: "/services/custom-ai-agents", isRoute: true },
      { label: "AI Integration Services", href: "/services/ai-integration", isRoute: true },
      { label: "Document & Knowledge Intelligence", href: "/services/knowledge-intelligence", isRoute: true },
      { label: "Sales Intelligence & Outreach", href: "/services/sales-ai", isRoute: true },
    ],
    Company: [
      { label: "About Us", href: "/about-us", isRoute: true },
      { label: "Case Studies", href: "/case-studies", isRoute: true },
      { label: "Contact Us", href: "/contact-us", isRoute: true },
      { label: "Terms & Conditions", href: "/terms-and-conditions", isRoute: true },
      { label: "Privacy Policy", href: "/privacy-policy", isRoute: true },
    ],
  };

  const socialLinks = [
    { icon: facebookIcon, href: "https://www.facebook.com/61564130560658/", label: "Facebook", title: "Facebook" },
    { icon: youtubeIcon, href: "https://www.youtube.com/@theconverseai", label: "YouTube", title: "YouTube" },
    { icon: instagramIcon, href: "https://www.instagram.com/theconverseai/", label: "Instagram", title: "Instagram" },
    { icon: linkedinIcon, href: "https://www.linkedin.com/company/theconverseai", label: "LinkedIn", title: "LinkedIn" },
  ];

  return (
    <footer ref={ref} role="contentinfo" className="bg-footer text-primary-foreground">
      {/* Top gradient line */}
      <div className="h-1 bg-gradient-to-r from-primary via-violet to-primary" aria-hidden="true" />
      
      <div className="container-tight py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link 
                  to="/" 
                  className="inline-flex items-center mb-5" 
                  aria-label="ConverseAI - Go to homepage"
                  title="Go to ConverseAI Homepage"
                >
              <img 
                src={logoIcon} 
                alt="ConverseAI Logo"
                title="ConverseAI AI Customer Support Platform"
                className="h-12 w-auto"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="text-sm text-footer-text leading-relaxed mb-6 max-w-xs">
              We help businesses <span className="font-semibold text-primary-foreground">talk better with their customers</span>. We give them powerful tools to have real conversations, keep customers happy, and grow their business.
            </p>
            <nav aria-label="Social media links">
              <ul className="flex gap-3">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      title={`Visit our ${social.label} page`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-100 transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer rounded-full inline-block"
                      aria-label={`Visit our ${social.label} page`}
                    >
                      <img src={social.icon} alt={social.label} title={social.label} className="w-10 h-10" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Products */}
          <nav aria-label="Products navigation">
            <h3 className="font-semibold text-primary-foreground text-lg mb-5">Products</h3>
            <ul className="space-y-3">
              {footerLinks.Products.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    title={`Go to ${link.label}`}
                    className="text-sm text-footer-text hover:text-primary inline-block transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Agentic AI */}
          <nav aria-label="Agentic AI services navigation">
            <h3 className="font-semibold text-primary-foreground text-lg mb-5">Agentic AI</h3>
            <ul className="space-y-3">
              {footerLinks["Agentic AI"].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    title={`Go to ${link.label}`}
                    className="text-sm text-footer-text hover:text-primary inline-block transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company navigation">
            <h3 className="font-semibold text-primary-foreground text-lg mb-5">Company</h3>
            <ul className="space-y-3">
              {footerLinks.Company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    title={`Go to ${link.label}`}
                    className="text-sm text-footer-text hover:text-primary inline-block transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-primary-foreground text-lg mb-5">Contact</h3>
            <address className="not-italic space-y-4">
              <a 
                href="mailto:contact@theconverseai.com" 
                title="Send email to contact@theconverseai.com"
                className="text-sm text-footer-text hover:text-primary transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer rounded"
                aria-label="Email us at contact@theconverseai.com"
              >
                contact@theconverseai.com
              </a>
              <a 
                href="tel:+919982323333" 
                className="text-sm text-footer-text hover:text-primary transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer rounded"
                aria-label="Call us at +91 99823 23333"
                title="Call +91 99823 23333"
              >
                +91-9982323333
              </a>
              <a 
                href="tel:+917023084065" 
                className="text-sm text-footer-text hover:text-primary transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer rounded"
                aria-label="Call us at +91 70230 84065"
                 title="Call +91 70230 84065"
              >
                +91-7023084065
              </a>
            </address>
          </div>
        </div>

        {/* Bottom */}
        {/* <div className="pt-8 border-t border-primary-foreground/10 grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-center md:text-left">
          <span className="text-sm text-footer-text order-2 md:order-1">
            A Product by{" "}
            <a 
              href="https://revtidigital.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary-foreground font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer rounded"
            >
              Revti Digital
            </a>
          </span>
          
          <div className="flex items-center justify-center order-1 md:order-2">
            <img 
              src={metaTechProvider} 
              alt="Meta Tech Provider Partner Badge" 
              className="h-10 w-auto rounded-lg mx-auto"
              width="80"
              height="40"
              loading="lazy"
              decoding="async"
            />
          </div>
          
          <p className="text-sm text-footer-text md:justify-self-end">
            © {new Date().getFullYear()} ConverseAI. All rights reserved.
          </p>
        </div> */}
        <div className="pt-8 border-t border-primary-foreground/10 grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-center md:text-left">

  {/* Left */}
  <span className="text-sm text-footer-text md:justify-self-start">
    A Product by{" "}
    <a 
      href="https://revtidigital.com/" 
      
      target="_blank" 
      rel="noopener noreferrer" 
      title="Visit Revti Digital Website"
      className="text-primary-foreground font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-footer rounded"
    >
      Revti Digital
    </a>
  </span>

  {/* Center */}
  <div className="flex items-center justify-center">
    <img 
      src={metaTechProvider} 
      title="Meta Tech Provider Partner Badge"
      alt="Meta Tech Provider Partner Badge" 
      className="h-10 w-auto rounded-lg"
      width="80"
      height="40"
      loading="lazy"
      decoding="async"
    />
  </div>

  {/* Right */}
  <p className="text-sm text-footer-text md:justify-self-end flex flex-wrap items-center gap-x-3 gap-y-1 justify-center md:justify-end">
    <Link to="/terms-and-conditions" title="Terms & Conditions" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
    <span aria-hidden="true">·</span>
    <Link to="/privacy-policy" title="Privacy Policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
    <span aria-hidden="true">·</span>
    © {new Date().getFullYear()} ConverseAI. All rights reserved.
  </p>

</div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
