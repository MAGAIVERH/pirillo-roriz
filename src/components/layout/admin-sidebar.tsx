'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  GraduationCap,
  Home,
  LayersPlus,
  Megaphone,
  ShoppingBag,
  Users,
  Wallet,
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
import { AdminUserMenu } from '@/modules/auth/components/admin-user-menu';

const navigation = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Alunos', href: '/admin/alunos', icon: Users },
  { label: 'Professores', href: '/admin/professores', icon: GraduationCap },
  { label: 'Turmas', href: '/admin/turmas', icon: CalendarDays },
  { label: 'Graduação', href: '/admin/graduacao/regras', icon: LayersPlus },
  { label: 'Financeiro', href: '/admin/financeiro', icon: Wallet },
  { label: 'Loja', href: '/admin/loja', icon: ShoppingBag },
  { label: 'Avisos', href: '/admin/avisos', icon: Megaphone },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

const getIsActive = (pathname: string, href: string) => {
  if (href === '/admin') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

type AdminSidebarProps = {
  user: {
    name: string;
    email: string;
  };
};

export const AdminSidebar = ({ user }: AdminSidebarProps) => {
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
      collapsible='icon'
      className='border-r border-white/10 bg-zinc-950 text-white **:data-[slot=sidebar-inner]:bg-zinc-950'
    >
      <SidebarHeader className='border-b border-white/10 bg-zinc-950 p-0'>
        <div
          className={`flex h-23 items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-between gap-3 px-4'
          }`}
        >
          <div
            className={`flex min-w-0 items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-xl'>
              🥋
            </div>

            {!isCollapsed ? (
              <div className='min-w-0 space-y-0.5'>
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-red-500'>
                  Academia
                </p>
                <h2 className='truncate text-lg font-bold text-white sm:text-2xl'>
                  Jiu Jitsu
                </h2>
                <p className='truncate text-xs text-zinc-400 sm:text-sm'>
                  Painel administrativo
                </p>
              </div>
            ) : null}
          </div>

          {isMobile ? (
            <SidebarTrigger
              aria-label='Fechar menu'
              className='h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white sm:h-11 sm:w-11'
            />
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className='bg-zinc-950 px-2 py-4'>
        <SidebarGroup>
          {!isCollapsed ? (
            <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          ) : null}

          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(({ label, href, icon: Icon }) => {
                const isActive = getIsActive(pathname, href);

                return (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className={
                        isActive
                          ? 'bg-red-600/15 text-white hover:bg-red-600/20 hover:text-white'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      }
                    >
                      <Link href={href} onClick={handleNavigate}>
                        <Icon className='h-4 w-4' />
                        {!isCollapsed ? <span>{label}</span> : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-white/10 bg-zinc-950 p-2'>
        <AdminUserMenu user={user} isCollapsed={isCollapsed} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
