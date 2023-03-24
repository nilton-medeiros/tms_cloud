<?php
require '../../../../php/config.php';
require 'Controler.php';
$Controler = new Controler();
$m = $_POST['m']; if(!$m) $m = $_GET['m']; if(!$m) $m = $_REQUEST['m'];

if (method_exists($Controler, $m)) {
	try {
		$Controler->$m();
	} catch (ExtJSException $e) {
		$erro = $e->getExtJSException();
		$Controler->sys_error($erro['error']);
		print json_encode($erro);
	}
} else {
	print json_encode(array('success'=>false,'title'=>'Erro','msg'=>'Parâmetro: "'.$m.'" inválido.'));
}
?>