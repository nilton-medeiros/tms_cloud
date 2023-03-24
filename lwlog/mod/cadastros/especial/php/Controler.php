<?php
class Controler extends App {
	/**
	 * Salvar especial. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_especial() {
		$esp_id = intval($_POST['esp_id']);
		$clie_id = intval($_POST['clie_id']); 
		if (!$clie_id) {
			$clie_id = "NULL";
		}
		$cid_id_origem = intval($_POST['cid_id_origem']);
		$cid_id_destino = intval($_POST['cid_id_destino']);
		$esp_tipo_data_prev_entrega = intval($_POST['esp_tipo_data_prev_entrega']);
		$esp_dias_programado = intval($_POST['esp_dias_programado']);
		$esp_dias_inicial = intval($_POST['esp_dias_inicial']);
		$esp_dias_final = intval($_POST['esp_dias_final']);
		$esp_tipo_hora_prev_entrega = intval($_POST['esp_tipo_hora_prev_entrega']);
		$esp_hora_programada = $this->escape(trim($_POST['esp_hora_programada']), 'string');
		$esp_hora_inicial = $this->escape(trim($_POST['esp_hora_inicial']), 'string');
		$esp_hora_final = $this->escape(trim($_POST['esp_hora_final']), 'string');
		
		$espfx_peso_ate_kg = $this->escape(trim($_POST['espfx_peso_ate_kg']), 'decimal');
		$espfx_valor = $this->escape(trim($_POST['espfx_valor']), 'decimal');
		$espfx_excedente = $this->escape(trim($_POST['espfx_excedente']), 'decimal');
		
		$sql = ($esp_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "especial SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "cid_id_origem = ".$cid_id_origem.",";
		$sql.= "cid_id_destino = ".$cid_id_destino.",";
		$sql.= "espfx_peso_ate_kg = ".$espfx_peso_ate_kg.",";
		$sql.= "espfx_valor = ".$espfx_valor.",";
		$sql.= "espfx_excedente = ".$espfx_excedente.",";
		$sql.= "esp_tipo_data_prev_entrega = ".$esp_tipo_data_prev_entrega.",";
		$sql.= "esp_dias_programado = ".$esp_dias_programado.",";
		$sql.= "esp_dias_inicial = ".$esp_dias_inicial.",";
		$sql.= "esp_dias_final = ".$esp_dias_final.",";
		$sql.= "esp_tipo_hora_prev_entrega = ".$esp_tipo_hora_prev_entrega.",";
		$sql.= "esp_hora_programada = ".$esp_hora_programada.",";
		$sql.= "esp_hora_inicial = ".$esp_hora_inicial.",";
		$sql.= "esp_hora_final = ".$esp_hora_final." ";
		if ($esp_id > 0) {
			$sql.="WHERE esp_id = ".$esp_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$esp_id) {
			$esp_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'esp_id'=>$esp_id));
	}
	/**
	 * Excluir especial. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_especial() {
		$sql = "DELETE FROM especial WHERE esp_id IN(".$_POST['esp_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar especial. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_especial() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_especial ";
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
		
		$sql = "SELECT COUNT(esp_id) AS total FROM view_especial ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>