<?php
class Controler extends App {
	/**
	 * Salvar seguro rctrc. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_rctrc() {
		$id = intval($_POST['id']);
		$uf_origem = $this->escape(trim($_POST['uf_origem']));
		$uf_destino = $this->escape(trim($_POST['uf_destino']));
		$percentual = $this->escape(trim($_POST['percentual']), 'decimal');
		
		$sql = ($id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "seguro_rctrc SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "uf_origem = ".$uf_origem.",";
		$sql.= "uf_destino = ".$uf_destino.",";
		$sql.= "percentual = ".$percentual." ";
		$sql.= ($id > 0) ? "WHERE id = ".$id : "";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$id) {
			$id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'id'=>$id));
	}
	/**
	 * Excluir seguro rctrc. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_rctrc() {
		$sql = "DELETE FROM seguro_rctrc WHERE id IN(".$_POST['id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar seguro rctrc. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_rctrc() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_seguro_rctrc ";
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
		
		$sql = "SELECT COUNT(id) AS total FROM view_seguro_rctrc ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>