<?php
/**
 * Retorna a data de hoje
 * @param $format
 * @return date
 */
function today($format='Y-m-d') {
	return date($format);
}
/**
 * Retorna Timestamp (uniqueid)
 * @param $timestamp boolean
 * @return int
 */
function now($timestamp=true) {
	$uniqueid = uniqid();
	$uniqueid = preg_replace("/[^0-9]/", "", $uniqueid);
	$datetime = date_timestamp_get(date_create());
	return $timestamp ? $datetime : $uniqueid.$datetime;
}
/**
 * Retornar se o nome do arquivo é válido
 * @param $str string
 * @param $ste boolean
 * @return boolean
 */
function validate_filename($str, $sep="") {
	$str = trim($str);
	$str = preg_replace("/[\+\?\/\$\%\*\:\|\"\<\>\.\,\\\]/i", $sep, $str);
	return $str;
}
/**
 * Formata número em Likes como facebook
 * @param $n int
 * @return string
 */
function format_likes($n) {
	$s = array("K", "M", "G", "T");
	$out = "";
	while ($n >= 1000 && count($s) > 0) {
		$n = $n / 1000.0;
		$out = array_shift($s);
	}
	return round($n, max(0, 3 - strlen((int)$n))) ." ".$out;
}
/**
 * Retorna valor somente em string
 * @param $str string
 * @return string
 */
function stringval($str) {
	$str = trim($str);
	$str = preg_replace("/[^\w\s]+/u", "", $str);
	return $str;
}
/**
 * Retorna números decimais (float), se $convert for verdadeiro, converte string para float
 * @param $str string
 * @param $convert boolean
 * @return float
 */
function numericval($val, $convert=false) {
	if (is_numeric($val)) {
		return floatval($val);
	} elseif ($convert) {
		return money_to_float($val);
	} else {
		$val = str_replace(",", ".", $val);
		$val = preg_replace("([^0-9\.])","", $val);
		return floatval($val);
	}
}
/**
 * Retorna números inteiros, se $convert for verdadeiro, converte string para float
 * @param $str string
 * @return float
 */
function integerval($val) {
	$val = preg_replace("/[^0-9]/i", "", $val);
	return intval($val);
}
/**
 * Preencher com zero a esquerda
 * @param $number int
 * @param $length int
 * @return int
 */
function zerofill($number, $length) {
	return str_pad($number, $length, "0", STR_PAD_LEFT);
}
/**
 * Retorna número arredondado para 0.5 quando menor que 0.5 caso for maior retorna número inteiro
 * @param $number float
 * @return float
 */
function round_middle($number) {
	$nInteiro = (int) $number;
	$nFracao = $number - $nInteiro;
	if ($nFracao > 0.0 && $nFracao < 0.5) {
		$number = $nInteiro + 0.5;
	} elseif ($nFracao > 0.5) {
		$number = $nInteiro + 1;
	}
	return $number;
}
/**
 * Trunca uma string pelo tamanho informado
 * @param $string string
 * @param $length int
 * @return string
 */
function truncate($string, $length=20) {
	if (strlen($string) > $length) {
		$string = substr($string, 0, ($length -3));
    }
    return $string;
}
/**
 * Trunca uma string até o fim de uma palavra ou em qualquer caracter
 * @param $string string
 * @param $length int
 * @param $stopanywhere boolean
 * @return string
 */
function truncate_string($string, $length=20, $stopanywhere=false) {
	if (strlen($string) > $length) {
		$string = substr($string, 0, ($length - 3));
        $string = $stopanywhere ? $string : substr($string, 0, strrpos($string, ' '));
		$string.= '...';
    }
    return $string;
}
/**
 * Remove acentes de uma string
 * @param $str string
 * @return string
 */
function remove_acentos($str) {
	$a = array('/[ÂÀÁÄÃ]/' => 'A','/[âãàáä]/' => 'a','/[ÊÈÉË]/' => 'E','/[êèéë]/'=> 'e','/[ÎÍÌÏ]/' => 'I','/[îíìï]/' => 'i','/[ÔÕÒÓÖ]/' => 'O','/[ôõòóö]/' => 'o','/[ÛÙÚÜ]/' => 'U','/[ûúùü]/' => 'u','/ç/' => 'c','/Ç/' => 'C');
	return preg_replace(array_keys($a), array_values($a), $str);
}
/**
 * Decodifica tag html
 * @param $string string
 * @return string
 */
function html_decode($string) {
    // replace numeric entities
    $string = preg_replace('~&#x([0-9a-f]+);~ei', 'chr(hexdec("\\1"))', $string);
    $string = preg_replace('~&#([0-9]+);~e', 'chr("\\1")', $string);
    // replace literal entities
    $trans_tbl = get_html_translation_table(HTML_ENTITIES);
    $trans_tbl = array_flip($trans_tbl);
    return strtr($string, $trans_tbl);
}
/**
 * Retorna se o arquivo é do tipo imagem
 * @param $file string
 * @return boolean
 */
function is_image($file) {
	if (empty($file)) return false;
	$allowed = array("jpg", "jpeg", "gif", "png", "bmp");
	if (is_string($file)) {
		$ext = get_ext($file);
		return in_array($ext, $allowed);
	} elseif (is_array($file)) {
		return preg_match('/^image\/(jpeg|gif|pjpeg|jpg|png)$/', $file['type']);
	}
}
/**
 * Retorna se o arquivo é do tipo pdf
 * @param $file string
 * @return boolean
 */
function is_pdf($file) {
	if (empty($file)) return false;
	if (is_string($file)) {
		$ext = get_ext($file);
		return $ext == 'pdf';
	} elseif (is_array($file)) {
		return $file['type'] == 'application/pdf';
	}
}
/**
 * Retorna se o arquivo é do tipo excel
 * @param $file string
 * @return boolean
 */
function is_excel($file) {
	if (empty($file)) return false;
	if (is_string($file)) {
		$ext = get_ext($file);
		return ($ext == 'xls' || $ext == 'xlsx');
	} elseif (is_array($file)) {
		$allowed =  array('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/octet-stream','application/msexcel','application/excel','application/x-excel','application/x-msexcel');
		return in_array($file['type'], $allowed);
	}
}
/**
 * Retorna se o arquivo é do tipo csv
 * @param $file string
 * @return boolean
 */
function is_csv($file) {
	if(empty($file)) return false;
	if (is_string($file)) {
		$ext = get_ext($file);
		return $ext == 'csv';
	} elseif (is_array($file)) {
		$allowed = array('text/csv','text/plain','application/csv','text/comma-separated-values','application/excel','application/vnd.ms-excel','application/vnd.msexcel','text/anytext','application/octet-stream','application/txt');
		return in_array($file['type'], $allowed);
	}
}
/**
 * Retorna se a string é tipo data
 * @param $string string
 * @return boolean
 */
function is_date($string) {
	$len = strlen($string);
	if ($len != 10) {
		$string = substr($string, 0, 10 - $len);
		$len = strlen($string);
		if($len != 10) return false;
	}
	if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $string)) if(!preg_match('/^\d{4}\-\d{2}\-\d{2}$/', $string)) return false;
	return true;
}
/**
 * Retorna se a string é do tipo decimal
 * @param $string string
 * @return boolean
 */
