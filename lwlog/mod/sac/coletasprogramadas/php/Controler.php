<?php
class Controler extends App {
	/**
	 * Consultar CTe. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_coleta() {
		$p = $this->get_sql_param();
		
		$id = intval($_GET["id"]);
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id." ";
		if ($id > 0) {
			$filter.="AND id = ".$id;
		}
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_coletas_programadas ";
		$sql.= $filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if ($p->limit) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			if (!empty($field->coletar_das)) {
				$field->coletar_das = explode(":", $field->coletar_das);
				$field->coletar_das = $field->coletar_das[0].":".$field->coletar_das[1];
			}
			if (!empty($field->coletar_ate)) {
				$field->coletar_ate = explode(":", $field->coletar_ate);
				$field->coletar_ate = $field->coletar_ate[0].":".$field->coletar_ate[1];
			}
			array_push($list, $field);
		}
		
		$this->free_result($query);
		
		$sql = "SELECT COUNT(id) AS total FROM view_coletas_programadas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Excluir coleta
	 * @access public
	 * @return string json
	 */
	function delete_coleta() {
		$sql = "DELETE FROM coletas_programadas WHERE id IN(".trim($_POST["id"]).")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success"=>$this->affected_rows() > 0));
	}
	/**
	 * Salvar coleta e gera o PDF
	 * @access public
	 * @return string json
	 */
	function save_coleta() {
		$id = intval($_POST["id"]);
		$clie_id = intval($_POST["clie_id"]);
		$dia_da_semana = $this->escape(trim($_POST["dia_da_semana"]), "string");
		$coletar_das = $this->escape(trim($_POST["coletar_das"]), "string");
		$coletar_ate = $this->escape(trim($_POST["coletar_ate"]), "string");
		$descricao = $this->escape(trim($_POST["descricao"]), "string");
		
		$sql = ($id > 0) ? "UPDATE coletas_programadas SET " : "INSERT INTO coletas_programadas SET emp_id = ".$this->empresa->emp_id.",";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "dia_da_semana = ".$dia_da_semana.",";
		$sql.= "coletar_das = ".$coletar_das.",";
		$sql.= "coletar_ate = ".$coletar_ate.",";
		$sql.= "descricao = ".$descricao." ";
		if ($id > 0) {
			$sql.= "WHERE id = ".$id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$id) {
			$id = $this->insert_id();
		}
		
		print json_encode(array("success"=>true,"id"=>$id));
	}
}
?>