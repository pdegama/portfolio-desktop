# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS web-build
WORKDIR /src/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
ARG VITE_API_BASE_URL=
ARG VITE_FRONTEND_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
RUN npm run build

FROM golang:1.26-bookworm AS go-build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=web-build /src/web/dist ./web/dist
RUN CGO_ENABLED=0 go build -o /out/portfolio .

FROM oven/bun:1-debian
WORKDIR /app
ENV GIN_MODE=release
ENV PORT=3001
ENV FILES_BASE_PATH=/data
RUN apt-get update \
  && apt-get install -y --no-install-recommends bash ca-certificates file \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /root/.bun/bin \
  && ln -s "$(command -v bunx)" /root/.bun/bin/bunx
RUN bun add -g aasvg
COPY --from=go-build /out/portfolio /app/portfolio
COPY --from=web-build /src/web/dist /app/web/dist
RUN mkdir -p /data
EXPOSE 3001
CMD ["/app/portfolio"]
