# 🚀 Guía de Despliegue - FormAI PWA

Esta guía te ayudará a desplegar tu aplicación FormAI como una PWA (Progressive Web App) en Vercel.

## 📋 Prerrequisitos

- Node.js 18+ instalado
- Cuenta en [Vercel](https://vercel.com)
- CLI de Vercel instalado: `npm i -g vercel`

## 🔧 Configuración Local

### 1. Instalar dependencias adicionales

```bash
npm install workbox-webpack-plugin crypto-browserify stream-browserify buffer
```

### 2. Verificar configuración

Asegúrate de que los siguientes archivos estén configurados correctamente:

- ✅ `app.json` - Configuración PWA habilitada
- ✅ `webpack.config.js` - Service worker configurado
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `env.web` - Variables de entorno para web

## 🚀 Comandos de Desarrollo

### Desarrollo local con web
```bash
npm run web
# o
npx expo start --web
```

### Construir para producción
```bash
npm run build:pwa
# o
npx expo export --platform web --clear
```

### Despliegue directo a Vercel
```bash
npm run deploy:vercel
```

## 🌐 Despliegue en Vercel

### Opción 1: Despliegue automático (Recomendado)

1. Conecta tu repositorio GitHub a Vercel
2. Vercel detectará automáticamente la configuración
3. Cada push a `main` se desplegará automáticamente

### Opción 2: Despliegue manual

1. Construye la aplicación:
   ```bash
   npm run build:pwa
   ```

2. Despliega a Vercel:
   ```bash
   vercel --prod
   ```

### Opción 3: Despliegue desde CLI

```bash
# Login a Vercel
vercel login

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

## ⚙️ Configuración de Variables de Entorno en Vercel

### Variables requeridas:

| Variable Vercel | Descripción | Valor por defecto |
|----------------|-------------|-------------------|
| `EXPO_PUBLIC_API_BASE_URL` | URL base de la API | `https://formai-backend-dc3u.onrender.com/api` |
| `EXPO_PUBLIC_WEB_ENABLED` | Habilitar funcionalidades web | `true` |
| `EXPO_PUBLIC_PWA_ENABLED` | Habilitar PWA | `true` |

### Cómo configurar:

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Settings** → **Environment Variables**
3. Agrega cada variable con su valor correspondiente
4. Selecciona todos los entornos (Production, Preview, Development)

## 🔍 Verificación de PWA

### 1. Verificar manifest.json
- Abre tu app en el navegador
- Ve a **DevTools** → **Application** → **Manifest**
- Verifica que el manifest se cargue correctamente

### 2. Verificar service worker
- Ve a **DevTools** → **Application** → **Service Workers**
- Confirma que el service worker esté registrado y activo

### 3. Verificar instalación
- En Chrome/Edge, deberías ver el botón "Instalar" en la barra de direcciones
- En móviles, deberías poder "Agregar a pantalla de inicio"

## 📱 Funcionalidades Web

### Cámara Web
- **Fallback automático**: Si la cámara no está disponible, se muestra un input de archivo
- **Captura de imagen**: Soporte para `capture="environment"` en móviles
- **Selección de archivo**: Permite subir imágenes desde la galería

### Almacenamiento
- **AsyncStorage**: Funciona en web usando localStorage
- **Cache**: Service worker cachea recursos estáticos y API calls

### Navegación
- **SPA routing**: Todas las rutas se redirigen a index.html
- **Deep linking**: Soporte para enlaces directos

## 🚨 Solución de Problemas

### Error: "Module not found"
```bash
# Limpia cache y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error: "Service worker not registered"
1. Verifica que `webpack.config.js` esté configurado correctamente
2. Asegúrate de que `workbox-webpack-plugin` esté instalado
3. Limpia el cache del navegador

### Error: "PWA not installable"
1. Verifica que `app.json` tenga la configuración web correcta
2. Confirma que el manifest.json se genere correctamente
3. Verifica que tengas al menos un icono de 192x192 y 512x512

### Error: "Camera not working on web"
1. Verifica que `WebCameraFallback` esté importado correctamente
2. Confirma que la función `handleWebImageCapture` esté implementada
3. Verifica que el hook `usePlatform` esté funcionando

## 📊 Auditoría de Lighthouse

### Ejecutar auditoría:
1. Abre tu app en Chrome
2. Ve a **DevTools** → **Lighthouse**
3. Selecciona **PWA**, **Performance**, **Best Practices**
4. Ejecuta la auditoría

### Puntos a verificar:
- ✅ **PWA**: Manifest válido, service worker activo
- ✅ **Performance**: First Contentful Paint < 1.8s
- ✅ **Best Practices**: HTTPS, meta tags correctos
- ✅ **Accessibility**: Contraste de colores, etiquetas ARIA

## 🔄 Actualizaciones

### Actualizar PWA:
1. Modifica el código
2. Incrementa la versión en `app.json`
3. Despliega a Vercel
4. Los usuarios recibirán la actualización automáticamente

### Forzar actualización del service worker:
```javascript
// En tu app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.update();
    });
  });
}
```

## 📚 Recursos Adicionales

- [Expo Web Documentation](https://docs.expo.dev/guides/web/)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Vercel Documentation](https://vercel.com/docs)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs de Vercel
2. Verifica la consola del navegador
3. Ejecuta una auditoría de Lighthouse
4. Consulta la documentación de Expo y Vercel

---

**¡Tu PWA está lista para el mundo! 🎉**

