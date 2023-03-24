Ext.define('Veiculos.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.veiculosgrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Veiculos.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/veiculos/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_veiculo'
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
				property: 'placa',
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
					if (!Ext.isEmpty(e.record.get('placa'))) {
						Ext.Ajax.request({
							url: 'mod/cadastros/veiculos/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_veiculo'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('id', o.id);
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
				dataIndex: 'id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'placa',
				text: 'Placa',
				width: 80,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 7
				}
			},{
				dataIndex: 'RENAVAM',
				text: 'Renavam',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 11
				}
			},{
				dataIndex: 'tara',
				text: 'Tara (kg)',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'intfield',
					allowBlank: false,
					selectOnFocus: true,
					minValue: 0,
					maxValue: 999999
				}
			},{
				dataIndex: 'capKG',
				text: 'Capacidade (kg)',
				align: 'right',
				width: 120,
				filterable: true,
				editor: {
					xtype: 'intfield',
					allowBlank: false,
					selectOnFocus: true,
					minValue: 0,
					maxValue: 999999
				}
			},{
				dataIndex: 'capKG',
				text: 'Capacidade (m³)',
				align: 'right',
				width: 120,
				filterable: true,
				editor: {
					xtype: 'intfield',
					allowBlank: false,
					selectOnFocus: true,
					minValue: 0,
					maxValue: 999999
				}
			},{
				dataIndex: 'tpRod_rotulo',
				text: 'Tipo de Rodado',
				width: 150,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['Truck','Toco','Cavalo Mecânico','VAN','Utilitário','Outros','Reboque']
				},
				editor: {
					xtype: 'localcombo',
					valueField: 'field',
					editable: false,
					allowBlank: false,
					options: [{
						id: 1,
						field: 'Truck'
					},{
						id: 2,
						field: 'Toco'
					},{
						id: 3,
						field: 'Cavalo Mecânico'
					},{
						id: 4,
						field: 'VAN'
					},{
						id: 5,
						field: 'Utilitário'
					},{
						id: 6,
						field: 'Outros'
					},{
						id: 7,
						field: 'Reboque'
					}],
					listeners: {
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set('tpRod', record.get('id'));
						}
					}
				}
			},{
				dataIndex: 'tpCar_rotulo',
				text: 'Tipo de Carroceria',
				width: 150,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['não aplicável','Aberta','Fechada/Baú','Granelera','Porta Container','Sider']
				},
				editor: {
					xtype: 'localcombo',
					valueField: 'field',
					editable: false,
					allowBlank: false,
					options: [{
						id: 0,
						field: 'não aplicável'
					},{
						id: 1,
						field: 'Aberta'
					},{
						id: 2,
						field: 'Fechada/Baú'
					},{
						id: 3,
						field: 'Granelera'
					},{
						id: 4,
						field: 'Porta Container'
					},{
						id: 5,
						field: 'Sider'
					}],
					listeners: {
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set('tpCar', record.get('id'));
						}
					}
				}
			},{
				dataIndex: 'agre_nome',
				text: 'Proprietário',
				tooltip: 'Agregado',
				width: 250,
				filterable: true,
				editor: {
					xtype: 'agregadocombo',
					valueField: 'xNome',
					displayField: 'xNome',
					allowBlank: true,
					listeners: {
						reset: function() {
							me.record.set('agre_id', 0);
						},
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set({'agre_id': record.get('id'),'UF': record.get('UF')});
						}
					}
				}
			},{
				dataIndex: 'UF',
				text: 'UF',
				width: 50,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['AC','AL','AM','AP','BA','CE','DF','ES','EX','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
				},
				editor: {
					xtype: 'localcombo',
					allowBlank: false,
					options: ['AC','AL','AM','AP','BA','CE','DF','ES','EX','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'] 
				}
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Novo veículo',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Veiculos.data.Model'));
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
							if (record.get('id') > 0) {
								id.push(record.get('id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/veiculos/php/response.php',
							method: 'post',
							params: {
								m: 'delete_veiculo',
								id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'->',{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: ['nome','cpf','rg','celular','fone','email']
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
					if (selections.length === 1) {
						var record = selections[0], condutoresGrid = me.up('veiculospanel').down('veiculoscondutoresgrid');
						condutoresGrid.setVeiculosId(record.get('id'));
						condutoresGrid.setTitle('Condutores do veículo de placa: ' + record.get('placa'));
					}
				}
			}
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Veiculos.Condutores.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.veiculoscondutoresgrid',
	
	veiculos_id: 0,
	setVeiculosId: function(id) {
		var store = this.store, proxy = store.getProxy();
		if (id > 0 && id != this.veiculos_id) {
			proxy.setExtraParam('veiculos_id', id);
			this.veiculos_id = id;
			store.load();
		} else {
			store.clearFilter();
			store.removeAll();
		}
	},
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Veiculos.Condutores.data.Model',
			autoLoad: me.veiculos_id > 0,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.veiculos_id > 0;
				}
			},
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/veiculos/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_condutores',
					veiculos_id: me.veiculos_id
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
				property: 'nome',
				direction: 'ASC'
			}]
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 2,
			listeners: {
				beforeedit: function(editor, e) {
					if (e.record.get('moto_id') > 0) {
						return false;
					}
					me.activeRecord = e.record;
				},
				edit: function(editor, e) {
					if (e.record.get('veic_trac_id') > 0 && e.record.get('moto_id') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/veiculos/php/response.php',
							method: 'post',
							params: {
								m: 'save_condutor',
								moto_id: e.record.get('moto_id'),
								veic_trac_id: e.record.get('veic_trac_id')
							},
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
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
			columns: [{
				dataIndex: 'moto_id',
				text: 'Motorista',
				flex: 1,
				sortable: true,
				resizable: false,
				menuDisabled: true,
				renderer: function(value, metaData, record) {
					return record.get('motorista_nome');
				},
				editor: {
					xtype: 'motoristacombo',
					allowBlank: false,
					selectOnFocus: true,
					listeners: {
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set('motorista_nome', record.get('nome'));
						}
					}
				}
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Incluir',
					handler: function() {
						if (!me.veiculos_id) return false;
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Veiculos.Condutores.data.Model', {veic_trac_id: me.veiculos_id}));
						me.editing.startEditByPosition({row: 0, column: 0});
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
						
						var records = [];
						Ext.each(selections, function(record) {
							if (record.get('moto_id') > 0 && record.get('veic_trac_id') > 0) {
								records.push({
									moto_id: record.get('moto_id'),
									veiculos_id: record.get('veic_trac_id')
								});
							}
						});
						me.store.remove(selections);
						
						if (!records.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/veiculos/php/response.php',
							method: 'post',
							params: {
								m: 'delete_condutor',
								records: Ext.encode(records)
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
						var originalText = btn.getText(),
						refreshText = 'Atualizando...';
						btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
						me.store.reload({
							callback: function() {
								btn.setText(originalText);
							}
						});
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