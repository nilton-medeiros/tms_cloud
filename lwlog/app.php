<?php
require 'php/config.php';

if (isset($_GET['empid'])) {
	$empid = intval($_GET['empid']);
	if ($empid > 0) {
		$_SESSION['tms_empr_id'] = $empid;
	}
}

$App = new App();

if (isset($_GET['logout']) || isset($_SESSION['suspended'])) {
	header("Location:".URL.'?logout');
	exit();
} elseif ($App->is_online()) {
	$App->html_header();
	$App->html_footer();
} else {
	header("Location:".URL);
	exit();
}
?>