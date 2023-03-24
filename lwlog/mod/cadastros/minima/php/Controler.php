<?php
class Controler extends App {
	/**
	 * Salvar minima. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_minima() {
		$min_id = intval($_POST['min_id']);
		$clie_id = intval($_POST['clie_id']); 
		if (!$clie_id) {
			$clie_id = "NULL";
		}
		$cid_id_origem = intval($_POST['cid_id_origem']);
		$cid_id_destino = intval($_POST['cid_id_destino']);
		$min_tipo_data_prev_entrega = intval($_POST['min_tipo_data_prev_entrega']);
		$min_dias_programado = intval($_POST['min_dias_programado']);
		$min_dias_inicial = intval($_POST['min_dias_inicial']);
		$min_dias_final = intval($_POST['min_dias_final']);
		$min_tipo_hora_prev_entrega = intval($_POST['min_tipo_hora_prev_entrega']);
		$min_hora_programada = $this->escape(trim($_POST['min_hora_programada']), 'string');
		$min_hora_inicial = $this->escape(trim($_POST['min_hora_inicial']), 'string');
		$min_hora_final = $this->escape(trim($_POST['min_hora_final']), 'string');
		
		$sql = ($min_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "minima SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "cid_id_origem = ".$cid_id_origem.",";
		$sql.= "cid_id_destino = ".$cid_id_destino.",";
		$sql.= "min_tipo_data_prev_entrega = ".$min_tipo_data_prev_entrega.",";
		$sql.= "min_dias_programado = ".$min_dias_programado.",";
		$sql.= "min_dias_inicial = ".$min_dias_inicial.",";
		$sql.= "min_dias_final = ".$min_dias_final.",";
		$sql.= "min_tipo_hora_prev_entrega = ".$min_tipo_hora_prev_entrega.",";
		$sql.= "min_hora_programada = ".$min_hora_programada.",";
		$sql.= "min_hora_inicial = ".$min_hora_inicial.",";
		$sql.= "min_hora_final = ".$min_hora_final." ";
		if ($min_id > 0) {
			$sql.="WHERE min_id = ".$min_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$min_id) {
			$min_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'min_id'=>$min_id));
	}
	/**
	 * Excluir minima. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_minima() {
		$sql = "DELETE FROM minima WHERE min_id IN(".$_POST['min_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar minima. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_minima() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_minima ";
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
		
		$sql = "SELECT COUNT(min_id) AS total FROM view_minima ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	
	/**
	 * Salvar minima faixa. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_minima_faixa() {
		$min_id = intval($_POST['min_id']);
		$minfx_id = intval($_POST['minfx_id']);
		$minfx_valor = $this->escape(trim($_POST['minfx_valor']), 'decimal');
		$minfx_peso_ate_kg = $this->escape(trim($_POST['minfx_peso_ate_kg']), 'decimal');
		
		$sql = ($minfx_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "minima_faixa SET ";
		$sql.= "min_id = ".$min_id.",";
		$sql.= "minfx_valor = ".$minfx_valor.",";
		$sql.= "minfx_peso_ate_kg = ".$minfx_peso_ate_kg." ";
		if ($minfx_id > 0) {
			$sql.="WHERE minfx_id = ".$minfx_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$minfx_id) {
			$minfx_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'minfx_id'=>$minfx_id));
	}
	/**
	 * Excluir minima faixa. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_minima_faixa() {
		$sql = "DELETE FROM minima_faixa WHERE minfx_id IN(".$_POST['minfx_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar minima faixa. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_minima_faixa() {
		$sql = "SELECT * FROM minima_faixa WHERE min_id = ".intval($_GET['min_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
}
?>