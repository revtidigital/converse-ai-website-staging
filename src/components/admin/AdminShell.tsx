import { type ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import {
  BarChart3, BookOpen, CreditCard, FileText, LogOut,
  Trash2, ArrowLeftRight, Activity, Settings, ChevronDown,
  ChevronRight, Globe, Hash, LayoutDashboard
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

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-secondary/20 lg:flex">
      {/* Sidebar */}
      <aside className="border-b border-border/60 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r lg:flex lg:flex-col overflow-hidden">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border/40 shrink-0">
          <BarChart3 className="h-5 w-5 text-violet-600" />
          <Link to="/admin" className="text-lg font-bold text-violet-700">ConverseAI</Link>
          <span className="text-xs text-muted-foreground bg-violet-100 text-violet-600 rounded px-1.5 py-0.5 font-medium">CMS</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {/* Top items */}
          {topItems.map((item) => (
            <NavLink key={item.href} to={item.href} end={item.end}
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
        <main className="flex-1 px-6 py-8" id="main-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;
