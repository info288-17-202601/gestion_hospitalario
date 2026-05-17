# Etapa 1: Construcción (Builder)
FROM golang:1.26-alpine AS builder

# Habilitar Go modules y deshabilitar CGO para un binario estático (recomendado para Alpine)
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /app

# Copiar primero los archivos de dependencias para aprovechar el caché de Docker
COPY go.mod go.sum ./
RUN go mod download

# Copiar el resto del código (incluyendo la carpeta docs/ que ya generaste localmente)
COPY . .

# Compilar la aplicación. El binario se llamará 'inventory_service'
RUN go build -o inventory_service ./cmd/server

# Etapa 2: Imagen final minimizada
FROM alpine:latest

# Instalar certificados raíz (necesarios si tu API hace peticiones HTTPS a otros servicios) y tzdata para zonas horarias
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copiar el binario compilado desde la etapa 'builder'
COPY --from=builder /app/inventory_service .

# Establecer Gin en modo producción
ENV GIN_MODE=release

# Exponer el puerto que configuramos (7010)
EXPOSE 7010

# Comando para ejecutar la aplicación
CMD ["./inventory_service"]
