'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth-client';

import { ChangePasswordDialog } from './change-password-dialog';

type PortalUserMenuProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  isCollapsed: boolean;
  signOutRedirect: string;
};

export function PortalUserMenu({
  user,
  isCollapsed,
  signOutRedirect,
}: PortalUserMenuProps) {
  const router = useRouter();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initial = user.name.charAt(0).toUpperCase() || 'U';

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOut();

      if (result.error) {
        toast.error(result.error.message ?? 'Não foi possível sair.');
        return;
      }

      toast.success('Sessão encerrada.');
      router.push(signOutRedirect);
      setTimeout(() => router.refresh(), 300);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`group rounded-xl border border-white/10 bg-zinc-900 text-left transition hover:border-red-500/40 hover:bg-zinc-800 ${
              isCollapsed
                ? 'flex w-full items-center justify-center px-2 py-3'
                : 'flex w-full items-center gap-3 px-3 py-3'
            }`}
          >
            <Avatar className="h-10 w-10 border border-white/10">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-zinc-950 text-sm font-semibold text-white">
                {initial}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-zinc-400">{user.email}</p>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="end"
          className="w-56 border-white/10 bg-zinc-950 text-white"
        >
          <DropdownMenuLabel className="text-xs uppercase tracking-wide text-zinc-500">
            Minha conta
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setIsPasswordOpen(true);
            }}
            className="cursor-pointer focus:bg-zinc-900 focus:text-white"
          >
            <KeyRound className="mr-2 h-4 w-4 text-red-400" />
            Trocar senha
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              handleSignOut();
            }}
            disabled={isPending}
            className="cursor-pointer focus:bg-zinc-900 focus:text-white"
          >
            <LogOut className="mr-2 h-4 w-4 text-red-400" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
      />
    </>
  );
}
