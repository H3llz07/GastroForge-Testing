---
status: accepted
owner: GastroForge QA team (@JhonatanM2005 & @H3llz07)
sut_repo: https://github.com/JhonatanM2005/GastroForge
sut_commit: be9089e
qa_repo: https://github.com/H3llz07/GastroForge-Testing
depends_on:
  - GastroForge release commit be9089e
  - docs/testing/TESTING-PLAN.md
  - plan_de_pruebas.md
source:
  - C:\Users\User\Desktop\Programacion\GastroForge\docs\testing\TESTING-PLAN.md
  - C:\Users\User\Downloads\plan_de_pruebas.md
definition_of_done:
  - Plan de pruebas específico de GastroForge (100% fiel a plan_de_pruebas.md sin marcadores pendientes), 40 casos trazables (15 manuales), 6 defectos registrados en GitHub Issues y snapshot local, dashboard interactivo de métricas y análisis de calidad APA 7 listos para sustentación.
---

# Plan de implementación — GastroForge Testing Dashboard

Este proyecto independiente concentra la evidencia de calidad de una versión congelada de GastroForge (`be9089e`). Su objetivo es producir el entregable académico completo: plan de pruebas (`docs/plan-de-pruebas-gastroforge.md`), matriz de trazabilidad (`docs/matriz-trazabilidad.md`), catálogo y reporte de defectos (`docs/reporte-bugs.md` + GitHub Issues), dashboard interactivo de métricas y análisis de calidad en formato APA 7 (`docs/informe-calidad-apa.md`). No modifica el ERP ni consulta su base de datos productiva.

> **Decisión de alcance:** la evidencia se asocia exclusivamente al commit `be9089e` de `JhonatanM2005/GastroForge` (`feat(web): add playwright tablet e2e suite and manual testing evidences (#71)`). No se declararán probadas funciones de Fase 2, funciones planificadas o cambios posteriores a ese commit.

## Ruta crítica (Data-First / Single Source of Truth)

1. Congelar la versión de GastroForge en el commit `be9089e`, inicializar el repositorio QA `H3llz07/GastroForge-Testing` y dividir el trabajo en 8 Historias de Usuario (`[HU-QA-001]` a `[HU-QA-008]`) para aislar el contexto por fase.
2. Estructurar la fuente única de verdad en `data/*.json` (`metadata.json`, `requirements.json`, `test-cases.json`, `test-runs.json`, `defects.json`).
3. Diseñar y ejecutar 40 casos de prueba trazables (15 manuales + 25 automatizados mapeados 1 a 1 sobre las suites reales del commit `be9089e`).
4. Registrar 6 defectos verificables (3 históricos cerrados de validación MVP + 3 abiertos de severidad Media/Baja `P3/P4` detectados en `be9089e`) como GitHub Issues (`[GF-BUG-001..006]`) en `H3llz07/GastroForge-Testing` y en `data/defects.json`.
5. Generar automáticamente `docs/plan-de-pruebas-gastroforge.md` (hidratando el 100% de las secciones y fichas de `plan_de_pruebas.md`), `docs/matriz-trazabilidad.md` y `docs/reporte-bugs.md` desde `data/*.json`.
6. Construir el dashboard interactivo en React 19 + Vite + TypeScript + Tailwind CSS v4 con filtros, fórmulas de métricas visibles, registro/exportación de ejecuciones manuales y modo de impresión.
7. Analizar métricas y redactar el informe final de calidad con formato estudiantil APA 7 (Institución Universitaria Pascual Bravo).

## Alcance del sistema bajo prueba (`be9089e`)

| En alcance | Fuera de alcance |
|---|---|
| Autenticación, roles (`Admin`, `Gerente`, `Mesero`, `Cocina`, `Cajero`) y cambio de restaurante | Funcionalidades no disponibles en el commit congelado `be9089e` |
| Catálogo, categorías, productos con IVA incluido, modificadores y estaciones | Reservas de mesas y permisos editables avanzados de Fase 2 (`ADR-0005`) |
| Mesas, órdenes (`DINE_IN` / `TAKEOUT`), tandas, concurrencia optimista y cancelaciones | Datos reales de restaurantes o acceso a producción |
| KDS, estados de cocina (`PENDING -> PREPARING -> READY -> SERVED`) y canal SSE (`Outbox`) | Integraciones externas de pasarelas de pago o facturación electrónica DIAN |
| Caja, pagos divididos, propinas, `Idempotency-Key`, reversos y cierre con arqueo ciego | Pruebas destructivas contra infraestructura compartida |
| Inventario manual con motivo obligatorio, alertas de umbral y reportes/exportación CSV | Métricas inventadas o inferidas sin ejecución verificable |
| Aislamiento multi-tenant mediante RLS (`app_user`, `rolbypassrls = false`, `FORCE RLS`) | |

