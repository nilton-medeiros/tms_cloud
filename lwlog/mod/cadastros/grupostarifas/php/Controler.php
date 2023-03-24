<?php
class Controler extends App {
	/**
	 * Salvar grupos tarifas. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_grupos_tarifas() {
		$gt_id_codigo = trim($_POST['gt_id_codigo']);
		$gt_descricao = $this->escape(trim($_POST['gt_descricao']));
		$gt_isento_icms = $this->escape($_POST['gt_isento_icms'], 'bool');
		$gt_obrigar_especifica = $this->escape($_POST['gt_obrigar_especifica'], 'bool');
		
		$sql = !empty($gt_id_codigo) ? "UPDATE " : "INSERT INTO ";
		$sql.= "grupo_tarifas SET ";
		$sql.= "gt_id_codigo = ".$gt_id_codigo.",";
		$sql.= "gt_descricao = ".$gt_descricao.",";
		$sql.= "gt_obrigar_especifica = ".$gt_obrigar_especifica.",";
		$sql.= "gt_isento_icms = ".$gt_isento_icms." ";
		if (!empty($gt_id_codigo)) {
			$sql.="WHERE gt_id_codigo = ".$gt_id_codigo;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		print json_encode(array('success'=>true));
	}
	/**
	 * Excluir grupos de tarifas. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_grupos_tarifas() {
		$sql = "DELETE FROM grupo_tarifas WHERE gt_id_codigo IN(".$_POST['gt_id_codigo'].")";
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
	function read_grupos_tarifas() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_grupo_tarifas ";
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
		
		$sql = "SELECT COUNT(gt_id_codigo) AS total FROM view_grupo_tarifas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos grupos de tarifas para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function grupos_tarifas_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		$especifica = parse_boolean($_GET['especifica']);
		
		$filter = "WHERE 1 ";
		$filter.= $this->get_filter_param('view_grupo_tarifas');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		if ($especifica) {
			$filter.=" AND gt_id_codigo != 000 ";
		}
		$sql = "SELECT * FROM view_grupo_tarifas ".$filter;
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
		
		$sql = "SELECT COUNT(gt_id_codigo) AS total FROM view_grupo_tarifas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>