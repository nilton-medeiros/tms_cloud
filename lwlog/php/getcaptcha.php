<?php
//vamos receber o id do captcha da RF e gerar o link
$idCaptcha = $_GET['id'];
if (preg_match('#^[a-z0-9-]{36}$#', $idCaptcha)) {
	$url = 'http://www.receita.fazenda.gov.br/scripts/captcha/Telerik.Web.UI.WebResource.axd?type=rca&guid='.$idCaptcha;	
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  
	$imgsource = curl_exec($ch);
	curl_close($ch);
	if (!empty($imgsource)) {
		$img = imagecreatefromstring($imgsource);
		header('Content-type: image/jpg');
		imagejpeg($img);
	}
}
?>