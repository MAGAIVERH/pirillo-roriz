type ModulePagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export const ModulePagePlaceholder = ({
  eyebrow,
  title,
  description,
  items,
}: ModulePagePlaceholderProps) => {
  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
            {eyebrow}
          </p>

          <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>

          <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
            {description}
          </p>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {items.map((item) => (
          <article
            key={item}
            className='rounded-2xl border border-white/10 bg-zinc-950 p-5'
          >
            <h2 className='text-base font-semibold text-white'>{item}</h2>

            <p className='mt-2 text-sm leading-6 text-zinc-400'>
              Estrutura inicial criada para esse módulo. No próximo passo vamos
              começar a construir a interface real e a regra de negócio.
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};
