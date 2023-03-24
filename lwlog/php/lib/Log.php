<?php
class ExtJSException extends Exception {
	/**
	 * Retorna detalhes sobre o erro
	 * @access public
	 * @return array
	 */
	function getExtJSException() {
		$logged = false; if ($App = App::$instance) $logged = $App->logged();
		$msg = 'Linha: '.$this->getLine()."\n";
		$msg.= 'Arquivo: '.$this->getFile()."\n";
		$msg.= 'Erro: '.$this->getCode()."\n";
		$msg.= $this->getMessage()."\n\n";
		return array(
			'success' => false,
			'logged' => $logged,
			'msg' => $msg,
			'error' => $msg
		);
	}
}

class Log {
	/**
	 * Salvar arquivo de log referente a banco de dados
	 * @param string $msg
	 * @access public
	 * @return void
	 */
	function db_error($msg) {
		if (empty($msg)) $msg = '<PARÂMETRO VAZIO>';
		$log = "";
		if ($App = App::$instance) {
			if ($App->logged()) {
				$empresa = $App->pegar_empresa();
				$usuario = $App->pegar_usuario();
				$log.="Usuário: ".$usuario->user_nome."\n";
				$log.= $usuario->user_email."\n";
				$log.="Empresa: ".$empresa->emp_nome_fantasia."\n";
			} else {
				$msg = $log = null;
			}
		} else {
			$msg = 'Não foi possível retornar instância da classe App.php';
		}
		if (!empty($msg) && !empty($log)) {
			$log.=	date('d/m/y H:i')."\n----------------\n".$msg."\n----------------\n\n";
			$fp	 =	fopen(LOG.'db_errors.log', 'a+');
			fwrite($fp, $log);
			fclose($fp);
		}
	}
	/**
	 * Salvar arquivo de log referente a erros do sistema
	 * @param string $msg
	 * @access public
	 * @return void
	 */
	function sys_error($msg) {
		if (empty($msg)) $msg = '<PARÂMETRO VAZIO>';
		$log = "";
		if ($App = App::$instance) {
			if ($App->logged()) {
				$empresa = $App->pegar_empresa();
				$usuario = $App->pegar_usuario();
				$log.="Usuário: ".$usuario->user_nome."\n";
				$log.= $usuario->user_email."\n";
				$log.="Empresa: ".$empresa->emp_nome_fantasia."\n";
			} else {
				$msg = $log = null;
			}
		} else {
			$msg = 'Não foi possível retornar instância da classe App.php';
		}
		if (!empty($msg) && !empty($log)) {
			$log.=	date('d/m/y H:i')."\n----------------\n".$msg."\n----------------\n\n";
			$fp	 =	fopen(LOG.'sys_errors.log', 'a+');
			fwrite($fp, $log);
			fclose($fp);
		}
	}
}
?>