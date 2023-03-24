Ext.define('Taxa.Desconto.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.taxadescontogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Taxa.Desconto.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/taxadesconto/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_taxas'
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
				property: 'clie_razao_social',
				direction: 'ASC'
			},{
				property: 'dtc_desconto',
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
					if (e.record.get('clie_id') > 0 && e.record.get('cc_id') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/taxadesconto/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_taxas'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('dtc_id', o.dtc_id);
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
				dataIndex: 'dtc_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'clie_razao_social',
				text: 'Cliente',
				width: 300,
				filterable: true,
				editor: {
					xtype: 'clientecombo',
					valueField: 'clie_razao_social',
					displayField: 'clie_razao_social',
					allowBlank: false,
					selectOnFocus: true,
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set({
								clie_id: record.get('clie_id'),
								clie_cid_nome: record.get('cid_nome'),
								clie_cnpj_cpf: Ext.isEmpty(record.get('clie_cnpj')) ? record.get('clie_cpf') : record.get('clie_cnpj')
							});
						}
					}
				}
			},{
				dataIndex: 'clie_cnpj_cpf',
				text: 'CNPJ/CPF',
				width: 100,
				filterable: true
			},{
				dataIndex: 'clie_cid_nome',
				text: 'Cidade UF',
				width: 200,
				filterable: true
			},{
				dataIndex: 'cc_titulo', 
				text: 'Composição do Cálculo',
				//tooltip: 'Taxas: Composição do Cálculo onde o Tipo da Composição do Frete = 5',
				width: 150,
				filterable: true,
				editor: {
					xtype: 'composicaocalculocombo',
					valueField: 'cc_titulo',
					displayField: 'cc_titulo',
					allowBlank: false,
					selectOnFocus: true,
					//cf_tipo: 5,
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('cc_id', record.get('cc_id'));
						}
					}
				}
			},{
				dataIndex: 'dtc_desconto',
				text: 'Desconto',
				tooltip: 'Percentual de desconto',
				align: 'center',
				width: 90,
				filterable: true,
				renderer: Ext.util.Format.percent,
				editor: {
					xtype: 'percentfield',
					allowBlank: false,
					selectOnFocus: true,
					minValue: 0,
					maxValue: 999.99
				}
			},{
				dataIndex: 'dtc_exibir_na_dacte',
				xtype: 'booleancolumn',
				text: 'Exibir...',
				tooltip: 'Exibir desconto no campo observações na DACTE',
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
					dataIndex: 'dtc_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'dtc_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'dtc_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'dtc_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'dtc_versao',
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
					text: 'Novo desconto',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Taxa.Desconto.data.Model'));
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
							if (record.get('dtc_id') > 0) {
								id.push(record.get('dtc_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/taxadesconto/php/response.php',
							method: 'post',
							params: {
								m: 'delete_taxas',
								dtc_id: id.join(',')
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
					fields: ['clie_razao_social', 'cc_titulo']
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