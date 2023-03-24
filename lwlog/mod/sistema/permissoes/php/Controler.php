<?php
class Controler extends App {
	/**
	 * Salvar permissões. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_permissoes() {
		$perm_id = intval($_POST['perm_id']);
		$perm_grupo = $this->escape(trim($_POST['perm_grupo']));
		
		$sql = "SELECT COUNT(*) AS existente FROM permissoes WHERE perm_grupo = ".$perm_grupo; 
		if ($perm_id > 0) {
			$sql.= " AND perm_id != ".$perm_id;
		}
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente;
		$this->free_result($query);
		
		if ($exist) {
			print json_encode(array('success'=>false,'msg'=>'Esse grupo já se encontra cadastrado! Informe outro nome para permissão.'));
			return false;
		}
		
		$perm_menu_empresas = $this->escape($_POST['perm_menu_empresas'], 'bool');
		$perm_menu_usuarios = $this->escape($_POST['perm_menu_usuarios'], 'bool');
		$perm_menu_permissoes = $this->escape($_POST['perm_menu_permissoes'], 'bool');
		$perm_menu_log_eventos = $this->escape($_POST['perm_menu_log_eventos'], 'bool');
		$perm_menu_gerenciar_cte = $this->escape($_POST['perm_menu_gerenciar_cte'], 'bool');
		$perm_menu_inutilizar_cte = $this->escape($_POST['perm_menu_inutilizar_cte'], 'bool');
		$perm_menu_composicao_frete = $this->escape($_POST['perm_menu_composicao_frete'], 'bool');
		$perm_menu_composicao_calculo = $this->escape($_POST['perm_menu_composicao_calculo'], 'bool');
		$perm_menu_consulta_inutilizacoes = $this->escape($_POST['perm_menu_consulta_inutilizacoes'], 'bool');
		$perm_menu_clientes = $this->escape($_POST['perm_menu_clientes'], 'bool');
		$perm_menu_municipios = $this->escape($_POST['perm_menu_municipios'], 'bool');
		$perm_menu_grupo_tarifas = $this->escape($_POST['perm_menu_grupo_tarifas'], 'bool');
		$perm_menu_iata_imp_codes = $this->escape($_POST['perm_menu_iata_imp_codes'], 'bool');
		$perm_menu_produtos = $this->escape($_POST['perm_menu_produtos'], 'bool');
		$perm_menu_rotas_entregas = $this->escape($_POST['perm_menu_rotas_entregas'], 'bool');
		$perm_menu_praca_pagamento = $this->escape($_POST['perm_menu_praca_pagamento'], 'bool');
		$perm_menu_cfop = $this->escape($_POST['perm_menu_cfop'], 'bool');
		$perm_menu_tab_nacional = $this->escape($_POST['perm_menu_tab_nacional'], 'bool');
		$perm_menu_tab_especial = $this->escape($_POST['perm_menu_tab_especial'], 'bool');
		$perm_menu_tab_minima = $this->escape($_POST['perm_menu_tab_minima'], 'bool');
		$perm_menu_tab_expresso = $this->escape($_POST['perm_menu_tab_expresso'], 'bool');
		$perm_menu_tx_terrestres = $this->escape($_POST['perm_menu_tx_terrestres'], 'bool');
		$perm_menu_tx_redespacho = $this->escape($_POST['perm_menu_tx_redespacho'], 'bool');
		$perm_menu_tx_seguro_rctrc = $this->escape($_POST['perm_menu_tx_seguro_rctrc'], 'bool');
		$perm_menu_desconto_taxa_clie = $this->escape($_POST['perm_menu_desconto_taxa_clie'], 'bool');
		$perm_menu_faturamento = $this->escape($_POST['perm_menu_faturamento'], 'bool');
		$perm_menu_cta_receber = $this->escape($_POST['perm_menu_cta_receber'], 'bool');
		$perm_menu_cta_pagar = $this->escape($_POST['perm_menu_cta_pagar'], 'bool');
		$perm_menu_cotacoes = $this->escape($_POST['perm_menu_cotacoes'], 'bool');
		$perm_menu_informacoes = $this->escape($_POST['perm_menu_informacoes'], 'bool');
		$perm_menu_bancos = $this->escape($_POST['perm_menu_bancos'], 'bool');
		$perm_menu_ocorrencias = $this->escape($_POST['perm_menu_ocorrencias'], 'bool');
		$perm_menu_coleta = $this->escape($_POST['perm_menu_coleta'], 'bool');
		$perm_menu_romaneios = $this->escape($_POST['perm_menu_romaneios'], 'bool');
		
		$sql = ($perm_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "permissoes SET ";
		$sql.= "perm_grupo = ".$perm_grupo.",";
		$sql.= "perm_menu_empresas = ".$perm_menu_empresas.",";
		$sql.= "perm_menu_usuarios = ".$perm_menu_usuarios.",";
		$sql.= "perm_menu_permissoes = ".$perm_menu_permissoes.",";
		$sql.= "perm_menu_log_eventos = ".$perm_menu_log_eventos.",";
		$sql.= "perm_menu_gerenciar_cte = ".$perm_menu_gerenciar_cte.",";
		$sql.= "perm_menu_inutilizar_cte = ".$perm_menu_inutilizar_cte.",";
		$sql.= "perm_menu_composicao_frete = ".$perm_menu_composicao_frete.",";
		$sql.= "perm_menu_composicao_calculo = ".$perm_menu_composicao_calculo.",";
		$sql.= "perm_menu_consulta_inutilizacoes = ".$perm_menu_consulta_inutilizacoes.",";
		$sql.= "perm_menu_clientes = ".$perm_menu_clientes.",";
		$sql.= "perm_menu_municipios = ".$perm_menu_municipios.",";
		$sql.= "perm_menu_grupo_tarifas = ".$perm_menu_grupo_tarifas.",";
		$sql.= "perm_menu_iata_imp_codes = ".$perm_menu_iata_imp_codes.",";
		$sql.= "perm_menu_produtos = ".$perm_menu_produtos.",";
		$sql.= "perm_menu_rotas_entregas = ".$perm_menu_rotas_entregas.",";
		$sql.= "perm_menu_praca_pagamento = ".$perm_menu_praca_pagamento.",";
		$sql.= "perm_menu_cfop = ".$perm_menu_cfop.",";
		$sql.= "perm_menu_tab_nacional = ".$perm_menu_tab_nacional.",";
		$sql.= "perm_menu_tab_especial = ".$perm_menu_tab_especial.",";
		$sql.= "perm_menu_tab_minima = ".$perm_menu_tab_minima.",";
		$sql.= "perm_menu_tab_expresso = ".$perm_menu_tab_expresso.",";
		$sql.= "perm_menu_tx_terrestres = ".$perm_menu_tx_terrestres.",";
		$sql.= "perm_menu_tx_redespacho = ".$perm_menu_tx_redespacho.",";
		$sql.= "perm_menu_tx_seguro_rctrc = ".$perm_menu_tx_seguro_rctrc.",";
		$sql.= "perm_menu_desconto_taxa_clie = ".$perm_menu_desconto_taxa_clie.",";
		$sql.= "perm_menu_faturamento = ".$perm_menu_faturamento.",";
		$sql.= "perm_menu_cta_receber = ".$perm_menu_cta_receber.",";
		$sql.= "perm_menu_cta_pagar = ".$perm_menu_cta_pagar.",";
		$sql.= "perm_menu_cotacoes = ".$perm_menu_cotacoes.",";
		$sql.= "perm_menu_informacoes = ".$perm_menu_informacoes.",";
		$sql.= "perm_menu_bancos = ".$perm_menu_bancos.",";
		$sql.= "perm_menu_ocorrencias = ".$perm_menu_ocorrencias.",";
		$sql.= "perm_menu_coleta = ".$perm_menu_coleta.",";
		$sql.= "perm_menu_romaneios = ".$perm_menu_romaneios." ";
		if ($perm_id > 0) $sql.="WHERE perm_id = ".$perm_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$perm_id) {
			$perm_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'perm_id'=>$perm_id));
	}
	/**
	 * Excluir permissões. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_permissoes() {
		$sql = "DELETE FROM permissoes WHERE perm_id IN(".$_POST['perm_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar permissões. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_permissoes() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1 ";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_permissoes ";
		$sql.= $filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if ($p->limit) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		
		$this->free_result($query);
		
		$sql = "SELECT COUNT(perm_id) AS total FROM view_permissoes ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>