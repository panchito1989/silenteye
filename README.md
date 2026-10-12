# SilentEye

> **Copyright (c) 2026 Christian Fiesco. All rights reserved.**
> **PROPRIETARY SOFTWARE — See [LICENSE](./LICENSE) for details.**

Plataforma de seguridad vehicular en tiempo real. Monitoreo GPS de flotas, botón de pánico ciudadano y red de apoyo con notificaciones instantáneas.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js · Express · TypeScript · PostgreSQL + PostGIS |
| **Frontend** | Next.js 14 · React · Tailwind CSS · Leaflet/OpenStreetMap |
| **GPS** | Servidor TCP multiprotocolo: Teltonika (Codec 8/8E) · Concox/GT06 · Queclink · Cobán/Sinotrack |
| **Tiempo real** | WebSocket · Push Notifications (VAPID) |
| **Email** | Nodemailer · Gmail SMTP (OTP + notificaciones) |
| **PDF** | PDFKit (reportes de incidentes) |
| **Deploy** | Fly.io (backend) · Vercel (frontend) · GitHub Actions CI/CD |

## Estructura del proyecto

```
SilentEye/
├── backend/src/
│   ├── api/
│   │   ├── auth.ts              # OTP + JWT autenticación
│   │   └── routes.ts            # API REST completa
│   ├── db/
│   │   ├── pool.ts              # Conexión PostgreSQL
│   │   ├── schema.sql           # Schema PostGIS
│   │   ├── schema-simple.sql    # Schema Haversine (fallback)
│   │   ├── migrations/          # Migraciones incrementales (001–008)
│   │   ├── run-migrate.ts       # Lógica de migración (usado por API)
│   │   ├── run-seed.ts          # Datos iniciales (usado por API)
│   │   ├── migrate.ts           # CLI: npm run migrate
│   │   ├── seed.ts              # CLI: npm run seed
│   │   └── reset-keep-admin.ts  # CLI: limpiar DB conservando admins
│   ├── services/
│   │   ├── alert-service.ts     # Detección de alertas + notificación cercanos
│   │   ├── email-service.ts     # Emails: OTP, helper respondiendo, testigos
│   │   ├── gps-service.ts       # Procesamiento de datos GPS
│   │   ├── push-service.ts      # Push notifications (VAPID/web-push)
│   │   └── websocket.ts         # Broadcast tiempo real
│   ├── teltonika/
│   │   ├── tcp-server.ts        # Servidor TCP multiprotocolo (auto-detecta marca)
│   │   ├── avl-decoder.ts       # Decodificador Codec 8/8E
│   │   ├── alert-detector.ts    # Clasifica eventos AVL → alertas
│   │   └── crc16.ts             # Checksum CRC-16
│   ├── types/                   # Tipos TypeScript adicionales
│   ├── utils/logger.ts          # Winston logger
│   └── index.ts                 # Entry point (HTTP + TCP + WS)
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── login/page.tsx       # Login (SOS/Conductor/Admin)
│   │   ├── dashboard/page.tsx   # Dashboard principal
│   │   ├── admin/page.tsx       # Panel de administración
│   │   └── sos/page.tsx         # Botón de pánico ciudadano
│   ├── components/
│   │   ├── LeafletMap.tsx       # Mapa OpenStreetMap
│   │   ├── MapView.tsx          # Wrapper del mapa
│   │   ├── admin/               # Componentes admin (8 archivos)
│   │   └── helper/              # Componentes helper/driver (6 archivos)
│   ├── hooks/
│   │   ├── useWebSocket.ts      # WebSocket con reconexión automática
│   │   └── usePushNotifications.ts  # Service worker + push
│   ├── utils/alarm.ts           # Audio de alerta para emergencias
│   └── public/                  # PWA icons + service worker
├── simulator/                   # Simulador GPS Teltonika (desarrollo)
├── Dockerfile                   # Build backend → Fly.io
├── fly.toml                     # Configuración Fly.io
└── .github/workflows/deploy.yml # CI/CD automático
```

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# 3. Ejecutar en desarrollo
npm run dev              # Backend + Frontend simultáneo
npm run dev:backend      # Solo backend (:3001)
npm run dev:frontend     # Solo frontend (:3000)
```

## Base de datos

```bash
npm run migrate          # Schema + migraciones incrementales
npm run seed             # Datos iniciales de prueba
```

En producción, las migraciones se ejecutan via API:
```
POST /api/setup/migrate  { "secret": "<MIGRATE_SECRET>" }
POST /api/setup/seed     { "secret": "<MIGRATE_SECRET>" }
```

## Deploy

```bash
flyctl deploy --remote-only   # Backend → Fly.io
npx vercel deploy --prod      # Frontend → Vercel
```

Push a `main` despliega automáticamente vía GitHub Actions.

## Variables de entorno

Ver [`backend/.env.example`](backend/.env.example) para referencia completa.

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | Sí | PostgreSQL connection string |
| `JWT_SECRET` | Sí | Secreto JWT (mín. 32 caracteres) |
| `SMTP_HOST` | Sí | Servidor SMTP (ej: `smtp.gmail.com`) |
| `SMTP_PORT` | Sí | Puerto SMTP (ej: `587`) |
| `SMTP_USER` | Sí | Email SMTP |
| `SMTP_PASS` | Sí | Contraseña de app SMTP |
| `SMTP_FROM` | Sí | Dirección remitente |
| `MIGRATE_SECRET` | Sí | Secreto para endpoint de migraciones |
| `PANIC_ALERT_RADIUS_M` | No | Radio de alerta en metros (default: 2000) |
| `TWILIO_ACCOUNT_SID` | Sí (admin SMS) | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Sí (admin SMS) | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Sí (admin SMS) | Número Twilio (ej: `+1234567890`) |
| `JWT_EXPIRES_IN` | No | Duración del JWT (default: 24h) |

**Frontend** (Vercel):

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL del backend (ej: `https://silenteye-xxx.fly.dev`) |
| `NEXT_PUBLIC_WS_URL` | URL WebSocket (ej: `wss://silenteye-xxx.fly.dev/ws`) |

