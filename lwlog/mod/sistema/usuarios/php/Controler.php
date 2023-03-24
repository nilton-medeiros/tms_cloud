<?php
class Controler extends App {
	/**
	 * Salvar usuários. Uso exclusivo do pluging CellEditing
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function save_usuarios() {
		$user_id = intval($_POST['user_id']);
		$user_email = $this->escape(trim($_POST['user_email']), 'email');
		
		$sql = "SELECT COUNT(*) AS existente FROM usuarios WHERE user_email = ".$user_email; if ($user_id > 0) $sql.= " AND user_id != ".$user_id;
		$query = $this->query($sql);
		$exist = $this->fetch_object($query)->existente;
		$this->free_result($query);
		
		if ($exist) {
			print json_encode(array('success'=>false,'msg'=>'Esse e-mail já se encontra cadastrado! Insira outro e-mail.'));
			return false;
		}
		
		$perm_id = intval($_POST['perm_id']);
		$user_nome = $this->escape(trim($_POST['user_nome']));
		$user_login = $this->escape(trim($_POST['user_login']));
		$user_senha = $this->escape(trim($_POST['user_senha']));
		$user_celular = $this->escape(trim($_POST['user_celular']));
		$user_ativo = parse_boolean($_POST['user_ativo']);
		$user_empresas_id = trim($_POST['user_empresas_id']);
		
		$sql = ($user_id > 0) ? "UPDATE " : "INSERT INTO ";
		$sql.= "usuarios SET ";
		if ($perm_id > 0) {
			$sql.= "perm_id = ".$perm_id.",";
		}
		$sql.= "user_nome= ".$user_nome.",";
		$sql.= "user_login = ".$user_login.",";
		$sql.= "user_senha = ".$user_senha.",";
		$sql.= "user_email = ".$user_email.",";
		$sql.= "user_celular = ".$user_celular.",";
		$sql.= "user_ativo = ".$user_ativo." ";
		if ($user_id > 0) {
			$sql.="WHERE user_id = ".$user_id;
		}
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		if (!$user_id) {
			$user_id = $this->insert_id();
		}
		
		if (!empty($user_empresas_id)) {
			$sql = "DELETE FROM users_emps WHERE user_id = ".$user_id;
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
			$sql = "INSERT INTO users_emps (";
			$sql.= "user_id,";
			$sql.= "emp_id";
			$sql.= ") SELECT ";
			$sql.= $user_id.",";
			$sql.= "emp_id ";
			$sql.= "FROM empresas ";
			$sql.= "WHERE emp_id IN(".$user_empresas_id.")";
			if (!$this->query($sql)) {
				print json_encode($this->get_sql_error());
				return false;
			}
		}
		
		print json_encode(array('success'=>true,'user_id'=>$user_id));
	}
	/**
	 * Excluir usuários. Uso exclusivo do Componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function delete_usuarios() {
		$user_id = $_POST['user_id'];
		$sql = "DELETE FROM usuarios WHERE user_id IN(".$user_id.")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		$success = $this->affected_rows() > 0;
		if (!$success) {
			$success = $this->ativar_inativar_usuarios(0, $user_id);
		}
		print json_encode(array('success'=>$success));
	}
	/**
	 * Ativar/Inativar usuário
	 * @param $ativo int ou string 'auto'
	 * @param $user_id string/integer
	 * @access private
	 * @return booelan se a linha foi afetada
	 */
	private function ativar_inativar_usuarios($ativo='auto', $user_id) {
		$sql = "UPDATE usuarios SET ";
		$sql.= "user_ativo = ".($ativo === 'auto' ? "IF(user_ativo = 1, 0, 1)" : intval($ativo))." ";
		$sql.= "WHERE user_id IN(".$user_id.")";
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		return $this->affected_rows() > 0;
	}
	/**
	 * Consultar usuário. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_usuarios() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE user_ativo = ".parse_boolean($_GET['ativo']);
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM view_usuarios ";
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
		
		$sql = "SELECT COUNT(user_id) AS total FROM view_usuarios ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	/**
	 * Enviar e-mail com dados de aceso. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function enviar_email() {
		$sql = "SELECT user_nome, user_email, user_login, user_senha ";
		$sql.= "FROM usuarios ";
		$sql.= "WHERE user_id IN(".trim($_POST['user_id']).") ";
		$sql.= "AND user_ativo = 1";
		$query = $this->query($sql);
		
		if ($this->num_rows($query)) {
			$error	= false;
			$Mailer = new Mailer();
			while ($field = $this->fetch_object($query)) {
				$Mailer->ClearAllRecipients();
				$Mailer->to = $field->user_email;
				$Mailer->Subject = 'Bem Vindo ao '.SITE_TITLE;
				$Mailer->message.= '<p>Olá, '.$field->user_nome.'<br/>';
				$Mailer->message.= 'O usuário '.$this->usuario->user_nome.' (<a href="mailto:'.$this->usuario->user_email.'">'.$this->usuario->user_email.'</a>) lhe deseja boas-vindas ao novo sistema ('.PROJECT.').</p>';
				$Mailer->message.= '<p><b>URL: </b><a href="'.URL.'" target="_blank">'.URL.'</a>. Salve nos seus favoritos ou defina como página inicial do seu navegador.<br/>';
				$Mailer->message.= '<b>Login: </b> '.$field->user_login.'<br/>';
				$Mailer->message.= '<b>Senha: </b> '.$field->user_senha.'</p>';
				$Mailer->message.= '<p>Esse é um e-mail automático, favor não responder.</p>';
				if (!$Mailer->send()) {
					print json_encode(array('success'=>false,'msg'=>'Servidor de e-mail (SMTP) se encontra com problemas no momento. Tente novamente mais tarde!'));
					return false;
				}
			}
			$this->free_result($query);
		}
		
		print json_encode(array('success'=>true));
	}
	/**
	 * Armazenagem dos usuários para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function usuarios_store() {
		$sql = "SELECT * FROM view_usuarios ";
		$sql.= "WHERE user_ativo = 1 ";
		$sql.= "ORDER BY user_nome ";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
	/**
	 * Armazenagem dos grupos de permissões para o componente ComboBox
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function grupos_store() {
		$sql = "SELECT perm_id, perm_grupo FROM permissoes ORDER BY perm_grupo";
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		print json_encode(array('total'=>count($list),'data'=>$list));
	}
}
?>