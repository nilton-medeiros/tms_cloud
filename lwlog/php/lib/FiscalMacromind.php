<?php
class FiscalMacromindCTe {
	private $empresa_codigo;
	private $chave_secreta;    
	private $webservice_url;
	private $key;
	
	public function __construct($config) {
		if (!is_array($config)) {
			return 'CONFIGURACAO INVALIDA';
		}
		$this->empresa_codigo = $config['eCodigo'];
		$this->chave_secreta = $config['nChave'];
		$this->webservice_url = 'http://fiscal.macromind.com.br/api/cte/'.$config['vApi'];
		$this->key = self::gerarKey();
	}

	public function empresa() {
		return self::postData('getEmpresa');
    }
    
    public function arquivos($nCT='') {
		if (empty($nCT)) {
			return 'O PARAMETRO nCT (NUMERO DA CT-e) É OBRIGATÓRIO';
		}
		return self::postData('getArquivos', array('nCT'=>$nCT));
    }
		
    public function enviar($dados='') {
		if (empty($dados) || !is_array($dados)) {
			return 'OS DADOS SÃO OBRIGATÓRIOS!';
		}
		return self::postData('gravar', array('cte' => json_encode($dados)));
	}
	
	public function transmitir($nCT='') {
		if (empty($nCT)) {
			return 'O PARAMETRO nCT (NUMERO DA CT-e) É OBRIGATÓRIO';
		}
		return self::postData('transmitir', array('nCT' => $nCT));
	}
	
	public function status($nCT='') {
		if (empty($nCT)) {
			return 'O PARAMETRO nCT (NUMERO DA CT-e) É OBRIGATÓRIO';
		}
		return self::postData('getStatus', array('nCT'=>$nCT));
	}
	
	public function cancelar($nCT='',$xJust='') {
		if (empty($nCT)) {
			return 'O PARAMETRO nCT (NUMERO DA CT-e) É OBRIGATÓRIO';
		}
		if (empty($xJust)) {
			return 'O PARAMETRO xJust (JUSTIFICATIVA DO CANCELAMENTO) É OBRIGATÓRIO';
		}
    	return self::postData('cancelar', array('nCT'=>$nCT, 'xJust'=>$xJust));
	}
	
	public function inutilizar($tpAmb, $serie, $nCTIni, $nCTFim, $nAno, $xJust) {
		if (empty($tpAmb)) {
			return 'O PARÂMETRO É OBRIGATÓRIO';
		}
		if (empty($serie)) {
			return 'O PARÂMETRO É OBRIGATÓRIO';
		}
		if (empty($nCTIni)) {
			return 'O PARÂMETRO É OBRIGATÓRIO';
		}
		if (empty($nCTFim)) {
			return 'O PARÂMETRO É OBRIGATÓRIO';
		}
		if (empty($nAno)) {
			return 'O PARÂMETRO É OBRIGATÓRIO';
		}
		if (empty($xJust)) {
			return 'O PARÂMETRO É OBRIGATÓRIO';
		}
		return self::postData('inutilizarCte', array('e'=>$this->empresa_codigo, 'key'=>$this->key, 'tpAmb'=>$tpAmb, 'serie'=>$serie, 'nCTIni'=>$nCTIni, 'nCTFim'=>$nCTFim, 'nAno'=>$nAno, 'xJust'=>$xJust));
    }
	
    private function postData($action, $data="") {
    	if (is_array($data)) {
    		$data['key'] = $this->key;
    		$data['e'] = $this->empresa_codigo;
    	} else {
    		$data = array(
    			'key' => $this->key,
    			'e' => $this->empresa_codigo 
			);
    	}
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $this->webservice_url.'/'.$action);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:multipart/form-data"));
		$result = curl_exec($ch);
		curl_close($ch);
		return $result;
	}
	
	private function gerarKey() {
		if (empty($this->chave_secreta)) {
			print 'CHAVE INVALIDA'; 
			return null;
		}
        return md5(sha1($this->chave_secreta.time()));
    }
    
    public function getKey() {
    	return $this->key;
    }
}

class FiscalMacromindMDFe {
	private $empresa_codigo;
	private $chave_secreta;    
	private $webservice_url;
	private $key;

	public function __construct($config) {
		if (!is_array($config)) {
			return 'CONFIGURACAO INVALIDA';
		}
		$this->empresa_codigo = $config['eCodigo'];
		$this->chave_secreta = $config['nChave'];		// Alterado por Nilton 10/01/2017 10:33
		/*$this->webservice_url = 'http://fiscal.macromind.com.br/api/mdfe/'.$config['vApi']; */
		$this->webservice_url = 'http://fiscal.macromind.com.br/api/mdfe/3';
		$this->key = self::gerarKey();
	}
	
	public function empresa() {
		return self::postData('getEmpresa');
	}
	
	public function arquivos($nMDF='') {
		if (empty($nMDF)) {
			return 'O PARAMETRO nMDF (NUMERO DA MDF-e) É OBRIGATÓRIO';
		}
		return self::postData('getArquivos', array('nMDF'=>$nMDF));
	}
	
	public function enviar($dados='') {
		if (empty($dados) || !is_array($dados)) {
			return 'OS DADOS SÃO OBRIGATÓRIOS!';
		}
		return self::postData('gravar', array('mdfe'=>json_encode($dados)));
	}
	
	public function status($nMDF='') {
		if (empty($nMDF)) {
			return 'O PARAMETRO nMDF (NUMERO DA MDF-e) É OBRIGATÓRIO';
		}
		return self::postData('getStatus', array('nMDF'=>$nMDF));
	}
	
	public function transmitir($nMDF='') {
		if (empty($nMDF)) {
			return 'O PARAMETRO nMDF (NUMERO DA MDF-e) É OBRIGATÓRIO';
		}
		return self::postData('transmitir', array('nMDF'=>$nMDF));
	}
	
	public function cancelar($nMDF='',$xJust='') {
		if (empty($nMDF)) {
			return 'O PARAMETRO nMDF (NUMERO DA MDF-e) É OBRIGATÓRIO';
		}
		if (empty($xJust)) {
			return 'O PARAMETRO xJust (JUSTIFICATIVA DO CANCELAMENTO) É OBRIGATÓRIO';
		}
		return self::postData('cancelar', array('nMDF'=>$nMDF, 'xJust'=>$xJust));
	}
	
	public function encerrar($nMDF='',$cMun='') {
		if (empty($nMDF)) {
			return 'O PARAMETRO nMDF (NUMERO DA MDF-e) É OBRIGATÓRIO';
		}
		if (empty($cMun)) {
			return 'O PARAMETRO cMun (CIDADE DE ENCERRAMENTO) É OBRIGATÓRIO';
		}
		return self::postData('encerrar', array('nMDF'=>$nMDF, 'cMun'=>$cMun));
	}

	private function postData($action, $data="") {
    	if (is_array($data)) {
    		$data['key'] = $this->key;
    		$data['e'] = $this->empresa_codigo;
    	} else {
    		$data = array(
    			'key' => $this->key,
    			'e' => $this->empresa_codigo 
			);
    	}
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $this->webservice_url.'/'.$action.'/'.$config['vApi']);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:multipart/form-data"));
		$result = curl_exec($ch);
		curl_close($ch);
		return $result;
	}
	
	private function gerarKey() {
		if (empty($this->chave_secreta)) {
			echo 'CHAVE INVALIDA'; die();
		}
		return md5(sha1($this->chave_secreta.time()));
	}
}
?>