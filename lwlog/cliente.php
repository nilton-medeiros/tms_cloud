<?php
require 'php/config.php';

$App = new App();

if (isset($_GET['logout'])) {
	header("Location:".URL."acessocliente.php?logout");
	exit();
} elseif ($App->cliente_online()) {
	$App->html_header(true);
	$App->html_footer();
} else {
	header("Location:".URL."acessocliente.php");
	exit();
}
?>