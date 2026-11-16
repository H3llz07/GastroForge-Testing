<div align="center">

**Evaluación Empírica de Calidad, Trazabilidad y Aislamiento Multi-Tenant del Sistema ERP GastroForge (Commit `be9089e`)**

<br>

Jhonatan A. Méndez R. y Julián Santiago Pico Pinzón

Facultad de Ingeniería, Institución Universitaria Pascual Bravo

Ingeniería de Software / Aseguramiento de Calidad y Pruebas de Software

16 de noviembre de 2026

</div>

---

<div align="center">

**Evaluación Empírica de Calidad, Trazabilidad y Aislamiento Multi-Tenant del Sistema ERP GastroForge (Commit `be9089e`)**

</div>

Los sistemas de planificación de recursos empresariales (ERP) orientados a la operación gastronómica multi-restaurante procesan transacciones financieras concurrentes, comandas de preparación en tiempo real y consultas multi-inquilino (*multi-tenant*) bajo alta presión operativa. En este dominio, un fallo en las políticas de control de acceso o una condición de carrera durante el cobro en caja compromete tanto la contabilidad del establecimiento como la confidencialidad de los datos entre organizaciones independientes. Por consiguiente, la evaluación de calidad de este tipo de plataformas exige verificaciones empíricas reproducibles sobre una línea base de código inmutable, evitando cualquier alteración del sistema durante la medición.

El presente estudio evalúa la calidad funcional, transaccional y de seguridad del sistema **GastroForge — Sistema ERP Multi-Restaurante Tablet-First**, alojado en el repositorio `JhonatanM2005/GastroForge` y congelado en el commit `be9089e` (`feat(web): add playwright tablet e2e suite and manual testing evidences (#71)`). Para preservar la independencia metodológica entre la construcción del producto y su auditoría, toda la infraestructura de trazabilidad, catálogos normalizados (`data/*.json`), generación determinista de entregables y visualización de métricas se aisló en el repositorio de aseguramiento de calidad `H3llz07/GastroForge-Testing`. Esta frontera arquitectónica garantiza que el entorno de pruebas jamás modifica el código fuente del sistema bajo prueba (SUT) ni accede a bases de datos productivas.

El marco metodológico adoptado integra cuatro referentes normativos internacionales (American Psychological Association [APA], 2020). La estructura documental del plan de pruebas, la matriz de trazabilidad bidireccional y los informes de defectos se rigen por el estándar ISO/IEC/IEEE 29119-3 (International Organization for Standardization [ISO], 2021). El diseño sistemático de casos de prueba aplica las técnicas de caja negra definidas en el programa *Foundation Level* del International Software Testing Qualifications Board (ISTQB, 2023) y formalizadas por Myers et al. (2011). Asimismo, la verificación del aislamiento *multi-tenant*, el control de acceso basado en roles (RBAC) y la estandarización de respuestas de error HTTP siguen los lineamientos del *Application Security Verification Standard* (OWASP Foundation, 2021), la especificación de políticas de seguridad a nivel de fila de PostgreSQL 16 (PostgreSQL Global Development Group, 2024) y el contrato `application/problem+json` de la RFC 7807 (Nottingham & Wilde, 2016). Finalmente, la ergonomía de los controles táctiles en el viewport objetivo de tablet (`1024x768` píxeles) se contrastó con el criterio de conformidad 2.5.5 (*Target Size*) de las pautas de accesibilidad web WCAG 2.1 (World Wide Web Consortium [W3C], 2018).

## Método y Estrategia Piramidal de Evaluación

### Diseño de la Pirámide de Seis Niveles (`L1`–`L6`)

La evaluación del commit `be9089e` se estructuró mediante una arquitectura piramidal de seis niveles complementarios que combinan verificación estática, pruebas automatizadas deterministas e inspección manual en interfaz táctil:

