<?php
class Controler extends App {
	/**
	 * Salvar redespachos. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_taxas() {
		$red_id = intval($_POST['red_id']);
		$clie_id = intval($_POST['clie_id']);
		if (!$clie_id) {
			$clie_id = "NULL";
		}
		$cid_id_origem = intval($_POST['cid_id_origem']);
		$cid_id_passagem = intval($_POST['cid_id_passagem']);
		$cid_id_destino = intval($_POST['cid_id_destino']);
		$red_nota = $this->escape(trim($_POST['red_nota']));
		$red_por_peso = $this->escape($_POST['red_por_peso'], 'bool');
		$red_valor = $this->escape($_POST['red_valor'], 'decimal');
		$red_ate_kg = intval($_POST['red_ate_kg']);
		$red_excedente = $this->escape($_POST['red_excedente'], 'decimal');
		$red_aceita_frete_a_pagar = $this->escape($_POST['red_aceita_frete_a_pagar'], 'bool');
		
		$sql = ($red_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "redespachos SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "cid_id_origem = ".$cid_id_origem.",";
		$sql.= "cid_id_passagem = ".$cid_id_passagem.",";
		$sql.= "cid_id_destino = ".$cid_id_destino.",";
		$sql.= "red_nota = ".$red_nota.",";
		$sql.= "red_por_peso = ".$red_por_peso.",";
		$sql.= "red_valor = ".$red_valor.",";
		$sql.= "red_ate_kg = ".$red_ate_kg.",";
		$sql.= "red_excedente = ".$red_excedente.",";
		$sql.= "red_aceita_frete_a_pagar = ".$red_aceita_frete_a_pagar." ";
		if ($red_id > 0) {
			$sql.="WHERE red_id = ".$red_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$red_id) {
			$red_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'red_id'=>$red_id));
	}
	/**
	 * Excluir redespachos. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_taxas() {
		$sql = "DELETE FROM redespachos WHERE red_id IN(".$_POST['red_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar redespachos. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_taxas() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_taxa_redespacho ";
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
		
		$sql = "SELECT COUNT(red_id) AS total FROM view_taxa_redespacho ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem das redespachos para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function taxas_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE emp_id = ".$this->empresa->emp_id." ";
		$filter.= $this->get_filter_param('view_taxa_redespacho');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_taxa_redespacho ".$filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if (!empty($p->limit)) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql);
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		
		$sql = "SELECT COUNT(red_id) AS total FROM view_taxa_redespacho ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Salvar terrestres exceções de clientes. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_taxas_excecoes() {
		$red_id = intval($_POST['red_id']);
		$clie_id = intval($_POST['clie_id']);
		
		$sql = "SELECT COUNT(*) AS existente FROM redespachos_excecoes_clientes WHERE red_id = ".$red_id." AND clie_id = ".$clie_id;
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente > 0;
		$this->free_result($query);
		if (!$exist) {
			$sql = "INSERT INTO redespachos_excecoes_clientes SET ";
			$sql.= "red_id = ".$red_id.",";
			$sql.= "clie_id = ".$clie_id;
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		
		print json_encode(array('success'=>true));
	}
	/**
	 * Excluir terrestres exceções de clientes. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_taxas_excecoes() {
		$records = json_decode($_POST['records']);
		foreach ($records as $record) {
			$sql = "DELETE FROM redespachos_excecoes_clientes ";
			$sql.= "WHERE red_id = ".$record->red_id." ";
			$sql.= "AND clie_id = ".$record->clie_id;
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		print json_encode(array('success'=>true));
	}
	/**
	 * Consultar terrestres exceções de clientes. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_taxas_excecoes() {
		$sql = "SELECT * FROM view_taxa_redespacho_excecao WHERE red_id = ".intval($_GET['taxas_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Incluir exceção do cliente selecionado para todos registros da tabela 
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function include_taxas_excecoes() {
		$taxas_id = intval($_POST['taxas_id']);
		$clientes_id = trim($_POST['clientes_id']);
		$clientes_id = explode(",", $clientes_id);
		foreach ($clientes_id as $clie_id) {
			$clie_id = intval($clie_id);
			$sql = "INSERT INTO redespachos_excecoes_clientes (";
			$sql.= "red_id,";
			$sql.= "clie_id ";
			$sql.= ") SELECT ";
			$sql.= "red_id,";
			$sql.= $clie_id." ";
			$sql.= "FROM redespachos ";
			$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
			$sql.= "AND red_id != ".$taxas_id." ";
			$sql.= "AND red_id NOT IN (SELECT red_id FROM redespachos_excecoes_clientes)";
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		print json_encode(array("success"=>true));
	}
	/**
	 * Exclui exceção do cliente selecionado de todos registros da tabela 
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function exclude_taxas_excecoes() {
		$sql = "DELETE FROM redespachos_excecoes_clientes WHERE clie_id IN (".$_POST['clientes_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success"=>$this->affected_rows() > 0));
	}
}
?>