# syntax=docker/dockerfile:1.7
# ===================================================================
# Build du client Next.js (sortie standalone) — image runtime légère.
# yarn (classic, fourni par l'image node) ; yarn.lock fait foi.
# Le monorepo est yarn-first (deps pinnées + `resolutions`, honorées par yarn) ;
# le pnpm-lock.yaml dérivait → build basculé sur yarn pour rester en phase.
# ===================================================================
FROM node:22-alpine AS base
WORKDIR /app

# --- deps : couche invalidée seulement si les manifestes changent ---
FROM base AS deps
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install --frozen-lockfile

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
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_OUTPUT_STANDALONE=true
RUN yarn build

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
