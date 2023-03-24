<?php
class FiscalWebservice {
	private $IdKeyEmpresa;
	private $IdKeyPartner = "c0826819636026dd1f3674774f06c51d";
	private $PartnerAuthorizationToken = "21c5ebf1-0fa4-451a-967b-c6a1fcb328fd";
	
	private $webservice_url;
	
	public function __construct($config) {
		if (!isset($config["DFe"])) $config["DFe"] = "CTe";
		
		$this->IdKeyEmpresa = $config['nChave'];
		$this->webservice_url = 'https://dfe.vinco.com.br/api/'.$config["DFe"];
	}

	private function debug($o) {
		$firephp = FirePHP::getInstance(true);
		try {
			if (is_array($o))	$firephp->fb($o, FirePHP::TRACE);
			else				$firephp->fb($o);
		} catch(Exception $e) {
			$firephp->fb($e);
		}
	}

	public function enviar($dados) {
		return $this->postData('Enviar', $dados);
	}
	
	public function cancelar($dados) {
		$this->debug($dados);
		return $this->postData('Evento', $dados);
	}

	public function inutilizar($dados) {
		return $this->postData('Inutilizacao', $dados);
    }

	public function encerrar($dados) {
		$this->debug($dados);
		return $this->postData('Evento', $dados);
	}

    private function postData($action, $data) {
    	$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $this->webservice_url.'/'.$action);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
		curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:application/json","IdKeyEmpresa:".$this->IdKeyEmpresa, "IdKeyPartner:".$this->IdKeyPartner, "PartnerAuthorizationToken:".$this->PartnerAuthorizationToken));
		$result = curl_exec($ch);
		curl_close($ch);
		return $result;
	}
}
?>