function is_decimal($string) {
	return preg_match('/^[0-9]+(?:\.[0-9]+)?+(?:\,[0-9]+)?$/im', $string);
}
/**
 * Retorna se a string é do tipo boleano
 * @param $string string
 * @return boolean
 */
function is_boolean($string) {
	return preg_match('/^on$|^off$|^true$|^false$|^verdadeiro$|^falso$|^sim$|^não$|^v$|^f$|^s$|^n$|^1$|^0$/', $string);
}
/**
 * Retorna se a string é do tipo cep brasileiro
 * @param $string string
 * @return boolean
 */
function is_cep($string) {
	return preg_match('/^[0-9]{5}([- ]?[0-9]{3})?$/', $string);
}
/**
 * Retorna se a string é do tipo telefone universal
 * @param $string string
 * @param $universal boolean
 * @return boolean
 */
function is_fone($string, $universal=false) {
	$er = $universal ? "/^\+[0-9]{2} [0-9]{2} [0-9]{8,9}?$/" : "/^\[0-9]{2} [0-9]{8,9}?$/";
	return preg_match($er, $string);
}
/**
 * Retorna se a string está em um formato válido de login
 * @param $string string
 * @return boolean
 */
function is_login($string) {
	return preg_match("/^[a-zA-Z][\w.-]{6,32}$/", $string);
}
/**
 * Retorna se a string está no formato válido de URL
 * @param $url string
 * @return boolean
 */
function is_url($url) {
	if(empty($url)) return false;
	return filter_var($url, FILTER_VALIDATE_URL);
}
/**
 * Retonar se a string está no formato válido de E-mail
 * @param $email string
 * @return boolean
 */
function is_email($email) {
	if(empty($email)) return false;
	return filter_var($email, FILTER_VALIDATE_EMAIL);
}
/**
 * Converte a data entrada para um outro formato de saída
 * @param $date date
 * @param $output string
 * @return date
 */
function date_convert($date, $output='Y-m-d') {
	if (empty($date)) {
		return $date;
	} elseif ($date == "0000-00-00") {
		return "";
	}
	$date = str_replace(array("'",'"',"\"","\'","\\"), '', $date);
	if (preg_match('/^\d{2}\/\d{2}\/\d{4} \d{2}\:\d{2}(\:\d{2})?$/', $date)) {
		$dArr = explode(" ", $date);
		$date = explode("/", $dArr[0]);
		$date = $date[2].'-'.$date[1].'-'.$date[0].' '.$dArr[1];
	} elseif (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $date)) {
		$date = explode("/", $date);
		$date = $date[2].'-'.$date[1].'-'.$date[0];
	}
	return date_format(date_create($date), $output);
}
/**
 * Traduz do inglês para o portugûes a data de entrada
 * @param $date date
 * @param $week boolean
 * @return string
 */
function date_translate($date, $week=false) {
	if ($week) {
		$pt = array('Seg','Ter','Qua','Qui','Sex','Sáb','Dom');
		$en = array('Mon','Tue','Wed','Thu','Fri','Sat','Sun');
		$date = explode(' ', $date);
		$weekname = trim($date[0]);
		$key = array_search($weekname, $en);
		return $pt[$key].' '.end($date);
	}
	$pt = array('Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro');
	
	$delimiter	=	preg_match('/-/', $date) ? '-' : '/';
	$arrdate	=	explode($delimiter, $date);
	$datelen	=	count($arrdate);
	
	if ($datelen == 3) {
		$day	=	intval($arrdate[2]);
		$month	=	intval($arrdate[1]);
		$year	=	intval($arrdate[0]);
		
		if (strlen($arrdate[0]) != 4) {
			$day	=	intval($arrdate[0]);
			$month	=	intval($arrdate[1]);
			$year	=	intval($arrdate[2]);
		}
		
		$key = ($month - 1);
		if ($day < 10) $day = '0'.$day;
		
		return $day.' de '.$pt[$key].' de '.$year;
	} elseif ($datelen == 2) {
		$month = intval($arrdate[0]);
		if (!$month) {
			$en		=	array('January','February','March','April','May','June','July','August','September','October','November','December');
			$key	=	array_search($arrdate[0], $en);
			$month	=	$key ? $pt[$key] : $arrdate[0];
			return $month.'/'.$arrdate[1];
		} else {
			if (strlen($arrdate[1]) == 4) {
				$key = ($month - 1);
				return $pt[$key].'/'.$arrdate[1];
			} else {
				$day	=	$month;
				$month	=	intval($arrdate[1]);
				
				$key = ($month - 1);
				if ($day < 10) $day = '0'.$day;
				
				return $day.' de '.$pt[$key];
			}
		}
	} else {
		return $date;
	}
}
/**
 * Traduz do inglês para português o mês da data de entrada
 * @param $month int (número do mês)
 * @return boolean
 */
function month_translate($month) {
	$pt = array('JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO');
	$en = array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
	if (is_numeric($month)) {
		$key = intval($month) - 1;
		return $pt[$key];
	} else {
		$key = array_search($month, $en);
		return $pt[$key];
	}
}
/**
 * Retorna a data da próxima semana através de uma data de entrada
 * @param $target_week_day int (dia da semana)
 * @param $target_date date (data de entrada)
 * @param $format string (formato de saída da data)
 * @return date
 */
function next_week($target_week_day, $target_date = "", $format = 'Y-m-d') {
	if(empty($target_date)) {
		$date = getdate();
	} else {
		$er = "(([0][1-9]|[1-2][0-9]|[3][0-1])\/([0][1-9]|[1][0-2])\/([0-9]{4}))";
		if(!preg_match($er, $target_date)) {
			$target_date = date_convert($target_date, 'd/m/Y');
			if(!preg_match($er, $target_date)) return NULL;
		}
		$target_date = explode("/", $target_date);
		$date = getdate(mktime(0, 0, 0, $target_date[1], $target_date[0], $target_date[2]));
	}
	$day = $date["mday"];
	$week_day = $date["wday"];
	$month = $date["mon"];
	$year = $date["year"];
	
	if ($week_day <= $target_week_day) $days_left = $target_week_day - $week_day;
	else $days_left = 7 - ($week_day - $target_week_day);
	
	$next_week = getdate(mktime(0, 0, 0, $month, $day + $days_left, $year));
	$fullDate = $next_week['year'].'-'.$next_week['mon'].'-'.$next_week['mday'];
	
	return(date_convert($fullDate, $format));
}
/**
 * Retorna um período de data através de um tipo de entrada: day|week|month|year (dia|mês|semana|ano)
 * @param $datestr date (data de entrada)
 * @param $type string (day|week|month|year) ou (dia|semana|mês|ano)
 * @return array
 */
function range_date($datestr, $type='day') {
	$dt = strtotime($datestr);
	if ($type == 'day' || $type == 'dia') {
		return array(
			date('N', $dt)==1 ? date('Y-m-d', $dt) : date('Y-m-d', strtotime('last monday', $dt)),
			date('N', $dt)==7 ? date('Y-m-d', $dt) : date('Y-m-d', strtotime('next sunday', $dt))
		);
	} elseif ($type == 'week' || $type == 'semana') {
		return array(
			date('N', $dt)==1 ? date('Y-m-d', $dt) : date('Y-m-d', strtotime('last week', $dt)),
			date('N', $dt)==7 ? date('Y-m-d', $dt) : date('Y-m-d', strtotime('next week', $dt))
		);
	} elseif ($type == 'month' || $type == 'mês' || $type == 'mes') {
		return array(
			date('Y-m-d', strtotime('first day of this month', $dt)),
			date('Y-m-d', strtotime('last day of this month', $dt))
		);
	} elseif ($type == 'year' || $type == 'ano') {
		$y = date('Y', $dt);
		return array(
			date('Y-m-d', strtotime('first day of January '.$y, $dt)),
			date('Y-m-d', strtotime('last day of December '.$y, $dt))
		);
	} else {
		return $datestr;
	}
}
/**
 * Converte valor float para decimal brasileiro
 * @param $value float
 * @param $decimals int
 * @return string
 */