1. **Nivel L1 — Análisis estático y de contratos:** Verificación de tipos estrictos con TypeScript 5.7 (`tsc --noEmit`), reglas de análisis estático con ESLint 9 y validación estructural de esquemas OpenAPI antes de la ejecución de las suites dinámicas.
2. **Nivel L2 — Pruebas unitarias de dominio puro (3 casos directos en catálogo):** Ejecución en memoria mediante Jest y Vitest sin dependencias de entrada/salida, enfocada en invariantes de negocio: la función pura de autorización `can(actor, action, stationId)`, el cálculo aritmético `Decimal(12,2)` con desglose de IVA incluido y el cálculo de porcentajes de propina.
3. **Nivel L3 — Pruebas de servicios de aplicación en memoria (1 caso directo en catálogo):** Evaluación de casos de uso orquestados sobre repositorios simulados (*fakes*) y unidades de trabajo (`UnitOfWork`) en memoria, validando reglas de apertura de órdenes y control de versiones optimistas.
4. **Nivel L4 — Pruebas de integración transaccional e infraestructura multi-tenant (20 casos directos en catálogo):** Ejecución con Jest, Supertest y contenedores Docker reales de PostgreSQL 16 y Redis 7. Todas las conexiones de prueba operan bajo el rol de base de datos no privilegiado `app_user` (`rolbypassrls = false`) con políticas `FORCE ROW LEVEL SECURITY` activas e inyección transaccional del identificador de inquilino mediante `set_config('app.restaurant_id', tenantId, true)`.
5. **Nivel L5 — Pruebas de sistema End-to-End en Tablet (1 caso directo en catálogo):** Automatización del flujo operativo completo (*Golden Path*) mediante Playwright sobre motores Chromium y WebKit configurados en resolución `1024x768`, encadenando la toma de comanda en salón, la preparación en el *Kitchen Display System* (KDS), el cobro dividido en caja y la verificación de no contaminación cruzada hacia un segundo restaurante.
6. **Nivel L6 — Pruebas manuales exploratorias y de aceptación en Tablet (15 casos directos en catálogo):** Ejecución interactiva guiada sobre el navegador en viewport `1024x768` y cliente HTTP para evaluar la ergonomía táctil, la reconexión automática del canal *Server-Sent Events* (SSE) respaldado por el patrón *Transactional Outbox*, la visualización de errores RFC 7807, el arqueo ciego de caja y el formato de impresión de tirilla térmica de 80 mm.

### Técnicas Formales de Diseño de Casos de Prueba

Para maximizar la probabilidad de detección de defectos evitando la redundancia de pruebas (Myers et al., 2011; ISTQB, 2023), el catálogo de 40 casos (`CP-AUTH-001` a `CP-RLS-004`) se diseñó aplicando cuatro técnicas formales:

- **Partición de equivalencia (`EP`, 13 casos):** División del dominio de entrada en clases válidas e inválidas para credenciales JWT, cabeceras de origen CORS, consultas cruzadas entre *Tenant A* (Restaurante Central) y *Tenant B* (Restaurante Norte), filtros de estación KDS y sanitización de caracteres peligrosos (`=`, `+`, `-`, `@`) contra inyección de fórmulas en exportaciones CSV.
- **Análisis de valores límite (`BVA`, 9 casos):** Evaluación en las fronteras numéricas exactas del sistema: umbral de limitación de tasa en inicio de sesión (`intentos 1..5 -> HTTP 401`, `intento 6 -> HTTP 429`), cardinalidad de grupos de modificadores (`min_selectable = 1`, `max_selectable = 2`), cantidades de ítems por tanda (`0, 1, 99, 100`), límites de propina (`-1%, 0%, 10%, 100%, 101%`), umbral de alerta de inventario (`stock = 11, 10, 9` frente a `minStock = 10`) y dimensiones mínimas de objetivos táctiles (`44x44 px` frente a `48x48 px`).
- **Tabla de decisión (8 casos):** Modelado combinatorio de reglas de negocio multicriterio: matriz de permisos RBAC `can(role, action, stationId)` para los cinco roles del MVP (`ADMIN`, `GERENTE`, `MESERO`, `COCINA`, `CAJERO`), reglas de cancelación supervisada con PIN gerencial según el estado de la orden, comportamiento del interceptor de idempotencia (`Idempotency-Key` nueva, repetida con idéntico *payload* o repetida con *payload* mutado) y verificación de privilegios SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) sobre las cinco tablas inmutables (*append-only*).
- **Transición de estados (10 casos):** Verificación de máquinas de estados finitos y sus transiciones inválidas: rotación y detección de reúso de *refresh tokens*, conmutación rápida de disponibilidad de catálogo (`AVAILABLE <-> UNAVAILABLE`), estado de ocupación derivada de mesas (`FREE -> OCCUPIED -> FREE`), ciclo de preparación de ítems en cocina (`PENDING -> PREPARING -> READY -> SERVED / CANCELLED`), reconexión del flujo SSE y ciclo de vida de sesiones de caja (`OPEN -> CLOSED`).

