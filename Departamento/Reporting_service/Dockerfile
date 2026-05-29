FROM golang:alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o reporting_service_bin ./cmd/server/main.go

EXPOSE 7030

CMD ["./reporting_service_bin"]
