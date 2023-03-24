<?php
class Mailer extends PHPMailer {
	public $to;
	public $cc;
	public $bcc;
	public $message;
	public $calendarName;
	private $events = array();
	
	function __construct() {
		$this->SetLanguage('br');
		
		$this->Host = MAILER_HOST;
		$this->Username = MAILER_EMAIL;
		$this->Password = MAILER_PASS;
		$this->From = MAILER_EMAIL;
		$this->FromName = MAILER_NAME;
		$this->Port = 587;
		
		if ($App = App::$instance) {
			$empresa = $App->pegar_empresa();
			if ($empresa->emp_smtp_porta > 0 && !empty($empresa->emp_smtp_servidor) && !empty($empresa->emp_smtp_senha) && !empty($empresa->emp_smtp_login) && !empty($empresa->emp_smtp_email)) {
				$this->Host = $empresa->emp_smtp_servidor;
				$this->Password = $empresa->emp_smtp_senha;
				$this->Username = $empresa->emp_smtp_login;
				$this->From = $empresa->emp_smtp_email;
				$this->Port = $empresa->emp_smtp_porta;
			}
			$this->FromName = $empresa->emp_razao_social;
		}
	}
	
	function addEvent($start, $end, $summary="", $description="", $location="") {
		array_push($this->events, array(
			"start" => $start,
			"end"   => $end,
			"summary" => $summary,
			"description" => $description,
			"location" => $location
		));
	}

	function attachmentEvent($output = true) {
		$this->calendarName = str_replace(array("/","(",")","\\"), "", $this->calendarName);
		//Add header
		$ics ="BEGIN:VCALENDAR\n";
		$ics.="METHOD:PUBLISH\n";
		$ics.="VERSION:2.0\n";
		$ics.="X-WR-CALNAME:".PROJECT."\n";
		$ics.="PRODID:".PROJECT."\n";
		//Add events
		foreach($this->events as $event){
			$ics.="BEGIN:VEVENT\n";
			$ics.="UID:". md5(uniqid(mt_rand(), true)) ."@".$_SERVER['SERVER_NAME']."\n";
			$ics.="DTSTAMP:" . date('Ymd\THis') . "Z\n";
			$ics.="DTSTART:".date_convert($event["start"], "Ymd\THis")."Z\n";
			$ics.="DTEND:".date_convert($event["end"], "Ymd\THis")."Z\n";
			$ics.="SUMMARY:".str_replace("\n", "\\n", $event['summary'])."\n";
			$ics.="DESCRIPTION:".str_replace("\n", "\\n", $event['description'])."\n";
			$ics.="LOCATION:".str_replace("\n", "\\n", $event['location'])."\n";
			$ics.="END:VEVENT\n";
		}
		$ics.="END:VCALENDAR";
		if ($output) {
			$filename = $this->calendarName.'.ics';
			if (file_exists($filename)) {
				@unlink($filename);
			}
			$fp = fopen($filename, 'w+');
			fwrite($fp, $ics);
			fclose($fp);
			return $this->AddAttachment($filename);
		} else {
			return $ics;
		}
	}

	function send() {
		$this->SMTPAuth = true;
		$this->IsHTML(true);
		$this->IsSMTP();
		$this->ClearAllRecipients();
		
		if(!empty($this->to)) {
			if (!is_array($this->to)) {
				$this->to = explode(";", $this->to);
			}
			if (count($this->to)) {
				$this->to = array_unique($this->to);
				foreach ($this->to as $email) {
					if (is_email($email)) {
						$this->AddAddress($email);
					}
				}
			}
		}
		
		if(!empty($this->cc)) {
			if (!is_array($this->cc)) {
				$this->cc = explode(";", $this->cc);
			} 
			if (count($this->cc)) {
				$this->cc = array_unique($this->cc);
				foreach ($this->cc as $email) {
					$checked = is_email($email);
					if (is_array($this->to)) {
						$checked = !in_array($email, $this->to);
					}
					if ($checked) {
						$this->AddCC($email);
					}
				}
			}
		}
		
		if(!empty($this->bcc)) {
			if (!is_array($this->bcc)) {
				$this->bcc = explode(";", $this->bcc);
			}
			if (count($this->bcc)) {
				$this->bcc = array_unique($this->bcc);
				foreach ($this->bcc as $email) {
					$checked = is_email($email);
					if (is_array($this->to)) {
						$checked = !in_array($email, $this->to);
					}
					if (is_array($this->cc)) {
						$checked = !in_array($email, $this->cc);
					}
					if ($checked) {
						$this->AddBCC($email);
					}
				}
			}
		}
		
		if (empty($this->Body) && !empty($this->message)) {
			$this->Body ='<html>';
			$this->Body.='<head>';
			$this->Body.='<title>'.$this->Subject.' - '.SITE_TITLE.'</title>';
			$this->Body.='<style type="text/css">';
			$this->Body.='*{';
			$this->Body.='font-family: "Segoe UI", "Segoe UI Web Regular", "Segoe UI Symbol", "Helvetica Neue", "BBAlpha Sans", "S60 Sans", Arial, sans-serif;';
			$this->Body.='font-size: 11pt;';
			$this->Body.='font-weight: 300;';
			$this->Body.='line-height: 20px;';
			$this->Body.='}';
			$this->Body.='a, .link {color: #2e92cf; text-decoration: none;}';
			$this->Body.='a:hover, .link:hover {color: rgba(45, 173, 237, 0.8);}';
			$this->Body.='a:active, .link:active {color: rgba(45, 173, 237, 0.6);}';
			$this->Body.='</style>';
			$this->Body.='</head>';
			$this->Body.='<body>';
			$this->Body.='<span style="font-family: \'Segoe UI\', \'Segoe UI Web Regular\', \'Segoe UI Symbol\', \'Helvetica Neue\', \'BBAlpha Sans\', \'S60 Sans\', Arial, sans-serif; font-size: 11pt; font-weight: 300; line-height: 20px;">';
			$this->Body.= $this->message;
			$this->Body.='</span>';
			$this->Body.='</body>';
			$this->Body.='</html>';
		}
		
		if (!$this->_Send()) {
			if (!empty($this->ErrorInfo)) {
				throw new ExtJSException($this->ErrorInfo);
			}
			return false;
		}
		
		if (file_exists($this->calendarName.'.ics')) {
			@unlink($this->calendarName.'.ics');
		}
		
		return true;
	}
}
?>