<?php
class App extends MySQL {
	/**
	 * Receber instância iniciada anteriormente
	 * @access plublic static
	 */
	public static $instance;
	/**
	 * Recebe array dos arquivos js
	 * @access private
	 */
	private $javascript = array();
	private $uxlib = array();
	/**
	 * Recebe array dos arquivos css
	 * @access private
	 */
	private $stylesheet = array();
	/**
	 * Recebe a empresa logada no sistema
	 * @access protected
	 */
	protected $empresa = NULL;
	/**
	 * Recebe usuário logado no sistema
	 * @access protected
	 */
	protected $usuario = NULL;
	/**
	 * Recebe cliente logado no sistema
	 * @access protected
	 */
	protected $cliente = NULL;
	/**
	 * Antes de ser destruída fecha a conexão com o banco de dados
	 * @access public
	 * @return void
	 */
	function __destruct() {
		$this->close();
	}
	/**
	 * Função construtora para setar os valores para gerenciamento
	 * @access public
	 * @return void
	 */
	function __construct() {
		self::$instance = $this;

		$this->connect();
		$this->set_defaults();
	}
	/**
	 * Função para setar os valores padrões para gerenciamento
	 * @access protected
	 * @return void
	 */
	protected function set_defaults() {
		$usuario_id = $_SESSION['tms_user_id'];
		$empresas_id = $_SESSION['tms_empr_id'];
		$cliente_id = $_SESSION['tms_clie_id'];
		if ($cliente_id > 0) {
			$this->cliente = $this->pegar_cliente_por_id($cliente_id);
			unset($_SESSION['tms_empr_id']); unset($empresas_id);
			unset($_SESSION['tms_user_id']); unset($usuario_id);
		} elseif ($usuario_id > 0 && $empresas_id > 0) {
			$this->usuario = $this->pegar_usuario_por_id($usuario_id);
			$this->empresa = $this->pegar_empresa_por_id($empresas_id);
		} else {
			$this->cliente = (object) array(
				'clie_id' => 0,
				'clie_razao_social' => 'Convidado'
			);
		}
	}
	/**
	 * Retorna instância da classe HTML2PDF
	 * @access protected
	 * @param string $p (P,L)
	 * @param string $f (A4,A3)
	 * @return object
	 */
	protected function html2pdf($p='P', $f='A4') {
		$html2pdf = new HTML2PDF($p, $f, 'pt', true, 'UTF-8', 5);
		$html2pdf->pdf->SetDisplayMode('fullpage');
		return $html2pdf;
	}
	/**
	 * Retorna folha de estilho para o PDF
	 * @access protected
	 * @return string
	 */
	protected function pdf_style() {
		$pdf_html ='<style type="text/css">';
		$pdf_html.='*{font-family: Arial, Helvetica, sans-serif; font-size: 10px;}';
		$pdf_html.='</style>';
		return $pdf_html;
	}
	/**
	 * Retorna cabeçalho e configuração customizado dos Relatórios
	 * @access protected
	 * @param string $name Nome para o relatório
	 * @return string
	 */
	protected function pdf_custom_header($name='') {
		$pdf_html ='<page_header>';
		$pdf_html.='<table style="width:100%;">';
		$pdf_html.='<tr>';
		$pdf_html.='<td style="width:50%;" align="left"><img style="float:left;" src="'.$this->empresa->logo_url.'" /></td>';
		$pdf_html.='<td style="width:50%;" align="right">';
		$pdf_html.='<table style="width:100%" align="right">';
		$pdf_html.='<tr><td align="right" style="font-size:9px;">'.$this->empresa->emp_logradouro.', '.$this->empresa->emp_numero.' - '.$this->empresa->emp_bairro.'</td></tr>';
		$pdf_html.='<tr><td align="right" style="font-size:9px;">CEP: '.$this->empresa->emp_cep.' - '.$this->empresa->cid_municipio.' / '.$this->empresa->cid_uf.'</td></tr>';
		$pdf_html.='<tr><td align="right" style="font-size:9px;">';
		if (!empty($this->empresa->emp_fone1)) $pdf_html.= 'Fone: '.$this->empresa->emp_fone1;
		if (!empty($this->empresa->emp_fone2)) $pdf_html.=' / '.$this->empresa->emp_fone2;
		$pdf_html.='</td></tr>';
		$pdf_html.='<tr><td align="right" style="font-size:9px;">';
		$pdf_html.='<a href="mailto:'.$this->empresa->emp_email_comercial.'">'.$this->empresa->emp_email_comercial.'</a>';
		$pdf_html.='</td></tr>';
		$pdf_html.='</table>';
		$pdf_html.='</td>';
		$pdf_html.='</tr>';
		$pdf_html.='</table>';
		if (!empty($name)) {
			$pdf_html.='<table style="width:100%;" align="center">';
			$pdf_html.='<tr><td style="width:100%;"><hr/></td></tr>';
			$pdf_html.='<tr><td align="center"><b style="font-size:18px;">';
			$pdf_html.= $name;
			$pdf_html.='</b></td></tr>';
			$pdf_html.='</table>';
		}
		$day = date('d');
		$year = date('Y');
		$month = month_translate(date('F'));
		$pdf_html.='<table style="width:100%; margin-top:5px;" align="right"><tr><td align="right"><i>'.$this->empresa->cid_municipio.', '.$day.' DE '.$month.' DE '.$year.'</i></td></tr></table>';
		$pdf_html.='</page_header>';
		$pdf_html.='<page_footer><table style="width:100%;"><tr><td align="right" style="width:100%; border-top:1px solid;">página [[page_cu]]</td></tr></table></page_footer>';
		return $pdf_html;
	}
	/**
	 * Retorna cabeçalho em html para estilo fatura
	 * @access protected
	 * @param string $number Número da fatura
	 * @param string $title Título da fatura
	 * @return string
	 */
	protected function pdf_fatura_header($number, $title='FATURA CLIENTE') {
		$pdf_html = $this->pdf_style();
		$pdf_html.='<page backtop="50mm" backbottom="10mm">';
		$pdf_html.='<page_header>';
		$pdf_html.='<table style="width:100%; border:1px solid;" cellspacing="0">';
		$pdf_html.='<tr>';
		$pdf_html.='<td style="width:60%; border-right:1px solid;" align="left"><img style="float:left;" src="'.$this->empresa->logo_url.'" /></td>';
		$pdf_html.='<td style="width:40%;text-align:right;" align="right">';
		$pdf_html.='[[page_cu]]/[[page_nb]]';
		$pdf_html.='<br/><br/>';
		$pdf_html.='<span style="font-size:16px;">'.$title.'<br/><br/>Número: '.$number.'</span>';
		$pdf_html.='</td>';
		$pdf_html.='</tr>';
		$pdf_html.='</table>';
		$pdf_html.='</page_header>';
		return $pdf_html;
	}
	/**
	 * Retorna rodapé em html para estilo fatura
	 * @access protected
	 * @return string
	 */
	protected function pdf_fatura_footer() {
		$pdf_html ='<page_footer>';
		$pdf_html.='<table align="center" style="text-align:center; width:100%; font-size:9px; border-top:1px solid;">';
		$pdf_html.='<tr><td align="center" style="text-align:center; width:100%; font-size:9px;">'.$this->empresa->emp_logradouro.', '.$this->empresa->emp_numero.' - '.$this->empresa->emp_bairro.' - CEP: '.$this->empresa->emp_cep.' - '.$this->empresa->cid_municipio.' / '.$this->empresa->cid_uf.'</td></tr>';
		$pdf_html.='<tr><td align="center" style="text-align:center; width:100%; font-size:9px;">';
		$pdf_html.= 'Fone: '.$this->empresa->emp_fone1;
		if (!empty($this->empresa->emp_fone2)) $pdf_html.=' / '.$this->empresa->emp_fone2;
		$pdf_html.='</td></tr>';
		$pdf_html.='<tr><td align="center" style="text-align:center; width:100%; font-size:9px;"><a href="mailto:'.$this->empresa->emp_email_comercial.'">'.$this->empresa->emp_email_comercial.'</a></td></tr>';
		$pdf_html.='</table>';
		$pdf_html.='</page_footer>';
		$pdf_html.='</page>';
		return $pdf_html;
	}
	/**
	 * Retorna cabeçalho e configuração padrão dos Relatórios
	 * @access protected
	 * @param int $top Margem para o cabeçalho
	 * @param int $bottom Margem para o rodapé
	 * @param string $name Nome para o relatório
	 * @param string $titile Título em HTML para o relatório
	 * @param boolean $notafiscal true para cabeçalho estilo nota fiscal
	 * @param boolean $showtoday true para exibir a data de hoje
	 * @return string
	 */
	protected function pdf_default_header($name='', $title='', $top=50, $bottom=10, $notafiscal=false, $showtoday=true) {
		$pdf_html = $this->pdf_style();

		$pdf_html.='<page backtop="'.$top.'mm" backbottom="'.$bottom.'mm">';
		$pdf_html.='<page_header>';

		if ($notafiscal) {
			$pdf_html.='<table style="width:100%; border:1px solid;" cellspacing="0">';
			$pdf_html.='<tr>';
			$pdf_html.='<td style="width:60%; border:1px solid;" align="left"><img style="float:left;" src="'.$this->empresa->logo_url.'" /></td>';
			$pdf_html.='<td style="width:40%; border:1px solid;" align="center">';
			$pdf_html.='<span style="font-size:20px; font-weight:bold;">'.$this->empresa->emp_razao_social.'</span>';
			$pdf_html.='<br/>';
			$pdf_html.='<span style="font-size:9px; text-align:right;"><br/>1º Via: Emissor<br/>2º Via: Destino</span>';
			$pdf_html.='<br/><br/>';
			$pdf_html.='<span style="font-size:16px;">Número: '.$title.'<br/>'.$name.'</span>';
			$pdf_html.='</td>';
			$pdf_html.='</tr>';
			$pdf_html.='</table>';
			$pdf_html.='</page_header>';
			return $pdf_html;
		} else {
			$pdf_html.='<table style="width:100%;">';
			$pdf_html.='<tr>';
			$pdf_html.='<td style="width:50%;" align="left"><img style="float:left;" src="'.$this->empresa->logo_url.'" /></td>';
			$pdf_html.='<td style="width:50%;" align="right">';
			$pdf_html.='<table style="width:100%" align="right">';
			$pdf_html.='<tr><td align="right" style="font-size:9px;">[[page_cu]]/[[page_nb]]</td></tr>';
			$pdf_html.='<tr><td align="right" style="font-size:9px;">CNPJ: '.$this->empresa->emp_cnpj.' - I.E.: '.$this->empresa->emp_inscricao_estadual.'</td></tr>';
			$pdf_html.='<tr><td align="right" style="font-size:9px;">'.$this->empresa->emp_logradouro.', '.$this->empresa->emp_numero.' - '.$this->empresa->emp_bairro.'</td></tr>';
			$pdf_html.='<tr><td align="right" style="font-size:9px;">CEP: '.$this->empresa->emp_cep.' - '.$this->empresa->cid_municipio.' / '.$this->empresa->cid_uf.'</td></tr>';
			$pdf_html.='<tr><td align="right" style="font-size:9px;">';
			if (!empty($this->empresa->emp_fone1)) $pdf_html.= 'Fone: '.$this->empresa->emp_fone1;
			if (!empty($this->empresa->emp_fone2)) $pdf_html.=' / '.$this->empresa->emp_fone2;
			$pdf_html.='</td></tr>';
			$pdf_html.='<tr><td align="right" style="font-size:9px;">';
			$pdf_html.='<a href="mailto:'.$this->empresa->emp_email_comercial.'">'.$this->empresa->emp_email_comercial.'</a>';
			$pdf_html.='</td></tr>';
			$pdf_html.='</table>';
			$pdf_html.='</td>';
			$pdf_html.='</tr>';
			$pdf_html.='</table>';

			if (!empty($name)) {
				$pdf_html.='<table style="width:100%;" align="center">';
				$pdf_html.='<tr><td style="width:100%;"><hr/></td></tr>';
				$pdf_html.='<tr><td style="width:100%; text-align:center; font-size:18px; font-weight:bold;">';
				$pdf_html.= $name;
				$pdf_html.='</td></tr>';
				$pdf_html.='</table>';
			}

			if ($showtoday) {
				$day = date('d');
				$year = date('Y');
				$month = month_translate(date('F'));

				$pdf_html.='<table style="width:100%; margin-top:5px;" align="right"><tr><td align="right"><i>'.$this->empresa->cid_municipio.', '.$day.' DE '.$month.' DE '.$year.'</i></td></tr></table>';
			}

			$pdf_html.='</page_header>';

			if (!empty($title)) {
				$pdf_html.= $title;
				$pdf_html.='<table style="width:100%;" align="center"><tr><td style="width:100%;"><hr/></td></tr></table>';
			}
		}

		return $pdf_html;
	}
	/**
	 * Retorna cabeçalho simples
	 * @access protected
	 * @param int $top Margem para o cabeçalho
	 * @param int $bottom Margem para o rodapé
	 * @param string $name Nome para o relatório
	 * @param string $titile Título em HTML para o relatório
	 * @return string
	 */
	protected function pdf_simple_header($name='', $title='', $top=50, $bottom=10) {
		$pdf_html = $this->pdf_style();

		$pdf_html.='<page backtop="'.$top.'mm" backbottom="'.$bottom.'mm">';
		$pdf_html.='<page_header>';

		$pdf_html.='<table style="width:100%;" align="right">';
		$pdf_html.='<tr><td align="right" style="font-size:9px;">[[page_cu]]/[[page_nb]]</td></tr>';
		$pdf_html.='</table>';

		if (!empty($name)) {
			$pdf_html.='<table style="width:100%;" align="center">';
			$pdf_html.='<tr><td style="width:100%;"><hr/></td></tr>';
			$pdf_html.='<tr><td style="width:100%; text-align:center; font-size:18px; font-weight:bold;">';
			$pdf_html.= $name;
			$pdf_html.='</td></tr>';
			$pdf_html.='</table>';
		}

		$day = date('d');
		$year = date('Y');
		$month = month_translate(date('F'));
		$pdf_html.='<table style="width:100%; margin-top:5px;" align="right"><tr><td align="right"><i>'.$day.' DE '.$month.' DE '.$year.'</i></td></tr></table>';

		$pdf_html.='</page_header>';

		if (!empty($title)) {
			$pdf_html.= $title;
			$pdf_html.='<table style="width:100%;" align="center"><tr><td style="width:100%;"><hr/></td></tr></table>';
		}

		return $pdf_html;
	}
	/**
	 * Retorna rodapé e configuração padrão para rodapé dos Relatórios
	 * @access protected
	 * @return string
	 */
	protected function pdf_default_footer() {
		$pdf_html ='<page_footer><table style="width:100%;"><tr><td align="right" style="width:100%; border-top:1px solid;">página [[page_cu]] de [[page_nb]]</td></tr></table></page_footer>';
		$pdf_html.='</page>';
		return $pdf_html;
	}
	/**
	 * Gera o cabeçalho da página
	 * @access public
	 * @param boolean $cliente
	 * @return output (html)
	 */
	function html_header($cliente=false) {
		// UX Plugins
		$path = 'sencha/extjs/ux/';
		$this->add_stylesheet($path.'grid/css/Grid.css');
		$this->add_stylesheet($path.'grid/css/RangeMenu.css');
		$this->add_stylesheet($path.'master/form/field/StarRating/css/style.css');

		$this->add_uxlib($path.'grid/CheckColumn.js');
		$this->add_uxlib($path.'grid/RowExpander.js');
		$this->add_uxlib($path.'TreePicker.js');
		$this->add_uxlib($path.'statusbar/StatusBar.js');
		$this->add_uxlib($path.'statusbar/ValidationStatus.js');
		$this->add_uxlib($path.'layout/Center.js');
		$this->add_uxlib($path.'master/form/field/StarRating.js');
		$this->add_uxlib($path.'master/upload/plupload.full.js');
		$this->add_uxlib($path.'master/upload/Basic.js');
		$this->add_uxlib($path.'master/upload/Button.js');
		$this->add_uxlib($path.'master/upload/Window.js');

		if ($cliente === true) {
			$path = 'mod/site/clientes/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
		} else {
			# Sistema
			// Usuários
			$path = 'mod/sistema/usuarios/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/Window.js?_dc='.now());
			// Permissões
			$path = 'mod/sistema/permissoes/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Empresas
			$path = 'mod/sistema/empresas/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/Form.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Log do sistema
			$path = 'mod/sistema/systemlog/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());

			# Cadastros
			// Clientes
			$path = 'mod/cadastros/clientes/js';
			$this->add_javascript($path.'/Form.js?_dc='.now());
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Cidades
			$path = 'mod/cadastros/cidades/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Rotas de Entregas
			$path = 'mod/cadastros/rotasentregas/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Grupos de Tarifas
			$path = 'mod/cadastros/grupostarifas/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// IATA Códigos
			$path = 'mod/cadastros/iatacodigos/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// CFOP Códigos
			$path = 'mod/cadastros/cfopcodigos/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Produtos
			$path = 'mod/cadastros/produtos/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Praças de Pagamentos
			$path = 'mod/cadastros/pracaspagamentos/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Tabela Nacional
			$path = 'mod/cadastros/nacional/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Tabela Especial
			$path = 'mod/cadastros/especial/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Tabela Mínima
			$path = 'mod/cadastros/minima/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Tabela Expresso
			$path = 'mod/cadastros/expresso/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Taxa Desconto
			$path = 'mod/cadastros/taxadesconto/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Taxa Redespacho
			$path = 'mod/cadastros/taxaredespacho/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Taxa Terrestre
			$path = 'mod/cadastros/taxaterrestre/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Ocorrências
			$path = 'mod/cadastros/ocorrencias/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Bancos
			$path = 'mod/cadastros/bancos/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Agregados
			$path = 'mod/cadastros/agregados/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Motoristas
			$path = 'mod/cadastros/motoristas/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Veículos
			$path = 'mod/cadastros/veiculos/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());

			#Conhecimentos
			// Seguro RCTRC
			$path = 'mod/conhecimentos/rctrc/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Composição do Frete
			$path = 'mod/conhecimentos/composicaofrete/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// Composição do Cálculo
			$path = 'mod/conhecimentos/composicaocalculo/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			// CTE-s
			$path = 'mod/conhecimentos/ctes/js';
			$this->add_javascript($path.'/Window.js?_dc='.now());
			$this->add_javascript($path.'/Form.js?_dc='.now());
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// MDF-e
			$path = 'mod/conhecimentos/mdf/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());

			#Financeiro
			// Receber
			$path = 'mod/financeiro/receber/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());

			#SAC
			// Cotação
			$path = 'mod/sac/cotacao/js';
			$this->add_javascript($path.'/Form.js?_dc='.now());
			// Minuta de Embarque
			$path = 'mod/sac/coleta/js';
			$this->add_javascript($path.'/Form.js?_dc='.now());
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Coletas
			$path = 'mod/sac/coletas/js';
			$this->add_javascript($path.'/Form.js?_dc='.now());
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
			// Coletas Programadas
			$path = 'mod/sac/coletasprogramadas/js';
			$this->add_javascript($path.'/Form.js?_dc='.now());
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());