La Tabla 1 presenta la distribución completa de los 40 casos de prueba diseñados según su módulo funcional, modalidad de ejecución, nivel en la pirámide de pruebas y técnica de diseño aplicada.

**Tabla 1**
*Distribución de los 40 Casos de Prueba por Módulo Funcional, Nivel Piramidal y Técnica de Diseño*

| Módulo funcional | Total CP | Manual (`L6`) | Automatizada (`L2`–`L5`) | Desglose por nivel piramidal | Desglose por técnica de diseño |
|---|---:|---:|---:|---|---|
| `auth` (Autenticación y RBAC) | 6 | 3 | 3 | `L2`: 1, `L4`: 2, `L6`: 3 | `EP`: 2, `BVA`: 1, `Tabla de decisión`: 1, `Transición de estados`: 2 |
| `catalog` (Catálogo y modificadores) | 4 | 2 | 2 | `L2`: 1, `L4`: 1, `L6`: 2 | `EP`: 1, `BVA`: 2, `Transición de estados`: 1 |
| `tables` (Plano de mesas y zonas) | 3 | 1 | 2 | `L4`: 2, `L6`: 1 | `EP`: 1, `BVA`: 1, `Transición de estados`: 1 |
| `orders` (Órdenes y concurrencia) | 6 | 2 | 4 | `L3`: 1, `L4`: 3, `L6`: 2 | `EP`: 1, `BVA`: 2, `Tabla de decisión`: 2, `Transición de estados`: 1 |
| `kitchen` (KDS y eventos SSE) | 4 | 2 | 2 | `L4`: 2, `L6`: 2 | `EP`: 2, `Transición de estados`: 2 |
| `cash` (Caja, pagos e idempotencia) | 8 | 3 | 5 | `L2`: 1, `L4`: 4, `L6`: 3 | `EP`: 2, `BVA`: 2, `Tabla de decisión`: 3, `Transición de estados`: 1 |
| `inventory` (Stock y ajustes manuales) | 2 | 0 | 2 | `L4`: 2 | `BVA`: 1, `Transición de estados`: 1 |
| `reports` (KPIs, tirilla 80 mm y CSV) | 3 | 1 | 2 | `L4`: 2, `L6`: 1 | `EP`: 3 |
| `rls` (Seguridad multi-tenant y endurecimiento) | 4 | 1 | 3 | `L4`: 2, `L5`: 1, `L6`: 1 | `EP`: 1, `Tabla de decisión`: 2, `Transición de estados`: 1 |
| **Total global** | **40** | **15** | **25** | **`L2`: 3, `L3`: 1, `L4`: 20, `L5`: 1, `L6`: 15** | **`EP`: 13, `BVA`: 9, `Tabla de decisión`: 8, `Transición de estados`: 10** |

*Nota.* El nivel `L1` (compilación estática TypeScript, ESLint y validación de esquemas OpenAPI) actúa como compuerta transversal previa sobre el 100% de los módulos del repositorio `JhonatanM2005/GastroForge` en el commit `be9089e`.

## Resultados Empíricos y Análisis de Métricas de Calidad

El motor determinista `calculateQaMetrics()` procesó las 40 ejecuciones registradas en `data/test-runs.json` junto con el catálogo de requisitos (`data/requirements.json`) y defectos (`data/defects.json`). Para evitar distorsiones metodológicas en las tasas de éxito, el algoritmo excluye estrictamente los estados no ejecutados (`NOT_RUN`, `BLOCKED`, `SKIPPED`) del denominador de la tasa de aprobación y separa las exclusiones explícitas de Fase 2 (`REQ-PH2-01` y `REQ-PH2-02`) del denominador de cobertura de requisitos del MVP. La Tabla 2 sintetiza los indicadores cuantitativos obtenidos al cierre del ciclo de evaluación.

**Tabla 2**
*Indicadores Empíricos de Calidad Calculados sobre el Commit Congelado `be9089e`*

