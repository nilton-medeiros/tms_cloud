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
		$cte_id = trim($_GET['cte_id']);
		$cte_situacao = trim($_GET['cte_situacao']);
		$status = trim($_GET['status']);

		$filter	= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$filter.= $p->filter;
		if (!empty($cte_id)) {
			$p->start = 0;
			$filter.= "AND cte_id IN (".$cte_id.") ";
		} elseif (!empty($cte_situacao)) {
			$cte_situacao = explode(",", $cte_situacao);
			foreach ($cte_situacao as $key => $value) {
				$cte_situacao[$key] = $this->escape($value, 'string');
			}
			$cte_situacao = implode(",", $cte_situacao);
			$filter.="AND cte_situacao IN (".$cte_situacao.") ";
		} elseif (!empty($status) && $status != 'TODOS') {
			$filter.="AND DATEDIFF(CURDATE(), cte_data_hora_emissao) <= ";
			if ($status == 'ÚLTIMOS 90 DIAS') {
				$filter.= "90 ";
			} elseif ($status == 'ÚLTIMOS 180 DIAS') {
				$filter.= "180 ";
			} elseif ($status == 'ÚLTIMOS 365 DIAS') {
				$filter.= "365 ";
			}
		}

		$sql = "SELECT * FROM view_ctes ";
		$sql.= $filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if ($p->limit) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql); $list = array();
		$path = '../export/'.$this->empresa->uniqueid;
		$url = URL.'mod/conhecimentos/ctes/export/'.$this->empresa->uniqueid;
		while ($field = $this->fetch_object($query)) {
			if ($this->empresa->emp_tipo_emitente == 'ND') {
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
	function save_representante() {
		$clie_representante_id = intval($_POST['clie_representante_id']);
		if (!$clie_representante_id) $clie_representante_id = 'NULL';
		$sql = "UPDATE ctes SET clie_representante_id = ".$clie_representante_id." WHERE cte_id = ".intval($_POST['cte_id']);
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>true));
	}
	/**
	 * Salvar CT-e no banco de dados
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_cte() {
		$cte_id = intval($_POST['cte_id']);
		$clie_remetente_id = intval($_POST['clie_remetente_id']);
		$clie_coleta_id = intval($_POST['clie_coleta_id']);
		$clie_expedidor_id = intval($_POST['clie_expedidor_id']);
		$clie_recebedor_id = intval($_POST['clie_recebedor_id']);
		$clie_destinatario_id = intval($_POST['clie_destinatario_id']);
		$clie_entrega_id = intval($_POST['clie_entrega_id']);
		$clie_tomador_id = intval($_POST['clie_tomador_id']);
		$cid_id_origem = intval($_POST['cid_id_origem']);
		$cid_id_destino = intval($_POST['cid_id_destino']);
		$cid_id_passagem = intval($_POST['cid_id_passagem']);
		$cid_id_etiqueta_entrega = intval($_POST['cid_id_etiqueta_entrega']);
		$clie_representante_id = intval($_POST['clie_representante_id']); if (!$clie_representante_id) $clie_representante_id = 'NULL';
		$prod_id = intval($_POST['prod_id']);

		if (!$clie_remetente_id) $clie_remetente_id = "NULL";
		if (!$clie_coleta_id) $clie_coleta_id = "NULL";
		if (!$clie_expedidor_id) $clie_expedidor_id = "NULL";
		if (!$clie_recebedor_id) $clie_recebedor_id = "NULL";
		if (!$clie_destinatario_id) $clie_destinatario_id = "NULL";
		if (!$clie_entrega_id) $clie_entrega_id = "NULL";
		if (!$clie_tomador_id) $clie_tomador_id = "NULL";
		if (!$cid_id_origem) $cid_id_origem = "NULL";
		if (!$cid_id_destino) $cid_id_destino = "NULL";
		if (!$cid_id_passagem) $cid_id_passagem = "NULL";
		if (!$cid_id_etiqueta_entrega) $cid_id_etiqueta_entrega = "NULL";
		if (!$prod_id) $prod_id = "NULL";

		$cte_versao_leiaute_xml = $this->escape($this->empresa->emp_versao_layout_xml);
		$cte_modelo = $this->escape($this->empresa->emp_cte_modelo);
		$cte_serie = $this->escape($this->empresa->emp_cte_serie);
		$cte_minuta = intval($_POST['cte_minuta']);
		$cte_data_hora_emissao = $this->escape(date_convert(trim($_POST['cte_data_emissao'])).' '.trim($_POST['cte_hora_emissao']), 'string');
		$cte_remetente = intval($_POST['cte_remetente']);
		$cte_outro_local_coleta = intval($_POST['cte_outro_local_coleta']);
		$cte_expedidor = intval($_POST['cte_expedidor']);
		$cte_recebedor = intval($_POST['cte_recebedor']);
		$cte_destinatario = intval($_POST['cte_destinatario']);
		$cte_outro_local_entrega = intval($_POST['cte_outro_local_entrega']);
		$cte_tomador = intval($_POST['cte_tomador']);
		$cte_modal = intval($_POST['cte_modal']);
		$cte_emissora_master = $this->escape(trim($_POST['cte_emissora_master']));
		$cte_cia_master = $this->escape(trim($_POST['cte_cia_master']));
		$cte_serie_master = intval($_POST['cte_serie_master']);
		$cte_numero_master = intval($_POST['cte_numero_master']);
		$cte_operacional_master = $this->escape(trim($_POST['cte_operacional_master']));
		$cte_chave_master = $this->escape(trim($_POST['cte_chave_master']), 'string');
		$cte_chave_referenciado = $this->escape(trim($_POST['cte_chave_referenciado']), 'string');
		$cte_tipo_servico = intval($_POST['cte_tipo_servico']);
		$cte_tipo_do_cte = intval($_POST['cte_tipo_do_cte']);
		$cte_forma_emissao = intval($_POST['cte_forma_emissao']);
		$cte_codigo_rota = $this->escape(trim($_POST['cte_codigo_rota']));
		$cte_forma_pgto = intval($_POST['cte_forma_pgto']);
		$cte_impressao_dacte = intval($_POST['cte_impressao_dacte']);
		$cte_tabela_cliente = $this->escape(trim($_POST['cte_tabela_cliente']));
		$cte_tabela_id = intval($_POST['cte_tabela_id']); if (!$cte_tabela_id) $cte_tabela_id = "NULL";
		$redespacho_id = intval($_POST['redespacho_id']); if (!$redespacho_id) $redespacho_id = "NULL";
		$cte_carac_adic_transp = $this->escape(trim($_POST['cte_carac_adic_transp']));
		$cte_carac_adic_servico = $this->escape(trim($_POST['cte_carac_adic_servico']));
		$cte_emissor = $this->escape($this->usuario->user_login);
		$cte_retira = intval($_POST['cte_retira']);
		$cte_detalhe_retira = $this->escape(trim($_POST['cte_detalhe_retira']));
		$cte_tp_data_entrega = intval($_POST['cte_tp_data_entrega']);
		$cte_data_programada = $this->escape(trim($_POST['cte_data_programada']), 'date');
		$cte_data_inicial = $this->escape(trim($_POST['cte_data_inicial']), 'date');
		$cte_data_final = $this->escape(trim($_POST['cte_data_final']), 'date');
		$cte_tp_hora_entrega = intval($_POST['cte_tp_hora_entrega']);
		$cte_hora_programada = $this->escape(trim($_POST['cte_hora_programada']));
		$cte_hora_inicial = $this->escape(trim($_POST['cte_hora_inicial']));
		$cte_hora_final = $this->escape(trim($_POST['cte_hora_final']));
		$cte_obs_gerais = $this->escape(trim($_POST['cte_obs_gerais']));
		$cte_outras_carac_carga = $this->escape(trim($_POST['cte_outras_carac_carga']));
		$cte_peso_bruto = $this->escape(trim($_POST['cte_peso_bruto']), 'decimal');
		$cte_peso_cubado = $this->escape(trim($_POST['cte_peso_cubado']), 'decimal');
		$cte_peso_bc = $this->escape(trim($_POST['cte_peso_bc']), 'decimal');
		$cte_cubagem_m3 = $this->escape(trim($_POST['cte_cubagem_m3']), 'decimal');
		$cte_qtde_volumes = intval($_POST['cte_qtde_volumes']);
		$cte_valor_carga = $this->escape(trim($_POST['cte_valor_carga']), 'decimal');
		$cte_valor_total = $this->escape(trim($_POST['cte_valor_total']), 'decimal');
		$cte_codigo_sit_tributaria = $this->escape(trim($_POST['cte_codigo_sit_tributaria']));
		$cte_perc_reduc_bc = numericval($_POST['cte_perc_reduc_bc'], true);
		$cte_valor_bc = numericval($_POST['cte_valor_bc'], true);
		$cte_aliquota_icms = numericval($_POST['cte_aliquota_icms'], true);
		$cte_valor_icms = numericval($_POST['cte_valor_icms'], true);
		$cte_valor_cred_outorgado = numericval($_POST['cte_valor_cred_outorgado'], true);
		$cte_valor_pis = $this->escape($this->empresa->emp_PIS);
		$cte_valor_cofins = $this->escape($this->empresa->emp_COFINS);
		$cte_info_fisco = $this->escape(trim($_POST['cte_info_fisco']));
		$cte_tipo_doc_anexo = intval($_POST['cte_tipo_doc_anexo']);
		$cte_data_entrega_prevista = $this->escape(trim($_POST['cte_data_entrega_prevista']), 'date');
		$cte_indicador_lotacao = intval($_POST['cte_indicador_lotacao']);
		$cte_ciot = intval($_POST['cte_ciot']);
		$cte_frete_manual = $this->escape($_POST['cte_frete_manual'], 'bool');

		$ctes_documentos = json_decode($_POST['ctes_documentos']);
		$ctes_dimensoes = json_decode($_POST['ctes_dimensoes']);
		$ctes_seguro = json_decode($_POST['ctes_seguro']);
		$ctes_prod_perigosos = json_decode($_POST['ctes_prod_perigosos']);
		$ctes_emitentes_ant = json_decode($_POST['ctes_emitentes_ant']);
		$ctes_veiculos_novos = json_decode($_POST['ctes_veiculos_novos']);
		$ctes_rod_coletas = json_decode($_POST['ctes_rod_coletas']);
		$ctes_rod_lacres = json_decode($_POST['ctes_rod_lacres']);
		$ctes_rod_vale_pedagio = json_decode($_POST['ctes_rod_vale_pedagio']);
		$ctes_rod_veiculos = json_decode($_POST['ctes_rod_veiculos']);
		$ctes_rod_motoristas = json_decode($_POST['ctes_rod_motoristas']);
		$ctes_obs_contr_fisco = json_decode($_POST['ctes_obs_contr_fisco']);
		$ctes_comp_calculo = json_decode($_POST['ctes_comp_calculo']);
		$cte_endereco_etiqueta_entrega = $this->escape(trim($_POST['cte_endereco_etiqueta_entrega']));

		$sql = ($cte_id > 0) ? "UPDATE ctes SET " : "INSERT INTO ctes SET emp_id = ".$this->empresa->emp_id.",";
		$sql.= "cte_situacao = 'DIGITAÇÃO',";
		$sql.= "clie_remetente_id = ".$clie_remetente_id.",";
		$sql.= "clie_coleta_id = ".$clie_coleta_id.",";
		$sql.= "clie_expedidor_id = ".$clie_expedidor_id.",";
		$sql.= "clie_recebedor_id = ".$clie_recebedor_id.",";
		$sql.= "clie_destinatario_id = ".$clie_destinatario_id.",";
		$sql.= "clie_representante_id = ".$clie_representante_id.",";
		$sql.= "clie_entrega_id = ".$clie_entrega_id.",";
		$sql.= "clie_tomador_id = ".$clie_tomador_id.",";
		$sql.= "cid_id_origem = ".$cid_id_origem.",";
		$sql.= "cid_id_destino = ".$cid_id_destino.",";
		$sql.= "cid_id_passagem = ".$cid_id_passagem.",";
		$sql.= "cid_id_etiqueta_entrega = ".$cid_id_etiqueta_entrega.",";
		$sql.= "cte_endereco_etiqueta_entrega = ".$cte_endereco_etiqueta_entrega.",";
		$sql.= "prod_id = ".$prod_id.",";
		$sql.= "cte_versao_leiaute_xml = ".$cte_versao_leiaute_xml.",";
		$sql.= "cte_modelo = ".$cte_modelo.",";
		$sql.= "cte_serie = ".$cte_serie.",";
		$sql.= "cte_minuta = ".$cte_minuta.",";
		$sql.= "cte_data_hora_emissao = ".$cte_data_hora_emissao.",";
		$sql.= "cte_remetente = ".$cte_remetente.",";
		$sql.= "cte_outro_local_coleta = ".$cte_outro_local_coleta.",";
		$sql.= "cte_expedidor = ".$cte_expedidor.",";
		$sql.= "cte_recebedor = ".$cte_recebedor.",";
		$sql.= "cte_destinatario = ".$cte_destinatario.",";
		$sql.= "cte_outro_local_entrega = ".$cte_outro_local_entrega.",";
		$sql.= "cte_tomador = ".$cte_tomador.",";
		$sql.= "cte_modal = ".$cte_modal.",";
		$sql.= "cte_emissora_master = ".$cte_emissora_master.",";
		$sql.= "cte_cia_master = ".$cte_cia_master.",";
		$sql.= "cte_serie_master = ".$cte_serie_master.",";
		$sql.= "cte_numero_master = ".$cte_numero_master.",";
		$sql.= "cte_operacional_master = ".$cte_operacional_master.",";
		$sql.= "cte_chave_master = ".$cte_chave_master.",";
		$sql.= "cte_chave_referenciado = ".$cte_chave_referenciado.",";
		$sql.= "cte_tipo_servico = ".$cte_tipo_servico.",";
		$sql.= "cte_tipo_do_cte = ".$cte_tipo_do_cte.",";
		$sql.= "cte_forma_emissao = ".$cte_forma_emissao.",";
		$sql.= "cte_codigo_rota = ".$cte_codigo_rota.",";
		$sql.= "cte_forma_pgto = ".$cte_forma_pgto.",";
		$sql.= "cte_impressao_dacte = ".$cte_impressao_dacte.",";
		$sql.= "cte_tabela_frete = ".$cte_tabela_cliente.",";
		$sql.= "cte_tabela_id = ".$cte_tabela_id.",";
		$sql.= "redespacho_id = ".$redespacho_id.",";
		$sql.= "cte_frete_manual = ".$cte_frete_manual.",";
		$sql.= "cte_carac_adic_transp = ".$cte_carac_adic_transp.",";
		$sql.= "cte_carac_adic_servico = ".$cte_carac_adic_servico.",";
		$sql.= "cte_emissor = ".$cte_emissor.",";
		$sql.= "cte_retira = ".$cte_retira.",";
		$sql.= "cte_detalhe_retira = ".$cte_detalhe_retira.",";
		$sql.= "cte_tp_data_entrega = ".$cte_tp_data_entrega.",";
		$sql.= "cte_data_programada = ".$cte_data_programada.",";
		$sql.= "cte_data_inicial = ".$cte_data_inicial.",";
		$sql.= "cte_data_final = ".$cte_data_final.",";
		$sql.= "cte_tp_hora_entrega = ".$cte_tp_hora_entrega.",";
		$sql.= "cte_hora_programada = ".$cte_hora_programada.",";
		$sql.= "cte_hora_inicial = ".$cte_hora_inicial.",";
		$sql.= "cte_hora_final = ".$cte_hora_final.",";
		$sql.= "cte_obs_gerais = ".$cte_obs_gerais.",";
		$sql.= "cte_outras_carac_carga = ".$cte_outras_carac_carga.",";
		$sql.= "cte_peso_bruto = ".$cte_peso_bruto.",";
		$sql.= "cte_peso_cubado = ".$cte_peso_cubado.",";
		$sql.= "cte_peso_bc = ".$cte_peso_bc.",";
		$sql.= "cte_cubagem_m3 = ".$cte_cubagem_m3.",";
		$sql.= "cte_qtde_volumes = ".$cte_qtde_volumes.",";
		$sql.= "cte_valor_carga = ".$cte_valor_carga.",";
		$sql.= "cte_valor_total = ".$cte_valor_total.",";
		$sql.= "cte_codigo_sit_tributaria = ".$cte_codigo_sit_tributaria.",";
		$sql.= "cte_perc_reduc_bc = ".$cte_perc_reduc_bc.",";
		$sql.= "cte_valor_bc = ".$cte_valor_bc.",";
		$sql.= "cte_aliquota_icms = ".$cte_aliquota_icms.",";
		$sql.= "cte_valor_icms = ".$cte_valor_icms.",";
		$sql.= "cte_valor_cred_outorgado = ".$cte_valor_cred_outorgado.",";
		$sql.= "cte_valor_pis = ".$cte_valor_pis.",";
		$sql.= "cte_valor_cofins = ".$cte_valor_cofins.",";
		$sql.= "cte_info_fisco = ".$cte_info_fisco.",";
		$sql.= "cte_tipo_doc_anexo = ".$cte_tipo_doc_anexo.",";
		$sql.= "cte_data_entrega_prevista = ".$cte_data_entrega_prevista.",";
		$sql.= "cte_indicador_lotacao = ".$cte_indicador_lotacao.",";
		$sql.= "cte_ciot = ".$cte_ciot." ";
		$sql.= ($cte_id > 0) ? "WHERE cte_id = ".$cte_id : "";
		//$this->debug($sql);
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

		$sql = "DELETE FROM ctes_seguro WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_seguro)) {
			foreach ($ctes_seguro as $field) {
				$sql = "INSERT INTO ctes_seguro SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cte_seg_responsavel = ".$this->escape($field->cte_seg_responsavel).",";
				$sql.= "cte_seg_seguradora = ".$this->escape($field->cte_seg_seguradora).",";
				$sql.= "cte_seg_apolice = ".$this->escape($field->cte_seg_apolice).",";
				$sql.= "cte_seg_averbacao = ".$this->escape($field->cte_seg_averbacao).",";
				$sql.= "cte_seg_valor_carga = ".$this->escape($field->cte_seg_valor_carga, 'decimal');
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$sql = "DELETE FROM ctes_prod_perigosos WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_prod_perigosos)) {
			foreach ($ctes_prod_perigosos as $field) {
				$sql = "INSERT INTO ctes_prod_perigosos SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "iic_id = ".$this->escape($field->iic_id).",";
				$sql.= "prod_numero_onu = ".$this->escape($field->prod_numero_onu).",";
				$sql.= "prod_nome_embarque = ".$this->escape($field->prod_nome_embarque).",";
				$sql.= "prod_classe_risco = ".$this->escape($field->prod_classe_risco).",";
				$sql.= "prod_grupo_embalagem = ".$this->escape($field->prod_grupo_embalagem).",";
				$sql.= "prod_ponto_fulgor = ".$this->escape($field->prod_ponto_fulgor).",";
				$sql.= "cte_pp_qtde_prod = ".$this->escape($field->cte_pp_qtde_prod).",";
				$sql.= "cte_pp_qtde_volumes = ".$this->escape($field->cte_pp_qtde_volumes);
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$sql = "DELETE FROM ctes_emitentes_ant WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_emitentes_ant)) {
			foreach ($ctes_emitentes_ant as $parent) {
				$sql = "INSERT INTO ctes_emitentes_ant SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cte_eda_tipo_doc = ".$this->escape($parent->cte_eda_tipo_doc).",";
				$sql.= "cte_eda_cnpj = ".$this->escape($parent->cte_eda_cnpj, 'string').",";
				$sql.= "cte_eda_cpf = ".$this->escape($parent->cte_eda_cpf, 'string').",";
				$sql.= "cte_eda_ie = ".$this->escape($parent->cte_eda_ie, 'string').",";
				$sql.= "cte_eda_ie_uf = ".$this->escape($parent->cte_eda_ie_uf, 'string').",";
				$sql.= "cte_eda_raz_social_nome = ".$this->escape($parent->cte_eda_raz_social_nome, 'string');
				//$this->debug($sql);
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
				if (!empty($parent->jsonfields)) {
					$parent->cte_eda_id = $this->insert_id();
					$ctes_doc_transp_ant = json_decode($parent->jsonfields);
					foreach ($ctes_doc_transp_ant as $child) {
						$sql = "INSERT INTO ctes_doc_transp_ant SET ";
						$sql.= "cte_eda_id = ".$parent->cte_eda_id.",";
						$sql.= "cte_dta_chave = ".$this->escape($child->cte_dta_chave, 'string');
						//$this->debug($sql);
						if (!$this->query($sql)) {
							print json_encode($this->get_sql_error());
							return false;
						}
					}
				}
			}
		}

		$sql = "DELETE FROM ctes_veiculos_novos WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_veiculos_novos)) {
			foreach ($ctes_veiculos_novos as $field) {
				$sql = "INSERT INTO ctes_veiculos_novos SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cte_vn_chassi = ".$this->escape($field->cte_vn_chassi).",";
				$sql.= "cte_vn_cor = ".$this->escape($field->cte_vn_cor).",";
				$sql.= "cte_vn_descricao_cor = ".$this->escape($field->cte_vn_descricao_cor).",";
				$sql.= "cte_vn_modelo = ".$this->escape($field->cte_vn_modelo).",";
				$sql.= "cte_vn_valor_unit = ".$this->escape($field->cte_vn_valor_unit, 'decimal').",";
				$sql.= "cte_vn_frete_unit = ".$this->escape($field->cte_vn_frete_unit, 'decimal');
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$sql = "DELETE FROM ctes_rod_coletas WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_rod_coletas)) {
			foreach ($ctes_rod_coletas as $field) {
				$sql = "INSERT INTO ctes_rod_coletas SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "oca_serie = ".$this->escape($field->oca_serie).",";
				$sql.= "oca_numero = ".$this->escape($field->oca_numero).",";
				$sql.= "oca_data_emissao = ".$this->escape($field->oca_data_emissao, 'date').",";
				$sql.= "oca_cnpj_emitente = ".$this->escape($field->oca_cnpj_emitente, 'string').",";
				$sql.= "oca_inscricao_estadual = ".$this->escape($field->oca_inscricao_estadual, 'string').",";
				$sql.= "oca_uf_ie = ".$this->escape($field->oca_uf_ie, 'string').",";
				$sql.= "oca_codigo_interno = ".$this->escape($field->oca_codigo_interno).",";
				$sql.= "oca_telefone = ".$this->escape($field->oca_telefone, 'string');
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$sql = "DELETE FROM ctes_rod_lacres WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_rod_lacres)) {
			foreach ($ctes_rod_lacres as $field) {
				$sql = "INSERT INTO ctes_rod_lacres SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "lac_numero = ".$this->escape($field->lac_numero);
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$sql = "DELETE FROM ctes_rod_vale_pedagio WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_rod_vale_pedagio)) {
			foreach ($ctes_rod_vale_pedagio as $field) {
				$sql = "INSERT INTO ctes_rod_vale_pedagio SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cte_vp_cnpj_fornec = ".$this->escape($field->cte_vp_cnpj_fornec, 'string').",";
				$sql.= "cte_vp_comprov_compra = ".$this->escape($field->cte_vp_comprov_compra).",";
				$sql.= "cte_vp_cnpj_responsavel = ".$this->escape($field->cte_vp_cnpj_responsavel, 'string').",";
				$sql.= "cte_vp_valor_vale = ".$this->escape($field->cte_vp_valor_vale, 'decimal');
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$sql = "DELETE FROM ctes_rod_veiculos WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_rod_veiculos)) {
			foreach ($ctes_rod_veiculos as $field) {
				$sql = "INSERT INTO ctes_rod_veiculos SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cte_rv_codigo_interno = ".$this->escape($field->cte_rv_codigo_interno).",";
				$sql.= "cte_rv_renavam = ".$this->escape($field->cte_rv_renavam).",";
				$sql.= "cte_rv_placa = ".$this->escape($field->cte_rv_placa).",";
				$sql.= "cte_rv_tara = ".$this->escape($field->cte_rv_tara).",";
				$sql.= "cte_rv_cap_kg = ".$this->escape($field->cte_rv_cap_kg, 'decimal').",";
				$sql.= "cte_rv_cap_m3 = ".$this->escape($field->cte_rv_cap_m3, 'decimal').",";
				$sql.= "cte_rv_tp_propriedade = ".$this->escape($field->cte_rv_tp_propriedade).",";
				$sql.= "cte_rv_tp_veiculo = ".$this->escape($field->cte_rv_tp_veiculo).",";
				$sql.= "cte_rv_tp_rodado = ".$this->escape($field->cte_rv_tp_rodado).",";
				$sql.= "cte_rv_tp_carroceria = ".$this->escape($field->cte_rv_tp_carroceria).",";
				$sql.= "cte_rv_uf_licenciado = ".$this->escape($field->cte_rv_uf_licenciado).",";
				$sql.= "cte_rv_rntrc = ".$this->escape($field->cte_rv_rntrc).",";
				$sql.= "cte_rv_cpf = ".$this->escape($field->cte_rv_cpf, 'string').",";
				$sql.= "cte_rv_cnpj = ".$this->escape($field->cte_rv_cnpj, 'string').",";
				$sql.= "cte_rv_razao_social = ".$this->escape($field->cte_rv_razao_social).",";
				$sql.= "cte_rv_inscricao_estadual = ".$this->escape($field->cte_rv_inscricao_estadual).",";
				$sql.= "cte_rv_uf_proprietario = ".$this->escape($field->cte_rv_uf_proprietario).",";
				$sql.= "cte_rv_tp_proprietario = ".$this->escape($field->cte_rv_tp_proprietario);
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$sql = "DELETE FROM ctes_rod_motoristas WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_rod_motoristas)) {
			foreach ($ctes_rod_motoristas as $field) {
				$sql = "INSERT INTO ctes_rod_motoristas SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cte_mo_motorista = ".$this->escape($field->cte_mo_motorista).",";
				$sql.= "cte_mo_cpf = ".$this->escape($field->cte_mo_cpf, 'string');
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$sql = "DELETE FROM ctes_obs_contr_fisco WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_obs_contr_fisco)) {
			foreach ($ctes_obs_contr_fisco as $field) {
				$sql = "INSERT INTO ctes_obs_contr_fisco SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cte_ocf_interessado = ".$this->escape($field->cte_ocf_interessado).",";
				$sql.= "cte_ocf_titulo = ".$this->escape($field->cte_ocf_titulo).",";
				$sql.= "cte_ocf_texto = ".$this->escape($field->cte_ocf_texto);
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$sql = "DELETE FROM ctes_comp_calculo WHERE cte_id = ".$cte_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($ctes_comp_calculo)) {
			foreach ($ctes_comp_calculo as $field) {
				$sql = "INSERT INTO ctes_comp_calculo SET ";
				$sql.= "cte_id = ".$cte_id.",";
				$sql.= "cc_id = ".$this->escape($field->cc_id).",";
				$sql.= "ccc_valor = ".$this->escape($field->ccc_valor, 'decimal').",";
				$sql.= "ccc_titulo = ".$this->escape($field->cc_titulo).",";
				$sql.= "ccc_tipo_tarifa = ".$this->escape($field->ccc_tipo_tarifa).",";
				$sql.= "ccc_valor_tarifa_kg = ".$this->escape($field->ccc_valor_tarifa_kg, 'decimal').",";
				if (!empty($field->ccc_tipo_advalorem)) {
					$sql.= "ccc_tipo_advalorem = ".$this->escape($field->ccc_tipo_advalorem).",";
				}
				$sql.= "ccc_percentual_desconto = ".$this->escape($field->ccc_percentual_desconto, 'decimal').",";
				$sql.= "ccc_valor_desconto = ".$this->escape($field->ccc_valor_desconto, 'decimal').",";
				$sql.= "ccc_exibir_valor_dacte = ".$this->escape($field->ccc_exibir_valor_dacte, 'bool').",";
				$sql.= "ccc_exibir_desconto_dacte = ".$this->escape($field->ccc_exibir_desconto_dacte, 'bool').",";
				$sql.= "ccc_tabela = ".$this->escape($field->ccc_tabela);
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}

		$minuta_embarque = '';
		if ($this->empresa->emp_tipo_emitente == 'ND') {
			$minuta_embarque = $this->gerar_nota_despacho_pdf($cte_id);
		}

		print json_encode(array('success'=>true, 'cte_id'=>$cte_id, 'minuta_embarque'=>$minuta_embarque));
	}
	/**
	 * Copiar CT-e
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function copy_cte() {
		$origem_id = intval($_POST['origem_id']);
		$ctes = $ctes_seguro = $ctes_prod_perigosos = $ctes_veiculos_novos = $ctes_ocorrencias =
		$ctes_rod_coletas = $ctes_rod_lacres = $ctes_rod_vale_pedagio = $ctes_documentos =
		$ctes_rod_veiculos = $ctes_rod_motoristas = $ctes_obs_contr_fisco = array();

		$fields = $this->get_fields('ctes');
		foreach ($fields as $field) {
			if (!preg_match("/cte_id|cte_numero|cte_minuta|cte_serie|cte_situacao|^cte_chave|^cte_peso|^cte_cubagem|^cte_qtde|^cte_valor|^cte_perc|cte_xml|cte_pdf|cte_cancelado_xml|cte_cancelado_pdf|cte_dacte_impresso/i", $field->name)) {
				array_push($ctes, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_documentos');
		foreach ($fields as $field) {
			if (!preg_match("/cte_doc_id/i", $field->name)) {
				array_push($ctes_documentos, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_ocorrencias');
		foreach ($fields as $field) {
			if (!preg_match("/cte_ocor_id/i", $field->name)) {
				array_push($ctes_ocorrencias, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_seguro');
		foreach ($fields as $field) {
			if (!preg_match("/cte_seg_id/i", $field->name)) {
				array_push($ctes_seguro, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_prod_perigosos');
		foreach ($fields as $field) {
			if (!preg_match("/cte_pp_id/i", $field->name)) {
				array_push($ctes_prod_perigosos, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_veiculos_novos');
		foreach ($fields as $field) {
			if (!preg_match("/cte_vn_id/i", $field->name)) {
				array_push($ctes_veiculos_novos, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_rod_coletas');
		foreach ($fields as $field) {
			if (!preg_match("/oca_id/i", $field->name)) {
				array_push($ctes_rod_coletas, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_rod_lacres');
		foreach ($fields as $field) {
			if (!preg_match("/lac_id/i", $field->name)) {
				array_push($ctes_rod_lacres, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_rod_vale_pedagio');
		foreach ($fields as $field) {
			if (!preg_match("/cte_vp_id/i", $field->name)) {
				array_push($ctes_rod_vale_pedagio, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_rod_veiculos');
		foreach ($fields as $field) {
			if (!preg_match("/cte_rv_id/i", $field->name)) {
				array_push($ctes_rod_veiculos, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_rod_motoristas');
		foreach ($fields as $field) {
			if (!preg_match("/cte_mo_id/i", $field->name)) {
				array_push($ctes_rod_motoristas, $field->name);
			}
		}
		$fields = $this->get_fields('ctes_obs_contr_fisco');
		foreach ($fields as $field) {
			if (!preg_match("/cte_ocf_id/i", $field->name)) {
				array_push($ctes_obs_contr_fisco, $field->name);
			}
		}

		$ctes = join(',', $ctes);
		$ctes_seguro = join(',', $ctes_seguro);
		$ctes_documentos = join(',', $ctes_documentos);
		$ctes_ocorrencias = join(',', $ctes_ocorrencias);
		$ctes_prod_perigosos = join(',', $ctes_prod_perigosos);
		$ctes_veiculos_novos = join(',', $ctes_veiculos_novos);
		$ctes_rod_coletas = join(',', $ctes_rod_coletas);
		$ctes_rod_lacres = join(',', $ctes_rod_lacres);
		$ctes_rod_vale_pedagio = join(',', $ctes_rod_vale_pedagio);
		$ctes_rod_veiculos = join(',', $ctes_rod_veiculos);
		$ctes_rod_motoristas = join(',', $ctes_rod_motoristas);
		$ctes_obs_contr_fisco = join(',', $ctes_obs_contr_fisco);

		$sql = "INSERT INTO ctes (";
		$sql.= $ctes;
		$sql.= ") SELECT ";
		$sql.= $ctes;
		$sql.= " ";
		$sql.= "FROM ctes ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		$destino_id = $this->insert_id();

		$ctes_seguro_select = str_replace("cte_id", $destino_id, $ctes_seguro);
		$ctes_documentos_select = str_replace("cte_id", $destino_id, $ctes_documentos);
		$ctes_ocorrencias_select = str_replace("cte_id", $destino_id, $ctes_ocorrencias);
		$ctes_prod_perigosos_select = str_replace("cte_id", $destino_id, $ctes_prod_perigosos);
		$ctes_veiculos_novos_select = str_replace("cte_id", $destino_id, $ctes_veiculos_novos);
		$ctes_rod_coletas_select = str_replace("cte_id", $destino_id, $ctes_rod_coletas);
		$ctes_rod_lacres_select = str_replace("cte_id", $destino_id, $ctes_rod_lacres);
		$ctes_rod_vale_pedagio_select = str_replace("cte_id", $destino_id, $ctes_rod_vale_pedagio);
		$ctes_rod_veiculos_select = str_replace("cte_id", $destino_id, $ctes_rod_veiculos);
		$ctes_rod_motoristas_select = str_replace("cte_id", $destino_id, $ctes_rod_motoristas);
		$ctes_obs_contr_fisco_select = str_replace("cte_id", $destino_id, $ctes_obs_contr_fisco);

		$sql = "INSERT INTO ctes_seguro (";
		$sql.= $ctes_seguro;
		$sql.= ") SELECT ";
		$sql.= $ctes_seguro_select;
		$sql.= " ";
		$sql.= "FROM ctes_seguro ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_documentos (";
		$sql.= $ctes_documentos;
		$sql.= ") SELECT ";
		$sql.= $ctes_documentos_select;
		$sql.= " ";
		$sql.= "FROM ctes_documentos ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_ocorrencias (";
		$sql.= $ctes_ocorrencias;
		$sql.= ") SELECT ";
		$sql.= $ctes_ocorrencias_select;
		$sql.= " ";
		$sql.= "FROM ctes_ocorrencias ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_prod_perigosos (";
		$sql.= $ctes_prod_perigosos;
		$sql.= ") SELECT ";
		$sql.= $ctes_prod_perigosos_select;
		$sql.= " ";
		$sql.= "FROM ctes_prod_perigosos ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_veiculos_novos (";
		$sql.= $ctes_veiculos_novos;
		$sql.= ") SELECT ";
		$sql.= $ctes_veiculos_novos_select;
		$sql.= " ";
		$sql.= "FROM ctes_veiculos_novos ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_rod_coletas (";
		$sql.= $ctes_rod_coletas;
		$sql.= ") SELECT ";
		$sql.= $ctes_rod_coletas_select;
		$sql.= " ";
		$sql.= "FROM ctes_rod_coletas ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_rod_lacres (";
		$sql.= $ctes_rod_lacres;
		$sql.= ") SELECT ";
		$sql.= $ctes_rod_lacres_select;
		$sql.= " ";
		$sql.= "FROM ctes_rod_lacres ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_rod_vale_pedagio (";
		$sql.= $ctes_rod_vale_pedagio;
		$sql.= ") SELECT ";
		$sql.= $ctes_rod_vale_pedagio_select;
		$sql.= " ";
		$sql.= "FROM ctes_rod_vale_pedagio ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_rod_veiculos (";
		$sql.= $ctes_rod_veiculos;
		$sql.= ") SELECT ";
		$sql.= $ctes_rod_veiculos_select;
		$sql.= " ";
		$sql.= "FROM ctes_rod_veiculos ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_rod_motoristas (";
		$sql.= $ctes_rod_motoristas;
		$sql.= ") SELECT ";
		$sql.= $ctes_rod_motoristas_select;
		$sql.= " ";
		$sql.= "FROM ctes_rod_motoristas ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "INSERT INTO ctes_obs_contr_fisco (";
		$sql.= $ctes_obs_contr_fisco;
		$sql.= ") SELECT ";
		$sql.= $ctes_obs_contr_fisco_select;
		$sql.= " ";
		$sql.= "FROM ctes_obs_contr_fisco ";
		$sql.= "WHERE cte_id = ".$origem_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$sql = "SELECT * FROM view_ctes WHERE cte_id = ".$destino_id;
		$query = $this->query($sql);
		if (!$query) {
			print json_encode($this->get_sql_error());
			return false;
		}
		$field = $this->fetch_object($query);
		$this->free_result($query);

		print json_encode(array('success'=>true,'cte'=>$field));
	}
	/**
	 * Excluir CT-e e suas dependências
	 * @remotable
	 * @access public
	 * @return outpup (json)
	 */
	function delete_cte() {
		$cte_id = trim($_POST['cte_id']);
		$sql = "DELETE FROM ctes WHERE cte_id IN (".$cte_id.")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success" => $this->affected_rows() > 0));
	}
	/**
	 * Excluir registros da tabela ctes_doc_transp_ant
	 * @remotable
	 * @access public
	 * @return outpup (json)
	 */
	function delete_cte_dta() {
		$cte_dta_id = trim($_POST['cte_dta_id']);
		$sql = "DELETE FROM ctes_doc_transp_ant WHERE cte_dta_id IN (".$cte_dta_id.")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success" => $this->affected_rows() > 0));
	}
	/**
	 * Faz a troca de valores booleanos de um campo da tabela cte
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function toggle_cte_field() {
		$field = trim($_POST['field']);
		$cte_list_id = trim($_POST['cte_list_id']);
		$sql = "UPDATE ctes SET ";
		$sql.= $field." = IF(".$field." = 1, 0, 1) ";
		$sql.= "WHERE cte_id IN (".$cte_list_id.")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>true));
	}
	/**
	 * Armazenagem dos aeroportos por cliente para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function aeroporto_store() {
		$list = array();
		$cid_id = intval($_GET['cid_id']);

		$sql = "SELECT * FROM view_cidades WHERE cid_id = ".$cid_id;
		$query = $this->query($sql);
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);

		$sql = "SELECT t1.* FROM view_cidades AS t1 ";
		$sql.= "INNER JOIN clientes_aeroportos AS t2 ON t2.cid_id = t1.cid_id ";
		$sql.= "WHERE t2.clie_id = ".intval($_GET['clie_id'])." ";
		$sql.= "AND t1.cid_id != ".$cid_id;
		$query = $this->query($sql);
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);

		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Armazenagem das cidades de passagem de redespacho para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function redespacho_store() {
		# Nilton pediu no dia 01/12 às 15h para inserir o ID da empresa
		$clie_id = intval($_GET['clie_id']);
		$cid_id_origem = intval($_GET['cid_id_origem']);
		$cid_id_destino = intval($_GET['cid_id_destino']);

		$list = array();

		$sql = "SELECT t1.* FROM view_taxa_redespacho AS t1 ";
		$sql.= "WHERE t1.clie_id = ".$clie_id." ";
		$sql.= "AND t1.clie_id NOT IN (SELECT t2.clie_id FROM redespachos_excecoes_clientes AS t2 WHERE t2.red_id = t1.red_id) ";
		$sql.= "AND t1.emp_id = ".$this->empresa->emp_id." ";
		$sql.= "AND t1.cid_id_origem = ".$cid_id_origem." ";
		$sql.= "AND t1.cid_id_destino = ".$cid_id_destino;
		//$this->debug($sql);
		$query = $this->query($sql);
		$exist = $this->num_rows($query) > 0;
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);

		if (!$exist) {
			$sql = "SELECT * FROM view_taxa_redespacho ";
			$sql.= "WHERE clie_id IS NULL ";
			$sql.= "AND emp_id = ".$this->empresa->emp_id." ";
			$sql.= "AND cid_id_origem = ".$cid_id_origem." ";
			$sql.= "AND cid_id_destino = ".$cid_id_destino;
			//$this->debug($sql);
			$query = $this->query($sql);
			while ($field = $this->fetch_object($query)) {
				array_push($list, $field);
			}
			$this->free_result($query);
		}

		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Armazenagem dos documentos referente ao CTE selecionado
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function documentos_store() {
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
	 * Pegar tabela para cálculo do frete componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function pegar_tabela() {
		$tabela = trim($_GET['tabela']);
		$clie_id = intval($_GET['clie_id']);
		$cid_id_origem = intval($_GET['cid_id_origem']);
		$cid_id_destino = intval($_GET['cid_id_destino']);
		$peso_taxado = floatval($_GET['peso_taxado']); $usa_peso = false;

		$tab_sem_cliente = array();
		$tab_com_cliente = array();

		$_sql = "SELECT * FROM "; $prefix = "";
		if (preg_match("/ESPECIAL/i", $tabela)) {
			$_sql.= "view_especial ";
			$prefix = "esp_";
			$usa_peso = $peso_taxado > 0;
		} elseif (preg_match("/MINIMA/i", $tabela)) {
			$_sql.= "view_minima ";
			$prefix = "min_";
		} elseif (preg_match("/EXPRESSO/i", $tabela)) {
			$_sql.= "view_expresso ";
		} else {
			$_sql.= "view_nacional ";
			$prefix = "nac_";
		}
		$sql = $_sql;
		$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$sql.= "AND (clie_id = ".$clie_id." OR clie_id IS NULL) ";
		$sql.= "AND cid_id_origem = ".$cid_id_origem." ";
		$sql.= "AND cid_id_destino = ".$cid_id_destino." ";
		if ($usa_peso) {
			$sql.= "AND espfx_peso_ate_kg >= ".$peso_taxado." ";
			$sql.= "ORDER BY espfx_peso_ate_kg ASC ";
		} else {
			$sql.= "ORDER BY ".$prefix."id DESC ";
		}
		$sql.= "LIMIT 1";
		//$this->debug($sql);
		$query = $this->query($sql);
		while ($field = $this->fetch_object($query)) {
			if ($field->clie_id > 0) {
				array_push($tab_com_cliente, $field);
			} else {
				array_push($tab_sem_cliente, $field);
			}
		}
		$this->free_result($query);

		if (empty($tab_com_cliente) && empty($tab_sem_cliente)) {
			$sql = $_sql;
			$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
			$sql.= "AND (clie_id = ".$clie_id." OR clie_id IS NULL) ";
			$sql.= "AND cid_id_origem = ".$cid_id_origem." ";
			$sql.= "AND cid_id_destino = ".$cid_id_destino." ";
			if ($usa_peso) {
				$sql.= "AND espfx_peso_ate_kg <= ".$peso_taxado." ";
				$sql.= "ORDER BY espfx_peso_ate_kg DESC ";
			} else {
				$sql.= "ORDER BY ".$prefix."id DESC ";
			}
			$sql.= "LIMIT 1";
			//$this->debug($sql);
			$query = $this->query($sql);
			while ($field = $this->fetch_object($query)) {
				if ($field->clie_id > 0) {
					array_push($tab_com_cliente, $field);
				} else {
					array_push($tab_sem_cliente, $field);
				}
			}
			$this->free_result($query);
		}

		//$this->debug($tab_com_cliente);
		//$this->debug($tab_sem_cliente);

		print json_encode(array('success'=>true,'tab_com_cliente'=>$tab_com_cliente,'tab_sem_cliente'=>$tab_sem_cliente));
	}
	/**
	 * Preencher grade de informação de seguro
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function load_seguros() {
		$cte_id = intval($_GET['cte_id']);
		$clie_remetente_id = intval($_GET['clie_remetente_id']);
		$clie_coleta_id = intval($_GET['clie_coleta_id']);
		$clie_remetente_id = $clie_coleta_id > 0 ? $clie_coleta_id : $clie_remetente_id;
		$clie_expedidor_id = intval($_GET['clie_expedidor_id']);
		$clie_recebedor_id = intval($_GET['clie_recebedor_id']);
		$clie_entrega_id = intval($_GET['clie_entrega_id']);
		$clie_destinatario_id = intval($_GET['clie_destinatario_id']);
		$clie_destinatario_id = $clie_entrega_id > 0 ? $clie_entrega_id : $clie_destinatario_id;
		$clie_tomador_id = intval($_GET['clie_tomador_id']);

		if ($cte_id > 0) {
			$sql = "DELETE FROM ctes_seguro WHERE cte_id = ".$cte_id;
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}

		$list = array();

		if ($clie_remetente_id > 0) {
			$sql = "SELECT clie_seguradora, clie_apolice FROM clientes ";
			$sql.= "WHERE clie_id = ".$clie_remetente_id." ";
			$sql.= "AND clie_seguradora IS NOT NULL AND clie_seguradora != '' ";
			$query = $this->query($sql);
			$exist = $this->num_rows($query) > 0;
			if ($exist) {
				$field = $this->fetch_object($query);
				array_push($list, array(
					'cte_seg_id' => 0,
					'cte_id' => $cte_id,
					'cte_seg_responsavel' => 0,
					'cte_seg_responsavel_rotulo' => '0 - Remetente',
					'cte_seg_seguradora' => $field->clie_seguradora,
					'cte_seg_apolice' => $field->clie_apolice,
					'cte_seg_averbacao' => '',
					'cte_seg_valor_carga' => 0
				));
			}
			$this->free_result($query);
		}
		if ($clie_expedidor_id > 0) {
			$sql = "SELECT clie_seguradora, clie_apolice FROM clientes ";
			$sql.= "WHERE clie_id = ".$clie_expedidor_id." ";
			$sql.= "AND clie_seguradora IS NOT NULL AND clie_seguradora != '' ";
			$query = $this->query($sql);
			$exist = $this->num_rows($query) > 0;
			if ($exist) {
				$field = $this->fetch_object($query);
				array_push($list, array(
					'cte_seg_id' => 0,
					'cte_id' => $cte_id,
					'cte_seg_responsavel' => 1,
					'cte_seg_responsavel_rotulo' => '1 - Expedidor',
					'cte_seg_seguradora' => $field->clie_seguradora,
					'cte_seg_apolice' => $field->clie_apolice,
					'cte_seg_averbacao' => '',
					'cte_seg_valor_carga' => 0
				));
			}
			$this->free_result($query);
		}
		if ($clie_recebedor_id > 0) {
			$sql = "SELECT clie_seguradora, clie_apolice FROM clientes ";
			$sql.= "WHERE clie_id = ".$clie_recebedor_id." ";
			$sql.= "AND clie_seguradora IS NOT NULL AND clie_seguradora != '' ";
			$query = $this->query($sql);
			$exist = $this->num_rows($query) > 0;
			if ($exist) {
				$field = $this->fetch_object($query);
				array_push($list, array(
					'cte_seg_id' => 0,
					'cte_id' => $cte_id,
					'cte_seg_responsavel' => 2,
					'cte_seg_responsavel_rotulo' => '2 - Recebedor',
					'cte_seg_seguradora' => $field->clie_seguradora,
					'cte_seg_apolice' => $field->clie_apolice,
					'cte_seg_averbacao' => '',
					'cte_seg_valor_carga' => 0
				));
			}
			$this->free_result($query);
		}
		if ($clie_destinatario_id > 0) {
			$sql = "SELECT clie_seguradora, clie_apolice FROM clientes ";
			$sql.= "WHERE clie_id = ".$clie_destinatario_id." ";
			$sql.= "AND clie_seguradora IS NOT NULL AND clie_seguradora != '' ";
			$query = $this->query($sql);
			$exist = $this->num_rows($query) > 0;
			if ($exist) {
				$field = $this->fetch_object($query);
				array_push($list, array(
					'cte_seg_id' => 0,
					'cte_id' => $cte_id,
					'cte_seg_responsavel' => 3,
					'cte_seg_responsavel_rotulo' => '3 - Destinatário',
					'cte_seg_seguradora' => $field->clie_seguradora,
					'cte_seg_apolice' => $field->clie_apolice,
					'cte_seg_averbacao' => '',
					'cte_seg_valor_carga' => 0
				));
			}
			$this->free_result($query);
		}
		if (!empty($this->empresa->emp_seguradora)) {
			array_push($list, array(
				'cte_seg_id' => 0,
				'cte_id' => $cte_id,
				'cte_seg_responsavel' => 4,
				'cte_seg_responsavel_rotulo' => '4 - Emitente',
				'cte_seg_seguradora' => $this->empresa->emp_seguradora,
				'cte_seg_apolice' => $this->empresa->emp_apolice,
				'cte_seg_averbacao' => '',
				'cte_seg_valor_carga' => 0
			));
		}
		if ($clie_tomador_id > 0) {
			$sql = "SELECT clie_seguradora, clie_apolice FROM clientes ";
			$sql.= "WHERE clie_id = ".$clie_tomador_id." ";
			$sql.= "AND clie_seguradora IS NOT NULL AND clie_seguradora != '' ";
			$query = $this->query($sql);
			$exist = $this->num_rows($query) > 0;
			if ($exist) {
				$field = $this->fetch_object($query);
				array_push($list, array(
					'cte_seg_id' => 0,
					'cte_id' => $cte_id,
					'cte_seg_responsavel' => 5,
					'cte_seg_responsavel_rotulo' => '5 - Tomador de Serviço',
					'cte_seg_seguradora' => $field->clie_seguradora,
					'cte_seg_apolice' => $field->clie_apolice,
					'cte_seg_averbacao' => '',
					'cte_seg_valor_carga' => 0
				));
			}
			$this->free_result($query);
		}

		print json_encode(array('success'=>true,'records'=>$list));
	}
	/**
	 * Listagem alternativa para frete manual (VALOR CHEIO)
	 * @remotable
	 * @access public
	 * @return string $json
	 */
	function read_valor_cheio() {
		$valor_cheio = $_GET["valor_cheio"];
		$sql = "SELECT ";
		$sql.= "cc_id,";
		$sql.= "cf_id,";
		$sql.= "cf_tipo,";
		$sql.= "cf_nome,";
		$sql.= "cc_titulo,";
		$sql.= "0 AS ccc_valor,";
		$sql.= "0 AS ccc_valor_tarifa_kg,";
		$sql.= "0 AS ccc_valor_desconto,";
		$sql.= "0 AS ccc_percentual_desconto,";
		$sql.= "1 AS ccc_exibir_desconto_dacte,";
		$sql.= "cc_exibir_na_dacte AS ccc_exibir_valor_dacte,";
		$sql.= "NULL AS ccc_tabela,";
		$sql.= "NULL AS ccc_tipo_tarifa,";
		$sql.= "NULL AS ccc_tipo_advalorem ";
		$sql.= "FROM view_composicao_calculo ";
		$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
		$sql.= "AND cf_tipo > 1 ";
		$sql.= "ORDER BY cf_tipo, cf_id";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			if ($field->cf_id == 3) {
				$field->ccc_valor = $valor_cheio;
			}
			array_push($list, $field);
		}
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Componente do Valor da Prestação. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_comp_calculo() {
		$cte_id = intval($_GET['cte_id']);
		$cte_modal = intval($_GET['cte_modal']);
		$tabela_cliente = trim($_GET['tabela_cliente']);
		$cte_forma_pgto = intval($_GET['cte_forma_pgto']);
		$peso_taxado = floatval($_GET['cte_peso_bc']);
		$cte_valor_carga = floatval($_GET['cte_valor_carga']);
		$tabela_cliente_record = @json_decode($_GET['tabela_cliente_record']);
          if (empty($tabela_cliente_record) ) {
               $tabela_cliente_record = (object) array();
          }
		$produto_predominante = @json_decode($_GET['produto_predominante']);
          if (empty($produto_predominante) ) {
               $produto_predominante = (object) array();
          }
		$redespacho = @json_decode($_GET['redespacho']);
          if (empty($redespacho) ) {
               $redespacho = (object) array();
          }
		$tomador = @json_decode($_GET['tomador']);
          if (empty($tomador) ) {
               $tomador = (object) array();
          }
		$cidade_origem = @json_decode($_GET['cidade_origem']);
          if (empty($cidade_origem) ) {
               $cidade_origem = (object) array(
				"cid_id" => 0
			   );
          }
		$cidade_destino = @json_decode($_GET['cidade_destino']);
          if (empty($cidade_destino) ) {
               $cidade_destino = (object) array();
          }
		$list = array();

		$produto_predominante->gt_isento_icms = parse_boolean($produto_predominante->gt_isento_icms);
		$produto_predominante->gt_obrigar_especifica = parse_boolean($produto_predominante->gt_obrigar_especifica);

		$redespacho->red_valor = floatval($redespacho->red_valor);
		$redespacho->red_ate_kg = floatval($redespacho->red_ate_kg);
		$redespacho->red_excedente = floatval($redespacho->red_excedente);
		$redespacho->cid_id_passagem = intval($redespacho->cid_id_passagem);
		$redespacho->red_aceita_frete_a_pagar = parse_boolean($redespacho->red_aceita_frete_a_pagar);

		$tomador->clie_id = intval($tomador->clie_id);
		$tomador->clie_seguro_intra_estadual = floatval($tomador->clie_seguro_intra_estadual);
		$tomador->clie_seguro_inter_estadual = floatval($tomador->clie_seguro_inter_estadual);
		$tomador->clie_tom_taxa_sefaz = intval($tomador->clie_tom_taxa_sefaz);
		$tomador->clie_tom_aceita_suframa = parse_boolean($tomador->clie_tom_aceita_suframa);
		$tomador->num_notas = intval($tomador->num_notas);

		$tabela_cliente_record->nac_id = intval($tabela_cliente_record->nac_id);
		$tabela_cliente_record->min_id = intval($tabela_cliente_record->min_id);
		$tabela_cliente_record->exp_id = intval($tabela_cliente_record->exp_id);
		$tabela_cliente_record->clie_id = intval($tabela_cliente_record->clie_id);

		$cidade_destino->cid_suframa = parse_boolean($cidade_destino->cid_suframa);
		$cidade_destino->cid_valor_sefaz = floatval($cidade_destino->cid_valor_sefaz);
		$cidade_destino->cid_id = intval($cidade_destino->cid_id);
		
		// Adicionado por Nilton
		$cidade_origem->cid_id = intval($cidade_origem->cid_id);

		if ($cte_id > 0) {
			$sql = "SELECT ";
			$sql.= "t1.*,";
			$sql.= "t3.cf_nome,";
			$sql.= "t2.cc_titulo,";
			$sql.= "t2.cf_id,";
			$sql.= "t3.cf_tipo ";
			$sql.= "FROM ctes_comp_calculo AS t1 ";
			$sql.= "INNER JOIN composicao_calculo AS t2 ON t2.cc_id = t1.cc_id ";
			$sql.= "INNER JOIN composicao_frete AS t3 ON t3.cf_id = t2.cf_id ";
			$sql.= "WHERE t1.cte_id = ".$cte_id." ";
			$sql.= "ORDER BY t3.cf_tipo, t2.cf_id";
			//$this->debug($sql);
			$query = $this->query($sql);
			while ($field = $this->fetch_object($query)) {
				array_push($list, $field);
			}
		} else {
			$sql = "SELECT ";
			$sql.= "cc_id,";
			$sql.= "cf_id,";
			$sql.= "cf_tipo,";
			$sql.= "cf_nome,";
			$sql.= "cc_titulo,";
			$sql.= "0 AS ccc_valor,";
			$sql.= "0 AS ccc_valor_tarifa_kg,";
			$sql.= "0 AS ccc_valor_desconto,";
			$sql.= "0 AS ccc_percentual_desconto,";
			$sql.= "1 AS ccc_exibir_desconto_dacte,";
			$sql.= "cc_exibir_na_dacte AS ccc_exibir_valor_dacte,";
			$sql.= "NULL AS ccc_tabela,";
			$sql.= "NULL AS ccc_tipo_tarifa,";
			$sql.= "NULL AS ccc_tipo_advalorem ";
			$sql.= "FROM view_composicao_calculo ";
			$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
			$sql.= "AND cf_tipo > 1 ";
			$sql.= "ORDER BY cf_tipo, cf_id";
			$query = $this->query($sql);
			while ($field = $this->fetch_object($query)) {
				$field->ccc_tabela = $tabela_cliente_record->clie_id > 0 ? "TOMADOR" : "EMITENTE";
				$exist_taxa = false; //$this->debug($field->cf_tipo);
				if ($field->cf_tipo == 2) {
					// Frete
					if (preg_match("/NACIONAL/i", $tabela_cliente)) {
						$taxa_minima = $tabela_cliente_record->nac_taxa_minima;
						$tarifa_geral = $tarifa_especifica = null;
						$frete_geral = $frete_especifico = 0;

						$s = "SELECT ";
						$s.= "ger_peso_ate_kg AS peso_min,";
						$s.= "ger_valor ";
						$s.= "FROM geral ";
						$s.= "WHERE nac_id = ".$tabela_cliente_record->nac_id." ";
						$s.= "AND ger_peso_ate_kg >= ".$peso_taxado." ";
						$s.= "ORDER BY ger_peso_ate_kg ASC LIMIT 1";
						//$this->debug($s);
						$q = $this->query($s);
						$tarifa_geral = $this->fetch_object($q);
						$this->free_result($q);

						if (preg_match("/ESPECIFICA/i", $produto_predominante->prod_tarifa)) {
							$s = "SELECT ";
							$s.= "epc_valor ";
							$s.= "FROM especifica ";
							$s.= "WHERE nac_id = ".$tabela_cliente_record->nac_id." ";
							$s.= "AND gt_id_codigo = ".$produto_predominante->gt_id_codigo;
							//$this->debug($s);
							$q = $this->query($s);
							$tarifa_especifica = $this->fetch_object($q);
							$this->free_result($q);
						}

						if (!empty($tarifa_geral)) {
							$frete_geral = $tarifa_geral->ger_valor * $peso_taxado;
							$field->ccc_valor_tarifa_kg = $tarifa_geral->ger_valor;

						}
						if (!empty($tarifa_especifica)) {
							$frete_especifico = $tarifa_especifica->epc_valor * $peso_taxado;
							$field->ccc_valor_tarifa_kg = $tarifa_especifica->epc_valor;
						}

						if ($frete_especifico > 0 && ($frete_especifico < $frete_geral || $produto_predominante->gt_obrigar_especifica)) {
							$field->ccc_valor_tarifa_kg = $tarifa_especifica->epc_valor;
							$field->ccc_valor = $frete_especifico;
							$field->ccc_tipo_tarifa = 'ESPECÍFICA';
						} else {
							$field->ccc_valor_tarifa_kg = $tarifa_geral->ger_valor;
							$field->ccc_valor = $frete_geral;
							$field->ccc_tipo_tarifa = (($cte_modal == 1) ? 'NORMAL' : 'GERAL');
						}

						if ($field->ccc_valor <= $taxa_minima) {
							$field->ccc_valor = $taxa_minima;
							$field->ccc_valor_tarifa_kg = 0;
							$field->ccc_tipo_tarifa = (($cte_modal == 1) ? 'FRETE-PESO MÍNIMO' : 'MÍNIMA');
						}
					} elseif (preg_match("/ESPECIAL/i", $tabela_cliente)) {
						$_peso_taxado = ceil($peso_taxado);
						if ($_peso_taxado > $tabela_cliente_record->espfx_peso_ate_kg && $tabela_cliente_record->espfx_excedente > 0) {
							$field->ccc_valor = $tabela_cliente_record->espfx_valor + ($_peso_taxado - $tabela_cliente_record->espfx_peso_ate_kg) * $tabela_cliente_record->espfx_excedente;
						} else {
							$field->ccc_valor = $tabela_cliente_record->espfx_valor;
						}
						$field->ccc_valor_tarifa_kg = 0;
						$field->ccc_tipo_tarifa = 'NORMAL';
					} elseif (preg_match("/MINIMA/i", $tabela_cliente)) {
						$s = "SELECT ";
						$s.= "minfx_peso_ate_kg AS peso_min,";
						$s.= "minfx_valor ";
						$s.= "FROM minima_faixa ";
						$s.= "WHERE min_id = ".$tabela_cliente_record->min_id." ";
						$s.= "AND minfx_peso_ate_kg >= ".$peso_taxado." ";
						$s.= "ORDER BY minfx_peso_ate_kg ASC LIMIT 1";
						// $this->debug($s);
						$q = $this->query($s);
						$f = $this->fetch_object($q);

						$field->ccc_valor = $f->minfx_valor;
						$field->ccc_valor_tarifa_kg = 0;
						$field->ccc_tipo_tarifa = 'MÍNIMA';

						$this->free_result($q);
					} elseif (preg_match("/EXPRESSO/i", $tabela_cliente)) {
						if ($peso_taxado <= $tabela_cliente_record->exp_peso) {
							$field->ccc_valor = $f->minfx_valor = $tabela_cliente_record->exp_valor;
						} else {
							$s = "SELECT ";
							$s.= "peso_ate_kg AS peso_min,";
							$s.= "valor_excedente ";
							$s.= "FROM expresso_excedentes ";
							$s.= "WHERE exp_id = ".$tabela_cliente_record->exp_id." ";
							$s.= "AND peso_ate_kg >= ".$peso_taxado." ";
							$s.= "ORDER BY peso_ate_kg ASC LIMIT 1";
							// $this->debug($s);
							$q = $this->query($s);
							$f = $this->fetch_object($q);

							$field->ccc_valor = $tabela_cliente_record->exp_valor + (($peso_taxado - $tabela_cliente_record->exp_peso) * $f->valor_excedente);

							$this->free_result($q);
						}

						$field->ccc_valor_tarifa_kg = 0;
						$field->ccc_tipo_tarifa = (($cte_modal == 1) ? 'FRETE-PESO MÍNIMO' : 'MÍNIMA');
					}
				} elseif ($field->cf_tipo == 3 && $redespacho->cid_id_passagem > 0) {
					// Redespacho
					if ($redespacho->red_aceita_frete_a_pagar || $cte_forma_pgto != 1) {
						$field->ccc_tipo_tarifa = 'ACEITA FRETE À PAGAR ';
						$field->ccc_valor = $redespacho->red_valor;
						if ($peso_taxado > $redespacho->red_ate_kg) {
							$field->ccc_valor = $redespacho->red_valor + (($peso_taxado - $redespacho->red_ate_kg) * $redespacho->red_excedente);
							$field->ccc_valor_tarifa_kg = @($field->ccc_valor / $peso_taxado);
							$field->ccc_tipo_tarifa.= '(R$ '.float_to_money($redespacho->red_valor).' até '.float_to_decimal($redespacho->red_ate_kg,1).'kg COM EXCEDENTE R$ '.float_to_money($redespacho->red_excedente).'/kg)';
						} else {
							$field->ccc_tipo_tarifa.= '(SEM EXCEDENTE)';
						}
					} else {
						$field->ccc_valor = 0;
						$field->ccc_tipo_tarifa = 'LOCALIDADE DE REDESPACHO NÃO ACEITA FRETE À PAGAR';
					}
				} elseif ($field->cf_tipo == 4 && $cte_valor_carga > 0) {
					// Seguro
					if (preg_match("/GRIS/i", $field->cf_nome)) {
						if ($tomador->clie_gris_percentual > 0) {
							$field->ccc_valor = ($cte_valor_carga * ($tomador->clie_gris_percentual / 100));
							if ($field->ccc_valor < $tomador->clie_gris_valor_minimo) {
								$field->ccc_valor = $tomador->clie_gris_valor_minimo;
							}
							$field->ccc_tabela = 'TOMADOR';
							$field->ccc_tipo_tarifa = 'Gerenciamento de Risco e Segurança (alíquota de '.float_to_decimal($tomador->clie_gris_percentual, 1).' % com valor mínimo de R$ '.float_to_money($tomador->clie_gris_valor_minimo).')';
						} else {
							$field->ccc_valor = 0;
							$field->ccc_tabela = 'TOMADOR';
							$field->ccc_tipo_tarifa = 'Alíquota GRIS não definida no tomador';
						}
					} elseif ($cte_modal == 1 && $tomador->clie_forma_aplicar_seguro == 'Taxa RCTR-C') {
						$s = "SELECT percentual FROM seguro_rctrc ";
						$s.= "WHERE emp_id = ".$this->empresa->emp_id." ";
						$s.= "AND uf_origem = ".$this->escape($cidade_origem->cid_uf)." ";
						$s.= "AND uf_destino = ".$this->escape($cidade_destino->cid_uf)." ";
						$s.= "AND percentual > 0";
						// $this->debug($s);
						$q = $this->query($s);
						$percentual = $this->fetch_object($q)->percentual;
						$this->free_result($q);
						$field->ccc_valor = 0;
						$field->ccc_tabela = 'Seguro RCTR-C';
						$field->ccc_tipo_advalorem = '1 - Normal';
						$field->ccc_tipo_tarifa = 'Tabela de Seguro RCTR-C não informada';
						if ($percentual > 0) {
							$field->ccc_valor = ($cte_valor_carga * ($percentual / 100));
							$field->ccc_tipo_tarifa = 'Taxa aplicada ('.float_to_decimal($percentual, 1).' %)';
						}
					} else {
						$valor_maximo = $this->empresa->emp_taxa_min_nac * 100;
						if ($produto_predominante->iic_codigo == 'VAL') {
							$valor_maximo = $this->empresa->emp_taxa_min_nac * 50;
						}
						$valor_mercadoria_kg = @($cte_valor_carga / $peso_taxado);
						if ($valor_mercadoria_kg > $valor_maximo) {
							$field->ccc_tipo_advalorem = '2 - Valor dobrado';
							$field->ccc_tipo_tarifa = '2 - Valor dobrado. Excedeu taxa mínima do seguro';
						} else {
							$field->ccc_tipo_tarifa = $produto_predominante->prod_tipo_advalorem;
							$field->ccc_tipo_advalorem = $produto_predominante->prod_tipo_advalorem;
						}
						if ($field->ccc_tipo_advalorem == '1 - Normal') {
							if ($tomador->clie_forma_aplicar_seguro == 'Intra/Inter Estadual') {
								$field->ccc_tabela = 'TOMADOR';
								if ($cidade_origem->cid_uf == $cidade_destino->cid_uf) {
									$field->ccc_valor = $cte_valor_carga * $tomador->clie_seguro_intra_estadual;
									$field->ccc_tipo_tarifa.= ' (Intra Estadual)';
								} else {
									$field->ccc_valor = $cte_valor_carga * $tomador->clie_seguro_inter_estadual;
									$field->ccc_tipo_tarifa.= ' (Inter Estadual)';
								}
							} elseif ($tomador->clie_forma_aplicar_seguro == 'Ad valorem Tipo 1 e 2') {
								$field->ccc_tabela = 'TOMADOR';
								$field->ccc_valor = $cte_valor_carga * $tomador->clie_seguro_adval_tipo_1;
								$field->ccc_tipo_tarifa.= ' (Ad valorem Tipo 1)';
							} else {
								$field->ccc_tabela = 'EMITENTE';
								$field->ccc_valor = @($cte_valor_carga / 300);
								$field->ccc_tipo_tarifa.= ' (Ad valorem Padrão)';
							}
						} elseif ($field->ccc_tipo_advalorem == '2 - Valor dobrado') {
							if ($tomador->clie_forma_aplicar_seguro == 'Ad valorem Tipo 1 e 2') {
								$field->ccc_tabela = 'TOMADOR';
								$field->ccc_valor = $cte_valor_carga * $tomador->clie_seguro_adval_tipo_2;
							} else {
								$field->ccc_tabela = 'EMITENTE';
								$field->ccc_valor = @($cte_valor_carga / 150);
							}
							$field->ccc_tipo_tarifa.= ' (Ad valorem Tipo 2)';
						} else {
							$field->ccc_tabela = 'EMITENTE';
							$field->ccc_valor = $cte_valor_carga * 0.03;
						}
						if ($field->ccc_valor > 0 && $tomador->clie_seguro_desconto > 0) {
							$field->ccc_valor = $field->ccc_valor - ($field->ccc_valor * ($tomador->clie_seguro_desconto / 100));
							$field->ccc_tipo_tarifa.= ' (Desconto '.set_decimal($tomador->clie_seguro_desconto, 1).'%)';
						}
					}
				} elseif ($field->cf_tipo == 5) {
					// Taxas
					$_peso_taxado = round($peso_taxado, 0);

					$s = "SELECT ";
					$s.= "t2.cc_id,";
					$s.= "t2.cf_id,";
					$s.= "t1.cid_id,";
					$s.= "t1.clie_id,";
					$s.= "t1.tx_por_peso,";
					$s.= "t1.tx_valor,";
					$s.= "t1.tx_ate_kg,";
					$s.= "t1.tx_excedente,";
					$s.= "t1.tx_nota ";
					$s.= "FROM taxas AS t1 ";
					$s.= "INNER JOIN composicao_calculo AS t2 ON t2.cc_id = t1.cc_id ";
					$s.= "WHERE t1.emp_id = ".$this->empresa->emp_id." ";
					$s.= "AND (t1.clie_id = ".$tomador->clie_id." OR ISNULL(t1.clie_id)) ";
					$s.= "AND (t1.cid_origem_id = ".$cidade_origem->cid_id." OR ISNULL(t1.cid_origem_id)) ";
					$s.= "AND (t1.cid_id = ".$cidade_destino->cid_id." OR ISNULL(t1.cid_id)) ";
					$s.= "AND t1.clie_id NOT IN (SELECT t3.clie_id FROM taxas_excecoes_clientes AS t3 WHERE t3.tx_id = t1.tx_id AND t3.clie_id = ".$tomador->clie_id.") ";
					$s.= "AND t2.cf_id = ".$field->cf_id." ";
					$s.= "ORDER BY t1.cc_id, t2.cf_id, t1.cid_origem_id, t1.cid_id, t1.clie_id";
					$this->debug($s);
					$q = $this->query($s);
					$exist_taxa = $this->num_rows($q) > 0;

					if ($exist_taxa) {
						while ($f = $this->fetch_object($q)) {
							$_field = clone $field;
							$_field->ccc_tabela = $f->clie_id > 0 ? "TOMADOR" : "EMITENTE";
							
							if ($f->tx_por_peso) {
								if ($_peso_taxado > $f->tx_ate_kg && $f->tx_excedente > 0) {
									$_field->ccc_valor = $f->tx_valor + ($_peso_taxado - $f->tx_ate_kg) * $f->tx_excedente;
									$_field->ccc_valor_tarifa_kg = $f->tx_excedente;
									$_field->ccc_tipo_tarifa = 'TAXA R$ '.float_to_money($f->tx_valor).' ATÉ '.float_to_decimal($f->tx_ate_kg, 1).'kg COM EXCEDENTE R$ '.float_to_money($f->tx_excedente).'/kg';
								} else {
									$_field->ccc_valor = floatval($f->tx_valor);
									$_field->ccc_tipo_tarifa = $f->tx_valor > 0 ? 'TAXA POR PESO SEM EXCEDENTE' : '';
									$_field->cc_valor_tarifa_kg = ($_peso_taxado > 0 && $_field->ccc_valor > 0) ? ($_field->ccc_valor / $_peso_taxado) : 0;
									$this->debug($_field);
								}
							} else {
								$_field->ccc_valor = $f->tx_valor;
								$_field->ccc_tipo_tarifa = $f->tx_valor > 0 ? 'TAXA POR CT-E' : '';
							}

							if (!empty($f->tx_nota)) {
								$_field->cc_titulo.=': ';
								$_field->cc_titulo.= $f->tx_nota;
							}

							array_push($list, $_field);
						}
					} else {
						$field->ccc_tabela = 'NÃO DEFINIDO';
						$field->ccc_tipo_tarifa = 'TAXA NÃO DEFINIDA';
					}

					$this->free_result($q);
				} elseif ($field->cf_tipo == 6) {
					if (preg_match("/TAS/i", $field->cf_nome)) {
						$field->ccc_tabela = 'TOMADOR';
						if ($cidade_destino->cid_valor_sefaz > 0) {
							switch ($tomador->clie_tom_taxa_sefaz) {
								case 1:
									$field->ccc_valor = $tomador->num_notas * $cidade_destino->cid_valor_sefaz;
									$field->ccc_tipo_tarifa = 'TAXA * '.$tomador->num_notas.' NF(s)';
									break;
								case 2:
									$field->ccc_valor = $cidade_destino->cid_valor_sefaz;
									$field->ccc_tipo_tarifa = 'TAXA POR CT-e';
									break;
								case 3:
									$field->ccc_valor = 0;
									$field->ccc_tipo_tarifa = 'TAXA NÃO PODE SER COBRADA';
									break;
							}
						} else {
							$field->ccc_valor = 0;
							$field->ccc_tabela = 'EMITENTE';
							$field->ccc_tipo_tarifa = 'MUNICÍPIO ISENTO DE TAXA';
						}
					} elseif (preg_match("/SUFRAMA/i", $field->cf_nome)) {
						if ($cte_valor_carga > 0 && $cidade_destino->cid_suframa) {
							$field->ccc_tabela = 'TOMADOR';
							if ($tomador->clie_tom_aceita_suframa) {
								$field->ccc_valor = $cte_valor_carga * 0.01;
								$field->ccc_tipo_tarifa = '1% SOBRE VALOR DA CARGA';
							} else {
								$field->ccc_valor = 0;
								$field->ccc_tipo_tarifa = 'TAXA NÃO ACEITA PELO TOMADOR';
							}
						} else {
							$field->ccc_valor = 0;
							$field->ccc_tipo_tarifa = 'VALOR NÃO DECLARADO OU MUNICÍPIO ISENTO DE TAXA';
						}
					} elseif (preg_match("/ICMS/i", $field->cf_nome)) {
						$field->ccc_valor = 0;
						$field->ccc_tabela = 'EMITENTE';
						if ($this->empresa->emp_simples_nacional) {
							$field->ccc_tipo_tarifa = 'OPTANTE PELO SIMPLES NACIONAL';
						} elseif ($produto_predominante->gt_isento_icms) {
							$field->ccc_tipo_tarifa = 'GRUPO DE TARIFA ISENTO DE ICMS';
						} elseif ($cte_modal == 1 && $cidade_origem->cid_uf == 'MG' && $cidade_destino->cid_uf == 'MG') {
							$field->ccc_tipo_tarifa = 'ESTADO DE MG ISENTO DE ICMS (INTERMUNICIPAL)';
						} elseif ($cte_valor_carga <= 0) {
							$field->ccc_tipo_tarifa = 'VALOR DA CARGA NAO DECLARADO, ICMS NÃO TRIBUTADO';
						}
					}
				}

				$s = "SELECT dtc_desconto, dtc_exibir_na_dacte ";
				$s.= "FROM desconto_taxa_clie ";
				$s.= "WHERE cc_id = ".$field->cc_id." ";
				$s.= "AND clie_id = ".$tomador->clie_id;
				// $this->debug($s);
				$q = $this->query($s);
				$existente = $this->num_rows($q) > 0;
				$desconto = $existente ? $this->fetch_object($q) : null;
				$this->free_result($q);

				if (empty($desconto)) {
					$field->ccc_valor_desconto = 0;
					$field->ccc_percentual_desconto = 0;
					$field->ccc_exibir_desconto_dacte = 0;
				} elseif ($field->ccc_valor > 0) {
					$field->ccc_exibir_desconto_dacte = $desconto->dtc_exibir_na_dacte;
					$field->ccc_percentual_desconto = $desconto->dtc_desconto;
					$field->ccc_valor_desconto = $field->ccc_valor - set_decimal(desconto_percentual($desconto->dtc_desconto, $field->ccc_valor));
					$field->ccc_valor -= $field->ccc_valor_desconto;
				}

				if (!$exist_taxa) {
					array_push($list, $field);
				}
			}
		}
		$this->free_result($query);
		$this->debug($list);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Emitentes Anteriores através do CT-e em edição. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_eda() {
		$sql = "SELECT * FROM ctes_emitentes_ant ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY cte_eda_raz_social_nome";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Documentos Anteriores Do Emitente Selecionado. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_dta() {
		$sql = "SELECT t1.* FROM ctes_doc_transp_ant AS t1 ";
		$sql.= "INNER JOIN ctes_emitentes_ant AS t2 ON t2.cte_eda_id = t1.cte_eda_id ";
		$sql.= "WHERE t1.cte_eda_id = ".intval($_GET['cte_eda_id'])." ";
		$sql.= "AND t2.cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY t1.cte_dta_data_emissao";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
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
	 * Consultar Produtos Perigosos do CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_produtos_perigosos() {
		$sql = "SELECT * FROM ctes_prod_perigosos ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY prod_nome_embarque, prod_grupo_embalagem";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Veículos Novos do CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_vn() {
		$sql = "SELECT * FROM ctes_veiculos_novos ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY cte_vn_modelo";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Cubagem/Dimensões usada no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_cubagem() {
		$sql = "SELECT * FROM ctes_dimensoes ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY cte_dim_tipo_embalagem, cte_dim_volumes, cte_dim_peso_bruto";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Coleta Associada Rodoviário no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_coleta() {
		$sql = "SELECT * FROM ctes_rod_coletas ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY oca_data_emissao";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Lacres no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_lacre() {
		$sql = "SELECT * FROM ctes_rod_lacres ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY lac_numero";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Vales Pedágios no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_vp() {
		$sql = "SELECT * FROM ctes_rod_vale_pedagio ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY cte_vp_valor_vale";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Veículos (VUC) no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_vuc() {
		$sql = "SELECT * FROM ctes_rod_veiculos ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY cte_rv_placa";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Motoristas no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_motorista() {
		$sql = "SELECT * FROM ctes_rod_motoristas ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY cte_mo_motorista";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Salvar Motoristas no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_motorista() {
		$cte_id = intval($_POST['cte_id']);
		$cte_mo_id = intval($_POST['cte_mo_id']);
		$cte_mo_cpf = $this->escape(trim($_POST['cte_mo_cpf']), "string");
		$cte_mo_motorista = $this->escape(trim($_POST['cte_mo_motorista']), "string");

		$sql = ($cte_mo_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "ctes_rod_motoristas SET ";
		$sql.= "cte_id = ".$cte_id.",";
		$sql.= "cte_mo_cpf = ".$cte_mo_cpf.",";
		$sql.= "cte_mo_motorista = ".$cte_mo_motorista." ";
		$sql.= ($cte_mo_id > 0) ? "WHERE cte_mo_id = ".$cte_mo_id : "";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$cte_mo_id) {
			$cte_mo_id = $this->insert_id();
		}
		print json_encode(array('success'=>true,'cte_mo_id'=>$cte_mo_id));
	}
	/**
	 * Excluir Motoristas no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_motorista() {
		$sql = "DELETE FROM ctes_rod_motoristas WHERE cte_mo_id IN (".trim($_POST['cte_mo_id']).")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array("success"=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar Observações Fisco no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_ocf() {
		$sql = "SELECT * FROM ctes_obs_contr_fisco ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY cte_ocf_titulo";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Consultar Seguros usado no CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_seguros() {
		$sql = "SELECT *,";
		$sql.= "CASE cte_seg_responsavel ";
		$sql.= "WHEN 0 THEN '0 - Remetente' ";
		$sql.= "WHEN 1 THEN '1 - Expedidor' ";
		$sql.= "WHEN 2 THEN '2 - Recebedor' ";
		$sql.= "WHEN 3 THEN '3 - Destinatário' ";
		$sql.= "WHEN 4 THEN '4 - Emitente do CT-e' ";
		$sql.= "WHEN 5 THEN '5 - Tomador de Serviço' ";
		$sql.= "END AS cte_seg_responsavel_rotulo ";
		$sql.= "FROM ctes_seguro ";
		$sql.= "WHERE cte_id = ".intval($_GET['cte_id'])." ";
		$sql.= "ORDER BY cte_seg_responsavel, cte_seg_seguradora";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Validar CT-e. Uso exclusivo do Ajax Request
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function validar() {
		$cte_id = intval($_POST['cte_id']);
		$prod_id = intval($_POST['prod_id']);
		$cte_valor_carga = floatval($_POST['cte_valor_carga']);
		$cte_tipo_do_cte = intval($_POST['cte_tipo_do_cte']);
		$cte_tipo_servico = intval($_POST['cte_tipo_servico']);
		$clie_remetente_id = intval($_POST['clie_remetente_id']);
		$clie_destinatario_id = intval($_POST['clie_destinatario_id']);
		$clie_expedidor_id = intval($_POST['clie_expedidor_id']);
		$clie_recebedor_id = intval($_POST['clie_recebedor_id']);
		$cte_chave_referenciado = trim($_POST['cte_chave_referenciado']);
		$cte_data_hora_emissao = $this->escape(trim($_POST['cte_data_hora_emissao']), 'date');
		$cte_valor_total = $this->escape(trim($_POST['cte_valor_total']), 'decimal');
		$cte_valor_icms = $this->escape(trim($_POST['cte_valor_icms']), 'decimal');
		$cte_modal = intval($_POST['cte_modal']);
		$cte_data_entrega_prevista = trim($_POST['cte_data_entrega_prevista']);

		$erros = 0;

		$html ='<table cellpadding="5" cellspacing="5" style="color:white;">';
		$html.='<tr>';
		$html.='<th style="width:200px; border-bottom:1px solid;">CAMPO</th>';
		$html.='<th style="width:200px; border-bottom:1px solid;">ABA/GUIA</th>';
		$html.='<th style="width:500px; border-bottom:1px solid;">DETALHES</th>';
		$html.='</tr>';

		$sql = "SELECT t1.clie_razao_social FROM clientes AS t1 ";
		$sql.= "INNER JOIN clientes_fatura AS t2 ON t2.clie_id_fk = t1.clie_id ";
		$sql.= "INNER JOIN ctes AS t3 ON t3.clie_tomador_id = t1.clie_id ";
		$sql.= "WHERE t2.cliefat_status_cobranca = 'I' ";
		$sql.= "AND t3.cte_id = ".$cte_id;
		$query = $this->query($sql);
		if ($this->num_rows($query)) {
			$field = $this->fetch_object($query);
			if (!empty($field->clie_razao_social)) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Tomador (pagador)</td>';
				$html.='<td>1. Dados CT-e</td>';
				$html.='<td>Cliente '.$field->clie_razao_social.' inadimplente, consultar departamento financeiro.</td>';
				$html.='</tr>';
			}
		}
		$this->free_result($query);

		if ($cte_tipo_do_cte == 0 || $cte_tipo_do_cte == 3) {
			if ($cte_valor_carga < 0) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Valor da Carga</td>';
				$html.='<td>4. Inf. da Carga</td>';
				$html.='<td>Campo não pode ser < 0 (menor que zero)</td>';
				$html.='</tr>';
			}

			if (!$prod_id) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Produto Predominante</td>';
				$html.='<td>4. Inf. da Carga</td>';
				$html.='<td>Preenchimento obrigatório para CT-e Normal ou Substituto</td>';
				$html.='</tr>';
			}

			if ($cte_tipo_servico > 0 && $cte_tipo_servico < 4) {
				$sql = "SELECT COUNT(t1.cte_dta_id) AS existente ";
				$sql.= "FROM ctes_doc_transp_ant AS t1 ";
				$sql.= "INNER JOIN ctes_emitentes_ant AS t2 ON t2.cte_eda_id = t1.cte_eda_id ";
				$sql.= "WHERE t2.cte_id = ".$cte_id." ";
				$sql.= "AND (IF(t2.cte_eda_tipo_doc = 'CNPJ', IF(t2.cte_eda_cnpj IS NULL OR t2.cte_eda_cnpj = '', 1, 0), IF(t2.cte_eda_cpf IS NULL OR t2.cte_eda_cpf = '', 1, 0)) = 1 ";
				$sql.= "OR t2.cte_eda_raz_social_nome IS NULL ";
				$sql.= "OR t2.cte_eda_raz_social_nome = '' ";
				$sql.= "OR t1.cte_dta_numero IS NULL ";
				$sql.= "OR t1.cte_dta_numero = '' ";
				$sql.= "OR t1.cte_dta_data_emissao IS NULL ";
				$sql.= "OR t1.cte_dta_data_emissao = '' ";
				$sql.= "OR t1.cte_dta_data_emissao = '0000-00-00')";
				$query = $this->query($sql);
				$existente = $this->fetch_object($query)->existente > 0;
				$this->free_result($query);
				if ($existente) {
					$erros++;
					$html.='<tr>';
					$html.='<td>Emitentes e Documentos Anteriores</td>';
					$html.='<td>5. Doc. de Transp. Ant</td>';
					$html.='<td>Grupo de Emitentes e Documentos Anteriores devem ser informados</td>';
					$html.='</tr>';
				}
			}
		} elseif ($cte_tipo_do_cte == 2) {
			if (empty($cte_chave_referenciado)) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Chave de Acesso do CT-e referenciado</td>';
				$html.='<td>1. Dados CT-e</td>';
				$html.='<td>Preenchimento obrigatório para finalide de emissão: CT-e de Anulação</td>';
				$html.='</tr>';
			} else {
				$sql = "SELECT COUNT(*) AS existente FROM ctes ";
				$sql.= "WHERE emp_id = ".$this->empresa->emp_id." ";
				$sql.= "AND id != ".$cte_id." ";
				$sql.= "AND cte_chave = ".$this->escape($cte_chave_referenciado, 'string')." ";
				$sql.= "AND cte_situacao = 'AUTORIZADO' ";
				$sql.= "AND (cte_tipo_do_cte = 0 OR cte_tipo_do_cte = 3) ";
				$sql.= "AND cte_forma_emissao = 1 ";
				$sql.= "AND DATEDIFF(".$cte_data_hora_emissao.", cte_data_hora_emissao) <= 60 ";
				$sql.= "AND cte_valor_total = ".$cte_valor_total." ";
				$sql.= "AND cte_valor_icms  = ".$cte_valor_icms;
				$query = $this->query($sql);
				$existente = $this->fetch_object($query)->existente > 0;
				$this->free_result($query);
				if (!$existente) {
					$erros++;
					$html.='<tr>';
					$html.='<td>Chave de Acesso do CT-e referenciado</td>';
					$html.='<td>1. Dados CT-e</td>';
					$html.='<td>CT-e referenciado não pode ser anulado devido aos seguintes motivos: Não autorizado, Finalidade de emisão não é Normal ou Substituto, Forma de emissão não é Normal, Data de emissão superior a 60 dias, Valor do serviço prestado e/ou do ICMS não confere</td>';
					$html.='</tr>';
				}
			}
		}

		if ($cte_tipo_servico != 3) {
			$sql = "SELECT COUNT(*) AS existente FROM ctes_documentos WHERE cte_id = ".$cte_id;
			$query = $this->query($sql);
			$existente = $this->fetch_object($query)->existente > 0;
			$this->free_result($query);
			if (!$existente) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Documentos</td>';
				$html.='<td>3. Inf. Documentos</td>';
				$html.='<td>Preenchimento obrigatório de documentos (NF-e, NF ou Outros)</td>';
				$html.='</tr>';
			}
		}

		if ($cte_tipo_servico < 3) {
			if (!$clie_remetente_id) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Remetente</td>';
				$html.='<td>1. Dados CT-e</td>';
				$html.='<td>Remetente não informado para o tipo de serviço: Normal, Redespacho ou Subcontratação</td>';
				$html.='</tr>';
			}

			if (!$clie_destinatario_id) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Destinatário</td>';
				$html.='<td>1. Dados CT-e</td>';
				$html.='<td>Destinatário não informado para o tipo de serviço: Normal, Redespacho ou Subcontratação</td>';
				$html.='</tr>';
			}
		} elseif ($cte_tipo_servico > 2) {
			if (!$clie_expedidor_id) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Expedidor</td>';
				$html.='<td>1. Dados CT-e</td>';
				$html.='<td>Expedidor não informado para o tipo de serviço: Redespacho Intermediário ou Serviço Vinculado à Multimodal</td>';
				$html.='</tr>';
			}

			if (!$clie_recebedor_id) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Recebedor</td>';
				$html.='<td>1. Dados CT-e</td>';
				$html.='<td>Recebedor não informado para o tipo de serviço: Redespacho Intermediário ou Serviço Vinculado à Multimodal</td>';
				$html.='</tr>';
			}

			if ($cte_tipo_servico == 4 && empty($cte_chave_referenciado)) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Chave de Acesso do CT-e referenciado</td>';
				$html.='<td>1. Dados CT-e</td>';
				$html.='<td>Preenchimento obrigatório para tipo de serviço: Serviço Vinculado à Multimodal</td>';
				$html.='</tr>';
			}
		}

		if ($cte_modal == 1) {
			$sql = "SELECT COUNT(*) AS existente FROM ctes_seguro WHERE cte_id = ".$cte_id;
			$query = $this->query($sql);
			$existente = $this->fetch_object($query)->existente > 0;
			$this->free_result($query);
			if ($existente) {
				$sql = "SELECT COUNT(*) AS existente FROM ctes_seguro ";
				$sql.= "WHERE cte_id = ".$cte_id." ";
				$sql.= "AND (cte_seg_seguradora IS NULL OR cte_seg_seguradora = '') ";
				$sql.= "AND (cte_seg_apolice IS NULL OR cte_seg_apolice != '') ";
				$query = $this->query($sql);
				$existente = $this->fetch_object($query)->existente > 0;
				$this->free_result($query);
				if ($existente) {
					$erros++;
					$html.='<tr>';
					$html.='<td>Informação do Seguro</td>';
					$html.='<td>4. Inf. da Carga</td>';
					$html.='<td>Preenchimento obrigatório dos campos Seguradora e Apólice</td>';
					$html.='</tr>';
				}
			} else {
				$erros++;
				$html.='<tr>';
				$html.='<td>Informação do Seguro</td>';
				$html.='<td>4. Inf. da Carga</td>';
				$html.='<td>Preenchimento obrigatório da grade</td>';
				$html.='</tr>';
			}

			if ($cte_tipo_do_cte == 0 && empty($cte_data_entrega_prevista)) {
				$erros++;
				$html.='<tr>';
				$html.='<td>Data Prevista de Entrega</td>';
				$html.='<td>10. Rodoviário</td>';
				$html.='<td>Data prevista de entrega no recebedor deve ser informada</td>';
				$html.='</tr>';
			}
		} elseif ($cte_modal == 2) {
			$sql = "SELECT COUNT(*) AS existente FROM ctes_dimensoes WHERE cte_id = ".$cte_id;
			$query = $this->query($sql);
			$existente = $this->fetch_object($query)->existente > 0;
			$this->free_result($query);
			if ($existente) {
				$sql = "SELECT COUNT(*) AS existente FROM ctes_dimensoes ";
				$sql.= "WHERE cte_id = ".$cte_id." ";
				$sql.= "AND cte_dim_cubagem_m3 <= 0 ";
				$query = $this->query($sql);
				$existente = $this->fetch_object($query)->existente > 0;
				$this->free_result($query);
				if ($existente) {
					$erros++;
					$html.='<tr>';
					$html.='<td>Quantidades da Carga e Dimensões/Cubagem</td>';
					$html.='<td>4. Inf. da Carga</td>';
					$html.='<td>Preenchimento da cubagem em m³ obrigatório</td>';
					$html.='</tr>';
				}
			} else {
				$erros++;
				$html.='<tr>';
				$html.='<td>Quantidades da Carga e Dimensões/Cubagem</td>';
				$html.='<td>4. Inf. da Carga</td>';
				$html.='<td>Preenchimento obrigatório da grade</td>';
				$html.='</tr>';
			}
		}

		$html.'</table>';
		$html = '<p style="color:white;">O sistema detectou ('.$erros.') erros. Veja abaixo as informações:</p>'.$html;

		if (!$erros) {
			$sql = "UPDATE ctes SET cte_situacao = 'VALIDADO' WHERE cte_id = ".$cte_id;
			if(!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}

		print json_encode(array('success'=>true,'erros'=>$erros,'html'=>$html));
	}
	/**
	 * Transmitir CT-e para SEFAZ. Uso exclusivo do Ajax Request
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function transmitir() {
		$path = '../files';
		if (!is_dir($path)) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		
		$list_id = trim($_POST['id']);
		
		$sql = "UPDATE ctes SET cte_situacao = 'TRANSMITIDO', cte_monitor_action = 'SUBMIT' WHERE cte_id IN (".$list_id.") AND cte_situacao = 'VALIDADO'";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		sleep(15);
		
		print json_encode(array('success'=>true));
	}
	/**
	 * Cancelar cte enviado para SEFAZ. Uso exclusivo do Ajax Request
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function cancelar() {
		$path = '../files';
		if (!is_dir($path)) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		
		$list_id = trim($_POST['id']);
		
		if ($this->empresa->emp_tipo_emitente == 'ND') {
			$records = explode(",", $list_id);
			foreach ($records as $id) {
				$sql = "UPDATE ctes SET ";
				$sql.= "cte_situacao = 'CANCELADO' ";
				$sql.= "WHERE cte_id = ".$id;
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
				$this->registrar_evento(array(
					'cte_id' => $cte_id,
					'codigo' => '135',
					'protocolo' => now(),
					'mensagem' => 'Usuário '.$this->usuario->user_nome.' solicitou cancelamento ND'
				));
			}
		} else {
			$sql = "UPDATE ctes SET cte_monitor_action = 'CANCEL' WHERE cte_id IN (".$list_id.") AND cte_situacao = 'AUTORIZADO'";
			$this->debug($sql);
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
			sleep(15);
		}
		print json_encode(array('success'=>true));
	}
	/**
	 * Inutilizar faixa de cte inexistente. Uso exclusivo do Ajax Request
	 * @remotable
	 * @access public
	 * @return output (json)
	 **/
	function inutilizar() {
		$path = '../files';
		if (!is_dir($path)) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		
		$faixa_inicio = intval($_POST['faixa_inicio']);
		$faixa_fim = intval($_POST['faixa_fim']);
		$justifique = trim($_POST['justifique']);
		
		for ($i=$faixa_inicio; $i<=$faixa_fim; $i++) {
			$sql = "INSERT INTO ctes SET ";
			$sql.= "emp_id = ".$this->empresa->emp_id.",";
			$sql.= "cte_serie = ".$serie.",";
			$sql.= "cte_numero = ".$i.",";
			$sql.= "cte_data_hora_emissao = NOW(),";
			$sql.= "cte_situacao = 'INUTILIZAR',";
			$sql.= "cte_monitor_action = 'INUTILIZE',";
			$sql.= "cte_obs_gerais = '".$justifique."' ";
			if (!$this->query($sql)) {
				$this->debug($sql);
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		sleep(15);
		print json_encode(array('success'=>true));
	}
	/**
	 * Gravar evento de retorno do WebService
	 * @access private
	 * @param $data array assoc
	 * @param $checkExist boolean
	 * @return bool
	 */
	private function registrar_evento($data, $checkExist=false) {
		$data['cte_id'] = intval($data['cte_id']);
		$data['codigo'] = $this->escape($data['codigo'], "string");
		$data['mensagem'] = $this->escape($data['mensagem'], "string");
		$data['protocolo'] = $this->escape($data['protocolo'], "string");

		if ($checkExist === true) {
			$sql = "SELECT COUNT(*) AS existente FROM ctes_eventos ";
			$sql.= "WHERE cte_id = ".$data['cte_id']." ";
			$sql.= "AND cte_ev_evento = ".$data['codigo']." ";
			$sql.= "AND cte_ev_detalhe = ".$data['mensagem'];
			$query = $this->query($sql);
			$exist = $this->fetch_object($query)->existente > 0;
			$this->free_result($query);
			if ($exist) {
				return true;
			}
		}

		$sql = "INSERT INTO ctes_eventos SET ";
		$sql.= "cte_id = ".$data['cte_id'].",";
		$sql.= "cte_ev_evento = ".$data['codigo'].",";
		$sql.= "cte_ev_protocolo = ".$data['protocolo'].",";
		$sql.= "cte_ev_detalhe = ".$data['mensagem'].",";
		$sql.= "cte_ev_data_hora = NOW() ";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		return true;
	}
	/**
	 * Consultar eventos do CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_eventos() {
		$sql = "SELECT * FROM ctes_eventos WHERE cte_id = ".intval($_GET['cte_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
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
	 * Salvar ocorrências do CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_ocorrencias() {
		$ocor_id = intval($_POST['ocor_id']);
		if (!$ocor_id) {
			print json_encode(array('success'=>false,'msg'=>'Não possível salvar a ocorrência porque o ID da ocorrência ainda não foi selecionada'));
			return false;
		}
		$cte_id = intval($_POST['cte_id']);
		if (!$cte_id) {
			print json_encode(array('success'=>false,'msg'=>'Não possível salvar a ocorrência porque o ID do CT-e ainda não foi selecionado'));
			return false;
		}
		$cte_ocor_id = intval($_POST['cte_ocor_id']);
		$cte_ocor_quando_data = trim($_POST['cte_ocor_quando_data']);
		$cte_ocor_quando_hora = trim($_POST['cte_ocor_quando_hora']);
		$cte_ocor_nota = $this->escape(trim($_POST['cte_ocor_nota']), 'string');
		$_cte_ocor_recebedor_doc = trim($_POST['cte_ocor_recebedor_doc']);
		$_cte_ocor_recebedor_nome = trim($_POST['cte_ocor_recebedor_nome']);
		$cte_ocor_recebedor_doc = $this->escape($_cte_ocor_recebedor_doc, 'string');
		$cte_ocor_recebedor_nome = $this->escape($_cte_ocor_recebedor_nome, 'string');
		$envia_email = ($cte_ocor_id > 0 && !empty($cte_ocor_quando_data) && !empty($cte_ocor_quando_hora));
		if ($ocor_id > 0 && $envia_email && (!empty($cte_ocor_nota) || !empty($cte_ocor_recebedor_doc) || !empty($cte_ocor_recebedor_nome))) {
			$sql = "SELECT COUNT(*) AS existente FROM ctes_ocorrencias ";
			$sql.= "WHERE cte_ocor_id = ".$cte_ocor_id." ";
			$sql.= "AND (ocor_id != ".$ocor_id." ";
			$sql.= "OR cte_ocor_nota != ".$cte_ocor_nota." ";
			$sql.= "OR cte_ocor_recebedor_doc != ".$cte_ocor_recebedor_doc." ";
			$sql.= "OR cte_ocor_recebedor_nome != ".$cte_ocor_recebedor_nome.")";
			$query = $this->query($sql);
			$envia_email = $this->fetch_object($query)->existente > 0;
			$this->free_result($query);
		}
		$cte_doc_id = intval($_POST['cte_doc_id']); if (!$cte_doc_id) $cte_doc_id = "NULL";
		$cte_ocor_quando = $this->escape(date_convert($cte_ocor_quando_data).' '.$cte_ocor_quando_hora, 'string');
		$cte_ocor_cia_aerea = $this->escape(trim($_POST['cte_ocor_cia_aerea']), 'string');
		$cte_ocor_voo = $this->escape(trim($_POST['cte_ocor_voo']), 'string');
		$cte_ocor_base = $this->escape(trim($_POST['cte_ocor_base']), 'string');
		$cte_ocor_serie_master = $this->escape(trim($_POST['cte_ocor_serie_master']), 'string');
		$cte_ocor_numero_master = $this->escape(trim($_POST['cte_ocor_numero_master']), 'string');
		$cte_ocor_operacional_master = $this->escape(trim($_POST['cte_ocor_operacional_master']), 'string');
		$cte_ocor_chave_master = $this->escape(trim($_POST['cte_ocor_chave_master']), 'string');
		$cte_ocor_volumes = intval($_POST['cte_ocor_volumes']);
		$cte_ocor_peso_bruto = $this->escape($_POST['cte_ocor_peso_bruto'], 'decimal');
		$cte_ocor_entregador_nome = $this->escape(trim($_POST['cte_ocor_entregador_nome']), 'string');
		$cte_ocor_entregador_doc = $this->escape(trim($_POST['cte_ocor_entregador_doc']), 'string');

		if ($ocor_id == 1) {
			$sql = "SELECT COUNT(*) AS existente FROM ctes_ocorrencias ";
			$sql.= "WHERE cte_id = ".$cte_id." ";
			$sql.= "AND DATE(cte_ocor_quando) = DATE(".$cte_ocor_quando.") ";
			$sql.= "AND cte_ocor_volumes = ".$cte_ocor_volumes." ";
			$sql.= "AND cte_ocor_peso_bruto = ".$cte_ocor_peso_bruto." ";
			$sql.= "AND cte_ocor_entregador_nome = ".$cte_ocor_entregador_nome." ";
			$sql.= "AND cte_ocor_entregador_doc = ".$cte_ocor_entregador_doc." ";
			$sql.= "AND cte_ocor_recebedor_nome = ".$cte_ocor_recebedor_nome." ";
			$sql.= "AND cte_ocor_recebedor_doc = ".$cte_ocor_recebedor_doc;
			$query = $this->query($sql);
			$exist = $this->fetch_object($query)->existente > 0;
			$this->free_result($query);
			if ($exist) {
				print json_encode(array("success"=>false,"msg"=>"Ocorrência já cadastrada anteriormente"));
				return false;
			}
		}

		$sql = ($cte_ocor_id > 0) ? "UPDATE ctes_ocorrencias SET " : "INSERT INTO ctes_ocorrencias SET cte_id = ".$cte_id.",";
		$sql.= "ocor_id = ".$ocor_id.",";
		$sql.= "cte_doc_id = ".$cte_doc_id.",";
		$sql.= "cte_ocor_quando = ".$cte_ocor_quando.",";
		$sql.= "cte_ocor_cia_aerea = ".$cte_ocor_cia_aerea.",";
		$sql.= "cte_ocor_voo = ".$cte_ocor_voo.",";
		$sql.= "cte_ocor_base = ".$cte_ocor_base.",";
		$sql.= "cte_ocor_serie_master = ".$cte_ocor_serie_master.",";
		$sql.= "cte_ocor_numero_master = ".$cte_ocor_numero_master.",";
		$sql.= "cte_ocor_operacional_master = ".$cte_ocor_operacional_master.",";
		$sql.= "cte_ocor_chave_master = ".$cte_ocor_chave_master.",";
		$sql.= "cte_ocor_volumes = ".$cte_ocor_volumes.",";
		$sql.= "cte_ocor_peso_bruto = ".$cte_ocor_peso_bruto.",";
		$sql.= "cte_ocor_entregador_nome = ".$cte_ocor_entregador_nome.",";
		$sql.= "cte_ocor_entregador_doc = ".$cte_ocor_entregador_doc.",";
		$sql.= "cte_ocor_recebedor_nome = ".$cte_ocor_recebedor_nome.",";
		$sql.= "cte_ocor_recebedor_doc = ".$cte_ocor_recebedor_doc.",";
		$sql.= "cte_ocor_nota = ".$cte_ocor_nota;
		$sql.= ($cte_ocor_id > 0) ? " WHERE cte_ocor_id = ".$cte_ocor_id : "";

		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		if (!$cte_ocor_id) {
			$cte_ocor_id = $this->insert_id();
		}

		if ($envia_email) {
			$sql = "SELECT t1.clie_lista_emails_ocorrencias ";
			$sql.= "FROM clientes AS t1 ";
			$sql.= "INNER JOIN ctes AS t2 ON t2.clie_destinatario_id = t1.clie_id ";
			$sql.= "WHERE t2.cte_id = ".$cte_id." ";
			$sql.= "AND t1.clie_lista_emails_ocorrencias IS NOT NULL ";
			$sql.= "AND t1.clie_lista_emails_ocorrencias != ''";

			$query = $this->query($sql);
			$lista_email_ocor_dest = $this->fetch_object($query)->clie_lista_emails_ocorrencias;
			$this->free_result($query);

			$sql = "SELECT t1.clie_lista_emails_ocorrencias ";
			$sql.= "FROM clientes AS t1 ";
			$sql.= "INNER JOIN ctes AS t2 ON t2.clie_tomador_id = t1.clie_id ";
			$sql.= "WHERE t2.cte_id = ".$cte_id." ";
			$sql.= "AND t1.clie_lista_emails_ocorrencias IS NOT NULL ";
			$sql.= "AND t1.clie_lista_emails_ocorrencias != ''";
			$query = $this->query($sql);
			$lista_email_ocor_tom = $this->fetch_object($query)->clie_lista_emails_ocorrencias;
			$this->free_result($query);

			$lista_email_ocor = $lista_email_ocor_dest;
			if (!empty($lista_email_ocor_dest) && !empty($lista_email_ocor_tom)) {
				$lista_email_ocor.="\n";
				$lista_email_ocor.= $lista_email_ocor_tom;
			} elseif (empty($lista_email_ocor_dest) && !empty($lista_email_ocor_tom)) {
				$lista_email_ocor = $lista_email_ocor_tom;
			}

			if (!empty($lista_email_ocor)) {
				$sql = "SELECT CONCAT('#', ocor_codigo, ': ', ocor_caracteristica, ' - ', ocor_descricao) AS ocorrencia ";
				$sql.= "FROM ocorrencias WHERE ocor_id = ".$ocor_id;
				$query = $this->query($sql);
				$cte_ocor_evento_descricao = $this->fetch_object($query)->ocorrencia;
				$this->free_result($query);

				$cte_ocor_evento_data = date_convert($cte_ocor_quando_data, 'd/m/Y');
				$cte_ocor_evento_hora = $cte_ocor_quando_hora;
				$cte_ocor_evento_notas = trim($cte_ocor_nota, "'");

				$sql = "SELECT GROUP_CONCAT(cte_doc_numero SEPARATOR ' / ') AS lista_documentos ";
				$sql.= "FROM ctes_documentos WHERE cte_id = ".$cte_id." ";
				$sql.= "AND cte_doc_numero IS NOT NULL AND cte_doc_numero != ''";
				$query = $this->query($sql);
				$cte_documentos = $this->fetch_object($query)->lista_documentos;
				$this->free_result($query);

				$sql = "SELECT ";
				$sql.= "rem_razao_social, rem_cid_nome_completo, ";
				$sql.= "des_razao_social, des_cid_nome_completo, ";
				$sql.= "CONCAT('Nº.: ', cte_numero, ' MINUTA.: ', cte_minuta) AS cte_numero ";
				$sql.= "FROM view_ctes WHERE cte_id = ".$cte_id;
				$query = $this->query($sql);
				$field = $this->fetch_object($query);
				$this->free_result($query);

				$Mailer = new Mailer();
				$Mailer->to = str_replace(array("\r\n","\n","\r","\t",",",";;"," "), ";", $lista_email_ocor);
				$Mailer->Subject = "Trancking #".$field->cte_numero.' [NOVA OCORRÊNCIA]';
				$Mailer->message = '<span style="font-family: \'Segoe UI\', \'Open Sans\', Verdana, Arial, Helvetica, sans-serif; font-size: 11pt; font-weight: 300; line-height: 20px;">';
				$Mailer->message.= "Prezado cliente,<br>";
				$Mailer->message.= "Referente ao CT-e ".$field->cte_numero." de REMETENTE ".$field->rem_razao_social." (".$field->rem_cid_nome_completo.") e de DESTINATÁRIO ".$field->des_razao_social." (".$field->des_cid_nome_completo."), segue últimas alterações de eventos.<br><br>";
				$Mailer->message.= "Documentos vinculados: ".$cte_documentos."<br><br>";
				$Mailer->message.= "EVENTO ".$cte_ocor_evento_data." às ".$cte_ocor_evento_hora."<br>";
				$Mailer->message.= "-------------------------------<br>";
				if (!empty($_cte_ocor_recebedor_nome)) {
					$Mailer->message.="RECEBEDOR: ";
					$Mailer->message.= $_cte_ocor_recebedor_nome;
					if (!empty($_cte_ocor_recebedor_doc)) {
						$Mailer->message.= " (".$_cte_ocor_recebedor_doc.")";
					}
					$Mailer->message.="<br>";
				}
				$Mailer->message.= $cte_ocor_evento_descricao."<br>";
				if (!empty($cte_ocor_evento_notas)) {
					$Mailer->message.= $cte_ocor_evento_notas;
					$Mailer->message.= "<br>";
				}
				$Mailer->message.= "<br>Atenciosamente,<br/><br/>Equipe ".$this->empresa->emp_nome_fantasia;
				$Mailer->message.= "</span><br/>";
				$Mailer->message.= '<img style="width:230px; height:auto;" src="'.$this->empresa->logo_url.'"/>';
				$Mailer->message.= '<p style="font-family: \'Segoe UI\', \'Open Sans\', Verdana, Arial, Helvetica, sans-serif; font-size: 8pt; font-weight: 300; line-height: 20px;">Este email foi enviado pelo sistema '.PROJECT.'<br/>EMAIL AUTOMÁTICO, NÃO RESPONDA ESSA MENSAGEM</p>';
				$Mailer->send();
			}
		}

		print json_encode(array('success'=>true,'cte_ocor_id'=>$cte_ocor_id));
	}
	/**
	 * Excluir ocorrências do CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_ocorrencias() {
		$cte_ocor_id = trim($_POST['cte_ocor_id']);

		$sql = "SELECT cte_ocor_comprovante FROM ctes_ocorrencias ";
		$sql.= "WHERE cte_ocor_id IN (".$cte_ocor_id.") ";
		$sql.= "AND cte_ocor_comprovante IS NOT NULL ";
		$sql.= "AND cte_ocor_comprovante != ''";
		$query = $this->query($sql);
		while ($field = $this->fetch_object($query)) {
			@unlink('../comprovantes/'.$field->cte_ocor_comprovante);
		}
		$this->free_result($query);

		$sql = "DELETE FROM ctes_ocorrencias WHERE cte_ocor_id IN (".$cte_ocor_id.")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		print json_encode(array('success'=> $this->affected_rows() > 0));
	}
	/**
	 * Upload do comprovante de entrega referente a ocorrência do CT-e. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function upload_comprovante_entrega() {
		$cte_ocor_id = intval($_POST['cte_ocor_id']);
		$cte_ocor_comprovante = $_FILES['cte_ocor_comprovante'];

		if($cte_ocor_comprovante["error"] > 0) {
			print json_encode(array('success'=>false,'msg'=>'Erro: #'.$cte_ocor_comprovante['error'].' - o arquivo de imagem parece estar corrompido.'));
			return false;
		}

		/*if (!is_image($cte_ocor_comprovante)) {
			print json_encode(array('success'=>false,'msg'=>'O arquivo "'.$cte_ocor_comprovante['name'].'" não é uma imagem permitida pelo sistema.'));
			return false;
		}*/

		$filename = encode_filename($cte_ocor_id);
		$filename.= ".".get_ext($cte_ocor_comprovante["name"]);

		if (!is_dir('../comprovantes')) {
			mkdir('../comprovantes', 0777);
			chmod('../comprovantes', 0777);
		}
		if (file_exists('../comprovantes/'.$filename)) {
			@unlink('../comprovantes/'.$filename);
		}

		$sql = "SELECT cte_ocor_comprovante FROM ctes_ocorrencias WHERE cte_ocor_id = ".$cte_ocor_id;
		$query = $this->query($sql);
		$old_cte_ocor_comprovante = $this->fetch_object($query)->cte_ocor_comprovante;
		$this->free_result($query);
		if (!empty($old_cte_ocor_comprovante)) {
			@unlink('../comprovantes/'.$old_cte_ocor_comprovante);
		}

		if (move_uploaded_file($cte_ocor_comprovante['tmp_name'], '../comprovantes/'.$filename)) {
			chmod('../comprovantes/'.$filename, 0777);

			$sql = "UPDATE ctes_ocorrencias SET cte_ocor_comprovante = ".$this->escape($filename)." WHERE cte_ocor_id = ".$cte_ocor_id;
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}

			print json_encode(array('success'=>true,'cte_ocor_comprovante'=>URL.'mod/conhecimentos/ctes/comprovantes/'.$filename));
			return true;
		} else {
			throw new ExtJSException("Houve um erro ao tentar mover imagem 'cte_ocor_comprovante' para o diretório 'comprovantes'");
			return false;
		}
	}
	/**
	 * Faz a leitura do arquivo XML e retorna array para adicionar a grade ctes_documentos. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function importar_nfe() {
		$arquivos = $_FILES['arquivos'];
		$num_arquivos = count($arquivos['tmp_name']);
		$records = array();

		if (!is_dir('../temp')) {
			mkdir('../temp', 0777);
			chmod('../temp', 0777);
		}

		for ($i=0; $i<$num_arquivos; $i++) {
			if ($arquivos["error"][$i] > 0) {
				print json_encode(array('success'=>false,'msg'=>'Erro: #'.$arquivos['error'][$i].' - o arquivo xml parece estar corrompido.'));
				return false;
			}

			if (file_exists('../temp/'.$arquivos['name'][$i])) {
				@unlink('../temp/'.$arquivos['name'][$i]);
			}

			if (move_uploaded_file($arquivos['tmp_name'][$i], '../temp/'.$arquivos['name'][$i])) {
				chmod('../temp/'.$arquivos['name'][$i], 0777);

				$xml = simplexml_load_file('../temp/'.$arquivos['name'][$i]);
				if (!$xml) {
					@unlink('../temp/'.$arquivos['name'][$i]);
					print json_encode(array('success'=>false,'msg'=>'Arquivo XML não é suportado pelo leito de XML, talvez porque o arquivo está corrompido ou não é do tipo XML.'));
					return false;
				}
				$NFe = $xml->NFe->infNFe;
				array_push($records, array(
					'cte_doc_chave_nfe' => (string) $xml->protNFe->infProt->chNFe,
					'cte_doc_volumes' => ceil(floatval($NFe->transp->vol->qVol)),
					'cte_doc_peso_total' => floatval($NFe->transp->vol->pesoL),
					'cte_doc_valor_nota' => floatval($NFe->total->ICMSTot->vNF)
				));

				@unlink('../temp/'.$arquivos['name'][$i]);

			} else {
				throw new ExtJSException("Houve um erro ao tentar mover arquivo xml para o diretório 'temp'");
				return false;
			}
		}

		print json_encode(array('success'=>true,'records'=>$records));
	}
	/**
	 * Exportar registros da view_ctes para o formato xls
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

		$sql = "SELECT ".$select." FROM view_ctes ";
		$sql.= $where;
		if (!empty($orderby)) {
			$orderby = join(",", $orderby);
			$sql.= " ORDER BY ";
			$sql.= $orderby;
		}
		$this->debug($sql);
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
		if (!is_dir($path.'/')) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		$filename = encode_filename('cte'.$this->empresa->emp_id).'.xls';
		$fileurl = URL.'mod/conhecimentos/ctes/export/'.$filename;
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
	function export_txt() {
		if (!$this->is_online()) {
			print json_encode(array('success'=>false,'logged'=>false,'msg'=>'Você ficou muito tempo sem usar o sistema, por questão de segurança sua sessão foi expirada.'));
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
					array_push($title, $field->field);
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

		$where = "WHERE emp_id = ".$this->empresa->emp_id." ";
		$where.= "AND cte_situacao IN ('AUTORIZADO', 'ME EMITIDA') ";

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
		$this->debug($sql);
		$query = $this->query($sql);
		while ($item = $this->fetch_object($query)) {
			if (!$item->cte_ocor_id) {
				$obj = $this->view_ctes_ultimas_ocorrencias($item->cte_id);
				if (!empty($obj)) {
					foreach ($obj as $key => $value) {
						$item->$key = $value;
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
				array_push($values, $item->$key);
			}
			$txt.= join(";", $values);
			unset($values);
		}
		$this->free_result($query);

		$path = '../export';
		if (!is_dir($path.'/')) {
			mkdir($path, 0777);
			chmod($path, 0777);
		}
		$filename = encode_filename('edi'.$this->empresa->emp_id).'.txt';
		$fileurl = URL.'mod/conhecimentos/ctes/export/'.$filename;
		if (file_exists($path.'/'.$filename)) {
			unlink($path.'/'.$filename);
		}
		$fp = fopen($path.'/'.$filename, 'w+');
		fwrite($fp, $txt);
		fclose($fp);

		print json_encode(array('success'=>true,'xls'=>$fileurl));
	}
	/**
	 * Gerar Nota de Despacho em PDF
	 * @remotable
	 * @access private
	 * @return string $filename
	 */
	private function gerar_nota_despacho_pdf($cte_id) {
		$cte_id = intval($cte_id); if (!$cte_id) return null;

		$sql = "SELECT * FROM view_ctes WHERE cte_id = ".$cte_id;
		$query = $this->query($sql);
		$field = $this->fetch_object($query);
		$this->free_result($query);

		$pdf_html ='<style type="text/css">';
		$pdf_html.='*{font-family: Arial, Helvetica, sans-serif; font-size: 9px;}';
		$pdf_html.='</style>';
		$pdf_html.='<page backtop="5mm" backbottom="5mm">';

		$default_html ='<table style="width:100%; border:1px solid;">';
		$default_html.='<tr>';
		$default_html.='<td style="width:20%;"><img src="'.$this->empresa->logo_url.'" /></td>';
		$default_html.='<td style="width:64%; text-align:center;">';
		$default_html.='<span style="font-weight:bold; font-style:italic; text-align:center;">'.$this->empresa->emp_razao_social.'</span><br/>';
		$default_html.='<span style="font-weight:bold; text-align:center;">';
		$default_html.= $this->empresa->emp_logradouro.', '.$this->empresa->emp_numero.' '.$this->empresa->emp_complemento.'<br/>';
		$default_html.= $this->empresa->emp_bairro.' CEP '.$this->empresa->emp_cep.'<br/>';
		$default_html.= $this->empresa->cid_nome.'<br/>';
		$default_html.='FONE '.$this->empresa->emp_fone1;
		if (!empty($this->empresa->emp_fone2)) {
			$default_html.=' / ';
			$default_html.= $this->empresa->emp_fone2;
		}
		$default_html.='</span>';
		$default_html.='</td>';
		$default_html.='<td style="width:15%; font-size:12px; text-align:center;">';
		//$default_html.='<small>[[page_cu]]/[[page_nb]]</small><br/>';
		$default_html.='MINUTA DE EMBARQUE<br/>';
		$default_html.='Nº: '.$field->cte_minuta.'<br/>';
		$default_html.='<small>'.date_convert($field->cte_data_hora_emissao, 'd/m/Y H:i').'</small>';
		$default_html.='</td>';
		$default_html.='</tr>';
		$default_html.='</table>';

		$default_html.='<table style="width:100%; border:1px solid; margin-top:5px;">';
		$default_html.='<tr>';
		if (empty($field->cid_passagem_nome_completo)) {
			$default_html.='<td style="width:10%; font-weight:bold;">ORIGEM</td>';
			$default_html.='<td style="width:40%; font-weight:bold;">'.$field->cid_origem_nome_completo.'</td>';
			$default_html.='<td style="width:10%; font-weight:bold;">DESTINO</td>';
			$default_html.='<td style="width:40%; font-weight:bold;">'.$field->cid_destino_nome_completo.'</td>';
			$default_html.='</tr>';
		} else {
			$default_html.='<td style="width:10%; font-weight:bold;">ORIGEM</td>';
			$default_html.='<td style="width:25%; font-weight:bold;">'.$field->cid_origem_nome_completo.'</td>';
			$default_html.='<td style="width:5%; font-weight:bold;">VIA</td>';
			$default_html.='<td style="width:25%; font-weight:bold;">'.$field->cid_passagem_nome_completo.'</td>';
			$default_html.='<td style="width:10%; font-weight:bold;">DESTINO</td>';
			$default_html.='<td style="width:25%; font-weight:bold;">'.$field->cid_destino_nome_completo.'</td>';
			$default_html.='</tr>';
		}
		$default_html.='</table>';

		$default_html.='<table style="width:100%; margin-top:5px;">';
		$default_html.='<tr>';
		$default_html.='<td style="width:50%; border:1px solid;">';
		$default_html.='<table style="width:100%;">';
		$default_html.='<tr><td style="width:100%; font-weight:bold;">REMETENTE</td></tr>';
		$default_html.='<tr><td style="width:100%;">'.$field->rem_razao_social.'</td></tr>';
		$default_html.='<tr><td style="width:100%;">'.$field->rem_end_logradouro.', '.$field->rem_end_numero.' '.$field->rem_end_complemento.' - '.$field->rem_end_bairro.'</td></tr>';
		$default_html.='<tr><td style="width:100%;">'.$field->rem_end_cep.' '.$field->rem_cid_nome.'</td></tr>';
		$default_html.='<tr><td style="width:100%;">'.$field->rem_cnpj_cpf.' '.$field->rem_fone.'</td></tr>';
		$default_html.='</table>';
		$default_html.='</td>';
		$default_html.='<td style="width:50%; border:1px solid;">';
		$default_html.='<table style="width:100%;">';
		$default_html.='<tr><td style="width:100%; font-weight:bold;">DESTINATÁRIO</td></tr>';
		$default_html.='<tr><td style="width:100%;">'.$field->des_razao_social.'</td></tr>';
		$default_html.='<tr><td style="width:100%;">'.$field->des_end_logradouro.', '.$field->des_end_numero.' '.$field->des_end_complemento.' - '.$field->des_end_bairro.'</td></tr>';
		$default_html.='<tr><td style="width:100%;">'.$field->des_end_cep.' '.$field->des_cid_nome.'</td></tr>';
		$default_html.='<tr><td style="width:100%;">'.$field->des_cnpj_cpf.' '.$field->des_fone.'</td></tr>';
		$default_html.='</table>';
		$default_html.='</td>';
		$default_html.='</tr>';
		$default_html.='</table>';

		$default_html.='<table style="width:100%; margin-top:5px;">';
		$default_html.='<tr>';
		$default_html.='<td style="width:50%; border:1px solid;">';
		$default_html.='<table style="width:100%;">';
		$default_html.='<tr>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:left;">ESPÉCIE</td>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:center;">VOLUMES</td>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:right;">P. REAL</td>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:right;">P. CUBADO</td>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:right;">VALOR NF</td>';
		$default_html.='</tr>';
		$default_html.='<tr>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:left;">'.(empty($field->cte_outras_carac_carga) ? $field->produto_predominante_nome : $field->cte_outras_carac_carga).'</td>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:center;">'.float_to_decimal($field->cte_qtde_volumes, 1).'</td>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:right;">'.float_to_decimal($field->cte_peso_bruto, 1).'</td>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:right;">'.float_to_decimal($field->cte_peso_bc, 1).'</td>';
		$default_html.='<td style="width:20%; font-weight:bold; text-align:right;">'.float_to_money($field->cte_valor_carga).'</td>';
		$default_html.='</tr>';
		$default_html.='</table>';
		$default_html.='</td>';
		$default_html.='<td style="width:50%; border:1px solid; vertical-align:text-top;">';
		$default_html.='<b>TOMADOR</b>';
		#$default_html.='<b>LOCAL DE ENTREGA</b>';
		$default_html.='<p>';
		$default_html.= $field->tom_razao_social.'<br/>';
		$default_html.= $field->tom_cnpj_cpf;
		/**
		 * 06/09/2016: LUCIANO PEDIU LOCAL DE ENTREGA EM BRANCO QUANDO IGUAL DO DESTINATÁRIO
		 * 15/12/2016: LUCIANO TROCOU LOCAL DE ENTREGA PARA TOMADOR
		 */
		/*
		if ($field->clie_entrega_id != $field->clie_destinatario_id) {
			$default_html.= $field->ent_razao_social.'<br/>';
			$default_html.= $field->ent_end_logradouro.', '.$field->ent_end_numero.' '.$field->ent_end_complemento.'<br/>';
			$default_html.= $field->ent_end_bairro.' '.$field->ent_end_cep.'<br/>';
			$default_html.= $field->ent_cid_nome_completo;
		}*/
		$default_html.='</p>';
		$default_html.='</td>';
		$default_html.='</tr>';
		$default_html.='</table>';

		# Até 165 Notas fiscais
		$default_html.='<table style="width:100%; border:1px solid; margin-top:5px;">';
		$default_html.='<tr>';
		$default_html.='<td style="width:100%;"><b>NOTAS FISCAIS</b><br/>'.$field->lista_documentos_numeros.'</td>';
		$default_html.='</tr>';
		$default_html.='</table>';
		/*
		 * LUCIANO PEDIU PARA TIRAR COLUNA DE DE DESCONTO NO DIA 31/03/2016 ÀS 11:20
		 * HISTÓRICO NO SKYPE DO NILTON
		 */
		$s = "SELECT ";
		$s.= "ccc_titulo AS titulo,";
		$s.= "ccc_valor AS valor,";
		$s.= "IF(ccc_exibir_desconto_dacte = 1, ccc_valor_desconto, 0) AS desconto ";
		$s.= "FROM ctes_comp_calculo ";
		$s.= "WHERE cte_id = ".$cte_id." ";
		$s.= "AND (ccc_exibir_valor_dacte = 1 OR ccc_valor > 0)";
		$q = $this->query($s);
		if ($this->num_rows($q)) {
			$tValor = $tDesconto = 0;
			$default_html.='<table style="width:100%; border:1px solid; margin-top:5px;">';
			$default_html.='<tr><th colspan="2">COMPONENTES DO VALOR DA PRESTAÇÃO</th></tr>';
			$default_html.='<tr>';
			$default_html.='<th style="width:70%;">TÍTULO</th>';
			$default_html.='<th style="width:30%;">VALOR DA PRESTAÇÃO</th>';
			#$default_html.='<th style="width:20%;">VALOR DO DESCONTO</th>';
			$default_html.='</tr>';
			$default_html.='<tr><td colspan="2" style="border-top:1px solid;"></td></tr>';
			while ($item = $this->fetch_object($q)) {
				$default_html.='<tr>';
				$default_html.='<td>'.$item->titulo.'</td>';
				$default_html.='<td style="text-align:right;">'.float_to_money($item->valor).'</td>';
				#$default_html.='<td style="text-align:right;">'.float_to_money($item->desconto).'</td>';
				$default_html.='</tr>';
				$tValor += $item->valor;
				$tDesconto += $item->desconto;
			}
			$default_html.='<tr>';
			$default_html.='<th>TOTAL</th>';
			$default_html.='<th style="text-align:right; border-top:1px solid;">'.float_to_money($tValor).'</th>';
			#$default_html.='<th style="text-align:right; border-top:1px solid;">'.float_to_money($tDesconto).'</th>';
			$default_html.='</tr>';
			$default_html.='</table>';
		}
		$this->free_result($q);

		# Até 1000 caracteres
		$default_html.='<table style="width:100%; border:1px solid; margin-top:5px;">';
		$default_html.='<tr>';
		$default_html.='<td style="width:100%;"><b>OBSERVAÇÕES GERAIS</b><br/>';
		$default_html.= $field->cte_obs_gerais;
		$default_html.='</td>';
		$default_html.='</tr>';
		$default_html.='</table>';

		$pdf_html.= $default_html;
		$pdf_html.='<table style="width:100%; border-top:2px dotted; margin-top:20px;"><tr><td style="width:100%;"></td></tr></table>';
		$pdf_html.= $default_html;

		$pdf_html.='<p style="text-align:center; font-size:8px; margin-top:5px;">RECEBI(EMOS) O(S) VOLUME(S) CONSTANTES DESTE COMPROVANTE DE ENTREGA EM PERFEITO ESTADO, COM QUE DOU(AMOS) POR CUMPRIDO O PRESENTE TRANSPORTE</p>';
		$pdf_html.='<table style="width:100%;">';
		$pdf_html.='<tr>';
		$pdf_html.='<td style="width:50%; border:1px solid;">';
		$pdf_html.='<table style="width:100%">';
		$pdf_html.='<tr><td style="width:100%; border-bottom:1px solid; height:20px;">NOME LEGÍVEL</td></tr>';
		$pdf_html.='<tr><td style="width:100%; border-bottom:1px solid; height:20px;">DATA/HORA</td></tr>';
		$pdf_html.='<tr><td style="width:100%; border-bottom:1px solid; height:20px;">SETOR</td></tr>';
		$pdf_html.='<tr><td style="width:100%; height:20px;">DOCUMENTO</td></tr>';
		$pdf_html.='</table>';
		$pdf_html.='</td>';
		$pdf_html.='<td style="width:50%; border:1px solid; vertical-align:text-top;">CARIMBO / ASSINATURA</td>';
		$pdf_html.='</tr>';
		$pdf_html.='</table>';

		$pdf_html.='</page>';

		$pdfname = validate_filename('ME-'.$cte_id);
		$pdfname.= '.pdf';

		$filename = '../export';
		if (!is_dir($filename)) {
			mkdir($filename, 0777);
			chmod($filename, 0777);
		}
		$filename.= '/'.$this->empresa->uniqueid;
		if (!is_dir($filename)) {
			mkdir($filename, 0777);
			chmod($filename, 0777);
		}
		$filename.= '/'.$pdfname;
		if (file_exists($filename)) {
			@unlink($filename);
		}

		try {
			$html2pdf = new HTML2PDF('P', 'A4', 'pt', true, 'UTF-8', 5);
			$html2pdf->pdf->SetDisplayMode('fullpage');
			$html2pdf->writeHTML($pdf_html);
			$html2pdf->Output($filename, 'F');
		} catch (HTML2PDF_exception $e) {
			$msg = "HTML2PDF ERROR\n";
			$msg.= $html;
			throw new ExtJSException($msg);
		}

		@chmod($filename, 0777);
		if (file_exists($filename)) {
			$sql = "UPDATE ctes SET ";
			$sql.= "cte_situacao = 'ME EMITIDA' ";
			$sql.= "WHERE cte_id = ".$cte_id;
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		return URL.'mod/conhecimentos/ctes/export/'.$this->empresa->uniqueid.'/'.$pdfname.'?_dc='.now();
	}
	/**
	 * Transferir conhecimentos (CT-e) para uma outra empresa
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function transferir_cte() {
		$cte_list_id = trim($_POST['cte_list_id']);
		$empresa = json_decode($_POST['empresa']);

		$sql = "UPDATE ctes SET ";
		$sql.= "emp_id = ".$empresa->emp_id.",";
		$sql.= "cte_modelo = ".$this->escape($empresa->emp_cte_modelo).",";
		$sql.= "cte_serie = ".$this->escape($empresa->emp_cte_serie)." ";
		$sql.= "WHERE cte_id IN(".$cte_list_id.")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		print json_encode(array('success'=> $this->affected_rows() > 0));
	}

	function gerar_etiqueta() {
		$records = json_decode($_POST['records']);

		$html = '';
		foreach ($records as $record) {
			$embarqueID = $record->cte_id;
			// 19-jun-2020 10:30 Wagner solicitou troca da minuta ($record->cte_minuta) para número do cte ($record->cte_numero)

			if (!empty($record->cte_numero)) {
				$embarqueID = $record->cte_numero;
			} elseif (!empty($record->cte_minuta)) {
				$embarqueID = $record->cte_minuta;
			}
			// 02-dez-2020 16:21 Wagner solicitou para diminuir o truncamento de 34 para 30, dependendo da razão social do destinatário, está pulando para linha de baixo
			$destinatarioName = substr($record->des_razao_social, 0, 30);
			
			for ($i = 1; $i <= $record->cte_qtde_volumes; $i++) {
				if (empty($record->rem_cid_sigla)) {
					$record->rem_cid_sigla = $record->rem_cid_uf;
				}
				if (empty($record->des_cid_sigla)) {
					$record->des_cid_sigla = $record->des_cid_uf;
				}
				$html.='<page backleft="-3mm" backright="5mm" backtop="-2mm" backbottom="-3mm" format="70x100" orientation="L" style="font-size:9px;">';
				$html.='<table style="width:100%; border:1px solid;">';
				$html.='<tr>';
				$html.='<td style="width:47%; text-align:center;">';
				$html.='<img style="width:auto; height:50px;" src="'.$this->empresa->logo_url.'" /><br/>';
				$html.='<i>'.$this->empresa->emp_nome_fantasia.'</i>';
				$html.='</td>';
				$html.='<td style="width:53%;">';
				$html.='<barcode type="C128C" value="'.str_pad($record->cte_id, 10, "0", STR_PAD_LEFT).'" label="label"></barcode>';
				$html.='</td>';
				$html.='</tr>';
				$html.='<tr><td colspan="2" style="text-align:right; font-size:10px;">'.$embarqueID.' - '.date("d/m/Y").' '.date("H:i").'</td></tr>';
				$html.='</table>';

				$html.='<table style="width:105.6%; border:1px solid; margin-top:5px;" cellspacing="0">';
				$html.='<tr>';
				$html.='<td style="width:70%; vertical-align:top; border-right:1px solid;">';
				$html.='<table style="width:100%;" cellspacing="0">';
				$html.='<tr><th style="width:100%; font-style:italic;">DESTINO</th></tr>';
				$html.='<tr><th style="width:100%; font-size:12px;">'.$destinatarioName.'</th></tr>';
				$html.='<tr><th style="width:100%; font-size:12px;">'.$record->des_cid_nome.'</th></tr>';
				$html.='<tr><th style="width:100%; font-size:12px;">'.$record->des_endereco.'</th></tr>';
				$html.='</table>';
				$html.='</td>';
				$html.='<td style="width:30%;">';
				$html.='<table style="width:100%;" cellspacing="0">';
				$html.='<tr><th style="width:100%; font-style:italic;">ORIGEM</th></tr>';
				$html.='<tr><th style="width:100%; font-size:16px; text-align:right; padding-right:10px;">'.$record->rem_cid_sigla.'</th></tr>';
				$html.='<tr><th style="width:100%; font-style:italic; border-top:1px solid;">DESTINO</th></tr>';
				$html.='<tr><th style="width:100%; font-size:16px; text-align:right; padding-right:10px;">'.$record->des_cid_sigla.'</th></tr>';
				$html.='</table>';
				$html.='</td>';
				$html.='</tr>';
				$html.='</table>';

				$html.='<table style="width:105.6%; border:1px solid; margin-top:5px;" cellspacing="0">';
				$html.='<tr><th style="width:100%; font-style:italic;">NOTAS FISCAIS</th></tr>';
				$html.='<tr><td style="width:100%; height:37px; vertical-align:top;">'.truncate_string($record->notas_fiscais, 270).'</td></tr>';
				$html.='</table>';

				$html.='<table style="width:105.6%; border:1px solid; margin-top:5px;" cellspacing="0">';
				$html.='<tr>';
				$html.='<th style="width:30%; text-align:center; border-right:1px solid;">VOLUMES</th>';
				$html.='<th style="width:35%; text-align:center;">PESO (KG)</th>';
				$html.='<th style="width:35%; text-align:center; border-left:1px solid;">Nº EMBARQUE</th>';
				$html.='</tr>';
				$html.='<tr>';
				$html.='<th style="font-size:14px; text-align:center; border-right:1px solid;">'.$i.'/'.$record->cte_qtde_volumes.'</th>';
				$html.='<th style="font-size:14px; text-align:center;">'.float_to_decimal($record->cte_peso_bc, 1).'</th>';
				$html.='<th style="font-size:14px; text-align:center; border-left:1px solid;">'.$embarqueID.'</th>';
				$html.='</tr>';
				$html.='</table>';
				$html.='</page>';
			}
		}

		if (empty($html)) {
			print json_encode(array('success'=>false,'msg'=>'Não foi possível gerar estiqueta, pois sua consulta retornou vazia'));
			return false;
		}

		$pdfname = encode_filename('ETIQUETA');
		$pdfname = validate_filename($pdfname);
		$pdfname.= '.pdf';

		$filename = '../export';
		if (!is_dir($filename)) {
			mkdir($filename, 0777);
			chmod($filename, 0777);
		}
		$filename.= '/'.$this->empresa->uniqueid;
		if (!is_dir($filename)) {
			mkdir($filename, 0777);
			chmod($filename, 0777);
		}
		$filename.= '/'.$pdfname;
		if (file_exists($filename)) {
			@unlink($filename);
		}

		try {
			$html2pdf = new HTML2PDF('P', 'A4', 'pt', true, 'UTF-8', 5);
			$html2pdf->pdf->SetDisplayMode('fullpage');
			$html2pdf->writeHTML($html);
			$html2pdf->Output($filename, 'F');
		} catch (HTML2PDF_exception $e) {
			$msg = "HTML2PDF ERROR\n";
			$msg.= $html;
			throw new ExtJSException($msg);
		}

		@chmod($filename, 0777);

		$url = URL.'mod/conhecimentos/ctes/export/'.$this->empresa->uniqueid;
		print json_encode(array('success'=>true,'pdf'=>$url.'/'.$pdfname.'?_dc='.now()));
	}
}
?>