			// Romaneio
			$path = 'mod/sac/romaneios/js';
			$this->add_javascript($path.'/Grid.js?_dc='.now());
			$this->add_javascript($path.'/View.js?_dc='.now());
		}

		print '<html>';
		print '<head>';
		print '<title>'.SITE_TITLE.'</title>';

		if (isset($_GET['nocache'])) {
			print '<meta http-equiv="cache-control" content="max-age=0" />';
			print '<meta http-equiv="cache-control" content="no-cache" />';
			print '<meta http-equiv="expires" content="-1" />';
			print '<meta http-equiv="pragma" content="no-cache" />';
		}

		print '<link rel="shortcut icon" href="img/expressocloud.ico"/>';

		print '<link rel="stylesheet" type="text/css" href="sencha/extjs/resources/css/ext-all-azzurra.css" />';
		print '<link rel="stylesheet" type="text/css" href="css/app.css"/>';
		print '<link rel="stylesheet" type="text/css" href="css/icons.css"/>';
		print '<link rel="stylesheet" type="text/css" href="css/components.css"/>';

		if (count($this->stylesheet)) {
			foreach ($this->stylesheet as $css) {
				print '<link rel="stylesheet" type="text/css" href="'.$css.'"/>';
			}
		}

		print '<script type="text/javascript" src="sencha/extjs/ext-all.js"></script>';
		print '<script type="text/javascript" src="sencha/extjs/ext-lang-pt_BR.js?_dc='.now().'"></script>';
		print '<script type="text/javascript" src="sencha/extjs/resources/css/azzurra/azzurra.js"></script>';

		if (count($this->uxlib)) {
			foreach ($this->uxlib as $js) {
				print '<script type="text/javascript" src="'.$js.'"></script>';
			}
		}

		#$euro = $dolar = 0;
		$euro = conversor_moeda('EURO');
		$dolar = conversor_moeda('DOLAR');

		$jsSecret = file_get_contents('js/Settings.js');
		if ($cliente === true) {
			$jsSecret.= 'Ext.apply(App.cliente, '.encode($this->cliente).');';
		} else {
			$jsSecret.= 'Ext.apply(App.usuario, '.encode($this->usuario).');';
			$jsSecret.= 'Ext.apply(App.empresa, '.encode($this->empresa).');';
			$jsSecret.= 'Ext.apply(App.permissoes, '.encode($this->usuario->permissoes).');';
		}
		$jsSecret.= 'Ext.apply(App.cambio, {euro:'.$euro.', dolar:'.$dolar.'});';
		$jsSecret.= 'App.title = "'.SITE_TITLE.'";';
		$jsSecret.= 'App.siteUrl = "'.SITE_URL.'";';
		$jsSecret.= 'App.projeto = "'.PROJECT.'";';
		$jsSecret.= 'App.usuario.ativo = parseInt(App.usuario.user_ativo);';
		print '<script type="text/javascript">';
		$packer = new JavaScriptPacker($jsSecret, 'Normal', true, false);
		print $packer->pack();
		print '</script>';

		print '<script type="text/javascript" src="js/Model.js?_dc='.now().'"></script>';
		print '<script type="text/javascript" src="js/Store.js?_dc='.now().'"></script>';
		print '<script type="text/javascript" src="js/Components.js?_dc='.now().'"></script>';

		//if (file_exists('modules.js')) print '<script type="text/javascript" src="modules.js?_dc='.now().'"></script>';
		if (count($this->javascript)) {
			foreach ($this->javascript as $js) {
				print '<script type="text/javascript" src="'.$js.'"></script>';
			}
		}

		if ($cliente === true) {
			print '<script type="text/javascript" src="cliente.js?_dc='.now().'"></script>';
		} else {
			print '<script type="text/javascript" src="app.js?_dc='.now().'"></script>';
		}

		print '</head>';

		print '<body>';
		print '<div id="pc-google-finance">';
		print '<table style="margin-left:10px; margin-top:10px;">';
		print '<tr><th colspan="2" style="text-align:center; font-weight:bold;">CÂMBIO '.date("d/m").'</th></tr>';
		print '<tr><th style="width:60px; text-align:left;">Dólar</th><th style="width:60px; text-align:right;">'.float_to_money($dolar).'</th></tr>';
		print '<tr><th style="text-align:left;">Euro</th><th style="text-align:right;">'.float_to_money($euro).'</th></tr>';
		print '<tr><th colspan="2" style="text-align:center;"><a href="http://www.google.com/finance" target="_blank">Google Finance</a></th></tr>';
		print '</table>';
		print '</div>';
	}
	/**
	 * Fecha as tag html
	 * @access public
	 * @return output (html)
	 */
	function html_footer() {
		print '</body>';
		print '</html>';
	}
	/**
	 * Adiciona folha de estilho a página
	 * @access private
	 * @param string $css
	 * @return void
	 */
	private function add_stylesheet($css) {
		if (is_array($css)) $this->stylesheet = $css; else array_push($this->stylesheet, $css);
	}
	/**
	 * Adiciona javascript a página
	 * @access private
	 * @param string $js
	 * @return void
	 */
	private function add_javascript($js) {
		if (is_array($js)) $this->javascript = $js; else array_push($this->javascript, $js);
	}
	/**
	 * Adiciona javascript a página
	 * @access private
	 * @param string $js
	 * @return void
	 */
	private function add_uxlib($js) {
		if (is_array($js)) $this->uxlib = $js; else array_push($this->uxlib, $js);
	}
	/**
	 * Depurador, inspecionar objetos
	 * @access public
	 * @param object $o
	 * @return output (console firebug)
	 */
	public function debug($o) {
		$firephp = FirePHP::getInstance(true);
		try {
			if (is_array($o))	$firephp->fb($o, FirePHP::TRACE);
			else				$firephp->fb($o);
		} catch(Exception $e) {
			$firephp->fb($e);
		}
	}
	/**
	 * Retorna verdadeiro ou falso se o servidor solicitante é da Sistrom.com.br
	 * @access protected
	 * @return bool;
	 */
	protected function is_owner_server() {
		return preg_match("/sistrom/", $_SERVER['SERVER_NAME']);
	}
	/**
	 * Retorna se usuário está logado
	 * @access public
	 * @return bool
	 */
	function logged() {
		if (!$this->is_owner_server()) return false;
		if (isset($_SESSION['tms_suspended'])) return false;
		return $this->is_online() || $this->cliente_online();
	}
	/**
	 * Retornar verdadeiro ou false se o clinete está online
	 * @access public
	 * @return bool
	 */
	function cliente_online() {
		$online = $_SESSION['tms_clie_id'] > 0;
		if (!$online) {
			$online = !empty($_SESSION['tms_ctes_list_id']);
		}
		return $online;
	}
	/**
	 * Retorna verdadeiro ou falso se o usuário está online
	 * @access public
	 * @return bool
	 */
	function is_online() {
		if ($_SESSION['tms_user_id'] > 0 && $_SESSION['tms_empr_id'] > 0 && $this->is_owner_server()) {
			$this->usuario = $this->pegar_usuario_por_id($_SESSION['tms_user_id']);
			if ($this->usuario) {
				if (!$this->usuario->user_ativo) {
					$this->logout();
					return false;
				}
				$this->empresa = $this->pegar_empresa_por_id($_SESSION['tms_empr_id']);
				if (!$this->empresa) {
					$this->logout();
					return false;
				}
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	/**
	 * Fechar seção
	 * @access public
	 * @return void
	 */
	function logout() {
		foreach ($_SESSION as $key => $value) {
			unset($_SESSION[$key]);
		}
		foreach ($_COOKIE as $key => $value) {
			unset($_COOKIE[$key]);
		}
	}
	/**
	 * retorna varíavel usuario
	 * @access public
	 * @return object
	 */
	public function pegar_empresa() {
		return $this->empresa;
	}
	/**
	 * retorna varíavel usuario
	 * @access public
	 * @return object
	 */
	public function pegar_usuario() {
		return $this->usuario;
	}
	/**
	 * Faz a consulta no db e retorna a linha da tabela usuarios
	 * @access protected
	 * @param int $user_id
	 * @return object
	 */
	 protected function pegar_usuario_por_id($user_id) {
		if (!$user_id) return NULL;

		$sql = "SELECT *, NULL AS permissoes FROM usuarios WHERE user_id = ".intval($user_id);
		$query = $this->query($sql);

		if ($this->num_rows($query)) {
			$field = $this->fetch_object($query);
			foreach ($field as $key => $value) {
				if (is_numeric($value)) {
					$field->$key = floatval($value);
				}
			}
			$this->free_result($query);
			$field->permissoes = $this->pegar_permissoes($field->perm_id);
			return $field;
		} else {
			$this->free_result($query);
			return NULL;
		}
	}
	/**
	 * Faz a consulta no db e retorna a linha da tabela empresas
	 * @access protected
	 * @param int $emp_id
	 * @return object
	 */
	protected function pegar_empresa_por_id($emp_id) {
		if (!$emp_id) return NULL;

		$sql = "SELECT t1.*, NULL AS logo_url, ";
		$sql.= "CASE t1.emp_modal WHEN 'Aereo' THEN '02' WHEN 'Rodoviario' THEN '01' ELSE '06' END AS emp_modal_codigo,";
		$sql.= "CONCAT_WS(' - ', t1.emp_sigla_cia, t1.emp_nome_fantasia) AS emp_login, ";
		$sql.= "CONCAT_WS('-TMSX9-', t1.emp_id, t1.emp_razao_social) AS uniqueid, ";
		$sql.= "CONCAT_WS(' - ', t2.cid_uf, t2.cid_municipio) AS cid_nome,";
		$sql.= "LEFT(t2.cid_codigo_municipio, 2) AS cid_codigo_uf,";
		$sql.= "t2.cid_codigo_municipio,";
		$sql.= "t2.cid_municipio,";
		$sql.= "t2.cid_uf,";
		$sql.= "t2.cid_sigla,";
		$sql.= "t2.cid_nome_aeroporto ";
		$sql.= "FROM empresas AS t1 ";
		$sql.= "LEFT JOIN cidades AS t2 ON t2.cid_id = t1.cid_id_fk ";
		$sql.= "WHERE emp_id = ".intval($emp_id);
		$query = $this->query($sql);

		if ($this->num_rows($query)) {
			$field = $this->fetch_object($query);

			$field->logo_url = URL.'mod/sistema/empresas/logo/'.$field->emp_logotipo;
			$field->uniqueid = encode_string($field->uniqueid);

			foreach ($field as $key => $value) {
				if (is_numeric($value) && !preg_match("/emp_cnpj|emp_RNTRC|emp_cep|emp_apolice|emp_inscricao_estadual|emp_modal_codigo/i", $key)) {
					$field->$key = floatval($value);
				}
			}

			$this->free_result($query);
			return $field;
		} else {
			return NULL;
		}
	}
	/**
	 * Retorna dados de um cliente por id
	 * @access protected
	 * @param int $id
	 * @return object
	 */
	protected function pegar_cliente_por_id($id) {
		if (!$id) return NULL;
		$sql = "SELECT * FROM view_clientes WHERE clie_id = ".$id;
		$query = $this->query($sql);
		$result = NULL;
		if ($this->num_rows($query_id)) {
			$result = $this->fetch_object($query);
		}
		$this->free_result($query);
		return $result;
	}
	/**
	 * Autenciar cliente
	 * @access public
	 * @return bool
	 */
	function autenticar_cliente() {
		if (!$this->is_owner_server()) {
			print json_encode(array('success'=>false,'msg'=>NOT_SERVER_MSG));
			return false;
		}

		$cliente_login = $this->escape(trim($_POST['cliente_login']));
		$cliente_senha = $this->escape(trim($_POST['cliente_senha']));

		$sql = "SELECT DISTINCT t1.clie_id FROM clientes AS t1 ";
		$sql.= "INNER JOIN ctes AS t2 ON (t2.clie_remetente_id = t1.clie_id OR t2.clie_destinatario_id = t1.clie_id OR t2.clie_tomador_id = t1.clie_id) ";
		$sql.= "WHERE t1.clie_login = ".$cliente_login." ";
		$sql.= "AND t1.clie_senha = ".$cliente_senha. " ";
		$sql.= "ORDER BY clie_id DESC LIMIT 1";
		$query = $this->query($sql);
		$clie_id = $this->fetch_object($query)->clie_id;
		$this->free_result($query);

		if ($clie_id > 0) {
			$_SESSION['tms_clie_id'] = $clie_id;
			$this->set_defaults();
			print json_encode(array('success'=>true));
		} else {
			print json_encode(array('success'=>false,'msg'=>'Login inválido. Por favor verifique seus dados de acesso.'));
		}
	}
	/**
	 * Autenciar usuário
	 * @access public
	 * @return bool
	 */
	function autenticar_usuario() {
		if (!$this->is_owner_server()) {
			print json_encode(array('success'=>false,'msg'=>NOT_SERVER_MSG));
			return false;
		}

		$usuario_login = trim($_POST['usuario_login']);
		$usuario_senha = trim($_POST['usuario_senha']);
		$usuario_field = is_email($usuario_login) ? 'user_email' : 'user_login';
		$usuario_login = $this->escape($usuario_login);
		$usuario_senha = $this->escape($usuario_senha);

		$sql = "SELECT user_id, user_ativo FROM usuarios ";
		$sql.= "WHERE user_senha = ".$usuario_senha." ";
		$sql.= "AND ".$usuario_field." = ".$usuario_login;

		$query = $this->query($sql);

		if ($this->num_rows($query)) {
			$field = $this->fetch_object($query);

			if (!$field->user_ativo) {
				$this->logout();
				$_SESSION['tms_suspended'] = 1;
				print json_encode(array('success'=>false,'suspended'=>true,'msg'=>'Sua conta está suspensa, favor entre em contato através do e-mail: <a href="mailto:'.MAILER_EMAIL.'">'.MAILER_EMAIL.'</a>.'));
				return false;
			}

			$_SESSION['tms_user_id'] = $field->user_id;
			$_SESSION['tms_empr_id'] = intval($_POST['empresas_id']);

			$this->set_defaults();

			unset($_SESSION['tms_suspended']);
			print json_encode(array('success'=>true));
		} else {
			print json_encode(array('success'=>false,'msg'=>'Login inválido. Por favor verifique seus dados de acesso.'));
		}
	}
	/**
	 * Retorna SQL com ordery by e where do Framework Sencha Grid Filter
	 * @access protected
	 * @return object
	 */
	protected function get_sql_param() {
		$nolimit = isset($_GET['nolimit']);
		$nofilter = isset($_GET['nofilter']);
		$sqlstart = intval($_GET['start']);	if (!$sqlstart) $sqlstart = 0;
		$sqllimit = intval($_GET['limit']);	if (!$sqllimit) $sqllimit = 100;
		$sqlorder = json_decode($_GET['sort']);
		$sqlgroup = json_decode($_GET['group']);
		$sqlfilters = json_decode($_GET['filter']);
		$sqlquery = json_decode($_GET['query']);
		$normalquery = parse_boolean($_GET['normalquery']);
		$defaultqueries = $queries = array();
		$sqlwhere = $sqlgroupby = $sqlorderby = '';

		if (is_array($sqlorder) && !empty($sqlorder)) {
			$firstrow = true;
			foreach ($sqlorder as $order) {
				if (empty($order->property)) {
					continue;
				}
				if ($firstrow) {
					$sqlorderby.= $order->property." ".$order->direction;
					$firstrow = false;
				} else {
					$sqlorderby.= ", ".$order->property." ".$order->direction;
				}
			}
		}
		if (is_array($sqlgroup) && !empty($sqlgroup)) {
			$firstrow = true;
			foreach ($sqlgroup as $group) {
				if (empty($group->property)) {
					continue;
				}
				if ($firstrow) {
					$sqlgroupby.= $group->property;
					$firstrow = false;
				} else {
					$sqlgroupby.= ", ".$group->property;
				}
			}
		}
		if (is_array($sqlfilters) && !empty($sqlfilters)) {
			foreach ($sqlfilters as $filter) {
				if (empty($filter->value) || empty($filter->field)) {
					continue;
				}
				switch ($filter->type) {
					default:
						$sqlwhere .= " AND ".$filter->field." LIKE '%".$this->escape_search($filter->value)."%'";
						break;
					case 'list' :
						if (strstr($filter->value,',')) {
							$fi = explode(',',$filter->value);
							for ($q=0;$q<count($fi);$q++) $fi[$q] = "'".$fi[$q]."'";
							$filter->value = implode(',',$fi);
							$sqlwhere .= " AND ".$filter->field." IN (".$filter->value.")";
						} else {
							$sqlwhere .= " AND ".$filter->field." = '".$filter->value."'";
						}
						break;
					case 'boolean' :
						$sqlwhere .= " AND ".$filter->field." = ".$this->escape($filter->value, 'bool');
						break;
					case 'numeric' :
						$filter->value = $this->escape($filter->value, 'decimal');
						switch ($filter->comparison) {
							case 'eq' : $sqlwhere .= " AND ".$filter->field." = ".$filter->value; break;
							case 'lt' : $sqlwhere .= " AND ".$filter->field." < ".$filter->value; break;
							case 'gt' : $sqlwhere .= " AND ".$filter->field." > ".$filter->value; break;
						}
					break;
					case 'date' :
						$filter->value = $this->escape($filter->value, 'date');
						switch ($filter->comparison) {
							default: $sqlwhere .= " AND DATE(".$filter->field.") = ".$filter->value; break;
							case 'lt' : $sqlwhere .= " AND DATE(".$filter->field.") <= ".$filter->value; break;
							case 'gt' : $sqlwhere .= " AND DATE(".$filter->field.") >= ".$filter->value; break;
						}
						break;
				}
    		}
		}
		if (is_array($sqlquery) && !empty($sqlquery)) {
			$sqlwhere.= " AND (";
			if ($normalquery) {
				foreach ($sqlquery as $i => $filter) {
					if (empty($filter->value) || empty($filter->property)) {
						continue;
					}
					$filter->value = $this->escape_search(trim($filter->value));
					$sqlwhere.= ($i) ? " OR " : "";
					$sqlwhere.= $filter->property;
					$sqlwhere.= " LIKE '%".$filter->value."%'";
					if (!in_array($filter->value, $defaultqueries)) {
						array_push($defaultqueries, $filter->value);
					}
				}
				$queries = $defaultqueries;
			} else {
				foreach ($sqlquery as $i => $filter) {
					if (empty($filter->value) || empty($filter->property)) {
						continue;
					}
					$values = trim($filter->value);
					$escape = $this->escape_search($values);
					$values = explode(" ", $values);
					$sqlwhere.= ($i) ? " OR (" : "(";
					foreach ($values as $j => $value) {
						$value = trim($value);
						if (empty($value) || strlen($value) < 4) {
							continue;
						}
						$value = $this->escape_search($value);
						$sqlwhere.= ($j) ? " OR " : "";
						$sqlwhere.= $filter->property;
						$sqlwhere.= " LIKE '%".$value."%'";
						if (!in_array($value, $queries)) {
							array_push($queries, $value);
						}
					}
					if (!in_array($escape, $defaultqueries)) {
						array_push($defaultqueries, $escape);
					}
					$sqlwhere.= ")";
				}
			}
			$sqlwhere.= ")";
		}

		return (object) array(
			'start' => $sqlstart,
			'limit' => $nolimit ? 0 : $sqllimit,
			'sort' => $sqlorderby,
			'group' => $sqlgroupby,
			'filter' => $nofilter ? ' ' : $sqlwhere.' ',
			'queries' => $queries,
			'searchs' => $defaultqueries
		);
	}
	/**
	 * Retorna SQL com where do Framework Sencha ComboBox
	 * @param string $table
	 * @access protected
	 * @return string
	 */
	protected function get_filter_param($tables) {
		$search = trim($_GET['query']); $sqlwhere = "";
		if (!empty($search) && !empty($tables)) {
			if (!is_array($tables)) {
				$tables = array(array('name'=>$tables,'prefix'=>null));
			}
			$sqlwhere.= " AND (";
			$search = $this->escape_search($search);
			foreach ($tables as $i => $table) {
				$sqlwhere.= ($i) ? " OR " : "";
				$fields = $this->get_fields($table['name']);
				foreach ($fields as $j => $field) {
					$sqlwhere.= ($j) ? " OR " : "";
					$sqlwhere.= empty($table['prefix']) ? $field->name : $table['prefix'].".".$field->name;
					$sqlwhere.= " LIKE '%".$search."%'";
				}
			}
			$sqlwhere.= ") ";
		}
		return $sqlwhere;
	}
	/**
	 * Retorna SQL com where da view_cadastros para ComboBox
	 * @access protected
	 * @return string
	 */
	protected function get_view_cadastros_param() {
		$search = trim($_GET['query']); $where = "";
		if (!empty($search)) {
			$fields = array("categoria","razao_social","nome_fantasia","cnpj","ie","im","email1","email2","email3","site","endereco","complemento","bairro","cidade");
			$where.= " AND (";
			foreach ($fields as $i => $field) {
				$where.= ($i) ? " OR (" : "(";
				$where.= " cadastros.".$field;
				$where.= " LIKE '%".$this->escape_search($search)."%'";
				$where.= ")";
			}
			$where.= ") ";
		}
		return $where;
	}
	/**
	 * Retorna view em SQL dos cadastros principais do sistema
	 * @param string $fields
	 * @access protected
	 * @return string
	 */
	protected function get_view_cadastros($fields=null) {
		$sql ="SELECT DISTINCT ".(empty($fields) ? "cadastros.*" : $fields)." FROM ( ";
		$sql.="SELECT DISTINCT ";
		$sql.="t1.empresas_id, ";
		$sql.="t1.categoria, ";
		$sql.="t1.razao_social, ";
		$sql.="t1.nome_fantasia, ";
		$sql.="t1.cnpj, ";
		$sql.="t1.ie, ";
		$sql.="t1.im, ";
		$sql.="t1.telefone1, ";
		$sql.="t1.telefone2, ";
		$sql.="t1.telefone3, ";
		$sql.="t1.telefone4, ";
		$sql.="t1.fax1, ";
		$sql.="t1.fax2, ";
		$sql.="t1.email1, ";
		$sql.="t1.email2, ";
		$sql.="t1.email3, ";
		$sql.="t1.site, ";
		$sql.="t1.endereco, ";
		$sql.="t1.complemento, ";
		$sql.="t1.bairro, ";
		$sql.="t1.cep, ";
		$sql.="t1.cidade, ";
		$sql.="t1.uf, ";
		$sql.="t1.deposito_banco_id, ";
		$sql.="CONCAT_WS(' - ', t2.codigo, t2.nome) AS deposito_banco_nome, ";
		$sql.="t1.deposito_agencia, ";
		$sql.="t1.deposito_conta, ";
		$sql.="t1.deposito_titular, ";
		$sql.="t1.deposito_titular_documento ";
		$sql.="FROM fornecedores AS t1 ";
		$sql.="LEFT JOIN bancos AS t2 ON t2.id = t1.deposito_banco_id ";
		$sql.="WHERE t1.empresas_id = ".$this->empresa->id." AND t1.excluido = 0 ";

		$sql.="UNION ";

		$sql.="SELECT DISTINCT ";
		$sql.="t1.empresas_id, ";
		$sql.="t1.categoria, ";
		$sql.="t1.razao_social, ";
		$sql.="t1.nome_fantasia, ";
		$sql.="t1.cnpj, ";
		$sql.="t1.ie, ";
		$sql.="t1.im, ";
		$sql.="t1.telefone1, ";
		$sql.="t1.telefone2, ";
		$sql.="t1.telefone3, ";
		$sql.="t1.telefone4, ";
		$sql.="t1.fax1, ";
		$sql.="t1.fax2, ";
		$sql.="t1.email1, ";
		$sql.="t1.email2, ";
		$sql.="t1.email3, ";
		$sql.="t1.site, ";
		$sql.="t1.endereco, ";
		$sql.="t1.complemento, ";
		$sql.="t1.bairro, ";
		$sql.="t1.cep, ";
		$sql.="t1.cidade, ";
		$sql.="t1.uf, ";
		$sql.="t1.deposito_banco_id, ";
		$sql.="CONCAT_WS(' - ', t2.codigo, t2.nome) AS deposito_banco_nome, ";
		$sql.="t1.deposito_agencia, ";
		$sql.="t1.deposito_conta, ";
		$sql.="t1.deposito_titular, ";
		$sql.="t1.deposito_titular_documento ";
		$sql.="FROM clientes AS t1 ";
		$sql.="LEFT JOIN bancos AS t2 ON t2.id = t1.deposito_banco_id ";
		$sql.="WHERE t1.empresas_id = ".$this->empresa->id." AND t1.excluido = 0 ";

		$sql.="UNION ";

		$sql.="SELECT DISTINCT ";
		$sql.="t1.empresas_id, ";
		$sql.="'PARCEIRA' AS categoria, ";
		$sql.="t1.razao_social, ";
		$sql.="t1.nome_fantasia, ";
		$sql.="t1.cnpj, ";
		$sql.="t1.ie, ";
		$sql.="t1.im, ";
		$sql.="t1.telefone1, ";
		$sql.="t1.telefone2, ";
		$sql.="t1.telefone3, ";
		$sql.="t1.telefone4, ";
		$sql.="t1.fax1, ";
		$sql.="t1.fax2, ";
		$sql.="t1.email1, ";
		$sql.="t1.email2, ";
		$sql.="t1.email3, ";
		$sql.="t1.site, ";
		$sql.="t1.endereco, ";
		$sql.="t1.complemento, ";
		$sql.="t1.bairro, ";
		$sql.="t1.cep, ";
		$sql.="t1.cidade, ";
		$sql.="t1.uf, ";
		$sql.="t1.deposito_banco_id, ";
		$sql.="CONCAT_WS(' - ', t2.codigo, t2.nome) AS deposito_banco_nome, ";
		$sql.="t1.deposito_agencia, ";
		$sql.="t1.deposito_conta, ";
		$sql.="t1.deposito_titular, ";
		$sql.="t1.deposito_titular_documento ";
		$sql.="FROM marmoraria_parceiras AS t1 ";
		$sql.="LEFT JOIN bancos AS t2 ON t2.id = t1.deposito_banco_id ";
		$sql.="WHERE t1.empresas_id = ".$this->empresa->id." AND t1.excluido = 0 ";

		$sql.="UNION ";

		$sql.="SELECT DISTINCT ";
		$sql.="empresas_id, ";
		$sql.="'CLIENTE/OBRA' AS categoria, ";
		$sql.="nome AS razao_social, ";
		$sql.="NULL AS nome_fantasia, ";
		$sql.="cei AS cnpj, ";
		$sql.="NULL AS ie, ";
		$sql.="NULL AS im, ";
		$sql.="telefone1, ";
		$sql.="telefone2, ";
		$sql.="telefone3, ";
		$sql.="telefone4, ";
		$sql.="fax1, ";
		$sql.="fax2, ";
		$sql.="email1, ";
		$sql.="email2, ";
		$sql.="email3, ";
		$sql.="site, ";
		$sql.="endereco, ";
		$sql.="complemento, ";
		$sql.="bairro, ";
		$sql.="cep, ";
		$sql.="cidade, ";
		$sql.="uf, ";
		$sql.="NULL AS deposito_banco_id, ";
		$sql.="NULL AS deposito_banco_nome, ";
		$sql.="NULL AS deposito_agencia, ";
		$sql.="NULL AS deposito_conta, ";
		$sql.="NULL AS deposito_titular, ";
		$sql.="NULL AS deposito_titular_documento ";
		$sql.="FROM obras ";
		$sql.="WHERE empresas_id = ".$this->empresa->id." AND excluido = 0 ";

		$sql.="UNION ";

		$sql.="SELECT DISTINCT ";
		$sql.="IF(t3.contatos_id > 0, f1.empresas_id, IF(t4.contatos_id > 0, f2.empresas_id, IF(t5.contatos_id > 0, f3.empresas_id, f4.empresas_id))) AS empresas_id,";
		$sql.="'CONTATO' AS categoria, ";
		$sql.="t1.nome AS razao_social, ";
		$sql.="NULL AS nome_fantasia, ";
		$sql.="NULL AS cnpj, ";
		$sql.="NULL AS ie, ";
		$sql.="NULL AS im, ";
		$sql.="t1.telefone1, ";
		$sql.="t1.telefone2, ";
		$sql.="t1.telefone3, ";
		$sql.="t1.telefone4, ";
		$sql.="t1.fax1, ";
		$sql.="t1.fax2, ";
		$sql.="t1.email1, ";
		$sql.="t1.email2, ";
		$sql.="t1.email3, ";
		$sql.="IF(t3.contatos_id > 0, f1.site, IF(t4.contatos_id > 0, f2.site, IF(t5.contatos_id > 0, f3.site, f4.site))) AS site,";
		$sql.="IF(t3.contatos_id > 0, f1.endereco, IF(t4.contatos_id > 0, f2.endereco, IF(t5.contatos_id > 0, f3.endereco, f4.endereco))) AS endereco,";
		$sql.="IF(t3.contatos_id > 0, f1.complemento, IF(t4.contatos_id > 0, f2.complemento, IF(t5.contatos_id > 0, f3.complemento, f4.complemento))) AS complemento,";
		$sql.="IF(t3.contatos_id > 0, f1.bairro, IF(t4.contatos_id > 0, f2.bairro, IF(t5.contatos_id > 0, f3.bairro, f4.bairro))) AS bairro,";
		$sql.="IF(t3.contatos_id > 0, f1.cep, IF(t4.contatos_id > 0, f2.cep, IF(t5.contatos_id > 0, f3.cep, f4.cep))) AS cep,";
		$sql.="IF(t3.contatos_id > 0, f1.cidade, IF(t4.contatos_id > 0, f2.cidade, IF(t5.contatos_id > 0, f3.cidade, f4.cidade))) AS cidade,";
		$sql.="IF(t3.contatos_id > 0, f1.uf, IF(t4.contatos_id > 0, f2.uf, IF(t5.contatos_id > 0, f3.uf, f4.uf))) AS uf,";
		$sql.="t1.deposito_banco_id, ";
		$sql.="CONCAT_WS(' - ', t2.codigo, t2.nome) AS deposito_banco_nome, ";
		$sql.="t1.deposito_agencia, ";
		$sql.="t1.deposito_conta, ";
		$sql.="t1.deposito_titular, ";
		$sql.="t1.deposito_titular_documento ";
		$sql.="FROM contatos AS t1 ";
		$sql.="LEFT JOIN bancos AS t2 ON t2.id = t1.deposito_banco_id ";
		$sql.="LEFT JOIN clientes_has_contatos AS t3 ON t3.contatos_id = t1.id ";
		$sql.="LEFT JOIN clientes AS f1 ON f1.id = t3.clientes_id ";
		$sql.="LEFT JOIN fornecedores_has_contatos AS t4 ON t4.contatos_id = t1.id ";
		$sql.="LEFT JOIN fornecedores AS f2 ON f2.id = t4.fornecedores_id ";
		$sql.="LEFT JOIN obras_has_contatos AS t5 ON t5.contatos_id = t1.id ";
		$sql.="LEFT JOIN obras AS f3 ON f3.id = t5.obras_id ";
		$sql.="LEFT JOIN marmoraria_parceiras_has_contatos AS t6 ON t6.contatos_id = t1.id ";
		$sql.="LEFT JOIN marmoraria_parceiras AS f4 ON f4.id = t6.parceiras_id ";
		$sql.="WHERE (f1.empresas_id = ".$this->empresa->id." ";
		$sql.="OR f2.empresas_id = ".$this->empresa->id." ";
		$sql.="OR f3.empresas_id = ".$this->empresa->id." ";
		$sql.="OR f4.empresas_id = ".$this->empresa->id.") ";
		$sql.="AND t1.excluido = 0 ";

		$sql.="UNION ";

		$sql.="SELECT DISTINCT ";
		$sql.="t1.empresas_id, ";
		$sql.="'FUNCIONÁRIO' AS categoria, ";
		$sql.="t1.nome AS razao_social, ";
		$sql.="NULL AS nome_fantasia, ";
		$sql.="t1.cpf AS cnpj, ";
		$sql.="t1.rg AS ie, ";
		$sql.="NULL AS im, ";
		$sql.="t1.telefone AS telefone1, ";
		$sql.="t1.celular AS telefone2, ";
		$sql.="t1.empresa_anterior_telefone AS telefone3, ";
		$sql.="NULL AS telefone4, ";
		$sql.="NULL AS fax1, ";
		$sql.="NULL AS fax2, ";
		$sql.="t1.email AS email1, ";
		$sql.="NULL AS email2, ";
		$sql.="NULL AS email3, ";
		$sql.="NULL AS site, ";
		$sql.="t1.endereco, ";
		$sql.="t1.complemento, ";
		$sql.="t1.bairro, ";
		$sql.="t1.cep, ";
		$sql.="t1.cidade, ";
		$sql.="t1.uf, ";
		$sql.="t1.deposito_banco_id, ";
		$sql.="CONCAT_WS(' - ', t2.codigo, t2.nome) AS deposito_banco_nome, ";
		$sql.="t1.deposito_agencia, ";
		$sql.="t1.deposito_conta, ";
		$sql.="t1.deposito_titular, ";
		$sql.="t1.deposito_titular_documento ";
		$sql.="FROM funcionarios AS t1 ";
		$sql.="LEFT JOIN bancos AS t2 ON t2.id = t1.deposito_banco_id ";
		$sql.="WHERE t1.empresas_id = ".$this->empresa->id." AND t1.excluido = 0 ";
		$sql.=") AS cadastros ";

		return $sql;
	}
	/**
	 * Retorna um array com as pemissões do usuário
	 * @param int $perm_id
	 * @return Array (hash)
	 */
	protected function pegar_permissoes($perm_id) {
		$sql = "SELECT * FROM permissoes WHERE perm_id = ".intval($perm_id);
		$query = $this->query($sql);
		$field = $this->fetch_object($query);
		$this->free_result($query);
		return $field;
	}
	/**
	 * Enviar relatório de erro ao suporte
	 * @access public
	 * @return void
	 */
	function enviar_relatorio_erro() {
		$server_response = $_POST['server_response'];
		$user_response = $_POST['user_response'];

		$Mailer = new Mailer();
		$Mailer->to = 'suporte@sistrom.com.br';
		$Mailer->cc = 'mateusmedeiros@sistrom.com.br';
		$Mailer->Subject = 'RELATÓRIO DE ERRO';
		$Mailer->message = '<p>O usuário '.$this->usuario->user_nome.' (<a href="mailto:'.$this->usuario->user_email.'">'.$this->usuario->user_email.'</a>) detectou o seguinte erro no sistema.</p>';
		$Mailer->message.= '<p><b>Resposta do Servidor:</b><br/>'.$server_response.'</p>';
		$Mailer->message.= '<p><b>Mensagem do usuário:</b><br/>'.$user_response.'</p>';
		$Mailer->message.= '<p>Para acessar o arquivo de log <a target="_blank" href="'.URL.'php/log/db_errors.log">clique aqui</a></p>';

		$success = $Mailer->send();

		print json_encode(array('success'=>$success));
	}
	/**
	 * Enviar e-mail
	 * @access public
	 * @return void
	 */
	function enviar_email() {
		$Mailer = new Mailer();
		$arquivo = $_FILES['arquivo']; $filename = null;

		if (!empty($arquivo['name'])) {
			if ($arquivo["error"] > 0) {
				print json_encode(array('success'=>false,'msg'=>'Erro: #'.$arquivo['error'].' - o arquivo de imagem parece estar corrompido.'));
				return false;
			}
			$path = PATH.'upload';
			if (!is_dir($path)) {
				@mkdir($path, 0777);
				@chmod($path, 0777);
			}
			$filename = $path.'/'.$arquivo['name'];
			if (file_exists($filename)) {
				@unlink($filename);
			}
			if (move_uploaded_file($arquivo['tmp_name'], $filename)) {
				$Mailer->AddAttachment($filename);
				$this->debug($filename);
			} else {
				throw new Error('Não foi possível mover o arquivo para a pasta de destino '.$filename);
				return false;
			}
		}
		$Mailer->Subject = trim($_POST['tipo']).' - '.trim($_POST['assunto']);
		$Mailer->message = $_POST['mensagem'];
		$Mailer->to = SUPPORT_EMAIL;
		$success = $Mailer->send();

		if (file_exists($filename)) {
			@unlink($filename);
		}

		print json_encode(array('success'=>$success));
	}
	/**
	 * Buscar endereco na API do Google uso exclusivo para o componente Combobox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function endereco_store() {
		$search = trim($_GET['query']);
		if (empty($search)) {
			print(json_encode(array("total"=>0, "results"=>array())));
		} else {
			$list = buscar_endereco($search);
			if (empty($list)) $list = array();
			print(json_encode(array("total"=>count($list),"data"=>$list)));
		}
	}
	/**
	 * Buscar cotação na API do Google uso exclusivo do ajax
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function cambio_store() {
		$from = trim($_POST['from']);
		$to = trim($_POST['to']);
		$ammount = floatval($_POST['ammount']);
		$cambio = conversor_moeda($from, $to, $ammount, true);
		$cotacao = @round($cambio / $ammount, 2);
		print json_encode(array('success'=>true,'cambio'=>$cambio,'cotacao'=>$cotacao));
	}
	/**
	 * Consultar contato. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_contato() {
		$sql = "SELECT t1.*, ";
		$sql.= "t2.user_nome AS con_cadastrado_por_nome,";
		$sql.= "t3.user_nome AS con_alterado_por_nome ";
		$sql.= "FROM clientes_contatos AS t1 ";
		$sql.= "LEFT JOIN usuarios AS t2 ON t2.user_id = t1.con_cadastrado_por ";
		$sql.= "LEFT JOIN usuarios AS t3 ON t3.user_id = t1.con_alterado_por ";
		$sql.= "WHERE t1.clie_id = ".intval($_GET['clie_id'])." ";
		$sql.= "ORDER BY t1.con_nome";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Excluir contato. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_contato() {
		$sql = "DELETE FROM clientes_contatos WHERE con_id IN(".$_POST['con_id'].")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		print json_encode(array('success'=>$this->affected_rows() > 0));
	}
	/**
	 * Salvar contato. Uso exclusivo do Componente Window (Edit)
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_contato() {
		$con_id = intval($_POST['con_id']);
		$clie_id = intval($_POST['clie_id']);
		$con_nome = $this->escape(trim($_POST['con_nome']));
		$con_setor = $this->escape(trim($_POST['con_setor']));
		$con_funcao = $this->escape(trim($_POST['con_funcao']));
		$con_fone = $this->escape(trim($_POST['con_fone']));
		$con_ramal = $this->escape(trim($_POST['con_ramal']));
		$con_celular = $this->escape(trim($_POST['con_celular']));
		$con_email = $this->escape(trim($_POST['con_email']));
		$con_nascimento = $this->escape(trim($_POST['con_nascimento']), 'date');
		$con_recebe_cte = $this->escape(trim($_POST['con_recebe_cte']));
		$con_email_cte = $this->escape(trim($_POST['con_email_cte']));
		$con_nota = $this->escape(trim($_POST['con_nota']));

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
		if (!$con_id) {
			$con_id = $this->insert_id();
		}

		print json_encode(array('success'=>true, 'con_id'=>$con_id));
	}
	/**
	 * Função útil para manutenção dos registros. Uso exclusivo do Componente Form
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function update_table() {
		$filtros	=	json_decode($_POST['filters']);
		$campo		=	strtolower(trim($_POST['campo']));
		$tabela		=	strtolower(trim($_POST['table']));
		$resultado	=	$this->escape($_POST['resultado']);

		$sql = "UPDATE ".$tabela." SET ".$campo." = ".$resultado." WHERE empresas_id = ".$this->empresa->id;
		if ($filtros) {
			foreach ($filtros as $filtro) {
				$filtro->resultado = $filtro->operador == 'LIKE' ? "'%".$this->escape_search($filtro->resultado)."%'" : $this->escape($filtro->resultado);
				$sql.= " AND ".$filtro->campo." ".$filtro->operador." ".$filtro->resultado;
			}
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}

		$success = $this->affected_rows() > 0;
		$msg = $success ? 'Os registros foram alterados com sucesso' : 'Nenhum registro foi alterado pelo seguinte motivo:<br/><ul><li>1. Regitro não pode ser alterado, pois se encontra em uso pelo próprio sistema.</li><li>2. Você está tentando alterar registro que já contém o resultado.</li><li>3. Sua consulta ('.$resultado.') retornou vazia, verifique seus parâmetros para filtro cuidadosamente.</li></ul>';

		print json_encode(array('success'=>$success,'msg'=>$msg));
	}

	/**
	 * Função útil para manutenção dos registros. Uso exclusivo do Componente Form
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_table() {
		$filtros	=	json_decode($_POST['filters']);
		$tabela		=	strtolower($_POST['table']);
		if ($filtros) {
			$sql = "DELETE FROM ".$tabela." WHERE empresas_id = ".$this->empresa->id;
			foreach ($filtros as $filtro) {
				$filtro->resultado = $filtro->operador == 'LIKE' ? "'%".$this->escape_search($filtro->resultado)."%'" : $this->escape($filtro->resultado);
				$sql.= " AND ".$filtro->campo." ".$filtro->operador." ".$filtro->resultado;
			}
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
			$success = $this->affected_rows() > 0;
			$msg = $success ? 'Os registros foram excluídos com sucesso' : 'Nenhum registro foi excluído pelo seguinte motivo:<br/><ul><li>1. Regitro não pode ser excluído, pois se encontra em uso pelo próprio sistema.</li><li>2. Sua consulta retornou vazia, verifique seus parâmetros para filtro cuidadosamente.</li></ul>';
			print json_encode(array('success'=>$success,'msg'=>$msg));
		} else {
			print json_encode(array('success'=>false,'msg'=>'Você precisa informar pelos menos um parâmetro para filtro'));
		}
	}
	/**
	 * Retorna se usuário está logado. Uso exclusivo do componente TaskRunner
	 * @remotable
	 * @access public
	 * @return object
	 */
	function checar_login() {
		$logged = $this->is_online();
		if (!$logged) {
			$logged = $this->cliente_online();
		}
		print json_encode(array('success'=>true,'logged'=>$logged));
	}
	/**
	 * Retorna se cliente está logado. Uso exclusivo do componente TaskRunner
	 * @remotable
	 * @access public
	 * @return object
	 */
	function checar_login_cliente() {
		print json_encode(array('success'=>true,'logged'=>$this->cliente_online()));
	}
	/**
	 * Retorna número de mensagens não lidas. Uso exclusivo do componente TaskRunner
	 * @remotable
	 * @access public
	 * @return object
	 */
	function checar_alerta() {
		print json_encode(array('success'=>true));
	}
	/**
	 * Retorna captcha da receita.gov
	 * @remotable
	 * @access public
	 * @return object
	 */
	function receita_captcha() {
		$token = get_receita_token();
		if (is_array($token)) {
			print json_encode(array('success'=>true,'id'=>$token[0],'token'=>$token[1]));
		} else {
			print json_encode(array('success'=>false));
		}
	}
	/**
	 * Faz a leitura do site (RIP HTML) da receita.gov
	 * @remotable
	 * @access public
	 * @return object
	 */
	function receita_cnpj() {
		$html = get_receita_html_cnpj($_POST['cnpj'], $_POST['captcha'], $_POST['token']);
		if ($html) {
			$dom = new DomDocument();
			@$dom->loadHTML($html);
			$q = $dom->getElementsByTagName('font');
			$len = $q->length;
			$campos = array();
			for ($i = 4; $i < $len; $i++) {
				if(!isset($q->item(($i+1))->nodeValue)) break;
				$current = trim($q->item($i)->nodeValue);
				$prox = trim($q->item(($i+1))->nodeValue);
				switch ($current) {
					case 'NÚMERO DE INSCRIÇÃO': $campos['numeroInsc'] = $prox; break;
					case 'DATA DE ABERTURA': $campos['dataAber'] = $prox; break;
					case 'NOME EMPRESARIAL': $campos['nomeEmpre'] = $prox; break;
					case 'TÍTULO DO ESTABELECIMENTO (NOME DE FANTASIA)': $campos['tituloEstab'] = $prox; break;
					case 'CÓDIGO E DESCRIÇÃO DA ATIVIDADE ECONÔMICA PRINCIPAL': $campos['codDescAtivEconPrin'] = $prox; break;
					case 'CÓDIGO E DESCRIÇÃO DAS ATIVIDADES ECONÔMICAS SECUNDÁRIAS': $campos['codDescAtivEconSec'] = $prox; break;
		            case 'LOGRADOURO': $campos['logradouro'] = $prox; break;
					case 'NÚMERO': $campos['numero'] = $prox; break;
					case 'COMPLEMENTO': $campos['complemento'] = $prox; break;
					case 'CEP': $campos['cep'] = str_replace(".", "", $prox);
					case 'BAIRRO/DISTRITO': $campos['bairro'] = $prox; break;
					case 'MUNICÍPIO': $campos['municipio'] = $prox; break;
					case 'UF': $campos['uf'] = $prox; break;
					case 'SITUAÇÃO CADASTRAL': $campos['sitCad'] = $prox; break;
					case 'DATA DA SITUAÇÃO CADASTRAL': $campos['dataSitCad'] = $prox; break;
				}
			}
			print json_encode(array('success'=>true,'dados'=>$campos));
		} else {
			print json_encode(array('success'=>false));
		}
	}
	/**
	 * Faz a leitura do diretório
	 * @remotable
	 * @param string $path
	 * @param string $url
	 * @param string $hideFolder
	 * @access protected
	 * @return array
	 */
	protected function read_directory($path, $url, $hide="") {
		$nodes = array();
		$d = dir($path);
		while($file = $d->read()) {
			if($file == '.' || $file == '..' || substr($file, 0, 1) == '.') {
				continue;
			}
			$fullpath = $path.'/'.$file;
			$fullurl = $url.'/'.$file;
			$isDir = is_dir($fullpath);
			if (!empty($hide) && $isDir) {
				if (preg_match("/".$hide."/i", $file)) {
					continue;
				}
			}
			array_push($nodes, array(
				'id' => $fullpath,
				'file' => $file,
				'size' => $isDir ? foldersize($fullpath) : filesize($fullpath),
				'date' => date('Y-m-d H:i:s', filectime($fullpath)),
				'url' => $fullurl,
				'leaf' => !$isDir,
				'children' => $isDir ? $this->read_directory($fullpath, $fullurl, $hide) : null
			));
		}
		$d->close();
		return $nodes;
	}
	/**
	 * Excluir diretório/arquivo em cascata
	 * @remotable
	 * @param string $path
	 * @access protected
	 * @return boolean
	 */
	protected function delete_directory($dir) {
		if (is_dir($dir)) {
			$objects = scandir($dir);
			foreach ($objects as $object) {
				if ($object != "." && $object != "..") {
					if (filetype($dir."/".$object) == "dir") {
						$this->delete_directory($dir."/".$object);
					} else {
						unlink($dir."/".$object);
					}
				}
			}
			reset($objects);
			return rmdir($dir);
		} else {
			return unlink($dir);
		}
	}
	/**
	 * Faz a leitura dos diretório para o componente FileManager
	 * @remotable
	 * @access public
	 * @return array
	 */
	function read_filemanager() {
		$hide = trim($_GET['hide']);
		$path = rtrim($_GET['path'], '/');
		$folders = explode('/', $path);
		$fullpath = PATH;
		foreach ($folders as $folder) {
			$fullpath.= $folder.'/';
			$cleanpath = rtrim($fullpath, '/');
			if (!is_dir($cleanpath)) {
				mkdir($cleanpath, 0777);
				chmod($cleanpath, 0777);
			}
		}
		$fullpath = PATH.$path;
		$fullurli = URL.$path;
		$file = rtrim($fullpath, '/');
		$file = explode('/', $file);
		$file = end($file);
		$nodes = array(array(
			'id' => $fullpath,
			'file' => $file,
			'size' => foldersize($fullpath),
			'date' => date('Y-m-d H:i:s', filectime($fullpath)),
			'url' => $fullurli,
			'leaf' => false,
			'children' => $this->read_directory($fullpath, $fullurli, $hide)
		));
		print json_encode($nodes);
	}
	/**
	 * Renomear diretório/arquivo. Exclusivo para o componente FileManager
	 * @remotable
	 * @access public
	 * @return array
	 */
	function rename_filemanager() {
		$filename = $_POST['filename'];
		$fullpath = preg_replace("/".$_POST['file']."/i", "", $_POST['filename']);
		$fullpath = rtrim($fullpath, '/');
		$newname = rtrim($_POST['newname'], '/');
		$success = @rename($filename, $fullpath.'/'.$newname);
		print json_encode(array('success'=>$success));
	}
	/**
	 * Criar diretório. Exclusivo para o componente FileManager
	 * @remotable
	 * @access public
	 * @return array
	 */
	function create_filemanager() {
		$relative = parse_boolean($_POST['relative']);
		$newname = rtrim($_POST['newname'], '/');
		$fullpath = rtrim($_POST['fullpath'], '/');
		if ($relative) {
			$fullpath = PATH.$fullpath;
		}
		$filename = $fullpath.'/'.$newname;
		$success = mkdir($filename, 0777); chmod($filename, 0777);
		print json_encode(array('success'=>$success));
	}
	/**
	 * Excluir diretório/arquivo. Exclusivo para o componente FileManager
	 * @remotable
	 * @access public
	 * @return array
	 */
	function delete_filemanager() {
		$success = $this->delete_directory($_POST['fullpath']);
		print json_encode(array('success'=>$success));
	}
	/**
	 * Copiar/Mover diretório/arquivo. Exclusivo para o componente FileManager
	 * @remotable
	 * @access public
	 * @return array
	 */
	function copymove_filemanager() {
		$drag_id = rtrim($_POST['drag_id'], '/');
		$drop_id = rtrim($_POST['drop_id'], '/');
		$drag_file = rtrim($_POST['drag_file'], '/');
		$operation = $_POST['operation']; $success = false;
		if ($operation == 'move') {
			$success = @rename($drag_id, $drop_id.'/'.$drag_file);
		} else {
			$success = @copy($drag_id, $drop_id.'/'.$drag_file);
		}
		print json_encode(array('success'=>$success));
	}
	/**
	 * Upload. Exclusivo para o componente FileManager
	 * @remotable
	 * @access public
	 * @return array
	 */
	function upload_filemanager() {
		$file = $_FILES['file'];
		if($file["error"] > 0) {
			print json_encode(array('success'=>false,'message'=>'Erro: #'.$file['error'].' - o arquivo parece estar corrompido.'));
			return false;
		}
		$filename = PATH.'upload';
		if (!is_dir($filename)) {
			mkdir($filename, 0777);
			chdmod($filename, 0777);
		}
		$filename.= '/'.$this->empresa->uniqueid;
		if (!is_dir($filename)) {
			mkdir($filename, 0777);
			chdmod($filename, 0777);
		}
		$filename.= '/temp';
		if (!is_dir($filename)) {
			mkdir($filename, 0777);
			chdmod($filename, 0777);
		}
		$filename.= '/'.$file['name'];
		if (file_exists($filename)) @unlink($filename);
		if (move_uploaded_file($file['tmp_name'], $filename)) {
			print json_encode(array('success'=>true));
		} else {
			print json_encode(array('success'=>false,'message'=>'Erro ao mover arquivo...'));
		}
	}
	/**
	 * Mover o arquivo de upload da pasta temporária. Exclusivo para o componente FileManager
	 * @remotable
	 * @access public
	 * @return array
	 */
	function moveupload_filemanager() {
		$uploadpath = rtrim($_POST['uploadpath'], '/');
		$filesnames = explode("\n", $_POST['filesnames']);
		$fullpath = PATH.'upload/'.$this->empresa->uniqueid.'/temp';
		foreach ($filesnames as $filename) {
			if (file_exists($uploadpath.'/'.$filename)) {
				@unlink($uploadpath.'/'.$filename);
			}
			@rename($fullpath.'/'.$filename, $uploadpath.'/'.$filename);
		}
		print json_encode(array('success'=>true));
	}
	/**
	 * Retorna saldo da conta corrente.
	 * @param int $contas_correntes_id (opcional)
	 * @param date $datemax (opcional)
	 * @access protected
	 * @return float
	 */
	protected function pegar_saldo($contas_correntes_id=0, $datemax=null) {
		$saldo = 0;
		if (empty($datemax)) {
			$sql = "SELECT IFNULL(SUM(saldo_atual), 0) AS saldo ";
			$sql.= "FROM view_contas_correntes ";
			$sql.= "WHERE empresas_id = ".$this->empresa->id." ";
			if ($contas_correntes_id > 0) {
				$sql.="AND id = ".$contas_correntes_id;
			} else {
				$sql.= "AND caixinha_obra = 0 ";
				$sql.= "AND caixinha_empresa = 0 ";
			}
			$query = $this->query($sql);
			$saldo = $this->num_rows($query) ? $this->fetch_object($query)->saldo : 0;
			$this->free_result($query);
		} else {
			$saldo_inicial = 0;
			if ($contas_correntes_id > 0) {
				$sql = "SELECT saldo_inicial FROM contas_correntes WHERE id = ".$contas_correntes_id;
				$query = $this->query($sql);
				$saldo_inicial = $this->num_rows($query) ? $this->fetch_object($query)->saldo_inicial : 0;
				$this->free_result($query);
			} else {
				$sql = "SELECT SUM(saldo_inicial) AS saldos FROM contas_correntes ";
				$sql.= "WHERE empresas_id = ".$this->empresa->id." ";
				$sql.= "AND caixinha_obra = 0 ";
				$sql.= "AND caixinha_empresa = 0";
				$query = $this->query($sql);
				$saldo_inicial = $this->num_rows($query) ? $this->fetch_object($query)->saldos : 0;
				$this->free_result($query);
			}
			$sql = "SELECT ";
			$sql.= "(".$saldo_inicial." + IFNULL(SUM(IFNULL(valor_compensado, 0)), 0)) AS saldo ";
			$sql.= "FROM view_controle_bancario ";
			$sql.= "WHERE empresas_id = ".$this->empresa->id." ";
			$sql.= "AND compensado_em <= ".$this->escape(trim($datemax), 'date');
			$query = $this->query($sql);
			$saldo = $this->num_rows($query) ? $this->fetch_object($query)->saldo : 0;
			$this->free_result($query);
		}
		return $saldo;
	}
}
?>