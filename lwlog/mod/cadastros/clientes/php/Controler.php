<?php
class Controler extends App {
	/**
	 * Salvar cliente. Uso exclusivo do formulário Ajax
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_clientes() {
		$clie_id = intval($_POST['clie_id']);
		$cid_id = intval($_POST['cid_id']);
		$rota_id = intval($_POST['rota_id']);
		if (!$rota_id) {
			$rota_id = "NULL";
		}
		
		$clie_categoria = intval($_POST['clie_categoria']);
		$clie_ativo = $this->escape($_POST['clie_ativo'], 'bool');
		$clie_tipo_documento = $this->escape(trim($_POST['clie_tipo_documento']), 'string');
		$clie_razao_social = $this->escape(trim($_POST['clie_razao_social']), 'string');
		$clie_nome_fantasia = $this->escape(trim($_POST['clie_nome_fantasia']), 'string');
		$clie_tipo_estabelecimento = $this->escape(trim($_POST['clie_tipo_estabelecimento']), 'string');
		$clie_cnpj = $this->escape(trim($_POST['clie_cnpj']), 'string');
		$clie_ie_isento = $this->escape($_POST['clie_ie_isento'], 'bool');
		$clie_inscr_estadual = $this->escape(trim($_POST['clie_inscr_estadual']), 'string');
		$clie_inscr_municipal = $this->escape(trim($_POST['clie_inscr_municipal']), 'string');
		$clie_contrib_icms = $this->escape($_POST['clie_contrib_icms'], 'bool');
		$clie_cpf = $this->escape(trim($_POST['clie_cpf']), 'string');
		$clie_rg = $this->escape(trim($_POST['clie_rg']), 'string');
		$clie_situacao_cadastral = $this->escape(trim($_POST['clie_situacao_cadastral']), 'string');
		$clie_logradouro = $this->escape(trim($_POST['clie_logradouro']), 'string');
		$clie_numero = $this->escape(trim($_POST['clie_numero']), 'string');
		$clie_complemento = $this->escape(trim($_POST['clie_complemento']), 'string');
		$clie_bairro = $this->escape(trim($_POST['clie_bairro']), 'string');
		$clie_cep = $this->escape(trim($_POST['clie_cep']), 'string');
		$clie_fone1 = $this->escape(trim($_POST['clie_fone1']), 'string');
		$clie_fone2 = $this->escape(trim($_POST['clie_fone2']), 'string');
		$clie_login = $this->escape(trim($_POST['clie_login']), 'string');
		$clie_senha = $this->escape(trim($_POST['clie_senha']), 'string');
		$clie_seguradora = $this->escape(trim($_POST['clie_seguradora']), 'string');
		$clie_apolice = $this->escape(trim($_POST['clie_apolice']), 'string');
		$clie_forma_aplicar_seguro = $this->escape(trim($_POST['clie_forma_aplicar_seguro']), 'string');
		$clie_seguro_desconto = $this->escape(trim($_POST['clie_seguro_desconto']), 'decimal');
		$clie_seguro_intra_estadual = $this->escape(trim($_POST['clie_seguro_intra_estadual']), 'decimal');
		$clie_seguro_inter_estadual = $this->escape(trim($_POST['clie_seguro_inter_estadual']), 'decimal');
		$clie_seguro_adval_tipo_1 = $this->escape(trim($_POST['clie_seguro_adval_tipo_1']), 'decimal');
		$clie_seguro_adval_tipo_2 = $this->escape(trim($_POST['clie_seguro_adval_tipo_2']), 'decimal');
		$clie_tom_aceita_frete_pago = $this->escape($_POST['clie_tom_aceita_frete_pago'], 'bool');
		$clie_tom_aceita_frete_a_pagar = $this->escape($_POST['clie_tom_aceita_frete_a_pagar'], 'bool');
		$clie_tom_aceita_frete_outros = $this->escape($_POST['clie_tom_aceita_frete_outros'], 'bool');
		$clie_des_aceita_frete_a_pagar = $this->escape($_POST['clie_des_aceita_frete_a_pagar'], 'bool');
		$clie_tom_aceita_suframa = $this->escape($_POST['clie_tom_aceita_suframa'], 'bool');
		$clie_des_inscricao_suframa = $this->escape(trim($_POST['clie_des_inscricao_suframa']), 'string');
		$clie_tom_taxa_sefaz = intval($_POST['clie_tom_taxa_sefaz']);
		$clie_codigo_transporte = $this->escape(trim($_POST['clie_codigo_transporte']), 'string');
		$clie_tom_tabela = $this->escape(trim($_POST['clie_tom_tabela']), 'string');
		$clie_sequencia_rota = trim($_POST['clie_sequencia_rota']);
		$clie_gris_percentual = $this->escape(trim($_POST['clie_gris_percentual']), 'decimal');
		$clie_gris_valor_minimo = $this->escape(trim($_POST['clie_gris_valor_minimo']), 'decimal');
		$clie_lista_emails_ocorrencias = $this->escape(trim($_POST['clie_lista_emails_ocorrencias']), 'string');
		
		if (empty($clie_sequencia_rota)) {
			$clie_sequencia_rota = "NULL";
		}
		$clie_compartilhado = parse_boolean($_POST['clie_compartilhado']); 
		
		$produtos = trim($_POST['produtos']);
		$contatos = json_decode($_POST['contatos']);
		$aeroportos = trim($_POST['aeroportos']);
		
		$sql = $clie_id > 0 ? "UPDATE " : "INSERT INTO ";
		$sql.= "clientes SET ";
		$sql.= "emp_id = ".($clie_compartilhado ? "NULL" : $this->empresa->emp_id).",";
		$sql.= "clie_categoria = ".$clie_categoria.",";
		$sql.= "clie_ativo = ".$clie_ativo.",";
		$sql.= "clie_tipo_documento = ".$clie_tipo_documento.",";
		$sql.= "clie_razao_social = ".$clie_razao_social.",";
		$sql.= "clie_nome_fantasia = ".$clie_nome_fantasia.",";
		$sql.= "clie_tipo_estabelecimento = ".$clie_tipo_estabelecimento.",";
		$sql.= "clie_cnpj = ".$clie_cnpj.",";
		$sql.= "clie_ie_isento = ".$clie_ie_isento.",";
		$sql.= "clie_inscr_estadual = ".$clie_inscr_estadual.",";
		$sql.= "clie_inscr_municipal = ".$clie_inscr_municipal.",";
		$sql.= "clie_contrib_icms = ".$clie_contrib_icms.",";
		$sql.= "clie_cpf = ".$clie_cpf.",";
		$sql.= "clie_rg = ".$clie_rg.",";
		$sql.= "clie_situacao_cadastral = ".$clie_situacao_cadastral.",";
		$sql.= "clie_logradouro = ".$clie_logradouro.",";
		$sql.= "clie_numero = ".$clie_numero.",";
		$sql.= "clie_complemento = ".$clie_complemento.",";
		$sql.= "clie_bairro = ".$clie_bairro.",";
		$sql.= "clie_cep = ".$clie_cep.",";
		$sql.= "cid_id = ".$cid_id.",";
		$sql.= "clie_fone1 = ".$clie_fone1.",";
		$sql.= "clie_fone2 = ".$clie_fone2.",";
		$sql.= "clie_login = ".$clie_login.",";
		$sql.= "clie_senha = ".$clie_senha.",";
		$sql.= "clie_seguradora = ".$clie_seguradora.",";
		$sql.= "clie_apolice = ".$clie_apolice.",";
		$sql.= "clie_forma_aplicar_seguro = ".$clie_forma_aplicar_seguro.",";
		$sql.= "clie_seguro_desconto = ".$clie_seguro_desconto.",";
		$sql.= "clie_seguro_intra_estadual = ".$clie_seguro_intra_estadual.",";
		$sql.= "clie_seguro_inter_estadual = ".$clie_seguro_inter_estadual.",";
		$sql.= "clie_seguro_adval_tipo_1 = ".$clie_seguro_adval_tipo_1.",";
		$sql.= "clie_seguro_adval_tipo_2 = ".$clie_seguro_adval_tipo_2.",";
		$sql.= "clie_tom_aceita_frete_pago = ".$clie_tom_aceita_frete_pago.",";
		$sql.= "clie_tom_aceita_frete_a_pagar = ".$clie_tom_aceita_frete_a_pagar.",";
		$sql.= "clie_tom_aceita_frete_outros = ".$clie_tom_aceita_frete_outros.",";
		$sql.= "clie_des_aceita_frete_a_pagar = ".$clie_des_aceita_frete_a_pagar.",";
		$sql.= "clie_tom_aceita_suframa = ".$clie_tom_aceita_suframa.",";
		$sql.= "clie_des_inscricao_suframa = ".$clie_des_inscricao_suframa.",";
		$sql.= "clie_tom_taxa_sefaz = ".$clie_tom_taxa_sefaz.",";
		$sql.= "clie_codigo_transporte = ".$clie_codigo_transporte.",";
		$sql.= "clie_tom_tabela = ".$clie_tom_tabela.",";
		$sql.= "rota_id = ".$rota_id.",";
		$sql.= "clie_sequencia_rota = ".$clie_sequencia_rota.",";
		$sql.= "clie_gris_percentual = ".$clie_gris_percentual.",";
		$sql.= "clie_gris_valor_minimo = ".$clie_gris_valor_minimo.",";
		$sql.= "clie_lista_emails_ocorrencias = ".$clie_lista_emails_ocorrencias." ";
		if ($clie_id > 0) {
			$sql.= "WHERE clie_id = ".$clie_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!$clie_id) {
			$clie_id = $this->insert_id();
		}
		
		$sql = "DELETE FROM clientes_aeroportos WHERE clie_id = ".$clie_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($aeroportos)) {
			$sql = "INSERT INTO clientes_aeroportos (";
			$sql.= "clie_id,";
			$sql.= "cid_id";
			$sql.= ") SELECT ";
			$sql.= $clie_id.",";
			$sql.= "cid_id ";
			$sql.= "FROM cidades ";
			$sql.= "WHERE cid_id IN(".$aeroportos.")";
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		
		$sql = "DELETE FROM clientes_produtos WHERE clie_id = ".$clie_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		if (!empty($produtos)) {
			$sql = "INSERT INTO clientes_produtos (";
			$sql.= "clie_id,";
			$sql.= "prod_id";
			$sql.= ") SELECT ";
			$sql.= $clie_id.",";
			$sql.= "prod_id ";
			$sql.= "FROM produtos ";
			$sql.= "WHERE prod_id IN(".$produtos.")";
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		
		if (!empty($contatos)) {
			foreach ($contatos as $contato) {
				$con_id = intval($contato->con_id);
				$con_nome = $this->escape(trim($contato->con_nome));
				$con_setor = $this->escape(trim($contato->con_setor));
				$con_funcao = $this->escape(trim($contato->con_funcao));
				$con_fone = $this->escape(trim($contato->con_fone));
				$con_ramal = $this->escape(trim($contato->con_ramal));
				$con_celular = $this->escape(trim($contato->con_celular));
				$con_email = $this->escape(trim($contato->con_email));
				$con_nascimento = $this->escape(trim($contato->con_nascimento), 'date');
				$con_recebe_cte = $this->escape(trim($contato->con_recebe_cte));
				$con_email_cte = $this->escape(trim($contato->con_email_cte));
				$con_nota = $this->escape(trim($contato->con_nota));
				
				$sql = ($con_id > 0) ? "UPDATE " : "INSERT INTO ";
				$sql.= "clientes_contatos SET ";
				$sql.= "clie_id = ".$clie_id.",";
				$sql.= "con_nome = ".$con_nome.",";
				$sql.= "con_setor = ".$con_setor.",";
				$sql.= "con_funcao = ".$con_funcao.",";
				$sql.= "con_fone = ".$con_fone.",";
				$sql.= "con_ramal = ".$con_ramal.",";
				$sql.= "con_celular = ".$con_celular.",";
				$sql.= "con_email = ".$con_email.",";
				$sql.= "con_nascimento = ".$con_nascimento.",";
				$sql.= "con_recebe_cte = ".$con_recebe_cte.",";
				$sql.= "con_email_cte = ".$con_email_cte.",";
				$sql.= "con_nota = ".$con_nota." ";
				$sql.= ($con_id > 0) ? "WHERE con_id = ".$con_id : "";
				if (!$this->query($sql)) {
					print json_encode($this->get_sql_error());
					return false;
				}
			}
		}
		
		print json_encode(array('success'=>true,'clie_id'=>$clie_id));
	}
	/**
	 * Excluir clientes. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_clientes() {
		$sql = "DELETE FROM clientes WHERE clie_id IN(".$_POST['clie_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar clientes. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_clientes() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE (emp_id = ".$this->empresa->emp_id." OR emp_id IS NULL) ";
		$filter.= "AND clie_ativo = ".intval($_GET['ativo']);
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_clientes ";
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
		
		$sql = "SELECT COUNT(clie_id) AS total FROM view_clientes ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Armazenagem das clientes para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function clientes_store() {
		$p = $this->get_sql_param();
		
		$list = array();
		$search = trim($_GET['query']);
		$fieldFilter = trim($_GET['fieldFilter']);
		$valueFilter = trim($_GET['valueFilter']);
		
		$filter = "WHERE (emp_id = ".$this->empresa->emp_id." OR emp_id IS NULL) ";
		if (!empty($search)) {
			$search = $this->escape_search($search);
			$filter.="AND (clie_razao_social LIKE '%".$search."%' ";
			$filter.="OR clie_nome_fantasia LIKE '%".$search."%' ";
			$filter.="OR clie_cnpj LIKE '%".$search."%' ";
			$filter.="OR cid_nome LIKE '%".$search."%') ";
		}
		
		if (!empty($fieldFilter)) {
			$valueFilter = empty($valueFilter) ? "IS NULL" : "= ".$this->escape($valueFilter);
			$filter.= " AND ".$fieldFilter." ".$valueFilter;
		}
		if (isset($_GET['clie_ativo'])) {
			$filter.= " AND clie_ativo = ".intval($_GET['clie_ativo']);
		}
		if (isset($_GET['clie_categoria'])) {
			$filter.= " AND clie_categoria IN(".$_GET['clie_categoria'].")";
		}
		if (isset($_GET['cid_id_destino'])) {
			$cid_id_destino = intval($_GET['cid_id_destino']);
			$filter.= " AND cid_id = ".$cid_id_destino." AND clie_id IN (SELECT clie_id FROM clientes_aeroportos WHERE cid_id = ".$cid_id_destino.")";
		}
		$sql = "SELECT * FROM view_clientes ".$filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if (!empty($p->limit)) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		$query = $this->query($sql);
		while ($field = $this->fetch_object($query)) {
			if (preg_match("/CPF/i", $field->clie_tipo_documento)) {
				$field->clie_cnpj = $field->clie_cpf;
			}
			array_push($list, $field);
		}
		$this->free_result($query);
		
		$sql = "SELECT COUNT(clie_id) AS total FROM view_clientes ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Consultar cidades dos clientes. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_cidades() {
		$sql = "SELECT t1.* FROM view_cidades AS t1 ";
		$sql.= "INNER JOIN clientes_aeroportos AS t2 ON t2.cid_id = t1.cid_id ";
		$sql.= "WHERE t2.clie_id = ".intval($_GET['clie_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Salvar cidade. Uso exclusivo do formulário Ajax
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_cidades() {
		$cid_id = intval($_POST['cid_id']);
		$clie_id = intval($_POST['clie_id']);
		
		$sql = "SELECT COUNT(*) AS existente FROM clientes_aeroportos ";
		$sql.= "WHERE cid_id = ".$cid_id." ";
		$sql.= "AND clie_id = ".$clie_id;
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente > 0;
		if ($exist) {
			print json_encode(array('success'=>true));
			return true;
		}
		
		$sql = "INSERT INTO clientes_aeroportos SET ";
		$sql.= "cid_id = ".$cid_id.",";
		$sql.= "clie_id = ".$clie_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		print json_encode(array('success'=>true));
	}
	/**
	 * Excluir cidades do cliente. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_cidades() {
		$sql = "DELETE FROM clientes_aeroportos ";
		$sql.= "WHERE clie_id = ".intval($_POST['clie_id'])." ";
		$sql.= "AND cid_id IN(".$_POST['cid_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Consultar produtos dos clientes. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_produtos() {
		$sql = "SELECT t1.* FROM view_produtos AS t1 ";
		$sql.= "INNER JOIN clientes_produtos AS t2 ON t2.prod_id = t1.prod_id ";
		$sql.= "WHERE t2.clie_id = ".intval($_GET['clie_id']);
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Salvar cidade. Uso exclusivo do formulário Ajax
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_produtos() {
		$prod_id = intval($_POST['prod_id']);
		$clie_id = intval($_POST['clie_id']);
		
		$sql = "SELECT COUNT(*) AS existente FROM clientes_produtos ";
		$sql.= "WHERE prod_id = ".$prod_id." ";
		$sql.= "AND clie_id = ".$clie_id;
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente > 0;
		if ($exist) {
			print json_encode(array('success'=>true));
			return true;
		}
		
		$sql = "INSERT INTO clientes_produtos SET ";
		$sql.= "prod_id = ".$prod_id.",";
		$sql.= "clie_id = ".$clie_id;
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		print json_encode(array('success'=>true));
	}
	/**
	 * Excluir produtos do cliente. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_produtos() {
		$sql = "DELETE FROM clientes_produtos ";
		$sql.= "WHERE clie_id = ".intval($_POST['clie_id'])." ";
		$sql.= "AND prod_id IN(".$_POST['prod_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Salvar dados faturamento do cliente. Uso exclusivo do formulário Ajax
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_dados_faturamento() {
		$clie_id = intval($_POST['clie_id']);
		$prp_id = intval($_POST['prp_id']);
		$cliefat_cid_id_fk = intval($_POST['cliefat_cid_id_fk']);
		
		$cliefat_status_cobranca = $this->escape(trim($_POST['cliefat_status_cobranca']));
		$cliefat_tipo_carteira = $this->escape(trim($_POST['cliefat_tipo_carteira']), 'string');
		$cliefat_dias_ao_vecto = intval($_POST['cliefat_dias_ao_vecto']);
		$cliefat_dias_protestar = intval($_POST['cliefat_dias_protestar']);
		$cliefat_dias_em_atraso = intval($_POST['cliefat_dias_em_atraso']);
		$cliefat_endereco_o_mesmo = $this->escape($_POST['cliefat_endereco_o_mesmo'], 'bool');
		$cliefat_logradouro = $this->escape(trim($_POST['cliefat_logradouro']));
		$cliefat_numero = $this->escape(trim($_POST['cliefat_numero']));
		$cliefat_complemento = $this->escape(trim($_POST['cliefat_complemento']));
		$cliefat_bairro = $this->escape(trim($_POST['cliefat_bairro']));
		$cliefat_cep = $this->escape(trim($_POST['cliefat_cep']));
		$cliefat_email = $this->escape(trim($_POST['cliefat_email']));
		$cliefat_obs_duplicata = $this->escape(trim($_POST['cliefat_obs_duplicata']));
		$auto_inadimplente = $this->escape($_POST['auto_inadimplente'], 'bool');
		
		$sql = "SELECT COUNT(*) AS existente FROM clientes_fatura WHERE clie_id_fk = ".$clie_id;
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente > 0;
		$this->free_result($query);
		
		$sql = $exist ? "UPDATE " : "INSERT INTO ";
		$sql.= "clientes_fatura SET ";
		$sql.= "clie_id_fk = ".$clie_id.",";
		$sql.= "cliefat_email = ".$cliefat_email.",";
		$sql.= "cliefat_status_cobranca = ".$cliefat_status_cobranca.",";
		$sql.= "cliefat_tipo_carteira = ".$cliefat_tipo_carteira.",";
		$sql.= "cliefat_dias_ao_vecto = ".$cliefat_dias_ao_vecto.",";
		$sql.= "cliefat_dias_protestar = ".$cliefat_dias_protestar.",";
		$sql.= "cliefat_dias_em_atraso = ".$cliefat_dias_em_atraso.",";
		$sql.= "prp_id = ".$prp_id.",";
		$sql.= "cliefat_endereco_o_mesmo = ".$cliefat_endereco_o_mesmo.",";
		$sql.= "cliefat_logradouro = ".$cliefat_logradouro.",";
		$sql.= "cliefat_numero = ".$cliefat_numero.",";
		$sql.= "cliefat_complemento = ".$cliefat_complemento.",";
		$sql.= "cliefat_bairro = ".$cliefat_bairro.",";
		$sql.= "cliefat_cep = ".$cliefat_cep.",";
		$sql.= "cliefat_cid_id_fk = ".$cliefat_cid_id_fk.",";
		$sql.= "cliefat_obs_duplicata = ".$cliefat_obs_duplicata.",";
		$sql.= "auto_inadimplente = ".$auto_inadimplente." ";
		if ($exist) {
			$sql.= "WHERE clie_id_fk = ".$clie_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>true)); 
	}
	
	/**
	 * Exporta os registro da tabela de clientes para o formato XLS
	 * @remotable
	 * @access public
	 * @return string $json
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
		
		$where = 'WHERE (emp_id = '.$this->empresa->emp_id.' OR emp_id IS NULL)';
		$filters = json_decode($_POST['filters']);
		if (!empty($filters)) {
			foreach ($filters as $filter) {
				if (!empty($filter->operador) && !empty($filter->campo) && !empty($filter->resultado)) {
					$filter->resultado = $filter->operador == 'LIKE' ? "'%".$this->escape_search($filter->resultado)."%'" : $this->escape($filter->resultado);
					$where.= " AND ".$filter->campo." ".$filter->operador." ".$filter->resultado;
				}
			}
		}
		
		$sql = "SELECT ".$select." FROM view_clientes ";
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
				if (preg_match("/clie_id|clie_cnpj|clie_cpf|clie_fone1|clie_fone2/i", $key)) {
					$style = 'text-align:right;';
				} elseif ($key == "clie_ativo") {
					$style = 'text-align:center;';
					$item->clie_ativo = $item->clie_ativo ? "Ativo" : "Inativo";
				}
				if (preg_match("/clie_cnpj|clie_cpf|clie_login/i", $key)) {
					$item->$key = "'".$item->$key."'";
				}
				$item->$key = (string) $item->$key;
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
		$filename = encode_filename('cliente'.$this->empresa->emp_id).'.xls';
		$fileurl = URL.'mod/cadastros/clientes/export/'.$filename;
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