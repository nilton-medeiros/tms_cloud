<?php
class Controler extends App {
	/**
	 * Salvar empresa. Uso exclusivo do formulário Ajax
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_empresas() {
		$emp_id = intval($_POST['emp_id']);
		$emp_sigla_cia = $this->escape(trim($_POST['emp_sigla_cia']));
		
		$sql = "SELECT COUNT(*) AS existente FROM empresas WHERE emp_sigla_cia = ".$emp_sigla_cia; if ($emp_id > 0) $sql.= " AND emp_id != ".$emp_id;
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente > 0;
		$this->free_result($query);
		
		if ($exist) {
			print json_encode(array('success'=>false,'msg'=>'Já existe uma empresa cadastrada com a sigla '.$emp_sigla_cia.'! Favor forneça outra sigla.'));
			return false;
		}
		
		$emp_logotipo = isset($_FILES['emp_logotipo']) ? $_FILES['emp_logotipo'] : NULL;
		if ($emp_logotipo) {
			if($emp_logotipo["error"] > 0) {
				print json_encode(array('success'=>false,'msg'=>'Erro: #'.$emp_logotipo['error'].' - o arquivo de imagem parece estar corrompido.'));
				return false;
			}
			if (!is_image($emp_logotipo)) {
				print json_encode(array('success'=>false,'msg'=>'O arquivo "'.$emp_logotipo['name'].'" não é uma imagem permitida pelo sistema.'));
				return false;
			}
		}
		
		$cid_id_fk = intval($_POST['cid_id_fk']);
		
		$emp_razao_social = $this->escape(trim($_POST['emp_razao_social']));
		$emp_nome_fantasia = $this->escape(trim($_POST['emp_nome_fantasia']));
		$emp_cnpj = $this->escape(trim($_POST['emp_cnpj']), 'string');
		$emp_inscricao_estadual = $this->escape(trim($_POST['emp_inscricao_estadual']), 'string');
		$emp_logradouro = $this->escape(trim($_POST['emp_logradouro']));
		$emp_numero = $this->escape(trim($_POST['emp_numero']));
		$emp_complemento = $this->escape(trim($_POST['emp_complemento']));
		$emp_bairro = $this->escape(trim($_POST['emp_bairro']));
		$emp_cep = $this->escape(trim($_POST['emp_cep']), 'string');
		$emp_fone1 = $this->escape(trim($_POST['emp_fone1']), 'string');
		$emp_fone2 = $this->escape(trim($_POST['emp_fone2']), 'string');
		$emp_tipo_emitente = $this->escape(trim($_POST['emp_tipo_emitente']));
		$emp_modal = $this->escape(trim($_POST['emp_modal']));
		$emp_tipo_calculo_cubagem = $this->escape(trim($_POST['emp_tipo_calculo_cubagem']));
		$emp_simples_nacional = $this->escape($_POST['emp_simples_nacional'], 'bool');
		$emp_PIS = $this->escape(trim($_POST['emp_PIS']), 'decimal');
		$emp_COFINS = $this->escape(trim($_POST['emp_COFINS']), 'decimal');
		$emp_RNTRC = $this->escape(trim($_POST['emp_RNTRC']), 'string');
		$emp_ambiente_sefaz = intval($_POST['emp_ambiente_sefaz']);
		$emp_ativa = $this->escape($_POST['emp_ativa'], 'bool');
		$emp_cte_modelo = $this->escape(trim($_POST['emp_cte_modelo']), 'string');
		$emp_cte_serie = intval($_POST['emp_cte_serie']);
		$emp_dacte_layout = $this->escape(trim($_POST['emp_dacte_layout']));
		$emp_versao_layout_xml = $this->escape(trim($_POST['emp_versao_layout_xml']), 'decimal');
		$emp_seguradora = $this->escape(trim($_POST['emp_seguradora']));
		$emp_apolice = $this->escape(trim($_POST['emp_apolice']), 'string');
		$emp_taxa_min_nac = $this->escape(trim($_POST['emp_taxa_min_nac']), 'decimal');
		$emp_email_contabil = $this->escape(trim($_POST['emp_email_contabil']));
		$emp_email_comercial = $this->escape(trim($_POST['emp_email_comercial']));
		$emp_email_CCO = $this->escape($_POST['emp_email_CCO'], 'bool');
		$emp_enviar_cte = $this->escape(trim($_POST['emp_enviar_cte']));
		$emp_aba_doc_trans_ant = $this->escape($_POST['emp_aba_doc_trans_ant'], 'bool');
		$emp_aba_prod_perig = $this->escape($_POST['emp_aba_prod_perig'], 'bool');
		$emp_aba_veic_novos = $this->escape($_POST['emp_aba_veic_novos'], 'bool');
		$emp_aba_vale_pedagio = $this->escape($_POST['emp_aba_vale_pedagio'], 'bool');
		$emp_aba_veiculos = $this->escape($_POST['emp_aba_veiculos'], 'bool');
		$emp_aba_motoristas = $this->escape($_POST['emp_aba_motoristas'], 'bool');
		$emp_faturamento = $this->escape(trim($_POST['emp_faturamento']));
		$emp_dias_vecto = intval($_POST['emp_dias_vecto']);
		$emp_margem_lucro_min = intval($_POST['emp_margem_lucro_min']);
		$emp_margem_lucro_padrao = intval($_POST['emp_margem_lucro_padrao']);
		
		$sql = ($emp_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "empresas SET ";
		$sql.= "emp_razao_social = ".$emp_razao_social.",";
		$sql.= "emp_nome_fantasia = ".$emp_nome_fantasia.",";
		$sql.= "emp_sigla_cia = ".$emp_sigla_cia.",";
		$sql.= "emp_cnpj = ".$emp_cnpj.",";
		$sql.= "emp_inscricao_estadual = ".$emp_inscricao_estadual.",";
		$sql.= "emp_logradouro = ".$emp_logradouro.",";
		$sql.= "emp_numero = ".$emp_numero.",";
		$sql.= "emp_complemento = ".$emp_complemento.",";
		$sql.= "emp_bairro = ".$emp_bairro.",";
		$sql.= "emp_cep = ".$emp_cep.",";
		if ($cid_id_fk > 0) {
			$sql.= "cid_id_fk = ".$cid_id_fk.",";
		} 
		$sql.= "emp_fone1 = ".$emp_fone1.",";
		$sql.= "emp_fone2 = ".$emp_fone2.",";
		$sql.= "emp_tipo_emitente = ".$emp_tipo_emitente.",";
		$sql.= "emp_modal = ".$emp_modal.",";
		$sql.= "emp_tipo_calculo_cubagem = ".$emp_tipo_calculo_cubagem.",";
		$sql.= "emp_simples_nacional = ".$emp_simples_nacional.",";
		$sql.= "emp_PIS = ".$emp_PIS.",";
		$sql.= "emp_COFINS = ".$emp_COFINS.",";
		$sql.= "emp_RNTRC = ".$emp_RNTRC.",";
		$sql.= "emp_ambiente_sefaz = ".$emp_ambiente_sefaz.",";
		$sql.= "emp_ativa = ".$emp_ativa.",";
		$sql.= "emp_cte_modelo = ".$emp_cte_modelo.",";
		$sql.= "emp_cte_serie = ".$emp_cte_serie.",";
		$sql.= "emp_dacte_layout = ".$emp_dacte_layout.",";
		$sql.= "emp_versao_layout_xml = ".$emp_versao_layout_xml.",";
		$sql.= "emp_seguradora = ".$emp_seguradora.",";
		$sql.= "emp_apolice = ".$emp_apolice.",";
		$sql.= "emp_taxa_min_nac = ".$emp_taxa_min_nac.",";
		$sql.= "emp_email_contabil = ".$emp_email_contabil.",";
		$sql.= "emp_email_comercial = ".$emp_email_comercial.",";
		$sql.= "emp_email_CCO = ".$emp_email_CCO.",";
		$sql.= "emp_enviar_cte = ".$emp_enviar_cte.",";
		$sql.= "emp_aba_doc_trans_ant = ".$emp_aba_doc_trans_ant.",";
		$sql.= "emp_aba_prod_perig = ".$emp_aba_prod_perig.",";
		$sql.= "emp_aba_veic_novos = ".$emp_aba_veic_novos.",";
		$sql.= "emp_aba_vale_pedagio = ".$emp_aba_vale_pedagio.",";
		$sql.= "emp_aba_veiculos = ".$emp_aba_veiculos.",";
		$sql.= "emp_aba_motoristas = ".$emp_aba_motoristas.",";
		$sql.= "emp_faturamento = ".$emp_faturamento.",";
		$sql.= "emp_dias_vecto = ".$emp_dias_vecto.",";
		$sql.= "emp_margem_lucro_min = ".$emp_margem_lucro_min.",";
		$sql.= "emp_margem_lucro_padrao = ".$emp_margem_lucro_padrao." ";
		if ($emp_id > 0) {
			$sql.= "WHERE emp_id = ".$emp_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$emp_id) {
			$emp_id = $this->insert_id();
		}
		
		if ($emp_logotipo) {
			$sql = "SELECT emp_logotipo FROM empresas WHERE emp_id = ".$emp_id;
			$query = $this->query($sql);
			$old_emp_logotipo = $this->fetch_object($query)->emp_logotipo;
			$this->free_result($query);
			if (!empty($old_emp_logotipo)) {
				@unlink('../logo/'.$old_emp_logotipo);
			}
			
			$filename = encode_filename($emp_id);
			$filename.= ".".get_ext($emp_logotipo["name"]);
			
			if (!is_dir('../logo')) {
				mkdir('../logo', 0777);
				chmod('../logo', 0777);
			}
			if (file_exists('../logo/'.$filename)) {
				chmod('../logo/'.$filename, 0777);
				@unlink('../logo/'.$filename);
			}
			
			if (move_uploaded_file($emp_logotipo['tmp_name'], '../logo/'.$filename)) {
				chmod('../logo/'.$filename, 0777);
				
				list($width, $height, $type, $attr) = getimagesize('../logo/'.$filename);
				
				$Image = new Image();
				$Image->load('../logo/'.$filename);
				$resized = false;
				
				if ($width > 400) {
					$Image->resizeToWidth(350);
					if ($Image->getHeight() > 100) {
						$Image->resizeToHeight(100);
					}
					$resized = true;
				} elseif ($height > 100) {
					$Image->resizeToHeight(90);
					if ($Image->getWidth() > 400) {
						$Image->resizeToWidth(350);
					}
					$resized = true;
				}
				if ($resized) {
					$Image->save('../logo/'.$filename);
				}
				
				$sql = "UPDATE empresas SET emp_logotipo = ".$this->escape($filename)." WHERE emp_id = ".$emp_id;
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
				
				print json_encode(array('success'=>true,'emp_id'=>$emp_id,'emp_logotipo'=>$filename));
				return true;
			} else {
				throw new ExtJSException("Houve um erro ao tentar mover imagem 'emp_logotipo' para o diretório 'logo'");
				return false;
			}
		}
		
		print json_encode(array('success'=>true, 'emp_id'=>$emp_id));
	}
	/**
	 * Excluir empresas
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_empresas() {
		$emp_id = trim($_POST['emp_id']);
		
		$sql = "SELECT emp_logotipo FROM empresas ";
		$sql.= "WHERE emp_id IN(".$emp_id.") ";
		$sql.= "AND emp_logotipo IS NOT NULL AND emp_logotipo != ''";
		$query = $this->query($sql);
		while ($field = $this->fetch_object($query)) {
			$filename = '../logo/'.$field->emp_logotipo;
			@unlink($filename);
		}
		$this->free_result($query);
		
		$sql = "DELETE FROM empresas WHERE emp_id IN(".$emp_id.")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar empresas. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_empresas() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE emp_ativa = ".parse_boolean($_GET['ativa']);
		$filter.= $p->filter;
		
		if ($this->usuario->user_id > 0) {
			$sql = "SELECT GROUP_CONCAT(DISTINCT emp_id) AS list_emp_id ";
			$sql.= "FROM users_emps ";
			$sql.= "WHERE user_id = ".$this->usuario->user_id." ";
			$sql.= "AND emp_id > 0";
			$query = $this->query($sql);
			$field = $this->fetch_object($query);
			$this->free_result($query);
			$filter.= " AND emp_id IN (".$field->list_emp_id.") ";
		}
		
		$sql = "SELECT * FROM view_empresas ";
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
		
		$sql = "SELECT COUNT(emp_id) AS total FROM view_empresas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem das Empresas para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function empresas_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE emp_ativa = 1 ";
		$filter.= $this->get_filter_param('view_empresas');
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		
		$sql = "SELECT * FROM view_empresas ".$filter;
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
		
		$sql = "SELECT COUNT(emp_id) AS total FROM view_empresas ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
}
?>