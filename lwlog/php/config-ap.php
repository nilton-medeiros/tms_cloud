<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

ini_set('display_errors', 1);
ini_set("allow_url_fopen", 1);
ini_set("memory_limit", "-1");
ini_set('default_charset','UTF-8');

session_start();
set_time_limit(0);

header('Content-Type: text/html; charset=utf-8');

define("MAILER_HOST", "smtp.sistrom.com.br");
define("MAILER_EMAIL", "tms@sistrom.com.br");
define("MAILER_PASS", 'tms.sistrom#419');
define("SUPPORT_EMAIL", "suporte@sistrom.com.br");

define("SISTROM_RS", "Sistrom Sistemas Web Ltda");
define("SISTROM_NF", "Sistrom Sistemas Web");
define("SISTROM_CNPJ", "11.568.220/0001-32");
define("SISTROM_FONE", "+55 11 2502-0108");
define("SISTROM_END", "Av. Prefeito Donald Savazoni, 1012");
define("SISTROM_BAI", "Nova Caieiras");
define("SISTROM_CEP", "07704-060");
define("SISTROM_CID", "Caieiras");
define("SISTROM_UF", "SP");
define("SISTROM_SITE", "https://www.sistrom.com.br");
define("SISTROM_EMAIL", "comercial@sistrom.com.br");

// Host: Locaweb recomenda não usar o IP que pode mudar e sim usar o nome do DB "tmscte_ap.l70dnn0097.mysql.dbaas.com.br"
// define("HOST", "191.252.99.60");
define("HOST", "tmscte_ap.l70dnn0097.mysql.dbaas.com.br");
define("PASS", "tmsrnm6485");
define("DB", "tmscte_ap");
define("USER", "tmscte_ap");

define("PREFIX", 'tmsexpressocloud');
define("PROJECT", 'TMS - Expresso Cloud');
define("VERSION", '2.0');
define("PATH", "/home/sistrom4/public_html/alexpress/");
define("URL", "https://www.sistrom.com.br/alexpress/");
define("SITE_URL", 'https://www.sistrom.com.br/');
define("SITE_TITLE", PROJECT." - Sistema de Gestão de Transporte");

define("MAILER_NAME", SITE_TITLE);
define("NOT_SERVER_MSG", "Parece que você não está efetuando login através do ".PROJECT.". Fique atento a fraude!");

define("PHP", PATH.'php/');
define("LIB", PATH.'php/lib/');
define("INC", PATH.'php/inc/');
define("LOG", PATH.'php/log/');
define("COOKIELOCAL", LOG);

define("BGCOLOR", "#DFEFFF");
define("LAYOUT_HTML_CONTENT", 2);

require LIB.'jQuery.php';
require LIB.'JSPacker.php';
require LIB.'Functions.php';
require LIB.'Log.php';
require LIB.'MySQL.php';
require LIB.'Image.php';
//require LIB.'FiscalMacromind.php';
require LIB.'FirePHPCore/FirePHP.class.php';
require LIB.'html2pdf/html2pdf.class.php';
require LIB.'phpmailer/class.phpmailer.php';
require LIB.'phpmailer/Mailer.php';
require INC.'App.php';

function error_handler($errno, $errstr, $errfile, $errline) {
	if (!(error_reporting() & $errno)) {
		// This error code is not included in error_reporting
		return;
	}
	$msg = 'Erro: '.$errno."\n";
	$msg.= 'Linha: '.$errline."\n";
	$msg.= $errstr."\n";
	$msg.= 'Arquivo: '.$errfile."\n";
	$msg.= "------Parâmetros------\n";
	foreach ($_POST as $key => $value) {
		$msg.= $key.": ".$value;
		$msg.= "\n";
	}
	foreach ($_GET as $key => $value) {
		$msg.= $key.": ".$value;
		$msg.= "\n";
	}
	$msg.= "Versão: PHP ".PHP_VERSION." (".PHP_OS.")";
	print json_encode(array('success'=>false,'logged'=>true,'msg'=>$msg,'error'=>$msg));
	exit(1);
    /* Don't execute PHP internal error handler */
    return true;
}
set_error_handler("error_handler");
?>