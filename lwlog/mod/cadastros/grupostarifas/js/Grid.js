Ext.define('GrupoTarifa.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.grupotarifagrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'GrupoTarifa.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/grupostarifas/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_grupos_tarifas'
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
				property: 'gt_id_codigo',
				direction: 'ASC'
			}]	
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 2,
			listeners: {
				edit: function(editor, e) {
					if (!Ext.isEmpty(e.record.get('gt_id_codigo')) && !Ext.isEmpty(e.record.get('gt_descricao'))) {
						Ext.Ajax.request({
							url: 'mod/cadastros/grupostarifas/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_grupos_tarifas'
							}, e.record.data),
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
			features: [{
				ftype: 'filters',
	        	encode: true,
	        	local: false
	        }],
			columns: [{
				dataIndex: 'gt_id_codigo',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 999
				}
			},{
				dataIndex: 'gt_descricao', 
				text: 'Descrição',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 40
				}
			},{
				xtype: 'booleancolumn',
				trueText:'Sim', 
				falseText: 'Não',
				align: 'center',
				dataIndex: 'gt_obrigar_especifica',
				text: 'Forçar Específica',
				tooltip: 'Mesmo quando a tarifa específica for maior que a tarifa geral, forçar tarifa específica para esse grupo de produtos',
				filterable: true,
				width: 150,
				editor: {
					xtype: 'checkbox',
					inputValue: 1
				}
			},{
				xtype: 'booleancolumn',
				trueText:'Sim', 
				falseText: 'Não',
				align: 'center',
				dataIndex: 'gt_isento_icms',
				text: 'Isento de ICMS',
				tooltip: 'Grupo de tarifa específica isento de ICMS',
				filterable: true,
				width: 150,
				editor: {
					xtype: 'checkbox',
					inputValue: 1
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'gt_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'gt_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'gt_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'gt_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'gt_versao',
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
					text: 'Novo grupo',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('GrupoTarifa.data.Model'));
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
							
						var id = [];
						Ext.each(selections, function(record) {
							if (record.get('gt_id_codigo') > 0) {
								id.push(record.get('gt_id_codigo'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/grupostarifas/php/response.php',
							method: 'post',
							params: {
								m: 'delete_grupos_tarifas',
								gt_id_codigo: id.join(',')
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
					fields: ['gt_descricao']
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