function float_to_decimal($value, $decimals=2) {
	if ($decimals <= 1) {
		$result = round($value, 2);
		$result = explode('.', $result);
		$decimals = 0;
		if (count($result) == 2) {
			$decimal = intval($result[1]);
			if ($decimal > 0) {
				$pos1 = intval(substr($result[1], 0, 1));
				$pos2 = intval(substr($result[1], 1, 1));
				$decimals = ($decimal > 10 || ($pos1 == 0 && $pos2 > 0)) ? 2 : 1;
			}
		}
	}
	return @number_format($value, $decimals, ',', '');
}
/**
 * Converte valor float para formato moeda brasileiro
 * @param $value float
 * @param $decimals int
 * @return string
 */
function float_to_money($value, $decimals=2) {
	return @number_format($value,$decimals,',','.');
}
/**
 * Converte moeda brasileira para o formato float
 * @param $value string
 * @param $checknum boolean (assinale false para não checar se a string é numérica)
 * @return float
 */
function money_to_float($value, $checknum=true) {
	if (empty($value)) {
		return 0;
	}
	$value = preg_replace("([^0-9\,\.])","", $value);
	if ($checknum === true && is_numeric($value)) {
		return floatval($value);
	}
	if (!strstr($value, ',')) {
		$value.=',00';
	}
	$value = str_replace(".","", $value);
	$money = explode(",", $value);
	$val = $money[0];
	$dec = $money[1];
	$float = floatval($val.".".$dec);
	return $float;
}
/**
 * Retorna se a string informada está no formato válido de CPF
 * @param $cpf string
 * @return boolean
 */
function is_cpf($cpf) {
	$nulos = array("12345678909","11111111111","22222222222","33333333333","44444444444","55555555555","66666666666","77777777777","88888888888","99999999999","00000000000");
	$cpf = preg_replace("/[^0-9]/", "", $cpf);
	if(!is_numeric($cpf)) return 0;
	if(in_array($cpf, $nulos)) return 0;
	$acum=0;
	for($i=0; $i<9; $i++)$acum+= $cpf[$i]*(10-$i);
	$x=$acum % 11;
	$acum = ($x>1) ? (11 - $x) : 0;
	if ($acum != $cpf[9]) return 0;
	$acum=0;
	for ($i=0; $i<10; $i++) $acum+= $cpf[$i]*(11-$i);
	$x=$acum % 11;
	$acum = ($x > 1) ? (11-$x) : 0;
	if ( $acum != $cpf[10]) return 0;
	return 1;
}
/**
 * Retorna se a string está no formato válido de CNPJ
 * @param $cnpj string
 * @return boolean
 */
function is_cnpj($cnpj) {
	$cnpj = preg_replace('/(\'|")/', "", $cnpj);
	$cnpj = preg_replace( "@[./-]@", "", $cnpj);
	if( strlen( $cnpj ) <> 14 or !is_numeric( $cnpj ) )	return 0;
	$k = 6;
	$soma1 = "";
	$soma2 = "";
	for ($i = 0; $i < 13; $i++) {
		$k = $k == 1 ? 9 : $k;
		$soma2 += ( $cnpj{$i} * $k );
		$k--;
		if ($i < 12) {	
			if ($k == 1) {
				$k = 9;
				$soma1 += ( $cnpj{$i} * $k );
				$k = 1;
			} else {
				$soma1 += ( $cnpj{$i} * $k );
			}
		}
	}
	$digito1 = $soma1 % 11 < 2 ? 0 : 11 - $soma1 % 11;
	$digito2 = $soma2 % 11 < 2 ? 0 : 11 - $soma2 % 11;
	return ($cnpj{12} == $digito1 and $cnpj{13} == $digito2);
}
/**
 * Gerar numeração do orçamento através de um id
 * @param $id int
 * @param $fill int
 * @return string
 */
function gerar_numeracao($id, $fill=4) {
	$len = strlen($id); if($len < $fill) $len = $fill;
	$numero = ''; for($i=0; $i<$len; $i++) $numero.= '0'; $numero.= $id;
	$numero = substr($numero, $len*-1, strlen($numero));
	return date('Y').'/'.$numero;
}
/**
 * Gerar senha aleatória
 * @param $tamanho int
 * @param $maiuscula boolean
 * @param $minuscula boolean
 * @param $numeros boolean
 * @param $codigos boolean
 * @return string
 */
function gerar_senha($tamanho = 50, $maiuscula = true, $minuscula = true, $numeros = true, $codigos = true) {
	$maius = "ABCDEFGHIJKLMNOPQRSTUWXYZ";
	$minus = "abcdefghijklmnopqrstuwxyz";
	$numer = "0123456789";
	$codig = '!@#$%&*()-+.,;?{[}]^><:|';
	$base = '';
	$base.=	$maiuscula ? $maius : '';
	$base.=	$minuscula ? $minus : '';
	$base.= $numeros ? $numer : '';
	$base.= $codigos ? $codig : '';
	srand((float) microtime() * 10000000);
	$senha = '';
    for ($i = 0; $i < $tamanho; $i++) {
    	$senha .= substr($base, rand(0, strlen($base)-1), 1);
    }
	return $senha;
}
/**
 * Retorna próximo dia útil através de uma data de entrada
 * @param $data date (data de entrada)
 * @param $interval int (intervalo de dias para ser adicionado na data)
 * @param $saida string (formato de saída da data)
 * @return date
 */
function proximo_dia_util($data, $interval=0, $saida='Y-m-d') {
	$timestamp = $interval > 0 ? strtotime($data.' + '.$interval.' day') : strtotime($data);
	$dia = date('N', $timestamp);
	$dia = intval($dia);
	if ($dia >= 6) {
		$timestamp += ((8 - $dia) * 3600 * 24);
	}
	return date($saida, $timestamp);
}
/**
 * Retorna quinto dia útil através de uma data de entrada
 * @param $mes int
 * @param $ano int
 * @param $output string
 * @return date
 */
function quinto_dia_util($mes, $ano, $output='Y-m-d') {
	$day = intval(date('N', mktime(0,0,0, $mes, 1, $ano)));
	$date = $ano.'-'.$mes.'-01';
	switch($day) {
		case 1: return date($output, strtotime($date.' + 4 day')); break;
		case 7: return date($output, strtotime($date.' + 5 day')); break;
		default: return date($output, strtotime($date.' + 6 day')); break;
	}
}
/**
 * Adiciona intervalo para cálculo em uma data de entrada
 * @param $date date
 * @param $interval string (n day|n month|n year)
 * @param $output string (formato de saída da data)
 * @return date
 */