## Roles y acceso

| Rol | Login | Acceso |
|-----|-------|--------|
| **admin** | Teléfono + OTP | Panel completo: incidentes, alertas, vehículos, conductores, mapa, reportes PDF, testigos |
| **helper** | Teléfono + OTP | Recibe alertas cercanas, puede responder "Voy en camino", mapa de seguimiento |
| **driver** | IMEI del GPS | Ve sus vehículos asignados, recibe alertas |
| **citizen** | Email + OTP | Botón SOS de emergencia, envía ubicación GPS |

## Funcionalidades principales

- **Rastreo GPS en vivo** — GPS comerciales (Teltonika, Concox, Queclink, Cobán, Sinotrack) via TCP a `gps.silenteye.com.mx`, ubicación en mapa OpenStreetMap
- **Botón de pánico físico** — El botón SOS cableado al GPS genera incidente automático (priority=2) y alerta a la red cercana
- **Botón SOS móvil** — Cualquier persona desde el navegador, sin app
- **Notificaciones** — WebSocket + Push + Email al ciudadano cuando un helper responde
- **Gestión de incidentes** — Estados: active → attending → resolved
- **Reportes PDF** — Descarga con datos del incidente, responders y testigos
- **Sistema de testigos** — Solicitud voluntaria por email con aceptar/declinar
- **PWA** — Instalable como app, funciona offline para el service worker

## GPS: cómo funciona y cómo se configura

SilentEye **no fabrica GPS**. Usa rastreadores comerciales que ya existen en el mercado y lo que construimos es el servidor que los recibe (`backend/src/gps/tcp-server.ts`). El cliente solo apunta su GPS a nuestro servidor, igual que lo haría con cualquier plataforma de rastreo.

### Servidor

| Parámetro | Valor |
|-----------|-------|
| **Host** | `gps.silenteye.com.mx` (IP fija: `213.188.221.189`) |
| **Puerto principal** | `5000` |
| **Puertos alternos** | `8443` y `15140` — por si la operadora móvil bloquea el 5000 |
| **Protocolo** | TCP |

Los tres puertos van al mismo servidor (`backend/fly.toml`). El servidor detecta la marca del GPS por los primeros bytes de la conexión y usa el parser correspondiente (`teltonika-parser.ts`, `concox-parser.ts`, `queclink-parser.ts`). Solo acepta IMEIs registrados en la plataforma (whitelist); un GPS que no esté dado de alta es rechazado.

> ⚠️ El dominio viejo `silenteye.mx` apunta a Vercel y **no sirve para TCP**. Usar siempre `gps.silenteye.com.mx`.

### Flujo para el cliente

1. Crea su cuenta y registra el vehículo (placa + IMEI de 15 dígitos) en `/setup`.
2. Apunta el GPS al servidor con el comando de su marca (abajo). La misma página `/setup` muestra estos comandos (`frontend/app/setup/page.tsx`).
3. En 2–5 minutos el vehículo aparece en el mapa.

### Configuración por marca

Los comandos se mandan por **SMS al chip del GPS** (salvo Teltonika, que se configura por USB). Reemplaza `tu-apn` por el APN de la operadora del chip (Telcel: `internet.itelcel.com`).

| Marca | Modelos | Comando |
|-------|---------|---------|
| **Concox** | GT06N, WeTrack2, GV20, JM-VL | `APN,tu-apn#` y luego `SERVER,1,gps.silenteye.com.mx,5000,0#` |
| **Cobán** | TK103, TK303, GPS103 | `apn123456 tu-apn` · `adminip123456 gps.silenteye.com.mx 5000` · `gprs123456` (password default `123456`) |
| **Sinotrack** | ST-901, ST-906 | `8030000 tu-apn` · `8040000 gps.silenteye.com.mx 5000` (password default `0000`; confirmar en el manual del modelo). Los clones "TK103" con firmware GT06 usan los comandos de Concox |
| **Queclink** | GL300, GV300, GV58CEU | `AT+GTSVR=gl300,1,gps.silenteye.com.mx,5000,,,,,FFFF$` (password `gl300`/`gv300` según modelo) |
| **Teltonika** | FMB920, FMC920, FMC130 | Teltonika Configurator → GPRS → Server Settings: Domain `gps.silenteye.com.mx`, Port `5000`, Protocol TCP, Codec 8 Extended |

