# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Runtime
FROM nginx:alpine
# Copy build output to nginx
# Based on the user's structure: dist/qms-frontend/browser
COPY --from=build /app/dist/qms-frontend/browser /usr/share/nginx/html
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
