"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: "▦" },
  { href: "/events", label: "행사", icon: "☰" },
  { href: "/budget", label: "예산", icon: "₩" },
  { href: "/grants", label: "지원사업", icon: "✉" },
  { href: "/ideas", label: "아이디어", icon: "✦" },
  { href: "/settings", label: "설정", icon: "⚙" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r border-hairline bg-background">
      <div className="h-16 flex items-center px-6 text-lg font-medium text-foreground">
        Little Library Desk
      </div>
      <nav aria-label="주 메뉴" className="flex flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-base ${
                active
                  ? "bg-primary text-white font-medium"
                  : "text-body"
              }`}
            >
              <span aria-hidden className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="하단 메뉴"
      className="md:hidden fixed bottom-0 inset-x-0 z-20 grid grid-cols-6 border-t border-hairline bg-background"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${
              active ? "text-foreground font-semibold" : "text-muted"
            }`}
          >
            <span aria-hidden className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
