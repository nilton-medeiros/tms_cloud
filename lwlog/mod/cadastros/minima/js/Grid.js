Ext.define('Minima.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.minimagrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Minima.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/minima/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_minima'
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
					if (!e.record.get('min_tipo_data_prev_entrega') && (e.field == 'min_hora_programada' || e.field == 'min_hora_inicial' || e.field == 'min_hora_final' || e.field == 'min_dias_programado' || e.field == 'min_dias_inicial' || e.field == 'min_dias_final' || e.field == 'min_tipo_hora_prev_entrega')) {
						return false;
					}
					if (e.record.get('min_tipo_data_prev_entrega') != 4 && (e.field == 'min_dias_inicial' || e.field == 'min_dias_final')) {
						return false;
					}
					if (e.record.get('min_tipo_data_prev_entrega') == 4 && e.field == 'min_dias_programado') {
						return false;
					}
					if (!e.record.get('min_tipo_hora_prev_entrega') && (e.field == 'min_hora_programada' || e.field == 'min_hora_inicial' || e.field == 'min_hora_final')) {
						return false;
					}
					if (e.record.get('min_tipo_hora_prev_entrega') != 4 && (e.field == 'min_hora_inicial' || e.field == 'min_hora_final')) {
						return false;
					}
					if (e.record.get('min_tipo_hora_prev_entrega') == 4 && e.field == 'min_hora_programada') {
						return false;
					}
				},
				edit: function(editor, e) {
					var prev_data_entrega = e.record.get('min_tipo_data_prev_entrega'),
					prev_hora_entrega = e.record.get('min_tipo_hora_prev_entrega');
					if (prev_data_entrega != 1 && prev_data_entrega != 2 && prev_data_entrega != 3) {
						e.record.set('min_dias_programado', 0);
					}
					if (prev_data_entrega != 4) {
						e.record.set('min_dias_final', 0);
						e.record.set('min_dias_inicial', 0);
					}
					if (prev_hora_entrega != 1 && prev_hora_entrega != 2 && prev_hora_entrega != 3) {
						e.record.set('min_hora_programada', '');
					}
					if (prev_hora_entrega != 4) {
						e.record.set('min_hora_final', '');
						e.record.set('min_hora_inicial', '');
					}
					if (!prev_data_entrega) {
						e.record.set('min_tipo_hora_prev_entrega', 0);
						e.record.set('min_dias_final', 0);
						e.record.set('min_dias_inicial', 0);
						e.record.set('min_hora_final', '');
						e.record.set('min_hora_inicial', '');
					}
					if (e.record.get('cid_id_origem') > 0 && e.record.get('cid_id_destino') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/minima/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_minima'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('min_id', o.min_id);
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
				dataIndex: 'min_id',
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
				dataIndex: 'min_tipo_data_prev_entrega',
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
				dataIndex: 'min_dias_programado',
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
				dataIndex: 'min_dias_inicial',
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
				dataIndex: 'min_dias_final',
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
				dataIndex: 'min_tipo_hora_prev_entrega',
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
				dataIndex: 'min_hora_programada',
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
				dataIndex: 'min_hora_inicial',
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
				dataIndex: 'min_hora_final',
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
					dataIndex: 'min_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'min_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'min_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'min_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'min_versao',
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
						me.store.insert(0, Ext.create('Minima.data.Model'));
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
							if (record.get('min_id') > 0) {
								id.push(record.get('min_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/minima/php/response.php',
							method: 'post',
							params: {
								m: 'delete_minima',
								min_id: id.join(',')
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
					tab = me.up('minimaview'), grid = tab.down('minimafaixagrid');
					if (record) {
						grid.setMinId(record.get('min_id'));
					} else {
						grid.setMinId(0);
					}
				}
			}
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Minima.Faixa.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.minimafaixagrid',
	
	min_id: 0,
	setMinId: function(min_id) {
		var me = this, store = me.store, proxy = store.getProxy();
		me.min_id = min_id;
		proxy.setExtraParam('min_id', min_id);
		if (min_id > 0) {
			store.load();
		} else {
			store.removeAll();
		}
	},
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Minima.Faixa.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/minima/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_minima_faixa',
					min_id: me.min_id
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
				property: 'minfx_peso_ate_kg',
				direction: 'ASC'
			},{
				property: 'minfx_valor',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.min_id > 0;
				}
			}
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 1,
			listeners: {
				beforeedit: function(editor, e) {
					return e.record.get('min_id') > 0;
				},
				edit: function(editor, e) {
					Ext.Ajax.request({
						url: 'mod/cadastros/minima/php/response.php',
						method: 'post',
						params: Ext.applyIf({
							m: 'save_minima_faixa'
						}, e.record.data),
						failure: App.ajaxFailure,
						success: function(response) {
							var o = Ext.decode(response.responseText);
							if (o.success) {
								e.record.set('minfx_id', o.minfx_id);
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
				dataIndex: 'minfx_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70
			},{
				dataIndex: 'minfx_peso_ate_kg',
				text: 'Peso até (kg)',
				tooltip: 'Peso em KG',
				align: 'right',
				width: 120,
				renderer: Ext.util.Format.brFloat,
				editor: {
					xtype: 'decimalfield',
					minValue: 0,
					maxValue: 99999
				}
			},{
				dataIndex: 'minfx_valor', 
				text: 'Valor/kg',
				tooltip: 'Valor da tarifa por KG',
				align: 'right',
				width: 100,
				renderer: Ext.util.Format.brMoney,
				editor: {
					xtype: 'decimalfield',
					minValue: 0,
					maxValue: 9999.99
				}
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Incluir',
					handler: function() {
						if (!me.min_id) {
							return false;
						}
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Minima.Faixa.data.Model', {
							min_id: me.min_id
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
							if (record.get('minfx_id') > 0) {
								id.push(record.get('minfx_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/minima/php/response.php',
							method: 'post',
							params: {
								m: 'delete_minima_faixa',
								minfx_id: id.join(',')
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