## Arquitectura propuesta

### Principio

`GastroForge-Testing` es el sistema de evidencia QA. `GastroForge` continúa siendo el sistema bajo prueba (SUT). La frontera es deliberada: el repositorio QA almacena los conjuntos de datos normalizados (`data/*.json`), genera determinísticamente los documentos entregables (`docs/*.md`) y sirve el dashboard estático interactivo; no recibe credenciales productivas ni modifica el repositorio del ERP.

### Componentes iniciales

| Componente | Responsabilidad | Fuente de datos |
|---|---|---|
| Metadatos de gobernanza | Mantener commit congelado, equipo QA, matriz RACI, criterios de suspensión/completitud y cronograma | `data/metadata.json` |
| Catálogo de casos | Mantener los 40 CP con prioridad, técnica, nivel piramidal, historia/UC, datos de entrada y pasos | `data/test-cases.json` |
| Registro de ejecuciones | Guardar resultado, entorno, ejecutor, fecha, defectos asociados y evidencias | `data/test-runs.json` + grabador interactivo del dashboard |
| Registro de defectos | Mantener taxonomía dual (`DEF-001..006` y `GF-BUG-001..006`), severidad (`Crítica–Baja` / `P1–P4`), estado y vínculo al CP | GitHub Issues en `H3llz07/GastroForge-Testing` + `data/defects.json` |
| Validador y Generador | Verificar integridad referencial y compilar `plan-de-pruebas-gastroforge.md`, `matriz-trazabilidad.md` y `reporte-bugs.md` | `scripts/validate-qa-data.ts` y `scripts/generate-deliverables.ts` |
| Dashboard SPA | Calcular métricas en tiempo real, filtrar trazabilidad, registrar ejecuciones manuales e imprimir vistas | React 19 + Vite + TypeScript + Tailwind CSS v4 leyendo `data/*.json` |
| Informe APA 7 | Interpretar métricas empíricas, defectos y riesgo residual bajo guía estudiantil APA 7 | `docs/informe-calidad-apa.md` |

### Estructura prevista

```text
GastroForge-Testing/
├── AGENTS.md
├── PLAN-IMPLEMENTACION-QA-DASHBOARD.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── user-story.yml
│   │   └── bug-report.yml
│   └── pull_request_template.md
├── data/
│   ├── metadata.json
│   ├── requirements.json
│   ├── test-cases.json
│   ├── test-runs.json
│   ├── defects.json
│   └── evidence/
├── docs/
│   ├── plan-de-pruebas-gastroforge.md
│   ├── matriz-trazabilidad.md
│   ├── reporte-bugs.md
│   └── informe-calidad-apa.md
├── src/
│   ├── domain/
│   │   └── qa-types.ts
│   ├── metrics/
│   │   ├── calculate-metrics.ts
│   │   └── calculate-metrics.spec.ts
│   ├── views/
│   └── App.tsx
└── scripts/
    ├── validate-qa-data.ts
    └── generate-deliverables.ts
```

## Modelo de datos (alineado 100% con `plan_de_pruebas.md`)

