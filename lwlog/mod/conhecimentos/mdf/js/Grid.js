Ext.define("MDFGerar.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.mdfgerarpanel',
	
	onSuccess: Ext.emptyFn,
	
	initComponent: function() {
		var me = this, activeRecord, store = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name:'tpEmit', type:'int', defaultValue:1},
				{name:'tpEmit_rotulo', type:'string', defaultValue:'Prestador de serviço de transporte'},
				{name:'codAgPorto', type:'string', defaultValue:''},
				
				{name:'cte_id', type:'int', defaultValue:0},
				{name:'cte_ciot', type:'int', defaultValue:0},
				{name:'cte_serie', type:'int', defaultValue:0},
				{name:'cte_minuta', type:'int', defaultValue:0},
				{name:'cte_numero', type:'string', defaultValue:''},
				{name:'cte_peso_bruto', type:'float', defaultValue:0},
				{name:'cte_valor_total', type:'float', defaultValue:0},
				{name:'cte_valor_carga', type:'float', defaultValue:0},
				{name:'cid_origem_uf', type:'string', defaultValue:''},
				{name:'cid_destino_uf', type:'string', defaultValue:''},
				{name:'cte_info_fisco', type:'string', defaultValue:''},
				{name:'cte_obs_gerais', type:'string', defaultValue:''},
				{name:'cid_origem_nome_completo', type:'string', defaultValue:''},
				{name:'cid_destino_nome_completo', type:'string', defaultValue:''},
				{name:'cte_data_hora_emissao', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue: new Date()}
			],
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			listeners: {
				beforeload: function() {
					var params = this.getProxy().extraParams;
					return !Ext.isEmpty(params.periodo_inicial) && !Ext.isEmpty(params.periodo_final);
				}
			},
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/mdf/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_ctes_aberto',
					periodo_inicial: null,
					periodo_final: null
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
				property: 'cid_origem_nome_completo',
				direction: 'ASC'
			},{
				property: 'cid_destino_nome_completo',
				direction: 'ASC'
			}]
		});
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				xtype: 'form',
				region: 'north',
				split: false,
				collapsed: false,
				collapsible: false,
				border: false,
				bodyBorder: false,
				bodyPadding: 10,
				height: 100,
				layout: {
					type: 'hbox',
					defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
				},
				defaults: {
					flex: 1,
					labelAlign: 'top',
					selectOnFocus: true,
					listeners: {
						specialkey: function(f, e) {
							if (e.getKey() == e.ENTER) {
								f.up('form').down('#buscar-btn').click();
							}
						}
					}
				},
				defaultType: 'textfield',
				items: [{
					xtype: 'datefield',
					fieldLabel: 'Data de emissão inicial',
					format: 'd/m/Y',
					vtype: 'daterange',
					name: 'periodo_inicial',
					itemId: 'periodo_inicial',
					endDateField: 'periodo_final',
					allowBlank: false
				},{
					xtype: 'datefield',
					fieldLabel: 'Data de emissão final',
					format: 'd/m/Y',
					vtype: 'daterange',
					name: 'periodo_final',
					itemId: 'periodo_final',
					startDateField : 'periodo_inicial',
					allowBlank: false
				},{
					xtype: 'localcombo',
					fieldLabel: 'UF Origem',
					name: 'cid_origem_uf',
					itemId: 'cid_origem_uf',
					options: ['AC','AL','AM','AP','BA','CE','DF','ES','EX','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
				},{
					xtype: 'localcombo',
					fieldLabel: 'UF Destino',
					name: 'cid_destino_uf',
					itemId: 'cid_destino_uf',
					options: ['AC','AL','AM','AP','BA','CE','DF','ES','EX','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
				}],
				buttons: [{
					itemId: 'buscar-btn',
					text: 'Buscar',
					formBind: true,
					handler: function() {
						var btn = this, originalText = btn.getText(), form = btn.up('form').getForm(), proxy = store.getProxy();
						proxy.setExtraParam('cid_origem_uf', form.findField('cid_origem_uf').getValue());
						proxy.setExtraParam('cid_destino_uf', form.findField('cid_destino_uf').getValue());
						proxy.setExtraParam('periodo_inicial', form.findField('periodo_inicial').getValue());
						proxy.setExtraParam('periodo_final', form.findField('periodo_final').getValue());
						btn.setText('Buscando...');
						btn.setDisabled(true);
						store.load({
							callback: function() {
								btn.setDisabled(false);
								btn.setText(originalText);
							}
						});
					}
				}]
			},{
				xtype: 'grid',
				region: 'center',
				title: 'Conhecimentos (CT-e)',
				store: store,
				multiSelect: true,
				sortableColumns: false,
				enableColumnHide: false,
				enableColumnMove: false,
				features: [{
					ftype: 'filters',
	        		local: true
				}],
				plugins: Ext.create('Ext.grid.plugin.CellEditing',{
					clicksToEdit: 1,
					listeners: {
						beforeedit: function(editor, e) {
							activeRecord = e.record;
						}
					}
				}),
				columns: [{
					width: 80,
					dataIndex: 'cte_id',
					tdCls: 'x-grid-cell-special',
					text: 'ID',
					align: 'right',
					filterable: true
				},{
					width: 80,
					dataIndex: 'cte_serie',
					text: 'Série',
					tooltip: 'Série do CT-e',
					align: 'right',
					filterable: true
				},{
					width: 90,
					dataIndex: 'cte_numero',
					text: 'Número',
					tooltip: 'Número do CT-e',
					align: 'right',
					filterable: true
				},{
					width: 70,
					dataIndex: 'cte_minuta',
					text: 'Minuta',
					tooltip: 'Número da minuta ou ordem de coleta',
					align: 'right',
					filterable: true
				},{
					width: 150,
					xtype: 'datecolumn',
					dataIndex: 'cte_data_hora_emissao',
					text: 'Emitido em',
					format: 'D d/m/Y H:i',
					tooltip: 'Data/Hora da emissão do CT-e',
					align: 'right',
					filterable: true
				},{
					width: 150,
					dataIndex: 'cte_valor_total',
					text: 'Valor',
					tooltip: 'Valor total do conhecimento',
					align: 'right',
					filterable: true,
					renderer: Ext.util.Format.brMoney
				},{
					width: 200,
					dataIndex: 'cid_origem_nome_completo',
					text: 'Origem',
					filterable: true
				},{
					width: 200,
					dataIndex: 'cid_destino_nome_completo',
					text: 'Destino',
					filterable: true
				},{
					width: 220,
					dataIndex: 'tpEmit_rotulo',
					text: 'Tipo do emitente',
					tdCls: 'yellowcol',
					filterable: true,
					editor: {
						xtype: 'localcombo',
						valueField: 'field',
						allowBlank: false,
						options: [{
							id: 1,
							field: 'Prestador de serviço de transporte'
						},{
							id: 2,
							field: 'Transportador de Carga Própria'
						}],
						listeners: {
							select: function(field, records) {
								var record = records[0];
								activeRecord.set("tpEmit", record.get("id"));
							}
						}
					}
				},{
					width: 180,
					dataIndex: 'codAgPorto',
					text: 'Código agendamento no porto',
					tdCls: 'yellowcol',
					filterable: true,
					editor: {
						xtype: 'textfield',
						allowBlank: true,
						selectOnFocus: true
					}
				},{
					width: 200,
					dataIndex: 'cte_info_fisco',
					text: 'Fisco',
					tooltip: 'Informações adicionais de interesse do Fisco',
					tdCls: 'yellowcol',
					filterable: true,
					editor: {
						xtype: 'textfield',
						allowBlank: true,
						selectOnFocus: true
					}
				},{
					width: 300,
					dataIndex: 'cte_obs_gerais',
					text: 'Observações',
					tooltip: 'Informações complementares de interesse do Contribuinte',
					tdCls: 'yellowcol',
					filterable: true,
					editor: {
						xtype: 'textfield',
						allowBlank: true,
						selectOnFocus: true
					}
				}],
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						text: 'Aplicar',
						tooltip: 'Aplica o valor do primeiro registro selecionado para os registros selecionados',
						iconCls: 'icon-checkmark',
						handler: function() {
							var selections = me.down('grid').getView().getSelectionModel().getSelection();
							if (selections.length < 1) return false;
							var record = selections[0];
							Ext.each(selections, function(item){
								item.set({
									tpEmit: record.get("tpEmit"),
									tpEmit_rotulo: record.get("tpEmit_rotulo"),
									codAgPorto: record.get("codAgPorto"),
									cte_info_fisco: record.get("cte_info_fisco"),
									cte_obs_gerais: record.get("cte_obs_gerais"),
								});
							});
						}
					}]
				},{
					xtype: 'toolbar',
					dock: 'bottom',
					items: [{
						iconCls: 'icon-minus',
						text: 'Excluir',
						itemId: 'delete',
						disabled: true,
						handler: function() {
							var selections = me.down('grid').getView().getSelectionModel().getSelection();
							if (!selections.length) {
								App.noRecordsSelected();
								return false;
							}
							store.remove(selections);
						}
					}]
				}],
				listeners: {
					selectionchange: function(selModel, selections) {
						me.down('grid').down('#delete').setDisabled(selections.length === 0);
					}
				}
			},{
				xtype: 'form',
				region: 'south',
				split: false,
				collapsed: false,
				collapsible: false,
				border: false,
				bodyBorder: false,
				bodyPadding: 10,
				height: 100,
				layout: {
					type: 'hbox',
					defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
				},
				defaults: {
					flex: 1,
					labelAlign: 'top',
					selectOnFocus: true
				},
				defaultType: 'textfield',
				items: [{
					xtype: 'localcombo',
					fieldLabel: 'Tipo do emitente',
					name: 'tpEmit',
					itemId: 'tpEmit',
					allowBlank: false,
					value: 1,
					options: [{
						id: 1,
						field: 'Prestador de serviço de transporte'
					},{
						id: 2,
						field: 'Transportador de Carga Própria'
					}]
				},{
					xtype: 'textfield',
					fieldLabel: 'Código agendamento no porto',
					name: 'codAgPorto',
					itemId: 'codAgPorto',
					allowBlank: true
				},{
					xtype: 'textfield',
					fieldLabel: 'Informações adicionais de interesse do Fisco',
					name: 'infAdFisco',
					itemId: 'infAdFisco',
					allowBlank: true
				},{
					xtype: 'textfield',
					fieldLabel: 'Informações complementares de interesse do Contribuinte',
					name: 'infCpl',
					itemId: 'infCpl',
					allowBlank: true
				}],
				buttons: [{
					text: 'APLICAR',
					formBind: true,
					handler: function() {
						var form = this.up('form').getForm();
						store.each(function(record) {
							record.set({
								tpEmit: form.findField("TpEmit").getSubmitValue(),
								tpEmit_rotulo: form.findField("tpEmit").getRawValue(),
								codAgPorto: form.findField("codAgPorto").getValue(),
								cte_info_fisco: form.findField("infAdFisco").getValue(),
								cte_obs_gerais: form.findField("infCpl").getValue()
							});
						});
					}
				}]
			}],
			buttons: [{
				text: 'GERAR MDF-e',
				scale: 'medium',
				handler: function() {
					var records = [];
					store.each(function(record) {
						records.push(record.data);
					});
					var btn = this, originalText = btn.getText();
					btn.setDisabled(true);
					btn.setText('GERANDO...');
					Ext.Ajax.request({
						url: 'mod/conhecimentos/mdf/php/response.php',
						method: 'post',
						params: {
							m: 'gerar_mdf',
							records: Ext.encode(records)
						},
						failure: Ext.Function.createSequence(App.ajaxFailure, function(){
							btn.setDisabled(false);
							btn.setText(originalText);
						}),
						success: function(response) {
							btn.setDisabled(false);
							btn.setText(originalText);
							var o = Ext.decode(response.responseText);
							if (o.success) {
								store.removeAll();
								if (Ext.isFunction(me.onSuccess)) {
									me.onSuccess(o.mdf_list_id);
								}
							} else {
								e.record.reject();
								App.warning(o);
							}
						}
					});
				}
			}]
		});
		
		this.callParent(arguments);
	}
});