| Indicador de calidad | Fórmula matemática aplicada | Meta / Umbral | Valor empírico obtenido | Estado |
|---|---|---|---|---|
| Tasa de ejecución de casos | $(\text{Casos ejecutados} / \text{Total casos}) \times 100$ | $\ge 95.00\%$ | $100.00\%$ ($40 / 40$) | Cumplido |
| Tasa de aprobación global | $(\text{Casos aprobados} / \text{Casos ejecutados}) \times 100$ | $\ge 90.00\%$ | $95.00\%$ ($38 / 40$) | Cumplido |
| Cobertura de requisitos en alcance | $(\text{Requisitos cubiertos} / \text{Requisitos IN\_SCOPE}) \times 100$ | $= 100.00\%$ | $100.00\%$ ($28 / 28$) | Cumplido |
| Densidad de defectos abiertos | $\text{Defectos abiertos} / \text{Casos ejecutados}$ | $< 0.1000$ | $0.0750$ ($3 / 40$) | Cumplido |
| Densidad histórica acumulada | $\text{Defectos totales} / \text{Casos ejecutados}$ | Informativo | $0.1500$ ($6 / 40$) | Auditado |
| Defectos críticos o altos abiertos | $\text{Abiertos } P1 + \text{Abiertos } P2$ | $= 0$ | $0$ ($P1 = 0, P2 = 0$) | Cumplido |
| Tasa de reapertura de defectos | $(\text{Reabiertos} / \text{Resueltos o cerrados}) \times 100$ | $< 5.00\%$ | $0.00\%$ ($0 / 3$) | Cumplido |

*Nota.* De los 30 requisitos documentados en `data/requirements.json`, 28 pertenecen al alcance del MVP (`IN_SCOPE`, agrupando los 22 casos de uso `UC-*`, las 34 historias de usuario `HU-001..034` y los registros `ADR-0001..0006`) y 2 corresponden a exclusiones normativas de Fase 2 (`PHASE_2`).

### Interpretación Técnica por Área Funcional

El análisis desglosado por los nueve módulos evaluados evidencia el comportamiento específico de cada componente arquitectónico:

