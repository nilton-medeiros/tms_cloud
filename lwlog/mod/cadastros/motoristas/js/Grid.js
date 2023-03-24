Ext.define('Motoristas.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.motoristasgrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Motoristas.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/motoristas/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_motorista'
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
					me.activeRecord = e.record;
				},
				edit: function(editor, e) {
					if (!Ext.isEmpty(e.record.get('nome')) && !Ext.isEmpty(e.record.get('cpf')) && !Ext.isEmpty(e.record.get('rg')) && !Ext.isEmpty(e.record.get('celular'))) {
						Ext.Ajax.request({
							url: 'mod/cadastros/motoristas/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_motorista'
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
				dataIndex: 'nome',
				text: 'Nome',
				tooltip: 'Nome do motorista',
				width: 250,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 60
				}
			},{
				dataIndex: 'cpf',
				text: 'CPF',
				align: 'right',
				width: 90,
				filterable: true,
				editor: {
					xtype: 'intfield',
					allowBlank: false,
					minValue: 0,
					maxValue: 99999999999999
				}
			},{
				dataIndex: 'rg',
				text: 'RG',
				align: 'right',
				width: 80,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 15
				}
			},{
				dataIndex: 'celular',
				text: 'Celular',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 15
				}
			},{
				dataIndex: 'fone',
				text: 'Telefone',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 15
				}
			},{
				dataIndex: 'email',
				text: 'E-mail',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					vtype: 'email',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 80
				}
			},{
				dataIndex: 'funcionario_rotulo',
				text: 'Funcionário',
				align: 'left',
				width: 150,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['Funcionário','Outros condutores']
				},
				editor: {
					xtype: 'localcombo',
					valueField: 'field',
					allowBlank: false,
					options: [{
						id: 0,
						field: 'Outros condutores'
					},{
						id: 1,
						field: 'Funcionário'
					}],
					listeners: {
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set('funcionario', record.get('id'));
						}
					}
				}
			},{
				dataIndex: 'login',
				text: 'Login',
				tootlip: 'Necessário apenas para motoristas do Emitente que usam smartphones para baixar coletas e/ou entregas',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 40
				}
			},{
				dataIndex: 'senha',
				text: 'Senha',
				tooltip: 'Necessário apenas para motoristas do Emitente que usam smartphones para baixar coletas e/ou entregas',
				width: 100,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 10
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
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
					width: 140,
					filterable: true
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
					text: 'Novo motorista',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Motoristas.data.Model'));
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
							url: 'mod/cadastros/motoristas/php/response.php',
							method: 'post',
							params: {
								m: 'delete_motorista',
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
						var record = selections[0], veiculosGrid = me.up('motoristaspanel').down('motoristasveiculosgrid');
						veiculosGrid.setMotoristasId(record.get('id'));
						veiculosGrid.setTitle('Veículos para o motorista: ' + record.get('nome'));
					}
				}
			}
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Motoristas.Veiculos.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.motoristasveiculosgrid',
	
	motoristas_id: 0,
	setMotoristasId: function(id) {
		var store = this.store, proxy = store.getProxy();
		if (id > 0 && id != this.motoristas_id) {
			proxy.setExtraParam('motoristas_id', id);
			this.motoristas_id = id;
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
			autoLoad: me.motoristas_id > 0,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.motoristas_id > 0;
				}
			},
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/motoristas/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_veiculos',
					motoristas_id: me.motoristas_id
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
					if (e.record.get('veic_trac_id') > 0) {
						return false;
					}
					me.activeRecord = e.record;
				},
				edit: function(editor, e) {
					if (e.record.get('veic_trac_id') > 0 && e.record.get('moto_id') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/motoristas/php/response.php',
							method: 'post',
							params: {
								m: 'save_veiculo',
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
				dataIndex: 'veic_trac_id',
				text: 'Veículo (placa)',
				flex: 1,
				sortable: true,
				resizable: false,
				menuDisabled: true,
				renderer: function(value, metaData, record) {
					return record.get('veiculo_placa');
				},
				editor: {
					xtype: 'veiculocombo',
					allowBlank: false,
					selectOnFocus: true,
					listeners: {
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set('veiculo_placa', record.get('placa'));
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
						if (!me.motoristas_id) return false;
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Veiculos.Condutores.data.Model', {moto_id: me.motoristas_id}));
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
							url: 'mod/cadastros/motoristas/php/response.php',
							method: 'post',
							params: {
								m: 'delete_veiculo',
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