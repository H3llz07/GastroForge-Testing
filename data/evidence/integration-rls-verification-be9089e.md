# Evidencia de Verificación de Suites de Integración y Aislamiento RLS (`be9089e`)

- **Repositorio SUT:** `https://github.com/JhonatanM2005/GastroForge`
- **Commit Evaluado:** `be9089e` (`feat(web): add playwright tablet e2e suite and manual testing evidences (#71)`)
- **Nivel Piramidal:** Nivel L4 — Pruebas de Integración Transaccional e Infraestructura Real
- **Entorno de Ejecución:** `QA Local (PostgreSQL 16 app_user RLS + Redis 7 + NestJS TestingModule)`
- **Fecha de Captura:** `2026-11-16T02:30:00-05:00`
- **Responsables QA:** Julián Santiago Pico Pinzón (`@H3llz07`), Jhonatan A. Méndez R. (`@JhonatanM2005`) y Christian Urrego Issa (`@Christu12`)

---

## 1. Verificación del Guard de Mínimo Privilegio y `FORCE ROW LEVEL SECURITY`

En cumplimiento de `ADR-0002` y `ADR-0006`, todas las suites de integración en `apps/api/test/*.int-spec.ts` operan conectadas mediante el rol no privilegiado `app_user` y verifican en `beforeAll` que no posea privilegios `SUPERUSER` ni `BYPASSRLS`:

```sql
SELECT rolname, rolsuper, rolinherit, rolcreatedb, rolcreaterole, rolbypassrls
FROM pg_roles
WHERE rolname IN ('app_user', 'auth_lookup', 'outbox_worker')
ORDER BY rolname;
```

| Rol PostgreSQL | `rolsuper` | `rolinherit` | `rolcreatedb` | `rolcreaterole` | `rolbypassrls` | Resultado |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `app_user` | `false` | `false` | `false` | `false` | `false` | **VERIFICADO** |
| `auth_lookup` | `false` | `false` | `false` | `false` | `false` | **VERIFICADO** |
| `outbox_worker` | `false` | `false` | `false` | `false` | `false` | **VERIFICADO** |

Adicionalmente, `apps/api/test/rls-least-privilege.int-spec.ts` comprueba que las **23 tablas multi-tenant** tienen `rowsecurity = true` y `relforcerowsecurity = true` en `pg_tables` / `pg_class`, y que las **5 tablas append-only** (`payment`, `audit_log`, `order_item_status_history`, `inventory_movement`, `order_balance_adjustment`) revocan `UPDATE` y `DELETE` para `app_user` arrojando error PostgreSQL `42501 (permission denied)`.

---

## 2. Catálogo de las 28 Suites de Integración Verificadas (`apps/api/test/*.int-spec.ts`)

