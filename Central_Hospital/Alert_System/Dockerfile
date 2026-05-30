# Stage 1: Build binary
FROM golang:1.26-alpine AS builder

ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod tidy

COPY . .

RUN go build -o alert_service ./cmd/server

# Stage 2: Minimized runtime environment
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

COPY --from=builder /app/alert_service .

ENV GIN_MODE=release

EXPOSE 7030

CMD ["./alert_service"]
