'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CheckCircle2, Loader2, QrCode, XCircle } from 'lucide-react';
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

export function InstructorQrScannerView({
  sessions,
}: InstructorQrScannerViewProps) {
  const router = useRouter();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerId = 'instructor-qr-scanner';
  const [selectedSessionId, setSelectedSessionId] = useState(
    () =>
      sessions.find((session) => session.isCheckInOpen)?.sessionId ??
      sessions.find((session) => session.phase !== 'finished')?.sessionId ??
      sessions[0]?.sessionId ??
      '',
  );
  const [isScannerActive, setIsScannerActive] = useState(false);
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
      if (scannerRef.current) {
        void scannerRef.current.clear().catch(() => undefined);
        scannerRef.current = null;
      }
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.clear().catch(() => undefined);
      scannerRef.current = null;
    }

    setIsScannerActive(false);
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

    await stopScanner();

    const scanner = new Html5QrcodeScanner(
      scannerContainerId,
      {
        fps: 8,
        qrbox: {
          width: 260,
          height: 260,
        },
        aspectRatio: 1,
      },
      false,
    );

    scannerRef.current = scanner;
    setIsScannerActive(true);

    scanner.render(
      (decodedText) => {
        handleScan(decodedText);
      },
      () => undefined,
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
              Presença
            </p>
            <h1 className="text-2xl font-bold text-white">Leitor de QR Code</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Escaneie o QR Code do aluno para registrar presença na aula
              selecionada.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Aula de hoje
            </label>
            <select
              value={selectedSessionId}
              onChange={(event) => {
                void stopScanner();
                setSelectedSessionId(event.target.value);
              }}
              className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none focus:border-red-500/50"
            >
              {sessions.length === 0 ? (
                <option value="">Nenhuma aula hoje</option>
              ) : (
                sessions.map((session) => (
                  <option key={session.sessionId} value={session.sessionId}>
                    {session.className} · {session.startTime} - {session.endTime}{' '}
                    ({phaseLabelMap[session.phase]})
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedSession ? (
            <div
              className={`rounded-xl border p-4 text-sm ${
                selectedSession.isCheckInOpen
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200'
                  : 'border-amber-500/30 bg-amber-500/5 text-amber-200'
              }`}
            >
              {selectedSession.isCheckInOpen
                ? 'Check-in aberto para esta aula. Você pode iniciar a leitura.'
                : 'Check-in fechado no momento. Aguarde a janela da aula ou selecione outra turma.'}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {!isScannerActive ? (
              <button
                type="button"
                onClick={() => {
                  void startScanner();
                }}
                disabled={!selectedSession?.isCheckInOpen || isPending}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                Iniciar câmera
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  void stopScanner();
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900"
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

          <div
            id={scannerContainerId}
            className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40"
          />
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Aulas abertas</p>
              <p className="text-xs text-zinc-400">Check-in disponível agora</p>
            </div>
          </div>

          {openSessions.length > 0 ? (
            <div className="space-y-2">
              {openSessions.map((session) => (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => {
                    void stopScanner();
                    setSelectedSessionId(session.sessionId);
                  }}
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
            <p className="text-sm text-zinc-500">
              Nenhuma aula com check-in aberto no momento.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <p className="font-semibold text-white">Últimas leituras</p>
          {recentScans.length > 0 ? (
            <div className="mt-4 space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/50 p-3"
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
            <p className="mt-3 text-sm text-zinc-500">
              As leituras aparecerão aqui após escanear um QR Code.
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
