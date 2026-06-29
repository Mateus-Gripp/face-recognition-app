# 📘 Guia Completo - DBeaver para FaceID Lab

## 🔌 1. Conectar ao Banco de Dados

### Caminho do Banco:
```
/home/mateus/Development/projects/faculdade/face-recognition-app/apps/api/dev.db
```

### Passos para Conectar:
1. Abra o DBeaver
2. Clique em `Database` → `New Database Connection`
3. Selecione **SQLite**
4. Cole o caminho acima no campo **Path**
5. Clique em **Test Connection** (faça download dos drivers se pedido)
6. Clique em **Finish**

---

## 📊 2. Estrutura da Tabela `people`

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | TEXT | ID único (UUID) | ✅ Sim |
| `name` | TEXT | Nome completo | ✅ Sim |
| `externalId` | TEXT | Matrícula/Identificador | ✅ Sim (único) |
| `imagePath` | TEXT | Caminho da foto facial | ✅ Sim |
| `documentPath` | TEXT | Caminho do documento | ❌ Opcional |
| `faceDescriptor` | TEXT | Características faciais (JSON) | ✅ Sim |
| `createdAt` | DATETIME | Data de criação | ✅ Sim (automático) |
| `updatedAt` | DATETIME | Data de atualização | ✅ Sim (automático) |

---

## 🔍 3. Queries Essenciais

### Ver Todas as Pessoas
```sql
SELECT * FROM people ORDER BY createdAt DESC;
```

### Contar Total de Pessoas
```sql
SELECT COUNT(*) as total_pessoas FROM people;
```

### Ver Apenas Dados Principais
```sql
SELECT
    name as "Nome",
    externalId as "Matrícula",
    CASE
        WHEN documentPath IS NOT NULL THEN '✓ SIM'
        ELSE '✗ NÃO'
    END as "Tem Documento",
    datetime(createdAt, 'localtime') as "Cadastrado em"
FROM people
ORDER BY createdAt DESC;
```

### Buscar por Nome
```sql
SELECT * FROM people
WHERE name LIKE '%teste%'
ORDER BY createdAt DESC;
```

### Buscar por Matrícula
```sql
SELECT * FROM people
WHERE externalId = '8888';
```

### Ver Quem Tem Documento Cadastrado
```sql
SELECT
    name,
    externalId,
    documentPath
FROM people
WHERE documentPath IS NOT NULL
ORDER BY createdAt DESC;
```

### Pessoas Cadastradas Hoje
```sql
SELECT * FROM people
WHERE DATE(createdAt) = DATE('now', 'localtime')
ORDER BY createdAt DESC;
```

### Pessoas Cadastradas nos Últimos 7 Dias
```sql
SELECT
    name,
    externalId,
    datetime(createdAt, 'localtime') as cadastro
FROM people
WHERE createdAt >= datetime('now', '-7 days', 'localtime')
ORDER BY createdAt DESC;
```

### Estatísticas Gerais
```sql
SELECT
    COUNT(*) as "Total de Pessoas",
    COUNT(documentPath) as "Com Documento",
    COUNT(*) - COUNT(documentPath) as "Sem Documento",
    datetime(MIN(createdAt), 'localtime') as "Primeiro Cadastro",
    datetime(MAX(createdAt), 'localtime') as "Último Cadastro"
FROM people;
```

---

## 🗑️ 4. Gerenciar Dados

### Deletar Uma Pessoa Específica (por ID)
```sql
DELETE FROM people WHERE id = 'cole-o-id-aqui';
```

### Deletar por Matrícula
```sql
DELETE FROM people WHERE externalId = '8888';
```

### ⚠️ CUIDADO: Deletar TODAS as Pessoas
```sql
DELETE FROM people;
```

### Verificar se a Deleção Funcionou
```sql
SELECT COUNT(*) FROM people;
```

---

## 🔧 5. Manutenção do Banco

### Ver Estrutura Completa da Tabela
```sql
PRAGMA table_info(people);
```

### Ver Índices Criados
```sql
SELECT * FROM sqlite_master
WHERE type='index' AND tbl_name='people';
```

### Ver Todas as Tabelas do Banco
```sql
SELECT name FROM sqlite_master WHERE type='table';
```

### Tamanho do Banco de Dados
```sql
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();
```

