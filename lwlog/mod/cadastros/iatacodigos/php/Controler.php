<?php
class Controler extends App {
	/**
	 * Salvar iata códigos. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_iata_codigos() {
		$iic_id = intval($_POST['iic_id']);
		$iic_codigo = $this->escape(trim($_POST['iic_codigo']));
		$iic_descricao = $this->escape(trim($_POST['iic_descricao']));
		
		$sql = ($iic_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "iata_imp_codes SET ";
		$sql.= "iic_codigo = ".$iic_codigo.",";
		$sql.= "iic_descricao = ".$iic_descricao." ";
		if ($iic_id > 0) {
			$sql.="WHERE iic_id = ".$iic_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$iic_id) {
			$iic_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'iic_id'=>$iic_id));
	}
	/**
	 * Excluir iata códigos. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_iata_codigos() {
		$sql = "DELETE FROM iata_imp_codes WHERE iic_id IN(".$_POST['iic_id'].")";
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
	function read_iata_codigos() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_iata_imp_codes ";
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
		
		$sql = "SELECT COUNT(iic_id) AS total FROM view_iata_imp_codes ".$filter;
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
	function iata_codigos_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE 1 ";
		$filter.= $this->get_filter_param('view_iata_imp_codes');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_iata_imp_codes ".$filter;
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
		
		$sql = "SELECT COUNT(iic_id) AS total FROM view_iata_imp_codes ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>