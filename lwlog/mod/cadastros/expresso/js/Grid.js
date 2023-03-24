Ext.define('Expresso.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.expressogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Expresso.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/expresso/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_expresso'
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
			},{
				property: 'cid_origem_nome',
				direction: 'ASC'
			},{
				property: 'cid_destino_nome',
				direction: 'ASC'
			}]	
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 2,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
					if (!e.record.get('tipo_data_prev_entrega') && (e.field == 'hora_programada' || e.field == 'hora_inicial' || e.field == 'hora_final' || e.field == 'dias_programado' || e.field == 'dias_inicial' || e.field == 'dias_final' || e.field == 'tipo_hora_prev_entrega')) {
						return false;
					}
					if (e.record.get('tipo_data_prev_entrega') != 4 && (e.field == 'dias_inicial' || e.field == 'dias_final')) {
						return false;
					}
					if (e.record.get('tipo_data_prev_entrega') == 4 && e.field == 'dias_programado') {
						return false;
					}
					if (!e.record.get('tipo_hora_prev_entrega') && (e.field == 'hora_programada' || e.field == 'hora_inicial' || e.field == 'hora_final')) {
						return false;
					}
					if (e.record.get('tipo_hora_prev_entrega') != 4 && (e.field == 'hora_inicial' || e.field == 'hora_final')) {
						return false;
					}
					if (e.record.get('tipo_hora_prev_entrega') == 4 && e.field == 'hora_programada') {
						return false;
					}
				},
				edit: function(editor, e) {
					var prev_data_entrega = e.record.get('tipo_data_prev_entrega'),
					prev_hora_entrega = e.record.get('tipo_hora_prev_entrega');
					if (prev_data_entrega != 1 && prev_data_entrega != 2 && prev_data_entrega != 3) {
						e.record.set('dias_programado', 0);
					}
					if (prev_data_entrega != 4) {
						e.record.set('dias_final', 0);
						e.record.set('dias_inicial', 0);
					}
					if (prev_hora_entrega != 1 && prev_hora_entrega != 2 && prev_hora_entrega != 3) {
						e.record.set('hora_programada', '');
					}
					if (prev_hora_entrega != 4) {
						e.record.set('hora_final', '');
						e.record.set('hora_inicial', '');
					}
					if (!prev_data_entrega) {
						e.record.set('tipo_hora_prev_entrega', 0);
						e.record.set('dias_final', 0);
						e.record.set('dias_inicial', 0);
						e.record.set('hora_final', '');
						e.record.set('hora_inicial', '');
					}
					if (e.record.get('cid_id_origem') > 0 && e.record.get('cid_id_destino') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/expresso/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_expresso'
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
	        },{
	        	ftype: 'grouping',
	        	enableNoGroups: true,
	        	enableGroupingMenu: false
	        }],
			columns: [{
				dataIndex: 'id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'clie_razao_social',
				text: 'Cliente',
				width: 200,
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
				dataIndex: 'clie_cnpj_cpf',
				text: 'CNPJ',
				width: 100,
				filterable: true
			},{
				dataIndex: 'cid_origem_nome', 
				text: 'Origem',
				tooltip: 'Cidade/Local de Origem',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'cidadecombo',
					allowBlank: false,
					selectOnFocus: true,
					valueField: 'cid_nome_completo',
					displayField: 'cid_nome_completo',
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('cid_id_origem', record.get('cid_id'));
						}
					}
				}
			},{
				dataIndex: 'cid_destino_nome', 
				text: 'Destino',
				tooltip: 'Cidade/Local de Destino',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'cidadecombo',
					allowBlank: false,
					selectOnFocus: true,
					valueField: 'cid_nome_completo',
					displayField: 'cid_nome_completo',
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('cid_id_destino', record.get('cid_id'));
						}
					}
				}
			},{
				dataIndex: 'peso_taxa_minima',
				text: 'Taxa Mínima (peso)',
				tooltip: 'Peso da taxa mínima em kg',
				width: 100,
				align: 'right',
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 99999
				}
			},{
				dataIndex: 'valor_taxa_minima',
				text: 'Taxa Mínima (valor)',
				tooltip: 'Valor da taxa mínima à ser cobrada',
				width: 100,
				align: 'right',
				filterable: true,
				renderer: Ext.util.Format.brMoney,
				editor: {
					xtype: 'decimalfield',
					minValue: 0,
					maxValue: 999999.99
				}
			},{
				dataIndex: 'tipo_data_prev_entrega',
				text: 'Previsão de entrega',
				tooltip: 'Tipo de previsão de entrega',
				width: 150,
				filterable: false,
				renderer: function(value) {
					if (value == 0) {
						return '0 - Sem data definida';
					} else if (value == 1) {
						return '1 - Na data';
					} else if (value == 2) {
						return '2 - Até a data';
					} else if (value == 3) {
						return '3 - A partir da data';
					} else if (value == 4) {
						return '4 - No período';
					} else {
						return '(desconhecido)';
					}
				},
				editor: {
					xtype: 'localcombo',
					allowBlank: false,
					options: [{
						id: 0,
						field: '0 - Sem data definida'
					},{
						id: 1,
						field: '1 - Na data'
					},{
						id: 2,
						field: '2 - Até a data'
					},{
						id: 3,
						field: '3 - A partir da data'
					},{
						id: 4,
						field: '4 - No período'
					}]
				}
			},{
				dataIndex: 'dias_programado',
				text: 'Dias programado',
				tooltip: 'Quantidade de dias a partir da Data de emissão do CT-e + Dias programado para previsão de entrega',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 999
				}
			},{
				dataIndex: 'dias_inicial',
				text: 'Dias inicial',
				tooltip: 'Quantidade de dias a partir da Data de emissão do CT-e + Dias inicial para previsão de entrega',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 999
				}
			},{
				dataIndex: 'dias_final',
				text: 'Dias final',
				tooltip: 'Quantidade de dias a partir da Data de emissão do CT-e + Dias inicial + Dias final',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 999
				}
			},{
				dataIndex: 'tipo_hora_prev_entrega',
				text: 'Período para entrega',
				tooltip: 'Tipo de hora/período programado para a entrega',
				width: 150,
				filterable: false,
				renderer: function(value) {
					if (value == 0) {
						return '0 - Sem hora definida';
					} else if (value == 1) {
						return '1 - No horário';
					} else if (value == 2) {
						return '2 - Até o horário';
					} else if (value == 3) {
						return '3 - A partir do horário';
					} else if (value == 4) {
						return '4 - No intervalo de tempo';
					}
				},
				editor: {
					xtype: 'localcombo',
					allowBlank: false,
					options: [{
						id: 0,
						field: '0 - Sem hora definida'
					},{
						id: 1,
						field: '1 - No horário'
					},{
						id: 2,
						field: '2 - Até o horário'
					},{
						id: 3,
						field: '3 - A partir do horário'
					},{
						id: 4,
						field: '4 - No intervalo de tempo'
					}]
				}
			},{
				dataIndex: 'hora_programada',
				text: 'Hora programada',
				tooltip: 'Hora programada para entrega',
				align: 'right',
				width: 140,
				filterable: false,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true
				}
			},{
				dataIndex: 'hora_inicial',
				text: 'Hora inicial',
				tooltip: 'Hora inicial para previsão de entrega',
				align: 'right',
				width: 140,
				filterable: false,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true
				}
			},{
				dataIndex: 'hora_final',
				text: 'Hora final',
				tooltip: 'Hora final para previsão de entrega',
				align: 'right',
				width: 140,
				filterable: false,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true
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
					text: 'Nova tabela',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Expresso.data.Model'));
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
							url: 'mod/cadastros/expresso/php/response.php',
							method: 'post',
							params: {
								m: 'delete_expresso',
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
					fields: ['clie_razao_social', 'cid_origem_nome', 'cid_destino_nome']
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
					var record = selections.length === 1 ? selections[0] : null,
					tab = me.up('expressoview'),
					panel = tab.down('#east-panel'),
					grid1 = panel.down('expressoexcedentegrid');
					if (record) {
						grid1.setExpId(record.get('id'));
					} else {
						grid1.setExpId(0);
					}
				}
			}
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Expresso.Excedente.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.expressoexcedentegrid',
	
	exp_id: 0,
	setExpId: function(exp_id) {
		var me = this, store = me.store, proxy = store.getProxy();
		me.exp_id = exp_id;
		proxy.setExtraParam('exp_id', exp_id);
		if (exp_id > 0) {
			store.load();
		} else {
			store.removeAll();
		}
	},
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Expresso.Excedente.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/expresso/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_expresso_excedente',
					exp_id: me.exp_id
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
				property: 'peso_ate_kg',
				direction: 'ASC'
			},{
				property: 'valor_excedente',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.exp_id > 0;
				}
			}
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 1,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
					return e.record.get('exp_id') > 0;
				},
				edit: function(editor, e) {
					if (e.record.get('exp_id') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/expresso/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_expresso_excedente'
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
			columns: [{
				dataIndex: 'id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70
			},{
				dataIndex: 'peso_ate_kg',
				text: 'Peso até (kg)',
				align: 'right',
				flex: 1,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 99999
				}
			},{
				dataIndex: 'valor_excedente', 
				text: 'Valor excedente',
				align: 'right',
				flex: 2,
				renderer: Ext.util.Format.brMoney,
				editor: {
					xtype: 'decimalfield',
					minValue: 0,
					maxValue: 999999.99
				}
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Incluir',
					handler: function() {
						if (!me.exp_id) {
							return false;
						}
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Expresso.Excedente.data.Model', {
							exp_id: me.exp_id
						}));
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
							url: 'mod/cadastros/expresso/php/response.php',
							method: 'post',
							params: {
								m: 'delete_expresso_excedente',
								id: id.join(',')
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