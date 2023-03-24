<?php
class Controler extends App {
	/**
	 * Salvar ocorrencia. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_ocorrencia() {
		$ocor_id = intval($_POST['ocor_id']);
		$ocor_codigo = intval($_POST['ocor_codigo']);
		$ocor_descricao = $this->escape(trim($_POST['ocor_descricao']));
		
		$sql = ($ocor_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "ocorrencias SET ";
		$sql.= "ocor_codigo = ".$ocor_codigo.",";
		$sql.= "ocor_descricao = ".$ocor_descricao." ";
		if ($ocor_id > 0) {
			$sql.="WHERE ocor_id = ".$ocor_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$ocor_id) {
			$ocor_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'ocor_id'=>$ocor_id));
	}
	/**
	 * Excluir ocorrencia. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_ocorrencia() {
		$sql = "DELETE FROM ocorrencias WHERE ocor_id IN(".$_POST['ocor_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar ocorrencia. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_ocorrencia() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1 ";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_ocorrencias ";
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
		
		$sql = "SELECT COUNT(ocor_id) AS total FROM view_ocorrencias ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos ocorrencia para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function ocorrencia_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $this->get_filter_param('view_ocorrencias');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_ocorrencias ".$filter;
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
		
		$sql = "SELECT COUNT(ocor_id) AS total FROM view_ocorrencias ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>