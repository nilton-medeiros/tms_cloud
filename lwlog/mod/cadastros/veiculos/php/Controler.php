<?php
class Controler extends App {
	/**
	 * Salvar veiculo. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_veiculo() {
		$id = intval($_POST['id']);
		$agre_id = intval($_POST['agre_id']); if (!$agre_id) $agre_id = 'NULL';
		$cInt = $this->escape(trim($_POST["cInt"]), 'string');
		$placa = $this->escape(trim($_POST['placa']), 'string');
		$RENAVAM = $this->escape(trim($_POST['RENAVAM']), 'string');
		$tara = intval($_POST['tara']);
		$capKG = intval($_POST['capKG']);
		$capM3 = intval($_POST['capM3']);
		$tpRod = intval($_POST['tpRod']);
		$tpCar = intval($_POST['tpCar']);
		$UF = $this->escape(trim($_POST['UF']), 'string');
		
		$sql = ($id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "veiculos SET ";
		$sql.= "agre_id = ".$agre_id.",";
		$sql.= "cInt = ".$cInt.",";
		$sql.= "placa = ".$placa.",";
		$sql.= "RENAVAM = ".$RENAVAM.",";
		$sql.= "tara = ".$tara.",";
		$sql.= "capKG = ".$capKG.",";
		$sql.= "capM3 = ".$capM3.",";
		$sql.= "tpRod = ".$tpRod.",";
		$sql.= "tpCar = ".$tpCar.",";
		$sql.= "UF = ".$UF." ";
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
	 * Excluir veiculo. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_veiculo() {
		$sql = "DELETE FROM veiculos WHERE id IN(".$_POST['id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar veiculo. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_veiculo() {
		$p = $this->get_sql_param();
		
		$filter = "WHERE 1";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_veiculos ";
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
		
		$sql = "SELECT COUNT(id) AS total FROM view_veiculos ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos veiculo para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function veiculo_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = isset($_GET["coleta"]) ? "WHERE agre_id IS NULL" : "WHERE 1";
		$filter.= $this->get_filter_param('view_veiculos');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_veiculos ";
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
		
		$sql = "SELECT COUNT(id) AS total FROM view_veiculos ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Salvar condutor, associção de registros (condutores vs veículos)
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_condutor() {
		$moto_id = intval($_POST['moto_id']);
		$veic_trac_id = intval($_POST['veic_trac_id']);
		
		$sql = "INSERT INTO veiculos_condutores SET ";
		$sql.= "moto_id = ".$moto_id.",";
		$sql.= "veic_trac_id = ".$veic_trac_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		print json_encode(array('success'=>true));
	}
	/**
	 * Excluir condutor, associção de registros (condutores vs veículos)
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_condutor() {
		$records = json_decode($_POST["records"]);
		foreach ($records as $record) {
			$sql = "DELETE FROM veiculos_condutores ";
			$sql.= "WHERE moto_id = ".$record->moto_id." ";
			$sql.= "AND veic_trac_id = ".$record->veiculos_id;
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		print json_encode(array('success'=>true));
	}
	/**
	 * Consultar condutores de veículo. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_condutores() {
		$sql = "SELECT * FROM view_veiculos_condutores WHERE veic_trac_id = ".intval($_GET['veiculos_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
}
?>