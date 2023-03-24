<?php
require 'php/config.php';
require INC.'Login.php';

$Login = new Login();
$Login->logout();

$msg = "";
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$result = $Login->cliente_logon();
	if ($result->success) {
		header("Location:cliente.php");
		exit();
	} else {
		$msg = $result->msg;
	}
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
	<meta charset="utf-8">
	<meta name="keywords" content="<?php print PROJECT;?> - Acesso ao cliente e rastreamento" />
	
	<meta http-equiv="Content-Language" content="pt-br">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title><?php print SITE_TITLE ?></title>
	<link rel="shortcut icon" href="img/expressocloud.ico"/>

	<link rel="stylesheet" href="css/logincliente.css" type="text/css" media="all" />
	<link href="//fonts.googleapis.com/css?family=Oleo+Script:400,700&amp;subset=latin-ext" rel="stylesheet">
	
	<script type="text/javascript" src="js/jquery-2.1.4.min.js"></script>
	<!-- Fonts and icons -->
	<link href="http://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css" rel="stylesheet">
	<link href='http://fonts.googleapis.com/css?family=Roboto:400,700,300|Material+Icons' rel='stylesheet' type='text/css'>
</head>
<body>
<script src="js/jquery.vide.min.js"></script>
<!-- main -->
<div data-vide-bg="video/Ipad">
	<div class="center-container">
		<!--header-->
		<div class="header-w3l">
			<div class="logo"></div>
		</div>
		<!--//header-->
		<div class="main-content-agile">
			<div class="sub-main-w3">	
				<div class="wthree-pro">
					<h2>Forneça seus dados de acesso "Usuário e Senha"</h2>
				</div>
				<form action="?modo=normal" method="post">
					<input placeholder="Informe seu login" name="cliente_login" class="user" type="text" maxlength="165" required>
					<br><br>
					<input  placeholder="Informe sua senha" name="cliente_senha" class="pass" type="password" maxlength="20" required>
					<br>
					<?php
					if (!empty($msg) && $_GET['modo'] == 'normal') {
						print '<p style="color:red;">'.$msg.'</p>';
						unset($_GET['modo']);
					}
					?>
					<div class="sub-w3l">
						<div class="right-w3l">
							<button type="submit">Entrar</button>
						</div>
					</div>
				</form>
			</div>
			<div class="sub-main-w3">	
				<div class="wthree-pro">
					<h2>Ou entre com os dados data nota para rastreamento</h2>
				</div>
				<form action="?modo=rastrear" method="post">
					<select name="cliente_busca" required>
						<option value="ctes">Conhecimento</option>
						<option value="ctes_documentos" selected>Nota Fiscal</option>
					</select>
					<br><br>
					<input type="text" name="cliente_cnpj" placeholder="Informe CNPJ" required>
					<br><br>
					<input type="text" name="cliente_documento" placeholder="Informe Nº. Documento" required>
					<br>
					<?php
					if (!empty($msg) && $_GET['modo'] == 'rastrear') {
						print '<p style="color:red;">'.$msg.'</p>';
						unset($_GET['modo']);
					}
					?>
					<div class="sub-w3l">
						<div class="right-w3l">
							<button type="submit">Rastrear</button>
						</div>
					</div>
				</form>
			</div>
		</div>
		<!--//main-->
		<!--footer-->
		<div class="footer">
			<p>&copy; <?php print date("Y");?> Acesso restrito ao cliente | Desenvolvido por <a href="<?php print SISTROM_SITE;?>" target="_blank"><?php print SISTROM_NF;?></a></p>
		</div>
		<!--//footer-->
	</div>
</div>
</body>
</html>