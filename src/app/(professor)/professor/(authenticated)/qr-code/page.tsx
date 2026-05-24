import { requireInstructorContext } from '@/lib/session-context';
import { getInstructorQrCheckInSessions } from '@/modules/attendance/queries/get-instructor-qr-check-in-sessions';
import { InstructorQrScannerView } from '@/modules/instructor-portal/components/instructor-qr-scanner-view';

export default async function ProfessorQrCodePage() {
  const { instructor } = await requireInstructorContext();
  const sessions = await getInstructorQrCheckInSessions(instructor.id);

  const openCount = sessions.filter((session) => session.isCheckInOpen).length;
  const ongoingCount = sessions.filter((session) => session.phase === 'ongoing').length;

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Presença
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Leitor de QR Code
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-400">
          Selecione a aula do dia, inicie a câmera e escaneie o QR Code do aluno
          para registrar a presença automaticamente.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3">
            <p className="text-2xl font-bold text-white">{sessions.length}</p>
            <p className="text-xs text-zinc-400">Aulas hoje</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <p className="text-2xl font-bold text-emerald-400">{openCount}</p>
            <p className="text-xs text-zinc-400">Check-in aberto</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-2xl font-bold text-red-400">{ongoingCount}</p>
            <p className="text-xs text-zinc-400">Em andamento</p>
          </div>
        </div>
      </section>

      <InstructorQrScannerView sessions={sessions} />
    </div>
  );
}
