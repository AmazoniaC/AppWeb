@AGENTS.md

# Amazonia Concrete ERP

- UI, nombres de dominio y mensajes en español (es-CO). Código técnico puede ir en inglés.
- Prisma 7: el cliente se genera en `src/generated/prisma` (no versionado); importar desde
  `@/generated/prisma/client`. La conexión va por `@prisma/adapter-pg` en `src/lib/prisma.ts`.
- Next.js 16 usa `src/proxy.ts` (antes `middleware.ts`).
- Todo acceso a datos protegido pasa por `requireUser` / `requireRole` de `src/lib/auth.ts`;
  el proxy es solo un filtro optimista. Permisos por sección en `src/lib/roles.ts`.
- Antes de subir cambios: `npm run typecheck && npm run lint && npm run build`.
