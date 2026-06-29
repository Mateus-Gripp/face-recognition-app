# 🚀 Guia Rápido - FaceID Lab

## Início Rápido (3 passos)

### 1. Instale as dependências
```bash
pnpm install
```

### 2. Baixe os modelos e configure o banco
```bash
cd apps/api
chmod +x download-models.sh
./download-models.sh
cd ../..

# Configure o banco de dados
pnpm prisma:migrate
```

### 3. Execute o projeto
```bash
pnpm dev
```

Pronto! Acesse:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000

## Resolução de Problemas

### Erro ao instalar dependências
Se houver erro com build scripts, execute:
```bash
pnpm install --config.ignore-scripts=false
```

### Erro com Prisma
```bash
cd apps/api
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
```

### Modelos não encontrados
```bash
cd apps/api
./download-models.sh
cd ../..
```

## Estrutura Mínima Necessária

```
face-recognition-app/
├── apps/
│   ├── web/          # Frontend em http://localhost:3000
│   └── api/          # Backend em http://localhost:5000
│       ├── models/   # Modelos face-api (criados pelo script)
│       ├── uploads/  # Imagens enviadas
│       └── dev.db    # Banco SQLite
└── pnpm-workspace.yaml
```

## Primeiro Uso

1. Acesse http://localhost:3000
2. Vá em "Cadastrar"
3. Preencha nome e matrícula
4. Permita acesso à câmera
5. Capture e cadastre
6. Teste em "Identificar"

Divirta-se! 🎉
