# ---------- build stage: no Node needed on the host ----------
FROM node:20-alpine AS build
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ---------- runtime stage: nginx serves the SPA and proxies /api ----------
FROM nginx:1.27-alpine

COPY --from=build /build/dist/pet-front-demo/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
