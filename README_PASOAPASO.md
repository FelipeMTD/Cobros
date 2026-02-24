# 🚀 Guía de Implementación Paso a Paso: Sistema de Cobros SaaS

Esta guía detalla la ruta crítica para construir el sistema SaaS Multi-Tenant desde cero hasta producción en Render.

> **Stack:** Node.js, React, Flutter, PostgreSQL, Render.
> **Arquitectura:** Cloud-Native + Offline-First.

---

## 🏁 Fase 0: Preparación del Entorno (Prerrequisitos)

Antes de programar, configuramos el ecosistema.

- [ ] **Cuentas y Accesos:**

  - [ ] Crear cuenta en **GitHub**.
  - [ ] Crear cuenta en **Render.com** y conectarla con GitHub.
  - [ ] Instalar **Node.js v20+** y **npm**.
  - [ ] Instalar **Flutter SDK** (Configurar Android Studio/VS Code).
  - [ ] Instalar **Docker** (Opcional, pero recomendado para correr PostgreSQL local).
- [ ] **Estructura del Proyecto (Monorepo):**

  - [ ] Crear carpeta raíz: `sistema-cobros-saas`.
  - [ ] Inicializar Git: `git init`.
  - [ ] Crear `.gitignore` global (node_modules, .env, build, .dart_tool).
  - [ ] Crear subcarpetas:
    - `/backend` (API Node.js)
    - `/web-admin` (Panel React)
    - `/mobile-app` (App Flutter)

---

## 🏗️ Fase 1: Backend y Base de Datos (Core SaaS)

Aquí construimos el motor multi-empresa.

### 1.1 Inicialización

- [ ] Entrar a `/backend`.
- [ ] `npm init -y`.
- [ ] Instalar dependencias:
  `npm install express cors dotenv pg prisma typescript ts-node jsonwebtoken bcrypt helmet`.
- [ ] Inicializar TS: `npx tsc --init`.

### 1.2 Modelado de Datos (Prisma Schema)

- [ ] `npx prisma init`.
- [ ] Definir modelos en `schema.prisma` con soporte Multi-Tenant:
  ```prisma
  model Empresa {
    id            String   @id @default(uuid())
    nombre        String
    estado        String   @default("ACTIVO") // ACTIVO, SUSPENDIDO
    configuracion ConfiguracionEmpresa?
    usuarios      Usuario[]
    // ... relaciones a clientes, creditos
  }

  model ConfiguracionEmpresa {
    id              String  @id @default(uuid())
    empresaId       String  @unique
    empresa         Empresa @relation(fields: [empresaId], references: [id])
    tasaInteres     Decimal @default(20.0)
    limiteCreditos  Int     @default(2)
    cobrarMora      Boolean @default(true)
    excluirDomingos Boolean @default(true)
  }

  model Usuario {
    id        String  @id @default(uuid())
    empresaId String
    empresa   Empresa @relation(fields: [empresaId], references: [id])
    rol       String  // SUPER_ADMIN, ADMIN_EMPRESA, PRESTAMISTA
    // ... auth fields
  }
  // IMPORTANTE: Todas las demas tablas (Clientes, Creditos, Pagos)
  // DEBEN tener el campo `empresaId`.
  ```
- [ ] Ejecutar migración local: `npx prisma migrate dev --name init_saas`.

### 1.3 Autenticación SaaS

- [ ] Crear endpoint `POST /api/auth/login`.
- [ ] **Lógica:**
  1. Validar credenciales.
  2. Generar JWT que incluya: `{ userId, rol, empresaId }`.
  3. Si `Empresa.estado == 'SUSPENDIDO'`, rechazar login.

---

## 🔒 Fase 2: Middleware Multi-Tenant (Seguridad)

El componente más crítico para evitar cruce de datos.

- [ ] Crear `middleware/checkTenant.ts`.
- [ ] **Funcionalidad:**
  1. Intercepta todos los requests (excepto login).
  2. Verifica y decodifica el JWT.
  3. Inyecta `req.user.empresaId` en el contexto.
- [ ] **Aplicación en Prisma:**
  - Asegurar que **TODAS** las consultas a base de datos usen el ID inyectado.
  - Ejemplo: `prisma.cliente.findMany({ where: { empresaId: req.user.empresaId } })`.

---

## 🖥️ Fase 3: Panel Web (React)

Interfaz para el Super Admin y los Clientes.

- [ ] Entrar a `/web-admin`.
- [ ] `npm create vite@latest . -- --template react-ts`.
- [ ] Instalar **Tailwind CSS** y **Axios**.

### 3.1 Vistas Super Admin (Tú)

- [ ] Login Especial (sin empresaId o con ID maestro).
- [ ] **Dashboard de Tenants:** Tabla para ver todas las empresas registradas.
- [ ] **Acciones:** Botón para "Crear Empresa" y "Suspender Servicio".

