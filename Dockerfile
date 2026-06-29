# ── Build stage ───────────────────────────────────────────────────────────────
FROM public.ecr.aws/docker/library/node:24-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
ARG WOLFI_BASE=cgr.dev/chainguard/wolfi-base@sha256:b78bb982194828b6c9c214230bf34d51944e2102ea8468f01ac21e5f99328efd
FROM ${WOLFI_BASE}

RUN apk add --no-cache nodejs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=builder --chown=nonroot:nonroot /app/public ./public

USER nonroot
EXPOSE 8080
CMD ["node", "server.js"]
