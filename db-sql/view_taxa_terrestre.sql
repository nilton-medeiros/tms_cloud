-- Ultima atualizacao em 2023-03-18 as 13:15 - Baixado do banco de dados - atualizado lwlog e alexpress
CREATE OR REPLACE VIEW view_taxa_terrestre AS
SELECT t1.tx_id,
       t1.emp_id,
       t1.clie_id,
       t1.cc_id,
       t1.cid_origem_id,
       t1.cid_id,
       t1.tx_nota,
       t1.tx_por_peso,
       t1.tx_valor,
       t1.tx_ate_kg,
       t1.tx_excedente,
       t1.tx_cadastrado_por,
       t1.tx_cadastrado_em,
       t1.tx_alterado_por,
       t1.tx_alterado_em,
       t1.tx_versao,
       IFNULL(t4.clie_razao_social,'(todos clientes)') AS clie_razao_social,
       t6.cc_titulo,
       t7.cid_codigo_municipio AS cid_origem_codigo_municipio,
       t7.cid_municipio AS cid_origem_municipio,
       t7.cid_uf AS cid_origem_uf,
       t7.cid_sigla AS cid_origem_sigla,
       t7.cid_nome_aeroporto AS cid_origem_nome_aeroporto,
       IF(ISNULL(t1.cid_origem_id),'(todas cidades de origem)',CONCAT(t7.cid_uf,' - ',t7.cid_municipio,IF(((t7.cid_nome_aeroporto IS NOT NULL) AND (t7.cid_nome_aeroporto <> '') AND (t7.cid_sigla IS NOT NULL) AND (t7.cid_sigla <> '')),CONCAT(' (',t7.cid_sigla,' - ',t7.cid_nome_aeroporto,')'),''))) AS cid_origem_nome,
       t5.cid_codigo_municipio AS cid_destino_codigo_municipio,
       t5.cid_municipio AS cid_destino_municipio,
       t5.cid_uf AS cid_destino_uf,
       t5.cid_sigla AS cid_destino_sigla,
       t5.cid_nome_aeroporto AS cid_destino_nome_aeroporto,
       IF(ISNULL(t1.cid_id),'(todas cidades de destino)',CONCAT(t5.cid_uf,' - ',t5.cid_municipio,IF(((t5.cid_nome_aeroporto IS NOT NULL) AND (t5.cid_nome_aeroporto <> '') AND (t5.cid_sigla IS NOT NULL) AND (t5.cid_sigla <> '')),CONCAT(' (',t5.cid_sigla,' - ',t5.cid_nome_aeroporto,')'),''))) AS cid_destino_nome,
       t2.user_nome AS tx_cadastrado_por_nome,
       t3.user_nome AS tx_alterado_por_nome 
FROM taxas t1 
LEFT JOIN usuarios t2 ON t2.user_id = t1.tx_cadastrado_por
LEFT JOIN usuarios t3 ON t3.user_id = t1.tx_alterado_por
LEFT JOIN clientes t4 ON t4.clie_id = t1.clie_id
LEFT JOIN cidades t5 ON t5.cid_id = t1.cid_id
LEFT JOIN composicao_calculo t6 ON t6.cc_id = t1.cc_id
LEFT JOIN cidades t7 ON t7.cid_id = t1.cid_origem_id
