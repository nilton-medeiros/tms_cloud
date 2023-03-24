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
		$url = URL.'mod/sac/coletas/export/'.$this->empresa->uniqueid;
		$path = str_replace(URL, PATH, $url);
		
		$id = intval($_GET["id"]);
		$status = trim($_GET['status']);
		$filter	= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$filter.= $p->filter;
		
		if ($id > 0) {
			$filter.="AND id = ".$id;
		} elseif (!empty($status) && $status != 'TODOS') {
			$filter.="AND status IN(";
			if ($status == "EM ABERTO") {
				$filter.= "'AGUARDANDO','EM ADAMENTO'";
			} elseif ($status == 'FINALIZADAS') {
				$filter.= "'COLETADA'";
			} else {
				$filter.= "'CANCELADA'";
			}
			$filter.=")";
		}
		
		$sql = "SELECT * FROM view_coletas ";
		$sql.= $filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if ($p->limit) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql); $list = array();
		
		while ($field = $this->fetch_object($query)) {
			if (!empty($field->coletar_das)) {
				$field->coletar_das = explode(":", $field->coletar_das);
				$field->coletar_das = $field->coletar_das[0].":".$field->coletar_das[1];
			}
			if (!empty($field->coletar_ate)) {
				$field->coletar_ate = explode(":", $field->coletar_ate);
				$field->coletar_ate = $field->coletar_ate[0].":".$field->coletar_ate[1];
			}
			
			$pdfname = encode_filename('coleta'.$field->id);
			$pdfname = validate_filename($pdfname);
			$pdfname.= '.pdf';
			if (file_exists($path."/".$pdfname)) {
				$field->coleta_pdf = $url."/".$pdfname;
				$field->coleta_filename = $path."/".$pdfname;
			} else {
				$field->coleta_pdf = "";
				$field->coleta_filename = "";
			}
			
			array_push($list, $field);
		}
		
		$this->free_result($query);
		
		$sql = "SELECT COUNT(id) AS total FROM view_coletas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Excluir coleta
	 * @access public
	 * @return string json
	 */
	function delete_coleta() {
		$sql = "DELETE FROM coletas WHERE id IN(".trim($_POST["id"]).")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success"=>$this->affected_rows() > 0));
	}
	/**
	 * Salvar coleta e gera o PDF
	 * @access public
	 * @return string json
	 */
	function save_coleta() {
		$id = intval($_POST["id"]);
		$clie_id = intval($_POST["clie_id"]);
		$mot_id = intval($_POST["mot_id"]); if (!$mot_id) $mot_id = "NULL";
		$veic_trac_id = intval($_POST["veic_trac_id"]); if (!$veic_trac_id) $veic_trac_id = "NULL";
		$coletar_em = $this->escape(trim($_POST["coletar_em"]), "date");
		$coletar_das = $this->escape(trim($_POST["coletar_das"]), "string");
		$coletar_ate = $this->escape(trim($_POST["coletar_ate"]), "string");
		$nota_coleta = $this->escape(trim($_POST["nota_coleta"]), "string");
		$nota_motorista = $this->escape(trim($_POST["nota_motorista"]), "string");
		$status = $this->escape(trim($_POST["status"]), "string");
		
		$_coletado_em = date_convert(trim($_POST["coletado_em"]), "Y-m-d");
		$_coletado_as = trim($_POST["coletado_as"]);
		$concluida_em = $this->escape($_coletado_em." ".$_coletado_as, "string");
		
		$sql = ($id > 0) ? "UPDATE coletas SET " : "INSERT INTO coletas SET emp_id = ".$this->empresa->emp_id.",";
		$sql.= "clie_id = ".$clie_id.",";
		$sql.= "mot_id = ".$mot_id.",";
		$sql.= "veic_trac_id = ".$veic_trac_id.",";
		$sql.= "status = ".$status.",";
		$sql.= "coletar_em = ".$coletar_em.",";
		$sql.= "coletar_das = ".$coletar_das.",";
		$sql.= "coletar_ate = ".$coletar_ate.",";
		$sql.= "nota_coleta = ".$nota_coleta.",";
		if (!empty($_coletado_em) && !empty($_coletado_as)) {
			$sql.= "concluida_em = ".$concluida_em.",";
		}
		$sql.= "nota_motorista = ".$nota_motorista." ";
		if ($id > 0) {
			$sql.= "WHERE id = ".$id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$id) {
			$id = $this->insert_id();
		}
		
		if (!preg_match("/COLETADA|CANCELADA/i", $status)) {
			$this->gerar_pdf($id);
		} else {
			print json_encode(array("success"=>true,"id"=>$id,"pdf"=>""));
		}
	}
	/**
	 * Gerar Layout/Formulário em PDF da Coleta
	 * @access private
	 * @return string json
	 */
	function gerar_pdf($coletas_id) {
		$sql = "SELECT * FROM view_coletas WHERE id = ".$coletas_id;
		$query = $this->query($sql);
		$field = $this->fetch_object($query);
		$this->free_result($query);
		
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
		$html.='<td style="width:20%; text-align:center; vertical-align:middle;">COLETA Nº<p style="color:red; font-size:16px;">'.$coletas_id.'</p>';
		$html.='</td>';
		$html.='</tr>';
		$html.='<tr><td colspan="3" style="border-top:1px solid;"></td></tr>';
		$html.='<tr>';
		$html.='<td style="font-weight:bold; height:20px;">CLIENTE:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2">'.$field->clie_razao_social.'</td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">ENDEREÇO:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2">'.$field->clie_endereco.'</td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">CNPJ/CPF:</td>';
		$html.='<td style="border-bottom:1px dotted;" colspan="2">'.$field->clie_cnpj_cpf.'</td>';
		$html.='</tr>';
		$html.='<tr>';
		$html.='<td style="height:20px;">TELEFONE:</td>';
		$html.='<td colspan="2">'.$field->cliente_fones.'</td>';
		$html.='</tr>';
		$html.='<tr><td colspan="3" style="height:10px; border-top:1px solid;"></td></tr>';
		$html.='</table>';
		
		$html.='<table cellpadding="5" cellspacing="5" style="width:100%; margin-top:20px;">';
		$html.='<tr><th style="width:100%; font-weight:bold; font-size:14px; text-align:center;">INFORMAÇÕES SOBRE A CARGA</th></tr>';
		$html.='<tr><th style="width:100%; font-size:14px; text-align:left;">'.$field->nota_coleta.'</th></tr>';
		$html.='</table>';
		
		$html.='<table cellpadding="5" cellspacing="0" style="border:1px solid; width:100%;">';
		$html.='<tr>';
		$html.='<td align="center" style="width:33%; text-align:center; border-right:1px solid;">COLETAR EM<br/>'.date_convert($field->coletar_em, "d/m/Y").'</td>';
		$html.='<td align="center" style="width:34%; text-align:center; border-left:1px solid;">PRIMEIRO HORÁRIO PARA COLETA<br/>'.$field->coletar_das.'</td>';
		$html.='<td align="center" style="width:33%; text-align:center; border-left:1px solid;">ÚLTIMO HORÁRIO PARA COLETA<br/>'.$field->coletar_ate.'</td>';
		$html.='</tr>';
		$html.='</table>';
		
		$html.='<table cellpadding="5" cellspacing="5" style="width:100%; margin-top:30px;">';
		$html.='<tr><th style="width:100%; text-align:left;">Sr. Motorista, favor relatar abaixo as informações referente a coleta.:</th></tr>';
		$html.='</table>';
		
		$html.='</page>';
		
		$pdfname = encode_filename('coleta'.$coletas_id);
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
		$url = URL.'mod/sac/coletas/export/'.$this->empresa->uniqueid;
		$url.= '/'.$pdfname.'?_dc='.now();
		
		print json_encode(array('success'=>true,'pdf'=>$url));
	}
	/**
	 * Enviar e-mail de aviso da coleta para o cliente
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function email_cliente() {
		$filename = trim($_POST['filename']);
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
			$anexo = PATH.'mod/sac/coletas/temp';
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
		
		if (!empty($anexo)) {
			@unlink($anexo);
		}
		
		print json_encode(array('success'=>$success));
	}
}
?>