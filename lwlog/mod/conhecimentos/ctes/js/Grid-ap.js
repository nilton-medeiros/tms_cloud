Ext.define('CTE.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.ctesgrid',
	
	initComponent: function() {
		var me = this, statusRenderer = function(value, metaData, record) {
			switch (record.get('cte_situacao')) {
				case 'AUTORIZADO': 
				case 'ME EMITIDA':metaData.tdCls = 'bluecol'; break;
				case 'VALIDADO': metaData.tdCls = 'yellowcol'; break;
				case 'TRANSMITIDO': metaData.tdCls = 'greencol'; break;
				case 'REJEITADO':
				case 'DENEGADO': metaData.tdCls = 'redcol'; break;
				case 'CANCELADO': metaData.tdCls = 'graycol'; break;
				case 'INUTILIZADO':
				case 'INUTILIZAR':
				case 'SUBSTITUÍDO':
				case 'ANULADO': metaData.tdCls = 'orangecol'; break;
			}
			metaData.tdAttr = 'data-qtip="Número: ' + record.get('cte_numero') + ' / Minuta: ' + record.get('cte_minuta') + '<br/>' + record.get('cte_situacao') + ' "';
			return value;
		};
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 30,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_cte',
					status: 'ÚLTIMOS 90 DIAS'
				},
				reader: {
					type: 'json',
					root: 'data',
					totalProperty: 'total',
					successProperty: 'success',
					messageProperty: 'msg'
				},
				listeners: {
					exception: App.onProxyException
				}
			},
			
			sorters: [{
				property: 'cte_id',
				direction: 'DESC'
			}]
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableLocking: true,
			enableColumnHide: true,
			emptyText: 'Nenhum item encontrado',
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			features: [{
				ftype: 'filters',
	        	encode: true,
	        	local: false,
	        	filters: [{
	        		dataIndex: 'cte_id',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'cte_serie',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cte_numero',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cte_minuta',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cte_data_hora_emissao',
	        		type: 'date'
	        	},{
	        		dataIndex: 'rep_cnpj_cpf',
	        		type: 'string'
	        	},{
	        		dataIndex: 'rem_razao_social',
	        		type: 'string'
	        	},{
	        		dataIndex: 'rem_cnpj_cpf',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cid_origem_nome_completo',
	        		type: 'string'
	        	},{
	        		dataIndex: 'des_razao_social',
	        		type: 'string'
	        	},{
	        		dataIndex: 'des_cnpj_cpf',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cid_passagem_nome_completo',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cid_destino_nome_completo',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cte_valor_total',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'cte_chave',
	        		type: 'string'
	        	},{
	        		dataIndex: 'lista_documentos',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cte_data_hora_autorizacao',
	        		type: 'date'
	        	},{
	        		dataIndex: 'cte_data_entrega_prevista',
	        		type: 'date'
	        	},{
	        		dataIndex: 'cte_data_entrega_ultima',
	        		type: 'date'
	        	},{
	        		dataIndex: 'cte_perc_entregue',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'cte_faturado',
	        		type: 'boolean'
	        	},{
	        		dataIndex: 'cte_tem_difal',
	        		type: 'boolean'
	        	},{
	        		dataIndex: 'pUF_inicio',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'pUF_fim',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'pFCP',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'vFCP',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'pDIFAL',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'vDIFAL',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'vICMS_uf_fim',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'cte_aliquota_icms',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'cte_valor_icms',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'cte_exibe_consulta_fatura',
	        		type: 'boolean'
	        	},{
	        		dataIndex: 'cte_exibe_consulta_cliente',
	        		type: 'boolean'
	        	},{
	        		dataIndex: 'cte_cadastrado_por_nome',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cte_cadastrado_em',
	        		type: 'date'
	        	},{
	        		dataIndex: 'cte_alterado_em',
	        		type: 'date'
	        	},{
	        		dataIndex: 'cte_forma_emissao_nome',
	        		type: 'list',
					phpMode: true,
					options: ['1 - Normal', '5 - Contingência FSDA', '7 - Autorização pela SVC-RS', '8 - Autorização pela SVC-SP']
	        	},{
	        		dataIndex: 'cte_tipo_servico_nome',
	        		type: 'list',
					phpMode: true,
					options: ['0 - Normal', '1 - Subcontratação', '2 - Redespacho', '3 - Redespacho Intermediário', '4 - Serviço Vinculado à Multimodal']
	        	},{
	        		dataIndex: 'cte_situacao',
	        		type: 'list',
					phpMode: true,
					options: ['DIGITAÇÃO','VALIDADO','TRANSMITIDO','AUTORIZADO','REJEITADO','DENEGADO','CANCELADO','INUTILIZAR','INUTILIZADO','ANULADO','SUBSTITUÍDO','ME EMITIDA']
	        	}]
	        }],
			plugins: [{
	        	ptype: 'cellediting',
				clicksToEdit: 1,
				listeners: {
					beforeedit: function (editor, e) {
						me.activeRecord = e.record;
						if (e.field != 'clie_representante_id') return false;
					},
					edit: function (editor, e) {
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'save_representante',
								cte_id: e.record.get('cte_id'),
								clie_representante_id: e.value
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								e.record.reject();
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.commit();
								} else {
									App.warning(o);
								}
							}
						});
					}
				}
			}],
			columns: [{
				dataIndex: 'cte_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70
			},{
				dataIndex: 'cte_serie',
				text: 'Série',
				tooltip: 'Série do CT-e',
				align: 'right',
				width: 70,
				renderer: statusRenderer
			},{
				dataIndex: 'cte_numero',
				text: 'Número',
				tooltip: 'Número do CT-e',
				align: 'right',
				width: 90,
				renderer: statusRenderer
			},{
				dataIndex: 'cte_minuta',
				text: 'Minuta',
				tooltip: 'Número da minuta ou ordem de coleta',
				align: 'right',
				width: 70,
				renderer: statusRenderer
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_data_hora_emissao',
				text: 'Emitido em',
				format: 'D d/m/Y H:i',
				tooltip: 'Data/Hora da emissão do CT-e',
				align: 'right',
				width: 140
			},{
				dataIndex: 'rem_razao_social',
				text: 'Rementente',
				width: 300,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="CNPJ/CPF: ' + record.get('rem_cnpj_cpf') + '"';
					return value;
				}
			},{
				dataIndex: 'rem_cnpj_cpf',
				text: 'Remetente (DOC)',
				tooltip: 'CNPJ/CPF Remetente',
				hidden: true,
				width: 150,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + record.get('rem_razao_social') + '"';
					return value;
				}
			},{
				dataIndex: 'cid_origem_nome_completo',
				text: 'Origem',
				width: 300
			},{
				dataIndex: 'des_razao_social',
				text: 'Destinatário',
				width: 300,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="CNPJ/CPF: ' + record.get('des_cnpj_cpf') + '"';
					return value;
				}
			},{
				dataIndex: 'des_cnpj_cpf',
				text: 'Destinatário (DOC)',
				tooltip: 'CNPJ/CPF Destinatário',
				hidden: true,
				width: 150,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + record.get('des_razao_social') + '"';
					return value;
				}
			},{
				dataIndex: 'clie_representante_id',
				text: 'Representante',
				width: 300,
				sortable: false,
				editor: {
					xtype: 'clientecombo',
					allowBlank: true,
					showTrigger: true,
					extraParams: {
						clie_ativo: 1,
						clie_categoria: 5
					},
					listeners: {
						reset: function () {
							me.activeRecord.set('rep_razao_social', '');
						},
						select: function (field, records) {
							var record = records[0];
							me.activeRecord.set({clie_representante_id: record.get('clie_id'), rep_razao_social: record.get('clie_razao_social')});
						}
					}
				},
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="CNPJ/CPF: ' + record.get('rep_cnpj_cpf') + '"';
					return record.get('rep_razao_social');
				}
			},{
				dataIndex: 'rep_cnpj_cpf',
				text: 'Representante (DOC)',
				tooltip: 'CNPJ/CPF Representante',
				hidden: true,
				width: 150,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + record.get('rep_razao_social') + '"';
					return value;
				}
			},{
				dataIndex: 'cid_passagem_nome_completo',
				text: 'Passagem',
				width: 300,
				hidden: true
			},{
				dataIndex: 'cid_destino_nome_completo',
				text: 'Destino',
				width: 300
			},{
				dataIndex: 'cte_valor_total',
				text: 'Valor CT-e',
				tooltip: 'Valor total do conhecimento',
				align: 'right',
				width: 120,
				renderer: Ext.util.Format.brMoney
			},{
				dataIndex: 'cte_tipo_do_cte_nome',
				text: 'Tipo CT-e',
				width: 200,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['0 - CT-e Normal', '1 - CT-e de Complemento de Valores', '2 - CT-e de Anulação', '3 - CT-e Substituto']
				}
			},{
				dataIndex: 'cte_forma_emissao_nome',
				text: 'Forma Emissão',
				width: 200
			},{
				dataIndex: 'cte_tipo_servico_nome',
				text: 'Tipo Serviço',
				width: 200
			},{
				dataIndex: 'cte_situacao',
				text: 'Situação',
				align: 'center',
				width: 125,
				renderer: statusRenderer
			},{
				dataIndex: 'cte_chave',
				text: 'Chave',
				width: 280
			},{
				dataIndex: 'lista_documentos',
				text: 'Documentos',
				width: 180,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + value + '"';
					return value;
				}
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_data_hora_autorizacao',
				text: 'Autorizado em',
				format: 'D d/m/Y H:i',
				tooltip: 'Data/Hora da autorização do CT-e',
				align: 'right',
				width: 140
			},{
				xtype: 'templatecolumn',
				dataIndex: 'cte_xml',
				text: 'XML',
				align: 'center',
				width: 90,
				sortable: false,
				menuDisabled: true,
				tpl: '<tpl if="cte_xml"><a href="{cte_xml}" target="_blank">ABRIR</a></tpl>'
			},{
				xtype: 'templatecolumn',
				dataIndex: 'cte_pdf',
				text: 'PDF',
				align: 'center',
				width: 90,
				sortable: false,
				menuDisabled: true,
				tpl: '<tpl if="cte_pdf"><a href="{cte_pdf}" target="_blank">ABRIR</a></tpl>'
			},{
				xtype: 'templatecolumn',
				dataIndex: 'cte_cancelado_xml',
				text: 'XML CANCELADO',
				tooltip: 'XML do CT-e CANCELADO',
				align: 'center',
				width: 115,
				sortable: false,
				menuDisabled: true,
				tpl: '<tpl if="cte_cancelado_xml"><a href="{cte_cancelado_xml}" target="_blank">ABRIR</a></tpl>'
			},{
				xtype: 'templatecolumn',
				dataIndex: 'cte_cancelado_pdf',
				text: 'PDF CANCELADO',
				tooltip: 'PDF do CT-e CANCELADO',
				align: 'center',
				width: 115,
				sortable: false,
				menuDisabled: true,
				tpl: '<tpl if="cte_cancelado_pdf"><a href="{cte_cancelado_pdf}" target="_blank">ABRIR</a></tpl>'
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_data_entrega_prevista',
				text: 'Entregar em',
				format: 'D d/m/Y',
				tooltip: 'Data prevista para entrega referente as ocorrências',
				align: 'right',
				width: 120
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_data_entrega_ultima',
				text: 'Última entrega',
				format: 'D d/m/Y H:i',
				tooltip: 'Data/Hora da última entrega referente as ocorrências',
				align: 'right',
				width: 140
			},{
				dataIndex: 'cte_perc_entregue',
				text: 'Entregue',
				tooltip: 'Percentual entregue referente as ocorrências',
				align: 'center',
				width: 90,
				renderer: Ext.util.Format.percent
			},{
				text: 'IMPOSTOS',
				columns: [{
					xtype: 'booleancolumn',
					dataIndex:'cte_tem_difal',
					text: 'DIFAL',
					tooltip: 'Tem Diferença na Aliquota interestadual', 
					align: 'center',
					trueText:'Sim', 
					falseText: 'Não',
					width: 100
				},{
	        		dataIndex: 'pUF_inicio',
	        		text: 'UF Início (%)',
					tooltip: 'Alíquota da UF de início do serviço de transporte na operação interestadual', 
					align: 'center',
					width: 100,
					renderer: Ext.util.Format.percent
	        	},{
	        		dataIndex: 'pUF_fim',
	        		text: 'UF Fim (%)',
					tooltip: 'Alíquota da UF de término do serviço de transporte na operação interestadual', 
					align: 'center',
					width: 100,
					renderer: Ext.util.Format.percent
	        	},{
	        		dataIndex: 'pFCP',
	        		text: 'FCP (%)',
					tooltip: 'Alíquota de Fundo de Combate a Pobreza', 
					align: 'center',
					width: 100,
					renderer: Ext.util.Format.percent
	        	},{
	        		dataIndex: 'vFCP',
	        		text: 'FCP (R$)',
					tooltip: 'Valor do Fundo de Combate a Pobreza', 
					align: 'right',
					width: 120,
					renderer: Ext.util.Format.brMoney
	        	},{
	        		dataIndex: 'pDIFAL',
	        		text: 'DIFAL (%)',
					tooltip: 'Alíquota da Diferença de Alíquota Interestadual', 
					align: 'center',
					width: 100,
					renderer: Ext.util.Format.percent
	        	},{
	        		dataIndex: 'vDIFAL',
	        		text: 'DIFAL (R$)',
					tooltip: 'Valor da Diferença de Alíquota Interestadual', 
					align: 'right',
					width: 120,
					renderer: Ext.util.Format.brMoney
	        	},{
	        		dataIndex: 'vICMS_uf_fim',
	        		text: 'DIFAL+FCP (R$)',
					tooltip: 'Valor do ICMS de partilha para a UF de término da prestação do serviço de transporte', 
					align: 'right',
					width: 120,
					renderer: Ext.util.Format.brMoney
	        	},{
	        		dataIndex: 'cte_aliquota_icms',
	        		text: 'ICMS (%)',
					tooltip: 'Alíquota de ICMS', 
					align: 'center',
					width: 100,
					renderer: Ext.util.Format.percent
	        	},{
	        		dataIndex: 'cte_valor_icms',
	        		text: 'ICMS (R$)',
					tooltip: 'Valor do ICMS', 
					align: 'right',
					width: 120,
					renderer: Ext.util.Format.brMoney
	        	}]
			},{
				text: 'Faturamento',
				columns: [{
					xtype: 'booleancolumn',
					dataIndex:'cte_faturado',
					text: 'Status',
					tooltip: 'Faturado (sim/não)', 
					align: 'center',
					trueText:'Faturado', 
					falseText: 'À Faturar',
					width: 100
				},{
					xtype: 'booleancolumn',
					dataIndex:'cte_exibe_consulta_fatura',
					text: 'Exibir fatura',
					tooltip: 'Exibir na tela de consulta do faturamento', 
					align: 'center',
					trueText:'Sim', 
					falseText: 'Não',
					width: 100
				},{
					xtype: 'booleancolumn',
					dataIndex:'cte_exibe_consulta_cliente',
					text: 'Exibir cliente',
					tooltip: 'Exibir na tela de consulta do site/cliente', 
					align: 'center',
					trueText:'Sim', 
					falseText: 'Não',
					width: 100
				}]
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cte_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200
				},{
					xtype: 'datecolumn',
					dataIndex: 'cte_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140
				},{
					dataIndex: 'cte_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cte_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140
				},{
					dataIndex: 'cte_versao',
					text: 'Alterações',
					tooltip: 'Quantidade de alterações afetadas no registro',
					align: 'right',
					width: 100
				}]
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Novo',
					tooltip: 'Emitir um novo conhecimento (CT-e)',
					handler: function() {
						var tp = me.up('ctesview');
						tp.setActiveTab(1);
						var form = tp.getActiveTab();
						form.newRecord();
						form.setGrid(me);
					}
				},{
					iconCls: 'icon-pencil',
					text: 'Editar',
					tooltip: 'Editar conhecimento (CT-e) selecionado',
					handler: function() {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						} else if (selections.length > 1) {
							App.manyRecordsSelected();
							return false;
						}
						var record = selections[0], editRecord = function() {
							var tp = me.up('ctesview');
							tp.setActiveTab(1);
							var form = tp.getActiveTab();
							form.loadRecord(record);
							form.setGrid(me);
						};
						if (record.get('cte_situacao') == 'DIGITAÇÃO' || App.empresa.emp_tipo_emitente == 'ND') {
							editRecord();
						} else if (record.get('cte_situacao').search(new RegExp("VALIDADO|REJEITADO|DENEGADO", "gi")) > -1) {
							Ext.create('Ext.ux.Alert', {
								ui: 'black-alert',
								msg: 'Conhecimento: "' + record.get('cte_numero') + '" e Minuta: "' + record.get('cte_minuta') + '" encontra-se ' + record.get('cte_situacao') + '.<br/>A situação voltará para "DIGITAÇÃO". Deseja continuar editando mesmo assim?',
								closeText: 'CANCELAR',
								buttons: [{
									text: 'EDITAR',
									handler: editRecord
								}]
							});
						}
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
					tooltip: 'Excluir conhecimento selecionado',
					itemId: 'delete',
					disabled: true,
					handler: function() {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
							
						var id = [];
						Ext.each(selections, function(record) {
							if (record.get('cte_id') > 0) {
								id.push(record.get('cte_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'delete_cte',
								cte_id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'-',{
					text: 'Cancelar',
					iconCls: 'icon-cancel',
					itemId: 'cancelar-cte-btn',
					tooltip: 'Cancelar conhecimento enviado para SEFAZ',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						var records = new Array(), ids = new Array();
						Ext.each(selections, function(record) {
							if (record.get('cte_id') > 0 && record.get('cte_situacao') == 'AUTORIZADO') {
								ids.push(record.get('cte_id'));
							}
						});
						if (Ext.isEmpty(ids)) return false;
						
						var originalText = btn.getText();
						btn.setText('Cancelando...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'cancelar',
								id: ids.join(',')
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								
								btn.setDisabled(false);
								btn.setText(originalText);
								
								if (o.success) {
									me.store.load({params: {cte_id: ids.join(',')}});
								} else {
									App.warning(o);
								}
							}
						});
					}
				},'-',{
					text: 'Copiar',
					itemId: 'copy-btn',
					iconCls: 'icon-copy',
					tooltip: 'Copiar CT-e existente',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						if (selections.length != 1) {
							App.manyRecordsSelected();
							return false;
						}
						var record = selections[0], originalText = btn.getText();
						btn.setText('Copiando...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'copy_cte',
								origem_id: record.get('cte_id')
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								
								btn.setDisabled(false);
								btn.setText(originalText);
								
								if (o.success) {
									var newRecord = Ext.create('CTE.data.Model', o.cte);
									me.store.add(newRecord);
									var tp = me.up('ctesview');
									tp.setActiveTab(1);
									var form = tp.getActiveTab();
									form.loadRecord(newRecord);
									form.setGrid(me);
								} else {
									App.warning(o);
								}
							}
						});
					}
				},'-',{
					text: 'Validar',
					itemId: 'validar-cte-btn',
					iconCls: 'icon-checkmark',
					tooltip: 'Pré validar CT-e selecionado antes de transmitir para SEFAZ',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						if (selections.length != 1) {
							App.manyRecordsSelected();
							return false;
						}
						var record = selections[0], originalText = btn.getText();
						btn.setText('Pré validando...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'validar',
								cte_id: record.get('cte_id'),
								prod_id: record.get('prod_id'),
								cte_valor_carga: record.get('cte_valor_carga'),
								cte_tipo_do_cte: record.get('cte_tipo_do_cte'),
								cte_tipo_servico: record.get('cte_tipo_servico'),
								clie_remetente_id: record.get('clie_remetente_id'),
								clie_destinatario_id: record.get('clie_destinatario_id'),
								clie_expedidor_id: record.get('clie_expedidor_id'),
								clie_recebedor_id: record.get('clie_recebedor_id'),
								cte_chave_referenciado: record.get('cte_chave_referenciado'),
								cte_data_hora_emissao: record.get('cte_data_hora_emissao'),
								cte_valor_total: record.get('cte_valor_total'),
								cte_valor_icms: record.get('cte_valor_icms'),
								cte_modal: record.get('cte_modal'),
								cte_data_entrega_prevista: record.get('cte_data_entrega_prevista')
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								o.erros = parseInt(o.erros);
								
								btn.setDisabled(false);
								btn.setText(originalText);
								
								if (o.erros > 0 && !Ext.isEmpty(o.html)) {
									Ext.create('Ext.ux.Alert', {
										ui: 'red-alert',
										msg: o.html
									});
								} else {
									record.set('cte_situacao', 'VALIDADO');
								}
							}
						});
					}
				},{
					text: 'Transmitir',
					itemId: 'transmitir-cte-btn',
					iconCls: 'icon-tab',
					tooltip: 'Enviar CT-e para SEFAZ',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						var ids = new Array();
						Ext.each(selections, function(record) {
							if (record.get('cte_id') > 0 && record.get('cte_situacao') == 'VALIDADO') {
								ids.push(record.get('cte_id'));
							}
						});
						if (!ids.length) {
							return false;
						}
						var originalText = btn.getText();
						btn.setText('Transmitindo...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'transmitir',
								id: ids.join(',')
							},
							failure: function(){
								btn.setDisabled(false);
								btn.setText(originalText);
								
								me.store.reload();
							},
							success: function(response) {
								var o = Ext.decode(response.responseText);
								
								btn.setDisabled(false);
								btn.setText(originalText);
								
								if (o.success) {
									me.store.load({params: {cte_id: ids.join(',')}});
								} else {
									App.warning(o);
								}
							}
						});
					}
				},'-',{
					text: 'Status',
					iconCls: 'icon-loop',
					itemId: 'status-cte-btn',
					tooltip: 'Verifica o status na SEFAZ',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						var records = new Array();
						Ext.each(selections, function(record) {
							if (record.get('cte_id') > 0 && record.get('cte_situacao') == 'TRANSMITIDO') {
								records.push({
									cte_id: record.get('cte_id'),
									cte_numero: record.get('cte_numero')
								});
							}
						});
						if (!records.length) {
							return false;
						}
						var originalText = btn.getText();
						btn.setText('Verificando...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'verifica',
								records: Ext.encode(records)
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								
								btn.setDisabled(false);
								btn.setText(originalText);
								
								if (o.success) {
									if (!Ext.isEmpty(o.success_id)) {
										me.store.load({params: {cte_id: o.success_id.join(',')}});
									}
									if (!Ext.isEmpty(o.failure_id)) {
										Ext.create('Ext.ux.Alert', {
											ui: 'black-alert',
											msg: 'Sefaz informa que (' + o.failure_id.length + ') conhecimento(s) está(ão) irregular.<br/>Deseja exibir esses conhecimentos?',
											closeText: 'NÃO',
											buttons: [{
												text: 'SIM',
												handler: function() {
													me.store.load({params: {cte_id: o.failure_id.join(',')}});
												}
											}]
										});
									}
								} else {
									App.warning(o);
								}
							}
						});
					}
				},{
					text: 'Arquivos',
					iconCls: 'icon-file-xml',
					itemId: 'arquivos-cte-btn',
					tooltip: 'Pegar os arquivos gerados pela SEFAZ',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						var data = new Array();
						Ext.each(selections, function(record) {
							if (record.get('cte_id') > 0 && record.get('cte_situacao').search(new RegExp("AUTORIZADO|CANCELADO", "gi")) > -1) {
								data.push({
									cte_id: record.get('cte_id'),
									cte_numero: record.get('cte_numero'),
									cte_chave: record.get('cte_chave')
								});
							}
						});
						if (!data.length) {
							return false;
						}
						var originalText = btn.getText();
						btn.setText('Procurando...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'arquivos',
								records: Ext.encode(data)
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								
								btn.setDisabled(false);
								btn.setText(originalText);
								
								if (o.success) {
									if (!Ext.isEmpty(o.success_id)) {
										me.store.load({params: {cte_id: o.success_id.join(',')}});
									}
									if (!Ext.isEmpty(o.failure_id)) {
										Ext.create('Ext.ux.Alert', {
											ui: 'black-alert',
											msg: 'Ocorreu uma falha ao tentar transmitir (' + o.failure_id.length + ') conhecimento(s) para Sefaz.<br/>Deseja exibir esses conhecimentos?',
											closeText: 'NÃO',
											buttons: [{
												text: 'SIM',
												handler: function() {
													me.store.load({params: {cte_id: o.failure_id.join(',')}});
												}
											}]
										});
									}
									if (!Ext.isEmpty(o.files)) {
										Ext.create('Ext.ux.Alert', {
											ui: 'black-alert',
											msg: 'O sistema conseguiu pegar do webservice (' + o.files.length + ') arquivo(s). O que você deseja fazer com esse(s) arquivo(s)?',
											closeText: 'CANCELAR',
											buttons: [{
												ui: 'red-button',
												text: 'ABRIR PDF',
												autoClose: false,
												handler: function() {
													Ext.each(o.files, function(file){
														window.open(file.pdf);
													});
												}
											},{
												ui: 'green-button',
												text: 'ABRIR XML',
												autoClose: false,
												handler: function() {
													Ext.each(o.files, function(file){
														window.open(file.xml);
													});
												}
											}]
										});
									}
								} else {
									App.warning(o);
								}
							}
						});
					}
				},'-',{
					text: 'Transferir',
					iconCls: 'icon-loop',
					tooltip: 'Transferir CT-e para uma outra empresa cadastrada',
					handler: function() {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						var id = new Array();
						Ext.each(selections, function(record) {
							if (record.get('cte_id') > 0) {
								id.push(record.get('cte_id'));
							}
						});
						if (!id.length) {
							return false;
						}
						var win = Ext.create('Ext.ux.Window', {
							ui: 'blue-window-active',
							title: 'Transferir CT-e para uma outra empresa cadastrada',
							width: 350,
							height: 150,
							autoShow: true,
							closable: true,
							minimizable: false,
							maximizable: false,
							resizable: false,
							layout: 'fit',
							items: {
								xtype: 'form',
								bodyPadding: 10,
								layout: 'anchor',
								defaults: {
									anchor: '100%',
									labelAlign: 'top',
									allowBlank: false,
									selectOnFocus: true
								},
								defaultType: 'textfield',
								items: [{
									xtype: 'empresacombo',
									fieldLabel: 'Selecione a empresa de destino',
									name: 'empresas_id',
									listeners: {
										beforeselect: function(field, record) {
											if (record.get('emp_id') == App.empresa.emp_id) {
												return false;
											}
										},
										select: function(field, records) {
											var record = records[0], form = field.up('form').getForm();
											form.findField('empresa').setValue(Ext.encode(record.data));
										}
									}
								},{
									xtype: 'hiddenfield',
									name: 'empresa'
								}],
								buttons: [{
									text: 'TRANSFERIR',
									scale: 'medium',
									formBind: true,
									handler: function(btn) {
										var form = win.down('form').getForm(),
										originalText = btn.getText();
										btn.setText('TRANSFERINDO...');
										btn.setDisabled(true);
										form.submit({
											clientValidation: true,
											url: 'mod/conhecimentos/ctes/php/response.php',
											method: 'post',
											params: {
												m: 'transferir_cte',
												cte_list_id: id.join(',') 
											},
											failure: Ext.Function.createSequence(App.formFailure, function() {
												btn.setDisabled(false);
												btn.setText(originalText);
											}),
											success: function(f, a) {
												btn.setDisabled(false);
												btn.setText(originalText);
												me.store.remove(selections);
												win.close();
											}
										});
									}
								}]
							}
						});
					}
				},'-',{
					text: 'Faturamento',
					iconCls: 'icon-check',
					tooltip: 'Exibir/Ocular exibição de CT-e',
					menu: {
						items: [{
							text: 'Exibir/Ocultar CT-e na fatura',
							iconCls: 'icon-menu-checked',
							handler: function() {
								me.toggleField('cte_exibe_consulta_fatura');
							}
						},{
							text: 'Exibir/Ocultar CT-e no site cliente',
							iconCls: 'icon-menu-checked',
							handler: function() {
								me.toggleField('cte_exibe_consulta_cliente');
							}
						}]
					}
				},'->',{
					itemId: 'view-filter',
					text: 'Exibindo (últimos 90 dias)',
					iconCls: 'icon-glasses-2',
					menu: {
						items: [{
							text: 'Todos',
							group: 'status-cte',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						},'-',{
							text: 'Últimos 90 dias',
							group: 'status-cte',
							checked: true,
							scope: this,
							checkHandler: this.onStatusChange
						},{
							text: 'Últimos 180 dias',
							group: 'status-cte',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						},{
							text: 'Últimos 365 dias',
							group: 'status-cte',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						}]
					}
				},{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: [
						'cte_numero',
						'tom_razao_social',
						'tom_nome_fantasia',
						'tom_cnpj',
						'rep_razao_social',
						'rep_cnpj_cpf',
						'lista_documentos',
						'lista_documentos_numeros'
					]
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: me.store,
				displayInfo: true,
				items: ['-',{
					text: 'Etiqueta',
					iconCls: 'icon-barcode',
					tooltip: 'Gerar etiqueta para os registros selecionados no formato PDF',
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						var data = new Array();
						Ext.each(selections, function(record) {
							if (record.get('cte_id') > 0 && record.get('cte_situacao').search(new RegExp("AUTORIZADO|EMITIDA", "gi")) > -1) {
								data.push({
									cte_id: record.get('cte_id'),
									cte_minuta: record.get('cte_minuta'),
									cte_numero: record.get('cte_numero'),
									rem_razao_social: record.get('rem_razao_social'),
									rem_cid_uf: record.get('rem_cid_uf'),
									rem_cid_nome: record.get('rem_cid_nome'),
									rem_cid_sigla: record.get('rem_cid_sigla'),
									des_razao_social: record.get('des_razao_social'),
									des_cid_uf: record.get('ent_etiqueta_cid_uf'),
									des_cid_nome: record.get('ent_etiqueta_cid_nome'),
									des_cid_sigla: record.get('ent_etiqueta_cid_sigla'),
									des_endereco: record.get('cte_endereco_etiqueta_entrega'),
									cte_qtde_volumes: record.get('cte_qtde_volumes'),
									cte_peso_bc: record.get('cte_peso_bc'),
									notas_fiscais: record.get('lista_documentos_numeros') || record.get('lista_documentos')
								});
							}
						});
						if (!data.length) {
							return false;
						}
						var originalText = btn.getText();
						btn.setText('Gerando etiqueta...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'gerar_etiqueta',
								records: Ext.encode(data)
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								btn.setDisabled(false);
								btn.setText(originalText);
								if (o.success) {
									var popup = window.open(o.pdf);
									if (!popup) {
										Ext.create('Ext.ux.Alert', {
											ui: 'black-alert',
											msg: 'Suas etiquetas foram geradas com sucesso no formato PDF, porém o sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para facilitar e evitar futura mensagem, por favor inclua nosso site na lista dos permitidos.<br/>O que você deseja fazer agora?',
											buttons: [{
												ui: 'red-button',
												text: 'ABRIR PDF',
												url: o.pdf,
												hrefTarget: '_blank'
											}]
										});
									}
								} else {
									App.warning(o);
								}
							}
						});
					}
				},'-',{
					text: 'Exportar XLS',
					iconCls: 'icon-file-excel',
					tooltip: 'Exportar registros para o formato xls',
					handler: function() {
						Ext.create('Export.Window', {
							title: 'Conhecimentos (CT-e)',
							url: 'mod/conhecimentos/ctes/php/response.php',
							action: 'export_xls',
							defaultData: [{
								pos: 1,
								id: 'cte_numero',
								field: 'Número',
								sort_id: 'ASC',
								sort_label: 'Crescente'
							},{
								pos: 2,
								id: 'cte_data_hora_emissao',
								field: 'Emitido em'
							},{
								pos: 3,
								id: 'cte_situacao',
								field: 'Situação'
							},{
								pos: 4,
								id: 'rem_razao_social',
								field: 'Remetente (razão social)'
							},{
								pos: 5,
								id: 'rem_cnpj_cpf',
								field: 'Remetente (cnpj/cpf)'
							},{
								pos: 6,
								id: 'cid_origem_municipio',
								field: 'Cidade Origem (município)'
							},{
								pos: 7,
								id: 'cid_origem_uf',
								field: 'UF Origem'
							},{
								pos: 8,
								id: 'des_razao_social',
								field: 'Destinatário'
							},{
								pos: 9,
								id: 'des_cnpj_cpf',
								field: 'Destinatário (cnpj/cpf)'
							},{
								pos: 10,
								id: 'cid_destino_municipio',
								field: 'Cidade Destino (município)'
							},{
								pos: 11,
								id: 'cid_destino_uf',
								field: 'UF Destino'
							},{
								pos: 12,
								id: 'tom_razao_social',
								field: 'Tomador (razão social)'
							},{
								pos: 13,
								id: 'tom_cnpj_cpf',
								field: 'Tomador (cnpj/cpf)'
							},{
								pos: 14,
								id: 'lista_documentos_numeros',
								field: 'Nº Documentos'
							},{
								pos: 15,
								id: 'cte_qtde_volumes',
								field: 'Volumes'
							},{
								pos: 16,
								id: 'cte_peso_bruto',
								field: 'Peso Bruto'
							},{
								pos: 17,
								id: 'cte_peso_cubado',
								field: 'Peso Cubado'
							},{
								pos: 18,
								id:'cte_peso_bc',
								field: 'Peso Taxado' 
							},{
								pos: 19,
								id: 'cte_valor_carga',
								field: 'Valor Carga'
							},{
								pos: 20,
								id: 'cte_valor_total',
								field: 'Valor CT-e'
							},{
								pos: 21,
								id: 'cte_perc_entregue',
								field: 'Percentual Entregue'
							},{
								pos: 22,
								id: 'recebedor_nome',
								field: 'Recebedor'
							},{
								pos: 23,
								id: 'recebedor_doc',
								field: 'Recebedor (DOC)'
							},{
								pos: 24,
								id: 'cte_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								pos: 25,
								id: 'cte_obs_gerais',
								field: 'Observações Gerais'
							}],
							fields: [{
								id: 'cte_serie',
								field: 'Série'
							},{
								id: 'cte_numero',
								field: 'Número'
							},{
								id: 'cte_minuta',
								field: 'Minuta'
							},{
								id: 'cte_chave',
								field: 'Chave'
							},{
								id: 'cte_data_hora_emissao',
								field: 'Emitido em'
							},{
								id: 'cte_natureza_operacao',
								field: 'Natureza da Operação'
							},{
								id: 'rem_razao_social',
								field: 'Remetente (razão social)'
							},{
								id: 'rem_nome_fantasia',
								field: 'Remetente (nome fantasia)'
							},{
								id: 'rem_cnpj_cpf',
								field: 'Remetente (cnpj/cpf)'
							},{
								id: 'rem_cid_sigla',
								field: 'Remetente (sigla)'
							},{
								id: 'exp_razao_social',
								field: 'Expedidor (razão social)'
							},{
								id: 'exp_nome_fantasia',
								field: 'Expedidor (nome fantasia)'
							},{
								id: 'exp_cnpj_cpf',
								field: 'Expedidor (cnpj/cpf)'
							},{
								id: 'exp_cid_sigla',
								field: 'Expedidor (sigla)'
							},{
								id: 'tom_razao_social',
								field: 'Tomador (razão social)'
							},{
								id: 'tom_nome_fantasia',
								field: 'Tomador (nome fantasia)'
							},{
								id: 'tom_cnpj_cpf',
								field: 'Tomador (cnpj/cpf)'
							},{
								id: 'tom_cid_sigla',
								field: 'Tomador (sigla)'
							},{
								id: 'des_razao_social',
								field: 'Destinatário'
							},{
								id: 'des_cnpj_cpf',
								field: 'Destinatário (cnpj/cpf)'
							},{
								id: 'cid_origem_sigla',
								field: 'Cidade Origem (sigla)'
							},{
								id: 'cid_origem_municipio',
								field: 'Cidade Origem (município)'
							},{
								id: 'cid_origem_uf',
								field: 'UF Origem'
							},{
								id: 'cid_destino_sigla',
								field: 'Cidade Destino (sigla)'
							},{
								id: 'cid_destino_municipio',
								field: 'Cidade Destino (município)'
							},{
								id: 'cid_destino_uf',
								field: 'UF Destino'
							},{
								id: 'cte_tipo_do_cte_nome',
								field: 'Tipo CT-e'
							},{
								id: 'cte_forma_pgto_nome',
								field: 'Forma Pagamento'
							},{
								id: 'cte_data_entrega_prevista',
								field: 'Data Entrega (prevista)'
							},{
								id: 'cte_data_entrega_efetuada',
								field: 'Data Entrega (efetuada)'
							},{
								id: 'cte_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								id: 'cte_perc_entregue',
								field: 'Percentual Entregue'
							},{
								id: 'cte_modal_nome',
								field: 'Modal'
							},{
								id: 'cte_forma_emissao_nome',
								field: 'Forma Emissão'
							},{
								id: 'cte_tabela_frete',
								field: 'Tabela Frete'
							},{
								id: 'cte_tipo_servico_nome',
								field: 'Tipo Serviço'
							},{
								id: 'cte_cfop',
								field: 'CFOP'
							},{
								id: 'cte_carac_adic_transp',
								field: 'Característica adicional do transporte'
							},{
								id: 'cte_carac_adic_servico',
								field: 'Característica adicional do serviço'
							},{
								id: 'cte_outras_carac_carga',
								field: 'Outras características do produto'
							},{
								id: 'produto_predominante_nome',
								field: 'Produto Predominante'
							},{
								id: 'cte_situacao',
								field: 'Situação'
							},{
								id: 'cte_peso_bruto',
								field: 'Peso Bruto'
							},{
								id: 'cte_peso_cubado',
								field: 'Peso Cubado'
							},{
								id:'cte_peso_bc',
								field: 'Peso Taxado' 
							},{
								id: 'cte_cubagem_m3',
								field: 'Cubagem'
							},{
								id: 'cte_qtde_volumes',
								field: 'Volumes'
							},{
								id: 'cte_valor_carga',
								field: 'Valor Carga'
							},{
								id: 'cte_valor_total',
								field: 'Valor CT-e'
							},{
								id: 'cte_aliquota_icms',
								field: 'Alíquota ICMS'
							},{
								id: 'cte_valor_icms',
								field: 'Valor ICMS'
							},{
								id: 'cte_data_hora_autorizacao',
								field: 'Autorizado em'
							},{
								id: 'cte_cadastrado_por_nome',
								field: 'Cadastrado por'
							},{
								id: 'cte_cadastrado_em',
								field: 'Cadastrado em'
							},{
								id: 'cte_alterado_por_nome',
								field: 'Alterado por'
							},{
								id: 'cte_alterado_em',
								field: 'Alterado em'
							},{
								id: 'cte_versao',
								field: 'Versão'
							},{
								id: 'cte_obs_gerais',
								field: 'Observações Gerais'
							},{
								id: 'lista_documentos_numeros',
								field: 'Nº Documentos'
							},{
								id: 'recebedor_nome',
								field: 'Recebedor'
							},{
								id: 'recebedor_doc',
								field: 'Recebedor (DOC)'
							}]
						});
					}
				},{
					text: 'Exportar TXT',
					iconCls: 'icon-file-css',
					tooltip: 'Exportar conhecimentos com documentos e ocorrências para o formato txt',
					handler: function() {
						Ext.create('Export.Window', {
							title: 'Conhecimentos, Documentos/Notas/Recibos e Ocorrências (CT-e)',
							url: 'mod/conhecimentos/ctes/php/response.php',
							action: 'export_txt',
							defaultData: [{
								pos: 1,
								id: 'cte_doc_numero',
								field: 'Número (DOC)'
							},{
								pos: 2,
								id:'cte_doc_serie', 
								field:'Série (DOC)'
							},{
								pos: 3,
								id: 'cte_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								pos: 4,
								id:'cte_ocor_quando_data', 
								field:'Data (OCOR)',
								sort_id: 'DESC',
								sort_label: 'Decrescente'
							},{
								pos: 5,
								id:'ocor_descricao', 
								field:'Descrição (OCOR)'
							},{
								pos: 6,
								id: 'rem_cnpj_cpf',
								field: 'Remetente (cnpj/cpf)'
							}],
							fields: [{
								id: 'cte_serie',
								field: 'Série'
							},{
								id: 'cte_numero',
								field: 'Número'
							},{
								id: 'cte_minuta',
								field: 'Minuta'
							},{
								id: 'cte_chave',
								field: 'Chave'
							},{
								id: 'cte_data_hora_emissao',
								field: 'Emitido em'
							},{
								id: 'cte_natureza_operacao',
								field: 'Natureza da Operação'
							},{
								id: 'rem_razao_social',
								field: 'Remetente (razão social)'
							},{
								id: 'rem_nome_fantasia',
								field: 'Remetente (nome fantasia)'
							},{
								id: 'rem_cnpj_cpf',
								field: 'Remetente (cnpj/cpf)'
							},{
								id: 'rem_cid_sigla',
								field: 'Remetente (sigla)'
							},{
								id: 'exp_razao_social',
								field: 'Expedidor (razão social)'
							},{
								id: 'exp_nome_fantasia',
								field: 'Expedidor (nome fantasia)'
							},{
								id: 'exp_cnpj_cpf',
								field: 'Expedidor (cnpj/cpf)'
							},{
								id: 'exp_cid_sigla',
								field: 'Expedidor (sigla)'
							},{
								id: 'tom_razao_social',
								field: 'Tomador (razão social)'
							},{
								id: 'tom_nome_fantasia',
								field: 'Tomador (nome fantasia)'
							},{
								id: 'tom_cnpj_cpf',
								field: 'Tomador (cnpj/cpf)'
							},{
								id: 'tom_cid_sigla',
								field: 'Tomador (sigla)'
							},{
								id: 'des_razao_social',
								field: 'Destinatário'
							},{
								id: 'cid_origem_sigla',
								field: 'Cidade Origem (sigla)'
							},{
								id: 'cid_origem_municipio',
								field: 'Cidade Origem (município)'
							},{
								id: 'cid_origem_uf',
								field: 'UF Origem'
							},{
								id: 'cid_destino_sigla',
								field: 'Cidade Destino (sigla)'
							},{
								id: 'cid_destino_municipio',
								field: 'Cidade Destino (município)'
							},{
								id: 'cid_destino_uf',
								field: 'UF Destino'
							},{
								id: 'cte_tipo_do_cte_nome',
								field: 'Tipo CT-e'
							},{
								id: 'cte_forma_pgto_nome',
								field: 'Forma Pagamento'
							},{
								id: 'cte_data_entrega_prevista',
								field: 'Data Entrega (prevista)'
							},{
								id: 'cte_data_entrega_efetuada',
								field: 'Data Entrega (efetuada)'
							},{
								id: 'cte_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								id: 'cte_perc_entregue',
								field: 'Percentual Entregue'
							},{
								id: 'cte_modal_nome',
								field: 'Modal'
							},{
								id: 'cte_forma_emissao_nome',
								field: 'Forma Emissão'
							},{
								id: 'cte_tabela_frete',
								field: 'Tabela Frete'
							},{
								id: 'cte_tipo_servico_nome',
								field: 'Tipo Serviço'
							},{
								id: 'cte_cfop',
								field: 'CFOP'
							},{
								id: 'cte_carac_adic_transp',
								field: 'Característica adicional do transporte'
							},{
								id: 'cte_carac_adic_servico',
								field: 'Característica adicional do serviço'
							},{
								id: 'cte_outras_carac_carga',
								field: 'Outras características do produto'
							},{
								id: 'produto_predominante_nome',
								field: 'Produto Predominante'
							},{
								id: 'cte_situacao',
								field: 'Situação'
							},{
								id: 'cte_peso_bruto',
								field: 'Peso Bruto'
							},{
								id: 'cte_peso_cubado',
								field: 'Peso Cubado'
							},{
								id:'cte_peso_bc',
								field: 'Peso Taxado' 
							},{
								id: 'cte_cubagem_m3',
								field: 'Cubagem'
							},{
								id: 'cte_qtde_volumes',
								field: 'Volumes'
							},{
								id: 'cte_valor_carga',
								field: 'Valor Carga'
							},{
								id: 'cte_valor_total',
								field: 'Valor CT-e'
							},{
								id: 'cte_aliquota_icms',
								field: 'Alíquota ICMS'
							},{
								id: 'cte_valor_icms',
								field: 'Valor ICMS'
							},{
								id: 'cte_data_hora_autorizacao',
								field: 'Autorizado em'
							},{
								id: 'cte_cadastrado_por_nome',
								field: 'Cadastrado por'
							},{
								id: 'cte_cadastrado_em',
								field: 'Cadastrado em'
							},{
								id: 'cte_alterado_por_nome',
								field: 'Alterado por'
							},{
								id: 'cte_alterado_em',
								field: 'Alterado em'
							},{
								id: 'cte_versao',
								field: 'Versão'
							},{
								id: 'cte_obs_gerais',
								field: 'Observações Gerais'
							},{
								id:'cte_doc_serie', 
								field:'Série (DOC)'
							},{
								id:'cte_doc_data_emissao',
								field:'Emissão (DOC)'
							},{
								id:'cte_doc_numero',
								field:'Número (DOC)'
							},{
								id:'cte_doc_cfop', 
								field:'CFOP (DOC)'
							},{
								id:'cte_doc_modelo', 
								field:'Modelo (DOC)'
							},{
								id:'cte_doc_volumes', 
								field:'Volumes (DOC)'
							},{
								id:'cte_doc_bc_icms',
								field:'BC ICMS (DOC)'
							},{
								id:'cte_doc_valor_icms',
								field:'Valor ICMS (DOC)'
							},{
								id:'cte_doc_bc_icms_st',
								field:'BC ISM ST (DOC)'
							},{
								id:'cte_doc_valor_icms_st',
								field:'Valor ICMS ST (DOC)'
							},{
								id:'cte_doc_peso_total', 
								field:'Peso Total (DOC)'
							},{
								id:'cte_doc_pin', 
								field:'PIN (DOC)'
							},{
								id:'cte_doc_valor_produtos', 
								field:'Valor Produtos (DOC)'
							},{
								id:'cte_doc_valor_nota', 
								field:'Valor (DOC)'
							},{
								id:'cte_doc_chave_nfe',
								field:'Chave (DOC)'
							},{
								id:'cte_doc_tipo_doc', 
								field:'Tipo (DOC)'
							},{
								id:'cte_doc_descricao', 
								field:'Descrição (DOC)'
							},{
								id:'cte_ocor_quando_data', 
								field:'Data (OCOR)'
							},{
								id:'cte_ocor_quando_hora', 
								field:'Hora (OCOR)'
							},{
								id:'cte_ocor_cia_aerea',
								field:'CIA (OCOR)'
							},{
								id:'cte_ocor_voo', 
								field:'Vôo (OCOR)'
							},{
								id:'cte_ocor_base', 
								field:'Base (OCOR)'
							},{
								id:'cte_ocor_serie_master', 
								field:'Série Master (OCOR)'
							},{
								id:'cte_ocor_numero_master', 
								field:'Número Master (OCOR)'
							},{
								id:'cte_ocor_operacional_master', 
								field:'Operacional Master (OCOR)'
							},{
								id:'cte_ocor_chave_master', 
								field:'Chave Master (OCOR)'
							},{
								id:'cte_ocor_volumes',
								field:'Volumes (OCOR)'
							},{
								id:'cte_ocor_peso_bruto',
								field:'Peso (OCOR)'
							},{
								id:'cte_ocor_entregador_nome',
								field:'Entregador (OCOR)'
							},{
								id:'cte_ocor_entregador_doc', 
								field:'Doc Entregador (OCOR)'
							},{
								id:'cte_ocor_recebedor_nome',
								field:'Recebedor (OCOR)'
							},{
								id:'cte_ocor_recebedor_doc',
								field:'Doc Recebedor (OCOR)'
							},{
								id:'cte_ocor_nota',
								field:'Notas (OCOR)'
							},{
								id:'ocor_codigo', 
								field:'Código (OCOR)'
							},{
								id:'ocor_descricao', 
								field:'Descrição (OCOR)'
							},{
								id:'ocor_modal', 
								field:'Modal (OCOR)'
							},{
								id:'ocor_caracteristica', 
								field:'Característica (OCOR)'
							},{
								id:'ocor_nome', 
								field:'Nome (OCOR)'
							},{
								id:'ocor_modal_caracteristica', 
								field:'Caracterísitca Modal (OCOR)'
							}]
						});
					}
				}]
			}],
			listeners: {
				itemdblclick: function(grid, record) {
					var editRecord = function() {
						var tp = me.up('ctesview');
						tp.setActiveTab(1);
						var form = tp.getActiveTab();
						form.loadRecord(record);
						form.setGrid(grid);
					};
					if (record.get('cte_situacao') == 'DIGITAÇÃO' || App.empresa.emp_tipo_emitente == 'ND') {
						editRecord();
					} else if (record.get('cte_situacao').search(new RegExp("VALIDADO|REJEITADO|DENEGADO", "gi")) > -1) {
						Ext.create('Ext.ux.Alert', {
							ui: 'black-alert',
							msg: 'Conhecimento: "' + record.get('cte_numero') + '" e Minuta: "' + record.get('cte_minuta') + '" encontra-se ' + record.get('cte_situacao') + '.<br/>A situação voltará para "DIGITAÇÃO". Deseja continuar editando mesmo assim?',
							closeText: 'CANCELAR',
							buttons: [{
								text: 'EDITAR',
								handler: editRecord
							}]
						});
					}
				},
				selectionchange: function(selModel, selections) {
					var tp = me.up('ctesview'),
					btn1 = me.down('#delete'), 
					btn2 = me.down('#validar-cte-btn'),
					btn3 = me.down('#transmitir-cte-btn'),
					btn4 = me.down('#copy-btn'),
					btn5 = me.down('#arquivos-cte-btn'),
					btn6 = me.down('#status-cte-btn'),
					btn7 = me.down('#cancelar-cte-btn'),
					grid1 = tp.down('#cte-documento-grid'),
					grid2 = tp.down('#cte-ocorrencia-grid'),
					grid3 = tp.down('#cte-evento-grid'),
					grid4 = tp.down('#cte-motorista-grid'),
					store1 = grid1.getStore(),
					store2 = grid2.getStore(),
					store3 = grid3.getStore(),
					store4 = grid4.getStore(),
					proxy1 = store1.getProxy(),
					proxy2 = store2.getProxy(),
					proxy3 = store3.getProxy(),
					proxy4 = store4.getProxy();
					if (selections.length === 1) {
						var record = selections[0];
						tp.documentoCombo.setCteId(record.get('cte_id'));
						proxy1.setExtraParam('cte_id', record.get('cte_id'));
						proxy2.setExtraParam('cte_id', record.get('cte_id'));
						proxy3.setExtraParam('cte_id', record.get('cte_id'));
						proxy4.setExtraParam('cte_id', record.get('cte_id'));
						store1.load();
						store2.load();
						store3.load();
						store4.load();
						if (App.empresa.emp_tipo_emitente == 'ND') {
							btn2.setDisabled(true);
							btn3.setDisabled(true);
							btn5.setDisabled(true);
							btn6.setDisabled(true);
							btn7.setDisabled(true);
						} else {
							btn2.setDisabled(record.get('cte_situacao') != "DIGITAÇÃO");
							btn3.setDisabled(record.get('cte_situacao') != "VALIDADO");
							btn5.setDisabled(false);
							btn6.setDisabled(false);
							btn7.setDisabled(record.get('cte_situacao') != "AUTORIZADO");
						}
						if (App.empresa.emp_tipo_emitente == 'ND') {
							btn1.setDisabled(false);
						} else {
							btn1.setDisabled(record.get('cte_situacao').search(new RegExp("DIGITAÇÃO|VALIDADO","gi")) < 0);
						}
						btn4.setDisabled(false);
					} else if (selections.length > 1) {
						var STATUS = {TRANSMITIDO: 0, AUTORIZADO: 0, VALIDADO: 0, ARQUIVOS: 0};
						Ext.each(selections, function(record) {
							if (record.get('cte_situacao') == 'VALIDADO') {
								STATUS.VALIDADO ++;
							} else if (record.get('cte_situacao') == 'TRANSMITIDO') {
								STATUS.TRANSMITIDO ++;
							} else if (record.get('cte_situacao') == 'AUTORIZADO') {
								STATUS.AUTORIZADO ++;
							}
							if (record.get('cte_situacao').search(new RegExp("AUTORIZADO|CANCELADO", "gi")) > -1) {
								STATUS.ARQUIVOS ++;
							}
						});
						if (STATUS.VALIDADO > 0 && App.empresa.emp_tipo_emitente != 'ND') {
							btn3.setDisabled(false);
							btn3.setText('Transmitir (' + STATUS.VALIDADO + ')');
						} else {
							btn3.setText('Transmitir');
							btn3.setDisabled(true);
						}
						if (STATUS.AUTORIZADO > 0 && App.empresa.emp_tipo_emitente != 'ND') {
							btn7.setDisabled(false);
							btn7.setText('Cancelar (' + STATUS.AUTORIZADO + ')');
						} else {
							btn7.setText('Cancelar');
							btn7.setDisabled(true);
						}
						btn4.setDisabled(true);
						btn5.setDisabled(App.empresa.emp_tipo_emitente == 'ND');
						btn6.setDisabled(App.empresa.emp_tipo_emitente == 'ND');
					} else {
						btn1.setDisabled(true);
						btn2.setDisabled(true);
						btn3.setText('Transmitir');
						btn3.setDisabled(true);
						btn5.setText('Arquivos');
						btn5.setDisabled(true);
						btn6.setText('Status');
						btn6.setDisabled(true);
						btn7.setText('Cancelar');
						btn7.setDisabled(true);
						btn4.setDisabled(true);
						store1.removeAll();
						store2.removeAll();
						store3.removeAll();
						store4.removeAll();
						proxy1.setExtraParam('cte_id', 0);
						proxy2.setExtraParam('cte_id', 0);
						proxy3.setExtraParam('cte_id', 0);
						proxy4.setExtraParam('cte_id', 0);
					}
				}
			}
		});
		
		me.callParent(arguments);
		
		me.store.load({
			params: {
				cte_situacao: 'DIGITAÇÃO,VALIDADO,TRANSMITIDO'
			}
		});
	},
	
	onStatusChange: function(item, checked) {
		if (checked) {
			var menu = this.down('#view-filter');
			menu.setText('Exibindo (' + item.text.toLowerCase() + ')');
			if (!this.store.isLoading()) {
				this.store.getProxy().setExtraParam('status', item.text.toUpperCase());
				this.store.clearFilter(true);
				this.store.load();
			}
		}
	},
	
	toggleField: function(field) {
		field = field || 'cte_exibe_consulta_fatura';
		
		var selections = this.getView().getSelectionModel().getSelection();
		if (!selections.length) {
			App.noRecordsSelected();
			return false;
		}
		var data = new Array();
		Ext.each(selections, function(record) {
			if (record.get('cte_id') > 0 ) {
				data.push(record.get('cte_id'));
			}
		});
		if (!data.length) {
			return false;
		}
		Ext.Ajax.request({
			url: 'mod/conhecimentos/ctes/php/response.php',
			method: 'post',
			params: {
				m: 'toggle_cte_field',
				field: field,
				cte_list_id: data.join(',')
			},
			failure: App.ajaxFailure,
			success: function(response) {
				var o = Ext.decode(response.responseText);
				if (o.success) {
					Ext.each(selections, function(record){
						record.set(field, !record.get(field));
					});
				} else {
					App.warning(o);
				}
			}
		});
	}
});