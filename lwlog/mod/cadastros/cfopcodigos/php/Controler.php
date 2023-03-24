<?php
class Controler extends App {
	/**
	 * Salvar cfop códigos. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_cfop_codigos() {
		$cfop_id = intval($_POST['cfop_id']);
		$cfop_codigo = $this->escape(trim($_POST['cfop_codigo']));
		$cfop_descricao = $this->escape(trim($_POST['cfop_descricao']));
		
		$sql = ($cfop_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "cfop SET ";
		$sql.= "cfop_codigo = ".$cfop_codigo.",";
		$sql.= "cfop_descricao = ".$cfop_descricao." ";
		if ($cfop_id > 0) {
			$sql.="WHERE cfop_id = ".$cfop_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$cfop_id) {
			$cfop_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'cfop_id'=>$cfop_id));
	}
	/**
	 * Excluir cfop códigos. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_cfop_codigos() {
		$sql = "DELETE FROM cfop WHERE cfop_id IN(".$_POST['cfop_id'].")";
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
	function read_cfop_codigos() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_cfop ";
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
		
		$sql = "SELECT COUNT(cfop_id) AS total FROM view_cfop ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos cfop códigos para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function cfop_codigos_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE 1 ";
		$filter.= $this->get_filter_param('view_cfop');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_cfop ".$filter;
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
		
		$sql = "SELECT COUNT(cfop_id) AS total FROM view_cfop ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>