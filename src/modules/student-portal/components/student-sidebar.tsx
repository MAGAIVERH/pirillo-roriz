'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck2,
  Megaphone,
  QrCode,
  ShoppingBag,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { shellHeaderHeightClass } from '@/components/layout/shell-header';
import { PortalSwitchLink } from '@/modules/auth/components/portal-switch-link';
import { PortalUserMenu } from '@/modules/auth/components/portal-user-menu';

type StudentSidebarProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  unreadWarnings: number;
  showProfessorPortalLink?: boolean;
};

const navigation: {
  label: string;
  href: string;
  icon: typeof QrCode;
  badgeKey?: 'warnings';
}[] = [
  { label: 'QR Code', href: '/aluno', icon: QrCode },
  { label: 'Avisos', href: '/aluno/avisos', icon: Megaphone, badgeKey: 'warnings' },
  { label: 'Loja', href: '/aluno/loja', icon: ShoppingBag },
  { label: 'Presença', href: '/aluno/presenca', icon: CalendarCheck2 },
];

const getIsActive = (pathname: string, href: string) => {
  if (href === '/aluno') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export function StudentSidebar({
  user,
  unreadWarnings,
  showProfessorPortalLink = false,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = !isMobile && state === 'collapsed';
  const hasUnreadWarnings = unreadWarnings > 0;

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/10 bg-zinc-950 text-white **:data-[slot=sidebar-inner]:bg-zinc-950"
    >
      <SidebarHeader className="border-b border-white/10 bg-zinc-950 p-0">
        <div
          className={`flex ${shellHeaderHeightClass} items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-between gap-3 px-4'
          }`}
        >
          {!isCollapsed ? (
            <Link href="/aluno" className="min-w-0" onClick={handleNavigate}>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500">
                Academia
              </p>
              <p className="truncate text-sm font-semibold text-white">
                Portal do aluno
              </p>
            </Link>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-zinc-950 px-2 py-4">
        <SidebarGroup>
          {!isCollapsed ? (
            <SidebarGroupLabel className="text-zinc-500">
              Plataforma
            </SidebarGroupLabel>
          ) : null}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = getIsActive(pathname, item.href);
                const isWarningsItem = item.badgeKey === 'warnings';
                const badgeCount =
                  isWarningsItem && hasUnreadWarnings ? unreadWarnings : 0;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={
                        isActive
                          ? 'bg-red-600/15 text-white hover:bg-red-600/20 hover:text-white'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      }
                    >
                      <Link href={item.href} onClick={handleNavigate}>
                        <Icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed ? (
                          <span className="truncate">{item.label}</span>
                        ) : null}
                        {badgeCount > 0 ? (
                          <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            {badgeCount}
                          </span>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="space-y-2 border-t border-white/10 bg-zinc-950 p-2">
        {showProfessorPortalLink ? (
          <PortalSwitchLink
            href="/professor"
            label="Ir para portal do professor"
            isCollapsed={isCollapsed}
          />
        ) : null}
        <PortalUserMenu
          user={user}
          isCollapsed={isCollapsed}
          signOutRedirect="/aluno/login"
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
