# Stage 1: Build the React Frontend
FROM node:20-alpine as build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./

# Map build args to VITE env vars
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

RUN npm run build

# Stage 2: Setup the Node.js Backend
FROM node:20-alpine
WORKDIR /app/server

# Copy backend dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy backend code
COPY server/ ./

# Copy built frontend from Stage 1
COPY --from=build /app/client/dist ../client/dist

# Map build args to runtime env vars for Backend
ARG META_ACCESS_TOKEN
ARG INSTAGRAM_ACCOUNT_ID
ARG SUPABASE_URL
ARG SUPABASE_SERVICE_KEY
ARG META_APP_SECRET
ARG VERIFY_TOKEN
ARG N8N_WEBHOOK_URL

ENV META_ACCESS_TOKEN=$META_ACCESS_TOKEN
ENV INSTAGRAM_ACCOUNT_ID=$INSTAGRAM_ACCOUNT_ID
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
ENV META_APP_SECRET=$META_APP_SECRET
ENV VERIFY_TOKEN=$VERIFY_TOKEN
ENV N8N_WEBHOOK_URL=$N8N_WEBHOOK_URL

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
