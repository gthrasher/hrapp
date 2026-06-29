# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# DB credentials are injected at runtime via NEXT_PUBLIC_SUPABASE_* env vars
# set in the deployment environment — not baked in here.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080
CMD ["node", "server.js"]