- **Autenticación y control de acceso (`auth`, 5/6 aprobados, $83.33\%$):** Se verificó satisfactoriamente la emisión de credenciales JWT, la rotación de *refresh tokens* con revocación inmediata de toda la familia de sesión ante intentos de reúso (`CP-AUTH-003`), la expiración de contraseñas temporales de un solo uso (`CP-AUTH-004`), la limitación de tasa en el sexto intento fallido con respuesta `HTTP 429 Too Many Requests` (`CP-AUTH-002`) y el aislamiento de estación en el rol `COCINA` (`CP-AUTH-005`). El único caso fallido (`CP-AUTH-006`) detectó en `can.helper.ts` la concesión de permisos de lectura y avance de cocina al rol `MESERO` (`DEF-004`).
- **Catálogo (`catalog`, 4/4 aprobados, $100.00\%$):** Se comprobó la precisión del desglose tributario de IVA incluido mediante aritmética `Decimal(12,2)` sin errores de coma flotante (`CP-CAT-002`), el cumplimiento estricto de las cotas `min_selectable` y `max_selectable` en grupos de modificadores (`CP-CAT-003`) y la propagación instantánea del cambio de disponibilidad de productos hacia la vista de toma de comandas (`CP-CAT-004`).
- **Plano de mesas (`tables`, 3/3 aprobados, $100.00\%$):** Se validó que la ocupación de cada mesa (`FREE` frente a `OCCUPIED`) no depende de una bandera estática propensa a desincronización, sino que se deriva transaccionalmente de la existencia de una orden activa vinculada (`CP-TAB-002`), impidiendo la eliminación de mesas con cuentas abiertas mediante rechazo `HTTP 409 Conflict` (`CP-TAB-003`).
- **Órdenes y concurrencia (`orders`, 5/6 aprobados, $83.33\%$):** El motor transaccional superó las pruebas de adición de tandas con cantidades límite (`CP-ORD-002`), bloqueo optimista mediante columna `version` ante ediciones concurrentes de dos meseros (`CP-ORD-003`, retornando `HTTP 409 Conflict` al segundo escritor) y cancelación autorizada con PIN gerencial y registro de auditoría (`CP-ORD-004`). El caso `CP-ORD-001` aprobó las aserciones de flujo E2E dejando registrada una observación cosmética menor sobre el umbral táctil (`DEF-006`), mientras que el caso `CP-ORD-006` falló al evidenciar una contradicción normativa entre el documento de requisitos y la matriz de código respecto a si el rol `CAJERO` puede crear órdenes (`DEF-005`).
- **Cocina y eventos en tiempo real (`kitchen`, 4/4 aprobados, $100.00\%$):** Se confirmó la segmentación de comandas por estación (`PARRILLA`, `BAR`, `FRIOS`), la validez de las transiciones `PENDING -> PREPARING -> READY -> SERVED` y la resiliencia del canal SSE alimentado por la tabla `outbox_event`, el cual recupera eventos pendientes tras desconexiones temporales de red sin pérdida ni duplicación de mensajes (`CP-KIT-004`).
- **Caja, pagos e idempotencia (`cash`, 8/8 aprobados en regresión, $100.00\%$):** El índice único parcial `uq_cash_register_open` garantizó que solo pueda existir una sesión abierta por caja (`CP-CSH-001`). Asimismo, se certificó la exactitud de pagos divididos (`CP-CSH-003`, tras la corrección del defecto histórico `DEF-001`), la validación de bordes de propina (`CP-CSH-004`), la visualización de detalles de error RFC 7807 (`CP-CSH-005`, tras resolver `DEF-003`), la protección contra cobros duplicados mediante `Idempotency-Key` y hash SHA-256 del cuerpo de la petición (`CP-CSH-006`), la reversión supervisada de pagos (`CP-CSH-007`) y el arqueo ciego de cierre de turno (`CP-CSH-008`), donde el cajero declara el efectivo contado sin conocer el saldo esperado hasta que el registro queda sellado de forma inmutable.
- **Inventario (`inventory`, 2/2 aprobados, $100.00\%$):** Se comprobó la obligatoriedad del motivo en ajustes manuales de existencias con generación de trazas en `inventory_movement` (`CP-INV-001`) y la activación exacta de alertas de stock bajo cuando la cantidad disponible iguala o desciende del umbral `minStock` (`CP-INV-002`).
- **Reportes (`reports`, 3/3 aprobados en regresión, $100.00\%$):** Se verificó el cálculo de indicadores clave (KPIs) con almacenamiento en caché Redis (`CP-REP-001`), la maquetación de la tirilla térmica de 80 mm sin desbordamiento horizontal (`CP-REP-002`) y la exportación de ventas en formato CSV con marca de orden de bytes UTF-8 (`\uFEFF`) y neutralización de fórmulas maliciosas (`CP-REP-003`, validando el cierre de `DEF-002`).
- **Seguridad multi-tenant y endurecimiento (`rls`, 4/4 aprobados, $100.00\%$):** Las pruebas de intrusión controlada demostraron que un token válido del *Tenant A* recibe `HTTP 404 Not Found` (sin revelar la existencia del recurso) al intentar leer o mutar órdenes del *Tenant B* (`CP-RLS-001`), que las claves foráneas compuestas `(restaurant_id, id)` bloquean a nivel de motor SQL cualquier asociación inter-restaurante (`CP-RLS-002`) y que el rol `app_user` carece de privilegios `UPDATE` y `DELETE` sobre las cinco tablas de auditoría financiera y operativa (`CP-RLS-003`).

## Análisis de Defectos, Causa Raíz y Riesgo Residual

Durante el ciclo completo de aseguramiento de calidad sobre el commit `be9089e` se documentaron y auditaron seis defectos bajo una taxonomía dual que vincula el identificador académico (`DEF-001` a `DEF-006`) con su código operativo de seguimiento (`GF-BUG-001` a `GF-BUG-006`, registrados en los GitHub Issues `#9` a `#14` de `H3llz07/GastroForge-Testing`). La Tabla 3 detalla el catálogo consolidado de hallazgos.

**Tabla 3**
*Catálogo Consolidado de Defectos Registrados y Trazados en el Commit `be9089e`*