function dateadd($date, $interval, $output='Y-m-d') {
	$date = str_replace(array("'",'"',"\"","\'","\\"), '', $date);
	$date = date_convert($date, 'Y-m-d');
	return date($output, strtotime($date.' + '.$interval));
}
/**
 * Subtrai intervalo para cálculo em uma data de entrada
 * @param $date date
 * @param $interval string (n day|n month|n year)
 * @param $output string (formato de saída da data)
 * @return date
 */
function datesub($date, $interval, $output='Y-m-d') {
	$date = str_replace(array("'",'"',"\"","\'","\\"), '', $date);
	$date = date_convert($date, 'Y-m-d');
	return date($output, strtotime($date.' - '.$interval));
}
/**
 * Retorna por extenso ou em dias a diferença entre duas data
 * @param $date1 date
 * @param $date2 date
 * @param $intervalo string (d|m|y|h|n)
 * @param $string boolean (se true retorna por extenso)
 * @return string|int
 */
function datediff($data1, $data2, $intervalo='d', $string=false) {
	if ($string) $intervalo = 'd';
	$data1 = date_convert($data1);
	$data2 = date_convert($data2);
	switch ($intervalo) {
		case 'y': $Q = 86400*365; break; //ano
		case 'm': $Q = 2592000; break; //mes
		case 'd': $Q = 86400; break; //dia
		case 'h': $Q = 3600; break; //hora
		case 'n': $Q = 60; break; //minuto
		default: $Q = 1; break; //segundo
	}
	$result = round((strtotime($data2) - strtotime($data1)) / $Q);
	if ($string) {
		$r = 0; $d = $result; $result = '';
		if ($d == 31) {
			$result.= '1 MÊS';
		} elseif ($d > 31) {
			$m = intval($d / 31);
			if ($m > 11) {
				$a = intval($m / 12);
				$result = $a > 1 ? $a.' ANOS' : '1 ANO';
			} elseif ($m) {
				$r = intval($d % 31);
				$result.= $m > 1 ? $m.' MESES' : '1 MÊS';
				if ($r > 6) {
					$s = intval($r / 7);
					$result.= ' ';
					$result.= $s > 1 ? $s.' SEMANAS ' : '1 SEMANA';
					$r = intval($r % 7);
					if ($r) {
						$result.= ' '.$r.' ';
						$result.= $r > 1 ? 'DIAS' : 'DIA';
					}
				} elseif ($r >= 1) {
					$result.= ' '.$r.' ';
					$result.= $r > 1 ? 'DIAS' : 'DIA';
				}
			}
		} elseif ($d >= 1) {
			$result = $d.' ';
			$result.= $d > 1 ? 'DIAS' : 'DIA';
		}
	}
	return $result;
}
/**
 * Retorna abreviação de uma data
 * @param $date date
 * @return string
 */
function shortdate($date) {
	$date = date_convert($date,'d/m/Y');
	$date = explode("/",$date);
	return $date[0]."/".$date[1];
}
/**
 * Converte string para valor booleano
 * @param string
 * @return boolean
 */
function parse_boolean($string) {
	if(is_bool($string)) return $string ? 1 : 0;
	$string = strtolower($string);
	switch ($string) {
		case 1: case "1": case "on": case "true": case "yes": case "verdadeiro": case "sim": case "s": case "v": return 1; break;
		default: return 0; break;
	}
}
/**
 * Adiciona um percentual do valor de entrada
 * @param $p float
 * @param $v float
 * @return float
 */
function acrescimo_percentual($p, $v) {
	if (empty($p)) return $v;
	if ($p <= 0) return $v;
	$p = $p / 100;
	$v = $v + ($p * $v);
	return $v;
}
/**
 * Subtrai um percentual do valor de entrada
 * @param $p float
 * @param $v float
 * @return float
 */
function desconto_percentual($p, $v) {
	if (empty($p)) return $v;
	if ($p <= 0) return $v;
	$p = $p / 100;
	$v = $v - ($p * $v);
	return $v;	
}
/**
 * Arredonda o número de entrada para casa decimais informada
 * @param $number float
 * @param $decimal int
 * @return float 
 */
function set_decimal($number, $decimal=2) {
	if (is_string($number)) $number = (strstr($number, ",")) ? money_to_float($number) : floatval($number); 
	return round($number, $decimal);
}
/**
 * Formata url para link
 * @param $string url string
 * @return string
 */
function hyperlink($string) {
	return preg_replace('@((http|https|ftp)://([-\w\.]+)+(:\d+)?(/([\w/_\.]*(\?\S+)?)?)?)@', '<a href="$1" target="_blank">$1</a>', $string);
}
/**
 * Codifica string para o formato BBcode (chat)
 * @param $texto string
 * @param $reverse boolean
 * @return string
 */
function BBcode($texto, $reverse=false) {
	if (!$reverse) {
		$texto = htmlentities($texto);
		$a = array("/\[+\/-\]/is","/\[q\]/is","/\[d\]/is","/\[t\]/is","/\[1\/4\]/is","/\[1\/2\]/is","/\[3\/4\]/is","/\[i\](.*?)\[\/i\]/is","/\[b\](.*?)\[\/b\]/is","/\[u\](.*?)\[\/u\]/is","/\[img=(.*?)\](.*?)\[\/img\]/is","/\[url=(.*?)\](.*?)\[\/url\]/is","/\[color=(.*?)\](.*?)\[\/color\]/is");
		$b = array("&#177;","&#9744;","&#216;","&#916;","&#188;","&#189;","&#190;","<i>$1</i>","<b>$1</b>","<u>$1</u>","<img src=\"$1\" title=\"$2\"/>","<a href=\"$1\" target=\"_blank\">$2</a>","<font style=\"color:$1;\">$2</font>");
		$texto = preg_replace($a, $b, $texto);
		$texto = nl2br($texto);
		$texto = html_entity_decode($texto);
	} else {
		$a = array("/&#177;/is","/&#9744;/is","/&#216;/is","/&#916;/is","/&#188;/is","/&#189;/is","/&#190;/is","/<i>(.*?)<\/i>/is","/<b>(.*?)<\/b>/is","/<u>(.*?)<\/u>/is","/<a href=\"(.*?)\" target=\"_blank\">(.*?)<\/a>/is","/<img src=\"(.*?)\" title=\"(.*?)\"\/>/is","/<font style=\"color:(.*?);\">(.*?)<\/font>/is");
		$b = array("+/-","[q]","[d]","[t]","[1/4]","[1/2]","[3/4]","[i]$1[/i]","[b]$1[/b]","[u]$1[/u]","[url=$1]$2[/u]","[img=$1]$2[/img]","[color=$1]$2[/color]");
		$texto = preg_replace($a, $b, $texto);
		$texto = br2nl($texto);
		$texto = str_replace("☐", "[q]", $texto);
		$texto = str_replace("±", "[+/-]", $texto);
		$texto = str_replace("½", "[1/2]", $texto);
		$texto = str_replace("¼", "[1/4]", $texto);
		$texto = str_replace("¾", "[3/4]", $texto);
		$texto = str_replace("Ø", "[d]", $texto);
	}
	return $texto;
}
/**
 * Converte tag br para nl
 * @param $data string
 * @return string
 */
function br2nl($data) {
	return preg_replace('!<br.*>!iU', "\r", $data);
}
/**
 * Remove tag html de uma string
 * @param $html
 * @return string
 */
