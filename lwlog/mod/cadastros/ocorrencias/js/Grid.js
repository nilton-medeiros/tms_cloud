Ext.define('Ocorrencia.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.ocorrenciagrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Ocorrencia.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/ocorrencias/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_ocorrencia'
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
				property: 'ocor_codigo',
				direction: 'ASC'
			},{
				property: 'ocor_descricao',
				direction: 'ASC'
			}]
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 2,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
					var ocorrencia = parseInt(e.record.get('ocor_codigo'));
					if (ocorrencia < 100) {
						return false;
					}
				},
				edit: function(editor, e) {
					if (!Ext.isEmpty(e.record.get('ocor_codigo')) && !Ext.isEmpty(e.record.get('ocor_descricao'))) {
						Ext.Ajax.request({
							url: 'mod/cadastros/ocorrencias/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_ocorrencia'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('ocor_id', o.ocor_id);
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
				dataIndex: 'ocor_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'ocor_codigo',
				text: 'Código',
				tooltip: 'Código da ocorrência',
				align: 'right',
				width: 70,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 999
				}
			},{
				dataIndex: 'ocor_descricao',
				text: 'Descrição',
				width: 450,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 70
				}
			},{
				dataIndex: 'ocor_modal',
				text: 'Modal',
				tooltip: 'Algumas ocorrências são específicas de uma modalidade',
				width: 100,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['AMBOS','RODOVIARIO','AEREO']
				},
				editor: {
					xtype: 'localcombo',
					options: ['AMBOS','RODOVIARIO','AEREO']
				}
			},{
				dataIndex: 'ocor_caracteristica',
				text: 'Característica',
				tooltip: 'Separa a característica das ocorrências',
				width: 100,
				filter: {
					type: 'lsit',
					phpMode: true,
					options: ['EMITENTE','ENTREGA','FREQUENTE','OCASIONAL']
				},
				editor: {
					xtype: 'localcombo',
					options: ['EMITENTE','ENTREGA','FREQUENTE','OCASIONAL']
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'ocor_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'ocor_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'ocor_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'ocor_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'ocor_versao',
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
					text: 'Nova ocorrência',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Ocorrencia.data.Model'));
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
							if (record.get('ocor_id') > 0) {
								id.push(record.get('ocor_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/ocorrencias/php/response.php',
							method: 'post',
							params: {
								m: 'delete_ocorrencia',
								ocor_id: id.join(',')
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
					fields: ['ocor_codigo','ocor_descricao']
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