| ID académico | Código externo (GitHub Issue) | Caso de prueba | Módulo | Severidad (Código) | Estado en `be9089e` | Síntesis técnica del hallazgo |
|---|---|---|---|---|---|---|
| `DEF-001` | `GF-BUG-001` (Issue `#9`) | `CP-CSH-003` | `cash` | Alta (`P2`) | Cerrado | Fallo de bloqueo pesimista `SELECT ... FOR UPDATE` sobre la tabla *append-only* `payment` bajo el rol `app_user` (error SQL `42501`). |
| `DEF-002` | `GF-BUG-002` (Issue `#10`) | `CP-REP-003` | `reports` | Media (`P3`) | Cerrado | Desajuste de proyección de campos `firstName`/`lastName` y `cashierId` en `ReportsExportService` al generar el flujo CSV. |
| `DEF-003` | `GF-BUG-003` (Issue `#11`) | `CP-CSH-005` | `cash` | Media (`P3`) | Cerrado | Lectura de la propiedad inexistente `err.problem` en lugar de `err.detail` (RFC 7807) en el componente `AlertBanner`. |
| `DEF-004` | `GF-BUG-004` (Issue `#12`) | `CP-AUTH-006` | `auth` | Media (`P3`) | Asignado | Inclusión de `kitchen:read` y `kitchen:advance_status` en `MESERO_ACTIONS` (`can.helper.ts`) sin filtro de estación. |
| `DEF-005` | `GF-BUG-005` (Issue `#13`) | `CP-ORD-006` | `orders` | Media (`P3`) | Asignado | Discrepancia normativa entre `PRD.md` (§2.1) y `can.helper.ts` sobre el permiso `orders:create` para el rol `CAJERO`. |
| `DEF-006` | `GF-BUG-006` (Issue `#14`) | `CP-ORD-001` | `orders` | Baja (`P4`) | Asignado | Inconsistencia documental en el umbral mínimo de objetivos táctiles (`44x44 px` implementado frente a `48x48 px` citado en el plan del SUT). |

*Nota.* Los defectos `DEF-001`, `DEF-002` y `DEF-003` fueron detectados durante la validación previa del MVP, corregidos en el repositorio del SUT y verificados mediante pruebas de regresión sobre el commit congelado `be9089e` con tasa de reapertura del $0.00\%$ ($0/3$).

### Defectos Resueltos y Verificados en Regresión (`DEF-001` a `DEF-003`)

El hallazgo de mayor criticidad histórica fue `DEF-001` (`GF-BUG-001`, severidad Alta `P2`). En cumplimiento del registro arquitectónico `ADR-0006`, las tablas financieras e históricas (`payment`, `order_status_history`, `cash_movement`, `inventory_movement` y `audit_log`) tienen revocados los privilegios `UPDATE` y `DELETE` para el rol `app_user` con el fin de garantizar su inmutabilidad contable (PostgreSQL Global Development Group, 2024). Sin embargo, durante el procesamiento de cobros en caja, la consulta adquiría un bloqueo pesimista `SELECT ... FOR UPDATE` no solo sobre el agregado raíz mutable `restaurant_order`, sino también sobre la tabla `payment`. Dado que el motor PostgreSQL exige poseer el privilegio `UPDATE` para conceder un bloqueo de fila `FOR UPDATE`, la transacción abortaba con el código SQL `42501` (*permission denied for table payment*). La causa raíz se resolvió restringiendo la cláusula `FOR UPDATE` exclusivamente a la fila de `restaurant_order`, serializando así los cobros concurrentes sin violar la política de mínimo privilegio sobre `payment`. La suite de integración `cash-payments.int-spec.ts` confirmó la eficacia de la corrección en el commit `be9089e`.

Por su parte, `DEF-002` (`GF-BUG-002`, severidad Media `P3`) se originó en un desajuste de esquema dentro de `ReportsExportService`, donde la consulta de exportación CSV intentaba proyectar un atributo nominal unificado en lugar de concatenar `User.firstName` y `User.lastName` a través de la relación `Payment.cashierId`. Tras corregir el mapeo en el servicio de aplicación, la prueba de integración `reports-export.int-spec.ts` verificó la emisión correcta del flujo CSV con cabecera BOM UTF-8. Finalmente, `DEF-003` (`GF-BUG-003`, severidad Media `P3`) radicaba en el cliente web: ante errores de negocio HTTP `400`, `409` o `422` formateados bajo el estándar RFC 7807 (Nottingham & Wilde, 2016), los componentes de caja y reportes invocaban `err.problem` sobre la instancia de `ApiProblemError`, obteniendo `undefined` en lugar del mensaje descriptivo alojado en `err.detail`. La estandarización de la lectura de `err.detail` restableció la retroalimentación visual en el componente `AlertBanner`.

### Defectos Abiertos en el Commit `be9089e` (`DEF-004` a `DEF-006`)

La aplicación de tablas de decisión sobre la función de dominio `can()` (`apps/api/src/modules/auth/domain/can.helper.ts`) permitió descubrir dos discrepancias normativas de severidad Media (`P3`) que permanecen abiertas en el commit congelado `be9089e`:

