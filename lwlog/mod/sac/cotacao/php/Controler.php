<?php
class Controler extends App {
	/**
	 * Consultar cotação. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_cotacao() {
		$p = $this->get_sql_param();
		$url = URL.'mod/sac/cotacao/export';
		
		$filter	= "WHERE 1";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_cotacoes ";
		$sql.= $filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if ($p->limit) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			$field->pdf = $url.'/'.$field->pdf;
			array_push($list, $field);
		}
		
		$this->free_result($query);
		
		$sql = "SELECT COUNT(id) AS total FROM view_cotacoes ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Alterar status da cotação
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function update_status() {
		$sql = "UPDATE cotacoes SET ";
		$sql.= "status = ".$this->escape(trim($_POST['status']), 'string')." ";
		$sql.= "WHERE id IN (".trim($_POST['id']).")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Excluir cotação
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_cotacao() {
		$records = json_decode($_POST['records']);
		foreach ($records as $record) {
			$sql = "DELETE FROM cotacoes WHERE id = ".$record->id;
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
			@unlink('../export/'.$this->empresa->uniqueid.'/'.$record->pdf);
		}
		print json_encode(array('success'=>true));
	}
	/**
	 * Salvar cotação e gerar PDF
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_cotacao() {
		$clie_id = intval($_POST['clie_tomador_id']);
		$cid_id_origem = intval($_POST['cid_id_origem']);
		$cid_id_destino = intval($_POST['cid_id_destino']);
		$cid_id_passagem = intval($_POST['redespacho_id']);
		$clie_tom_tabela = $this->escape($_POST['clie_tom_tabela'], 'string');
		$cte_valor_carga = $this->escape($_POST['cte_valor_carga'], 'decimal');
		$cte_peso_taxado = $this->escape($_POST['cte_peso_taxado'], 'decimal');
		$cte_valor_total = $this->escape($_POST['cte_valor_total'], 'decimal');
		$observacoes = trim($_POST['observacoes']);
		$exibir_calculo_pdf = parse_boolean($_POST['exibir_calculo_pdf']);
		
		$origem = trim($_POST['origem']);
		$destino = trim($_POST['destino']);
		$passagem = trim($_POST['passagem']);
		$produto = trim($_POST['produto']);
		
		$produtos = json_decode($_POST['produtos']);
		$componentes = json_decode($_POST['componentes']);
		
		$tomador = json_decode($_POST['tomador']);
		if (is_array($tomador)) {
			$tomador = $tomador[0];
		}
		
		$url = URL.'mod/sac/cotacao/export';
		$total = (object) array('volumes'=>0,'peso_bruto'=>0,'peso_cubado'=>0,'peso_bc'=>0);
		$html = $this->pdf_default_header('COTAÇÃO '.date('dm/y-Hi'));
		
		$html.='<table style="width:100%;">';
		$html.='<tr><td style="width:100%; font-weight:bold;">À</td></tr>';
		$html.='<tr><td style="width:100%; font-weight:bold;">'.$tomador->clie_razao_social.'</td></tr>';
		$html.='<tr><td style="width:100%;">'.(empty($tomador->clie_cnpj) ? 'CPF: '.$tomador->clie_cpf : 'CNPJ: '.$tomador->clie_cnpj).'</td></tr>';
		$html.='<tr><td style="width:100%;">'.$tomador->clie_logradouro.', '.$tomador->clie_numero.' '.$tomador->clie_complemento.'</td></tr>';
		$html.='<tr><td style="width:100%;">'.$tomador->clie_cep.' '.$tomador->clie_bairro.'</td></tr>';
		$html.='<tr><td style="width:100%;">'.$tomador->cid_municipio.'/'.$tomador->cid_uf.'</td></tr>';
		$html.='<tr><td style="width:100%; font-weight:bold;">'.$tomador->clie_fone1.' '.$tomador->clie_fone2.'</td></tr>';
		$html.='</table>';
		
		$html.='<table style="width:100%; margin-top:20px;">';
		$html.='<tr>';
		$html.='<th style="font-weight:bold; text-align:center; width:35%;">ORIGEM</th>';
		$html.='<th style="font-weight:bold; text-align:center; width:30%;">PASSAGEM</th>';
		$html.='<th style="font-weight:bold; text-align:center; width:35%;">DESTINO</th>';
		$html.='</tr>';
		$html.='<tr style="background-color:'.BGCOLOR.';">';
		$html.='<th style="font-weight:bold; text-align:left; width:35%;">'.$origem.'</th>';
		$html.='<th style="font-weight:bold; text-align:left; width:30%;">'.$passagem.'</th>';
		$html.='<th style="font-weight:bold; text-align:left; width:35%;">'.$destino.'</th>';
		$html.='</tr>';
		$html.='</table>';
		
		$html.='<table style="width:100%; margin-top:20px;">';
		$html.='<tr><th colspan="7" style="font-weight:bold; text-decoration:underline;">QUANTIDADES DA CARGA E DIMENSÕES/CUBAGEM</th></tr>';
		$html.='<tr><td colspan="7" style="height:5px;"></td></tr>';
		$html.='<tr>';
		$html.='<th style="width:10%;">EMBALAGEM</th>';
		$html.='<th style="width:15%;">VOLUMES</th>';
		$html.='<th style="width:15%;">PESO BRUTO (kg)</th>';
		$html.='<th style="width:15%;">MEDIDAS</th>';
		$html.='<th style="width:15%;">CUBAGEM (m³)</th>';
		$html.='<th style="width:15%;">PESO CUBADO (kg)</th>';
		$html.='<th style="width:15%;">PESO TAXADO (kg)</th>';
		$html.='</tr>';
		$html.='<tr><td colspan="9" style="border-top:1px solid;"></td></tr>';
		foreach ($produtos as $record) {
			$html.='<tr style="background-color:'.BGCOLOR.';">';
			$html.='<td style="width:10%; text-align:left;">'.$record->cte_dim_tipo_embalagem.'</td>';
			$html.='<td style="width:15%; text-align:center;">'.$record->cte_dim_volumes.'</td>';
			$html.='<td style="width:15%; text-align:right;">'.float_to_decimal($record->cte_dim_peso_bruto, 1).'</td>';
			$html.='<td style="width:15%; text-align:right;">'.float_to_decimal($record->cte_dim_cumprimento, 1).'x'.float_to_decimal($record->cte_dim_altura, 1).'x'.float_to_decimal($record->cte_dim_largura, 1).'</td>';
			$html.='<td style="width:15%; text-align:right;">'.float_to_decimal($record->cte_dim_cubagem_m3, 1).'</td>';
			$html.='<td style="width:15%; text-align:right;">'.float_to_decimal($record->cte_dim_peso_cubado, 1).'</td>';
			$html.='<td style="width:15%; text-align:right;">'.float_to_decimal($record->cte_dim_peso_taxado, 1).'</td>';
			$html.='</tr>';
			$total->volumes += $record->cte_dim_volumes;
			$total->peso_bruto += $record->cte_dim_peso_bruto;
			$total->peso_cubado += $record->cte_dim_peso_cubado;
			$total->peso_bc += $record->cte_dim_peso_taxado;
		}
		$html.='<tr>';
		$html.='<th style="width:10%; font-weight:bold; font-size:12px;">TOTAL</th>';
		$html.='<td style="width:15%; font-weight:bold; font-size:12px; text-align:right; border-top:1px solid;">'.$total->volumes.'</td>';
		$html.='<td style="width:15%; font-weight:bold; font-size:12px; text-align:right; border-top:1px solid;">'.float_to_decimal($total->peso_bruto, 1).'</td>';
		$html.='<td colspan="2"></td>';
		$html.='<td style="width:15%; font-weight:bold; font-size:12px; text-align:right; border-top:1px solid;">'.float_to_decimal($total->peso_cubado, 1).'</td>';
		$html.='<td style="width:15%; font-weight:bold; font-size:12px; text-align:right; border-top:1px solid;">'.float_to_decimal($total->peso_bc, 1).'</td>';
		$html.='</tr>';
		$html.='</table>';
		
		$html.='<table style="width:100%; margin-top:20px;">';
		$html.='<tr>';
		$html.='<th style="width:50%; font-weight:bold; text-align:center;">PRODUTO PREDOMINANTE</th>';
		$html.='<th style="width:25%; font-weight:bold; text-align:center;">VALOR CARGA</th>';
		$html.='<th style="width:25%; font-weight:bold; text-align:center;">PEXO TAXADO</th>';
		$html.='</tr>';
		$html.='<tr style="background-color:'.BGCOLOR.';">';
		$html.='<th style="width:50%; font-weight:bold; text-align:center;">'.$produto.'</th>';
		$html.='<th style="width:25%; font-weight:bold; text-align:center;">R$ '.float_to_money($cte_valor_carga).'</th>';
		$html.='<th style="width:25%; font-weight:bold; text-align:center;">'.float_to_decimal($total->peso_bc, 1).' kg</th>';
		$html.='</tr>';
		$html.='</table>';
		
		if ($exibir_calculo_pdf) {
			$fullspan = (LAYOUT_HTML_CONTENT == 1) ? 4 : 2;
			$html.='<table style="width:100%; margin-top:20px;">';
			$html.='<tr><th colspan="'.$fullspan.'" style="font-weight:bold; text-decoration:underline;">COMPONENTES DO VALOR DA PRESTAÇÃO</th></tr>';
			$html.='<tr><td colspan="'.$fullspan.'" style="height:10px;"></td></tr>';
			$html.='<tr>';
			if (LAYOUT_HTML_CONTENT == 1) {
				$html.='<th style="width:15%; font-weight:bold;">COMPONENTE</th>';
				$html.='<th style="width:15%; font-weight:bold;">VALOR CALCULADO</th>';
				$html.='<th style="width:15%; font-weight:bold;">VALOR TARIFA/KG</th>';
				$html.='<th style="width:55%; font-weight:bold;">TIPO TARIFA/DESCRIÇÃO</th>';
			} else {
				$html.='<th style="width:80%; font-weight:bold;">COMPONENTE</th>';
				$html.='<th style="width:20%; font-weight:bold;">VALOR CALCULADO</th>';
			}
			$html.='</tr>';
			$html.='<tr><td colspan="'.$fullspan.'" style="border-top:1px solid;"></td></tr>';
			foreach ($componentes as $record) {
				$html.='<tr style="background-color:'.BGCOLOR.';">';
				if (LAYOUT_HTML_CONTENT == 1) {
					$html.='<td style="width:15%; text-align:left;">'.$record->cc_titulo.'</td>';
					$html.='<td style="width:15%; text-align:right;">'.float_to_money($record->ccc_valor).'</td>';
					$html.='<td style="width:15%; text-align:right;">'.float_to_money($record->ccc_valor_tarifa_kg).'</td>';
					$html.='<td style="width:55%; text-align:right;">'.$record->ccc_tipo_tarifa.'</td>';
				} else {
					$html.='<td style="width:80%; text-align:left;">'.$record->cc_titulo.'</td>';
					$html.='<td style="width:20%; text-align:right;">'.float_to_money($record->ccc_valor).'</td>';
				}
				$html.='</tr>';
			}
			$html.='</table>';
		}
		
		$html.='<table style="width:100%; margin-top:20px;">';
		$html.='<tr>';
		$html.='<th style="width:70%; text-align:right; font-weight:bold; font-size:12px;">CÓDIGO DA SITUAÇÃO TRIBUTÁRIA</th>';
		$html.='<th style="width:30%; text-align:right; font-weight:bold; font-size:12px;">'.trim($_POST['cte_codigo_sit_tributaria']).'</th>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<th style="width:70%; text-align:right; font-weight:bold; font-size:12px;">PERCENTUAL DA REDUÇÃO DA BC</th>';
		$html.='<th style="width:30%; text-align:right; font-weight:bold; font-size:12px;">'.trim($_POST['cte_perc_reduc_bc']).'</th>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<th style="width:70%; text-align:right; font-weight:bold; font-size:12px;">ALÍQUOTA DO ICMS</th>';
		$html.='<th style="width:30%; text-align:right; font-weight:bold; font-size:12px;">'.trim($_POST['cte_aliquota_icms']).'</th>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<th style="width:70%; text-align:right; font-weight:bold; font-size:12px;">VALOR CRÉDITO OUTORGADO/PRESUMIDO</th>';
		$html.='<th style="width:30%; text-align:right; font-weight:bold; font-size:12px;">'.trim($_POST['cte_valor_cred_outorgado']).'</th>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<th style="width:70%; text-align:right; font-weight:bold; font-size:12px;">VALOR DA BC DO ICMS</th>';
		$html.='<th style="width:30%; text-align:right; font-weight:bold; font-size:12px;">'.trim($_POST['cte_valor_bc']).'</th>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<th style="width:70%; text-align:right; font-weight:bold; font-size:12px;">VALOR DO ICMS</th>';
		$html.='<th style="width:30%; text-align:right; font-weight:bold; font-size:12px;">'.trim($_POST['cte_valor_icms']).'</th>';
		$html.='</tr>';
		$html.='</table>';
		
		if (!empty($observacoes)) {
			$html.='<p style="font-weight:bold; font-size:12px; text-decoration:underline;">OBSERVAÇÕES</p>';
			$html.='<p style="font-weight:bold; font-size:12px;">';
			$html.= $observacoes;
			$html.='</p>';
		}
		
		$html.='<table style="margin-top:20px; width:100%;">';
		$html.='<tr>';
		$html.='<th style="width:30%; text-align:center; font-size:14px; font-weight:bold;">VALOR TOTAL DO DESCONTO</th>';
		$html.='<th style="width:70%; text-align:center; font-size:14px; font-weight:bold;">VALOR TOTAL DA PRESTRAÇÃO DO SERVIÇO INCLUINDO DESCONTO</th>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<th style="width:30%; text-align:right; font-size:16px; font-weight:bold; color:green;">'.float_to_money($_POST['cte_valor_total_desconto']).'</th>';
		$html.='<th style="width:70%; text-align:right; font-size:16px; font-weight:bold; color:blue;">'.float_to_money($cte_valor_total).'</th>';
		$html.='</tr>';
		$html.='</table>';
		
		$html.='<p>';
		$html.='<ul>';
		$html.='<li>1. Cubagem:';
		$html.='<ul>';
		$html.='<li>a. Aéreo: 167kg/m³</li>';
		$html.='<li>b. Rodoviário: 300kg/m³</li>';
		$html.='<li>c. Na falta da informação das dimensões, divergências de medidas serão aplicadas as razões acima.</li>';
		$html.='</ul>';
		$html.='</li>';
		$html.='<li>2. Impossibilidade de Entrega:';
		$html.='<ul>';
		$html.='<li>a. Será cobrado valor adicional caso a entrega não seja efetuada por motivo de recusa, etc..</li>';
		$html.='<li>b. Se houver necessidade de retorno do material a responsabilidade do frete é do remetente.</li>';
		$html.='</ul>';
		$html.='</li>';
		$html.='</ul>';
		$html.='</p>';
		
		$html.= $this->pdf_default_footer();
		
		$name = encode_filename('COTAÇÃO'.now());
		$name = validate_filename($name);
		
		$pdfname = $name.'.pdf';
		
		$path = '../export';
		if (!is_dir($path)) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		$pdf_filename = $path.'/'.$pdfname;
		if (file_exists($pdf_filename)) {
			@unlink($pdf_filename);
		}
		
		try {
			$html2pdf = $this->html2pdf();
			$html2pdf->writeHTML($html);
			$html2pdf->Output($pdf_filename, 'F');
		} catch (HTML2PDF_exception $e) {
			$msg = "HTML2PDF ERROR\n";
			$msg.= $html;
			throw new ExtJSException($msg);
		}
		
		@chmod($pdf_filename, 0777);
		
		$pdf_url = $url.'/'.$pdfname.'?_dc='.now();
		
		$sql = "INSERT INTO cotacoes SET ";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "cid_id_origem = ".$cid_id_origem.",";
		$sql.= "cid_id_destino = ".$cid_id_destino.",";
		if ($cid_id_passagem > 0) {
			$sql.= "cid_id_passagem = ".$cid_id_passagem.",";
		}
		$sql.= "tabela = ".$clie_tom_tabela.",";
		$sql.= "cotado_em = NOW(),";
		$sql.= "volumes = ".$total->volumes.",";
		$sql.= "peso_bruto = ".$total->peso_bruto.",";
		$sql.= "peso_cubado = ".$total->peso_cubado.",";
		$sql.= "peso_bc = ".$total->peso_bc.",";
		$sql.= "valor_carga = ".$cte_valor_carga.",";
		$sql.= "valor_total = ".$cte_valor_total.",";
		$sql.= "pdf = ".$this->escape($pdfname, 'string').",";
		$sql.= "observacoes = ".$this->escape($observacoes, 'string');
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		print json_encode(array('success'=>true,'url'=>$pdf_url));
	}
}
?>