function remove_tags($html) {
	return preg_replace('<[^>]*>', '', $html);
}
/**
 * Forma número para o tipo percentual
 * @param $number float
 * @return float
 */
function parse_percent($number) {
	return (!$number || $number >= 100) ? 1 : ((100 - $number) / 100);
}
/**
 * Retona dados em XML do Google Maps através de um endereço
 * @param $request string (endereço comercial ou residencial) 
 * @return xml
 */
function gmap_geo($request) {
	$request = urlencode($request);
	$address = "http://maps.google.com/maps/geo?q=".$request."&output=xml";
	return simplexml_load_file($address);
}
/**
 * Retorna coordenadas através de um endereço
 * @param $request string (endereço comercial ou residencial)
 * @return array(x,y)
 */
function gmap_geo_xy($request) {
	$xml = gmap_geo($request);
	$xy	 = $xml->Response->Placemark->Point->coordinates;
	$xy	 = explode(",", $xy);
	return $xy;
}
/**
 * Retorna a distância em KM entre 2 endereços
 * @param $origem string
 * @param $destino string
 * @return object {distance, duration}
 */
function gmap_distance($origem, $destino) {
    $url = "http://maps.google.com.br/maps/api/directions/json?origin=".urlencode($origem)."&destination=".urlencode($destino)."&sensor=true";
    $json = @file_get_contents($url);
	$data = json_decode($json);
	$distance = $data->routes[0]->legs[0]->distance->text;
	$distance = numericval($distance);
	$duration = $data->routes[0]->legs[0]->duration->text;
	return (object) array(
		'distance' => $distance,
		'duration' => $duration
	);
}
/**
 * Retorna string que esteja entre uma palavra chave
 * @param $haystack string
 * @param $start int
 * @param $end int
 * @return string 
 */
function substring_between($haystack, $start, $end) {
	if (strpos($haystack, $start) === false || strpos($haystack, $end) === false) {
		return false;
	} else {
		$start_position = strpos($haystack, $start) + strlen($start);
		$end_position = strpos($haystack, $end);
		return substr($haystack, $start_position, $end_position - $start_position);
	}
}
/**
 * Retorna código fonte através de uma url
 * @param $url string
 * @return string
 */
function get_source($url) {
	#set on php.ini allow_url_include = On
	ob_start();
	include($url);
	$data = ob_get_contents();
	ob_clean();
	return $data;
}
/**
 * Executar expressões matemáticas através de uma string
 * @param $mathString string
 * @return float
 */
function macro_sub($mathString) {
	$mathString = trim($mathString);
	$mathString = preg_replace('[^0-9\+-\*\/\(\) ]', '', $mathString);
	$compute = create_function("", "return (" . $mathString . ");" );
	return 0 + $compute();
}
/**
 * Verifica se é um diretório no formato fpt
 * @param $filename string
 * @return boolean
 */
function ftp_is_dir($filename)  {
	$filename = explode(".", $filename);
	return count($filename) <= 1;
}
/**
 * Ordena array através de de uma chave
 * @param $data array
 * @param $file string
 * @return array
 */
function order_by($data, $field) {
	$code = "return strnatcmp(\$a['$field'], \$b['$field']);";
	usort($data, create_function('$a,$b', $code)); 
	return $data;
}
/**
 * Verifica se domíncio está disponível (online)
 * @param $domain string url
 * @return boolean
 */
function is_domain_availible($domain) {
	//initialize curl
	$curlInit = curl_init($domain);
	curl_setopt($curlInit, CURLOPT_CONNECTTIMEOUT, 10);
	curl_setopt($curlInit, CURLOPT_HEADER, true);
	curl_setopt($curlInit, CURLOPT_NOBODY, true);
	curl_setopt($curlInit, CURLOPT_RETURNTRANSFER, true);
	//get answer
	$response = curl_exec($curlInit);
	curl_close($curlInit);
	if ($response) {
		return true;
	}
	return false;
}
/**
 * Verifica se a url está online
 * @param $url string
 * @return boolean
 */
function is_url_online($url) {
	$agent = "Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)";$ch=curl_init();
	curl_setopt ($ch, CURLOPT_URL,$url );
	curl_setopt($ch, CURLOPT_USERAGENT, $agent);
	curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt ($ch,CURLOPT_VERBOSE,false);
	curl_setopt($ch, CURLOPT_TIMEOUT, 5);
	curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch,CURLOPT_SSLVERSION,3);
	curl_setopt($ch,CURLOPT_SSL_VERIFYHOST, FALSE);
	$page=curl_exec($ch);
	$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);
	if ($httpcode >= 200 && $httpcode < 300) {
		return true;
	}
	return false;
}
/**
 * Retorna taxa de cotação/câmbio. Fonte Google Finance
 * @param $from string (moeda de origem)
 * @param $to string (moeda de destino)
 * @param $amount (valor para cotação)
 * @param $force (forçar carregamento no Google Finance)
 * @return float
 */
function conversor_moeda($from='USD', $to='BRL', $amount=1, $force=false) {
	$to = sigla_moeda($to);
	$from = sigla_moeda($from);
	$request = true;
	
	if (!$force && isset($_SESSION[$from]) && isset($_SESSION['amount'])) {
		$request = ($_SESSION['amount'] != $amount || empty($_SESSION[$from]));
	}
	
	if ($request) {
		$url = "http://www.google.com/finance/converter?a=".$amount."&from=".$from."&to=".$to;
		
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)");
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
		
		$rawdata = curl_exec($ch);
		curl_close($ch);
		
		$result = explode("bld>", $rawdata);
		$result = explode($to, $result[1]);
		$result = round($result[0], 2);
		
		$_SESSION[$from] = $result;
		$_SESSION['amount'] = $amount;
	}
	
	return $_SESSION[$from];
}
/**
 * Retorna a sigla da moeda para o formato Google Finance
 * @param $moeda string
 * @return string
 */
