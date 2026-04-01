'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export const StudentCreateForm = () => {
  const [birthDate, setBirthDate] = useState<Date | undefined>();

  return (
    <div className='space-y-6'>
      <Card className='border-white/10 bg-zinc-950 text-white'>
        <CardHeader>
          <CardTitle className='text-xl'>Dados principais</CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2 md:col-span-2'>
            <Label htmlFor='fullName'>Nome completo</Label>
            <Input
              id='fullName'
              placeholder='Digite o nome completo do aluno'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='preferredName'>Nome preferido</Label>
            <Input
              id='preferredName'
              placeholder='Como prefere ser chamado'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <div className='space-y-2'>
            <Label>Data de nascimento</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  className={cn(
                    'h-10 w-full justify-between border-white/10 bg-zinc-900 text-left font-normal text-white hover:bg-zinc-800 hover:text-white',
                    !birthDate && 'text-zinc-500',
                  )}
                >
                  {birthDate ? (
                    format(birthDate, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    <span>dd/mm/aaaa</span>
                  )}

                  <CalendarIcon className='h-4 w-4 text-white' />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align='start'
                className='z-50 w-auto border-white/10 bg-zinc-950 p-0 text-white'
              >
                <Calendar
                  mode='single'
                  selected={birthDate}
                  onSelect={setBirthDate}
                  locale={ptBR}
                  initialFocus
                  className='rounded-md bg-zinc-950 text-white'
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='email@exemplo.com'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Telefone</Label>
            <Input
              id='phone'
              placeholder='(85) 99999-9999'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <div className='space-y-2'>
            <Label>Sexo</Label>
            <Select>
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='male'>Masculino</SelectItem>
                <SelectItem value='female'>Feminino</SelectItem>
                <SelectItem value='other'>Outro</SelectItem>
                <SelectItem value='prefer-not-to-say'>
                  Prefiro não informar
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Status inicial</Label>
            <Select>
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='lead'>Lead</SelectItem>
                <SelectItem value='trial'>Experimental</SelectItem>
                <SelectItem value='active'>Ativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className='border-white/10 bg-zinc-950 text-white'>
        <CardHeader>
          <CardTitle className='text-xl'>Informações de treino</CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Faixa inicial</Label>
            <Select>
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione a faixa' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='white'>Branca</SelectItem>
                <SelectItem value='blue'>Azul</SelectItem>
                <SelectItem value='purple'>Roxa</SelectItem>
                <SelectItem value='brown'>Marrom</SelectItem>
                <SelectItem value='black'>Preta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Turma principal</Label>
            <Select>
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione a turma' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='adulto-iniciante'>
                  Jiu-Jitsu Adulto Iniciante
                </SelectItem>
                <SelectItem value='kids'>Jiu-Jitsu Kids</SelectItem>
                <SelectItem value='nogi'>Jiu-Jitsu No-Gi</SelectItem>
                <SelectItem value='competicao'>Jiu-Jitsu Competição</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Objetivo principal</Label>
            <Select>
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione o objetivo' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='health'>Saúde</SelectItem>
                <SelectItem value='self-defense'>Defesa pessoal</SelectItem>
                <SelectItem value='competition'>Competição</SelectItem>
                <SelectItem value='hobby'>Hobby</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Origem do aluno</Label>
            <Select>
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione a origem' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='instagram'>Instagram</SelectItem>
                <SelectItem value='indication'>Indicação</SelectItem>
                <SelectItem value='whatsapp'>WhatsApp</SelectItem>
                <SelectItem value='street'>Passagem em frente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2 md:col-span-2'>
            <Label htmlFor='notes'>Observações</Label>
            <Textarea
              id='notes'
              placeholder='Adicione observações importantes sobre o aluno'
              className='min-h-30 border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>
        </CardContent>
      </Card>

      <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
        <Button
          type='button'
          variant='outline'
          className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
        >
          Cancelar
        </Button>

        <Button
          type='button'
          className='bg-red-600 text-white hover:bg-red-500'
        >
          Salvar aluno
        </Button>
      </div>
    </div>
  );
};
