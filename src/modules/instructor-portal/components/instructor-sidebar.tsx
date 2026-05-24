'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Home,
  Megaphone,
  QrCode,
  ShoppingBag,
  Users,
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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { shellHeaderHeightClass } from '@/components/layout/shell-header';
import { PortalUserMenu } from '@/modules/auth/components/portal-user-menu';

const navigation: {
  label: string;
  href: string;
  icon: typeof Home;
  disabled?: boolean;
}[] = [
  { label: 'Início', href: '/professor', icon: Home },
  { label: 'Alunos', href: '/professor/alunos', icon: Users },
  { label: 'Turmas', href: '/professor/turmas', icon: CalendarDays },
  { label: 'Avisos', href: '/professor/avisos', icon: Megaphone },
  { label: 'Loja', href: '/professor/loja', icon: ShoppingBag },
  { label: 'QR Code', href: '/professor/qr-code', icon: QrCode },
];

const getIsActive = (pathname: string, href: string) => {
  if (href === '/professor') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

type InstructorSidebarProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
};

export const InstructorSidebar = ({ user }: InstructorSidebarProps) => {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const isCollapsed = !isMobile && state === 'collapsed';

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
          <div
            className={`flex min-w-0 items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-xl">
              🥋
            </div>

            {!isCollapsed ? (
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                  Academia
                </p>
                <h2 className="truncate text-lg font-bold text-white sm:text-2xl">
                  Jiu Jitsu
                </h2>
                <p className="truncate text-xs text-zinc-400 sm:text-sm">
                  Portal do professor
                </p>
              </div>
            ) : null}
          </div>

          {isMobile ? (
            <SidebarTrigger
              aria-label="Fechar menu"
              className="h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white sm:h-11 sm:w-11"
            />
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-zinc-950 px-2 py-4">
        <SidebarGroup>
          {!isCollapsed ? (
            <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          ) : null}

          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = getIsActive(pathname, item.href);

                if (item.disabled) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        disabled
                        tooltip={`${item.label} — em breve`}
                        className="cursor-not-allowed text-zinc-600 opacity-60"
                      >
                        <Icon className="h-4 w-4" />
                        {!isCollapsed ? <span>{item.label}</span> : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

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
                        <Icon className="h-4 w-4" />
                        {!isCollapsed ? <span>{item.label}</span> : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 bg-zinc-950 p-2">
        <PortalUserMenu
          user={user}
          isCollapsed={isCollapsed}
          signOutRedirect="/professor/login"
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