> ℹ️ Cobán habla el protocolo de texto **GPS103** (`imei:...,tracker,...;`) y Sinotrack el protocolo **H02** (`*HQ,...#`); ambos tienen parser propio (`gps103-parser.ts`, `h02-parser.ts`, agregados 2026-10-11) con pruebas en `backend/src/scripts/test-gps-text-parsers.ts`. Falta validarlos contra un equipo físico real. Nota: algunos H02 reportan un ID corto en vez del IMEI de 15 dígitos; esos equipos no pasan la whitelist.

Para flotas, el alta masiva de IMEIs se hace con `npm run onboard:fleet -w backend` a partir de un CSV (`backend/src/scripts/onboard-fleet.ts`). Los IMEIs deben estar registrados **antes** de reconfigurar los GPS, por la whitelist.

### Botón de pánico físico

El botón va cableado al GPS, no al celular. Al oprimirlo, el GPS manda un evento de pánico y el servidor crea el incidente (priority=2) y difunde la ubicación a la red cercana. Lo que detecta cada parser:

| Marca | Qué manda el GPS | Dónde se detecta |
|-------|------------------|------------------|
| Teltonika | DIN1 cambia de estado (AVL ID 1) o Priority = Panic | `alert-detector.ts` |
| Concox/GT06 | Paquete de alarma `0x16`/`0x26` con tipo SOS (`0x01`) | `concox-parser.ts` |
| Queclink | Mensaje `+RESP:GTSOS` | `queclink-parser.ts` |
| Cobán | Reporte con tipo `help me` | `gps103-parser.ts` |
| Sinotrack | Bit 1 o bit 18 del status en 0 (`*HQ,...,V1,...,FFFFFFFD`) | `h02-parser.ts` |

**Teltonika FMC130** (el único que requiere configurar la entrada a mano):

```
Pin 5 (DIN1) ──── Cable 1 del botón (normalmente abierto)
Pin 7 (GND)  ──── Cable 2 del botón
Pin 1 (+V)   ──── +12V batería vehículo
Pin 7 (GND)  ──── GND batería vehículo
```

En Teltonika Configurator → I/O → DIN1 (AVL ID 1): Priority **Panic**, Operand **On Change**. El detector acepta tanto DIN1=1 como DIN1=0 como pánico, así que funciona con botón a +V o a GND.

**Concox, Cobán, Sinotrack y Queclink:** el arnés ya trae dos cables (o un conector de 2 pines) marcados **SOS**. Se conecta ahí un botón normalmente abierto; no hay que configurar nada más, el GPS manda la alarma SOS por sí solo. Los colores de los cables cambian por modelo, así que hay que verificar la etiqueta "SOS" en el manual del equipo.

Recomendación de instalación: el botón escondido donde el conductor lo alcance sin bajar la vista (bajo el tablero, junto a la rodilla, o en el lado izquierdo del asiento), y el GPS escondido fuera de la vista del pasajero.

### Verificar conexión

```bash
flyctl logs --app silenteye
# Debe mostrar algo como:
# [GPS][1.2.3.4:5678] Protocolo detectado: Concox/GT06
# [GT06][1.2.3.4:5678] Login IMEI=865124071489548 | proto=0x1
```

Si el GPS no aparece: 1) el chip debe tener saldo y datos activos, 2) confirmar que apunta a `gps.silenteye.com.mx:5000`, 3) probar el puerto `8443` o `15140`, 4) reiniciar el GPS (quitar y reconectar alimentación), 5) confirmar que el IMEI está registrado (whitelist).

### Comandos SMS útiles

| Marca | Comando | Qué hace |
|-------|---------|----------|
| Teltonika | `0000 getinfo` / `0000 flush` / `0000 cpureset` | Estado / forzar envío / reiniciar (password default `0000`) |
| Concox / GT06 | `STATUS#` / `PARAM#` / `RESET#` | Estado / ver parámetros (server, APN) / reiniciar |
| Queclink | `AT+GTRTO=gl300,3,,,,,,FFFF$` | Reiniciar |

## Licencia

**Copyright (c) 2026 Christian Fiesco. Todos los derechos reservados.**

Este software es **propietario y confidencial**. El repositorio es público únicamente con fines de demostración y portafolio. No se otorga ninguna licencia ni permiso para usar, copiar, modificar o distribuir este software sin autorización escrita del autor.

Ver [LICENSE](./LICENSE) para términos completos.
