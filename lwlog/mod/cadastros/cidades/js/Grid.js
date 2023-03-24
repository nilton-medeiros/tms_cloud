Ext.define('Cidade.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.cidadegrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Cidade.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/cidades/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_cidades'
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
				property: 'cid_uf',
				direction: 'ASC'
			},{
				property: 'cid_municipio',
				direction: 'ASC'
			}]
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 2,
			listeners: {
				edit: function(editor, e) {
					if (!Ext.isEmpty(e.record.get('cid_codigo_municipio')) && !Ext.isEmpty(e.record.get('cid_municipio')) && !Ext.isEmpty(e.record.get('cid_uf'))) {
						Ext.Ajax.request({
							url: 'mod/cadastros/cidades/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_cidades'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('cid_id', o.cid_id);
									e.record.set('cid_nome', e.record.get('cid_uf') + ' - ' + e.record.get('cid_municipio'));
									e.record.commit();
									var foundRecord = Cidade.combo.Store.findRecord('cid_id', o.cid_id);
									if (foundRecord) {
										foundRecord.set(e.record.data);
									} else {
										Cidade.combo.Store.add(e.record);
									}
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
	        	encode: true,
	        	local: false
	        }],
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			columns: [{
				dataIndex: 'cid_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				filterable: true,
				width: 70
			},{
				dataIndex: 'cid_codigo_municipio',
				text: 'Código',
				tooltip: 'Código do Município',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 999999999
				}
			},{
				dataIndex: 'cid_uf',
				text: 'UF',
				tooltip: 'Unidade da Federação',
				width: 50,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					minLength: 2,
					maxLength: 2
				}
			},{
				dataIndex: 'cid_municipio', 
				text: 'Município',
				tooltip: 'Nome da Cidade',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 180
				}
			},{
				dataIndex: 'cid_sigla', 
				text: 'Sigla',
				tooltip: 'Sigla Aérea',
				width: 60,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					minLength: 3,
					maxLength: 3
				}
			},{
				dataIndex: 'cid_nome_aeroporto',
				text: 'Aeroporto',
				tooltip: 'Nome do Aeroporto',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 100
				}
			},{
				xtype: 'booleancolumn',
				dataIndex: 'cid_suframa',
				text: 'Suframa',
				tooltip: 'Cobrar ou não a taxa de Suframa (1% sobre o valor da mercadoria)',
				align: 'center',
				trueText:'Sim', 
				falseText: 'Não',
				width: 120,
				filterable: true,
				editor: {
					xtype: 'checkbox',
					inputValue: 1
				}
			},{
				dataIndex: 'cid_valor_sefaz',
				text: 'Sefaz',
				tooltip: 'Taxa Sefaz/AM - integral ou multiplicada pela quantidade de NFs.',
				align: 'right',
				width: 70,
				filterable: true,
				renderer: Ext.util.Format.brMoney,
				editor: {
					xtype: 'decimalfield',
					minValue: 0,
					maxValue: 99999.99
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cid_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cid_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'cid_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cid_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'cid_versao',
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
					text: 'Nova cidade',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Cidade.data.Model'));
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
							if (record.get('cid_id') > 0) {
								id.push(record.get('cid_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/cidades/php/response.php',
							method: 'post',
							params: {
								m: 'delete_cidades',
								cid_id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'->',{
					xtype: 'searchfield',
					grid: me,
					store: me.store,
					width: 250,
					fields: ['cid_codigo_municipio','cid_municipio','cid_uf','cid_sigla','cid_nome_aeroporto']
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: this.store,
				displayInfo: true
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0);
					
					var record = selections.length === 1 ? selections[0] : null,
					grid = me.up('cidadeview').down('passagemgrid'), store = grid.getStore();
					
					if (record) {
						grid.setDisabled(false);
						store.getProxy().setExtraParam('cid_id', record.get('cid_id'));
						store.load();
					} else {
						store.getProxy().setExtraParam('cid_id', 0);
						store.removeAll();
						grid.setDisabled(true);
					}
				}
			}
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Passagem.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.passagemgrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name:'cid_id', type:'int'},
				{name:'loc_id', type:'int'},
				{name:'loc_passagem', type:'string', defaultValue:''}
			],
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/cidades/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_passagens',
					cid_id: 0
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
				property: 'loc_passagem',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cid_id > 0;
				}
			}
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 1,
			listeners: {
				edit: function(editor, e) {
					Ext.Ajax.request({
						url: 'mod/cadastros/cidades/php/response.php',
						method: 'post',
						params: Ext.applyIf({
							m: 'save_passagens'
						}, e.record.data),
						failure: App.ajaxFailure,
						success: function(response) {
							var o = Ext.decode(response.responseText);
							if (o.success) {
								e.record.set('loc_id', o.loc_id);
								e.record.commit();
							} else {
								e.record.reject();
								App.warning(o);
							}
						}
					});
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
				dataIndex: 'loc_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				menuDisabled: true
			},{
				dataIndex: 'loc_passagem',
				text: 'Passagem',
				tooltip: 'Local de passagem',
				flex: 1,
				menuDisabled: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 15
				}
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Nova passagem',
					handler: function() {
						var cid_id = me.store.getProxy().extraParams.cid_id;
						if (cid_id > 0) {
							me.editing.cancelEdit();
							me.store.insert(0, {cid_id: cid_id});
							me.editing.startEditByPosition({row: 0, column: 1});
						}
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
					itemId: 'delete',
					disabled: true,
					handler: function() {
						var cid_id = me.store.getProxy().extraParams.cid_id;
						if (!cid_id) {
							return false;
						}
						
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
							
						var id = [];
						Ext.each(selections, function(record) {
							if (record.get('loc_id') > 0) {
								id.push(record.get('loc_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/cidades/php/response.php',
							method: 'post',
							params: {
								m: 'delete_passagens',
								loc_id: id.join(','),
								cid_id: cid_id
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
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