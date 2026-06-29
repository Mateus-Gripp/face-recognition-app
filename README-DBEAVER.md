# 🎯 Gerenciamento do Banco de Dados - DBeaver

## 📁 Localização do Banco
```
/home/mateus/Development/projects/faculdade/face-recognition-app/apps/api/prisma/dev.db
```

## 🚀 Início Rápido

### 1. Conectar no DBeaver
- **Tipo:** SQLite
- **Caminho:** `/home/mateus/Development/projects/faculdade/face-recognition-app/apps/api/prisma/dev.db`

### 2. Query Principal
```sql
SELECT * FROM people ORDER BY createdAt DESC;
```

## 📚 Documentação Completa
Veja o guia completo: **[GUIA-DBEAVER.md](GUIA-DBEAVER.md)**

Arquivo com queries prontas: **[queries-dbeaver.sql](queries-dbeaver.sql)**

## 🛠️ Comandos Úteis no Terminal

### Fazer Backup do Banco
```bash
pnpm db:backup
```

### Consultar Via Terminal
```bash
cd apps/api/prisma
sqlite3 dev.db "SELECT * FROM people;"
```

### Ver Estrutura
```bash
cd apps/api/prisma
sqlite3 dev.db ".schema people"
```

## ⚠️ IMPORTANTE

### ✅ Use APENAS o DBeaver
- **NÃO abra** o Prisma Studio
- **NÃO execute** `pnpm prisma:studio`
- Isso evita conflitos de "database locked"

### 🔒 Antes de Deletar Dados
**SEMPRE faça backup:**
```bash
pnpm db:backup
```

### 🚫 O que NÃO fazer
- ❌ Não edite `faceDescriptor` manualmente
- ❌ Não delete sem WHERE clause
- ❌ Não abra DBeaver + Prisma Studio ao mesmo tempo

## 📊 Queries Mais Usadas

### Contar Total
```sql
SELECT COUNT(*) FROM people;
```

### Buscar por Nome
```sql
SELECT * FROM people WHERE name LIKE '%joão%';
```

### Ver Quem Tem Documento
```sql
SELECT name, externalId FROM people
WHERE documentPath IS NOT NULL;
```

### Estatísticas
```sql
SELECT
    COUNT(*) as total,
    COUNT(documentPath) as com_documento
FROM people;
```

## 🔧 Solução de Problemas

### "Database is locked"
```bash
# Mate o Prisma Studio se estiver aberto
pkill -9 -f "prisma studio"

# Ou reinicie o DBeaver
# Clique direito na conexão → Disconnect → Connect
```

### Recriar Tabelas
```bash
cd apps/api
pnpm exec prisma db push
```

---

**📖 Para mais detalhes, consulte:** [GUIA-DBEAVER.md](GUIA-DBEAVER.md)
