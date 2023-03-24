<?php
class Controler extends App {
	/**
	 * Salvar terrestres. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_taxas() {
		$tx_id = intval($_POST['tx_id']);
		$cc_id = intval($_POST['cc_id']);
		$cid_origem_id = intval($_POST['cid_origem_id']);
		$cid_id = intval($_POST['cid_id']);
		$clie_id = intval($_POST['clie_id']);

		if (!$cid_origem_id) {
			$cid_origem_id = "NULL";
		}
		if (!$cid_id) {
			$cid_id = "NULL";
		}
		if (!$clie_id) {
			$clie_id = "NULL";
		}

		$tx_nota = $this->escape(trim($_POST['tx_nota']));
		$tx_por_peso = $this->escape($_POST['tx_por_peso'], 'bool');
		$tx_valor = $this->escape($_POST['tx_valor'], 'decimal');
		$tx_ate_kg = intval($_POST['tx_ate_kg']);
		$tx_excedente = $this->escape($_POST['tx_excedente'], 'decimal');
		
		$sql = ($tx_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "taxas SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "cc_id = ".$cc_id.",";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "cid_origem_id = ".$cid_origem_id.",";
		$sql.= "cid_id = ".$cid_id.",";
		$sql.= "tx_nota = ".$tx_nota.",";
		$sql.= "tx_por_peso = ".$tx_por_peso.",";
		$sql.= "tx_valor = ".$tx_valor.",";
		$sql.= "tx_ate_kg = ".$tx_ate_kg.",";
		$sql.= "tx_excedente = ".$tx_excedente." ";
		if ($tx_id > 0) {
			$sql.="WHERE tx_id = ".$tx_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$tx_id) {
			$tx_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'tx_id'=>$tx_id));
	}
	/**
	 * Excluir terrestres. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_taxas() {
		$sql = "DELETE FROM taxas WHERE tx_id IN(".$_POST['tx_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar terrestres. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_taxas() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_taxa_terrestre ";
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
		
		$sql = "SELECT COUNT(tx_id) AS total FROM view_taxa_terrestre ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem das terrestres para o componente ComboBox
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
		$filter.= $this->get_filter_param('view_taxa_terrestre');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_taxa_terrestre ".$filter;
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
		
		$sql = "SELECT COUNT(tx_id) AS total FROM view_taxa_terrestre ".$filter;
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
		$tx_id = intval($_POST['tx_id']);
		$clie_id = intval($_POST['clie_id']);
		
		$sql = "SELECT COUNT(*) AS existente FROM taxas_excecoes_clientes WHERE tx_id = ".$tx_id." AND clie_id = ".$clie_id;
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente > 0;
		$this->free_result($query);
		if (!$exist) {
			$sql = "INSERT INTO taxas_excecoes_clientes SET ";
			$sql.= "tx_id = ".$tx_id.",";
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
			$sql = "DELETE FROM taxas_excecoes_clientes ";
			$sql.= "WHERE tx_id = ".$record->tx_id." ";
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
		$sql = "SELECT * FROM view_taxa_terrestre_excecao WHERE tx_id = ".intval($_GET['taxas_id']);
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
			$sql = "INSERT INTO taxas_excecoes_clientes (";
			$sql.= "tx_id,";
			$sql.= "clie_id ";
			$sql.= ") SELECT ";
			$sql.= "tx_id,";
			$sql.= $clie_id." ";
			$sql.= "FROM taxas ";
			$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
			$sql.= "AND tx_id != ".$taxas_id." ";
			$sql.= "AND tx_id NOT IN (SELECT tx_id FROM taxas_excecoes_clientes)";
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
		$sql = "DELETE FROM taxas_excecoes_clientes WHERE clie_id IN (".$_POST['clientes_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success"=>$this->affected_rows() > 0));
	}
}
?>