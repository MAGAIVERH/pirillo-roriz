'use client';

import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';

type PortalSwitchLinkProps = {
  href: string;
  label: string;
  isCollapsed: boolean;
};

export function PortalSwitchLink({
  href,
  label,
  isCollapsed,
}: PortalSwitchLinkProps) {
  return (
    <Link
      href={href}
      title={label}
      className={`flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-300 transition hover:border-red-500/30 hover:bg-red-500/5 hover:text-white ${
        isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 text-sm'
      }`}
    >
      <ArrowLeftRight className="h-4 w-4 shrink-0 text-red-500" />
      {!isCollapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );
}
