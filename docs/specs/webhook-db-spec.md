# Vokaly Prep — Especificación de Persistencia Drizzle ORM en Webhook (`webhook-db-spec.md`)

**Documento:** Webhook Database Persistence Spec
**Propósito:** Definir las operaciones de lectura/escritura en la base de datos PostgreSQL mediante Drizzle ORM dentro de la ruta del webhook de Vapi (`/api/vapi/webhook`).

---

## 1. Operaciones por Evento de Vapi

### 1.1 Evento `call-started`
Cuando Vapi inicia la llamada:
- **Query:** Actualizar `sessions` set `state = 'en_vivo'`, `vapiCallId = payload.call.id`.
- **Filtro:** `where eq(sessions.id, sessionId)`.
- **Guardia:** Si `sessions.state` ya es `'en_vivo'` o `'concluida'`, ignorar idempotentemente.

```typescript
await db
  .update(sessions)
  .set({
    state: "en_vivo",
  })
  .where(eq(sessions.id, sessionId));
```

### 1.2 Evento `end-of-call-report`
Cuando la llamada finaliza:
- **Query:** Actualizar `sessions` set `state = 'concluida'`, `concludedAt = new Date()`.
- **Filtro:** `where eq(sessions.id, sessionId)`.
- **Trigger:** Disparar llamada asíncrona a Vercel AI Gateway (Track A) con el `transcript` para generar el `Scorecard`.

```typescript
await db
  .update(sessions)
  .set({
    state: "concluida",
    concludedAt: new Date(),
  })
  .where(eq(sessions.id, sessionId));
```

---

## 2. Manejo de Modo Mock / Desarrollo sin DB

Para permitir pruebas locales sin necesidad de variables de entorno de base de datos activas (`POSTGRES_URL` / `DATABASE_URL`):
- El webhook comprobará si la conexión a la base de datos está disponible o si está en `MOCK_MODE`.
- Si `MOCK_MODE` está activo o no hay DB configurada, el webhook registrará los logs estructurados sin fallar, devolviendo HTTP 200 `{ success: true, mode: "mock" }`.