### 3.2 Vistas Admin Empresa (Tu Cliente)

- [ ] **Login de Cliente.**
- [ ] **Configuración del Negocio:** Formulario para editar `tasaInteres`, `diasMora`, etc.
  - Al guardar, hace `PATCH /api/configuracion`.
- [ ] **Gestión de Cobradores:** Crear usuarios con rol `PRESTAMISTA`.
- [ ] **Dashboard Financiero:** Ver Caja Global y reportes.

---

## 📱 Fase 4: App Móvil (Offline & Dinámica)

La herramienta de campo que se adapta a la configuración.

- [ ] Crear proyecto Flutter en `/mobile-app`.
- [ ] Instalar: `sqflite` (o `drift`), `provider`, `dio`, `connectivity_plus`.

### 4.1 Login y "Config Hydration"

- [ ] Pantalla Login.
- [ ] **Paso Crítico:** Al recibir el token, llamar a `GET /api/configuracion`.
- [ ] Guardar el JSON de configuración en almacenamiento local (ej: `SharedPreferences`).
- [ ] *Razón:* La app necesita saber qué interés cobrar aunque no tenga internet.

### 4.2 Base de Datos Local

- [ ] Crear tablas SQLite espejo (`clientes`, `creditos`, `pagos`).
- [ ] Añadir columnas de control: `sync_status` (0=synced, 1=pending), `updated_at`.

### 4.3 Lógica de Negocio Adaptativa

- [ ] **Crear Crédito:**
  - Leer configuración local.
  - Calcular: `Total = Monto * (1 + (config.tasaInteres / 100))`.
  - Validar: `if (creditosActivos >= config.limiteCreditos) Error`.
- [ ] **Registrar Pago:**
  - Guardar en SQLite con `sync_status = 1`.

---

## 🔄 Fase 5: Motor de Sincronización

Conectando el mundo offline con la nube.

### 5.1 Backend (Endpoints)

- [ ] `POST /api/sync/push`:
  - Recibe array de cambios (Clientes nuevos, Pagos).
  - Ejecuta en transacción (`prisma.$transaction`).
  - Manejo de conflictos: Si el pago ya existe, ignorar o marcar error.
- [ ] `GET /api/sync/pull`:
  - Recibe `lastSyncTimestamp`.
  - Retorna datos modificados después de esa fecha pertenecientes a `empresaId`.

### 5.2 Móvil (Servicio Sync)

- [ ] Crear `SyncService`.
- [ ] **Proceso:**
  1. Verificar conexión.
  2. **PUSH:** Leer filas `sync_status=1` -> Enviar al backend -> Si OK, marcar `sync_status=0`.
  3. **PULL:** Pedir cambios al backend -> Insertar/Actualizar SQLite local.
  4. **CONFIG:** Actualizar configuración de empresa por si cambiaron reglas.

---

## 💰 Fase 6: Módulos Financieros (Caja y Mora)

### 6.1 Sistema de Caja

- [ ] **Backend:** Crear tablas `CajaGlobal` y `CajaMenor`.
- [ ] Implementar flujo de aprobación:
  - Solicitud (App) -> Pendiente (BD) -> Aprobación (Web) -> Saldo Actualizado.

### 6.2 Motor de Mora

- [ ] Implementar algoritmo de fechas.
- [ ] **Lógica Condicional:**
  ```javascript
  if (config.excluirDomingos) diasMora -= domingos;
  if (config.excluirFestivos) diasMora -= festivosColombia; // Usar algoritmo Meeus
  ```

---

## 🚀 Fase 7: Despliegue en Render

Puesta en producción.

### 7.1 Base de Datos

- [ ] En Render Dashboard: New -> **PostgreSQL**.
- [ ] Copiar `Internal Database URL`.

### 7.2 Backend (Web Service)

- [ ] New -> **Web Service**.
- [ ] Conectar repo GitHub.
- [ ] Build Command: `npm install && npx prisma migrate deploy && npm run build`.
- [ ] Start Command: `npm start`.
- [ ] Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.

### 7.3 Frontend (Static Site)

- [ ] New -> **Static Site**.
- [ ] Build Command: `npm run build`.
- [ ] Publish Directory: `dist`.

### 7.4 Móvil

- [ ] `flutter build apk --release`.
- [ ] Distribuir APK a clientes.

---

## ✅ Fase 8: Validación Final (QA SaaS)

- [ ] **Prueba de Aislamiento:** Crear datos en Empresa A, loguearse como Empresa B y verificar que la lista esté vacía.
- [ ] **Prueba de Configuración:** Cambiar interés en Web, sincronizar App, verificar nuevo cálculo.
- [ ] **Prueba Offline:** Realizar cobro sin internet, sincronizar, verificar en Web.
