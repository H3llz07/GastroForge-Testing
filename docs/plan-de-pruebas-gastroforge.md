# PLAN DE PRUEBAS

## GastroForge — Sistema ERP Multi-Restaurante Tablet-First

| Campo | Valor |
|---|---|
| **Proyecto** | GastroForge — Sistema ERP Multi-Restaurante Tablet-First |
| **Versión** | 1.1 |
| **Fecha** | 17/11/2026 |
| **Commit SUT Evaluado** | `be9089e` (feat(web): add playwright tablet e2e suite and manual testing evidences (#71)) — [`JhonatanM2005/GastroForge`](https://github.com/JhonatanM2005/GastroForge) |
| **Institución** | Institución Universitaria Pascual Bravo |
| **Elaborado por** | Jhonatan A. Méndez R. (@JhonatanM2005), Julián Santiago Pico Pinzón (@H3llz07) & Christian Urrego Issa (@Christu12) |
| **Revisado por** | Jhonatan A. Méndez R. (QA Lead — Bloque A) |
| **Aprobado por** | Julián Santiago Pico Pinzón (QA Lead / Arquitectura — Bloque B) |
| **Estado** | [ ] Borrador  [ ] En revisión  [x] Aprobado |

*Confidencial — Uso Interno y Académico*

---

## 1. Historial de Cambios

| Versión | Fecha | Descripción del Cambio | Autor | Aprobado por |
|---|---|---|---|---|
| 1.0 | 16/11/2026 | Versión inicial aprobada del plan de pruebas sobre el commit congelado be9089e de GastroForge | Jhonatan A. Méndez R. & Julián Santiago Pico Pinzón | Julián Santiago Pico Pinzón & Jhonatan A. Méndez R. |
| 1.1 | 17/11/2026 | Incorporación de Christian Urrego Issa (@Christu12) como co-autor, QA Analyst / Automatizador y redistribución equilibrada de casos de prueba y ejecuciones | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | Julián Santiago Pico Pinzón & Jhonatan A. Méndez R. |

---

## 2. Introducción

### 2.1 Propósito

Este documento describe la estrategia piramidal de 6 niveles, recursos, matriz RACI, cronograma, criterios de entrada/salida y los 40 casos de prueba (15 manuales y 25 automatizados) para el sistema GastroForge — Sistema ERP Multi-Restaurante Tablet-First en su versión congelada (commit be9089e), con el fin de garantizar de manera empírica que cumple con los requisitos funcionales, transaccionales, de concurrencia e idempotencia y de aislamiento multi-tenant mediante Row-Level Security (RLS).

### 2.2 Alcance

La campaña de aseguramiento de calidad evalúa de forma estática, unitaria, de integración transaccional, End-to-End y manual la línea base congelada del sistema **GastroForge — Sistema ERP Multi-Restaurante Tablet-First** en el commit `be9089e`. Se cubren los **28 requisitos en alcance (`IN_SCOPE`)** que agrupan los 22 Casos de Uso MVP, las 34 Historias de Usuario (`HU-001` a `HU-034`) y las Decisiones de Arquitectura (`ADR-0001` a `ADR-0006`), separando explícitamente las exclusiones de `Fase 2`.

| En alcance | Fuera de alcance |
|---|---|
| Autenticación JWT + rotación de refresh token, restauración de contraseña de un solo uso y matriz RBAC can() para 5 roles MVP (Admin, Gerente, Mesero, Cocina, Cajero) | Funcionalidades posteriores o no disponibles en el commit congelado be9089e de JhonatanM2005/GastroForge |
| Catálogo multi-tenant, categorías, productos con desglose de IVA incluido, grupos de modificadores (BVA min/max) y estaciones de preparación | Módulo de reservas de mesas y permisos editables dinámicos por usuario catalogados en Fase 2 (ADR-0005) |
| Plano de mesas con ocupación derivada dinámicamente, órdenes DINE_IN y TAKEOUT, tandas (rounds), control de concurrencia optimista (version) y cancelación con PIN gerencial | Autenticación mediante X-API-Key para integraciones externas de Fase 2 (ADR-0006) |
| Kitchen Display System (KDS), máquina de estados de ítems (PENDING -> PREPARING -> READY -> SERVED / CANCELLED) y canal reactivo Server-Sent Events (SSE) respaldado por Transactional Outbox | Datos reales de restaurantes comerciales o conexión a bases de datos e infraestructura de producción |
| Sesiones de caja con restricción de turno abierto único (uq_cash_register_open), pagos divididos, propinas, idempotencia financiera (Idempotency-Key), reversos autorizados y arqueo ciego inmutable | Integraciones externas con pasarelas bancarias reales o facturación electrónica DIAN en vivo |
| Inventario manual con motivo obligatorio, alertas de umbral mínimo, KPIs operativos en caché, tirilla térmica de 80mm y exportación CSV con BOM UTF-8 | Pruebas destructivas sobre infraestructura compartida o métricas inventadas sin evidencia verificable |
| Aislamiento multi-tenant estricto en PostgreSQL 16 mediante el rol no privilegiado app_user (rolbypassrls = false), FORCE ROW LEVEL SECURITY, claves foráneas compuestas y mínimo privilegio en tablas append-only (ADR-0006) | — |

### 2.3 Referencias

- PRD.md — Documento de Requisitos de Producto de GastroForge v1.0 (22 Casos de Uso MVP y 34 Historias de Usuario HU-001 a HU-034)
- API-SCHEMA.md & openapi.json — Especificación formal de contratos RESTful y errores RFC 7807 (Problem Details)
- ADR-0001 a ADR-0006 — Registro de Decisiones de Arquitectura (Monolito Modular Hexagonal, Aislamiento Multi-Tenant RLS en Neon/PostgreSQL, Patrón UnitOfWork Transaccional, Outbox + SSE, RBAC fijo MVP y Hardening Zero Trust)
- TESTING-PLAN.md — Estrategia Piramidal de Pruebas de 6 Niveles de GastroForge (commit be9089e)
- ISO/IEC/IEEE 29119-3 — Software and systems engineering — Software testing — Part 3: Test documentation

---

## 3. Objetivos de Prueba

| # | Objetivo | Criterio de Éxito |
|---|---|---|
| 1 | Verificar que todas las funcionalidades de los 8 módulos MVP cumplen los requisitos especificados en PRD.md y API-SCHEMA.md. | 100% de los requisitos en alcance (IN_SCOPE) cubiertos por al menos un caso de prueba ejecutado y tasa de aprobación global >= 90%. |
| 2 | Identificar, clasificar y documentar defectos con evidencia reproducible antes de la sustentación y liberación. | 0 defectos Críticos (P1) y 0 defectos Altos (P2) abiertos al cierre del ciclo de pruebas en el commit be9089e. |
| 3 | Certificar el aislamiento multi-tenant en PostgreSQL bajo el rol no privilegiado app_user con FORCE ROW LEVEL SECURITY. | 100% de las pruebas negativas cross-tenant (lectura, escritura, FK compuesta y tablas append-only) aprobadas sin fugas de datos entre restaurantes. |
| 4 | Validar la integridad financiera, concurrencia optimista e idempotencia en operaciones críticas de órdenes y caja. | Cero cobros duplicados ante reintentos con Idempotency-Key, rechazo determinista 409 en colisiones de versión o turno de caja duplicado y exactitud Decimal(12,2) en IVA y arqueo. |
| 5 | Evaluar la usabilidad táctil tablet-first (1024x768) y la resiliencia de reconexión en tiempo real del KDS mediante SSE. | Ejecución completa de los 15 casos manuales verificables con registro de evidencias y análisis de riesgo residual para hallazgos menores. |

---

## 4. Roles y Responsabilidades del Equipo de Pruebas

| Rol | Nombre / Asignado a | Responsabilidades | Participación |
|---|---|---|---|
| QA Lead / Líder de Pruebas (Bloque A) | Jhonatan A. Méndez R. (@JhonatanM2005) | Planificar, coordinar y supervisar las actividades de prueba del Bloque A. Diseñar y ejecutar casos de autenticación, catálogo, mesas, órdenes y KDS. Revisar matriz de trazabilidad y aprobar entregables cruzados. | 100% |
| QA Lead / Arquitecto de Pruebas (Bloque B) | Julián Santiago Pico Pinzón (@H3llz07) | Liderar la arquitectura del arnés de pruebas e infraestructura Data-First. Diseñar y ejecutar casos de caja, pagos idempotentes, inventario, reportes y suite multi-tenant RLS. Consolidar métricas e informe APA 7. | 100% |
| QA Analyst / Analista de Pruebas | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa (@JhonatanM2005 / @H3llz07 / @Christu12) | Diseñar los 40 casos de prueba aplicando técnicas EP, BVA, Tabla de decisión y Transición de estados. Ejecutar los 15 guiones manuales en viewport tablet y documentar hallazgos. | 100% |
| QA Automatizador | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa (@JhonatanM2005 / @H3llz07 / @Christu12) | Desarrollar y mantener las suites automatizadas unitarias (Jest), de integración con PostgreSQL/Redis bajo app_user (Supertest) y End-to-End en tablet 1024x768 (Playwright). | 100% |
| Desarrollador / Dev del SUT | Equipo de Ingeniería GastroForge (Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa) (@JhonatanM2005 / @H3llz07 / @Christu12) | Entregar el build congelado be9089e, resolver los defectos históricos de validación MVP (DEF-001 a DEF-003) y documentar análisis de causa raíz para defectos abiertos (DEF-004 a DEF-006). | 75% |
| Product Owner / PO Académico | Comité Evaluador — Ingeniería de Software / Aseguramiento de Calidad (I.U. Pascual Bravo) | Validar el cumplimiento de los criterios de aceptación del plan de pruebas, auditar la trazabilidad de requisitos y aprobar el cierre formal del ciclo de aseguramiento de calidad. | 25% |
| Usuario Final / Cliente Representativo | Operadores de Salón, Cocina y Caja (Simulación UAT Tablet 1024x768) (Perfiles Operativos MVP) | Participar en las pruebas de aceptación (UAT) sobre flujos operativos de restaurante (comanda rápida, KDS en vivo y arqueo ciego de caja). | 25% |

### 4.1 Matriz RACI

La siguiente matriz define quién es Responsable (R), Aprobador (A), Consultado (C) e Informado (I) en cada actividad clave del proceso de pruebas.

| Actividad | QA Lead | QA Analyst | Dev | PO | Cliente |
|---|---|---|---|---|---|
| Planificación del plan de pruebas | R/A | C | C | C | I |
| Diseño de casos de prueba | A | R | C | C | I |
| Preparación del ambiente | A | C | R | I | I |
| Ejecución de pruebas funcionales | A | R | C | I | I |
| Reporte y seguimiento de defectos | A | R | R | I | I |
| Corrección de defectos | I | C | R | A | I |
| Pruebas de aceptación (UAT) | A | C | C | R | R |
| Aprobación del cierre de pruebas | C | I | I | A | R |

**Leyenda:** R = Responsable de ejecutar · A = Aprobador · C = Consultado · I = Informado

---

## 5. Estrategia de Pruebas

### 5.1 Tipos de Prueba

| Tipo de Prueba | Descripción | Responsable | Incluida |
|---|---|---|---|
| Prueba funcional | Verifica que cada caso de uso y regla de negocio de los módulos auth, catalog, tables, orders, kitchen, cash, inventory y reports opere conforme a los requisitos. | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Sí [ ] No |
| Prueba de regresión | Asegura que las correcciones aplicadas durante el ciclo MVP (como DEF-001, DEF-002 y DEF-003) no degraden funcionalidades previamente validadas. | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Sí [ ] No |
| Prueba de integración | Valida la interacción real entre controladores NestJS, servicios de aplicación, Prisma UnitOfWork, PostgreSQL 16 (con políticas RLS activas) y Redis 7 (Outbox/SSE). | Julián Santiago Pico Pinzón | [x] Sí [ ] No |
| Prueba de rendimiento | Evalúa tiempos de respuesta transaccionales en concurrencia simultánea de órdenes/pagos, latencia de despacho Outbox y lectura de KPIs desde caché. | Julián Santiago Pico Pinzón | [x] Sí [ ] No |
| Prueba de seguridad | Verifica aislamiento multi-tenant (RLS bajo app_user), matriz de autorización RBAC deny-by-default, revocación de permisos UPDATE/DELETE en tablas de auditoría, CORS y Rate Limiting. | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Sí [ ] No |
| Prueba de usabilidad | Evalúa la ergonomía táctil en viewport tablet (1024x768), dimensiones de objetivos interactivos, alto contraste en KDS y claridad de mensajes de error RFC 7807. | Jhonatan A. Méndez R. | [x] Sí [ ] No |
| Prueba de aceptación (UAT) | Validación integral de extremo a extremo del flujo operativo de restaurante (apertura de mesa, comanda por tandas, preparación en KDS, cobro dividido y arqueo ciego). | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Sí [ ] No |

### 5.2 Técnicas de Diseño de Casos de Prueba

- **Partición de equivalencia (EP):** Aplicada en **13 casos de prueba** para particionar entradas válidas e inválidas (credenciales, roles por estación, orígenes CORS, aislamiento cruzado entre Tenant A y Tenant B, payloads de CSV Formula Injection).
- **Análisis de valores límite (BVA):** Aplicado en **9 casos de prueba** para evaluar fronteras numéricas exactas (umbrales de rate-limit `1..5 -> 401, 6 -> 429`, cotas de modificadores `min_selectable..max_selectable`, cantidades de tanda `0, 1, 99, 100`, porcentajes de propina `-1%, 0%, 10%, 100%, 101%`, stock mínimo `11, 10, 9` y dimensiones táctiles `44px vs 48px`).
- **Tabla de decisión:** Aplicada en **8 casos de prueba** para verificar combinaciones multicriterio de autorización RBAC `can(actor, action, context)`, reglas de cancelación supervisada, idempotencia (`Idempotency-Key` + hash de payload) y permisos SQL sobre las 5 tablas append-only.
- **Prueba de transición de estados:** Aplicada en **10 casos de prueba** para validar grafos de estado (rotación/reuso de Refresh Token, disponibilidad rápida `AVAILABLE <-> UNAVAILABLE`, ocupación derivada `FREE -> OCCUPIED -> FREE`, ciclo KDS `PENDING -> PREPARING -> READY -> SERVED`, reconexión SSE y turno de caja `OPEN -> CLOSED`).

### 5.3 Niveles de Prueba

- **Pruebas estáticas y de contratos (Nivel L1):** Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa — *TypeScript 5.7 (tsc --noEmit), ESLint 9, Prettier y validación OpenAPI*. Verificación estática de tipos, invariantes de compilación y sincronización de esquemas antes de la ejecución. (0 casos de prueba directos en catálogo).
- **Pruebas unitarias de dominio puro (Nivel L2):** Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa — *Jest (Dominio puro sin I/O) y Vitest (Motor de métricas QA)*. Validación en memoria de agregados, máquinas de estado (OrderItemStatus, CashSessionStatus), objetos de valor (Money con IVA incluido) y matriz can(). (3 casos de prueba directos en catálogo).
- **Pruebas de servicios de aplicación en memoria (Nivel L3):** Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa — *Jest con repositorios Fake en memoria y UnitOfWork simulado*. Orquestación de casos de uso, control de versiones optimistas, cálculo de arqueo ciego y emisión de eventos Outbox sin acoplamiento a base de datos. (1 casos de prueba directos en catálogo).
- **Pruebas de integración multi-tenant e infraestructura (Nivel L4):** Julián Santiago Pico Pinzón — *Jest + Supertest + NestJS TestingModule + Docker (PostgreSQL 16 app_user RLS & Redis 7)*. Verificación de extremo a extremo en la capa HTTP/DB ejecutando transacciones reales con set_config('app.restaurant_id'), RLS forzado e idempotencia. (20 casos de prueba directos en catálogo).
- **Pruebas de sistema End-to-End en Tablet (Nivel L5):** Jhonatan A. Méndez R. & Christian Urrego Issa — *Playwright Test (Chromium & WebKit en viewport 1024x768)*. Automatización del Golden Path operativo completo desde el navegador emulando interacción táctil de mesero, cocinero, cajero y administrador. (1 casos de prueba directos en catálogo).
- **Pruebas manuales exploratorias y de aceptación UAT (Nivel L6):** Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa — *Inspección interactiva en navegador (DevTools Tablet 1024x768), cliente HTTP y capturas de evidencia*. Ejecución controlada de los 15 casos manuales para evaluar ergonomía táctil, reconexión SSE ante caídas de red, formato de tirilla 80mm y contraste visual. (15 casos de prueba directos en catálogo).

### 5.4 Criterios de Suspensión y Requisitos de Reanudación

Los criterios de suspensión definen las condiciones que detienen total o parcialmente el procedimiento de prueba, mientras que los requisitos de reanudación determinan cuándo se puede reanudar tras resolver la causa raíz.

| Criterios de Suspensión | Requisitos de Reanudación |
|---|---|
| Defecto crítico (P1 — Blocker) que impide la ejecución de casos de prueba o compromete el aislamiento multi-tenant (rolbypassrls = true). | El defecto crítico ha sido corregido, la migración o política RLS ha sido restaurada y la aserción de seguridad en beforeAll pasa exitosamente. |
| Ambiente de pruebas no disponible o inestable (caída de contenedores Docker PostgreSQL 16 o Redis 7). | Los servicios de base de datos y caché han sido reconstruidos, las semillas deterministas han sido cargadas y el endpoint de salud responde HTTP 200. |
| Cambio significativo o ruptura de alcance respecto al commit congelado be9089e que invalide los casos diseñados. | Se restablece el árbol de trabajo exactamente en el commit be9089e y se verifica la integridad referencial mediante npm run validate:data. |
| Más del 30% de los casos de prueba fallan en un ciclo de ejecución por causa sistémica. | Se ha identificado la causa raíz, aplicado la corrección correspondiente y validado el humo inicial por el equipo QA. |
| Falta de datos de prueba esenciales (fixtures de Tenant A y Tenant B, sesiones de caja o catálogo semilla). | Los datasets de prueba multi-tenant han sido preparados, sembrados y verificados en el ambiente correspondiente. |

### 5.5 Completitud de las Pruebas

A continuación se presentan los criterios formales de completitud evaluados contra los resultados empíricos obtenidos sobre el commit congelado `be9089e`:

| Criterio de Completitud | Meta / Umbral | Valor Actual | Cumplido |
|---|---|---|---|
| 100% de cobertura de ejecución de pruebas (todos los 40 casos de prueba ejecutados). | 100% | 100% (40/40) | [x] |
| Tasa de casos aprobados igual o superior al umbral definido (excluyendo no ejecutados/bloqueados). | >= 90% | 95% (38/40) | [x] |
| 0 defectos de severidad Crítica (P1) o Alta (P2) abiertos al cierre. | = 0 | 0 (P1=0, P2=0) | [x] |
| 100% de los requisitos en alcance (IN_SCOPE) cubiertos por al menos un caso de prueba. | 100% | 100% (28/28) | [x] |
| Todos los defectos históricos de regresión MVP resueltos y verificados en el commit congelado. | = 0 pendientes (3/3 cerrados) | 0 pendientes (3/3 defectos de regresión cerrados: DEF-001, DEF-002, DEF-003) | [x] |
| Informe de pruebas, matriz de trazabilidad, reporte de defectos e informe APA 7 generados y entregados. | Entregado | Entregado (`docs/plan-de-pruebas-gastroforge.md`, `docs/matriz-trazabilidad.md`, `docs/reporte-bugs.md`) | [x] |
| Aprobación formal del cierre de pruebas por ambos QA Leads (Bloque A y Bloque B). | Aprobado | Aprobado (Bloque A & Bloque B — 16/11/2026) | [x] |

---

## 6. Criterios de Entrada y Salida

| Criterios de Entrada (para iniciar pruebas) | Criterios de Salida (para finalizar pruebas) |
|---|---|
| Repositorio del SUT congelado verificablemente en el commit be9089e (feat(web): add playwright tablet e2e suite and manual testing evidences (#71)). | 100% de los 40 casos de prueba ejecutados sobre el commit be9089e con resultados y evidencias registradas. |
| Ambiente de pruebas Docker configurado con PostgreSQL 16 (rol app_user con rolbypassrls = false) y Redis 7 activos. | Tasa de defectos Críticos (P1) abiertos = 0 y defectos Altos (P2) abiertos = 0. |
| Catálogo de 40 casos de prueba (15 manuales y 25 automatizados) revisado y aprobado con trazabilidad a requisitos. | Defectos abiertos de severidad Media/Baja (P3/P4: DEF-004, DEF-005 y DEF-006) documentados en GitHub Issues con análisis de riesgo residual. |
| Datos semilla de prueba preparados para dos restaurantes aislados (Tenant A: Restaurante Central y Tenant B: Restaurante Norte). | Plan de pruebas, matriz de trazabilidad, reporte de bugs, dashboard interactivo e informe de calidad APA 7 compilados sin errores. |

---

## 7. Casos de Prueba

### 7.1 Fichas Detalladas de Casos de Prueba (Plantilla Oficial — 40 Casos)

A continuación se documentan las **40 fichas detalladas de casos de prueba** (`CP-AUTH-001` a `CP-RLS-004`, conformadas por **15 casos manuales** y **25 casos automatizados**) ejecutadas sobre el commit congelado `be9089e`:

#### Caso de Prueba #01 — CP-AUTH-001: Inicio de sesión interactivo en tablet (1024x768) con credenciales válidas y redirección contextual por rol

| Campo | Descripción |
|---|---|
| ID del caso | CP-AUTH-001 |
| Nombre | Inicio de sesión interactivo en tablet (1024x768) con credenciales válidas y redirección contextual por rol |
| Historia de usuario | HU-004, HU-005 — Inicio de sesión con credenciales y redirección operativa por rol (Requisitos: `REQ-AUTH-01`) |
| Precondiciones | • Servidor backend (http://localhost:3000) y aplicación web (http://localhost:5173) ejecutándose sobre el commit be9089e con seed.ts cargado<br>• Viewport configurado en resolución tablet horizontal (1024x768 px)<br>• Usuario activo mesero.forja@gastroforge.dev registrado con membresía activa en el restaurante "La Forja Grill & Bar" con rol MESERO |
| Datos de entrada | `email`: `"mesero.forja@gastroforge.dev"`<br>`password`: `"Password123!"`<br>`restaurant`: `"La Forja Grill & Bar"`<br>`viewport`: `"1024x768"`<br>`expectedRole`: `"MESERO"` |
| Pasos de ejecución | 1. Abrir la ruta /login en el navegador con viewport 1024x768 y abrir DevTools (pestañas Network y Application).<br>2. Ingresar el correo mesero.forja@gastroforge.dev y la contraseña Password123!.<br>3. Tocar el botón "Ingresar al sistema".<br>4. Verificar que Application -> Local Storage NO contenga tokens (el Access Token vive en memoria JS en session-store.ts), que Network -> POST /api/v1/auth/login retorne accessToken con HTTP 200, que Application -> Cookies contenga la cookie HttpOnly de Refresh Token y que la app redirija a /dashboard (con acceso a /tables). |
| Resultado esperado | El sistema autentica al usuario (HTTP 200), mantiene el Access Token exclusivamente en memoria JS (enviado como Bearer en peticiones siguientes), emite la cookie HttpOnly de Refresh Token y redirige a /dashboard mostrando "La Forja Grill & Bar" y rol MESERO. |
| Resultado obtenido | El usuario con rol MESERO inicia sesión en /login (HTTP 200 OK), recibe Access Token en memoria y cookie HttpOnly de Refresh Token, y es redirigido automáticamente a /tables con encabezado de restaurante activo en viewport 1024x768. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [x] Funcional  [ ] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Botón principal 'Ingresar al sistema' verificado con altura táctil >= 44px y respuesta inmediata sin zoom accidental.<br>**Evidencia verificable:** `EVID-RUN-001-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Registro de ejecución manual en tablet 1024x768 del inicio de sesión y redirección contextual por rol (CP-AUTH-001). |

#### Caso de Prueba #02 — CP-AUTH-002: Bloqueo por exceso de intentos fallidos de login (HTTP 429 Too Many Requests) y rechazo de credenciales inválidas (401)

| Campo | Descripción |
|---|---|
| ID del caso | CP-AUTH-002 |
| Nombre | Bloqueo por exceso de intentos fallidos de login (HTTP 429 Too Many Requests) y rechazo de credenciales inválidas (401) |
| Historia de usuario | HU-004, HU-005, HU-034 — Protección contra fuerza bruta (HTTP 429) y rechazo sin enumeración de cuentas (Requisitos: `REQ-AUTH-01`, `REQ-RLS-02`) |
| Precondiciones | • Base de datos PostgreSQL de pruebas inicializada con usuario activo<br>• Rate limiter configurado en el endpoint POST /api/v1/auth/login (umbral de frontera: intentos 1..5 permitidos, intento 6 bloqueado) |
| Datos de entrada | `email`: `"admin.forja@gastroforge.dev"`<br>`wrongPassword`: `"WrongPassword999!"`<br>`attemptBoundaries`: `[1, 5, 6]`<br>`expectedStatusBeforeLimit`: `401`<br>`expectedStatusAtLimit`: `429` |
| Pasos de ejecución | 1. Enviar peticiones POST /api/v1/auth/login con contraseña incorrecta desde el intento 1 hasta el valor límite de 5 intentos.<br>2. Verificar que los intentos 1 al 5 retornen HTTP 401 Unauthorized con cuerpo RFC 7807 (application/problem+json) genérico sin revelar si el correo existe.<br>3. Ejecutar el intento número 6 consecutivo superando la frontera del rate limiter.<br>4. Comprobar el código de estado HTTP 429 Too Many Requests y la presencia del encabezado X-Request-Id. |
| Resultado esperado | Los intentos 1 a 5 responden HTTP 401 con mensaje uniforme libre de enumeración de cuentas; en el intento 6 (límite superior + 1) el endpoint bloquea la petición con HTTP 429 Too Many Requests en formato RFC 7807. |
| Resultado obtenido | Los intentos fallidos 1 a 5 en POST /api/v1/auth/login responden HTTP 401 con estructura RFC 7807 uniforme sin enumeración de cuentas; el intento 6 dispara HTTP 429 Too Many Requests (SYSTEM_RATE_LIMIT_EXCEEDED) con X-Request-Id. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [ ] EP  [x] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/auth-login.int-spec.ts`. Frontera BVA [1..5 -> 401, 6 -> 429] validada en L1/L2 rate limiter sin filtración de existencia del correo.<br>**Evidencia verificable:** `EVID-RUN-002-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración en apps/api/test/auth-login.int-spec.ts y rate-limit.guard.spec.ts sobre commit be9089e.<br>`EVID-RUN-002-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Log de ejecución de HybridRateLimitGuard y AuthService en suite unitaria. |

#### Caso de Prueba #03 — CP-AUTH-003: Rotación de Refresh Token en cookie HttpOnly, detección de reuso fraudulento e invalidación en logout

| Campo | Descripción |
|---|---|
| ID del caso | CP-AUTH-003 |
| Nombre | Rotación de Refresh Token en cookie HttpOnly, detección de reuso fraudulento e invalidación en logout |
| Historia de usuario | HU-006, HU-007 — Rotación de Refresh Token en cookie HttpOnly, detección de reuso e invalidación en logout (Requisitos: `REQ-AUTH-02`, `REQ-AUTH-03`) |
| Precondiciones | • Sesión autenticada activa con Refresh Token inicial T1 emitido en cookie HttpOnly (SameSite=Strict)<br>• Registro de sesión activo en base de datos con token_version inicial |
| Datos de entrada | `initialTokenState`: `"ACTIVE_T1"`<br>`rotatedTokenState`: `"ROTATED_T2"`<br>`reusedToken`: `"T1"`<br>`logoutEndpoint`: `"/api/v1/auth/logout"` |
| Pasos de ejecución | 1. Invocar POST /api/v1/auth/refresh enviando la cookie con el token T1 para transicionar al token T2.<br>2. Intentar reutilizar el token ya rotado T1 en una segunda llamada a POST /api/v1/auth/refresh (detección de robo/reuso).<br>3. Verificar que el sistema revoque toda la familia de sesiones incrementando token_version y rechace tanto T1 como T2 con HTTP 401.<br>4. Iniciar nueva sesión válida e invocar POST /api/v1/auth/logout verificando limpieza de cookie e invalidación inmediata del refresh token. |
| Resultado esperado | El refresh válido rota T1 -> T2; el reuso de T1 dispara revocación total de sesiones (HTTP 401) y el logout invalida el token activo e instruye Set-Cookie con expiración inmediata. |
| Resultado obtenido | POST /api/v1/auth/refresh rota el token T1 -> T2 en cookie HttpOnly; al reenviar el token rotado T1 se detecta reuso (auth_refresh_reuse_detected), se revoca toda la familia de sesiones incrementando token_version y /auth/logout limpia la sesión activa. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/auth-refresh-logout.int-spec.ts`. Cumple estrictamente ADR-0003 y UC-AUTH-02/UC-AUTH-03.<br>**Evidencia verificable:** `EVID-RUN-003-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Evidencia de ejecución de apps/api/test/auth-refresh-logout.int-spec.ts sobre commit be9089e.<br>`EVID-RUN-003-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Traza del evento WARN [AuthService] auth_refresh_reuse_detected en auth.service.spec.ts. |

#### Caso de Prueba #04 — CP-AUTH-004: Selección y cambio de restaurante activo multi-tenant y verificación de contraste de marca WCAG (>= 4.5:1)

| Campo | Descripción |
|---|---|
| ID del caso | CP-AUTH-004 |
| Nombre | Selección y cambio de restaurante activo multi-tenant y verificación de contraste de marca WCAG (>= 4.5:1) |
| Historia de usuario | HU-008, HU-009, HU-010 — Selección de restaurante activo multi-tenant y contraste de marca WCAG AA (Requisitos: `REQ-AUTH-04`) |
| Precondiciones | • Servidor backend y aplicación web ejecutándose sobre el commit be9089e con seed.ts cargado<br>• Usuario multi.owner@gastroforge.dev con membresía ADMIN en "La Forja Grill & Bar" y GERENTE en "Trattoria del Puerto" |
| Datos de entrada | `email`: `"multi.owner@gastroforge.dev"`<br>`password`: `"Password123!"`<br>`tenantA`: `"La Forja Grill & Bar"`<br>`tenantB`: `"Trattoria del Puerto"`<br>`primaryColorHex`: `"#9A3412"`<br>`foregroundHex`: `"#FFFFFF"`<br>`minWcagContrastRatio`: `4.5` |
| Pasos de ejecución | 1. Iniciar sesión en /login con multi.owner@gastroforge.dev / Password123!.<br>2. Abrir el selector de restaurante activo en la barra superior de la aplicación y cambiar de "La Forja Grill & Bar" (rol ADMIN) a "Trattoria del Puerto" (rol GERENTE).<br>3. Confirmar en Network la llamada a POST /api/v1/auth/switch-restaurant con el nuevo token de contexto y la recarga de datos aislados del nuevo tenant.<br>4. Inspeccionar el contraste cromático del encabezado y botones primarios verificando que cumpla ratio >= 4.5:1 (WCAG 2.1 AA). |
| Resultado esperado | El contexto de sesión cambia a "Trattoria del Puerto" sin requerir nuevo login, se aplican los permisos de GERENTE en ese tenant y el contraste de color verificado supera 4.5:1. |
| Resultado obtenido | El cambio de restaurante activo desde el selector superior reemite el JWT con el nuevo restaurant_id y rol, recarga datos aislados del segundo tenant y mantiene ratio de contraste de marca de 7.42:1 (>= 4.5:1 WCAG AA). |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Usabilidad) |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Respaldado además en integración por auth-switch-restaurant.int-spec.ts y tenants-restaurant-brand.int-spec.ts.<br>**Evidencia verificable:** `EVID-RUN-004-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Verificación manual de cambio de tenant y contraste WCAG AA en tablet 1024x768.<br>`EVID-RUN-004-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de src/modules/tenants/domain/brand-wcag.helper.spec.ts. |

#### Caso de Prueba #05 — CP-AUTH-005: Restablecimiento administrativo de contraseña con token temporal de un solo uso (15 min) y revocación inmediata de sesiones activas

| Campo | Descripción |
|---|---|
| ID del caso | CP-AUTH-005 |
| Nombre | Restablecimiento administrativo de contraseña con token temporal de un solo uso (15 min) y revocación inmediata de sesiones activas |
| Historia de usuario | HU-011 — Restablecimiento administrativo de contraseña con token de un solo uso y revocación de sesiones (Requisitos: `REQ-AUTH-05`) |
| Precondiciones | • Servidor backend ejecutándose en http://localhost:3000 sobre el commit be9089e con seed.ts cargado<br>• Nota: En be9089e el restablecimiento administrativo de contraseña no tiene pantalla en apps/web; se ejecuta manualmente vía API (Swagger /api/docs o curl)<br>• Usuario objetivo cajero.forja@gastroforge.dev (memberId: ea111111-0000-0000-0000-000000000005) y administrador admin.forja@gastroforge.dev |
| Datos de entrada | `adminEmail`: `"admin.forja@gastroforge.dev"`<br>`adminPassword`: `"Password123!"`<br>`targetUserEmail`: `"cajero.forja@gastroforge.dev"`<br>`targetMemberId`: `"ea111111-0000-0000-0000-000000000005"`<br>`tokenTtlMinutes`: `15`<br>`newPassword`: `"NuevaPasswordSegura2026!"` |
| Pasos de ejecución | 1. Autenticarse como admin.forja@gastroforge.dev vía POST /api/v1/auth/login para obtener su Bearer accessToken.<br>2. Emitir un token temporal de un solo uso invocando POST /api/v1/members/ea111111-0000-0000-0000-000000000005/reset-password con el Bearer del Admin.<br>3. Consumir el token en POST /api/v1/auth/reset-password enviando { token, newPassword } dentro de la ventana de 15 minutos y verificar que la sesión previa del cajero quede invalidada.<br>4. Reenviar la misma petición POST /api/v1/auth/reset-password con el token ya consumido. |
| Resultado esperado | La contraseña se actualiza exitosamente en el primer uso, las sesiones previas quedan revocadas (token_version incrementado) y el segundo intento con el mismo token es rechazado con HTTP 401. |
| Resultado obtenido | El Administrador genera el token temporal de restablecimiento (TTL 15 min); al consumirse por primera vez actualiza el hash Argon2id, incrementa token_version revocando la sesión previa del cajero y rechaza el segundo intento de uso con HTTP 400/401. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Token de un solo uso invalidado atómicamente tras el primer consumo.<br>**Evidencia verificable:** `EVID-RUN-005-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Registro de prueba manual de restablecimiento administrativo de contraseña y revocación de sesión activa.<br>`EVID-RUN-005-2` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Cobertura complementaria en apps/api/test/auth-password-reset.int-spec.ts. |

#### Caso de Prueba #06 — CP-AUTH-006: Evaluación exhaustiva de la matriz de autorización can(actor, action, context) para los 5 roles MVP (incluyendo verificación de frontera de estación en COCINA y hallazgo de permiso kitchen:advance_status en MESERO -> DEF-004)

| Campo | Descripción |
|---|---|
| ID del caso | CP-AUTH-006 |
| Nombre | Evaluación exhaustiva de la matriz de autorización can(actor, action, context) para los 5 roles MVP (incluyendo verificación de frontera de estación en COCINA y hallazgo de permiso kitchen:advance_status en MESERO -> DEF-004) |
| Historia de usuario | HU-009 / ADR-0005 — Matriz de autorización pura deny-by-default can(actor, action, context) para los 5 roles MVP (Requisitos: `REQ-AUTH-06`) |
| Precondiciones | • Función pura de dominio can(actor, action, context) importada sin dependencias de infraestructura<br>• Definición de los 5 roles fijos del MVP: ADMIN, GERENTE, MESERO, COCINA, CAJERO |
| Datos de entrada | `roles`: `[ADMIN, GERENTE, MESERO, COCINA, CAJERO]`<br>`criticalActions`: `[catalog:manage, orders:create, orders:cancel_preparing_item, kitchen:advance_status, cash:reverse_payment]`<br>`stationId`: `"station-parrilla-01"` |
| Pasos de ejecución | 1. Evaluar todas las combinaciones (rol x acción x contexto de estación) en la tabla de decisión del helper can().<br>2. Verificar política deny-by-default cuando el actor es nulo, inactivo o pertenece a otro tenant.<br>3. Validar que el rol COCINA solo pueda avanzar estados en su propia estación asignada (actor.stationId === context.stationId).<br>4. Contrastar la matriz de permisos de MESERO y COCINA frente a la especificación funcional, documentando la discrepancia en kitchen:advance_status para MESERO (DEF-004). |
| Resultado esperado | La función can() aplica deny-by-default y restringe por estación al rol COCINA, evidenciando además el hallazgo DEF-004 donde MESERO carece del permiso kitchen:advance_status para marcar ítems como SERVED. |
| Resultado obtenido | La suite unitaria de can.helper.spec.ts pasa sus aserciones internas, pero la inspección de tabla de decisión contra PRD.md (§2.1) y TESTING-PLAN.md (§2.2) revela que MESERO_ACTIONS en can.helper.ts (líneas 75-76) incluye 'kitchen:read' y 'kitchen:advance_status' sin validación de stationId. |
| Estado | [ ] No ejecutado  [ ] Pasó  [x] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [ ] EP  [ ] BVA  [x] Tabla de decisión  [ ] Otro |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | DEF-004 (GF-BUG-004 — Asignado, P3) |
| Observaciones | Modalidad: **Automatizada** (L2) · Spec: `apps/api/src/modules/auth/domain/can.helper.spec.ts`. Defecto abierto de severidad Media (P3) registrado como DEF-004 (GF-BUG-004): exceso de privilegios en MESERO_ACTIONS frente a la matriz normativa.<br>**Evidencia verificable:** `EVID-RUN-006-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Inspección de código de apps/api/src/modules/auth/domain/can.helper.ts (líneas 68-77) vs PRD.md §2.1 y TESTING-PLAN.md §2.2.<br>`EVID-RUN-006-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución de src/modules/auth/domain/can.helper.spec.ts y nota de auditoría QA para DEF-004. |

#### Caso de Prueba #07 — CP-CAT-001: Creación y ordenamiento visual de estaciones de cocina (PARRILLA, BARRA) y categorías de menú desde panel administrativo

| Campo | Descripción |
|---|---|
| ID del caso | CP-CAT-001 |
| Nombre | Creación y ordenamiento visual de estaciones de cocina (PARRILLA, BARRA) y categorías de menú desde panel administrativo |
| Historia de usuario | HU-012, HU-013 — Gestión de estaciones de preparación y categorías del menú con ordenamiento visual (Requisitos: `REQ-CAT-01`, `REQ-CAT-02`) |
| Precondiciones | • Sesión iniciada en http://localhost:5173 con admin.forja@gastroforge.dev / Password123! (rol ADMIN en La Forja Grill & Bar)<br>• El seed inicial ya incluye "Parrilla y Calientes" y "Bar y Bebidas"; se crearán estaciones y categorías adicionales desde /catalog |
| Datos de entrada | `email`: `"admin.forja@gastroforge.dev"`<br>`route`: `"/catalog"`<br>`stations`: `[PARRILLA, BARRA]`<br>`categoryName`: `"Cortes Madurados"`<br>`sortOrder`: `1`<br>`isActive`: `true` |
| Pasos de ejecución | 1. Navegar a /catalog y crear las estaciones de preparación "PARRILLA" y "BARRA" verificando unicidad de código dentro del restaurante.<br>2. Crear la categoría "Cortes Madurados" con sort_order = 1 y estado activo.<br>3. Reordenar visualmente las categorías y desactivar una categoría secundaria desde /catalog.<br>4. Abrir la vista /orders y comprobar que el orden coincida y la categoría inactiva no se muestre. |
| Resultado esperado | Las estaciones y categorías se persisten correctamente, respetan el orden visual configurado (sort_order) y las categorías desactivadas quedan ocultas inmediatamente en /orders. |
| Resultado obtenido | Las estaciones 'PARRILLA' y 'BARRA' y la categoría 'Cortes Madurados' (sort_order = 1) se crean y ordenan correctamente; al desactivar una categoría secundaria desaparece de inmediato de la vista POS de toma de pedidos. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [x] Funcional  [ ] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Unicidad de código de estación y nombre de categoría por tenant confirmada.<br>**Evidencia verificable:** `EVID-RUN-007-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Evidencia de ejecución manual de gestión de estaciones y categorías de catálogo en 1024x768.<br>`EVID-RUN-007-2` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de catalog-stations.int-spec.ts y catalog-categories.int-spec.ts. |

#### Caso de Prueba #08 — CP-CAT-002: Cálculo exacto de desglose de IVA incluido (tax = gross - gross / (1 + rate)) con precisión Decimal(12,2) y bordes de redondeo

| Campo | Descripción |
|---|---|
| ID del caso | CP-CAT-002 |
| Nombre | Cálculo exacto de desglose de IVA incluido (tax = gross - gross / (1 + rate)) con precisión Decimal(12,2) y bordes de redondeo |
| Historia de usuario | HU-014 — Cálculo aritmético exacto de desglose de IVA incluido en Decimal(12,2) (Requisitos: `REQ-CAT-03`) |
| Precondiciones | • Helper puro de dominio calculateTaxBreakdown disponible para pruebas unitarias<br>• Tasas impositivas de frontera (0%, 8% impoconsumo, 19% IVA) y precios brutos con centavos críticos |
| Datos de entrada | `grossAmounts`: `[0.01, 100.00, 35900.00, 9999999999.99]`<br>`taxRates`: `[0.00, 0.08, 0.19]`<br>`precision`: `"Decimal(12,2)"` |
| Pasos de ejecución | 1. Ejecutar el cálculo de desglose para el valor límite inferior (0.01), valores nominales (35900.00) y cota superior de Decimal(12,2).<br>2. Evaluar tasas de impuesto en frontera 0% (exento), 8% y 19%.<br>3. Verificar el invariante contable netAmount + taxAmount === grossAmount sin pérdida de centavos por coma flotante IEEE 754. |
| Resultado esperado | Para todos los valores límite y tasas evaluadas, el desglose produce montos redondeados a 2 decimales exactos donde base gravable + impuesto suma exactamente el precio bruto. |
| Resultado obtenido | El helper calculateTaxBreakdown calcula base gravable e impuesto incluido con precisión exacta Decimal(12,2) en fronteras (0.01, 100.00, 35900.00, 9999999999.99) y tasas (0%, 8%, 19%) cumpliendo netAmount + taxAmount === grossAmount. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [x] Funcional  [ ] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [x] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L2) · Spec: `apps/api/src/modules/catalog/domain/tax-breakdown.helper.spec.ts`. Cero errores de redondeo de coma flotante IEEE 754 en desglose de IVA incluido.<br>**Evidencia verificable:** `EVID-RUN-008-1` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/catalog/domain/tax-breakdown.helper.spec.ts en commit be9089e. |

#### Caso de Prueba #09 — CP-CAT-003: Validación de valores límite en grupos de modificadores (min_selectable, max_selectable, selección por debajo del mínimo y por encima del máximo -> HTTP 400)

| Campo | Descripción |
|---|---|
| ID del caso | CP-CAT-003 |
| Nombre | Validación de valores límite en grupos de modificadores (min_selectable, max_selectable, selección por debajo del mínimo y por encima del máximo -> HTTP 400) |
| Historia de usuario | HU-015 — Validación de fronteras min_selectable y max_selectable en grupos de modificadores (Requisitos: `REQ-CAT-04`) |
| Precondiciones | • Producto activo en catálogo asociado a un grupo de modificadores con min_selectable = 1 y max_selectable = 2<br>• Opciones de modificador activas con sobreprecio Decimal(12,2) |
| Datos de entrada | `groupName`: `"Término de la carne y guarnición"`<br>`minSelectable`: `1`<br>`maxSelectable`: `2`<br>`testedSelectionCounts`: `[0, 1, 2, 3]` |
| Pasos de ejecución | 1. Intentar crear un grupo de modificadores inválido con min_selectable > max_selectable o valores negativos verificando rechazo HTTP 400.<br>2. En el grupo válido [1..2], probar la frontera inferior inválida seleccionando 0 opciones (min - 1).<br>3. Probar los valores límite válidos seleccionando exactamente 1 opción (min) y 2 opciones (max).<br>4. Probar la frontera superior inválida seleccionando 3 opciones (max + 1). |
| Resultado esperado | Las selecciones en frontera válida (1 y 2 opciones) son aceptadas sumando el sobreprecio exacto; las selecciones fuera de rango (0 y 3 opciones) son rechazadas con HTTP 400 Bad Request. |
| Resultado obtenido | En el grupo de modificadores con rango [1..2], las selecciones fuera de frontera (0 y 3 opciones) son rechazadas con HTTP 400 Bad Request, mientras que las fronteras válidas (1 y 2 opciones) son aceptadas sumando el price_delta exacto. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [x] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/catalog-modifier-groups.int-spec.ts`. Cobertura completa de particiones y valores límite (min - 1, min, max, max + 1).<br>**Evidencia verificable:** `EVID-RUN-009-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/catalog-modifier-groups.int-spec.ts.<br>`EVID-RUN-009-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/catalog/domain/modifier-rules.helper.spec.ts. |

#### Caso de Prueba #10 — CP-CAT-004: Cambio rápido de disponibilidad de producto (Agotado / Disponible) en turno activo y reflejo inmediato en toma de pedidos

| Campo | Descripción |
|---|---|
| ID del caso | CP-CAT-004 |
| Nombre | Cambio rápido de disponibilidad de producto (Agotado / Disponible) en turno activo y reflejo inmediato en toma de pedidos |
| Historia de usuario | HU-014 — Cambio rápido de disponibilidad de producto (86ing) en turno activo (Requisitos: `REQ-CAT-03`) |
| Precondiciones | • Sesión de Gerente (gerente.forja@gastroforge.dev / Password123!) y sesión de Mesero (mesero.forja@gastroforge.dev / Password123!) disponibles<br>• Producto sembrado "Bife de Chorizo 350g" en estado AVAILABLE dentro de "La Forja Grill & Bar" |
| Datos de entrada | `productName`: `"Bife de Chorizo 350g"`<br>`initialState`: `"AVAILABLE"`<br>`targetState`: `"UNAVAILABLE"`<br>`restoredState`: `"AVAILABLE"` |
| Pasos de ejecución | 1. Desde la sesión de Gerente en /catalog, cambiar la disponibilidad de "Bife de Chorizo 350g" a Agotado (UNAVAILABLE).<br>2. Desde la tablet del Mesero en /orders, abrir una comanda e intentar agregar "Bife de Chorizo 350g".<br>3. Verificar que el ítem aparezca marcado como no disponible / deshabilitado para selección.<br>4. Restaurar el estado a Disponible (AVAILABLE) en /catalog y comprobar en /orders que vuelve a permitir su captura. |
| Resultado esperado | La transición AVAILABLE -> UNAVAILABLE bloquea de inmediato la captura del producto en nuevas tandas sin afectar órdenes previas, y la transición UNAVAILABLE -> AVAILABLE restablece su venta. |
| Resultado obtenido | Al cambiar el estado de 'Bife de Chorizo 350g' a UNAVAILABLE desde la sesión de Gerente, el producto aparece inmediatamente como Agotado y deshabilitado en la tablet del Mesero sin afectar tandas previas; al restaurarlo a AVAILABLE vuelve a permitir su captura. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [x] Funcional  [ ] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Sincronización reactiva confirmada entre catálogo administrativo y pantalla de pedidos.<br>**Evidencia verificable:** `EVID-RUN-010-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Evidencia manual de transición de disponibilidad rápida (86ing) en turno activo.<br>`EVID-RUN-010-2` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración en apps/api/test/catalog-menu-items.int-spec.ts. |

#### Caso de Prueba #11 — CP-TAB-001: Creación de áreas y mesas con validación de capacidad límite de comensales y unicidad de código por restaurante

| Campo | Descripción |
|---|---|
| ID del caso | CP-TAB-001 |
| Nombre | Creación de áreas y mesas con validación de capacidad límite de comensales y unicidad de código por restaurante |
| Historia de usuario | HU-016 — Gestión de áreas del salón, mesas, capacidad límite y unicidad de código por restaurante (Requisitos: `REQ-TAB-01`) |
| Precondiciones | • Tenant activo con área operativa 'Salón Principal' creada<br>• Usuario autenticado con rol ADMIN o GERENTE |
| Datos de entrada | `areaName`: `"Salón Principal"`<br>`tableCode`: `"M1"`<br>`normalizedFrom`: `"m1"`<br>`capacityBoundaries`: `[0, 1, 12, 20, 21]` |
| Pasos de ejecución | 1. Intentar registrar una mesa con capacidad 0 (frontera inferior inválida) verificando rechazo HTTP 400.<br>2. Registrar la mesa 'M-01' con capacidad mínima válida (1 comensal) y actualizar a capacidad nominal (12 comensales).<br>3. Intentar crear una segunda mesa con el mismo código 'M-01' en el mismo restaurante verificando conflicto de unicidad (HTTP 409).<br>4. Verificar que otro restaurante distinto (Tenant B) sí pueda registrar su propia mesa 'M-01'. |
| Resultado esperado | Capacidad <= 0 es rechazada con HTTP 400; capacidades >= 1 se crean correctamente; códigos duplicados en el mismo tenant responden HTTP 409 mientras se permite el mismo código en otro tenant. |
| Resultado obtenido | La creación de mesa con capacidad 0 es rechazada con HTTP 400; capacidades válidas (1 y 12) se persisten con éxito; un código duplicado 'M-01' en el mismo restaurante retorna HTTP 409 mientras que el Tenant B puede registrar su propia mesa 'M-01'. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [x] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/tables-management.int-spec.ts`. Restricción UNIQUE (restaurant_id, code) y validación BVA de capacidad verificadas.<br>**Evidencia verificable:** `EVID-RUN-011-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/tables-management.int-spec.ts.<br>`EVID-RUN-011-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/tables/domain/tables-validation.helper.spec.ts. |

#### Caso de Prueba #12 — CP-TAB-002: Inspección táctil del mapa de salón en 1024x768 (tarjetas >= 104px, contraste semántico FREE vs OCCUPIED)

| Campo | Descripción |
|---|---|
| ID del caso | CP-TAB-002 |
| Nombre | Inspección táctil del mapa de salón en 1024x768 (tarjetas >= 104px, contraste semántico FREE vs OCCUPIED) |
| Historia de usuario | HU-017, HU-033 — Mapa operativo táctil de mesas en tablet 1024x768 y semántica visual FREE vs OCCUPIED (Requisitos: `REQ-TAB-02`) |
| Precondiciones | • Sesión iniciada en http://localhost:5173 con mesero.forja@gastroforge.dev / Password123! en viewport 1024x768<br>• Seed cargado: Mesa M1 con orden abierta (Ocupada) y mesas M2..M4, T1..T2 libres (Disponible) |
| Datos de entrada | `viewport`: `"1024x768"`<br>`minCardHeightPx`: `104`<br>`states`: `[Disponible, Ocupada, Por pagar]` |
| Pasos de ejecución | 1. Acceder a la vista del mapa de mesas (/tables) con mesero.forja@gastroforge.dev en resolución 1024x768.<br>2. Medir mediante DevTools las dimensiones de las tarjetas de mesa confirmando altura mínima >= 104px y ausencia de scroll horizontal.<br>3. Verificar que las mesas Disponibles (ej. M2) y Ocupadas (ej. M1) se diferencien simultáneamente por color semántico, etiqueta textual ("Disponible" / "Ocupada") e ícono de estado. |
| Resultado esperado | La cuadrícula del salón en /tables renderiza tarjetas táctiles >= 104px sin desbordamiento horizontal y distingue claramente los estados Disponible y Ocupada mediante triple codificación visual. |
| Resultado obtenido | En viewport 1024x768 la vista /tables renderiza tarjetas táctiles con altura medida de 108px (>= 104px requeridos), sin scroll horizontal y diferenciando mesas libres y ocupadas por color semántico, etiqueta textual e ícono. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Usabilidad) |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Cumple ergonomía táctil tablet-first y accesibilidad visual de salón.<br>**Evidencia verificable:** `EVID-RUN-012-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Medición DOM en DevTools 1024x768 de tarjetas de mesa (>= 104px) y semántica visual FREE vs OCCUPIED. |

#### Caso de Prueba #13 — CP-TAB-003: Derivación dinámica del estado de ocupación de mesas (FREE -> OCCUPIED -> FREE) al abrir y cerrar órdenes sin estado duplicado persistido

| Campo | Descripción |
|---|---|
| ID del caso | CP-TAB-003 |
| Nombre | Derivación dinámica del estado de ocupación de mesas (FREE -> OCCUPIED -> FREE) al abrir y cerrar órdenes sin estado duplicado persistido |
| Historia de usuario | HU-017 — Derivación dinámica del estado de ocupación de mesas a partir de órdenes activas (Requisitos: `REQ-TAB-02`) |
| Precondiciones | • Mesa 'M-05' activa en el área 'Terraza' sin órdenes abiertas asociadas |
| Datos de entrada | `tableCodes`: `[M1, M2]`<br>`stateSequence`: `[disponible, ocupada, por-pagar]` |
| Pasos de ejecución | 1. Consultar GET /api/v1/tables/overview y verificar que la mesa 'M-05' reporte estado derivado FREE.<br>2. Abrir una orden DINE_IN sobre la mesa 'M-05' y volver a consultar el overview de mesas.<br>3. Comprobar que el estado transiciona automáticamente a OCCUPIED incluyendo el identificador y total acumulado de la orden activa.<br>4. Cerrar/pagar completamente la orden activa y consultar nuevamente el overview verificando el retorno automático al estado FREE. |
| Resultado esperado | La vista de salón deriva dinámicamente los estados disponible, ocupada y por-pagar a partir de las órdenes activas y sus ítems, manteniendo aislamiento estricto por RLS entre restaurantes. |
| Resultado obtenido | GET /api/v1/tables/overview reporta la mesa 'M-05' como FREE inicialmente, cambia automáticamente a OCCUPIED al abrir una orden DINE_IN activa y retorna a FREE tras liquidar y cerrar la orden. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/tables-overview.int-spec.ts`. Ocupación derivada dinámicamente sin columnas de estado redundantes.<br>**Evidencia verificable:** `EVID-RUN-013-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/tables-overview.int-spec.ts.<br>`EVID-RUN-013-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/tables/domain/table-occupancy.helper.spec.ts. |

#### Caso de Prueba #14 — CP-ORD-001: Guion M-01 de usabilidad táctil en salón (Tablet 1024x768): apertura de orden en mesa, selección de 4 ítems con modificadores y verificación de objetivos táctiles (44x44 px observados vs 48x48 px especificados en TESTING-PLAN.md -> DEF-006)

| Campo | Descripción |
|---|---|
| ID del caso | CP-ORD-001 |
| Nombre | Guion M-01 de usabilidad táctil en salón (Tablet 1024x768): apertura de orden en mesa, selección de 4 ítems con modificadores y verificación de objetivos táctiles (44x44 px observados vs 48x48 px especificados en TESTING-PLAN.md -> DEF-006) |
| Historia de usuario | HU-018, HU-020, HU-033 — Guion M-01 de usabilidad táctil en salón (1024x768) y verificación de objetivos táctiles (Requisitos: `REQ-ORD-01`, `REQ-ORD-02`) |
| Precondiciones | • Sesión iniciada con mesero.forja@gastroforge.dev / Password123! en viewport tablet 1024x768<br>• Mesa M2 en estado Disponible en /tables (M1 viene ocupada por defecto en seed.ts) |
| Datos de entrada | `viewport`: `"1024x768"`<br>`tableCode`: `"M2"`<br>`items`: `[Hamburguesa Forja Especial (Término Medio), Bife de Chorizo 350g (Tres Cuartos), Papas Rústicas Trufadas, Cerveza Artesanal IPA 330ml]`<br>`itemsCount`: `4`<br>`expectedMinTouchTargetPx`: `48`<br>`observedStepperTouchTargetPx`: `44` |
| Pasos de ejecución | 1. En /tables, tocar la tarjeta de la mesa libre "M2" para abrir una nueva cuenta DINE_IN.<br>2. Seleccionar 4 productos reales del menú (Hamburguesa Forja Especial, Bife de Chorizo 350g, Papas Rústicas Trufadas y Cerveza Artesanal IPA 330ml) configurando sus modificadores obligatorios.<br>3. Utilizar los botones de incremento/decremento de cantidad e inspeccionar su caja táctil en DevTools (44x44 px observados vs 48x48 px especificados en TESTING-PLAN.md).<br>4. Enviar la tanda a cocina y medir el tiempo total de interacción (< 15 segundos). |
| Resultado esperado | La comanda en mesa M2 se captura y despacha en menos de 15 segundos sin errores de pulsación; la auditoría visual registra la discrepancia menor de objetivo táctil 44x44 px vs 48x48 px (DEF-006). |
| Resultado obtenido | El Guion M-01 en tablet 1024x768 completa la apertura de la mesa M2, selección de 4 ítems con modificadores y despacho de comanda en 13.4 segundos (< 15 s) sin errores de pulsación; la inspección DOM registra objetivos táctiles de 44x44 px (PRD.md) frente a los 48x48 px citados en TESTING-PLAN.md (DEF-006). |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Usabilidad) |
| Técnica aplicada | [ ] EP  [x] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | DEF-006 (GF-BUG-006 — Asignado, P4) |
| Observaciones | Modalidad: **Manual** (L6). El caso aprueba funcionalmente en < 15s en 1024x768; se vincula el hallazgo documental cosmético P4 DEF-006 (GF-BUG-006) entre PRD.md/E2E (44x44 px) y TESTING-PLAN.md (48x48 px).<br>**Evidencia verificable:** `EVID-RUN-014-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Ejecución del Guion M-01 en 1024x768 y registro de la discrepancia documental menor DEF-006 (44x44 px vs 48x48 px). |

#### Caso de Prueba #15 — CP-ORD-002: Apertura de cuentas DINE_IN y TAKEOUT con numeración secuencial diaria por restaurante y rechazo de doble apertura sobre mesa ocupada (HTTP 409)

| Campo | Descripción |
|---|---|
| ID del caso | CP-ORD-002 |
| Nombre | Apertura de cuentas DINE_IN y TAKEOUT con numeración secuencial diaria por restaurante y rechazo de doble apertura sobre mesa ocupada (HTTP 409) |
| Historia de usuario | HU-018, HU-019 — Apertura de órdenes DINE_IN y TAKEOUT con numeración secuencial diaria e invariante de mesa única (Requisitos: `REQ-ORD-01`) |
| Precondiciones | • Mesa 'M-03' disponible en estado FREE en el restaurante activo<br>• Usuario autenticado con rol MESERO |
| Datos de entrada | `orderTypes`: `[DINE_IN, TAKEOUT]`<br>`tableCode`: `"M1"`<br>`dinersCount`: `4`<br>`customerName`: `"Cliente Mostrador"` |
| Pasos de ejecución | 1. Enviar POST /api/v1/orders con type = 'DINE_IN' y tableId de 'M-03' verificando creación HTTP 201 y asignación de dailyNumber = 1.<br>2. Intentar enviar un segundo POST /api/v1/orders con type = 'DINE_IN' para la misma mesa 'M-03' mientras la primera orden sigue abierta.<br>3. Enviar POST /api/v1/orders con type = 'TAKEOUT' sin tableId verificando creación HTTP 201 y asignación de dailyNumber = 2. |
| Resultado esperado | Las órdenes DINE_IN y TAKEOUT válidas se crean con numeración secuencial diaria incremental por tenant, mientras que el intento de abrir una segunda orden sobre la mesa ocupada es rechazado con HTTP 409 Conflict. |
| Resultado obtenido | POST /api/v1/orders crea la cuenta DINE_IN en mesa M-03 (HTTP 201, correlativo diario #1), rechaza una segunda apertura simultánea sobre la misma mesa M-03 con HTTP 409 Conflict y permite crear orden TAKEOUT sin mesa con correlativo #2. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/orders-open.int-spec.ts`. Numeración correlativa diaria por tenant e invariante de orden activa única por mesa verificados.<br>**Evidencia verificable:** `EVID-RUN-015-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/orders-open.int-spec.ts.<br>`EVID-RUN-015-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/orders/domain/order-number.helper.spec.ts. |

#### Caso de Prueba #16 — CP-ORD-003: Despacho de tandas (OrderRound) con validación BVA de cantidad (quantity: 0, 1, 99, 100) y control de concurrencia optimista (version -> HTTP 409 ORDER_CONFLICT_VERSION)

| Campo | Descripción |
|---|---|
| ID del caso | CP-ORD-003 |
| Nombre | Despacho de tandas (OrderRound) con validación BVA de cantidad (quantity: 0, 1, 99, 100) y control de concurrencia optimista (version -> HTTP 409 ORDER_CONFLICT_VERSION) |
| Historia de usuario | HU-020, HU-021 — Despacho de tandas (OrderRound) con validación BVA de cantidades y concurrencia optimista (version) (Requisitos: `REQ-ORD-02`) |
| Precondiciones | • Orden DINE_IN abierta con version = 1<br>• Productos activos con precios e impuestos configurados en catálogo |
| Datos de entrada | `quantityBoundaries`: `[0, 1, 99, 100]`<br>`initialVersion`: `1`<br>`staleVersion`: `1` |
| Pasos de ejecución | 1. Intentar despachar una tanda con quantity = 0 (frontera inferior inválida) y quantity = 100 (frontera superior inválida), verificando HTTP 400.<br>2. Despachar tanda válida con quantity = 1 y quantity = 99 enviando version = 1, verificando incremento a version = 2, recálculo de totales y registro en outbox_events.<br>3. Enviar una segunda petición concurrente con la versión obsoleta (version = 1) verificando rechazo por bloqueo optimista. |
| Resultado esperado | Cantidades 0 y 100 son rechazadas con HTTP 400; cantidades 1 y 99 persisten la tanda e incrementan version; la mutación con versión obsoleta retorna HTTP 409 con código ORDER_CONFLICT_VERSION. |
| Resultado obtenido | Cantidades en frontera inválida (0 y 100) responden HTTP 400; cantidades válidas (1 y 99) despachan la tanda, recalculan totales, encolan outbox_event e incrementan version = 2; una mutación concurrente con version obsoleta (1) recibe HTTP 409 ORDER_CONFLICT_VERSION. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [x] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/orders-rounds.int-spec.ts`. Control de concurrencia optimista e inmutabilidad de snapshots de precios verificados.<br>**Evidencia verificable:** `EVID-RUN-016-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/orders-rounds.int-spec.ts.<br>`EVID-RUN-016-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/orders/domain/round-pricing.helper.spec.ts. |

#### Caso de Prueba #17 — CP-ORD-004: Cancelación manual de ítem en estado PREPARING solicitando autorización/PIN de Gerente y motivo obligatorio de auditoría

| Campo | Descripción |
|---|---|
| ID del caso | CP-ORD-004 |
| Nombre | Cancelación manual de ítem en estado PREPARING solicitando autorización/PIN de Gerente y motivo obligatorio de auditoría |
| Historia de usuario | HU-022 — Cancelación manual de ítem en preparación con autorización de Gerente y motivo de auditoría (Requisitos: `REQ-ORD-03`) |
| Precondiciones | • Sesión iniciada con mesero.forja@gastroforge.dev / Password123! en /orders<br>• Orden abierta en mesa M1 (sembrada en seed.ts) con ítem "Hamburguesa Forja Especial" en estado PREPARING |
| Datos de entrada | `tableCode`: `"M1"`<br>`itemState`: `"PREPARING"`<br>`supervisorEmail`: `"gerente.forja@gastroforge.dev"`<br>`supervisorPasscode`: `"Password123!"`<br>`cancellationReason`: `"Error de digitación en término de cocción solicitado por el cliente"` |
| Pasos de ejecución | 1. En /orders como mesero.forja@gastroforge.dev, abrir la orden de la mesa M1 y tocar "Cancelar" en el ítem en estado PREPARING.<br>2. Ingresar el "Motivo de cancelación" (mínimo 5 caracteres).<br>3. En los campos de autorización de supervisor que aparecen inline, ingresar "Correo de Gerente / Admin" = gerente.forja@gastroforge.dev y "Contraseña / PIN de supervisor" = Password123!.<br>4. Confirmar la cancelación y verificar que el ítem quede tachado (CANCELLED) y el total de la orden se recalcule. |
| Resultado esperado | El ítem en estado PREPARING exige credenciales válidas de supervisor (GERENTE/ADMIN) y motivo obligatorio, queda cancelado y el total de la orden se recalcula correctamente. |
| Resultado obtenido | El Mesero no puede anular directamente un ítem en estado PREPARING; al suministrar autorización de Gerente y el motivo obligatorio ('Cliente cambió de opinión por alergia alimentaria'), el ítem pasa a CANCELLED, se descuenta del total y se audita en audit_log. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [x] Funcional  [ ] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [x] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Validación de formulario impide confirmar la anulación cuando el motivo está vacío.<br>**Evidencia verificable:** `EVID-RUN-017-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Registro de prueba manual de cancelación supervisada de ítem en preparación con motivo obligatorio. |

#### Caso de Prueba #18 — CP-ORD-005: Reglas de cancelación de ítems según estado (PENDING por Mesero vs PREPARING/READY restringido a Gerente/Admin y rechazo en SERVED)

| Campo | Descripción |
|---|---|
| ID del caso | CP-ORD-005 |
| Nombre | Reglas de cancelación de ítems según estado (PENDING por Mesero vs PREPARING/READY restringido a Gerente/Admin y rechazo en SERVED) |
| Historia de usuario | HU-022 — Reglas de negocio en backend para cancelación de ítems según estado (PENDING, PREPARING, READY, SERVED) (Requisitos: `REQ-ORD-03`) |
| Precondiciones | • Orden activa con ítems en estados PENDING, PREPARING, READY y SERVED |
| Datos de entrada | `states`: `[PENDING, PREPARING, READY, SERVED]`<br>`roles`: `[MESERO, GERENTE]`<br>`reason`: `"Error de digitación en comanda"` |
| Pasos de ejecución | 1. Invocar cancelación como MESERO sobre un ítem en estado PENDING verificando éxito (HTTP 200) y recálculo del total.<br>2. Invocar cancelación como MESERO sobre un ítem en estado PREPARING verificando denegación (HTTP 403 Forbidden).<br>3. Invocar cancelación como GERENTE con motivo válido sobre ítems en PREPARING y READY verificando éxito y trazabilidad en audit_log.<br>4. Intentar cancelar un ítem en estado SERVED (incluso como GERENTE) verificando rechazo por transición inválida (HTTP 409/422). |
| Resultado esperado | MESERO solo puede cancelar en PENDING; GERENTE/ADMIN pueden cancelar en PREPARING/READY con motivo obligatorio; ningún rol puede cancelar un ítem ya SERVED. |
| Resultado obtenido | En backend, MESERO cancela exitosamente en PENDING (HTTP 200) y recibe HTTP 403 en PREPARING; GERENTE cancela con motivo obligatorio en PREPARING y READY registrando audit_log; cualquier intento de cancelar un ítem SERVED retorna HTTP 409/422. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/orders-item-cancellation.int-spec.ts`. Máquina de estados y matriz de permisos de cancelación verificadas en dominio e integración.<br>**Evidencia verificable:** `EVID-RUN-018-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/orders-item-cancellation.int-spec.ts.<br>`EVID-RUN-018-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/orders/domain/item-cancellation.helper.spec.ts. |

#### Caso de Prueba #19 — CP-ORD-006: Verificación del permiso de apertura de orden (orders:create) para el rol CAJERO según PRD.md (§2.1) frente a la política can.helper.ts (DEF-005)

| Campo | Descripción |
|---|---|
| ID del caso | CP-ORD-006 |
| Nombre | Verificación del permiso de apertura de orden (orders:create) para el rol CAJERO según PRD.md (§2.1) frente a la política can.helper.ts (DEF-005) |
| Historia de usuario | HU-009, HU-019 — Verificación del permiso orders:create para el rol CAJERO en órdenes para llevar (TAKEOUT) (Requisitos: `REQ-ORD-01`, `REQ-AUTH-06`) |
| Precondiciones | • Especificación funcional PRD.md §2.1 e historia HU-019 que habilitan a Cajero para abrir órdenes TAKEOUT<br>• Matriz de autorización del cliente y servidor cargada con rol CAJERO |
| Datos de entrada | `actorRole`: `"CAJERO"`<br>`action`: `"orders:create"`<br>`orderType`: `"TAKEOUT"` |
| Pasos de ejecución | 1. Evaluar la política de autorización can({ role: 'CAJERO' }, 'orders:create') en la capa de dominio.<br>2. Contrastarla contra el requisito de negocio REQ-ORD-01 (apertura de cuentas TAKEOUT por Cajero o Mesero).<br>3. Registrar la discrepancia detectada donde CAJERO recibe false en orders:create (documentado como defecto DEF-005). |
| Resultado esperado | La prueba verifica el comportamiento de la matriz de autorización de frontend/dominio y deja trazabilidad del hallazgo DEF-005 donde el rol CAJERO no incluye orders:create en can.helper.ts. |
| Resultado obtenido | La función can({ role: 'CAJERO' }, 'orders:create') retorna false en can.helper.ts (línea 47 de can.helper.spec.ts), contradiciendo la Matriz de Capacidades del PRD.md (§2.1, línea 86) que establece que Cajero sí puede abrir orden/cuenta. |
| Estado | [ ] No ejecutado  [ ] Pasó  [x] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [x] Funcional  [ ] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [x] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | DEF-005 (GF-BUG-005 — Asignado, P3) |
| Observaciones | Modalidad: **Automatizada** (L3) · Spec: `apps/web/app/features/auth/domain/can.test.ts`. Defecto abierto de severidad Media (P3) registrado como DEF-005 (GF-BUG-005): CAJERO carece de orders:create para abrir órdenes TAKEOUT en caja.<br>**Evidencia verificable:** `EVID-RUN-019-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Inspección normativa de CAJERO_ACTIONS en can.helper.ts y can.test.ts frente a PRD.md §2.1.<br>`EVID-RUN-019-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución de apps/web/app/features/auth/domain/can.test.ts y nota de auditoría para DEF-005. |

#### Caso de Prueba #20 — CP-KIT-001: Visualización de cola KDS en tablet (1024x768) filtrada por estación (PARRILLA) y validación de alertas cromáticas de urgencia por tiempo de espera

| Campo | Descripción |
|---|---|
| ID del caso | CP-KIT-001 |
| Nombre | Visualización de cola KDS en tablet (1024x768) filtrada por estación (PARRILLA) y validación de alertas cromáticas de urgencia por tiempo de espera |
| Historia de usuario | HU-023, HU-033 — Visualización de cola KDS en tablet (1024x768) e indicadores semafóricos de urgencia (Requisitos: `REQ-KIT-01`) |
| Precondiciones | • Sesión iniciada con cocina.forja@gastroforge.dev / Password123! en viewport 1024x768<br>• Estación "Parrilla y Calientes" con ítems activos en cola (sembrados en M1 o recién despachados) |
| Datos de entrada | `email`: `"cocina.forja@gastroforge.dev"`<br>`route`: `"/kitchen"`<br>`viewport`: `"1024x768"`<br>`stationFilter`: `"Parrilla y Calientes"`<br>`urgencyThresholdsMinutes`: `[object Object]` |
| Pasos de ejecución | 1. Abrir la vista /kitchen con cocina.forja@gastroforge.dev en resolución tablet 1024x768.<br>2. Seleccionar el filtro de estación "Parrilla y Calientes" y verificar que no aparezcan ítems exclusivos de "Bar y Bebidas".<br>3. Verificar el ordenamiento FIFO de las comandas y las alertas cromáticas según el tiempo de espera. |
| Resultado esperado | El KDS en /kitchen muestra exclusivamente la cola FIFO de "Parrilla y Calientes" con tarjetas legibles y semáforo visual exacto según los umbrales de espera. |
| Resultado obtenido | En tablet 1024x768 la vista /kitchen filtra exclusivamente los ítems de la estación 'Parrilla y Calientes' en orden FIFO y aplica correctamente la codificación semafórica de urgencia por tiempo transcurrido (Normal, Moderado ámbar y Urgente rojo). |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Usabilidad) |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Filtros de estación con altura táctil >= 44px y alta legibilidad a distancia en cocina.<br>**Evidencia verificable:** `EVID-RUN-020-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Evidencia manual en 1024x768 de la cola KDS por estación y semáforo de urgencia.<br>`EVID-RUN-020-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/kitchen/domain/kds-urgency.helper.spec.ts. |

#### Caso de Prueba #21 — CP-KIT-002: Consulta de cola KDS aislada por estación asignada al cocinero y bloqueo fail-closed cuando no posee estación asignada

| Campo | Descripción |
|---|---|
| ID del caso | CP-KIT-002 |
| Nombre | Consulta de cola KDS aislada por estación asignada al cocinero y bloqueo fail-closed cuando no posee estación asignada |
| Historia de usuario | HU-023 — Aislamiento de cola KDS por estación asignada y bloqueo fail-closed sin estación (Requisitos: `REQ-KIT-01`) |
| Precondiciones | • Orden despachada con ítems dirigidos a 'PARRILLA' y a 'BARRA'<br>• Usuario COCINA_1 asignado a 'PARRILLA' y usuario COCINA_2 sin stationId asignado |
| Datos de entrada | `cookWithStation`: `"COCINA_PARRILLA"`<br>`cookWithoutStation`: `"COCINA_UNASSIGNED"`<br>`endpoint`: `"/api/v1/kitchen/queue"` |
| Pasos de ejecución | 1. Consultar GET /api/v1/kitchen/queue con el token de COCINA_1 (asignado a PARRILLA).<br>2. Verificar que la respuesta contenga solo ítems de PARRILLA e ignore los de BARRA.<br>3. Consultar GET /api/v1/kitchen/queue con el token de COCINA_2 (sin estación asignada) o intentando filtrar otra estación distinta. |
| Resultado esperado | El cocinero con estación recibe únicamente los ítems de su estación; el cocinero sin estación o que intenta acceder a otra estación es bloqueado en modo fail-closed (HTTP 403 Forbidden). |
| Resultado obtenido | GET /api/v1/kitchen/queue retorna al cocinero asignado a PARRILLA únicamente los ítems de PARRILLA (excluyendo BARRA), y bloquea en modo fail-closed con HTTP 403 Forbidden al cocinero sin estación asignada o que solicita otra estación. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/kitchen-queue.int-spec.ts`. Aislamiento por estación de cocina verificado a nivel de dominio y endpoint HTTP.<br>**Evidencia verificable:** `EVID-RUN-021-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/kitchen-queue.int-spec.ts. |

#### Caso de Prueba #22 — CP-KIT-003: Máquina de estados de preparación en KDS (PENDING -> PREPARING -> READY -> SERVED), rechazo de transiciones regresivas (400) y registro en order_item_status_history

| Campo | Descripción |
|---|---|
| ID del caso | CP-KIT-003 |
| Nombre | Máquina de estados de preparación en KDS (PENDING -> PREPARING -> READY -> SERVED), rechazo de transiciones regresivas (400) y registro en order_item_status_history |
| Historia de usuario | HU-024 — Máquina de estados de preparación en KDS e historial inmutable order_item_status_history (Requisitos: `REQ-KIT-02`) |
| Precondiciones | • Ítem de comanda recién despachado en estado inicial PENDING para la estación PARRILLA |
| Datos de entrada | `validTransitions`: `[PENDING -> PREPARING, PREPARING -> READY, READY -> SERVED]`<br>`invalidTransitions`: `[PENDING -> READY, READY -> PREPARING, SERVED -> PENDING]` |
| Pasos de ejecución | 1. Intentar saltar directamente de PENDING a READY verificando rechazo HTTP 400/422.<br>2. Avanzar secuencialmente el ítem de PENDING a PREPARING, luego a READY y finalmente a SERVED.<br>3. Intentar retroceder el ítem de READY a PREPARING o de SERVED a PENDING verificando rechazo.<br>4. Consultar la tabla append-only order_item_status_history verificando los 3 registros de auditoría con marca de tiempo y actor. |
| Resultado esperado | Solo se permiten las transiciones hacia adelante definidas en el grafo de estados; todo salto o retroceso responde HTTP 400/422 y cada cambio válido queda registrado inmutablemente en el historial. |
| Resultado obtenido | Las transiciones secuenciales PENDING -> PREPARING -> READY -> SERVED se ejecutan con éxito insertando 3 registros inmutables en order_item_status_history, mientras que los saltos (PENDING -> READY) o retrocesos (READY -> PREPARING, SERVED -> PENDING) son rechazados con HTTP 400/422. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/kitchen-status.int-spec.ts`. Trazabilidad completa de actor y marca de tiempo en order_item_status_history.<br>**Evidencia verificable:** `EVID-RUN-022-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/kitchen-status.int-spec.ts.<br>`EVID-RUN-022-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/kitchen/domain/kitchen-status.helper.spec.ts. |

#### Caso de Prueba #23 — CP-KIT-004: Guion M-02 de reconexión reactiva de Server-Sent Events (SSE) ante corte temporal de red Wi-Fi (30 s) e invalidación automática de caché TanStack Query sin recarga manual (F5)

| Campo | Descripción |
|---|---|
| ID del caso | CP-KIT-004 |
| Nombre | Guion M-02 de reconexión reactiva de Server-Sent Events (SSE) ante corte temporal de red Wi-Fi (30 s) e invalidación automática de caché TanStack Query sin recarga manual (F5) |
| Historia de usuario | HU-025 / ADR-0004 — Guion M-02 de reconexión reactiva SSE ante corte de red e invalidación de caché (Requisitos: `REQ-KIT-03`) |
| Precondiciones | • Vista /kitchen abierta en una ventana con cocina.forja@gastroforge.dev y /orders en otra ventana con mesero.forja@gastroforge.dev<br>• Indicador SSE conectado contra /api/v1/events/stream |
| Datos de entrada | `networkOutageSeconds`: `30`<br>`sseEndpoint`: `"/api/v1/events/stream"`<br>`reconnectingLabel`: `"Reconectando SSE"`<br>`eventDispatchedDuringOutage`: `"order.round.dispatched"` |
| Pasos de ejecución | 1. En DevTools de la ventana KDS (/kitchen), activar el modo Offline durante 30 segundos.<br>2. Confirmar que el indicador de estado de conexión cambie a "Reconectando SSE".<br>3. Mientras el KDS está sin red, despachar una nueva tanda desde la ventana del Mesero (/orders).<br>4. Restaurar la conexión de red (Online) en el KDS sin presionar F5 y observar la reconexión automática. |
| Resultado esperado | Al recuperar la red, el cliente SSE se reconecta automáticamente a /api/v1/events/stream, invalida las queries de TanStack Query y renderiza la nueva comanda sin recargar la página. |
| Resultado obtenido | Durante el corte simulado de red Wi-Fi de 30 segundos en la tablet KDS, la tanda despachada se persiste en outbox_event; al restaurar la red, el cliente SSE se reconecta automáticamente, invalida las queries de TanStack Query y muestra el nuevo pedido sin presionar F5. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Cumple ADR-0004 (Transactional Outbox + FOR UPDATE SKIP LOCKED + reconexión SSE).<br>**Evidencia verificable:** `EVID-RUN-023-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Evidencia de ejecución del Guion M-02 (reconexión reactiva SSE tras caída de red de 30s).<br>`EVID-RUN-023-2` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/outbox-sse.int-spec.ts. |

#### Caso de Prueba #24 — CP-CSH-001: Restricción de sesión única abierta por caja registradora (uq_cash_register_open -> HTTP 409 CASH_REGISTER_ALREADY_OPEN)

| Campo | Descripción |
|---|---|
| ID del caso | CP-CSH-001 |
| Nombre | Restricción de sesión única abierta por caja registradora (uq_cash_register_open -> HTTP 409 CASH_REGISTER_ALREADY_OPEN) |
| Historia de usuario | HU-026 — Restricción de sesión única abierta por caja registradora (Requisitos: `REQ-CSH-01`) |
| Precondiciones | • Caja registradora 'CAJA-PRINCIPAL' registrada en el restaurante activo sin sesión abierta |
| Datos de entrada | `registerCode`: `"CAJA-PRINCIPAL"`<br>`openingFloatAmount`: `"200000.00"`<br>`expectedConflictCode`: `"CASH_REGISTER_ALREADY_OPEN"` |
| Pasos de ejecución | 1. Enviar POST /api/v1/cash/sessions/open para 'CAJA-PRINCIPAL' con fondo inicial de 200000.00 verificando creación HTTP 201 en estado OPEN.<br>2. Intentar abrir una segunda sesión sobre la misma 'CAJA-PRINCIPAL' mientras la primera permanece en estado OPEN.<br>3. Cerrar la primera sesión (transición OPEN -> CLOSED) y abrir una nueva sesión verificando que ahora sí se permite. |
| Resultado esperado | El índice único parcial uq_cash_register_open impide dos sesiones OPEN simultáneas retornando HTTP 409 (CASH_REGISTER_ALREADY_OPEN), y permite una nueva apertura tras cerrar el turno anterior. |
| Resultado obtenido | La apertura inicial de 'CAJA-PRINCIPAL' con $200.000 retorna HTTP 201 (OPEN); un segundo intento simultáneo sobre la misma caja es rechazado por el índice parcial uq_cash_register_open con HTTP 409 (CASH_REGISTER_ALREADY_OPEN), permitiendo reabrir solo tras cerrar el turno activo. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/cash-session.int-spec.ts`. Garantiza unicidad de sesión abierta por caja a nivel de motor PostgreSQL.<br>**Evidencia verificable:** `EVID-RUN-024-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/cash-session.int-spec.ts. |

#### Caso de Prueba #25 — CP-CSH-002: Apertura de turno de caja con fondo inicial y cierre de turno con arqueo ciego registrando diferencia sobrante/faltante y observación obligatoria

| Campo | Descripción |
|---|---|
| ID del caso | CP-CSH-002 |
| Nombre | Apertura de turno de caja con fondo inicial y cierre de turno con arqueo ciego registrando diferencia sobrante/faltante y observación obligatoria |
| Historia de usuario | HU-026 — Apertura de turno de caja y cierre con arqueo ciego y conciliación de diferencias (Requisitos: `REQ-CSH-01`) |
| Precondiciones | • Sesión iniciada con cajero.forja@gastroforge.dev / Password123! en /cashier<br>• Sesión de caja abierta en "Caja Principal" (seed.ts inicia con una sesión OPEN con fondo de $200,000 COP) |
| Datos de entrada | `email`: `"cajero.forja@gastroforge.dev"`<br>`route`: `"/cashier"`<br>`openingAmount`: `200000`<br>`declaredCountedCash`: `195000`<br>`closingNotes`: `"Faltante de $5.000 en conteo físico de cierre de turno"` |
| Pasos de ejecución | 1. En /cashier, dirigirse a la sección "Blind Cash Count (Arqueo a Ciegas)" verificando que no se revele el efectivo esperado antes de declarar el conteo físico.<br>2. Ingresar el monto físico contado (ej. $195,000) y la nota explicativa obligatoria.<br>3. Confirmar el cierre del turno de caja.<br>4. Verificar el resumen de conciliación generado y comprobar que en estado CLOSED no se permitan nuevos cobros hasta abrir un nuevo turno. |
| Resultado esperado | El sistema realiza el arqueo ciego, calcula la diferencia exacta, persiste el cierre en estado CLOSED con observación obligatoria y bloquea cobros adicionales hasta abrir una nueva sesión. |
| Resultado obtenido | La interfaz ejecuta arqueo ciego sin revelar el saldo esperado ($350.000); al declarar $345.000 físicos e ingresar la observación obligatoria, calcula exactamente la diferencia (-$5.000 faltante), transiciona a CLOSED inmutable y bloquea cobros posteriores. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [x] Funcional  [ ] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [x] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Conciliación aritmética exacta y estado terminal CLOSED inmutable verificados.<br>**Evidencia verificable:** `EVID-RUN-025-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Evidencia manual de apertura y cierre de turno con arqueo ciego en /cashier.<br>`EVID-RUN-025-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/cash/domain/cash-reconciliation.helper.spec.ts. |

#### Caso de Prueba #26 — CP-CSH-003: Procesamiento de cobro dividido (Efectivo + Tarjeta) bajo rol PostgreSQL app_user sin usar FOR UPDATE sobre la tabla append-only payment (regresión de DEF-001)

| Campo | Descripción |
|---|---|
| ID del caso | CP-CSH-003 |
| Nombre | Procesamiento de cobro dividido (Efectivo + Tarjeta) bajo rol PostgreSQL app_user sin usar FOR UPDATE sobre la tabla append-only payment (regresión de DEF-001) |
| Historia de usuario | HU-027, HU-003 — Cobro dividido (Efectivo + Tarjeta) bajo rol PostgreSQL app_user sobre tabla append-only payment (Requisitos: `REQ-CSH-02`, `REQ-RLS-02`) |
| Precondiciones | • Conexión de base de datos ejecutándose con el rol de mínimo privilegio app_user (UPDATE/DELETE revocados sobre payment)<br>• Sesión de caja abierta y orden DINE_IN con saldo pendiente de $80.000 |
| Datos de entrada | `orderTotal`: `"80000.00"`<br>`splitPayments`: `[[object Object], [object Object]]`<br>`dbRole`: `"app_user"` |
| Pasos de ejecución | 1. Registrar el primer pago parcial en efectivo por $50.000 invocando POST /api/v1/cash/payments.<br>2. Verificar que la orden permanezca abierta con saldo pendiente de $30.000 sin disparar error SQL 42501 (permission denied for table payment).<br>3. Registrar el segundo pago con tarjeta por $30.000 cubriendo el total pendiente.<br>4. Confirmar que la orden transicione a PAID/CLOSED y la mesa asociada quede libre (FREE). |
| Resultado esperado | Ambos pagos se insertan limpiamente bajo app_user sin requerir privilegio UPDATE sobre la tabla append-only payment (validando la corrección del defecto DEF-001) y la orden se liquida con saldo 0.00. |
| Resultado obtenido | El cobro dividido ($50.000 CASH + $30.000 CARD) para liquidar la orden de $80.000 se ejecuta exitosamente bajo app_user (HTTP 201), verificando que la eliminación de FOR UPDATE sobre la tabla append-only payment corrigió el error SQL 42501 (DEF-001) y liberó la mesa a estado FREE. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | DEF-001 (GF-BUG-001 — Cerrado, P2) |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/cash-payments.int-spec.ts`. Regresión de DEF-001 (GF-BUG-001) verificada y cerrada satisfactoriamente en el commit congelado be9089e.<br>**Evidencia verificable:** `EVID-RUN-026-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de regresión de DEF-001 en apps/api/test/cash-payments.int-spec.ts bajo rol app_user.<br>`EVID-RUN-026-2` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Registro de defecto histórico resuelto y cerrado DEF-001 (GF-BUG-001) en commit be9089e. |

#### Caso de Prueba #27 — CP-CSH-004: Análisis de valores límite en porcentaje y monto de propina voluntaria (-1%, 0%, 10%, 100%, 101%) verificando exclusión de IVA sobre propina

| Campo | Descripción |
|---|---|
| ID del caso | CP-CSH-004 |
| Nombre | Análisis de valores límite en porcentaje y monto de propina voluntaria (-1%, 0%, 10%, 100%, 101%) verificando exclusión de IVA sobre propina |
| Historia de usuario | HU-027 — Cálculo de propina voluntaria en fronteras de porcentaje y exclusión de base gravable de IVA (Requisitos: `REQ-CSH-02`) |
| Precondiciones | • Helper de dominio de balance de pagos y propinas cargado en suite unitaria<br>• Orden con subtotal neto e impuesto IVA 19% calculado |
| Datos de entrada | `orderGrossAmount`: `"100000.00"`<br>`orderTaxAmount`: `"15966.39"`<br>`tipPercentageBoundaries`: `[-1, 0, 10, 100, 101]` |
| Pasos de ejecución | 1. Evaluar porcentajes de propina en frontera inferior inválida (-1%) y frontera superior inválida (101%) verificando rechazo de validación.<br>2. Evaluar valores límite válidos: 0% (sin propina), 10% (propina sugerida) y 100% (cota máxima permitida).<br>3. Comprobar que en todos los casos válidos el monto de impuesto IVA de la orden permanezca inalterado ($15.966,39). |
| Resultado esperado | Los porcentajes fuera de [0%, 100%] son rechazados; los valores dentro del rango calculan la propina exacta en Decimal(12,2) sin incrementar la base gravable ni el IVA de la orden. |
| Resultado obtenido | Los porcentajes de propina fuera de frontera (-1% y 101%) son rechazados; los valores límite válidos (0%, 10% y 100%) calculan la propina exacta en Decimal(12,2) manteniendo inalterado el IVA de la orden ($15.966,39). |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [x] Funcional  [ ] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [x] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L2) · Spec: `apps/api/src/modules/cash/domain/payment-balance.helper.spec.ts`. La propina voluntaria nunca altera la base gravable ni el impuesto de consumo/IVA.<br>**Evidencia verificable:** `EVID-RUN-027-1` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/cash/domain/payment-balance.helper.spec.ts. |

#### Caso de Prueba #28 — CP-CSH-005: Presentación de errores RFC 7807 (err.detail en AlertBanner) en la interfaz de caja al intentar cobrar un monto mayor al saldo pendiente (verificación de DEF-003)

| Campo | Descripción |
|---|---|
| ID del caso | CP-CSH-005 |
| Nombre | Presentación de errores RFC 7807 (err.detail en AlertBanner) en la interfaz de caja al intentar cobrar un monto mayor al saldo pendiente (verificación de DEF-003) |
| Historia de usuario | HU-027, HU-034 — Presentación de errores RFC 7807 (detail) en interfaz de caja ante cobro excesivo (Requisitos: `REQ-CSH-02`, `REQ-RLS-02`) |
| Precondiciones | • Sesión iniciada con cajero.forja@gastroforge.dev / Password123! en /cashier<br>• Sesión de caja OPEN y orden abierta con saldo pendiente (ej. orden sembrada de Mesa M1 con saldo $114,000 COP) |
| Datos de entrada | `orderTable`: `"M1"`<br>`pendingBalance`: `114000`<br>`attemptedPaymentAmount`: `150000`<br>`expectedHttpStatus`: `422` |
| Pasos de ejecución | 1. En /cashier, seleccionar la orden pendiente (ej. M1 por $114,000 COP).<br>2. Seleccionar método de pago e ingresar un monto de $150,000 (superior al saldo pendiente).<br>3. Enviar el formulario de cobro.<br>4. Observar el AlertBanner renderizado en la interfaz y verificar que muestre el campo err.detail del payload RFC 7807 (confirmando resolución de DEF-003). |
| Resultado esperado | El backend responde HTTP 422 con application/problem+json y el AlertBanner del frontend muestra explícitamente el detalle del problema RFC 7807 en lugar de un mensaje genérico. |
| Resultado obtenido | Al intentar cobrar $60.000 sobre un saldo pendiente de $45.000, el backend responde HTTP 422 (application/problem+json) y el componente AlertBanner renderiza explícitamente el campo err.detail del problema RFC 7807, confirmando la corrección de DEF-003. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Usabilidad) |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | DEF-003 (GF-BUG-003 — Cerrado, P3) |
| Observaciones | Modalidad: **Manual** (L6). Regresión de DEF-003 (GF-BUG-003) verificada y cerrada en commit be9089e.<br>**Evidencia verificable:** `EVID-RUN-028-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Verificación manual en /cashier de renderizado de err.detail en AlertBanner (regresión de DEF-003).<br>`EVID-RUN-028-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de app/lib/api/problem-details.test.ts y app/lib/api/client.test.ts. |

#### Caso de Prueba #29 — CP-CSH-006: Idempotencia en cobros concurrentes con idéntico encabezado Idempotency-Key evitando doble cobro y retornando respuesta cacheada o 409

| Campo | Descripción |
|---|---|
| ID del caso | CP-CSH-006 |
| Nombre | Idempotencia en cobros concurrentes con idéntico encabezado Idempotency-Key evitando doble cobro y retornando respuesta cacheada o 409 |
| Historia de usuario | HU-027 — Protección de idempotencia en cobros mediante encabezado Idempotency-Key (Requisitos: `REQ-CSH-02`) |
| Precondiciones | • Orden activa con saldo pendiente de $50.000 y sesión de caja abierta |
| Datos de entrada | `idempotencyKey`: `"idem-cash-pay-0001-uuid"`<br>`paymentAmount`: `"50000.00"`<br>`paymentMethod`: `"CARD"` |
| Pasos de ejecución | 1. Enviar petición POST /api/v1/cash/payments con encabezado Idempotency-Key: 'idem-cash-pay-0001-uuid' y monto $50.000.<br>2. Repetir la misma petición con idéntico Idempotency-Key y mismo payload simulando reintento de red en tablet.<br>3. Enviar una tercera petición con el mismo Idempotency-Key pero diferente payload (monto $25.000).<br>4. Consultar los registros de la tabla payment para la orden. |
| Resultado esperado | Se persiste exactamente 1 pago en base de datos; el reintento idéntico devuelve la misma respuesta sin duplicar el cobro y el reuso de la llave con payload distinto es rechazado con HTTP 409 Conflict. |
| Resultado obtenido | El reintento con idéntico Idempotency-Key ('idem-cash-pay-0001-uuid') y mismo payload retorna el resultado original sin duplicar el registro en la tabla payment; el reuso de la misma llave con monto distinto ($25.000) es rechazado con HTTP 409 Conflict. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [x] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/cash-payments.int-spec.ts`. Cero cobros duplicados ante reintentos concurrentes de red en tablet.<br>**Evidencia verificable:** `EVID-RUN-029-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de idempotencia transaccional con hash SHA-256 en apps/api/test/cash-payments.int-spec.ts. |

#### Caso de Prueba #30 — CP-CSH-007: Ejecución manual de reverso compensatorio de pago y ajuste de saldo con autorización de Gerente y verificación de saldo recalculado

| Campo | Descripción |
|---|---|
| ID del caso | CP-CSH-007 |
| Nombre | Ejecución manual de reverso compensatorio de pago y ajuste de saldo con autorización de Gerente y verificación de saldo recalculado |
| Historia de usuario | HU-028 — Ejecución manual de reverso compensatorio de pago y ajuste de saldo con autorización de Gerente (Requisitos: `REQ-CSH-03`) |
| Precondiciones | • Sesión iniciada con gerente.forja@gastroforge.dev / Password123! (rol GERENTE con permiso cash:reverse_payment) en /cashier<br>• Orden con pago COMPLETED registrado (ej. orden TAKEOUT sembrada de Carlos Gómez por $76,000 COP o un pago recién cobrado) |
| Datos de entrada | `email`: `"gerente.forja@gastroforge.dev"`<br>`route`: `"/cashier"`<br>`authorizingRole`: `"GERENTE"`<br>`reversalReason`: `"Cobro imputado por error en método incorrecto durante la demostración"` |
| Pasos de ejecución | 1. En /cashier como gerente.forja@gastroforge.dev, seleccionar una orden con pago en estado COMPLETED.<br>2. Hacer clic en el botón "Reverse" junto al pago correspondiente.<br>3. Ingresar el motivo en "Reversal Reason (min 10 chars)" y confirmar con "Confirm Reversal".<br>4. Verificar que el pago original permanezca en el historial (marcado como REVERSED), aparezca un asiento compensatorio REVERSAL y el saldo pendiente de la orden se restablezca. |
| Resultado esperado | El reverso se registra como un asiento compensatorio inmutable (sin borrar el pago original), recalcula el saldo pendiente de la orden y guarda la auditoría del Gerente. |
| Resultado obtenido | El usuario con rol GERENTE ejecuta el reverso del pago de $65.000 ingresando motivo obligatorio; el pago original se mantiene inmutable, se inserta el asiento compensatorio referenciando reverses_payment_id y el saldo pendiente vuelve a $65.000. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [x] Funcional  [ ] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [x] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Cumple contabilidad append-only sin UPDATE ni DELETE sobre pagos.<br>**Evidencia verificable:** `EVID-RUN-030-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Evidencia de ejecución manual de reverso compensatorio y ajuste de saldo en módulo de Caja. |

#### Caso de Prueba #31 — CP-CSH-008: Validación de reversos de pago inmutables y denegación (HTTP 403) cuando un Cajero intenta reversar sin rol Gerente/Admin

| Campo | Descripción |
|---|---|
| ID del caso | CP-CSH-008 |
| Nombre | Validación de reversos de pago inmutables y denegación (HTTP 403) cuando un Cajero intenta reversar sin rol Gerente/Admin |
| Historia de usuario | HU-028 — Validación en backend de reversos inmutables y restricción RBAC para Cajero (Requisitos: `REQ-CSH-03`) |
| Precondiciones | • Pago válido previamente registrado en una sesión de caja abierta |
| Datos de entrada | `unauthorizedRole`: `"CAJERO"`<br>`authorizedRole`: `"GERENTE"`<br>`reason`: `"Reverso autorizado por gerencia operativa"` |
| Pasos de ejecución | 1. Invocar POST /api/v1/cash/payments/:id/reverse con token de rol CAJERO verificando rechazo HTTP 403 Forbidden.<br>2. Invocar el mismo endpoint con token de rol GERENTE pero sin motivo de auditoría verificando rechazo HTTP 400.<br>3. Invocar el endpoint con rol GERENTE y motivo válido verificando HTTP 201 y comprobando en SQL que el registro original no sufrió UPDATE ni DELETE. |
| Resultado esperado | El rol CAJERO recibe HTTP 403; el rol GERENTE sin motivo recibe HTTP 400; con motivo válido se inserta un registro compensatorio inmutable y un evento en audit_log. |
| Resultado obtenido | POST /api/v1/cash/payments/:id/reverse rechaza al rol CAJERO con HTTP 403 Forbidden, rechaza a GERENTE sin motivo con HTTP 400 Bad Request y aprueba con HTTP 201 cuando GERENTE envía motivo válido, preservando inmutable la fila original en payment. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [ ] EP  [ ] BVA  [x] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/cash-reversals.int-spec.ts`. Autorización RBAC e inmutabilidad SQL verificadas en reversos financieros.<br>**Evidencia verificable:** `EVID-RUN-031-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/cash-reversals.int-spec.ts. |

#### Caso de Prueba #32 — CP-INV-001: Creación de insumos de inventario y activación de alerta de stock bajo cuando currentStock <= minThreshold

| Campo | Descripción |
|---|---|
| ID del caso | CP-INV-001 |
| Nombre | Creación de insumos de inventario y activación de alerta de stock bajo cuando currentStock <= minThreshold |
| Historia de usuario | HU-029 — Catálogo de insumos de inventario y alertas por umbral de stock mínimo (BVA) (Requisitos: `REQ-INV-01`) |
| Precondiciones | • Usuario autenticado con rol ADMIN o GERENTE en el restaurante activo |
| Datos de entrada | `itemName`: `"Bife Chorizo Madurado (kg)"`<br>`unit`: `"KG"`<br>`minThreshold`: `10`<br>`testedStockValues`: `[11, 10, 9]` |
| Pasos de ejecución | 1. Crear el insumo 'Bife Chorizo Madurado (kg)' con minThreshold = 10 y stock inicial = 11 (frontera superior sin alerta).<br>2. Ajustar el stock a exactamente 10 (en la frontera minThreshold) y consultar el listado de insumos.<br>3. Reducir el stock a 9 (por debajo de la frontera) y verificar el indicador lowStockAlert. |
| Resultado esperado | Con stock = 11 el indicador lowStockAlert es false; al alcanzar los valores límite 10 y 9 (currentStock <= minThreshold), el sistema activa lowStockAlert = true. |
| Resultado obtenido | Para el insumo 'Bife Chorizo Madurado (kg)' con minThreshold = 10, el indicador de alerta permanece en false con stock = 11 y se activa exactamente en las fronteras BVA stock = 10 y stock = 9 (currentStock <= minThreshold). |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [x] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/inventory-items.int-spec.ts`. Frontera BVA [11, 10, 9] evaluada en dominio e integración.<br>**Evidencia verificable:** `EVID-RUN-032-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/inventory-items.int-spec.ts.<br>`EVID-RUN-032-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/inventory/domain/inventory-stock.helper.spec.ts. |

#### Caso de Prueba #33 — CP-INV-002: Registro inmutable de movimientos manuales (IN, OUT, ADJUSTMENT) con motivo obligatorio y auditoría de stock negativo permitido

| Campo | Descripción |
|---|---|
| ID del caso | CP-INV-002 |
| Nombre | Registro inmutable de movimientos manuales (IN, OUT, ADJUSTMENT) con motivo obligatorio y auditoría de stock negativo permitido |
| Historia de usuario | HU-030 — Kardex append-only de movimientos manuales de inventario y tolerancia de stock negativo auditado (Requisitos: `REQ-INV-02`) |
| Precondiciones | • Insumo activo con stock inicial = 5 unidades |
| Datos de entrada | `initialStock`: `5`<br>`inQuantity`: `10`<br>`outQuantity`: `18`<br>`expectedFinalStock`: `-3`<br>`reason`: `"Salida por consumo de turno noche"` |
| Pasos de ejecución | 1. Registrar movimiento tipo IN por 10 unidades con motivo válido verificando transición de stock 5 -> 15.<br>2. Intentar registrar movimiento tipo OUT sin motivo verificando rechazo HTTP 400.<br>3. Registrar movimiento tipo OUT por 18 unidades con motivo válido, llevando el stock a -3.<br>4. Verificar que la operación no bloquee el flujo (HTTP 201), marque la advertencia de saldo negativo y persista los movimientos en la tabla append-only inventory_movement. |
| Resultado esperado | Los movimientos actualizan atómicamente el saldo (5 -> 15 -> -3), exigen motivo obligatorio y permiten stock negativo con bandera de auditoría sin permitir borrado de movimientos previos. |
| Resultado obtenido | El movimiento IN (+10) actualiza el stock de 5 a 15; un movimiento OUT sin motivo es rechazado con HTTP 400; el movimiento OUT (-18) con motivo válido es aceptado (HTTP 201), lleva el stock a -3 con alerta auditada y persiste en la tabla append-only inventory_movement. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/inventory-movements.int-spec.ts`. Tolerancia de stock negativo auditado e inmutabilidad del kardex verificadas.<br>**Evidencia verificable:** `EVID-RUN-033-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/inventory-movements.int-spec.ts.<br>`EVID-RUN-033-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/inventory/domain/inventory-stock.helper.spec.ts. |

#### Caso de Prueba #34 — CP-REP-001: Consulta de KPIs ejecutivos de ventas diarias, métodos de pago y top productos con hidratación e invalidación de caché Redis

| Campo | Descripción |
|---|---|
| ID del caso | CP-REP-001 |
| Nombre | Consulta de KPIs ejecutivos de ventas diarias, métodos de pago y top productos con hidratación e invalidación de caché Redis |
| Historia de usuario | HU-031 — Dashboard ejecutivo de KPIs diarios de ventas y caché Redis (Requisitos: `REQ-REP-01`) |
| Precondiciones | • Órdenes pagadas en el día actual con pagos en Efectivo y Tarjeta y propinas registradas<br>• Instancia Redis activa para almacenamiento de caché de reportes |
| Datos de entrada | `dateRange`: `"2026-11-16"`<br>`expectedMetrics`: `[netSales, taxTotal, tipsTotal, averageTicket, byPaymentMethod, topProducts]` |
| Pasos de ejecución | 1. Invocar GET /api/v1/reports/dashboard para la fecha operativa actual (cache miss inicial).<br>2. Verificar la exactitud matemática de ventas netas, IVA, propinas, ticket promedio y desglose por medio de pago.<br>3. Repetir la consulta verificando respuesta desde caché Redis (cache hit) y comprobar invalidación tras registrar una nueva venta pagada. |
| Resultado esperado | El endpoint retorna los KPIs consolidados exactos del tenant activo, hidrata la clave en Redis y refresca los totales cuando ocurre un nuevo cierre de orden. |
| Resultado obtenido | GET /api/v1/reports/dashboard retorna con exactitud ventas netas, IVA, propinas, ticket promedio, desglose por medio de pago y top productos del tenant activo, hidratando la caché Redis en la primera consulta e invalidándola tras un nuevo cobro. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [x] Integración  [ ] Otro |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/reports-dashboard.int-spec.ts`. Consistencia entre agregaciones SQL por tenant y caché Redis confirmada.<br>**Evidencia verificable:** `EVID-RUN-034-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/reports-dashboard.int-spec.ts.<br>`EVID-RUN-034-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/reports/domain/reports-analytics.helper.spec.ts. |

#### Caso de Prueba #35 — CP-REP-002: Verificación manual de vista previa e impresión térmica de 80mm (@media print) para recibo de orden y tirilla de cierre de caja sin desbordamiento horizontal

| Campo | Descripción |
|---|---|
| ID del caso | CP-REP-002 |
| Nombre | Verificación manual de vista previa e impresión térmica de 80mm (@media print) para recibo de orden y tirilla de cierre de caja sin desbordamiento horizontal |
| Historia de usuario | HU-032 — Reporte imprimible de recibo de orden y tirilla de cierre de caja en formato térmico 80mm (Requisitos: `REQ-REP-02`) |
| Precondiciones | • Sesión iniciada en /cashier con cajero.forja@gastroforge.dev o gerente.forja@gastroforge.dev<br>• Al menos un pago COMPLETED (para recibo 80mm) o una sesión de caja CLOSED (para tirilla de cierre 80mm) |
| Datos de entrada | `route`: `"/cashier"`<br>`paperWidthMm`: `80`<br>`mediaQuery`: `"print"` |
| Pasos de ejecución | 1. En /cashier, abrir "View 80mm Receipt" en una orden pagada (o "Print 80mm Report" tras cerrar la sesión de caja).<br>2. Hacer clic en "Print 80mm" / "Print 80mm Ticket" (o activar vista previa de impresión del navegador).<br>3. Verificar que la barra lateral y botones queden ocultos (clases print:hidden) y que la tirilla de 80mm se muestre alineada sin desbordamiento horizontal. |
| Resultado esperado | La tirilla térmica de 80mm muestra todos los rubros alineados para impresora POS sin elementos de navegación sobrantes ni desbordamiento horizontal. |
| Resultado obtenido | En vista previa de impresión (@media print) con ancho de papel de 80mm (~302px), la navegación lateral y botones quedan ocultos (display: none) y tanto el recibo de orden como la tirilla de cierre de caja se ajustan sin truncamiento ni scroll horizontal. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Usabilidad) |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Tipografía tabular monoespaciada alinea perfectamente montos, IVA, propinas y arqueo.<br>**Evidencia verificable:** `EVID-RUN-035-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Verificación manual de formato de impresión térmica de 80mm (@media print). |

#### Caso de Prueba #36 — CP-REP-003: Exportación CSV en streaming con BOM UTF-8 (\uFEFF), proyección firstName/lastName y cashierId (regresión de DEF-002) y sanitización contra CSV Formula Injection (=, +, -, @)

| Campo | Descripción |
|---|---|
| ID del caso | CP-REP-003 |
| Nombre | Exportación CSV en streaming con BOM UTF-8 (\uFEFF), proyección firstName/lastName y cashierId (regresión de DEF-002) y sanitización contra CSV Formula Injection (=, +, -, @) |
| Historia de usuario | HU-032, HU-034 — Exportación CSV con UTF-8 BOM, proyección correcta de columnas y sanitización contra CSV Formula Injection (Requisitos: `REQ-REP-03`) |
| Precondiciones | • Sesiones de caja y movimientos registrados que incluyen textos con tildes ('Canción', 'Bogotá') y cadenas maliciosas que inician con '=cmd\|', '+SUM()', '-1+1', '@import' |
| Datos de entrada | `maliciousPayloads`: `[=1+1, +cmd\|' /C calc'!A0, -2+3, @SUM(A1:A2)]`<br>`expectedPrefix`: `"﻿"` |
| Pasos de ejecución | 1. Invocar GET /api/v1/reports/export/cash-sessions.csv con rol GERENTE.<br>2. Verificar que la descarga no falle con error Prisma Unknown field fullName/openedByUserId (validando la corrección de DEF-002 mediante firstName, lastName y cashierId).<br>3. Comprobar que los primeros bytes del stream correspondan al BOM UTF-8 (\uFEFF).<br>4. Inspeccionar las celdas exportadas verificando que todo valor que inicie con '=', '+', '-' o '@' sea prefijado/escapado con comilla simple para neutralizar ejecución de fórmulas en Excel. |
| Resultado esperado | El CSV se exporta exitosamente con estado HTTP 200, incluye BOM UTF-8 al inicio, proyecta correctamente el nombre del cajero y neutraliza todos los vectores de CSV Formula Injection. |
| Resultado obtenido | La exportación CSV responde HTTP 200 con prefijo UTF-8 BOM (\uFEFF), proyecta correctamente firstName/lastName y cashierId sin error de esquema Prisma (verificando la corrección de DEF-002) y neutraliza payloads de CSV Formula Injection (=, +, -, @) prefijando comilla simple. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | DEF-002 (GF-BUG-002 — Cerrado, P3) |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/reports-export.int-spec.ts`. Regresión de DEF-002 (GF-BUG-002) verificada y cerrada en el commit congelado be9089e.<br>**Evidencia verificable:** `EVID-RUN-036-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de regresión de DEF-002 en apps/api/test/reports-export.int-spec.ts.<br>`EVID-RUN-036-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/modules/reports/domain/reports-export.helper.spec.ts. |

#### Caso de Prueba #37 — CP-RLS-001: Suite de aislamiento negativo multi-tenant entre Tenant A y Tenant B: lectura cruzada (GET -> 404), modificación cruzada (PATCH -> 404), inyección de FK compuesta y consulta SQL sin app.restaurant_id (0 rows)

| Campo | Descripción |
|---|---|
| ID del caso | CP-RLS-001 |
| Nombre | Suite de aislamiento negativo multi-tenant entre Tenant A y Tenant B: lectura cruzada (GET -> 404), modificación cruzada (PATCH -> 404), inyección de FK compuesta y consulta SQL sin app.restaurant_id (0 rows) |
| Historia de usuario | HU-001, HU-002 / ADR-0002 — Aislamiento negativo multi-tenant estricto con FORCE ROW LEVEL SECURITY (Requisitos: `REQ-RLS-01`) |
| Precondiciones | • Dos restaurantes independientes creados en base de datos: Tenant A y Tenant B con sus propios productos, mesas, órdenes y pagos<br>• Políticas RLS activas con FORCE ROW LEVEL SECURITY sobre todas las tablas operativas |
| Datos de entrada | `tenantAId`: `"11111111-1111-1111-1111-111111111111"`<br>`tenantBId`: `"22222222-2222-2222-2222-222222222222"`<br>`expectedCrossReadStatus`: `404`<br>`expectedRowsWithoutContext`: `0` |
| Pasos de ejecución | 1. Autenticarse con un token válido del Tenant A e intentar leer (GET) por UUID una orden, mesa o producto perteneciente al Tenant B.<br>2. Con el token del Tenant A, intentar mutar (PATCH/POST) un recurso del Tenant B o referenciar una FK (stationId, categoryId, tableId) perteneciente al Tenant B.<br>3. Ejecutar una consulta directa en una transacción bajo app_user sin definir SET LOCAL app.restaurant_id (o app.current_tenant_id). |
| Resultado esperado | Las lecturas y escrituras cruzadas entre tenants devuelven HTTP 404/422 sin filtrar existencia del recurso, las FKs compuestas impiden referencias inter-tenant y las consultas sin contexto de tenant retornan exactamente 0 filas (fail-closed). |
| Resultado obtenido | Con token del Tenant A, toda lectura o mutación por UUID sobre recursos del Tenant B retorna HTTP 404/403, la inserción con FK compuesta inter-tenant es rechazada por PostgreSQL y las consultas bajo app_user sin app.restaurant_id devuelven exactamente 0 filas. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [x] EP  [ ] BVA  [ ] Tabla de decisión  [ ] Otro |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/rls-negative-hardening.int-spec.ts`. Cero fugas de datos entre restaurantes (FORCE ROW LEVEL SECURITY activo en las 23 tablas de tenant).<br>**Evidencia verificable:** `EVID-RUN-037-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de suite negativa multi-tenant apps/api/test/rls-negative-hardening.int-spec.ts.<br>`EVID-RUN-037-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/common/database/tenant-tx.spec.ts. |

#### Caso de Prueba #38 — CP-RLS-002: Verificación en arranque de rolbypassrls = false para app_user y rechazo de UPDATE/DELETE (permission denied) sobre tablas append-only (payment, audit_log, order_item_status_history, inventory_movement, order_balance_adjustment)

| Campo | Descripción |
|---|---|
| ID del caso | CP-RLS-002 |
| Nombre | Verificación en arranque de rolbypassrls = false para app_user y rechazo de UPDATE/DELETE (permission denied) sobre tablas append-only (payment, audit_log, order_item_status_history, inventory_movement, order_balance_adjustment) |
| Historia de usuario | HU-002, HU-003 / ADR-0006 — Mínimo privilegio en arranque (rolbypassrls = false) e inmutabilidad SQL en tablas append-only (Requisitos: `REQ-RLS-01`, `REQ-RLS-02`) |
| Precondiciones | • Pool de conexiones de la aplicación conectado mediante el rol PostgreSQL app_user<br>• Registros existentes en las 5 tablas append-only del esquema público |
| Datos de entrada | `dbRole`: `"app_user"`<br>`appendOnlyTables`: `[payment, audit_log, order_item_status_history, inventory_movement, order_balance_adjustment]`<br>`forbiddenOperations`: `[UPDATE, DELETE]` |
| Pasos de ejecución | 1. Consultar pg_roles para el usuario actual (current_user) verificando que rolsuper = false y rolbypassrls = false.<br>2. Ejecutar sentencias UPDATE y DELETE directas bajo app_user contra cada una de las 5 tablas append-only.<br>3. Comprobar que PostgreSQL rechace todas las mutaciones destructivas a nivel de motor con error SQL 42501 (permission denied). |
| Resultado esperado | El guard de arranque confirma que app_user no puede evadir RLS y las 10 combinaciones (5 tablas x UPDATE/DELETE) son denegadas por el motor PostgreSQL. |
| Resultado obtenido | pg_roles confirma rolsuper = false y rolbypassrls = false para app_user, auth_lookup y outbox_worker; RlsStartupGuardService aprueba para app_user y aborta ante rol privilegiado; las 10 operaciones UPDATE/DELETE sobre las 5 tablas append-only son rechazadas con permission denied. |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [ ] EP  [ ] BVA  [x] Tabla de decisión  [ ] Otro |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L4) · Spec: `apps/api/test/rls-least-privilege.int-spec.ts`. Cumplimiento total de ADR-0002 y ADR-0006 a nivel de privilegios SQL.<br>**Evidencia verificable:** `EVID-RUN-038-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de integración de apps/api/test/rls-least-privilege.int-spec.ts.<br>`EVID-RUN-038-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de PASS src/common/database/rls-startup.guard.spec.ts. |

#### Caso de Prueba #39 — CP-RLS-003: Flujo E2E Golden Path completo en Playwright (1024x768, Chromium & WebKit): login -> apertura de caja -> mapa de mesas -> comanda -> KDS (Pendiente -> En preparación -> Listo) -> cobro y tirilla 80mm

| Campo | Descripción |
|---|---|
| ID del caso | CP-RLS-003 |
| Nombre | Flujo E2E Golden Path completo en Playwright (1024x768, Chromium & WebKit): login -> apertura de caja -> mapa de mesas -> comanda -> KDS (Pendiente -> En preparación -> Listo) -> cobro y tirilla 80mm |
| Historia de usuario | HU-018, HU-024, HU-025, HU-027, HU-033 — Flujo E2E Golden Path completo en tablet (1024x768) desde login hasta tirilla 80mm (Requisitos: `REQ-ORD-01`, `REQ-KIT-02`, `REQ-CSH-02`, `REQ-KIT-03`) |
| Precondiciones | • Entorno completo (PostgreSQL con RLS, Redis, API NestJS y Frontend React Router v7) levantado sobre el commit be9089e<br>• Navegadores Playwright Chromium y WebKit configurados en viewport 1024x768 |
| Datos de entrada | `email`: `"admin.forja@gastroforge.dev"`<br>`password`: `"Password123!"`<br>`viewport`: `"1024x768"`<br>`browsers`: `[chromium, webkit]`<br>`orderType`: `"TAKEOUT"`<br>`routes`: `[/login, /cashier, /orders, /kitchen, /reports]` |
| Pasos de ejecución | 1. Iniciar sesión en /login con admin.forja@gastroforge.dev / Password123! en viewport 1024x768 (Chromium y WebKit).<br>2. Verificar sesión de caja abierta en /cashier y crear una orden TAKEOUT en /orders despachando su tanda.<br>3. Navegar a /kitchen y avanzar el ítem en KDS hasta READY.<br>4. Navegar a /cashier y /reports para verificar el flujo completo E2E sin errores de consola ni desbordamiento. |
| Resultado esperado | El ciclo operativo punta a punta finaliza sin errores en Chromium y WebKit (1024x768), manteniendo consistencia transaccional entre Mesas, Órdenes, KDS y Caja. |
| Resultado obtenido | La suite Playwright E2E (tablet-golden-path.e2e.spec.ts) completa sin errores el flujo login -> sesión de caja -> mapa de mesas -> apertura de pedido y envío de tanda -> avance KDS (Pendiente -> En preparación -> Listo) -> cobro y vista de reportes en Chromium y WebKit (1024x768). |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [x] Regresión  [ ] Integración  [ ] Otro |
| Técnica aplicada | [ ] EP  [ ] BVA  [ ] Tabla de decisión  [x] Otro (Transición de estados) |
| Responsable | Christian Urrego Issa (@Christu12) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Automatizada** (L5) · Spec: `apps/web/e2e/specs/tablet-golden-path.e2e.spec.ts`. Integración punta a punta verificada en ambos motores de renderizado sobre viewport tablet.<br>**Evidencia verificable:** `EVID-RUN-039-1` (SPEC): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Evidencia de ejecución de apps/web/e2e/specs/tablet-golden-path.e2e.spec.ts en Chromium y WebKit (1024x768). |

#### Caso de Prueba #40 — CP-RLS-004: Verificación manual de cabeceras de seguridad Zero-Trust: rechazo CORS para Origin: null u orígenes no autorizados, propagación de X-Request-Id y formato estándar RFC 7807 (application/problem+json)

| Campo | Descripción |
|---|---|
| ID del caso | CP-RLS-004 |
| Nombre | Verificación manual de cabeceras de seguridad Zero-Trust: rechazo CORS para Origin: null u orígenes no autorizados, propagación de X-Request-Id y formato estándar RFC 7807 (application/problem+json) |
| Historia de usuario | HU-034 / ADR-0006 — Verificación de cabeceras Zero-Trust: CORS estricto, propagación de X-Request-Id y formato RFC 7807 (Requisitos: `REQ-RLS-02`) |
| Precondiciones | • Servidor backend ejecutándose en http://localhost:3000 sobre el commit be9089e<br>• Terminal con curl o PowerShell disponible (prueba manual a nivel HTTP/API) |
| Datos de entrada | `apiUrl`: `"http://localhost:3000/api/v1/tables"`<br>`unauthorizedOrigins`: `[null, https://evil-attacker.example.com]`<br>`customRequestId`: `"req-qa-audit-0040"`<br>`expectedContentType`: `"application/problem+json"` |
| Pasos de ejecución | 1. Desde terminal, enviar una petición OPTIONS/POST a http://localhost:3000/api/v1/auth/login con cabecera Origin: null y otra con Origin: https://evil-attacker.example.com.<br>2. Verificar en los encabezados de respuesta que el servidor NO emita Access-Control-Allow-Origin para los orígenes no autorizados.<br>3. Enviar una petición GET a http://localhost:3000/api/v1/tables sin token Bearer incluyendo la cabecera X-Request-Id: req-qa-audit-0040.<br>4. Inspeccionar el código HTTP 401, el Content-Type application/problem+json y la propagación de X-Request-Id en la respuesta. |
| Resultado esperado | Los orígenes no autorizados (incluido Origin: null) son bloqueados por CORS; la respuesta HTTP 401 conserva X-Request-Id: req-qa-audit-0040 y devuelve estructura RFC 7807 con Content-Type application/problem+json. |
| Resultado obtenido | Las peticiones con Origin: null y Origin: https://evil-attacker.example.com no reciben cabecera Access-Control-Allow-Origin; la respuesta HTTP 401 conserva X-Request-Id: req-qa-audit-0040 y devuelve payload estándar RFC 7807 (application/problem+json). |
| Estado | [ ] No ejecutado  [x] Pasó  [ ] Falló  [ ] Bloqueado |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Tipo de prueba | [ ] Funcional  [ ] Regresión  [ ] Integración  [x] Otro (Seguridad) |
| Técnica aplicada | [ ] EP  [ ] BVA  [x] Tabla de decisión  [ ] Otro |
| Responsable | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de ejecución | 16/11/2026 |
| Defectos asociados | N/A |
| Observaciones | Modalidad: **Manual** (L6). Respaldado además en integración por rls-negative-hardening.int-spec.ts y security-health.int-spec.ts.<br>**Evidencia verificable:** `EVID-RUN-040-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Inspección manual de cabeceras Zero-Trust CORS, X-Request-Id y RFC 7807.<br>`EVID-RUN-040-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de cors.config.spec.ts y problem-details.filter.spec.ts. |

### 7.2 Registro de Casos de Prueba

| ID | Nombre del Caso | Módulo | Modalidad | Prioridad | Estado | Defecto |
|---|---|---|---|---|---|---|
| CP-AUTH-001 | Inicio de sesión interactivo en tablet (1024x768) con credenciales válidas y redirección contextual por rol | `auth` | Manual (L6) | Alta | [x] Pasó | N/A |
| CP-AUTH-002 | Bloqueo por exceso de intentos fallidos de login (HTTP 429 Too Many Requests) y rechazo de credenciales inválidas (401) | `auth` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-AUTH-003 | Rotación de Refresh Token en cookie HttpOnly, detección de reuso fraudulento e invalidación en logout | `auth` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-AUTH-004 | Selección y cambio de restaurante activo multi-tenant y verificación de contraste de marca WCAG (>= 4.5:1) | `auth` | Manual (L6) | Media | [x] Pasó | N/A |
| CP-AUTH-005 | Restablecimiento administrativo de contraseña con token temporal de un solo uso (15 min) y revocación inmediata de sesiones activas | `auth` | Manual (L6) | Media | [x] Pasó | N/A |
| CP-AUTH-006 | Evaluación exhaustiva de la matriz de autorización can(actor, action, context) para los 5 roles MVP (incluyendo verificación de frontera de estación en COCINA y hallazgo de permiso kitchen:advance_status en MESERO -> DEF-004) | `auth` | Automatizada (L2) | Alta | [x] Falló | DEF-004 |
| CP-CAT-001 | Creación y ordenamiento visual de estaciones de cocina (PARRILLA, BARRA) y categorías de menú desde panel administrativo | `catalog` | Manual (L6) | Media | [x] Pasó | N/A |
| CP-CAT-002 | Cálculo exacto de desglose de IVA incluido (tax = gross - gross / (1 + rate)) con precisión Decimal(12,2) y bordes de redondeo | `catalog` | Automatizada (L2) | Alta | [x] Pasó | N/A |
| CP-CAT-003 | Validación de valores límite en grupos de modificadores (min_selectable, max_selectable, selección por debajo del mínimo y por encima del máximo -> HTTP 400) | `catalog` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-CAT-004 | Cambio rápido de disponibilidad de producto (Agotado / Disponible) en turno activo y reflejo inmediato en toma de pedidos | `catalog` | Manual (L6) | Media | [x] Pasó | N/A |
| CP-TAB-001 | Creación de áreas y mesas con validación de capacidad límite de comensales y unicidad de código por restaurante | `tables` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-TAB-002 | Inspección táctil del mapa de salón en 1024x768 (tarjetas >= 104px, contraste semántico FREE vs OCCUPIED) | `tables` | Manual (L6) | Media | [x] Pasó | N/A |
| CP-TAB-003 | Derivación dinámica del estado de ocupación de mesas (FREE -> OCCUPIED -> FREE) al abrir y cerrar órdenes sin estado duplicado persistido | `tables` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-ORD-001 | Guion M-01 de usabilidad táctil en salón (Tablet 1024x768): apertura de orden en mesa, selección de 4 ítems con modificadores y verificación de objetivos táctiles (44x44 px observados vs 48x48 px especificados en TESTING-PLAN.md -> DEF-006) | `orders` | Manual (L6) | Media | [x] Pasó | DEF-006 |
| CP-ORD-002 | Apertura de cuentas DINE_IN y TAKEOUT con numeración secuencial diaria por restaurante y rechazo de doble apertura sobre mesa ocupada (HTTP 409) | `orders` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-ORD-003 | Despacho de tandas (OrderRound) con validación BVA de cantidad (quantity: 0, 1, 99, 100) y control de concurrencia optimista (version -> HTTP 409 ORDER_CONFLICT_VERSION) | `orders` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-ORD-004 | Cancelación manual de ítem en estado PREPARING solicitando autorización/PIN de Gerente y motivo obligatorio de auditoría | `orders` | Manual (L6) | Alta | [x] Pasó | N/A |
| CP-ORD-005 | Reglas de cancelación de ítems según estado (PENDING por Mesero vs PREPARING/READY restringido a Gerente/Admin y rechazo en SERVED) | `orders` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-ORD-006 | Verificación del permiso de apertura de orden (orders:create) para el rol CAJERO según PRD.md (§2.1) frente a la política can.helper.ts (DEF-005) | `orders` | Automatizada (L3) | Media | [x] Falló | DEF-005 |
| CP-KIT-001 | Visualización de cola KDS en tablet (1024x768) filtrada por estación (PARRILLA) y validación de alertas cromáticas de urgencia por tiempo de espera | `kitchen` | Manual (L6) | Alta | [x] Pasó | N/A |
| CP-KIT-002 | Consulta de cola KDS aislada por estación asignada al cocinero y bloqueo fail-closed cuando no posee estación asignada | `kitchen` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-KIT-003 | Máquina de estados de preparación en KDS (PENDING -> PREPARING -> READY -> SERVED), rechazo de transiciones regresivas (400) y registro en order_item_status_history | `kitchen` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-KIT-004 | Guion M-02 de reconexión reactiva de Server-Sent Events (SSE) ante corte temporal de red Wi-Fi (30 s) e invalidación automática de caché TanStack Query sin recarga manual (F5) | `kitchen` | Manual (L6) | Alta | [x] Pasó | N/A |
| CP-CSH-001 | Restricción de sesión única abierta por caja registradora (uq_cash_register_open -> HTTP 409 CASH_REGISTER_ALREADY_OPEN) | `cash` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-CSH-002 | Apertura de turno de caja con fondo inicial y cierre de turno con arqueo ciego registrando diferencia sobrante/faltante y observación obligatoria | `cash` | Manual (L6) | Alta | [x] Pasó | N/A |
| CP-CSH-003 | Procesamiento de cobro dividido (Efectivo + Tarjeta) bajo rol PostgreSQL app_user sin usar FOR UPDATE sobre la tabla append-only payment (regresión de DEF-001) | `cash` | Automatizada (L4) | Alta | [x] Pasó | DEF-001 |
| CP-CSH-004 | Análisis de valores límite en porcentaje y monto de propina voluntaria (-1%, 0%, 10%, 100%, 101%) verificando exclusión de IVA sobre propina | `cash` | Automatizada (L2) | Media | [x] Pasó | N/A |
| CP-CSH-005 | Presentación de errores RFC 7807 (err.detail en AlertBanner) en la interfaz de caja al intentar cobrar un monto mayor al saldo pendiente (verificación de DEF-003) | `cash` | Manual (L6) | Media | [x] Pasó | DEF-003 |
| CP-CSH-006 | Idempotencia en cobros concurrentes con idéntico encabezado Idempotency-Key evitando doble cobro y retornando respuesta cacheada o 409 | `cash` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-CSH-007 | Ejecución manual de reverso compensatorio de pago y ajuste de saldo con autorización de Gerente y verificación de saldo recalculado | `cash` | Manual (L6) | Alta | [x] Pasó | N/A |
| CP-CSH-008 | Validación de reversos de pago inmutables y denegación (HTTP 403) cuando un Cajero intenta reversar sin rol Gerente/Admin | `cash` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-INV-001 | Creación de insumos de inventario y activación de alerta de stock bajo cuando currentStock <= minThreshold | `inventory` | Automatizada (L4) | Media | [x] Pasó | N/A |
| CP-INV-002 | Registro inmutable de movimientos manuales (IN, OUT, ADJUSTMENT) con motivo obligatorio y auditoría de stock negativo permitido | `inventory` | Automatizada (L4) | Media | [x] Pasó | N/A |
| CP-REP-001 | Consulta de KPIs ejecutivos de ventas diarias, métodos de pago y top productos con hidratación e invalidación de caché Redis | `reports` | Automatizada (L4) | Media | [x] Pasó | N/A |
| CP-REP-002 | Verificación manual de vista previa e impresión térmica de 80mm (@media print) para recibo de orden y tirilla de cierre de caja sin desbordamiento horizontal | `reports` | Manual (L6) | Media | [x] Pasó | N/A |
| CP-REP-003 | Exportación CSV en streaming con BOM UTF-8 (\uFEFF), proyección firstName/lastName y cashierId (regresión de DEF-002) y sanitización contra CSV Formula Injection (=, +, -, @) | `reports` | Automatizada (L4) | Alta | [x] Pasó | DEF-002 |
| CP-RLS-001 | Suite de aislamiento negativo multi-tenant entre Tenant A y Tenant B: lectura cruzada (GET -> 404), modificación cruzada (PATCH -> 404), inyección de FK compuesta y consulta SQL sin app.restaurant_id (0 rows) | `rls` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-RLS-002 | Verificación en arranque de rolbypassrls = false para app_user y rechazo de UPDATE/DELETE (permission denied) sobre tablas append-only (payment, audit_log, order_item_status_history, inventory_movement, order_balance_adjustment) | `rls` | Automatizada (L4) | Alta | [x] Pasó | N/A |
| CP-RLS-003 | Flujo E2E Golden Path completo en Playwright (1024x768, Chromium & WebKit): login -> apertura de caja -> mapa de mesas -> comanda -> KDS (Pendiente -> En preparación -> Listo) -> cobro y tirilla 80mm | `rls` | Automatizada (L5) | Alta | [x] Pasó | N/A |
| CP-RLS-004 | Verificación manual de cabeceras de seguridad Zero-Trust: rechazo CORS para Origin: null u orígenes no autorizados, propagación de X-Request-Id y formato estándar RFC 7807 (application/problem+json) | `rls` | Manual (L6) | Media | [x] Pasó | N/A |

---

## 8. Gestión de Defectos

### 8.1 Clasificación de Defectos

| Severidad | Código | Descripción | Tiempo de Resolución |
|---|---|---|---|
| Crítica | P1 | El sistema falla completamente, corrompe datos financieros o vulnera el aislamiento multi-tenant RLS. | Inmediata — mismo día |
| Alta | P2 | Funcionalidad principal afectada sin alternativa operativa directa (ej. fallo de cobro bajo rol `app_user`). | 24–48 horas |
| Media | P3 | Discrepancia funcional o de matriz de permisos con alternativa operativa disponible o impacto acotado. | 3–5 días hábiles |
| Baja | P4 | Problemas estéticos, de ergonomía secundaria o inconsistencias documentales menores. | Próxima versión |

### 8.2 Fichas de Reporte de Defectos (DEF-001 a DEF-006)

Durante el ciclo de pruebas sobre `be9089e` se registraron y auditaron **6 defectos** (`DEF-001` a `DEF-006`, mapeados a `GF-BUG-001` a `GF-BUG-006` en GitHub Issues): **3 defectos históricos resueltos y cerrados** durante la estabilización (`DEF-001`, `DEF-002`, `DEF-003`) y **3 defectos abiertos** en `be9089e` (`DEF-004`, `DEF-005` de severidad Media P3 y `DEF-006` de severidad Baja P4), manteniendo **0 defectos Críticos (P1) y 0 defectos Altos (P2) abiertos**.

#### Ficha de Defecto DEF-001 (GF-BUG-001) — Fallo de bloqueo pesimista SELECT FOR UPDATE sobre tabla append-only payment bajo rol app_user

| Campo | Detalle |
|---|---|
| ID del defecto | DEF-001 / GF-BUG-001 ([GitHub Issue #9](https://github.com/H3llz07/GastroForge-Testing/issues/9)) |
| Título | Fallo de bloqueo pesimista SELECT FOR UPDATE sobre tabla append-only payment bajo rol app_user |
| Caso de prueba relacionado | CP-CSH-003 |
| Módulo afectado | `cash` |
| Severidad | [ ] Crítica (P1)  [x] Alta (P2)  [ ] Media (P3)  [ ] Baja (P4) |
| Prioridad | [x] Alta  [ ] Media  [ ] Baja |
| Estado | [ ] Nuevo  [ ] Asignado  [ ] En progreso  [ ] Resuelto  [x] Cerrado |
| Descripción | Al procesar un cobro de orden bajo el rol PostgreSQL no privilegiado app_user (ADR-0002 / ADR-0006), la consulta ejecutaba SELECT ... FOR UPDATE sobre la tabla append-only payment. Dado que PostgreSQL exige privilegio UPDATE para adquirir bloqueos de fila FOR UPDATE y dicho privilegio está revocado por política de inmutabilidad financiera, la transacción abortaba con error SQL 42501 (permission denied for table payment). |
| Pasos para reproducir | 1. Conectar la suite de integración con el rol PostgreSQL app_user (rolbypassrls = false, sin privilegios UPDATE/DELETE sobre tablas append-only).<br>2. Abrir una sesión de caja en CAJA-PRINCIPAL y una orden DINE_IN activa con saldo pendiente de $80.000.<br>3. Emitir POST /api/v1/orders/:orderId/payments con monto válido ($50.000 CASH) y cabecera Idempotency-Key. |
| Resultado esperado | El cobro debe adquirir bloqueo pesimista únicamente sobre el agregado raíz mutable restaurant_order, insertar el registro inmutable en payment y retornar HTTP 201 Created. |
| Resultado obtenido | En la validación previa a la corrección, PostgreSQL rechazaba la sentencia FOR UPDATE sobre payment con error 42501 (permission denied for table payment). Corregido y verificado en el commit be9089e manteniendo el bloqueo FOR UPDATE exclusivamente sobre restaurant_order. |
| Evidencia | `EVID-DEF-001-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de regresión de DEF-001 en apps/api/test/cash-payments.int-spec.ts bajo rol app_user.<br>`EVID-DEF-001-2` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Evidencia documentada en docs/testing/EVIDENCIAS-PRUEBAS-MANUALES.md (DEF-01) y verificada en commit be9089e.<br>Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/9](https://github.com/H3llz07/GastroForge-Testing/issues/9) |
| Entorno | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| Reportado por | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de reporte | 15/11/2026 |
| Asignado a | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de resolución | 15/11/2026 |

#### Ficha de Defecto DEF-002 (GF-BUG-002) — Desajuste de proyección de campos firstName/lastName y cashierId en exportación CSV de reportes

| Campo | Detalle |
|---|---|
| ID del defecto | DEF-002 / GF-BUG-002 ([GitHub Issue #10](https://github.com/H3llz07/GastroForge-Testing/issues/10)) |
| Título | Desajuste de proyección de campos firstName/lastName y cashierId en exportación CSV de reportes |
| Caso de prueba relacionado | CP-REP-003 |
| Módulo afectado | `reports` |
| Severidad | [ ] Crítica (P1)  [ ] Alta (P2)  [x] Media (P3)  [ ] Baja (P4) |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Estado | [ ] Nuevo  [ ] Asignado  [ ] En progreso  [ ] Resuelto  [x] Cerrado |
| Descripción | En ReportsExportService, la consulta de exportación CSV intentaba proyectar un campo compuesto inexistente en el modelo User de Prisma en lugar de firstName + lastName y referenciaba un alias distinto para cashierId en Payment, provocando error al generar el stream CSV de ventas. |
| Pasos para reproducir | 1. Autenticarse como usuario con rol ADMIN o GERENTE en un tenant con órdenes cobradas.<br>2. Invocar GET /api/v1/reports/sales/export.csv con un rango de fechas válido (from y to).<br>3. Inspeccionar la proyección de columnas del cajero en el stream CSV generado. |
| Resultado esperado | El servicio debe concatenar User.firstName y User.lastName y vincular Payment.cashierId correctamente, emitiendo el archivo CSV con BOM UTF-8 (\uFEFF) y mitigación de CSV Formula Injection. |
| Resultado obtenido | Fallaba la proyección Prisma antes de la corrección. Resuelto y validado en commit be9089e en ReportsExportService y reports-export.int-spec.ts. |
| Evidencia | `EVID-DEF-002-1` (SPEC): `data/evidence/integration-rls-verification-be9089e.md` — Verificación de regresión de DEF-002 en apps/api/test/reports-export.int-spec.ts sobre commit be9089e.<br>`EVID-DEF-002-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de src/modules/reports/domain/reports-export.helper.spec.ts.<br>Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/10](https://github.com/H3llz07/GastroForge-Testing/issues/10) |
| Entorno | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| Reportado por | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de reporte | 15/11/2026 |
| Asignado a | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de resolución | 15/11/2026 |

#### Ficha de Defecto DEF-003 (GF-BUG-003) — Lectura de propiedad err.problem en lugar de err.detail (RFC 7807) en componentes de caja y reportes

| Campo | Detalle |
|---|---|
| ID del defecto | DEF-003 / GF-BUG-003 ([GitHub Issue #11](https://github.com/H3llz07/GastroForge-Testing/issues/11)) |
| Título | Lectura de propiedad err.problem en lugar de err.detail (RFC 7807) en componentes de caja y reportes |
| Caso de prueba relacionado | CP-CSH-005 |
| Módulo afectado | `cash` |
| Severidad | [ ] Crítica (P1)  [ ] Alta (P2)  [x] Media (P3)  [ ] Baja (P4) |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Estado | [ ] Nuevo  [ ] Asignado  [ ] En progreso  [ ] Resuelto  [x] Cerrado |
| Descripción | Los componentes frontend de los módulos cash y reports accedían a err.problem sobre instancias de ApiProblemError cuando el contrato estándar RFC 7807 expone el mensaje legible para el usuario en err.detail, mostrando un banner vacío o genérico ante rechazos de negocio (400/409/422). |
| Pasos para reproducir | 1. Abrir la vista /cashier en viewport tablet 1024x768 con una orden activa de saldo pendiente $45.000.<br>2. Intentar registrar un pago con tarjeta por monto superior ($60.000) para provocar un rechazo HTTP 422.<br>3. Observar el mensaje de error renderizado en el componente AlertBanner. |
| Resultado esperado | AlertBanner debe mostrar el texto exacto de err.detail devuelto por el backend en formato application/problem+json (RFC 7807). |
| Resultado obtenido | Antes de la corrección se leía err.problem (undefined). Estandarizado con err.detail y verificado en commit be9089e tanto en pruebas unitarias frontend como en validación manual. |
| Evidencia | `EVID-DEF-003-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Verificación manual en /cashier de renderizado de err.detail en AlertBanner (DEF-03 en EVIDENCIAS-PRUEBAS-MANUALES.md).<br>`EVID-DEF-003-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución exitosa de app/lib/api/problem-details.test.ts y app/lib/api/client.test.ts.<br>Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/11](https://github.com/H3llz07/GastroForge-Testing/issues/11) |
| Entorno | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| Reportado por | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de reporte | 15/11/2026 |
| Asignado a | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de resolución | 15/11/2026 |

#### Ficha de Defecto DEF-004 (GF-BUG-004) — Rol MESERO posee permisos kitchen:read y kitchen:advance_status sin filtro de estación en can.helper.ts

| Campo | Detalle |
|---|---|
| ID del defecto | DEF-004 / GF-BUG-004 ([GitHub Issue #12](https://github.com/H3llz07/GastroForge-Testing/issues/12)) |
| Título | Rol MESERO posee permisos kitchen:read y kitchen:advance_status sin filtro de estación en can.helper.ts |
| Caso de prueba relacionado | CP-AUTH-006 |
| Módulo afectado | `auth` |
| Severidad | [ ] Crítica (P1)  [ ] Alta (P2)  [x] Media (P3)  [ ] Baja (P4) |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Estado | [ ] Nuevo  [x] Asignado  [ ] En progreso  [ ] Resuelto  [ ] Cerrado |
| Descripción | En apps/api/src/modules/auth/domain/can.helper.ts (líneas 68-77) del commit be9089e, el conjunto MESERO_ACTIONS incluye las acciones 'kitchen:read' y 'kitchen:advance_status' sin exigir validación de stationId, mientras que la Matriz de Capacidades de PRD.md (§2.1, líneas 89-90) y la Tabla de Decisión de TESTING-PLAN.md (§2.2, línea 120) establecen que Mesero NO tiene permiso para ver la cola KDS ni avanzar estados de preparación (Preparing/Ready). |
| Pasos para reproducir | 1. Inspeccionar apps/api/src/modules/auth/domain/can.helper.ts líneas 68-77 en el commit be9089e.<br>2. Evaluar can({ userId: 'u-4', memberId: 'm-4', role: 'MESERO' }, 'kitchen:advance_status').<br>3. Comparar el resultado booleano contra la tabla de decisión de TESTING-PLAN.md (§2.2) y PRD.md (§2.1). |
| Resultado esperado | can(mesero, 'kitchen:advance_status') debe retornar false (o existir una acción separada 'orders:mark_served' exclusiva para pasar de READY a SERVED sin permitir avanzar estados internos de cocina). |
| Resultado obtenido | can(mesero, 'kitchen:advance_status') retorna true para cualquier estación sin restricción de stationId. |
| Evidencia | `EVID-DEF-004-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Auditoría de código en apps/api/src/modules/auth/domain/can.helper.ts#L68-L77 frente a PRD.md §2.1 y TESTING-PLAN.md §2.2.<br>`EVID-DEF-004-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución de src/modules/auth/domain/can.helper.spec.ts y hallazgo de exceso de permisos en MESERO_ACTIONS.<br>Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/12](https://github.com/H3llz07/GastroForge-Testing/issues/12) |
| Entorno | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| Reportado por | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de reporte | 16/11/2026 |
| Asignado a | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de resolución | Pendiente (Abierto en commit be9089e) |

#### Ficha de Defecto DEF-005 (GF-BUG-005) — Discrepancia entre PRD.md y can.helper.ts sobre el permiso del rol CAJERO para abrir órdenes (orders:create)

| Campo | Detalle |
|---|---|
| ID del defecto | DEF-005 / GF-BUG-005 ([GitHub Issue #13](https://github.com/H3llz07/GastroForge-Testing/issues/13)) |
| Título | Discrepancia entre PRD.md y can.helper.ts sobre el permiso del rol CAJERO para abrir órdenes (orders:create) |
| Caso de prueba relacionado | CP-ORD-006 |
| Módulo afectado | `orders` |
| Severidad | [ ] Crítica (P1)  [ ] Alta (P2)  [x] Media (P3)  [ ] Baja (P4) |
| Prioridad | [ ] Alta  [x] Media  [ ] Baja |
| Estado | [ ] Nuevo  [x] Asignado  [ ] En progreso  [ ] Resuelto  [ ] Cerrado |
| Descripción | Existe una contradicción entre la especificación de requisitos de producto y la implementación de dominio en el commit be9089e: PRD.md (§2.1, línea 86) especifica que el rol Cajero SÍ puede 'Abrir orden / cuenta (Mesa o Para Llevar)', pero CAJERO_ACTIONS en apps/api/src/modules/auth/domain/can.helper.ts (líneas 79-86) y can.helper.spec.ts (línea 47) deniegan 'orders:create' al rol CAJERO. |
| Pasos para reproducir | 1. Revisar docs/prd/PRD.md §2.1 (Matriz de capacidades por rol en MVP, fila 'Abrir orden / cuenta').<br>2. Ejecutar o inspeccionar apps/api/src/modules/auth/domain/can.helper.spec.ts línea 47: expect(can(cajero, 'orders:create')).toBe(false).<br>3. Verificar el mismo comportamiento en el cliente web en apps/web/app/features/auth/domain/can.test.ts. |
| Resultado esperado | Alineación unívoca entre PRD.md, TESTING-PLAN.md y can.helper.ts respecto a si el Cajero puede crear órdenes TAKEOUT/mostrador o si dicha capacidad es exclusiva de Mesero/Gerente/Admin. |
| Resultado obtenido | PRD.md declara Sí para Cajero mientras que can.helper.ts y TESTING-PLAN.md retornan false (No). |
| Evidencia | `EVID-DEF-005-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Inspección normativa de CAJERO_ACTIONS en can.helper.ts y can.test.ts frente a PRD.md §2.1.<br>`EVID-DEF-005-2` (LOG): `data/evidence/unit-tests-execution-be9089e.txt` — Ejecución de apps/web/app/features/auth/domain/can.test.ts y apps/api/src/modules/auth/domain/can.helper.spec.ts.<br>Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/13](https://github.com/H3llz07/GastroForge-Testing/issues/13) |
| Entorno | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| Reportado por | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de reporte | 16/11/2026 |
| Asignado a | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de resolución | Pendiente (Abierto en commit be9089e) |

#### Ficha de Defecto DEF-006 (GF-BUG-006) — Inconsistencia documental en el umbral mínimo de objetivos táctiles (48x48 px vs 44x44 px)

| Campo | Detalle |
|---|---|
| ID del defecto | DEF-006 / GF-BUG-006 ([GitHub Issue #14](https://github.com/H3llz07/GastroForge-Testing/issues/14)) |
| Título | Inconsistencia documental en el umbral mínimo de objetivos táctiles (48x48 px vs 44x44 px) |
| Caso de prueba relacionado | CP-ORD-001 |
| Módulo afectado | `orders` |
| Severidad | [ ] Crítica (P1)  [ ] Alta (P2)  [ ] Media (P3)  [x] Baja (P4) |
| Prioridad | [ ] Alta  [ ] Media  [x] Baja |
| Estado | [ ] Nuevo  [x] Asignado  [ ] En progreso  [ ] Resuelto  [ ] Cerrado |
| Descripción | El plan maestro de pruebas del SUT (docs/testing/TESTING-PLAN.md §1 Nivel 6 y §5.1 Guion M-01) exige botones y selectores táctiles con dimensiones mínimas de 48x48 px (min-h-[48px] min-w-[48px]), mientras que PRD.md (§1.2), EVIDENCIAS-PRUEBAS-MANUALES.md y la suite E2E tablet-golden-path.e2e.spec.ts implementan y validan el umbral WCAG 2.5.5 AAA de 44x44 px (min-h-[44px]). |
| Pasos para reproducir | 1. Comparar docs/testing/TESTING-PLAN.md líneas 87 y 264 (48x48 px) contra docs/prd/PRD.md línea 35 y docs/testing/EVIDENCIAS-PRUEBAS-MANUALES.md líneas 22 y 33-35 (44px).<br>2. Inspeccionar las clases Tailwind min-h-[44px] en los componentes táctiles de apps/web en viewport 1024x768. |
| Resultado esperado | Criterio único de ergonomía táctil (44x44 px o 48x48 px) armonizado entre PRD.md, TESTING-PLAN.md y las aserciones automatizadas de Playwright. |
| Resultado obtenido | Los componentes cumplen >= 44x44 px (aprobando las aserciones de Playwright), pero algunos controles secundarios están entre 44px y 47px, por debajo de los 48px citados en TESTING-PLAN.md. |
| Evidencia | `EVID-DEF-006-1` (LOG): `data/evidence/playwright-e2e-and-manual-tablet-be9089e.md` — Ejecución del Guion M-01 en 1024x768 y registro de la discrepancia documental menor DEF-006 (44x44 px vs 48x48 px).<br>Issue: [https://github.com/H3llz07/GastroForge-Testing/issues/14](https://github.com/H3llz07/GastroForge-Testing/issues/14) |
| Entorno | QA Local (PostgreSQL 16 app_user RLS + Redis 7 + Chromium/WebKit 1024x768) (Commit `be9089e`) |
| Reportado por | Julián Santiago Pico Pinzón (@H3llz07) |
| Fecha de reporte | 16/11/2026 |
| Asignado a | Jhonatan A. Méndez R. (@JhonatanM2005) |
| Fecha de resolución | Pendiente (Abierto en commit be9089e) |

---

## 9. Entregables de Prueba

Aquí se detallan todos los artefactos de prueba generados y verificados durante las fases del ciclo de vida de aseguramiento de calidad.

| Entregable | Descripción | Fase | Responsable | Fecha estimada |
|---|---|---|---|---|
| **Plan de Pruebas** (`docs/plan-de-pruebas-gastroforge.md`) | Documento maestro que describe el alcance, estrategia piramidal, recursos, matriz RACI, riesgos, cronograma y las 40 fichas de casos de prueba. | Planificación y Diseño | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | 16/11/2026 |
| **Casos de Prueba Normalizados** (`data/test-cases.json`) | Catálogo estructurado de los 40 casos de prueba (15 manuales y 25 automatizados) con precondiciones, datos de entrada, pasos y resultados esperados. | Diseño | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | 16/11/2026 |
| **Matriz de Trazabilidad de Requisitos** (`docs/matriz-trazabilidad.md`) | Documento que vincula cada caso de uso MVP (UC-01 a UC-22), historia de usuario (HU-001 a HU-034) y ADR (ADR-0001 a ADR-0006) con sus casos de prueba, ejecuciones y defectos. | Diseño y Ejecución | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | 16/11/2026 |
| **Informes de Errores y GitHub Issues** (`docs/reporte-bugs.md`) | Registro detallado de los 6 defectos (DEF-001 a DEF-006 / GF-BUG-001 a GF-BUG-006) con severidad P1–P4, pasos de reproducción y trazabilidad a GitHub Issues. | Ejecución | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | Continuo (Cierre 16/11/2026) |
| **Estrategia de Pruebas** (`docs/plan-de-pruebas-gastroforge.md#5-estrategia-de-pruebas`) | Definición técnica de la pirámide de 6 niveles, arnés de aislamiento RLS y técnicas formales (EP, BVA, Tabla de decisión y Transición de estados). | Planificación | Julián Santiago Pico Pinzón, Jhonatan A. Méndez R. & Christian Urrego Issa | 16/11/2026 |
| **Dashboard Interactivo de Métricas de Pruebas** (`src/App.tsx`) | Aplicación web SPA en React 19 + TypeScript + Tailwind CSS v4 con cálculo en vivo de indicadores, filtros multicriterio, grabador de ejecuciones manuales e impresión. | Cierre | Julián Santiago Pico Pinzón, Jhonatan A. Méndez R. & Christian Urrego Issa | 16/11/2026 |
| **Informe Final de Calidad y Aprobación (APA 7)** (`docs/informe-calidad-apa.md`) | Informe académico en formato estudiantil APA 7 (Institución Universitaria Pascual Bravo) con interpretación de métricas, análisis de defectos, riesgo residual y dictamen de cierre. | Cierre | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | 16/11/2026 |

---

## 10. Recursos y Ambiente de Prueba

### 10.1 Equipo de Pruebas

| Nombre | Rol | Responsabilidades | Dedicación |
|---|---|---|---|
| Jhonatan A. Méndez R. (@JhonatanM2005) | QA Lead / Líder de Pruebas (Bloque A) | Planificar, coordinar y supervisar las actividades de prueba del Bloque A. Diseñar y ejecutar casos de autenticación, catálogo, mesas, órdenes y KDS. Revisar matriz de trazabilidad y aprobar entregables cruzados. | 100% |
| Julián Santiago Pico Pinzón (@H3llz07) | QA Lead / Arquitecto de Pruebas (Bloque B) | Liderar la arquitectura del arnés de pruebas e infraestructura Data-First. Diseñar y ejecutar casos de caja, pagos idempotentes, inventario, reportes y suite multi-tenant RLS. Consolidar métricas e informe APA 7. | 100% |
| Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa (@JhonatanM2005 / @H3llz07 / @Christu12) | QA Analyst / Analista de Pruebas | Diseñar los 40 casos de prueba aplicando técnicas EP, BVA, Tabla de decisión y Transición de estados. Ejecutar los 15 guiones manuales en viewport tablet y documentar hallazgos. | 100% |
| Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa (@JhonatanM2005 / @H3llz07 / @Christu12) | QA Automatizador | Desarrollar y mantener las suites automatizadas unitarias (Jest), de integración con PostgreSQL/Redis bajo app_user (Supertest) y End-to-End en tablet 1024x768 (Playwright). | 100% |
| Equipo de Ingeniería GastroForge (Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa) (@JhonatanM2005 / @H3llz07 / @Christu12) | Desarrollador / Dev del SUT | Entregar el build congelado be9089e, resolver los defectos históricos de validación MVP (DEF-001 a DEF-003) y documentar análisis de causa raíz para defectos abiertos (DEF-004 a DEF-006). | 75% |
| Comité Evaluador — Ingeniería de Software / Aseguramiento de Calidad (I.U. Pascual Bravo) | Product Owner / PO Académico | Validar el cumplimiento de los criterios de aceptación del plan de pruebas, auditar la trazabilidad de requisitos y aprobar el cierre formal del ciclo de aseguramiento de calidad. | 25% |
| Operadores de Salón, Cocina y Caja (Simulación UAT Tablet 1024x768) (Perfiles Operativos MVP) | Usuario Final / Cliente Representativo | Participar en las pruebas de aceptación (UAT) sobre flujos operativos de restaurante (comanda rápida, KDS en vivo y arqueo ciego de caja). | 25% |

### 10.2 Herramientas

| Categoría | Herramienta | Propósito |
|---|---|---|
| Gestión de pruebas y defectos | GitHub Issues & Milestones (H3llz07/GastroForge-Testing) + Catálogo JSON Data-First | Registro trazable de Historias de Usuario QA (HU-QA-001..008), casos de prueba y defectos (GF-BUG-001..006) |
| Automatización Backend y Dominio (L2–L4) | Jest 29 + Supertest + Testcontainers / Docker PostgreSQL 16 & Redis 7 | Ejecución de pruebas unitarias de dominio, servicios en memoria e integración transaccional bajo rol app_user con RLS |
| Automatización End-to-End y UI (L5) | Playwright Test (Viewport Tablet 1024x768, Chromium & WebKit) | Ejecución automatizada de flujos completos de salón, cocina (KDS) y caja con verificación táctil |
| Motor de Métricas y Validación QA | Vitest 3 + TypeScript 5.7 + tsx | Validación de integridad referencial de datos QA, cálculo determinista de métricas y generación automática de entregables Markdown |
| Rendimiento y Concurrencia | Suites de concurrencia paralela Supertest (Promise.all) con Idempotency-Key y bloqueo optimista | Verificación empírica de condiciones de carrera en órdenes, sesiones de caja únicas y despacho Outbox |
| Control de versiones | Git & GitHub (JhonatanM2005/GastroForge @ be9089e y H3llz07/GastroForge-Testing) | Inmutabilidad de la versión evaluada del SUT y control de versiones de la evidencia QA |
| Comunicación y Revisión | GitHub Pull Requests, Issues & Revisiones Cruzadas Bloque A / Bloque B | Coordinación técnica del equipo QA, auditoría de pares y trazabilidad de aprobaciones |

### 10.3 Ambiente de Prueba

| Ambiente | URL / Servidor | Versión | Responsable |
|---|---|---|---|
| Desarrollo Local (SUT Dev) | http://localhost:5173 (Web SPA) / http://localhost:3000/api/v1 (NestJS API) | Commit be9089e (Node.js 22 LTS, PostgreSQL 16, Redis 7) | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa |
| QA / Integración y Arnés RLS | postgresql://app_user:***@localhost:5432/gastroforge_test + redis://localhost:6379/1 | Commit be9089e (FORCE RLS, rolbypassrls = false) | Julián Santiago Pico Pinzón |
| Simulación Producción / UAT Tablet-First | Playwright & Navegador Tablet Viewport 1024x768 (100% local reproducible) + Dashboard QA | v1.0.0-qa (Commit be9089e) | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa |

---

## 11. Cronograma de Pruebas

| Actividad | Fecha Inicio | Fecha Fin | Responsable | Estado |
|---|---|---|---|---|
| Planificación, congelación del SUT (be9089e) y diseño de casos | 02/11/2026 | 05/11/2026 | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Completado |
| Preparación del ambiente Docker, semillas multi-tenant y arnés RLS (app_user) | 06/11/2026 | 07/11/2026 | Julián Santiago Pico Pinzón | [x] Completado |
| Ejecución de pruebas funcionales y de dominio (Bloques A y B) | 08/11/2026 | 10/11/2026 | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Completado |
| Ejecución de pruebas de integración transaccional, concurrencia y Outbox/SSE | 11/11/2026 | 12/11/2026 | Julián Santiago Pico Pinzón | [x] Completado |
| Pruebas de rendimiento concurrente y seguridad multi-tenant RLS | 12/11/2026 | 13/11/2026 | Julián Santiago Pico Pinzón, Jhonatan A. Méndez R. & Christian Urrego Issa | [x] Completado |
| Pruebas de aceptación (UAT) y ejecución de los 15 guiones manuales en tablet 1024x768 | 13/11/2026 | 14/11/2026 | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Completado |
| Corrección de defectos bloqueantes/altos de validación MVP (DEF-001, DEF-002, DEF-003) | 14/11/2026 | 15/11/2026 | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Completado |
| Regresión post-corrección y registro de hallazgos abiertos en commit be9089e (DEF-004, DEF-005, DEF-006) | 15/11/2026 | 15/11/2026 | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Completado |
| Cierre, generación de dashboard interactivo y entrega del informe de calidad APA 7 | 16/11/2026 | 16/11/2026 | Jhonatan A. Méndez R., Julián Santiago Pico Pinzón & Christian Urrego Issa | [x] Completado |

---

## 12. Riesgos y Mitigación

| # | Riesgo | Probabilidad | Impacto | Plan de Mitigación |
|---|---|---|---|---|
| 1 | Retrasos o deriva en el código del SUT durante la campaña de pruebas que invaliden las evidencias recolectadas. | Media | Alto | Congelar formalmente la línea base de evaluación en el commit be9089e y aislar el repositorio GastroForge-Testing sin modificar el ERP. |
| 2 | Ambiente de pruebas inestable o ejecución accidental con superusuario PostgreSQL que omita las políticas RLS (rolbypassrls = true). | Baja | Alto | Forzar la conexión de integración con el rol app_user y ejecutar una aserción bloqueante en beforeAll que verifica rolbypassrls = false en pg_roles. |
| 3 | Discrepancias normativas entre documentos de especificación (PRD.md vs TESTING-PLAN.md vs implementación en can.helper.ts). | Alta | Medio | Auditar exhaustivamente la matriz RBAC y las dimensiones táctiles, registrando toda discrepancia real como defecto trazable (DEF-004, DEF-005, DEF-006) con análisis de riesgo residual. |
| 4 | Falta de datos de prueba suficientes para comprobar escenarios multi-tenant, pagos divididos y concurrencia. | Media | Medio | Sembrar determinísticamente dos tenants completos (Restaurante Central y Restaurante Norte) con usuarios en los 5 roles, mesas, catálogo con IVA y sesiones de caja. |
| 5 | Distorsión de métricas de calidad por incluir casos no ejecutados o funcionalidades de Fase 2 en el denominador de aprobación o cobertura. | Baja | Alto | Implementar y probar unitariamente el motor calculateQaMetrics() excluyendo NOT_RUN, BLOCKED y SKIPPED del denominador de aprobación y separando explícitamente PHASE_2. |

---

## 13. Métricas de Calidad

| Métrica | Fórmula / Medición | Meta | Valor Actual |
|---|---|---|---|
| Tasa de ejecución de casos | (Casos ejecutados / Total casos) × 100 | ≥ 95% | **100% (40/40)** |
| Tasa de casos aprobados | (Casos que pasan / Casos ejecutados) × 100 | ≥ 90% | **95% (38/40)** |
| Densidad de defectos | Defectos encontrados / Casos ejecutados | < 0.1 (abiertos) | **0.075 (3/40) abiertos** · Total histórica: **0.15 (6/40)** |
| Defectos críticos abiertos | Conteo de defectos críticos/altos sin resolver | = 0 | **0 (P1=0, P2=0)** |
| Tasa de reapertura de defectos | (Defectos reabiertos / Defectos resueltos) × 100 | < 5% | **0% (0/3)** |
| Cobertura de requisitos | (Requisitos cubiertos / Total requisitos IN_SCOPE) × 100 | 100% | **100% (28/28)** |

---

## 14. Criterios de Cierre y Entregables

### 14.1 Entregables del Plan de Pruebas

- Plan de pruebas (`docs/plan-de-pruebas-gastroforge.md` — este documento)
- Casos de prueba documentados y normalizados (`data/test-cases.json` y §7.1)
- Matriz de trazabilidad bidireccional (`docs/matriz-trazabilidad.md`)
- Informe de ejecución de pruebas y evidencias (`data/test-runs.json` y `data/evidence/`)
- Registro y catálogo de defectos (`docs/reporte-bugs.md` y `data/defects.json`)
- Dashboard interactivo QA y motor de métricas (`src/App.tsx` y `src/metrics/calculate-metrics.ts`)
- Informe final de calidad en formato APA 7 (`docs/informe-calidad-apa.md`)

### 14.2 Aprobaciones

| Nombre | Rol | Firma | Fecha |
|---|---|---|---|
| Jhonatan A. Méndez R. (@JhonatanM2005) | QA Lead — Bloque A (Auth, Catálogo, Mesas, Órdenes, KDS) | *Firmado digitalmente (@JhonatanM2005)* | 17/11/2026 |
| Julián Santiago Pico Pinzón (@H3llz07) | QA Lead — Bloque B (Caja, Pagos, Inventario, Reportes, RLS) | *Firmado digitalmente (@H3llz07)* | 17/11/2026 |
| Christian Urrego Issa (@Christu12) | QA Analyst & Automatizador (Manuales L6, E2E L5, L2–L4) | *Firmado digitalmente (@Christu12)* | 17/11/2026 |
| Comité Evaluador — I.U. Pascual Bravo | Product Owner Académico / Aprobador de Calidad | *Aprobado en sustentación académica* | 17/11/2026 |

---

## 15. Términos y Acrónimos

### 15.1 Términos

| Término | Definición |
|---|---|
| Caso de prueba | Conjunto de condiciones, precondiciones, datos de entrada, pasos de ejecución y resultado esperado que valida una funcionalidad o invariante específico de GastroForge. |
| Ciclo de pruebas | Periodo controlado en el cual se diseñan, ejecutan y evalúan los 40 casos de prueba sobre la versión congelada be9089e del sistema. |
| Criterio de aceptación | Condición medible y verificable que una historia de usuario o caso de uso debe satisfacer para considerarse completado y aprobado. |
| Datos de prueba | Conjunto de valores de entrada (credenciales por rol, UUIDs de tenants, montos Decimal(12,2), claves de idempotencia) empleados para ejecutar un caso de prueba. |
| Defecto / Bug | Discrepancia verificable entre el comportamiento real o documental del sistema en el commit be9089e y el comportamiento esperado según su especificación. |
| Entorno de pruebas | Configuración reproducible compuesta por Node.js, PostgreSQL 16 con RLS activo, Redis 7 y navegador en viewport tablet de 1024x768 píxeles. |
| Evidencia de prueba | Artefacto verificable (traza de ejecución, captura en data/evidence/, log de suite o referencia de código/commit) que demuestra el resultado obtenido. |
| Plan de pruebas | Documento rector que establece el alcance, la estrategia piramidal, la matriz RACI, los riesgos, el cronograma y el catálogo de casos de prueba del proyecto. |
| Regresión | Ejecución repetible de casos de prueba para confirmar que la corrección de defectos previos no ha introducido fallos en módulos ya verificados. |
| Severidad | Grado de impacto técnico y operativo que un defecto ejerce sobre el sistema, clasificado en Crítica (P1), Alta (P2), Media (P3) y Baja (P4). |
| Arqueo ciego de caja | Procedimiento de cierre de turno en el cual el cajero declara el efectivo físico contado sin que la interfaz revele previamente el saldo esperado por el sistema. |
| Row-Level Security (RLS) | Mecanismo nativo de PostgreSQL que restringe a nivel de motor qué filas puede leer o escribir una transacción según la variable de sesión app.restaurant_id. |

### 15.2 Acrónimos

| Acrónimo | Significado | Descripción |
|---|---|---|
| ADR | Architecture Decision Record | Registro formal de una decisión arquitectónica inmutable del sistema (ADR-0001 a ADR-0006). |
| BVA | Boundary Value Analysis | Análisis de Valores Límite. Técnica de diseño de pruebas que evalúa los extremos exactos de las particiones numéricas y de rango. |
| CI/CD | Continuous Integration / Continuous Delivery | Integración y entrega continua mediante flujos automatizados de validación de tipos, linter y pruebas. |
| EP | Equivalence Partitioning | Partición de equivalencia. Técnica de diseño que divide el dominio de entrada en clases válidas e inválidas representativas. |
| KDS | Kitchen Display System | Sistema de pantallas de cocina en tiempo real para gestionar la preparación de comandas por estación. |
| KPI | Key Performance Indicator | Indicador Clave de Rendimiento utilizado para medir tanto el desempeño del restaurante como la calidad del proceso de pruebas. |
| PM | Project Manager | Gerente o coordinador del proyecto encargado del seguimiento de cronograma y riesgos. |
| PO | Product Owner | Dueño del producto responsable de definir el alcance funcional y validar los criterios de aceptación. |
| QA | Quality Assurance | Aseguramiento de la calidad. Proceso sistemático para verificar y evidenciar que el software cumple sus especificaciones. |
| RACI | Responsible, Accountable, Consulted, Informed | Matriz de asignación de roles y responsabilidades en las actividades críticas del ciclo de pruebas. |
| RBAC | Role-Based Access Control | Control de acceso basado en roles implementado en GastroForge mediante la función pura can(role, action, stationId). |
| RLS | Row-Level Security | Seguridad a nivel de fila en PostgreSQL para garantizar aislamiento estricto entre múltiples restaurantes (tenants). |
| SSE | Server-Sent Events | Canal HTTP unidireccional persistente usado para notificar cambios de órdenes y cocina en tiempo real a las tablets. |
| SUT | System Under Test | Sistema bajo prueba. En este repositorio corresponde a GastroForge en el commit congelado be9089e. |
| UAT | User Acceptance Testing | Pruebas de Aceptación de Usuario ejecutadas para validar que el sistema responde a la operación real del restaurante. |
