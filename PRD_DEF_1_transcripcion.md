# PRD COMPLETO Y DEFINITIVO

## Sistema de Gestión de Cobros de Préstamos

Versión 1.0 — Especificación Ejecutable para Desarrollo

|  |
|---|
| Fecha de cierre: 10 de febrero de 2026 |
| Estado: ✅ CERRADO — LISTO PARA DESARROLLO |
| Completitud de decisiones: 100% |
| Ambigüedades bloqueantes: 0 |

---

## TABLA DE CONTENIDOS

- [Resumen Ejecutivo](#1-resumen-ejecutivo)
- [Objetivo y Alcance](#2-objetivo-y-alcance)
- [Actores y Roles](#3-actores-y-roles)
- [Arquitectura del Sistema](#4-arquitectura-del-sistema)
- [Modelo Conceptual de Datos](#5-modelo-conceptual-de-datos)
- [Sistema de Rutas](#6-sistema-de-rutas)
- [Sistema de Caja](#7-sistema-de-caja)
- [Gestión de Créditos](#8-gestion-de-creditos)
- [Gestión de Pagos](#9-gestion-de-pagos)
- [Cálculo de Mora](#10-calculo-de-mora)
- [Sincronización Offline](#11-sincronizacion-offline)
- [Seguridad y Autenticación](#12-seguridad-y-autenticacion)
- [Manejo de Errores](#13-manejo-de-errores)
- [Testing y Calidad](#14-testing-y-calidad)
- [Deployment y Ambientes](#15-deployment-y-ambientes)
- [Monitoreo y Operación](#16-monitoreo-y-operacion)
- [Supuestos Técnicos](#17-supuestos-tecnicos)
- [Riesgos Aceptados](#18-riesgos-aceptados)
- [Plan de Implementación](#19-plan-de-implementacion)
- [Criterios de Aceptación](#20-criterios-de-aceptacion)
- [Glosario](#21-glosario)
- [Declaración de Cierre](#22-declaracion-de-cierre)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Propósito del Documento

Este PRD define de manera completa, ejecutable y sin ambigüedades el Sistema de Gestión de Cobros de Préstamos, diseñado para operar con arquitectura offline-first, permitiendo a prestamistas/cobradores gestionar créditos, registrar pagos y administrar efectivo en campo sin conexión a internet, sincronizando automáticamente cuando exista conectividad.

### 1.2 Estado de Completitud

Decisiones de negocio: 100% cerradas (39 preguntas respondidas)

Reglas operativas: 100% definidas

Flujos críticos: 100% documentados

Ambigüedades bloqueantes: 0 detectadas

Supuestos técnicos: Explícitamente documentados

Riesgos aceptados: Identificados y aceptados conscientemente

### 1.3 Audiencia del Documento

- Equipo de desarrollo: Backend, frontend web, app móvil
- QA/Testing: Definición de casos de prueba
- Product Owner: Validación de alcance
- Stakeholders: Comprensión de capacidades del sistema
### 1.4 Alcance de Fase 1

Incluido (Desarrollo Inmediato):

- Sistema completo de gestión de cobros con operación offline
- Backend Node.js + PostgreSQL
- App móvil Flutter para Android
- Panel web React para administración
- Sincronización bidireccional automática
- Control completo de efectivo (Caja Global + Cajas Menores)
- Sistema de rutas con asignación individual de clientes
- Cálculo automático de mora con festivos colombianos
- Revalorización y renovación de créditos
- Testing automatizado con cobertura obligatoria
Excluido (Fase 2 — Posible Evolución Futura):

- Migración a infraestructura en la nube
- Modelo SaaS multi-tenant con suscripción
- App para iOS
- Análisis predictivo o scoring crediticio
- Integración con pasarelas de pago
- Reportes avanzados con BI
- Notificaciones push a clientes

---

## 2. OBJETIVO Y ALCANCE

### 2.1 Objetivo General

Desarrollar un sistema de gestión de cobros de préstamos que permita a una empresa de microcréditos administrar clientes, créditos, pagos y efectivo mediante una aplicación móvil offline-first para cobradores en campo y un panel web administrativo, garantizando sincronización bidireccional de datos, control estricto de flujo de caja, y cálculo automático de mora según calendario colombiano.

### 2.2 Objetivos Específicos

|  |
|---|
| OE-001: Permitir operación completa sin conexión a internet en app móvil durante jornada de cobro (mínimo 6 horas) |
| OE-002: Sincronizar automáticamente cambios bidireccionales (app → servidor, servidor → app) cada 15 minutos cuando exista conexión |
| OE-003: Controlar flujo de efectivo mediante sistema de Caja Global centralizada y Cajas Menores individuales por prestamista con trazabilidad completa |
| OE-004: Calcular mora automáticamente excluyendo domingos y festivos colombianos según normativa oficial |
| OE-005: Organizar clientes en rutas con asignación individual a cobradores para optimizar recorridos de cobro |
| OE-006: Garantizar auditoría completa de todas las transacciones financieras (asignaciones, retornos, desembolsos, pagos) |
| OE-007: Soportar revalorización de créditos activos y renovación de créditos pagados según reglas de negocio definidas |

### 2.3 Alcance Funcional Detallado

#### 2.3.1 Módulo de Usuarios

- Creación, edición, bloqueo de usuarios (Admin y Prestamistas)
- Autenticación con JWT
- Gestión de sesiones con bloqueo remoto
- Roles y permisos granulares
#### 2.3.2 Módulo de Clientes

- CRUD completo de clientes
- Validación de nombre completo (mínimo 2 palabras, mayúsculas)
- Diferenciación por teléfono en casos de nombres duplicados
- Sincronización offline de clientes creados/editados
#### 2.3.3 Módulo de Créditos

- Creación de créditos con validación de límite (máximo 2 activos por cliente)
- Cálculo automático de cuotas e intereses (20%)
- Revalorización con requisitos (40% pagado, 30+ días)
- Renovación con requisito (100% pagado)
- Gestión de estados (ACTIVO, MORA, PAGADO, REVALORIZADO)
#### 2.3.4 Módulo de Pagos

- Registro de pagos en efectivo (incrementa Caja Menor)
- Registro de pagos por transferencia (va directo a Caja Global)
- Validación de fecha actual (no retroactivos ni futuros)
- Manejo de sobrepagos (reduce cuota final)
- Sincronización offline de pagos
#### 2.3.5 Módulo de Rutas

- Creación y gestión de rutas
- Asignación de múltiples cobradores a una ruta
- Asignación individual de clientes/créditos a cobrador específico
- Reasignación de clientes entre cobradores
- Visualización en app móvil solo de clientes asignados
#### 2.3.6 Módulo de Caja

- Caja Global única centralizada (administrada por Admin)
- Caja Menor por prestamista (operativa diaria)
- Asignación de efectivo con flujo de confirmación bidireccional
- Retorno de efectivo con flujo de confirmación bidireccional
- Auditoría completa de movimientos
#### 2.3.7 Módulo de Sincronización

- Sincronización bidireccional automática cada 15 minutos
- Procesamiento por lotes de 500 registros
- Detección y resolución automática de conflictos
- Orden garantizado: Clientes → Créditos → Pagos
- Reintentos automáticos con backoff exponencial
#### 2.3.8 Módulo de Mora

- Cálculo automático de días de mora (solo días hábiles)
- Exclusión de domingos y festivos colombianos
- Festivos precargados 2024-2030 con actualización automática anual
- Script de generación de festivos con algoritmo de Meeus
### 2.4 Alcance No Funcional

|  |
|---|
| ANF-001 Disponibilidad: App móvil 100% operativa sin conexión |
| ANF-002 Rendimiento: Sincronización de 500 registros en <15 segundos |
| ANF-003 Seguridad: Autenticación JWT, encriptación en tránsito |
| ANF-004 Escalabilidad: Diseñado para 10 cobradores, 500 clientes (Fase 1) |
| ANF-005 Mantenibilidad: Cobertura de tests ≥80%, código documentado |
| ANF-006 Compatibilidad: Android 8.0+, navegadores modernos (Chrome, Firefox, Edge) |

---

## 3. ACTORES Y ROLES

### 3.1 Administrador (Admin)

Descripción: Usuario con máximos privilegios, responsable de gestión completa del sistema, aprobaciones y resolución de conflictos.

Permisos Completos:

Gestión de Usuarios:

- ✅ Crear usuarios (Admin, Prestamista)
- ✅ Editar datos de usuarios (nombre, contraseña, rol)
- ✅ Bloquear/Desbloquear usuarios
- ✅ Bloquear sesiones remotamente
- ✅ Ver log de actividad de usuarios
Gestión de Clientes:

- ✅ Crear clientes
- ✅ Editar cualquier cliente (asignado o no)
- ✅ Eliminar clientes (solo si no tienen créditos activos)
- ✅ Ver todos los clientes del sistema
Gestión de Créditos:

- ✅ Crear créditos para cualquier cliente
- ✅ Editar créditos (monto, plazo, cuotas)
- ✅ Aprobar/Rechazar solicitudes de revalorización
- ✅ Aprobar/Rechazar solicitudes de renovación
- ✅ Ver todos los créditos del sistema
- ✅ Cancelar créditos (requiere justificación)
Gestión de Pagos:

- ✅ Registrar pagos manualmente (efectivo o transferencia)
- ✅ Ver todos los pagos del sistema
- ✅ Editar pagos (en caso de error, con auditoría)
Gestión de Caja Global:

- ✅ Ver saldo de Caja Global en tiempo real
- ✅ Ver historial completo de movimientos
- ✅ Asignar dinero a Caja Menor de prestamistas
- ✅ Confirmar recepción de retornos
- ✅ Reversar asignaciones/retornos pendientes
Gestión de Rutas:

- ✅ Crear rutas
- ✅ Editar rutas (nombre, descripción, estado)
- ✅ Asignar cobradores a rutas
- ✅ Asignar clientes/créditos a rutas con cobrador específico
- ✅ Reasignar clientes entre cobradores
- ✅ Desactivar rutas
Resolución de Conflictos:

- ✅ Ver dashboard de conflictos de sincronización
- ✅ Resolver conflictos de pagos duplicados
- ✅ Ver logs de sincronización por cobrador
Reportes:

- ✅ Dashboard general (créditos activos, saldo caja, mora)
- ✅ Reporte de cobradores (sincronización, pagos, saldo)
- ✅ Reporte de clientes en mora
- ✅ Reporte de flujo de caja (asignaciones, retornos)
Gestión de Festivos:

- ✅ Ver festivos precargados
- ✅ Ejecutar script de generación manual (si es necesario)
Acceso:

- ✅ Panel web (navegador)
- ❌ No tiene app móvil
Restricciones:

- Ninguna (máximos privilegios)

### 3.2 Prestamista/Cobrador

Descripción: Usuario de campo que gestiona cartera de clientes asignados, registra pagos, desembolsa créditos y administra su Caja Menor.

Permisos:

Gestión de Clientes:

- ✅ Crear clientes nuevos
- ✅ Editar clientes asignados (teléfono, dirección, notas)
- ❌ NO puede editar nombre completo ni cédula
- ❌ NO puede eliminar clientes
- ✅ Ver solo clientes asignados en sus rutas
Gestión de Créditos:

- ✅ Crear créditos para clientes asignados (queda PENDIENTE_APROBACION)
- ✅ Confirmar desembolso de créditos aprobados
- ❌ NO puede editar monto, plazo ni cuotas
- ❌ NO puede cancelar créditos
- ✅ Solicitar revalorización (queda PENDIENTE_APROBACION)
- ✅ Solicitar renovación (queda PENDIENTE_APROBACION)
Gestión de Pagos:

- ✅ Registrar pagos de clientes asignados (efectivo o transferencia)
- ❌ NO puede editar pagos registrados
- ❌ NO puede eliminar pagos
Gestión de Caja Menor:

- ✅ Ver saldo actual de su Caja Menor
- ✅ Ver historial de movimientos de su Caja Menor
- ✅ Confirmar recepción de asignaciones de Caja Global
- ✅ Solicitar retorno de dinero a Caja Global (monto libre)
- ❌ NO puede ver Caja Menor de otros prestamistas
- ❌ NO puede asignar dinero a otros prestamistas
Gestión de Rutas:

- ✅ Ver rutas a las que está asignado
- ✅ Ver clientes asignados individualmente en cada ruta
- ❌ NO puede ver clientes de otros cobradores
- ❌ NO puede crear, editar ni eliminar rutas
Sincronización:

- ✅ Sincronizar manualmente en cualquier momento
- ✅ Ver estado de sincronización (pendientes, última sync)
- ✅ Ver errores de sincronización
Acceso:

- ✅ App móvil Android
- ❌ No tiene acceso al panel web
Restricciones:

- Solo puede operar sobre clientes que tiene asignados individualmente
- No puede ver datos de otros cobradores
- No puede aprobar sus propias solicitudes (revalorización, renovación)
- Máximo 6 horas recomendadas sin sincronizar

---

## 4. ARQUITECTURA DEL SISTEMA

### 4.1 Stack Tecnológico

#### 4.1.1 Backend (Servidor)

Lenguaje y Runtime:

- Node.js v20.x LTS
- TypeScript 5.x
Framework:

- Express.js 4.x
- Validación: Zod o Joi
Base de Datos:

- PostgreSQL 15.x
- ORM: Prisma 5.x
- Migraciones: Prisma Migrate
Autenticación:

- JWT (jsonwebtoken)
- Bcrypt para hashing de contraseñas
Librerías Adicionales:

- date-fns (manejo de fechas y festivos)
- winston (logging estructurado)
- pm2 (process manager para producción)
Entorno:

- Servidor: Portátil Windows (Fase 1)
- Red: LAN local + VPN para acceso remoto

#### 4.1.2 Frontend Web (Panel Admin)

Framework:

- React 18.x
- TypeScript 5.x
Gestión de Estado:

- React Query (TanStack Query) para estado servidor
- Zustand o Context API para estado cliente
UI/Styling:

- Tailwind CSS 3.x
- Componentes: shadcn/ui o Headless UI
Routing:

- React Router v6
Validación de Formularios:

- React Hook Form + Zod
Comunicación:

- Axios o Fetch API
- WebSocket (opcional para notificaciones en tiempo real)

#### 4.1.3 App Móvil (Prestamista)

Framework:

- Flutter 3.19+
- Dart 3.3+
Base de Datos Local:

- SQLite vía Drift (type-safe SQL ORM)
- Versión SQLite: 3.x
Gestión de Estado:

- Riverpod 2.x
Navegación:

- go_router
Almacenamiento Seguro:

- flutter_secure_storage (para tokens JWT)
Comunicación HTTP:

- dio (con interceptors para autenticación)
Generación de UUIDs:

- uuid package
Compatibilidad:

- Android 8.0 (API 26) o superior
- Arquitectura: ARM y x86 (para emuladores)

### 4.2 Arquitectura de Datos

#### 4.2.1 Base de Datos Servidor (PostgreSQL)

Características:

- Modelo relacional normalizado (3NF)
- Foreign keys con constraints estrictos
- Índices en campos de búsqueda frecuente
- Soft deletes con campo deleted_at para registros críticos
- Triggers para auditoría de cambios (opcional)
Extensiones:

- uuid-ossp (generación de UUIDs)
- pgcrypto (si se requiere encriptación adicional)

#### 4.2.2 Base de Datos Local (SQLite en App)

Características:

- Réplica parcial de esquema servidor (solo datos del prestamista)
- Almacena registros pendientes de sincronizar
- No usa foreign keys estrictas (para permitir creación offline)
- Campo sync_status en cada tabla: SYNCED | PENDING | CONFLICT
Tablas Locales:

- clientes
- creditos
- pagos
- rutas (solo las asignadas al prestamista)
- rutas_clientes (solo clientes asignados)
- caja_menor (solo del prestamista)
- festivos_colombia (sincronizada desde servidor)
- sync_queue (cola de operaciones pendientes)

### 4.3 Arquitectura de Sincronización

#### 4.3.1 Modelo Offline-First

Principio: La app móvil es la fuente de verdad local. Todas las operaciones se registran primero en SQLite, independientemente de conectividad.

Ventajas:

- Operación continua sin internet
- Mejor experiencia de usuario (sin esperas de red)
- Resiliente a conexiones intermitentes
Estrategia:

1. Usuario realiza acción en app (crear cliente, registrar pago)
1. App valida datos localmente
1. App guarda en SQLite con sync_status = PENDING
1. App añade operación a sync_queue
1. En próxima sincronización:
  - Push: Envía registros PENDING al servidor
  - Pull: Descarga cambios del servidor
  - Actualiza sync_status = SYNCED

#### 4.3.2 Sincronización Bidireccional

Push (App → Servidor):

- App envía cambios locales no sincronizados
- Procesamiento por lotes de 500 registros
- Orden garantizado: Clientes → Créditos → Pagos
- Reintentos automáticos en caso de fallo
Pull (Servidor → App):

- App solicita cambios desde último sync_timestamp
- Servidor retorna registros nuevos/modificados
- App actualiza SQLite local
- Manejo de conflictos según estrategia definida
Timestamp de Sincronización:

- App guarda last_sync_at por entidad
- Servidor incluye updated_at en todos los registros
- Pull solo descarga registros con updated_at > last_sync_at

### 4.4 Diagrama de Arquitectura de Alto Nivel

```text
┌─────────────────────────────────────────────────────────────┐
│                      INTERNET / VPN                         │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS
                              │
┌─────────────────────────────┼─────────────────────────────┐
│                             │                             │
│  ┌──────────────┐    ┌──────▼──────┐    ┌─────────────┐ │
│  │  Panel Web   │◄───┤   Backend   │───►│ PostgreSQL  │ │
│  │   (React)    │    │  (Node.js)  │    │    15.x     │ │
│  └──────────────┘    └──────┬──────┘    └─────────────┘ │
│    Admin Browser            │                            │
│                             │ JWT Auth                   │
│                             │ REST API                   │
│                             │                            │
│  ┌──────────────┐    ┌──────▼──────┐                    │
│  │  App Móvil   │◄───┤   Sync      │                    │
│  │  (Flutter)   │    │  Endpoint   │                    │
│  └──────┬───────┘    └─────────────┘                    │
│         │                                                │
│         │                                                │
│  ┌──────▼───────┐                                        │
│  │   SQLite     │                                        │
│  │   (Local)    │                                        │
│  └──────────────┘                                        │
│   Prestamista                                            │
│   Smartphone                                             │
└──────────────────────────────────────────────────────────┘

```

---

## 5. MODELO CONCEPTUAL DE DATOS

### 5.1 Entidades Principales

#### 5.1.1 Usuarios

Descripción: Representa a los usuarios del sistema (Admin y Prestamistas).

Atributos Conceptuales:

- Identificador único (UUID)
- Nombre completo
- Cédula (único)
- Contraseña (hasheada)
- Rol (ADMIN | PRESTAMISTA)
- Estado (ACTIVO | BLOQUEADO)
- Fecha de creación
- Fecha de última actualización
Relaciones:

- 1 Usuario (Prestamista) → N Sesiones Activas
- 1 Usuario (Prestamista) → 1 Caja Menor
- 1 Usuario (Admin) → N Asignaciones de Caja
- 1 Usuario (Admin) → N Conflictos Resueltos

#### 5.1.2 Clientes

Descripción: Personas físicas que solicitan y reciben préstamos.

Atributos Conceptuales:

- Identificador único (UUID)
- Nombre completo (MAYÚSCULAS, mínimo 2 palabras)
- Teléfono (diferenciador en caso de nombres duplicados)
- Cédula (opcional pero recomendado)
- Dirección
- Notas
- Estado (ACTIVO | INACTIVO)
- Fecha de creación
- Usuario creador
- Fecha de última actualización
Relaciones:

- 1 Cliente → N Créditos (máximo 2 ACTIVOS simultáneamente)
- N Clientes ↔ N Rutas (mediante tabla intermedia con crédito específico)

#### 5.1.3 Créditos

Descripción: Préstamos otorgados a clientes con monto, plazo, cuotas e interés.

Atributos Conceptuales:

- Identificador único (UUID)
- Cliente (FK)
- Monto prestado (sin interés)
- Tasa de interés (20% fijo)
- Monto total (monto prestado + interés)
- Número de cuotas
- Monto por cuota (calculado: monto total / número cuotas)
- Fecha de desembolso
- Estado (ACTIVO | MORA | PAGADO | REVALORIZADO | PENDIENTE_APROBACION)
- Cobrador responsable (FK)
- Crédito origen (FK, para revalorizaciones y renovaciones)
- Tipo (NUEVO | REVALORIZADO | RENOVADO)
- Fecha de creación
- Fecha de última actualización
Relaciones:

- N Créditos → 1 Cliente
- 1 Crédito → N Pagos
- 1 Crédito → 1 Prestamista Responsable
- 1 Crédito (revalorizado) → 1 Crédito Origen
- N Créditos ↔ N Rutas (mediante tabla intermedia)

#### 5.1.4 Pagos

Descripción: Registros de cuotas pagadas por clientes.

Atributos Conceptuales:

- Identificador único (UUID)
- Crédito (FK)
- Número de cuota
- Monto pagado
- Fecha de pago (siempre fecha actual al registrar)
- Método de pago (EFECTIVO | TRANSFERENCIA)
- Cobrador que registró (FK)
- Días de mora (calculado al momento del pago)
- Estado (CONFIRMADO | CONFLICTO_DUPLICADO)
- Fecha de creación
Relaciones:

- N Pagos → 1 Crédito
- N Pagos → 1 Prestamista que registró

#### 5.1.5 Rutas

Descripción: Agrupaciones de clientes para organización de cobro en campo.

Atributos Conceptuales:

- Identificador único (UUID)
- Nombre
- Descripción
- Estado (ACTIVA | INACTIVA)
- Fecha de creación
- Fecha de última actualización
Relaciones:

- N Rutas ↔ N Cobradores (un cobrador puede estar en múltiples rutas)
- N Rutas ↔ N Clientes + Crédito específico + Cobrador asignado individual

#### 5.1.6 Rutas_Cobradores

Descripción: Tabla intermedia que relaciona rutas con cobradores.

Atributos Conceptuales:

- Identificador único (UUID)
- Ruta (FK)
- Cobrador (FK)
- Fecha de asignación
- Estado (ACTIVO | INACTIVO)
Constraint:

- UNIQUE(ruta_id, cobrador_id)

#### 5.1.7 Rutas_Clientes

Descripción: Tabla intermedia que relaciona rutas con clientes, créditos específicos y cobrador asignado individual.

Atributos Conceptuales:

- Identificador único (UUID)
- Ruta (FK)
- Cliente (FK)
- Crédito (FK)
- Cobrador asignado (FK) — Campo crítico para asignación individual
- Orden de visita (opcional, para optimizar recorrido)
- Fecha de agregado
- Estado (ACTIVO | INACTIVO)
Constraints:

- UNIQUE(ruta_id, cliente_id, credito_id)
- El cobrador asignado DEBE estar en la ruta (validación en backend)
Regla de Negocio Clave:

- Un mismo crédito NO puede estar en más de una ruta
- Créditos diferentes del mismo cliente SÍ pueden estar en rutas diferentes

#### 5.1.8 Caja_Global

Descripción: Caja única centralizada administrada por el admin.

Atributos Conceptuales:

- Identificador único (UUID, siempre el mismo registro)
- Saldo actual
- Fecha de última actualización
Nota: En la práctica, puede implementarse como un solo registro en la tabla o como suma calculada de caja_global_movimientos. Decisión de implementación del equipo.

#### 5.1.9 Caja_Global_Movimientos

Descripción: Auditoría completa de todos los movimientos de Caja Global.

Atributos Conceptuales:

- Identificador único (UUID)
- Tipo de movimiento (ASIGNACION | RETORNO | DESEMBOLSO_DIRECTO | PAGO_TRANSFERENCIA | AJUSTE)
- Monto
- Saldo anterior
- Saldo nuevo
- Usuario relacionado (FK) — Admin o Prestamista según tipo
- Referencia (FK genérico) — ID de asignación, retorno, pago, etc.
- Descripción
- Fecha de creación

#### 5.1.10 Caja_Menor_Cobradores

Descripción: Caja operativa individual de cada prestamista.

Atributos Conceptuales:

- Identificador único (UUID)
- Cobrador (FK, UNIQUE)
- Saldo actual
- Fecha de última actualización

#### 5.1.11 Asignaciones_Caja

Descripción: Registro de asignaciones de efectivo de Caja Global a Caja Menor de prestamistas.

Atributos Conceptuales:

- Identificador único (UUID)
- Admin que autoriza (FK)
- Prestamista receptor (FK)
- Monto
- Estado (PENDIENTE | CONFIRMADA | CANCELADA)
- Fecha de autorización
- Fecha de confirmación
- Saldo Caja Global antes
- Saldo Caja Global después
- Saldo Caja Menor antes
- Saldo Caja Menor después
Flujo de Estados:

1. Admin autoriza → Estado PENDIENTE → Caja Global se descuenta
1. Prestamista confirma recepción → Estado CONFIRMADA → Caja Menor se incrementa
1. Si no se confirma → Admin puede cancelar → Estado CANCELADA → Caja Global se restaura

#### 5.1.12 Retornos_Caja

Descripción: Registro de retornos de efectivo de Caja Menor a Caja Global.

Atributos Conceptuales:

- Identificador único (UUID)
- Prestamista que retorna (FK)
- Admin que recibe (FK)
- Monto
- Estado (PENDIENTE | CONFIRMADO | CANCELADO)
- Fecha de solicitud
- Fecha de confirmación
- Saldo Caja Menor antes
- Saldo Caja Menor después
- Saldo Caja Global antes
- Saldo Caja Global después
Flujo de Estados:

1. Prestamista solicita retorno → Estado PENDIENTE → Caja Menor se descuenta
1. Admin confirma recepción → Estado CONFIRMADO → Caja Global se incrementa
1. Si admin rechaza → Estado CANCELADO → Caja Menor se restaura

#### 5.1.13 Festivos_Colombia

Descripción: Festivos nacionales colombianos precargados para cálculo de mora.

Atributos Conceptuales:

- Identificador único (UUID)
- Fecha (DATE, UNIQUE)
- Nombre (ej: "Año Nuevo", "Día de la Independencia")
- Tipo (FIJO | TRASLADADO | SEMANA_SANTA)
- Año
- Es nacional (BOOLEAN, siempre true en Fase 1)
Rango de Cobertura:

- Precargados: 2024-2030
- Actualización: Automática cada 1 de enero vía cron job

#### 5.1.14 Sesiones_Activas

Descripción: Registro de sesiones JWT activas para control de acceso y bloqueo remoto.

Atributos Conceptuales:

- Identificador único (UUID)
- Usuario (FK)
- Token hash (hasheado, UNIQUE)
- Device ID (identificador del dispositivo)
- Device info (modelo, OS, versión)
- IP address
- Fecha de creación
- Última actividad
- Bloqueada (BOOLEAN)
Nota: Al bloquear usuario, se marcan todas sus sesiones como bloqueadas.

#### 5.1.15 Historial_Revalorizaciones

Descripción: Auditoría de todas las revalorizaciones realizadas.

Atributos Conceptuales:

- Identificador único (UUID)
- Crédito nuevo (FK)
- Crédito origen (FK)
- Fecha de revalorización
- Monto prestado anterior
- Monto prestado nuevo
- Saldo pendiente anterior
- Cuotas pagadas anterior
- Número de cuotas anterior
- Número de cuotas nuevo
- Dinero entregado real al cliente
- Cobrador responsable (FK)
- Admin aprobador (FK)

#### 5.1.16 Sync_Log

Descripción: Registro de operaciones de sincronización para auditoría y detección de conflictos.

Atributos Conceptuales:

- Identificador único (UUID)
- Cobrador (FK)
- Tipo de registro (CLIENTE | CREDITO | PAGO | OTRO)
- Registro ID (UUID del registro sincronizado)
- Acción (CREATE | UPDATE | DELETE)
- Data enviada (JSONB)
- Data en servidor (JSONB, para comparar conflictos)
- Conflicto detectado (BOOLEAN)
- Tipo de conflicto (PAGO_DUPLICADO | ACTUALIZACION_CONCURRENTE | OTRO)
- Resolución (FIRST_WRITE_WINS | LAST_WRITE_WINS | MANUAL)
- Admin que resolvió (FK, si fue manual)
- Fecha de sincronización
- Estado (SUCCESS | PENDING_RETRY | CONFLICT | ERROR)

### 5.2 Diagrama Entidad-Relación Simplificado

```text
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Usuarios   │───┐   │   Clientes   │───┐   │   Créditos   │
│              │   │   │              │   │   │              │
│ • id         │   │   │ • id         │   │   │ • id         │
│ • nombre     │   │   │ • nombre     │   │   │ • cliente_id │◄──┘
│ • rol        │   │   │ • telefono   │   │   │ • monto      │
│ • estado     │   │   │ • cedula     │   │   │ • cuotas     │
└──────┬───────┘   │   └──────┬───────┘   │   │ • estado     │
       │           │          │           │   └──────┬───────┘
       │           │          │           │          │
       │           │          │           │          │
       │           │          └───────────┼──────────┘
       │           │                      │
       │           │                      │
       │           │          ┌───────────▼───────┐
       │           │          │      Pagos        │
       │           │          │                   │
       │           │          │ • id              │
       │           │          │ • credito_id      │
       │           │          │ • monto           │
       │           │          │ • metodo_pago     │
       │           │          └───────────────────┘
       │           │
       │           │          ┌───────────────────┐
       │           └─────────►│ Caja_Menor        │
       │                      │                   │
       │                      │ • cobrador_id     │
       │                      │ • saldo_actual    │
       │                      └───────────────────┘
       │
       │                      ┌───────────────────┐
       └─────────────────────►│ Sesiones_Activas  │
                              │                   │
                              │ • usuario_id      │
                              │ • token_hash      │
                              │ • bloqueada       │
                              └───────────────────┘

┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    Rutas     │◄──────┤ Rutas_Cobradores ├──────►│   Usuarios   │
│              │       │                  │       │ (Prestamista)│
│ • id         │       │ • ruta_id        │       └──────────────┘
│ • nombre     │       │ • cobrador_id    │
│ • estado     │       └──────────────────┘
└──────┬───────┘
       │
       │               ┌──────────────────┐
       └──────────────►│ Rutas_Clientes   │
                       │                  │
                       │ • ruta_id        │
                       │ • cliente_id     │
                       │ • credito_id     │
                       │ • cobrador_asig  │◄── Campo clave
                       └──────────────────┘

```

---

## 6. SISTEMA DE RUTAS

### 6.1 Objetivo del Módulo

Organizar clientes en rutas de cobro para optimizar recorridos de prestamistas en campo, permitiendo asignación de múltiples cobradores a una ruta con asignación individual de clientes a cada cobrador.

### 6.2 Reglas de Negocio Completas

RR-001: Cliente en Múltiples Rutas

- Permitido: Un cliente puede estar en múltiples rutas simultáneamente
- Condición obligatoria: Cada presencia debe ser con un crédito DIFERENTE
- Prohibido: Un mismo crédito en más de una ruta
- Validación: Backend valida unicidad de (cliente_id + credito_id) al agregar a ruta
Ejemplo válido:

Cliente: MARIA GOMEZ (ID: uuid-123)

- Ruta Centro: Crédito #001 ($500,000) → Asignada a Cobrador A

- Ruta Norte: Crédito #002 ($1,000,000) → Asignada a Cobrador B

Ejemplo inválido (rechazado):

Cliente: JUAN PEREZ (ID: uuid-456)

- Ruta Sur: Crédito #003 ($800,000)

- Ruta Este: Crédito #003 ($800,000) ❌ MISMO CRÉDITO EN DOS RUTAS

RR-002: Cobrador en Múltiples Rutas

- Permitido: Un cobrador puede estar asignado a múltiples rutas simultáneamente
- Sin restricción de cantidad
Ejemplo:

Cobrador: CARLOS LOPEZ

- Asignado a Ruta Centro

- Asignado a Ruta Norte

- Asignado a Ruta Occidente

Total: 3 rutas activas

RR-003: Asignación Individual de Clientes a Cobradores

- Regla crítica: En rutas con múltiples cobradores, cada cliente/crédito es asignado a UN cobrador específico
- Implementación: Campo cobrador_asignado_id en tabla rutas_clientes
- Visibilidad: Cada cobrador SOLO ve los clientes que tiene asignados individualmente
- Prohibido: No existe visibilidad compartida automática
Ejemplo:

Ruta Centro tiene 2 cobradores: CARLOS y ANDREA

Clientes en Ruta Centro:

- JUAN PEREZ (Crédito #001) → Asignado a CARLOS

- MARIA LOPEZ (Crédito #002) → Asignado a ANDREA

- PEDRO GARCIA (Crédito #003) → Asignado a CARLOS

En la app:

- CARLOS ve: JUAN PEREZ, PEDRO GARCIA

- ANDREA ve: MARIA LOPEZ

Validación:

- Al asignar cliente a ruta, se DEBE especificar cobrador responsable
- El cobrador asignado DEBE estar en la ruta (validación en backend)

RR-004: Reasignación de Clientes

- Admin puede reasignar un cliente de un cobrador a otro dentro de la misma ruta
- Admin puede mover un cliente de una ruta a otra
- Al reasignar:
  - Cobrador nuevo recibe notificación (próxima sincronización)
  - Pagos registrados offline por cobrador anterior se aceptan normalmente
  - Se registra en sync_log con tipo REASIGNACION

RR-005: Eliminación de Rutas

- Admin puede desactivar una ruta (campo estado = INACTIVA)
- Al desactivar ruta:
  - Clientes NO se eliminan
  - Admin debe reasignarlos a otras rutas manualmente
  - Cobradores pierden visibilidad en próxima sincronización

### 6.3 Flujos Operativos Detallados

#### 6.3.1 Flujo: Creación de Ruta

Actor: Admin

Precondición: Admin autenticado en panel web

Pasos:

1. Admin navega a "Rutas" → "Crear Nueva Ruta"
1. Completa formulario:
  - Nombre (obligatorio, ej: "Ruta Centro")
  - Descripción (opcional, ej: "Barrios del centro de la ciudad")
1. Hace clic en "Guardar"
1. Sistema valida:
  - Nombre no vacío
  - Nombre único (sin duplicados)
1. Sistema crea registro en tabla rutas:
  - id: UUID generado
  - nombre: Valor ingresado
  - descripcion: Valor ingresado
  - estado: ACTIVA (por defecto)
  - created_at: Timestamp actual
1. Sistema muestra mensaje: "Ruta creada exitosamente"
1. Admin es redirigido a vista de detalle de la ruta
Postcondición: Ruta creada y disponible para asignar cobradores y clientes

#### 6.3.2 Flujo: Asignación de Cobrador a Ruta

Actor: Admin

Precondición: Ruta creada, Prestamista existente

Pasos:

1. Admin abre detalle de ruta
1. En sección "Cobradores Asignados", hace clic en "Agregar Cobrador"
1. Sistema muestra modal con lista de prestamistas
1. Admin selecciona prestamista de la lista
1. Sistema valida:
  - Prestamista no está ya asignado a esta ruta (evitar duplicados)
1. Sistema crea registro en rutas_cobradores:
  - id: UUID generado
  - ruta_id: ID de la ruta
  - cobrador_id: ID del prestamista seleccionado
  - fecha_asignacion: Timestamp actual
  - activo: true
1. Sistema muestra mensaje: "Cobrador asignado exitosamente"
1. Cobrador aparece en lista de "Cobradores Asignados"
Postcondición: Cobrador asignado a ruta, puede recibir clientes

#### 6.3.3 Flujo: Asignación de Cliente/Crédito a Ruta con Cobrador Específico

Actor: Admin

Precondición: Ruta con al menos 1 cobrador asignado, Cliente con crédito activo

Pasos:

1. Admin navega a detalle de ruta
1. En sección "Clientes", hace clic en "Agregar Cliente"
1. Sistema muestra formulario:
  - Campo: Buscar cliente (autocomplete por nombre o cédula)
  - Campo: Seleccionar crédito activo del cliente (dropdown)
  - Campo: Asignar a cobrador (dropdown con cobradores de la ruta)
  - Campo: Orden de visita (número opcional)
1. Admin completa formulario:
  - Busca y selecciona "JUAN PEREZ"
  - Selecciona crédito activo #001 ($500,000)
  - Asigna a "CARLOS LOPEZ"
  - Orden visita: 5 (opcional)
1. Sistema valida:
  - Cliente tiene el crédito seleccionado
  - Crédito está en estado ACTIVO o MORA
  - Crédito NO está ya en otra ruta (constraint: un crédito en una sola ruta)
  - Cobrador seleccionado está asignado a la ruta
1. Sistema crea registro en rutas_clientes:
  - id: UUID generado
  - ruta_id: ID de la ruta
  - cliente_id: ID de JUAN PEREZ
  - credito_id: ID del crédito #001
  - cobrador_asignado_id: ID de CARLOS LOPEZ
  - orden_visita: 5
  - fecha_agregado: Timestamp actual
  - activo: true
1. Sistema muestra mensaje: "Cliente asignado exitosamente"
1. Cliente aparece en lista de clientes de la ruta
Postcondición: Cliente visible en app de CARLOS LOPEZ en próxima sincronización

#### 6.3.4 Flujo: Visualización de Rutas en App Móvil

Actor: Prestamista

Precondición: Prestamista autenticado, asignado a al menos 1 ruta

Pasos:

1. Prestamista abre app → Navega a "Mis Rutas"
1. Sistema consulta SQLite local:
  - Tabla rutas donde prestamista está en rutas_cobradores
1. Sistema muestra lista de rutas:
  - Nombre de ruta
  - Cantidad de clientes asignados al prestamista
1. Prestamista selecciona "Ruta Centro"
1. Sistema consulta:
  - Tabla rutas_clientes donde ruta_id = ruta_centro AND cobrador_asignado_id = prestamista_actual
1. Sistema muestra lista de clientes SOLO asignados a este prestamista:
  - Nombre cliente
  - Monto del crédito
  - Próxima fecha de pago
  - Días de mora (si aplica)
1. Prestamista puede:
  - Filtrar por: En mora, Al día, Próximo a vencer
  - Ordenar por: Orden de visita, Nombre, Mora
  - Hacer clic en cliente → Ver detalle de crédito
Postcondición: Prestamista visualiza solo sus clientes asignados

#### 6.3.5 Flujo: Reasignación de Cliente entre Cobradores

Actor: Admin

Precondición: Cliente asignado a Cobrador A, Cobrador B también está en la ruta

Pasos:

1. Admin navega a detalle de ruta
1. En lista de clientes, selecciona "JUAN PEREZ"
1. Hace clic en "Reasignar Cobrador"
1. Sistema muestra modal:
  - Cliente actual: JUAN PEREZ
  - Cobrador actual: CARLOS LOPEZ
  - Nuevo cobrador: (dropdown con otros cobradores de la ruta)
1. Admin selecciona "ANDREA GOMEZ"
1. Sistema valida:
  - ANDREA GOMEZ está asignada a esta ruta
1. Sistema actualiza registro en rutas_clientes:
  - cobrador_asignado_id: Cambia de CARLOS a ANDREA
  - updated_at: Timestamp actual
1. Sistema crea registro en sync_log:
  - tipo: REASIGNACION
  - cobrador_anterior: CARLOS
  - cobrador_nuevo: ANDREA
1. Sistema muestra mensaje: "Cliente reasignado exitosamente"
Postcondición:

- CARLOS pierde visibilidad de JUAN PEREZ en próxima sincronización
- ANDREA gana visibilidad de JUAN PEREZ en próxima sincronización
- Pagos offline de CARLOS para JUAN se aceptan (se registran con su ID de cobrador)

### 6.4 Criterios de Aceptación

|  |
|---|
| CA-RUT-001: Admin puede crear ruta con nombre único |
| CA-RUT-002: Admin puede asignar múltiples cobradores a una ruta |
| CA-RUT-003: Admin puede asignar cliente/crédito a ruta especificando cobrador responsable |
| CA-RUT-004: Sistema rechaza asignar el mismo crédito a más de una ruta |
| CA-RUT-005: Prestamista en app solo ve clientes asignados individualmente a él |
| CA-RUT-006: Prestamista NO ve clientes de otros cobradores en la misma ruta |
| CA-RUT-007: Admin puede reasignar cliente de un cobrador a otro |
| CA-RUT-008: Pagos registrados offline por cobrador previo se aceptan tras reasignación |
| CA-RUT-009: Desactivar ruta oculta clientes en app de cobradores en próxima sync |
| CA-RUT-010: Cliente puede estar en Ruta A con Crédito #1 y Ruta B con Crédito #2 simultáneamente |

---

## 7. SISTEMA DE CAJA

### 7.1 Objetivo del Módulo

Controlar flujo de efectivo mediante sistema de Caja Global centralizada y Cajas Menores operativas por prestamista, garantizando trazabilidad completa de asignaciones, retornos, desembolsos y pagos.

### 7.2 Conceptos Fundamentales

#### 7.2.1 Caja Global

Naturaleza: Caja ÚNICA y CENTRALIZADA para todo el sistema

Ubicación física: Oficina del admin (efectivo en custodia del negocio)

Propósito:

- Origen de todas las asignaciones a prestamistas
- Destino de todos los retornos de prestamistas
- Recepción directa de pagos por transferencia
Administración: Solo el admin puede:

- Ver saldo en tiempo real
- Ver historial completo de movimientos
- Asignar dinero a prestamistas
- Confirmar recepción de retornos
- Reversar operaciones pendientes
Acceso de prestamistas:

- Prestamistas NO pueden retirar dinero directamente
- Prestamistas solo envían/retornan dinero vía flujos controlados

#### 7.2.2 Caja Menor (por Prestamista)

Naturaleza: Caja OPERATIVA individual de cada prestamista

Ubicación física: Efectivo en custodia del prestamista (billetera, bolso)

Propósito:

- Realizar desembolsos de créditos
- Recibir pagos en efectivo de clientes
Características:

- Cada prestamista tiene UNA sola Caja Menor
- Prestamista decide libremente cuánto retornar (sin mínimo obligatorio)
- NO hay límite de acumulación (riesgo aceptado)

#### 7.2.3 Relación entre Cajas

```text
┌────────────────────────────────────────────────────┐
│                  CAJA GLOBAL                       │
│         (Única, Centralizada, Admin)               │
│                                                    │
│  Movimientos:                                      │
│  + Retornos de prestamistas                        │
│  + Pagos por transferencia (directo)               │
│  - Asignaciones a prestamistas                     │
│  - Desembolsos directos (si admin desembolsa)      │
└────────────┬──────────────────┬────────────────────┘
             │                  │
    Asignación│         Retorno │
             ▼                  ▲
┌────────────────────┐ ┌────────────────────┐
│ CAJA MENOR         │ │ CAJA MENOR         │
│  Prestamista A     │ │  Prestamista B     │
│                    │ │                    │
│  + Asignaciones    │ │  + Asignaciones    │
│  + Pagos efectivo  │ │  + Pagos efectivo  │
│  - Desembolsos     │ │  - Desembolsos     │
│  - Retornos        │ │  - Retornos        │
└────────────────────┘ └────────────────────┘

```

### 7.3 Reglas de Negocio Completas

RC-001: Tipos de Movimientos de Caja Global

- ASIGNACION: Dinero sale de Caja Global → va a Caja Menor
- RETORNO: Dinero sale de Caja Menor → entra a Caja Global
- PAGO_TRANSFERENCIA: Dinero entra directo a Caja Global (no pasa por Caja Menor)
- AJUSTE: Corrección manual por admin (con justificación obligatoria)
RC-002: Tipos de Movimientos de Caja Menor

- ASIGNACION_RECIBIDA: Dinero entra desde Caja Global
- PAGO_EFECTIVO_RECIBIDO: Cliente paga en efectivo
- DESEMBOLSO_REALIZADO: Prestamista entrega dinero a cliente
- RETORNO_ENVIADO: Prestamista devuelve dinero a Caja Global
RC-003: Validación de Saldo

- Toda operación que descuente dinero DEBE validar saldo disponible
- Validación dentro de transacción de base de datos (evitar race conditions)
- Si saldo insuficiente → Operación rechazada con error claro
RC-004: Asignación de Caja Menor

- Admin asigna monto desde Caja Global
- Flujo con confirmación bidireccional:
  1. Admin autoriza → Caja Global se descuenta → Estado PENDIENTE
  1. Prestamista confirma recepción → Caja Menor se incrementa → Estado CONFIRMADA
- Sin confirmación → Admin puede cancelar → Caja Global se restaura
RC-005: Retorno de Caja

- Prestamista decide libremente cuánto retornar (sin mínimo)
- Flujo con confirmación bidireccional:
  1. Prestamista solicita retorno → Caja Menor se descuenta → Estado PENDIENTE
  1. Admin confirma recepción → Caja Global se incrementa → Estado CONFIRMADO
- Sin confirmación → Admin puede cancelar → Caja Menor se restaura
RC-006: Pagos en Efectivo

- Van directo a Caja Menor del prestamista
- Incrementan saldo de Caja Menor
- Prestamista decide cuándo retornar a Caja Global
RC-007: Pagos por Transferencia

- Van DIRECTO a Caja Global
- NO pasan por Caja Menor
- Saldo de Caja Menor NO cambia
- Campo metodo_pago = TRANSFERENCIA en tabla pagos
RC-008: Auditoría de Movimientos

- TODO movimiento se registra en caja_global_movimientos o auditoría de caja menor
- Registro incluye: saldo anterior, saldo nuevo, timestamp, usuario
- Logs inmutables (no se pueden editar, solo agregar correcciones)

### 7.4 Flujos Operativos Detallados

#### 7.4.1 Flujo: Asignación de Caja Menor (con Confirmación)

Actor: Admin (autoriza), Prestamista (confirma)

Precondición: Caja Global tiene saldo suficiente

Pasos:

FASE 1: Autorización (Admin)

1. Admin accede a panel web → "Gestión de Caja" → "Asignar Caja Menor"
1. Admin completa formulario:
  - Prestamista: (Selecciona de dropdown)
  - Monto: $1,000,000
1. Admin hace clic en "Autorizar Asignación"
1. Sistema valida:
  - Monto > 0
  - Saldo Caja Global ≥ $1,000,000
1. Sistema inicia transacción de BD:
  - Lee saldo actual Caja Global: $5,000,000
  - Calcula nuevo saldo: $5,000,000 - $1,000,000 = $4,000,000
  - Actualiza caja_global.saldo = $4,000,000
  - Crea registro en asignaciones_caja:
    - id: UUID generado
    - admin_id: ID del admin
    - cobrador_id: ID del prestamista seleccionado
    - monto: $1,000,000
    - estado: PENDIENTE
    - fecha_autorizacion: Timestamp actual
    - saldo_caja_global_antes: $5,000,000
    - saldo_caja_global_despues: $4,000,000
    - saldo_caja_menor_antes: (saldo actual del prestamista)
    - saldo_caja_menor_despues: NULL (aún no confirmado)
  - Crea registro en caja_global_movimientos:
    - tipo: ASIGNACION
    - monto: -$1,000,000 (negativo porque sale)
    - saldo_anterior: $5,000,000
    - saldo_nuevo: $4,000,000
    - usuario_id: ID del prestamista
    - referencia_id: ID de asignacion_caja
    - descripcion: "Asignación a [Nombre Prestamista] - PENDIENTE"
1. Sistema confirma transacción
1. Sistema muestra mensaje: "Asignación autorizada. Pendiente de confirmación por prestamista."
FASE 2: Confirmación (Prestamista) 8. Prestamista recibe notificación en app (próxima sincronización):

- "Tienes una asignación pendiente de $1,000,000"
1. Admin entrega efectivo físico a prestamista (fuera del sistema)
1. Prestamista navega en app a "Mi Caja" → "Asignaciones Pendientes"
1. Prestamista ve:
  - Monto: $1,000,000
  - Fecha autorización: [timestamp]
  - Estado: PENDIENTE
1. Prestamista hace clic en "Confirmar Recepción"
1. Sistema valida:
  - Prestamista es el receptor de la asignación
  - Estado actual es PENDIENTE
1. Sistema inicia transacción de BD:
  - Lee saldo actual Caja Menor: $200,000
  - Calcula nuevo saldo: $200,000 + $1,000,000 = $1,200,000
  - Actualiza caja_menor_cobradores.saldo = $1,200,000
  - Actualiza registro en asignaciones_caja:
    - estado: CONFIRMADA
    - fecha_confirmacion: Timestamp actual
    - saldo_caja_menor_despues: $1,200,000
  - Actualiza registro en caja_global_movimientos:
    - descripcion: "Asignación a [Nombre Prestamista] - CONFIRMADA"
1. Sistema confirma transacción
1. Sistema muestra mensaje: "Asignación confirmada. Tu saldo actual es $1,200,000"
1. Cambio se sincroniza con servidor en próxima sync
FASE 3: Cancelación (opcional, si no hay confirmación)

- Si prestamista NO confirma después de X días:
  - Admin puede navegar a "Asignaciones Pendientes"
  - Admin hace clic en "Cancelar Asignación"
  - Sistema restaura Caja Global (+$1,000,000)
  - Estado cambia a CANCELADA
Postcondición: Caja Global reducida, Caja Menor aumentada, trazabilidad completa

#### 7.4.2 Flujo: Retorno de Caja (con Confirmación)

Actor: Prestamista (solicita), Admin (confirma)

Precondición: Prestamista tiene saldo en Caja Menor

Pasos:

FASE 1: Solicitud de Retorno (Prestamista)

1. Prestamista abre app → "Mi Caja" → "Retornar Dinero"
1. Prestamista completa formulario:
  - Monto a retornar: $800,000 (decide libremente, sin mínimo)
1. Prestamista hace clic en "Solicitar Retorno"
1. Sistema valida:
  - Monto > 0
  - Saldo Caja Menor ≥ $800,000
1. Sistema guarda en SQLite local:
  - Operación en sync_queue con tipo RETORNO_CAJA
  - Decrementa saldo local Caja Menor: $1,200,000 - $800,000 = $400,000
  - Crea registro local con estado PENDIENTE
1. Sistema muestra mensaje: "Solicitud de retorno guardada. Se enviará en próxima sincronización."
FASE 2: Sincronización 7. En próxima sincronización:

- App envía operación de retorno al servidor
- Servidor recibe:
  - cobrador_id: ID del prestamista
  - monto: $800,000
1. Servidor valida:
  - Prestamista existe
  - Saldo Caja Menor servidor ≥ $800,000
1. Servidor inicia transacción de BD:
  - Lee saldo Caja Menor: $1,200,000
  - Calcula nuevo saldo: $1,200,000 - $800,000 = $400,000
  - Actualiza caja_menor_cobradores.saldo = $400,000
  - Crea registro en retornos_caja:
    - id: UUID generado
    - cobrador_id: ID del prestamista
    - admin_id: NULL (aún no confirmado)
    - monto: $800,000
    - estado: PENDIENTE
    - fecha_solicitud: Timestamp actual
    - saldo_caja_menor_antes: $1,200,000
    - saldo_caja_menor_despues: $400,000
    - saldo_caja_global_antes: (saldo actual)
    - saldo_caja_global_despues: NULL (aún no confirmado)
1. Servidor confirma transacción
1. Servidor responde OK a app
1. App actualiza estado local: SINCRONIZADO
FASE 3: Confirmación (Admin) 13. Prestamista entrega efectivo físico a admin (fuera del sistema) 14. Admin accede a panel web → "Gestión de Caja" → "Retornos Pendientes" 15. Admin ve: - Prestamista: [Nombre] - Monto: $800,000 - Fecha solicitud: [timestamp] - Estado: PENDIENTE 16. Admin hace clic en "Confirmar Recepción" 17. Sistema valida: - Admin autenticado - Retorno en estado PENDIENTE 18. Sistema inicia transacción de BD: - Lee saldo Caja Global: $4,000,000 - Calcula nuevo saldo: $4,000,000 + $800,000 = $4,800,000 - Actualiza caja_global.saldo = $4,800,000 - Actualiza registro en retornos_caja: - estado: CONFIRMADO - admin_id: ID del admin - fecha_confirmacion: Timestamp actual - saldo_caja_global_despues: $4,800,000 - Crea registro en caja_global_movimientos: - tipo: RETORNO - monto: +$800,000 - saldo_anterior: $4,000,000 - saldo_nuevo: $4,800,000 - usuario_id: ID del prestamista - referencia_id: ID de retorno_caja - descripcion: "Retorno de [Nombre Prestamista] - CONFIRMADO" 19. Sistema confirma transacción 20. Sistema muestra mensaje: "Retorno confirmado. Saldo Caja Global actualizado."

Postcondición: Caja Menor reducida, Caja Global aumentada, trazabilidad completa

#### 7.4.3 Flujo: Desembolso de Crédito (Híbrido con Confirmación)

Actor: Admin (autoriza), Prestamista (confirma recepción + entrega)

Precondición: Cliente aprobado, crédito creado

PASO 1: Admin Autoriza Desembolso

1. Admin crea crédito en panel web:
  - Cliente: JUAN PEREZ
  - Monto: $500,000
  - Plazo: 10 cuotas
  - Prestamista responsable: CARLOS LOPEZ
1. Admin hace clic en "Crear y Autorizar Desembolso"
1. Sistema valida:
  - Cliente cumple requisitos (máximo 2 créditos activos)
  - Monto > 0
  - Saldo Caja Global ≥ $500,000
1. Sistema inicia transacción de BD:
  - Crea registro en creditos:
    - id: UUID generado
    - cliente_id: ID de JUAN PEREZ
    - monto_prestado: $500,000
    - tasa_interes: 20%
    - monto_total: $600,000
    - numero_cuotas: 10
    - monto_cuota: $60,000
    - estado: PENDIENTE_DESEMBOLSO
    - cobrador_responsable_id: ID de CARLOS
  - Lee saldo Caja Global: $4,800,000
  - Descuenta: $4,800,000 - $500,000 = $4,300,000
  - Actualiza caja_global.saldo = $4,300,000
  - Crea registro en asignaciones_caja:
    - tipo: DESEMBOLSO_CREDITO
    - admin_id: ID del admin
    - cobrador_id: ID de CARLOS
    - monto: $500,000
    - estado: PENDIENTE
    - referencia_id: ID del crédito
    - saldo_caja_global_antes: $4,800,000
    - saldo_caja_global_despues: $4,300,000
  - Crea registro en caja_global_movimientos:
    - tipo: DESEMBOLSO_CREDITO
    - monto: -$500,000
    - saldo_anterior: $4,800,000
    - saldo_nuevo: $4,300,000
    - referencia_id: ID del crédito
1. Sistema confirma transacción
1. Sistema muestra mensaje: "Crédito creado. Pendiente de desembolso por prestamista."
PASO 2: Prestamista Confirma Recepción de Dinero 7. Prestamista sincroniza app → Ve notificación:

- "Crédito nuevo de $500,000 para JUAN PEREZ. Confirma recepción de dinero."
1. Admin entrega $500,000 en efectivo a CARLOS (fuera del sistema)
1. CARLOS navega a "Créditos Pendientes" → Selecciona crédito de JUAN PEREZ
1. CARLOS hace clic en "Confirmar Recepción de Dinero"
1. Sistema (app) valida:
  - Crédito en estado PENDIENTE_DESEMBOLSO
  - Prestamista es el responsable
1. Sistema (app) guarda en SQLite local:
  - Operación en sync_queue con tipo CONFIRMAR_RECEPCION_DESEMBOLSO
  - Incrementa saldo local Caja Menor: $400,000 + $500,000 = $900,000
  - Actualiza crédito local: estado = PENDIENTE_ENTREGA_CLIENTE
PASO 3: Sincronización de Confirmación 13. En próxima sync: - App envía confirmación al servidor - Servidor valida y procesa: - Lee saldo Caja Menor servidor: $400,000 - Incrementa: $400,000 + $500,000 = $900,000 - Actualiza caja_menor_cobradores.saldo = $900,000 - Actualiza registro en asignaciones_caja: - estado: CONFIRMADA - saldo_caja_menor_antes: $400,000 - saldo_caja_menor_despues: $900,000 - Actualiza crédito: estado = PENDIENTE_ENTREGA_CLIENTE

PASO 4: Prestamista Entrega Dinero a Cliente 14. CARLOS visita a JUAN PEREZ en campo 15. CARLOS entrega $500,000 en efectivo a JUAN 16. CARLOS en app → Abre crédito de JUAN → "Confirmar Entrega a Cliente" 17. Sistema (app) valida: - Crédito en estado PENDIENTE_ENTREGA_CLIENTE - Saldo Caja Menor ≥ $500,000 18. Sistema (app) guarda en SQLite local: - Operación en sync_queue con tipo CONFIRMAR_ENTREGA_CLIENTE - Decrementa saldo Caja Menor: $900,000 - $500,000 = $400,000 - Actualiza crédito: estado = ACTIVO, fecha_desembolso = HOY

PASO 5: Sincronización de Entrega 19. En próxima sync: - App envía confirmación de entrega - Servidor procesa: - Lee saldo Caja Menor: $900,000 - Decrementa: $900,000 - $500,000 = $400,000 - Actualiza caja_menor_cobradores.saldo = $400,000 - Actualiza crédito: estado = ACTIVO, fecha_desembolso = HOY - Crea registro en auditoría de caja menor

Postcondición: Crédito desembolsado, Caja Global reducida, Caja Menor vuelve a saldo inicial, trazabilidad completa

#### 7.4.4 Flujo: Registro de Pago en Efectivo

Actor: Prestamista

Precondición: Cliente tiene crédito activo, Prestamista en campo

Pasos:

1. Prestamista visita cliente MARIA GOMEZ
1. MARIA paga cuota #3 en efectivo: $60,000
1. Prestamista abre app → "Clientes" → Selecciona MARIA GOMEZ → "Registrar Pago"
1. Prestamista completa formulario:
  - Cuota: #3 (seleccionada automáticamente como siguiente)
  - Monto: $60,000
  - Método: EFECTIVO
  - Fecha: HOY (no editable)
1. Prestamista hace clic en "Registrar Pago"
1. Sistema (app) valida:
  - Cuota #3 no ha sido pagada
  - Monto > 0
  - Fecha es hoy
1. Sistema (app) guarda en SQLite local:
  - Crea registro en tabla pagos:
    - id: UUID generado
    - credito_id: ID del crédito de MARIA
    - numero_cuota: 3
    - monto: $60,000
    - fecha_pago: HOY
    - metodo_pago: EFECTIVO
    - cobrador_id: ID del prestamista
    - sync_status: PENDING
  - Incrementa saldo local Caja Menor: $400,000 + $60,000 = $460,000
  - Actualiza saldo del crédito: saldo_pendiente -= $60,000
  - Añade operación a sync_queue
1. Sistema muestra mensaje: "Pago registrado. Se sincronizará próximamente."
Sincronización: 9. En próxima sync:

- App envía pago al servidor
- Servidor valida y procesa:
  - Crea registro en tabla pagos (servidor)
  - Incrementa caja_menor_cobradores.saldo += $60,000
  - Actualiza crédito: saldo_pendiente -= $60,000
  - Marca pago como SYNCED
Postcondición: Pago registrado, Caja Menor aumentada, Crédito actualizado

#### 7.4.5 Flujo: Registro de Pago por Transferencia

Actor: Prestamista o Admin

Precondición: Cliente transfiere dinero a cuenta bancaria del negocio

Pasos:

1. Cliente PEDRO GARCIA transfiere $60,000 a cuenta del negocio
1. Cliente envía captura de transferencia a prestamista por WhatsApp
1. Prestamista abre app → "Clientes" → PEDRO GARCIA → "Registrar Pago"
1. Prestamista completa formulario:
  - Cuota: #5
  - Monto: $60,000
  - Método: TRANSFERENCIA
  - Fecha: HOY
1. Prestamista hace clic en "Registrar Pago"
1. Sistema (app) valida igual que efectivo
1. Sistema (app) guarda en SQLite local:
  - Crea registro en tabla pagos:
    - metodo_pago: TRANSFERENCIA
    - Otros campos igual que efectivo
  - NO incrementa Caja Menor (diferencia crítica)
  - Actualiza saldo del crédito
  - Añade a sync_queue
Sincronización: 8. En próxima sync:

- App envía pago al servidor
- Servidor detecta metodo_pago = TRANSFERENCIA
- Servidor procesa:
  - Crea registro en tabla pagos
  - Incrementa Caja Global directamente: caja_global.saldo += $60,000
  - NO modifica Caja Menor
  - Crea registro en caja_global_movimientos:
    - tipo: PAGO_TRANSFERENCIA
    - monto: +$60,000
  - Actualiza crédito
Postcondición: Pago registrado, Caja Global aumentada, Caja Menor sin cambios

### 7.5 Criterios de Aceptación

|  |
|---|
| CA-CAJ-001: Admin puede ver saldo de Caja Global en tiempo real |
| CA-CAJ-002: Admin puede asignar dinero a Caja Menor de prestamista |
| CA-CAJ-003: Asignación descuenta Caja Global inmediatamente (estado PENDIENTE) |
| CA-CAJ-004: Prestamista confirma recepción → Caja Menor se incrementa |
| CA-CAJ-005: Admin puede cancelar asignación pendiente → Caja Global se restaura |
| CA-CAJ-006: Prestamista puede solicitar retorno de cualquier monto (sin mínimo) |
| CA-CAJ-007: Retorno descuenta Caja Menor inmediatamente (estado PENDIENTE) |
| CA-CAJ-008: Admin confirma recepción → Caja Global se incrementa |
| CA-CAJ-009: Desembolso de crédito sigue flujo híbrido (Caja Global → Confirmación → Caja Menor → Cliente) |
| CA-CAJ-010: Pago en efectivo incrementa Caja Menor del prestamista |
| CA-CAJ-011: Pago por transferencia incrementa Caja Global (sin pasar por Caja Menor) |
| CA-CAJ-012: Todo movimiento se registra en auditoría con saldo antes/después |
| CA-CAJ-013: Validación de saldo evita sobregiros (Caja Global y Caja Menor) |

---

## 8. GESTIÓN DE CRÉDITOS

### 8.1 Objetivo del Módulo

Administrar ciclo de vida completo de créditos desde creación, desembolso, revalorización, renovación hasta cierre por pago completo, aplicando reglas de negocio estrictas.

### 8.2 Reglas de Negocio Completas

RCR-001: Límite de Créditos Activos por Cliente

- Regla: Máximo 2 créditos en estado ACTIVO o MORA por cliente EN TOTAL en todo el sistema
- Estados considerados activos: ACTIVO, MORA
- Estados NO considerados activos: PAGADO, REVALORIZADO, PENDIENTE_APROBACION
- Validación: Backend verifica count de créditos activos antes de crear nuevo crédito
Ejemplo:

Cliente: ANA MARTINEZ

- Crédito #001: ACTIVO ($500,000)

- Crédito #002: ACTIVO ($300,000)

- Intento de crear Crédito #003 → ❌ RECHAZADO (máximo 2 activos)

Pero si:

- Crédito #001: PAGADO

- Crédito #002: ACTIVO

- Intento de crear Crédito #003 → ✅ PERMITIDO

RCR-002: Estructura de Nombre de Cliente

- Campo único: nombre_completo
- Validación: Mínimo 2 palabras (espacio en blanco como separador)
- Formato: MAYÚSCULAS
- Ejemplos válidos: "JUAN PEREZ", "MARIA RODRIGUEZ GOMEZ", "CARLOS DE LA CRUZ"
- Ejemplos inválidos: "JUAN" (solo 1 palabra), "juan perez" (minúsculas)

RCR-003: Diferenciación de Clientes con Nombres Duplicados

- Permitido: Múltiples clientes con el mismo nombre
- Diferenciador: Número de teléfono
- UI: Sistema muestra "JUAN PEREZ (Tel: 3001234567)" vs "JUAN PEREZ (Tel: 3107654321)"
- Validación: Teléfono único por cliente (recomendado pero no obligatorio)

RCR-004: Cálculo de Interés

- Tasa fija: 20% sobre monto prestado
- Fórmula: interes = monto_prestado * 0.20
- Monto total: monto_total = monto_prestado + interes
- Ejemplo: Préstamo $1,000,000 → Interés $200,000 → Total $1,200,000

RCR-005: Cálculo de Cuotas

- Distribución: Cuotas iguales
- Fórmula: monto_cuota = monto_total / numero_cuotas
- Redondeo: A pesos enteros (sin decimales)
- Ajuste: Si hay diferencia por redondeo, se ajusta en última cuota
Ejemplo:

Monto total: $1,200,000

Número de cuotas: 10

Monto por cuota: $1,200,000 / 10 = $120,000

RCR-006: Validación de Fecha de Pago

- Permitido: Solo fecha actual (HOY)
- Prohibido: Pagos retroactivos (fechas pasadas)
- Prohibido: Pagos futuros
- Razón: Evitar manipulación de registros

RCR-007: Manejo de Sobrepagos

- Regla: Sobrepago REDUCE la cuota final
- NO se genera: Saldo a favor separado
- Lógica: Sistema recalcula saldo pendiente, cuota final se ajusta automáticamente
Ejemplo:

Crédito: $1,200,000 en 10 cuotas de $120,000

Cuotas pagadas: 1-8 ($960,000)

Saldo pendiente: $240,000 (cuotas 9 y 10)

Cliente paga cuota 9 con sobrepago:

- Monto pagado: $150,000

- Saldo pendiente después: $240,000 - $150,000 = $90,000

- Cuota 10 a cobrar: $90,000 (reducida de $120,000)

RCR-008: Requisitos para Revalorización

1. Cuotas pagadas: Mínimo 40% del total de cuotas
1. Tiempo transcurrido: Mínimo 30 días desde desembolso original
1. Estado del crédito: ACTIVO (no aplica para MORA o PAGADO)
Validación:

```text
def puede_revalorizar(credito):
    porcentaje_pagado = (cuotas_pagadas / numero_cuotas) * 100
    dias_desde_desembolso = (HOY - fecha_desembolso).days
    
    return (
        porcentaje_pagado >= 40 and
        dias_desde_desembolso >= 30 and
        credito.estado == ACTIVO
    )

```

RCR-009: Cálculo de Revalorización

- Base de interés: Nuevo monto total (NO solo dinero nuevo)
- Fórmula:
- interes_nuevo = nuevo_monto_total * 0.20monto_a_pagar = nuevo_monto_total + interes_nuevodinero_entregado = nuevo_monto_total - saldo_pendiente_credito_anterior
Ejemplo completo:

CRÉDITO ORIGINAL:

- Monto prestado: $1,000,000

- Interés 20%: $200,000

- Total: $1,200,000

- Cuotas: 10 × $120,000

- Cliente pagó: 6 cuotas ($720,000)

- Saldo pendiente: $480,000

REVALORIZACIÓN A $1,500,000:

- Nuevo monto prestado: $1,500,000

- Interés sobre $1,500,000: $1,500,000 × 20% = $300,000

- Nuevo total: $1,500,000 + $300,000 = $1,800,000

- Dinero REAL entregado al cliente: $1,500,000 - $480,000 = $1,020,000

- Nuevas cuotas: 10 × $180,000

- Estado crédito anterior: REVALORIZADO

- Estado crédito nuevo: ACTIVO

RCR-010: Requisito para Renovación

- Condición: Crédito anterior debe estar 100% pagado (todas las cuotas)
- Lógica: Se crea crédito completamente nuevo (independiente del anterior)
- Relación: Campo credito_origen_id apunta al crédito renovado

### 8.3 Estados de Créditos

PENDIENTE_APROBACION:

- Crédito solicitado por prestamista, pendiente de aprobación de admin
- No cuenta para límite de 2 créditos activos
PENDIENTE_DESEMBOLSO:

- Crédito aprobado por admin, pendiente de desembolso
- Dinero ya descontado de Caja Global
PENDIENTE_ENTREGA_CLIENTE:

- Prestamista confirmó recepción de dinero, pendiente de entrega a cliente
- Dinero en Caja Menor del prestamista
ACTIVO:

- Crédito desembolsado al cliente, con pagos en curso
- Cuenta para límite de 2 créditos activos
MORA:

- Al menos una cuota con fecha vencida sin pagar
- Cuenta para límite de 2 créditos activos
PAGADO:

- Todas las cuotas pagadas completas
- NO cuenta para límite de 2 créditos activos
REVALORIZADO:

- Crédito original que fue revalorizado (ahora hay un crédito nuevo)
- NO cuenta para límite de 2 créditos activos

### 8.4 Flujos Operativos Detallados

#### 8.4.1 Flujo: Creación de Crédito Nuevo

Actor: Admin o Prestamista

Precondición: Cliente existe en sistema

Pasos (Admin crea desde panel web):

1. Admin navega a "Créditos" → "Crear Nuevo"
1. Admin completa formulario:
  - Cliente: (Busca por nombre o cédula)
  - Monto a prestar: $800,000
  - Número de cuotas: 12
  - Prestamista responsable: (Selecciona de dropdown)
1. Admin hace clic en "Calcular Cuotas"
1. Sistema calcula y muestra:
  - Interés (20%): $160,000
  - Total a pagar: $960,000
  - Monto por cuota: $80,000
1. Admin revisa y hace clic en "Crear Crédito"
1. Sistema valida:
  - Cliente no tiene 2 créditos activos
  - Monto > 0
  - Número de cuotas > 0
  - Prestamista existe
1. Sistema crea registro en creditos:
  - id: UUID generado
  - cliente_id: ID del cliente
  - monto_prestado: $800,000
  - tasa_interes: 20%
  - monto_total: $960,000
  - numero_cuotas: 12
  - monto_cuota: $80,000
  - saldo_pendiente: $960,000 (inicialmente igual a monto_total)
  - cuotas_pagadas: 0
  - estado: PENDIENTE_DESEMBOLSO (si admin crea)
  - cobrador_responsable_id: ID del prestamista
  - tipo: NUEVO
  - fecha_creacion: HOY
1. Sistema muestra mensaje: "Crédito creado. Proceder con desembolso."
1. Admin sigue flujo de desembolso (ver sección 7.4.3)
Pasos (Prestamista crea desde app móvil):

1. Prestamista en app → "Clientes" → Selecciona cliente → "Solicitar Crédito"
1. Prestamista completa formulario igual que admin
1. Prestamista hace clic en "Solicitar Crédito"
1. Sistema (app) guarda en SQLite local:
  - Crédito con estado PENDIENTE_APROBACION
  - Añade a sync_queue
1. En próxima sync:
  - App envía solicitud al servidor
  - Servidor crea crédito con estado PENDIENTE_APROBACION
  - Admin ve solicitud en panel web → Aprueba o Rechaza
  - Si aprueba → Estado cambia a PENDIENTE_DESEMBOLSO

#### 8.4.2 Flujo: Revalorización de Crédito

Actor: Prestamista (solicita), Admin (aprueba)

Precondición: Crédito cumple requisitos (40% pagado, 30+ días)

FASE 1: Solicitud (Prestamista)

1. Prestamista en app → "Clientes" → Selecciona cliente con crédito activo
1. Prestamista navega a detalle del crédito
1. Sistema muestra información:
  - Monto original: $1,000,000
  - Cuotas pagadas: 6 de 10 (60%)
  - Saldo pendiente: $480,000
  - Días desde desembolso: 90
  - Botón "Solicitar Revalorización" HABILITADO (cumple requisitos)
1. Prestamista hace clic en "Solicitar Revalorización"
1. Sistema muestra formulario:
  - Nuevo monto a prestar: (Input)
  - Número de cuotas: (Input)
1. Prestamista ingresa:
  - Nuevo monto: $1,500,000
  - Cuotas: 10
1. Sistema calcula y muestra preview:
  - Interés (20% sobre $1,500,000): $300,000
  - Total nuevo a pagar: $1,800,000
  - Dinero a entregar al cliente: $1,500,000 - $480,000 = $1,020,000
  - Nueva cuota: $180,000
1. Prestamista hace clic en "Solicitar"
1. Sistema (app) guarda en SQLite local:
  - Solicitud de revalorización en sync_queue
  - Estado: PENDIENTE_APROBACION
1. Sistema muestra mensaje: "Solicitud enviada. Pendiente de aprobación."
FASE 2: Sincronización 11. En próxima sync: - App envía solicitud al servidor - Servidor valida requisitos nuevamente - Servidor crea registro temporal de solicitud

FASE 3: Aprobación (Admin) 12. Admin accede a panel web → "Solicitudes Pendientes" 13. Admin ve solicitud: - Cliente: [Nombre] - Crédito original: $1,000,000 - Saldo pendiente: $480,000 - Nueva solicitud: $1,500,000 - Dinero a entregar: $1,020,000 14. Admin hace clic en "Aprobar" 15. Sistema valida: - Caja Global tiene saldo ≥ $1,020,000 16. Sistema inicia transacción de BD: - Crea nuevo crédito: - monto_prestado: $1,500,000 - monto_total: $1,800,000 - numero_cuotas: 10 - monto_cuota: $180,000 - saldo_pendiente: $1,800,000 - estado: PENDIENTE_DESEMBOLSO - tipo: REVALORIZADO - credito_origen_id: ID del crédito anterior - Actualiza crédito anterior: - estado: REVALORIZADO - Crea registro en historial_revalorizaciones: - Todos los detalles de la operación 17. Sistema sigue flujo de desembolso (Caja Global → Confirmación → Caja Menor → Cliente)

Postcondición: Crédito anterior cerrado, crédito nuevo activo, dinero adicional entregado

#### 8.4.3 Flujo: Renovación de Crédito

Actor: Prestamista (solicita), Admin (aprueba)

Precondición: Crédito anterior 100% pagado

Pasos:

1. Cliente termina de pagar crédito #001 completo
1. Estado del crédito #001: PAGADO
1. Prestamista solicita nuevo crédito (renovación) para el mismo cliente
1. Prestamista en app → Cliente → "Solicitar Renovación"
1. Sistema valida:
  - Cliente tiene al menos 1 crédito en estado PAGADO
1. Prestamista completa formulario:
  - Monto nuevo: $1,200,000
  - Cuotas: 12
1. Sistema (app) envía solicitud en próxima sync
1. Admin aprueba en panel web
1. Sistema crea crédito completamente nuevo:
  - tipo: RENOVADO
  - credito_origen_id: ID del crédito pagado
  - Independiente del anterior (no comparten saldo)
1. Sigue flujo de desembolso normal
Postcondición: Cliente tiene nuevo crédito activo

### 8.5 Criterios de Aceptación

|  |
|---|
| CA-CRE-001: Sistema valida que cliente no tenga 2 créditos activos antes de crear nuevo |
| CA-CRE-002: Nombre de cliente debe tener mínimo 2 palabras en MAYÚSCULAS |
| CA-CRE-003: Sistema permite múltiples clientes con mismo nombre (diferenciados por teléfono) |
| CA-CRE-004: Interés se calcula al 20% fijo sobre monto prestado |
| CA-CRE-005: Cuotas se distribuyen en montos iguales |
| CA-CRE-006: Sobrepago reduce cuota final (no genera saldo a favor separado) |
| CA-CRE-007: Revalorización solo se permite si 40% cuotas pagadas + 30 días transcurridos |
| CA-CRE-008: Interés en revalorización se calcula sobre nuevo monto total |
| CA-CRE-009: Renovación solo se permite si crédito anterior 100% pagado |
| CA-CRE-010: Crédito en estado REVALORIZADO no cuenta para límite de 2 activos |

---

## 9. GESTIÓN DE PAGOS

### 9.1 Objetivo del Módulo

Registrar pagos de cuotas realizados por clientes, aplicar al saldo del crédito, calcular mora automáticamente y manejar diferentes métodos de pago (efectivo y transferencia).

### 9.2 Reglas de Negocio Completas

RP-001: Registro Solo Fecha Actual

- Permitido: Solo registrar pagos con fecha de HOY
- Prohibido: Pagos con fechas pasadas (retroactivos)
- Prohibido: Pagos con fechas futuras
- Validación: Backend rechaza pagos con fecha_pago != HOY
RP-002: Métodos de Pago

- EFECTIVO:
  - Dinero físico entregado al prestamista
  - Incrementa Caja Menor del prestamista
  - Prestamista decide cuándo retornar a Caja Global
- TRANSFERENCIA:
  - Transferencia bancaria a cuenta del negocio
  - Va DIRECTO a Caja Global
  - NO pasa por Caja Menor
  - Prestamista debe tener evidencia (captura de pantalla)
RP-003: Validación de Cuotas

- Sistema valida que la cuota a pagar exista
- Sistema valida que la cuota no haya sido pagada previamente
- Cuotas se pagan secuencialmente (recomendado pero no obligatorio)
RP-004: Aplicación al Saldo

- Al registrar pago:
  - saldo_pendiente -= monto_pagado
  - cuotas_pagadas += 1 (si monto >= monto_cuota)
- Si crédito tenía mora, sistema recalcula estado
RP-005: Pagos Parciales de Cuota

- Permitido: Pagar menos que el monto de la cuota
- Lógica:
  - Saldo del crédito se reduce en monto parcial
  - Cuota NO se marca como pagada (queda pendiente)
  - Próximo pago completa la cuota
- Supuesto técnico: Decisión de implementación del equipo
Ejemplo:

Cuota #5: $120,000

Cliente paga: $80,000 (pago parcial)

Resultado:

- Saldo crédito: $960,000 - $80,000 = $880,000

- Cuota #5: AÚN PENDIENTE (faltan $40,000)

- Cuotas pagadas: Sin cambio

Próximo pago:

Cliente paga: $40,000

- Saldo crédito: $880,000 - $40,000 = $840,000

- Cuota #5: PAGADA COMPLETA

- Cuotas pagadas: +1

RP-006: Cálculo de Mora al Momento del Pago

- Sistema calcula días de mora al registrar pago
- Cálculo: Solo días hábiles (excluye domingos y festivos)
- Días de mora se guardan en registro de pago (auditoría)

### 9.3 Flujos Operativos Detallados

#### 9.3.1 Flujo: Registro de Pago en Efectivo (Detallado)

Actor: Prestamista

Precondición: Cliente tiene crédito activo, Prestamista en campo

Pasos:

1. Prestamista visita a cliente LUIS TORRES
1. LUIS entrega cuota #4 en efectivo: $100,000
1. Prestamista abre app → "Clientes" → Busca "LUIS TORRES"
1. Sistema muestra:
  - Nombre: LUIS TORRES (Tel: 3001234567)
  - Crédito activo: $1,000,000
  - Saldo pendiente: $600,000
  - Próxima cuota: #4 ($100,000)
1. Prestamista hace clic en "Registrar Pago"
1. Sistema muestra formulario pre-llenado:
  - Cuota: #4 (automático, próxima cuota sin pagar)
  - Monto: $100,000 (automático, monto de la cuota)
  - Método: EFECTIVO (por defecto)
  - Fecha: 10/02/2026 (HOY, no editable)
1. Prestamista confirma datos y hace clic en "Guardar Pago"
1. Sistema (app) valida:
  - Cuota #4 no ha sido pagada
  - Monto > 0
  - Fecha es HOY
  - Método de pago es válido
1. Sistema (app) calcula días de mora:
  - Fecha programada cuota #4: 05/02/2026
  - Fecha actual: 10/02/2026
  - Días calendario: 5
  - Ajuste por festivos/domingos:
    - 06/02 (jueves): hábil → +1
    - 07/02 (viernes): hábil → +1
    - 08/02 (sábado): hábil → +1
    - 09/02 (domingo): NO hábil → +0
    - 10/02 (lunes): es el día de pago
  - Días de mora: 3
1. Sistema (app) inicia transacción SQLite local:
  - Crea registro en tabla pagos:
    - id: UUID generado
    - credito_id: ID del crédito de LUIS
    - numero_cuota: 4
    - monto_pagado: $100,000
    - fecha_pago: 10/02/2026
    - metodo_pago: EFECTIVO
    - cobrador_id: ID del prestamista
    - dias_mora: 3
    - sync_status: PENDING
  - Actualiza registro en tabla creditos:
    - saldo_pendiente: $600,000 - $100,000 = $500,000
    - cuotas_pagadas: 4
    - Si saldo_pendiente = 0 → estado = PAGADO
  - Incrementa saldo en caja_menor:
    - saldo_actual: $400,000 + $100,000 = $500,000
  - Añade operación a sync_queue:
    - tipo: PAGO
    - registro_id: ID del pago
    - estado: PENDING
1. Sistema (app) confirma transacción local
1. Sistema muestra mensaje:
  - "Pago registrado exitosamente"
  - "Días de mora: 3"
  - "Nuevo saldo: $500,000"
  - "Tu caja menor: $500,000"
1. Pantalla se actualiza mostrando próxima cuota (#5)
Sincronización: 14. En próxima sincronización automática (máximo 15 minutos): - App envía pago al servidor - Servidor valida: - Cuota no pagada previamente - Crédito existe - Prestamista es el responsable - Si validación OK: - Servidor crea registro en tabla pagos (servidor) - Servidor actualiza crédito (servidor) - Servidor actualiza caja_menor_cobradores.saldo += $100,000 - Servidor responde OK - App actualiza sync_status = SYNCED - Si validación falla (ej: cuota ya pagada por otro cobrador): - Servidor detecta CONFLICTO - Sigue flujo de resolución de conflictos (ver sección 11.5)

Postcondición:

- Pago registrado local y servidor
- Saldo crédito reducido
- Caja Menor incrementada
- Auditoría de mora guardada

#### 9.3.2 Flujo: Registro de Pago por Transferencia (Detallado)

Actor: Prestamista o Admin

Precondición: Cliente realizó transferencia bancaria

Pasos:

1. Cliente SOFIA RUIZ transfiere $80,000 a cuenta bancaria del negocio
1. SOFIA envía captura de transferencia a prestamista por WhatsApp
1. Prestamista valida captura (monto, fecha, nombre)
1. Prestamista abre app → "Clientes" → "SOFIA RUIZ" → "Registrar Pago"
1. Sistema muestra formulario:
  - Cuota: #7
  - Monto: $80,000
  - Método: (Prestamista selecciona TRANSFERENCIA)
  - Fecha: HOY
1. Prestamista hace clic en "Guardar Pago"
1. Sistema (app) valida igual que efectivo
1. Sistema (app) calcula mora igual que efectivo
1. Sistema (app) inicia transacción SQLite local:
  - Crea registro en pagos:
    - metodo_pago: TRANSFERENCIA
    - Otros campos igual que efectivo
  - Actualiza crédito:
    - saldo_pendiente -= $80,000
    - cuotas_pagadas += 1
  - NO incrementa Caja Menor (diferencia crítica vs efectivo)
  - Añade a sync_queue
1. Sistema muestra mensaje:
  - "Pago por transferencia registrado"
  - "El dinero irá directo a Caja Global"
  - "Tu Caja Menor NO se modificó"
Sincronización: 11. En próxima sync: - App envía pago al servidor - Servidor detecta metodo_pago = TRANSFERENCIA - Servidor procesa: - Crea registro en pagos - Actualiza crédito - Incrementa Caja Global: caja_global.saldo += $80,000 - NO modifica Caja Menor - Crea registro en caja_global_movimientos: - tipo: PAGO_TRANSFERENCIA - monto: +$80,000

Postcondición:

- Pago registrado
- Caja Global incrementada
- Caja Menor sin cambios

### 9.4 Criterios de Aceptación

|  |
|---|
| CA-PAG-001: Sistema solo permite registrar pagos con fecha actual (HOY) |
| CA-PAG-002: Pago en efectivo incrementa Caja Menor del prestamista |
| CA-PAG-003: Pago por transferencia incrementa Caja Global (sin pasar por Caja Menor) |
| CA-PAG-004: Sistema calcula días de mora automáticamente al registrar pago |
| CA-PAG-005: Días de mora excluyen domingos y festivos colombianos |
| CA-PAG-006: Saldo del crédito se reduce por monto pagado |
| CA-PAG-007: Sistema permite pagos parciales de cuota |
| CA-PAG-008: Cuota se marca como pagada solo cuando monto total es cubierto |
| CA-PAG-009: Si saldo llega a $0, crédito cambia a estado PAGADO |

---

## 10. CÁLCULO DE MORA

### 10.1 Objetivo del Módulo

Calcular automáticamente días de mora al momento del pago, excluyendo domingos y festivos colombianos según normativa oficial.

### 10.2 Reglas de Negocio Completas

RM-001: Definición de Días Hábiles

- Lunes a sábado: Días hábiles (cuentan para mora)
- Domingo: NO es día hábil (no cuenta para mora)
- Festivos nacionales: NO son días hábiles (no cuentan para mora)
RM-002: Tipos de Festivos en Colombia

1. Festivos Fijos: Siempre en la misma fecha
  - 1 de enero: Año Nuevo
  - 1 de mayo: Día del Trabajo
  - 20 de julio: Día de la Independencia
  - 7 de agosto: Batalla de Boyacá
  - 8 de diciembre: Inmaculada Concepción
  - 25 de diciembre: Navidad
1. Festivos Trasladados: Se mueven al lunes siguiente si caen entre martes y domingo
  - 6 de enero: Epifanía
  - 19 de marzo: San José
  - 29 de junio: San Pedro y San Pablo
  - 15 de agosto: Asunción de la Virgen
  - 12 de octubre: Día de la Raza
  - 1 de noviembre: Todos los Santos
  - 11 de noviembre: Independencia de Cartagena
1. Festivos de Semana Santa: Calculados con algoritmo de Meeus
  - Jueves Santo
  - Viernes Santo
  - Ascensión del Señor (39 días después de Domingo de Resurrección, trasladado al lunes)
  - Corpus Christi (60 días después de Domingo de Resurrección, trasladado al lunes)
  - Sagrado Corazón (68 días después de Domingo de Resurrección, trasladado al lunes)
RM-003: Cálculo de Días de Mora

- Fórmula:
- dias_mora = cantidad de días hábiles entre fecha_programada y fecha_pago (sin incluir fecha_pago)
Ejemplo detallado:

Fecha programada de cuota: Jueves 06/02/2026

Fecha real de pago: Martes 11/02/2026

Días calendario transcurridos: 5

Análisis día por día:

- 06/02 (jueves): Fecha programada (no cuenta)

- 07/02 (viernes): Día hábil → +1 día mora

- 08/02 (sábado): Día hábil → +1 día mora

- 09/02 (domingo): NO hábil → +0 días mora

- 10/02 (lunes): Día hábil → +1 día mora

- 11/02 (martes): Día de pago (no cuenta)

Días de mora: 3

RM-004: Ajuste por Festivos

Fecha programada: Miércoles 19/03/2026

Fecha real de pago: Lunes 24/03/2026

Festivo: 19/03 es San José (festivo trasladado al lunes 23/03)

Días calendario: 5

Análisis:

- 19/03 (miércoles): Fecha programada (no cuenta)

- 20/03 (jueves): Día hábil → +1

- 21/03 (viernes): Día hábil → +1

- 22/03 (sábado): Día hábil → +1

- 23/03 (domingo): NO hábil (domingo) → +0

- 24/03 (lunes): Día de pago (no cuenta)

Días de mora: 3

NOTA: 23/03 es San José trasladado, pero como ya es domingo,

no genera doble exclusión.

### 10.3 Gestión de Festivos

#### 10.3.1 Fuente de Festivos

Origen: Generados en servidor mediante script automático

Algoritmo: Algoritmo de Meeus para cálculo de Semana Santa

Cobertura: Festivos nacionales (toda Colombia)

Rango: Precargados 2024-2030

Actualización: Cron job automático cada 1 de enero

#### 10.3.2 Script de Generación de Festivos

Ubicación: scripts/generar-festivos-colombia.js

Responsable de ejecución:

- Cron job automático cada 1 de enero a las 00:00
- Admin puede ejecutar manualmente si es necesario
Lógica del script:

1. Calcula festivos fijos del año
1. Calcula festivos trasladados (lógica de traslado al lunes)
1. Calcula Semana Santa con algoritmo de Meeus
1. Inserta registros en tabla festivos_colombia
Ejemplo de salida:

INSERT INTO festivos_colombia (id, fecha, nombre, tipo, anio, es_nacional)

VALUES

('uuid-001', '2026-01-01', 'Año Nuevo', 'FIJO', 2026, true),

('uuid-002', '2026-01-12', 'Epifanía', 'TRASLADADO', 2026, true),

('uuid-003', '2026-04-02', 'Jueves Santo', 'SEMANA_SANTA', 2026, true),

...

#### 10.3.3 Sincronización de Festivos en App

Estrategia: Modelo híbrido

Primera instalación:

- App descarga festivos del año actual y siguiente
Actualización continua:

- Cada sincronización (cada 15 min), app verifica si hay festivos nuevos
- Descarga solo festivos con created_at > last_sync_festivos
Almacenamiento:

- App guarda festivos en SQLite local
- Tabla festivos_colombia local
Uso:

- Al calcular mora, app consulta tabla local
- NO requiere conexión para cálculo de mora

### 10.4 Implementación Técnica del Cálculo

Pseudocódigo:

function calcularDiasMora(fechaProgramada, fechaPago) {

// Cargar festivos desde SQLite local

const festivos = await db.query(

```text
    'SELECT fecha FROM festivos_colombia WHERE anio = ?',
    [fechaPago.getFullYear()]
```

);

const festivosSet = new Set(festivos.map(f => f.fecha));

let diasMora = 0;

let fechaActual = new Date(fechaProgramada);

fechaActual.setDate(fechaActual.getDate() + 1); // Día siguiente a fecha programada

while (fechaActual < fechaPago) {

```text
    const diaSemana = fechaActual.getDay(); // 0=Domingo, 6=Sábado
    const fechaStr = formatoYYYYMMDD(fechaActual);
    
    // Verificar si es día hábil
    const esDomingo = (diaSemana === 0);
    const esFestivo = festivosSet.has(fechaStr);
    
    if (!esDomingo && !esFestivo) {
      diasMora += 1;
    }
    
    fechaActual.setDate(fechaActual.getDate() + 1);
```

}

return diasMora;

}

### 10.5 Criterios de Aceptación

|  |
|---|
| CA-MOR-001: Domingos no cuentan como días de mora |
| CA-MOR-002: Festivos nacionales no cuentan como días de mora |
| CA-MOR-003: Lunes a sábado (excluidos festivos) SÍ cuentan como días de mora |
| CA-MOR-004: Sistema precarga festivos 2024-2030 al inicio |
| CA-MOR-005: Cron job ejecuta script el 1 de enero de cada año |
| CA-MOR-006: App móvil sincroniza festivos desde servidor (no hardcodeados) |
| CA-MOR-007: Cálculo de mora funciona offline (consulta festivos en SQLite local) |
| CA-MOR-008: Días de mora se guardan en registro de pago para auditoría |

---

## 11. SINCRONIZACIÓN OFFLINE

### 11.1 Objetivo del Módulo

Permitir operación completa de la app móvil sin conexión a internet, sincronizando cambios bidireccionales cuando exista conectividad, detectando y resolviendo conflictos automáticamente.

### 11.2 Principios Arquitectónicos

PA-001: Offline-First

- App funciona primero sin conexión
- Todas las operaciones se guardan en SQLite local
- Sincronización es un proceso secundario (no bloqueante)
PA-002: Bidireccional

- Push: App envía cambios locales → Servidor
- Pull: Servidor envía cambios → App
- Ambas direcciones en cada sincronización
PA-003: Eventually Consistent

- Datos eventualmente consistentes (no inmediatos)
- Conflictos detectados y resueltos automáticamente
- Notificaciones a admin cuando requiere decisión manual

### 11.3 Reglas de Sincronización Completas

RS-001: Frecuencia de Sincronización

- Automática: Cada 15 minutos (si hay conexión)
- Manual: Botón "Sincronizar ahora" disponible siempre
- Trigger adicional: Al abrir app después de >1 hora cerrada
RS-002: Lotes Técnicos

- Sin límite total: No hay restricción en cantidad total de registros pendientes
- Lotes por request: Máximo 500 registros por request HTTP
- Procesamiento: Lotes enviados secuencialmente (no paralelo)
Ejemplo:

Prestamista tiene 1,200 registros pendientes de sincronizar:

Request 1: Envía registros 1-500

→ Espera respuesta del servidor

→ Si OK, continúa

Request 2: Envía registros 501-1000

→ Espera respuesta

→ Si OK, continúa

Request 3: Envía registros 1001-1200

→ Espera respuesta

→ Finalizado

Total: 3 requests HTTP secuenciales

RS-003: Timeout por Request

- Timeout: 15 segundos por request individual
- NO aplica: Al proceso completo de sincronización
- Si timeout: Se reintenta ese lote específico
Ejemplo:

Request 2 (registros 501-1000) demora 16 segundos:

→ Timeout

→ App reintenta Request 2 después de backoff

→ Request 3 NO se ejecuta hasta que Request 2 tenga éxito

RS-004: Atomicidad por Registro

- Transaccionalidad: Por registro individual, NO por batch
- Lógica: Si un registro falla, los demás del lote continúan procesándose
- Estado de fallo: Registro fallido queda PENDIENTE_REINTENTO
Ejemplo:

Lote de 500 registros:

- Registros 1-450: Procesados OK → SYNCED

- Registro 451: Error de validación → PENDIENTE_REINTENTO

- Registros 452-500: Procesados OK → SYNCED

Resultado:

- 499 sincronizados exitosamente

- 1 pendiente de reintento

RS-005: Orden de Sincronización

- Orden estricto: Clientes → Créditos → Pagos
- Razón: Garantizar integridad referencial
- Validación: Servidor valida que cliente existe antes de aceptar crédito
Implementación:

async function sincronizarPush() {

// Paso 1: Sincronizar clientes

await sincronizarEntidad('clientes');

// Paso 2: Solo después, sincronizar créditos

await sincronizarEntidad('creditos');

// Paso 3: Solo después, sincronizar pagos

await sincronizarEntidad('pagos');

}

RS-006: Reintentos Automáticos

- Estrategia: Backoff exponencial
- Secuencia: 1s, 2s, 4s, 8s, 16s (máximo 5 intentos)
- Después de 5 fallos: Registro queda PENDIENTE para próxima sincronización completa
Ejemplo:

Registro de pago falla al sincronizar:

Intento 1: Espera 1 segundo → Reintenta → Falla

Intento 2: Espera 2 segundos → Reintenta → Falla

Intento 3: Espera 4 segundos → Reintenta → Falla

Intento 4: Espera 8 segundos → Reintenta → Falla

Intento 5: Espera 16 segundos → Reintenta → Falla

Después de intento 5:

→ Registro marcado como ERROR_PERSISTENTE

→ Se mostrará al prestamista como "Pendiente de sincronizar"

→ Próxima sincronización automática (15 min) lo reintentará

RS-007: Límite de Tiempo Offline

- Máximo recomendado: 6 horas sin sincronizar
- Alerta en app: Al superar 6h, app muestra mensaje:
  - "Llevas más de 6 horas sin sincronizar. Recomendamos sincronizar pronto."
- Alerta a admin: Si prestamista supera 12h sin sincronizar:
  - Admin recibe notificación en panel web
  - Dashboard muestra prestamistas desconectados
RS-008: Sincronización de Festivos

- Modelo: Híbrido
- Precarga inicial: Al instalar app, descarga festivos año actual + siguiente
- Actualización continua: En cada sync, app consulta si hay festivos nuevos
- Criterio: Descarga festivos con created_at > last_sync_festivos_timestamp

### 11.4 Flujos de Sincronización Detallados

#### 11.4.1 Flujo: Sincronización Automática (cada 15 min)

Trigger: Timer de 15 minutos + conectividad detectada

Pasos:

FASE 1: Verificación Preliminar

1. App detecta que pasaron 15 minutos desde última sync
1. App verifica conectividad:
  - Hace ping a servidor (endpoint /health)
  - Si no responde → Aborta sync, espera próximo ciclo
  - Si responde OK → Continúa
1. App actualiza UI: Ícono de sincronización cambia a "Sincronizando..."
FASE 2: Push (App → Servidor) 4. App consulta SQLite local:

- Cuenta registros con sync_status = PENDING por entidad
- Clientes pendientes: 5
- Créditos pendientes: 2
- Pagos pendientes: 120
1. App prepara envío en orden (Clientes → Créditos → Pagos)
Paso 2.1: Sincronizar Clientes 6. App toma registros de clientes PENDING (máximo 500) 7. App serializa a JSON:

{

"entidad": "clientes",

"registros": [

```text
    {
      "id": "uuid-001",
      "nombre_completo": "JUAN PEREZ",
      "telefono": "3001234567",
      ...
    },
    ...
```

]

}

1. App envía POST a /api/sync/push/clientes
1. Servidor recibe, valida y procesa:
  - Para cada cliente:
    - Verifica que no exista con mismo ID
    - Crea registro en BD servidor
    - Responde con status por registro
1. Servidor responde:
1. {  "procesados": 5,  "exitosos": 5,  "fallidos": 0}
1. App actualiza SQLite local:
  - Marca clientes enviados como sync_status = SYNCED
Paso 2.2: Sincronizar Créditos 12. Repite pasos 6-11 para créditos

Paso 2.3: Sincronizar Pagos 13. App toma 120 pagos PENDING 14. Como son >500, los divide en lotes: - Lote 1: Pagos 1-120 (menor a 500, envía todos en un request) 15. App envía POST a /api/sync/push/pagos 16. Servidor procesa, detecta: - Pagos 1-115: OK - Pago 116: Cuota ya pagada (CONFLICTO) - Pagos 117-120: OK 17. Servidor responde: json { "procesados": 120, "exitosos": 119, "fallidos": 0, "conflictos": 1, "detalles_conflictos": [ { "registro_id": "uuid-pago-116", "tipo": "PAGO_DUPLICADO", "mensaje": "Cuota #5 del crédito ya fue pagada" } ] } 18. App procesa respuesta: - Pagos exitosos: sync_status = SYNCED - Pago 116: sync_status = CONFLICT - App muestra notificación: "1 pago en conflicto. Contacta al administrador."

FASE 3: Pull (Servidor → App) 19. App solicita cambios desde servidor: - Envía GET a /api/sync/pull?last_sync_timestamp=2026-02-10T08:00:00Z 20. Servidor consulta registros con updated_at > last_sync_timestamp: - Cliente #055 fue editado por admin - Crédito #089 fue aprobado por admin - Ruta "Centro" tiene cliente nuevo asignado al prestamista 21. Servidor responde: json { "clientes": [...], "creditos": [...], "rutas_clientes": [...] } 22. App procesa cambios: - Actualiza registros existentes en SQLite - Inserta registros nuevos - Marca como sync_status = SYNCED

FASE 4: Finalización 23. App actualiza last_sync_timestamp = HOY 24. App actualiza UI: Ícono cambia a "Sincronizado ✓" 25. App muestra toast: "Sincronización completada"

Duración total: Típicamente 5-15 segundos (dependiendo de cantidad de registros)

#### 11.4.2 Flujo: Sincronización Manual (Usuario hace clic en botón)

Trigger: Usuario hace clic en "Sincronizar ahora"

Pasos:

1. Usuario navega a "Configuración" → "Sincronización"
1. Usuario hace clic en botón "Sincronizar ahora"
1. App verifica conectividad
1. Si no hay conexión:
  - App muestra mensaje: "No hay conexión a internet. Verifica tu red."
  - Aborta
1. Si hay conexión:
  - Ejecuta mismo flujo que sincronización automática (11.4.1)
  - Diferencia: App muestra barra de progreso visible
Postcondición: Datos sincronizados manualmente

### 11.5 Detección y Resolución de Conflictos

#### 11.5.1 Tipos de Conflictos

Conflicto Tipo 1: Pago Duplicado

- Escenario:
  - Cobrador A (offline) registra pago de cuota #5 del crédito X
  - Cobrador B (offline) registra pago de la MISMA cuota #5 del mismo crédito X
  - Ambos sincronizan
Detección:

- Servidor detecta 2 registros de pago para (credito_id + numero_cuota) duplicado
- Servidor aplica first-write-wins
Resolución:

Cobrador A sincroniza primero (10:00 AM):

→ Pago aceptado

→ Cuota #5 marcada como PAGADA

→ Saldo del crédito se reduce

→ Estado: SYNCED

Cobrador B sincroniza después (10:05 AM):

→ Servidor detecta que cuota #5 ya está pagada

→ Pago rechazado

→ Estado: CONFLICTO_DUPLICADO

→ Registro se guarda en sync_log con tipo PAGO_DUPLICADO

→ Admin recibe notificación en panel web

Acción del Admin:

- Admin abre panel web → "Conflictos Pendientes"
- Ve conflicto:
  - Crédito: [Nombre cliente]
  - Cuota: #5
  - Primer pago: Cobrador A, $60,000, 10:00 AM
  - Segundo pago: Cobrador B, $60,000, 10:05 AM
- Admin decide:
  - Opción A: Rechazar segundo pago (es un error, cliente no pagó dos veces)
  - Opción B: Aceptar segundo pago y aplicarlo a cuota #6 (cliente efectivamente pagó dos veces)
  - Opción C: Aceptar segundo pago como sobrepago (se aplicará a cuota final)

Conflicto Tipo 2: Actualización Concurrente de Datos de Cliente

- Escenario:
  - Cobrador A (offline) actualiza teléfono de cliente: 3001111111
  - Cobrador B (offline) actualiza teléfono del MISMO cliente: 3002222222
  - Ambos sincronizan
Detección:

- Servidor detecta 2 actualizaciones del mismo registro
Resolución:

- Estrategia: Last-write-wins
- Lógica:
- Cobrador A sincroniza primero (11:00 AM):  → Teléfono actualizado a 3001111111  → updated_at = 11:00 AMCobrador B sincroniza después (11:02 AM):  → Servidor compara timestamps  → 11:02 > 11:00 → Last-write-wins  → Teléfono sobrescrito a 3002222222  → updated_at = 11:02 AM  → Cambio de A es perdido (sin notificación)
Nota: Este es un riesgo aceptado. No se notifica al admin porque son datos no críticos.

Conflicto Tipo 3: Reasignación de Cliente con Pagos Offline

- Escenario:
  - Admin reasigna cliente de Cobrador A → Cobrador B (10:00 AM)
  - Cobrador A (offline desde las 9:00 AM) registra pago del cliente (10:30 AM)
  - Cobrador A sincroniza (11:00 AM)
Detección:

- Servidor detecta que pago fue registrado por cobrador que ya no tiene al cliente asignado
Resolución:

- Estrategia: Aceptación con notificación
- Lógica:
- Servidor procesa pago de Cobrador A:  → Valida que crédito existe  → Valida que cuota no está pagada  → Acepta el pago (es válido)  → Registra pago con cobrador_id = A  → Crea notificación para admin:    "Cobrador A registró pago de cliente que ya fue reasignado a Cobrador B"
Acción del Admin:

- Admin ve notificación
- Admin valida que el pago es correcto
- Admin marca como "Revisado" (no requiere acción adicional)

### 11.6 Indicadores de Estado de Sincronización

En App Móvil:

Ícono de Estado:

- ✅ Verde "Sincronizado": Todos los registros sincronizados, sin pendientes
- 🔄 Amarillo "Sincronizando": Proceso de sincronización en curso
- ⚠️ Naranja "X pendientes": Hay X registros pendientes de sincronizar
- ❌ Rojo "Error": Última sincronización falló
Información Detallada:

- Última sincronización exitosa: "Hace 5 minutos"
- Registros pendientes:
  - Clientes: 3
  - Créditos: 1
  - Pagos: 15
- Próxima sincronización automática: "En 10 minutos"
Botones:

- "Sincronizar ahora" (habilitado si hay conexión)
- "Ver errores" (si existen registros con error)

En Panel Admin:

Dashboard de Sincronización:

- Tabla con cobradores:
  - Nombre
  - Última sincronización
  - Estado (Online / Offline >6h / Offline >12h)
  - Registros pendientes
  - Conflictos pendientes
Alertas:

- "3 cobradores sin sincronizar desde hace >12 horas"
- "5 conflictos de pago duplicado pendientes de resolver"

### 11.7 Criterios de Aceptación

|  |
|---|
| CA-SYN-001: App funciona 100% offline sin conexión a internet |
| CA-SYN-002: Sincronización automática cada 15 minutos cuando hay conexión |
| CA-SYN-003: Usuario puede sincronizar manualmente en cualquier momento |
| CA-SYN-004: Registros se envían en lotes de máximo 500 por request |
| CA-SYN-005: Timeout de 15 segundos por request individual |
| CA-SYN-006: Sincronización sigue orden Clientes → Créditos → Pagos |
| CA-SYN-007: Reintentos automáticos con backoff exponencial (1s, 2s, 4s, 8s, 16s) |
| CA-SYN-008: Pagos duplicados detectados automáticamente (first-write-wins) |
| CA-SYN-009: Actualizaciones concurrentes de datos de cliente usan last-write-wins |
| CA-SYN-010: Admin recibe notificación de conflictos que requieren decisión manual |
| CA-SYN-011: App muestra alerta al superar 6 horas sin sincronizar |
| CA-SYN-012: Admin ve dashboard de cobradores con última sincronización |

---

## 12. SEGURIDAD Y AUTENTICACIÓN

### 12.1 Objetivo del Módulo

Garantizar acceso seguro al sistema mediante autenticación con JWT, control de permisos granular por rol, y protección de datos sensibles.

### 12.2 Autenticación con JWT

#### 12.2.1 Flujo de Login

Actor: Usuario (Admin o Prestamista)

Precondición: Usuario registrado en sistema

Pasos:

1. Usuario ingresa:
  - Cédula: 123456789
  - Contraseña: ********
1. App/Frontend envía POST a /api/auth/login:
1. {  "cedula": "123456789",  "password": "password_plano"}
1. Servidor valida:
  - Usuario existe con esa cédula
  - Contraseña coincide (comparación con bcrypt hash)
  - Usuario no está bloqueado (estado != BLOQUEADO)
1. Servidor genera JWT:
1. const payload = {  userId: usuario.id,  rol: usuario.rol,  nombre: usuario.nombre};const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });
1. Servidor crea registro en sesiones_activas:
  - usuario_id: ID del usuario
  - token_hash: Hash del access token
  - device_id: ID único del dispositivo
  - device_info: Modelo, OS, versión
  - ip_address: IP del cliente
  - bloqueada: false
1. Servidor responde:
1. {  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  "usuario": {    "id": "uuid-123",    "nombre": "CARLOS LOPEZ",    "rol": "PRESTAMISTA"  }}
1. App/Frontend almacena:
  - Access token en secure storage (encriptado)
  - Refresh token en secure storage (encriptado)
  - Datos de usuario en memoria
Postcondición: Usuario autenticado, puede acceder a endpoints protegidos

#### 12.2.2 Protección de Endpoints

Middleware de Autenticación:

async function authenticateJWT(req, res, next) {

const authHeader = req.headers.authorization;

if (!authHeader) {

return res.status(401).json({ error: 'No token provided' });

}

const token = authHeader.split(' ')[1]; // "Bearer <token>"

try {

```text
    const payload = jwt.verify(token, SECRET_KEY);
    
    // Verificar que sesión no esté bloqueada
    const sesion = await db.query(
      'SELECT bloqueada FROM sesiones_activas WHERE token_hash = ?',
      [hashToken(token)]
    );
    
    if (sesion.bloqueada) {
      return res.status(401).json({ error: 'Session blocked' });
    }
    
    req.user = payload; // { userId, rol, nombre }
    next();
```

} catch (error) {

return res.status(401).json({ error: 'Invalid token' });

}

}

Uso en endpoints:

app.get('/api/clientes', authenticateJWT, async (req, res) => {

// req.user contiene userId y rol

// Implementar lógica de negocio

});

#### 12.2.3 Validación de Token en Modo Offline

Regla: App NO valida expiración de token mientras está offline

Razón: Coherente con arquitectura offline-first

Lógica:

- Operación local (sin sincronización): App NO verifica token
  - Usuario puede crear clientes, registrar pagos, etc.
  - Todo se guarda en SQLite local con sync_status = PENDING
- Sincronización (requiere servidor): App incluye token en request
  - Servidor valida token
  - Si token expirado → Servidor responde 401
  - App recibe error → Solicita al usuario que haga login nuevamente
  - Datos locales NO se pierden (permanecen en SQLite)
Supuesto técnico implícito: Documentado en sección 17

#### 12.2.4 Renovación de Token

Trigger: Access token con menos de 2 horas de vigencia

Flujo:

1. Durante sincronización exitosa, servidor detecta token próximo a expirar
1. Servidor genera nuevo access token
1. Servidor incluye en respuesta:
1. {  "success": true,  "newAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
1. App actualiza token en secure storage
Alternativa (si token ya expiró):

- App envía POST a /api/auth/refresh:
- {  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
- Servidor valida refresh token
- Servidor genera nuevo access token
- Servidor responde con nuevo access token

### 12.3 Bloqueo Remoto de Sesiones

Flujo:

1. Admin detecta actividad sospechosa de prestamista
1. Admin accede a panel web → "Usuarios" → Selecciona prestamista → "Bloquear Sesiones"
1. Sistema actualiza:
1. UPDATE sesiones_activasSET bloqueada = trueWHERE usuario_id = 'uuid-prestamista';
1. En próxima sincronización del prestamista:
  - Prestamista envía request con token
  - Middleware detecta sesion.bloqueada = true
  - Servidor responde 401 Unauthorized
  - App recibe error → Fuerza logout
  - App muestra mensaje: "Tu sesión ha sido bloqueada. Contacta al administrador."
  - Datos locales permanecen en SQLite (no se pierden)
Postcondición: Prestamista no puede sincronizar hasta que admin desbloquee

### 12.4 Control de Permisos

Validación en Backend:

function requireRole(rolesPermitidos) {

return function(req, res, next) {

```text
    const userRole = req.user.rol;
    
    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
```

};

}

// Uso en endpoints

app.post('/api/usuarios', authenticateJWT, requireRole(['ADMIN']), crearUsuario);

app.get('/api/clientes', authenticateJWT, requireRole(['ADMIN', 'PRESTAMISTA']), listarClientes);

Validación de Propiedad:

app.get('/api/clientes/:id', authenticateJWT, async (req, res) => {

const cliente = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);

if (req.user.rol === 'PRESTAMISTA') {

```text
    // Verificar que cliente está asignado a este prestamista
    const asignado = await db.query(`
      SELECT 1 FROM rutas_clientes
      WHERE cliente_id = ? AND cobrador_asignado_id = ?
    `, [req.params.id, req.user.userId]);
    
    if (!asignado) {
      return res.status(403).json({ error: 'Cliente no asignado' });
    }
```

}

res.json(cliente);

});

### 12.5 Protección de Datos

Contraseñas:

- Nunca se almacenan en texto plano
- Hasheadas con bcrypt (factor de costo 10)
- Al crear/actualizar usuario:
- const hashedPassword = await bcrypt.hash(plainPassword, 10);
Tokens JWT:

- Almacenados en secure storage encriptado (app móvil)
- No expuestos en logs
- Expiración: 24 horas (access), 30 días (refresh)
Comunicación:

- Todas las comunicaciones app ↔ servidor en HTTPS
- Certificado SSL en servidor (incluso en portátil local)

### 12.6 Criterios de Aceptación

|  |
|---|
| CA-SEG-001: Contraseñas hasheadas con bcrypt (nunca texto plano) |
| CA-SEG-002: Access token expira en 24 horas |
| CA-SEG-003: Refresh token expira en 30 días |
| CA-SEG-004: Token inválido/expirado retorna 401 Unauthorized |
| CA-SEG-005: Admin puede bloquear sesiones remotamente |
| CA-SEG-006: Sesión bloqueada rechaza todos los requests del usuario |
| CA-SEG-007: App NO valida token mientras opera offline |
| CA-SEG-008: Token se valida SOLO durante sincronización |
| CA-SEG-009: Prestamista solo accede a clientes asignados |
| CA-SEG-010: Toda comunicación app-servidor en HTTPS |

---

## 13. MANEJO DE ERRORES

### 13.1 Categorías de Errores

E1: Errores de Validación de Negocio

- Cliente ya tiene 2 créditos activos
- Revalorización no cumple requisitos
- Saldo insuficiente en caja
- Respuesta: HTTP 400 Bad Request + mensaje específico
E2: Errores de Permisos

- Prestamista intenta ver cliente no asignado
- Prestamista intenta editar crédito
- Respuesta: HTTP 403 Forbidden
E3: Errores de Sincronización

- Timeout de request
- Conflicto de pago duplicado
- Integridad referencial violada
- Respuesta: Registro queda PENDIENTE_REINTENTO + log en sync_log
E4: Errores de Sistema

- Base de datos caída
- Servidor sin espacio
- Respuesta: HTTP 500 Internal Server Error + alerta a admin

### 13.2 Formato de Respuestas de Error

Errores de Validación:

{

"error": "VALIDATION_ERROR",

"message": "Cliente ya tiene 2 créditos activos",

"details": {

```text
    "cliente_id": "uuid-123",
    "creditos_activos": 2,
    "limite": 2
```

}

}

Errores de Sincronización:

{

"error": "SYNC_CONFLICT",

"message": "Cuota #5 ya fue pagada por otro cobrador",

"conflicto": {

```text
    "tipo": "PAGO_DUPLICADO",
    "credito_id": "uuid-456",
    "numero_cuota": 5,
    "pago_existente": {
      "cobrador": "Carlos Lopez",
      "fecha": "2026-02-10T09:00:00Z"
    }
```

}

}

### 13.3 Estrategias de Recuperación

En App Móvil:

- Errores de sincronización → Reintento automático con backoff
- Errores de validación → Mensaje al usuario + opción de corregir
- Errores de sistema → Mensaje genérico + registro en log local
En Servidor:

- Errores críticos → Email automático a admin
- Backups cada 6 horas → Recuperación ante corrupción
- Logs estructurados → Análisis de patrones de error

### 13.4 Criterios de Aceptación

|  |
|---|
| CA-ERR-001: Errores de validación retornan HTTP 400 con mensaje claro |
| CA-ERR-002: Errores de permisos retornan HTTP 403 |
| CA-ERR-003: Errores de autenticación retornan HTTP 401 |
| CA-ERR-004: Conflictos de sincronización se registran en sync_log |
| CA-ERR-005: Errores críticos generan email a admin |
| CA-ERR-006: App muestra mensajes de error amigables al usuario |

---

## 14. TESTING Y CALIDAD

### 14.1 Requisitos No Negociables

RT-001: Cobertura Global

- Mínimo 80% de cobertura de código en backend
- Mínimo 80% de cobertura de código en app móvil
RT-002: Módulos Críticos

- ≥90% de cobertura en:
  - Módulo de caja (asignaciones, retornos, cálculos)
  - Módulo de sincronización
  - Cálculo de mora
  - Gestión de créditos (revalorización, renovación)
RT-003: Tests E2E Obligatorios

- 12 flujos completos que deben pasar antes de deployment:
1. Flujo completo de crédito nuevo:
  - Admin crea cliente
  - Admin crea crédito
  - Admin autoriza desembolso
  - Prestamista confirma recepción
  - Prestamista entrega a cliente
  - Prestamista registra 3 pagos
  - Verificar saldos de caja
1. Revalorización:
  - Cliente tiene crédito con 40% pagado
  - Prestamista solicita revalorización
  - Admin aprueba
  - Flujo de desembolso completo
  - Verificar crédito anterior cerrado
1. Sincronización con conflicto:
  - Dos prestamistas offline registran mismo pago
  - Ambos sincronizan
  - Verificar first-write-wins
  - Verificar notificación a admin
1. Asignación de caja menor:
  - Admin autoriza asignación
  - Verificar Caja Global reducida
  - Prestamista confirma
  - Verificar Caja Menor incrementada
1. Retorno de caja:
  - Prestamista solicita retorno
  - Verificar Caja Menor reducida
  - Admin confirma
  - Verificar Caja Global incrementada
1. Pago por transferencia:
  - Prestamista registra pago transferencia
  - Verificar va a Caja Global
  - Verificar Caja Menor sin cambios
1. Cliente en múltiples rutas:
  - Admin crea 2 rutas
  - Admin asigna cliente con crédito #1 a Ruta A
  - Admin asigna mismo cliente con crédito #2 a Ruta B
  - Verificar ambos créditos visibles
1. Reasignación de cliente:
  - Admin reasigna cliente de Cobrador A a B
  - Verificar A pierde visibilidad
  - Verificar B gana visibilidad
  - Pago offline de A se acepta
1. Cálculo de mora con festivos:
  - Crédito con fecha de pago 05/02/2026
  - Pago realizado 10/02/2026
  - Verificar mora excluye domingos y festivos
1. Operación offline completa:
  - Prestamista sin conexión
  - Crea cliente → crédito → pago
  - Verifica guardado en SQLite
  - Sincroniza
  - Verificar datos en servidor
1. Bloqueo remoto de sesión:
  - Admin bloquea prestamista
  - Prestamista intenta sincronizar
  - Verificar error 401
  - Verificar app fuerza logout
1. Sobrepago que reduce cuota final:
  - Crédito 10 cuotas de $120,000
  - Cliente paga cuota 9 con $150,000
  - Verificar cuota 10 reducida a $90,000
RT-004: Bloqueo de CI/CD

- Si tests fallan → Deployment se BLOQUEA
- No se permite merge a rama principal si tests no pasan
- Pipeline CI/CD ejecuta tests automáticamente

### 14.2 Tipos de Testing

Tests Unitarios:

- Funciones de cálculo aisladas (mora, intereses, cuotas)
- Validaciones de reglas de negocio
- Lógica de transformación de datos
- Mocks de base de datos para evitar dependencias
Ejemplo:

describe('Cálculo de Mora', () => {

test('Excluye domingos del cálculo', () => {

```text
    const fechaProgramada = new Date('2026-02-05'); // Jueves
    const fechaPago = new Date('2026-02-10'); // Martes
    const festivos = [];
    
    const diasMora = calcularDiasMora(fechaProgramada, fechaPago, festivos);
    
    expect(diasMora).toBe(3); // Viernes, Sábado, Lunes (excluye domingo)
```

});

test('Excluye festivos del cálculo', () => {

```text
    const fechaProgramada = new Date('2026-02-05');
    const fechaPago = new Date('2026-02-10');
    const festivos = [new Date('2026-02-06')]; // Viernes festivo
    
    const diasMora = calcularDiasMora(fechaProgramada, fechaPago, festivos);
    
    expect(diasMora).toBe(2); // Solo Sábado y Lunes
```

});

});

Tests de Integración:

- Endpoints de API completos
- Interacción con base de datos real (test DB)
- Flujos de autenticación
- Validaciones de permisos
Ejemplo:

describe('POST /api/creditos', () => {

test('Admin puede crear crédito', async () => {

```text
    const adminToken = await loginAsAdmin();
    
    const response = await request(app)
      .post('/api/creditos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        cliente_id: 'uuid-cliente-123',
        monto_prestado: 500000,
        numero_cuotas: 10
      });
    
    expect(response.status).toBe(201);
    expect(response.body.monto_total).toBe(600000); // +20% interés
```

});

test('Rechaza si cliente tiene 2 créditos activos', async () => {

```text
    const adminToken = await loginAsAdmin();
    
    // Setup: Cliente ya tiene 2 créditos activos
    await createActiveCredit('uuid-cliente-456');
    await createActiveCredit('uuid-cliente-456');
    
    const response = await request(app)
      .post('/api/creditos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        cliente_id: 'uuid-cliente-456',
        monto_prestado: 300000,
        numero_cuotas: 8
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('VALIDATION_ERROR');
```

});

});

Tests E2E:

- Flujos completos de usuario (12 obligatorios listados en RT-003)
- Navegador automatizado (Playwright para web)
- Emulador Android para app móvil
- Escenarios de usuario reales
Ejemplo:

describe('E2E: Flujo completo de crédito nuevo', () => {

test('Desde creación hasta primer pago', async () => {

```text
    // 1. Admin crea cliente
    await adminPage.goto('/clientes/crear');
    await adminPage.fill('[name="nombre_completo"]', 'JUAN PEREZ');
    await adminPage.fill('[name="telefono"]', '3001234567');
    await adminPage.click('button[type="submit"]');
    await expect(adminPage.locator('text=Cliente creado')).toBeVisible();
    
    // 2. Admin crea crédito
    await adminPage.goto('/creditos/crear');
    await adminPage.fill('[name="cliente"]', 'JUAN PEREZ');
    await adminPage.fill('[name="monto"]', '500000');
    await adminPage.fill('[name="cuotas"]', '10');
    await adminPage.click('button:has-text("Crear Crédito")');
    
    // 3. Verificar saldo Caja Global reducido
    const cajaGlobal = await getCajaGlobalSaldo();
    expect(cajaGlobal).toBe(4500000); // 5M - 500K
    
    // 4. Prestamista confirma en app móvil
    await appPage.tap('Créditos Pendientes');
    await appPage.tap('JUAN PEREZ');
    await appPage.tap('Confirmar Recepción');
    
    // 5. Verificar Caja Menor incrementada
    const cajaMenor = await getCajaMenorSaldo('prestamista-1');
    expect(cajaMenor).toBe(900000); // 400K + 500K
    
    // 6. Prestamista entrega a cliente
    await appPage.tap('Confirmar Entrega');
    
    // 7. Verificar crédito ACTIVO
    const credito = await getCredito('credito-id');
    expect(credito.estado).toBe('ACTIVO');
    
    // 8. Prestamista registra pago
    await appPage.tap('Clientes');
    await appPage.tap('JUAN PEREZ');
    await appPage.tap('Registrar Pago');
    await appPage.fill('[name="monto"]', '60000');
    await appPage.tap('Guardar');
    
    // 9. Verificar Caja Menor incrementada
    const cajaMenorFinal = await getCajaMenorSaldo('prestamista-1');
    expect(cajaMenorFinal).toBe(460000); // 400K + 60K
    
    // 10. Sincronizar y verificar en servidor
    await appPage.tap('Sincronizar');
    await waitForSync();
    
    const pagoServidor = await getPago('pago-id');
    expect(pagoServidor.monto).toBe(60000);
```

});

});

### 14.3 Herramientas de Testing

Backend (Node.js):

- Framework: Jest
- Assertions: expect (built-in en Jest)
- Mocking: jest.mock()
- API Testing: Supertest
- Cobertura: jest --coverage
Frontend Web (React):

- Framework: Jest + React Testing Library
- E2E: Playwright
- Cobertura: jest --coverage
App Móvil (Flutter):

- Unit Tests: flutter test
- Widget Tests: flutter test (con testWidgets)
- Integration Tests: integration_test package
- Cobertura: flutter test --coverage
CI/CD:

- GitHub Actions o GitLab CI
- Pipeline ejecuta:
  1. Linting
  1. Tests unitarios
  1. Tests de integración
  1. Tests E2E (en ambientes staging)
  1. Verificación de cobertura

### 14.4 Criterios de Aceptación

|  |
|---|
| CA-TES-001: Cobertura global ≥80% en backend y app móvil |
| CA-TES-002: Cobertura ≥90% en módulos críticos (caja, sync, mora, créditos) |
| CA-TES-003: Los 12 flujos E2E pasan antes de cada deployment |
| CA-TES-004: CI/CD bloquea merge si tests fallan |
| CA-TES-005: Reporte de cobertura generado automáticamente |
| CA-TES-006: Tests ejecutados en cada pull request |

---

## 15. DEPLOYMENT Y AMBIENTES

### 15.1 Ambientes

#### 15.1.1 Desarrollo (Dev)

Ubicación: Laptop del desarrollador

Características:

- Base de datos: PostgreSQL local o contenedor Docker
- Backend: Node.js en localhost:3000
- Frontend Web: React dev server en localhost:5173
- App Móvil: Emulador Android o dispositivo físico en modo debug
- Datos: Datos de prueba generados con seeders
Acceso:

- Solo desarrollador
Propósito:

- Desarrollo activo de features
- Debugging
- Pruebas rápidas

#### 15.1.2 Staging (Pre-producción)

Ubicación: Servidor de pruebas (puede ser portátil secundario o VM)

Características:

- Base de datos: PostgreSQL con datos de prueba realistas
- Backend: Node.js con PM2
- Frontend Web: Build de producción servido por Nginx
- App Móvil: APK de staging instalado en dispositivos de prueba
- Configuración: Idéntica a producción
- Certificado SSL: Autofirmado o Let's Encrypt
Acceso:

- Equipo de desarrollo
- QA/Testers
- Stakeholder (para validación final)
Propósito:

- Validación final antes de producción
- Ejecución de tests E2E automáticos
- Pruebas de usuario (UAT)

#### 15.1.3 Producción (Prod)

Ubicación: Portátil Windows (Fase 1)

Características:

- Base de datos: PostgreSQL 15.x
- Backend: Node.js con PM2 (auto-restart)
- Frontend Web: Build de producción servido por Nginx
- App Móvil: APK firmado distribuido a prestamistas
- Backups: Automáticos cada 6 horas a disco externo
- Certificado SSL: Recomendado (Let's Encrypt o comercial)
- Logs: Winston con rotación diaria
Acceso:

- Admin (panel web)
- Prestamistas (app móvil)
- Desarrollador (SSH para mantenimiento)
Propósito:

- Operación real del negocio
- Datos reales de clientes y transacciones financieras

### 15.2 Proceso de Deployment

#### 15.2.1 Deployment de Backend (Servidor)

Precondición: Tests pasan en CI/CD

Pasos:

1. Build de Producción:
1. npm run build
1. # TypeScript se compila a JavaScript en /dist
1. Conexión al Servidor:
1. ssh usuario@servidor-produccion
1. Pull de Código:
1. cd /var/www/sistema-cobros-backend
1. git pull origin main
1. Instalación de Dependencias:
1. npm ci --production
1. # Instala solo dependencies (no devDependencies)
1. Ejecución de Migraciones:
1. npx prisma migrate deploy
1. # Aplica migraciones pendientes en BD
1. Reinicio de Servicio:
1. pm2 restart api
1. # Reinicia proceso de Node.js sin downtime
1. Verificación:
1. curl https://servidor/api/health
1. # Debe retornar: {"status": "ok", "timestamp": "..."}
1. Monitoreo de Logs:
1. pm2 logs api --lines 100
1. # Verifica que no haya errores
Duración estimada: 5-10 minutos

#### 15.2.2 Deployment de Frontend Web (Panel Admin)

Precondición: Tests pasan, build exitoso

Pasos:

1. Build de Producción:
1. npm run build
1. # Genera /dist con archivos estáticos optimizados
1. Conexión al Servidor:
1. ssh usuario@servidor-produccion
1. Subir Build:
1. scp -r dist/* usuario@servidor:/var/www/sistema-cobros-frontend/
1. Configuración de Nginx:
1. server {
1. listen 80;
1. server_name admin.ejemplo.com;

1. root /var/www/sistema-cobros-frontend;
1. index index.html;

1. location / {
1. try_files $uri $uri/ /index.html;
1. }

1. location /api {
1. proxy_pass http://localhost:3000;
1. }
1. }
1. Reinicio de Nginx:
1. sudo nginx -t  # Verifica sintaxis
1. sudo systemctl reload nginx
1. Verificación:
  - Abrir navegador: https://admin.ejemplo.com
  - Verificar login funciona
Duración estimada: 5 minutos

#### 15.2.3 Deployment de App Móvil

Precondición: Tests E2E pasan, versión incrementada

Pasos:

1. Incrementar Versión:
1. # pubspec.yaml
1. version: 1.2.0+3
1. # 1.2.0 = versión semántica
1. # 3 = build number
1. Build de APK de Producción:
1. flutter build apk --release
1. # Genera: build/app/outputs/flutter-apk/app-release.apk
1. Firmar APK (si no está configurado auto-firma):
1. jarsigner -verbose -sigalg SHA256withRSA \
1. -digestalg SHA-256 \
1. -keystore ~/upload-keystore.jks \
1. app-release.apk upload
1. Subir APK a Repositorio Interno:
1. scp app-release.apk usuario@servidor:/var/www/downloads/app-v1.2.0.apk
1. Generar Link de Descarga:
1. https://servidor/downloads/app-v1.2.0.apk
1. Notificar a Prestamistas:
  - Admin envía mensaje por WhatsApp a grupo de prestamistas:
1. 📱 Nueva versión de la app disponible: v1.2.0

1. Mejoras:
1. - [Feature 1]
1. - [Feature 2]

1. Descarga: https://servidor/downloads/app-v1.2.0.apk

1. ⚠️ IMPORTANTE: Debes actualizar antes de continuar usando la app.
1. Actualización OBLIGATORIA:
  - Backend actualiza version_minima_requerida = 1.2.0
  - App verifica versión en cada inicio:
  - if (versionActual < versionMinimaRequerida) {  mostrarDialogoBloqueo(    "Nueva versión disponible",    "Debes actualizar para continuar",    urlDescarga  );  bloquearUI();}
1. Prestamistas Instalan:
  - Descargan APK
  - Android solicita permisos para instalar de fuentes desconocidas
  - Instalan sobre versión anterior (datos locales se preservan)
Duración estimada: 30 minutos (build + distribución + instalaciones)

### 15.3 Estrategia de Rollback

Escenario: Deployment de backend presenta errores críticos en producción

Pasos de Rollback:

1. Identificar Versión Anterior:
1. git log --oneline
1. # Identificar commit anterior estable
1. Revertir Código:
1. git revert <commit-hash>
1. # O git reset --hard <commit-anterior> (si no se ha hecho push)
1. Revertir Migraciones de BD (si es necesario):
1. npx prisma migrate rollback
1. # Solo si migración causó el problema
1. Reinstalar Dependencias:
1. npm ci --production
1. Reiniciar Servicio:
1. pm2 restart api
1. Verificar Funcionamiento:
1. curl https://servidor/api/health
1. pm2 logs api
1. Notificar a Usuarios:
  - Si hubo downtime: Notificar a admin y prestamistas
  - Explicar que se revirtió a versión anterior estable
Tiempo estimado de rollback: 10-15 minutos

Escenario: App móvil presenta bug crítico

Pasos:

1. Identificar Versión Anterior Estable:
  - Ej: v1.1.0 (anterior a v1.2.0 problemática)
1. Actualizar Backend:
1. UPDATE configuracion
1. SET version_minima_requerida = '1.1.0'
1. WHERE clave = 'app_version_minima';
1. Redistribuir APK Anterior:
  - Mantener APK v1.1.0 disponible en servidor
  - Notificar a prestamistas que desinstalen v1.2.0 e instalen v1.1.0
1. Análisis del Bug:
  - Identificar y corregir problema en v1.2.0
  - Generar v1.2.1 con corrección
  - Repetir proceso de deployment

### 15.4 Backups Automáticos

Frecuencia: Cada 6 horas

Implementación:

Cron Job:

# Editar crontab

crontab -e

# Agregar línea:

0 */6 * * * /home/usuario/scripts/backup-postgres.sh

Script de Backup:

#!/bin/bash

# backup-postgres.sh

```text
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/mnt/disco-externo/backups"
DB_NAME="sistema_cobros"

```

# Crear backup

pg_dump $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Comprimir

gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Eliminar backups mayores a 30 días

find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completado: backup_$TIMESTAMP.sql.gz"

Verificación Manual (Semanal):

- Admin verifica que backups se están generando
- Admin prueba restauración de un backup aleatorio
Restauración desde Backup:

# Descomprimir

gunzip backup_20260210_120000.sql.gz

# Restaurar

psql sistema_cobros < backup_20260210_120000.sql

### 15.5 Criterios de Aceptación

|  |
|---|
| CA-DEP-001: Deployment de backend completa en <10 minutos |
| CA-DEP-002: Migraciones de BD ejecutadas sin errores |
| CA-DEP-003: Backend reinicia sin downtime (usando PM2) |
| CA-DEP-004: Frontend web actualizado y servido por Nginx |
| CA-DEP-005: APK firmado y distribuido a prestamistas |
| CA-DEP-006: App verifica versión mínima al iniciar |
| CA-DEP-007: App bloquea UI si versión < mínima requerida |
| CA-DEP-008: Backups automáticos se ejecutan cada 6 horas |
| CA-DEP-009: Backups comprimidos y almacenados en disco externo |
| CA-DEP-010: Rollback de backend completa en <15 minutos |

---

## 16. MONITOREO Y OPERACIÓN

### 16.1 Métricas Críticas a Monitorear

#### 16.1.1 Servidor (Backend)

Uptime del Servicio:

- Target: ≥99% uptime
- Monitoreo: PM2 reporta uptime
- Alerta: Email a admin si servicio cae
Uso de Recursos:

- CPU: Alerta si >80% sostenido por >5 minutos
- RAM: Alerta si >85%
- Disco: Alerta si <20% espacio libre
Tasa de Requests:

- Requests por minuto (promedio)
- Requests fallidos (5xx) por hora
Tasa de Errores:

- Errores 5xx por hora: Alerta si >10
- Errores 4xx por hora: Monitorear tendencias

#### 16.1.2 Sincronización

Sincronizaciones Fallidas:

- Número de sincronizaciones fallidas en últimas 24h
- Alerta: Si >50 fallos acumulados
Cobradores Offline:

- Cantidad de cobradores sin sincronizar >6h
- Alerta: Si >3 cobradores
Cobradores Críticos:

- Cantidad de cobradores sin sincronizar >12h
- Alerta: Email inmediato a admin
Conflictos Pendientes:

- Número de conflictos sin resolver
- Alerta: Si >10 conflictos acumulados
Registros Pendientes de Reintento:

- Registros en estado PENDIENTE_REINTENTO
- Alerta: Si >100 registros

#### 16.1.3 Caja

Saldo Caja Global:

- Valor actual
- Tendencia (gráfico últimos 7 días)
- Alerta: Si saldo <$500,000 (configurable)
Suma de Cajas Menores:

- Total de efectivo en manos de prestamistas
- Verificación: Caja Global + Suma Cajas Menores = Total sistema
Asignaciones Pendientes:

- Cantidad con estado PENDIENTE >48h
- Alerta: Notificación a admin
Retornos Pendientes:

- Cantidad con estado PENDIENTE >48h
- Alerta: Notificación a admin

#### 16.1.4 App Móvil

Crash Logs:

- Cantidad de crashes reportados
- Stack traces capturados
- Alerta: Si >5 crashes del mismo tipo en 24h
Tiempo de Sincronización:

- Promedio de duración de sincronización
- Alerta: Si promedio >30 segundos
Tamaño de Sincronización:

- Promedio de registros por sincronización
- Identificar prestamistas con sincronizaciones muy grandes (>1000 registros)

### 16.2 Alertas Automáticas

#### 16.2.1 Email al Admin

Trigger: Eventos críticos que requieren acción inmediata

Eventos que generan email:

- Servidor caído (uptime <95%)
- Backup falló
- Disco con <20% espacio
- 5 cobradores con >12h sin sincronizar
- 10 conflictos pendientes de resolver
- Error crítico no manejado (500 Internal Server Error acumulado)
Formato del email:

Asunto: [ALERTA] Sistema de Cobros - Servidor caído

Timestamp: 2026-02-10 14:35:00

Severidad: CRÍTICA

Descripción:

El servicio backend no responde desde hace 5 minutos.

Acción requerida:

1. Verificar estado del servidor

2. Revisar logs: pm2 logs api

3. Reiniciar servicio si es necesario

Dashboard: https://servidor/admin/monitoreo

#### 16.2.2 Push Notification al Admin (Opcional)

Trigger: Eventos de prioridad media-alta

Eventos:

- Conflicto de pago duplicado detectado
- Prestamista intenta operación sospechosa (ej: 50 créditos en 1 hora)
- Nueva solicitud de revalorización pendiente
Implementación:

- Firebase Cloud Messaging (FCM) para enviar push a app del admin (si se implementa)
- Alternativa Fase 1: Solo emails

### 16.3 Dashboard de Monitoreo

Ubicación: Panel web admin → Sección "Monitoreo"

Widgets:

1. Estado del Servidor:
  - Uptime actual
  - CPU, RAM, Disco
  - Última actualización: tiempo real
1. Estado de Sincronización:
  - Tabla de cobradores:
    - Nombre
    - Última sync (timestamp)
    - Estado (🟢 Online / 🟠 >6h / 🔴 >12h)
    - Registros pendientes
    - Conflictos pendientes
1. Caja:
  - Saldo Caja Global: $4,500,000
  - Suma Cajas Menores: $2,300,000
  - Total sistema: $6,800,000
  - Asignaciones pendientes: 2
  - Retornos pendientes: 1
1. Conflictos:
  - Tabla de conflictos pendientes:
    - Tipo (Pago duplicado, Actualización concurrente)
    - Cliente
    - Cobradores involucrados
    - Fecha detección
    - Acción (Botón "Resolver")
1. Actividad Reciente:
  - Últimos 10 eventos:
    - "Carlos Lopez registró pago de $60,000 - Hace 5 min"
    - "Andrea Gomez sincronizó 15 registros - Hace 10 min"
    - "Admin aprobó revalorización de $1,200,000 - Hace 20 min"

### 16.4 Logs Estructurados

Implementación con Winston:

const winston = require('winston');

const logger = winston.createLogger({

level: 'info',

format: winston.format.combine(

```text
    winston.format.timestamp(),
    winston.format.json()
```

),

transports: [

```text
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
```

]

});

// Uso

logger.info('Pago registrado', {

credito_id: 'uuid-123',

monto: 60000,

cobrador_id: 'uuid-cobrador',

metodo: 'EFECTIVO'

});

logger.error('Error al sincronizar', {

cobrador_id: 'uuid-cobrador',

error: error.message,

stack: error.stack

});

Rotación de Logs:

new winston.transports.DailyRotateFile({

filename: 'logs/application-%DATE%.log',

datePattern: 'YYYY-MM-DD',

maxSize: '20m',

maxFiles: '30d'

});

### 16.5 Criterios de Aceptación

|  |
|---|
| CA-MON-001: Dashboard muestra estado de servidor en tiempo real |
| CA-MON-002: Email enviado a admin si servidor cae |
| CA-MON-003: Email enviado si backup falla |
| CA-MON-004: Dashboard lista cobradores con última sincronización |
| CA-MON-005: Alerta si cobrador >12h sin sincronizar |
| CA-MON-006: Admin puede ver conflictos pendientes en dashboard |
| CA-MON-007: Admin puede resolver conflictos desde panel web |
| CA-MON-008: Logs estructurados con rotación diaria |
| CA-MON-009: Logs conservados por 30 días |

---

## 17. SUPUESTOS TÉCNICOS

Los siguientes puntos representan decisiones técnicas implícitas que el equipo de desarrollo implementará siguiendo mejores prácticas de ingeniería. No requieren confirmación adicional del stakeholder.

ST-001: Validación de Token en Modo Offline

La app NO valida expiración de token JWT mientras opera sin conexión. La validación de estado del token (expiración, bloqueo remoto) ocurre exclusivamente durante la sincronización. Esto permite operación continua offline durante las 6 horas máximas recomendadas, coherente con arquitectura offline-first.

Implicación: Si el token expira mientras el usuario está offline >24h, en la próxima sincronización recibirá error 401 y deberá hacer login nuevamente. Los datos locales NO se pierden (permanecen en SQLite).

ST-002: Pagos Parciales de Cuotas

El sistema acepta pagos de monto menor a la cuota programada. El pago actualiza el saldo pendiente total del crédito, pero la cuota individual NO se marca como pagada hasta completar el monto. La mora continúa calculándose sobre cuotas no pagadas completas.

Ejemplo: Cuota de $120,000 → Cliente paga $80,000 → Saldo reduce, cuota sigue pendiente → Próximo pago de $40,000+ marca cuota como pagada.

ST-003: Múltiples Sesiones por Usuario

Un cobrador puede mantener sesiones activas simultáneas en múltiples dispositivos. Cada sesión se trackea independientemente en sesiones_activas con device_id único. El bloqueo remoto invalida TODAS las sesiones del usuario.

Implicación: Cobrador puede usar app en 2 teléfonos simultáneamente (no recomendado operativamente, pero técnicamente posible).

ST-004: Campos Editables por Prestamista en Clientes

Cuando un prestamista edita un cliente asignado, puede modificar: teléfono, dirección, notas operativas. NO puede modificar: nombre completo, cédula (datos de identidad). Esta restricción se implementa a nivel de permisos en backend.

ST-005: Validación de Eliminación de Clientes

El sistema NO permite eliminar (soft delete) un cliente que tenga créditos en estado ACTIVO o MORA. Solo se permite eliminación lógica si todos los créditos están PAGADO o REVALORIZADO. Validación implementada en endpoint de eliminación.

ST-006: Renovación Automática de Token Durante Sincronización

Si el access token tiene menos de 2 horas de vigencia restante, la sincronización exitosa genera automáticamente un nuevo access token y lo retorna al cliente, evitando expiración durante operación normal.

ST-007: Diseño Físico de Base de Datos

Las estructuras físicas de tablas (tipos exactos VARCHAR(N), DECIMAL(X,Y), constraints específicos, índices) serán definidas por el equipo de desarrollo basándose en el modelo conceptual y reglas de negocio documentadas en el PRD.

Decisión del equipo:

- UUIDs: VARCHAR(36) o tipo UUID nativo de PostgreSQL
- Nombres: VARCHAR(200)
- Teléfonos: VARCHAR(20)
- Montos: DECIMAL(12,2)
- Índices: En foreign keys + campos de búsqueda frecuente

ST-008: Mapeo de Tipos SQLite-PostgreSQL

La app móvil usa SQLite local y el servidor PostgreSQL. El equipo implementará el mapeo compatible de tipos de datos entre ambos motores.

Mapeo estándar:

- UUID → TEXT en SQLite, UUID en PostgreSQL
- DECIMAL → REAL en SQLite, DECIMAL en PostgreSQL
- TIMESTAMP → TEXT (ISO 8601) en SQLite, TIMESTAMP en PostgreSQL

ST-009: Generación de UUIDs Offline

Los identificadores únicos para registros creados sin conexión se generarán usando librería estándar de UUID v4, garantizando unicidad global sin colisión.

Librería: uuid package en Dart (app móvil), uuid package en Node.js (backend)

ST-010: Encriptación de Datos Sensibles

Tokens JWT y credenciales se almacenarán en secure storage encriptado (Android Keystore para app móvil), siguiendo mejores prácticas de seguridad móvil.

ST-011: Validación Atómica de Saldos

Todas las operaciones de caja (asignación, retorno, desembolso) incluirán validación de saldo disponible dentro de transacción de base de datos para evitar sobregiros.

Implementación:

BEGIN TRANSACTION;

SELECT saldo FROM caja_global FOR UPDATE;

-- Validar saldo >= monto

UPDATE caja_global SET saldo = saldo - monto;

COMMIT;

ST-012: Reversión de Transacciones Pendientes

Si una confirmación de asignación o retorno no se completa (prestamista no confirma), el admin tiene capacidad de revertir la operación manualmente desde el panel web.

ST-013: Paginación en Interfaces de Usuario

Los listados con potencial de crecimiento grande (clientes, créditos, pagos) implementarán paginación o scroll infinito según mejores prácticas de UX móvil y web.

ST-014: Formato de Visualización de Moneda

Todos los montos monetarios se mostrarán en formato pesos colombianos con separador de miles y sin decimales.

Formato: $1.200.000 (no $1,200,000.00)

ST-015: Manejo de Zona Horaria

Todas las operaciones con fechas y timestamps se procesarán y almacenarán en zona horaria de Colombia (UTC-5), con conversión consistente en cliente y servidor.

ST-016: Nombres de Campos en Tablas

Los nombres de columnas en base de datos seguirán convención snake_case (ej: cobrador_asignado_id, fecha_creacion) para consistencia con PostgreSQL.

ST-017: Soft Deletes para Auditoría

Registros críticos (clientes, créditos, pagos) implementarán borrado lógico con campo deleted_at en lugar de eliminación física, preservando auditoría completa.

ST-018: Ordenamiento de Cuotas

Las cuotas se numeran secuencialmente desde 1 hasta N. El sistema NO obliga pago secuencial estricto (ej: se puede pagar cuota 5 antes que cuota 4), pero SÍ es la recomendación operativa.

ST-019: Cálculo de Estado MORA

Un crédito cambia a estado MORA automáticamente cuando al menos UNA cuota tiene fecha vencida sin pagar completa. El cálculo se ejecuta:

- Al registrar pago (verifica si aún hay cuotas en mora)
- En job nocturno (actualiza todos los créditos activos)

ST-020: Manejo de Fechas en Sincronización

Las fechas se serializan en formato ISO 8601 con timezone explícito para sincronización.

Ejemplo: 2026-02-10T14:30:00-05:00

---

## 18. RIESGOS ACEPTADOS

Los siguientes riesgos han sido identificados y son aceptados conscientemente como parte de las decisiones de arquitectura, infraestructura y operación definidas.

RA-001: Servidor Local como Punto Único de Fallo

Descripción: El servidor en portátil Windows es single point of failure. Si el hardware falla (disco duro, motherboard, etc.), el sistema queda inoperativo hasta restauración desde backup.

Probabilidad: Media

Impacto: Alto

Mitigación:

- Backups automáticos cada 6 horas en disco externo
- Restauración estimada en 2-4 horas
- Plan de migración a nube documentado para Fase 2
Aceptación: Riesgo aceptado para Fase 1 por limitaciones presupuestarias.

RA-002: WhatsApp Librería No Oficial

Descripción: El uso de whatsapp-web.js viola términos de servicio de WhatsApp. Existe riesgo real de baneo de cuenta de WhatsApp Business.

Probabilidad: Media-Baja

Impacto: Medio

Mitigación:

- Plan B: Envío manual de mensajes si cuenta es bloqueada
- Considerar migración a API oficial en Fase 2 (costo ~$50-100/mes)
Aceptación: Stakeholder acepta conscientemente el riesgo para reducir costos en Fase 1.

RA-003: Sincronización de Volúmenes Muy Grandes

Descripción: Aunque se procesan lotes de 500 registros, si un cobrador acumula 10,000+ registros (ej: 3 semanas offline), la sincronización completa tomará tiempo considerable y puede fallar por timeout acumulado.

Probabilidad: Baja

Impacto: Medio

Mitigación:

- Límite operativo de 6h offline (con alerta)
- Dashboard admin detecta cobradores con >12h offline
- Sincronización manual asistida si es necesario
Aceptación: Riesgo aceptado, confiando en que límite de 6h es suficiente.

RA-004: Last-Write-Wins Puede Perder Cambios

Descripción: Si dos cobradores actualizan teléfono/dirección del mismo cliente simultáneamente offline, el primero en sincronizar perderá su cambio (sobrescrito por el segundo).

Probabilidad: Baja

Impacto: Bajo

Mitigación:

- Clientes asignados individualmente (reduce probabilidad)
- Datos no críticos (teléfono/dirección recuperables)
Aceptación: Riesgo aceptado por baja probabilidad y bajo impacto.

RA-005: Acumulación Sin Límite en Caja Menor

Descripción: Prestamista puede acumular cantidades grandes (ej: $5M+) en caja menor sin restricción del sistema. Riesgo de pérdida por robo/extravío.

Probabilidad: Media

Impacto: Alto

Mitigación:

- Responsabilidad del prestamista
- Admin puede monitorear saldos de Cajas Menores en dashboard
- Política operativa de retorno regular (no técnica)
Aceptación: Riesgo aceptado, confiando en responsabilidad de prestamistas.

RA-006: Timeout de 15s Puede Ser Insuficiente

Descripción: En conexiones móviles muy lentas, procesar lote de 500 registros con validaciones puede exceder 15 segundos.

Probabilidad: Baja

Impacto: Medio

Mitigación:

- Reintentos automáticos con backoff
- Reducción de tamaño de lote si persiste (decisión del equipo)
Aceptación: Riesgo aceptado como caso edge poco frecuente.

RA-007: Actualización Obligatoria Sin Periodo de Gracia

Descripción: Cuando se lanza nueva versión, cobradores quedan inmediatamente bloqueados hasta actualizar. Riesgo de fricción operativa si lanzan versión durante horario de cobro.

Probabilidad: Media

Impacto: Medio

Mitigación:

- Deployments programados fuera de horario de cobro (ej: domingos)
- Notificación previa a cobradores (día anterior)
Aceptación: Riesgo aceptado por necesidad crítica de mantener compatibilidad de esquema de sincronización.

RA-008: Dependencia de Acción Manual para Backups

Descripción: Backups automáticos dependen de que admin mantenga disco externo conectado. Riesgo de backup fallido si admin desconecta disco.

Probabilidad: Media

Impacto: Alto

Mitigación:

- Alerta por email si backup falla
- Verificación semanal manual por admin
- Instrucciones operativas claras
Aceptación: Riesgo aceptado con protocolo de verificación semanal.

RA-009: Festivos Pre-Generados Hasta 2030

Descripción: Script genera festivos solo hasta 2030. Si el sistema opera en 2031+, requiere nueva ejecución manual del script.

Probabilidad: Baja (sistema probablemente migrado a Fase 2 antes de 2031)

Impacto: Medio

Mitigación:

- Cron anual (cada 1 de enero) que previene este escenario
- Alerta manual en diciembre 2030
Aceptación: Riesgo aceptado por baja probabilidad.

RA-010: Rendimiento No Validado con Volúmenes Grandes

Descripción: El sistema está diseñado para 10 cobradores y 500 clientes (Fase 1). Rendimiento con 50+ cobradores o 5,000+ clientes no está validado.

Probabilidad: Media (si negocio crece rápido)

Impacto: Alto

Mitigación:

- Plan de migración a nube documentado en supuestos para Fase 2
- Monitoreo de rendimiento con alertas
- Optimización de queries e índices si es necesario
Aceptación: Riesgo aceptado con plan de escalabilidad definido.

RA-011: Token Expirado Durante Período Offline Extendido

Descripción: Si un cobrador permanece offline más de 24 horas (excediendo límite recomendado de 6h), su access token expirará. Al intentar sincronizar, recibirá error 401 y deberá hacer login nuevamente.

Probabilidad: Baja

Impacto: Bajo

Mitigación:

- Alerta en app al superar 6h offline
- Datos locales NO se pierden (permanecen en SQLite)
- Re-login toma <30 segundos
Aceptación: Riesgo aceptado, coherente con arquitectura offline-first.

RA-012: Conflictos de Sincronización Requieren Intervención Manual

Descripción: Algunos conflictos (ej: pago duplicado) requieren decisión manual del admin. Si admin no está disponible, quedan pendientes.

Probabilidad: Media

Impacto: Bajo-Medio

Mitigación:

- Notificaciones por email a admin
- Dashboard muestra conflictos pendientes
- Mayoría de conflictos son automáticos (last-write-wins)
Aceptación: Riesgo aceptado, necesario para datos financieros críticos.

---

## 19. PLAN DE IMPLEMENTACIÓN

### 19.1 Metodología

Enfoque: Scrum con sprints de 2 semanas

Equipo:

- 1 Backend Developer (Node.js, PostgreSQL)
- 1 Frontend Developer (React para web, Flutter para móvil)
- 1 QA/Tester (part-time)
- 1 Product Owner (stakeholder)
Ceremonias:

- Sprint Planning: Inicio de cada sprint (2h)
- Daily Standup: Diario (15 min)
- Sprint Review: Fin de cada sprint con stakeholder (1h)
- Sprint Retrospective: Fin de cada sprint (1h)

### 19.2 Sprints Detallados

Sprint 1 (2 semanas): Autenticación y Usuarios

Objetivos:

- Sistema de autenticación funcional
- CRUD de usuarios
Tareas Backend:

- Setup proyecto Node.js + Express + TypeScript
- Setup PostgreSQL + Prisma ORM
- Migración inicial: tabla usuarios
- Endpoint POST /api/auth/login con JWT
- Endpoint POST /api/auth/refresh
- Middleware de autenticación
- CRUD /api/usuarios con validación de permisos
Tareas Frontend Web:

- Setup proyecto React + TypeScript + Vite
- Página de login con validación
- Layout principal con navbar
- Página de listado de usuarios
- Página de creación/edición de usuarios
Tareas App Móvil:

- Setup proyecto Flutter
- Pantalla de login
- Almacenamiento de token en secure storage
- Scaffold de navegación principal
Tests:

- Unit: Validación de login, generación de JWT
- Integration: Endpoints de auth y usuarios
- E2E: Flujo de login en web y app
Entregable:

- Admin puede hacer login en web
- Admin puede crear usuarios (Admin y Prestamista)
- Prestamista puede hacer login en app

Sprint 2 (2 semanas): Gestión de Clientes

Objetivos:

- CRUD completo de clientes
- Sincronización básica de clientes
Tareas Backend:

- Migración: tabla clientes
- CRUD /api/clientes con filtros por cobrador
- Validaciones: nombre completo (2 palabras, MAYÚSCULAS)
- Endpoint /api/sync/push/clientes
- Endpoint /api/sync/pull/clientes
Tareas Frontend Web:

- Página de listado de clientes (paginado)
- Búsqueda por nombre/cédula
- Formulario de creación/edición de clientes
- Validaciones en tiempo real
Tareas App Móvil:

- Setup SQLite local con Drift
- Pantalla de listado de clientes
- Formulario de creación/edición
- Guardado en SQLite local
- Lógica de sincronización básica (clientes)
Tests:

- Unit: Validaciones de nombre completo
- Integration: CRUD de clientes, sync básica
- E2E: Crear cliente en app offline → Sincronizar → Verificar en servidor
Entregable:

- Admin puede gestionar clientes desde web
- Prestamista puede crear clientes en app offline
- Sincronización de clientes funcional

Sprint 3 (2 semanas): Créditos Básicos

Objetivos:

- Creación de créditos con cálculo de cuotas
- Validación de límite (2 créditos activos)
Tareas Backend:

- Migración: tabla creditos
- Endpoint POST /api/creditos con validaciones
- Cálculo automático: interés 20%, cuotas iguales
- Validación: máximo 2 créditos activos por cliente
- Endpoint GET /api/creditos con filtros
Tareas Frontend Web:

- Página de listado de créditos (con estados)
- Formulario de creación de crédito
- Calculadora de cuotas (preview)
- Vista de detalle de crédito
Tareas App Móvil:

- Tabla creditos en SQLite local
- Pantalla de solicitud de crédito (estado PENDIENTE_APROBACION)
- Vista de detalle de crédito
- Sync de créditos
Tests:

- Unit: Cálculo de interés y cuotas
- Integration: Validación de límite de 2 créditos
- E2E: Admin crea crédito → Verifica cálculos
Entregable:

- Admin puede crear créditos desde web
- Sistema valida límite de 2 créditos activos
- Prestamista puede solicitar créditos desde app

Sprint 4 (2 semanas): Sistema de Caja

Objetivos:

- Caja Global y Cajas Menores funcionales
- Flujo de asignación con confirmación
Tareas Backend:

- Migraciones: caja_global, caja_menor_cobradores, caja_global_movimientos, asignaciones_caja
- Endpoint POST /api/caja/asignaciones (admin autoriza)
- Endpoint PUT /api/caja/asignaciones/:id/confirmar (prestamista confirma)
- Validación de saldo antes de asignar
- Actualización atómica de saldos con transacciones
Tareas Frontend Web:

- Dashboard de caja (Caja Global, Suma Cajas Menores)
- Formulario de asignación de caja
- Listado de asignaciones pendientes
- Visualización de historial de movimientos
Tareas App Móvil:

- Pantalla "Mi Caja" con saldo actual
- Listado de asignaciones pendientes
- Botón "Confirmar Recepción"
- Sync de asignaciones
Tests:

- Unit: Validación de saldo suficiente
- Integration: Flujo completo de asignación con confirmación
- E2E: Admin asigna → Prestamista confirma → Verificar saldos
Entregable:

- Admin puede asignar dinero a prestamistas
- Prestamista puede confirmar recepción
- Saldos de caja auditables y consistentes

Sprint 5 (2 semanas): Pagos y Mora

Objetivos:

- Registro de pagos (efectivo y transferencia)
- Cálculo de mora con festivos
Tareas Backend:

- Migración: tabla pagos, festivos_colombia
- Endpoint POST /api/pagos con validaciones
- Script generador de festivos (algoritmo de Meeus)
- Función calcularDiasMora() con exclusión de domingos/festivos
- Actualización de saldo de crédito al registrar pago
- Diferenciación: efectivo vs transferencia (caja menor vs global)
Tareas Frontend Web:

- Formulario de registro de pago manual
- Vista de historial de pagos por crédito
- Carga manual de festivos (botón ejecutar script)
Tareas App Móvil:

- Formulario de registro de pago
- Cálculo de mora en cliente (consulta festivos en SQLite)
- Guardado en SQLite con sync pendiente
- Sync de pagos (orden después de clientes y créditos)
Tests:

- Unit: Cálculo de mora con casos edge (domingos, festivos)
- Integration: Pago efectivo incrementa caja menor, transferencia incrementa global
- E2E: Registrar pago con mora → Verificar cálculo correcto
Entregable:

- Prestamista puede registrar pagos offline
- Mora se calcula automáticamente excluyendo festivos
- Festivos colombianos precargados 2024-2030

Sprint 6 (2 semanas): Sistema de Rutas

Objetivos:

- CRUD de rutas
- Asignación de cobradores y clientes a rutas
Tareas Backend:

- Migraciones: rutas, rutas_cobradores, rutas_clientes
- CRUD /api/rutas
- Endpoint POST /api/rutas/:id/cobradores (asignar cobrador)
- Endpoint POST /api/rutas/:id/clientes (asignar cliente con cobrador_asignado_id)
- Validación: un crédito en una sola ruta
- Endpoint GET /api/rutas/mis-clientes (filtrado por cobrador_asignado_id)
Tareas Frontend Web:

- Página de listado de rutas
- Formulario de creación de ruta
- Vista de detalle de ruta con cobradores asignados
- Formulario de asignación de cliente a ruta (select cobrador)
Tareas App Móvil:

- Pantalla "Mis Rutas" (lista de rutas del prestamista)
- Detalle de ruta con clientes asignados al prestamista
- Filtro por mora, orden de visita
- Sync de rutas y asignaciones
Tests:

- Unit: Validación de crédito único en ruta
- Integration: Asignación de cliente con cobrador específico
- E2E: Crear ruta → Asignar cobrador → Asignar cliente → Verificar visibilidad en app
Entregable:

- Admin puede crear rutas y asignar cobradores
- Admin puede asignar clientes a cobradores específicos
- Prestamista ve solo sus clientes asignados

Sprint 7 (3 semanas): Sincronización Offline Completa

Objetivos:

- Sincronización bidireccional robusta
- Detección y resolución de conflictos
Tareas Backend:

- Migración: tabla sync_log
- Refactorización de endpoints /api/sync/push (con lotes de 500)
- Endpoint /api/sync/pull con timestamp
- Detección de conflictos (pago duplicado)
- Resolución automática (first-write-wins, last-write-wins)
- Registro de conflictos en sync_log
Tareas Frontend Web:

- Dashboard de sincronización (cobradores, última sync, estado)
- Página de conflictos pendientes
- Formulario de resolución manual de conflictos
Tareas App Móvil:

- Refactorización de lógica de sync:
  - Timer automático cada 15 minutos
  - Procesamiento por lotes de 500
  - Orden: Clientes → Créditos → Pagos
  - Reintentos con backoff exponencial
- Indicador de estado de sincronización (ícono, contador)
- Manejo de conflictos (mostrar mensaje al usuario)
- Botón "Sincronizar ahora"
Tests:

- Unit: Lógica de lotes, backoff exponencial
- Integration: Sincronización de 1000+ registros en lotes
- E2E: 2 prestamistas registran mismo pago offline → Conflicto detectado
Entregable:

- Sincronización bidireccional completa y robusta
- Conflictos detectados y notificados a admin
- App funciona offline durante jornada completa

Sprint 8 (2 semanas): Revalorización y Renovación

Objetivos:

- Flujo completo de revalorización
- Flujo de renovación
Tareas Backend:

- Migración: tabla historial_revalorizaciones
- Validación de requisitos (40% pagado, 30 días)
- Endpoint POST /api/creditos/:id/revalorizar (solicitud)
- Endpoint PUT /api/creditos/revalorizaciones/:id/aprobar (admin)
- Cálculo de nueva cuota e interés (sobre monto total)
- Cambio de estado de crédito anterior a REVALORIZADO
Tareas Frontend Web:

- Listado de solicitudes de revalorización pendientes
- Vista de detalle con cálculos (dinero a entregar, nuevas cuotas)
- Botón Aprobar/Rechazar
Tareas App Móvil:

- Botón "Solicitar Revalorización" (habilitado si cumple requisitos)
- Formulario de revalorización (nuevo monto, cuotas)
- Preview de cálculos
- Sync de solicitudes
Tests:

- Unit: Validación de requisitos, cálculo de interés sobre monto total
- Integration: Flujo completo de revalorización
- E2E: Prestamista solicita → Admin aprueba → Verificar crédito nuevo
Entregable:

- Prestamista puede solicitar revalorización si cumple requisitos
- Admin puede aprobar/rechazar desde web
- Cálculo de interés sobre nuevo monto total funcional

Sprint 9 (1 semana): Desembolso con Confirmación

Objetivos:

- Flujo híbrido de desembolso
- Integración con sistema de caja
Tareas Backend:

- Refactorización de creación de crédito:
  - Al autorizar desembolso → Descuenta Caja Global → Estado PENDIENTE_DESEMBOLSO
- Endpoint PUT /api/creditos/:id/confirmar-recepcion (prestamista)
  - Incrementa Caja Menor → Estado PENDIENTE_ENTREGA_CLIENTE
- Endpoint PUT /api/creditos/:id/confirmar-entrega (prestamista)
  - Descuenta Caja Menor → Estado ACTIVO
Tareas Frontend Web:

- Al crear crédito, botón "Autorizar Desembolso"
- Verificación de saldo Caja Global antes de autorizar
Tareas App Móvil:

- Notificación de crédito pendiente de desembolso
- Botón "Confirmar Recepción de Dinero"
- Botón "Confirmar Entrega a Cliente"
- Sync de confirmaciones
Tests:

- Integration: Flujo completo de desembolso en 4 pasos
- E2E: Admin autoriza → Prestamista confirma recepción → Entrega cliente → Verificar saldos
Entregable:

- Flujo de desembolso con confirmación bidireccional funcional
- Trazabilidad completa de efectivo en desembolsos

Sprint 10 (2 semanas): Testing, Optimización y Corrección de Bugs

Objetivos:

- Completar tests E2E obligatorios
- Optimizar rendimiento
- Corregir bugs detectados
Tareas:

- Implementar 12 tests E2E obligatorios
- Optimización de queries lentos (añadir índices)
- Revisión de código (code review)
- Corrección de bugs reportados en sprints anteriores
- Testing de carga (simular 10 prestamistas, 500 clientes)
- Documentación de API (Swagger)
Tests:

- Todos los tests E2E deben pasar
- Cobertura ≥80% global, ≥90% módulos críticos
Entregable:

- Sistema completo con tests pasando
- Bugs críticos corregidos
- Rendimiento optimizado

### 19.3 Estimación Total

Sprints: 10

Duración por sprint: 2 semanas (excepto Sprint 7: 3 semanas, Sprint 9: 1 semana)

Duración total: 20 semanas (5 meses)

Hitos:

- Fin Sprint 4: Sistema de caja funcional
- Fin Sprint 7: Sincronización offline completa
- Fin Sprint 10: Sistema completo listo para producción

### 19.4 Estrategia de Deployment Incremental

Sprint 1-3: Deployments en ambiente de desarrollo (solo)

Sprint 4-6: Deployments en staging + pruebas con stakeholder

Sprint 7: Primer deployment en producción (beta con 2 prestamistas)

Sprint 8-9: Deployments continuos en producción con usuarios beta

Sprint 10: Deployment final a todos los prestamistas

---

## 20. CRITERIOS DE ACEPTACIÓN

### 20.1 Criterios Globales de Aceptación

Para dar por terminado el proyecto completo, TODOS los siguientes criterios deben cumplirse:

|  |
|---|
| CA-GLOBAL-001: Todos los 12 tests E2E obligatorios pasan sin errores |
| CA-GLOBAL-002: Cobertura de tests ≥80% en backend y app móvil |
| CA-GLOBAL-003: Cobertura ≥90% en módulos críticos (caja, sync, mora, créditos) |
| CA-GLOBAL-004: Sistema funciona offline durante 6 horas sin conexión |
| CA-GLOBAL-005: Sincronización de 500 registros completa en <15 segundos |
| CA-GLOBAL-006: Saldos de caja auditables y cuadrados (Caja Global + Suma Cajas Menores = Total) |
| CA-GLOBAL-007: Mora calculada correctamente excluyendo domingos y festivos |
| CA-GLOBAL-008: Admin puede bloquear prestamista remotamente |
| CA-GLOBAL-009: Conflictos de pago duplicado detectados automáticamente |
| CA-GLOBAL-010: Backups automáticos ejecutándose cada 6 horas |
| CA-GLOBAL-011: Dashboard de monitoreo muestra estado en tiempo real |
| CA-GLOBAL-012: Documentación de API completa (Swagger) |
| CA-GLOBAL-013: Manual de usuario para admin y prestamistas |
| CA-GLOBAL-014: Plan de deployment documentado y probado |
| CA-GLOBAL-015: Stakeholder valida y aprueba sistema en staging |

### 20.2 Criterios por Módulo

Autenticación y Usuarios

|  |
|---|
| CA-AUTH-001: Login funcional en web y app |
| CA-AUTH-002: Token expira en 24 horas |
| CA-AUTH-003: Sesiones bloqueadas rechazan requests |

Clientes

|  |
|---|
| CA-CLI-001: Nombre valida mínimo 2 palabras en MAYÚSCULAS |
| CA-CLI-002: Sistema permite nombres duplicados (diferenciados por teléfono) |

Créditos

|  |
|---|
| CA-CRE-001: Límite de 2 créditos activos validado |
| CA-CRE-002: Interés calculado al 20% fijo |
| CA-CRE-003: Sobrepago reduce cuota final |

Pagos

|  |
|---|
| CA-PAG-001: Solo permite registrar pagos con fecha actual |
| CA-PAG-002: Pago efectivo incrementa Caja Menor |
| CA-PAG-003: Pago transferencia incrementa Caja Global |

Rutas

|  |
|---|
| CA-RUT-001: Cliente puede estar en múltiples rutas con créditos diferentes |
| CA-RUT-002: Prestamista solo ve clientes asignados individualmente |

Caja

|  |
|---|
| CA-CAJ-001: Asignación descuenta Caja Global inmediatamente |
| CA-CAJ-002: Confirmación incrementa Caja Menor |
| CA-CAJ-003: Toda operación registrada en auditoría |

Sincronización

|  |
|---|
| CA-SYN-001: App funciona 100% offline |
| CA-SYN-002: Sincronización cada 15 minutos automática |
| CA-SYN-003: Lotes de máximo 500 registros |

Mora

|  |
|---|
| CA-MOR-001: Domingos no cuentan para mora |
| CA-MOR-002: Festivos no cuentan para mora |

---

## 21. GLOSARIO

Admin / Administrador: Usuario con máximos privilegios que gestiona el sistema desde panel web.

Atomicidad: Propiedad de una transacción de ejecutarse completamente o no ejecutarse en absoluto.

Backoff Exponencial: Estrategia de reintentos donde el tiempo de espera se duplica en cada intento (1s, 2s, 4s, 8s...).

Caja Global: Caja única y centralizada administrada por el admin, origen de asignaciones y destino de retornos.

Caja Menor: Caja operativa individual de cada prestamista para desembolsos y recepción de pagos en efectivo.

Cliente: Persona física que solicita y recibe préstamos.

Conflicto: Situación donde dos usuarios modifican el mismo dato offline, requiriendo resolución al sincronizar.

Crédito: Préstamo otorgado a un cliente con monto, plazo, cuotas e interés.

Cuota: Pago parcial periódico de un crédito.

Desembolso: Entrega de dinero del préstamo al cliente.

Festivo: Día no laborable en Colombia que no cuenta para cálculo de mora.

First-Write-Wins: Estrategia de resolución de conflictos donde gana el primero en sincronizar.

JWT (JSON Web Token): Estándar para tokens de autenticación.

Last-Write-Wins: Estrategia de resolución de conflictos donde gana el último en sincronizar.

Lote Técnico: Conjunto de registros procesados en un solo request HTTP (máximo 500 en este sistema).

Mora: Días de atraso en el pago de una cuota (solo días hábiles).

Offline-First: Arquitectura donde la app funciona primero sin conexión, sincronizando después.

Pago Duplicado: Conflicto donde dos cobradores registran pago de la misma cuota offline.

Prestamista / Cobrador: Usuario de campo que gestiona cartera de clientes, registra pagos y administra caja menor.

Renovación: Crear un nuevo crédito después de que el anterior se pagó completamente.

Revalorización: Incrementar el monto de un crédito activo, entregando dinero adicional al cliente.

Ruta: Agrupación de clientes para organización de cobro en campo.

Sincronización: Proceso de enviar cambios locales al servidor y descargar cambios del servidor a la app.

Sobrepago: Pago mayor al monto de la cuota programada.

Soft Delete: Eliminación lógica (campo deleted_at) en lugar de eliminación física de registros.

SQLite: Base de datos embebida usada en la app móvil para almacenamiento local.

Timeout: Límite de tiempo para esperar respuesta de un request antes de abortarlo.

---

## 22. DECLARACIÓN DE CIERRE

### 22.1 Estado de Completitud del PRD

Este PRD ha sido elaborado con rigor técnico extremo, habiendo cerrado 39 decisiones de negocio previamente identificadas como bloqueantes, resuelto 5 ambigüedades críticas, y documentado exhaustivamente 22 secciones que cubren todos los aspectos necesarios para implementación.

Nivel de detalle alcanzado:

- ✅ Reglas de negocio: 100% definidas sin ambigüedades
- ✅ Flujos operativos: Documentados paso a paso con ejemplos
- ✅ Modelo conceptual de datos: Completo con 16 entidades y relaciones
- ✅ Sistema de rutas: Asignación individual claramente especificada
- ✅ Sistema de caja: Flujos híbridos con confirmación bidireccional documentados
- ✅ Sincronización offline: Estrategia completa con manejo de conflictos
- ✅ Autenticación y permisos: Matriz de permisos y flujos de bloqueo
- ✅ Testing y calidad: 12 tests E2E obligatorios + cobertura no negociable
- ✅ Deployment: Proceso paso a paso para backend, web y móvil
- ✅ Supuestos técnicos: 20 supuestos explícitamente documentados
- ✅ Riesgos aceptados: 12 riesgos identificados y conscientemente aceptados
- ✅ Plan de implementación: 10 sprints detallados con estimación de 20 semanas

### 22.2 Verificación de Ausencia de Ambigüedades

Verificación realizada por: Arquitecto de Software Senior — Auditoría Técnica

Fecha de validación: 10 de febrero de 2026

Resultado: ✅ NO se detectan ambigüedades de negocio u operación que bloqueen el desarrollo

Fundamento:

1. Todas las decisiones críticas identificadas en análisis previo han sido respondidas
1. Contradicciones detectadas (ej: "1 vs 2 cajas", "sin límite vs lotes 500") han sido resueltas
1. Flujos complejos (desembolso, asignación, sincronización) documentados paso a paso
1. Supuestos técnicos explícitamente declarados (no dejados implícitos)
1. Riesgos aceptados conscientemente documentados

### 22.3 Autorización de Inicio de Desarrollo

Con base en:

- Completitud de especificaciones: 100%
- Ambigüedades bloqueantes: 0
- Decisiones pendientes del stakeholder: 0
- Supuestos técnicos: Documentados
- Riesgos: Identificados y aceptados
Se AUTORIZA formalmente el inicio de desarrollo sin requerir:

- ❌ Nuevas sesiones con stakeholder para aclaraciones
- ❌ Decisiones adicionales de negocio
- ❌ Validaciones de flujos principales
- ❌ Definiciones operativas pendientes

### 22.4 Próximos Pasos Inmediatos

El equipo de desarrollo puede proceder INMEDIATAMENTE a:

1. Inicializar repositorios de código:
  - Backend (Node.js + TypeScript)
  - Frontend Web (React + TypeScript)
  - App Móvil (Flutter + Dart)
1. Setup de ambientes:
  - Desarrollo local en laptops de desarrolladores
  - Staging en servidor de pruebas
  - Configuración de CI/CD (GitHub Actions o GitLab CI)
1. Iniciar Sprint 1:
  - Sprint Planning con Product Owner
  - Asignación de tareas: Autenticación y Usuarios
  - Desarrollo de primeros endpoints y pantallas
1. Elaborar entregables técnicos complementarios (en paralelo al desarrollo):
  - Diagrama Entidad-Relación (ERD) detallado
  - Especificación de API (Swagger/OpenAPI)
  - Wireframes de UI para web y móvil
  - Scripts de seeders para datos de prueba

### 22.5 Próximos Entregables (Fuera del Alcance del PRD)

Los siguientes documentos serán elaborados durante la implementación y NO son bloqueantes para iniciar desarrollo:

Documentación Técnica:

- Diagrama Entidad-Relación detallado con tipos de datos físicos
- Documentación de API con Swagger (autogenerada)
- Diagramas de flujo técnicos (sequence diagrams)
Diseño de Interfaz:

- Wireframes de panel web (Figma)
- Mockups de app móvil (Figma)
- Guía de estilos y componentes UI
Operación:

- Manual de usuario para administradores
- Manual de usuario para prestamistas
- Manual de instalación y configuración
- Guía de troubleshooting

### 22.6 Compromiso de Calidad

El equipo de desarrollo se compromete a:

Estándares de Código:

- Seguir mejores prácticas de TypeScript/Dart
- Code reviews obligatorios antes de merge
- Linting automático en pre-commit hooks
Testing:

- Cobertura mínima 80% global
- Cobertura mínima 90% en módulos críticos
- Tests E2E ejecutados antes de cada deployment
Deployment:

- Zero-downtime deployments usando PM2
- Rollback disponible en <15 minutos
- Backups automáticos cada 6 horas
Comunicación:

- Sprint Review con stakeholder cada 2 semanas
- Demos funcionales de features completados
- Transparencia total en bloqueos y riesgos

### 22.7 Supuesto Explícito de Evolución Futura (Fase 2)

SUP-009: Modelo de Monetización Futuro (Fase 2)

En caso de migración del sistema a infraestructura en la nube y adopción de modelo SaaS multi-tenant, se evaluará la implementación de cobro de suscripción mensual al usuario Admin por uso del sistema.

Este modelo NO forma parte del alcance actual (Fase 1) y requerirá diseño específico de:

- Planes de suscripción (ej: Básico, Profesional, Empresarial)
- Pasarela de pagos (Stripe, MercadoPago, etc.)
- Reglas de bloqueo por no pago
- Cumplimiento legal y facturación electrónica
Este punto queda documentado solo como evolución futura, sin generar dependencias técnicas actuales ni afectar la arquitectura de Fase 1.

### 22.8 Declaración Final

Estado del PRD: ✅ CERRADO Y LISTO PARA DESARROLLO

Nivel de confianza en ejecutabilidad: 95%

Ambigüedades bloqueantes: 0 (cero)

Decisiones pendientes: 0 (cero)

Autorizaciones requeridas antes de iniciar: Ninguna

Con este PRD completo, el equipo de desarrollo está formalmente autorizado para iniciar la implementación del Sistema de Gestión de Cobros de Préstamos sin esperar aclaraciones adicionales, reuniones complementarias, o decisiones pendientes.

El desarrollo puede comenzar el lunes 11 de febrero de 2026 con Sprint 1: Autenticación y Usuarios.

Versión: 1.0 Definitiva

Fecha de Cierre: 10 de febrero de 2026

Aprobado por: Stakeholder / Product Owner

Validado por: Arquitecto de Software Senior

Estado: ✅ CERRADO — DESARROLLO AUTORIZADO

FIN DEL PRD COMPLETO Y DEFINITIVO