function sigla_moeda($moeda) {
	/*
	AED - United Arab Emirates Dirham (AED)
	ANG - Netherlands Antillean Guilder (ANG)
	ARS - Argentine Peso (ARS)
	AUD - Australian Dollar (AUD)
	BDT - Bangladeshi Taka (BDT)
	BGN - Bulgarian Lev (BGN)
	BHD - Bahraini Dinar (BHD)
	BND - Brunei Dollar (BND)
	BOB - Bolivian Boliviano (BOB)
	BRL - Brazilian Real (BRL)
	BWP - Botswanan Pula (BWP)
	CAD - Canadian Dollar (CAD)
	CHF - Swiss Franc (CHF)
	CLP - Chilean Peso (CLP)
	CNY - Chinese Yuan (CNY)
	COP - Colombian Peso (COP)
	CRC - Costa Rican Colon (CRC)
	CZK - Czech Republic Koruna (CZK)
	DKK - Danish Krone (DKK)
	DOP - Dominican Peso (DOP)
	DZD - Algerian Dinar (DZD)
	EEK - Estonian Kroon (EEK)
	EGP - Egyptian Pound (EGP)
	EUR - Euro (EUR)
	FJD - Fijian Dollar (FJD)
	GBP - British Pound Sterling (GBP)
	HKD - Hong Kong Dollar (HKD)
	HNL - Honduran Lempira (HNL)
	HRK - Croatian Kuna (HRK)
	HUF - Hungarian Forint (HUF)
	IDR - Indonesian Rupiah (IDR)
	ILS - Israeli New Sheqel (ILS)
	INR - Indian Rupee (INR)
	JMD - Jamaican Dollar (JMD)
	JOD - Jordanian Dinar (JOD)
	JPY - Japanese Yen (JPY)
	KES - Kenyan Shilling (KES)
	KRW - South Korean Won (KRW)
	KWD - Kuwaiti Dinar (KWD)
	KYD - Cayman Islands Dollar (KYD)
	KZT - Kazakhstani Tenge (KZT)
	LBP - Lebanese Pound (LBP)
	LKR - Sri Lankan Rupee (LKR)
	LTL - Lithuanian Litas (LTL)
	LVL - Latvian Lats (LVL)
	MAD - Moroccan Dirham (MAD)
	MDL - Moldovan Leu (MDL)
	MKD - Macedonian Denar (MKD)
	MUR - Mauritian Rupee (MUR)
	MVR - Maldivian Rufiyaa (MVR)
	MXN - Mexican Peso (MXN)
	MYR - Malaysian Ringgit (MYR)
	NAD - Namibian Dollar (NAD)
	NGN - Nigerian Naira (NGN)
	NIO - Nicaraguan Cordoba (NIO)
	NOK - Norwegian Krone (NOK)
	NPR - Nepalese Rupee (NPR)
	NZD - New Zealand Dollar (NZD)
	OMR - Omani Rial (OMR)
	PEN - Peruvian Nuevo Sol (PEN)
	PGK - Papua New Guinean Kina (PGK)
	PHP - Philippine Peso (PHP)
	PKR - Pakistani Rupee (PKR)
	PLN - Polish Zloty (PLN)
	PYG - Paraguayan Guarani (PYG)
	QAR - Qatari Rial (QAR)
	RON - Romanian Leu (RON)
	RSD - Serbian Dinar (RSD)
	RUB - Russian Ruble (RUB)
	SAR - Saudi Riyal (SAR)
	SCR - Seychellois Rupee (SCR)
	SEK - Swedish Krona (SEK)
	SGD - Singapore Dollar (SGD)
	SKK - Slovak Koruna (SKK)
	SLL - Sierra Leonean Leone (SLL)
	SVC - Salvadoran Colon (SVC)
	THB - Thai Baht (THB)
	TND - Tunisian Dinar (TND)
	TRY - Turkish Lira (TRY)
	TTD - Trinidad and Tobago Dollar (TTD)
	TWD - New Taiwan Dollar (TWD)
	TZS - Tanzanian Shilling (TZS)
	UAH - Ukrainian Hryvnia (UAH)
	UGX - Ugandan Shilling (UGX)
	USD - US Dollar (USD)
	UYU - Uruguayan Peso (UYU)
	UZS - Uzbekistan Som (UZS)
	VEF - Venezuelan Bolivar (VEF)
	VND - Vietnamese Dong (VND)
	XOF - CFA Franc BCEAO (XOF)
	YER - Yemeni Rial (YER)
	ZAR - South African Rand (ZAR)
	ZMK - Zambian Kwacha (ZMK)
	*/
	$moeda = strtoupper($moeda);
	switch ($moeda) {
		case 'DÓLAR': case 'DOLAR': return 'USD'; break;
		case 'EURO': return 'EUR'; break;
		case 'YEN': case 'IENE': return 'JPY'; break;
		case 'FRANCO': return 'XOF'; break;
		case 'IUAN': return 'CNY'; break;
		case 'LIBRA': return 'LBP'; break;
		case 'PESO': return 'DOP'; break;
		case 'REAL': return 'BRL'; break;
		default: return $moeda; break;
	}
}
/**
 * Localiza um endereço no Google Maps
 * @param $endereco
 * @param $output json|html
 * @return string
 */
function buscar_endereco($endereco, $output='json') {
	$endereco.=' Brazil';
	$url = 'http://maps.google.com/maps/api/geocode/'.$output.'?address='.urlencode($endereco).'&sensor=false';
	$json = @file_get_contents($url);
	$data = json_decode($json);
	if (count($data)) {
		$request = array();
		foreach ($data->results as $result) {
			$address = NULL;
			$number	 = NULL;
			$block = NULL;
			$city = NULL;
			$state = NULL;
			$zip = NULL;
			foreach ($result->address_components as $setting) {
				switch(strtolower($setting->types[0])) {
					case "street_number" : $number = intval($setting->long_name); break;
					case "route": $address = trim($setting->long_name); break;
					case "sublocality" : $block = trim($setting->long_name); break;
					case "locality": $city = trim($setting->long_name); break;
					case "administrative_area_level_1": $state = trim($setting->short_name); break;
					case "postal_code": $zip = trim($setting->long_name); break;
				}
			}
			array_push($request, array(
				'endereco_numero' => $address.', '.$number,
				'endereco' => $address,
				'numero' => $number,
				'bairro' => $block,
				'cidade' => $city,
				'estado' => sigla_estado($state),
				'cep' => $zip,
				'full' => trim(str_replace("Brazil", "Brasil", $result->formatted_address))
			));
		}
		return $request;
	} else {
		return NULL;
	}
}
/**
 * Retorna a sigla de um estado brasileiro
 * @param $fullname string
 * @return string
 */
function sigla_estado($fullname) {
	$shortname = $fullname;
	switch ($fullname) {
		case 'Acre': $shortname = 'AC'; break;
		case 'Alagoas': $shortname = 'AL'; break;
		case 'Amapá': $shortname = 'AP'; break;
		case 'Amazonas': $shortname = 'CE'; break;
		case 'Bahia': $shortname = 'BA'; break;
		case 'Ceará': $shortname = 'CE'; break;
		case 'Distrito Federal': $shortname = 'DF'; break;
		case 'Espírito Santo': $shortname = 'ES'; break;	
		case 'Goiás': $shortname = 'GO'; break;
		case 'Maranhão': $shortname = 'MA'; break;
		case 'Mato Grosso': $shortname = 'MT'; break;
		case 'Mato Grosso do Sul': $shortname = 'MS'; break;
		case 'Minas Gerais': $shortname = 'MG'; break;
		case 'Pará': $shortname = 'PA'; break;
		case 'Paraíba': $shortname = 'PB'; break;
		case 'Paraná': $shortname = 'PR'; break;
		case 'Pernambuco': $shortname = 'PE'; break;
		case 'Piauí': $shortname = 'PI'; break;
		case 'Rio de Janeiro': $shortname = 'RJ'; break;
		case 'Rio Grande do Norte': $shortname = 'RN'; break;
		case 'Rio Grande do Sul': $shortname = 'RS'; break;
		case 'Rondônia': $shortname = 'RO'; break;
		case 'Roraima': $shortname = 'RR'; break;
		case 'Santa Catarina': $shortname = 'SC'; break;
		case 'São Paulo': $shortname = 'SP'; break;
		case 'Sergipe': $shortname = 'SE'; break;
		case 'Tocantins': $shortname = 'TO'; break;
	}
	return $shortname;
}
/**
 * Retorna um número por extenso
 * @param $float
 * @return string
 */
