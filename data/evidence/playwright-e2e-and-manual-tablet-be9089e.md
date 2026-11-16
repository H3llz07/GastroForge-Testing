# Evidencia de Ejecución Playwright E2E Tablet (`1024x768`) y los 15 Casos Manuales (`be9089e`)

- **Repositorio SUT:** `https://github.com/JhonatanM2005/GastroForge`
- **Commit Evaluado:** `be9089e` (`feat(web): add playwright tablet e2e suite and manual testing evidences (#71)`)
- **Niveles Piramidales:** Nivel L5 (Playwright E2E `1024x768` Chromium & WebKit) y Nivel L6 (15 Casos Manuales en Tablet Viewport `1024x768`)
- **Fecha de Ejecución:** `2026-11-16T01:00:00-05:00` a `2026-11-16T04:55:00-05:00`
- **Ejecutores:**
  - **Bloque A (`CP-001` a `CP-010`, `CP-020` a `CP-023`, `CP-037` a `CP-040`):** Jhonatan A. Méndez R. (`@JhonatanM2005`)
  - **Bloque B (`CP-011` a `CP-019`, `CP-024` a `CP-036`):** Julián Santiago Pico Pinzón (`@H3llz07`)

---

## 1. Ejecución de la Suite Automatizada Playwright E2E (`CP-RLS-003` / `RUN-039`)

- **Archivo de Especificación:** `apps/web/e2e/specs/tablet-golden-path.e2e.spec.ts`
- **Configuración (`apps/web/playwright.config.ts`):**
  - Viewport fijo: `1024x768` (orientación horizontal tablet)
  - Capacidad táctil: `hasTouch: true`
  - Proyectos evaluados: `chromium` y `webkit`
- **Secuencia Verificada del Golden Path:**
  1. Navegación a `/login`, ingreso de `admin.forja@gastroforge.dev` y verificación del bounding box del botón `Ingresar al sistema` (`height >= 44px`).
  2. Navegación a `/cashier` y comprobación de carga de cuentas abiertas (`Open Accounts`).
  3. Navegación al plano de salón `/tables` y verificación de etiquetas de disponibilidad (`Disponible:`).
  4. Apertura de pedido en `/orders` (`Para Llevar`), adición de `Agua Mineral Manantial` y envío de tanda (`Enviar Tanda a Cocina`).
  5. Recepción en KDS (`/kitchen`), verificación de columna `Pendiente` y avance de estados (`Iniciar preparación` -> `Marcar listo`).
  6. Retorno a `/cashier`, selección del pedido y ejecución de cobro (`Record Payment / Cobrar`).
  7. Verificación del dashboard ejecutivo y sección `Sales History CSV Export` en `/reports`.
- **Resultado:** `2 passed (chromium, webkit)` — **PASSED**.

---

## 2. Registro Detallado de los 15 Casos de Prueba Manuales (Nivel L6)

