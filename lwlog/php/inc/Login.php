<?php
class Login extends App {
	/**
	 * Função construtora
	 * @access public
	 * @return void
	 */
	function __construct() {
		$this->connect();
	}
	/**
	 * Gera o cabeçalho da página
	 * @access public
	 * @return output (html)
	 */
	function html_header($cliente=false) {
		print '<html>';
		print '<head>';
		print '<title>'.SITE_TITLE.'</title>';
		print '<link rel="shortcut icon" href="img/expressocloud.ico"/>';
		print '<link rel="stylesheet" type="text/css" href="css/login.css"/>';
		print '<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"></script>';
		print '</head>';
		print '<body>';
	}
	/***
	 * Função que retorna o conteúdo do html da página de login
	 * @access public
	 * @return output (html)
	 */
	function page_content_login() {
		print '<section>';
		print '<div class="float-center">';
		print '<div class="logo"></div>';
		print '<form method="post">';
		print '<p>';
		print '<select id="empresas_id" name="empresas_id" required="required" style="width: 300px;">';
		print '<option selected disabled>Selecione uma empresa</option>';
		$sql = "SELECT ";
		$sql.= "emp_id,";
		$sql.= "CONCAT_WS(' - ', emp_sigla_cia, emp_nome_fantasia) AS emp_login ";
		$sql.= "FROM empresas ";
		$sql.= "WHERE emp_ativa = 1 ";
		$sql.= "ORDER BY emp_login";
		$query = $this->query($sql);
		while ($field = $this->fetch_object($query)) {
			print '<option value="'.$field->emp_id.'">';
			print $field->emp_login;
			print '</option>';
		}
		$this->free_result($query);
		print '</select>';
		print '</p>';
		print '<p><input type="text" name="usuario_login" placeholder="Informe seu login ou e-mail" required="required" maxlength="165" /></p>';
		print '<p><input type="password" name="usuario_senha" placeholder="Informe sua senha" required="required" maxlength="20" /></p>';
		
		if ($_SERVER['REQUEST_METHOD'] == 'POST') {
			$result = $this->logon();
			if ($result->success) {
				print '<script type="text/javascript">';
				print 'window.location="app.php?_dc='.now().'";';
				print '</script>';
			} else {
				print '<p style="color:red;">'.$result->msg.'</p>';
			}
		}
		
		print '<p><button type="submit">Entrar</button></p>';
		print '</form>';
		print '<div class="ask-link">';
		print '<div><a href="?p=recover">Não consegue acessar sua conta?</a></div>';
		print '</div>';
		print '</section>';
	}
	/***
	 * Função que retorna o conteúdo do html da página de recuperação da senha
	 * @access public
	 * @return output (html)
	 */
	function page_content_recover() {
		print '<section>';
		print '<div class="float-center">';
		print '<div class="logo"></div>';
		print '<div style="margin-top: 30px;">Informe seu e-mail e clique em "Solicitar senha".</div>';
		print '<form method="post">';
		print '<p><input type="email" name="usuario_login" placeholder="nome@empresa.com.br" required="required" maxlength="165" /></p>';
		
		if ($_SERVER['REQUEST_METHOD'] == 'POST') {
			$result = $this->forgot_password();
			if ($result->success) {
				print '<p>'.$result->msg.'</p>';
				print '<script type="text/javascript">';
				print 'setTimeout(function(){window.location="?p=login";}, 5000);';
				print '</script>';
			} else {
				print '<p style="color:red;">'.$result->msg.'</p>';
			}
		}
		
		print '<p><button type="submit">Solicitar senha</button></p>';
		print '</form>';
		print '<div class="ask-link">';
		print '<div><a href="?p=login">Voltar para página de login</a></div>';
		print '</div>';
		print '</section>';
	}
	/***
	 * Função que retorna o conteúdo do html da página de conta suspensa
	 * @access public
	 * @return output (html)
	 */
	function page_content_suspended() {
		print '<section>';
		print '<div class="float-center">';
		print '<div class="logo"></div>';
		print '<div style="margin-top: 30px;">';
		print 'Sua conta se encontra suspensa, favor entre em contato através do e-mail <a href="mailto:'.MAILER_EMAIL.'">'.MAILER_EMAIL.'</a>.';
		print '</div>';
		print '<div class="ask-link">';
		print '<div><a href="?p=login">Voltar para página de login</a></div>';
		print '</div>';
		print '</section>';
	}
	/***
	 * Função que retorna o rodapé da section content
	 * @access public
	 * @return output (html)
	 */
	function page_content_footer() {
		print '<footer>';
		print '<div class="footer">';
		print '<p style="float: left;">';
		print PROJECT.' é um produto de: '.SISTROM_NF.'<br/>';
		print '<a href="'.SISTROM_SITE.'" target="_blank">sistrom.com.br</a> | <a href="mailto:'.SISTROM_EMAIL.'">'.SISTROM_EMAIL.'</a>';
		print '</p>';
		print '<p style="float: right;">';
		print SISTROM_RS.' | CNPJ: '.SISTROM_CNPJ.'<br/>';
		print SISTROM_END.'<br/>';
		print SISTROM_CEP.' '.SISTROM_BAI.'<br/>';
		print SISTROM_CID.' - '.SISTROM_UF;
		print '</p>';
		print '</div>';
		print '</footer>';
	}
	/***
	 * Função que retorna o rodapé da página
	 * @access public
	 * @return output (html)
	 */
	function html_footer() {
		print '</body>';
		print '</html>';
	}
	/***
	 * Envia a senha do usuário através do "Esqueceu sua senha"
	 * @access public
	 * @return array (oject) {succes: [boolean], title: [string], msg: [string], bgColor: [string]}
	 */
	function forgot_password() {
		$usuario_email = $this->escape(trim($_POST['usuario_login']));
		$usuario_query = $this->query("SELECT user_nome, user_email, user_login, user_senha FROM usuarios WHERE user_ativo = 1 AND user_email = ".$usuario_email);
		
		if ($this->num_rows($usuario_query)) {
			$field = $this->fetch_object($usuario_query);
			$this->free_result($usuario_query);
			
			$Mailer = new Mailer();
			$Mailer->to = $field->user_email;
			$Mailer->Subject = 'Reenvio da Senha';
			$Mailer->message = '<p>Olá '.$field->user_nome.'.<br/>';
			$Mailer->message.= 'Segue abaixo seus dados de login:</p>';
			$Mailer->message.= '<p>Login: '.$field->user_login.'<br/>';
			$Mailer->message.= 'Senha: '.$field->user_senha.'</p>';
			$Mailer->message.= '<p>Para acessar o sistema <a href="'.URL.'">clique aqui</a></p>';
			
			if ($Mailer->send()) {
				return (object) array(
					'success' => true,	
					'msg' => 'Seus dados de acesso foram enviandos para o seu e-mail com sucesso.'
				);
			} else {
				return (object) array(
					'success' => false,	
					'msg' => 'Erro ao enviar e-mail, servidor oculpado. Tente novamente mais tarde.'
				);
			}
		} else {
			return (object) array(
				'success' => false,
				'msg' => 'E-mail não encontrado, certifique-se que digitou corretamente.'
			);
		}
	}
	/**
	 * Autenticação do usuário, efetua o login do usuário no sistema.
	 * @access public
	 * @return array (object) {success: [boolean], title: [string], msg: [string]}
	 */
	function logon() {
		if (!$this->is_owner_server()) return (object) array(
			'success' => false,
			'msg' => NOT_SERVER_MSG
		);
		
		$empresas_id = intval($_POST['empresas_id']);
		if (!$empresas_id) return (object) array(
			'success' => false,
			'msg' => 'Empresa inválida'
		);
		
		$login = trim($_POST['usuario_login']);
		$senha = trim($_POST['usuario_senha']);
		
		$usuario_login = $this->escape($login);
		$usuario_senha = $this->escape($senha);
		$usuario_field = is_email($login) ? 'user_email' : 'user_login';
		
		$sql = "SELECT user_id FROM usuarios ";
		$sql.= "WHERE user_ativo = 1 ";
		$sql.= "AND user_senha = ".$usuario_senha." ";
		$sql.= "AND ".$usuario_field." = ".$usuario_login;
		$query = $this->query($sql);
		if ($this->num_rows($query)) {
			$field = $this->fetch_object($query);
			
			$s = "SELECT COUNT(*) AS existente FROM users_emps ";
			$s.= "WHERE user_id = ".$field->user_id. " ";
			$s.= "AND emp_id = ".$empresas_id;
			$q = $this->query($s);
			$exist = $this->fetch_object($q)->existente > 0;
			$this->free_result($q);
			if (!$exist) {
				return (object) array(
					'success' => false,
					'msg' => 'Você não tem acesso a empresa selecionada. Solicite o acesso ao administrar do sistema.'
				);
			}
			
			$_SESSION['tms_user_id'] = $field->user_id;
			$_SESSION['tms_empr_id'] = $empresas_id;
			
			unset($_SESSION['tms_suspended']);
			
			return (object) array('success' => true);
		} else {
			return (object) array(
				'success' => false,
				'msg' => 'Login inválido. Por favor verifique seus dados de acesso ou entre em contato através do e-mail <a href="mailto'.MAILER_EMAIL.'">'.MAILER_EMAIL.'</a>.'
			);
		}
	}
	/***
	 * Função que retorna o conteúdo do html da página de login do acesso ao cliente
	 * @access public
	 * @return output (html)
	 */
	function page_content_cliente() {
		$result = $msg = null;
		if ($_SERVER['REQUEST_METHOD'] == 'POST') {
			$result = $this->cliente_logon();
			if ($result->success) {
				print '<script type="text/javascript">';
				print 'window.location="cliente.php?_dc='.now().'";';
				print '</script>';
			} else {
				$msg = $result->msg;
			}
		}
		
		print '<section>';
		print '<div class="float-center">';
		print '<div class="logo"></div>';
		
		print '<form method="post" action="?modo=normal">';
		print '<p>Forneça seus dados de acesso "Usuário e Senha"</p>';
		print '<p><input type="text" name="cliente_login" placeholder="Informe seu login" required="required" maxlength="165" /></p>';
		print '<p><input type="password" name="cliente_senha" placeholder="Informe sua senha" required="required" maxlength="20" /></p>';
		if (!empty($msg) && $_GET['modo'] == 'normal') {
			print '<p style="color:red;">'.$msg.'</p>';
			unset($_GET['modo']);
		}
		print '<p><button type="submit">Entrar</button></p>';
		print '</form>';
		
		print '<form method="post" action="?modo=rastrear">';
		print '<p>Ou entre com os dados da nota para rastreamento</p>';
		print '<p><select name="cliente_busca" required="required"><option value="ctes">Conhecimento</option><option value="ctes_documentos" selected="selected">Nota Fiscal</option></select></p>';
		print '<p><input type="text" name="cliente_cnpj" placeholder="Informe CNPJ" required="required" /></p>';
		print '<p><input type="text" name="cliente_documento" placeholder="Informe Nº. Documento" required="required" /></p>';
		if (!empty($msg) && $_GET['modo'] == 'rastrear') {
			print '<p style="color:red;">'.$msg.'</p>';
			unset($_GET['modo']);
		}
		print '<p><button type="submit">Rastrear</button></p>';
		print '</form>';
		
		print '<div class="ask-link">';
		print '</div>';
		print '</section>';
	}
	/**
	 * Autenticação do cliente, efetua o login do usuário no sistema.
	 * @access public
	 * @return array (object) {success: [boolean], title: [string], msg: [string]}
	 */
	function cliente_logon() {
		if (!$this->is_owner_server()) return (object) array(
			'success' => false,
			'msg' => NOT_SERVER_MSG
		);

		if ($_GET['modo'] == 'rastrear') {
			$cliente_cnpj = trim($_POST['cliente_cnpj']);
			if (!is_cnpj($cliente_cnpj)) {
				return (object) array(
					'success' => false,
					'msg' => 'CNPJ inválido'
				);
			}
			
			$cliente_cnpj = $this->escape($cliente_cnpj, 'string');
			$cliente_documento = trim($_POST['cliente_documento']);
			$cliente_busca = strtolower(trim($_POST['cliente_busca']));
			$cliente_documento = is_numeric($cliente_documento) ? intval($cliente_documento) : $this->escape($cliente_documento, 'string');
			
			$sql = "";
			if ($cliente_busca == 'ctes_documentos') {
				$sql = "SELECT DISTINCT t2.cte_id ";
				$sql.= "FROM ctes_documentos AS t1 ";
				$sql.= "INNER JOIN ctes AS t2 ON t2.cte_id = t1.cte_id ";
				$sql.= "LEFT JOIN clientes AS t3 ON t3.clie_id = t2.clie_remetente_id ";
				$sql.= "LEFT JOIN clientes AS t4 ON t4.clie_id = t2.clie_destinatario_id ";
				$sql.= "LEFT JOIN clientes AS t5 ON t5.clie_id = t2.clie_tomador_id ";
				$sql.= "WHERE (t1.cte_doc_numero = ".intval($cliente_documento)." ";
				$sql.= "AND (t3.clie_cnpj = ".$cliente_cnpj." OR t3.clie_cpf = ".$cliente_cnpj." ";
				$sql.= "OR t4.clie_cnpj = ".$cliente_cnpj." OR t4.clie_cpf = ".$cliente_cnpj." ";
				$sql.= "OR t5.clie_cnpj = ".$cliente_cnpj." OR t5.clie_cpf = ".$cliente_cnpj.")) ";
				$sql.= "AND t2.cte_situacao IN ('AUTORIZADO', 'ME EMITIDA')";
			} else {
				$sql = "SELECT DISTINCT t1.cte_id ";
				$sql.= "FROM ctes AS t1 ";
				$sql.= "LEFT JOIN clientes AS t2 ON t2.clie_id = t1.clie_remetente_id ";
				$sql.= "LEFT JOIN clientes AS t3 ON t3.clie_id = t1.clie_destinatario_id ";
				$sql.= "LEFT JOIN clientes AS t4 ON t4.clie_id = t1.clie_tomador_id ";
				$sql.= "WHERE (t1.cte_numero = ".$cliente_documento." ";
				$sql.= "AND (t2.clie_cnpj = ".$cliente_cnpj." OR t2.clie_cpf = ".$cliente_cnpj." ";
				$sql.= "OR t3.clie_cnpj = ".$cliente_cnpj." OR t3.clie_cpf = ".$cliente_cnpj." ";
				$sql.= "OR t4.clie_cnpj = ".$cliente_cnpj." OR t4.clie_cpf = ".$cliente_cnpj.")) ";
				$sql.= "AND t1.cte_situacao IN ('AUTORIZADO', 'ME EMITIDA')";
			}
			$query = $this->query($sql); $list = array();
			while ($item = $this->fetch_object($query)) {
				array_push($list, $item->cte_id);
			}
			$this->free_result($query);
			if (empty($list)) {
				return (object) array(
					'success' => false,
					'msg' => 'Nenhum documento encontrado'
				);
			} else {
				$_SESSION['tms_ctes_list_id'] = join(',', $list); 
				return (object) array('success' => true);
			}
		} else {
			$cliente_login = $this->escape(trim($_POST['cliente_login']), 'string');
			$cliente_senha = $this->escape(trim($_POST['cliente_senha']), 'string');
			
			$sql = "SELECT DISTINCT t1.clie_id FROM clientes AS t1 ";
			$sql.= "INNER JOIN ctes AS t2 ON (t2.clie_remetente_id = t1.clie_id OR t2.clie_destinatario_id = t1.clie_id OR t2.clie_tomador_id = t1.clie_id) ";
			$sql.= "WHERE t1.clie_login = ".$cliente_login." ";
			$sql.= "AND t1.clie_senha = ".$cliente_senha. " ";
			$sql.= "AND t2.cte_situacao IN ('AUTORIZADO', 'ME EMITIDA') ";
			$sql.= "ORDER BY clie_id DESC LIMIT 1";
			$query = $this->query($sql);
			$clie_id = $this->fetch_object($query)->clie_id;
			$this->free_result($query);
			if ($clie_id > 0) {
				$_SESSION['tms_clie_id'] = $clie_id;
				return (object) array('success' => true);
			} else {
				return (object) array(
					'success' => false,
					'msg' => 'Dados de acesso inválido'
				);
			}
		}
	}
}
?>