| # | Archivo de Especificación (`apps/api/test/`) | Caso(s) de Prueba Asociados | Invariantes Técnicos y de Negocio Verificados en `be9089e` | Estado |
|---|---|---|---|---|
| 1 | `auth-login.int-spec.ts` | `CP-AUTH-002` | Login Argon2id, mensajes RFC 7807 sin enumeración de cuentas (HTTP 401 en intentos 1..5) y bloqueo determinista HTTP 429 (`SYSTEM_RATE_LIMIT_EXCEEDED`) en el intento 6. | **PASSED** |
| 2 | `auth-refresh-logout.int-spec.ts` | `CP-AUTH-003` | Rotación de Refresh Token en cookie `HttpOnly`, detección de reuso fraudulento del token rotado invalidando toda la familia de sesiones (`token_version`) y limpieza inmediata en `/auth/logout`. | **PASSED** |
| 3 | `auth-switch-restaurant.int-spec.ts` | `CP-AUTH-004` | Cambio de contexto multi-tenant (`/api/v1/auth/switch-restaurant`) para usuarios con múltiples membresías y rechazo `403` ante intento de cambio a un restaurante ajeno. | **PASSED** |
| 4 | `auth-password-reset.int-spec.ts` | `CP-AUTH-005` | Emisión administrativa de token de restablecimiento de un solo uso (TTL 15 min), actualización de hash, incremento de `token_version` y rechazo de segundo uso. | **PASSED** |
| 5 | `tenants-members.int-spec.ts` | `CP-AUTH-004`, `CP-RLS-001` | Gestión de miembros por restaurante aislada por RLS y bloqueo de lectura/modificación cruzada entre tenants. | **PASSED** |
| 6 | `tenants-restaurant-brand.int-spec.ts` | `CP-AUTH-004` | Actualización de perfil de restaurante y validación de contraste de marca WCAG AA (`>= 4.5:1`). | **PASSED** |
| 7 | `tenant-tx-seed.int-spec.ts` | `CP-RLS-001` | Ejecución transaccional `tenantTx` fijando `SELECT set_config('app.restaurant_id', $1, true)` e integridad de semillas multi-tenant. | **PASSED** |
| 8 | `catalog-stations.int-spec.ts` | `CP-CAT-001` | Creación, listado y unicidad de estaciones de preparación (`PARRILLA`, `BARRA`, `COCINA_FRIA`) por restaurante. | **PASSED** |
| 9 | `catalog-categories.int-spec.ts` | `CP-CAT-001` | Gestión de categorías de menú, ordenamiento `sortOrder` y filtrado de categorías activas. | **PASSED** |
| 10 | `catalog-menu-items.int-spec.ts` | `CP-CAT-002`, `CP-CAT-004` | Creación de productos con precio `Decimal(12,2)`, exención o inclusión de IVA y cambio rápido de disponibilidad (`available`). | **PASSED** |
| 11 | `catalog-modifier-groups.int-spec.ts` | `CP-CAT-003` | Análisis de valores límite (BVA) en `minSelect` y `maxSelect`: rechazo HTTP 400 cuando `min > max`, selección `< min` o `> max`, y aceptación en fronteras exactas. | **PASSED** |
| 12 | `tables-management.int-spec.ts` | `CP-TAB-001` | Creación de áreas y mesas con BVA de capacidad (`<= 0` rechazado con HTTP 400, `>= 1` aceptado) y unicidad de código de mesa por tenant (HTTP 409). | **PASSED** |
| 13 | `tables-overview.int-spec.ts` | `CP-TAB-003` | Derivación dinámica del estado de ocupación (`FREE -> OCCUPIED -> FREE`) a partir de órdenes `DINE_IN` abiertas sin almacenar estado redundante propenso a desincronización. | **PASSED** |
| 14 | `orders-open.int-spec.ts` | `CP-ORD-002` | Apertura de órdenes `DINE_IN` y `TAKEOUT` con numeración secuencial diaria por tenant (`#YYYYMMDD-XXX`), exigencia de sesión de caja abierta y rechazo HTTP 409 ante doble orden en la misma mesa. | **PASSED** |
| 15 | `orders-rounds.int-spec.ts` | `CP-ORD-003` | Despacho de tandas (`OrderRound`), snapshots inmutables de precios/modificadores, validación BVA de cantidades (`0` y `100` -> HTTP 400; `1` y `99` -> HTTP 201) y bloqueo optimista por `version` (`409 ORDER_CONFLICT_VERSION`). | **PASSED** |
| 16 | `orders-item-cancellation.int-spec.ts` | `CP-ORD-005` | Reglas de anulación por estado: `MESERO` cancela libremente en `PENDING`, recibe `403` en `PREPARING`/`READY`, `GERENTE`/`ADMIN` cancelan con motivo obligatorio auditado y se rechaza cancelar ítems `SERVED`. | **PASSED** |
| 17 | `kitchen-queue.int-spec.ts` | `CP-KIT-002` | Aislamiento estricto de la cola KDS según las estaciones asignadas al cocinero (`RestaurantMemberStation`) y bloqueo *fail-closed* (`403`) si no tiene estación asignada. | **PASSED** |
| 18 | `kitchen-status.int-spec.ts` | `CP-KIT-003` | Máquina de estados de preparación (`PENDING -> PREPARING -> READY -> SERVED`), rechazo de transiciones regresivas o saltos inválidos (HTTP 400/422) e inserción en `order_item_status_history`. | **PASSED** |
| 19 | `outbox-sse.int-spec.ts` | `CP-KIT-004` | Persistencia transaccional de `outbox_event`, relay con `FOR UPDATE SKIP LOCKED`, backoff exponencial ante fallo de Redis y emisión de eventos al canal SSE por tenant. | **PASSED** |
| 20 | `cash-session.int-spec.ts` | `CP-CSH-001` | Índice único parcial `uq_cash_register_open` que impide abrir dos sesiones `OPEN` simultáneas en la misma caja (`409 CASH_REGISTER_ALREADY_OPEN`) y cierre con arqueo ciego inmutable (`CLOSED`). | **PASSED** |
| 21 | `cash-payments.int-spec.ts` | `CP-CSH-003`, `CP-CSH-006` | Cobros parciales/divididos (`CASH` + `CARD`) bajo `app_user` sin `FOR UPDATE` en `payment` (**verificación de regresión de `DEF-001`**) y protección `Idempotency-Key` contra doble cobro concurrente. | **PASSED** |
| 22 | `cash-reversals.int-spec.ts` | `CP-CSH-008` | Reversos compensatorios inmutables y ajustes de saldo restringidos a `GERENTE`/`ADMIN` con motivo obligatorio y bloqueo `403` para `CAJERO`. | **PASSED** |
| 23 | `inventory-items.int-spec.ts` | `CP-INV-001` | Catálogo de insumos de inventario y activación exacta de alerta de stock bajo en frontera BVA (`currentQuantity <= minimumQuantity`). | **PASSED** |
| 24 | `inventory-movements.int-spec.ts` | `CP-INV-002` | Kardex append-only de movimientos manuales (`IN`, `OUT`, `ADJUSTMENT`) con motivo obligatorio y tolerancia auditada de stock negativo sin bloquear ventas. | **PASSED** |
| 25 | `reports-dashboard.int-spec.ts` | `CP-REP-001` | Cálculo de KPIs ejecutivos (ventas netas/brutas, IVA, propinas, ticket promedio, medios de pago, top productos) con hidratación e invalidación de caché Redis. | **PASSED** |
| 26 | `reports-export.int-spec.ts` | `CP-REP-003` | Exportación CSV en streaming con cabecera UTF-8 BOM (`\uFEFF`), proyección `firstName`/`lastName` y `cashierId` (**verificación de regresión de `DEF-002`**) y sanitización contra CSV Formula Injection (`=`, `+`, `-`, `@`). | **PASSED** |
| 27 | `rls-least-privilege.int-spec.ts` | `CP-RLS-002` | Verificación en motor PostgreSQL de `rolbypassrls = false`, `FORCE ROW LEVEL SECURITY` en 23 tablas, 0 filas sin contexto `app.restaurant_id` y revocación de `UPDATE`/`DELETE` en las 5 tablas inmutables. | **PASSED** |
| 28 | `rls-negative-hardening.int-spec.ts` | `CP-RLS-001`, `CP-RLS-004` | Suite negativa cross-tenant completa (GET/PATCH/POST entre Tenant A y Tenant B -> 404/403, bloqueo de FK compuesta inter-tenant, rechazo de `Origin: null` y fail-closed `503` cuando Redis cae). | **PASSED** |

*(Nota: El repositorio incluye además `security-health.int-spec.ts` para verificación de `/health/live`, `/health/ready`, cabeceras Helmet y trazabilidad `x-request-id`).*

---

## 3. Evidencia de Verificación de Regresiones Históricas en `be9089e`

1. **`DEF-001` (`GF-BUG-001` — `CP-CSH-003`):** En `apps/api/src/modules/cash/cash.service.ts` y `apps/api/test/cash-payments.int-spec.ts`, el bloqueo pesimista se aplica únicamente sobre `restaurant_order` y **no** sobre la tabla append-only `payment`. Los cobros divididos bajo `app_user` finalizan con HTTP `201 Created` sin error `42501: permission denied for table payment`.
2. **`DEF-002` (`GF-BUG-002` — `CP-REP-003`):** En `apps/api/src/modules/reports/reports.service.ts` y `apps/api/test/reports-export.int-spec.ts`, la consulta Prisma proyecta `cashier: { select: { firstName: true, lastName: true } }` a través de `cashierId`, generando el stream CSV con BOM `\uFEFF` y HTTP `200 OK`.
