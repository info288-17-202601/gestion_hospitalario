# Etapa 1: Construcción (Builder)
FROM golang:1.26-alpine AS builder

ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o auth_service ./cmd/server

# Etapa 2: Imagen final minimizada
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

COPY --from=builder /app/auth_service .

ENV GIN_MODE=release

EXPOSE 7050

CMD ["./auth_service"]
