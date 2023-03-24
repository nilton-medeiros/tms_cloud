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

-- Copiando estrutura para tabela tmscte_lwlog.empresas
CREATE TABLE IF NOT EXISTS `empresas` (
  `emp_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `emp_razao_social` varchar(60) NOT NULL,
  `emp_nome_fantasia` varchar(60) NOT NULL,
  `emp_sigla_cia` varchar(3) NOT NULL,
  `emp_cnpj` char(14) NOT NULL,
  `emp_inscricao_estadual` char(14) NOT NULL COMMENT 'Todo emitente tem que ter I.E.',
  `emp_inscricao_municipal` char(14) DEFAULT NULL,
  `emp_logradouro` varchar(60) NOT NULL,
  `emp_numero` varchar(20) NOT NULL,
  `emp_complemento` varchar(60) DEFAULT NULL,
  `emp_bairro` varchar(60) NOT NULL,
  `emp_cep` char(8) NOT NULL,
  `cid_id_fk` int(11) unsigned NOT NULL COMMENT 'FK cid_id tabela Cidades',
  `emp_fone1` varchar(15) NOT NULL COMMENT 'Uso Sefaz - Só número de 7 à 12 (Ex: 11991320027)',
  `emp_fone2` varchar(15) DEFAULT NULL,
  `emp_tipo_emitente` enum('CTE','AWB','ND') NOT NULL DEFAULT 'CTE' COMMENT 'Identifica o tipo de emitente',
  `emp_modal` enum('Aereo','Rodoviario','Ambos') NOT NULL DEFAULT 'Aereo' COMMENT 'Tipo de modal homologado para a empresa emitente junto a Sefaz',
  `emp_simples_nacional` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Empresa optante pelo Simples Nacional?',
  `emp_PIS` decimal(6,2) unsigned NOT NULL DEFAULT '0.00',
  `emp_COFINS` decimal(6,2) unsigned NOT NULL DEFAULT '0.00',
  `emp_RNTRC` char(8) DEFAULT NULL COMMENT 'Registro Nacional de Transporte Rodoviário de Cargas (Expressão Regular: [0-9]{8}|ISENTO)',
  `emp_ativa` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `emp_cte_modelo` char(2) NOT NULL DEFAULT '57',
  `emp_cte_serie` smallint(3) unsigned zerofill NOT NULL DEFAULT '000',
  `emp_versao_layout_xml` decimal(4,2) unsigned DEFAULT '2.00' COMMENT 'Quando empresa emitente de CT-e (emp_tipo_emitente=''CTE''), especificar qual versão ativa do leiaute do XML em uso na Sefaz.',
  `emp_dacte_layout` enum('RETRATO','PAISAGEM') NOT NULL DEFAULT 'RETRATO',
  `emp_seguradora` varchar(60) DEFAULT NULL COMMENT 'Dados obrigatórios apenas no Modal Rodoviário, depois da lei 11.442/07, para os demais modais são opcionais.',
  `emp_apolice` varchar(20) DEFAULT NULL,
  `emp_taxa_min_nac` decimal(6,2) unsigned NOT NULL DEFAULT '0.00' COMMENT 'Taxa Mínima Nacional para essa empresa, usada como delimitador entre bijuterias e outros no cálculo do advalorem (seguro).',
  `emp_email_contabil` varchar(250) DEFAULT NULL,
  `emp_email_comercial` varchar(250) DEFAULT NULL,
  `emp_email_CCO` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Envia e-mail com cópia oculta',
  `emp_enviar_cte` enum('XML','PDF','Ambos') NOT NULL DEFAULT 'Ambos',
  `emp_logotipo` varchar(180) DEFAULT NULL,
  `emp_aba_prod_perig` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Mostrar/Ocultar Aba Produtos Perigosos',
  `emp_aba_doc_trans_ant` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Mostrar/Ocutar Aba Doc. de Transp. Ant.',
  `emp_aba_veic_novos` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Mostrar/Ocultar Aba Veículos Novos',
  `emp_aba_vale_pedagio` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Mostrar/Ocultar Aba Vale Pedágio',
  `emp_aba_veiculos` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Mostrar/Ocultar Aba Veículos',
  `emp_aba_motoristas` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Mostrar/Ocultar Aba Motoristas',
  `emp_enabled_local_coleta` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Habilita/Desabilita a edição do campo Local de Coleta na aba Dados-CT-e em digitação do CT-e.',
  `emp_enabled_expedidor` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Habilita/Desabilita a edição do campo Expedidor na aba Dados-CT-e em digitação do CT-e.',
  `emp_enabled_recebedor` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Habilita/Desabilita a edição do campo Recebedor na aba Dados-CT-e em digitação do CT-e.',
  `emp_enabled_local_entrega` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT 'Habilita/Desabilita a edição do campo Local de Entrega na aba Dados-CT-e em digitação do CT-e.',
  `emp_faturamento` enum('DECENDIAL','SEMANAL','QUINZENAL','MENSAL') NOT NULL,
  `emp_dias_vecto` tinyint(2) unsigned zerofill NOT NULL DEFAULT '11' COMMENT 'Quantidade de dias corridos para o vencimento do boleto após última data do período. O vencimento não pode ser menor que a data de emissão do boleto.',
  `emp_ambiente_sefaz` tinyint(1) unsigned NOT NULL DEFAULT '2' COMMENT 'Tipo do Ambiente (webservice) na SeFaz: 1 - Produção; 2 - Homologação',
  `emp_webservice_codigo` int(10) unsigned DEFAULT NULL COMMENT 'Código da empresa no Webservice do parceiro',
  `emp_webservice_chave` varchar(100) DEFAULT NULL COMMENT 'Chave de acesso da empresa no Webservice do parceiro',
  `emp_smtp_servidor` varchar(250) DEFAULT NULL COMMENT 'Servidor de saída de emails (SMTP)',
  `emp_smtp_pass` varchar(100) DEFAULT NULL COMMENT 'Senha do SMTP (Alguns servidores tem senha diferente do login do email)',
  `emp_smtp_email` varchar(100) DEFAULT NULL COMMENT 'SMTP e-mail para envio',
  `emp_smtp_login` varchar(100) DEFAULT NULL COMMENT 'Nome/e-mail de usuário para o login de envio',
  `emp_smtp_senha` varchar(100) DEFAULT NULL COMMENT 'Senha do e-mail para envio',
  `emp_smtp_porta` smallint(5) unsigned DEFAULT NULL COMMENT 'Porta: Servidor de saída (SMTP)',
  `emp_smtp_autentica` tinyint(1) unsigned NOT NULL DEFAULT '1' COMMENT 'Servidor de saída (SMTP) requer autenticação',
  `emp_ftp_host` varchar(250) DEFAULT NULL COMMENT 'Servidor host (FTP) para baixar os PDF das DACTE',
  `emp_ftp_user` varchar(250) DEFAULT NULL COMMENT 'Usuário (FTP)',
  `emp_ftp_password` varchar(100) DEFAULT NULL COMMENT 'Senha (FTP)',
  `emp_ftp_protocol` enum('FTP','SFTP') DEFAULT 'FTP' COMMENT 'FTP - Protocolo de Transferência de Arquivos ou SFTP - SSH File Transfer Protocol',
  `emp_tipo_calculo_cubagem` enum('AEREO','RODOVIARIO') NOT NULL DEFAULT 'AEREO' COMMENT 'Tipo de cálculo para cubagem: Aéreo (divide por 6000) ou rodoviário (divide por 300)',
  `emp_portal` varchar(250) DEFAULT NULL COMMENT 'Portal de consultas pelo cliente sobre sua carga',
  `emp_margem_lucro_min` tinyint(2) unsigned NOT NULL DEFAULT '0' COMMENT 'Percentual mínimo da margem de lucro na operação (cotação)',
  `emp_margem_lucro_padrao` tinyint(2) unsigned NOT NULL DEFAULT '0' COMMENT 'Percentual padrão (default) da margem de lucro na operação (cotação)',
  `emp_gmail1_login` varchar(100) DEFAULT NULL COMMENT 'GMail alternativo de desvio de regras spam para uso do PrintCTE até 100 e-mails/dia',
  `emp_gmail1_senha` varchar(100) DEFAULT NULL COMMENT 'Senha da conta GMail',
  `emp_gmail2_login` varchar(100) DEFAULT NULL COMMENT 'GMail alternativo de desvio de regras spam para uso do PrintCTE até 100 e-mails/dia',
  `emp_gmail2_senha` varchar(100) DEFAULT NULL COMMENT 'Senha da conta GMail',
  `emp_plano_contratado` int(10) unsigned DEFAULT NULL COMMENT 'Plano contratado Sistrom por mês',
  `emp_valor_contratado` decimal(10,2) unsigned DEFAULT '0.00' COMMENT 'Valor contratado Sistrom por mês',
  `utc` char(6) NOT NULL DEFAULT '-03:00' COMMENT 'TimeZone da Sefaz utilizada',
  `remote_file_path` varchar(2000) DEFAULT NULL COMMENT 'Caminho da pasta remota dos arquivos xml e pdf no servidor',
  `edi_caixa_postal` varchar(35) DEFAULT NULL COMMENT 'EDI Padrão Proceda - Caixa postal do Remetente (Emissor)',
  `emp_cadastrado_por` int(10) unsigned DEFAULT NULL,
  `emp_cadastrado_em` datetime NOT NULL,
  `emp_alterado_por` int(10) unsigned DEFAULT NULL,
  `emp_alterado_em` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `emp_versao` smallint(5) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`emp_id`),
  UNIQUE KEY `emp_sigla_cia` (`emp_sigla_cia`),
  KEY `FK_empresas_cidades_cid_id` (`cid_id_fk`),
  KEY `FK_usuarios_emp_cadastrado_por` (`emp_cadastrado_por`),
  KEY `FK_usuarios_emp_alterado_por` (`emp_alterado_por`),
  CONSTRAINT `FK_empresas_cidades_cid_id` FOREIGN KEY (`cid_id_fk`) REFERENCES `cidades` (`cid_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_usuarios_emp_alterado_por` FOREIGN KEY (`emp_alterado_por`) REFERENCES `usuarios` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_usuarios_emp_cadastrado_por` FOREIGN KEY (`emp_cadastrado_por`) REFERENCES `usuarios` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COMMENT='Cadastro de empresas do sistema multi-empresas TMS Cloud';

-- Exportação de dados foi desmarcado.

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