| Entidad | Campos obligatorios |
|---|---|
| Requisito | `id`, `code` (`HU-XX / UC-XX`), `source`, `module`, `title`, `description`, `status` (`IN_SCOPE` \| `PHASE_2`) |
| Caso de prueba (§7.1) | `id`, `number`, `requirementIds`, `userStory`, `module`, `title`, `priority` (`Alta` \| `Media` \| `Baja`), `type`, `executionMode` (`Manual` \| `Automatizada`), `pyramidLevel` (`L1–L6`), `technique` (`EP` \| `BVA` \| `Tabla de decisión` \| `Transición de estados`), `preconditions`, `inputData`, `steps`, `expectedResult`, `responsible`, `automatedSpecPath` opcional |
| Ejecución (§7.1 / §7.2) | `id`, `testCaseId`, `releaseCommit` (`be9089e`), `environment`, `executor`, `executedAt`, `status`, `actualResult`, `defectIds`, `evidenceRefs`, `observations` |
| Defecto (§8.2 / `GF-BUG`) | `id` (`DEF-001`), `externalCode` (`GF-BUG-001`), `issueUrl`, `testCaseId`, `module`, `title`, `severity` (`Crítica` \| `Alta` \| `Media` \| `Baja`), `severityCode` (`P1–P4`), `priority`, `status` (`Nuevo` \| `Asignado` \| `En progreso` \| `Resuelto` \| `Cerrado`), `description`, `stepsToReproduce`, `expectedResult`, `actualResult`, `evidenceRefs`, `environment`, `releaseCommit`, `reportedBy`, `reportedAt`, `assignedTo`, `resolvedAt` opcional |
| Evidencia | `id`, `kind`, `location`, `capturedAt`, `description` |

Los estados de ejecución permitidos son `NOT_RUN`, `PASSED`, `FAILED`, `BLOCKED` y `SKIPPED`. Un caso no ejecutado nunca contará como aprobado.

## Plan de casos de prueba (40 CP totales: 15 manuales + 25 automatizados)

| Área | CP totales | CP manuales mínimos | Ejemplos de foco |
|---|---:|---:|---|
| Autenticación, sesión y roles | 6 | 3 | login, rotación refresh token, restauración de contraseña, matriz RBAC `can()` |
| Catálogo y mesas | 7 | 3 | BVA modificadores, desglose IVA incluido, ocupación derivada, separación por tenant |
| Órdenes y cocina | 10 | 4 | apertura orden, tandas, concurrencia optimista, cancelación con PIN, KDS y reconexión SSE |
| Caja y pagos | 8 | 3 | turno único abierto, pago dividido, propina BVA, `Idempotency-Key`, reversos y arqueo ciego |
| Inventario y reportes | 5 | 1 | movimientos manuales, umbrales, KPIs en caché, tirilla 80mm y exportación CSV UTF-8 BOM |
| Seguridad, RLS y regresión | 4 | 1 | lectura/escritura cruzada 404, FK compuesta, mínimo privilegio `app_user` y CORS/Rate Limit |
| **Total** | **40** | **15** | |

## Gestión de defectos (Mix verificable en commit `be9089e`)

GitHub Issues en `H3llz07/GastroForge-Testing` será el registro operativo mediante la plantilla `bug-report.yml` (`[GF-BUG-001]` a `[GF-BUG-006]`), sincronizado con `data/defects.json` y `docs/reporte-bugs.md`:

- **`DEF-001` (`GF-BUG-001`, `Alta / P2`, `Cerrado`):** `SELECT ... FOR UPDATE` sobre tabla append-only `payment` fallaba bajo `app_user` (`UPDATE` revocado por `ADR-0006`).
- **`DEF-002` (`GF-BUG-002`, `Media / P3`, `Cerrado`):** Desajuste de proyección `firstName`/`lastName` y `cashierId` en `ReportsExportService`.
- **`DEF-003` (`GF-BUG-003`, `Media / P3`, `Cerrado`):** Componentes de `cash` y `reports` leían `err.problem` en vez de `err.detail` en `ApiProblemError`.
- **`DEF-004` (`GF-BUG-004`, `Media / P3`, `Asignado` / Abierto):** En `apps/api/src/modules/auth/domain/can.helper.ts`, el rol `MESERO` incluye `'kitchen:read'` y `'kitchen:advance_status'` sin validación de estación, contradiciendo `PRD.md` (§2.1) y `TESTING-PLAN.md` (§2.2).
- **`DEF-005` (`GF-BUG-005`, `Media / P3`, `Asignado` / Abierto):** Discrepancia entre `PRD.md` (§2.1, que autoriza a `Cajero` a abrir órdenes) y `can.helper.ts` / `TESTING-PLAN.md` (§2.2, que deniegan `orders:create` a `CAJERO`).
- **`DEF-006` (`GF-BUG-006`, `Baja / P4`, `Asignado` / Abierto):** Inconsistencia documental en el tamaño mínimo de objetivos táctiles (`48x48 px` en `TESTING-PLAN.md` §1/§5.1 vs. `44x44 px` en `PRD.md` §1.2 y `tablet-golden-path.e2e.spec.ts`).

