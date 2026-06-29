# IMPORTANTE: Uso do DBeaver

## Problema Comum

Quando o **DBeaver** está aberto conectado ao banco de dados SQLite (`dev.db`), ele **bloqueia o arquivo** impedindo que a API acesse.

### Erro que aparece:
```
Invalid `prisma.person.findUnique()` invocation
Error querying the database: Error code 14: Unable to open the database file
```

## Solução

**SEMPRE feche o DBeaver antes de usar a aplicação!**

### Como usar corretamente:

1. **Durante desenvolvimento da aplicação**:
   - Feche completamente o DBeaver
   - Use a aplicação normalmente
   - A API terá acesso total ao banco de dados

2. **Para consultar/editar dados manualmente**:
   - Feche a aplicação (API)
   - Abra o DBeaver
   - Faça suas consultas/alterações
   - Feche o DBeaver
   - Inicie a aplicação novamente

## Alternativa: Use Prisma Studio

O Prisma Studio não bloqueia o banco de dados:

```bash
cd apps/api
pnpm exec prisma studio
```

Acesse em: `http://localhost:5555`

## Resumo

- **DBeaver**: Bloqueia o banco → Feche antes de usar a API
- **Prisma Studio**: Não bloqueia → Pode ficar aberto junto com a API
