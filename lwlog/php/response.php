<?php
require 'config.php';

$App = new App();
$m = $_POST['m']; if(!$m) $m = $_GET['m']; if(!$m) $m = $_REQUEST['m'];

if (method_exists($App, $m)) {
	try {
		$App->$m();
	} catch (Error $e) {
		$erro = $e->getError();
		$App->sys_error($erro['error']);
		print json_encode($erro);
	}
}
else
{
	print json_encode(array('success'=>false,'title'=>'Erro','msg'=>'Parâmetro: "'.$m.'" inválido.'));
}
?>