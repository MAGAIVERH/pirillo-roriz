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
  const { state } = useSidebar();

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      collapsible='icon'
      className='border-r border-white/10 bg-zinc-950 text-white'
    >
      <SidebarHeader className='border-b border-white/10 p-0'>
        <div
          className={`flex h-23 items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <div
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            <div className='flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-xl'>
              🥋
            </div>

            {!isCollapsed ? (
              <div className='space-y-1'>
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-red-500'>
                  Academia
                </p>
                <h2 className='text-2xl font-bold text-white'>Jiu Jitsu</h2>
                <p className='text-sm text-zinc-400'>Painel administrativo</p>
              </div>
            ) : null}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='px-2 py-4'>
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
                      <Link href={href}>
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

      <SidebarFooter className='border-t border-white/10 p-2'>
        <AdminUserMenu user={user} isCollapsed={isCollapsed} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
