'use client';

import { QrCode } from 'lucide-react';

import { StudentQrDisplay } from '@/modules/student-portal/components/student-qr-display';

type StudentQrHomeViewProps = {
  studentName: string;
  qrPayload: string;
};

export function StudentQrHomeView({
  studentName,
  qrPayload,
}: StudentQrHomeViewProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-lg flex-col justify-center space-y-6">
      <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
          <QrCode className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Check-in
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">
          Olá, {studentName}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-zinc-400">
          Apresente este QR Code ao professor no início da aula para registrar
          sua presença automaticamente.
        </p>

        <div className="mt-8 flex justify-center">
          <StudentQrDisplay qrPayload={qrPayload} studentName={studentName} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <p className="text-sm font-semibold text-white">Como funciona</p>
        <ol className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
          <li>1. Abra esta tela ao chegar na academia.</li>
          <li>2. O professor escaneia seu QR Code na aula do dia.</li>
          <li>3. Sua presença aparece em Presença e conta para graduação.</li>
        </ol>
      </section>
    </div>
  );
}
