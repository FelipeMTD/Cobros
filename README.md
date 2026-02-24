# Sistema de Gestión de Cobros (SaaS Edition)

> **Versión:** 3.0 (Definitiva - Cloud Multi-Tenant)
> **Estado:** ✅ LISTO PARA DESARROLLO
> **Infraestructura:** Render (PaaS)
> **Modelo:** SaaS Multi-Tenant Offline-First

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura Técnica](#2-arquitectura-técnica-stack-render)
3. [Actores y Permisos](#3-actores-y-permisos-jerarquía-saas)
4. [Modelo de Datos](#4-modelo-de-datos-entidades-nuevas-y-modificadas)
5. [Reglas de Negocio Configurables](#5-reglas-de-negocio-configurables-dinámicas)
6. [Módulos Operativos](#6-módulos-operativos-lógica-core)
7. [Sincronización y Conectividad](#7-sincronización-y-conectividad)
8. [Seguridad](#8-seguridad)
9. [Plan de Implementación](#9-plan-de-implementación-20-semanas)

---

## 1. Resumen Ejecutivo

### 1.1 Visión del Producto

Una plataforma **SaaS (Software as a Service)** alojada en la nube que permite a múltiples empresas de microcrédito gestionar sus operaciones de forma independiente y segura. El sistema ofrece un panel administrativo web para los dueños de las empresas y una aplicación móvil **Offline-First** para los cobradores en campo.

### 1.2 Alcance Técnico y de Negocio

* **Modelo:** Multi-Tenant (Múltiples empresas en una misma instancia).
* **Flexibilidad:** Reglas de negocio (intereses, mora, límites) configurables por cada cliente.
* **Infraestructura:** Arquitectura Cloud-Native en **Render** para alta disponibilidad y escalabilidad.
* **Operación:** Sincronización bidireccional robusta con funcionamiento sin conexión.

---

## 2. Arquitectura Técnica (Stack Render)

### 2.1 Estrategia Multi-Tenant

Se implementará un modelo de **Base de Datos Compartida con Aislamiento Lógico** (Shared Database, Shared Schema) para optimizar costos y mantenimiento.

* **Aislamiento:** Todas las tablas críticas tendrán una columna `empresa_id`.
* **Seguridad:** El Backend inyectará el filtro `WHERE empresa_id = X` en todas las consultas automáticamente.

### 2.2 Componentes del Sistema

| Componente              | Tecnología               | Detalles                                                                                           |
| :---------------------- | :------------------------ | :------------------------------------------------------------------------------------------------- |
| **Backend**       | **Node.js v20.x**   | TypeScript + Express + Middleware de aislamiento Multi-tenant. Desplegado como Render Web Service. |
| **Base de Datos** | **PostgreSQL 15.x** | Render Managed DB. Backups automáticos y PITR (Point-in-Time Recovery).                           |
| **Frontend Web**  | **React 18**        | TypeScript + Tailwind. Desplegado como Render Static Site con CDN global.                          |
| **App Móvil**    | **Flutter**         | Android. BD local**SQLite (Drift)** que replica la configuración de la empresa.             |

---

## 3. Actores y Permisos (Jerarquía SaaS)

### 3.1 Super Admin (Dueño del Software)

* **Responsabilidad:** Gestión de suscripciones y tenants.
* **Permisos:** Crear empresas, suspender acceso por falta de pago, ver métricas globales.
* **Restricción:** NO puede ver los datos financieros detallados de los clientes de las empresas (privacidad).

### 3.2 Admin de Empresa (Cliente/Dueño de Agencia)

* **Responsabilidad:** Configuración de SU negocio.
* **Permisos:** Definir tasas de interés, reglas de mora, crear sus cobradores, gestionar su Caja Global.

### 3.3 Prestamista (Usuario Final)

* **Responsabilidad:** Cobro y desembolso en campo.
* **Permisos:** Operar app móvil según las reglas definidas por su Admin de Empresa.

---

## 4. Modelo de Datos (Entidades Nuevas y Modificadas)

### 4.1 Nueva Entidad: `Empresas`

* `id` (UUID): Identificador único del tenant.
* `nombre`: Razón social.
* `estado`: (ACTIVO, SUSPENDIDO, PRUEBA).
* `plan`: (BÁSICO, PRO).
* `configuracion_json`: Almacena las reglas dinámicas (Ver 5.1).

### 4.2 Modificación de Entidades Existentes

Las tablas originales (`clientes`, `creditos`, `pagos`, `caja_global`, `rutas`) ahora incluyen obligatoriamente:

* `empresa_id` (Foreign Key, Indexado).
* *Objetivo:* Asegurar que los datos de la "Empresa A" sean invisibles para la "Empresa B".

---

## 5. Reglas de Negocio Configurables (Dinámicas)

El Admin de Empresa puede ajustar estas variables. El sistema ya no usa valores "hardcoded".

### 5.1 Variables de Configuración

| Variable             | Descripción                           | Valor por Defecto |
| :------------------- | :------------------------------------- | :---------------- |
| `tasa_interes`     | Porcentaje de ganancia sobre préstamo | **20%**     |
| `limite_creditos`  | Máx. créditos activos por cliente    | **2**       |
| `cobrar_mora`      | Activar/Desactivar recargo por mora    | **TRUE**    |
| `excluir_domingos` | Mora no cuenta domingos                | **TRUE**    |
| `excluir_festivos` | Mora no cuenta festivos                | **TRUE**    |

### 5.2 Aplicación en App Móvil (Offline)

1. **Login:** Al autenticarse, la App descarga el objeto `configuracion` de la empresa.
2. **Operación:**
   * Al crear un crédito, la App calcula: `Monto * (1 + config.tasa_interes)`.
   * Al validar un cliente, la App revisa: `if (creditos_activos >= config.limite_creditos) Bloquear`.

---

## 6. Módulos Operativos (Lógica Core)

### 6.1 Gestión de Créditos y Caja

* **Caja Global:** Centralizada **por empresa**. Recibe pagos por transferencia y retornos.
* **Caja Menor:** Individual por cobrador. Recibe pagos en efectivo.
* **Flujo de Aprobación:** Asignaciones y Retornos requieren confirmación bidireccional (Admin Empresa ↔ Cobrador).
* **Revalorización:** Permitida bajo reglas configurables (ej: >40% pagado). Interés calculado sobre el **nuevo monto total**.

### 6.2 Sistema de Rutas

* Permite asignar clientes a cobradores específicos.
* Un cliente puede estar en múltiples rutas (con créditos diferentes).
* **Aislamiento:** Un cobrador solo ve los clientes asignados a él dentro de su empresa.

### 6.3 Cálculo de Mora (Motor Híbrido)

* Algoritmo capaz de excluir domingos y festivos (basado en algoritmo de Meeus para Colombia).
* **Adaptabilidad:** Si la configuración `excluir_festivos` es FALSE, el algoritmo los cuenta como días normales.

---

## 7. Sincronización y Conectividad

### 7.1 Protocolo Offline-First

* La App Móvil es la fuente de verdad temporal.
* Los datos se guardan localmente en SQLite y se sincronizan cuando hay red.
* **Frecuencia:** Automática cada 15 minutos o manual.

### 7.2 Resolución de Conflictos

1. **Pagos Duplicados:** Estrategia *First-Write-Wins*. Si dos cobradores cobran la misma cuota, el segundo pago genera una alerta de CONFLICTO para el Admin de Empresa.
2. **Datos Maestros:** Estrategia *Last-Write-Wins* para actualizaciones de teléfono/dirección.

---

## 8. Seguridad

### 8.1 Autenticación y Sesión

* **JWT Enriquecido:** El token incluye `empresa_id` y `rol`.
* **Expiración:** 24 horas (Access), 30 días (Refresh).
* **Bloqueo:** Si el Super Admin suspende una empresa, el middleware rechaza todos los tokens con ese `empresa_id`.

### 8.2 Infraestructura Segura

* Certificados SSL/TLS gestionados por Render.
* Base de datos sin acceso público (VPC interna).
* Secretos gestionados en Render Environment Variables.

---

## 9. Plan de Implementación (20 Semanas)

### Fase 1: Cimientos SaaS (Sprints 1-3)

- [ ] Setup Render & PostgreSQL.
- [ ] Desarrollo del Backend Multi-tenant (Middleware de aislamiento).
- [ ] Portal Super Admin (Gestión de Empresas).

### Fase 2: Núcleo Operativo (Sprints 4-6)

- [ ] CRUD de Clientes y Créditos (Adaptados a `empresa_id`).
- [ ] Motor de Configuración Dinámica (Backend y App Móvil).
- [ ] Base de datos local SQLite y Sincronización básica.

### Fase 3: Financiero y Caja (Sprints 7-8)

- [ ] Lógica de Caja Global/Menor.
- [ ] Registro de Pagos y Cálculo de Mora configurable.
- [ ] Flujos de Revalorización.

### Fase 4: Estabilización (Sprints 9-10)

- [ ] Manejo de conflictos de sincronización.
- [ ] Tests E2E de aislamiento de datos (asegurar que Empresa A no ve a Empresa B).
- [ ] Despliegue a Producción en Render.

---

## ⚠️ Riesgos y Mitigación

| Riesgo                                   | Impacto  | Mitigación                                                                                           |
| :--------------------------------------- | :------- | :---------------------------------------------------------------------------------------------------- |
| **Fuga de Datos entre Tenants**    | Crítico | Tests automatizados de seguridad y uso estricto de middleware de inyección de ID.                    |
| **Cambio de Reglas "En Caliente"** | Medio    | Las nuevas configuraciones (ej: cambio de interés) solo aplican a créditos nuevos, no retroactivos. |
| **Dependencia de Proveedor**       | Medio    | Uso de tecnologías estándar (Docker, Postgres) facilita migración fuera de Render si es necesario. |

---

> **Aprobado por:** Stakeholder / Product Owner
> **Fecha:** 10 de Febrero de 2026
>
