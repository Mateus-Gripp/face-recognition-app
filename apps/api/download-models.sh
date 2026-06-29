#!/bin/bash

# Script para baixar os modelos de reconhecimento facial

MODELS_DIR="./models"

mkdir -p $MODELS_DIR

echo "📦 Baixando modelos de reconhecimento facial..."

# URLs dos modelos
BASE_URL="https://raw.githubusercontent.com/vladmandic/face-api/master/model"

# Lista de arquivos para cada modelo
declare -a files=(
  "ssd_mobilenetv1_model-weights_manifest.json"
  "ssd_mobilenetv1_model-shard1"
  "face_landmark_68_model-weights_manifest.json"
  "face_landmark_68_model-shard1"
  "face_recognition_model-weights_manifest.json"
  "face_recognition_model-shard1"
  "face_recognition_model-shard2"
)

# Baixar cada arquivo
for file in "${files[@]}"
do
  echo "Baixando $file..."
  curl -L -o "$MODELS_DIR/$file" "$BASE_URL/$file"
done

echo "✅ Modelos baixados com sucesso!"
