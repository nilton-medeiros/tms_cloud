<?php
class Controler extends App {
	/**
	 * Salvar rotas de entregas. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_rotas() {
		$rota_id = intval($_POST['rota_id']);
		$rota_codigo = $this->escape(trim($_POST['rota_codigo']));
		$rota_descricao = $this->escape(trim($_POST['rota_descricao']));
		
		$sql = ($rota_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "rotas_entregas SET ";
		$sql.= "rota_codigo = ".$rota_codigo.",";
		$sql.= "rota_descricao = ".$rota_descricao." ";
		if ($rota_id > 0) {
			$sql.="WHERE rota_id = ".$rota_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$rota_id) {
			$rota_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'rota_id'=>$rota_id));
	}
	/**
	 * Excluir rotas de entregas. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_rotas() {
		$sql = "DELETE FROM rotas_entregas WHERE rota_id IN(".$_POST['rota_id'].")";
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
	function read_rotas() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_rotas_entregas ";
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
		
		$sql = "SELECT COUNT(rota_id) AS total FROM view_rotas_entregas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem das rotas de entregas para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function rotas_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE 1 ";
		$filter.= $this->get_filter_param('view_rotas_entregas');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_rotas_entregas ".$filter;
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
		
		$sql = "SELECT COUNT(rota_id) AS total FROM view_rotas_entregas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>