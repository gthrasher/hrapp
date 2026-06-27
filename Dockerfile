# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* vars are embedded in the client bundle at build time.
# These are safe to bake in — they're intentionally exposed to the browser.
ENV NEXT_PUBLIC_SUPABASE_URL=https://hngddjorbdtstiqidxta.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZ2Rkam9yYmR0c3RpcWlkeHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mjk1MTEsImV4cCI6MjA4OTUwNTUxMX0._by97682QeYN_vezb4gCCwkY-yaBx7CQHX69nGdU5mo
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
