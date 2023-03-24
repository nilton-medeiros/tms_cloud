-- --------------------------------------------------------
-- Servidor:                     tmscte_lwlog.l70dnn0097.mysql.dbaas.com.br
-- Versão do servidor:           5.6.36-82.0-log - Percona Server (GPL), Release 82.0, Revision 58e846a
-- OS do Servidor:               Linux
-- HeidiSQL Versão:              11.3.0.6337
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Copiando estrutura para tabela tmscte_lwlog.clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `clie_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `clie_categoria` tinyint(1) unsigned NOT NULL DEFAULT '4' COMMENT '0 - Remetente, 1 - Expedidor, 2 - Recebedor, 3 - Destinatário, 4 - Todos, 5 - Representante',
  `clie_ativo` tinyint(1) unsigned NOT NULL DEFAULT '1' COMMENT '0 - Inativo ou inválido, 1 - Ativo  (0 - Inválido qdo algum campo está inconsistente pq foi importado do Expresso Air Cargo)',
  `clie_tipo_documento` enum('CNPJ','CPF') NOT NULL DEFAULT 'CNPJ' COMMENT 'CNPJ para Jurídica ou Governamental e CPF para física',
  `emp_id` int(10) unsigned DEFAULT NULL COMMENT 'Empresa a que esse cliente pertence ou NULL para compartilhar esse cliente para todas as empresas',
  `clie_razao_social` varchar(60) NOT NULL,
  `clie_nome_fantasia` varchar(60) DEFAULT NULL,
  `clie_tipo_estabelecimento` enum('COMERCIAL','TRANSPORTADORA','INDÚSTRIA','COMUNICAÇÕES','ENERGIA ELÉTRICA','PRODUTOR RURAL','PESSOA FÍSICA') NOT NULL DEFAULT 'COMERCIAL',
  `clie_cnpj` char(14) DEFAULT NULL COMMENT 'Não se aplica quando cliente for pessoa física (clie_tipo_documento = ''CPF'')',
  `clie_ie_isento` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Caso o cliente não for pessoa física e for isento de inscrição, o campo IE será NULL.',
  `clie_inscr_estadual` varchar(14) DEFAULT NULL COMMENT 'Não se aplica quando pessoa física (clie_tipo_documento = ''CPF'')',
  `clie_inscr_municipal` varchar(14) DEFAULT NULL COMMENT 'Não se aplica quando pessoa física (clie_tipo_documento = ''CPF'')',
  `clie_contrib_icms` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Cliente contribuinte de ICMS (sim ou não)',
  `clie_cpf` char(11) DEFAULT NULL COMMENT 'Não se aplica quando pessoa jurídica ou governamental (clie_tipo_documento = ''CNPJ'')',
  `clie_rg` char(11) DEFAULT NULL COMMENT 'Não se aplica quando jurídica ou governamental (clie_tipo_documento = ''CNPJ'')',
  `clie_situacao_cadastral` varchar(20) DEFAULT NULL COMMENT 'Situação Cadastral perante a Receita Federal',
  `clie_logradouro` varchar(60) NOT NULL,
  `clie_numero` varchar(20) NOT NULL,
  `clie_complemento` varchar(60) DEFAULT NULL,
  `clie_bairro` varchar(60) NOT NULL,
  `clie_cep` char(8) NOT NULL,
  `cid_id` int(10) unsigned NOT NULL,
  `clie_fone1` varchar(15) DEFAULT NULL COMMENT 'Uso Sefaz só número de 7 a 12 dígitos',
  `clie_fone2` varchar(15) DEFAULT NULL COMMENT 'Fax, celular ou outro',
  `clie_seguradora` varchar(60) DEFAULT NULL,
  `clie_apolice` varchar(20) DEFAULT NULL,
  `clie_forma_aplicar_seguro` enum('Nenhum','Intra/Inter Estadual','Ad valorem Tipo 1 e 2','Taxa RCTR-C') NOT NULL DEFAULT 'Nenhum' COMMENT 'Forma de aplicar o Ad Valorem/Seguro: Nenhum; Intra/Inter Estadual; Ad valorem Tipo 1 e 2; ou Taxa RCTR-C',
  `clie_seguro_desconto` decimal(7,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '% de desconto sobre o seguro/Advalorem',
  `clie_seguro_intra_estadual` decimal(8,6) unsigned NOT NULL DEFAULT '0.000000' COMMENT '% aplicado no cálculo do seguro/Advalorem quando for dentro do Estado',
  `clie_seguro_inter_estadual` decimal(8,6) unsigned NOT NULL DEFAULT '0.000000' COMMENT '% aplicado no cálculo do seguro/Advalorem quando for fora do Estado',
  `clie_seguro_adval_tipo_1` decimal(8,6) unsigned NOT NULL DEFAULT '0.000000' COMMENT '% aplicado no cálculo do seguro/Advalorem quando o Advalorem for tipo 1',
  `clie_seguro_adval_tipo_2` decimal(8,6) unsigned NOT NULL DEFAULT '0.000000' COMMENT '% aplicado no cálculo do seguro/Advalorem quando o Advalorem for tipo 2',
  `clie_tom_aceita_frete_pago` tinyint(1) unsigned NOT NULL DEFAULT '1' COMMENT 'Quando esse cliente for o tomador, aceita forma pagto "PAGO"',
  `clie_tom_aceita_frete_a_pagar` tinyint(1) unsigned NOT NULL DEFAULT '1' COMMENT 'Quando esse cliente for o tomador, aceita forma pagto "A PAGAR" e se o destinatário também aceitar essa forma de pagamento "A PAGAR".',
  `clie_tom_aceita_frete_outros` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Quando esse cliente for o tomador, aceita forma pagto "OUTROS"',
  `clie_tom_aceita_suframa` tinyint(1) unsigned NOT NULL DEFAULT '1' COMMENT 'Quando este cliente for o tomador e o município de destino cobra Suframa,  verifica se para este cliente aceita cálculo suframa ou não.',
  `clie_tom_tabela` enum('NACIONAL','ESPECIAL','MINIMA','EXPRESSO') NOT NULL DEFAULT 'NACIONAL' COMMENT 'Quando esse cliente for o tomador de serviços (pagador), qual tabela ele usa.',
  `clie_tom_taxa_sefaz` tinyint(1) unsigned NOT NULL DEFAULT '3' COMMENT 'Quando este cliente for o tomador e município destino cobra taxa Sefaz, verifica opções no cliente 1=Multiplicar taxa pela qtde NF, 2=Não multiplicar, valor cheio, 3-Não cobrar, não calcular.',
  `clie_des_aceita_frete_a_pagar` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Quando este cliente for o destinatário, aceita forma de pagto "A PAGAR", frete a cobrar/FOB?',
  `clie_des_inscricao_suframa` varchar(9) DEFAULT NULL COMMENT 'Inscrição na Suframa: Quando este cliente for o destinatário, obrigatório nas operações com as áreas com benefícios de incentivos fiscais sob controle da SUFRAMA.',
  `clie_codigo_transporte` varchar(20) DEFAULT NULL COMMENT 'Código de Transporte Aéreo ou Rodoviário (Alguns clientes de agentes como Alexpress possuem esse código e é usado na fatura, EDI, etc.',
  `rota_id` mediumint(8) unsigned DEFAULT NULL COMMENT 'Rota de entrega se houver para o destinatário',
  `clie_sequencia_rota` smallint(5) unsigned DEFAULT NULL COMMENT 'Informar a sequência na Rota quando definido rota de entrega para o destinatário',
  `clie_codigo_antigo` char(15) DEFAULT NULL COMMENT 'Código antigo do cliente qdo registro importado do Expresso Air Cargo. (Compatibilidade para importação dos CTes importados)',
  `clie_gris_percentual` decimal(6,2) unsigned NOT NULL DEFAULT '0.00' COMMENT 'Aliquota de seguro que tem por finalidade cobrir os custos específicos decorrentes das medidas de combate ao roubo de cargas,',
  `clie_gris_valor_minimo` decimal(8,2) unsigned NOT NULL DEFAULT '0.00' COMMENT 'Valor Mínimo para GRIS qdo houver Aliquota',
  `clie_login` varchar(15) DEFAULT NULL COMMENT 'Login de acesso a consulta via web de seus CTEs qdo este cliente for tomador',
  `clie_senha` varchar(15) DEFAULT NULL COMMENT 'Senha de acesso a consulta via web de seus CTEs qdo este cliente for tomador',
  `clie_lista_emails_ocorrencias` text COMMENT 'Lista de emails para receberem ocorrências da nota fiscal',
  `edi_caixa_postal` varchar(35) DEFAULT NULL COMMENT 'EDI Padrão Proceda - Caixa postal do Destinatário',
  `edi_conemb` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'EDI Padrão Proceda - Conhecimentos Embarcados',
  `edi_notfis` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'EDI Padrão Proceda - Notas Fiscais Emitidas',
  `edi_ocorren` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'EDI Padrão Proceda - Ocorrências na entrega',
  `edi_doccob` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'EDI Padrão Proceda - Documentos de Cobrança (Faturamento do Contas Receber)',
  `edi_ftp_url` varchar(300) DEFAULT NULL COMMENT 'EDI - URL do FTP neste cliente',
  `edi_ftp_server` varchar(300) DEFAULT NULL COMMENT 'EDI - Servidor de FTP',
  `edi_ftp_user_id` varchar(300) DEFAULT NULL COMMENT 'EDI - Login do FTP',
  `edi_ftp_password` varchar(300) DEFAULT NULL COMMENT 'EDI - Senha do FTP',
  `edi_ftp_remote_path` varchar(300) DEFAULT NULL COMMENT 'EDI - Path de destino para o upload do arquivo (public_html/...)',
  `clie_cadastrado_por` int(10) unsigned DEFAULT NULL,
  `clie_cadastrado_em` datetime NOT NULL,
  `clie_alterado_por` int(10) unsigned DEFAULT NULL,
  `clie_alterado_em` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `clie_versao` smallint(5) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`clie_id`),
  KEY `fk_clientes_cidades_cid_id` (`cid_id`),
  KEY `fk_clientes_empresas_emp_id` (`emp_id`),
  KEY `fk_clientes_rotas_entregas_rota_id` (`rota_id`),
  KEY `FK_usuarios_clie_cadastrado_por` (`clie_cadastrado_por`),
  KEY `FK_usuarios_clie_alterado_por` (`clie_alterado_por`),
  CONSTRAINT `FK_usuarios_clie_alterado_por` FOREIGN KEY (`clie_alterado_por`) REFERENCES `usuarios` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_usuarios_clie_cadastrado_por` FOREIGN KEY (`clie_cadastrado_por`) REFERENCES `usuarios` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_clientes_cidades_cid_id` FOREIGN KEY (`cid_id`) REFERENCES `cidades` (`cid_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_clientes_empresas_emp_id` FOREIGN KEY (`emp_id`) REFERENCES `empresas` (`emp_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_clientes_rotas_entregas_rota_id` FOREIGN KEY (`rota_id`) REFERENCES `rotas_entregas` (`rota_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4699 DEFAULT CHARSET=utf8 COMMENT='Tabela de clientes pessoas Física, Jurídica e Governamental';

-- Exportação de dados foi desmarcado.

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
