# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=http://localhost:5000/api/v1
ARG VITE_SHORT_BASE=http://localhost:5000
RUN VITE_API_URL=$VITE_API_URL VITE_SHORT_BASE=$VITE_SHORT_BASE npm run build

# --- serve stage ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
