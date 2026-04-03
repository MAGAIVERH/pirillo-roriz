'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';

import { createGraduationRuleAction } from '@/modules/graduation-rules/actions/create-graduation-rule';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreateGraduationRuleFormData,
  createGraduationRuleSchema,
} from '../schema/create-graduation-rule-schema';

type GraduationRuleCreateFormProps = {
  belts: {
    id: string;
    name: string;
    color: string;
    sortOrder: number;
    adultCategory: boolean;
    juvenileCategory: boolean;
    degrees: {
      id: string;
      degreeNumber: number;
    }[];
  }[];
};

type FormErrors = Partial<Record<keyof CreateGraduationRuleFormData, string>>;

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const isBlackBelt = (belt?: { name: string; color: string }) => {
  if (!belt) {
    return false;
  }

  const normalizedName = normalizeText(belt.name);
  const normalizedColor = normalizeText(belt.color);

  return (
    normalizedName.includes('preta') ||
    normalizedName.includes('preto') ||
    normalizedColor === 'black' ||
    normalizedColor === 'preta' ||
    normalizedColor === 'preto'
  );
};

const getFieldErrorMap = (error: z.ZodError<CreateGraduationRuleFormData>) => {
  const errors: FormErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0] as
      | keyof CreateGraduationRuleFormData
      | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return errors;
};

