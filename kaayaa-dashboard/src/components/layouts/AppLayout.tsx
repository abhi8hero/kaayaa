import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, BarChart2, ScrollText,
  Activity, Bell, Settings, ChevronLeft, ChevronRight,
  Menu, X, Zap
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/traces', icon: Search, label: 'Trace Explorer' },
  { path: '/metrics', icon: BarChart2, label: 'Metrics' },
  { path: '/logs', icon: ScrollText, label: 'Logs' },
  { path: '/workflows', icon: Activity, label: 'Workflows' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/integrations', icon: Settings, label: 'Integrations' },
];

function NavItem({ item, collapsed, onClick }: {
  item: typeof navItems[number];
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const location = useLocation();
  const active = location.pathname === item.path;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative',
        collapsed ? 'justify-center' : '',
        active
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full shadow-[0_0_8px_hsl(210_100%_60%/0.8)]" />
      )}
      <item.icon
        size={18}
        className={cn(
          'shrink-0',
          active ? 'text-primary drop-shadow-[0_0_6px_hsl(210_100%_60%/0.8)]' : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col shrink-0 transition-all duration-300 border-r border-sidebar-border bg-sidebar',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 border-b border-sidebar-border px-3 gap-2 shrink-0',
        collapsed ? 'justify-center' : ''
      )}>
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0 shadow-[0_0_12px_hsl(210_100%_60%/0.5)]">
          <Zap size={14} className="text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm text-foreground truncate">KAAYAA</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Toggle */}
      <div className="p-2 border-t border-sidebar-border shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-muted-foreground">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0 bg-sidebar border-sidebar-border">
        <div className="flex items-center justify-between h-14 border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-[0_0_12px_hsl(210_100%_60%/0.5)]">
              <Zap size={14} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-foreground">KAAYAA</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <nav className="p-2 space-y-0.5">
          {navItems.map(item => (
            <NavItem key={item.path} item={item} onClick={() => setOpen(false)} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// Spotlight cursor effect
function SpotlightOverlay() {
  const spotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -999, y: -999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', move);

    const animate = () => {
      if (spotRef.current) {
        spotRef.current.style.background = `radial-gradient(circle 280px at ${posRef.current.x}px ${posRef.current.y}px, hsl(210 100% 60% / 0.07) 0%, hsl(38 95% 55% / 0.03) 40%, transparent 70%)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      className="fixed inset-0 pointer-events-none z-0 transition-none"
      aria-hidden="true"
    />
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <SpotlightOverlay />
      <DesktopSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Top bar */}
        <header className="h-14 flex items-center gap-3 px-4 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          <MobileSidebar />
          <div className="flex-1 min-w-0" />
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-[hsl(142_70%_45%)] glow-success animate-pulse" />
            <span className="text-xs text-muted-foreground hidden md:block">SigNoz Connected</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
