Ext.define('Filtro.data.Model', {
	extend: 'Ext.data.Model',
	
	fields: [
		{name:'campo_rotulo', type:'string'},
		{name:'operador_rotulo', type:'string'},
		{name:'campo', type:'string'},
		{name:'operador', type:'string'},
		{name:'resultado', type:'auto'}
	]
});

Ext.define('Endereco.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'full',
	
	fields: [
		{name:'endereco_numero', type:'string'},
		{name:'endereco', type:'string'},
		{name:'numero', type:'int'},
		{name:'bairro', type:'string'},
		{name:'cidade', type:'string'},
		{name:'estado', type:'string'},
		{name:'cep', type:'string'},
		{name:'full', type:'string'}
	]
});

Ext.define('SystemLog.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'sys_log_id',
	
	fields: [
		{name:'sys_log_id', type:'int'},
		{name:'sys_log_data_evento', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'sys_log_tabela', type:'string', defaultValue:''},
		{name:'sys_log_evento', type:'string', defaultValue:''},
		{name:'sys_log_evento_id', type:'int'},
		{name:'sys_log_descricao', type:'string', defaultValue:''},
		{name:'sys_log_usuario', type:'string', defaultValue:''}
	]
});

Ext.define('Cidade.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'cid_id',
	
	fields: [
		{name:'cid_id', type:'int'},
		{name:'cid_nome', type:'string', defaultValue:''},
		{name:'cid_nome_completo', type:'string', defaultValue:''},
		
		{name:'cid_codigo_municipio', type:'int', defaultValue:0},
		{name:'cid_municipio', type:'string', defaultValue:''},
		{name:'cid_uf', type:'string', defaultValue:''},
		{name:'cid_sigla', type:'string', defaultValue:''},
		{name:'cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_suframa', type:'boolean', defaultValue:0},
		{name:'cid_valor_sefaz', type:'float', defaultValue:0},
		
		{name:'cid_cadastrado_por', type:'int'},
		{name:'cid_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cid_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cid_alterado_por', type:'int'},
		{name:'cid_alterado_por_nome', type:'string', defaultValue:''},
		{name:'cid_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cid_versao', type:'int', defaultValue:0}
	]
});

Ext.define('Empresa.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'emp_id',
	
	fields: [
		{name:'emp_id', type:'int'},
		
		{name:'cid_id_fk', type:'int'},
		{name:'cid_nome', type:'string', defaultValue:''},
		{name:'cid_codigo_municipio', type:'int', defaultValue:0},
		{name:'cid_municipio', type:'string', defaultValue:''},
		{name:'cid_uf', type:'string', defaultValue:''},
		{name:'cid_sigla', type:'string', defaultValue:''},
		{name:'cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_suframa', type:'boolean', defaultValue:0},
		{name:'cid_valor_sefaz', type:'float', defaultValue:0},
		
		{name:'emp_login', type:'string', defaultValue:''},
		{name:'emp_razao_social', type:'string', defaultValue:''},
		{name:'emp_nome_fantasia', type:'string', defaultValue:''},
		{name:'emp_sigla_cia', type:'string', defaultValue:''},
		{name:'emp_cnpj', type:'string', defaultValue:''},
		{name:'emp_inscricao_estadual', type:'string', defaultValue:''},
		
		{name:'emp_endereco', type:'string', defaultValue:''},
		{name:'emp_logradouro', type:'string', defaultValue:''},
		{name:'emp_numero', type:'string', defaultValue:''},
		{name:'emp_complemento', type:'string', defaultValue:''},
		{name:'emp_bairro', type:'string', defaultValue:''},
		{name:'emp_cep', type:'string', defaultValue:''},
		
		{name:'emp_fone1', type:'string', defaultValue:''},
		{name:'emp_fone2', type:'string', defaultValue:''},
		{name:'emp_tipo_emitente', type:'string', defaultValue:'CTE'},
		{name:'emp_modal', type:'string', defaultValue:'Aereo'},
		{name:'emp_tipo_calculo_cubagem', type:'string', defaultValue:'AEREO'},
		
		{name:'emp_ativa', type:'boolean', defaultValue:0},
		{name:'emp_simples_nacional', type:'boolean', defaultValue:0},
		{name:'emp_email_CCO', type:'boolean', defaultValue:0},
		{name:'emp_aba_doc_trans_ant', type:'boolean', defaultValue:0},
		{name:'emp_aba_prod_perig', type:'boolean', defaultValue:0},
		{name:'emp_aba_veic_novos', type:'boolean', defaultValue:0},
		{name:'emp_aba_vale_pedagio', type:'boolean', defaultValue:0},
		{name:'emp_aba_veiculos', type:'boolean', defaultValue:0},
		{name:'emp_aba_motoristas', type:'boolean', defaultValue:0},
		
		{name:'emp_PIS', type:'float', defaultValue:0},
		{name:'emp_COFINS', type:'float', defaultValue:0},
		{name:'emp_taxa_min_nac', type:'float', defaultValue:0},
		{name:'emp_dias_vecto', type:'int', defaultValue:11},
		
		{name:'emp_ambiente_sefaz', type:'int', defaultValue:2},
		{name:'emp_RNTRC', type:'string', defaultValue:''},
		{name:'emp_cte_modelo', type:'string', defaultValue:'57'},
		{name:'emp_cte_serie', type:'string', defaultValue:'000'},
		{name:'emp_dacte_layout', type:'string', defaultValue:'RETRATO'},
		{name:'emp_versao_layout_xml', type:'float', defaultValue:2},
		{name:'emp_seguradora', type:'string', defaultValue:''},
		{name:'emp_apolice', type:'string', defaultValue:''},
		{name:'emp_faturamento', type:'string', defaultValue:''},
		
		{name:'emp_email_contabil', type:'string', defaultValue:''},
		{name:'emp_email_comercial', type:'string', defaultValue:''},
		{name:'emp_enviar_cte', type:'string', defaultValue:'Ambos'},
		{name:'emp_logotipo', type:'string', defaultValue:''},
		
		{name:'emp_cadastrado_por', type:'int'},
		{name:'emp_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'emp_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'emp_alterado_por', type:'int'},
		{name:'emp_alterado_por_nome', type:'string', defaultValue:''},
		{name:'emp_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'emp_versao', type:'int', defaultValue:0},
		{name:'emp_margem_lucro_min', type:'int', defaultValue:0},
		{name:'emp_margem_lucro_padrao', type:'int', defaultValue:0}
	]
});

Ext.define('Usuario.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'user_id',
	
	fields: [
		{name:'user_id', type:'int'},
		{name:'user_conect_id', type:'int'},
	
		{name:'perm_id', type:'int'},
		{name:'perm_grupo', type:'string', defaultValue:''},
		
		{name:'user_login', type:'string', defaultValue:''},
		{name:'user_email', type:'string', defaultValue:''},
		{name:'user_senha', type:'string', defaultValue:''},
		
		{name:'user_versao', type:'int'},
		{name:'user_ativo', type:'boolean', defaultValue:1},
		{name:'user_nome', type:'string', defaultValue:''},
		{name:'user_celular', type:'string', defaultValue:''},
		{name:'user_empresas_id', type:'string', defaultValue:''},
		{name:'user_empresas_nome', type:'string', defaultValue:''},
		
		{name:'user_cadastrado_por', type:'int'},
		{name:'user_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'user_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'user_alterado_por', type:'int'},
		{name:'user_alterado_por_nome', type:'string', defaultValue:''},
		{name:'user_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'}
	]
});