| Severidad | Regla de cierre para la sustentación | Estado en `be9089e` |
|---|---|---|
| Crítica (`P1 — Blocker`) | Cero abiertos. Un P1 invalida la conclusión de aptitud. | **0 abiertos** |
| Alta (`P2 — Critical`) | Cero abiertos o aceptación explícita y justificada. | **0 abiertos** (1 resuelto/cerrado: `DEF-001`) |
| Media (`P3 — Major`) | Se reportan y se incluye análisis de riesgo residual. | **2 abiertos** (`DEF-004`, `DEF-005`), **2 cerrados** (`DEF-002`, `DEF-003`) |
| Baja (`P4 — Minor`) | Se reportan; no deben falsear las métricas. | **1 abierto** (`DEF-006`) |

## Fases de implementación e Historias de Usuario (`[HU-QA-001..008]`)

Cada fase se ejecuta en una Historia de Usuario independiente para no mezclar contexto:

| Fase | Historia de Usuario | Resultado verificable | Dependencia |
|---|---|---|---|
| **Fase 0** | `[HU-QA-001]` | Commit `be9089e`, `data/metadata.json`, configuración TS/Vite, `qa-types.ts` y motor `calculate-metrics.ts` con tests unitarios en verde | Bootstrap GitHub |
| **Fase 1** | `[HU-QA-002]` | `data/requirements.json` con los 22 UCs MVP, 34 HUs, ADRs y exclusiones de Fase 2 | `HU-QA-001` |
| **Fase 2** | `[HU-QA-003]` | `data/test-cases.json` con los 40 CP completos (15 manuales + 25 automatizados) y campos §7.1 | `HU-QA-002` |
| **Fase 3** | `[HU-QA-004]` | `data/test-runs.json`, evidencias en `data/evidence/` y `scripts/validate-qa-data.ts` pasando al 100% | `HU-QA-003` |
| **Fase 4** | `[HU-QA-005]` | 6 GitHub Issues `[GF-BUG-001..006]` creados en `H3llz07/GastroForge-Testing` y enlazados en `data/defects.json` | `HU-QA-004` |
| **Fase 5** | `[HU-QA-006]` | `scripts/generate-deliverables.ts` generando `docs/plan-de-pruebas-gastroforge.md`, `matriz-trazabilidad.md` y `reporte-bugs.md` sin `[...]` | `HU-QA-005` |
| **Fase 6** | `[HU-QA-007]` | Dashboard SPA en React 19 + Tailwind CSS v4 compilando (`npm run build`) con filtros, grabador manual e impresión | `HU-QA-006` |
| **Fase 7** | `[HU-QA-008]` | `docs/informe-calidad-apa.md` en formato APA 7 estudiantil (I.U. Pascual Bravo) y validación integral de cierre | `HU-QA-007` |

## Criterios de aceptación

- [x] Se identificó el commit (`be9089e`) y entorno evaluados.
- [x] El repositorio `H3llz07/GastroForge-Testing` cuenta con plantillas YAML, Milestones y las 8 Historias de Usuario `[HU-QA-001..008]`.
- [x] El plan de pruebas específico (`docs/plan-de-pruebas-gastroforge.md`) reemplaza el 100% de los marcadores genéricos de `plan_de_pruebas.md`.
- [x] Existen 40 CP con identificador, módulo, prioridad, historia/UC, técnica, datos de entrada, pasos y resultado esperado.
- [x] Al menos 15 CP tienen ejecución manual y evidencia reproducible.
- [x] Cada uno de los 6 defectos (`DEF-001..006`) enlaza a un CP, al commit `be9089e` y a su Issue `[GF-BUG]` en GitHub.
- [x] El dashboard muestra métricas calculadas con fórmula visible, fecha de actualización, filtros multicriterio y exportación/impresión.
- [x] El análisis de calidad (`docs/informe-calidad-apa.md`) separa hechos, limitaciones y riesgo residual cumpliendo APA 7 estudiantil.
