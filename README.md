# GastroForge-Testing — Sistema de Evidencia QA, Trazabilidad y Dashboard de Métricas

Repositorio oficial e independiente de **Aseguramiento de Calidad (QA)**, trazabilidad bidireccional, gestión de defectos, dashboard interactivo y entregables académicos para el sistema **GastroForge — Sistema ERP Multi-Restaurante Tablet-First**, desarrollado en la **Facultad de Ingeniería de la Institución Universitaria Pascual Bravo**.

---

## 1. Propósito y Frontera Arquitectónica

`GastroForge-Testing` concentra toda la evidencia empírica y reproducible de pruebas sobre una línea base estrictamente congelada del sistema bajo prueba (SUT):

- **Repositorio del SUT Evaluado:** [`JhonatanM2005/GastroForge`](https://github.com/JhonatanM2005/GastroForge)
- **Commit Congelado (Baseline QA):** `be9089e` (`feat(web): add playwright tablet e2e suite and manual testing evidences (#71)`)
- **Repositorio de Evidencia QA:** [`H3llz07/GastroForge-Testing`](https://github.com/H3llz07/GastroForge-Testing)
- **Autores / Equipo QA:** Jhonatan A. Méndez R. (`@JhonatanM2005` — QA Lead Bloque A) y Julián Santiago Pico Pinzón (`@H3llz07` — QA Lead Bloque B)

> **Frontera Inquebrantable:** Este repositorio jamás modifica el código fuente del ERP ni se conecta a bases de datos o credenciales productivas. Opera bajo una arquitectura **Data-First (Single Source of Truth)** donde todos los catálogos normalizados residen en `data/*.json`, son auditados automáticamente por `scripts/validate-qa-data.ts` y compilan determinísticamente tanto los documentos académicos como las vistas del dashboard interactivo.

---

## 2. Entregables Académicos y Artefactos de Sustentación

Todos los documentos requeridos para la sustentación se encuentran generados y verificados en el directorio `docs/`:

| # | Entregable Académico | Ruta en el Repositorio | Descripción |
|---|---|---|---|
| **1** | **Plan de Pruebas Maestro** | [`docs/plan-de-pruebas-gastroforge.md`](./docs/plan-de-pruebas-gastroforge.md) | Documento completo 100% fiel a la plantilla institucional `plan_de_pruebas.md` (15 secciones, matriz RACI, riesgos, cronograma, las **40 fichas detalladas de casos de prueba** y las **6 fichas de defectos**, con cero marcadores pendientes). |
| **2** | **Matriz de Trazabilidad Bidireccional (RTM)** | [`docs/matriz-trazabilidad.md`](./docs/matriz-trazabilidad.md) | Vinculación hacia adelante y hacia atrás entre los **28 requisitos en alcance (`IN_SCOPE`)** (22 Casos de Uso MVP `UC-*`, 34 Historias de Usuario `HU-001..034`, `ADR-0001..0006`), las **2 exclusiones de Fase 2 (`PHASE_2`)**, los **40 casos de prueba**, sus ejecuciones y defectos. |
| **3** | **Reporte Consolidado de Defectos (Bugs)** | [`docs/reporte-bugs.md`](./docs/reporte-bugs.md) | Catálogo técnico con taxonomía dual (`DEF-001..006` / `GF-BUG-001..006`), distribución por severidad (`P1`–`P4`), pasos de reproducción, evidencias y enlaces directos a GitHub Issues. |
| **4** | **Informe de Análisis de Calidad (Norma APA 7)** | [`docs/informe-calidad-apa.md`](./docs/informe-calidad-apa.md) | Manuscrito académico en formato estudiantil APA 7.ª edición (Institución Universitaria Pascual Bravo) con portada, método piramidal (`L1`–`L6`), tablas APA (`Tabla 1`, `Tabla 2`, `Tabla 3`), análisis de causa raíz, evaluación de riesgo residual, limitaciones y referencias verificables. |

---

## 3. Resumen de Métricas Empíricas (Commit `be9089e`)

| Indicador Clave (KPI) | Fórmula Aplicada | Meta | Resultado en `be9089e` |
|---|---|---|---|
| **Tasa de ejecución** | `(Casos ejecutados / Total casos) × 100` | `≥ 95%` | **100.00% (40/40)** |
| **Tasa de aprobación** | `(Casos aprobados / Casos ejecutados) × 100` | `≥ 90%` | **95.00% (38/40)** |
| **Cobertura de requisitos MVP** | `(Requisitos cubiertos / Requisitos IN_SCOPE) × 100` | `= 100%` | **100.00% (28/28)** |
| **Modalidades de prueba** | `Manuales (L6) + Automatizadas (L2–L5)` | `40 CP (≥ 15 manuales)` | **15 Manuales + 25 Automatizados** |
| **Defectos Críticos / Altos abiertos** | `Abiertos P1 + Abiertos P2` | `= 0` | **0 (P1 = 0, P2 = 0)** |
| **Densidad de defectos abiertos** | `Defectos abiertos / Casos ejecutados` | `< 0.10` | **0.0750 (3/40)** |
| **Densidad histórica acumulada** | `Defectos totales / Casos ejecutados` | Informativo | **0.1500 (6/40)** |
| **Tasa de reapertura** | `(Defectos reabiertos / Resueltos o cerrados) × 100` | `< 5%` | **0.00% (0/3)** |
| **Dictamen de cierre QA** | Evaluación integral de umbrales de salida | Aprobación formal | **Apto con Observaciones Menores Controladas** |

---

## 4. Trazabilidad en GitHub Issues (`#1`–`#14`)

El ciclo de ingeniería de calidad se encuentra íntegramente trazado en los Issues de [`H3llz07/GastroForge-Testing`](https://github.com/H3llz07/GastroForge-Testing/issues):

### 4.1 Historias de Usuario de Implementación QA (`#1`–`#8`)

| Issue | Código | Fase | Título de la Historia de Usuario |
|---|---|---|---|
| [Issue #1](https://github.com/H3llz07/GastroForge-Testing/issues/1) | `[HU-QA-001]` | Fase 0 | Bootstrap del repositorio QA, metadatos de gobernanza y motor puro de métricas (`calculate-metrics.ts`) |
| [Issue #2](https://github.com/H3llz07/GastroForge-Testing/issues/2) | `[HU-QA-002]` | Fase 1 | Extracción y normalización del catálogo de requisitos MVP y exclusiones de Fase 2 (`data/requirements.json`) |
| [Issue #3](https://github.com/H3llz07/GastroForge-Testing/issues/3) | `[HU-QA-003]` | Fase 2 | Diseño formal de los 40 Casos de Prueba (`15 manuales` + `25 automatizados`) en `data/test-cases.json` |
| [Issue #4](https://github.com/H3llz07/GastroForge-Testing/issues/4) | `[HU-QA-004]` | Fase 3 | Registro de las 40 ejecuciones reales sobre el commit `be9089e`, evidencias y validador `validate-qa-data.ts` |
| [Issue #5](https://github.com/H3llz07/GastroForge-Testing/issues/5) | `[HU-QA-005]` | Fase 4 | Registro de los 6 defectos en GitHub Issues (`GF-BUG-001..006`) y sincronización en `data/defects.json` |
| [Issue #6](https://github.com/H3llz07/GastroForge-Testing/issues/6) | `[HU-QA-006]` | Fase 5 | Generador determinista de entregables Markdown (`plan-de-pruebas-gastroforge.md`, `matriz-trazabilidad.md`, `reporte-bugs.md`) |
| [Issue #7](https://github.com/H3llz07/GastroForge-Testing/issues/7) | `[HU-QA-007]` | Fase 6 | Dashboard Web Interactivo de Métricas QA, grabador de ejecuciones manuales y vista de impresión |
| [Issue #8](https://github.com/H3llz07/GastroForge-Testing/issues/8) | `[HU-QA-008]` | Fase 7 | Redacción del Informe de Análisis de Calidad en norma APA 7 y paquete de sustentación |

### 4.2 Catálogo de Defectos (`#9`–`#14`)

| Issue | ID Académico | Código Externo | Caso Asociado | Severidad | Estado en `be9089e` | Resumen Técnico |
|---|---|---|---|---|---|---|
| [Issue #9](https://github.com/H3llz07/GastroForge-Testing/issues/9) | `DEF-001` | `GF-BUG-001` | `CP-CSH-003` | Alta (`P2`) | **Cerrado** | Fallo de bloqueo pesimista `SELECT FOR UPDATE` sobre tabla *append-only* `payment` bajo rol `app_user` |
| [Issue #10](https://github.com/H3llz07/GastroForge-Testing/issues/10) | `DEF-002` | `GF-BUG-002` | `CP-REP-003` | Media (`P3`) | **Cerrado** | Desajuste de proyección de campos `firstName`/`lastName` y `cashierId` en exportación CSV de reportes |
| [Issue #11](https://github.com/H3llz07/GastroForge-Testing/issues/11) | `DEF-003` | `GF-BUG-003` | `CP-CSH-005` | Media (`P3`) | **Cerrado** | Lectura de propiedad `err.problem` en lugar de `err.detail` (RFC 7807) en componentes de caja y reportes |
| [Issue #12](https://github.com/H3llz07/GastroForge-Testing/issues/12) | `DEF-004` | `GF-BUG-004` | `CP-AUTH-006` | Media (`P3`) | **Asignado** | Rol `MESERO` posee permisos `kitchen:read` y `kitchen:advance_status` sin filtro de estación en `can.helper.ts` |
| [Issue #13](https://github.com/H3llz07/GastroForge-Testing/issues/13) | `DEF-005` | `GF-BUG-005` | `CP-ORD-006` | Media (`P3`) | **Asignado** | Discrepancia entre `PRD.md` (§2.1) y `can.helper.ts` sobre el permiso `orders:create` para el rol `CAJERO` |
| [Issue #14](https://github.com/H3llz07/GastroForge-Testing/issues/14) | `DEF-006` | `GF-BUG-006` | `CP-ORD-001` | Baja (`P4`) | **Asignado** | Inconsistencia documental en el umbral mínimo de objetivos táctiles (`48x48 px` vs. `44x44 px`) |

---

## 5. Estructura del Proyecto

```text
GastroForge-Testing/
├── AGENTS.md                              # Reglas de gobernanza y aislamiento de contexto
├── PLAN-IMPLEMENTACION-QA-DASHBOARD.md    # Plan maestro de implementación y criterios de aceptación
├── README.md                              # Guía principal y paquete de sustentación
├── data/                                  # Fuente Única de Verdad (Single Source of Truth)
│   ├── metadata.json                      # Gobernanza, equipo QA, matriz RACI, riesgos y cronograma
│   ├── requirements.json                  # 28 requisitos IN_SCOPE + 2 exclusiones PHASE_2
│   ├── test-cases.json                    # 40 casos de prueba (15 manuales + 25 automatizados)
│   ├── test-runs.json                     # 40 registros de ejecución sobre el commit be9089e
│   ├── defects.json                       # 6 defectos (DEF-001..006 / GF-BUG-001..006)
│   └── evidence/                          # Logs, trazas de integración RLS y evidencias manuales
├── docs/                                  # Entregables académicos generados y auditados
│   ├── plan-de-pruebas-gastroforge.md     # Plan de Pruebas completo (Plantilla oficial)
│   ├── matriz-trazabilidad.md             # Matriz de Trazabilidad Bidireccional (RTM)
│   ├── reporte-bugs.md                    # Reporte Consolidado de Defectos
│   └── informe-calidad-apa.md             # Informe de Análisis de Calidad en norma APA 7
├── scripts/
│   ├── validate-qa-data.ts                # Validador de integridad referencial y reglas de negocio QA
│   └── generate-deliverables.ts           # Compilador determinista de entregables Markdown
└── src/
    ├── domain/qa-types.ts                 # Contratos estrictos TypeScript (cero uso de any)
    ├── metrics/
    │   ├── calculate-metrics.ts           # Motor puro de cálculo de KPIs y desgloses
    │   └── calculate-metrics.spec.ts      # Suite de pruebas unitarias e integridad de entregables
    ├── views/                             # Vistas modulares del Dashboard SPA
    └── App.tsx                            # Aplicación interactiva con filtros, grabador manual e impresión
```

---

## 6. Comandos de Verificación y Ejecución

Requisitos previos: **Node.js 22 LTS** y **npm**.

### 6.1 Instalar dependencias

```bash
npm install
```

### 6.2 Validar integridad referencial de los datos QA (`data/*.json`)

Verifica que el commit evaluado sea `be9089e`, que los 28 requisitos en alcance estén cubiertos al 100%, que existan exactamente 40 casos (15 manuales y 25 automatizados), que todas las evidencias en `data/evidence/` existan en disco y que no haya defectos `P1/P2` abiertos:

```bash
npm run validate:data
```

### 6.3 Regenerar determinísticamente los entregables Markdown (`docs/*.md`)

Compila `docs/plan-de-pruebas-gastroforge.md`, `docs/matriz-trazabilidad.md` y `docs/reporte-bugs.md` a partir de `data/*.json`:

```bash
npm run generate:docs
```

### 6.4 Ejecutar la suite de pruebas unitarias y de verificación documental (Vitest)

Ejecuta las pruebas del motor `calculateQaMetrics()`, la validación de contratos y las aserciones sobre los 4 documentos entregables y el informe APA 7:

```bash
npm run test
```

### 6.5 Iniciar o compilar el Dashboard Interactivo QA (React 19 + Vite + Tailwind CSS v4)

Para levantar el servidor de desarrollo local con recarga en caliente:

```bash
npm run dev
```

Para compilar y verificar tipos estrictos (`tsc -b && vite build`):

```bash
npm run build
```
