import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

type AdminBackButtonProps = {
  href: string;
  label: string;
};

export function AdminBackButton({ href, label }: AdminBackButtonProps) {
  return (
    <Button
      asChild
      variant='outline'
      className='w-full border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white sm:w-auto'
    >
      <Link href={href}>
        <ArrowLeft className='mr-2 h-4 w-4' />
        {label}
      </Link>
    </Button>
  );
}
