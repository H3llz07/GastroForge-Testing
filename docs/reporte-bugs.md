# REPORTE CONSOLIDADO DE DEFECTOS Y HALLAZGOS QA

**Proyecto:** GastroForge — Sistema ERP Multi-Restaurante Tablet-First  
**Commit SUT Evaluado:** `be9089e` (feat(web): add playwright tablet e2e suite and manual testing evidences (#71))  
**Repositorio QA:** [`H3llz07/GastroForge-Testing`](https://github.com/H3llz07/GastroForge-Testing)  
**Fecha de Corte:** 16/11/2026

---

## 1. Resumen Ejecutivo de Indicadores de Defectos

| Métrica de Defectos | Valor Actual | Meta / Umbral | Estado |
|---|---|---|---|
| **Total de Defectos Registrados (Históricos + Activos)** | **6** (`DEF-001` a `DEF-006`) | Trazabilidad 100% en GitHub Issues | Auditado |
| **Defectos Resueltos y Cerrados en `be9089e`** | **3** (`DEF-001`, `DEF-002`, `DEF-003`) | 100% de regresiones MVP cerradas | Cumplido |
| **Defectos Abiertos (Asignados en `be9089e`)** | **3** (`DEF-004`, `DEF-005`, `DEF-006`) | Documentados con riesgo residual | Controlado |
| **Defectos Críticos (P1) y Altos (P2) Abiertos** | **0 (P1=0, P2=0)** | = 0 para liberación | **Cumplido** |
| **Densidad de Defectos Abiertos** | **0.075 (3/40)** | < 0.10 defectos abiertos / caso | **Cumplido** |
| **Densidad Histórica Acumulada** | **0.15 (6/40)** | Métrica informativa de campaña | Registrado |
| **Tasa de Reapertura de Defectos** | **0% (0/3)** | < 5% | **Cumplido** |

## 2. Distribución por Severidad (`P1` a `P4`) y Estado

| Código | Severidad | Total | Abiertos (`Asignado`) | Cerrados (`Cerrado`) | Defectos |
|---|---|---|---|---|---|
| **P1** | Crítica | 0 | 0 | 0 | Ninguno |
| **P2** | Alta | 1 | 0 | 1 | `DEF-001` (GF-BUG-001) |
| **P3** | Media | 4 | 2 | 2 | `DEF-002` (GF-BUG-002), `DEF-003` (GF-BUG-003), `DEF-004` (GF-BUG-004), `DEF-005` (GF-BUG-005) |
| **P4** | Baja | 1 | 1 | 0 | `DEF-006` (GF-BUG-006) |

---

## 3. Catálogo Maestro de Defectos y Trazabilidad a GitHub Issues

| ID Académico | Código Externo | GitHub Issue | Caso de Prueba | Módulo | Severidad | Prioridad | Estado | Título |
|---|---|---|---|---|---|---|---|---|
| `DEF-001` | `GF-BUG-001` | [Issue #9](https://github.com/H3llz07/GastroForge-Testing/issues/9) | `CP-CSH-003` | `cash` | Alta (P2) | Alta | **Cerrado** | Fallo de bloqueo pesimista SELECT FOR UPDATE sobre tabla append-only payment bajo rol app_user |
| `DEF-002` | `GF-BUG-002` | [Issue #10](https://github.com/H3llz07/GastroForge-Testing/issues/10) | `CP-REP-003` | `reports` | Media (P3) | Media | **Cerrado** | Desajuste de proyección de campos firstName/lastName y cashierId en exportación CSV de reportes |
| `DEF-003` | `GF-BUG-003` | [Issue #11](https://github.com/H3llz07/GastroForge-Testing/issues/11) | `CP-CSH-005` | `cash` | Media (P3) | Media | **Cerrado** | Lectura de propiedad err.problem en lugar de err.detail (RFC 7807) en componentes de caja y reportes |
| `DEF-004` | `GF-BUG-004` | [Issue #12](https://github.com/H3llz07/GastroForge-Testing/issues/12) | `CP-AUTH-006` | `auth` | Media (P3) | Media | **Asignado** | Rol MESERO posee permisos kitchen:read y kitchen:advance_status sin filtro de estación en can.helper.ts |
| `DEF-005` | `GF-BUG-005` | [Issue #13](https://github.com/H3llz07/GastroForge-Testing/issues/13) | `CP-ORD-006` | `orders` | Media (P3) | Media | **Asignado** | Discrepancia entre PRD.md y can.helper.ts sobre el permiso del rol CAJERO para abrir órdenes (orders:create) |
| `DEF-006` | `GF-BUG-006` | [Issue #14](https://github.com/H3llz07/GastroForge-Testing/issues/14) | `CP-ORD-001` | `orders` | Baja (P4) | Baja | **Asignado** | Inconsistencia documental en el umbral mínimo de objetivos táctiles (48x48 px vs 44x44 px) |

---

## 4. Fichas Técnicas Detalladas (DEF-001 a DEF-006)

### DEF-001 (GF-BUG-001) — Fallo de bloqueo pesimista SELECT FOR UPDATE sobre tabla append-only payment bajo rol app_user

| Campo | Detalle |
|---|---|
| **ID del defecto** | `DEF-001` / `GF-BUG-001` — [GitHub Issue #9](https://github.com/H3llz07/GastroForge-Testing/issues/9) |
| **Título** | Fallo de bloqueo pesimista SELECT FOR UPDATE sobre tabla append-only payment bajo rol app_user |
| **Caso de prueba relacionado** | `CP-CSH-003` |
| **Módulo afectado** | `cash` |
| **Severidad** | [ ] Crítica (P1)  [x] Alta (P2)  [ ] Media (P3)  [ ] Baja (P4) |
| **Prioridad** | [x] Alta  [ ] Media  [ ] Baja |
| **Estado** | [ ] Nuevo  [ ] Asignado  [ ] En progreso  [ ] Resuelto  [x] Cerrado |
| **Descripción** | Al procesar un cobro de orden bajo el rol PostgreSQL no privilegiado app_user (ADR-0002 / ADR-0006), la consulta ejecutaba SELECT ... FOR UPDATE sobre la tabla append-only payment. Dado que PostgreSQL exige privilegio UPDATE para adquirir bloqueos de fila FOR UPDATE y dicho privilegio está revocado por política de inmutabilidad financiera, la transacción abortaba con error SQL 42501 (permission denied for table payment). |
| **Pasos para reproducir** | 1. Conectar la suite de integración con el rol PostgreSQL app_user (rolbypassrls = false, sin privilegios UPDATE/DELETE sobre tablas append-only).<br>2. Abrir una sesión de caja en CAJA-PRINCIPAL y una orden DINE_IN activa con saldo pendiente de $80.000.<br>3. Emitir POST /api/v1/orders/:orderId/payments con monto válido ($50.000 CASH) y cabecera Idempotency-Key. |
| **Resultado esperado** | El cobro debe adquirir bloqueo pesimista únicamente sobre el agregado raíz mutable restaurant_order, insertar el registro inmutable en payment y retornar HTTP 201 Created. |
| **Resultado obtenido** | En la validación previa a la corrección, PostgreSQL rechazaba la sentencia FOR UPDATE sobre payment con error 42501 (permission denied for table payment). Corregido y verificado en el commit be9089e manteniendo el bloqueo FOR UPDATE exclusivamente sobre restaurant_order. |
| **Evidencia** | `EVID-DEF-001-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de regresión de DEF-001 en apps/api/test/cash-payments.int-spec.ts bajo rol app_user.<br>`EVID-DEF-001-2` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Evidencia documentada en docs/testing/EVIDENCIAS-PRUEBAS-MANUALES.md (DEF-01) y verificada en commit be9089e.<br>GitHub Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/9](https://github.com/H3llz07/GastroForge-Testing/issues/9) |
| **Entorno** | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| **Reportado por** | Julián Santiago Pico Pinzón (@H3llz07) |
| **Fecha de reporte** | 15/11/2026 |
| **Asignado a** | Jhonatan A. Méndez R. (@JhonatanM2005) |
| **Fecha de resolución** | 15/11/2026 |

### DEF-002 (GF-BUG-002) — Desajuste de proyección de campos firstName/lastName y cashierId en exportación CSV de reportes

| Campo | Detalle |
|---|---|
| **ID del defecto** | `DEF-002` / `GF-BUG-002` — [GitHub Issue #10](https://github.com/H3llz07/GastroForge-Testing/issues/10) |
| **Título** | Desajuste de proyección de campos firstName/lastName y cashierId en exportación CSV de reportes |
| **Caso de prueba relacionado** | `CP-REP-003` |
| **Módulo afectado** | `reports` |
| **Severidad** | [ ] Crítica (P1)  [ ] Alta (P2)  [x] Media (P3)  [ ] Baja (P4) |
| **Prioridad** | [ ] Alta  [x] Media  [ ] Baja |
| **Estado** | [ ] Nuevo  [ ] Asignado  [ ] En progreso  [ ] Resuelto  [x] Cerrado |
| **Descripción** | En ReportsExportService, la consulta de exportación CSV intentaba proyectar un campo compuesto inexistente en el modelo User de Prisma en lugar de firstName + lastName y referenciaba un alias distinto para cashierId en Payment, provocando error al generar el stream CSV de ventas. |
| **Pasos para reproducir** | 1. Autenticarse como usuario con rol ADMIN o GERENTE en un tenant con órdenes cobradas.<br>2. Invocar GET /api/v1/reports/sales/export.csv con un rango de fechas válido (from y to).<br>3. Inspeccionar la proyección de columnas del cajero en el stream CSV generado. |
| **Resultado esperado** | El servicio debe concatenar User.firstName y User.lastName y vincular Payment.cashierId correctamente, emitiendo el archivo CSV con BOM UTF-8 (\uFEFF) y mitigación de CSV Formula Injection. |
| **Resultado obtenido** | Fallaba la proyección Prisma antes de la corrección. Resuelto y validado en commit be9089e en ReportsExportService y reports-export.int-spec.ts. |
| **Evidencia** | `EVID-DEF-002-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de regresión de DEF-002 en apps/api/test/reports-export.int-spec.ts sobre commit be9089e.<br>`EVID-DEF-002-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de src/modules/reports/domain/reports-export.helper.spec.ts.<br>GitHub Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/10](https://github.com/H3llz07/GastroForge-Testing/issues/10) |
| **Entorno** | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| **Reportado por** | Julián Santiago Pico Pinzón (@H3llz07) |
| **Fecha de reporte** | 15/11/2026 |
| **Asignado a** | Julián Santiago Pico Pinzón (@H3llz07) |
| **Fecha de resolución** | 15/11/2026 |

### DEF-003 (GF-BUG-003) — Lectura de propiedad err.problem en lugar de err.detail (RFC 7807) en componentes de caja y reportes

| Campo | Detalle |
|---|---|
| **ID del defecto** | `DEF-003` / `GF-BUG-003` — [GitHub Issue #11](https://github.com/H3llz07/GastroForge-Testing/issues/11) |
| **Título** | Lectura de propiedad err.problem en lugar de err.detail (RFC 7807) en componentes de caja y reportes |
| **Caso de prueba relacionado** | `CP-CSH-005` |
| **Módulo afectado** | `cash` |
| **Severidad** | [ ] Crítica (P1)  [ ] Alta (P2)  [x] Media (P3)  [ ] Baja (P4) |
| **Prioridad** | [ ] Alta  [x] Media  [ ] Baja |
| **Estado** | [ ] Nuevo  [ ] Asignado  [ ] En progreso  [ ] Resuelto  [x] Cerrado |
| **Descripción** | Los componentes frontend de los módulos cash y reports accedían a err.problem sobre instancias de ApiProblemError cuando el contrato estándar RFC 7807 expone el mensaje legible para el usuario en err.detail, mostrando un banner vacío o genérico ante rechazos de negocio (400/409/422). |
| **Pasos para reproducir** | 1. Abrir la vista /cashier en viewport tablet 1024x768 con una orden activa de saldo pendiente $45.000.<br>2. Intentar registrar un pago con tarjeta por monto superior ($60.000) para provocar un rechazo HTTP 422.<br>3. Observar el mensaje de error renderizado en el componente AlertBanner. |
| **Resultado esperado** | AlertBanner debe mostrar el texto exacto de err.detail devuelto por el backend en formato application/problem+json (RFC 7807). |
| **Resultado obtenido** | Antes de la corrección se leía err.problem (undefined). Estandarizado con err.detail y verificado en commit be9089e tanto en pruebas unitarias frontend como en validación manual. |
| **Evidencia** | `EVID-DEF-003-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Verificación manual en /cashier de renderizado de err.detail en AlertBanner (DEF-03 en EVIDENCIAS-PRUEBAS-MANUALES.md).<br>`EVID-DEF-003-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de app/lib/api/problem-details.test.ts y app/lib/api/client.test.ts.<br>GitHub Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/11](https://github.com/H3llz07/GastroForge-Testing/issues/11) |
| **Entorno** | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| **Reportado por** | Julián Santiago Pico Pinzón (@H3llz07) |
| **Fecha de reporte** | 15/11/2026 |
| **Asignado a** | Jhonatan A. Méndez R. (@JhonatanM2005) |
| **Fecha de resolución** | 15/11/2026 |

### DEF-004 (GF-BUG-004) — Rol MESERO posee permisos kitchen:read y kitchen:advance_status sin filtro de estación en can.helper.ts

| Campo | Detalle |
|---|---|
| **ID del defecto** | `DEF-004` / `GF-BUG-004` — [GitHub Issue #12](https://github.com/H3llz07/GastroForge-Testing/issues/12) |
| **Título** | Rol MESERO posee permisos kitchen:read y kitchen:advance_status sin filtro de estación en can.helper.ts |
| **Caso de prueba relacionado** | `CP-AUTH-006` |
| **Módulo afectado** | `auth` |
| **Severidad** | [ ] Crítica (P1)  [ ] Alta (P2)  [x] Media (P3)  [ ] Baja (P4) |
| **Prioridad** | [ ] Alta  [x] Media  [ ] Baja |
| **Estado** | [ ] Nuevo  [x] Asignado  [ ] En progreso  [ ] Resuelto  [ ] Cerrado |
| **Descripción** | En apps/api/src/modules/auth/domain/can.helper.ts (líneas 68-77) del commit be9089e, el conjunto MESERO_ACTIONS incluye las acciones 'kitchen:read' y 'kitchen:advance_status' sin exigir validación de stationId, mientras que la Matriz de Capacidades de PRD.md (§2.1, líneas 89-90) y la Tabla de Decisión de TESTING-PLAN.md (§2.2, línea 120) establecen que Mesero NO tiene permiso para ver la cola KDS ni avanzar estados de preparación (Preparing/Ready). |
| **Pasos para reproducir** | 1. Inspeccionar apps/api/src/modules/auth/domain/can.helper.ts líneas 68-77 en el commit be9089e.<br>2. Evaluar can({ userId: 'u-4', memberId: 'm-4', role: 'MESERO' }, 'kitchen:advance_status').<br>3. Comparar el resultado booleano contra la tabla de decisión de TESTING-PLAN.md (§2.2) y PRD.md (§2.1). |
| **Resultado esperado** | can(mesero, 'kitchen:advance_status') debe retornar false (o existir una acción separada 'orders:mark_served' exclusiva para pasar de READY a SERVED sin permitir avanzar estados internos de cocina). |
| **Resultado obtenido** | can(mesero, 'kitchen:advance_status') retorna true para cualquier estación sin restricción de stationId. |
| **Evidencia** | `EVID-DEF-004-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Auditoría de código en apps/api/src/modules/auth/domain/can.helper.ts#L68-L77 frente a PRD.md §2.1 y TESTING-PLAN.md §2.2.<br>`EVID-DEF-004-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución de src/modules/auth/domain/can.helper.spec.ts y hallazgo de exceso de permisos en MESERO_ACTIONS.<br>GitHub Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/12](https://github.com/H3llz07/GastroForge-Testing/issues/12) |
| **Entorno** | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| **Reportado por** | Jhonatan A. Méndez R. (@JhonatanM2005) |
| **Fecha de reporte** | 16/11/2026 |
| **Asignado a** | Jhonatan A. Méndez R. (@JhonatanM2005) |
| **Fecha de resolución** | Pendiente (Abierto en commit be9089e) |

### DEF-005 (GF-BUG-005) — Discrepancia entre PRD.md y can.helper.ts sobre el permiso del rol CAJERO para abrir órdenes (orders:create)

| Campo | Detalle |
|---|---|
| **ID del defecto** | `DEF-005` / `GF-BUG-005` — [GitHub Issue #13](https://github.com/H3llz07/GastroForge-Testing/issues/13) |
| **Título** | Discrepancia entre PRD.md y can.helper.ts sobre el permiso del rol CAJERO para abrir órdenes (orders:create) |
| **Caso de prueba relacionado** | `CP-ORD-006` |
| **Módulo afectado** | `orders` |
| **Severidad** | [ ] Crítica (P1)  [ ] Alta (P2)  [x] Media (P3)  [ ] Baja (P4) |
| **Prioridad** | [ ] Alta  [x] Media  [ ] Baja |
| **Estado** | [ ] Nuevo  [x] Asignado  [ ] En progreso  [ ] Resuelto  [ ] Cerrado |
| **Descripción** | Existe una contradicción entre la especificación de requisitos de producto y la implementación de dominio en el commit be9089e: PRD.md (§2.1, línea 86) especifica que el rol Cajero SÍ puede 'Abrir orden / cuenta (Mesa o Para Llevar)', pero CAJERO_ACTIONS en apps/api/src/modules/auth/domain/can.helper.ts (líneas 79-86) y can.helper.spec.ts (línea 47) deniegan 'orders:create' al rol CAJERO. |
| **Pasos para reproducir** | 1. Revisar docs/prd/PRD.md §2.1 (Matriz de capacidades por rol en MVP, fila 'Abrir orden / cuenta').<br>2. Ejecutar o inspeccionar apps/api/src/modules/auth/domain/can.helper.spec.ts línea 47: expect(can(cajero, 'orders:create')).toBe(false).<br>3. Verificar el mismo comportamiento en el cliente web en apps/web/app/features/auth/domain/can.test.ts. |
| **Resultado esperado** | Alineación unívoca entre PRD.md, TESTING-PLAN.md y can.helper.ts respecto a si el Cajero puede crear órdenes TAKEOUT/mostrador o si dicha capacidad es exclusiva de Mesero/Gerente/Admin. |
| **Resultado obtenido** | PRD.md declara Sí para Cajero mientras que can.helper.ts y TESTING-PLAN.md retornan false (No). |
| **Evidencia** | `EVID-DEF-005-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Inspección normativa de CAJERO_ACTIONS en can.helper.ts y can.test.ts frente a PRD.md §2.1.<br>`EVID-DEF-005-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución de apps/web/app/features/auth/domain/can.test.ts y apps/api/src/modules/auth/domain/can.helper.spec.ts.<br>GitHub Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/13](https://github.com/H3llz07/GastroForge-Testing/issues/13) |
| **Entorno** | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| **Reportado por** | Julián Santiago Pico Pinzón (@H3llz07) |
| **Fecha de reporte** | 16/11/2026 |
| **Asignado a** | Julián Santiago Pico Pinzón (@H3llz07) |
| **Fecha de resolución** | Pendiente (Abierto en commit be9089e) |

### DEF-006 (GF-BUG-006) — Inconsistencia documental en el umbral mínimo de objetivos táctiles (48x48 px vs 44x44 px)

| Campo | Detalle |
|---|---|
| **ID del defecto** | `DEF-006` / `GF-BUG-006` — [GitHub Issue #14](https://github.com/H3llz07/GastroForge-Testing/issues/14) |
| **Título** | Inconsistencia documental en el umbral mínimo de objetivos táctiles (48x48 px vs 44x44 px) |
| **Caso de prueba relacionado** | `CP-ORD-001` |
| **Módulo afectado** | `orders` |
| **Severidad** | [ ] Crítica (P1)  [ ] Alta (P2)  [ ] Media (P3)  [x] Baja (P4) |
| **Prioridad** | [ ] Alta  [ ] Media  [x] Baja |
| **Estado** | [ ] Nuevo  [x] Asignado  [ ] En progreso  [ ] Resuelto  [ ] Cerrado |
| **Descripción** | El plan maestro de pruebas del SUT (docs/testing/TESTING-PLAN.md §1 Nivel 6 y §5.1 Guion M-01) exige botones y selectores táctiles con dimensiones mínimas de 48x48 px (min-h-[48px] min-w-[48px]), mientras que PRD.md (§1.2), EVIDENCIAS-PRUEBAS-MANUALES.md y la suite E2E tablet-golden-path.e2e.spec.ts implementan y validan el umbral WCAG 2.5.5 AAA de 44x44 px (min-h-[44px]). |
| **Pasos para reproducir** | 1. Comparar docs/testing/TESTING-PLAN.md líneas 87 y 264 (48x48 px) contra docs/prd/PRD.md línea 35 y docs/testing/EVIDENCIAS-PRUEBAS-MANUALES.md líneas 22 y 33-35 (44px).<br>2. Inspeccionar las clases Tailwind min-h-[44px] en los componentes táctiles de apps/web en viewport 1024x768. |
| **Resultado esperado** | Criterio único de ergonomía táctil (44x44 px o 48x48 px) armonizado entre PRD.md, TESTING-PLAN.md y las aserciones automatizadas de Playwright. |
| **Resultado obtenido** | Los componentes cumplen >= 44x44 px (aprobando las aserciones de Playwright), pero algunos controles secundarios están entre 44px y 47px, por debajo de los 48px citados en TESTING-PLAN.md. |
| **Evidencia** | `EVID-DEF-006-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Ejecución del Guion M-01 en 1024x768 y registro de la discrepancia documental menor DEF-006 (44x44 px vs 48x48 px).<br>GitHub Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/14](https://github.com/H3llz07/GastroForge-Testing/issues/14) |
| **Entorno** | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| **Reportado por** | Julián Santiago Pico Pinzón (@H3llz07) |
| **Fecha de reporte** | 16/11/2026 |
| **Asignado a** | Jhonatan A. Méndez R. (@JhonatanM2005) |
| **Fecha de resolución** | Pendiente (Abierto en commit be9089e) |
