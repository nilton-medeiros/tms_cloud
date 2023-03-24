<?php
class Controler extends App {
	/**
	 * Salvar romaneios. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_romaneio() {
		$romaneio_id = intval($_POST['romaneio_id']);
		$cliente_fk = intval($_POST['cliente_fk']);
		$romaneio_data = $this->escape(trim($_POST['romaneio_data']), 'date');
		$romaneio_hora = $this->escape(trim($_POST['romaneio_hora']), 'string');
		$romaneio_nome_embarcador = $this->escape($_POST['romaneio_nome_embarcador'], 'string');
		$romaneio_nome_transportadora = $this->escape($_POST['romaneio_nome_transportadora'], 'string');
		
		$sql = ($romaneio_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "romaneios SET ";
		$sql.= "emp_id = ".$this->empresa->emp_id.",";
		$sql.= "usuario_fk = ".$this->usuario->user_id.",";
		$sql.= "cliente_fk = ".$cliente_fk.",";
		$sql.= "romaneio_data = ".$romaneio_data.",";
		$sql.= "romaneio_hora = ".$romaneio_hora.",";
		$sql.= "romaneio_nome_embarcador = ".$romaneio_nome_embarcador.",";
		$sql.= "romaneio_nome_transportadora = ".$romaneio_nome_transportadora." ";
		$sql.= ($romaneio_id > 0) ? "WHERE romaneio_id = ".$romaneio_id : "";
		
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$romaneio_id) {
			$romaneio_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'romaneio_id'=>$romaneio_id));
	}
	/**
	 * Excluir romaneios. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_romaneio() {
		$sql = "DELETE FROM romaneios WHERE romaneio_id IN(".$_POST['romaneio_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar romaneio. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_romaneio() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id;
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_romaneios ";
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
		
		$sql = "SELECT COUNT(romaneio_id) AS total FROM view_romaneios ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Autocomplete para nome da transportadora
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function transportadora_store() {
		$sql = "SELECT DISTINCT romaneio_nome_transportadora ";
		$sql.= "FROM romaneios ";
		$sql.= "WHERE romaneio_nome_transportadora IS NOT NULL ";
		$sql.= "AND romaneio_nome_transportadora != '' ";
		$sql.= "ORDER BY romaneio_nome_transportadora";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Autocomplete para nome do embarcador
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function embarcador_store() {
		$sql = "SELECT DISTINCT romaneio_nome_embarcador ";
		$sql.= "FROM romaneios ";
		$sql.= "WHERE romaneio_nome_embarcador IS NOT NULL ";
		$sql.= "AND romaneio_nome_embarcador != '' ";
		$sql.= "ORDER BY romaneio_nome_embarcador";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Salvar notas fiscais. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_nota_fiscal() {
		$nf_id = intval($_POST['nf_id']);
		$romaneio_fk = intval($_POST['romaneio_fk']);
		$nf_destinatario = $this->escape(trim($_POST['nf_destinatario']), 'string');
		$nf_cidade = $this->escape(trim($_POST['nf_cidade']), 'string');
		$nf_local_entrega = $this->escape(trim($_POST['nf_local_entrega']), 'string');
		$nf_numero_ri = $this->escape(trim($_POST['nf_numero_ri']), 'string');
		$nf_numero_rm = $this->escape(trim($_POST['nf_numero_rm']), 'string');
		$nf_data_limite = $this->escape(trim($_POST['nf_data_limite']), 'date');
		$nf_modal = $this->escape(trim($_POST['nf_modal']), 'string');
		$nf_numero = $this->escape(trim($_POST['nf_numero']), 'string');
		$nf_volumes = intval($_POST['nf_volumes']);
		$nf_peso_real = $this->escape(trim($_POST['nf_peso_real']), 'decimal');
		$nf_peso_cubado = $this->escape(trim($_POST['nf_peso_cubado']), 'decimal');
		$nf_valor = $this->escape(trim($_POST['nf_valor']), 'money');
		$nf_notas = $this->escape(trim($_POST['nf_notas']), 'string');
		
		$sql = ($nf_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "romaneios_nfs SET ";
		$sql.= "romaneio_fk = ".$romaneio_fk.",";
		$sql.= "nf_destinatario = ".$nf_destinatario.",";
		$sql.= "nf_cidade = ".$nf_cidade.",";
		$sql.= "nf_local_entrega = ".$nf_local_entrega.",";
		$sql.= "nf_numero_ri = ".$nf_numero_ri.",";
		$sql.= "nf_numero_rm = ".$nf_numero_rm.",";
		$sql.= "nf_data_limite = ".$nf_data_limite.",";
		$sql.= "nf_modal = ".$nf_modal.",";
		$sql.= "nf_numero = ".$nf_numero.",";
		$sql.= "nf_volumes = ".$nf_volumes.",";
		$sql.= "nf_peso_real = ".$nf_peso_real.",";
		$sql.= "nf_peso_cubado = ".$nf_peso_cubado.",";
		$sql.= "nf_valor = ".$nf_valor.",";
		$sql.= "nf_notas = ".$nf_notas." ";
		$sql.= ($nf_id > 0) ? "WHERE nf_id = ".$nf_id: "";
		
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$nf_id) {
			$nf_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'nf_id'=>$nf_id));
	}
	/**
	 * Excluir notas fiscais. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_nota_fiscal() {
		$sql = "DELETE FROM romaneios_nfs WHERE nf_id IN(".$_POST['nf_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar notas fiscais. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_notas_fiscais() {
		$sql = "SELECT * FROM romaneios_nfs WHERE romaneio_fk = ".intval($_GET['romaneio_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Salvar veículos. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_veiculo() {
		$veiculo_id = intval($_POST['veiculo_id']);
		$romaneio_fk = intval($_POST['romaneio_fk']);
		$veiculo_nome = $this->escape(trim($_POST['veiculo_nome']), 'string');
		$veiculo_placa = $this->escape(trim($_POST['veiculo_placa']), 'string');
		$veiculo_motorista = $this->escape(trim($_POST['veiculo_motorista']), 'string');
		$veiculo_ajudantes = $this->escape(trim($_POST['veiculo_ajudantes']), 'string');
		$veiculo_data_saida = $this->escape(trim($_POST['veiculo_data_saida']), 'date');
		$veiculo_hora_saida = $this->escape(trim($_POST['veiculo_hora_saida']), 'string');
		
		$sql = ($veiculo_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "romaneios_veiculos SET ";
		$sql.= "romaneio_fk = ".$romaneio_fk.",";
		$sql.= "veiculo_nome = ".$veiculo_nome.",";
		$sql.= "veiculo_placa = ".$veiculo_placa.",";
		$sql.= "veiculo_motorista = ".$veiculo_motorista.",";
		$sql.= "veiculo_ajudantes = ".$veiculo_ajudantes.",";
		$sql.= "veiculo_data_saida = ".$veiculo_data_saida.",";
		$sql.= "veiculo_hora_saida = ".$veiculo_hora_saida." ";
		$sql.= ($veiculo_id > 0) ? "WHERE veiculo_id = ".$veiculo_id: "";
		
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$veiculo_id) {
			$veiculo_id = $this->insert_id();
		}
		
		print json_encode(array('success'=>true,'veiculo_id'=>$veiculo_id));
	}
	/**
	 * Excluir veículos. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_veiculo() {
		$sql = "DELETE FROM romaneios_veiculos WHERE veiculo_id IN(".$_POST['veiculo_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar veículos. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_veiculos() {
		$sql = "SELECT * FROM romaneios_veiculos WHERE romaneio_fk = ".intval($_GET['romaneio_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Exportar romaneio para HTML e XLS
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function exportar_romaneio() {
		$files = array();
		$romaneio_id = trim($_POST['romaneio_id']);
		
		$path = '../files';
		if (!is_dir($path)) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		
		$sql = "SELECT ";
		$sql.= "romaneio_id,";
		$sql.= "UPPER(clie_razao_social) AS cliente_emissor,";
		$sql.= "UPPER(clie_cidade_uf) AS cidade_origem,";
		$sql.= "CONCAT_WS(' ', DATE_FORMAT(romaneio_data, '%d/%m/%Y'), romaneio_hora) AS data_hora,";
		$sql.= "DATE_FORMAT(romaneio_data, '%d/%m/%Y') AS somente_data,";
		$sql.= "UPPER(romaneio_nome_transportadora) AS nome_transportadora,";
		$sql.= "UPPER(romaneio_nome_embarcador) AS nome_embarcador,";
		$sql.= "nf_volumes,";
		$sql.= "nf_peso_real,";
		$sql.= "nf_peso_cubado,";
		$sql.= "nf_valor ";
		$sql.= "FROM view_romaneios ";
		$sql.= "WHERE romaneio_id IN(".$romaneio_id.") ";
		$query = $this->query($sql);
		
		while ($obj = $this->fetch_object($query)) {
			$html ='<html>';
			$html.='<head>';
			$html.='<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
			$html.='<title>'.$this->empresa->emp_razao_social.'</title>';
			$html.='<style>html,body,table{font: normal 12px arial, helvetica, serif;}</style>';
			$html.='<script type:"text/javascript">window.print();</script>';
			$html.='</head>';
			$html.='<body>';
			
			$html.='<table style="width:100%; border:2px solid;">';
			$html.='<tr>';
			$html.='<th align="left" style="width:15%;">Cliente Emissor:</th>';
			$html.='<td align="left" style="width:50%;">'.$obj->cliente_emissor.'</td>';
			$html.='<th align="center" style="width:20%;">ROMANEIO DE EMBARQUE</th>';
			$html.='<th align="right" style="width:15%;">'.$obj->data_hora.'</th>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<th align="left">Cidade Origem:</th>';
			$html.='<td align="left">'.$obj->cidade_origem.'</td>';
			$html.='<th align="center">Nº ROMANEIO '.$obj->romaneio_id.'</th>';
			$html.='<td align="right">Pag 01/01</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<th align="left">Nome Transportadora:</th>';
			$html.='<td align="left">'.$obj->nome_transportadora.'</td>';
			$html.='<th align="center">&nbsp;</th>';
			$html.='<td align="right">&nbsp;</td>';
			$html.='</tr>';
			$html.='</table>';
			
			$s = "SELECT * FROM romaneios_nfs ";
			$s.= "WHERE romaneio_fk = ".$obj->romaneio_id." ";
			$s.= "ORDER BY nf_destinatario, nf_cidade";
			$q = $this->query($s);
			$nf_count = $this->num_rows($q);
			
			if ($nf_count) {
				$html.='<table style="width:100%; border:none; margin-top:20px;" cellspacing="0">';
				$html.='<tr>';
				$html.='<th align="left" style="width:20%;"><u>Destinatário</u></th>';
				$html.='<th align="left" style="width:10%;"><u>Cidade Destino</u></th>';
				$html.='<th align="left" style="width:10%;"><u>L. Entrega</u></th>';
				$html.='<th align="center" style="width:5%;"><u>Nº NF</u></th>';
				$html.='<th align="center" style="width:5%;"><u>Volumes</u></th>';
				$html.='<th align="right" style="width:5%;"><u>P. Real</u></th>';
				$html.='<th align="right" style="width:7%;"><u>P. Cubado</u></th>';
				$html.='<th align="right" style="width:10%;"><u>V. Mercadoria</u></th>';
				$html.='<th align="left" style="width:15%;"><u>Obs</u></th>';
				$html.='<th align="center" style="width:8%"><u>Data Limite</u></th>';
				$html.='<th align="center" style="width:5%;"><u>Modal</u></th>';
				$html.='</tr>';
				while($f = $this->fetch_object($q)) {
					$html.='<tr>';
					$html.='<td align="left">'.$f->nf_destinatario.'</td>';
					$html.='<td align="left">'.$f->nf_cidade.'</td>';
	                $html.='<td align="left">'.$f->nf_local_entrega.'</td>';
					$html.='<td align="center">'.$f->nf_numero.'</td>';
					$html.='<td align="center">'.$f->nf_volumes.'</td>';
					$html.='<td align="right">'.float_to_decimal($f->nf_peso_real).'</td>';
					$html.='<td align="right">'.float_to_decimal($f->nf_peso_cubado).'</td>';
					$html.='<td align="right">'.float_to_money($f->nf_valor).'</td>';
					$html.='<td align="left">'.$f->nf_notas.'</td>';
					$html.='<td align="center">'.date_convert($f->nf_data_limite, 'd/m/Y').'</td>';
					$html.='<td align="center">'.$f->nf_modal.'</td>';
					$html.='</tr>';
				}
				$html.='<tr>';
				$html.='<th align="left" colspan="3" style="border-left:2px solid; border-top:2px solid; border-bottom:2px solid;">TOTAL GERAL</th>';
				$html.='<th align="center" style="border-top:2px solid; border-bottom:2px solid;">'.$nf_count.' NF\'s</th>';
				$html.='<th align="center" style="border-top:2px solid; border-bottom:2px solid;">'.$obj->nf_volumes.'</th>';
				$html.='<th align="right" style="border-top:2px solid; border-bottom:2px solid;">'.float_to_decimal($obj->nf_peso_real).'</th>';
				$html.='<th align="right" style="border-top:2px solid; border-bottom:2px solid;">'.float_to_decimal($obj->nf_peso_cubado).'</th>';
				$html.='<th align="right" style="border-top:2px solid; border-bottom:2px solid;">'.float_to_decimal($obj->nf_valor).'</th>';
				$html.='<th colspan="3" style="border-right:2px solid; border-top:2px solid; border-bottom:2px solid;"></th>';
				$html.='</tr>';
				$html.='</table>';
			} else {
				$html.='<p>Nenhuma Nota Fiscal encontrada para esse romaneio.</p>';
			}
			
			$s = "SELECT * FROM romaneios_veiculos WHERE romaneio_fk = ".$obj->romaneio_id;
			$q = $this->query($s);
			if($this->num_rows($q)) {
				$html.='<table style="width:100%; border:none; margin-top:20px;">';
				$html.='<tr><th colspan="5" align="left">Veículo(s) utilizado(s) no embarque:</th></tr>';
				$html.='<tr>';
				$html.='<th align="left" style="width:30%;"><u>Veículo</u></th>';
				$html.='<th align="left" style="width:10%;"><u>Placa</u></th>';
				$html.='<th align="left" style="width:40%;"><u>Motorista</u></th>';
				$html.='<th align="center" style="width:10%;"><u>Ajudantes</u></th>';
				$html.='<th align="right" style="width:10%;"><u>Saída</u></th>';
				$html.='</tr>';
				$carregado_hora = "";
				while($f = $this->fetch_object($q)) {
					$html.='<tr>';
					$html.='<td align="left">'.$f->veiculo_nome.'</td>';
					$html.='<td align="left">'.$f->veiculo_placa.'</td>';
					$html.='<td align="left">'.$f->veiculo_motorista.'</td>';
					$html.='<td align="center">'.$f->veiculo_ajudantes.'</td>';
					$html.='<td align="right">'.$f->veiculo_hora_saida.'</td>';
					$html.='</tr>';
					$carregado_hora = $f->veiculo_hora_saida;
				}
				$carreagdo_em = $obj->data_hora;
				if(!empty($carregado_hora)) {
					$carreagdo_em = $obj->somente_data.' '.$carregado_hora;
				}
				$html.='</table>';
				$html.='<table align="right" style="margin-top:20px; border:none;">';
				$html.='<tr>';
				$html.='<th align="right">Carregado em:&nbsp;</th>';
				$html.='<td align="right">'.$carreagdo_em.'</td>';
				$html.='<th align="right">Nome Embarcador:&nbsp;</th>';
				$html.='<td align="right">'.$obj->nome_embarcador.'</td>';
				$html.='</tr>';
				$html.='</table>';
			} else {
				$html.='<p>Nenhum veículo encontrado para esse romaneio.</p>';
			}
			$html.='</body>';
			$html.='</html>';
			
			$file = encode_filename($obj->romaneio_id);
			$filename_xls = $path.'/'.$file.'.xls';
			$filename_html = $path.'/'.$file.'.html';
			if (file_exists($filename_xls)) {
				@unlink($filename_xls);
			}
			if (file_exists($filename_html)) {
				@unlink($filename_html);
			}
			
			$fp = fopen($filename_xls, 'w+');
			fwrite($fp, $html);
			fclose($fp);
			chmod($filename_xls, 0777);
			
			$fp = fopen($filename_html, 'w+');
			fwrite($fp, $html);
			fclose($fp);
			chmod($filename_html, 0777);
			
			array_push($files, array(
				'xls' => URL.'mod/sac/romaneios/files/'.$file.'.xls',
				'html' => URL.'mod/sac/romaneios/files/'.$file.'.html'
			));
		}
		
		$success = count($files) > 0;
		
		if ($success) {
			$sql = "UPDATE romaneios SET romaneio_emitido = 1 WHERE romaneio_id IN (".$romaneio_id.")";
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		
		print json_encode(array('success'=>$success,'files'=>$files));
	}
	/**
	 * Exportar registros da view_romaneios para o formato xls
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function export_xls() {
		if (!$this->is_online()) {
			print json_encode(array('success'=>false,'logged'=>false,'msg'=>'Você ficou muito tempo sem usar o sistema, por questão de segurança sua sessão foi expirada.'));
			return false;
		}
		
		$fields = json_decode($_POST['fields']);
		if (empty($fields)) {
			print json_encode(array('success'=>false,'msg'=>'Você precisa informa pelo menos alguma campo para a instrução SELECT'));
			return false;
		}
		
		$html ='<html>';
		$html.='<head>';
		$html.='<title>'.SITE_TITLE.'</title>';
		$html.='<meta charset="utf-8">';
		$html.='</head>';
		$html.='<body>';
		
		$html.='<table style="width:100%;">';
		$html.='<thead>';
		$html.='<tr>';
		$select = array(); $orderby = array();
		foreach ($fields as $field) {
			$field->id = trim($field->id);
			if (!empty($field->id)) {
				array_push($select, $field->id);
				if ($field->sort_id == 'ASC') {
					array_push($orderby, $field->id.' ASC');
				} elseif ($field->sort_id == 'DESC') {
					array_push($orderby, $field->id.' DESC');
				}
				if (!empty($field->field)) {
					$html.='<th style="font-weight:bold;">'.$field->field.'</th>';
				}
			}
		}
		$html.='</tr>';
		$html.='</thead>';
		$select = join(",", $select);
		$select = trim($select, ",");
		
		$where = 'WHERE emp_id = '.$this->empresa->emp_id;
		$filters = json_decode($_POST['filters']);
		if (!empty($filters)) {
			foreach ($filters as $filter) {
				if (!empty($filter->operador) && !empty($filter->campo) && !empty($filter->resultado)) {
					$filter->resultado = $filter->operador == 'LIKE' ? "'%".$this->escape_search($filter->resultado)."%'" : $this->escape($filter->resultado);
					$where.= " AND ".$filter->campo." ".$filter->operador." ".$filter->resultado;
				}
			}
		}
		
		$sql = "SELECT ".$select." FROM view_romaneios ";
		$sql.= $where;
		if (!empty($orderby)) {
			$orderby = join(",", $orderby);
			$sql.= " ORDER BY ";
			$sql.= $orderby;
		}
		//$this->debug($sql);
		$query = $this->query($sql);
		$html.='<tbody>';
		while ($item = $this->fetch_object($query)) {
			$html.='<tr style="background-color:'.BGCOLOR.';">';
			foreach ($fields as $field) {
				$key = $field->id;
				$style = 'text-align:left;';
				if (preg_match("/nf_valor|nf_peso_cubado|nf_peso_real|romaneio_data|romaneio_hora/i", $key)) {
					$style = 'text-align:right;';
				} elseif (preg_match("/nf_volumes/i", $key)) {
					$style = 'text-align:center;';
				}
				if (preg_match("/peso/i", $key)) {
					$item->$key = float_to_decimal($item->$key, 1);
				} elseif (preg_match("/valor/i", $key)) {
					$item->$key = float_to_money($item->$key);
				} elseif (preg_match("/data/i", $key)) {
					$item->$key = date_convert($item->$key, 'd/m/Y');
				} else {
					$item->$key = (string) $item->$key;
				}
				$html.='<td style="'.$style.'">'.$item->$key.'</td>';
			}
			$html.='</tr>';
		}
		$this->free_result($query);
		
		$html.='</tbody>';
		$html.='</body>';
		$html.='</html>';
		
		$path = '../export';
		if (!is_dir($path.'/')) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		$filename = encode_filename('romaneio'.$this->empresa->id).'.xls';
		$fileurl = URL.'mod/sac/romaneios/export/'.$filename;
		if (file_exists($path.'/'.$filename)) {
			unlink($path.'/'.$filename);
		}
		$fp = fopen($path.'/'.$filename, 'w+');
		fwrite($fp, $html);
		fclose($fp);
		
		print json_encode(array('success'=>true,'xls'=>$fileurl));
	}
}
?>