export const GraduationRuleCreateForm = ({
  belts,
}: GraduationRuleCreateFormProps) => {
  const router = useRouter();

  const [program, setProgram] = useState<'KIDS' | 'ADULT' | ''>('');
  const [currentBeltId, setCurrentBeltId] = useState('');
  const [currentDegreeId, setCurrentDegreeId] = useState('__none__');
  const [nextBeltId, setNextBeltId] = useState('');
  const [nextDegreeId, setNextDegreeId] = useState('__none__');
  const [minimumMonths, setMinimumMonths] = useState('');
  const [minimumAge, setMinimumAge] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | ''>('ACTIVE');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPending, startTransition] = useTransition();

  const filteredBelts = useMemo(() => {
    if (program === 'ADULT') {
      return belts.filter((item) => item.adultCategory);
    }

    if (program === 'KIDS') {
      return belts.filter((item) => item.juvenileCategory);
    }

    return [];
  }, [belts, program]);

  const currentBelt = useMemo(
    () => filteredBelts.find((item) => item.id === currentBeltId),
    [filteredBelts, currentBeltId],
  );

  const nextBelt = useMemo(
    () => filteredBelts.find((item) => item.id === nextBeltId),
    [filteredBelts, nextBeltId],
  );

  const shouldShowCurrentDegree =
    program === 'ADULT' && isBlackBelt(currentBelt);
  const shouldShowNextDegree = program === 'ADULT' && isBlackBelt(nextBelt);

  const clearFieldError = (field: keyof CreateGraduationRuleFormData) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return {
        ...prev,
        [field]: undefined,
      };
    });
  };

  const handleSubmit = () => {
    const formData: CreateGraduationRuleFormData = {
      program: program as 'KIDS' | 'ADULT',
      currentBeltId,
      currentDegreeId:
        shouldShowCurrentDegree && currentDegreeId !== '__none__'
          ? currentDegreeId
          : '',
      nextBeltId,
      nextDegreeId:
        shouldShowNextDegree && nextDegreeId !== '__none__' ? nextDegreeId : '',
      minimumMonths,
      minimumAge: program === 'KIDS' ? minimumAge : '',
      status: status as 'ACTIVE' | 'INACTIVE',
    };

    const parsed = createGraduationRuleSchema.safeParse(formData);

    if (!parsed.success) {
      setErrors(getFieldErrorMap(parsed.error));
      return;
    }

    setErrors({});

    startTransition(async () => {
      const result = await createGraduationRuleAction(parsed.data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setTimeout(() => {
        router.push('/admin/graduacao/regras');
        router.refresh();
      }, 400);
    });
  };

  return (
    <Card className='border-white/10 bg-zinc-950 text-white'>
      <CardHeader>
        <CardTitle className='text-xl'>Dados da regra</CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Programa</p>
            <Select
              value={program}
              onValueChange={(value) => {
                setProgram(value as 'KIDS' | 'ADULT');
                setCurrentBeltId('');
                setCurrentDegreeId('__none__');
                setNextBeltId('');
                setNextDegreeId('__none__');
                setMinimumAge('');
                clearFieldError('program');
              }}
            >
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione o programa' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='KIDS'>Kids</SelectItem>
                <SelectItem value='ADULT'>Adulto</SelectItem>
              </SelectContent>
            </Select>
            {errors.program ? (
              <p className='text-sm text-red-400'>{errors.program}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Status</p>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as 'ACTIVE' | 'INACTIVE');
                clearFieldError('status');
              }}
            >
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione o status' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='ACTIVE'>Ativa</SelectItem>
                <SelectItem value='INACTIVE'>Inativa</SelectItem>
              </SelectContent>
            </Select>
            {errors.status ? (
              <p className='text-sm text-red-400'>{errors.status}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Faixa atual</p>
            <Select
              value={currentBeltId}
              onValueChange={(value) => {
                setCurrentBeltId(value);
                setCurrentDegreeId('__none__');
                clearFieldError('currentBeltId');

                const selectedBelt = filteredBelts.find(
                  (item) => item.id === value,
                );

                if (
                  program === 'ADULT' &&
                  selectedBelt &&
                  isBlackBelt(selectedBelt)
                ) {
                  setNextBeltId(value);
                  setNextDegreeId('__none__');
                  clearFieldError('nextBeltId');
                }
              }}
              disabled={!program}
            >
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione a faixa atual' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                {filteredBelts.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currentBeltId ? (
              <p className='text-sm text-red-400'>{errors.currentBeltId}</p>
            ) : null}
          </div>

          {program === 'ADULT' && currentBelt && isBlackBelt(currentBelt) ? (
            <div className='space-y-2'>
              <p className='text-sm text-zinc-400'>Próxima faixa</p>
              <Input
                value='Preta'
                disabled
                className='border-white/10 bg-zinc-900 text-white'
              />
            </div>
          ) : (
            <div className='space-y-2'>
              <p className='text-sm text-zinc-400'>Próxima faixa</p>
              <Select
                value={nextBeltId}
                onValueChange={(value) => {
                  setNextBeltId(value);
                  setNextDegreeId('__none__');
                  clearFieldError('nextBeltId');
                }}
                disabled={!program}
              >
                <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                  <SelectValue placeholder='Selecione a próxima faixa' />
                </SelectTrigger>
                <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                  {filteredBelts.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nextBeltId ? (
                <p className='text-sm text-red-400'>{errors.nextBeltId}</p>
              ) : null}
            </div>
          )}

          {shouldShowCurrentDegree ? (
            <div className='space-y-2'>
              <p className='text-sm text-zinc-400'>Grau atual da preta</p>
              <Select
                value={currentDegreeId}
                onValueChange={setCurrentDegreeId}
              >
                <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                  <SelectValue placeholder='Selecione o grau atual' />
                </SelectTrigger>
                <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                  <SelectItem value='__none__'>Sem grau</SelectItem>
                  {currentBelt?.degrees.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      Grau {item.degreeNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {program === 'ADULT' && currentBelt && isBlackBelt(currentBelt) ? (
            <div className='space-y-2'>
              <p className='text-sm text-zinc-400'>Próximo grau da preta</p>
              <Select value={nextDegreeId} onValueChange={setNextDegreeId}>
                <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                  <SelectValue placeholder='Selecione o próximo grau' />
                </SelectTrigger>
                <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                  {nextBelt?.degrees.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      Grau {item.degreeNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {program === 'KIDS' ? (
            <div className='space-y-2'>
              <p className='text-sm text-zinc-400'>Idade mínima</p>
              <Input
                type='number'
                min={0}
                value={minimumAge}
                onChange={(event) => {
                  setMinimumAge(event.target.value);
                  clearFieldError('minimumAge');
                }}
                placeholder='Ex: 5'
                className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
              />
              {errors.minimumAge ? (
                <p className='text-sm text-red-400'>{errors.minimumAge}</p>
              ) : null}
            </div>
          ) : null}

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Tempo mínimo em meses</p>
            <Input
              type='number'
              min={1}
              value={minimumMonths}
              onChange={(event) => {
                setMinimumMonths(event.target.value);
                clearFieldError('minimumMonths');
              }}
              placeholder={program === 'ADULT' ? 'Ex: 12' : 'Ex: 24'}
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
            {errors.minimumMonths ? (
              <p className='text-sm text-red-400'>{errors.minimumMonths}</p>
            ) : null}
          </div>
        </div>

        <div className='flex justify-end'>
          <Button
            type='button'
            onClick={handleSubmit}
            disabled={isPending}
            className='bg-red-600 text-white hover:bg-red-500'
          >
            {isPending ? 'Salvando...' : 'Cadastrar regra'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
