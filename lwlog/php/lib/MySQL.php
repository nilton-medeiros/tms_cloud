<?php
class MySQL extends Log {
	/**
	 * Recebe a hora que iniciou a consulta
	 * @access private
	 */
	private $time_start;
	/**
	 * Receber a hora que terminou a consulta
	 * @access private
	 */
	private $time_end;
	/**
	 * Recebe a conexão com banco de dados
	 * @access private
	 */
	private	$link;
	/**
	 * Recebe a última query executada
	 * @access private
	 */
	private	$result;
	/**
	 * Recebe o erro da query
	 * @access private
	 */
	private $error_msg;
	/**
	 * Fecha a conexão quando a classe não for mais utlizada
	 * @access public
	 */
	function __destruct() {
		$this->close();
	}
	/**
	 * Estabele uma conexão com o servidor
	 * @access public
	 * @param string $host Endereço IP do servidor
	 * @param string $user Usuário
	 * @param string $pass Senha
	 * @param string $db Banco de dados
	 * @return void
	 */
	function connect($host="", $user="", $pass="", $db="") {
		try {
			if (!empty($host) && !empty($user) && !empty($pass) && !empty($db)) {
				$this->link = mysqli_connect($host, $user, $pass, $db);
			} else {
				$this->link = mysqli_connect(HOST, USER, PASS, DB);
			}
			if (mysqli_connect_errno() != 0) {
				throw new Exception (mysqli_connect_errno() . " - " . mysqli_connect_error()); 
			} else {
				mysqli_set_charset($this->link, 'utf8');
			}
		} catch (Exception $db_error) {
			$mensagem		=	$db_error->getMessage()."\n".mysqli_connect_error();
			$arquivo		=	$db_error->getFile();
			
			$this->db_error($mensagem."\n".$arquivo);
			
			print "Erro ao conectar ao banco de dados MySQL. O erro foi reportado e o administrador do sistema tomará as devidas providências.";
			exit();
		}
	}
	/**
	 * Fecha a conexão com o banco de dados
	 * @access public
	 */
	function close() {
		if ($_SESSION['tms_user_id'] > 0) {
			@mysqli_query($this->link, "UPDATE usuarios SET user_conect_id = 0 WHERE user_id = ".$_SESSION['tms_user_id']." AND user_conect_id > 0");
		}
		return @mysqli_close($this->link);
	}
	/**
	 * Retorna array com o erro da última query
	 * @access public
	 * @return array
	 */
	function get_sql_error() {
		$logged = false; if ($App = App::$instance) $logged = $App->logged();
		$result = array('success'=>false,'logged'=>$logged);
		if ($this->error_msg) {
			if (empty($this->error_msg->msg)) $result['error'] = $this->error_msg->data;
			else $result['msg'] = $this->error_msg->msg;
		}
		return $result;
	}
	/**
	 * Retorna o erro do MySQL
	 * @access public
	 * @return string
	 */
	function error() {
		return mysqli_error($this->link);
	}
	/**
	 * Retorna o código do erro MySQL
	 * @access public
	 * @return int
	 */
	function errno() {
		return mysqli_errno($this->link);
	}
	/**
	 * Função responsável para executar instruções SQL
	 * Se houver erro na query é armezenada em db_erros_log
	 * retorna true|false
	 * @param string $sql
	 * @param bool $ignore_mysql_code
	 * @access public
	 * @return bool
	 */
	function query($string_query, $ignore_mysql_code=false) {
		if (!preg_match("/^SELECT/i", $string_query) && $_SESSION['tms_user_id'] > 0) {
			@mysqli_query($this->link, "UPDATE usuarios SET user_conect_id = CONNECTION_ID() WHERE user_id = ".$_SESSION['tms_user_id']);
		}
		$this->time_start = date('H:i:s');
		this->debug($string_query)
		$this->result = mysqli_query($this->link, $string_query);
		$this->time_end = date('H:i:s');
		if ($this->result) {
			$hora = calc_hora($this->time_start, $this->time_end);
			if (intval($hora->s) > 20) {
				$sql = "INSERT INTO performance SET ";
				$sql.= "comando		=	".$this->escape($string_query).",";
				$sql.= "iniciou_as 	=	".$this->escape($this->time_start).",";
				$sql.= "terminou_as	=	".$this->escape($this->time_end);
				if (!mysqli_query($this->link, $sql)) {
					$this->db_error("SQL ERROR ".$this->errno()."\n".$this->error()."\n".$sql);
				}
			}
		} else {
			$cod = $this->errno();
			$error = $this->error();
			$msg = NULL;
			if ($ignore_mysql_code === false) {
				switch ($cod) {
					case 1062: $msg = 'Já existe um registro cadastrado com a mesma informação'; break;
					case 1451: $msg = 'Infelizmente esse registro não poderá ser excluído, pois o mesmo se encontra em uso por outros registros'; break;
					case 1048: $msg = 'Atenção! Alguns campos são de preenchimento obrigatório'; break;
				}
			}
			$this->error_msg = (object) array(
				'cod' => $cod,
				'error' => $error,
				'data' => "SQL ERROR ".$cod."\n".$error."\n".$string_query,
				'msg' => $msg
			);
			if (!$msg) {
				$this->db_error($this->error_msg->data);
			}
		}
		return $this->result;
    }
	/**
	 * Retorna o último ID através do insert ou update no banco de dados
	 * @access public
	 * @return int
	 */
	function insert_id() {
		return mysqli_insert_id($this->link);
	}
	/**
	 * Retorna o último ID de uma tabela
	 * @param $table string
	 * @param $field string
	 * @access public
	 * @return int
	 */
	function max_id($table, $field='id') {
		$sql = "SELECT MAX(".$field.") AS last_id FROM ".$table;
		$query = $this->query($sql);
	 	$last_id = 0;
		if ($this->num_rows($query)) {
			$last_id = $this->fetch_object($query)->last_id;
			$last_id = intval($last_id);
		}
		$this->free_result($query);
		return $last_id;
	}
	/**
	 * Retorna o próximo número para inserção na tabela
	 * @param $table string
	 * @access public
	 * @return int
	 */
	function next_insert_id($table) {
		$sql ="SELECT AUTO_INCREMENT AS next_id ";
		$sql.="FROM information_schema.TABLES ";
		$sql.="WHERE TABLE_SCHEMA = '".DB."' ";
		$sql.="AND TABLE_NAME = '".$table."'";
		$query = $this->query($sql);
		$next_id = $this->fetch_object($query)->next_id;
		$this->free_result($query);
		return intval($next_id);
	}
	/**
	 * Retorna lista de ID para consulta sql
	 * @access public
	 * @return string
	 */
	function list_id($str) {
		$str = preg_replace("/[^0-9]/", " ", $str);
		$str = explode(" ", $str);
		$arr = array();
		foreach ($str as $val) {
			$val = intval($val);
			if ($val > 0) {
				array_push($arr, $val);
			}
		}
		return implode(',', array_unique($arr));
	}
	/**
	 * Libera o cache da consulta, sempre utilizar após consultas com instruções complexas
	 * @param mysqli_query $query_id
	 * @access public
	 * @return void
	 */
	function free_result($query_id) {
		$query_id = (!$query_id) ? $this->result : $query_id;
		return @mysqli_free_result($query_id);
	}
	/**
	 * Retorna um Array Associativo com o nome dos campos através de uma consulta
	 * @param mysqli_query $query_id
	 * @access public
	 * @return array (hash) 
	 */
    function fetch_array($query_id) {
		$query_id = (!$query_id) ? $this->result : $query_id;
		$result = @mysqli_fetch_array($query_id, MYSQLI_ASSOC);
		if (!$result && !$this->result) {
			$msg = "Não foi possível retornar fetch_array:\n";
			if (!empty($this->error_msg->data)) {
				$msg.= $this->error_msg->data;
				$msg.= "\n";
			}
			throw new Error($msg);
		}
		return $result;
    }
	/**
	 * Retorna uma array numérica que corresponde a linha obtida e move o ponteiro interno dos dados adiante
	 * @param mysqli_query $query_id
	 * @access public
	 * @return array
	 */
	function fetch_row($query_id) {
		$query_id = (!$query_id) ? $this->result : $query_id;
		$result = @mysqli_fetch_row($query_id);
		if (!$result && !$this->result){
			$msg = "Não foi possível retornar fetch_row:\n";
			if (!empty($this->error_msg->data)) {
				$msg.= $this->error_msg->data;
				$msg.= "\n";
			}
			throw new Error($msg);
		}
		return $result;
	}
    /**
	 * Retorna os campos de uma consulta como um objeto
	 * @param mysqli_query $query_id
	 * @access public
	 * @return array (object)
	 */
	function fetch_object($query_id) {
		$query_id = (!$query_id) ? $this->result : $query_id;
		$result = @mysqli_fetch_object($query_id);
		if (!$result && !$this->result) {
			$msg = "Não foi possível retornar fetch_object:\n";
			if (!empty($this->error_msg->data)) {
				$msg.= $this->error_msg->data;
				$msg.= "\n";
			}
			throw new Error($msg);
		}
		return $result;
	}
    /**
	 * Alias fetch_array
	 * @param mysqli_query $query_id
	 * @access public
	 * @return array
	 */
    function fetch_assoc($query_id) {
        $query_id = (!$query_id) ? $this->result : $query_id;
        return mysqli_fetch_assoc($query_id);
    }
    /**
	 * Retorna os nomes dos campos através de uma consulta
	 * @param mysqli_query $query_id
	 * @access public
	 * @return array (object)
	 */
    function fetch_field($query_id) {
        $query_id = (!$query_id) ? $this->result : $query_id;
    	return mysqli_fetch_field($query_id);
    }
	/**
	 * Retorna número de linhas através de uma consulta
	 * @param mysqli_query $query_id
	 * @access public
	 * @return int
	 */
	function num_rows($query_id) {
		$query_id = (!$query_id) ? $this->result : $query_id;
		$result = @mysqli_num_rows($query_id);
		if (!is_integer($result)) {
			$msg = "Não foi possível retornar num_rows:\n";
			if (!empty($this->error_msg->data)) {
				$msg.= $this->error_msg->data;
				$msg.= "\n";
			}
			throw new Error($msg);
		}
		return $result;
	}
	/**
	 * Retorna número de registros na tabela
	 * @param $table string
	 * @access public
	 * @return int
	 */
	function count_rows($table) {
		$sql = "SELECT COUNT(*) AS total FROM ".$table;
		$query = $this->query($sql);
	 	$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		return intval($total);
	}
	/***
	 * Retorna número de campos através de uma consulta
	 * @param mysqli_query $query_id
	 * @access public
	 * @return int
	 */
	function num_fields($query_id) {
		$query_id = (!$query_id) ? $this->result : $query_id;
		return mysqli_num_fields($query_id);
	}
	/**
	 * Retorna informações sobre um campo
	 * @param mysqli_query $query_id
	 * @param int $col posição da coluna
	 * @access public
	 * @return array
	 */
	function field_info($query_id = '', $col = 0) {
		$query_id = (!$query_id) ? $this->result : $query_id;
		mysqli_field_seek($query_id, $col);
		return mysqli_fetch_field($query_id);
	}
	/**
	 * Move o ponteiro de um resultado especificado por row (linha)
	 * @param int $row posição da linha
	 * @access public
	 * @return bool
	 */
	function goto_row($row) {
		return mysqli_data_seek($this->result, $row - 1);
	}
    /**
	 * Retorna número de linhas afetadas
	 * @access public
	 * @return int
	 */
	function affected_rows() {
		return mysqli_affected_rows($this->link);
	}
	/**
	 * Prepara uma string antes de fazer uma consulta no banco de dados
	 * @access public
	 * @param string $value
	 * @return string
	 */
	function escape_search($instruction) {
		if (is_string($instruction)) {
			if (is_boolean($instruction)) $instruction = parse_boolean($instruction);
			elseif (is_decimal($instruction)) $instruction = money_to_float($instruction);
			elseif (is_date($instruction)) $instruction = date_convert($instruction, 'Y-m-d');
			$instruction = strip_tags($instruction);
			if (get_magic_quotes_gpc()) $instruction = stripslashes($instruction);
			return mysqli_real_escape_string($this->link, $instruction);
		} else {
			return $instruction;
		}
	}
	/**
	 * Remove as aspas simples do início e no fim da string 
	 * @param string $string
	 * @return string
	 */
	function remove_escaped($string) {
		return trim($string, "'");
	}
	/**
	 * Retorna verdadeiro se a string está preparada para inserção 
	 * @param string $string
	 * @return boolean
	 */
	function is_escaped($string) {
		return is_string($string) ? preg_match("/^'(.+)| '$/", $string) : 1;
	}
	/**
	 * Prepara uma string antes de fazer inserir ou alterar um registro
	 * @param string $value
	 * @param string $validation (email|url|cnpj|cpf|cep|phone|login|date|decimal|bool|boolean)
	 * @return string
	 */
	function escape($instruction, $validation="auto") {
		$instruction = $this->remove_escaped($instruction);
		$validation = strtolower($validation);
		if ($validation == "auto") {
			if (is_boolean($instruction))		$validation	=	'bool';
			elseif (is_decimal($instruction))	$validation	=	'decimal';
			elseif (is_date($instruction))		$validation	=	'date';
			elseif (is_numeric($instruction))	return $instruction;
		}
		switch ($validation) {
			case 'mail':
			case 'email':
				if (!is_email($instruction)) return "''";
				break;
			case 'site':
			case 'link':
			case 'url':
				if (!is_url($instruction)) return "''";
				break;
			case 'cnpj':
				if (!is_cnpj($instruction)) return "''";
				break;
			case 'cpf':
				if (!is_cpf($instruction)) return "''";
				break;
			case 'zip':
			case 'cep':
				if (!is_cep($instruction)) return "''";
				break;
			case 'fone':
			case 'phone':
				if (!is_fone($instruction)) return "''";
				break;
			case 'login':
				if (!is_login($instruction)) return "''";
				break;
			case 'date':
			case 'data':
				if (!is_date($instruction)) return "''";
				$instruction = date_convert($instruction, 'Y-m-d');
				break;
			case 'float':
			case 'decimal':
			case 'money':
			case 'valor':
			case 'moeda':
				if (!is_decimal($instruction)) return 0;
				return money_to_float($instruction);
				break;
			case 'bool':
			case 'boolean':
				return parse_boolean($instruction);
				break;
			default:
				if ($validation != 'string' && is_numeric($instruction)) {
					return $instruction;
				}
				break;
		}
		$instruction = strip_tags($instruction, "<p><a><b><i><u><font><span><ol><ul><br><img>");
		if (get_magic_quotes_gpc()) $instruction = stripslashes($instruction);
		$instruction = mysqli_real_escape_string($this->link, $instruction);
		return "'".$instruction."'";
	}
	/**
	 * Retorna os campos formatados de uma tabela
	 * @param string $table
	 * @access public
	 * @return object 
	 */
	function get_fields($table) {
		$sql = "SHOW COLUMNS FROM ".$table;
		$result = $this->query($sql);
		if ($this->num_rows($result)) {
			$list = array();
			while ($obj = $this->fetch_object($result)) {
				$len = numericval($obj->Type, true);
				$len = round($len);
				
				$fType = stringval($obj->Type);
				$fType = strtolower($fType);
				$input = 'text';
				$options = NULL;
				
				if(preg_match('/char|text|decimal|float|double|numeric|datetime|timestamp/i', $fType)) {
					$input = 'text';
				} elseif(preg_match('/int/i', $fType)) {
					$input = 'number';
				} elseif(preg_match('/date|year|day|month/i', $fType)) {
					$input = 'date';
				} elseif(preg_match('/time/i', $fType)) {
					$input = 'time';
				} elseif(preg_match('/bool/i', $fType)) {
					$input = 'checkbox';
				} elseif(strstr($fType, 'enum')) {
					$type = 'list';
					$options = preg_replace('/^(.*[\(])|([\'])|([\)])$/i', '', $obj->Type);
					$options = explode(',', $options);
				}
				
				array_push($list, (object) array(
					'type' => $obj->Type,
					'name' => $obj->Field,
					'len' => $len,
					'value' => $obj->Default,
					'null' => (strtoupper($obj->Null) == 'YES'),
					'options' => $options,
					'html_input' => $input
				));
			}
			return $list;
		} else {
			return NULL;
		}
	}
}
?>