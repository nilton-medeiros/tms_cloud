<?php
class Controler extends App {
	/**
	 * Salvar nacional. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_nacional() {
		$nac_id = intval($_POST['nac_id']);
		$clie_id = intval($_POST['clie_id']); 
		if (!$clie_id) {
			$clie_id = "NULL";
		}
		$cid_id_origem = intval($_POST['cid_id_origem']);
		$cid_id_destino = intval($_POST['cid_id_destino']);
		$nac_taxa_minima = $this->escape(trim($_POST['nac_taxa_minima']), 'decimal');
		$nac_tipo_data_prev_entrega = intval($_POST['nac_tipo_data_prev_entrega']);
		$nac_dias_programado = intval($_POST['nac_dias_programado']);
		$nac_dias_inicial = intval($_POST['nac_dias_inicial']);
		$nac_dias_final = intval($_POST['nac_dias_final']);
		$nac_tipo_hora_prev_entrega = intval($_POST['nac_tipo_hora_prev_entrega']);
		$nac_hora_programada = $this->escape(trim($_POST['nac_hora_programada']), 'string');
		$nac_hora_inicial = $this->escape(trim($_POST['nac_hora_inicial']), 'string');
		$nac_hora_final = $this->escape(trim($_POST['nac_hora_final']), 'string');
		
		$sql = ($nac_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "nacional SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "cid_id_origem = ".$cid_id_origem.",";
		$sql.= "cid_id_destino = ".$cid_id_destino.",";
		$sql.= "nac_taxa_minima = ".$nac_taxa_minima.",";
		$sql.= "nac_tipo_data_prev_entrega = ".$nac_tipo_data_prev_entrega.",";
		$sql.= "nac_dias_programado = ".$nac_dias_programado.",";
		$sql.= "nac_dias_inicial = ".$nac_dias_inicial.",";
		$sql.= "nac_dias_final = ".$nac_dias_final.",";
		$sql.= "nac_tipo_hora_prev_entrega = ".$nac_tipo_hora_prev_entrega.",";
		$sql.= "nac_hora_programada = ".$nac_hora_programada.",";
		$sql.= "nac_hora_inicial = ".$nac_hora_inicial.",";
		$sql.= "nac_hora_final = ".$nac_hora_final." ";
		if ($nac_id > 0) {
			$sql.="WHERE nac_id = ".$nac_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$nac_id) {
			$nac_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'nac_id'=>$nac_id));
	}
	/**
	 * Excluir nacional. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_nacional() {
		$sql = "DELETE FROM nacional WHERE nac_id IN(".$_POST['nac_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar nacional. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_nacional() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_nacional ";
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
		
		$sql = "SELECT COUNT(nac_id) AS total FROM view_nacional ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	
	/**
	 * Salvar nacional geral. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_nacional_geral() {
		$nac_id = intval($_POST['nac_id']);
		$ger_id = intval($_POST['ger_id']);
		$ger_valor = $this->escape(trim($_POST['ger_valor']), 'decimal');
		$ger_peso_ate_kg = $this->escape(trim($_POST['ger_peso_ate_kg']), 'decimal');
		
		$sql = ($ger_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "geral SET ";
		$sql.= "nac_id = ".$nac_id.",";
		$sql.= "ger_valor = ".$ger_valor.",";
		$sql.= "ger_peso_ate_kg = ".$ger_peso_ate_kg." ";
		if ($ger_id > 0) {
			$sql.="WHERE ger_id = ".$ger_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$ger_id) {
			$ger_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'ger_id'=>$ger_id));
	}
	/**
	 * Excluir nacional geral. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_nacional_geral() {
		$sql = "DELETE FROM geral WHERE ger_id IN(".$_POST['ger_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar nacional geral. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_nacional_geral() {
		$sql = "SELECT * FROM geral WHERE nac_id = ".intval($_GET['nac_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	
	/**
	 * Salvar nacional especifica. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_nacional_especifica() {
		$epc_id = intval($_POST['epc_id']);
		$nac_id = intval($_POST['nac_id']);
		$gt_id_codigo = intval($_POST['gt_id_codigo']);
		$epc_valor = $this->escape(trim($_POST['epc_valor']), 'decimal');
		
		$sql = ($epc_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "especifica SET ";
		$sql.= "nac_id = ".$nac_id.",";
		$sql.= "gt_id_codigo = ".$gt_id_codigo.",";
		$sql.= "epc_valor = ".$epc_valor." ";
		if ($epc_id > 0) {
			$sql.="WHERE epc_id = ".$epc_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$epc_id) {
			$epc_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'epc_id'=>$epc_id));
	}
	/**
	 * Excluir nacional especifica. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_nacional_especifica() {
		$sql = "DELETE FROM especifica WHERE epc_id IN(".$_POST['epc_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar nacional especifica. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_nacional_especifica() {
		$sql = "SELECT t1.*, t2.gt_descricao FROM especifica AS t1 ";
		$sql.= "LEFT JOIN grupo_tarifas AS t2 ON t2.gt_id_codigo = t1.gt_id_codigo ";
		$sql.= "WHERE t1.nac_id = ".intval($_GET['nac_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
}
?>