# EL STOCK

Aplicación web responsive para conectar a **talleres de chapa y pintura / talleres mecánicos** que quieren vender los repuestos que tienen en stock, con quienes están buscando comprar autopartes low cost.

> Comprá y vendé autopartes en un solo lugar. Encontrá el repuesto que necesitás o convertí tu stock sin uso en una nueva oportunidad de negocio.

## Estado actual

Prototipo funcional (front-end puro, sin backend) pensado para mostrar y validar el flujo con el interesado antes de sumar infraestructura real.

Funcionalidades implementadas:

- Landing con la propuesta de valor y accesos a **Iniciar sesión** / **Registrarse**.
- Registro e inicio de sesión (simulado, guardado en el navegador).
- Pantalla de bienvenida con el nombre del usuario y elección entre **Vender** o **Comprar**.
- **Publicar repuesto**: tipo de pieza, marca y modelo compatible, estado (nuevo/usado), precio, foto y contacto.
- **Catálogo**: tarjetas con foto + datos, con buscador y filtros por tipo y estado.
- **Mis publicaciones**: listado y baja de los repuestos que publicó cada usuario.
- Ficha de detalle con botón directo para contactar al vendedor por WhatsApp.
- Diseño mobile-first, con la paleta de marca e íconos simples.

### Cómo se guardan los datos

Todo se guarda en el `localStorage` del navegador (usuarios, sesión activa y repuestos publicados). Esto es intencional para esta primera etapa: permite mostrar la app funcionando sin necesidad de un servidor o base de datos. **Los datos no se comparten entre dispositivos ni navegadores distintos** — es el principal límite a tener en cuenta al mostrarla al interesado.

## Pendiente / posibles próximos pasos

Ideas para conversar con el interesado sobre hacia dónde evolucionar el proyecto:

- Backend real + base de datos (para que el catálogo sea el mismo para todos los usuarios y dispositivos).
- Edición y no solo baja de publicaciones propias.
- Recuperación de contraseña y validación de email.
- Múltiples fotos por repuesto.
- Notificaciones cuando alguien busca un repuesto que coincide con el stock propio.
- Nombre de marca definitivo (hoy "EL STOCK" es provisional).

## Estructura del proyecto

```
el-stock/
├── index.html          # Todas las pantallas de la app
├── styles.css           # Estilos (paleta de marca, mobile-first)
├── app.js                # Lógica: navegación, auth, catálogo, localStorage
└── .github/workflows/deploy.yml   # Publicación automática en GitHub Pages
```

Es un sitio estático: no requiere instalar dependencias ni build.

## Cómo probarla en tu computadora

Alcanza con abrir `index.html` con doble clic, o con clic derecho → "Abrir con" → tu navegador.

## Cómo publicarla en GitHub Pages

El repo ya incluye el workflow (`.github/workflows/deploy.yml`) que publica el sitio automáticamente en cada push a `main`. Pasos para dejarlo online:

1. Creá un repositorio vacío en GitHub (sin README, sin .gitignore) — por ejemplo `el-stock`.
2. En esta carpeta, conectá el repo remoto y subí el código:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/el-stock.git
   git branch -M main
   git push -u origin main
   ```
3. En GitHub, andá a **Settings → Pages** y en "Build and deployment" elegí como fuente **GitHub Actions** (si no quedó configurado solo tras el primer push).
4. Esperá a que termine el workflow (pestaña **Actions** del repo). Cuando termina, el sitio queda publicado en:
   ```
   https://TU-USUARIO.github.io/el-stock/
   ```

Ese link es el que podés compartir con el interesado — cada vez que subas cambios a `main`, se actualiza solo.
