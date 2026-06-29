#!/bin/bash

echo "🚀 FaceID Lab - Setup e Execução Automática"
echo "=========================================="

# Configurar pnpm
export PNPM_HOME="/home/mateus/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# 1. Verificar e instalar dependências
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  pnpm install --config.ignore-scripts=false
else
  echo "✓ Dependências já instaladas"
fi

# 2. Verificar e baixar modelos
if [ ! -d "apps/api/models" ] || [ -z "$(ls -A apps/api/models)" ]; then
  echo "📥 Baixando modelos de reconhecimento facial..."
  cd apps/api
  chmod +x download-models.sh
  ./download-models.sh
  cd ../..
else
  echo "✓ Modelos já baixados"
fi

# 3. Verificar e configurar .env
if [ ! -f "apps/api/.env" ]; then
  echo "⚙️ Criando arquivo .env..."
  cp apps/api/.env.example apps/api/.env
else
  echo "✓ Arquivo .env já existe"
fi

# 4. Verificar e criar banco de dados
if [ ! -f "apps/api/dev.db" ]; then
  echo "🗄️ Configurando banco de dados..."
  cd apps/api
  pnpm exec prisma migrate dev --name init --skip-generate
  pnpm exec prisma generate
  cd ../..
else
  echo "✓ Banco de dados já configurado"
fi

# 5. Criar diretórios necessários
mkdir -p apps/api/uploads
mkdir -p apps/api/data

echo ""
echo "✅ Setup completo!"
echo ""
echo "🚀 Iniciando aplicação..."
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:5000"
echo ""
echo "Pressione Ctrl+C para parar"
echo ""

# 6. Executar aplicação
pnpm dev
