#!/bin/bash

echo "Limpiando entorno previo..."
docker compose -f docker-compose-departamento.yml down > /dev/null 2>&1
pkill rfid_bridge || true

echo "Levantando Inventory Service en Docker..."
docker compose --env-file ./Departamento/.env -f docker-compose-departamento.yml up -d inventory_service

echo "Levantando Microservicio RFID en background..."
cd Departamento/rfid_bridge
./rfid_bridge &
RFID_PID=$!
cd ../..

# Configurar trap para limpiar todo al presionar Ctrl+C
trap "echo -e '\nApagando todo...'; kill $RFID_PID; docker compose -f docker-compose-departamento.yml down; exit" SIGINT SIGTERM

echo "Levantando Frontend (Supplies Registry)..."
cd Departamento/Supplies_Registry
npm run dev
