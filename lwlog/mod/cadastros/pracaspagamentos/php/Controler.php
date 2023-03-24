<?php
class Controler extends App {
	/**
	 * Salvar praças de pagamentos. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_pracas_pagamentos() {
		$prp_id = intval($_POST['prp_id']);
		$prp_praca_pagto = $this->escape(trim($_POST['prp_praca_pagto']));
		
		$sql = ($prp_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "praca_pagamento SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "prp_praca_pagto = ".$prp_praca_pagto." ";
		if ($prp_id > 0) {
			$sql.="WHERE prp_id = ".$prp_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$prp_id) {
			$prp_id = $this->insert_id();
		}
		print json_encode(array('success'=>true,'prp_id'=>$prp_id));
	}
	/**
	 * Excluir praças de pagamentos. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_pracas_pagamentos() {
		$sql = "DELETE FROM praca_pagamento WHERE prp_id IN(".$_POST['prp_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar rotas de entregas. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_pracas_pagamentos() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE (emp_id = ".$this->empresa->emp_id." OR emp_id IS NULL)";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_praca_pagamento ";
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
		
		$sql = "SELECT COUNT(prp_id) AS total FROM view_praca_pagamento ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos IATA códigos para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function pracas_pagamentos_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE (emp_id = ".$this->empresa->emp_id." OR emp_id IS NULL)";
		$filter.= $this->get_filter_param('view_praca_pagamento');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_praca_pagamento ".$filter;
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
		
		$sql = "SELECT COUNT(prp_id) AS total FROM view_praca_pagamento ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>