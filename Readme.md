# Sistema CRUD de Items con Validaciones

Sistema completo de gestión de items con API REST en Node.js/Express y frontend en React + Vite, incluyendo validaciones robustas en ambos lados.

## 🔒 Características de Seguridad

### Backend
- ✅ Validación de entrada con sanitización XSS
- ✅ Rate limiting (límite de peticiones)
- ✅ Helmet.js para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de tipos de datos
- ✅ Límites de tamaño de peticiones
- ✅ Validación de UUID
- ✅ Manejo de errores robusto

### Frontend
- ✅ Validación en tiempo real
- ✅ Sanitización de entradas
- ✅ Feedback visual de errores
- ✅ Confirmación de eliminación
- ✅ Manejo de estados de carga
- ✅ Notificaciones de éxito/error

## 📁 Estructura del Proyecto

```
proyecto/
├── backend/
│   ├── index.js
│   ├── data.json
│   ├── package.json
│   ├── .env
│   ├── db/
│   │   └── mongo.js
│   ├── routes/
│   │   └── items.js
│   ├── services/
│   │   └── fileStore.js
│   └── middlewares/
│       └── validationMiddleware.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
```

## 🚀 Instalación

### Backend

1. **Crear carpeta y navegar:**
```bash
mkdir backend
cd backend
```

2. **Instalar dependencias:**
```bash
npm install express dotenv uuid mongoose helmet cors express-rate-limit xss
npm install -D nodemon
```

3. **Crear archivos:**
- Copia el contenido de `index.js`, `validationMiddleware.js`, `items.js`, `fileStore.js`, `mongo.js`
- Crea el archivo `.env` basado en `.env.example`

4. **Crear estructura de carpetas:**
```bash
mkdir routes services middlewares db
```

5. **Iniciar servidor:**
```bash
npm run dev
```

El servidor estará en `http://localhost:3000`

### Frontend

1. **Crear proyecto con Vite:**
```bash
npm create vite@latest frontend -- --template react
cd frontend
```

2. **Instalar dependencias:**
```bash
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. **Configurar Tailwind:**

Crea `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Edita `src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

4. **Copiar el componente App.jsx**

5. **Configurar archivos:**
- Copia `vite.config.js`
- Copia `tailwind.config.js`
- Copia `postcss.config.js`

6. **Iniciar desarrollo:**
```bash
npm run dev
```

El frontend estará en `http://localhost:5173`

## 🔧 Configuración

### Variables de Entorno (Backend)

Crea un archivo `.env` en la carpeta backend:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/items-db
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 📝 Validaciones Implementadas

### Campo: Nombre
- ✅ Requerido
- ✅ Mínimo 2 caracteres
- ✅ Máximo 100 caracteres
- ✅ Solo letras y espacios
- ✅ Sanitización XSS

### Campo: Descripción
- ✅ Opcional
- ✅ Máximo 500 caracteres
- ✅ Sanitización XSS

### Campo: Precio
- ✅ Requerido
- ✅ Debe ser número
- ✅ No puede ser negativo
- ✅ Máximo: 999,999,999
- ✅ Redondeado a 2 decimales

### Validaciones de Seguridad
- ✅ Validación de UUID en IDs
- ✅ Rate limiting: 100 peticiones/15min
- ✅ Rate limiting escritura: 30 peticiones/15min
- ✅ Límite de tamaño: 10KB por petición
- ✅ Sanitización de query params
- ✅ Headers de seguridad con Helmet

## 🛠️ API Endpoints

### GET /api/items
Lista todos los items
```bash
curl http://localhost:3000/api/items
```

### GET /api/items/:id
Obtiene un item específico
```bash
curl http://localhost:3000/api/items/abc-123-def
```

### POST /api/items
Crea un nuevo item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mango",
    "description": "Fruta tropical",
    "price": 3500
  }'
```

### PUT /api/items/:id
Actualiza un item
```bash
curl -X PUT http://localhost:3000/api/items/abc-123-def \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mango Tommy",
    "price": 4000
  }'
```

### DELETE /api/items/:id
Elimina un item
```bash
curl -X DELETE http://localhost:3000/api/items/abc-123-def
```

## 🧪 Pruebas de Validación

### Probar validación de nombre inválido:
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "A", "price": 1000}'
```

Respuesta esperada: `400 Bad Request`

### Probar precio negativo:
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "price": -100}'
```

Respuesta esperada: `400 Bad Request`

## 🎨 Características del Frontend

- Interfaz moderna con Tailwind CSS
- Validación en tiempo real
- Feedback visual de errores
- Notificaciones toast
- Tabla responsive
- Confirmación de eliminación
- Estados de carga
- Manejo de errores

## 📦 Dependencias

### Backend
- express: Framework web
- dotenv: Variables de entorno
- uuid: Generación de IDs
- mongoose: ODM para MongoDB
- helmet: Seguridad HTTP
- cors: Cross-Origin Resource Sharing
- express-rate-limit: Límite de peticiones
- xss: Sanitización XSS

### Frontend
- react: Librería UI
- vite: Build tool
- tailwindcss: Framework CSS
- lucide-react: Iconos

## 🔒 Buenas Prácticas Implementadas

1. **Validación de doble capa** (frontend + backend)
2. **Sanitización de entradas** contra XSS
3. **Rate limiting** para prevenir abuso
4. **Manejo de errores** consistente
5. **Logging** para debugging
6. **Headers de seguridad** con Helmet
7. **CORS** configurado apropiadamente
8. **Validación de tipos** estricta
9. **Límites de tamaño** en peticiones
10. **Feedback visual** al usuario

## 🐛 Solución de Problemas

### Error de CORS
Asegúrate de que `ALLOWED_ORIGINS` en `.env` incluya el origen del frontend.

### Error de conexión MongoDB
MongoDB es opcional. El sistema funcionará con el archivo JSON local.

### Puerto en uso
Cambia `PORT` en `.env` o detén el proceso usando el puerto:
```bash
lsof -ti:3000 | xargs kill
```

## 📄 Licencia

ISC