Ext.define('Cliente.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'clie_id',
	
	fields: [
		{name:'clie_id', type:'int'},
		{name:'clie_ativo', type:'boolean', defaultValue:1},
		{name:'emp_id', type:'int'},
		{name:'clie_compartilhado', type:'boolean', defaultValue:0},
		
		{name:'clie_categoria', type:'int', defaultValue:4},
		{name:'clie_categoria_nome', type:'string', defaultValue:''},
		
		{name:'clie_tipo_documento', type:'string', defaultValue:'CNPJ'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_nome_fantasia', type:'string', defaultValue:''},
		
		{name:'clie_tipo_estabelecimento', type:'string', defaultValue:'PESSOA FÍSICA'},
		{name:'clie_cnpj', type:'string', defaultValue:''},
		{name:'clie_inscr_municipal', type:'string', defaultValue:''},
		{name:'clie_inscr_estadual', type:'string', defaultValue:''},
		
		{name:'clie_ie_isento', type:'boolean', defaultValue:0},
		{name:'clie_contrib_icms', type:'boolean', defaultValue:0},
		
		{name:'clie_cpf', type:'string', defaultValue:''},
		{name:'clie_rg', type:'string', defaultValue:''},
		{name:'clie_situacao_cadastral', type:'string', defaultValue:''},
		
		{name:'clie_logradouro', type:'string', defaultValue:''},
		{name:'clie_numero', type:'string', defaultValue:''},
		{name:'clie_complemento', type:'string', defaultValue:''},
		{name:'clie_bairro', type:'string', defaultValue:''},
		{name:'clie_cep', type:'string', defaultValue:''},
		
		{name:'cid_id', type:'int'},
		{name:'cid_nome', type:'string', defaultValue:''},
		{name:'cid_codigo_municipio', type:'int', defaultValue:0},
		{name:'cid_municipio', type:'string', defaultValue:''},
		{name:'cid_uf', type:'string', defaultValue:''},
		{name:'cid_sigla', type:'string', defaultValue:''},
		{name:'cid_nome_aeroporto', type:'string', defaultValue:''},
		
		{name:'clie_fone1', type:'string', defaultValue:''},
		{name:'clie_fone2', type:'string', defaultValue:''},
		{name:'clie_seguradora', type:'string', defaultValue:''},
		{name:'clie_apolice', type:'string', defaultValue:''},
		{name:'clie_forma_aplicar_seguro', type:'string', defaultValue:'Nenhum'},
		
		{name:'clie_seguro_desconto', type:'float', defaultValue:0},
		{name:'clie_seguro_intra_estadual', type:'float', defaultValue:0},
		{name:'clie_seguro_inter_estadual', type:'float', defaultValue:0},
		{name:'clie_seguro_adval_tipo_1', type:'float', defaultValue:0},
		{name:'clie_seguro_adval_tipo_2', type:'float', defaultValue:0},
		
		{name:'clie_tom_aceita_frete_pago', type:'boolean', defaultValue:1},
		{name:'clie_tom_aceita_frete_a_pagar', type:'boolean', defaultValue:1},
		{name:'clie_tom_aceita_frete_outros', type:'boolean', defaultValue:0},
		{name:'clie_des_aceita_frete_a_pagar', type:'boolean', defaultValue:0},
		{name:'clie_tom_aceita_suframa', type:'boolean', defaultValue:1},
		
		{name:'clie_des_inscricao_suframa', type:'string', defaultValue:''},
		{name:'clie_tom_taxa_sefaz', type:'int', defaultValue:3},
		{name:'clie_tom_taxa_sefaz_nome', type:'string', defaultValue:'Não cobrar'},
		
		{name:'clie_codigo_transporte', type:'string', defaultValue:''},
		{name:'clie_tom_tabela', type:'string', defaultValue:'NACIONAL'},
		
		{name:'rota_id', type:'int', dateFormat:'Y-m-d H:i:s'},
		{name:'rota_nome', type:'string', defaultValue:''},
		{name:'rota_codigo', type:'string', defaultValue:''},
		{name:'rota_descricao', type:'string', defaultValue:''},
		
		{name:'clie_sequencia_rota', type:'int'},
		
		{name:'clie_cadastrado_por', type:'int'},
		{name:'clie_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'clie_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'clie_alterado_por', type:'int'},
		{name:'clie_alterado_por_nome', type:'string', defaultValue:''},
		{name:'clie_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'clie_versao', type:'int', defaultValue:0},
		
		{name:'cliefat_status_cobranca', type:'string', defaultValue:'F'},
		{name:'cliefat_tipo_carteira', type:'string', defaultValue:'BANCARIA'},
		{name:'cliefat_dias_ao_vecto', type:'int', defaultValue:0},
		{name:'cliefat_dias_protestar', type:'int', defaultValue:0},
		{name:'cliefat_dias_em_atraso', type:'int', defaultValue:0},
		
		{name:'prp_id', type:'int'},
		{name:'prp_praca_pagto', type:'string', defaultValue:''},
		
		{name:'cliefat_email', type:'string', defaultValue:''},
		{name:'cliefat_endereco_o_mesmo', type:'boolean', defaultValue:0},
		{name:'cliefat_logradouro', type:'string', defaultValue:''},
		{name:'cliefat_numero', type:'string', defaultValue:''},
		{name:'cliefat_complemento', type:'string', defaultValue:''},
		{name:'cliefat_bairro', type:'string', defaultValue:''},
		{name:'cliefat_cep', type:'string', defaultValue:''},
		
		{name:'cid_id', type:'int'},
		{name:'cliefat_cid_nome', type:'string', defaultValue:''},
		
		{name:'cliefat_obs_duplicata', type:'string', defaultValue:''},
		
		{name:'cliefat_cadastrado_por', type:'int'},
		{name:'cliefat_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cliefat_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cliefat_alterado_por', type:'int'},
		{name:'cliefat_alterado_por_nome', type:'string', defaultValue:''},
		{name:'cliefat_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cliefat_versao', type:'int', defaultValue:0},
		{name:'auto_inadimplente', type:'boolean', defaultValue:0},
		
		{name:'clie_gris_percentual', type:'float', defaultValue:0},
		{name:'clie_gris_valor_minimo', type:'float', defaultValue:0},
		
		{name:'clie_login', type:'string', defaultValue:''},
		{name:'clie_senha', type:'string', defaultValue:''},
		{name:'clie_lista_emails_ocorrencias', type:'string', defaultValue:''}
	]
});

Ext.define('Contato.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'con_id',
	
	fields: [
		{name:'con_id', type:'int'},
		{name:'clie_id', type:'int'},
	
		{name:'con_nome', type:'string', defaultValue:''},
		{name:'con_setor', type:'string', defaultValue:''},
		{name:'con_funcao', type:'string', defaultValue:''},
		{name:'con_fone', type:'string', defaultValue:''},
		{name:'con_ramal', type:'string', defaultValue:''},
		{name:'con_celular', type:'string', defaultValue:''},
		{name:'con_email', type:'string', defaultValue:''},
		{name:'con_nascimento', type:'date', dateFormat:'Y-m-d'},
		{name:'con_nota', type:'string', defaultValue:''},
		
		{name:'con_email_cte', type:'string', defaultValue:''},
		{name:'con_recebe_cte', type:'string', defaultValue:'N'},
		
		{name:'con_cadastrado_por', type:'int'},
		{name:'con_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'con_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'con_alterado_por', type:'int'},
		{name:'con_alterado_por_nome', type:'string', defaultValue:''},
		{name:'con_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'con_versao', type:'int', defaultValue:0}
	]
});

Ext.define('Permissao.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'perm_id',
	
	fields: [
		{name:'perm_id', type:'int'},
		{name:'perm_grupo', type:'string', defaultValue:''},
	
		{name:'perm_menu_empresas', type:'boolean', defaultValue:0},
		{name:'perm_menu_usuarios', type:'boolean', defaultValue:0},
		{name:'perm_menu_permissoes', type:'boolean', defaultValue:0},
		{name:'perm_menu_log_eventos', type:'boolean', defaultValue:0},
		
		{name:'perm_menu_composicao_frete', type:'boolean', defaultValue:0},
		{name:'perm_menu_composicao_calculo', type:'boolean', defaultValue:0},
		{name:'perm_menu_gerenciar_cte', type:'boolean', defaultValue:0},
		{name:'perm_menu_inutilizar_cte', type:'boolean', defaultValue:0},
		{name:'perm_menu_consulta_inutilizacoes', type:'boolean', defaultValue:0},
		
		{name:'perm_menu_clientes', type:'boolean', defaultValue:0},
		{name:'perm_menu_municipios', type:'boolean', defaultValue:0},
		{name:'perm_menu_grupo_tarifas', type:'boolean', defaultValue:0},
		{name:'perm_menu_iata_imp_codes', type:'boolean', defaultValue:0},
		{name:'perm_menu_produtos', type:'boolean', defaultValue:0},
		{name:'perm_menu_rotas_entregas', type:'boolean', defaultValue:0},
		{name:'perm_menu_praca_pagamento', type:'boolean', defaultValue:0},
		
		{name:'perm_menu_tab_nacional', type:'boolean', defaultValue:0},
		{name:'perm_menu_tab_especial', type:'boolean', defaultValue:0},
		{name:'perm_menu_tab_minima', type:'boolean', defaultValue:0},
		{name:'perm_menu_tab_expresso', type:'boolean', defaultValue:0},
		
		{name:'perm_menu_tx_terrestres', type:'boolean', defaultValue:0},
		{name:'perm_menu_tx_redespacho', type:'boolean', defaultValue:0},
		{name:'perm_menu_tx_seguro_rctrc', type:'boolean', defaultValue:0},
		
		{name:'perm_menu_desconto_taxa_clie', type:'boolean', defaultValue:0},
		{name:'perm_menu_cfop', type:'boolean', defaultValue:0},
		{name:'perm_menu_ocorrencias', type:'boolean', defaultValue:0},
		{name:'perm_menu_bancos', type:'boolean', defaultValue:0},
		{name:'perm_menu_faturamento', type:'boolean', defaultValue:0},
		{name:'perm_menu_cta_receber', type:'boolean', defaultValue:0},
		{name:'perm_menu_cta_pagar', type:'boolean', defaultValue:0},
		
		{name:'perm_menu_cotacoes', type:'boolean', defaultValue:0},
		{name:'perm_menu_informacoes', type:'boolean', defaultValue:0},
		{name:'perm_menu_coleta', type:'boolean', defaultValue:0},
		{name:'perm_menu_romaneios', type:'boolean', defaultValue:0},
		
		{name:'perm_cadastrado_por', type:'int'},
		{name:'perm_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'perm_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'perm_alterado_por', type:'int'},
		{name:'perm_alterado_por_nome', type:'string', defaultValue:''},
		{name:'perm_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'perm_versao', type:'int', defaultValue:0}
	]
});

Ext.define('RotaEntrega.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'rota_id',
	
	fields: [
		{name:'rota_id', type:'int'},
		{name:'rota_codigo', type:'string', defaultValue:''},
		{name:'rota_descricao', type:'string', defaultValue:''},
		{name:'rota_nome', type:'string', defaultValue:''},
		
		{name:'rota_cadastrado_por', type:'int'},
		{name:'rota_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'rota_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'rota_alterado_por', type:'int'},
		{name:'rota_alterado_por_nome', type:'string', defaultValue:''},
		{name:'rota_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'rota_versao', type:'int'}
	]
});

Ext.define('GrupoTarifa.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'gt_id_codigo',
	
	fields: [
		{name:'gt_id_codigo', type:'string'},
		{name:'gt_descricao', type:'string', defaultValue:''},
		{name:'gt_obrigar_especifica', type:'boolean', defaultValue:0},
		{name:'gt_isento_icms', type:'boolean', defaultValue:0},
		
		{name:'gt_cadastrado_por', type:'int'},
		{name:'gt_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'gt_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'gt_alterado_por', type:'int'},
		{name:'gt_alterado_por_nome', type:'string', defaultValue:''},
		{name:'gt_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'gt_versao', type:'int'}
	]
});

Ext.define('IATACodigo.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'iic_id',
	
	fields: [
		{name:'iic_id', type:'int'},
		{name:'iic_codigo', type:'string', defaultValue:''},
		{name:'iic_descricao', type:'string', defaultValue:''},
		{name:'iic_nome', type:'string', defaultValue:''},
		
		{name:'iic_cadastrado_por', type:'int'},
		{name:'iic_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'iic_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'iic_alterado_por', type:'int'},
		{name:'iic_alterado_por_nome', type:'string', defaultValue:''},
		{name:'iic_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'iic_versao', type:'int'}
	]
});

Ext.define('CFOPCodigo.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'cfop_id',
	
	fields: [
		{name:'cfop_id', type:'int'},
		{name:'cfop_nome', type:'string', defaultValue:''},
		{name:'cfop_codigo', type:'int'},
		{name:'cfop_descricao', type:'string', defaultValue:''},
		
		{name:'cfop_cadastrado_por', type:'int'},
		{name:'cfop_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cfop_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cfop_alterado_por', type:'int'},
		{name:'cfop_alterado_por_nome', type:'string', defaultValue:''},
		{name:'cfop_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cfop_versao', type:'int'}
	]
});

Ext.define('Produto.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'prod_id',
	
	fields: [
		{name:'prod_id', type:'int'},
		{name:'prod_tarifa', type:'string', defaultValue:''},
		
		{name:'gt_id_codigo', type:'string'},
		{name:'gt_descricao', type:'string', defaultValue:''},
		{name:'gt_isento_icms', type:'boolean', defaultValue:0},
		{name:'gt_obrigar_especifica', type:'boolean', defaultValue:0},
		
		{name:'prod_codigo', type:'int', defaultValue:''},
		{name:'prod_produto', type:'string', defaultValue:''},
		{name:'prod_nome', type:'string', defaultValue:''},
		
		{name:'iic_id', type:'int'},
		{name:'iic_codigo', type:'string', defaultValue:''},
		{name:'iic_descricao', type:'string', defaultValue:''},
		{name:'iic_nome', type:'string', defaultValue:''},
		
		{name:'prod_tipo_advalorem', type:'string', defaultValue:'1 - Normal'},
		{name:'prod_numero_onu', type:'string', defaultValue:''},
		{name:'prod_nome_embarque', type:'string', defaultValue:''},
		{name:'prod_classe_risco', type:'string', defaultValue:''},
		{name:'prod_grupo_embalagem', type:'string', defaultValue:''},
		{name:'prod_ponto_fulgor', type:'string', defaultValue:''},
		
		{name:'prod_cadastrado_por', type:'int'},
		{name:'prod_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'prod_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'prod_alterado_por', type:'int'},
		{name:'prod_alterado_por_nome', type:'string', defaultValue:''},
		{name:'prod_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'prod_versao', type:'int'}
	]
});

