FROM node:20-alpine

# Instalar dependências necessárias para canvas
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads models data

# Baixar modelos de reconhecimento facial
RUN chmod +x download-models.sh && ./download-models.sh

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
