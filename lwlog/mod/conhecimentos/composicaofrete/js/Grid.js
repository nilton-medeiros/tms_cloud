Ext.define('Composicao.Frete.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.composicaofretegrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Composicao.Frete.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/composicaofrete/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_frete'
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
				property: 'cf_nome',
				direction: 'ASC'
			},{
				property: 'cf_tipo',
				direction: 'ASC'
			}]
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 2,
			listeners: {
				edit: function(editor, e) {
					if (!Ext.isEmpty(e.record.get('cf_nome')) && !Ext.isEmpty(e.record.get('cf_tipo')) && !Ext.isEmpty(e.record.get('cf_descricao'))) {
						Ext.Ajax.request({
							url: 'mod/conhecimentos/composicaofrete/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_frete'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('cf_id', o.cf_id);
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
				dataIndex: 'cf_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'cf_nome',
				text: 'Nome',
				tooltip: 'Nome do campo que compõe o frete',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true
				}
			},{
				dataIndex: 'cf_tipo',
				text: 'Tipo',
				tooltip: 'Tipo do campo que compõe o frete',
				width: 150,
				filterable: false,
				renderer: function(value) {
					if (value == 0) {
						return '0 - Tipo Tarifa';
					} else if (value == 1) {
						return '1 - Tarifa';
					} else if (value == 2) {
						return '2 - Frete';
					} else if (value == 3) {
						return '3 - Redespacho';
					} else if (value == 4) {
						return '4 - Seguro';
					} else if (value == 5) {
						return '5 - Taxas';
					} else if (value == 6) {
						return '6 - Impostos';
					}
				},
				editor: {
					xtype: 'localcombo',
					allowBlank: false,
					options: [{
						id: 0,
						field: '0 - Tipo Tarifa'
					},{
						id: 1,
						field: '1 - Tarifa'
					},{
						id: 2,
						field: '2 - Frete'
					},{
						id: 3,
						field: '3 - Redespacho'
					},{
						id: 4,
						field: '4 - Seguro'
					},{
						id: 5,
						field: '5 - Taxas'
					},{
						id: 6,
						field: '6 - Impostos'
					}]
				}
			},{
				dataIndex: 'cf_descricao',
				text: 'Descrição',
				tooltip: 'Descrição do campo que compõe o frete',
				width: 500,
				renderer: Ext.util.Format.nl2br,
				filterable: true,
				editor: {
					xtype: 'textareafield',
					allowBlank: false,
					selectOnFocus: true,
					grow: true
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cf_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cf_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'cf_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cf_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'cf_versao',
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
					text: 'Novo campo',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Composicao.Frete.data.Model'));
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
							if (record.get('cf_id') > 0) {
								id.push(record.get('cf_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/conhecimentos/composicaofrete/php/response.php',
							method: 'post',
							params: {
								m: 'delete_frete',
								cf_id: id.join(',')
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
					fields: ['cf_nome','cf_descricao']
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
				}
			}
		});
		
		me.callParent(arguments);
	}
});