---

## 📝 6. Exportar Dados

### No DBeaver:
1. Execute a query que você quer exportar
2. Clique direito na tabela de resultados
3. Escolha **Export Data**
4. Selecione o formato:
   - **CSV** - Para Excel/Google Sheets
   - **JSON** - Para outras aplicações
   - **SQL** - Para backup
   - **HTML** - Para relatórios

---

## 🎯 7. Queries Avançadas

### Ver Foto e Documento de Uma Pessoa
```sql
SELECT
    name,
    externalId,
    'http://localhost:5000/' || imagePath as url_foto,
    CASE
        WHEN documentPath IS NOT NULL
        THEN 'http://localhost:5000/' || documentPath
        ELSE 'Sem documento'
    END as url_documento
FROM people
WHERE externalId = '8888';
```

### Listar Pessoas com Duplicatas de Nome
```sql
SELECT name, COUNT(*) as quantidade
FROM people
GROUP BY name
HAVING COUNT(*) > 1;
```

### Ver Descritor Facial (características faciais)
```sql
SELECT
    name,
    externalId,
    substr(faceDescriptor, 1, 100) || '...' as preview_descriptor
FROM people;
```

---

## ⚡ 8. Atalhos do DBeaver

| Atalho | Ação |
|--------|------|
| `Ctrl + Enter` | Executar query atual |
| `Ctrl + Shift + Enter` | Executar todas as queries |
| `Ctrl + Space` | Auto-complete |
| `Ctrl + /` | Comentar/Descomentar linha |
| `F3` | Abrir nova aba SQL |
| `Ctrl + F` | Buscar na query |

---

## 🚨 9. Solução de Problemas

### "Database is locked"
- Feche o Prisma Studio se estiver aberto
- Feche outras conexões do DBeaver ao mesmo banco

### "No such table: people"
Execute no terminal:
```bash
cd /home/mateus/Development/projects/faculdade/face-recognition-app/apps/api
pnpm exec prisma db push
```

### Reconectar ao Banco
1. Clique direito na conexão
2. `Disconnect`
3. Clique direito novamente
4. `Connect`

---

## 📚 10. Boas Práticas

✅ **SEMPRE faça backup antes de deletar:**
```bash
cp apps/api/dev.db apps/api/dev.db.backup-$(date +%Y%m%d-%H%M%S)
```

✅ **Use transações para operações críticas:**
```sql
BEGIN TRANSACTION;
-- suas queries aqui
COMMIT; -- ou ROLLBACK para desfazer
```

✅ **Não edite o campo `faceDescriptor` manualmente** (quebra o reconhecimento facial)

✅ **Sempre use WHERE em DELETE/UPDATE** para evitar deletar tudo por engano

❌ **Nunca deixe o Prisma Studio e DBeaver abertos juntos** (pode causar lock)

---

## 🎓 11. Exemplos de Uso Comum

### Cenário 1: "Quantas pessoas cadastrei hoje?"
```sql
SELECT COUNT(*) FROM people
WHERE DATE(createdAt) = DATE('now', 'localtime');
```

### Cenário 2: "Quem ainda não enviou documento?"
```sql
SELECT name, externalId FROM people
WHERE documentPath IS NULL
ORDER BY name;
```

### Cenário 3: "Exportar lista completa para Excel"
```sql
SELECT
    name as "Nome Completo",
    externalId as "Matrícula",
    CASE
        WHEN documentPath IS NOT NULL THEN 'Sim'
        ELSE 'Não'
    END as "Tem Documento",
    strftime('%d/%m/%Y %H:%M', createdAt) as "Data de Cadastro"
FROM people
ORDER BY name;
```
Depois: Clique direito → Export Data → CSV

### Cenário 4: "Encontrar pessoa por parte do nome"
```sql
SELECT * FROM people
WHERE LOWER(name) LIKE LOWER('%joão%')
ORDER BY createdAt DESC;
```

---

**📌 Dica:** Salve suas queries favoritas como "Bookmarks" no DBeaver:
1. Execute a query
2. Clique direito no editor
3. `Add Bookmark` → Dê um nome
4. Acesse depois em `Database Navigator` → `Bookmarks`

---

**🎯 Arquivo de Queries Prontas:** [queries-dbeaver.sql](queries-dbeaver.sql)
