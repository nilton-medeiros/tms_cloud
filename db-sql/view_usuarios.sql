-- Atualizado em 2021-11-28 as 10:36 - Adicionado coluna user_apelido, menu_*, user_login_*, user_feriados_*
-- Atualizado em 2021-12-07 as 12:37 - Adicionado coluna departamento
CREATE OR REPLACE VIEW view_usuarios AS
SELECT t1.user_id,
       t1.user_login,
       t1.user_nome,
       t1.user_apelido,
       t1.departamento,
       t1.user_senha,
       t1.user_email,
       t1.user_celular,
       t1.perm_id,
       t1.user_ativo,
       t1.user_empresas,
       t1.user_login_das,
       t1.user_login_ate,
       t1.user_login_segunda,
       t1.user_login_terca,
       t1.user_login_quarta,
       t1.user_login_quinta,
       t1.user_login_sexta,
       t1.user_login_sabado,
       t1.user_login_domingo,
       t1.user_feriados_nacionais,
       t1.user_feriados_estaduais,
       t1.user_feriados_municipais,
       t1.menu_edi,
       t1.menu_ftp,
       t1.menu_lembretes,
       t1.menu_clientes,
       t1.menu_usuarios,
       t1.menu_empresas,
       t1.menu_configuracoes,
       t1.menu_log_sistema,
       t1.user_cadastrado_por,
       t1.user_cadastrado_em,
       t1.user_alterado_por,
       t1.user_alterado_em,
       t1.user_versao,
       t1.user_conect_id,
       t1.user_conected_em,
       t2.perm_grupo,
       t3.user_nome AS user_cadastrado_por_nome,
       t4.user_nome AS user_alterado_por_nome,
       group_concat(distinct t5.emp_id separator ',') AS user_empresas_id,
       group_concat(distinct concat_ws(' - ',t6.emp_sigla_cia,t6.emp_nome_fantasia) separator ', ') AS user_empresas_nome
FROM usuarios t1
LEFT JOIN permissoes t2 ON t1.perm_id = t2.perm_id
LEFT JOIN usuarios t3 ON t3.user_id = t1.user_cadastrado_por
LEFT JOIN usuarios t4 ON t4.user_id = t1.user_alterado_por
LEFT JOIN users_emps t5 ON t5.user_id = t1.user_id
LEFT JOIN empresas t6 ON t6.emp_id = t5.emp_id
GROUP BY t1.user_id
