type InstructorStatusBadgeProps = {
  status: 'ACTIVE' | 'INACTIVE';
};

export const InstructorStatusBadge = ({
  status,
}: InstructorStatusBadgeProps) => {
  const isActive = status === 'ACTIVE';

  return (
    <span
      className={`inline-flex w-24 justify-center rounded-full border px-3 py-1 text-xs font-medium ${
        isActive
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-300'
      }`}
    >
      {isActive ? 'Ativo' : 'Inativo'}
    </span>
  );
};