1. **Exceso de permisos de cocina en el rol `MESERO` (`DEF-004` / `GF-BUG-004`, Issue `#12`):** En las líneas 68–77 de `can.helper.ts`, el conjunto constante `MESERO_ACTIONS` incluye las acciones `'kitchen:read'` y `'kitchen:advance_status'` sin aplicar restricción de estación (`stationId`). No obstante, tanto la matriz de capacidades del documento de requisitos (`PRD.md`, §2.1) como la tabla de decisión del plan de pruebas del SUT (`TESTING-PLAN.md`, §2.2) establecen explícitamente que el mesero no debe visualizar la cola del KDS ni avanzar estados internos de preparación (`PREPARING` o `READY`), sino únicamente marcar como entregados (`SERVED`) los ítems ya terminados por cocina. La causa raíz obedece a que durante el desarrollo del MVP se reutilizó la acción `'kitchen:advance_status'` para habilitar el botón de entrega en salón, en lugar de segregar una acción de dominio independiente (`'orders:mark_served'`).
2. **Contradicción documental-implementación sobre `orders:create` para `CAJERO` (`DEF-005` / `GF-BUG-005`, Issue `#13`):** El documento `PRD.md` (§2.1, línea 86) declara que el rol `Cajero` está facultado para abrir órdenes de mesa o para llevar (*takeout*). En contraposición, tanto `TESTING-PLAN.md` (§2.2) como la implementación en `CAJERO_ACTIONS` (`can.helper.ts`, líneas 79–86) y sus pruebas unitarias (`can.helper.spec.ts`, línea 47) deniegan `'orders:create'` al rol `CAJERO`, restringiéndolo a funciones de facturación, cobro y cierre de turno.
3. **Diferencia en el umbral documental de objetivos táctiles (`DEF-006` / `GF-BUG-006`, severidad Baja `P4`, Issue `#14`):** Mientras que `TESTING-PLAN.md` (§1 y §5.1) menciona un tamaño mínimo de `48x48 px` para controles interactivos en tablet, el requisito original en `PRD.md` (§1.2), las clases utilitarias de la interfaz (`min-h-[44px]`) y la suite automatizada `tablet-golden-path.e2e.spec.ts` implementan y verifican el umbral de `44x44 px` definido por el criterio 2.5.5 de WCAG 2.1 (W3C, 2018).

### Evaluación Formal del Riesgo Residual y Dictamen de Calidad

Desde la perspectiva de ingeniería de calidad y seguridad de aplicaciones (OWASP Foundation, 2021), los tres hallazgos abiertos (`DEF-004`, `DEF-005` y `DEF-006`) presentan un **riesgo residual acotado y controlado** que no compromete la viabilidad operativa ni la seguridad estructural del sistema:

- **Integridad del aislamiento multi-tenant intacta:** Ninguno de los defectos abiertos afecta las políticas `FORCE ROW LEVEL SECURITY` de PostgreSQL ni la propagación de `app.restaurant_id`. En el caso de `DEF-004`, incluso si un usuario con rol `MESERO` invoca el endpoint de avance de estado de cocina, su alcance permanece confinado estrictamente a las órdenes de su propio restaurante (`restaurant_id` firmado en el JWT y validado por RLS) y toda transición queda registrada con su `userId` en la tabla inmutable `order_status_history`.
- **Integridad financiera y contable preservada:** En `DEF-005`, la divergencia entre `PRD.md` y `can.helper.ts` opera hacia el lado seguro del principio de mínimo privilegio (*fail-safe / deny-by-default*): el código restringe una capacidad operativa al cajero en lugar de exponer funciones administrativas o de anulación no autorizadas. En restaurantes donde el cajero de mostrador requiera abrir pedidos para llevar sin cambiar de usuario, existe la alternativa operativa inmediata de emplear un perfil con rol `MESERO` o `GERENTE` mientras se unifica el criterio funcional.
- **Conformidad ergonómica estándar:** Respecto a `DEF-006`, el 100% de los botones evaluados en el viewport `1024x768` cumple el estándar internacional WCAG 2.1 Nivel AAA de `44x44` píxeles CSS (W3C, 2018), por lo que la discrepancia frente a los `48x48 px` citados en un documento secundario carece de impacto funcional.

