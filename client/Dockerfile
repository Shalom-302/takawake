# syntax=docker/dockerfile:1.7
# ===================================================================
# Build du client Next.js (sortie standalone) — image runtime légère.
# pnpm via corepack ; pnpm-lock.yaml fait foi.
# ===================================================================
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# --- deps : couche invalidée seulement si les manifestes changent ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --- build : compile l'app ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ⚠️ Les variables NEXT_PUBLIC_* sont INLINÉES au build (pas au runtime).
# L'URL de l'API doit donc être fournie ICI via build-args (cf. compose).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- runner : n'embarque que le standalone + assets statiques ---
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
