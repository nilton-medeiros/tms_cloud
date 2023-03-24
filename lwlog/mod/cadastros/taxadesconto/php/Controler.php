<?php
class Controler extends App {
	/**
	 * Salvar descontos. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_taxas() {
		$dtc_id = intval($_POST['dtc_id']);
		$cc_id = intval($_POST['cc_id']);
		$clie_id = intval($_POST['clie_id']);
		$dtc_desconto = $this->escape($_POST['dtc_desconto'], 'decimal');
		$dtc_exibir_na_dacte = $this->escape($_POST['dtc_exibir_na_dacte'], 'bool');
		
		$sql = ($dtc_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "desconto_taxa_clie SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "cc_id = ".$cc_id.",";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "dtc_desconto = ".$dtc_desconto.",";
		$sql.= "dtc_exibir_na_dacte = ".$dtc_exibir_na_dacte." ";
		if ($dtc_id > 0) {
			$sql.="WHERE dtc_id = ".$dtc_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$dtc_id) {
			$dtc_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'dtc_id'=>$dtc_id));
	}
	/**
	 * Excluir descontos. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_taxas() {
		$sql = "DELETE FROM desconto_taxa_clie WHERE dtc_id IN(".$_POST['dtc_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar descontos. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_taxas() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1 ";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_taxa_desconto ";
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
		
		$sql = "SELECT COUNT(dtc_id) AS total FROM view_taxa_desconto ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem das descontos para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function taxas_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE (emp_id = ".$this->empresa->emp_id." OR emp_id IS NULL) ";
		$filter.= $this->get_filter_param('view_taxa_desconto');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_taxa_desconto ".$filter;
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
		
		$sql = "SELECT COUNT(dtc_id) AS total FROM view_taxa_desconto ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>