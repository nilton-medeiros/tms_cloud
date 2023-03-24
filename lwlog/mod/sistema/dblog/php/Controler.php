<?php
class Controler extends App {
	/**
	 * Consultar log do sistema. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_log() {
		$p = $this->get_sql_param();
		
		$filter	=	"WHERE empresas_id = ".$this->empresa->id;
		$filter.=	$p->filter;
		
		if (!$this->usuario->admin) {
			$meus_usuarios = $this->pegar_usuarios_pelo_meu_grupo(NULL, true);
			if($meus_usuarios) $filter.=" AND usuario IN(".$meus_usuarios->nome.")";
		}
		
		$sql = "SELECT * FROM db_logs ".$filter;
		if (!empty($p->sort))	$sql.= " ORDER BY ".$p->sort;
		if ($p->limit) 			$sql.= " LIMIT ".$p->start.",".$p->limit;
		
		$query	=	$this->query($sql);
		$list	=	array();
				
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}

		$this->free_result($query);
		
		$sql	=	"SELECT COUNT(*) AS total FROM db_logs ".$filter;
		$query	=	$this->query($sql);
		$total	=	$this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	
	function clear_log() {
		if (!$this->usuario->admin) {
			print json_encode(array('success'=>false,'msg'=>'Somente o administrador pode limpar o histórico de uso do sistema.'));
			return false;
		}
		
		$idate = trim($_POST['idate']);
		$fdate = trim($_POST['fdate']);
		$data_inicio = trim($_POST['data_inicio']);
		$data_termino = trim($_POST['data_termino']);
		if (empty($data_inicio) || empty($data_termino) || empty($idate) || empty($fdate)) {
			print json_encode(array('success'=>false,'msg'=>'O período para exclusão do histórico de uso deve ser preenchido.'));
			return false;
		}
		
		$sql = "SELECT usuario, DATETIME_CONVERT(data_hora) AS ocorrido_em, evento ";
		$sql.= "FROM db_logs ";
		$sql.= "WHERE empresas_id = ".$this->empresa->id." ";
		$sql.= "AND data_hora BETWEEN ".$this->escape($data_inicio, 'date')." AND ".$this->escape($data_termino, 'date')." ";
		$sql.= "ORDER BY data_hora DESC, usuario ASC, evento ASC";
		$query = $this->query($sql);
		$count = $this->num_rows($query);
		if (!$count) {
			$this->free_result($query);
			print json_encode(array('success'=>false,'msg'=>'Nenhum histórico foi encontrado no período '.$idate.' - '.$fdate));
			return false;
		}
		
		$content = "***************************************\n"; 
		$content.= PROJECT."\n";
		$content.= $this->empresa->razao_social."\n";
		$content.= "Histórico de uso do sistema\n";
		$content.= "Período: ".$idate." - ".$fdate."\n";
		$content.= "Autor: ".$this->usuario->nome."\n";
		$content.= "Responsável: ".$this->empresa->responsavel_nome."\n";
		$content.= "***************************************\n\n";
		while ($field = $this->fetch_object($query)) {
			$content.= "***************************************\n";
			$content.= $field->ocorrido_em."\n";
			$content.= "***************************************\n";
			$content.= $field->usuario."\n";
			$content.= $field->evento."\n";
			$content.= "***************************************\n\n";
		}
		$this->free_result($query);
		
		$filename = encode_filename('dblogs'.$this->empresa->uniqueid).'.txt';
		$filename = LOG.$filename;
		if (file_exists($filename)) {
			@unlink($filename);
		}
		$handle = fopen($filename, "w+");
		fwrite($handle, $content);
		fclose($handle);
		
		$sql = "DELETE FROM db_logs ";
		$sql.= "WHERE empresas_id = ".$this->empresa->id." ";
		$sql.= "AND protegido = 0 ";
		$sql.= "AND data_hora BETWEEN ".$this->escape($data_inicio, 'date')." AND ".$this->escape($data_termino, 'date');
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		$evento ="--LIMPEZA DE HISTÓRICO--\n"; 
		$evento.="PERÍODO EXCLUÍDO: ".$idate.' à '.$fdate;
		if (!empty($this->empresa->responsavel_nome) && !empty($this->empresa->responsavel_email) && file_exists($filename)) {
			$usuario = preg_match("/".$this->usuario->nome."/i", $this->empresa->responsavel_nome) ? 'por você mesmo' : 'pelo usuário '.$this->usuario->nome;
			$Mailer = new Mailer();
			$Mailer->to = $this->empresa->responsavel_email;
			$Mailer->Subject = PROJECT.' - Histórico de Uso ('.$idate.' - '.$fdate.')';
			$Mailer->message = 'Olá '.$this->empresa->responsavel_nome.'<br/>';
			$Mailer->message.= 'Segue anexo o histórico de uso do sistema, excluído '.$usuario.', ';
			$Mailer->message.= 'no período '.$idate.' - '.$fdate.'.<br/><br/>';
			$Mailer->message.= '<b>NOTA: Recomendamos que você salve o arquivo de log em seu servidor local.</b>';
			
			$Mailer->AddAttachment($filename);
			if ($Mailer->send()) {
				$evento.="\n";
				$evento.="ARQUIVO DE LOG ENVIADO PARA ";
				$evento.= $this->empresa->responsavel_nome." ";
				$evento.="(".$this->empresa->responsavel_email.")";
				@unlink($filename);
			}
		}
		
		$sql = "INSERT INTO db_logs SET ";
		$sql.= "protegido = 1,";
		$sql.= "empresas_id = ".$this->empresa->id.",";
		$sql.= "usuario = ".$this->escape($this->usuario->nome).",";
		$sql.= "evento = ".$this->escape($evento);
		if (!$this->query($sql)) {
			print json_encode($this->get_sql_error());
			return false;
		}
		
		print json_encode(array('success'=>true));
	}
	
	function read_file() {
		$filename = LOG.$_POST['file'];
		if (!file_exists($filename)) {
			print '<p>Arquivo não encontrado</p>';
			return false;
		}
		$handle = fopen($filename, "r");
		$contem = @fread($handle, filesize($filename));
		$contem = nl2br($contem);
		fclose($handle);
		print $contem;
	}
	
	function clear_file() {
		$filename = LOG.$_POST['file'];
		@unlink($filename);
		$handle = fopen($filename, "w+");
		fclose($handle);
		print json_encode(array('success'=>file_exists($filename)));
	}
}
?>