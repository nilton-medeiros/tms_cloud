Ext.define('Romaneio.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.romaneiogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Romaneio.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sac/romaneios/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_romaneio'
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
				property: 'romaneio_data',
				direction: 'ASC'
			},{
				property: 'clie_razao_social',
				direction: 'ASC'
			}]	
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 2,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
				},
				edit: function(editor, e) {
					if (e.record.get('cliente_fk') > 0) {
						Ext.Ajax.request({
							url: 'mod/sac/romaneios/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_romaneio'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('romaneio_id', o.romaneio_id);
									e.record.commit();
								} else {
									e.record.reject();
									App.warning(o);
								}
							}
						});
					}
				}
			}
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableColumnHide: false,
			emptyText: 'Nenhum item encontrado',
			plugins: [me.editing],
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			features: [{
				ftype: 'filters',
	        	encode: true,
	        	local: false
	        }],
			columns: [{
				dataIndex: 'romaneio_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				tooltip: 'Número de identificação do romaneio',
				width: 70,
				filterable: true
			},{
				xtype: 'booleancolumn',
				dataIndex: 'romaneio_emitido',
				text: 'Emitido',
				tooltip: 'Flag que define se foi gerado a via de impressão do romaneio',
				align: 'center',
				trueText: 'Sim',
				falseText: 'Não',
				filterable: true,
				width: 80
			},{
				xtype: 'datecolumn',
				dataIndex: 'romaneio_data',
				text: 'Emitido em',
				tooltip: 'Data em que o romaneio foi gerado',
				align: 'right',
				format: 'D d/m/Y',
				width: 100,
				editor: {
					xtype: 'datefield',
					format: 'd/m/Y',
					allowBlank: false,
					selectOnFocus: true,
					maxValue: new Date()
				}
			},{
				dataIndex: 'romaneio_hora',
				text: 'Emitido às',
				tooltip: 'Hora em que o romaneio foi gerado',
				align: 'right',
				width: 100,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 6
				}
			},{
				dataIndex: 'clie_razao_social',
				text: 'Cliente',
				tooltip: 'Cliente emissor',
				width: 300,
				filterable: true,
				editor: {
					xtype: 'clientecombo',
					valueField: 'clie_razao_social',
					displayField: 'clie_razao_social',
					allowBlank: false,
					selectOnFocus: true,
					listeners: {
						reset: function() {
							me.activeRecord.set({
								cliente_fk: 0,
								clie_categoria: '',
								clie_nome_fantasia: '',
								clie_cnpj_cpf: '',
								clie_endereco: '',
								clie_bairro: '',
								clie_cep: '',
								clie_cidade: '',
								clie_uf: '',
								clie_cidade_uf: ''
							});
						},
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set({
								cliente_fk: record.get('clie_id'),
								clie_categoria: record.get('clie_categoria'),
								clie_nome_fantasia: record.get('clie_razao_social'),
								clie_cnpj_cpf: record.get('clie_cnpj_cpf'),
								clie_endereco: record.get('clie_logradouro') + ', ' + record.get('clie_numero') + ' ' + record.get('clie_complemento'),
								clie_bairro: record.get('clie_bairro'),
								clie_cep: record.get('clie_cep'),
								clie_cidade: record.get('cid_municipio'),
								clie_uf: record.get('cid_uf'),
								clie_cidade_uf: record.get('cid_municipio') + ' ' + record.get('cid_uf')
							});
						}
					}
				}
			},{
				dataIndex: 'clie_cidade_uf', 
				text: 'Cidade',
				tooltip: 'Cidade emissor',
				width: 150,
				filterable: true
			},{
				dataIndex: 'romaneio_nome_transportadora',
				text: 'Transportadora',
				tooltip: 'Nome da transportadora',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'combo',
					valueField: 'romaneio_nome_transportadora',
					displayField: 'romaneio_nome_transportadora',
					maxLength: 255,
					queryMode: 'local',
					typeAhead: false,
					forceSelection: false,
					store: Ext.create('Ext.data.Store', {
						fields: ['romaneio_nome_transportadora'],
						autoLoad: true,
						remoteSort: false,
						remoteGroup: false,
						remoteFilter: false,
						proxy: {
							type: 'ajax',
							url: 'mod/sac/romaneios/php/response.php',
							extraParams: {
								m: 'transportadora_store'
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
							property: 'romaneio_nome_transportadora',
							direction: 'ASC'
						}]
					}),
					listConfig: {
						minWidth: 200,
						resizable: true
					}
				}
			},{
				dataIndex: 'romaneio_nome_embarcador',
				text: 'Embarcador',
				tooltip: 'Nome do embarcador',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'combo',
					valueField: 'romaneio_nome_embarcador',
					displayField: 'romaneio_nome_embarcador',
					maxLength: 255,
					queryMode: 'local',
					typeAhead: false,
					forceSelection: false,
					store: Ext.create('Ext.data.Store', {
						fields: ['romaneio_nome_embarcador'],
						autoLoad: true,
						remoteSort: false,
						remoteGroup: false,
						remoteFilter: false,
						proxy: {
							type: 'ajax',
							url: 'mod/sac/romaneios/php/response.php',
							extraParams: {
								m: 'embarcador_store'
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
							property: 'romaneio_nome_embarcador',
							direction: 'ASC'
						}]
					}),
					listConfig: {
						minWidth: 200,
						resizable: true
					}
				}
			},{
				dataIndex: 'nf_volumes', 
				text: 'Volumes',
				align: 'center',
				tooltip: 'Quantidade total de volumes informado nas notas fiscais',
				width: 80,
				filterable: true
			},{
				dataIndex: 'nf_peso_real',
				text: 'Peso real',
				align: 'right',
				tooltip: 'Peso Real total em KG informado nas notas fiscais',
				width: 100,
				filterable: true,
				renderer: Ext.util.Format.brFloat
			},{
				dataIndex: 'nf_peso_cubado',
				text: 'Peso cubado',
				align: 'right',
				tooltip: 'Peso Cubado total em KG informado nas notas fiscais',
				width: 100,
				filterable: false,
				renderer: Ext.util.Format.brFloat
			},{
				dataIndex: 'nf_valor',
				text: 'Valor',
				tooltip: 'Valor total informado nas notas fiscais',
				align: 'right',
				width: 100,
				filterable: true,
				renderer: Ext.util.Format.brMoney
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Novo romaneio',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Romaneio.data.Model'));
						me.editing.startEditByPosition({row: 0, column: 2});
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
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
							if (record.get('romaneio_id') > 0) {
								id.push(record.get('romaneio_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/sac/romaneios/php/response.php',
							method: 'post',
							params: {
								m: 'delete_romaneio',
								romaneio_id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'-',{
					text: 'Imprimir',
					itemId: 'printer',
					iconCls: 'icon-printer',
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
							
						var id = [];
						Ext.each(selections, function(record) {
							if (record.get('romaneio_id') > 0) {
								id.push(record.get('romaneio_id'));
							}
						});
						if (!id.length) {
							return false;
						}
						
						var originalText = btn.getText();
						btn.setText('Gerando arquivos...');
						btn.setDisabled(true);
						
						Ext.Ajax.request({
							url: 'mod/sac/romaneios/php/response.php',
							method: 'post',
							params: {
								m: 'exportar_romaneio',
								romaneio_id: id.join(',')
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								
								btn.setDisabled(false);
								btn.setText(originalText);
								
								if (!o.success) {
									App.warning(o);
								} else if (!Ext.isEmpty(o.files)) {
									Ext.create('Ext.ux.Alert', {
										ui: 'black-alert',
										msg: 'O sitema gerou as vias de impressões em HTML e XLS. O que você deseja fazer com esse(s) arquivo(s)?',
										buttons: [{
											ui: 'blue-button',
											text: 'ABRIR HTML',
											autoClose: false,
											handler: function() {
												Ext.each(o.files, function(file){
													window.open(file.html);
												});
											}
										},{
											ui: 'green-button',
											text: 'ABRIR XLS',
											autoClose: false,
											handler: function() {
												Ext.each(o.files, function(file){
													window.open(file.xls);
												});
											}
										}]
									});
									Ext.each(selections, function(record) {
										record.set('romaneio_emitido', record.get('romaneio_id') > 0);
									});
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
							title: 'Romaneios',
							url: 'mod/sac/romaneios/php/response.php',
							action: 'export_xls',
							defaultData: [{
								pos: 1,
								id: 'romaneio_id',
								field: 'Nº Romaneio'
							},{
								pos: 2,
								id: 'romaneio_data',
								field: 'Emitido em',
								sort_id: 'ASC',
								sort_label: 'Crescente'
							},{
								pos: 3,
								id: 'romaneio_hora',
								field: 'Emitido às',
								sort_id: 'ASC',
								sort_label: 'Crescente'
							},{
								pos: 4,
								id: 'clie_razao_social',
								field: 'Cliente'
							},{
								pos: 5,
								id: 'clie_cidade_uf',
								field: 'Cidade'
							},{
								pos: 6,
								id: 'romaneio_nome_transportadora',
								field: 'Transportadora'
							},{
								pos: 7,
								id: 'romaneio_nome_embarcador',
								field: 'Embarcador'
							},{
								pos: 8,
								id: 'nf_volumes',
								field: 'Volumes'
							},{
								pos: 9,
								id: 'nf_peso_real',
								field: 'Peso real (kg)'
							},{
								pos: 10,
								id: 'nf_peso_cubado',
								field: 'Peso cubado (kg)'
							},{
								pos: 11,
								id: 'nf_valor',
								field: 'Valor (R$)'
							}],
							fields: [{
								id: 'romaneio_id',
								field: 'Nº Romaneio'
							},{
								id: 'romaneio_data',
								field: 'Emitido em'
							},{
								id: 'romaneio_hora',
								field: 'Emitido às'
							},{
								id: 'clie_razao_social',
								field: 'Cliente'
							},{
								id: 'clie_cidade_uf',
								field: 'Cidade'
							},{
								id: 'romaneio_nome_transportadora',
								field: 'Transportadora'
							},{
								id: 'romaneio_nome_embarcador',
								field: 'Embarcador'
							},{
								id: 'nf_volumes',
								field: 'Volumes'
							},{
								id: 'nf_peso_real',
								field: 'Peso real (kg)'
							},{
								id: 'nf_peso_cubado',
								field: 'Peso cubado (kg)'
							},{
								id: 'nf_valor',
								field: 'Valor (R$)'
							}]
						});
					}
				},'->',{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: [
						'clie_razao_social', 
						'romaneio_nome_embarcador', 
						'romaneio_nome_transportadora',
						'clie_cidade_uf'
					]
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: me.store,
				displayInfo: true
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0);
					me.down('#printer').setDisabled(selections.length === 0);
					var record = selections.length === 1 ? selections[0] : null,
					tab = me.up('romaneioview'),
					panel = tab.down('#east-panel'),
					grid1 = panel.down('romaneionfgrid'),
					grid2 = panel.down('romaneioveiculogrid');
					if (record) {
						grid1.setRomaneioId(record.get('romaneio_id'));
						grid2.setRomaneioId(record.get('romaneio_id'));
					} else {
						grid1.setRomaneioId(0);
						grid2.setRomaneioId(0);
					}
				}
			}
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Romaneio.NF.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.romaneionfgrid',
	
	romaneio_id: 0,
	setRomaneioId: function(romaneio_id) {
		var me = this, store = me.store, proxy = store.getProxy();
		me.romaneio_id = romaneio_id;
		proxy.setExtraParam('romaneio_id', romaneio_id);
		if (romaneio_id > 0) {
			store.load();
		} else {
			store.removeAll();
		}
	},
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Romaneio.NF.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sac/romaneios/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_notas_fiscais',
					romaneio_id: me.romaneio_id
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
				property: 'nf_numero',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.romaneio_id > 0;
				}
			}
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 1,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
					return e.record.get('romaneio_fk') > 0;
				},
				edit: function(editor, e) {
					if (e.record.get('romaneio_fk') > 0 && !Ext.isEmpty(e.record.get('nf_destinatario')) && !Ext.isEmpty(e.record.get('nf_cidade'))) {
						Ext.Ajax.request({
							url: 'mod/sac/romaneios/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_nota_fiscal'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('nf_id', o.nf_id);
									e.record.commit();
								} else {
									e.record.reject();
									App.warning(o);
								}
							}
						});
					}
				}
			}
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableColumnHide: false,
			emptyText: 'Nenhum item encontrado',
			plugins: [me.editing],
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			features: [{
				ftype: 'filters',
	        	local: true
	        }],
			columns: [{
				dataIndex: 'nf_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'nf_numero',
				text: 'Nota Fiscal',
				tooltip: 'Número da nota fiscal',
				align: 'right',
				width: 90,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 45
				}
			},{
				dataIndex: 'nf_volumes', 
				text: 'Volumes',
				align: 'center',
				tooltip: 'Volumes de mercadoria',
				align: 'center',
				width: 80,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 1
				}
			},{
				dataIndex: 'nf_peso_real',
				text: 'Peso real',
				align: 'right',
				tooltip: 'Peso Real em KG',
				width: 100,
				filterable: true,
				renderer: Ext.util.Format.brFloat,
				editor: {
					xtype: 'decimalfield',
					minValue: 0
				}
			},{
				dataIndex: 'nf_peso_cubado',
				text: 'Peso cubado',
				align: 'right',
				tooltip: 'Peso Cubado em KG',
				width: 100,
				filterable: true,
				renderer: Ext.util.Format.brFloat,
				editor: {
					xtype: 'decimalfield',
					minValue: 0
				}
			},{
				dataIndex: 'nf_valor',
				text: 'Valor',
				tooltip: 'Valor da nota fiscal',
				align: 'right',
				width: 100,
				filterable: true,
				renderer: Ext.util.Format.brMoney,
				editor: {
					xtype: 'decimalfield',
					minValue: 0
				}
			},{
				dataIndex: 'nf_destinatario',
				text: 'Destinatário',
				tootlip: 'Nome do destinatário',
				width: 300,
				filterable: true,
				editor: {
					xtype: 'clientecombo',
					valueField: 'clie_razao_social',
					displayField: 'clie_razao_social',
					allowBlank: false,
					selectOnFocus: true,
					listeners: {
						reset: function() {
							me.activeRecord.set('nf_cidade', '');
						},
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('nf_cidade', record.get('cid_municipio') + ' ' + record.get('cid_uf'));
						}
					}
				}
			},{
				dataIndex: 'nf_cidade',
				text: 'Cidade UF',
				tooltip: 'Cidade UF referente ao destinatário',
				width: 150,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 45
				}
			},{
				dataIndex: 'nf_local_entrega',
				text: 'Entrega',
				tooltip: 'Local de entrega',
				width: 150,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 45
				}
			},{
				dataIndex: 'nf_notas',
				text: 'Observações',
				width: 300,
				filterable: true,
				editor: {
					xtype: 'textareafield',
					grow: true,
					allowBlank: true,
					selectOnFocus: true
				}
			},{
				dataIndex: 'nf_numero_ri',
				text: 'Nº RI',
				align: 'right',
				tooltip: 'Número da requisição interna',
				width: 60,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 45
				}
			},{
				dataIndex: 'nf_numero_rm',
				text: 'Nº RM',
				align: 'right',
				tooltip: 'Número da requisição de material',
				width: 60,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 45
				}
			},{
				xtype: 'datecolumn',
				dataIndex: 'nf_data_limite',
				text: 'Data limite',
				align: 'right',
				format: 'D d/m/Y',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'datefield',
					format: 'd/m/Y',
					allowBlank: false,
					selectOnFocus: true
				}
			},{
				dataIndex: 'nf_modal',
				text: 'Modal',
				width: 100,
				filter: {
					type: 'list',
					options: ['AEREO','RODOVIARIO']
				},
				editor: {
					xtype: 'localcombo',
					options: ['AEREO','RODOVIARIO']
				}
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Incluir',
					handler: function() {
						if (!me.romaneio_id) {
							return false;
						}
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Romaneio.NF.data.Model', {
							romaneio_fk: me.romaneio_id,
							nf_local_entrega: 'O MESMO'
						}));
						me.editing.startEditByPosition({row: 0, column: 1});
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
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
							if (record.get('nf_id') > 0) {
								id.push(record.get('nf_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/sac/romaneios/php/response.php',
							method: 'post',
							params: {
								m: 'delete_nota_fiscal',
								nf_id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				}]
			},{
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
					text: 'Atualizar',
					iconCls: 'x-tbar-loading',
					handler: function(btn) {
						if (me.romaneio_id > 0) {
							var originalText = btn.getText(), refreshText = 'Atualizando...';
							btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
							me.store.reload({
								callback: function() {
									btn.setText(originalText);
								}
							});
						} else {
							me.store.removeAll();
						}
					}
				}]
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0);
				}
			}
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Romaneio.Veiculo.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.romaneioveiculogrid',
	
	romaneio_id: 0,
	setRomaneioId: function(romaneio_id) {
		var me = this, store = me.store, proxy = store.getProxy();
		me.romaneio_id = romaneio_id;
		proxy.setExtraParam('romaneio_id', romaneio_id);
		if (romaneio_id > 0) {
			store.load();
		} else {
			store.removeAll();
		}
	},
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Romaneio.Veiculo.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sac/romaneios/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_veiculos',
					romaneio_id: me.romaneio_id
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
				property: 'veiculo_nome',
				direction: 'ASC'
			},{
				property: 'veiculo_placa',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.romaneio_id > 0;
				}
			}
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 1,
			listeners: {
				beforeedit: function(editor, e) {
					return e.record.get('romaneio_fk') > 0;
				},
				edit: function(editor, e) {
					if (e.record.get('romaneio_fk') > 0) {
						Ext.Ajax.request({
							url: 'mod/sac/romaneios/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_veiculo'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('veiculo_id', o.veiculo_id);
									e.record.commit();
								} else {
									e.record.reject();
									App.warning(o);
								}
							}
						});
					}
				}
			}
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableColumnHide: false,
			emptyText: 'Nenhum item encontrado',
			plugins: [me.editing],
			features: [{
				ftype: 'filters',
	        	local: true
	        }],
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			columns: [{
				dataIndex: 'veiculo_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'veiculo_nome',
				text: 'Veículo',
				tooltip: 'Nome do veículo',
				width: 150,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 45
				}
			},{
				dataIndex: 'veiculo_placa', 
				text: 'Placa',
				tooltip: 'Número da placa do veículo',
				width: 70,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 10
				}
			},{
				dataIndex: 'veiculo_motorista',
				text: 'Motorista',
				tooltip: 'Nome do motorista',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 45
				}
			},{
				dataIndex: 'veiculo_ajudantes',
				text: 'Ajudantes',
				align: 'center',
				tooltip: 'Número de ajudantes',
				width: 90,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 99999
				}
			},{
				xtype: 'datecolumn',
				dataIndex: 'veiculo_data_saida',
				text: 'Saída em',
				align: 'right',
				format: 'D d/m/Y',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'datefield',
					format: 'd/m/Y',
					allowBlank: false,
					selectOnFocus: true
				}
			},{
				dataIndex: 'veiculo_hora_saida',
				text: 'Saída às',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 6
				}
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Incluir',
					handler: function() {
						if (!me.romaneio_id) {
							return false;
						}
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Romaneio.Veiculo.data.Model', {
							romaneio_fk: me.romaneio_id
						}));
						me.editing.startEditByPosition({row: 0, column: 1});
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
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
							if (record.get('veiculo_id') > 0) {
								id.push(record.get('veiculo_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/sac/romaneios/php/response.php',
							method: 'post',
							params: {
								m: 'delete_veiculo',
								veiculo_id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				}]
			},{
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
					text: 'Atualizar',
					iconCls: 'x-tbar-loading',
					handler: function(btn) {
						if (me.romaneio_id > 0) {
							var originalText = btn.getText(), refreshText = 'Atualizando...';
							btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
							me.store.reload({
								callback: function() {
									btn.setText(originalText);
								}
							});
						} else {
							me.store.removeAll();
						}
					}
				}]
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0);
				}
			}
		});
		
		me.callParent(arguments);
	}
});