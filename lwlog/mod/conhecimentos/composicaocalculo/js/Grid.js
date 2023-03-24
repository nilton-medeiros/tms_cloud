Ext.define('Composicao.Calculo.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.composicaocalculogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Composicao.Calculo.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/composicaocalculo/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_calculo'
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
				property: 'cc_titulo',
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
					if (e.record.get('cf_id') > 0 && !Ext.isEmpty(e.record.get('cc_titulo'))) {
						Ext.Ajax.request({
							url: 'mod/conhecimentos/composicaocalculo/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_calculo'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('cc_id', o.cc_id);
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
				dataIndex: 'cc_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'cf_nome',
				text: 'Comp. Frete',
				tooltip: 'Composição do Frete',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'composicaofretecombo',
					allowBlank: false,
					selectOnFocus: true,
					valueField: 'cf_nome',
					displayField: 'cf_nome',
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('cf_id', record.get('cf_id'));
						}
					}
				}
			},{
				dataIndex: 'cc_titulo',
				text: 'Título',
				tooltip: 'Título para composição do cálculo',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true
				}
			},{
				xtype: 'booleancolumn',
				dataIndex: 'cc_exibir_na_dacte',
				text: 'Exibir...',
				tooltip: 'Exibir composição do cálculo na DACTE mesmo quando o valor for zero',
				align: 'center',
				trueText:'Sim', 
				falseText: 'Não',
				width: 50,
				filterable: true,
				editor: {
					xtype: 'checkbox',
					inputValue: 1
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cc_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cc_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'cc_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cc_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'cc_versao',
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
					text: 'Novo cálculo',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Composicao.Calculo.data.Model'));
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
							if (record.get('cc_id') > 0) {
								id.push(record.get('cc_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/conhecimentos/composicaocalculo/php/response.php',
							method: 'post',
							params: {
								m: 'delete_calculo',
								cc_id: id.join(',')
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
					fields: ['cf_nome','cc_titulo']
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