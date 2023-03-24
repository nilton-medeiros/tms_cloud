<?php
class Controler extends App {
	/**
	 * Salvar produtos. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_produtos() {
		$iic_id = intval($_POST['iic_id']);
		$prod_id = intval($_POST['prod_id']);
		$gt_id_codigo = intval($_POST['gt_id_codigo']);
		
		$prod_codigo = intval($_POST['prod_codigo']);
		$prod_produto = $this->escape(trim($_POST['prod_produto']));
		
		$prod_numero_onu = trim($_POST['prod_numero_onu']);
		$prod_numero_onu = empty($prod_numero_onu) ? "NULL" : intval($prod_numero_onu);
		$prod_tarifa = $this->escape(trim($_POST['prod_tarifa']));
		$prod_nome_embarque = trim($_POST['prod_nome_embarque']);
		$prod_nome_embarque = empty($prod_nome_embarque) ? "NULL" : $this->escape($prod_nome_embarque);
		$prod_grupo_embalagem = trim($_POST['prod_grupo_embalagem']);
		$prod_grupo_embalagem = empty($prod_grupo_embalagem) ? "NULL" : $this->escape($prod_grupo_embalagem);
		$prod_ponto_fulgor = trim($_POST['prod_ponto_fulgor']);
		$prod_ponto_fulgor = empty($prod_ponto_fulgor) ? "NULL" : $this->escape($prod_ponto_fulgor);
		$prod_classe_risco = trim($_POST['prod_classe_risco']);
		$prod_classe_risco = empty($prod_classe_risco) ? "NULL" : $this->escape($prod_classe_risco);
		$prod_tipo_advalorem = $this->escape(trim($_POST['prod_tipo_advalorem']));
		
		$sql = ($prod_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "produtos SET ";
		$sql.= "gt_id_codigo = ".$gt_id_codigo.",";
		$sql.= "iic_id = ".$iic_id.",";
		$sql.= "prod_tarifa = ".$prod_tarifa.",";
		$sql.= "prod_codigo = ".$prod_codigo.",";
		$sql.= "prod_produto = ".$prod_produto.",";
		$sql.= "prod_tipo_advalorem = ".$prod_tipo_advalorem.",";
		$sql.= "prod_numero_onu = ".$prod_numero_onu.",";
		$sql.= "prod_nome_embarque = ".$prod_nome_embarque.",";
		$sql.= "prod_classe_risco = ".$prod_classe_risco.",";
		$sql.= "prod_grupo_embalagem = ".$prod_grupo_embalagem.",";
		$sql.= "prod_ponto_fulgor = ".$prod_ponto_fulgor." ";
		if ($prod_id > 0) {
			$sql.="WHERE prod_id = ".$prod_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$prod_id) {
			$prod_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'prod_id'=>$prod_id));
	}
	/**
	 * Excluir produtos. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_produtos() {
		$sql = "DELETE FROM produtos WHERE prod_id IN(".$_POST['prod_id'].")";
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
	function read_produtos() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_produtos ";
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
		
		$sql = "SELECT COUNT(prod_id) AS total FROM view_produtos ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem dos produtos para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function produtos_store() {
		$p = $this->get_sql_param();
		
		$prod_list_id = null;
		$clie_id = intval($_GET['clie_id']);
		
		$filters = $list = array();
		$search = trim($_GET['query']);
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		$filter = "";
		
		if (empty($fieldFilter)) {
			if ($clie_id > 0) {
				$sql = "SELECT GROUP_CONCAT(DISTINCT prod_id) AS list_id ";
				$sql.= "FROM clientes_produtos ";
				$sql.= "WHERE clie_id = ".$clie_id;
				$query = $this->query($sql);
				$prod_list_id = $this->fetch_object($query)->list_id;
				$this->free_result($query);
			}
			if (!empty($prod_list_id)) {
				array_push($filters, "prod_id IN(".$prod_list_id.")");
			}
			if (!empty($search)) {
				$search = $this->escape_search($search);
				array_push($filters, "prod_produto LIKE '%".$search."%'");
				array_push($filters, "gt_descricao LIKE '%".$search."%'");
				array_push($filters, "iic_descricao LIKE '%".$search."%'");
			}
		} else {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			array_push($filters, $fieldFilter." ".$valueFilter);
		}
		
		if (!empty($filters)) {
			$filter = "WHERE ".join(" OR ", $filters);
		}
		
		$sql = "SELECT * FROM view_produtos ".$filter;
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
		
		$sql = "SELECT COUNT(prod_id) AS total FROM view_produtos ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>