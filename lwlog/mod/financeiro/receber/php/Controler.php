<?php
class Controler extends App {
	/**
	 * Consultar Receber. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_receber() {
		$p = $this->get_sql_param();
		$id = trim($_GET['id']);
		$status = trim($_GET['status']);
		$situacao_fatura = trim($_GET['situacao_fatura']);
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id." ";
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
		//$this->debug($sql);
		$query = $this->query($sql); $list = array();
		$url = URL.'mod/financeiro/receber/export/'.$this->empresa->uniqueid;
		while ($field = $this->fetch_object($query)) {
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
	 * Consultar Cliente Devedor por Status. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_devedor() {
		$sql = "SELECT ";
		$sql.= $this->escape($this->empresa->emp_nome_fantasia)." AS empresa,";
		$sql.= "GROUP_CONCAT(id SEPARATOR ',') AS list_id,";
		$sql.= "devedor_razao_social,";
		$sql.= "SUM(valor_ctes) AS valor_ctes,";
		$sql.= "SUM(valor_original) AS valor_original,";
		$sql.= "SUM(IF(situacao_fatura = 'A VENCER', valor_original, 0)) AS total_vencer,";
		$sql.= "SUM(IF(situacao_fatura = 'RECEBER HOJE', valor_original, 0)) AS total_hoje,";
		$sql.= "SUM(IF(situacao_fatura = 'EM ATRASO', valor_original, 0)) AS total_atrasado,";
		$sql.= "SUM(valor_recebido) AS total_recebido ";
		$sql.= "FROM view_contas_receber ";
		$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$sql.= "GROUP BY devedor_razao_social ";
		$sql.= "ORDER BY devedor_razao_social";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar conhecimentos faturados. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_faturado() {
		$sql = "SELECT ";
		$sql.= "t1.cte_id,";
		$sql.= "t1.cte_serie,";
		$sql.= "t1.cte_minuta,";
		$sql.= "t1.cte_numero,";
		$sql.= "t1.cte_valor_total,";
		$sql.= "t1.cte_data_hora_emissao,";
		$sql.= "t1.clie_tomador_id,";
		$sql.= "CONCAT(t2.clie_razao_social, ' (', IF(t2.clie_cnpj IS NOT NULL AND t2.clie_cnpj != '', t2.clie_cnpj, t2.clie_cpf),')') AS tom_razao_social,";
		$sql.= "IF(t3.cliefat_tipo_carteira IS NOT NULL AND t3.cliefat_tipo_carteira != '', t3.cliefat_tipo_carteira, 'BANCARIA') AS cte_tipo_carteira ";
		$sql.= "FROM ctes AS t1 ";
		$sql.= "INNER JOIN clientes AS t2 ON t2.clie_id = t1.clie_tomador_id ";
		$sql.= "LEFT JOIN clientes_fatura AS t3 ON t3.clie_id_fk = t2.clie_id ";
		$sql.= "INNER JOIN ctes_faturados AS t4 ON t4.cte_id = t1.cte_id ";
		$sql.= "WHERE t1.emp_id = ".$this->empresa->emp_id." ";
		$sql.= "AND t4.cta_rec_id = ".intval($_GET['cta_rec_id'])." ";
		$sql.= "ORDER BY t2.clie_razao_social, t1.cte_id DESC";
		$query = $this->query($sql);
		if (!$query) {
			print json_encode($this->get_sql_error());
			return false;
		}
		$list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar conhecimentos em aberto para faturamento. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_ctes() {
		$clie_tomador_id = intval($_GET['clie_tomador_id']);
		$periodo_inicial = $this->escape(trim($_GET['periodo_inicial']), 'date');
		$periodo_final = $this->escape(trim($_GET['periodo_final']), 'date');
		
		$sql = "SELECT ";
		$sql.= "1 AS cte_faturado,";
		$sql.= "t1.cte_id,";
		$sql.= "t1.cte_serie,";
		$sql.= "t1.cte_minuta,";
		$sql.= "t1.cte_numero,";
		$sql.= "t1.cte_valor_total,";
		$sql.= "t1.cte_data_hora_emissao,";
		$sql.= "t1.clie_tomador_id,";
		$sql.= "CONCAT(t2.clie_razao_social, ' (', IF(t2.clie_cnpj IS NOT NULL AND t2.clie_cnpj != '', t2.clie_cnpj, t2.clie_cpf),')') AS tom_razao_social,";
		$sql.= "IF(t3.cliefat_tipo_carteira IS NOT NULL AND t3.cliefat_tipo_carteira != '', t3.cliefat_tipo_carteira, 'BANCARIA') AS cte_tipo_carteira ";
		$sql.= "FROM ctes AS t1 ";
		$sql.= "INNER JOIN clientes AS t2 ON t2.clie_id = t1.clie_tomador_id ";
		$sql.= "INNER JOIN clientes_fatura AS t3 ON t3.clie_id_fk = t2.clie_id ";
		$sql.= "WHERE t1.emp_id = ".$this->empresa->emp_id." ";
		$sql.= "AND t3.cliefat_status_cobranca IN ('F','R') ";
		$sql.= "AND t1.cte_situacao IN ('AUTORIZADO', 'ME EMITIDA') ";
		$sql.= "AND DATE(t1.cte_data_hora_emissao) BETWEEN ".$periodo_inicial." AND ".$periodo_final." ";
		$sql.= "AND t1.cte_id NOT IN (";
		$sql.= "SELECT st1.cte_id ";
		$sql.= "FROM ctes_faturados AS st1 ";
		$sql.= "INNER JOIN ctes AS st2 ON st2.cte_id = st1.cte_id ";
		$sql.= "WHERE st2.emp_id = ".$this->empresa->emp_id;
		$sql.= ") ";
		if ($clie_tomador_id > 0) {
			$sql.= "AND t1.clie_tomador_id = ".$clie_tomador_id." ";
		}
		$sql.= "AND t1.cte_exibe_consulta_fatura = 1 ";
		$sql.= "ORDER BY t1.cte_id DESC";
		$query = $this->query($sql);
		if (!$query) {
			print json_encode($this->get_sql_error());
			return false;
		}
		$list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Salvar campo individual da tabela contas à receber
	 * @remotable
	 * @access public
	 * @return output (json)
	 */	
	function save_receber() {
		$id = intval($_POST['id']);
		if (!$id) {
			print json_encode(array('success'=>false,'msg'=>'ID do registro não informado'));
			return false;
		}
		$tipo_carteira = $this->escape(trim($_POST['tipo_carteira']));
		$valor_original = $this->escape(trim($_POST['valor_original']), 'decimal');
		$vence_em = $this->escape(trim($_POST['vence_em']), 'date');
		$valor_recebido = $this->escape(trim($_POST['valor_recebido']), 'decimal');
		$recebido_em = $this->escape(trim($_POST['recebido_em']), 'date');
		$valor_multa = $this->escape(trim($_POST['valor_multa']), 'decimal');
		$valor_juros = $this->escape(trim($_POST['valor_juros']), 'decimal');
		$valor_acrescimo = $this->escape(trim($_POST['valor_acrescimo']), 'decimal');
		$valor_desconto = $this->escape(trim($_POST['valor_desconto']), 'decimal');
		$valor_abatimento = $this->escape(trim($_POST['valor_abatimento']), 'decimal');
		$emitido_boleto = $this->escape($_POST['emitido_boleto'], 'bool');
		$email_enviado = $this->escape($_POST['email_enviado'], 'bool');
		$nota_obs = $this->escape(trim($_POST['nota_obs']));
		$motivo_cancelado = $this->escape(trim($_POST['motivo_cancelado']));
		
		$sql = "UPDATE contas_receber SET ";
		$sql.= "tipo_carteira = ".$tipo_carteira.",";
		$sql.= "valor_original = ".$valor_original.",";
		$sql.= "vence_em = ".$vence_em.",";
		$sql.= "valor_recebido = ".$valor_recebido.",";
		$sql.= "recebido_em = ".$recebido_em.",";
		$sql.= "valor_multa = ".$valor_multa.",";
		$sql.= "valor_juros = ".$valor_juros.",";
		$sql.= "valor_acrescimo = ".$valor_acrescimo.",";
		$sql.= "valor_desconto = ".$valor_desconto.",";
		$sql.= "valor_abatimento = ".$valor_abatimento.",";
		$sql.= "emitido_boleto = ".$emitido_boleto.",";
		$sql.= "email_enviado = ".$email_enviado.",";
		$sql.= "nota_obs = ".$nota_obs.",";
		$sql.= "motivo_cancelado = ".$motivo_cancelado." ";
		$sql.= "WHERE id = ".$id;
          //$this->debug($sql);
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		print json_encode(array('success'=>true));
	}
	/**
	 * Criar fatura no contas à receber vincula os registro com os conhecimentos
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function faturar() {
		$list_id = trim($_POST['list_id']);
		$bco_id = intval($_POST['bco_id']);
		$vencimento = $this->escape(trim($_POST['vencimento']), 'date');
		
		$sql = "SELECT ";
		$sql.= "GROUP_CONCAT(t1.cte_id SEPARATOR ',') AS cte_list_id,";
		$sql.= "t1.clie_tomador_id,";
		$sql.= "SUM(t1.cte_valor_total) AS valor_total,";
		$sql.= "IF(t2.cliefat_dias_ao_vecto > 0, DATE_ADD(".$vencimento.", INTERVAL t2.cliefat_dias_ao_vecto DAY), ".$vencimento.") AS vencimento,";
		$sql.= "IF(t2.cliefat_tipo_carteira IS NOT NULL AND t2.cliefat_tipo_carteira != '', t2.cliefat_tipo_carteira, 'BANCARIA') AS tipo_carteira ";
		$sql.= "FROM ctes AS t1 ";
		$sql.= "LEFT JOIN clientes_fatura AS t2 ON t2.clie_id_fk = t1.clie_tomador_id ";
		$sql.= "WHERE t1.cte_id IN(".$list_id.") ";
		$sql.= "AND t1.clie_tomador_id > 0 ";
		$sql.= "AND t1.cte_situacao IN ('AUTORIZADO', 'ME EMITIDA') ";
		$sql.= "GROUP BY clie_tomador_id, tipo_carteira ";
		$sql.= "ORDER BY clie_tomador_id, tipo_carteira";
		//$this->debug($sql);
		$query = $this->query($sql); $list_id = array();
		while ($field = $this->fetch_object($query)) {
			$s = "SELECT IFNULL(MAX(ROUND(EXPLODE(EXPLODE(doc_fatura, '/', 2), '-', 1))), 0) AS last_id FROM contas_receber ";
			$s.= "WHERE emp_id = ".$this->empresa->emp_id." ";
			$s.= "AND YEAR(cadastrado_em) = YEAR(CURDATE())";
			$q = $this->query($s);
			$last_id = $this->fetch_object($q)->last_id;
			$last_id = intval($last_id); $last_id += 1;
			$this->free_result($q);
			$doc_fatura = $this->escape(gerar_numeracao($last_id, 5));
			
			$s = "INSERT INTO contas_receber SET ";
			$s.= "emp_id = ".$this->empresa->emp_id.",";
			$s.= "clie_id = ".$field->clie_tomador_id.",";
			$s.= "doc_fatura = ".$doc_fatura.",";
			$s.= "emitido_em = NOW(),";
			$s.= "valor_original = ".$field->valor_total.",";
			$s.= "vence_em = ".$this->escape($field->vencimento, "string").",";
			$s.= "tipo_carteira = ".$this->escape($field->tipo_carteira);
			if ($bco_id > 0) {
				$sql.=",bco_id = ".$bco_id;
			}
			if (!$this->query($s)) {
				print json_encode($this->get_sql_error());
				return false;
			}
			$contas_receber_id = $this->insert_id();
			array_push($list_id, $contas_receber_id);
			
			$field->cte_list_id = explode(',', $field->cte_list_id);
			foreach ($field->cte_list_id as $cte_id) {
				$s = "INSERT INTO ctes_faturados SET ";
				$s.= "cte_id = ".$cte_id.",";
				$s.= "cta_rec_id = ".$contas_receber_id;
				if (!$this->query($s)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}
		$this->free_result($query);
		
		$list_id = join(',', $list_id);
		$files = $this->gerar_duplicata($list_id);
		
		print json_encode(array('success'=>true,'list_id'=>$list_id,'pdf'=>$files));
	}
	/**
	 * Excluir faturamento do contas à receber
	 * @remotable 
	 * @access public
	 * @return output (json)
	 */
	function delete_receber() {
		$sql = "DELETE FROM contas_receber ";
		$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$sql.= "AND id IN (".trim($_POST['id']).")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=> $this->affected_rows() > 0));
	}
	/**
	 * Gerar Duplicata em PDF
	 * @remotable
	 * @param string $list_id
	 * @access public
	 * @return output (json)
	 */
	function gerar_duplicata($list_id="") {
		$id = empty($list_id) ? intval($_POST['id']) : $list_id;
		$url = URL.'mod/financeiro/receber/export/'.$this->empresa->uniqueid;
		
		$sql = "SELECT ";
		$sql.= "id,";
		$sql.= "doc_fatura,";
		$sql.= "valor_multa+valor_juros+valor_acrescimo AS acrescimo,";
		$sql.= "valor_desconto+valor_abatimento AS desconto,";
		$sql.= "valor_ctes,";
		$sql.= "vence_em,";
		$sql.= "nota_obs,";
		$sql.= "tipo_carteira,";
		$sql.= "devedor_razao_social,";
		$sql.= "devedor_cpf_cnpj,";
		$sql.= "devedor_endereco,";
		$sql.= "cliefat_obs_duplicata ";
		$sql.= "FROM view_contas_receber ";
		$sql.= "WHERE id IN(".$id.") ";
		$sql.= "AND tipo_carteira = 'BANCARIA' ";
		$sql.= "AND cliefat_status_cobranca = 'F'";
		$result = $this->query($sql); $files = array();
		while ($field = $this->fetch_object($result)) {
			$html = $this->pdf_default_header('FATURA CLIENTE '.$field->doc_fatura);
			$html.='<table style="width:100%;" align="right">';
			$html.='<tr><td style="width:100%; text-align:right; font-style:italic;">Segue abaixo a relação dos conhecimentos descriminados nessa fatura pelo nossos serviços prestados</td></tr>';
			$html.='</table>';
			
			$html.='<table style="width:100%;" align="left">';
			$html.='<tr><td style="width:100%; font-weight:bold; text-align:left;">DADOS PARA COBRANÇA</td></tr>';
			$html.='<tr><td style="wdith:100%; font-weight:bold; text-align:left;">'.$field->devedor_razao_social.'</td></tr>';
			$html.='<tr><td style="wdith:100%; text-align:left;">CNPJ/CPF: '.$field->devedor_cpf_cnpj.'</td></tr>';
			$html.='<tr><td style="wdith:100%; text-align:left;">'.$field->devedor_endereco.'</td></tr>';
			$html.='</table>';
			
			$html.='<table style="width:100%; margin-top:20px;">';
			#$html.='<tr><th colspan="5" style="font-weight:bold; text-decoration:underline; font-size:12px;">FATURAMENTO</th></tr>';
			$html.='<tr>';
			$html.='<th style="width:15%; font-weight:bold; text-align:center; font-size:12px;">CÓDIGO</th>';
			$html.='<th style="width:25%; font-weight:bold; text-align:center; font-size:12px;">CARTEIRA</th>';
			$html.='<th style="width:25%; font-weight:bold; text-align:center; font-size:12px;">VENCIMENTO</th>';
			$html.='<th style="width:35%; font-weight:bold; text-align:center; font-size:12px;">VALOR R$</th>';
			$html.='</tr>';
			
			$valor_liquido_receber = $field->valor_ctes + $field->acrescimo - $field->desconto;
			
			$html.='<tr style="background-color:'.BGCOLOR.';">';
			$html.='<td style="width:15%; font-weight:bold; text-align:right; font-size:12px; height:40px;"># '.$field->id.'</td>';
			$html.='<td style="width:25%; font-weight:bold; text-align:center; font-size:12px; height:40px;">'.$field->tipo_carteira.'</td>';
			$html.='<td style="width:25%; font-weight:bold; text-align:center; font-size:12px; height:40px;">'.date_convert($field->vence_em, 'd/m/Y').'</td>';
			$html.='<td style="width:35%; font-weight:bold; text-align:right; font-size:12px; height:40px;">'.float_to_money($valor_liquido_receber).'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td style="width:15%; height:40px; font-size:12px; font-weight:bold; text-align:center;" align="center">VALOR<br/>POR EXTENSO</td>';
			$html.='<td colspan="3" style="background-color:'.BGCOLOR.'; font-size:12px; height:40px; text-align:right; font-weight:bold;" align="right">'.valor_extenso($valor_liquido_receber).'</td>';
			$html.='</tr>';
			$html.='</table>';
			
			$html.='<table style="width:100%; margin-top:20px; text-align:right;" align="right">';
			$html.='<tr><td style="width:40%;"></td><td style="width:60%; height: 70px; border-bottom: 1px solid; text-align:right;" align="right"></td></tr>';
			$html.='<tr><td style="width:40%;"></td><td style="width:60%; text-align:center;" align="center">CARIMBO E ASSINATURA</td></tr>';
			$html.='<tr><td colspan="2">&nbsp;</td></tr>';
			$html.='<tr><td colspan="2" style="text-align:center;" align="center">Reconheço(emos) a exatidão desta <b>FATURA DE PRESTAÇÃO DE SERVIÇOS</b> na importância acima que pagarei(emos) à<br/><b>'.$this->empresa->emp_razao_social.'</b>, ou à sua ordem na praça e vencimento acima indicados.</td></tr>';
			$html.='</table>';
			
			if (!empty($field->cliefat_obs_duplicata)) {
				$html.='<p style="width:100%; margin-top:20px;">NOTA: '.$field->cliefat_obs_duplicata.'</p>';
			}
			if (!empty($field->nota_obs)) {
				$html.='<p style="width:100%; margin-top:20px;">NOTA: '.$field->nota_obs.'</p>';
			}
			
			$sql = "SELECT ";
			$sql.= "t1.cte_id,";
			$sql.= "t1.cte_serie,";
			$sql.= "t1.cte_chave,";
			$sql.= "t1.cte_minuta,";
			$sql.= "t1.cte_numero,";
			$sql.= "t1.cte_valor_total,";
			$sql.= "t1.cte_data_hora_emissao,";
			$sql.= "t1.cte_xml,";
			$sql.= "t1.cte_pdf ";
			$sql.= "FROM ctes AS t1 ";
			$sql.= "INNER JOIN ctes_faturados AS t2 ON t2.cte_id = t1.cte_id ";
			$sql.= "WHERE t2.cta_rec_id = ".$field->id." ";
			$sql.= "ORDER BY t1.cte_data_hora_emissao ASC";
			$query = $this->query($sql);
			$count = $this->num_rows($query);
			if ($count) {
				$html.='<table style="width:100%; margin-top:40px;">';
				$html.='<tr><th colspan="8" style="font-weight:bold; text-decoration:underline;">CONHECIMENTOS REFERENTE A FATURA DE Nº '.$field->doc_fatura.'</th></tr>';
				$html.='<tr><th colspan="8">&nbsp;</th></tr>';
				$html.='<tr>';
				$html.='<th style="width:5%; text-align:center;">SÉRIE</th>';
				$html.='<th style="width:10%; text-align:center;">NÚMERO</th>';
				$html.='<th style="width:10%; text-align:center;">MINUTA</th>';
				$html.='<th style="width:40%; text-align:center;">CHAVE</th>';
				$html.='<th style="width:10%; text-align:center;">EMITIDO EM</th>';
				$html.='<th style="width:15%; text-align:center;">VALOR R$</th>';
				$html.='<th style="width:5%; text-align:center;">XML</th>';
				$html.='<th style="width:5%; text-align:center;">PDF</th>';
				$html.='</tr>';
				$html.='<tr><th colspan="8" style="border-top:1px solid;">&nbsp;</th></tr>';
				$valor_total = 0;
				$cte_url = URL.'mod/conhecimentos/ctes/export/'.$this->empresa->uniqueid;
				while ($item = $this->fetch_object($query)) {
					if ($this->empresa->emp_tipo_emitente == 'ND') {
						$cte_pdfname = validate_filename('ME-'.$item->cte_id);
						$cte_pdfname.= '.pdf';
						$item->cte_pdf = $cte_url.'/'.$cte_pdfname.'?_dc='.now();
					}
					$item->cte_xml = is_url($item->cte_xml) ? '<a href="'.$item->cte_xml.'" target="_blank">ABRIR</a>' : 'N/D';
					$item->cte_pdf = is_url($item->cte_pdf) ? '<a href="'.$item->cte_pdf.'" target="_blank">ABRIR</a>' : 'N/D';
					
					$html.='<tr style="background-color:'.BGCOLOR.';">';
					$html.='<td style="width:5%; text-align:left;">'.$item->cte_serie.'</td>';
					$html.='<td style="width:10%; text-align:right;">'.$item->cte_numero.'</td>';
					$html.='<td style="width:10%; text-align:right;">'.$item->cte_minuta.'</td>';
					$html.='<td style="width:40%; text-align:center;">'.$item->cte_chave.'</td>';
					$html.='<td style="width:10%; text-align:right;">'.date_convert($item->cte_data_hora_emissao, 'd/m/Y').'</td>';
					$html.='<td style="width:15%; text-align:right;">'.float_to_money($item->cte_valor_total).'</td>';
					$html.='<td style="width:5%; text-align:center;">'.$item->cte_xml.'</td>';
					$html.='<td style="width:5%; text-align:center;">'.$item->cte_pdf.'</td>';
					$html.='</tr>';
					$valor_total += $item->cte_valor_total;
				}
				if ($count > 0) {
					$html.='<tr>';
					$html.='<th colspan="5" style="font-weight:bold;">SUB-TOTAL ('.$count.' conhecimentos)</th>';
					$html.='<th style="width:15%; font-weight:bold; text-align:right; border-top:1px solid;">'.float_to_money($valor_total).'</th>';
					$html.='<th colspan="2"></th>';
					$html.='</tr>';
					
					$html.='<tr>';
					$html.='<th colspan="5" style="font-weight:bold;">Acréscimos (Multa+Juros)</th>';
					$html.='<th style="width:15%; font-weight:bold; text-align:right;">'.float_to_money($field->acrescimo).'</th>';
					$html.='<th colspan="2"></th>';
					$html.='</tr>';
					
					$html.='<tr>';
					$html.='<th colspan="5" style="font-weight:bold;">Descontos (Abatimentos)</th>';
					$html.='<th style="width:15%; font-weight:bold; text-align:right;">'.float_to_money($field->desconto).'</th>';
					$html.='<th colspan="2"></th>';
					$html.='</tr>';
					
					$html.='<tr>';
					$html.='<th colspan="5" style="font-weight:bold;">TOTAL</th>';
					$html.='<th style="width:15%; font-weight:bold; text-align:right; border-top:1px solid;">'.float_to_money($valor_total+$field->acrescimo-$field->desconto).'</th>';
					$html.='<th colspan="2"></th>';
					$html.='</tr>';
					
				}
				$html.='</table>';
			}
			$this->free_result($query);
			
			$html.= $this->pdf_default_footer();
			
			$pdfname = encode_filename('DUPLICATA'.$field->id);
			$pdfname = validate_filename($pdfname);
			$pdfname.= '.pdf';
			
			$filename = '../export';
			if (!is_dir($filename)) mkdir($filename, 0777);
			$filename.= '/'.$this->empresa->uniqueid;
			if (!is_dir($filename)) mkdir($filename, 0777);
			$filename.= '/'.$pdfname;
			if (file_exists($filename)) {
				@unlink($filename);
			}
			
			try {
				$html2pdf = $this->html2pdf();
				$html2pdf->writeHTML($html);
				$html2pdf->Output($filename, 'F');
			} catch (HTML2PDF_exception $e) {
				$msg = "HTML2PDF ERROR\n";
				$msg.= $html;
				throw new ExtJSException($msg);
			}
			
			@chmod($filename, 0777);
			if (file_exists($filename)) {
				$sql = "UPDATE contas_receber SET ";
				$sql.= "pdf_duplicata = ".$this->escape($pdfname)." ";
				$sql.= "WHERE id = ".$field->id;
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
			$pdf_url = $url.'/'.$pdfname.'?_dc='.now();
			array_push($files, $pdf_url);
		}
		$this->free_result($result);
		
		if (is_string($id)) {
			return $files;
		} else {
			print json_encode(array('success'=>true,'pdf'=>$files[0]));
		}
	}
	function baixa_emlote() {
		$vencimento_em = $this->escape(trim($_POST['vencimento_em']), 'date');
		$vencimento_ate = $this->escape(trim($_POST['vencimento_ate']), 'date');
		$recebido_em = trim($_POST['recebido_em']);
		$sql = "UPDATE contas_receber SET ";
		$sql.= "valor_recebido = valor_original,";
		$sql.= "recebido_em = ".(empty($recebido_em) ? "vence_em" : $this->escape($recebido_em))." ";
		$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$sql.= "AND vence_em BETWEEN ".$vencimento_em." AND ".$vencimento_ate;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Enviar e-mail de cobrança para o cliente
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function email_cliente() {
		$filename = str_replace(URL, PATH, $_POST['filename']);
		if (!file_exists($filename)) {
			print json_encode(array('success'=>false,'msg'=>'Arquivo não encontrado, talvez tenha sido excluído por outro usuário na rede.'));
			return false;
		}
		
		$Mailer = new Mailer();
		$Mailer->to = $_POST['email_to'];
		$Mailer->cc = $_POST['email_cc'];
		$Mailer->bcc = $_POST['email_cco'];
		$Mailer->Subject = $_POST['email_subject'];
		$Mailer->message = $_POST['email_message'];
		
		$email_anexo = $_FILES['email_anexo']; $anexo = null;
		if (!empty($email_anexo['name'])) {
			if ($email_anexo["error"] > 0) {
				print json_encode(array('success'=>false,'msg'=>'Erro: #'.$email_anexo['error'].' - o arquivo parece estar corrompido.'));
				return false;
			}
			$anexo = PATH.'mod/financeiro/receber/temp';
			if (!is_dir($anexo)) {
				mkdir($anexo, 0777);
				chmod($anexo, 0777);
			}
			$anexo = $anexo.'/'.$email_anexo['name'];
			if (file_exists($anexo)) {
				@unlink($anexo);
			}
			if (move_uploaded_file($email_anexo['tmp_name'], $anexo)) {
				$Mailer->AddAttachment($anexo);
			}
		}
		
		$Mailer->AddAttachment($filename);
		$success = $Mailer->send();
		
		if ($success) {
			$sql = "UPDATE contas_receber SET email_enviado = 1 WHERE id = ".intval($_POST['id']);
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		
		if (!empty($anexo)) {
			@unlink($anexo);
		}
		
		print json_encode(array('success'=>$success));
	}
	/**
	 * Gerar relatório dos recebimentos
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function relatorio() {
		$periodo_inicial = trim($_POST['periodo_inicial']);
		$periodo_final = trim($_POST['periodo_final']);
		$status = trim($_POST['status']);
		
		$url = URL.'mod/financeiro/receber/export/'.$this->empresa->uniqueid;
		$total = (object) array('receber'=>0,'recebido'=>0);
		$subtotal = (object) array('receber'=>0,'recebido'=>0);
		$html = $this->pdf_default_header('RELATÓRIO CONTAS À RECEBER<br/>'.$status.' ('.$periodo_inicial.' - '.$periodo_final.')');
		
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
		$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
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
			
		$name = encode_filename('RELATÓRIO'.$this->empresa->emp_id);
		$name = validate_filename($name);
		
		$xlsname = $name.'.xls';
		$pdfname = $name.'.pdf';
		
		$path = '../export';
		if (!is_dir($path)) mkdir($path, 0777);
		$path.= '/'.$this->empresa->uniqueid;
		if (!is_dir($path)) mkdir($path, 0777);
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
	function export_doccob() {
		if (!$this->is_online()) {
			print json_encode(array('success'=>false,'logged'=>false,'msg'=>'Você ficou muito tempo sem usar o sistema, por questão de segurança sua sessão foi expirada.'));
			return false;
		}
		
		$clie_id = intval($_POST['clie_id']);
		$data_faturamento_i = $this->escape(trim($_POST['data_faturamento_i']), 'date');
		$data_faturamento_f = $this->escape(trim($_POST['data_faturamento_f']), 'date');
		
		$sql = "SELECT ";
		$sql.= "id,";
		$sql.= "LPAD(".$this->escape($this->empresa->emp_cnpj).", 14, '0') AS emp_cnpj,";
		$sql.= "RPAD(".$this->escape($this->empresa->emp_razao_social).", 40, ' ') AS emp_razao_social,";
		$sql.= "RPAD(".$this->escape($this->empresa->emp_nome_fantasia).", 35, ' ') AS remetente,";
		$sql.= "RPAD(devedor_razao_social, 35, ' ') AS destinatario,";
		$sql.= "doc_fatura,";
		$sql.= "valor_original,";
		$sql.= "valor_juros,";
		$sql.= "valor_desconto,";
		$sql.= "IF(situacao = 'EM COBRANCA', 'I', 'E') AS acao_documento,";
		$sql.= "emitido_em,";
		$sql.= "vence_em,";
		$sql.= "banco_numero,";
		$sql.= "RPAD(IFNULL(banco_nome, ''), 35, ' ') AS banco_nome,";
		$sql.= "LPAD(IFNULL(agencia, ''), 4, '0') AS agencia,";
		$sql.= "LPAD(IFNULL(digito_ver_agencia, ''), 1, ' ') AS digito_ver_agencia,";
		$sql.= "LPAD(IFNULL(conta_corrente, ''), 10, '0') AS conta_corrente,";
		$sql.= "RPAD(IFNULL(digito_ver_conta_corrente, ''), 2, ' ') digito_ver_conta_corrente ";
		$sql.= "FROM view_contas_receber ";
		$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$sql.= "AND clie_id = ".$clie_id." ";
		$sql.= "AND DATE(emitido_em) BETWEEN ".$data_faturamento_i." AND ".$data_faturamento_f." ";
		$sql.= "AND situacao != 'LIQUIDADO' ";
		$sql.= "ORDER BY emitido_em";
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
			
			$txt.="\r\n";
			
			$txt.= '350';
			$txt.= 'COBRA'.date("dmHi").'0';
			$txt.= str_repeat(" ", 153);
			
			$txt.="\r\n";
			
			$txt.= '351';
			$txt.= $field->emp_cnpj;
			$txt.= utf8_decode($field->emp_razao_social);
			$txt.= str_repeat(" ", 113);
			
			$txt.="\r\n";
			
			$txt.= '352';
			$txt.= str_pad($this->empresa->emp_sigla_cia, 10, " ");
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
			$txt.="\r\n";
			
			$s = "SELECT ";
			$s.= "t1.cte_id,";
			$s.= "t1.cte_serie,";
			$s.= "t1.cte_numero,";
			$s.= "t1.cte_valor_total,";
			$s.= "DATE(t1.cte_data_hora_emissao) AS cte_data_emissao,";
			$s.= "LPAD(t1.rem_cnpj, 14, '0') AS rem_cnpj,";
			$s.= "LPAD(t1.des_cnpj, 14, '0') AS des_cnpj ";
			$s.= "FROM view_ctes AS t1 ";
			$s.= "INNER JOIN ctes_faturados AS t2 ON t2.cte_id = t1.cte_id ";
			$s.= "WHERE t2.cta_rec_id = ".$field->id." ";
			$s.= "ORDER BY t1.cte_numero";
			//$this->debug($s);
			$q = $this->query($s);
			while ($item = $this->fetch_object($q)) {
				$item->cte_valor_total *= 100;
				
				$txt.= '353';
				$txt.= str_pad($this->empresa->emp_sigla_cia, 10, " "); 
				$txt.= str_pad($item->cte_serie, 5, "0", STR_PAD_LEFT);
				$txt.= str_pad($item->cte_numero, 12, "0", STR_PAD_LEFT);
				$txt.= str_pad($item->cte_valor_total, 15, "0", STR_PAD_LEFT);
				$txt.= date_convert($item->cte_data_emissao, 'dmY');
				$txt.= $item->rem_cnpj;
				$txt.= $item->des_cnpj;
				$txt.= $field->emp_cnpj;
				$txt.= str_repeat(" ", 75);
				$txt.= "\r\n";
				
				$s = "SELECT ";
				$s.= "cte_doc_serie,";
				$s.= "RIGHT(cte_doc_numero, 8) AS cte_doc_numero,";
				$s.= "cte_doc_data_emissao,";
				$s.= "cte_doc_peso_total,";
				$s.= "cte_doc_valor_nota ";
				$s.= "FROM ctes_documentos ";
				$s.= "WHERE cte_id = ".$item->cte_id;
				//$this->debug($s);
				$r = $this->query($s);
				while ($o = $this->fetch_object($r)) {
					$o->cte_doc_peso_total *= 100;
					$o->cte_doc_valor_produtos *= 100;
					
					$txt.='354';
					$txt.= $o->cte_doc_serie;
					$txt.= $o->cte_doc_numero;
					$txt.= date_convert($o->cte_doc_data_emissao, 'dmY');
					$txt.= str_pad($o->cte_doc_peso_total, 7, "0", STR_PAD_LEFT);
					$txt.= str_pad(integerval($o->cte_doc_valor_nota), 15, "0", STR_PAD_LEFT);
					$txt.= $item->rem_cnpj;
					$txt.= str_repeat(" ", 112);
					$txt.= "\r\n";
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
		if (!is_dir($path.'/')) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		$filename = encode_filename('doccob'.$clie_id).'.txt';
		$fileurl = URL.'mod/financeiro/receber/export/'.$filename;
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