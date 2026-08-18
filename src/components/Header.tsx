import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.webp";

// ─── Constants ──────────────────────────────────────────────────────────────────

const GET_DEMO_URL = "https://theconverseai.com/book-demo";

// ─── Data ──────────────────────────────────────────────────────────────────────

const featuresMenu = {
  products: {
    title: "Products",
    items: [
      { label: "Chatbot", href: "/chatbot" },
      { label: "Live Chat", href: "/live-chat" },
      { label: "Pre-Chat Forms", href: "/pre-chat-forms" },
      { label: "Omni Channel", href: "/omni-channel" },
    ],
  },
  analyse: {
    title: "Analyse",
    items: [
      { label: "Team Reports", href: "/team-reports" },
      { label: "Agent Reports", href: "/agent-reports" },
      { label: "CSAT Report", href: "/csat-report" },
      { label: "Inbox Reports", href: "/inbox-reports" },
    ],
  },
  whatsapp: {
    title: "WhatsApp for Business",
    items: [
      { label: "WhatsApp Shop", href: "/whatsapp-shop" },
      { label: "WhatsApp Marketing", href: "/whatsapp-marketing" },
      { label: "WhatsApp AI Chatbot", href: "/whatsapp-ai-chatbot" },
    ],
  },
  manage: {
    title: "Manage",
    items: [
      { label: "Agent Capacity", href: "/agent-capacity" },
      { label: "Private Notes", href: "/private-notes" },
      { label: "Live View", href: "/live-view" },
      { label: "Teams", href: "/teams" },
    ],
  },
};

const productsMenu = [
  { label: "Conversational AI Chatbot", href: "/chatbot", noWrap: true },
  { label: "WhatsApp AI Chatbot", href: "/whatsapp-ai-chatbot" },
  { label: "Live Chat", href: "/live-chat" },
  { label: "Omni Channel", href: "/omni-channel" },
  { label: "Pre-Chat Forms", href: "/pre-chat-forms" },
];

const servicesMenu = [
  { label: "AI for SMBs", href: "/solutions/ai-for-smb" },
  { label: "AI Strategy & Readiness Audit", href: "/services/ai-strategy-audit", noWrap: true },
  { label: "Agentic Systems & Process Automation", href: "/services/agentic-automation", noWrap: true },
  { label: "AI Voice Agents", href: "/services/ai-voice-agents" },
  { label: "Custom AI Agent Development", href: "/services/custom-ai-agents", noWrap: true },
  { label: "AI Integration Services", href: "/services/ai-integration", noWrap: true },
  { label: "Document & Knowledge Intelligence", href: "/services/knowledge-intelligence", noWrap: true },
  { label: "Sales Intelligence & Outreach Automation", href: "/services/sales-ai", noWrap: true },
];

