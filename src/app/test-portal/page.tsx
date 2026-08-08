'use client';

import { useState } from 'react';
import { PortalProvider } from '@portalsdk/react';
import { portalClient } from '@/lib/portal/client';
import { SessionChat } from '@/components/portal/session-chat';
import { EphemeralReactions } from '@/components/portal/ephemeral-reactions';

export default function TestPortalPage() {
  const [role, setRole] = useState<'candidate' | 'spectator' | 'interviewer'>('spectator');
  const [phase, setPhase] = useState<'configurando' | 'en_vivo' | 'concluida'>('en_vivo');
  const [sessionId] = useState<string>('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

  return (
    <PortalProvider client={portalClient}>
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <header className="border-b border-border pb-4">
            <h1 className="text-2xl font-bold">Sandbox — Capa Social (Portal)</h1>
            <p className="text-sm text-muted-foreground">
              Prueba de gating por rol, reacciones efímeras y chat post-sesión.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                ROL SIMULADO
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-background border border-input rounded-lg p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="spectator">Espectador</option>
                <option value="candidate">Candidato</option>
                <option value="interviewer">Entrevistador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                FASE DE LA SESIÓN
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as any)}
                className="w-full bg-background border border-input rounded-lg p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="configurando">Configurando</option>
                <option value="en_vivo">En Vivo</option>
                <option value="concluida">Concluida</option>
              </select>
            </div>
          </div>

          <section className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-2">
            <h2 className="text-sm font-semibold text-card-foreground">
              Reacciones Efímeras (Universales)
            </h2>
            <EphemeralReactions sessionId={sessionId} />
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-card-foreground">Canal de Chat</h2>
            <SessionChat sessionId={sessionId} role={role} phase={phase} />
          </section>
        </div>
      </div>
    </PortalProvider>
  );
}