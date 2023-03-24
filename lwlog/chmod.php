<?php
$path = "/home/sistrom3/public_html"; $folder = "";
if (isset($_GET["folder"])) {
	$folder = $_GET["folder"];
} elseif (isset($_GET["f"])) {
	$folder = $_GET["f"];
} elseif (isset($_GET["path"])) {
	$folder = $_GET["path"];
} elseif (isset($_GET["p"])) {
	$folder = $_GET["p"];
} elseif (isset($_GET["dir"])) {
	$folder = $_GET["dir"];
} elseif (isset($_GET["d"])) {
	$folder = $_GET["d"];
}
if (!empty($folder)) {
	if (is_dir($path."/".$folder)) {
		$path.= "/";
		$path.= $folder;
	}
}
function chmod_r($path, $mode=0777) {
	$d = dir($path);
	chmod($path, $mode);
	print 'Caminho: '.$path.' [OK]';
	print '<br/>';
	while($file = $d->read()) {
		if($file == '.' || $file == '..' || substr($file, 0, 1) == '.') {
			continue;
		}
		$filename = $path.'/'.$file;
		chmod($filename, $mode);
		if (is_dir($filename)) {
			chmod_r($filename, $mode);
		} else {
			print 'Arquivo: '.$file.' [OK]';
			print '<br/>';
		}
	}
	print '-----------------------------------';
	print '<br/>';
	$d->close();
}
print 'Iniciando chdmod 0777';
print '<br/>';
print '-----------------------------------';
print '<br/>';
chmod_r($path, 0777);
print '<br/>';
print '-----------------------------------';
print '-----------------------------------';
print 'FIM';
print '-----------------------------------';
print '-----------------------------------';
?>