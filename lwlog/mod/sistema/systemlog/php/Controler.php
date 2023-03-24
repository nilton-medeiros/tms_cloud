<?php
class Controler extends App {
	/**
	 * Consultar log do sistema. Uso exclusivo do componente Grade
	 * @remotable
	 * @access public
	 * @return output (json)
	 */
	function read_log() {
		$p = $this->get_sql_param();
		
		$filter	= "WHERE 1";
		$filter.= $p->filter;
		
		$sql = "SELECT * FROM system_log ".$filter;
		if (!empty($p->sort)) {
			$sql.= " ORDER BY ".$p->sort;
		}
		if (!empty($p->limit)) {
			$sql.= " LIMIT ".$p->start.",".$p->limit;
		}
		
		$query = $this->query($sql); $list = array();
		while ($field = $this->fetch_object($query)) {
			array_push($list, $field);
		}
		$this->free_result($query);
		
		$sql = "SELECT COUNT(sys_log_id) AS total FROM system_log ".$filter;
		$query = $this->query($sql);
		$total = $this->fetch_object($query)->total;
		$this->free_result($query);
		
		print json_encode(array('total'=>$total,'data'=>$list));
	}
	
	function read_file() {
		$filename = LOG.$_POST['file'];
		if (!file_exists($filename)) {
			print '<p>Arquivo não encontrado</p>';
			return false;
		}
		$handle = fopen($filename, "r");
		$contem = @fread($handle, filesize($filename));
		$contem = nl2br($contem);
		fclose($handle);
		print $contem;
	}
	
	function clear_file() {
		$filename = LOG.$_POST['file'];
		@unlink($filename);
		$handle = fopen($filename, "w+");
		fclose($handle);
		print json_encode(array('success'=>file_exists($filename)));
	}
}
?>