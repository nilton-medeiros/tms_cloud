<?php
class Controler extends App {
	/**
	 * Consultar MDFe's
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_mdfe() {
		$p = $this->get_sql_param();
		$id = trim($_GET['id']);
		$situacao = trim($_GET['situacao']);
		$status = trim($_GET['status']);

		$filter	= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$filter.= $p->filter;
		if (!empty($id)) {
			$p->start = 0;
			$filter.= "AND id IN (".$id.") ";
		} elseif (!empty($situacao)) {
			$situacao = explode(",", $situacao);
			foreach ($situacao as $key => $value) {
				$situacao[$key] = $this->escape($value, 'string');
			}
			$situacao = implode(",", $situacao);
			$filter.="AND situacao IN (".$situacao.") ";
		} elseif (!empty($status) && $status != 'TODOS') {
			$filter.="AND DATEDIFF(CURDATE(), dhEmi) <= ";
			if ($status == 'ÚLTIMOS 90 DIAS') {
				$filter.= "90 ";
			} elseif ($status == 'ÚLTIMOS 180 DIAS') {
				$filter.= "180 ";
			} elseif ($status == 'ÚLTIMOS 365 DIAS') {
				$filter.= "365 ";
			}
		}

		$sql = "SELECT * FROM view_mdfes ";
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

		$sql = "SELECT COUNT(id) AS total FROM view_mdfes ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);

		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Consultar eventos do MDF-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_eventos() {
		$sql = "SELECT * FROM mdfes_eventos WHERE mdfe_id = ".intval($_GET['mdfe_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			if (!empty($field->motivo) && !empty($field->detalhe) && $field->motivo != $field->detalhe) {
				$field->detalhe.= " / ";
				$field->detalhe.= $field->motivo;
			}
			array_push($list, $field);
		}
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar conhecimentos relacionado ao MDF selecionado. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_cte() {
		$sql = "SELECT ";
		$sql.= "t1.cte_id,";
		$sql.= "t1.cte_serie,";
		$sql.= "t1.cte_minuta,";
		$sql.= "t1.cte_numero,";
		$sql.= "t1.cte_chave,";
		$sql.= "t1.cte_pdf,";
		$sql.= "CONCAT(t3.cid_uf, ' - ', t3.cid_municipio, IF(t3.cid_nome_aeroporto IS NOT NULL AND t3.cid_nome_aeroporto != '' AND t3.cid_sigla IS NOT NULL AND t3.cid_sigla != '', CONCAT(' (', t3.cid_sigla, ' - ', t3.cid_nome_aeroporto,')'), '')) AS cid_destino ";
		$sql.= "FROM ctes AS t1 ";
		$sql.= "INNER JOIN mdfes_ctes AS t2 ON t2.ctes_id = t1.cte_id ";
		$sql.= "LEFT JOIN cidades AS t3 ON t3.cid_id = t1.cid_id_destino ";
		$sql.= "WHERE t2.mdfe_id = ".intval($_GET["mdfe_id"]);
		$query = $this->query($sql);
		if (!$query) {
			print json_encode($this->get_sql_error());
			return false;
		}
		$list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);

		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar conhecimentos em aberto para gerar MDF-e
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_ctes_aberto() {
		$_cidade_origem_uf = trim($_GET['cid_origem_uf']);
		$_cid_destino_uf = trim($_GET['cid_destino_uf']);
		$cid_origem_uf = $this->escape($_cidade_origem_uf, 'string');
		$cid_destino_uf = $this->escape($_cid_destino_uf, 'string');
		$periodo_inicial = $this->escape(trim($_GET['periodo_inicial']), 'date');
		$periodo_final = $this->escape(trim($_GET['periodo_final']), 'date');

		$sql = "SELECT ";
		$sql.= "t1.cte_id,";
		$sql.= "t1.cte_ciot,";
		$sql.= "t1.cte_serie,";
		$sql.= "t1.cte_minuta,";
		$sql.= "t1.cte_numero,";
		$sql.= "t1.cte_peso_bruto,";
		$sql.= "t1.cte_info_fisco,";
		$sql.= "t1.cte_obs_gerais,";
		$sql.= "t1.cte_valor_total,";
		$sql.= "t1.cte_valor_carga,";
		$sql.= "t1.cte_data_hora_emissao,";
		$sql.= "t1.cid_origem_uf,";
		$sql.= "t1.cid_destino_uf,";
		$sql.= "t1.cid_origem_nome_completo,";
		$sql.= "t1.cid_destino_nome_completo,";
		$sql.= "'' AS codAgPorto,";
		$sql.= "1 AS tpEmit,";
		$sql.= "'Prestador de serviço de transporte' AS tpEmit_rotulo ";
		$sql.= "FROM view_ctes AS t1 ";
		$sql.= "WHERE t1.emp_id = ".$this->empresa->emp_id." ";
		if (!empty($_cidade_origem_uf)) {
			$sql.= "AND t1.cid_origem_uf = ".$cid_origem_uf." ";
		}
		if (!empty($_cid_destino_uf)) {
			$sql.= "AND t1.cid_destino_uf = ".$cid_destino_uf." ";
		}
		$sql.= "AND (DATE(t1.cte_data_hora_emissao) BETWEEN ".$periodo_inicial." AND ".$periodo_final.") ";
		$sql.= "AND t1.cte_situacao = 'AUTORIZADO' ";
		$sql.= "AND t1.cte_chave IS NOT NULL AND t1.cte_chave != '' ";
		$sql.= "AND t1.cte_id NOT IN (";
		$sql.= "SELECT st1.ctes_id ";
		$sql.= "FROM mdfes_ctes AS st1 ";
		$sql.= "INNER JOIN mdfes AS st2 ON st2.id = st1.mdfe_id ";
		$sql.= "WHERE st2.situacao != 'CANCELADO' ";
		$sql.= "AND st2.emp_id = ".$this->empresa->emp_id;
		$sql.= ") ";
		$sql.= "ORDER BY t1.cid_origem_nome_completo ASC, t1.cid_destino_nome_completo ASC, t1.cte_id DESC";
		$query = $this->query($sql);
		if (!$query) {
			print json_encode($this->get_sql_error());
			return false;
		}
		$list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);

		print json_encode(array('total'=>count($list),'data'=>$list));
	}

	function gerar_mdf() {
		$records = json_decode($_POST["records"]);
		$tRecords = count($records);
		$qCTe = 0; $vCarga = 0;
		$ctes_id = array(); $list_id = array();

		for ($i=0; $i < $tRecords; $i++) {
			$item = $records[$i];
			$next = $records[$i + 1];

			$qCTe++;
			$qCarga += floatval($item->cte_peso_bruto);
			$vCarga += floatval($item->cte_valor_carga);
			array_push($ctes_id, $item->cte_id);

			if ($item->cid_origem_uf != $next->cid_origem_uf || $item->cid_destino_uf != $next->cid_destino_uf || empty($next)) {
				$sql = "INSERT INTO mdfes SET ";
				$sql.= "emp_id = ".$this->empresa->emp_id.",";
				$sql.= "tpEmit = ".$item->tpEmit.",";
				$sql.= "UFIni = ".$this->escape($item->cid_origem_uf).",";
				$sql.= "UFFim = ".$this->escape($item->cid_destino_uf).",";
				$sql.= "codAgPorto = ".$this->escape($item->codAgPorto, "string").",";
				$sql.= "qCTe = ".$qCTe.",";
				$sql.= "vCarga = ".$vCarga.",";
				$sql.= "qCarga = ".$qCarga.",";
				$sql.= "infAdFisco = ".$this->escape($item->cte_info_fisco, "string").",";
				$sql.= "infCpl = ".$this->escape($item->cte_obs_gerais, "string");
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
				$mdf_id = $this->insert_id();
				array_push($list_id, $mdf_id);
				foreach ($ctes_id as $cte_id) {
					$sql = "INSERT INTO mdfes_ctes SET ";
					$sql.= "mdfe_id = ".$mdf_id.",";
					$sql.= "ctes_id = ".$cte_id;
					if (!$this->query($sql)) {
						print json_encode($this->get_sql_error());
						return false;
					}
				}
				$qCTe = 0;
				$vCarga = 0;
				$qCarga = 0;
				$ctes_id = array();

				$s = "INSERT INTO mdfes_inf_unid_transp (";
				$s.= "mdfe_id,";
				$s.= "cte_mo_id";
				$s.= ") SELECT ";
				$s.= $mdf_id.",";
				$s.= "t1.cte_rv_id ";
				$s.= "FROM ctes_rod_motoristas AS t1 ";
				$s.= "INNER JOIN mdfes_ctes AS t2 ON t2.ctes_id = t1.cte_id ";
				$s.= "WHERE t2.mdfe_id = ".$mdf_id." ";
				$s.= "GROUP BY t1.cte_mo_cpf";
				if (!$this->query($s)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}
		print json_encode(array("success"=>true,"mdf_list_id"=>join(",", $list_id)));
	}
	/**
	 * Excluir MDF-e e suas dependências
	 * @remotable
	 * @access public
	 * @return outpup (json)
	 */
	function delete_mdfe() {
		$id = trim($_POST['id']);
		$sql = "DELETE FROM mdfes WHERE id IN (".$id.")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success" => $this->affected_rows() > 0));
	}
	/**
	 * Transmitir MDF-e para SEFAZ. Uso exclusivo do Ajax Request
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function transmitir() {
		$sql = "UPDATE mdfes SET situacao = 'TRANSMITIDO', cte_monitor_action = 'SUBMIT' WHERE id IN(".$_POST['id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		sleep(15);
		print json_encode(array('success'=>true));
	}
	/**
	 * Retornar verifica o status da MDF-e na SEFAZ. Uso exclusivo do Ajax Request
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function verifica($pDados="") {
		$sql = "UPDATE mdfes SET cte_monitor_action = 'SUBMIT' WHERE id IN(".$_POST['id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		sleep(15);
		print json_encode(array('success'=>true));
	}
	/**
	 * Cancelar mdfe enviado para SEFAZ. Uso exclusivo do Ajax Request
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function cancelar() {
		$sql = "UPDATE mdfes SET cte_monitor_action = 'CANCEL' WHERE id IN(".$_POST['id'].") AND situacao = 'AUTORIZADO'";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		sleep(15);
		print json_encode(array('success'=>true));
	}
	/**
	 * Encerrar mdfe enviado para SEFAZ. Uso exclusivo do Ajax Request
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function encerrar() {
		$sql = "UPDATE mdfes SET cte_monitor_action = 'CLOSE' WHERE id IN(".$_POST['id'].") AND situacao = 'AUTORIZADO'";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		sleep(15);
		print json_encode(array('success'=>true));
	}
	/**
	 * Gravar evento de retorno do WebService
	 * @access private
	 * @param $data array assoc
	 * @param $checkExist boolean
	 * @return bool
	 */
	private function registrar_evento($data, $checkExist=false) {
		$data['mdfe_id'] = intval($data['mdfe_id']);
		$data['codigo'] = $this->escape($data['codigo'], "string");
		$data['mensagem'] = $this->escape($data['mensagem'], "string");
		$data['protocolo'] = $this->escape($data['protocolo'], "string");

		if ($checkExist === true) {
			$sql = "SELECT COUNT(*) AS existente FROM mdfes_eventos ";
			$sql.= "WHERE mdfe_id = ".$data['mdfe_id']." ";
			$sql.= "AND evento = ".$data['codigo']." ";
			$sql.= "AND detalhe = ".$data['mensagem'];
			$query = $this->query($sql);
			$exist = $this->fetch_object($query)->existente > 0;
			$this->free_result($query);
			if ($exist) {
				return true;
			}
		}

		$sql = "INSERT INTO mdfes_eventos SET ";
		$sql.= "mdfe_id = ".$data['mdfe_id'].",";
		$sql.= "evento = ".$data['codigo'].",";
		$sql.= "protocolo = ".$data['protocolo'].",";
		$sql.= "detalhe = ".$data['mensagem'].",";
		$sql.= "data_hora = NOW() ";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		return true;
	}
	/**
	 * Consultar Percursos do MDFe's
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_percursos() {
		$sql = "SELECT * FROM mdfes_percurso WHERE mdfe_id = ".intval($_GET['mdfe_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Salvar Percursos do MDFe's
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_percursos() {
		$id = intval($_POST["id"]);
		$mdfe_id = intval($_POST["mdfe_id"]);
		$UFPer = $this->escape($_POST["UFPer"]);

		$sql = ($id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "mdfes_percurso SET ";
		$sql.= "mdfe_id = ".$mdfe_id.",";
		$sql.= "UFPer = ".$UFPer." ";
		$sql.= ($id > 0) ? "WHERE id = ".$id : "";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$id) {
			$id = $this->insert_id();
		}
		print json_encode(array("success"=>true,"id"=>$id));
	}
	/**
	 * Excluir Percursos do MDFe's
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_percursos() {
		$sql = "DELETE FROM mdfes_percurso WHERE id IN (".trim($_POST["id"]).")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success"=>true));
	}
	/**
	 * Consultar motoristas relacionados a MDF-e
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_motorista() {
		$sql = "SELECT t1.*,";
		$sql.= "IF(t1.cte_mo_id > 0, CONCAT_WS(' ', t4.cte_mo_motorista, t4.cte_mo_cpf), CONCAT_WS(' ', t3.nome, t3.cpf)) AS motorista,";
		$sql.= "IF(t1.cte_mo_id > 0, CONCAT_WS(' ', t5.cte_rv_tp_rodado_rotulo, t5.cte_rv_tp_carroceria_rotulo, '-', t5.cte_rv_placa, CONCAT('(', t5.cte_rv_cap_kg, 'kg)')), CONCAT_WS(' ', t2.tpRod_rotulo, t2.tpCar_rotulo, '-', t2.placa, CONCAT('(', t2.capKG, 'kg)'))) AS veiculo ";
		$sql.= "FROM mdfes_inf_unid_transp AS t1 ";
		$sql.= "LEFT JOIN veiculos AS t2 ON t2.id = t1.veic_trac_id ";
		$sql.= "LEFT JOIN motoristas AS t3 ON t3.id = t1.mot_id ";
		$sql.= "LEFT JOIN ctes_rod_motoristas AS t4 ON t4.cte_mo_id = t1.cte_mo_id ";
		$sql.= "LEFT JOIN ctes_rod_veiculos AS t5 ON t5.cte_rv_id = t4.cte_rv_id ";
		$sql.= "WHERE t1.mdfe_id = ".intval($_GET["mdfe_id"])." ";
		$sql.= "ORDER BY motorista";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Salvar relacionamento motorista com veículo com MDF-e
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_motorista() {
		$mdfe_id = intval($_POST["mdfe_id"]);
		$veic_id = intval($_POST["veic_id"]);
		$mot_id = intval($_POST["mot_id"]);

		$sql = "SELECT COUNT(*) AS existente FROM mdfes_inf_unid_transp ";
		$sql.= "WHERE mdfe_id = ".$mdfe_id." ";
		$sql.= "AND mot_id = ".$mot_id." ";
		$sql.= "AND veic_trac_id = ".$veic_id;
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente > 0;
		$this->free_result($query);

		if ($exist) {
			print json_encode(array("success"=>true));
			return true;
		}

		$sql = "INSERT INTO mdfes_inf_unid_transp SET ";
		$sql.= "mdfe_id = ".$mdfe_id.",";
		$sql.= "mot_id = ".$mot_id.",";
		$sql.= "veic_trac_id = ".$veic_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		print json_encode(array("success"=>true));
	}
	/**
	 * Excluir relacionamento motorista com veículo com MDF-e
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_motorista() {
		$records = json_decode($_POST["records"]);
		foreach ($records as $record) {
			$sql = "DELETE FROM mdfes_inf_unid_transp ";
			$sql.= "WHERE mdfe_id = ".$record->mdfe_id;
			$sql.= ($record->cte_mo_id > 0) ? " AND cte_mo_id = ".$record->cte_mo_id : "";
			$sql.= ($record->mot_id > 0) ? " AND mot_id = ".$record->mot_id : "";
			$sql.= ($record->veic_trac_id > 0) ? " AND veic_trac_id = ".$record->veic_trac_id : "";
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		print json_encode(array("success"=>true));
	}
	/**
	 * Carregar lista de motorista através de $veic_id
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function motorista_store() {
		$sql = "SELECT ";
		$sql.= "t1.id,";
		$sql.= "CONCAT_WS(' ', t1.nome, t1.cpf) AS nome_cpf ";
		$sql.= "FROM motoristas AS t1 ";
		$sql.= "INNER JOIN veiculos_condutores AS t2 ON t2.moto_id = t1.id ";
		$sql.= "WHERE t2.veic_trac_id = ".intval($_GET["veic_id"])." ";
		$sql.= "ORDER BY t1.nome";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
}
?>