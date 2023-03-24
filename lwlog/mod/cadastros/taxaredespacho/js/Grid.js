Ext.define('Taxa.Redespacho.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.taxaredespachogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Taxa.Redespacho.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/taxaredespacho/php/response.php',
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
			
			groupField: 'clie_razao_social',
			
			sorters: [{
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
					if ((e.field == 'red_ate_kg' || e.field == 'red_excedente') && !e.record.get('red_por_peso')) {
						return false;
					}
				},
				edit: function(editor, e) {
					if ((e.field == 'red_ate_kg' || e.field == 'red_excedente') && !e.record.get('red_por_peso')) {
						e.record.set('red_ate_kg', 0);
						e.record.set('red_excedente', 0);
					}
					if (e.record.get('cid_id_origem') > 0 && e.record.get('cid_id_passagem') > 0 && e.record.get('cid_id_destino') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/taxaredespacho/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_taxas'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('red_id', o.red_id);
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
	        },{
	        	ftype: 'grouping',
	        	enableNoGroups: true,
	        	enableGroupingMenu: false
	        }],
			columns: [{
				dataIndex: 'red_id',
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
					allowBlank: true,
					selectOnFocus: true,
					listeners: {
						reset: function() {
							me.activeRecord.set('clie_id', 0);
						},
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('clie_id', record.get('clie_id'));
						}
					}
				}
			},{
				dataIndex: 'cid_origem_nome',
				text: 'Origem',
				tooltip: 'Cidade de origem',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'cidadecombo',
					valueField: 'cid_nome_completo',
					displayField: 'cid_nome_completo',
					allowBlank: false,
					selectOnFocus: true,
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('cid_id_origem', record.get('cid_id'));
						}
					}
				}
			},{
				dataIndex: 'cid_passagem_nome',
				text: 'Passagem',
				tooltip: 'Cidade de passagem',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'cidadecombo',
					valueField: 'cid_nome_completo',
					displayField: 'cid_nome_completo',
					allowBlank: false,
					selectOnFocus: true,
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('cid_id_passagem', record.get('cid_id'));
						}
					}
				}
			},{
				dataIndex: 'cid_destino_nome',
				text: 'Destino',
				tooltip: 'Cidade de destino',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'cidadecombo',
					valueField: 'cid_nome_completo',
					displayField: 'cid_nome_completo',
					allowBlank: false,
					selectOnFocus: true,
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('cid_id_destino', record.get('cid_id'));
						}
					}
				}
			},{
				dataIndex: 'red_nota', 
				text: 'Comentário',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textareafield',
					allowBlank: true,
					selectOnFocus: true,
					grow: true
				}
			},{
				xtype: 'booleancolumn',
				dataIndex: 'red_por_peso',
				text: 'Cálculo',
				tooltip: 'Por Peso, calcula o valor até o peso e adiciona o excedente por Kg. Por CT-e, taxa fixa, não calcula excedente',
				trueText: 'Por Peso',
				falseText: 'Por CT-e',
				align: 'center',
				width: 90,
				filterable: true,
				editor: {
					xtype: 'checkbox',
					inputValue: 1
				}
			},{
				dataIndex: 'red_valor',
				text: 'Valor',
				align: 'right',
				width: 100,
				filterable: true,
				renderer: Ext.util.Format.brMoney,
				editor: {
					xtype: 'decimalfield',
					allowBlank: false,
					selectOnFocus: true,
					minValue: 0,
					maxValue: 9999999.99
				}
			},{
				dataIndex: 'red_ate_kg',
				text: 'Peso até (KG)',
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
				dataIndex: 'red_excedente',
				text: 'Excedente',
				tooltip: 'Valor adicional por kg',
				align: 'right',
				width: 100,
				filterable: true,
				renderer: Ext.util.Format.brMoney,
				editor: {
					xtype: 'decimalfield',
					allowBlank: false,
					selectOnFocus: true,
					minValue: 0,
					maxValue: 9999.99
				}
			},{
				xtype: 'booleancolumn',
				dataIndex: 'red_aceita_frete_a_pagar',
				text: 'Frete à Pagar',
				tooltip: 'Aceita frete à pagar',
				trueText: 'Sim',
				falseText: 'Não',
				align: 'center',
				width: 90,
				filterable: true,
				editor: {
					xtype: 'checkbox',
					inputValue: 1
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'red_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'red_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'red_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'red_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'red_versao',
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
					text: 'Nova taxa',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Taxa.Redespacho.data.Model'));
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
							if (record.get('red_id') > 0) {
								id.push(record.get('red_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/taxaredespacho/php/response.php',
							method: 'post',
							params: {
								m: 'delete_taxas',
								red_id: id.join(',')
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
					fields: ['red_nota', 'clie_razao_social','cid_origem_nome','cid_passagem_nome','cid_destino_nome']
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
						me.up('taxaredespachoview').down('taxasredexcecoesgrid').setTaxasId(selections[0].get('red_id'));
					}
				}
			}
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Taxa.RedespachoExcecao.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.taxasredexcecoesgrid',
	
	taxas_id: 0,
	setTaxasId: function(id) {
		var store = this.store, proxy = store.getProxy();
		if (id > 0 && id != this.taxas_id) {
			proxy.setExtraParam('taxas_id', id);
			this.taxas_id = id;
			store.load();
		} else {
			store.clearFilter();
			store.removeAll();
		}
	},
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Taxa.RedespachoExcecao.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.taxas_id > 0;
				}
			},
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/taxaredespacho/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_taxas_excecoes',
					taxas_id: me.taxas_id
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
					if (e.record.get('clie_id') > 0 && e.record.get('red_id') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/taxaredespacho/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_taxas_excecoes'
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
								cid_nome: record.get('cid_nome'),
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
				dataIndex: 'cid_nome',
				text: 'Cidade',
				tooltip: 'Cidade do cliente',
				width: 400,
				filterable: true
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Incluir',
					handler: function() {
						if (me.taxas_id > 0) {
							me.editing.cancelEdit();
							me.store.insert(0, Ext.create('Taxa.RedespachoExcecao.data.Model', {red_id:me.taxas_id}));
							me.editing.startEditByPosition({row: 0, column: 0});
						}
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
						
						var data = [];
						Ext.each(selections, function(record) {
							if (record.get('red_id') > 0 && record.get('clie_id') > 0) {
								data.push(record.data);
							}
						});
						me.store.remove(selections);
						
						if (!data.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/taxaredespacho/php/response.php',
							method: 'post',
							params: {
								m: 'delete_taxas_excecoes',
								records: Ext.encode(data)
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'->',{
					iconCls: 'icon-checkmark',
					itemId: 'include-all',
					text: 'Incluir para todos',
					tooltip: 'Inclui os clientes selecionados para todos os registros da tabela Taxas Redespachos',
					disabled: true,
					handler: function() {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						
						var clientes_id = [];
						Ext.each(selections, function(record) {
							if (record.get('clie_id') > 0) {
								clientes_id.push(record.get('clie_id'));
							}
						});
						
						if (!clientes_id.length) {
							return false;
						}
						var btn = this, originalText = btn.getText();
						btn.setText('Incluindo...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/cadastros/taxaredespacho/php/response.php',
							method: 'post',
							params: {
								m: 'include_taxas_excecoes',
								taxas_id: me.taxas_id,
								clientes_id: clientes_id.join(',')
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setText(originalText);
								btn.setDisabled(false);
							}),
							success: Ext.Function.createSequence(App.ajaxProccessResponse, function(){
								btn.setText(originalText);
								btn.setDisabled(false);
							})
						});
					}
				},{
					iconCls: 'icon-remove',
					itemId: 'exclude-all',
					text: 'Remover de todos',
					tooltip: 'Exclui os clientes selecionados de todos os registros da tabela Taxas Redespachos',
					disabled: true,
					handler: function() {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						
						var clientes_id = [];
						Ext.each(selections, function(record) {
							if (record.get('clie_id') > 0) {
								clientes_id.push(record.get('clie_id'));
							}
						});
						me.store.remove(selections);
						
						if (!clientes_id.length) {
							return false;
						}
						var btn = this, originalText = btn.getText();
						btn.setText('Removendo...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/cadastros/taxaredespacho/php/response.php',
							method: 'post',
							params: {
								m: 'exclude_taxas_excecoes',
								clientes_id: clientes_id.join(',')
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setText(originalText);
							}),
							success: Ext.Function.createSequence(App.ajaxDeleteSuccess, function(){
								btn.setText(originalText);
							})
						});
					}
				}]
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					var disabled = selections.length === 0;
					me.down('#delete').setDisabled(disabled);
					me.down('#include-all').setDisabled(disabled);
					me.down('#exclude-all').setDisabled(disabled);
				}
			}
		});
		
		me.callParent(arguments);
	}
});