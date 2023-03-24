<?php
class Controler extends App {
	/**
	 * Consultar CTe. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_coleta() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$filter.= "AND cte_situacao = 'DIGITAÇÃO' ";
		$filter.= "AND cte_tipo_coleta = 1 ";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_ctes ";
		$sql.= $filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if ($p->limit) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			$pdfname = encode_filename('COLETA'.$field->id);
			$pdfname = validate_filename($pdfname);
			$pdfname.= '.pdf';
			$field->coleta_pdf = URL.'mod/sac/coleta/export/'.$this->empresa->uniqueid.'/'.$pdfname;
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
	 * Salvar CT-e no banco de dados
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_coleta() {
		$cte_id = intval($_POST['cte_id']);
		$cid_id_origem = intval($_POST['cid_id_origem']);
		$cid_id_destino = intval($_POST['cid_id_destino']);
		$clie_remetente_id = intval($_POST['clie_remetente_record_id']);
		$clie_destinatario_id = intval($_POST['clie_destinatario_record_id']);
		$clie_tomador_id = intval($_POST['clie_tomador_record_id']);
		$cte_minuta = intval($_POST['cte_minuta']);
		$cte_data_hora_emissao = $this->escape(date('Y-m-d H:i:s'));
		$cte_modal = $this->empresa->emp_modal == 'Aereo' ? 2 : 1;
		$cte_emissor = $this->escape($this->usuario->user_login);
		$prod_id = intval($_POST['prod_id']); if (!$prod_id) $prod_id = "NULL";
		$cte_outras_carac_carga = $this->escape(trim($_POST['cte_outras_carac_carga']));
		$cte_valor_carga = $this->escape(trim($_POST['cte_valor_carga']), 'decimal');
		$cte_tipo_doc_anexo = intval($_POST['cte_tipo_doc_anexo']);
		
		$cte_tomador = 4; #Outros
		$cte_remetente = 1; #Com Remetente
		$cte_destinatario = 1; #Com Destinatário
		if ($clie_tomador_id == $clie_remetente_id) {
			$cte_tomador = 0; #Pagador é o Remetente
		} elseif ($clie_tomador_id == $clie_destinatario_id) {
			$cte_tomador = 3; #Pagador é o Destinatário
		}
		
		$ctes_documentos = json_decode($_POST['ctes_documentos']);
		$ctes_dimensoes = json_decode($_POST['ctes_dimensoes']);
		
		$sql = ($cte_id > 0) ? "UPDATE ctes SET " : "INSERT INTO ctes SET emp_id = ".$this->empresa->emp_id.",";
		$sql.= "cte_situacao = 'DIGITAÇÃO',";
		$sql.= "cte_tipo_doc_anexo = ".$cte_tipo_doc_anexo.",";
		$sql.= "clie_remetente_id = ".$clie_remetente_id.",";
		$sql.= "clie_destinatario_id = ".$clie_destinatario_id.",";
		$sql.= "clie_tomador_id = ".$clie_tomador_id.",";
		$sql.= "cid_id_origem = ".$cid_id_origem.",";
		$sql.= "cid_id_destino = ".$cid_id_destino.",";
		$sql.= "prod_id = ".$prod_id.",";
		$sql.= "cte_minuta = ".$cte_minuta.",";
		$sql.= "cte_data_hora_emissao = ".$cte_data_hora_emissao.",";
		$sql.= "cte_remetente = ".$cte_remetente.",";
		$sql.= "cte_destinatario = ".$cte_destinatario.",";
		$sql.= "cte_tomador = ".$cte_tomador.",";
		$sql.= "cte_modal = ".$cte_modal.",";
		$sql.= "cte_outras_carac_carga = ".$cte_outras_carac_carga.",";
		$sql.= "cte_valor_carga = ".$cte_valor_carga.",";
		$sql.= "cte_tipo_coleta = 1 ";
		$sql.= ($cte_id > 0) ? "WHERE cte_id = ".$cte_id : "";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$cte_id) {
			$cte_id = $this->insert_id();
		}
		
		$sql = "DELETE FROM ctes_documentos WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_documentos)) {
			foreach ($ctes_documentos as $field) {
				$sql = "INSERT INTO ctes_documentos SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cte_doc_serie = ".$this->escape($field->cte_doc_serie).",";
				$sql.= "cte_doc_data_emissao = ".$this->escape($field->cte_doc_data_emissao, 'date').",";
				$sql.= "cte_doc_numero = ".$this->escape($field->cte_doc_numero, 'string').",";
				$sql.= "cte_doc_cfop = ".$this->escape($field->cte_doc_cfop).",";
				$sql.= "cte_doc_modelo = ".$this->escape($field->cte_doc_modelo).",";
				$sql.= "cte_doc_volumes = ".$this->escape($field->cte_doc_volumes).",";
				$sql.= "cte_doc_bc_icms = ".$this->escape($field->cte_doc_bc_icms, 'decimal').",";
				$sql.= "cte_doc_valor_icms = ".$this->escape($field->cte_doc_valor_icms, 'decimal').",";
				$sql.= "cte_doc_bc_icms_st = ".$this->escape($field->cte_doc_bc_icms_st, 'decimal').",";
				$sql.= "cte_doc_valor_icms_st = ".$this->escape($field->cte_doc_valor_icms_st, 'decimal').",";
				$sql.= "cte_doc_peso_total = ".$this->escape($field->cte_doc_peso_total, 'decimal').",";
				$sql.= "cte_doc_pin = ".$this->escape($field->cte_doc_pin).",";
				$sql.= "cte_doc_valor_produtos = ".$this->escape($field->cte_doc_valor_produtos, 'deccimal').",";
				$sql.= "cte_doc_valor_nota = ".$this->escape($field->cte_doc_valor_nota, 'decimal').",";
				$sql.= "cte_doc_chave_nfe = ".$this->escape($field->cte_doc_chave_nfe, 'string').",";
				$sql.= "cte_doc_tipo_doc = ".$this->escape($field->cte_doc_tipo_doc).",";
				$sql.= "cte_doc_descricao = ".$this->escape($field->cte_doc_descricao);
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}
		
		$sql = "DELETE FROM ctes_dimensoes WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_dimensoes)) {
			foreach ($ctes_dimensoes as $field) {
				$sql = "INSERT INTO ctes_dimensoes SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cte_dim_tipo_embalagem = ".$this->escape($field->cte_dim_tipo_embalagem).",";
				$sql.= "cte_dim_volumes = ".$this->escape($field->cte_dim_volumes).",";
				$sql.= "cte_dim_peso_bruto = ".$this->escape($field->cte_dim_peso_bruto, 'decimal').",";
				$sql.= "cte_dim_cumprimento = ".$this->escape($field->cte_dim_cumprimento, 'decimal').",";
				$sql.= "cte_dim_altura = ".$this->escape($field->cte_dim_altura, 'decimal').",";
				$sql.= "cte_dim_largura = ".$this->escape($field->cte_dim_largura, 'decimal').",";
				$sql.= "cte_dim_cubagem_m3 = ".$this->escape($field->cte_dim_cubagem_m3, 'decimal').",";
				$sql.= "cte_dim_peso_cubado = ".$this->escape($field->cte_dim_peso_cubado, 'decimal').",";
				$sql.= "cte_dim_peso_taxado = ".$this->escape($field->cte_dim_peso_taxado, 'decimal').",";
				$sql.= "cte_dim_info_manuseio = ".$this->escape($field->cte_dim_info_manuseio);
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}
		
		$pdf = $this->gerar_pdf_coleta($cte_id);
		print json_encode(array('success'=>true, 'cte_id'=>$cte_id, 'pdf'=>$pdf));
	}
	/**
	 * Excluir CT-e e suas dependências
	 * @remotable
	 * @access public
	 * @return outpup (json)
	 */
	function delete_coleta() {
		$cte_id = trim($_POST['cte_id']);
		$sql = "DELETE FROM ctes WHERE cte_id IN (".$cte_id.") ";
		$sql.= "AND cte_tipo_coleta = 1 ";
		$sql.= "AND cte_situacao = 'DIGITAÇÃO'";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success" => $this->affected_rows() > 0));
	}
	/**
	 * Gerar PDF da Coleta
	 * @access private
	 * @param int $cte_id
	 * @return string $filename
	 */
	private function gerar_pdf_coleta($cte_id) {
		$sql = "SELECT * FROM view_ctes WHERE cte_id = ".$cte_id;
		$query = $this->query($sql);
		$field = $this->fetch_object($query);
		$this->free_result($query);
		
		$html = $doc_html = $cub_html = '';
		
		$sql = "SELECT * FROM ctes_documentos WHERE cte_id = ".$cte_id;
		$query = $this->query($sql);
		if ($this->num_rows($query)) {
			$doc_html.='<table cellpadding="5" cellspacing="5" style="width:100%; margin-top:10px;">';
			$doc_html.='<tr><th style="width:100%; font-weight:bold; font-size:14px; text-align:center;">DOCUMENTOS</th></tr>';
			$doc_html.='</table>';
			$doc_html.='<table cellpadding="5" cellspacing="0" style="border:1px solid; width:100%;">';
			$doc_html.='<tr>';
			$doc_html.='<th style="width:10%; text-align:center; border-right: 1px solid;">VOLUMES</th>';
			$doc_html.='<th style="width:10%; text-align:center; border-right: 1px solid;">PESO (kg)</th>';
			$doc_html.='<th style="width:50%; text-align:center; border-right: 1px solid;">DESCRIÇÃO</th>';
			$doc_html.='<th style="width:10%; text-align:center; border-right: 1px solid;">NÚMERO</th>';
			$doc_html.='<th style="width:20%; text-align:center;">VALOR (R$)</th>';
			$doc_html.='</tr>';
			$total = (object) array('volume'=>0,'peso'=>0,'valor'=>0);
			while ($item = $this->fetch_object($query)) {
				if (empty($item->cte_doc_descricao)) {
					$item->cte_doc_descricao = $field->produto_predominante;
				}
				$doc_html.='<tr>';
				$doc_html.='<td style="text-align:center; border-top:1px solid; border-right: 1px solid;">'.$item->cte_doc_volumes.'</td>';
				$doc_html.='<td style="text-align:right; border-top:1px solid; border-right: 1px solid;">'.float_to_decimal($item->cte_doc_peso_total, 1).'</td>';
				$doc_html.='<td style="border-right: 1px solid; border-top:1px solid;">'.$item->cte_doc_descricao.'</td>';
				$doc_html.='<td style="text-align:center; border-top:1px solid; border-right: 1px solid;">'.$item->cte_doc_numero.'</td>';
				$doc_html.='<td style="text-align:right; border-top:1px solid;">'.float_to_money($item->cte_doc_valor_nota).'</td>';
				$doc_html.='</tr>';
				$total->volume += $item->cte_doc_volumes;
				$total->peso += $item->cte_doc_peso_total;
				$total->valor += $item->cte_doc_valor_nota;
			}
			$doc_html.='<tr>';
			$doc_html.='<th style="font-weight:bold; text-align:center; border-top:1px solid; border-right:1px solid;">'.$total->volume.'</th>';
			$doc_html.='<th style="font-weight:bold; text-align:right; border-top:1px solid; border-right:1px solid;">'.float_to_decimal($total->peso, 1).'</th>';
			$doc_html.='<th style="font-weight:bold; text-align:right; border-top:1px solid;" colspan="3">'.float_to_money($total->valor).'</th>';
			$doc_html.='</tr>';
			$doc_html.='</table>';
		}
		$this->free_result($query);
		
		$sql = "SELECT * FROM ctes_dimensoes WHERE cte_id = ".$cte_id;
		$query = $this->query($sql);
		if ($this->num_rows($query)) {
			$cub_html.='<table cellpadding="5" cellspacing="5" style="width:100%; margin-top:10px;">';
			$cub_html.='<tr><th style="width:100%; font-weight:bold; font-size:14px; text-align:center;">CUBAGENS</th></tr>';
			$cub_html.='</table>';
			$cub_html.='<table cellpadding="5" cellspacing="0" style="border:1px solid; width:100%;">';
			$cub_html.='<tr>';
			$cub_html.='<th style="width:15%; text-align:center; border-right: 1px solid;">EMBALAGEM</th>';
			$cub_html.='<th style="width:10%; text-align:center; border-right: 1px solid;">VOLUMES</th>';
			$cub_html.='<th style="width:20%; text-align:center; border-right: 1px solid;">PESO BRUTO (kg)</th>';
			$cub_html.='<th style="width:15%; text-align:center; border-right: 1px solid;">CUBAGEM (m³)</th>';
			$cub_html.='<th style="width:20%; text-align:center; border-right: 1px solid;">PESO CUBADO (kg)</th>';
			$cub_html.='<th style="width:20%; text-align:center;">PESO TAXADO (kg)</th>';
			$cub_html.='</tr>';
			$total = (object) array('volume'=>0,'pesoBruto'=>0,'cubagem'=>0,'pesoCubado'=>0,'pesoTaxado'=>0);
			while ($item = $this->fetch_object($query)) {
				$cub_html.='<tr>';
				$cub_html.='<td style="text-align:center; border-top:1px solid; border-right: 1px solid;">'.$item->cte_dim_tipo_embalagem.'</td>';
				$cub_html.='<td style="text-align:center; border-top:1px solid; border-right: 1px solid;">'.$item->cte_dim_volumes.'</td>';
				$cub_html.='<td style="text-align:right; border-top:1px solid; border-right: 1px solid;">'.float_to_decimal($item->cte_dim_peso_bruto, 1).'</td>';
				$cub_html.='<td style="text-align:right; border-top:1px solid; border-right: 1px solid;">'.float_to_decimal($item->cte_dim_cubagem_m3).'</td>';
				$cub_html.='<td style="text-align:right; border-top:1px solid; border-right: 1px solid;">'.float_to_decimal($item->cte_dim_peso_cubado, 1).'</td>';
				$cub_html.='<td style="text-align:right; border-top:1px solid;">'.float_to_decimal($item->cte_dim_peso_taxado, 1).'</td>';
				$cub_html.='</tr>';
				$total->volume += $item->cte_dim_volumes;
				$total->pesoBruto += $item->cte_dim_peso_bruto;
				$total->cubagem += $item->cte_dim_cubagem_m3;
				$total->pesoCubado += $item->cte_dim_peso_cubado;
				$total->pesoTaxado += $item->cte_dim_peso_taxado;
			}
			$cub_html.='<tr>';
			$cub_html.='<th style="border-top:1px solid; border-right:1px solid;">&nbsp;</th>';
			$cub_html.='<th style="text-align:center; border-top:1px solid; border-right:1px solid;">'.$total->volume.'</th>';
			$cub_html.='<th style="text-align:right; border-top:1px solid; border-right:1px solid;">'.float_to_decimal($total->pesoBruto, 1).'</th>';
			$cub_html.='<th style="text-align:right; border-top:1px solid; border-right:1px solid;">'.float_to_decimal($total->cubagem).'</th>';
			$cub_html.='<th style="text-align:right; border-top:1px solid; border-right:1px solid;">'.float_to_decimal($total->pesoCubado, 1).'</th>';
			$cub_html.='<th style="text-align:right; border-top:1px solid;">'.float_to_decimal($total->pesoTaxado, 1).'</th>';
			$cub_html.='</tr>';
			$cub_html.='</table>';
		}
		$this->free_result($query);
		
		for ($i=1; $i<=3; $i++) {
			$html.= $this->pdf_style();
			$html.='<page backtop="8mm" backbottom="0mm">';
			$html.='<page_header>';
			$html.='<p style="font-size:10px; text-align:right;">[[page_cu]]/[[page_nb]]</p>';
			$html.='</page_header>';
			
			$html.='<table cellpadding="5" cellspacing="0" style="border:1px solid; width:100%;">';
			$html.='<tr>';
			$html.='<td align="center" style="width:20%; text-align:center; vertical-align:middle; border-right:1px solid;"><img style="width:100%; height:auto;" src="'.$this->empresa->logo_url.'" /></td>';
			$html.='<td style="width:60%; text-align:center; vertical-align:middle; border-right:1px solid;">';
			$html.='<font style="font-weight:bold; font-size:16px;">'.$this->empresa->emp_razao_social.'</font>';
			$html.='<br/>'.$this->empresa->emp_logradouro.', '.$this->empresa->emp_numero.' - '.$this->empresa->emp_bairro.' - CEP: '.$this->empresa->emp_cep.' - '.$this->empresa->cid_municipio.' / '.$this->empresa->cid_uf;
			$html.='<br/>FONES: '.$this->empresa->emp_fone1.' / '.$this->empresa->emp_fone2; 
			$html.='<br/>'.$this->empresa->emp_email_comercial;
			$html.='</td>';
			$html.='<td style="width:20%; text-align:center; vertical-align:middle;">MINUTA PARA DESPACHO Nº<p style="color:red; font-size:16px;">'.$i.'º VIA<br/>'.$field->cte_minuta.'</p>';
			$html.='</td>';
			$html.='</tr>';
			$html.='<tr><td colspan="3" style="border-top:1px solid;"></td></tr>';
			$html.='<tr>';
			$html.='<td style="font-weight:bold;">REMETENTE:</td>';
			$html.='<td style="font-weight:bold;" colspan="2">'.$field->rem_razao_social.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>ENDEREÇO:</td>';
			$html.='<td colspan="2">'.$field->rem_end_logradouro.', '.$field->rem_end_numero.' - '.$field->rem_end_complemento.' - '.$field->rem_end_bairro.' - '.$field->rem_end_cep.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>CIDADE:</td>';
			$html.='<td colspan="2">'.$field->rem_cid_nome_completo.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>CNPJ/CPF:</td>';
			$html.='<td colspan="2">'.$field->rem_cnpj_cpf.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>IE/RG:</td>';
			$html.='<td colspan="2">'.$field->rem_ie.' '.$field->rem_rg.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>TELEFONE:</td>';
			$html.='<td colspan="2">'.$field->rem_fone.'</td>';
			$html.='</tr>';
			$html.='<tr><td colspan="3" style="border-top:1px solid;"></td></tr>';
			$html.='<tr>';
			$html.='<td style="font-weight:bold;">DESTINATÁRIO:</td>';
			$html.='<td style="font-weight:bold;" colspan="2">'.$field->des_razao_social.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>ENDEREÇO:</td>';
			$html.='<td colspan="2">'.$field->des_end_logradouro.', '.$field->des_end_numero.' - '.$field->des_end_complemento.' - '.$field->des_end_bairro.' - '.$field->des_end_cep.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>CIDADE:</td>';
			$html.='<td colspan="2">'.$field->des_cid_nome_completo.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>CNPJ/CPF:</td>';
			$html.='<td colspan="2">'.$field->des_cnpj_cpf.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>IE/RG:</td>';
			$html.='<td colspan="2">'.$field->des_ie.' '.$field->des_rg.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>TELEFONE:</td>';
			$html.='<td colspan="2">'.$field->des_fone.'</td>';
			$html.='</tr>';
			$html.='<tr><td colspan="3" style="border-top:1px solid;"></td></tr>';
			$html.='<tr>';
			$html.='<td style="font-weight:bold;">TOMADOR:</td>';
			$html.='<td style="font-weight:bold;" colspan="2">'.$field->tom_razao_social.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>ENDEREÇO:</td>';
			$html.='<td colspan="2">'.$field->tom_end_logradouro.', '.$field->tom_end_numero.' - '.$field->tom_end_complemento.' - '.$field->tom_end_bairro.' - '.$field->tom_end_cep.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>CIDADE:</td>';
			$html.='<td colspan="2">'.$field->tom_cid_nome_completo.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>CNPJ/CPF:</td>';
			$html.='<td colspan="2">'.$field->tom_cnpj_cpf.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>IE/RG:</td>';
			$html.='<td colspan="2">'.$field->tom_ie.' '.$field->tom_rg.'</td>';
			$html.='</tr>';
			$html.='<tr>';
			$html.='<td>TELEFONE:</td>';
			$html.='<td colspan="2">'.$field->tom_fone.'</td>';
			$html.='</tr>';
			$html.='</table>';
			
			$html.= $doc_html;
			$html.= $cub_html;
			
			$html.='<table cellpadding="5" cellspacing="5" style="width:100%; margin-top:10px;">';
			$html.='<tr><th style="width:100%; font-weight:bold; font-size:14px; text-align:center;">EM NENHUMA HIPÓTESE A PRESENTE TEM VALOR COMO RECEBIDO</th></tr>';
			$html.='</table>';
			$html.='<table cellpadding="5" cellspacing="0" style="border:1px solid; width:100%;">';
			$html.='<tr>';
			$html.='<td style="text-align:center; width:30%; border-right:1px solid;" align="center">';
			$html.='<p style="text-align:center;">Recebemos a mercadoria supra para despacho.</p>';
			$html.='<br/><br/>';
			$html.='<p style="text-align:center;">____________________________________<br/>'.$this->empresa->emp_nome_fantasia.'</p>';
			$html.='<p><br/></p>';
			$html.='<p><br/>Data: ______/______/______</p>';
			$html.='</td>';
			$html.='<td style="width:70%;">';
			$html.='<p style="padding:5px;">Declaramos ter tomado conhecimento das condições gerais do transporte, responsabilizando-nos pelo que foi descrito acima.</p>';
			$html.='<p style="padding:5px;">Remetente (nome legível):_____________________________________________________________________</p>';
			$html.='<p style="padding:5px;">Destinatário/Recebido por (nome legível):_________________________________________________________</p>';
			$html.='<p style="padding:5px;">Data: ______/______/______'.str_repeat("&nbsp;", 65).'Hora: _____________________________</p>';
			$html.='</td>';
			$html.='</tr>';
			$html.='<tr><td style="height:5px; border-bottom:1px solid; border-right:1px solid;"></td><td style="height:5px; border-bottom:1px solid;"></td></tr>';
			$html.='<tr><td colspan="2" style="height:30px;">OBS:</td></tr>';
			$html.='</table>';
			
			$html.='</page>';
		}
		
		$pdfname = encode_filename('COLETA'.$field->id);
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
		$url = URL.'mod/sac/coleta/export/'.$this->empresa->uniqueid;
		$url.= '/'.$pdfname.'?_dc='.now();
		
		return $url;
	}
	/**
	 * Gerar Layout/Formulário em PDF da Coleta
	 * @access private
	 * @return string json
	 */
	function gerar_pdf_form() {
		$html = $this->pdf_style();
		$html.='<page backtop="0mm" backbottom="0mm">';
		$html.='<table cellpadding="5" cellspacing="0" style="border:1px solid; width:100%;">';
		$html.='<tr>';
		$html.='<td align="center" style="width:20%; text-align:center; vertical-align:middle; border-right:1px solid;"><img style="width:100%; height:auto;" src="'.$this->empresa->logo_url.'" /></td>';
		$html.='<td style="width:60%; text-align:center; vertical-align:middle; border-right:1px solid;">';
		$html.='<font style="font-weight:bold; font-size:16px;">'.$this->empresa->emp_razao_social.'</font>';
		$html.='<br/>'.$this->empresa->emp_logradouro.', '.$this->empresa->emp_numero.' - '.$this->empresa->emp_bairro.' - CEP: '.$this->empresa->emp_cep.' - '.$this->empresa->cid_municipio.' / '.$this->empresa->cid_uf;
		$html.='<br/>FONES: '.$this->empresa->emp_fone1.' / '.$this->empresa->emp_fone2; 
		$html.='<br/>'.$this->empresa->emp_email_comercial;
		$html.='</td>';
		$html.='<td style="width:20%; text-align:center; vertical-align:middle;">MINUTA PARA DESPACHO Nº<p style="color:red; font-size:16px;">______________</p>';
		$html.='</td>';
		$html.='</tr>';
		$html.='<tr><td colspan="3" style="border-top:1px solid;"></td></tr>';
		$html.='<tr>';
		$html.='<td style="font-weight:bold; height:20px;">REMETENTE:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">ENDEREÇO:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">CIDADE:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">CNPJ/CPF:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">IE/RG:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">TELEFONE:</td>';
		$html.='<td colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr><td colspan="3" style="height:10px; border-top:1px solid;"></td></tr>';
		$html.='<tr>';
		$html.='<td style="font-weight:bold; height:20px;">DESTINATÁRIO:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">ENDEREÇO:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">CIDADE:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">CNPJ/CPF:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">IE/RG:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">TELEFONE:</td>';
		$html.='<td colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr><td colspan="3" style="height:10px; border-top:1px solid;"></td></tr>';
		$html.='<tr>';
		$html.='<td style="font-weight:bold; height:20px;">TOMADOR:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">ENDEREÇO:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">CIDADE:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">CNPJ/CPF:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">IE/RG:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2"></td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">TELEFONE:</td>';
		$html.='<td colspan="2"></td>';
		$html.='</tr>';
		$html.='</table>';
		
		$html.='<table cellpadding="5" cellspacing="5" style="width:100%; margin-top:10px;">';
		$html.='<tr><th style="width:100%; font-weight:bold; font-size:14px; text-align:center;">MERCADORIA A TRANSPORTAR</th></tr>';
		$html.='</table>';
		$html.='<table cellpadding="5" cellspacing="0" style="border:1px solid; width:100%;">';
		$html.='<tr>';
		$html.='<th style="width:10%; text-align:center; border-right: 1px solid;">VOLUMES</th>';
		$html.='<th style="width:10%; text-align:center; border-right: 1px solid;">PESO (kg)</th>';
		$html.='<th style="width:10%; text-align:center; border-right: 1px solid;">PESO (kg/m³)</th>';
		$html.='<th style="width:40%; text-align:center; border-right: 1px solid;">CONTEÚDO</th>';
		$html.='<th style="width:10%; text-align:center; border-right: 1px solid;">NOTA FISCAL</th>';
		$html.='<th style="width:20%; text-align:center;">V. MERCADORIA (R$)</th>';
		$html.='</tr>';
		for ($i=0; $i<10; $i++) {
			$html.='<tr>';
			$html.='<td style="border-top:1px solid; border-right: 1px solid; height:20px;"></td>';
			$html.='<td style="border-top:1px solid; border-right: 1px solid; height:20px;"></td>';
			$html.='<td style="border-top:1px solid; border-right: 1px solid; height:20px;"></td>';
			$html.='<td style="border-top:1px solid; border-right: 1px solid; height:20px;"></td>';
			$html.='<td style="border-top:1px solid; border-right: 1px solid; height:20px;"></td>';
			$html.='<td style="border-top:1px solid; height:20px;"></td>';
			$html.='</tr>';
		}
		$html.='</table>';
		
		$html.='<table cellpadding="5" cellspacing="5" style="width:100%; margin-top:10px;">';
		$html.='<tr><th style="width:100%; font-weight:bold; font-size:14px; text-align:center;">EM NENHUMA HIPÓTESE A PRESENTE TEM VALOR COMO RECEBIDO</th></tr>';
		$html.='</table>';
		$html.='<table cellpadding="5" cellspacing="0" style="border:1px solid; width:100%;">';
		$html.='<tr>';
		$html.='<td style="text-align:center; width:30%; border-right:1px solid;" align="center">';
		$html.='<p style="text-align:center;">Recebemos a mercadoria supra para despacho.</p>';
		$html.='<br/><br/>';
		$html.='<p style="text-align:center;">____________________________________<br/>'.$this->empresa->emp_nome_fantasia.'</p>';
		$html.='<p><br/></p>';
		$html.='<p><br/>Data: ______/______/______</p>';
		$html.='</td>';
		$html.='<td style="width:70%;">';
		$html.='<p style="padding:5px;">Declaramos ter tomado conhecimento das condições gerais do transporte, responsabilizando-nos pelo que foi descrito acima.</p>';
		$html.='<p style="padding:5px;">Remetente (nome legível):_____________________________________________________________________</p>';
		$html.='<p style="padding:5px;">Destinatário/Recebido por (nome legível):_________________________________________________________</p>';
		$html.='<p style="padding:5px;">Data: ______/______/______'.str_repeat("&nbsp;", 65).'Hora: _____________________________</p>';
		$html.='</td>';
		$html.='</tr>';
		$html.='<tr><td style="height:5px; border-bottom:1px solid; border-right:1px solid;"></td><td style="height:5px; border-bottom:1px solid;"></td></tr>';
		$html.='<tr><td colspan="2" style="height:30px;">OBS:</td></tr>';
		$html.='</table>';
		$html.='</page>';
		
		$pdfname = encode_filename('MODELO');
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
		$url = URL.'mod/sac/coleta/export/'.$this->empresa->uniqueid;
		$url.= '/'.$pdfname.'?_dc='.now();
		
		print json_encode(array('success'=>true,'pdf'=>$url));
	}
}
?>