function valor_extenso($valor=0) {
	$singular = array("centavo", "real", "mil", "milhão", "bilhão", "trilhão", "quatrilhão");
	$plural = array("centavos", "reais", "mil", "milhões", "bilhões", "trilhões","quatrilhões");
	
	$c = array("", "cem", "duzentos", "trezentos", "quatrocentos","quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos");
	$d = array("", "dez", "vinte", "trinta", "quarenta", "cinquenta","sessenta", "setenta", "oitenta", "noventa");
	$d10 = array("dez", "onze", "doze", "treze", "quatorze", "quinze","dezesseis", "dezesete", "dezoito", "dezenove");
	$u = array("", "um", "dois", "três", "quatro", "cinco", "seis","sete", "oito", "nove");
	
	$rt = ""; $z = 0;
	
	$valor = number_format($valor, 2, ".", ".");
	$inteiro = explode(".", $valor);
	for($i=0;$i<count($inteiro);$i++)
		for($ii=strlen($inteiro[$i]);$ii<3;$ii++)
			$inteiro[$i] = "0".$inteiro[$i];
	
	// $fim identifica onde que deve se dar junção de centenas por "e" ou por "," ;) 
	$fim = count($inteiro) - ($inteiro[count($inteiro)-1] > 0 ? 1 : 2);
	for ($i=0;$i<count($inteiro);$i++) {
		$valor = $inteiro[$i];
		$rc = (($valor > 100) && ($valor < 200)) ? "cento" : $c[$valor[0]];
		$rd = ($valor[1] < 2) ? "" : $d[$valor[1]];
		$ru = ($valor > 0) ? (($valor[1] == 1) ? $d10[$valor[2]] : $u[$valor[2]]) : "";
		
		$r = $rc.(($rc && ($rd || $ru)) ? " e " : "").$rd.(($rd && $ru) ? " e " : "").$ru;
		$t = count($inteiro)-1-$i;
		$r .= $r ? " ".($valor > 1 ? $plural[$t] : $singular[$t]) : "";
		if ($valor == "000")$z++; elseif ($z > 0) $z--;
		if (($t==1) && ($z>0) && ($inteiro[0] > 0)) $r .= (($z>1) ? " de " : "").$plural[$t]; 
		if ($r) $rt = $rt . ((($i > 0) && ($i <= $fim) && ($inteiro[0] > 0) && ($z < 1)) ? ( ($i < $fim) ? ", " : " e ") : " ") . $r;
	}
	
	return empty($rt) ? "zero" : $rt;
}
/**
 * Retorna extensão de um arquivo
 * @param $filename string
 * @return string
 */
function get_ext($filename) {
	if(empty($filename)) return "";
	$filename = explode(".", $filename);
	$filename = end($filename);
	$filename = strtolower($filename);
	return $filename;
}
/**
 * Retorna os arquivos através de um diretório
 * @param $path string
 * @return array
 */
function get_files($path) {
	if ($handle = opendir($path)) {
		$files = array();
		while (false !== ($file = readdir($handle))) if($file != "." && $file != "..") if(!is_dir($file) && !empty($file)) array_push($files, $file);
		closedir($handle);
		return (count($files) > 0) ? $files : false;
	} else {
		return false;
	}
}
/**
 * Excluir diretório e todo seu conteúdo recursivamente
 * @param $directory string
 * @return boolean
 */
function remove_dir($directory) {
	if (substr($directory,-1) == "/") $directory = substr($directory,0,-1);
	if (!file_exists($directory) || !is_dir($directory)) { 
		return false; 
	} elseif(!is_readable($directory)) {
		return false; 
	} else {
		$directoryHandle = opendir($directory); 
		while(false !== ($file = readdir($directoryHandle))) { 
			if ($file != '.' && $file != '..') {
				$path = $directory . "/" . $file;
				if(is_dir($path)) remove_dir($path); else unlink($path);
        	}
    	}
    	closedir($directoryHandle); 
    	return rmdir($directory);
	}
}
/**
 * Atribuir permissões chmod recursivamente
 * @param $path string
 * @param $mode int permissão chmod
 * @return void
 */
function chmod_r($path, $mode=0777) {
	$d = dir($path);
	chmod($path, $mode); 
	while($file = $d->read()) {
		if($file == '.' || $file == '..' || substr($file, 0, 1) == '.') {
			continue;
		}
		$filename = $path.'/'.$file;
		chmod($filename, $mode);
		if (is_dir($filename)) {
			chmod_r($filename, $mode);
		}
	}
	$d->close();
}
/**
 * Formata link para embed youtube
 * @param $url string
 * @return string
 */
function formatar_youtube_url($url) {
	if (!is_url($url)) return "";
	if (strstr($url, 'youtube') && strstr($url, "?v=")) {
		$url = explode('?v=', $url);
		$url = trim($url[1]);
		$url = explode('&', $url);
		$url = trim($url[0]);
		return 'http://www.youtube.com/embed/'.$url;
	} else {
		return $url;
	}
}
/**
 * Retorna IP do visitante
 * @return string
 */
function get_ip() {
	$result = array();
	$variables = array('REMOTE_ADDR','HTTP_X_FORWARDED_FOR','HTTP_X_FORWARDED','HTTP_FORWARDED_FOR','HTTP_FORWARDED','HTTP_X_COMING_FROM','HTTP_COMING_FROM','HTTP_CLIENT_IP');
	foreach($variables as $variable) {
		$ip = @$_SERVER[$variable];
		if(!empty($ip)) array_push($result, $ip);
	}
	return $result;
}
/**
 * Calcula diferença entre as horas informadas
 * @param $hora1 time
 * @param $hora2 time
 * @return object {h,i,s}
 */
function calc_hora($hora1, $hora2) {
	$hora1 = explode(":",$hora1);
	$hora2 = explode(":",$hora2);
	$acumulador1 = ($hora1[0] * 3600) + ($hora1[1] * 60) + $hora1[2];
	$acumulador2 = ($hora2[0] * 3600) + ($hora2[1] * 60) + $hora2[2];
	$resultado = $acumulador2 - $acumulador1;
	$hora_ponto = floor($resultado / 3600);
	$resultado = $resultado - ($hora_ponto * 3600);
	$min_ponto = floor($resultado / 60);
	$resultado = $resultado - ($min_ponto * 60);
	$secs_ponto = $resultado;
	return (object) array('h'=>$hora_ponto,'i'=>$min_ponto,'s'=>$secs_ponto);
}
/**
 * Converte tipo array para o tipo object
 * @param $d array
 * @return object
 */
function array_to_object($d) {
	if (is_array($d)) {
		return (object) array_map(__FUNCTION__, $d);
	} else {
		return $d;
	}
}
/**
 * Converte tipo object para o tipo array
 * @param $d object
 * @return array
 */
function object_to_array($d) {
	if (is_object($d)) {
		$d = get_object_vars($d);
	}
	if (is_array($d)) {
		return array_map(__FUNCTION__, $d);
	} else {
		return $d;
	}
}
/**
 * Converte array para o formato json
 * @param $data array
 * @return string
 */
function parse_json($data) {
	return encode($data);
}
/**
 * Codifica array para o formato JSON
 * @param $data array
 * @return string
 */
