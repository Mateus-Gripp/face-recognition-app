-- ============================================
-- QUERIES PARA USAR NO DBEAVER
-- Sistema de Reconhecimento Facial - FaceID Lab
-- ============================================

-- 1. Ver todas as pessoas cadastradas
SELECT * FROM people ORDER BY createdAt DESC;

-- 2. Contar total de pessoas
SELECT COUNT(*) as total FROM people;

-- 3. Ver apenas nomes e matrículas
SELECT name, externalId, createdAt FROM people;

-- 4. Ver quem tem documento cadastrado
SELECT
    name,
    externalId,
    CASE
        WHEN documentPath IS NOT NULL THEN 'SIM'
        ELSE 'NÃO'
    END as tem_documento,
    documentPath
FROM people
ORDER BY createdAt DESC;

-- 5. Ver estrutura da tabela
PRAGMA table_info(people);

-- 6. Ver índices criados
SELECT * FROM sqlite_master WHERE type='index' AND tbl_name='people';

-- 7. Buscar pessoa por nome (parcial)
SELECT * FROM people WHERE name LIKE '%teste%';

-- 8. Buscar pessoa por matrícula
SELECT * FROM people WHERE externalId = '8888';

-- 9. Ver pessoas cadastradas hoje
SELECT * FROM people
WHERE DATE(createdAt) = DATE('now', 'localtime');

-- 10. Ver pessoas cadastradas nos últimos 7 dias
SELECT * FROM people
WHERE createdAt >= datetime('now', '-7 days', 'localtime')
ORDER BY createdAt DESC;

-- 11. Estatísticas gerais
SELECT
    COUNT(*) as total_pessoas,
    COUNT(documentPath) as com_documento,
    COUNT(*) - COUNT(documentPath) as sem_documento
FROM people;

-- ============================================
-- QUERIES ADMINISTRATIVAS (CUIDADO!)
-- ============================================

-- Deletar uma pessoa específica (substitua o ID)
-- DELETE FROM people WHERE id = 'ID_AQUI';

-- Deletar por matrícula
-- DELETE FROM people WHERE externalId = '8888';

-- CUIDADO: Deletar TODAS as pessoas
-- DELETE FROM people;

-- Resetar contador de IDs (apenas se deletou tudo)
-- DELETE FROM sqlite_sequence WHERE name='people';
