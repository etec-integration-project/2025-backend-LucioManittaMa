# Etapa 1: Construcción
FROM node:18-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias con npm (usando npm install con opciones para reducir el tiempo)
RUN npm install --no-audit --no-fund

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación para producción
ARG VITE_GITHUB_CLIENT_ID
ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar el build generado en la etapa anterior al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]


