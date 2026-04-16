import { Card, CardContent } from '@/components/ui/card';

type FinanceBlocksGridProps = {
  items: {
    title: string;
    description: string;
  }[];
};

export const FinanceBlocksGrid = ({ items }: FinanceBlocksGridProps) => {
  return (
    <section className='grid gap-4 xl:grid-cols-2'>
      {items.map((block) => (
        <Card
          key={block.title}
          className='border-white/10 bg-zinc-950 text-white'
        >
          <CardContent className='px-6 py-6'>
            <h2 className='text-2xl font-semibold text-white'>{block.title}</h2>
            <p className='mt-3 max-w-2xl text-sm leading-7 text-zinc-400'>
              {block.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};