En consecuencia, al haberse verificado empíricamente una tasa de ejecución del $100.00\%$ ($40/40$), una tasa de aprobación del $95.00\%$ ($38/40$, superando el umbral mínimo del $90.00\%$), una cobertura del $100.00\%$ de los requisitos en alcance ($28/28$) y la ausencia total de defectos abiertos de severidad Crítica o Alta ($\text{Abiertos } P1 = 0, \text{Abiertos } P2 = 0$), se emite el dictamen técnico de **Apto con Observaciones Menores Controladas** para la versión congelada `be9089e` de GastroForge.

## Limitaciones del Estudio y Trabajo Futuro (Fase 2)

De conformidad con las buenas prácticas de integridad científica y reporte empírico en ingeniería de software, se declaran tres limitaciones metodológicas que acotan la generalización de los resultados obtenidos:

1. **Entorno de ejecución contenedorizado local frente a redes distribuidas:** Las pruebas de integración transaccional (`L4`) y de sistema End-to-End (`L5`) se ejecutaron sobre contenedores Docker locales de PostgreSQL 16 y Redis 7 en la misma máquina anfitriona. Aunque este diseño elimina la variabilidad externa y garantiza la reproducibilidad determinista de las pruebas de concurrencia e idempotencia, no modela la latencia de red de área amplia (WAN), la pérdida intermitente de paquetes en conexiones Wi-Fi saturadas de salones comerciales ni el comportamiento del *pool* de conexiones sin servidor (*serverless*) bajo picos masivos de tráfico.
2. **Emulación de viewport táctil frente a hardware físico heterogéneo:** La validación de los niveles `L5` y `L6` se realizó mediante emulación de navegador en resolución estándar de tablet (`1024x768` píxeles) sobre motores Chromium y WebKit. No se evaluaron empíricamente dispositivos físicos con pantallas capacitivas sometidas a condiciones ambientales adversas de cocina (humedad, grasa o uso de guantes térmicos) ni impresoras térmicas físicas ESC/POS conectadas por puerto USB o Bluetooth.
3. **Exclusiones normativas diferidas a la Fase 2:** Siguiendo las decisiones arquitectónicas `ADR-0005` y `ADR-0006`, el presente estudio excluyó deliberadamente dos épicas planificadas para la Fase 2 del producto: el módulo de reservas anticipadas de mesas con bloqueo temporal de franjas horarias (`REQ-PH2-01` / `UC-PH2-01`) y el sistema de permisos granulares editables en base de datos por usuario junto con la autenticación mediante cabeceras `X-API-Key` para integraciones externas (`REQ-PH2-02` / `UC-PH2-02`).

Como trabajo futuro para el ciclo de mantenimiento posterior a la sustentación e inicio de la Fase 2, se recomienda: (a) corregir `DEF-004` introduciendo la acción específica `'orders:mark_served'` en `can.helper.ts` para desacoplar la entrega en mesa del avance de preparación en el KDS; (b) formalizar con el dueño de producto la resolución de `DEF-005` alineando `PRD.md` y `can.helper.ts`; (c) unificar documentalmente el umbral táctil de `DEF-006`; y (d) incorporar pruebas de carga distribuida (mediante herramientas como k6) que evalúen el rendimiento del despachador *Transactional Outbox* con múltiples instancias concurrentes de la API.

<div align="center">

## Referencias

</div>

American Psychological Association. (2020). *Publication manual of the American Psychological Association* (7th ed.). https://doi.org/10.1037/0000165-000

International Organization for Standardization. (2021). *Software and systems engineering — Software testing — Part 3: Test documentation* (ISO/IEC/IEEE Standard No. 29119-3:2021). https://www.iso.org/standard/79429.html

International Software Testing Qualifications Board. (2023). *Certified Tester Foundation Level (CTFL) syllabus* (Version 4.0). https://www.istqb.org/certifications/certified-tester-foundation-level

Myers, G. J., Sandler, C., & Badgett, T. (2011). *The art of software testing* (3rd ed.). John Wiley & Sons.

Nottingham, M., & Wilde, E. (2016). *Problem details for HTTP APIs* (RFC 7807). Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc7807

OWASP Foundation. (2021). *OWASP Application Security Verification Standard (ASVS)* (Version 4.0.3). https://owasp.org/www-project-application-security-verification-standard/

PostgreSQL Global Development Group. (2024). *PostgreSQL 16 documentation: Section 5.8. Row security policies*. https://www.postgresql.org/docs/16/ddl-rowsecurity.html

World Wide Web Consortium. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1* (W3C Recommendation). https://www.w3.org/TR/WCAG21/