| Caso | Run ID | Módulo | Resumen de Evidencia Capturada en `1024x768` (`be9089e`) | Estado | Defectos |
|---|---|---|---|---|---|
| `CP-AUTH-001` | `RUN-001` | `auth` | Login interactivo en `/login` (`1024x768`) con credenciales de `MESERO`; emisión de cookie `HttpOnly` de refresh, almacenamiento en memoria del JWT y redirección automática a `/tables` mostrando restaurante y rol activos. | **PASSED** | Ninguno |
| `CP-AUTH-004` | `RUN-004` | `auth` | Cambio interactivo de restaurante activo desde el selector superior (`La Brasa Dorada` -> `Pizzería Napoli`), reemisión de JWT con nuevo `restaurantId` y medición de contraste WCAG 2.1 AA (`ratio = 7.42:1 >= 4.5:1`). | **PASSED** | Ninguno |
| `CP-AUTH-005` | `RUN-005` | `auth` | Generación administrativa de token temporal de restablecimiento (TTL 15 min), consumo exitoso actualizando contraseña, revocación instantánea de la sesión previa (`token_version + 1`) y rechazo `400/401` al intentar reutilizar el token. | **PASSED** | Ninguno |
| `CP-CAT-001` | `RUN-007` | `catalog` | Creación manual de estaciones `PARRILLA` y `BARRA`, creación y reordenamiento de categoría `Cortes Madurados` (`sort_order = 1`) y ocultamiento inmediato en el POS al desactivar una categoría secundaria. | **PASSED** | Ninguno |
| `CP-CAT-004` | `RUN-010` | `catalog` | Conmutación rápida de disponibilidad (*86ing*) del producto `Lomo al Trapo` (`AVAILABLE -> UNAVAILABLE -> AVAILABLE`); reflejo inmediato en la tablet del mesero impidiendo seleccionarlo mientras está agotado. | **PASSED** | Ninguno |
| `CP-TAB-002` | `RUN-012` | `tables` | Inspección DOM en DevTools (`1024x768`) del mapa `/tables`: tarjetas de mesa con altura mínima medida de `108px` (`>= 104px`), cero scroll horizontal y triple codificación visual (color, texto `Libre`/`Ocupada` e ícono). | **PASSED** | Ninguno |
| `CP-ORD-001` | `RUN-014` | `orders` | **Guion M-01:** Apertura de cuenta en mesa `M-02`, selección de 4 productos con modificadores y envío a cocina en `13.4 s` (`< 15 s`). La medición DOM confirma controles de `44x44 px` (`min-h-[44px]` conforme a `PRD.md` §1.2), registrándose la discrepancia documental menor `DEF-006` frente a los `48x48 px` citados en `TESTING-PLAN.md` §1/§5.1. | **PASSED** | `DEF-006` |
| `CP-ORD-004` | `RUN-017` | `orders` | Intento de anulación de ítem en estado `PREPARING` por `MESERO` bloqueado hasta ingresar autorización de `GERENTE` y motivo obligatorio (`Cliente cambió de opinión por alergia alimentaria`); registro verificado en `audit_log`. | **PASSED** | Ninguno |
| `CP-KIT-001` | `RUN-020` | `kitchen` | Visualización en `/kitchen` (`1024x768`) de la cola FIFO exclusiva de `PARRILLA` con validación de las 3 particiones semafóricas de tiempo transcurrido (verde/neutro, ámbar de alerta y rojo urgente con anillo pulsante). | **PASSED** | Ninguno |
| `CP-KIT-004` | `RUN-023` | `kitchen` | **Guion M-02:** Simulación de corte Wi-Fi (DevTools Offline durante 30 s) en tablet KDS (`use-realtime-events.ts`), despacho de tanda desde otra sesión y reconexión automática del `EventSource` al restaurar red, invalidando caché de TanStack Query sin presionar `F5`. | **PASSED** | Ninguno |
| `CP-CSH-002` | `RUN-025` | `cash` | Apertura de turno con fondo inicial de `$200.000`, cobros en efectivo por `$150.000` y cierre con **arqueo ciego** declarando `$345.000` (diferencia calculada `-5000.00` faltante) con nota obligatoria e inmutabilidad `CLOSED`. | **PASSED** | Ninguno |
| `CP-CSH-005` | `RUN-028` | `cash` | Intento de cobro en `/cashier` por `$60.000` sobre saldo pendiente de `$45.000` (`HTTP 422`). Se verifica en pantalla que `AlertBanner` renderiza explícitamente `err.detail` del payload RFC 7807 (**confirmando la corrección de regresión de `DEF-003`**). | **PASSED** | `DEF-003` |
| `CP-CSH-007` | `RUN-030` | `cash` | Ejecución manual como `GERENTE` de reverso compensatorio sobre pago de `$65.000` en efectivo con motivo obligatorio; el pago original permanece intacto, se crea el asiento negativo y el saldo pendiente se restablece a `$65.000`. | **PASSED** | Ninguno |
| `CP-REP-002` | `RUN-035` | `reports` | Emulación CSS `@media print` en ancho de tirilla térmica de `80mm` (`~302px`) para recibo de orden y reporte de cierre de caja; barra lateral y botones quedan ocultos (`display: none`) y las cifras tabulares se alinean sin truncamiento. | **PASSED** | Ninguno |
| `CP-RLS-004` | `RUN-040` | `rls` | Inspección manual con cliente HTTP de cabeceras Zero-Trust: peticiones con `Origin: null` y `Origin: https://evil-attacker.example.com` no reciben `Access-Control-Allow-Origin`; propagación exacta de `X-Request-Id: req-qa-audit-0040` y respuesta `application/problem+json`. | **PASSED** | Ninguno |

---

## 3. Evidencia de Inspección de Código y Tabla de Decisión RBAC (`DEF-004` y `DEF-005`)

Durante la contrastación de `apps/api/src/modules/auth/domain/can.helper.ts` y `apps/web/app/features/auth/domain/can.ts` contra la Matriz de Capacidades del `PRD.md` (§2.1, líneas 78–98) y la Tabla de Decisión de `TESTING-PLAN.md` (§2.2, líneas 113–126) en el commit congelado `be9089e`, se documentan los siguientes resultados:

1. **`CP-AUTH-006` (`RUN-006`) — `FAILED` (`DEF-004` / `GF-BUG-004`):**
   - **Código inspeccionado (`apps/api/src/modules/auth/domain/can.helper.ts`, líneas 68–77):**
     ```typescript
     const MESERO_ACTIONS = new Set<Action>([
       'orders:create',
       'orders:read',
       'orders:update',
       'orders:cancel',
       'tables:read',
       'catalog:read',
       'kitchen:read',
       'kitchen:advance_status',
     ]);
     ```
   - **Discrepancia demostrada:** `PRD.md` (§2.1, líneas 89–91) y `TESTING-PLAN.md` (§2.2, línea 120) establecen que el rol `Mesero` **no** tiene permiso para ver la cola KDS (`Ver cola KDS de estaciones asignadas: No`) ni para cambiar estados de preparación (`Preparing`, `Ready`: `No`), limitándose a marcar ítems como `Served`. Sin embargo, `MESERO_ACTIONS` incluye `'kitchen:read'` y `'kitchen:advance_status'` y el `switch (actor.role)` en la línea 99 retorna `MESERO_ACTIONS.has(action)` (`true`) sin validar estación ni restringir la transición únicamente a `SERVED`.

2. **`CP-ORD-006` (`RUN-019`) — `FAILED` (`DEF-005` / `GF-BUG-005`):**
   - **Código inspeccionado (`apps/api/src/modules/auth/domain/can.helper.ts`, líneas 79–86 y `can.helper.spec.ts`, línea 47):**
     ```typescript
     const CAJERO_ACTIONS = new Set<Action>([
       'cash:open_session',
       'cash:close_session',
       'cash:collect_payment',
       'orders:read',
       'tables:read',
       'catalog:read',
     ]);
     ```
   - **Discrepancia demostrada:** `PRD.md` (§2.1, línea 85: `Abrir orden / cuenta (Mesa o Para Llevar) -> Cajero: Sí`) exige que el rol `Cajero` pueda abrir órdenes/cuentas (especialmente pedidos `TAKEOUT` en mostrador de caja), pero `CAJERO_ACTIONS` omite `'orders:create'`, por lo que `can({ role: 'CAJERO' }, 'orders:create')` retorna `false`.
