import { type ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import {
  BarChart3, BookOpen, CreditCard, FileText, LogOut,
  Trash2, ArrowLeftRight, Activity, Settings, ChevronDown,
  ChevronRight, Globe, Hash, LayoutDashboard, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminShellProps { children: ReactNode; }

const blogSubItems = [
  { label: "All Posts",   href: "/admin/blog",         icon: FileText, end: true },
  { label: "New Post",    href: "/admin/blog/new",      icon: FileText, end: true },
  { label: "Trash",       href: "/admin/blog/trash",    icon: Trash2,   end: true },
  { label: "Categories",  href: "/admin/blog/categories", icon: Hash,   end: true },
  { label: "Redirects",   href: "/admin/redirects",     icon: ArrowLeftRight, end: true },
  { label: "Activity",    href: "/admin/activity",      icon: Activity, end: true },
];

const topItems = [
  { label: "Dashboard",    href: "/admin",           icon: LayoutDashboard, end: true },
  { label: "Case Studies", href: "/admin/case-studies", icon: BookOpen, end: false },
  { label: "Pricing",      href: "/admin/pricing",   icon: CreditCard, end: false },
];

const AdminShell = ({ children }: AdminShellProps) => {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [blogOpen, setBlogOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-secondary/20 lg:flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="flex h-16 items-center justify-between border-b border-border/60 bg-white px-4 lg:hidden sticky top-0 z-[40] w-full shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
          <BarChart3 className="h-5 w-5 text-violet-600" />
          <span className="text-base font-bold text-violet-705">ConverseAI</span>
          <span className="text-[10px] text-muted-foreground bg-violet-100 text-violet-600 rounded px-1.5 py-0.5 font-semibold">CMS</span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-xs lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Responsive drawer) */}
      <aside className={cn(
        "bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r lg:flex lg:flex-col overflow-hidden",
        "fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:border-b-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo with Close button on Mobile */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-600" />
            <Link to="/admin" className="text-lg font-bold text-violet-700" onClick={() => setMobileMenuOpen(false)}>ConverseAI</Link>
            <span className="text-xs text-muted-foreground bg-violet-100 text-violet-600 rounded px-1.5 py-0.5 font-medium">CMS</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {/* Top items */}
          {topItems.map((item) => (
            <NavLink key={item.href} to={item.href} end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}

          {/* Blog section */}
          <div className="pt-3">
            <button type="button"
              onClick={() => setBlogOpen((o) => !o)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
              <Globe className="h-4 w-4 shrink-0 text-violet-600" />
              <span className="flex-1 text-left">Blog</span>
              {blogOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
            {blogOpen && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/40 pl-3">
                {blogSubItems.map((item) => (
                  <NavLink key={item.href} to={item.href} end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                      isActive ? "bg-violet-100 text-violet-700 font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}>
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="pt-2">
            <NavLink to="/admin/settings" end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </NavLink>
          </div>
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-border/40 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2">
            <div className="h-7 w-7 rounded-full bg-violet-200 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
              {user?.email?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <p className="flex-1 text-xs text-muted-foreground truncate">{user?.email}</p>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-7 w-7 p-0 shrink-0">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8" id="main-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;
