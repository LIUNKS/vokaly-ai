'use client';

import { useState } from 'react';
import { PortalProvider } from '@portalsdk/react';
import { portalClient } from '@/lib/portal/client';
import { SessionChat } from '@/components/portal/session-chat';

export default function TestPortalPage() {
  const [role, setRole] = useState<'candidate' | 'spectator'>('spectator');
  const [phase, setPhase] = useState<'configurando' | 'en_vivo' | 'concluida'>('en_vivo');
  const sessionId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  return (
    <PortalProvider client={portalClient}>
      <div className="min-h-screen bg-background p-8 text-foreground">
        <div className="mx-auto max-w-2xl space-y-6">
          <header className="border-b border-border pb-4">
            <h1 className="text-2xl font-bold">Sandbox — Capa Social (Portal)</h1>
            <p className="text-sm text-muted-foreground">
              Prueba de chat y reacciones al estilo Zoom / Teams.
            </p>
          </header>

          <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                ROL SIMULADO
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'candidate' | 'spectator')}
                className="w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="spectator">Espectador</option>
                <option value="candidate">Candidato</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                FASE DE LA SESIÓN
              </label>
              <select
                value={phase}
                onChange={(e) =>
                  setPhase(
                    e.target.value as 'configurando' | 'en_vivo' | 'concluida',
                  )
                }
                className="w-full rounded-lg border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="configurando">Configurando</option>
                <option value="en_vivo">En Vivo</option>
                <option value="concluida">Concluida</option>
              </select>
            </div>
          </div>

          <section className="space-y-2">
            <SessionChat sessionId={sessionId} role={role} phase={phase} />
          </section>
        </div>
      </div>
    </PortalProvider>
  );
}