const navLinks = [
  { label: "Home", href: "/", isRoute: true },
  { label: "Features", href: "#features", isRoute: false, hasDropdown: "features" },
  { label: "Products", href: "#products", isRoute: false, hasDropdown: "products" },
  { label: "Agentic AI", href: "/services", isRoute: true, hasDropdown: "services" },
  { label: "Case Studies", href: "/case-studies", isRoute: true },
  { label: "Blog", href: "https://blog.theconverseai.com/", isRoute: false, isExternal: true },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

/** Single accordion row used at every level of the mobile menu */
// const AccordionRow = ({
//   label,
//   isOpen,
//   onToggle,
//   depth = 0,
// }: {
//   label: string;
//   isOpen: boolean;
//   onToggle: () => void;
//   depth?: number;
// }) => (
//   <button
//     onClick={onToggle}
//     className={cn(
//       "w-full flex items-center gap-1.5 py-2.5 rounded-lg transition-colors text-left",
//       "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
//       // depth === 0
//       //   // Primary items: 14px, semi-bold, px-12 (≈48px each side)
//       //   ? "px-12 text-[14px] font-semibold text-foreground hover:bg-secondary"
//       depth === 0
//       ? "px-[42px] text-[14px] font-semibold text-foreground hover:bg-secondary"
//        depth === 1
//        ? "pl-[50px] pr-[42px] text-[14px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5"
//         : "pl-2 pr-3 text-[14px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5"
//     )}
//   >
//     <span>{label}</span>
//     <ChevronDown
//       className={cn(
//         "shrink-0",
//         depth === 0 ? "w-4 h-4" : "w-3.5 h-3.5"
//       )}
//     />
//   </button>
// );

const AccordionRow = ({
  label,
  isOpen,
  onToggle,
  depth = 0,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  depth?: number;
}) => (
  <button
    onClick={onToggle}
    title={label}
    className={cn(
      "w-full flex items-center gap-1.5 py-2.5 rounded-lg transition-colors text-left",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",

      depth === 0
        ? "px-[42px] text-[14px] font-semibold text-foreground hover:bg-secondary"

        : depth === 1
        ? "pl-[50px] pr-[42px] text-[14px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5"

        : "pl-[58px] pr-[42px] text-[14px] font-normal text-muted-foreground hover:text-primary hover:bg-primary/5"
    )}
  >
    <span>{label}</span>
    <ChevronDown
      className={cn(
        "shrink-0",
        depth === 0 ? "w-4 h-4" : "w-3.5 h-3.5"
      )}
    />
  </button>
);
/** Leaf link inside the mobile menu */
// const LeafItem = ({
//   label,
//   href,
//   depth = 2,
//   onNavigate,
// }: {
//   label: string;
//   href: string;
//   depth?: number;
//   onNavigate: (href: string) => void;
// }) => (
//   <button
//     onClick={() => onNavigate(href)}
//     className={cn(
//       "w-full text-left py-2 rounded-lg transition-colors",
//       "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
//       // Deepest leaf items: 14px, regular weight, pl-2
//       // "text-[14px] font-normal text-muted-foreground hover:text-primary hover:bg-primary/5",
//       // "pl-2 pr-3"
//       "text-[14px] font-normal text-muted-foreground hover:text-primary hover:bg-primary/5",
//       "pl-[58px] pr-[42px]"
//     )}
//   >
//     {label}
//   </button>
// );

const LeafItem = ({
  label,
  href,
  depth = 2,
  onClose,
}: {
  label: string;
  href: string;
  depth?: number;
  onClose: () => void;
}) => {
  const className = cn(
    "block py-2 rounded-lg transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",

    depth === 2
      ? "pl-[58px] pr-[42px] text-[14px] font-normal text-muted-foreground hover:text-primary hover:bg-primary/5"

      : "pl-[50px] pr-[42px] text-[14px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5"
  );
  // On the blog host href is an absolute main-site URL — must be a real <a>.
  return /^https?:\/\//.test(href) ? (
    <a href={href} onClick={onClose} title={label} className={className}>{label}</a>
  ) : (
    <Link to={href} onClick={onClose} title={label} className={className}>{label}</Link>
  );
};
// ─── Main Header ────────────────────────────────────────────────────────────────

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Mobile accordion: only one top-level open at a time
  const [openMobileTop, setOpenMobileTop] = useState<string | null>(null);
  // For nested (Features sub-categories): only one sub open at a time
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);

  const navigate = useNavigate();

  // One Vercel project serves BOTH theconverseai.com and blog.theconverseai.com.
  // On the blog host every internal link must point at the MAIN site (a bare
  // "/services" would otherwise resolve to the blog host); only "/" is the blog
  // index. absolutize() rewrites internal paths to the main site on the blog host.
  const isBlogHost = typeof window !== "undefined" && /(^|\.)blog\./.test(window.location.hostname);
  const absolutize = (href: string) =>
    isBlogHost && href.startsWith("/") ? `https://theconverseai.com${href}` : href;
  const homeHref = isBlogHost ? "https://theconverseai.com/" : "/";
  const resolvedNavLinks = navLinks.map((l) =>
    l.href.startsWith("/") ? { ...l, href: absolutize(l.href) } : l
  );
  // Dropdown item link: an absolute <a> on the blog host, SPA <Link> on the main site.
  const SmartLink = ({
    to,
    children,
    ...rest
  }: { to: string; children: React.ReactNode } & Record<string, unknown>) =>
    isBlogHost && to.startsWith("/")
      ? <a href={`https://theconverseai.com${to}`} {...rest}>{children}</a>
      : <Link to={to} {...(rest as Record<string, unknown>)}>{children}</Link>;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileTop = (key: string) => {
    setOpenMobileTop((prev) => (prev === key ? null : key));
    setOpenMobileSub(null); // collapse sub when switching top
  };

  const toggleMobileSub = (key: string) => {
    setOpenMobileSub((prev) => (prev === key ? null : key));
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: { href: string; isRoute: boolean; hasDropdown?: string; isExternal?: boolean }
  ) => {
    // Absolute URLs (blog host → main site, or the external Blog link) navigate
    // natively — checked first so a dropdown parent like "Agentic AI" still works.
    if (/^https?:\/\//.test(link.href)) { setIsMobileMenuOpen(false); return; }
    if (link.hasDropdown && !link.isRoute) { e.preventDefault(); return; }
    if (link.isExternal) { setIsMobileMenuOpen(false); return; }
    // Let browser handle Ctrl/Cmd/middle-click natively (open in new tab)
    if (e.ctrlKey || e.metaKey || e.button === 1) { return; }
    e.preventDefault();
    if (link.isRoute) { navigate(link.href); setActiveDropdown(null); setIsMobileMenuOpen(false); return; }
    if (link.href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
  };

  const handleMobileClose = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileTop(null);
    setOpenMobileSub(null);
  };

  return (
    <header
      role="banner"
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-[background-color,box-shadow] duration-300",
        isScrolled ? "bg-white shadow-soft" : "bg-white/95 backdrop-blur-xl"
      )}
      style={{ height: "80px", backfaceVisibility: "hidden", transform: "translateZ(0)", isolation: "isolate" }}
    >
      <div className="container-tight relative">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          {(() => {
            const logoImg = (
              <img
                src={logo}
                alt="ConverseAI Logo"
                title="ConverseAI AI Customer Support Platform"
                className="h-8 md:h-10 w-auto"
                width="120"
                height="40"
                fetchpriority="high"
                decoding="sync"
                loading="eager"
              />
            );
            const logoProps = {
              className: "flex items-center group shrink-0",
              "aria-label": "ConverseAI - Go to homepage",
              title: "Go to ConverseAI Homepage",
            };
            return isBlogHost
              ? <a href={homeHref} {...logoProps}>{logoImg}</a>
              : <Link to="/" {...logoProps}>{logoImg}</Link>;
          })()}

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation" style={{ position: "static" }}>
            {resolvedNavLinks.map((link) => (
              <div
                key={link.label}
                className={cn(
                  link.hasDropdown === "features" ? "static" : "relative",
                  link.hasDropdown && "group/dropdown"
                )}
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.hasDropdown)}
                onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
              >
                <a
                  href={link.href}
                  title={link.label}
                  onClick={(e) => handleNavClick(e, link)}
                  target={link.isExternal ? "_blank" : undefined}
                  rel={link.isExternal ? "noopener noreferrer" : undefined}
                  className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group flex items-center gap-1",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1",
                    link.hasDropdown && "after:content-[''] after:absolute after:left-0 after:right-0 after:top-full after:h-4"
                  )}
                  aria-expanded={link.hasDropdown ? activeDropdown === link.hasDropdown : undefined}
                  aria-haspopup={link.hasDropdown ? "menu" : undefined}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="w-4 h-4" aria-hidden="true" />}
                </a>

                {/* Features Mega Menu */}
                {link.hasDropdown === "features" && activeDropdown === "features" && (
                  <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ top: "56px", width: "min(820px, 92vw)" }} role="menu">
                    <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-6 animate-fade-in">
                      <div className="grid grid-cols-4 gap-6">
                        {Object.values(featuresMenu).map((column) => (
                          <div key={column.title} className={column.title === "WhatsApp for Business" ? "w-[180px]" : "min-w-[180px]"}>
                            <h4 className="text-sm font-semibold text-foreground mb-3">{column.title}</h4>
                            <ul className="space-y-1" role="group" aria-label={column.title}>
                              {column.items.map((item) => (
                                <li key={item.label} role="none">
                                  <SmartLink
                                    to={item.href}
                                    onClick={() => setActiveDropdown(null)}
                                    title={`Open ${item.label}`}
                                    className="text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 block px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    role="menuitem"
                                  >
                                    {item.label}
                                  </SmartLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Dropdown */}
                {link.hasDropdown === "products" && activeDropdown === "products" && (
                  <div className="absolute top-full left-0 z-50" role="menu">
                    <div className="bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-border/50 p-3 min-w-[180px] animate-fade-in">
                      <ul className="space-y-1">
                        {productsMenu.map((item) => (
                          <li key={item.label} role="none">
                            <SmartLink
                              to={item.href}
                              onClick={() => setActiveDropdown(null)}
                              title={`Open ${item.label}`}
                              className={`text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 block px-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring${'noWrap' in item && item.noWrap ? ' whitespace-nowrap' : ''}`}
                              role="menuitem"
                            >
                              {item.label}
                            </SmartLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Services Dropdown */}
                {link.hasDropdown === "services" && activeDropdown === "services" && (
                  <div className="absolute top-full left-0 z-50" role="menu">
                    <div className="bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-border/50 p-3 min-w-[220px] animate-fade-in">
                      <ul className="space-y-1">
                        {servicesMenu.map((item) => (
                          <li key={item.label} role="none">
                            <SmartLink
                              to={item.href}
                              onClick={() => setActiveDropdown(null)}
                              title={`Open ${item.label}`}
                              className={`text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 block px-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring${'noWrap' in item && item.noWrap ? ' whitespace-nowrap' : ''}`}
                              role="menuitem"
                            >
                              {item.label}
                            </SmartLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center" onMouseEnter={() => setActiveDropdown(null)}>
            <a href={GET_DEMO_URL} target="_blank" rel="noopener noreferrer" title="Get a Demo of ConverseAI">
              <Button
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-6 hover:scale-100 hover:translate-y-0"
                aria-label="Get a Demo"
                title="Get a Demo of ConverseAI"
              >
                Get a Demo
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
         <button
                className="lg:hidden p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                title={isMobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setOpenMobileTop(null);
                  setOpenMobileSub(null);
                }}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </button>  
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────────────────── */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-label="Mobile navigation menu"
            className="lg:hidden absolute top-full left-0 right-0 bg-white backdrop-blur-xl border-b border-border/60 shadow-lg animate-fade-in max-h-[80vh] overflow-y-auto"
          >
            <nav className="px-0 py-0 flex flex-col gap-0.5" aria-label="Mobile navigation">

              {/* ── Home ── */}
              {isBlogHost ? (
                <a
                  href={homeHref}
                  title="Go to Home"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-[42px] py-2.5 text-[14px] font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors block"
                >
                  Home
                </a>
              ) : (
                <Link
                 to="/"
                  title="Go to Home"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="px-[42px] py-2.5 text-[14px] font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors block"
                     >
                  Home
                </Link>
              )}

              {/* ── Features (2-level accordion) ── */}
              <div>
                <AccordionRow
                  label="Features"
                  isOpen={openMobileTop === "features"}
                  onToggle={() => toggleMobileTop("features")}
                  depth={0}
                />
                {openMobileTop === "features" && (
                  <div className="mt-0.5 flex flex-col gap-0.5 animate-fade-in">
                    {Object.entries(featuresMenu).map(([key, column]) => (
                      <div key={key}>
                        <AccordionRow
                          label={column.title}
                          isOpen={openMobileSub === key}
                          onToggle={() => toggleMobileSub(key)}
                          depth={1}
                        />
                        {openMobileSub === key && (
                          <div className="flex flex-col gap-0.5 animate-fade-in">
                            {column.items.map((item) => (
                              <LeafItem
                                key={item.label}
                                label={item.label}
                                href={absolutize(item.href)}
                                depth={2}
                                onClose={handleMobileClose}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Products (flat accordion) ── */}
              <div>
                <AccordionRow
                  label="Products"
                  isOpen={openMobileTop === "products"}
                  onToggle={() => toggleMobileTop("products")}
                  depth={0}
                />
                {openMobileTop === "products" && (
                  <div className="mt-0.5 flex flex-col gap-0.5 animate-fade-in">
                    {productsMenu.map((item) => (
                      <LeafItem
                        key={item.label}
                        label={item.label}
                        href={absolutize(item.href)}
                        depth={1}
                        onClose={handleMobileClose}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Services (flat accordion) ── */}
              <div>
                <AccordionRow
                  label="Agentic AI"
                  isOpen={openMobileTop === "services"}
                  onToggle={() => toggleMobileTop("services")}
                  depth={0}
                />
                {openMobileTop === "services" && (
                  <div className="mt-0.5 flex flex-col gap-0.5 animate-fade-in">
                    {servicesMenu.map((item) => (
                      <LeafItem
                        key={item.label}
                        label={item.label}
                        href={absolutize(item.href)}
                        depth={1}
                        onClose={handleMobileClose}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Case Studies ── */}
              <SmartLink
                to="/case-studies"
                onClick={() => setIsMobileMenuOpen(false)}
                title="Read ConverseAI customer case studies"
                className="px-[42px] py-2.5 text-[14px] font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors block"
              >
                Case Studies
              </SmartLink>

              {/* ── Blog (external) ── */}
              <a
                href="https://blog.theconverseai.com/"
                target="_blank"
                rel="noopener noreferrer"
                title="Read the ConverseAI Blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-[42px] py-2.5 text-[14px] font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors block"
              >
                Blog
              </a>

              {/* ── CTA ── */}
              <div className="mt-3 px-1 pb-2">
                <a href={GET_DEMO_URL} target="_blank" rel="noopener noreferrer" title="Get a Demo of ConverseAI" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    aria-label="Get a Demo"
                    title="Get a Demo of ConverseAI"
                  >
                    Get a Demo
                  </Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
