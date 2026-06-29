#!/usr/bin/env bash
set -u

PORTS=(3000 5000)

C_RESET='\033[0m'
C_DIM='\033[2m'
C_CYAN='\033[36m'
C_GREEN='\033[32m'
C_YELLOW='\033[33m'

step() { printf "${C_CYAN}▶${C_RESET}  %s\n" "$1"; }
ok()   { printf "${C_GREEN}✓${C_RESET}  %s\n" "$1"; }
skip() { printf "${C_DIM}·  %s${C_RESET}\n" "$1"; }

printf "\n${C_YELLOW}🧹 Limpando ambiente de desenvolvimento...${C_RESET}\n\n"

step "Parando containers Docker que publicam as portas 3000/5000"
stopped_any=0
for p in "${PORTS[@]}"; do
  ids=$(docker ps -q --filter "publish=$p" 2>/dev/null)
  if [ -n "$ids" ]; then
    echo "$ids" | xargs -r docker stop >/dev/null 2>&1
    for id in $ids; do
      ok "container $id parado (porta $p)"
      stopped_any=1
    done
  fi
done
[ "$stopped_any" = 0 ] && skip "nenhum container ocupando essas portas"

step "Derrubando serviços do docker-compose deste projeto"
if docker compose ps -q 2>/dev/null | grep -q .; then
  docker compose down --remove-orphans >/dev/null 2>&1
  ok "docker-compose finalizado"
else
  skip "nada subindo via docker-compose"
fi

step "Liberando processos locais nas portas 3000/5000"
freed_any=0
for p in "${PORTS[@]}"; do
  if fuser -s -n tcp "$p" 2>/dev/null; then
    fuser -k -n tcp "$p" >/dev/null 2>&1 || true
    ok "porta $p liberada"
    freed_any=1
  fi
done
[ "$freed_any" = 0 ] && skip "portas já estavam livres"

step "Encerrando túneis cloudflared órfãos"
if pgrep -x cloudflared >/dev/null 2>&1; then
  pkill -x cloudflared >/dev/null 2>&1 || true
  ok "cloudflared encerrado"
else
  skip "nenhum cloudflared em execução"
fi

printf "\n${C_GREEN}✅ Ambiente limpo — pode rodar ${C_RESET}${C_CYAN}pnpm dev${C_RESET}${C_GREEN} tranquilo!${C_RESET}\n\n"
