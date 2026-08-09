import { SessionChat } from '@/components/portal/session-chat';
import { EphemeralReactions } from '@/components/portal/ephemeral-reactions';

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  const mockRole = 'spectator';
  const mockPhase = 'en_vivo';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold">Sesión de Entrevista #{id}</h1>
        <EphemeralReactions sessionId={id} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lado izquierdo: Transcripción / Vapi widget */}
        <div className="md:col-span-2 bg-slate-950 p-4 border border-slate-800 rounded-lg min-h-[400px]">
          <p className="text-slate-500 text-sm">Área de Entrevista en Vivo (Vapi / Transcripción)</p>
        </div>

        {/* Lado derecho: Capa Social (Portal) */}
        <div>
          <SessionChat sessionId={id} role={mockRole} phase={mockPhase} />
        </div>
      </div>
    </div>
  );
}