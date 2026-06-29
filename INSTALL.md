# 📦 Instalação Completa - FaceID Lab

## Passo 1: Instalar Dependências do Sistema

O projeto precisa de bibliotecas nativas para o módulo `canvas`. Execute:

```bash
sudo apt-get update
sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

## Passo 2: Recompilar Canvas

Depois de instalar as dependências do sistema:

```bash
cd /home/mateus/Development/projects/faculdade/face-recognition-app
export PNPM_HOME="/home/mateus/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
pnpm rebuild canvas
```

## Passo 3: Executar o Projeto

Agora pode usar o script automático:

```bash
./start.sh
```

OU executar manualmente:

```bash
pnpm dev
```

---

## Solução Alternativa (Sem Canvas)

Se não puder instalar as dependências do sistema, vou criar uma versão alternativa que processa tudo no frontend.