Ext.define('PracaPagamento.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'prp_id',
	
	fields: [
		{name:'prp_id', type:'int'},
		{name:'prp_praca_pagto', type:'string'},
		{name:'emp_id', type:'int', defaultValue: App.empresa.emp_id},
		
		{name:'prp_cadastrado_por', type:'int'},
		{name:'prp_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'prp_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'prp_alterado_por', type:'int'},
		{name:'prp_alterado_por_nome', type:'string', defaultValue:''},
		{name:'prp_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'}
	]
});

Ext.define('Nacional.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'nac_id',
	
	fields: [
		{name:'nac_id', type:'int'},
		
		{name:'clie_id', type:'int'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		
		{name:'cid_id_origem', type:'int', defaultValue:''},
		{name:'cid_origem_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_uf', type:'string', defaultValue:''},
		{name:'cid_origem_sigla', type:'string', defaultValue:''},
		{name:'cid_origem_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_origem_nome', type:'string', defaultValue:''},
		
		{name:'cid_id_destino', type:'int'},
		{name:'cid_destino_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_uf', type:'string', defaultValue:''},
		{name:'cid_destino_sigla', type:'string', defaultValue:''},
		{name:'cid_destino_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_destino_nome', type:'string', defaultValue:''},
		
		{name:'nac_taxa_minima', type:'float', defaultValue:0},
		{name:'nac_tipo_data_prev_entrega', type:'int', defaultValue:0},
		{name:'nac_dias_programado', type:'int', defaultValue:0},
		{name:'nac_dias_inicial', type:'int', defaultValue:0},
		{name:'nac_dias_final', type:'int', defaultValue:0},
		{name:'nac_tipo_hora_prev_entrega', type:'int', defaultValue:0},
		{name:'nac_hora_programada', type:'string', defaultValue:''},
		{name:'nac_hora_inicial', type:'string', defaultValue:''},
		{name:'nac_hora_final', type:'string', defaultValue:''},
		
		{name:'nac_cadastrado_por', type:'int'},
		{name:'nac_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'nac_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'nac_alterado_por', type:'int'},
		{name:'nac_alterado_por_nome', type:'string', defaultValue:''},
		{name:'nac_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'nac_versao', type:'int'}
	]
});

Ext.define('Nacional.Especifica.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'epc_id',
	fields: [
		{name:'epc_id', type:'int'},
		{name:'nac_id', type:'int'},
		
		{name:'gt_id_codigo', type:'string', defaultValue:''},
		{name:'gt_descricao', type:'string', defaultValue:''},
		
		{name:'epc_valor', type:'float', defaultValue:''}
	]
});

Ext.define('Nacional.Geral.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'ger_id',
	fields: [
		{name:'ger_id', type:'int'},
		{name:'nac_id', type:'int'},
		
		{name:'ger_peso_ate_kg', type:'float', defaultValue:0},
		{name:'ger_valor', type:'float', defaultValue:0}
	]
});

Ext.define('Especial.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'esp_id',
	
	fields: [
		{name:'esp_id', type:'int'},
		
		{name:'clie_id', type:'int'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		
		{name:'cid_id_origem', type:'int', defaultValue:''},
		{name:'cid_origem_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_uf', type:'string', defaultValue:''},
		{name:'cid_origem_sigla', type:'string', defaultValue:''},
		{name:'cid_origem_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_origem_nome', type:'string', defaultValue:''},
		
		{name:'cid_id_destino', type:'int'},
		{name:'cid_destino_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_uf', type:'string', defaultValue:''},
		{name:'cid_destino_sigla', type:'string', defaultValue:''},
		{name:'cid_destino_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_destino_nome', type:'string', defaultValue:''},
		
		{name:'espfx_peso_ate_kg', type:'float', defaultValue:0},
		{name:'espfx_valor', type:'float', defaultValue:0},
		{name:'espfx_excedente', type:'float', defaultValue:0},
		
		{name:'esp_tipo_data_prev_entrega', type:'int', defaultValue:0},
		{name:'esp_dias_programado', type:'int', defaultValue:0},
		{name:'esp_dias_inicial', type:'int', defaultValue:0},
		{name:'esp_dias_final', type:'int', defaultValue:0},
		
		{name:'esp_tipo_hora_prev_entrega', type:'int', defaultValue:0},
		{name:'esp_hora_programada', type:'string', defaultValue:''},
		{name:'esp_hora_inicial', type:'string', defaultValue:''},
		{name:'esp_hora_final', type:'string', defaultValue:''},
		
		{name:'esp_cadastrado_por', type:'int'},
		{name:'esp_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'esp_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'esp_alterado_por', type:'int'},
		{name:'esp_alterado_por_nome', type:'string', defaultValue:''},
		{name:'esp_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'esp_versao', type:'int'}
	]
});

Ext.define('Minima.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'min_id',
	
	fields: [
		{name:'min_id', type:'int'},
		
		{name:'clie_id', type:'int'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		
		{name:'cid_id_origem', type:'int', defaultValue:''},
		{name:'cid_origem_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_uf', type:'string', defaultValue:''},
		{name:'cid_origem_sigla', type:'string', defaultValue:''},
		{name:'cid_origem_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_origem_nome', type:'string', defaultValue:''},
		
		{name:'cid_id_destino', type:'int'},
		{name:'cid_destino_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_uf', type:'string', defaultValue:''},
		{name:'cid_destino_sigla', type:'string', defaultValue:''},
		{name:'cid_destino_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_destino_nome', type:'string', defaultValue:''},
		
		{name:'min_tipo_data_prev_entrega', type:'int', defaultValue:0},
		{name:'min_dias_programado', type:'int', defaultValue:0},
		{name:'min_dias_inicial', type:'int', defaultValue:0},
		{name:'min_dias_final', type:'int', defaultValue:0},
		
		{name:'min_tipo_hora_prev_entrega', type:'int', defaultValue:0},
		{name:'min_hora_programada', type:'string', defaultValue:''},
		{name:'min_hora_inicial', type:'string', defaultValue:''},
		{name:'min_hora_final', type:'string', defaultValue:''},
		
		{name:'min_cadastrado_por', type:'int'},
		{name:'min_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'min_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'min_alterado_por', type:'int'},
		{name:'min_alterado_por_nome', type:'string', defaultValue:''},
		{name:'min_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'min_versao', type:'int'}
	]
});

Ext.define('Minima.Faixa.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'minfx_id',
	fields: [
		{name:'minfx_id', type:'int'},
		{name:'min_id', type:'int'},
		
		{name:'minfx_peso_ate_kg', type:'float', defaultValue:0},
		{name:'minfx_valor', type:'float', defaultValue:0}
	]
});

Ext.define('Composicao.Frete.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'cf_id',
	fields: [
		{name:'cf_id', type:'int'},
		{name:'cf_tipo', type:'int', defaultValue: 5},
		{name:'cf_nome', type:'string', defaultValue:''},
		{name:'cf_descricao', type:'string', defaultValue:''},
		
		/* somente para armazenagem do ComboBox */
		{name:'cc_titulo', type:'string', defaultValue:''}, 
		
		{name:'cf_cadastrado_por', type:'int'},
		{name:'cf_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cf_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cf_alterado_por', type:'int'},
		{name:'cf_alterado_por_nome', type:'string', defaultValue:''},
		{name:'cf_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cf_versao', type:'int'}
	]
});

Ext.define('Composicao.Calculo.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'cc_id',
	fields: [
		{name:'cc_id', type:'int'},
		{name:'emp_id', type:'int'},
		
		{name:'cf_id', type:'int'},
		{name:'cf_tipo', type:'int'},
		{name:'cf_nome', type:'string', defaultValue:''},
		
		{name:'cc_titulo', type:'string', defaultValue:''},
		{name:'cc_exibir_na_dacte', type:'boolean', defaultValue:0},
		
		{name:'cc_cadastrado_por', type:'int'},
		{name:'cc_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cc_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cc_alterado_por', type:'int'},
		{name:'cc_alterado_por_nome', type:'string', defaultValue:''},
		{name:'cc_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cc_versao', type:'int'}
	]
});

