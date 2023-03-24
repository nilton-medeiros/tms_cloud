<?php
class Controler extends App {
	/**
	 * Salvar calculo. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_calculo() {
		$cc_id = intval($_POST['cc_id']);
		$cf_id = intval($_POST['cf_id']);
		$cc_titulo = $this->escape(trim($_POST['cc_titulo']));
		$cc_exibir_na_dacte = $this->escape(trim($_POST['cc_exibir_na_dacte']), 'bool');
		
		$sql = ($cc_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "composicao_calculo SET ";
		$sql.= "cf_id = ".$cf_id.",";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "cc_titulo = ".$cc_titulo.",";
		$sql.= "cc_exibir_na_dacte = ".$cc_exibir_na_dacte." ";
		if ($cc_id > 0) {
			$sql.="WHERE cc_id = ".$cc_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$cc_id) {
			$cc_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'cc_id'=>$cc_id));
	}
	/**
	 * Excluir calculo. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_calculo() {
		$sql = "DELETE FROM composicao_calculo WHERE cc_id IN(".$_POST['cc_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar calculo. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_calculo() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_composicao_calculo ";
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
		
		$sql = "SELECT COUNT(cc_id) AS total FROM view_composicao_calculo ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos calculo para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function calculo_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		$cf_tipo = intval($_GET['cf_tipo']);
		
		$filter = "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $this->get_filter_param('view_composicao_calculo');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		if ($cf_tipo > 0) {
			$filter.=" AND cf_tipo = ".$cf_tipo." ";
		}
		
		$sql = "SELECT * FROM view_composicao_calculo ".$filter;
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
		
		$sql = "SELECT COUNT(cc_id) AS total FROM view_composicao_calculo ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>