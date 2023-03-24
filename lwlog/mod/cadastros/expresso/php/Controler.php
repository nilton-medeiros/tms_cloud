<?php
class Controler extends App {
	/**
	 * Salvar expresso. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_expresso() {
		$id = intval($_POST['id']);
		$clie_id = intval($_POST['clie_id']); 
		if (!$clie_id) {
			$clie_id = "NULL";
		}
		$cid_id_origem = intval($_POST['cid_id_origem']);
		$cid_id_destino = intval($_POST['cid_id_destino']);
		$peso_taxa_minima = intval($_POST['peso_taxa_minima']);
		$valor_taxa_minima = $this->escape(trim($_POST['valor_taxa_minima']), 'decimal');
		$tipo_data_prev_entrega = intval($_POST['tipo_data_prev_entrega']);
		$dias_programado = intval($_POST['dias_programado']);
		$dias_inicial = intval($_POST['dias_inicial']);
		$dias_final = intval($_POST['dias_final']);
		$tipo_hora_prev_entrega = intval($_POST['tipo_hora_prev_entrega']);
		$hora_programada = $this->escape(trim($_POST['hora_programada']), 'string');
		$hora_inicial = $this->escape(trim($_POST['hora_inicial']), 'string');
		$hora_final = $this->escape(trim($_POST['hora_final']), 'string');
		
		$sql = ($id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "expresso SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "cid_id_origem = ".$cid_id_origem.",";
		$sql.= "cid_id_destino = ".$cid_id_destino.",";
		$sql.= "peso_taxa_minima = ".$peso_taxa_minima.",";
		$sql.= "valor_taxa_minima = ".$valor_taxa_minima.",";
		$sql.= "tipo_data_prev_entrega = ".$tipo_data_prev_entrega.",";
		$sql.= "dias_programado = ".$dias_programado.",";
		$sql.= "dias_inicial = ".$dias_inicial.",";
		$sql.= "dias_final = ".$dias_final.",";
		$sql.= "tipo_hora_prev_entrega = ".$tipo_hora_prev_entrega.",";
		$sql.= "hora_programada = ".$hora_programada.",";
		$sql.= "hora_inicial = ".$hora_inicial.",";
		$sql.= "hora_final = ".$hora_final." ";
		if ($id > 0) {
			$sql.="WHERE id = ".$id;
		}
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
	 * Excluir expresso. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_expresso() {
		$sql = "DELETE FROM expresso WHERE id IN(".$_POST['id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar expresso. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_expresso() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_expresso ";
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
		
		$sql = "SELECT COUNT(id) AS total FROM view_expresso ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	
	/**
	 * Salvar expresso geral. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_expresso_excedente() {
		$id = intval($_POST['id']);
		$exp_id = intval($_POST['exp_id']);
		$peso_ate_kg = intval($_POST['peso_ate_kg']);
		$valor_excedente = $this->escape(trim($_POST['valor_excedente']), 'decimal');
		
		$sql = ($id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "expresso_excedentes SET ";
		$sql.= "exp_id = ".$exp_id.",";
		$sql.= "peso_ate_kg = ".$peso_ate_kg.",";
		$sql.= "valor_excedente = ".$valor_excedente." ";
		if ($id > 0) {
			$sql.="WHERE id = ".$id;
		}
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
	 * Excluir expresso geral. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_expresso_excedente() {
		$sql = "DELETE FROM expresso_excedentes WHERE id IN(".$_POST['id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar expresso geral. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_expresso_excedente() {
		$sql = "SELECT * FROM expresso_excedentes WHERE exp_id = ".intval($_GET['exp_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
}
?>