"use client";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
const links = [
  { href: "/docs", label: "Documentation" },
  { href: "/components", label: "Components" },
  { href: "/examples", label: "Examples" },
  { href: "/playground", label: "Playground" },
];
export function SiteNavigation() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const id = useId();
  const group = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (!open) return;
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !group.current?.contains(event.target)
      )
        setOpen(false);
    }
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <div className="site-nav-group" ref={group}>
      <nav className="site-desktop-nav" aria-label="Main navigation">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              path === item.href || path.startsWith(item.href + "/")
                ? "page"
                : undefined
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        ref={trigger}
        className="site-menu-button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav
        id={id}
        className="site-mobile-menu"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {links.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
            <ArrowUpRight size={15} />
          </Link>
        ))}
        <Link
          className="site-mobile-start"
          href="/docs/quickstart"
          onClick={() => setOpen(false)}
        >
          Start building <ArrowUpRight size={15} />
        </Link>
      </nav>
    </div>
  );
}
