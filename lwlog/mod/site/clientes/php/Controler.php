<?php
class Controler extends App {
	/**
	 * Consultar CTe. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_cte() {
		$p = $this->get_sql_param();
		$tms_clie_id = $_SESSION['tms_clie_id'];
		$tms_ctes_list_id = $_SESSION['tms_ctes_list_id'];
		
		$filter = "WHERE cte_situacao IN ('AUTORIZADO', 'ME EMITIDA') ";
		$filter.= "AND cte_exibe_consulta_cliente = 1 ";
		if ($tms_clie_id > 0) {
			$filter.= "AND (clie_remetente_id = ".$tms_clie_id." ";
			$filter.= "OR clie_destinatario_id = ".$tms_clie_id." ";
			$filter.= "OR clie_tomador_id = ".$tms_clie_id.") ";
		} elseif (!empty($tms_ctes_list_id)) {
			$filter.= "AND cte_id IN (".$tms_ctes_list_id.") ";
		} else {
			print json_encode(array('total'=>0,'data'=>array()));
			return false;
		}
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_ctes ";
		$sql.= $filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if ($p->limit) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		//$this->debug($sql);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			$empresa = $this->pegar_empresa_por_id($field->emp_id);
			if ($empresa->emp_tipo_emitente == 'ND') {
				$path = '../export/'.$empresa->uniqueid; 
				$url = URL.'mod/conhecimentos/ctes/export/'.$empresa->uniqueid;
				
				$pdfname = validate_filename('ME-'.$field->cte_id);
				$pdfname.= '.pdf';
				
				$filename = encode_filename('MINUTADEEMBARQUE'.$field->cte_id);
				$filename = validate_filename($filename);
				$filename.= '.pdf';
				$filename = $path.'/'.$filename;
				
				if (file_exists($filename)) {
					rename($filename, $path.'/'.$pdfname);
				}
				
				$field->cte_pdf = $url.'/'.$pdfname.'?_dc='.now();
			}
			array_push($list, $field);
		}
		
		$this->free_result($query);
		
		$sql = "SELECT COUNT(cte_id) AS total FROM view_ctes ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Consultar Documentos/Notas Fiscais do CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_documentos() {
		$sql = "SELECT * FROM ctes_documentos ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY cte_doc_numero";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar ocorrências do CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_ocorrencias() {
		$sql = "SELECT * FROM view_ctes_ocorrencias WHERE cte_id = ".intval($_GET['cte_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			if (!empty($field->cte_ocor_comprovante)) {
				$field->cte_ocor_comprovante = URL.'mod/conhecimentos/ctes/comprovantes/'.$field->cte_ocor_comprovante;
			}
			array_push($list, $field);
		}
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Exportar registros da view_ctes para o formato xls
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function export_cte_xls() {
		if (!$this->cliente_online()) {
			print json_encode(array('success'=>false,'logged'=>false,'msg'=>'Você ficou muito tempo sem usar o sistema, por questão de segurança sua sessão foi expirada.'));
			return false;
		}
		
		$tms_clie_id = $_SESSION['tms_clie_id'];
		$tms_ctes_list_id = $_SESSION['tms_ctes_list_id'];
		
		$where = "WHERE cte_situacao IN ('AUTORIZADO', 'ME EMITIDA') ";
		$where.= "AND cte_exibe_consulta_cliente = 1 ";
		if ($tms_clie_id > 0) {
			$where.= "AND (clie_remetente_id = ".$tms_clie_id." ";
			$where.= "OR clie_destinatario_id = ".$tms_clie_id." ";
			$where.= "OR clie_tomador_id = ".$tms_clie_id.") ";
		} elseif (!empty($tms_ctes_list_id)) {
			$where.= "AND cte_id IN (".$tms_ctes_list_id.") ";
		} else {
			print json_encode(array('success'=>false,'msg'=>'Nenhum registro encontrado'));
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
		
		$filters = json_decode($_POST['filters']);
		if (!empty($filters)) {
			foreach ($filters as $filter) {
				if (!empty($filter->operador) && !empty($filter->campo) && !empty($filter->resultado)) {
					$filter->resultado = $filter->operador == 'LIKE' ? "'%".$this->escape_search($filter->resultado)."%'" : $this->escape($filter->resultado);
					$where.= " AND ".$filter->campo." ".$filter->operador." ".$filter->resultado;
				}
			}
		}
		
		$sql = "SELECT ".$select." FROM view_ctes ";
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
				if (preg_match("/cte_serie|cte_numero|cte_minuta|peso|cubagem|volumes|valor|icms/i", $key)) {
					$style = 'text-align:right;';
				} elseif (preg_match("/data|sigla|codigo_uf|perc|cte_cadastrado_em|cte_alterado_em/i", $key)) {
					$style = 'text-align:center;';
				}
				if ($key == 'cte_chave') {
					$item->cte_chave = "'".$item->cte_chave."'";
				} elseif (preg_match("/peso|cubagem|perc/i", $key)) {
					$item->$key = float_to_decimal($item->$key, 1);
				} elseif (preg_match("/valor/i", $key)) {
					$item->$key = float_to_money($item->$key);
				} elseif (preg_match("/data_hora|cadastrado_em|alterado_em/i", $key)) {
					$item->$key = date_convert($item->$key, 'd/m/Y H:i');
				} elseif (preg_match("/data_entrega/i", $key)) {
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
		if (!is_dir($path)) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		$filename = encode_filename('cte').'.xls';
		$fileurl = URL.'mod/site/clientes/export/'.$filename;
		if (file_exists($path.'/'.$filename)) {
			unlink($path.'/'.$filename);
		}
		$fp = fopen($path.'/'.$filename, 'w+');
		fwrite($fp, $html);
		fclose($fp);
		
		print json_encode(array('success'=>true,'xls'=>$fileurl));
	}
	/**
	 * Retorna última ocorrência relacionada ao cte
	 * @access private
	 * @param int $cte_id
	 * @return object
	 */
	private function view_ctes_ultimas_ocorrencias($cte_id) {
		$sql = "SELECT * FROM view_ctes_ultimas_ocorrencias WHERE cte_id = ".intval($cte_id);
		$query = $this->query($sql);
		$field = $this->fetch_object($query);
		$this->free_result($query);
		return $field;
	}
	/**
	 * Exportar Conhecimentos, Documentos e Ocorrências para formatos EDI em txt
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function export_cte_txt() {
		if (!$this->cliente_online()) {
			print json_encode(array('success'=>false,'logged'=>false,'msg'=>'Você ficou muito tempo sem usar o sistema, por questão de segurança sua sessão foi expirada.'));
			return false;
		}
		
		$tms_clie_id = $_SESSION['tms_clie_id'];
		$tms_ctes_list_id = $_SESSION['tms_ctes_list_id'];
		
		$where = "WHERE cte_situacao IN ('AUTORIZADO', 'ME EMITIDA') ";
		$where.= "AND cte_exibe_consulta_cliente = 1 ";
		if ($tms_clie_id > 0) {
			$where.= "AND (clie_remetente_id = ".$tms_clie_id." ";
			$where.= "OR clie_destinatario_id = ".$tms_clie_id." ";
			$where.= "OR clie_tomador_id = ".$tms_clie_id.") ";
		} elseif (!empty($tms_ctes_list_id)) {
			$where.= "AND cte_id IN (".$tms_ctes_list_id.") ";
		} else {
			print json_encode(array('success'=>false,'msg'=>'Nenhum registro encontrado'));
			return false;
		}
		
		$fields = json_decode($_POST['fields']);
		if (empty($fields)) {
			print json_encode(array('success'=>false,'msg'=>'Você precisa informa pelo menos alguma campo para a instrução SELECT'));
			return false;
		}
		
		$select = array(); $orderby = array(); $title = array();
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
					array_push($title, utf8_decode($field->field));
				}
			}
		}
		$txt = join(";", $title);
		
		if (!in_array("cte_id", $select)) {
			array_push($select, "cte_id");
		}
		if (!in_array("cte_ocor_id", $select)) {
			array_push($select, "cte_ocor_id");
		}
		if (!in_array("ocor_caracteristica", $select)) {
			array_push($select, "ocor_caracteristica");
		}
		
		$select = join(",", $select);
		$select = trim($select, ",");
		
		$filters = json_decode($_POST['filters']);
		if (!empty($filters)) {
			foreach ($filters as $filter) {
				if (!empty($filter->operador) && !empty($filter->campo) && !empty($filter->resultado)) {
					$filter->resultado = $filter->operador == 'LIKE' ? "'%".$this->escape_search($filter->resultado)."%'" : $this->escape($filter->resultado);
					$where.= " AND ".$filter->campo." ".$filter->operador." ".$filter->resultado;
				}
			}
		}
		
		$sql = "SELECT ".$select." FROM view_ctes_documentos_ocorrencias ";
		$sql.= $where;
		if (!empty($orderby)) {
			$orderby = join(",", $orderby);
			$sql.= " ORDER BY ";
			$sql.= $orderby;
		}
		//$this->debug($sql);
		$query = $this->query($sql);
		while ($item = $this->fetch_object($query)) {
			if (!$item->cte_ocor_id) {
				$obj = $this->view_ctes_ultimas_ocorrencias($item->cte_id);
				if (!empty($obj)) {
					foreach ($obj as $key => $value) {
						if ($item->$key = $value);
					}
				}
			}
			$txt.="\r"; $values = array();
			foreach ($fields as $field) {
				$key = $field->id;
				if ($key == 'cte_chave') {
					$item->cte_chave = "'".$item->cte_chave."'";
				} elseif ($key == 'cte_data_entrega_ultima') {
					if (preg_match("/ENTREGA/i", $item->ocor_caracteristica)) {
						$item->cte_data_entrega_ultima = date_convert($item->cte_data_entrega_ultima, 'd/m/Y');
					} else {
						$item->cte_data_entrega_ultima = '';
					}
				} elseif (preg_match("/peso|cubagem|perc|bc/i", $key)) {
					$item->$key = float_to_decimal($item->$key, 1);
				} elseif (preg_match("/valor/i", $key)) {
					$item->$key = float_to_money($item->$key);
				} elseif (preg_match("/data_hora|cadastrado_em|alterado_em/i", $key)) {
					$item->$key = date_convert($item->$key, 'd/m/Y H:i');
				} elseif (preg_match("/quando_data|data_entrega/i", $key)) {
					$item->$key = date_convert($item->$key, 'd/m/Y');
				} else {
					$item->$key = (string) $item->$key;
				}
				array_push($values, utf8_decode($item->$key));
			}
			$txt.= join(";", $values);
			unset($values);
		}
		$this->free_result($query);
		
		$path = '../export';
		if (!is_dir($path)) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		$filename = encode_filename('cte').'.txt';
		$fileurl = URL.'mod/site/clientes/export/'.$filename;
		if (file_exists($path.'/'.$filename)) {
			unlink($path.'/'.$filename);
		}
		$fp = fopen($path.'/'.$filename, 'w+');
		fwrite($fp, $txt);
		fclose($fp);
		
		print json_encode(array('success'=>true,'xls'=>$fileurl));
	}
	/**
	 * Alterar dados de acesso do cliente
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function alterar_senha_cliente() {
		$clie_login = $this->escape(trim($_POST['clie_login']), 'string');
		$clie_senha = $this->escape(trim($_POST['clie_senha']), 'string');
		$sql = "UPDATE clientes SET ";
		$sql.= "clie_login = ".$clie_login.",";
		$sql.= "clie_senha = ".$clie_senha." ";
		$sql.= "WHERE clie_id = ".$this->cliente->clie_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>true));
	}
	/**
	 * Consultar Receber. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_receber() {
		if (!$this->cliente->clie_id) {
			print json_encode(array('total'=>0,'data'=>array()));
			return false;
		}
		$p = $this->get_sql_param();
		$id = trim($_GET['id']);
		$status = trim($_GET['status']);
		$situacao_fatura = trim($_GET['situacao_fatura']);
		
		$filter	= "WHERE clie_id = ".$_SESSION['tms_clie_id']." ";
		$filter.= $p->filter;
		if (!empty($id)) {
			$filter.= "AND id IN (".$id.") ";
		} elseif (!empty($status) && $status != 'TODOS') {
			if ($status == 'PENDENTES') {
				$filter.= "AND situacao_fatura IN ('A VENCER','RECEBER HOJE','EM ATRASO')";
			} elseif ($status == 'BAIXADOS') {
				$filter.= "AND situacao_fatura IN ('RECEBIDO NO PRAZO','RECEBIDO EM ATRASO')";
			} else {
				$filter.= "AND situacao_fatura = 'A FATURAR'";
			}
		} elseif (!empty($situacao_fatura)) {
			$situacao_fatura = explode(",", $situacao_fatura);
			foreach ($situacao_fatura as $key => $value) {
				$situacao_fatura[$key] = $this->escape(trim($value));
			}
			$filter.= "AND situacao_fatura IN (".join(",", $situacao_fatura).")";
		}
		
		$sql = "SELECT * FROM view_contas_receber ";
		$sql.= $filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if ($p->limit) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			$empresa = $this->pegar_empresa_por_id($field->emp_id);
			$url = URL.'mod/financeiro/receber/export/'.$empresa->uniqueid;
			if (!empty($field->pdf_duplicata)) {
				$field->pdf_duplicata = $url.'/'.$field->pdf_duplicata;
			}
			array_push($list, $field);
		}
		
		$this->free_result($query);
		
		$sql = "SELECT COUNT(id) AS total FROM view_contas_receber ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Exportar faturas do cliente
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function export_receber_xls() {
		if (!$this->cliente->clie_id) {
			print json_encode(array('success'=>false,'logged'=>false,'msg'=>'Você ficou muito tempo sem usar o sistema, por questão de segurança sua sessão foi expirada.'));
			return false;
		}
		$periodo_inicial = trim($_POST['periodo_inicial']);
		$periodo_final = trim($_POST['periodo_final']);
		$status = trim($_POST['status']);
		
		$url = URL.'mod/site/clientes/export';
		
		$total = (object) array('receber'=>0,'recebido'=>0);
		$subtotal = (object) array('receber'=>0,'recebido'=>0);
		$html = $this->pdf_simple_header('RELATÓRIO CONTAS À RECEBER<br/>'.$status.' ('.$periodo_inicial.' - '.$periodo_final.')');
		
		$html.='<table style="width:100%; margin-top:20px;">';
		
		$sql = "SELECT ";
		$sql.= "id,";
		$sql.= "doc_fatura,";
		$sql.= "emitido_em,";
		$sql.= "devedor_razao_social,";
		$sql.= "devedor_cpf_cnpj,";
		$sql.= "vence_em,";
		$sql.= "valor_ctes,";
		$sql.= "recebido_em,";
		$sql.= "valor_recebido ";
		$sql.= "FROM view_contas_receber ";
		$sql.= "WHERE clie_id = ".$this->cliente->clie_id." ";
		$sql.= "AND emitido_em BETWEEN ".$this->escape($periodo_inicial)." AND ".$this->escape($periodo_final)." ";
		if (!empty($status) && $status != 'TODOS') {
			if ($status == 'PENDENTES') {
				$sql.= "AND situacao_fatura IN ('A VENCER','RECEBER HOJE','EM ATRASO') ";
			} elseif ($status == 'BAIXADOS') {
				$sql.= "AND situacao_fatura IN ('RECEBIDO NO PRAZO','RECEBIDO EM ATRASO') ";
			} else {
				$sql.= "AND situacao_fatura = 'A FATURAR' ";
			}
		}
		$sql.= "ORDER BY devedor_razao_social, emitido_em, vence_em, recebido_em";
		$result = $this->query($sql); $records = array();
		while ($field = $this->fetch_object($result)) {
			array_push($records, $field);
			$total->receber += $field->valor_ctes;
			$total->recebido += $field->valor_recebido;
		}
		$this->free_result($result);
		foreach ($records as $key => $record) {
			$prev = $records[$key - 1];
			$next = $records[$key + 1];
			
			$subtotal->receber += $record->valor_ctes;
			$subtotal->recebido += $record->valor_recebido;
			
			if ($prev->devedor_razao_social != $record->devedor_razao_social) {
				$html.='<tr>';
				$html.='<th style="width:10%; text-align:center; font-weight:bold;">FATURA</th>';
				$html.='<th style="width:10%; text-align:center; font-weight:bold;">EMISSÃO</th>';
				$html.='<th style="width:40%; text-align:center; font-weight:bold;">CLIENTE</th>';
				$html.='<th style="width:10%; text-align:center; font-weight:bold;">VENCIMENTO</th>';
				$html.='<th style="width:10%; text-align:center; font-weight:bold;">FATURADO</th>';
				$html.='<th style="width:10%; text-align:center; font-weight:bold;">RECEBIDO EM</th>';
				$html.='<th style="width:10%; text-align:center; font-weight:bold;">RECEBIDO</th>';
				$html.='</tr>';
			}
			
			$html.='<tr style="background-color:'.BGCOLOR.';">';
			$html.='<td style="width:10%; text-align:right;">'.$record->doc_fatura.'</td>';
			$html.='<td style="width:10%; text-align:right;">'.date_convert($record->emitido_em, 'd/m/Y').'</td>';
			$html.='<td style="width:40%; text-align:left;">'.$record->devedor_razao_social.' ('.$record->devedor_cpf_cnpj.')</td>';
			$html.='<td style="width:10%; text-align:right;">'.date_convert($record->vence_em, 'd/m/Y').'</td>';
			$html.='<td style="width:10%; text-align:right">'.float_to_money($record->valor_ctes).'</td>';
			$html.='<td style="width:10%; text-align:right;">'.date_convert($record->recebido_em, 'd/m/Y').'</td>';
			$html.='<td style="width:10%; text-align:right;">'.float_to_money($record->valor_recebido).'</td>';
			$html.='</tr>';
			
			if ($next->devedor_razao_social != $record->devedor_razao_social) {
				$html.='<tr>';
				$html.='<th colspan="3" style="font-weight:bold; font-size:12px;">SUBTOTAL</th>';
				$html.='<th colspan="2" style="font-weight:bold; text-align:right; border-top:1px solid; font-size:12px;">'.float_to_money($subtotal->receber).'</th>';
				$html.='<th colspan="2" style="font-weight:bold; text-align:right; border-top:1px solid; font-size:12px;">'.float_to_money($subtotal->recebido).'</th>';
				$html.='</tr>';
				$html.='<tr><td colspan="7" style="height:10px;"></td></tr>';
				$subtotal->receber = 0;
				$subtotal->recebido = 0;
			}
		}
		
		$html.='<tr>';
		$html.='<th colspan="3" style="font-weight:bold; font-size:12px;">TOTAL</th>';
		$html.='<th colspan="2" style="font-weight:bold; text-align:right; border-top:1px solid; font-size:12px;">'.float_to_money($total->receber).'</th>';
		$html.='<th colspan="2" style="font-weight:bold; text-align:right; border-top:1px solid; font-size:12px;">'.float_to_money($total->recebido).'</th>';
		$html.='</tr>';
		$html.='</table>';
		
		$html.= $this->pdf_default_footer();
		//$this->debug($html);
		$name = encode_filename('RELATÓRIO'.$this->cliente->clie_id);
		$name = validate_filename($name);
		
		$xlsname = $name.'.xls';
		$pdfname = $name.'.pdf';
		
		$path = '../export';
		if (!is_dir($path)) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		$pdf_filename = $path.'/'.$pdfname;
		$xls_filename = $path.'/'.$xlsname;
		if (file_exists($pdf_filename)) @unlink($pdf_filename);
		if (file_exists($xls_filename)) @unlink($xls_filename);
		
		try {
			$html2pdf = $this->html2pdf();
			$html2pdf->writeHTML($html);
			$html2pdf->Output($pdf_filename, 'F');
		} catch (HTML2PDF_exception $e) {
			$msg = "HTML2PDF ERROR\n";
			$msg.= $html;
			throw new ExtJSException($msg);
		}
		
		$xls_html = '<html>';
		$xls_html.= '<head>';
		$xls_html.= '<meta charset="UTF-8">';
		$xls_html.= '</head>';
		$xls_html.= '<body>';
		$xls_html.= $html;
		$xls_html.= '</body>';
		$xls_html.= '</html>';
		$fp = fopen($xls_filename, 'w+');
		fwrite($fp, $xls_html);
		fclose($fp);
		
		@chmod($pdf_filename, 0777);
		@chmod($xls_filename, 0777);
		
		$pdf_url = $url.'/'.$pdfname.'?_dc='.now();
		$xls_url = $url.'/'.$xlsname.'?_dc='.now();
		
		print json_encode(array('success'=>true,'pdf'=>$pdf_url,'xls'=>$xls_url));
	}
	/**
	 * Exportar Conhecimentos, Documentos e Ocorrências para formatos EDI em txt
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function export_receber_txt() {
		if (!$this->cliente->clie_id) {
			print json_encode(array('success'=>false,'logged'=>false,'msg'=>'Você ficou muito tempo sem usar o sistema, por questão de segurança sua sessão foi expirada.'));
			return false;
		}
		
		$clie_id = $this->cliente->clie_id;
		$data_faturamento_i = $this->escape(trim($_POST['data_faturamento_i']), 'date');
		$data_faturamento_f = $this->escape(trim($_POST['data_faturamento_f']), 'date');
		
		$sql = "SELECT ";
		$sql.= "t1.id,";
		$sql.= "t2.emp_sigla_cia,";
		$sql.= "LPAD(t2.emp_cnpj, 14, '0') AS emp_cnpj,";
		$sql.= "RPAD(t2.emp_razao_social, 40, ' ') AS emp_razao_social,";
		$sql.= "RPAD(t2.emp_nome_fantasia, 35, ' ') AS remetente,";
		$sql.= "RPAD(t1.devedor_razao_social, 35, ' ') AS destinatario,";
		$sql.= "t1.doc_fatura,";
		$sql.= "t1.valor_original,";
		$sql.= "t1.valor_juros,";
		$sql.= "t1.valor_desconto,";
		$sql.= "IF(t1.situacao = 'EM COBRANCA', 'I', 'E') AS acao_documento,";
		$sql.= "t1.emitido_em,";
		$sql.= "t1.vence_em,";
		$sql.= "t1.banco_numero,";
		$sql.= "RPAD(IFNULL(t1.banco_nome, ''), 35, ' ') AS banco_nome,";
		$sql.= "LPAD(IFNULL(t1.agencia, ''), 4, '0') AS agencia,";
		$sql.= "LPAD(IFNULL(t1.digito_ver_agencia, ''), 1, ' ') AS digito_ver_agencia,";
		$sql.= "LPAD(IFNULL(t1.conta_corrente, ''), 10, '0') AS conta_corrente,";
		$sql.= "RPAD(IFNULL(t1.digito_ver_conta_corrente, ''), 2, ' ') digito_ver_conta_corrente ";
		$sql.= "FROM view_contas_receber AS t1 ";
		$sql.= "INNER JOIN empresas AS t2 ON t2.emp_id = t1.emp_id ";
		$sql.= "WHERE t1.clie_id = ".$clie_id." ";
		$sql.= "AND DATE(t1.emitido_em) BETWEEN ".$data_faturamento_i." AND ".$data_faturamento_f." ";
		$sql.= "AND t1.situacao != 'LIQUIDADO' ";
		$sql.= "ORDER BY t1.emitido_em";
		//$this->debug($sql);
		$query = $this->query($sql); 
		$tFaturas = $this->num_rows($query);
		$tReceber = 0; $txt = "";
		while ($field = $this->fetch_object($query)) {
			$tReceber += $field->valor_original;
			
			$field->valor_original *= 100;
			$field->valor_juros *= 100;
			$field->valor_desconto *= 100;
			$s = "SELECT SUM(cte_valor_icms) AS valor_total_icms ";
			$s.= "FROM ctes AS t1 ";
			$s.= "INNER JOIN ctes_faturados AS t2 ON t2.cte_id = t1.cte_id ";
			$s.= "WHERE t2.cta_rec_id = ".$field->id;
			$q = $this->query($s);
			$field->valor_total_icms = $this->fetch_object($q)->valor_total_icms;
			$field->valor_total_icms = floatval($field->valor_total_icms);
			$field->valor_total_icms *= 100;
			$this->free_result($q);
			
			$txt.= '000';
			$txt.= utf8_decode($field->remetente);
			$txt.= utf8_decode($field->destinatario);
			$txt.= date("dmy");
			$txt.= date("Hi");
			$txt.= 'COB'.date("dmHi").'0';
			$txt.= str_repeat(" ", 75);
			
			$txt.="\r";
			
			$txt.= '350';
			$txt.= 'COBRA'.date("dmHi").'0';
			$txt.= str_repeat(" ", 153);
			
			$txt.="\r";
			
			$txt.= '351';
			$txt.= $field->emp_cnpj;
			$txt.= utf8_decode($field->emp_razao_social);
			$txt.= str_repeat(" ", 113);
			
			$txt.="\r";
			
			$txt.= '352';
			$txt.= str_pad($field->emp_sigla_cia, 10, " ");
			$txt.= '0';
			$txt.= 'UNI';
			$txt.= str_pad(integerval($field->doc_fatura), 10, "0", STR_PAD_LEFT);
			$txt.= date_convert($field->emitido_em, 'dmY');
			$txt.= date_convert($field->vence_em, 'dmY');
			$txt.= str_pad($field->valor_original, 15, "0", STR_PAD_LEFT);
			$txt.= 'COB';
			$txt.= str_pad($field->valor_total_icms, 15, "0", STR_PAD_LEFT);
			$txt.= str_pad($field->valor_juros, 15, "0", STR_PAD_LEFT);
			$txt.= date_convert($field->vence_em, 'dmY');
			$txt.= str_pad($field->valor_desconto, 15, "0", STR_PAD_LEFT);
			$txt.= utf8_decode($field->banco_nome);
			$txt.= $field->agencia;
			$txt.= $field->digito_ver_agencia;
			$txt.= $field->conta_corrente;
			$txt.= $field->digito_ver_conta_corrente;
			$txt.= $field->acao_documento;
			$txt.= str_repeat(" ", 3);
			$txt.="\r";
			
			$s = "SELECT ";
			$s.= "t1.cte_id,";
			$s.= "t3.emp_sigla_cia,";
			$s.= "LPAD(t1.cte_serie, 5, '0') AS cte_serie,";
			$s.= "LPAD(t1.cte_numero, 12, '0') AS cte_numero,";
			$s.= "t1.cte_valor_total,";
			$s.= "DATE(t1.cte_data_hora_emissao) AS cte_data_emissao,";
			$s.= "LPAD(t1.rem_cnpj, 14, '0') AS rem_cnpj,";
			$s.= "LPAD(t1.des_cnpj, 14, '0') AS des_cnpj ";
			$s.= "FROM view_ctes AS t1 ";
			$s.= "INNER JOIN ctes_faturados AS t2 ON t2.cte_id = t1.cte_id ";
			$s.= "INNER JOIN empresas AS t3 ON t3.emp_id = t1.emp_id ";
			$s.= "WHERE t2.cta_rec_id = ".$field->id." ";
			$s.= "ORDER BY t1.cte_numero";
			$this->debug($s);
			$q = $this->query($s);
			while ($item = $this->fetch_object($q)) {
				$item->cte_valor_total *= 100;
				
				$txt.= '353';
				$txt.= str_pad($item->emp_sigla_cia, 10, " "); 
				$txt.= $item->cte_serie;
				$txt.= $item->cte_numero;
				$txt.= str_pad($item->cte_valor_total, 15, "0", STR_PAD_LEFT);
				$txt.= date_convert($item->cte_data_emissao, 'dmY');
				$txt.= $item->rem_cnpj;
				$txt.= $item->des_cnpj;
				$txt.= $field->emp_cnpj;
				$txt.= str_repeat(" ", 75);
				$txt.= "\r";
				
				$s = "SELECT ";
				$s.= "LPAD(cte_doc_serie, 3, '0') AS cte_doc_serie,";
				$s.= "LPAD(cte_doc_numero, 8, '0') AS cte_doc_numero,";
				$s.= "cte_doc_data_emissao,";
				$s.= "cte_doc_peso_total,";
				$s.= "cte_doc_valor_produtos ";
				$s.= "FROM ctes_documentos ";
				$s.= "WHERE cte_id = ".$item->cte_id;
				$this->debug($s);
				$r = $this->query($s);
				while ($o = $this->fetch_object($r)) {
					$o->cte_doc_peso_total *= 100;
					$o->cte_doc_valor_produtos *= 100;
					
					$txt.='354';
					$txt.= $o->cte_doc_serie;
					$txt.= $o->cte_doc_numero;
					$txt.= date_convert($o->cte_doc_data_emissao, 'dmY');
					$txt.= str_pad($item->cte_doc_peso_total, 7, "0", STR_PAD_LEFT);
					$txt.= str_pad($item->cte_doc_valor_produtos, 15, "0", STR_PAD_LEFT);
					$txt.= $item->rem_cnpj;
					$txt.= str_repeat(" ", 112);
					$txt.= "\r";
				}
				$this->free_result($r);
			}
			$this->free_result($q);
		}
		$this->free_result($query);
		
		$txt.='355';
		$txt.= str_pad($tFaturas, 4, '0', STR_PAD_LEFT);
		$txt.= str_pad($tReceber * 100, 15, '0', STR_PAD_LEFT);
		$txt.= str_repeat(" ", 148);
		
		$path = '../export';
		if (!is_dir($path)) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		$filename = encode_filename('doccob'.$clie_id).'.txt';
		$fileurl = URL.'mod/site/clientes/export/'.$filename;
		if (file_exists($path.'/'.$filename)) {
			unlink($path.'/'.$filename);
		}
		
		if (!$tFaturas) {
			print json_encode(array('success'=>false,'msg'=>'Sua consulta retornou vazia'));
			return false;
		}
		
		$fp = fopen($path.'/'.$filename, 'w+');
		fwrite($fp, $txt);
		fclose($fp);
		
		print json_encode(array('success'=>true,'url'=>$fileurl));
	}
}
?>