Ext.define('Taxa.Desconto.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'dtc_id',
	fields: [
		{name:'dtc_id', type:'int'},
		{name:'emp_id', type:'int'},
		
		{name:'clie_id', type:'int'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		{name:'clie_cid_nome', type:'string', defaultValue:''},
		
		{name:'cc_id', type:'int'},
		{name:'cc_titulo', type:'string', defaultValue:''},
		
		{name:'dtc_desconto', type:'float', defaultValue:0},
		{name:'dtc_exibir_na_dacte', type:'boolean', defaultValue:0},
		
		{name:'dtc_cadastrado_por', type:'int'},
		{name:'dtc_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'dtc_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'dtc_alterado_por', type:'int'},
		{name:'dtc_alterado_por_nome', type:'string', defaultValue:''},
		{name:'dtc_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'dtc_versao', type:'int'}
	]
});

Ext.define('Taxa.Redespacho.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'red_id',
	fields: [
		{name:'red_id', type:'int'},
		{name:'emp_id', type:'int'},
		
		{name:'clie_id', type:'int'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		
		{name:'cid_id_origem', type:'int', defaultValue:''},
		{name:'cid_origem_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_uf', type:'string', defaultValue:''},
		{name:'cid_origem_sigla', type:'string', defaultValue:''},
		{name:'cid_origem_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_origem_nome', type:'string', defaultValue:''},
		{name:'cid_origem_suframa', type:'boolean', defaultValue:0},
		{name:'cid_origem_valor_sefaz', type:'float', defaultValue:0},
		
		{name:'cid_id_passagem', type:'int', defaultValue:''},
		{name:'cid_passagem_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_passagem_municipio', type:'string', defaultValue:''},
		{name:'cid_passagem_uf', type:'string', defaultValue:''},
		{name:'cid_passagem_sigla', type:'string', defaultValue:''},
		{name:'cid_passagem_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_passagem_nome', type:'string', defaultValue:''},
		{name:'cid_passagem_suframa', type:'boolean', defaultValue:0},
		{name:'cid_passagem_valor_sefaz', type:'float', defaultValue:0},
		
		{name:'cid_id_destino', type:'int'},
		{name:'cid_destino_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_uf', type:'string', defaultValue:''},
		{name:'cid_destino_sigla', type:'string', defaultValue:''},
		{name:'cid_destino_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_destino_nome', type:'string', defaultValue:''},
		{name:'cid_destino_suframa', type:'boolean', defaultValue:0},
		{name:'cid_destino_valor_sefaz', type:'float', defaultValue:0},
		
		{name:'red_nota', type:'string', defaultValue:''},
		{name:'red_por_peso', type:'boolean', defaultValue:1},
		{name:'red_valor', type:'float', defaultValue:0},
		{name:'red_ate_kg', type:'int', defaultValue:0},
		{name:'red_excedente', type:'float', defaultValue:0},
		{name:'red_aceita_frete_a_pagar', type:'boolean', defaultValue:1},
		
		{name:'red_cadastrado_por', type:'int'},
		{name:'red_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'red_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'red_alterado_por', type:'int'},
		{name:'red_alterado_por_nome', type:'string', defaultValue:''},
		{name:'red_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'red_versao', type:'int'}
	]
});

Ext.define('Taxa.RedespachoExcecao.data.Model',{
	extend: 'Ext.data.Model',
	
	fields: [
		{name:'red_id', type:'int'},
		{name:'clie_id', type:'int'},
		
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		{name:'cid_nome', type:'string', defaultValue:''}
	]
});

Ext.define('Taxa.Terrestre.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'tx_id',
	fields: [
		{name:'tx_id', type:'int'},
		{name:'emp_id', type:'int'},
		
		{name:'clie_id', type:'int'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		
		{name:'cc_id', type:'int'},
		{name:'cc_titulo', type:'string', defaultValue:''},
		
		{name:'cid_origem_id', type:'int'},
		{name:'cid_origem_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_uf', type:'string', defaultValue:''},
		{name:'cid_origem_sigla', type:'string', defaultValue:''},
		{name:'cid_origem_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_origem_nome', type:'string', defaultValue:''},

		{name:'cid_id', type:'int'},
		{name:'cid_destino_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_uf', type:'string', defaultValue:''},
		{name:'cid_destino_sigla', type:'string', defaultValue:''},
		{name:'cid_destino_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_destino_nome', type:'string', defaultValue:''},
		
		{name:'tx_nota', type:'string', defaultValue:''},
		{name:'tx_por_peso', type:'boolean', defaultValue:1},
		{name:'tx_valor', type:'float', defaultValue:0},
		{name:'tx_ate_kg', type:'int', defaultValue:0},
		{name:'tx_excedente', type:'float', defaultValue:0},
		
		{name:'tx_cadastrado_por', type:'int'},
		{name:'tx_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'tx_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'tx_alterado_por', type:'int'},
		{name:'tx_alterado_por_nome', type:'string', defaultValue:''},
		{name:'tx_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'tx_versao', type:'int'}
	]
});

Ext.define('Taxa.TerrestreExcecao.data.Model',{
	extend: 'Ext.data.Model',
	
	fields: [
		{name:'tx_id', type:'int'},
		{name:'clie_id', type:'int'},
		
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		{name:'cid_nome', type:'string', defaultValue:''}
	]
});

Ext.define('Ocorrencia.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'ocor_id',
	fields: [
		{name:'ocor_id', type:'int'},
		{name:'ocor_codigo', type:'string', defaultValue:''},
		{name:'ocor_nome', type:'string', defaultValue:''},
		{name:'ocor_descricao', type:'string', defaultValue:''},
		{name:'ocor_modal', type:'string', defaultValue:''},
		{name:'ocor_caracteristica', type:'string', defaultValue:''},
		
		{name:'ocor_cadastrado_por', type:'int'},
		{name:'ocor_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'ocor_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'ocor_alterado_por', type:'int'},
		{name:'ocor_alterado_por_nome', type:'string', defaultValue:''},
		{name:'ocor_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'ocor_versao', type:'int'}
	]
});

Ext.define('Banco.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'emp_id', type:'int'},
		
		{name:'numero', type:'string', defaultValue:''},
		{name:'banco', type:'string', defaultValue:''},
		{name:'agencia', type:'string', defaultValue:''},
		{name:'conta_corrente', type:'string', defaultValue:''},
		{name:'codigo_empresa', type:'string', defaultValue:''},
		
		{name:'digito_ver_agencia', type:'string', defaultValue:''},
		{name:'digito_ver_conta_corrente', type:'string', defaultValue:''},
		
		{name:'cadastrado_por', type:'int'},
		{name:'cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'alterado_por', type:'int'},
		{name:'alterado_por_nome', type:'string', defaultValue:''},
		{name:'alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'versao', type:'int'},
		{name:'padrao_cta_receber', type:'boolean', defaultValue:0}
	]
});

Ext.define('CTE.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_id',
	fields: [
		{name:'cte_id', type:'int'},
		{name:'emp_id', type:'int'},
		{name:'cte_faturado', type:'boolean', defaultValue:0},
		
		{name:'clie_remetente_id', type:'int'},
		{name:'rem_razao_social', type:'string', defaultValue:''},
		{name:'rem_nome_fantasia', type:'string', defaultValue:''},
		{name:'rem_cnpj', type:'string', defaultValue:''},
		{name:'rem_cpf', type:'string', defaultValue:''},
		{name:'rem_cnpj_cpf', type:'string', defaultValue:''},
		{name:'rem_ie', type:'string', defaultValue:''},
		{name:'rem_rg', type:'string', defaultValue:''},
		{name:'rem_im', type:'string', defaultValue:''},
		{name:'rem_icms', type:'boolean', defaultValue:0},
		{name:'rem_end_logradouro', type:'string', defaultValue:''},
		{name:'rem_end_numero', type:'string', defaultValue:''},
		{name:'rem_end_complemento', type:'string', defaultValue:''},
		{name:'rem_end_bairro', type:'string', defaultValue:''},
		{name:'rem_end_cep', type:'string', defaultValue:''},
		{name:'rem_fone', type:'string', defaultValue:''},
		{name:'rem_cid_codigo_municipio', type:'string', defaultValue:''},
		{name:'rem_cid_municipio', type:'string', defaultValue:''},
		{name:'rem_cid_uf', type:'string', defaultValue:''},
		{name:'rem_cid_sigla', type:'string', defaultValue:''},
		{name:'rem_cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'rem_cid_nome', type:'string', defaultValue:''},
		{name:'rem_cid_nome_completo', type:'string', defaultValue:''},
		
		{name:'clie_coleta_id', type:'int'},
		{name:'col_razao_social', type:'string', defaultValue:''},
		{name:'col_nome_fantasia', type:'string', defaultValue:''},
		{name:'col_cnpj', type:'string', defaultValue:''},
		{name:'col_cpf', type:'string', defaultValue:''},
		{name:'col_cnpj_cpf', type:'string', defaultValue:''},
		{name:'col_ie', type:'string', defaultValue:''},
		{name:'col_rg', type:'string', defaultValue:''},
		{name:'col_im', type:'string', defaultValue:''},
		{name:'col_icms', type:'boolean', defaultValue:0},
		{name:'col_end_logradouro', type:'string', defaultValue:''},
		{name:'col_end_numero', type:'string', defaultValue:''},
		{name:'col_end_complemento', type:'string', defaultValue:''},
		{name:'col_end_bairro', type:'string', defaultValue:''},
		{name:'col_end_cep', type:'string', defaultValue:''},
		{name:'col_fone', type:'string', defaultValue:''},
		{name:'col_cid_codigo_municipio', type:'string', defaultValue:''},
		{name:'col_cid_municipio', type:'string', defaultValue:''},
		{name:'col_cid_uf', type:'string', defaultValue:''},
		{name:'col_cid_sigla', type:'string', defaultValue:''},
		{name:'col_cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'col_cid_nome', type:'string', defaultValue:''},
		{name:'col_cid_nome_completo', type:'string', defaultValue:''},
		
		{name:'clie_expedidor_id', type:'int'},
		{name:'exp_razao_social', type:'string', defaultValue:''},
		{name:'exp_nome_fantasia', type:'string', defaultValue:''},
		{name:'exp_cnpj', type:'string', defaultValue:''},
		{name:'exp_cpf', type:'string', defaultValue:''},
		{name:'exp_cnpj_cpf', type:'string', defaultValue:''},
		{name:'exp_ie', type:'string', defaultValue:''},
		{name:'exp_rg', type:'string', defaultValue:''},
		{name:'exp_im', type:'string', defaultValue:''},
		{name:'exp_icms', type:'boolean', defaultValue:0},
		{name:'exp_end_logradouro', type:'string', defaultValue:''},
		{name:'exp_end_numero', type:'string', defaultValue:''},
		{name:'exp_end_complemento', type:'string', defaultValue:''},
		{name:'exp_end_bairro', type:'string', defaultValue:''},
		{name:'exp_end_cep', type:'string', defaultValue:''},
		{name:'exp_fone', type:'string', defaultValue:''},
		{name:'exp_cid_codigo_municipio', type:'string', defaultValue:''},
		{name:'exp_cid_municipio', type:'string', defaultValue:''},
		{name:'exp_cid_uf', type:'string', defaultValue:''},
		{name:'exp_cid_sigla', type:'string', defaultValue:''},
		{name:'exp_cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'exp_cid_nome', type:'string', defaultValue:''},
		{name:'exp_cid_nome_completo', type:'string', defaultValue:''},
		
		{name:'clie_recebedor_id', type:'int'},
		{name:'rec_razao_social', type:'string', defaultValue:''},
		{name:'rec_nome_fantasia', type:'string', defaultValue:''},
		{name:'rec_cnpj', type:'string', defaultValue:''},
		{name:'rec_cpf', type:'string', defaultValue:''},
		{name:'rec_cnpj_cpf', type:'string', defaultValue:''},
		{name:'rec_ie', type:'string', defaultValue:''},
		{name:'rec_rg', type:'string', defaultValue:''},
		{name:'rec_im', type:'string', defaultValue:''},
		{name:'rec_icms', type:'boolean', defaultValue:0},
		{name:'rec_end_logradouro', type:'string', defaultValue:''},
		{name:'rec_end_numero', type:'string', defaultValue:''},
		{name:'rec_end_complemento', type:'string', defaultValue:''},
		{name:'rec_end_bairro', type:'string', defaultValue:''},
		{name:'rec_end_cep', type:'string', defaultValue:''},
		{name:'rec_fone', type:'string', defaultValue:''},
		{name:'rec_cid_codigo_municipio', type:'string', defaultValue:''},
		{name:'rec_cid_municipio', type:'string', defaultValue:''},
		{name:'rec_cid_uf', type:'string', defaultValue:''},
		{name:'rec_cid_sigla', type:'string', defaultValue:''},
		{name:'rec_cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'rec_cid_nome', type:'string', defaultValue:''},
		{name:'rec_cid_nome_completo', type:'string', defaultValue:''},
		
		{name:'clie_destinatario_id', type:'int'},
		{name:'des_razao_social', type:'string', defaultValue:''},
		{name:'des_nome_fantasia', type:'string', defaultValue:''},
		{name:'des_cnpj', type:'string', defaultValue:''},
		{name:'des_cpf', type:'string', defaultValue:''},
		{name:'des_cnpj_cpf', type:'string', defaultValue:''},
		{name:'des_ie', type:'string', defaultValue:''},
		{name:'des_rg', type:'string', defaultValue:''},
		{name:'des_im', type:'string', defaultValue:''},
		{name:'des_icms', type:'boolean', defaultValue:0},
		{name:'des_end_logradouro', type:'string', defaultValue:''},
		{name:'des_end_numero', type:'string', defaultValue:''},
		{name:'des_end_complemento', type:'string', defaultValue:''},
		{name:'des_end_bairro', type:'string', defaultValue:''},
		{name:'des_end_cep', type:'string', defaultValue:''},
		{name:'des_fone', type:'string', defaultValue:''},
		{name:'des_cid_codigo_municipio', type:'string', defaultValue:''},
		{name:'des_cid_municipio', type:'string', defaultValue:''},
		{name:'des_cid_uf', type:'string', defaultValue:''},
		{name:'des_cid_sigla', type:'string', defaultValue:''},
		{name:'des_cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'des_cid_nome', type:'string', defaultValue:''},
		{name:'des_cid_nome_completo', type:'string', defaultValue:''},
		
		{name:'clie_entrega_id', type:'int'},
		{name:'ent_razao_social', type:'string', defaultValue:''},
		{name:'ent_nome_fantasia', type:'string', defaultValue:''},
		{name:'ent_cnpj', type:'string', defaultValue:''},
		{name:'ent_cpf', type:'string', defaultValue:''},
		{name:'ent_cnpj_cpf', type:'string', defaultValue:''},
		{name:'ent_ie', type:'string', defaultValue:''},
		{name:'ent_rg', type:'string', defaultValue:''},
		{name:'ent_im', type:'string', defaultValue:''},
		{name:'ent_icms', type:'boolean', defaultValue:0},
		{name:'ent_end_logradouro', type:'string', defaultValue:''},
		{name:'ent_end_numero', type:'string', defaultValue:''},
		{name:'ent_end_complemento', type:'string', defaultValue:''},
		{name:'ent_end_bairro', type:'string', defaultValue:''},
		{name:'ent_end_cep', type:'string', defaultValue:''},
		{name:'ent_fone', type:'string', defaultValue:''},
		{name:'ent_cid_codigo_municipio', type:'string', defaultValue:''},
		{name:'ent_cid_municipio', type:'string', defaultValue:''},
		{name:'ent_cid_uf', type:'string', defaultValue:''},
		{name:'ent_cid_sigla', type:'string', defaultValue:''},
		{name:'ent_cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'ent_cid_nome', type:'string', defaultValue:''},
		{name:'ent_cid_nome_completo', type:'string', defaultValue:''},
		
		{name:'clie_tomador_id', type:'int'},
		{name:'tom_razao_social', type:'string', defaultValue:''},
		{name:'tom_nome_fantasia', type:'string', defaultValue:''},
		{name:'tom_cnpj', type:'string', defaultValue:''},
		{name:'tom_cpf', type:'string', defaultValue:''},
		{name:'tom_cnpj_cpf', type:'string', defaultValue:''},
		{name:'tom_ie', type:'string', defaultValue:''},
		{name:'tom_rg', type:'string', defaultValue:''},
		{name:'tom_im', type:'string', defaultValue:''},
		{name:'tom_icms', type:'boolean', defaultValue:0},
		{name:'tom_end_logradouro', type:'string', defaultValue:''},
		{name:'tom_end_numero', type:'string', defaultValue:''},
		{name:'tom_end_complemento', type:'string', defaultValue:''},
		{name:'tom_end_bairro', type:'string', defaultValue:''},
		{name:'tom_end_cep', type:'string', defaultValue:''},
		{name:'tom_fone', type:'string', defaultValue:''},
		{name:'tom_cid_codigo_municipio', type:'string', defaultValue:''},
		{name:'tom_cid_municipio', type:'string', defaultValue:''},
		{name:'tom_cid_uf', type:'string', defaultValue:''},
		{name:'tom_cid_sigla', type:'string', defaultValue:''},
		{name:'tom_cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'tom_cid_nome', type:'string', defaultValue:''},
		{name:'tom_cid_nome_completo', type:'string', defaultValue:''},
		
		{name:'cid_id_origem', type:'int'},
		{name:'cid_origem_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_uf', type:'string', defaultValue:''},
		{name:'cid_origem_sigla', type:'string', defaultValue:''},
		{name:'cid_origem_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_origem_nome', type:'string', defaultValue:''},
		{name:'cid_origem_nome_completo', type:'string', defaultValue:''},
		
		{name:'cid_id_destino', type:'int'},
		{name:'cid_destino_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_uf', type:'string', defaultValue:''},
		{name:'cid_destino_sigla', type:'string', defaultValue:''},
		{name:'cid_destino_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_destino_nome', type:'string', defaultValue:''},
		{name:'cid_destino_nome_completo', type:'string', defaultValue:''},
		
		{name:'cid_id_passagem', type:'int'},
		{name:'cid_passagem_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_passagem_municipio', type:'string', defaultValue:''},
		{name:'cid_passagem_uf', type:'string', defaultValue:''},
		{name:'cid_passagem_sigla', type:'string', defaultValue:''},
		{name:'cid_passagem_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_passagem_nome', type:'string', defaultValue:''},
		{name:'cid_passagem_nome_completo', type:'string', defaultValue:''},
		
		{name:'cid_id_etiqueta_entrega', type:'int'},
		{name:'cte_endereco_etiqueta_entrega', type:'string', defaultValue:''},
		{name:'ent_etiqueta_cid_codigo_uf', type:'string', defaultValue:''},
		{name:'ent_etiqueta_cid_codigo_municipio', type:'string', defaultValue:''},
		{name:'ent_etiqueta_cid_municipio', type:'string', defaultValue:''},
		{name:'ent_etiqueta_cid_uf', type:'string', defaultValue:''},
		{name:'ent_etiqueta_cid_sigla', type:'string', defaultValue:''},
		{name:'ent_etiqueta_cid_nome_aeroporto', type:'string', defaultValue:''},
		{name:'ent_etiqueta_cid_nome', type:'string', defaultValue:''},
		{name:'ent_etiqueta_cid_nome_completo', type:'string', defaultValue:''},
		
		{name:'prod_id', type:'int'},
		{name:'produto_predominante', type:'string', defaultValue:''},
		{name:'produto_predominante_gt', type:'string', defaultValue:''},
		{name:'produto_predominante_iic', type:'string', defaultValue:''},
		
		{name:'cte_tabela_id', type:'int'},
		{name:'cte_tabela_frete', type:'string', defaultValue:'NACIONAL'},
		{name:'cte_frete_manual', type:'boolean', defaultValue:0},
		
		{name:'cte_minuta', type:'string', defaultValue:''},
		{name:'cte_modelo', type:'string', defaultValue: 57},
		{name:'cte_serie', type:'string', defaultValue: '001'},
		{name:'cte_numero', type:'string', defaultValue:''},
		{name:'cte_chave', type:'string', defaultValue:''},
		{name:'cte_data_hora_emissao', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'cte_data_hora_autorizacao', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'cte_data_entrega_prevista', type:'date', dateFormat:'Y-m-d', defaultValue: new Date()},
		{name:'cte_emissora_master', type:'string', defaultValue:''},
		{name:'cte_cia_master', type:'string', defaultValue:''},
		{name:'cte_serie_master', type:'string', defaultValue:''},
		{name:'cte_numero_master', type:'string', defaultValue:''},
		{name:'cte_operacional_master', type:'string', defaultValue:''},
		{name:'cte_chave_master', type:'string', defaultValue:''},
		{name:'cte_chave_referenciado', type:'string', defaultValue:''},
		{name:'cte_natureza_operacao', type:'string', defaultValue:''},
		{name:'cte_outro_local_coleta', type:'int', defaultValue:0},
		{name:'cte_expedidor', type:'int', defaultValue:0},
		{name:'cte_recebedor', type:'int', defaultValue:0},
		{name:'cte_outro_local_entrega', type:'int', defaultValue:0},
		
		{name:'cte_modal', type:'int', defaultValue:0},
		{name:'cte_modal_nome', type:'string', defaultValue:''},
		{name:'cte_tipo_servico', type:'int', defaultValue:0},
		{name:'cte_tipo_servico_nome', type:'string', defaultValue:''},
		{name:'cte_tipo_do_cte', type:'int', defaultValue:0},
		{name:'cte_tipo_do_cte_nome', type:'string', defaultValue:''},
		{name:'cte_forma_emissao', type:'int', defaultValue:1},
		{name:'cte_forma_emissao_nome', type:'string', defaultValue:''},
		{name:'cte_remetente', type:'int', defaultValue:1},
		{name:'cte_remetente_nome', type:'string', defaultValue:''},
		{name:'cte_destinatario', type:'int', defaultValue:1},
		{name:'cte_destinatario_nome', type:'string', defaultValue:''},
		{name:'cte_tomador', type:'int', defaultValue:0},
		{name:'cte_tomador_nome', type:'string', defaultValue:''},
		{name:'cte_forma_pgto', type:'int', defaultValue:0},
		{name:'cte_forma_pgto_nome', type:'string', defaultValue:''},
		{name:'cte_impressao_dacte', type:'int', defaultValue:1},
		{name:'cte_impressao_dacte_nome', type:'string', defaultValue:''},
		{name:'cte_tp_data_entrega', type:'int', defaultValue:0},
		{name:'cte_tp_data_entrega_nome', type:'string', defaultValue:''},
		{name:'cte_tp_hora_entrega', type:'int', defaultValue:0},
		{name:'cte_tp_hora_entrega_nome', type:'string', defaultValue:''},
		{name:'cte_codigo_sit_tributaria', type:'string', defaultValue:''},
		{name:'cte_tipo_doc_anexo', type:'int', defaultValue:2},
		{name:'cte_tipo_doc_anexo_nome', type:'string', defaultValue:2},
		
		{name:'cte_codigo_rota', type:'string', defaultValue:0},
		{name:'cte_cfop', type:'int', defaultValue:''},
		{name:'cte_carac_adic_servico', type:'string', defaultValue:''},
		{name:'cte_carac_adic_transp', type:'string', defaultValue:''},
		{name:'cte_emissor', type:'string', defaultValue:''},
		{name:'cte_retira', type:'boolean', defaultValue:0},
		{name:'cte_detalhe_retira', type:'string', defaultValue:''},
		{name:'cte_data_programada', type:'date', dateFormat:'Y-m-d'},
		{name:'cte_data_inicial', type:'date', dateFormat:'Y-m-d'},
		{name:'cte_data_final', type:'date', dateFormat:'Y-m-d'},
		{name:'cte_hora_programada', type:'string', defaultValue:''},
		{name:'cte_hora_inicial', type:'string', defaultValue:''},
		{name:'cte_hora_final', type:'string', defaultValue:''},
		{name:'cte_obs_gerais', type:'string', defaultValue:''},
		{name:'cte_outras_carac_carga', type:'string', defaultValue:''},
		
		{name:'cte_peso_bruto', type:'float', defaultValue:0},
		{name:'cte_peso_cubado', type:'float', defaultValue:0},
		{name:'cte_peso_bc', type:'float', defaultValue:0},
		{name:'cte_cubagem_m3', type:'float', defaultValue:0},
		{name:'cte_qtde_volumes', type:'int', defaultValue:0},
		{name:'cte_valor_carga', type:'float', defaultValue:0},
		{name:'cte_valor_total', type:'float', defaultValue:0},
		{name:'cte_perc_reduc_bc', type:'float', defaultValue:0},
		{name:'cte_valor_bc', type:'float', defaultValue:0},
		{name:'cte_aliquota_icms', type:'float', defaultValue:0},
		{name:'cte_valor_icms', type:'float', defaultValue:0},
		{name:'cte_valor_cred_outorgado', type:'float', defaultValue:0},
		{name:'cte_valor_pis', type:'float', defaultValue:0},
		{name:'cte_valor_cofins', type:'float', defaultValue:0},
		{name:'cte_info_fisco', type:'string', defaultValue:''},
		{name:'cte_data_entrega', type:'date', dateFormat:'Y-m-d'},
		{name:'cte_data_entrega_efetuada', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'cte_data_entrega_ultima', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'cte_perc_entregue', type:'float', defaultValue:0},
		{name:'cte_indicador_lotacao', type:'boolean', defaultValue:0},
		{name:'cte_ciot', type:'int'},
		{name:'cte_situacao', type:'string', defaultValue:'DIGITAÇÃO'},
		
		{name:'cte_tem_difal', type:'boolean'},
		{name:'pUF_inicio', type:'float'},
		{name:'pUF_fim', type:'float'},
		{name:'pFCP', type:'float'},
		{name:'vFCP', type:'float'},
		{name:'pDIFAL', type:'float'},
		{name:'vDIFAL', type:'float'},
		{name:'vICMS_uf_fim', type:'float'},

		{name:'cte_cadastrado_por', type:'int'},
		{name:'cte_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cte_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cte_alterado_por', type:'int'},
		{name:'cte_alterado_por_nome', type:'string', defaultValue:''},
		{name:'cte_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'cte_pdf', type:'string', defaultValue:''},
		{name:'cte_xml', type:'string', defaultValue:''},
		{name:'cte_cancelado_xml', type:'string', defaultValue:''},
		{name:'cte_cancelado_pdf', type:'string', defaultValue:''},
		
		{name:'recebedor_nome', type:'string', defaultValue:''},
		{name:'recebedor_doc', type:'string', defaultValue:''},
		{name:'lista_documentos', type:'string', defaultValue:''},
		{name:'lista_documentos_numeros', type:'string', defaultValue:''},
		{name:'cte_versao', type:'int'},
		{name:'coleta_pdf', type:'string', defaultValue:''},
		{name:'cte_exibe_consulta_fatura', type:'boolean', defaultValue:1},
		{name:'cte_exibe_consulta_cliente', type:'boolean', defaultValue:1},
		{name:'cte_versao_leiaute_xml', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.Documento.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_doc_id',
	fields: [
		{name:'cte_doc_id', type:'int'},
		{name:'cte_id', type:'int'},
		{name:'cte_doc_serie', type:'string', defaultValue:'000'},
		{name:'cte_doc_data_emissao', type:'date', dateFormat:'Y-m-d', defaultValue: new Date()},
		{name:'cte_doc_numero', type:'string', defaultValue:''},
		{name:'cte_doc_cfop', type:'int'},
		{name:'cte_doc_modelo', type:'int'},
		{name:'cte_doc_modelo_rotulo', type:'string', defaultValue:''},
		{name:'cte_doc_volumes', type:'int', defaultValue:0},
		{name:'cte_doc_bc_icms', type:'float', defaultValue:0},
		{name:'cte_doc_valor_icms', type:'float', defaultValue:0},
		{name:'cte_doc_bc_icms_st', type:'float', defaultValue:0},
		{name:'cte_doc_valor_icms_st', type:'float', defaultValue:0},
		{name:'cte_doc_peso_total', type:'float', defaultValue:0},
		{name:'cte_doc_pin', type:'int'},
		{name:'cte_doc_valor_produtos', type:'float', defaultValue:0},
		{name:'cte_doc_valor_nota', type:'float', defaultValue:0},
		{name:'cte_doc_chave_nfe', type:'string', defaultValue:''},
		{name:'cte_doc_tipo_doc', type:'int'},
		{name:'cte_doc_tipo_doc_rotulo', type:'string', defaultValue:''},
		{name:'cte_doc_descricao', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.Seguro.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_seg_id',
	fields: [
		{name:'cte_seg_id', type:'int'},
		{name:'cte_id', type:'int'},
		{name:'cte_seg_responsavel', type:'int'},
		{name:'cte_seg_responsavel_rotulo', type:'string', defaultValue:''},
		{name:'cte_seg_seguradora', type:'string', defaultValue:''},
		{name:'cte_seg_apolice', type:'string', defaultValue:''},
		{name:'cte_seg_averbacao', type:'string', defaultValue:''},
		{name:'cte_seg_valor_carga', type:'float', defaultValue:0}
	]
});

Ext.define('CTE.ProdPerigoso.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_pp_id',
	fields: [
		{name:'cte_pp_id', type:'int'},
		{name:'cte_id', type:'int'},
		
		{name:'iic_id', type:'int'},
		{name:'iic_nome', type:'string', defaultValue:''},
		
		{name:'prod_numero_onu', type:'int'},
		{name:'prod_nome_embarque', type:'string', defaultValue:''},
		{name:'prod_classe_risco', type:'string', defaultValue:''},
		{name:'prod_grupo_embalagem', type:'string', defaultValue:''},
		{name:'prod_ponto_fulgor', type:'string', defaultValue:''},
		{name:'cte_pp_qtde_prod', type:'string', defaultValue:''},
		{name:'cte_pp_qtde_volumes', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.eda.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_eda_id',
	fields: [
		{name:'cte_eda_id', type: 'int'},
		{name:'cte_id', type:'int'},
		{name:'cte_eda_tipo_doc', type:'string', defaultValue:'CNPJ'},
		{name:'cte_eda_cnpj', type:'string', defaultValue:''},
		{name:'cte_eda_cpf', type:'string', defaultValue:''},
		{name:'cte_eda_ie', type:'string', defaultValue:''},
		{name:'cte_eda_ie_uf', type:'string', defaultValue:''},
		{name:'cte_eda_raz_social_nome', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.dta.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_dta_id',
	fields: [
		{name:'cte_dta_id', type: 'int'},
		{name:'cte_eda_id', type:'int'},
		{name:'cte_dta_tpdoc', type:'int', defaultValue:0},
		{name:'cte_dta_tpdoc_rotulo', type:'string', defaultValue:'00 - CTRC'},
		{name:'cte_dta_serie', type:'string', defaultValue:''},
		{name:'cte_dta_sub_serie', type:'string', defaultValue:''},
		{name:'cte_dta_numero', type:'string', defaultValue:''},
		{name:'cte_dta_data_emissao', type:'date', dateFormat:'Y-m-d', defaultValue: new Date()},
		{name:'cte_dta_chave', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.VN.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_vn_id',
	fields: [
		{name:'cte_vn_id', type: 'int'},
		{name:'cte_id', type:'int'},
		{name:'cte_vn_chassi', type:'string', defaultValue:''},
		{name:'cte_vn_cor', type:'string', defaultValue:''},
		{name:'cte_vn_descricao_cor', type:'string', defaultValue:''},
		{name:'cte_vn_modelo', type:'string', defaultValue:''},
		{name:'cte_vn_valor_unit', type:'float', defaultValue:0},
		{name:'cte_vn_frete_unit', type:'float', defaultValue:0}
	]
});

Ext.define('CTE.Cubagem.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_dim_id',
	fields: [
		{name:'cte_dim_id', type: 'int'},
		{name:'cte_id', type:'int'},
		{name:'cte_dim_tipo_embalagem', type:'string', defaultValue:'QUADRADA'},
		{name:'cte_dim_volumes', type:'int', defaultValue:0},
		{name:'cte_dim_peso_bruto', type:'float', defaultValue:0},
		{name:'cte_dim_cumprimento', type:'float', defaultValue:0},
		{name:'cte_dim_altura', type:'float', defaultValue:0},
		{name:'cte_dim_largura', type:'float', defaultValue:0},
		{name:'cte_dim_cubagem_m3', type:'float', defaultValue:0},
		{name:'cte_dim_peso_cubado', type:'float', defaultValue:0},
		{name:'cte_dim_peso_taxado', type:'float', defaultValue:0},
		{name:'cte_dim_info_manuseio', type:'int', defaultValue:99}
	]
});

Ext.define('CTE.coleta.assoc.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'oca_id',
	fields: [
		{name:'oca_id', type: 'int'},
		{name:'cte_id', type:'int'},
		
		{name:'oca_serie', type:'int'},
		{name:'oca_numero', type:'int'},
		{name:'oca_data_emissao', type:'date', dateFormat:'Y-m-d', defaultValue:new Date()},
		
		{name:'oca_cnpj_emitente', type:'string', defaultValue:''},
		{name:'oca_inscricao_estadual', type:'string', defaultValue:''},
		{name:'oca_uf_ie', type:'string', defaultValue:''},
		{name:'oca_telefone', type:'string', defaultValue:''},
		{name:'oca_codigo_interno', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.coleta.lacre.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'lac_id',
	fields: [
		{name:'lac_id', type: 'int'},
		{name:'cte_id', type:'int'},
		
		{name:'lac_numero', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.VP.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_vp_id',
	fields: [
		{name:'cte_vp_id', type: 'int'},
		{name:'cte_id', type:'int'},
		
		{name:'cte_vp_cnpj_fornec', type:'string', defaultValue:''},
		{name:'cte_vp_comprov_compra', type:'float', defaultValue:0},
		{name:'cte_vp_cnpj_responsavel', type:'string', defaultValue:''},
		{name:'cte_vp_valor_vale', type:'float', defaultValue:0}
	]
});

Ext.define('CTE.VUC.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_rv_id',
	fields: [
		{name:'cte_rv_id', type: 'int'},
		{name:'cte_id', type:'int'},
		
		{name:'cte_rv_codigo_interno', type:'string', defaultValue:''},
		{name:'cte_rv_renavam', type:'string', defaultValue:''},
		{name:'cte_rv_placa', type:'string', defaultValue:''},
		{name:'cte_rv_tara', type:'int', defaultValue:0},
		{name:'cte_rv_cap_kg', type:'int', defaultValue:0},
		{name:'cte_rv_cap_m3', type:'int', defaultValue:0},
		{name:'cte_rv_tp_propriedade', type:'string', defaultValue:'P'},
		{name:'cte_rv_tp_propriedade_rotulo', type:'string', defaultValue:'P - Próprio'},
		{name:'cte_rv_tp_veiculo', type:'int', defaultValue:0},
		{name:'cte_rv_tp_veiculo_rotulo', type:'string', defaultValue:'0 - Tração'},
		{name:'cte_rv_tp_rodado', type:'int', defaultValue:0},
		{name:'cte_rv_tp_rodado_rotulo', type:'string', defaultValue:'00 - Não aplicável'},
		{name:'cte_rv_tp_carroceria', type:'int', defaultValue:0},
		{name:'cte_rv_tp_carroceria_rotulo', type:'string', defaultValue:'00 - Não aplicável'},
		{name:'cte_rv_uf_licenciado', type:'string', defaultValue:''},
		{name:'cte_rv_rntrc', type:'string', defaultValue:''},
		{name:'cte_rv_cpf', type:'string', defaultValue:''},
		{name:'cte_rv_cnpj', type:'string', defaultValue:''},
		{name:'cte_rv_razao_social', type:'string', defaultValue:''},
		{name:'cte_rv_inscricao_estadual', type:'string', defaultValue:''},
		{name:'cte_rv_uf_proprietario', type:'string', defaultValue:''},
		{name:'cte_rv_tp_proprietario', type:'int'},
		{name:'cte_rv_tp_proprietario_rotulo', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.Motorista.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_mo_id',
	fields: [
		{name:'cte_mo_id', type: 'int'},
		{name:'cte_id', type:'int'},
		
		{name:'cte_mo_motorista', type:'string', defaultValue:''},
		{name:'cte_mo_cpf', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.OCF.data.Model', {
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_ocf_id',
	fields: [
		{name:'cte_ocf_id', type: 'int'},
		{name:'cte_id', type:'int'},
		
		{name:'cte_ocf_interessado', type:'string', defaultValue:''},
		{name:'cte_ocf_titulo', type:'string', defaultValue:''},
		{name:'cte_ocf_texto', type:'string', defaultValue:''}
	]
});

Ext.define('CTE.Ocorrencia.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_ocor_id',
	fields: [
		{name:'cte_ocor_id', type:'int'},
		{name:'cte_id', type:'int'},
		{name:'ocor_id', type:'int'},
		{name:'ocor_codigo', type:'string', defaultValue:''},
		{name:'ocor_descricao', type:'string', defaultValue:''},
		{name:'ocor_modal', type:'string', defaultValue:''},
		{name:'ocor_caracteristica', type:'string', defaultValue:''},
		
		{name:'cte_doc_id', type:'int'},
		{name:'cte_doc_numero', type:'string', defaultValue:''},
		
		{name:'ocor_nome', type:'string', defaultValue:''},
		{name:'ocor_modal_caracteristica', type:'string', defaultValue:''},
		
		{name:'cte_ocor_quando', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue: new Date()},
		{name:'cte_ocor_quando_data', type:'date', dateFormat:'Y-m-d', defaultValue: new Date()},
		{name:'cte_ocor_quando_hora', type:'string', defaultValue:''},
		
		{name:'cte_ocor_cia_aerea', type:'string', defaultValue:''},
		{name:'cte_ocor_voo', type:'string', defaultValue:''},
		{name:'cte_ocor_base', type:'string', defaultValue:''},
		{name:'cte_ocor_serie_master', type:'string', defaultValue:''},
		{name:'cte_ocor_numero_master', type:'string', defaultValue:''},
		{name:'cte_ocor_operacional_master', type:'string', defaultValue:''},
		{name:'cte_ocor_chave_master', type:'string', defaultValue:''},
		{name:'cte_ocor_volumes', type:'int'},
		{name:'cte_ocor_peso_bruto', type:'float', defaultValue:0},
		{name:'cte_ocor_entregador_nome', type:'string', defaultValue:''},
		{name:'cte_ocor_entregador_doc', type:'string', defaultValue:''},
		{name:'cte_ocor_recebedor_nome', type:'string', defaultValue:''},
		{name:'cte_ocor_recebedor_doc', type:'string', defaultValue:''},
		{name:'cte_ocor_nota', type:'string', defaultValue:''},
		{name:'cte_ocor_comprovante', type:'string', defaultValue:''},
		
		{name:'cte_ocor_cadastrado_por', type:'int'},
		{name:'cte_ocor_cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cte_ocor_cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue: new Date()},
		
		{name:'cte_ocor_alterado_por', type:'int'},
		{name:'cte_ocor_alterado_por_nome', type:'string', defaultValue:''},
		{name:'cte_ocor_alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'cte_ocor_versao', type:'int', defaultValue:0}
	]
});

Ext.define('CTE.Evento.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'cte_ev_id',
	fields: [
		{name:'cte_ev_id', type:'int'},
		{name:'cte_id', type:'int'},
		{name:'cte_ev_protocolo', type:'string', defaultValue:''},
		{name:'cte_ev_data_hora', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'cte_ev_evento', type:'string', defaultValue:''},
		{name:'cte_ev_detalhe', type:'string', defaultValue:''}
	]
});

Ext.define('MDFE.Evento.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'mdfe_id', type:'int'},
		{name:'protocolo', type:'string', defaultValue:''},
		{name:'data_hora', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'evento', type:'string', defaultValue:''},
		{name:'detalhe', type:'string', defaultValue:''},
		{name:'motivo', type:'string', defaultValue:''}
	]
});

Ext.define('SeguroRCTRC.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'emp_id', type:'int'},
		
		{name:'uf_origem', type:'string', defaultValue:''},
		{name:'uf_destino', type:'string', defaultValue:''},
		{name:'percentual', type:'float', defaultValue:0},
		
		{name:'cadastrado_por', type:'int'},
		{name:'cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'alterado_por', type:'int'},
		{name:'alterado_por_nome', type:'string', defaultValue:''},
		{name:'alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		
		{name:'versao', type:'int'}
	]
});

Ext.define('Expresso.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'emp_id', type:'int'},
		
		{name:'clie_id', type:'int'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		
		{name:'cid_id_origem', type:'int'},
		{name:'cid_origem_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_municipio', type:'string', defaultValue:''},
		{name:'cid_origem_uf', type:'string', defaultValue:''},
		{name:'cid_origem_sigla', type:'string', defaultValue:''},
		{name:'cid_origem_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_origem_nome', type:'string', defaultValue:''},
		
		{name:'cid_id_destino', type:'int'},
		{name:'cid_destino_codigo_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_municipio', type:'string', defaultValue:''},
		{name:'cid_destino_uf', type:'string', defaultValue:''},
		{name:'cid_destino_sigla', type:'string', defaultValue:''},
		{name:'cid_destino_nome_aeroporto', type:'string', defaultValue:''},
		{name:'cid_destino_nome', type:'string', defaultValue:''},
		
		{name:'peso_taxa_minima', type:'float', defaultValue:0},
		{name:'valor_taxa_minima', type:'float', defaultValue:0},
		{name:'tipo_data_prev_entrega', type:'int', defaultValue:0},
		{name:'tipo_hora_prev_entrega', type:'int', defaultValue:0},
		
		{name:'dias_programado', type:'int', defaultValue:0},
		{name:'dias_inicial', type:'int', defaultValue:0},
		{name:'dias_final', type:'int', defaultValue:0},
		
		{name:'hora_programada', type:'string', defaultValue:''},
		{name:'hora_inicial', type:'string', defaultValue:''},
		{name:'hora_final', type:'string', defaultValue:''},
		
		{name:'cadastrado_por', type:'int', defaultValue:0},
		{name:'cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue: new Date()},
		
		{name:'alterado_por', type:'int', defaultValue:0},
		{name:'alterado_por_nome', type:'string', defaultValue:''},
		{name:'alterado_em', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue: new Date()},
		
		{name:'versao', type:'int'}
	]
});

Ext.define('Expresso.Excedente.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'exp_id', type:'int'},
		
		{name:'peso_ate_kg', type:'int'},
		{name:'valor_excedente', type:'float', defaultValue:0}
	]
});

Ext.define('Financeiro.Receber.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'emp_id', type:'int', defaultValue: App.empresa.emp_id},
		
		{name:'clie_id', type:'int'},
		{name:'devedor_razao_social', type:'string', defaultValue:''},
		{name:'devedor_nome_fantasia', type:'string', defaultValue:''},
		{name:'devedor_cpf_cnpj', type:'string', defaultValue:''},
		{name:'devedor_telefone', type:'string', defaultValue:''},
		{name:'devedor_endereco', type:'string', defaultValue:''},
		{name:'cliefat_email', type:'string', defaultValue:''},
		{name:'cliefat_obs_duplicata', type:'string', defaultValue:''},
		{name:'cliefat_status_cobranca', type:'string', defaultValue:'F'},
		
		{name:'doc_fatura', type:'string', defaultValue:''},
		{name:'emitido_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'valor_ctes', type:'float', defaultValue:0},
		{name:'valor_original', type:'float', defaultValue:0},
		{name:'vence_em', type:'date', dateFormat:'Y-m-d'},
		{name:'valor_multa', type:'float', defaultValue:0},
		{name:'valor_juros', type:'float', defaultValue:0},
		{name:'valor_acrescimo', type:'float', defaultValue:0},
		{name:'valor_desconto', type:'float', defaultValue:0},
		{name:'valor_abatimento', type:'float', defaultValue:0},
		{name:'valor_recebido', type:'float', defaultValue:0},
		{name:'recebido_em', type:'date', dateFormat:'Y-m-d'},
		{name:'tipo_carteira', type:'string', defaultValue:''},
		{name:'situacao', type:'string', defaultValue:''},
		{name:'motivo_cancelado', type:'string', defaultValue:''},
		{name:'nota_obs', type:'string', defaultValue:''},
		{name:'pdf_duplicata', type:'string', defaultValue:''},
		{name:'emitido_boleto', type:'boolean', defaultValue:0},
		{name:'email_enviado', type:'boolean', defaultValue:0},
		
		{name:'cadastrado_por', type:'int'},
		{name:'cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue: new Date()},
		
		{name:'alterado_por', type:'int'},
		{name:'alterado_por_nome', type:'string', defaultValue:''},
		{name:'alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'versao', type:'int', defaultValue:0},
		
		{name:'lista_ctes', type:'string', defaultValue:''},
		{name:'ctes_list_id', type:'string', defaultValue:''},
		{name:'situacao_fatura', type:'string', defaultValue:'A VENCER'},
		
		{name:'bco_id', type:'int'},
		{name:'banco_numero', type:'string', defaultValue:''},
		{name:'banco_nome', type:'string', defaultValue:''},
		{name:'agencia', type:'string', defaultValue:''},
		{name:'digito_ver_agencia', type:'string', defaultValue:''},
		{name:'conta_corrente', type:'string', defaultValue:''},
		{name:'digito_ver_conta_corrente', type:'string', defaultValue:''},
		{name:'codigo_empresa', type:'string', defaultValue:''}
	]
});

Ext.define('Romaneio.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'romaneio_id',
	fields: [
		{name:'romaneio_id', type:'int'},
		
		{name:'usuario_fk', type:'int', defaultValue: App.usuario.user_id},
		{name:'alterado_por_nome', type:'string', defaultValue:App.usuario.user_nome},
		
		{name:'cliente_fk', type:'int'},
		{name:'clie_categoria', type:'string', defaultValue:''},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_nome_fantasia', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		{name:'clie_endereco', type:'string', defaultValue:''},
		{name:'clie_bairro', type:'string', defaultValue:''},
		{name:'clie_cep', type:'string', defaultValue:''},
		{name:'clie_cidade', type:'string', defaultValue:''},
		{name:'clie_uf', type:'string', defaultValue:''},
		{name:'clie_cidade_uf', type:'string', defaultValue:''},
		
		{name:'romaneio_data', type:'date', dateFormat:'Y-m-d', defaultValue: new Date()},
		{name:'romaneio_hora', type:'string', defaultValue:''},
		{name:'romaneio_nome_embarcador', type:'string', defaultValue:''},
		{name:'romaneio_nome_transportadora', type:'string', defaultValue:''},
		{name:'romaneio_emitido', type:'boolean', defaultValue:0},
		
		{name:'nf_volumes', type:'int', defaultValue:0},
		{name:'nf_peso_real', type:'float', defaultValue:0},
		{name:'nf_peso_cubado', type:'float', defaultValue:0},
		{name:'nf_valor', type:'float', defaultValue:0}
	]
});

Ext.define('Romaneio.NF.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'nf_id',
	fields: [
		{name:'nf_id', type:'int'},
		{name:'romaneio_fk', type:'int'},
		
		{name:'nf_destinatario', type:'string', defaultValue:''},
		{name:'nf_cidade', type:'string', defaultValue:''},
		{name:'nf_local_entrega', type:'string', defaultValue:'O MESMO'},
		{name:'nf_numero_ri', type:'string', defaultValue:''},
		{name:'nf_numero_rm', type:'string', defaultValue:''},
		{name:'nf_data_limite', type:'date', dateFormat:'Y-m-d'},
		{name:'nf_modal', type:'string', defaultValue:''},
		{name:'nf_numero', type:'string', defaultValue:''},
		{name:'nf_volumes', type:'int', defaultValue:0},
		{name:'nf_peso_real', type:'float', defaultValue:0},
		{name:'nf_peso_cubado', type:'float', defaultValue:0},
		{name:'nf_valor', type:'float', defaultValue:0},
		{name:'nf_notas', type:'string', defaultValue:''}
	]
});

Ext.define('Romaneio.Veiculo.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'veiculo_id',
	fields: [
		{name:'veiculo_id', type:'int'},
		{name:'romaneio_fk', type:'int'},
		
		{name:'veiculo_nome', type:'string', defaultValue:''},
		{name:'veiculo_placa', type:'string', defaultValue:''},
		{name:'veiculo_motorista', type:'string', defaultValue:''},
		{name:'veiculo_ajudantes', type:'int', defaultValue:0},
		{name:'veiculo_data_saida', type:'date', dateFormat:'Y-m-d'},
		{name:'veiculo_hora_saida', type:'string', defaultValue:''}
	]
});

Ext.define('Agregados.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'tipo_documento', type:'string', defaultValue:'CNPJ'},
		{name:'documento', type:'string', defaultValue:''},
		{name:'RNTRC', type:'string', defaultValue:''},
		{name:'xNome', type:'string', defaultValue:''},
		{name:'IE', type:'string', defaultValue:''},
		{name:'UF', type:'string', defaultValue:''},
		{name:'tpProp', type:'int'},
		{name:'tpProp_rotulo', type:'string', defaultValue:''}
	]
});

Ext.define('Motoristas.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'emp_id', type:'int'},
		{name:'nome', type:'string', defaultValue:''},
		{name:'cpf', type:'string', defaultValue:''},
		{name:'rg', type:'string', defaultValue:''},
		{name:'celular', type:'string', defaultValue:''},
		{name:'fone', type:'string', defaultValue:''},
		{name:'email', type:'string', defaultValue:''},
		{name:'funcionario', type:'boolean', defaultValue:1},
		{name:'funcionario_rotulo', type:'string', defaultValue:'Funcionário'},
		{name:'login', type:'string', defaultValue:''},
		{name:'senha', type:'string', defaultValue:''},
		{name:'cadastrado_por', type:'int'},
		{name:'cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cadastro_em', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue:new Date()},
		{name:'alterado_por', type:'int'},
		{name:'alterado_por_nome', type:'string', defaultValue:''},
		{name:'alterado_em', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue:new Date()},
		{name:'versao', type:'int', defaultValue:0}
	]
});

Ext.define('Veiculos.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'agre_id', type:'int'},
		{name:'agre_nome', type:'string', defaultValue:''},
		
		{name:'cInt', type:'string', defaultValue:''},
		{name:'placa', type:'string', defaultValue:''},
		{name:'RENAVAM', type:'string', defaultValue:''},
		{name:'tara', type:'int', defaultValue:0},
		{name:'capKG', type:'int', defaultValue:0},
		{name:'capM3', type:'int', defaultValue:0},
		{name:'tpRod', type:'int', defaultValue:1},
		{name:'tpRod_rotulo', type:'string', defaultValue:'Truck'},
		{name:'tpCar', type:'int', defaultValue:0},
		{name:'tpCar_rotulo', type:'string', defaultValue:'não aplicável'},
		{name:'UF', type:'string', defaultValue:'SP'}
	]
});

Ext.define('Veiculos.Condutores.data.Model',{
	extend: 'Ext.data.Model',
	
	fields: [
		{name:'moto_id', type:'int'},
		{name:'motorista_nome', type:'string', defaultValue:''},
		{name:'motorista_cpf', type:'string', defaultValue:''},
		{name:'motorista_rg', type:'string', defaultValue:''},
		{name:'motorista_celular', type:'string', defaultValue:''},
		{name:'motorista_fone', type:'string', defaultValue:''},
		{name:'motorista_email', type:'string', defaultValue:''},
		{name:'motorista_funcionario', type:'string', defaultValue:'Funcionário'},
		
		{name:'veic_trac_id', type:'int'},
		{name:'agre_nome', type:'string', defaultValue:''},
		{name:'veiculos_codigo', type:'string', defaultValue:''},
		{name:'veiculo_placa', type:'string', defaultValue:''},
		{name:'veiculo_renavam', type:'string', defaultValue:''},
		{name:'veiculo_tara', type:'int', defaultValue:0},
		{name:'veiculo_capkg', type:'int', defaultValue:0},
		{name:'veiculo_capm3', type:'int', defaultValue:0},
		{name:'veiculo_tipo_rodado', type:'string', defaultValue:'Truck'},
		{name:'veiculo_tipo_carroceria', type:'string', defaultValue:'não aplicável'},
		{name:'veiculo_uf_licenciamento', type:'string', defaultValue:'SP'}
	]
});

Ext.define('MDFE.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	fields: [
		{name:'id', type:'int'},
		{name:'emp_id', type:'int'},
		{name:'tpEmit', type:'int', defaultValue:1},
		{name:'tpEmit_rotulo', type:'string', defaultValue:'Prestador de serviço de transporte'},
		{name:'mod', type:'int', defaultValue:58},
		{name:'serie', type:'int', defaultValue:1},
		{name:'nMDF', type:'int'},
		{name:'cMDF', type:'string'},
		{name:'dhEmi', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'tpEmis', type:'int', defaultValue:1},
		{name:'tpEmis_rotulo', type:'string', defaultValue:'Normal'},
		{name:'procEmi', type:'int', defaultValue:0},
		{name:'procEmi_rotulo', type:'string', defaultValue:'Emissão de MDF-e com aplicativo do contribuinte'},
		{name:'verProc', type:'string', defaultValue:'1.0.0'},
		{name:'UFIni', type:'string', defaultValue:''},
		{name:'UFFim', type:'string', defaultValue:''},
		{name:'codAgPorto', type:'string', defaultValue:''},
		{name:'qCTe', type:'int', defaultValue:0},
		{name:'vCarga', type:'float', defaultValue:0},
		{name:'cUnid', type:'int', defaultValue:1},
		{name:'cUnid_rotulo', type:'string', defaultValue:'KG'},
		{name:'qCarga', type:'float', defaultValue:0},
		{name:'infAdFisco', type:'string', defaultValue:''},
		{name:'infCpl', type:'string', defaultValue:''},
		{name:'situacao', type:'string', defaultValue:'DIGITAÇÃO'},
		{name:'xml', type:'string', defaultValue:''},
		{name:'pdf', type:'string', defaultValue:''},
		{name:'cancelado_xml', type:'string', defaultValue:''},
		{name:'cancelado_pdf', type:'string', defaultValue:''},
		{name:'damdfe_impresso', type:'boolean', defaultValue:0},
		{name:'email_enviado', type:'boolean', defaultValue:0},
		{name:'cadastrado_por', type:'int'},
		{name:'cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'alterado_por', type:'int'},
		{name:'alterado_por_nome', type:'string', defaultValue:''},
		{name:'alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'lista_ctes', type:'string', defaultValue:''},
		{name:'versao', type:'int'}
	]
});

Ext.define('Coletas.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	
	fields: [
		{name:'id', type:'int'},
		{name:'coletar_em', type:'date', dateFormat:'Y-m-d', defaultValue: new Date()},
		{name:'coletar_das', type:'string', defaultValue:'08:00'},
		{name:'coletar_ate', type:'string', defaultValue:'18:00'},
		{name:'nota_coleta', type:'string', defaultValue:''},
		{name:'nota_motorista', type:'string', defaultValue:''},
		{name:'concluida_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'status', type:'string', defaultValue:'AGUARDANDO'},
		
		{name:'cadastrado_por', type:'int'},
		{name:'cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue:new Date()},
		
		{name:'alterado_por', type:'int'},
		{name:'alterado_por_nome', type:'string', defaultValue:''},
		{name:'alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'versao', type:'int', defaultValue:0},
		
		{name:'clie_id', type:'int'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_nome_fantasia', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		{name:'clie_endereco', type:'string', defaultValue:''},
		{name:'cliente_fones', type:'string', defaultValue:''},
		
		{name:'mot_id', type:'int'},
		{name:'motorista_nome', type:'string', defaultValue:''},
		{name:'motorista_celular', type:'string', defaultValue:''},
		{name:'motorista_email', type:'string', defaultValue:''},
		
		{name:'veic_trac_id', type:'int'},
		{name:'veiculo_placa', type:'string', defaultValue:''},
		{name:'veiculo_tipo', type:'string', defaultValue:''},
		{name:'veiculo_carroceria', type:'string', defaultValue:''},
		
		{name:'coleta_pdf', type:'string', defaultValue:''},
		{name:'coleta_filename', type:'string', defaultValue:''}
	]
});

Ext.define('ColetasProgramadas.data.Model',{
	extend: 'Ext.data.Model',
	
	idProperty: 'id',
	
	fields: [
		{name:'id', type:'int'},
		{name:'dia_da_semana', type:'string', defaultValue:'SEG'},
		{name:'coletar_das', type:'string', defaultValue:'08:00'},
		{name:'coletar_ate', type:'string', defaultValue:'18:00'},
		{name:'descricao', type:'string', defaultValue:''},
		
		{name:'cadastrado_por', type:'int'},
		{name:'cadastrado_por_nome', type:'string', defaultValue:''},
		{name:'cadastrado_em', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue:new Date()},
		
		{name:'alterado_por', type:'int'},
		{name:'alterado_por_nome', type:'string', defaultValue:''},
		{name:'alterado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
		{name:'versao', type:'int', defaultValue:0},
		
		{name:'clie_id', type:'int'},
		{name:'clie_razao_social', type:'string', defaultValue:''},
		{name:'clie_nome_fantasia', type:'string', defaultValue:''},
		{name:'clie_cnpj_cpf', type:'string', defaultValue:''},
		{name:'clie_endereco', type:'string', defaultValue:''},
		{name:'cliente_fones', type:'string', defaultValue:''}
	]
});