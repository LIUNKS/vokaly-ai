import { NextResponse } from 'next/server';
import { PortalAuthPayload } from '@/lib/portal/schemas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = PortalAuthPayload.parse(body);

    if (parsed.phase === 'configurando') {
      return NextResponse.json(
        { error: 'La sesión aún está en configuración. El chat se habilitará cuando inicie en vivo.' },
        { status: 403 }
      );
    }

    if (parsed.role === 'candidate' && parsed.phase === 'en_vivo') {
      return NextResponse.json(
        { error: 'El candidato no tiene acceso al chat durante la sesión en vivo.' },
        { status: 403 }
      );
    }

    // Si pasa los filtros, se autoriza
    const portalToken = `portal-token-${parsed.session_id}-${parsed.role}`;

    return NextResponse.json({
      token: portalToken,
      channelId: parsed.session_id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Payload de autenticación inválido' }, { status: 400 });
  }
}