Ext.define('MDFE.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.mdfesgrid',
	
	initComponent: function() {
		var me = this, statusRenderer = function(value, metaData, record) {
			switch (record.get('situacao')) {
				case 'TRANSMITIDO': metaData.tdCls = 'yellowcol'; break;
				case 'AUTORIZADO': metaData.tdCls = 'bluecol'; break;
				case 'ENCERRADO': metaData.tdCls = 'greencol'; break;
				case 'REJEITADO': metaData.tdCls = 'redcol'; break;
				case 'CANCELADO': metaData.tdCls = 'graycol'; break;
			}
			metaData.tdAttr = 'data-qtip="Número: ' + record.get('nMDF') + ' / Série: ' + record.get('serie') + '<br/>' + record.get('situacao') + ' "';
			return value;
		};
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'MDFE.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 30,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/mdf/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_mdfe',
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
				property: 'id',
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
	        		dataIndex: 'id',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'serie',
	        		type: 'string'
	        	},{
	        		dataIndex: 'nMDF',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cMDF',
	        		type: 'string'
	        	},{
	        		dataIndex: 'dhEmi',
	        		type: 'date'
	        	},{
	        		dataIndex: 'tpEmit_rotulo',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['Prestador de serviço de transporte','Transportador de Carga Própria']
	        	},{
	        		dataIndex: 'tpEmis_rotulo',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['Normal','Contigência']
	        	},{
	        		dataIndex: 'procEmi_rotulo',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['Emissão de MDF-e com aplicativo do contribuinte','Emissão MDF-e pelo contribuinte com aplicativo fornecido pelo Fisco']
	        	},{
	        		dataIndex: 'UFIni',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['AC','AL','AM','AP','BA','CE','DF','ES','EX','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
	        	},{
	        		dataIndex: 'UFFim',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['AC','AL','AM','AP','BA','CE','DF','ES','EX','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
	        	},{
	        		dataIndex: 'codAgPorto',
	        		type: 'string'
	        	},{
	        		dataIndex: 'qCTe',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'vCarga',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'cUnid_rotulo',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['KG','TON']
	        	},{
	        		dataIndex: 'qCarga',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'infAdFisco',
	        		type: 'string'
	        	},{
	        		dataIndex: 'infCpl',
	        		type: 'string'
	        	},{
	        		dataIndex: 'situacao',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['DIGITAÇÃO','TRANSMITIDO','AUTORIZADO','ENCERRADO','REJEITADO','CANCELADO']
	        	},{
	        		dataIndex: 'damdfe_impresso',
	        		type: 'boolean'
	        	},{
	        		dataIndex: 'email_enviado',
	        		type: 'boolean'
	        	},{
	        		dataIndex: 'cadastrado_por_nome',
	        		type: 'string'
	        	},{
	        		dataIndex: 'alterado_por_nome',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cadastrado_em',
	        		type: 'date'
	        	},{
	        		dataIndex: 'alterado_em',
	        		type: 'date'
	        	}]
	        }],
			columns: [{
				dataIndex: 'id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70
			},{
				dataIndex: 'tpEmit_rotulo',
				text: 'Emitente',
				tooltip: 'Tipo do emitente',
				width: 220
			},{
				dataIndex: 'mod',
				text: 'MOD',
				tooltip: 'Modelo do Manifesto Eletrônico',
				align: 'right',
				width: 50
			},{
				dataIndex: 'serie',
				text: 'Série',
				tooltip: 'Série do MDF-e',
				align: 'right',
				width: 70,
				renderer: statusRenderer
			},{
				dataIndex: 'nMDF',
				text: 'Número',
				tooltip: 'Número do MDF-e',
				align: 'right',
				width: 90,
				renderer: statusRenderer
			},{
				xtype: 'datecolumn',
				dataIndex: 'dhEmi',
				text: 'Emitido em',
				format: 'D d/m/Y H:i',
				tooltip: 'Data/Hora da emissão do MDF-e',
				align: 'right',
				width: 140
			},{
				dataIndex: 'tpEmis_rotulo',
				text: 'Emissão',
				tooltip: 'Format de emissão do MDF-e',
				width: 70,
				renderer: statusRenderer
			},{
				dataIndex: 'procEmi_rotulo',
				text: 'ID Processo',
				tooltip: 'Identificação do processo de emissão do MDF-e',
				width: 90,
				renderer: statusRenderer
			},{
				dataIndex: 'UFIni',
				text: 'Origem',
				tooltip: 'UF de origem',
				align: 'center',
				width: 70
			},{
				dataIndex: 'UFFim',
				text: 'Destino',
				tooltip: 'UF de destino',
				align: 'center',
				width: 70
			},{
				dataIndex: 'codAgPorto',
				text: 'Porto',
				tooltip: 'Código de Agendamento no porto',
				width: 80,
				renderer: statusRenderer
			},{
				dataIndex: 'qCTe',
				text: 'Conhecimentos',
				tooltip: 'Quantidade total de CT-e relacionados',
				align: 'right',
				width: 90,
				renderer: statusRenderer
			},{
				dataIndex: 'qCarga',
				text: 'Peso Carga',
				tooltip: 'Valor total do conhecimento',
				align: 'right',
				width: 120,
				renderer: Ext.util.Format.brFloat
			},{
				dataIndex: 'cUnid_rotulo',
				text: 'Unidade',
				tooltip: 'Tipo de unidade da carga',
				align: 'center',
				width: 70,
				renderer: statusRenderer
			},{
				dataIndex: 'vCarga',
				text: 'Valor Carga',
				tooltip: 'Valor total da carga',
				align: 'right',
				width: 100,
				renderer: Ext.util.Format.brMoney
			},{
				dataIndex: 'infAdFisco',
				text: 'Fisco',
				tooltip: 'Informações adicionais de interesse do Fisco',
				width: 200,
				renderer: statusRenderer
			},{
				dataIndex: 'infCpl',
				text: 'Informações',
				tooltip: 'Informações complementares de interesse do Contribuinte',
				width: 200,
				renderer: statusRenderer
			},{
				dataIndex: 'situacao',
				text: 'Situação',
				align: 'center',
				width: 125,
				renderer: statusRenderer
			},{
				dataIndex: 'cMDF',
				text: 'Chave de Acesso',
				tooltip: 'Chave única do MDF-e gerado pelo sistema/webservice.',
				align: 'right',
				width: 280,
				renderer: statusRenderer
			},{
				dataIndex: 'lista_ctes',
				text: 'Listagem de CT-e',
				width: 200,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + value + '"';
					return value;
				}
			},{
				xtype: 'templatecolumn',
				dataIndex: 'xml',
				text: 'XML',
				align: 'center',
				width: 90,
				sortable: false,
				menuDisabled: true,
				tpl: '<tpl if="xml"><a href="{xml}" target="_blank">ABRIR</a></tpl>'
			},{
				xtype: 'templatecolumn',
				dataIndex: 'pdf',
				text: 'PDF',
				align: 'center',
				width: 90,
				sortable: false,
				menuDisabled: true,
				tpl: '<tpl if="pdf"><a href="{pdf}" target="_blank">ABRIR</a></tpl>'
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200
				},{
					xtype: 'datecolumn',
					dataIndex: 'cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140
				},{
					dataIndex: 'alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140
				},{
					dataIndex: 'versao',
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
					tooltip: 'Gerar novos manifestos através dos conhecimentos autorizados existentes',
					handler: function() {
						var win = Ext.create('Ext.ux.Window', {
							ui: 'blue-window-active',
							title: 'Gerar Manifestos',
							width: 800,
							height: 600,
							autoShow: true,
							closable: true,
							maximized: true,
							minimizable: false,
							maximizable: true,
							resizable: true,
							layout: 'fit',
							items: {
								xtype: 'mdfgerarpanel',
								onSuccess: function(mdf_list_id) {
									win.close();
									me.store.load({params:{id:mdf_list_id}});
								}
							}
						});
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
					tooltip: 'Excluir manifestos selecionados',
					itemId: 'delete',
					disabled: true,
					handler: function() {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelemdfed();
							return false;
						}
							
						var id = [];
						Ext.each(selections, function(record) {
							if (record.get('id') > 0) {
								id.push(record.get('id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/conhecimentos/mdf/php/response.php',
							method: 'post',
							params: {
								m: 'delete_mdfe',
								id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'-',{
					text: 'Cancelar',
					iconCls: 'icon-cancel',
					itemId: 'cancelar-mdfe-btn',
					tooltip: 'Cancelar manifesto enviado para SEFAZ',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelemdfed();
							return false;
						}
						var ids = new Array();
						Ext.each(selections, function(record) {
							if (record.get('id') > 0 && record.get('situacao') == 'AUTORIZADO') {
								ids.push(record.get('id'));
							}
						});
						if (!ids.length) {
							return false;
						}
						var originalText = btn.getText();
						btn.setText('Cancelando...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/mdf/php/response.php',
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
									me.store.load({params: {id: ids.join(',')}});
								} else {
									App.warning(o);
								}
							}
						});
					}
				},{
					text: 'Transmitir',
					itemId: 'transmitir-mdfe-btn',
					iconCls: 'icon-tab',
					tooltip: 'Enviar MDF-e para SEFAZ',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelemdfed();
							return false;
						}
						var ids = new Array();
						Ext.each(selections, function(record) {
							if (record.get('id') > 0 && record.get('situacao').search(new RegExp("DIGITAÇÃO|REJEITADO", "gi")) > -1) {
								ids.push(record.get('id'));
							}
						});
						if (!ids.length) {
							return false;
						}
						var originalText = btn.getText();
						btn.setText('Transmitindo...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/mdf/php/response.php',
							method: 'post',
							params: {
								m: 'transmitir',
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
									me.store.load({params: {id: ids.join(',')}});
								} else {
									App.warning(o);
								}
							}
						});
					}
				},'-',{
					text: 'Status',
					iconCls: 'icon-loop',
					itemId: 'status-mdfe-btn',
					tooltip: 'Verifica o status na SEFAZ',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelemdfed();
							return false;
						}
						var ids = new Array();
						Ext.each(selections, function(record) {
							if (record.get('id') > 0 && record.get('situacao') == 'TRANSMITIDO') {
								ids.push(record.get('id'));
							}
						});
						if (!ids.length) {
							return false;
						}
						var originalText = btn.getText();
						btn.setText('Verificando...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/mdf/php/response.php',
							method: 'post',
							params: {
								m: 'verifica',
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
									me.store.load({params: {id: ids.join(',')}});
								} else {
									App.warning(o);
								}
							}
						});
					}
				},'-',{
					text: 'Encerrar',
					iconCls: 'icon-checkmark',
					itemId: 'encerrar-mdfe-btn',
					tooltip: 'Encerrar manifesto enviado para SEFAZ',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelemdfed();
							return false;
						}
						var ids = new Array();
						Ext.each(selections, function(record) {
							if (record.get('id') > 0 && record.get('situacao') == 'AUTORIZADO') {
								ids.push(record.get('id'));
							}
						});
						if (!ids.length) {
							return false;
						}
						var originalText = btn.getText();
						btn.setText('Verificando...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/conhecimentos/mdf/php/response.php',
							method: 'post',
							params: {
								m: 'encerrar',
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
									me.store.load({params: {id: ids.join(',')}});
								} else {
									App.warning(o);
								}
							}
						});
					}
				},'->',{
					itemId: 'view-filter',
					text: 'Exibindo (últimos 90 dias)',
					iconCls: 'icon-glasses-2',
					menu: {
						items: [{
							text: 'Todos',
							group: 'status-mdfe',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						},'-',{
							text: 'Últimos 90 dias',
							group: 'status-mdfe',
							checked: true,
							scope: this,
							checkHandler: this.onStatusChange
						},{
							text: 'Últimos 180 dias',
							group: 'status-mdfe',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						},{
							text: 'Últimos 365 dias',
							group: 'status-mdfe',
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
					fields: ['nMDF','cMDF','lista_ctes']
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: me.store,
				displayInfo: true,
				items: ['-',{
					text: 'Exportar XLS',
					iconCls: 'icon-file-excel',
					tooltip: 'Exportar registros para o formato xls',
					handler: function() {
						Ext.create('Export.Window', {
							title: 'Manifestos (MDF-e)',
							url: 'mod/conhecimentos/mdf/php/response.php',
							action: 'export_xls',
							defaultData: [{
								pos: 1,
								id: 'mdfe_numero',
								field: 'Número',
								sort_id: 'ASC',
								sort_label: 'Crescente'
							},{
								pos: 2,
								id: 'mdfe_data_hora_emissao',
								field: 'Emitido em'
							},{
								pos: 3,
								id: 'situacao',
								field: 'Situação'
							},{
								pos: 4,
								id: 'rem_razao_social',
								field: 'Remetente (razão social)'
							},{
								pos: 5,
								id: 'cid_origem_municipio',
								field: 'Cidade Origem (município)'
							},{
								pos: 6,
								id: 'cid_origem_uf',
								field: 'UF Origem'
							},{
								pos: 7,
								id: 'des_razao_social',
								field: 'Destinatário'
							},{
								pos: 8,
								id: 'cid_destino_municipio',
								field: 'Cidade Destino (município)'
							},{
								pos: 9,
								id: 'cid_destino_uf',
								field: 'UF Destino'
							},{
								pos: 10,
								id: 'tom_razao_social',
								field: 'Tomador (razão social)'
							},{
								pos: 11,
								id: 'lista_documentos_numeros',
								field: 'Nº Documentos'
							},{
								pos: 12,
								id: 'mdfe_qtde_volumes',
								field: 'Volumes'
							},{
								pos: 13,
								id: 'mdfe_peso_bruto',
								field: 'Peso Bruto'
							},{
								pos: 14,
								id: 'mdfe_peso_cubado',
								field: 'Peso Cubado'
							},{
								pos: 15,
								id:'mdfe_peso_bc',
								field: 'Peso Taxado' 
							},{
								pos: 16,
								id: 'mdfe_valor_carga',
								field: 'Valor Carga'
							},{
								pos: 17,
								id: 'mdfe_valor_total',
								field: 'Valor MDF-e'
							},{
								pos: 18,
								id: 'mdfe_perc_entregue',
								field: 'Percentual Entregue'
							},{
								pos: 19,
								id: 'recebedor_nome',
								field: 'Recebedor'
							},{
								pos: 20,
								id: 'recebedor_doc',
								field: 'Recebedor (DOC)'
							},{
								pos: 21,
								id: 'mdfe_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								pos: 22,
								id: 'mdfe_obs_gerais',
								field: 'Observações Gerais'
							}],
							fields: [{
								id: 'mdfe_serie',
								field: 'Série'
							},{
								id: 'mdfe_numero',
								field: 'Número'
							},{
								id: 'mdfe_minuta',
								field: 'Minuta'
							},{
								id: 'mdfe_chave',
								field: 'Chave'
							},{
								id: 'mdfe_data_hora_emissao',
								field: 'Emitido em'
							},{
								id: 'mdfe_natureza_operacao',
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
								id: 'mdfe_tipo_do_mdfe_nome',
								field: 'Tipo MDF-e'
							},{
								id: 'mdfe_forma_pgto_nome',
								field: 'Forma Pagamento'
							},{
								id: 'mdfe_data_entrega_prevista',
								field: 'Data Entrega (prevista)'
							},{
								id: 'mdfe_data_entrega_efetuada',
								field: 'Data Entrega (efetuada)'
							},{
								id: 'mdfe_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								id: 'mdfe_perc_entregue',
								field: 'Percentual Entregue'
							},{
								id: 'mdfe_modal_nome',
								field: 'Modal'
							},{
								id: 'mdfe_forma_emissao_nome',
								field: 'Forma Emissão'
							},{
								id: 'mdfe_tabela_frete',
								field: 'Tabela Frete'
							},{
								id: 'mdfe_tipo_servico_nome',
								field: 'Tipo Serviço'
							},{
								id: 'mdfe_cfop',
								field: 'CFOP'
							},{
								id: 'mdfe_carac_adic_transp',
								field: 'Caramdferística adicional do transporte'
							},{
								id: 'mdfe_carac_adic_servico',
								field: 'Caramdferística adicional do serviço'
							},{
								id: 'mdfe_outras_carac_carga',
								field: 'Outras caramdferísticas do produto'
							},{
								id: 'produto_predominante_nome',
								field: 'Produto Predominante'
							},{
								id: 'situacao',
								field: 'Situação'
							},{
								id: 'mdfe_peso_bruto',
								field: 'Peso Bruto'
							},{
								id: 'mdfe_peso_cubado',
								field: 'Peso Cubado'
							},{
								id:'mdfe_peso_bc',
								field: 'Peso Taxado' 
							},{
								id: 'mdfe_cubagem_m3',
								field: 'Cubagem'
							},{
								id: 'mdfe_qtde_volumes',
								field: 'Volumes'
							},{
								id: 'mdfe_valor_carga',
								field: 'Valor Carga'
							},{
								id: 'mdfe_valor_total',
								field: 'Valor MDF-e'
							},{
								id: 'mdfe_aliquota_icms',
								field: 'Alíquota ICMS'
							},{
								id: 'mdfe_valor_icms',
								field: 'Valor ICMS'
							},{
								id: 'mdfe_data_hora_autorizacao',
								field: 'Autorizado em'
							},{
								id: 'mdfe_cadastrado_por_nome',
								field: 'Cadastrado por'
							},{
								id: 'mdfe_cadastrado_em',
								field: 'Cadastrado em'
							},{
								id: 'mdfe_alterado_por_nome',
								field: 'Alterado por'
							},{
								id: 'mdfe_alterado_em',
								field: 'Alterado em'
							},{
								id: 'mdfe_versao',
								field: 'Versão'
							},{
								id: 'mdfe_obs_gerais',
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
							title: 'Manifestos, Documentos/Notas/Recibos e Ocorrências (MDF-e)',
							url: 'mod/conhecimentos/mdf/php/response.php',
							action: 'export_txt',
							defaultData: [{
								pos: 1,
								id: 'mdfe_doc_numero',
								field: 'Número (DOC)'
							},{
								pos: 2,
								id:'mdfe_doc_serie', 
								field:'Série (DOC)'
							},{
								pos: 3,
								id: 'mdfe_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								pos: 4,
								id:'mdfe_ocor_quando_data', 
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
								id: 'mdfe_serie',
								field: 'Série'
							},{
								id: 'mdfe_numero',
								field: 'Número'
							},{
								id: 'mdfe_minuta',
								field: 'Minuta'
							},{
								id: 'mdfe_chave',
								field: 'Chave'
							},{
								id: 'mdfe_data_hora_emissao',
								field: 'Emitido em'
							},{
								id: 'mdfe_natureza_operacao',
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
								id: 'mdfe_tipo_do_mdfe_nome',
								field: 'Tipo MDF-e'
							},{
								id: 'mdfe_forma_pgto_nome',
								field: 'Forma Pagamento'
							},{
								id: 'mdfe_data_entrega_prevista',
								field: 'Data Entrega (prevista)'
							},{
								id: 'mdfe_data_entrega_efetuada',
								field: 'Data Entrega (efetuada)'
							},{
								id: 'mdfe_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								id: 'mdfe_perc_entregue',
								field: 'Percentual Entregue'
							},{
								id: 'mdfe_modal_nome',
								field: 'Modal'
							},{
								id: 'mdfe_forma_emissao_nome',
								field: 'Forma Emissão'
							},{
								id: 'mdfe_tabela_frete',
								field: 'Tabela Frete'
							},{
								id: 'mdfe_tipo_servico_nome',
								field: 'Tipo Serviço'
							},{
								id: 'mdfe_cfop',
								field: 'CFOP'
							},{
								id: 'mdfe_carac_adic_transp',
								field: 'Caramdferística adicional do transporte'
							},{
								id: 'mdfe_carac_adic_servico',
								field: 'Caramdferística adicional do serviço'
							},{
								id: 'mdfe_outras_carac_carga',
								field: 'Outras caramdferísticas do produto'
							},{
								id: 'produto_predominante_nome',
								field: 'Produto Predominante'
							},{
								id: 'situacao',
								field: 'Situação'
							},{
								id: 'mdfe_peso_bruto',
								field: 'Peso Bruto'
							},{
								id: 'mdfe_peso_cubado',
								field: 'Peso Cubado'
							},{
								id:'mdfe_peso_bc',
								field: 'Peso Taxado' 
							},{
								id: 'mdfe_cubagem_m3',
								field: 'Cubagem'
							},{
								id: 'mdfe_qtde_volumes',
								field: 'Volumes'
							},{
								id: 'mdfe_valor_carga',
								field: 'Valor Carga'
							},{
								id: 'mdfe_valor_total',
								field: 'Valor MDF-e'
							},{
								id: 'mdfe_aliquota_icms',
								field: 'Alíquota ICMS'
							},{
								id: 'mdfe_valor_icms',
								field: 'Valor ICMS'
							},{
								id: 'mdfe_data_hora_autorizacao',
								field: 'Autorizado em'
							},{
								id: 'mdfe_cadastrado_por_nome',
								field: 'Cadastrado por'
							},{
								id: 'mdfe_cadastrado_em',
								field: 'Cadastrado em'
							},{
								id: 'mdfe_alterado_por_nome',
								field: 'Alterado por'
							},{
								id: 'mdfe_alterado_em',
								field: 'Alterado em'
							},{
								id: 'mdfe_versao',
								field: 'Versão'
							},{
								id: 'mdfe_obs_gerais',
								field: 'Observações Gerais'
							},{
								id:'mdfe_doc_serie', 
								field:'Série (DOC)'
							},{
								id:'mdfe_doc_data_emissao',
								field:'Emissão (DOC)'
							},{
								id:'mdfe_doc_numero',
								field:'Número (DOC)'
							},{
								id:'mdfe_doc_cfop', 
								field:'CFOP (DOC)'
							},{
								id:'mdfe_doc_modelo', 
								field:'Modelo (DOC)'
							},{
								id:'mdfe_doc_volumes', 
								field:'Volumes (DOC)'
							},{
								id:'mdfe_doc_bc_icms',
								field:'BC ICMS (DOC)'
							},{
								id:'mdfe_doc_valor_icms',
								field:'Valor ICMS (DOC)'
							},{
								id:'mdfe_doc_bc_icms_st',
								field:'BC ISM ST (DOC)'
							},{
								id:'mdfe_doc_valor_icms_st',
								field:'Valor ICMS ST (DOC)'
							},{
								id:'mdfe_doc_peso_total', 
								field:'Peso Total (DOC)'
							},{
								id:'mdfe_doc_pin', 
								field:'PIN (DOC)'
							},{
								id:'mdfe_doc_valor_produtos', 
								field:'Valor Produtos (DOC)'
							},{
								id:'mdfe_doc_valor_nota', 
								field:'Valor (DOC)'
							},{
								id:'mdfe_doc_chave_nfe',
								field:'Chave (DOC)'
							},{
								id:'mdfe_doc_tipo_doc', 
								field:'Tipo (DOC)'
							},{
								id:'mdfe_doc_descricao', 
								field:'Descrição (DOC)'
							},{
								id:'mdfe_ocor_quando_data', 
								field:'Data (OCOR)'
							},{
								id:'mdfe_ocor_quando_hora', 
								field:'Hora (OCOR)'
							},{
								id:'mdfe_ocor_cia_aerea',
								field:'CIA (OCOR)'
							},{
								id:'mdfe_ocor_voo', 
								field:'Vôo (OCOR)'
							},{
								id:'mdfe_ocor_base', 
								field:'Base (OCOR)'
							},{
								id:'mdfe_ocor_serie_master', 
								field:'Série Master (OCOR)'
							},{
								id:'mdfe_ocor_numero_master', 
								field:'Número Master (OCOR)'
							},{
								id:'mdfe_ocor_operacional_master', 
								field:'Operacional Master (OCOR)'
							},{
								id:'mdfe_ocor_chave_master', 
								field:'Chave Master (OCOR)'
							},{
								id:'mdfe_ocor_volumes',
								field:'Volumes (OCOR)'
							},{
								id:'mdfe_ocor_peso_bruto',
								field:'Peso (OCOR)'
							},{
								id:'mdfe_ocor_entregador_nome',
								field:'Entregador (OCOR)'
							},{
								id:'mdfe_ocor_entregador_doc', 
								field:'Doc Entregador (OCOR)'
							},{
								id:'mdfe_ocor_recebedor_nome',
								field:'Recebedor (OCOR)'
							},{
								id:'mdfe_ocor_recebedor_doc',
								field:'Doc Recebedor (OCOR)'
							},{
								id:'mdfe_ocor_nota',
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
								id:'ocor_caramdferistica', 
								field:'Caramdferística (OCOR)'
							},{
								id:'ocor_nome', 
								field:'Nome (OCOR)'
							},{
								id:'ocor_modal_caramdferistica', 
								field:'Caramdferísitca Modal (OCOR)'
							}]
						});
					}
				}]
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					var mainPanel = me.up('mdfpanel').down('#east-panel'),
					btn1 = me.down('#delete'), 
					btn2 = me.down('#encerrar-mdfe-btn'),
					btn3 = me.down('#transmitir-mdfe-btn'),
					btn6 = me.down('#status-mdfe-btn'),
					btn7 = me.down('#cancelar-mdfe-btn'),
					grid1 = mainPanel.down('#mdfe-cte-grid'),
					grid2 = mainPanel.down('#mdfe-per-grid'),
					grid3 = mainPanel.down('#mdfe-evento-grid'),
					grid4 = mainPanel.down('#mdfe-mot-grid'),
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
						proxy1.setExtraParam('mdfe_id', record.get('id'));
						proxy2.setExtraParam('mdfe_id', record.get('id'));
						proxy3.setExtraParam('mdfe_id', record.get('id'));
						proxy4.setExtraParam('mdfe_id', record.get('id'));
						store1.load();
						store2.load();
						store3.load();
						store4.load();
						
						btn1.setDisabled(record.get('situacao').search(new RegExp("DIGITAÇÃO|REJEITADO")) < 0);
						btn2.setDisabled(record.get('situacao') != "AUTORIZADO");
						btn3.setDisabled(record.get('situacao').search(new RegExp("DIGITAÇÃO|REJEITADO")) < 0);
						
						btn6.setDisabled(record.get('situacao') != "TRANSMITIDO");
						btn7.setDisabled(record.get('situacao') != "AUTORIZADO");
					} else if (selections.length > 1) {
						var STATUS = {TRANSMITIDO: 0, AUTORIZADO: 0, VALIDADO: 0, ARQUIVOS: 0};
						Ext.each(selections, function(record) {
							if (record.get('situacao') == 'DIGITAÇÃO' || record.get('situacao') == 'REJEITADO') {
								STATUS.VALIDADO ++;
							} else if (record.get('situacao') == 'TRANSMITIDO') {
								STATUS.TRANSMITIDO ++;
							} else if (record.get('situacao') == 'AUTORIZADO') {
								STATUS.AUTORIZADO ++;
							}
							if (record.get('situacao').search(new RegExp("AUTORIZADO|CANCELADO", "gi")) > -1) {
								STATUS.ARQUIVOS ++;
							}
						});
						if (STATUS.VALIDADO > 0) {
							btn3.setDisabled(false);
							btn3.setText('Transmitir (' + STATUS.VALIDADO + ')');
						} else {
							btn3.setText('Transmitir');
							btn3.setDisabled(true);
						}
						
						if (STATUS.AUTORIZADO > 0) {
							btn2.setDisabled(false);
							btn2.setText('Encerrar (' + STATUS.AUTORIZADO + ')');
							btn7.setDisabled(false);
							btn7.setText('Cancelar (' + STATUS.AUTORIZADO + ')');
						} else {
							btn2.setText('Encerrar');
							btn2.setDisabled(true);
							btn7.setText('Cancelar');
							btn7.setDisabled(true);
						}
						if (STATUS.TRANSMITIDO > 0) {
							btn6.setDisabled(false);
							btn6.setText('Status (' + STATUS.TRANSMITIDO + ')');
						} else {
							btn6.setText('Status');
							btn6.setDisabled(true);
						}
					} else {
						btn1.setDisabled(true);
						btn2.setText('Encerrar');
						btn2.setDisabled(true);
						btn3.setText('Transmitir');
						btn3.setDisabled(true);
						btn6.setText('Status');
						btn6.setDisabled(true);
						btn7.setText('Cancelar');
						btn7.setDisabled(true);
						store1.removeAll();
						store2.removeAll();
						store3.removeAll();
						store4.removeAll();
						proxy1.setExtraParam('mdfe_id', 0);
						proxy2.setExtraParam('mdfe_id', 0);
						proxy3.setExtraParam('mdfe_id', 0);
						proxy4.setExtraParam('mdfe_id', 0);
					}
				}
			}
		});
		
		me.callParent(arguments);
		
		me.store.load({
			params: {
				situacao: 'DIGITAÇÃO,TRANSMITIDO'
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
	}
});