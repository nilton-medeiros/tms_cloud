<?php
class Controler extends App {
	/**
	 * Salvar cidades. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_cidades() {
		$cid_id = intval($_POST['cid_id']);
		$cid_uf = $this->escape(trim($_POST['cid_uf']));
		$cid_municipio = $this->escape(trim($_POST['cid_municipio']));
		$cid_codigo_municipio = intval($_POST['cid_codigo_municipio']);
		
		$sql = "SELECT COUNT(*) AS existente FROM cidades ";
		$sql.= "WHERE cid_uf = ".$cid_uf." ";
		$sql.= "AND cid_municipio = ".$cid_municipio." ";
		$sql.= "AND cid_codigo_municipio = ".$cid_codigo_municipio;
		$sql.= ($cid_id > 0) ? " AND cid_id != ".$cid_id : "";
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente > 0;
		$this->free_result($query);
		
		if ($exist) {
			print json_encode(array('success'=>false,'msg'=>'Essa cidade já se encontra cadastrada.'));
			return false;
		}
		
		$cid_sigla = $this->escape(trim($_POST['cid_sigla']));
		$cid_nome_aeroporto = $this->escape(trim($_POST['cid_nome_aeroporto']));
		$cid_suframa = $this->escape($_POST['cid_suframa'], 'bool');
		$cid_valor_sefaz = $this->escape(trim($_POST['cid_valor_sefaz']), 'decimal');
		
		$sql = ($cid_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "cidades SET ";
		$sql.= "cid_codigo_municipio = ".$cid_codigo_municipio.",";
		$sql.= "cid_municipio = ".$cid_municipio.",";
		$sql.= "cid_uf = ".$cid_uf.",";
		$sql.= "cid_sigla = ".$cid_sigla.",";
		$sql.= "cid_nome_aeroporto = ".$cid_nome_aeroporto.",";
		$sql.= "cid_suframa = ".$cid_suframa.",";
		$sql.= "cid_valor_sefaz = ".$cid_valor_sefaz." ";
		if ($cid_id > 0) $sql.="WHERE cid_id = ".$cid_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$cid_id) {
			$cid_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'cid_id'=>$cid_id));
	}
	/**
	 * Excluir cidades. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_cidades() {
		$sql = "DELETE FROM cidades WHERE cid_id IN(".$_POST['cid_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar cidades. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_cidades() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1 ";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_cidades ";
		$sql.= $filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if (!empty($p->limit)) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		
		$this->free_result($query);
		
		$sql = "SELECT COUNT(cid_id) AS total FROM view_cidades ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem das Cidades para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function cidades_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		$cid_uf = trim($_GET['cid_uf']);
		
		$filter = "WHERE 1 ";
		$filter.= $this->get_filter_param('view_cidades');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		if (!empty($cid_uf)) {
			$filter.= " AND cid_uf = ".$this->escape($cid_uf);
		}
		$sql = "SELECT * FROM view_cidades ".$filter;
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
		
		$sql = "SELECT COUNT(cid_id) AS total FROM view_cidades ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Salvar passagens. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_passagens() {
		$cid_id = intval($_POST['cid_id']);
		$loc_id = intval($_POST['loc_id']);
		$loc_passagem = $this->escape(trim($_POST['loc_passagem']));
		
		$_loc_id = 0;
		if (!$loc_id && $cid_id > 0) {
			$sql = "SELECT IFNULL(MAX(loc_id), 0) AS _loc_id ";
			$sql.= "FROM locais_passagens ";
			$sql.= "WHERE cid_id = ".$cid_id;
			$query = $this->query($sql);
			$_loc_id = $this->fetch_object($query)->_loc_id;
			if ($_loc_id > 0) {
				$_loc_id = $_loc_id + 1;
			} else {
				$_loc_id = 1;
			}
		}
		
		$sql = ($loc_id > 0 && $cid_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "locais_passagens SET ";
		if ($_loc_id > 0) {
			$sql.= "cid_id = ".$cid_id.",";
			$sql.= "loc_id = ".$_loc_id.",";
		}
		$sql.= "loc_passagem = ".$loc_passagem." ";
		if ($loc_id > 0 && $cid_id > 0) {
			$sql.= "WHERE loc_id = ".$loc_id." ";
			$sql.= "AND cid_id = ".$cid_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$loc_id) {
			$loc_id = $_loc_id;
		}
		
		print json_encode(array('success'=>true,'loc_id'=>$loc_id));
	}
	/**
	 * Excluir passagens. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_passagens() {
		$sql = "DELETE FROM locais_passagens ";
		$sql.= "WHERE cid_id = ".intval($_POST['cid_id'])." ";
		$sql.= "AND loc_id IN(".$_POST['loc_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar passagens. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_passagens() {
		$sql = "SELECT * FROM locais_passagens ";
		$sql.= "WHERE cid_id = ".intval($_GET['cid_id'])." ";
		$sql.= "ORDER BY loc_passagem";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
}
?>