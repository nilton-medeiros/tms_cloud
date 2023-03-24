<?php
class Controler extends App {
	/**
	 * Salvar agregado. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_agregado() {
		$id = intval($_POST['id']);
		$tipo_documento = $this->escape(trim($_POST['tipo_documento']), 'string');
		$documento = intval($_POST['documento']);
		$RNTRC = intval($_POST['RNTRC']);
		$xNome = $this->escape(trim($_POST['xNome']), 'string');
		$IE = $this->escape(trim($_POST['IE']), 'string');
		$UF = $this->escape(trim($_POST['UF']), 'string');
		$tpProp = intval($_POST['tpProp']);
		
		$sql = ($id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "agregados SET ";
		$sql.= "tipo_documento = ".$tipo_documento.",";
		$sql.= "documento = ".$documento.",";
		$sql.= "RNTRC = ".$RNTRC.",";
		$sql.= "xNome = ".$xNome.",";
		$sql.= "IE = ".$IE.",";
		$sql.= "UF = ".$UF.",";
		$sql.= "tpProp = ".$tpProp." ";
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
	 * Excluir agregado. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_agregado() {
		$sql = "DELETE FROM agregados WHERE id IN(".$_POST['id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar agregado. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_agregado() {
		$p = $this->get_sql_param();
		
		$filter = "WHERE 1";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM agregados ";
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
		
		$sql = "SELECT COUNT(id) AS total FROM agregados ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos agregado para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function agregado_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE 1";
		$filter.= $this->get_filter_param('agregados');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM agregados ";
		$sql.= $filter;
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
		
		$sql = "SELECT COUNT(id) AS total FROM agregados ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>