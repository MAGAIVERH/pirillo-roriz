'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  CalendarClock,
  Camera,
  CheckCircle2,
  Clock3,
  Loader2,
  QrCode,
  ScanLine,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { processQrCheckInAction } from '@/modules/attendance/actions/process-qr-check-in';
import type { InstructorQrCheckInSession } from '@/modules/attendance/queries/get-instructor-qr-check-in-sessions';

type InstructorQrScannerViewProps = {
  sessions: InstructorQrCheckInSession[];
};

type ScanResult = {
  id: string;
  success: boolean;
  message: string;
  studentName?: string;
};

const phaseLabelMap = {
  upcoming: 'Próxima',
  ongoing: 'Em andamento',
  finished: 'Encerrada',
} as const;

const phaseStyles = {
  upcoming: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  ongoing: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  finished: 'border-white/10 bg-zinc-900 text-zinc-400',
} as const;

export function InstructorQrScannerView({
  sessions,
}: InstructorQrScannerViewProps) {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'instructor-qr-scanner-viewport';
  const [selectedSessionId, setSelectedSessionId] = useState(
    () =>
      sessions.find((session) => session.isCheckInOpen)?.sessionId ??
      sessions.find((session) => session.phase !== 'finished')?.sessionId ??
      sessions[0]?.sessionId ??
      '',
  );
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const lastScanRef = useRef<{ payload: string; at: number } | null>(null);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.sessionId === selectedSessionId),
    [selectedSessionId, sessions],
  );

  const openSessions = sessions.filter((session) => session.isCheckInOpen);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (!scannerRef.current) {
      setIsScannerActive(false);
      return;
    }

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current.clear();
    } catch {
      // Scanner may already be stopped when switching sessions.
    } finally {
      scannerRef.current = null;
      setIsScannerActive(false);
    }
  };

  const handleScan = (qrPayload: string) => {
    if (!selectedSessionId || isPending) {
      return;
    }

    const now = Date.now();
    const lastScan = lastScanRef.current;

    if (
      lastScan &&
      lastScan.payload === qrPayload &&
      now - lastScan.at < 4000
    ) {
      return;
    }

    lastScanRef.current = {
      payload: qrPayload,
      at: now,
    };

    startTransition(async () => {
      const result = await processQrCheckInAction({
        sessionId: selectedSessionId,
        qrPayload,
      });

      setRecentScans((current) => [
        {
          id: `${Date.now()}-${qrPayload.slice(0, 8)}`,
          success: result.success,
          message: result.message,
          studentName: result.studentName,
        },
        ...current.slice(0, 4),
      ]);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  };

  const startScanner = async () => {
    if (!selectedSession?.isCheckInOpen) {
      toast.error('Selecione uma aula com check-in aberto.');
      return;
    }

    setIsStartingCamera(true);

    try {
      await stopScanner();

      const scanner = new Html5Qrcode(scannerContainerId, false);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.72;
            return {
              width: Math.floor(size),
              height: Math.floor(size),
            };
          },
          aspectRatio: 1,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => undefined,
      );

      setIsScannerActive(true);
    } catch (error) {
      console.error('startScanner error', error);
      toast.error('Não foi possível acessar a câmera. Verifique as permissões.');
      await stopScanner();
    } finally {
      setIsStartingCamera(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    void stopScanner();
    setSelectedSessionId(sessionId);
  };

  if (sessions.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 px-6 py-16 text-center">
        <CalendarClock className="mx-auto h-10 w-10 text-zinc-600" />
        <h2 className="mt-4 text-lg font-semibold text-white">
          Nenhuma aula agendada para hoje
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-zinc-400">
          Quando houver turmas no seu horário de hoje, elas aparecerão aqui para
          check-in por QR Code.
        </p>
        <Link
          href="/professor/turmas"
          className="mt-6 inline-flex h-10 items-center rounded-xl border border-white/10 px-4 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900"
        >
          Ver minhas turmas
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <p className="text-sm font-medium text-white">Câmera de leitura</p>
          <p className="text-xs text-zinc-400">
            Aponte para o QR Code exibido no celular do aluno.
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Selecione a aula
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {sessions.map((session) => {
                const isSelected = selectedSessionId === session.sessionId;

                return (
                  <button
                    key={session.sessionId}
                    type="button"
                    onClick={() => handleSelectSession(session.sessionId)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-red-500/40 bg-red-600/10 ring-1 ring-red-500/20'
                        : 'border-white/10 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-white">
                        {session.className}
                      </p>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${phaseStyles[session.phase]}`}
                      >
                        {phaseLabelMap[session.phase]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {session.classType}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock3 className="h-3.5 w-3.5 text-red-500" />
                      {session.startTime} - {session.endTime}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedSession ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                selectedSession.isCheckInOpen
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200'
                  : 'border-amber-500/30 bg-amber-500/5 text-amber-200'
              }`}
            >
              {selectedSession.isCheckInOpen
                ? 'Check-in aberto. Inicie a câmera para registrar presenças.'
                : 'Check-in fechado para esta aula no momento.'}
            </div>
          ) : null}

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            {!isScannerActive ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[420px]">
                <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-3xl border border-red-500/20 bg-red-600/10">
                  <ScanLine className="h-12 w-12 text-red-500" />
                  <span className="absolute -left-2 -top-2 h-6 w-6 rounded-tl-xl border-l-2 border-t-2 border-red-500/60" />
                  <span className="absolute -right-2 -top-2 h-6 w-6 rounded-tr-xl border-r-2 border-t-2 border-red-500/60" />
                  <span className="absolute -bottom-2 -left-2 h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-red-500/60" />
                  <span className="absolute -bottom-2 -right-2 h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-red-500/60" />
                </div>
                <p className="text-base font-medium text-white">
                  Câmera pronta para leitura
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                  Toque no botão abaixo e permita o acesso à câmera do
                  dispositivo.
                </p>
              </div>
            ) : null}

            <div
              id={scannerContainerId}
              className={`instructor-qr-scanner ${isScannerActive ? 'is-active min-h-[320px] sm:min-h-[420px]' : 'sr-only h-0 overflow-hidden'}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isScannerActive ? (
              <button
                type="button"
                onClick={() => {
                  void startScanner();
                }}
                disabled={
                  !selectedSession?.isCheckInOpen ||
                  isPending ||
                  isStartingCamera
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isStartingCamera ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {isStartingCamera ? 'Abrindo câmera...' : 'Iniciar câmera'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  void stopScanner();
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
              >
                Parar câmera
              </button>
            )}

            {isPending ? (
              <span className="inline-flex h-11 items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando presença...
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Check-in aberto</p>
              <p className="text-xs text-zinc-400">Aulas disponíveis agora</p>
            </div>
          </div>

          {openSessions.length > 0 ? (
            <div className="space-y-2">
              {openSessions.map((session) => (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => handleSelectSession(session.sessionId)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    selectedSessionId === session.sessionId
                      ? 'border-red-500/40 bg-red-600/10'
                      : 'border-white/10 bg-zinc-900 hover:border-white/20'
                  }`}
                >
                  <p className="text-sm font-medium text-white">
                    {session.className}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {session.startTime} - {session.endTime}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/40 px-4 py-6 text-center">
              <Clock3 className="mx-auto h-5 w-5 text-zinc-600" />
              <p className="mt-2 text-sm text-zinc-500">
                Nenhuma aula com check-in aberto agora.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <p className="font-semibold text-white">Últimas leituras</p>
          <p className="mt-1 text-xs text-zinc-500">
            Resultado dos scans mais recentes.
          </p>

          {recentScans.length > 0 ? (
            <div className="mt-4 space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 ${
                    scan.success
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  {scan.success ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  )}
                  <div className="min-w-0">
                    {scan.studentName ? (
                      <p className="text-sm font-medium text-white">
                        {scan.studentName}
                      </p>
                    ) : null}
                    <p className="text-xs leading-5 text-zinc-400">
                      {scan.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-zinc-900/40 px-4 py-6 text-center">
              <ScanLine className="mx-auto h-5 w-5 text-zinc-600" />
              <p className="mt-2 text-sm text-zinc-500">
                Os resultados aparecem aqui após escanear.
              </p>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
