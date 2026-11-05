# ESKAPE · Plataforma de Carta Digital Autogestionable

Aplicación web de carta digital para acceso mediante código QR en mesa con **Panel de Administración Privado (`/admin`)** y **Base de Datos Supabase Independiente**, desarrollada para **ESKAPE · Bar de Desayunos & Cafetería** con **React 18 + Vite 5 + JavaScript + CSS moderno + Supabase**.

---

## Índice

1. [Arquitectura e Independencia respecto a FACENIA](#1-arquitectura-e-independencia-respecto-a-facenia)
2. [Instalación del Proyecto](#2-instalación-del-proyecto)
3. [Ejecución en Entorno Local](#3-ejecución-en-entorno-local)
4. [Configuración del Proyecto Supabase](#4-configuración-del-proyecto-supabase)
5. [Ejecución de los Scripts SQL (Esquema, RLS y Semilla)](#5-ejecución-de-los-scripts-sql-esquema-rls-y-semilla)
6. [Creación y Gestión de Usuarios Administradores](#6-creación-y-gestión-de-usuarios-administradores)
7. [Configuración de Supabase Storage (`eskape-media`)](#7-configuración-de-supabase-storage-eskape-media)
8. [Variables de Entorno](#8-variables-de-entorno)
9. [Despliegue en Vercel](#9-despliegue-en-vercel)
10. [Actualización de la Aplicación](#10-actualización-de-la-aplicación)
11. [Copias de Seguridad (Backups) de la Base de Datos](#11-copias-de-seguridad-backups-de-la-base-de-datos)
12. [Protocolo de Transferencia de Propiedad a ESKAPE](#12-protocolo-de-transferencia-de-propiedad-a-eskape)

---

## 1. Arquitectura e Independencia respecto a FACENIA

- **Aislamiento total**: Este proyecto se conecta única y exclusivamente al proyecto de Supabase dedicado a **ESKAPE** (`faqneufzlnjcbqvphbgd`). No comparte tablas, usuarios, buckets, políticas ni credenciales con ningún otro cliente.
- **Salvaguarda activa en código**: [`src/lib/supabaseClient.js`](./src/lib/supabaseClient.js) incluye una validación explícita (`FORBIDDEN_PROJECT_REFS`) que bloquea cualquier intento accidental de conexión al proyecto de FACENIA (`zkxyvhrqxetxomrwbajm`).
- **Seguridad en cliente y servidor**: El frontend utiliza exclusivamente la clave pública `VITE_SUPABASE_ANON_KEY`. Nunca se expone `service_role`. Toda la seguridad de escritura y lectura recae en las políticas **Row-Level Security (RLS)** de PostgreSQL y en la función verificadora `public.is_authorized_admin()`.
- **Carga diferida (`React.lazy`)**: El panel de administración (`/admin`) se empaqueta en chunks independientes (`AdminLogin`, `AdminDashboard`) para que los clientes que escanean el código QR en las mesas solo descarguen el código ligero de la carta pública (`~19.9 KB` gzip).

---

## 2. Instalación del Proyecto

### Requisitos previos
- **Node.js** `>= 18.x` (recomendado `20 LTS` o superior).
- **npm** `>= 9.x`.

### Pasos de instalación
```bash
# 1. Posicionarse en la carpeta del proyecto
cd Eskape

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno locales a partir de la plantilla
cp .env.example .env
```

---

## 3. Ejecución en Entorno Local

```bash
# Iniciar el servidor de desarrollo de Vite (con recarga en caliente HMR)
npm run dev
```
- **Web principal corporativa de presentación**: `http://localhost:5173/`
- **Carta digital independiente (destino directo de los códigos QR de las mesas)**: `http://localhost:5173/carta`
- **Panel de administración privado**: `http://localhost:5173/admin`

### Comandos de verificación y compilación
```bash
# Ejecutar linter estático (ESLint)
npm run lint

# Generar compilación optimizada para producción en la carpeta dist/
npm run build

# Previsualizar localmente el build de producción
npm run preview
```

---

## 4. Configuración del Proyecto Supabase

El proyecto Supabase exclusivo de **ESKAPE** ya se encuentra creado y activo:
- **Nombre del proyecto**: `Eskape`
- **Project ID / Ref**: `faqneufzlnjcbqvphbgd`
- **Región**: `eu-west-1` (Irlanda · Europa Occidental)
- **URL de la API**: `https://faqneufzlnjcbqvphbgd.supabase.co`

Si en el futuro se desea crear un entorno desde cero en otra cuenta:
1. Accede a [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Haz clic en **New Project**, asígnale el nombre **`Eskape`** y selecciona una región europea (`eu-west-1`).
3. En **Authentication → Providers → Email**, mantén habilitado el proveedor de correo y contraseña (y desactiva el registro público libre si no deseas altas externas, ya que solo los usuarios presentes en `public.admin_profiles` tienen permisos).

---

## 5. Ejecución de los Scripts SQL (Esquema, RLS y Semilla)

Todos los scripts SQL se encuentran versionados en [`supabase/migrations/`](./supabase/migrations/) y son **idempotentes** (pueden ejecutarse sin provocar duplicados).

Para aplicarlos en un proyecto nuevo desde **Supabase Dashboard → SQL Editor**:

1. **[`supabase/migrations/001_eskape_schema_and_rls.sql`](./supabase/migrations/001_eskape_schema_and_rls.sql)**:
   - Crea las 4 tablas del sistema:
     - `public.admin_profiles` (usuarios autorizados para administrar la carta).
     - `public.categories` (categorías de la carta digital y orden de aparición).
     - `public.products` (productos, precios, disponibilidad diaria, visibilidad, destacados, alérgenos y etiquetas dietéticas).
     - `public.establishment_settings` (datos del local, horarios, contacto, WhatsApp, colores y configuración visual).
   - Crea la función verificadora `public.is_authorized_admin()` y los triggers automáticos de `updated_at`.
   - Activa **Row-Level Security (RLS)** en todas las tablas con políticas granulares por operación (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
   - Configura el bucket **`eskape-media`** y sus políticas RLS en `storage.objects`.
2. **[`supabase/migrations/002_eskape_initial_seed.sql`](./supabase/migrations/002_eskape_initial_seed.sql)**:
   - Inserta la configuración inicial del establecimiento, las **6 categorías** (`Desayunos`, `Tostadas`, `Especialidades`, `Cafés e infusiones`, `Zumos y bebidas`, `Extras`) y los **23 productos** de la carta.

---

## 6. Creación y Gestión de Usuarios Administradores

El acceso al panel `/admin` requiere dos condiciones simultáneas:
1. Que el usuario exista en **`auth.users`** (Supabase Auth).
2. Que su UUID esté registrado en **`public.admin_profiles`** con `is_active = true`.

### Inicio de sesión por nombre de usuario o correo
El formulario de `/admin` permite iniciar sesión introduciendo directamente un nombre de usuario corto (por ejemplo, `Eskape`, que se resuelve internamente a `eskape@admin.eskape.es`) o cualquier correo electrónico completo.

### Cómo añadir un nuevo administrador desde Supabase Dashboard
1. Entra en **Supabase Dashboard → Authentication → Users → Add user → Create new user**.
2. Introduce el correo electrónico (o `<usuario>@admin.eskape.es` si quieres que entre solo con su alias de usuario), asigna una contraseña segura y marca **Auto Confirm User**.
3. Abre **SQL Editor** y ejecuta:
   ```sql
   INSERT INTO public.admin_profiles (id, email, full_name, role, establishment_slug, is_active)
   SELECT id, email, 'Nombre del Administrador', 'admin', 'eskape', true
   FROM auth.users
   WHERE email = 'correo_o_usuario@admin.eskape.es'
   ON CONFLICT (id) DO UPDATE
   SET is_active = true, role = EXCLUDED.role;
   ```
   *(Nota: Si la tabla `public.admin_profiles` está vacía al crear el primer usuario en `auth.users`, el trigger `trg_on_auth_user_created_first_owner` lo autoriza automáticamente con rol `owner`).*

---

## 7. Configuración de Supabase Storage (`eskape-media`)

El almacenamiento de imágenes de productos, categorías, portada y logotipo utiliza el bucket exclusivo **`eskape-media`**:
- **Lectura pública (`SELECT`)**: Cualquier cliente que escanee el QR puede visualizar las imágenes (`bucket_id = 'eskape-media'`).
- **Escritura protegida (`INSERT`, `UPDATE`, `DELETE`)**: Únicamente los administradores autorizados (`public.is_authorized_admin() = true`) pueden subir, reemplazar o eliminar archivos.
- **Límites**: Tamaño máximo de `5 MB` por archivo; formatos permitidos `image/jpeg`, `image/png`, `image/webp` e `image/svg+xml`.
- **Optimización automática en cliente**: Antes de subir cualquier fotografía desde `/admin`, [`src/lib/imageOptimizer.js`](./src/lib/imageOptimizer.js) la redimensiona y comprime automáticamente en formato JPEG/WebP ligero (`~70–120 KB`) para garantizar una carga instantánea en datos móviles. Al eliminar un producto desde el panel, su imagen asociada en `eskape-media` se limpia automáticamente.

---

## 8. Variables de Entorno

Crea un archivo `.env` en la raíz en desarrollo local (nunca se sube a Git gracias a `.gitignore`) o configura estas variables en Vercel:

| Variable | Descripción | Dónde obtenerla |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | URL pública de la API del proyecto Supabase de ESKAPE (`https://faqneufzlnjcbqvphbgd.supabase.co`) | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima (`anon` / `public`) del proyecto Supabase de ESKAPE | Supabase Dashboard → Project Settings → API → Project API keys (`anon` `public`) |

> **Importante**: Nunca utilices ni expongas la clave `service_role` en el frontend ni en variables `VITE_*`.

---

## 9. Despliegue en Vercel

El proyecto incluye [`vercel.json`](./vercel.json) preconfigurado con:
- Reescritura SPA (`rewrites` hacia `/index.html`) para que `/`, `/carta` y `/admin` funcionen directamente al recargar la página o al escanear el código QR sin error 404.
- Cabeceras de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) y caché inmutable para activos estáticos (`/images/*`).

### Pasos para publicar en Vercel y configurar el Código QR
1. Sube este repositorio a una cuenta de **GitHub**, **GitLab** o **Bitbucket**.
2. Entra en [https://vercel.com/new](https://vercel.com/new) e importa el repositorio **`Eskape`**.
3. Verifica la configuración de compilación (detectada automáticamente por Vite):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. En la sección **Environment Variables**, añade:
   - `VITE_SUPABASE_URL` = `https://faqneufzlnjcbqvphbgd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = *(clave `anon public` del proyecto `Eskape` en Supabase)*
5. Haz clic en **Deploy**.
6. **URL para los códigos QR de las mesas**:
   - Genera los códigos QR apuntando directamente a **`https://tu-dominio.vercel.app/carta`** (o `https://dominio-del-negocio.com/carta`). Al escanearlo, el cliente entrará de forma inmediata en la aplicación móvil de la carta digital sin pasar por la página corporativa.

---

## 10. Actualización de la Aplicación

- **Cambios de contenido diario (precios, productos, agotados, categorías, horarios, teléfono, WhatsApp)**:
  - **No requieren redesplegar la web**. Se realizan desde `https://tu-dominio.vercel.app/admin` y se reflejan en tiempo real en la carta pública.
- **Cambios en el código fuente o diseño**:
  1. Edita los archivos localmente y verifica con `npm run lint` y `npm run build`.
  2. Realiza un commit y sube los cambios a la rama principal (`git push origin main`).
  3. Vercel compilará y publicará automáticamente la nueva versión sin tiempo de inactividad.

---

## 11. Copias de Seguridad (Backups) de la Base de Datos

### Opción A: Exportación inmediata desde el Panel de Administración (`/admin`)
1. Inicia sesión en `/admin` y abre la pestaña **Configuración**.
2. En la tarjeta **Copia de Seguridad (JSON)**, pulsa **Exportar copia de seguridad (.json)**.
3. Se descargará un archivo JSON con todas las categorías, productos, precios y ajustes del establecimiento.

### Opción B: Volcado SQL desde Supabase / PostgreSQL
Puedes exportar los datos desde **Supabase Dashboard → Table Editor** (exportación a CSV/SQL) o mediante `pg_dump` usando la cadena de conexión de **Project Settings → Database**:
```bash
pg_dump --dbname="postgresql://postgres:[PASSWORD]@db.faqneufzlnjcbqvphbgd.supabase.co:5432/postgres" \
  --schema=public \
  --data-only \
  --file="backup_eskape_$(date +%Y%m%d).sql"
```

---

## 12. Protocolo de Transferencia de Propiedad a ESKAPE

Toda la infraestructura se ha diseñado de forma desacoplada para que, si el propietario de **ESKAPE** solicita asumir el control directo en el futuro, la transferencia sea limpia y transparente:

1. **Transferencia de Base de Datos y Storage (Supabase)**:
   - El propietario de ESKAPE crea una cuenta gratuita en [Supabase](https://supabase.com) y una organización propia.
   - Desde **Supabase Dashboard → Project Settings → General → Transfer Project**, se transfiere el proyecto `Eskape` (`faqneufzlnjcbqvphbgd`) a la organización del propietario.
   - **Ventaja clave**: El `Project URL`, las claves API, las tablas, los usuarios y las imágenes subidas en `eskape-media` **no cambian**, por lo que la web sigue funcionando sin interrupción.
2. **Transferencia de Código y Hosting (GitHub + Vercel)**:
   - Se transfiere el repositorio Git a la cuenta del propietario o se conecta a su cuenta de Vercel manteniendo las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. **Revocación de accesos**:
   - Desde `public.admin_profiles` y **Supabase Authentication → Users**, el propietario puede cambiar su contraseña o desactivar cualquier cuenta de soporte previa (`is_active = false`).
