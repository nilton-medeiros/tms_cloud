Ext.define('Banco.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.bancogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Banco.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/bancos/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_banco'
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
				property: 'numero',
				direction: 'ASC'
			},{
				property: 'banco',
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
					if (!Ext.isEmpty(e.record.get('numero')) && !Ext.isEmpty(e.record.get('banco'))) {
						Ext.Ajax.request({
							url: 'mod/cadastros/bancos/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_banco'
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
				dataIndex: 'numero',
				text: 'Código',
				tooltip: 'Código do banco',
				align: 'right',
				width: 70,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 999
				}
			},{
				dataIndex: 'banco',
				text: 'Banco',
				width: 450,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 60
				}
			},{
				dataIndex: 'agencia',
				text: 'Agência',
				width: 90,
				align: 'right',
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 9999
				}
			},{
				dataIndex: 'digito_ver_agencia',
				text: 'AG. Dígito',
				tootlip: 'Dígito verificador da agência',
				width: 100,
				align: 'right',
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 1
				}
			},{
				dataIndex: 'conta_corrente',
				text: 'Conta Corrente',
				width: 150,
				align: 'right',
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 9999999999
				}
			},{
				dataIndex: 'digito_ver_conta_corrente',
				text: 'C/C. Dígito',
				tootlip: 'Dígito verificador da conta corrente',
				width: 100,
				align: 'right',
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					minLength: 1,
					maxLength: 2
				}
			},{
				dataIndex: 'codigo_empresa',
				text: 'Código Empresa',
				width: 150,
				align: 'right',
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxLength: 15
				}
			},{
				xtype: 'booleancolumn',
				dataIndex: 'padrao_cta_receber',
				text: 'Padrão',
				tooltip: 'Conta corrente padrão para faturamento no Contas á Receber',
				align: 'center',
				trueText:'Sim', 
				falseText: 'Não',
				width: 90,
				filterable: true,
				editor: {
					xtype: 'checkbox',
					inputValue: 1
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
					text: 'Novo banco',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Banco.data.Model'));
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
							url: 'mod/cadastros/bancos/php/response.php',
							method: 'post',
							params: {
								m: 'delete_banco',
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
					fields: ['numero','banco']
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