function encode($data) {
	switch ($type = gettype($data)) {
		case 'NULL':
			return 'null';
		break;
		
		case 'boolean':
			return ($data ? 'true' : 'false');
		break;
		
		case 'integer':
		case 'double':
		case 'float':
			return $data;
		break;
		
		case 'string':
			return preg_match('/^function|this/', $data) ? $data : "'" .$data. "'";
		break;
		
		case 'object':
			$data = object_to_array($data);
			return encode($data);
		break;
		
		case 'array':
			$output_index_count = 0;
			$output_indexed = array();
			$output_associative = array();
			foreach ($data as $key => $value) {
				$output_indexed[] = encode($value);
				$output_associative[] = $key . ':' . encode($value);
				if ($output_index_count !== NULL && $output_index_count++ !== $key) {
					$output_index_count = NULL;
				}
			}
			if ($output_index_count !== NULL) {
				return '[' . implode(',', $output_indexed) . ']';
			} else {
				return '{' . implode(',', $output_associative) . '}';
			}
		break;
		
		default:
			return ''; // Not supported
		break;
	}
}
/**
 * Codifica uma string
 * @param $string string
 * @param $size int
 * @return string
 */
function encode_string($string, $size=250) {
	$string = hash('md5', $string);
	$string_len = strlen($string);
	if ($string_len > $size) $string = substr($string, 0, 0 - ($string_len - $size));
	return preg_replace("/[^a-zA-Z0-9]+/", "", $string);
}
/**
 * Codifica nome do arquivo
 * @param $string string
 * @param $size int
 * @return string
 */
function encode_filename($string, $size=250) {
	return encode_string($string, $size);
}
/**
 * Converte polegada -> pixel
 * @param $var float
 * @return float
 */
function convert_in_to_px($var) {
	$p = 96;
	if (!is_numeric($var)) return 0; 
	return round($var * $p);
}
/**
 * Converte pixel -> polegada
 * @param $var float
 * @return float
 */
function convert_px_to_in($var) {
	$p = 0.01041667;
	if (!is_numeric($var)) return 0; 
	return round($var * $p);
}
/**
 * Converte cm -> pixel
 * @param $var float
 * @return float
 */
function convert_cm_to_px($var) {
	$p = 37.795276;
	if (!is_numeric($var)) return 0; 
	return round($var * $p);
}
/**
 * Converte pixel -> cm
 * @param $var float
 * @return float
 */
function convert_px_to_cm($var) {
	$p = 0.02645833;
	if (!is_numeric($var)) return 0;
	return round($var * $p);
}
/**
 * Faz a leitura do arquivo csv e retorna array com o resultado
 * @param $filename string
 * @param $delimiter string
 * @param $skiprow int
 * @return array
 */
function read_csv($filename, $delimiter=";", $skiprow=0) {
	$filesize = filesize($filename);
	$handle = fopen($filename, "r");
	$data = array();
	$row = 1;
	while (!feof($handle)) {
		if ($skiprow) {
			if ($row != $skiprow) {
				array_push($data, fgetcsv($handle, $filesize, $delimiter));
			}
		} else {
			array_push($data, fgetcsv($handle, $filesize, $delimiter));
		}
		$row++;
	}
	fclose($handle);
	return $data;
}
/**
 * Retorna token da receita federal para consulta do CNPJ
 * @return string img html tag
 */
function get_receita_token() {
	$cookieFile = COOKIELOCAL.session_id();
	if (!file_exists($cookieFile)) {
		$file = fopen($cookieFile, 'w');
		fclose($file);
	}
	chmod($cookieFile, 0777);
	$ch = curl_init('http://www.receita.fazenda.gov.br/pessoajuridica/cnpj/cnpjreva/Cnpjreva_Solicitacao2.asp?cnpj=');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
	$html = curl_exec($ch);
	if (!$html) return false;
	$html = new simple_html_dom($html);
	$url_imagem = $tokenValue = '';
	$imgcaptcha = $html->find('img[id=imgcaptcha]');
	if (count($imgcaptcha)) {
		foreach ($imgcaptcha as $imgAttr) {
			$url_imagem = $imgAttr->src;
		}
		if (preg_match('#guid=(.*)$#', $url_imagem, $arr)) {
			$idCaptcha = $arr[1];
			$viewstate = $html->find('input[id=viewstate]');
			if (count($viewstate)) {
				foreach($viewstate as $inputViewstate) {
					$tokenValue = $inputViewstate->value;
				}
			}
			if(!empty($idCaptcha) && !empty($tokenValue)) {
				return array($idCaptcha, $tokenValue);
			} else {
				return false;
			}
		}
	}
}
/**
 * Faz a leitura da consulta do CNPJ na página da receita
 * @param $cnpj string
 * @param $captcha string
 * @param $token string
 * @return string
 */
function get_receita_html_cnpj($cnpj, $captcha, $token) {
	$cookieFile = COOKIELOCAL.session_id();
	if(!file_exists($cookieFile)) return false;
	$post = array(
		'origem' => 'comprovante',
		'search_type' => 'cnpj',
		'cnpj' => $cnpj,
		'captcha' => $captcha,
		'captchaAudio' => '',
		'submit1' => 'Consultar',
		'viewstate' => $token
	);
	$post = http_build_query($post, NULL, '&');
	$cookie = array('flag' => 1);
	$ch = curl_init('http://www.receita.fazenda.gov.br/pessoajuridica/cnpj/cnpjreva/valida.asp');
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
	curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
	curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
	curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:8.0) Gecko/20100101 Firefox/8.0');
	curl_setopt($ch, CURLOPT_COOKIE, http_build_query($cookie, NULL, '&'));
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
	curl_setopt($ch, CURLOPT_REFERER, 'http://www.receita.fazenda.gov.br/pessoajuridica/cnpj/cnpjreva/Cnpjreva_Solicitacao2.asp?cnpj=');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$html = curl_exec($ch);
	curl_close($ch);
	return $html;
}
/**
 * Retorna o tamanho do diretório
 * @param $path string
 * @return float
 */
function foldersize($path) {
	$total_size = 0;
	$files = scandir($path);
	$cleanPath = rtrim($path, '/'). '/';
	foreach($files as $t) {
		if($t == '.' || $t == '..' || substr($t, 0, 1) == '.') continue;
		$currentFile = $cleanPath.$t;
		if (is_dir($currentFile)) {
			$size = foldersize($currentFile);
			$total_size += $size;
		} else {
			$size = filesize($currentFile);
			$total_size += $size;
		}
    }
    return $total_size;
}
/**
 * Codifica string ou array para utf8
 * @param $dat string|array
 * @return string|array
 */
function utf8_encode_all($dat) {
	if (is_string($dat)) {
		return utf8_encode($dat);
	}
	if (!is_array($dat)) {
		return $dat;
	}
	$ret = array();
	foreach($dat as $i=>$d) {
		$ret[$i] = utf8_encode_all($d);
	}
	return $ret;
}
/**
 * Descodifica utf8 da string ou array
 * @param $dat array|object
 * @return array|object
 */
function utf8_decode_all($dat) {
	if (is_string($dat)) {
		return utf8_decode($dat);
	}
	if (!is_array($dat)) {
		return $dat;
	}
	$ret = array();
	foreach($dat as $i=>$d) {
		$ret[$i] = utf8_decode_all($d);
	}
	return $ret;
}
/**
 * Retorna se o arquivo existe remotamente através de uma url
 * @param string $url
 * @return boolean exist
 */
function file_remote_exists($url) {
	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_NOBODY, true);
	curl_exec($ch);
	$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);
    return $code == 200;
}
?>