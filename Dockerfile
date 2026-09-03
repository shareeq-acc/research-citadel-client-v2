# Research Citadel — Next.js front end.
#
# Three stages so the shipped image contains the built application and nothing
# that built it: no compilers, no dev dependencies, no source.
#
# **The one thing to know about this image.** Next.js replaces every
# `process.env.NEXT_PUBLIC_*` with a literal string *at build time*, baking it
# into the JavaScript the browser downloads. It is not read at runtime, so
# setting it in compose or in a `.env` on the server does nothing. That makes
# the image environment-specific: an image built for production points at
# production, and staging needs its own build. Passing it at runtime instead is
# the usual first bug, and it fails silently — the app just calls
# `http://localhost:8000` from the user's browser and every request dies.

FROM node:20-alpine AS deps
WORKDIR /app
# libc6-compat: the SWC and Tailwind Oxide native binaries are glibc-linked and
# will not load on musl without it.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Where the browser should send API calls. Baked in here, for the reason above.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# An unprivileged user. Nothing here needs to write to its own files, and a
# compromised process should not be able to.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# The standalone output already contains a minimal server and its traced
# dependencies. Static assets and the public folder are not traced into it and
# have to be copied alongside, or every page loads without CSS.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
# 0.0.0.0, not localhost: bound to localhost the server is unreachable from
# outside its own container, which looks exactly like the app being down.
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
