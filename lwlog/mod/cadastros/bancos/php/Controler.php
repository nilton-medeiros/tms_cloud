<?php
class Controler extends App {
	/**
	 * Salvar banco. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_banco() {
		$id = intval($_POST['id']);
		$numero = intval($_POST['numero']);
		$banco = $this->escape(trim($_POST['banco']));
		$agencia = intval($_POST['agencia']);
		$conta_corrente = intval($_POST['conta_corrente']);
		$codigo_empresa = intval($_POST['codigo_empresa']);
		$digito_ver_agencia = $this->escape(trim($_POST['digito_ver_agencia']), 'string');
		$digito_ver_conta_corrente = $this->escape(trim($_POST['digito_ver_conta_corrente']), 'string');
		$padrao_cta_receber = $this->escape($_POST['padrao_cta_receber'], 'bool');
		
		if (!$agencia) {
			$agencia = "NULL";
		}
		if (!$conta_corrente) {
			$conta_corrente = "NULL";
		}
		if (!$codigo_empresa) {
			$codigo_empresa = "NULL";
		}
		
		$sql = ($id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "bancos SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "numero = ".$numero.",";
		$sql.= "banco = ".$banco.",";
		$sql.= "agencia = ".$agencia.",";
		$sql.= "conta_corrente = ".$conta_corrente.",";
		$sql.= "codigo_empresa = ".$codigo_empresa.",";
		$sql.= "digito_ver_agencia = ".$digito_ver_agencia.",";
		$sql.= "digito_ver_conta_corrente = ".$digito_ver_conta_corrente.",";
		$sql.= "padrao_cta_receber = ".$padrao_cta_receber." ";
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
		
		if ($padrao_cta_receber) {
			$sql = "UPDATE bancos SET padrao_cta_receber = 0 ";
			$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
			$sql.= "AND id != ".$id;
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		
		print json_encode(array('success'=>true,'id'=>$id));
	}
	/**
	 * Excluir banco. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_banco() {
		$sql = "DELETE FROM bancos WHERE id IN(".$_POST['id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar banco. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_banco() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_bancos ";
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
		
		$sql = "SELECT COUNT(id) AS total FROM view_bancos ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos banco para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function banco_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $this->get_filter_param('view_bancos');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_bancos ".$filter;
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
		
		$sql = "SELECT COUNT(id) AS total FROM view_bancos ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>