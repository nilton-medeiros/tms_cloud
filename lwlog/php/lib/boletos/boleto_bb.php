<?php
// DADOS DO BOLETO PARA O SEU CLIENTE
$dias_de_prazo_para_pagamento = 0;
$taxa_boleto = 0;
$data_venc = $_GET['vencimento_em']; // Prazo de X dias OU informe data: "13/04/2006"; 
$valor_cobrado = $_GET['valor_documento']; // Valor - REGRA: Sem pontos na milhar e tanto faz com "." ou "," ou com 1 ou 2 ou sem casa decimal
$valor_cobrado = str_replace(",", ".",$valor_cobrado);
$valor_boleto = number_format($valor_cobrado+$taxa_boleto, 2, ',', '');

$dadosboleto["nosso_numero"] = utf8_decode($_GET['nosso_numero']); // Nosso numero - REGRA: M�ximo de 8 caracteres!
$dadosboleto["numero_documento"] = utf8_decode($_GET['numero_documento']); // Num do pedido ou nosso numero
$dadosboleto["data_vencimento"] = $data_venc; // Data de Vencimento do Boleto - REGRA: Formato DD/MM/AAAA
$dadosboleto["data_documento"] = $_GET['emitido_em']; // Data de emiss�o do Boleto
$dadosboleto["data_processamento"] = $_GET['emitido_em']; // Data de processamento do boleto (opcional)
$dadosboleto["valor_boleto"] = $valor_boleto; 	// Valor do Boleto - REGRA: Com v�rgula e sempre com duas casas depois da virgula

// DADOS DO SEU CLIENTE
$dadosboleto["sacado"] = utf8_decode($_GET['sacado']);
$dadosboleto["endereco1"] = utf8_decode($_GET['endereco1']);
$dadosboleto["endereco2"] = "";

// INFORMACOES PARA O CLIENTE
$dadosboleto["demonstrativo1"] = utf8_decode($_GET['demonstrativo1']);
$dadosboleto["demonstrativo2"] = utf8_decode($_GET['demonstrativo2']);
$dadosboleto["demonstrativo3"] = utf8_decode($_GET['demonstrativo3']);

$dadosboleto["instrucoes1"] = "";
$dadosboleto["instrucoes2"] = "";
$dadosboleto["instrucoes3"] = "";
$dadosboleto["instrucoes4"] = "Em caso de d�vidas entre em contato conosco: ".$_GET['contratado_email'];

$perc_juros = $_GET['perc_juros'];
$perc_desconto = $_GET['perc_desconto'];
$perc_acrescimo = $_GET['perc_acrescimo'];
$perc_juros_tipo = $_GET['perc_juros_tipo'];

if ($perc_acrescimo != "0") {
	$dadosboleto["instrucoes1"] = "Ap�s vencimento cobrar ".$perc_acrescimo."% de multa por atraso.";
}
if ($perc_juros != "0" && $perc_juros_tipo != "sem juros") {
	$dadosboleto["instrucoes2"] = "Ap�s vencimento cobrar juros de mora de ".$perc_juros."% ".$perc_juros_tipo.".";
}
if ($perc_desconto != "0") {
	$dadosboleto["instrucoes3"] = "Antes do vencimento considerar ".$perc_desconto."% de desconto.";
}

// DADOS OPCIONAIS DE ACORDO COM O BANCO OU CLIENTE
$dadosboleto["quantidade"] = "";
$dadosboleto["valor_unitario"] = "";
$dadosboleto["aceite"] = "";		
$dadosboleto["especie"] = "R$";
$dadosboleto["especie_doc"] = "";


// ---------------------- DADOS FIXOS DE CONFIGURA��O DO SEU BOLETO --------------- //


// DADOS DA SUA CONTA - BANCO DO BRASIL
$dadosboleto["agencia"] = $_GET['agencia']; // Num da agencia, sem digito
$dadosboleto["conta"] = $_GET['conta'];	// Num da conta, sem digito

// DADOS PERSONALIZADOS - BANCO DO BRASIL
$dadosboleto["convenio"] = "7777777";  // Num do conv�nio - REGRA: 6 ou 7 ou 8 d�gitos
$dadosboleto["contrato"] = "999999"; // Num do seu contrato
$dadosboleto["carteira"] = "18";
$dadosboleto["variacao_carteira"] = "-019";  // Varia��o da Carteira, com tra�o (opcional)

// TIPO DO BOLETO
$dadosboleto["formatacao_convenio"] = "7"; // REGRA: 8 p/ Conv�nio c/ 8 d�gitos, 7 p/ Conv�nio c/ 7 d�gitos, ou 6 se Conv�nio c/ 6 d�gitos
$dadosboleto["formatacao_nosso_numero"] = "2"; // REGRA: Usado apenas p/ Conv�nio c/ 6 d�gitos: informe 1 se for NossoN�mero de at� 5 d�gitos ou 2 para op��o de at� 17 d�gitos

/*
#################################################
DESENVOLVIDO PARA CARTEIRA 18

- Carteira 18 com Convenio de 8 digitos
  Nosso n�mero: pode ser at� 9 d�gitos

- Carteira 18 com Convenio de 7 digitos
  Nosso n�mero: pode ser at� 10 d�gitos

- Carteira 18 com Convenio de 6 digitos
  Nosso n�mero:
  de 1 a 99999 para op��o de at� 5 d�gitos
  de 1 a 99999999999999999 para op��o de at� 17 d�gitos

#################################################
*/

// SEUS DADOS
$dadosboleto["identificacao"] = "";
$dadosboleto["cpf_cnpj"] = "";
$dadosboleto["endereco"] = "";
$dadosboleto["cidade_uf"] = "";
$dadosboleto["cedente"] = "";

// N�O ALTERAR!
include("include/funcoes_bb.php"); 
include("include/layout_bb.php");
?>
