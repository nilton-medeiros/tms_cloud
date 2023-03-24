<?php
require 'php/config.php';
require INC.'Login.php';

if (isset($_GET['empid'])) {
	$empid = intval($_GET['empid']);
	if ($empid > 0) {
		$_SESSION['tms_empr_id'] = $empid;
	}
}

$page = isset($_SESSION['suspended']) ? 'suspended' : $_GET['p'];
$Login = new Login();

if (isset($_GET['logout'])) {
	$Login->logout();
} elseif ($Login->is_online()) {
	header("Location:app.php");
	exit();
}

$Login->html_header();

switch ($page) {
	default:
		$Login->page_content_login();
		break;
	case 'recover':
		$Login->page_content_recover();
		break;
	case 'suspended':
		$Login->page_content_suspended();
		break;
}

$Login->page_content_footer();
$Login->html_footer();
?>