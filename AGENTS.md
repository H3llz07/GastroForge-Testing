# AGENTS.md — GastroForge-Testing (QA Evidence & Dashboard System)

## 1. Propósito y Frontera Arquitectónica

`GastroForge-Testing` es el repositorio independiente de aseguramiento de calidad (QA), trazabilidad, métricas y entregables académicos que evalúa una versión congelada de `GastroForge` (SUT).

- **SUT Congelado:** `JhonatanM2005/GastroForge` en el commit `be9089e` (`feat(web): add playwright tablet e2e suite and manual testing evidences (#71)`).
- **Regla de Frontera Inquebrantable:** `GastroForge-Testing` **jamás** modifica el código fuente del ERP ni se conecta a bases de datos productivas. Consume únicamente especificaciones, resultados de ejecución y evidencias verificables asociadas al commit `be9089e`.

---

## 2. Arquitectura Data-First (Single Source of Truth)

Toda la información de pruebas vive en `data/*.json` y se valida antes de generar cualquier documento o vista:

1. `data/metadata.json` — Metadatos de gobernanza (commit congelado `be9089e`, equipo QA, matriz RACI, criterios de entrada/salida y suspensión/reanudación, ambientes y cronograma).
2. `data/requirements.json` — Catálogo de requisitos en alcance (22 Casos de Uso MVP `UC-*`, 34 Historias de Usuario `HU-001..034`, `ADR-0001..0006`) y exclusiones de `Fase 2`.
3. `data/test-cases.json` — Los **40 Casos de Prueba (`CP-XXX-NNN`)**, incluyendo **15 manuales** y **25 automatizados**, con todos los campos exigidos por la sección 7.1 de `plan_de_pruebas.md`.
4. `data/test-runs.json` — Registros de ejecución reales sobre `be9089e` con enlaces a `data/evidence/`.
5. `data/defects.json` — Catálogo de defectos con taxonomía dual (`DEF-001..006` para el documento académico y `GF-BUG-001..006` enlazados a GitHub Issues en `H3llz07/GastroForge-Testing`, con severidades `Crítica (P1)`, `Alta (P2)`, `Media (P3)`, `Baja (P4)`).

Desde `data/*.json`, el script `scripts/generate-deliverables.ts` compila determinísticamente:
- `docs/plan-de-pruebas-gastroforge.md` (100% fiel a la plantilla `plan_de_pruebas.md`, cero marcadores `[...]`).
- `docs/matriz-trazabilidad.md`
- `docs/reporte-bugs.md`

---

## 3. Protocolo de Aislamiento de Contexto (1 Historia de Usuario a la vez)

El desarrollo se divide en **8 Historias de Usuario (`[HU-QA-001]` a `[HU-QA-008]`)** mapeadas 1 a 1 con las Fases `0` a `7` de `PLAN-IMPLEMENTACION-QA-DASHBOARD.md`:

1. **Prohibido mezclar fases:** Cada subagente o sesión de implementación ejecuta **exactamente una `[HU-QA-XXX]`** a la vez.
2. **Lectura acotada:** Antes de codificar una HU, leer únicamente el Issue correspondiente en GitHub (`gh issue view <N> -R H3llz07/GastroForge-Testing`) y los archivos listados en su alcance.
3. **Verificación obligatoria antes de cerrar:**
   - Ejecutar `npm run validate:data` (cuando existan datos), `npm run test` y `npm run build`.
   - Hacer commit atómico siguiendo Conventional Commits (sin atribución de IA) referenciando `Closes #<issue_number>` para dejar trazabilidad exacta en GitHub.
