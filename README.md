# 📸 FaceID Lab

Sistema moderno de reconhecimento facial construído com React, Node.js e face-api.js. Projeto educacional para demonstrar conceitos de visão computacional e desenvolvimento full-stack.

## 🎯 Funcionalidades

- **Cadastro de Pessoas**: Registre pessoas no sistema com captura via webcam
- **Identificação Facial**: Identifique pessoas cadastradas através de reconhecimento facial
- **Interface Moderna**: Design responsivo e profissional com feedback visual
- **Alta Precisão**: Algoritmos de IA para detecção e comparação facial
- **Percentual de Confiança**: Visualize a confiança da identificação

## 🏗️ Arquitetura

```
face-recognition-app/
├── apps/
│   ├── web/              # Frontend React + Vite + TypeScript
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── styles/
│   │   └── package.json
│   └── api/              # Backend Node.js + Express + TypeScript
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── routes/
│       │   └── middleware/
│       ├── prisma/
│       └── package.json
├── packages/
│   └── shared/           # Código compartilhado
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **React Router** - Navegação
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM
- **SQLite** - Banco de dados
- **face-api.js** - Reconhecimento facial
- **Multer** - Upload de arquivos

## 📋 Pré-requisitos

- Node.js 18+
- pnpm 8+
- Webcam (para captura de imagens)

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
cd face-recognition-app
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

**Backend (apps/api/.env):**
```bash
cp apps/api/.env.example apps/api/.env
```

Edite `apps/api/.env` se necessário:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
NODE_ENV=development
FACE_RECOGNITION_THRESHOLD=0.5
```

**Frontend (apps/web/.env):**
```bash
cp apps/web/.env.example apps/web/.env
```

### 4. Baixe os modelos de reconhecimento facial

```bash
cd apps/api
chmod +x download-models.sh
./download-models.sh
cd ../..
```

### 5. Configure o banco de dados

```bash
pnpm prisma:migrate
```

Isso irá:
- Criar o banco de dados SQLite
- Executar as migrations
- Gerar o Prisma Client

### 6. Execute o projeto

**Opção 1: Executar tudo junto**
```bash
pnpm dev
```

**Opção 2: Executar separadamente**

Terminal 1 (Backend):
```bash
pnpm dev:api
```

Terminal 2 (Frontend):
```bash
pnpm dev:web
```

### 7. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🐳 Docker

Para executar com Docker:

```bash
docker-compose up --build
```

## 📚 Scripts Disponíveis

Na raiz do projeto:

- `pnpm dev` - Executa frontend e backend simultaneamente
- `pnpm dev:web` - Executa apenas o frontend
- `pnpm dev:api` - Executa apenas o backend
- `pnpm build` - Build de produção
- `pnpm prisma:migrate` - Executa migrations do Prisma
- `pnpm prisma:studio` - Abre o Prisma Studio

## 🎓 Como Usar

### Cadastrar uma Pessoa

1. Acesse a página "Cadastrar"
2. Preencha o nome e identificador (matrícula)
3. Clique em "Iniciar Câmera"
4. Posicione seu rosto na câmera
5. Clique em "Capturar Foto"
6. Clique em "Cadastrar Pessoa"

### Identificar uma Pessoa

1. Acesse a página "Identificar"
2. Clique em "Iniciar Câmera"
3. Posicione seu rosto na câmera
4. Clique em "Capturar Foto"
5. Clique em "Identificar"
6. Veja o resultado com nome e percentual de confiança

## 🔒 Segurança e Privacidade

Este é um projeto educacional. Para uso em produção, considere:

- Implementar autenticação e autorização
- Criptografar dados sensíveis
- Implementar HTTPS
- Adicionar rate limiting
- Implementar GDPR compliance
- Adicionar logs de auditoria
- Obter consentimento explícito dos usuários

## 🧪 Como Funciona

### Processo de Reconhecimento Facial

1. **Captura**: Imagem capturada via webcam
2. **Detecção**: Algoritmo SSD MobileNet detecta o rosto
3. **Landmarks**: Identificação de 68 pontos faciais
4. **Descriptor**: Geração de vetor de 128 dimensões
5. **Comparação**: Cálculo de distância euclidiana
6. **Identificação**: Match baseado no threshold de confiança

### Threshold de Confiança

O sistema usa um threshold configurável (padrão: 0.5) para determinar se uma identificação é válida. Quanto menor a distância euclidiana entre os descriptors, maior a confiança na identificação.

## 🤝 Contribuindo

Este é um projeto educacional. Sinta-se livre para:

- Fazer fork do projeto
- Criar issues
- Sugerir melhorias
- Adicionar novas funcionalidades

## ⚖️ Considerações Éticas

O reconhecimento facial deve ser usado de forma ética e responsável:

- ✓ Obtenha consentimento explícito
- ✓ Informe sobre coleta e uso de dados
- ✓ Implemente direito ao esquecimento
- ✓ Proteja dados contra acessos não autorizados
- ✓ Evite viés e discriminação
- ✓ Use apenas para fins autorizados

## 📄 Licença

MIT

## 👨‍💻 Autor

Projeto desenvolvido para fins educacionais.

---

**Aviso**: Este projeto é para fins educacionais. Sempre consulte especialistas jurídicos e de segurança antes de implementar reconhecimento facial em produção.
