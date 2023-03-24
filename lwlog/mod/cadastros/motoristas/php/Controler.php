<?php
class Controler extends App {
	/**
	 * Salvar motorista. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_motorista() {
		$id = intval($_POST['id']);
		$nome = $this->escape(trim($_POST['nome']), 'string');
		$cpf = intval($_POST['cpf']);
		$rg = $this->escape(trim($_POST['rg']), 'string');
		$celular = $this->escape(trim($_POST['celular']), 'string');
		$fone = $this->escape(trim($_POST['fone']), 'string');
		$email = $this->escape(trim($_POST['email']), 'string');
		$funcionario = $this->escape($_POST['funcionario'], 'bool');
		$login = $this->escape(trim($_POST['login']), 'string');
		$senha = $this->escape(trim($_POST['senha']), 'string');
		
		$sql = ($id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "motoristas SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "nome = ".$nome.",";
		$sql.= "cpf = ".$cpf.",";
		$sql.= "rg = ".$rg.",";
		$sql.= "celular = ".$celular.",";
		$sql.= "fone = ".$fone.",";
		$sql.= "email = ".$email.",";
		$sql.= "funcionario = ".$funcionario.",";
		$sql.= "login = ".$login.",";
		$sql.= "senha = ".$senha." ";
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
	 * Excluir motorista. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_motorista() {
		$sql = "DELETE FROM motoristas WHERE id IN(".$_POST['id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar motorista. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_motorista() {
		$p = $this->get_sql_param();
		
		$filter = "WHERE (emp_id = ".$this->empresa->emp_id." OR emp_id IS NULL)";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_motoristas ";
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
		
		$sql = "SELECT COUNT(id) AS total FROM view_motoristas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos motorista para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function motorista_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE (emp_id = ".$this->empresa->emp_id." OR emp_id IS NULL)";
		if (isset($_GET["coleta"])) {
			$filter.= " AND funcionario = 1";
		}
		$filter.= $this->get_filter_param('view_motoristas');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_motoristas ";
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
		
		$sql = "SELECT COUNT(id) AS total FROM view_motoristas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Salvar veículo, associção de registros (condutores vs veículos)
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_veiculo() {
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
	function delete_veiculo() {
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
	function read_veiculos() {
		$sql = "SELECT * FROM view_veiculos_condutores WHERE moto_id = ".intval($_GET['motoristas_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
}
?>