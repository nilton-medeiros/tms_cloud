Ext.define('SAC.Cotacao.form.Panel', {
	extend: 'Ext.form.Panel',
	alias: 'widget.saccotacaoform',
	
	initComponent: function(){
		var me = this, cte_modal = App.empresa.emp_modal == 'Aereo' ? 2 : App.empresa.emp_modal == 'Rodoviario' ? 1 : 6,
		CubagemStore = Ext.create('Ext.data.Store', {
			fields: [
				{name:'cte_dim_group', type:'string', defaultValue:'COTAÇÃO'},
				{name:'cte_dim_tipo_embalagem', type:'string', defaultValue:'QUADRADA'},
				{name:'cte_dim_volumes', type:'int', defaultValue:0},
				{name:'cte_dim_peso_bruto', type:'float', defaultValue:0},
				{name:'cte_dim_cumprimento', type:'float', defaultValue:0},
				{name:'cte_dim_altura', type:'float', defaultValue:0},
				{name:'cte_dim_largura', type:'float', defaultValue:0},
				{name:'cte_dim_cubagem_m3', type:'float', defaultValue:0},
				{name:'cte_dim_peso_cubado', type:'float', defaultValue:0},
				{name:'cte_dim_peso_taxado', type:'float', defaultValue:0},
				{name:'cte_dim_info_manuseio', type:'int', defaultValue:99}
			],
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			groupField: 'cte_dim_group',
			sorters: [{
				property: 'cte_dim_tipo_embalagem',
				direction: 'ASC'
			},{
				property: 'cte_dim_volumes',
				direction: 'ASC'
			},{
				property: 'cte_dim_peso_bruto',
				direction: 'ASC'
			}]
		}),
		CubagemEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2,
			listeners: {
				beforeedit: function(editor, e) {
					if (e.field == 'cte_dim_largura' && e.record.get('cte_dim_tipo_embalagem') == 'CILINDRICA') {
						return false;
					}
				},
				afteredit: function(editor, e) {
					var fator = App.empresa.emp_tipo_calculo_cubagem == 'RODOVIARIO' ? 300 : 166.6667,
					pegarCubagem = function() {
						var cubagem = 0;
						if (e.record.get('cte_dim_tipo_embalagem') == 'QUADRADA') {
							cubagem = e.record.get('cte_dim_volumes') * (e.record.get('cte_dim_cumprimento') * e.record.get('cte_dim_altura') * e.record.get('cte_dim_largura'));
						} else {
							cubagem = e.record.get('cte_dim_volumes') * (e.record.get('cte_dim_cumprimento') * (e.record.get('cte_dim_altura') * e.record.get('cte_dim_altura')));
						}
						return cubagem;
					};
					if (e.field.search(new RegExp("volume|cumprimento|altura|largura", "gi")) > -1 && e.value != e.originalValue) {
						if (e.record.get('cte_dim_tipo_embalagem') == 'QUADRADA') {
							e.record.set('cte_dim_cubagem_m3', e.record.get('cte_dim_volumes') * (e.record.get('cte_dim_cumprimento') * e.record.get('cte_dim_altura') * e.record.get('cte_dim_largura')));
						} else {
							e.record.set('cte_dim_cubagem_m3', e.record.get('cte_dim_volumes') * (e.record.get('cte_dim_cumprimento') * (e.record.get('cte_dim_altura') * e.record.get('cte_dim_altura'))));
						}
						e.record.set('cte_dim_peso_cubado', e.record.get('cte_dim_cubagem_m3') * fator);
						
						if (e.record.get('cte_dim_peso_cubado') > e.record.get('cte_dim_peso_bruto')) {
							e.record.set('cte_dim_peso_taxado', App.roundMiddle(e.record.get('cte_dim_peso_cubado')));
						} else {
							e.record.set('cte_dim_peso_taxado', App.roundMiddle(e.record.get('cte_dim_peso_bruto')));
						}
					} else if (e.field == 'cte_dim_cubagem_m3' && e.value > 0 && e.value != pegarCubagem()) {
						e.record.set('cte_dim_cumprimento', 0);
						e.record.set('cte_dim_altura', 0);
						e.record.set('cte_dim_largura', 0);
					} else if (e.field == 'cte_dim_tipo_embalagem' && e.value == 'CILINDRICA') {
						e.record.set('cte_dim_largura', 0);
					} else if (e.field == 'cte_dim_peso_bruto' && e.value != e.originalValue) {
						e.record.set('cte_dim_peso_taxado', App.roundMiddle(e.value));
					}
				}
			}
		});
		
		var cotacaoStore = Ext.create('Ext.data.Store', {
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			fields: [
				{name:'id', type:'int'},
				{name:'tabela', type:'string'},
				{name:'numero_cotacao', type:'string', defaultValue:''},
				{name:'cotado_em', type:'date', dateFormat:'Y-m-d H:i:s'},
				{name:'volumes', type:'int'},
				{name:'peso_bruto', type:'float', defaultValue:0},
				{name:'peso_cubado', type:'float', defaultValue:0},
				{name:'peso_bc', type:'float', defaultValue:0},
				{name:'valor_carga', type:'float', defaultValue:0},
				{name:'valor_total', type:'float', defaultValue:0},
				{name:'status', type:'string', defaultValue:'ABERTA'},
				{name:'user_nome', type:'string', defaultValue:''},
				{name:'pdf', type:'string', defaultValue:''},
				{name:'tomador', type:'string', defaultValue:''},
				{name:'cidade_origem', type:'string', defaultValue:''},
				{name:'cidade_destino', type:'string', defaultValue:''},
				{name:'cidade_passagem', type:'string', defaultValue:''},
				{name:'observacoes', type:'string', defaultValue:''}
			],
			proxy: {
				type: 'ajax',
				url: 'mod/sac/cotacao/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_cotacao'
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
				property: 'cotado_em',
				direction: 'DESC'
			}]
		});
		
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				xtype: 'grid',
				region: 'east',
				title: 'Cotações salvas',
				width: window.innerWidth / 2,
				maxWidth: window.innerWidth / 1.5,
				minWidth: window.innerWidth / 3,
				split: true,
				collapsed: true,
				collapsible: true,
				enableLocking: true,
				enableColumnMove: false,
				enableColumnHide: false,
				viewConfig: {
					stripeRows: true,
					enableTextSelection: true
				},
				features: [{
					ftype: 'filters',
		        	encode: true,
		        	local: false
		        }],
				store: cotacaoStore,
				columns: [{
					dataIndex: 'id',
					text: 'ID',
					align: 'right',
					tdCls: 'x-grid-cell-special',
					tooltip: 'Código de identificação do registro',
					width: 70,
					filterable: true
				},{
					dataIndex: 'numero_cotacao',
					text: 'Número',
					tooltip: 'Número da cotação',
					width: 90,
					filterable: true
				},{
					xtype: 'templatecolumn',
					text: 'PDF',
					tooltip: 'Documento gerado da cotação (detalhes)',
					align: 'center',
					width: 50,
					sortable: false,
					filterable: false,
					menuDisabled: true,
					tpl: '<tpl if="pdf"><a href="{pdf}" target="_blank">ABRIR</a><tpl else>SEM DOCUMENTO</tpl>'
				},{
					dataIndex: 'status',
					text: 'STATUS',
					tooltip: 'Situação da cotação',
					align: 'center',
					width: 70,
					filter: {
						type: 'list',
						phpMode: true,
						options: ['ABERTA', 'FECHADA', 'CANCELADA']
					}
				},{
					xtype: 'datecolumn',
					dataIndex: 'cotado_em',
					text: 'Cotado em',
					tooltip: 'Data e horário em que foi realizado cotação',
					align: 'right',
					width: 140,
					format: 'D d/m/Y H:i',
					filterable: true
				},{
					dataIndex: 'tomador',
					text: 'Cliente',
					tooltip: 'Cliente tomador',
					width: 300,
					filterable: true
				},{
					dataIndex: 'tabela',
					text: 'Tabela',
					tooltip: 'Tabela usada para cálculo da cotação',
					width: 100,
					filterable: true
				},{
					dataIndex: 'cidade_origem',
					text: 'Origem',
					tooltip: 'Cidade de origem',
					width: 300,
					filterable: true
				},{
					dataIndex: 'cidade_destino',
					text: 'Destino',
					tooltip: 'Cidade de destino',
					width: 300,
					filterable: true
				},{
					dataIndex: 'cidade_passagem',
					text: 'Passagem',
					tooltip: 'Cidade de redespacho/passagem',
					width: 300,
					filterable: true
				},{
					dataIndex: 'volumes',
					text: 'Volumes',
					align: 'center',
					width: 80,
					filterable: true
				},{
					dataIndex: 'peso_bruto',
					text: 'Peso Bruto',
					tooltip: 'Peso Bruto em kg',
					align: 'right',
					width: 100,
					filterable: true,
					renderer: Ext.util.Format.brDecimal
				},{
					dataIndex: 'peso_cubado',
					text: 'Peso Cubado',
					tooltip: 'Peso Cubado em kg',
					align: 'right',
					width: 100,
					filterable: true,
					renderer: Ext.util.Format.brDecimal
				},{
					dataIndex: 'peso_bc',
					text: 'Peso Taxado',
					tooltip: 'Peso Taxado em kg',
					align: 'right',
					width: 100,
					filterable: true,
					renderer: Ext.util.Format.brDecimal
				},{
					dataIndex: 'valor_carga',
					text: 'Valor Carga',
					tooltip: 'Valor total da mercadoria',
					align: 'right',
					width: 100,
					filterable: true,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'valor_total',
					text: 'Valor Total',
					tooltip: 'Valor total da cotação',
					align: 'right',
					width: 100,
					filterable: true,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'observacoes',
					text: 'Observações',
					width: 300,
					filterable: true
				},{
					dataIndex: 'user_nome',
					text: 'Responsável',
					tooltip: 'Usuário responsável pela cotação',
					width: 200,
					filterable: true
				}],
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						text: 'FECHAR',
						iconCls: 'icon-checkmark',
						handler: function() {
							var selections = this.up('grid').getView().getSelectionModel().getSelection();
							if (!selections.length) {
								return false;
							}
							var id = [];
							Ext.each(selections, function(record) {
								id.push(record.get('id'));
								record.set('status', 'FECHADA');
							});
							Ext.Ajax.request({
								url: 'mod/sac/cotacao/php/response.php',
								method: 'post',
								params: {
									m: 'update_status',
									id: id.join(','),
									status: 'FECHADA'
								},
								failure: App.ajaxFailure,
								success: function() {
									Ext.each(selections, function(record) {
										record.commit();
									});
								}
							});
						}
					},{
						text: 'CANCELAR',
						iconCls: 'icon-cancel',
						handler: function() {
							var selections = this.up('grid').getView().getSelectionModel().getSelection();
							if (!selections.length) {
								return false;
							}
							var id = [];
							Ext.each(selections, function(record) {
								id.push(record.get('id'));
								record.set('status', 'CANCELADA');
							});
							Ext.Ajax.request({
								url: 'mod/sac/cotacao/php/response.php',
								method: 'post',
								params: {
									m: 'update_status',
									id: id.join(','),
									status: 'CANCELADA'
								},
								failure: App.ajaxFailure,
								success: function() {
									Ext.each(selections, function(record) {
										record.commit();
									});
								}
							});
						}
					},'-',{
						text: 'EXCLUIR',
						iconCls: 'icon-minus',
						handler: function() {
							var selections = this.up('grid').getView().getSelectionModel().getSelection();
							if (!selections.length) {
								return false;
							}
							var records = [];
							Ext.each(selections, function(record) {
								records.push({
									id: record.get('id'),
									pdf: record.get('pdf')
								});
							});
							Ext.Ajax.request({
								url: 'mod/sac/cotacao/php/response.php',
								method: 'post',
								params: {
									m: 'delete_cotacao',
									records: Ext.encode(records)
								},
								failure: App.ajaxFailure,
								success: App.ajaxSuccess
							});
							cotacaoStore.remove(selections);
						}
					}]
				},{
					xtype: 'pagingtoolbar',
					dock: 'bottom',
					store: cotacaoStore,
					displayInfo: true
				}]
			},{
				region: 'center',
				bodyPadding: 10,
				autoScroll: true,
				layout: 'anchor',
				defaults: {
					anchor: '100%',
					collapsible: false,
					defaults: {
						hideLabel: true,
						labelAlign: 'top',
						anchor: '100%',
						layout: {
							type: 'hbox',
							defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
						},
						defaults: {
							flex: 1,
							labelAlign: 'top',
							allowBlank: false,
							selectOnFocus: true
						},
						defaultType: 'textfield'
					},
					defaultType: 'fieldcontainer'
				},
				defaultType: 'fieldset',
				items: [{
					title: 'Identificação do Cliente',
					items: [{
						items: [{
							flex: 2,
							xtype: 'clientecombo',
							fieldLabel: 'Informe o cliente tomador',
							name: 'clie_tomador_id',
							allowBlank: true,
							extraParams: {
								clie_ativo: 1
							},
							listeners: {
								reset: function() {
									me.getForm().findField('clie_tom_tabela').reset();
								},
								select: function(f, records) {
									var record = records[0], form = me.getForm(),
									tabelaField = form.findField('clie_tom_tabela');
									if (Ext.isEmpty(record.get('clie_tom_tabela'))) {
										tabelaField.reset();
									} else {
										tabelaField.setValue(record.get('clie_tom_tabela'));
									}
									form.findField('cid_id_origem').setValue(record.get('cid_id'));
									var prodField = form.findField('prod_id'), prodStore = prodField.getStore();
									prodStore.getProxy().setExtraParam('clie_id', record.get('clie_id'));
									prodStore.load();
									
									var combo1 = form.findField('redespacho_id'),
									store1 = combo1.getStore(),
									proxy1 = store1.getProxy();
									proxy1.setExtraParam('clie_id', record.get('clie_id'));
									store1.load({
										callback: function() {
											var max = store1.max('red_id', false);
											max = parseInt(max);
											if (max > 0) {
												var data = store1.findRecord('red_id', max);
												if (data) {
													combo1.setValue(data.get('red_id'));
												}
											}
										}
									});
								}
							}
						},{
							xtype: 'localcombo',
							fieldLabel: 'Informe a tabela',
							name: 'clie_tom_tabela',
							value: 'EXPRESSO',
							options: ['NACIONAL','ESPECIAL','MINIMA','EXPRESSO']
						},{
							xtype: 'checkboxfield',
							fieldLabel: 'Cliente Destinatário',
							boxLabel: 'Isento de Inscrição Estadual',
							name: 'clie_ie_isento',
							inputValue: 1,
							checked: true,
							allowBlank: true
						}]
					},{
						items: [{
							xtype: 'cidadecombo',
							fieldLabel: 'Local de início da prestação',
							name: 'cid_id_origem',
							valueField: 'cid_id',
							displayField: 'cid_nome_completo',
							fireSelectEventOnValue: true,
							listeners: {
								change: function(field, newValue, oldValue) {
									var form = me.getForm(), cid_id_origem = field.getValue();
									if (cid_id_origem > 0 && oldValue != newValue) {
										var combo1 = form.findField('redespacho_id'),
										store1 = combo1.getStore(),
										proxy1 = store1.getProxy();
										proxy1.setExtraParam('cid_id_origem', cid_id_origem);
										proxy1.setExtraParam('cid_id_destino', form.findField('cid_id_destino').getValue());
										store1.load({
											callback: function() {
												var max = store1.max('red_id', false);
												max = parseInt(max);
												if (max > 0) {
													var data = store1.findRecord('red_id', max);
													if (data) {
														combo1.setValue(data.get('red_id'));
													}
												}
											}
										});
									}
								}
							}
						},{
							xtype: 'combo',
							fieldLabel: 'Local de passagem (VIA)',
							name: 'redespacho_id',
							valueField: 'red_id',
							displayField: 'cid_passagem_nome',
							editable: false,
							allowBlank: true,
							store: Ext.create('Ext.data.Store', {
								model: 'Taxa.Redespacho.data.Model',
								autoLoad: false,
								remoteSort: false,
								proxy: {
									type: 'ajax',
									url: 'mod/conhecimentos/ctes/php/response.php',
									extraParams: {
										clie_id: 0,
										cid_id_origem: 0,
										cid_id_destino: 0,
										m: 'redespacho_store'
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
									property: 'cid_passagem_nome',
									direction: 'ASC'
								}],
								listeners: {
									beforeload: function() {
										var params = this.getProxy().extraParams;
										return params.cid_id_origem > 0 && params.cid_id_destino > 0;
									}
								}
							}),
							listConfig: {
								width: 500,
								minWidth: 500,
								resizable: true,
								getInnerTpl: function() {
									return '{cid_passagem_nome}<br/><small><tpl if="red_nota">{red_nota}<br/></tpl>Cálculo: <tpl if="red_por_peso">Por peso<tpl else>Por CT-e</tpl> | Valor: {[Ext.util.Format.brMoney(values.red_valor)]} | Peso até: {red_ate_kg}kg | Excedente: {[Ext.util.Format.brMoney(values.red_excedente)]}/kg</small>';
								}
							}
						},{
							xtype: 'cidadecombo',
							fieldLabel: 'Local de término da prestação',
							name: 'cid_id_destino',
							valueField: 'cid_id',
							displayField: 'cid_nome_completo',
							listeners: {
								change: function(field, newValue, oldValue) {
									var form = me.getForm(), cid_id_destino = field.getValue();
									if (cid_id_destino > 0 && oldValue != newValue) {
										var combo1 = form.findField('redespacho_id'),
										store1 = combo1.getStore(),
										proxy1 = store1.getProxy();
										proxy1.setExtraParam('cid_id_destino', cid_id_destino);
										proxy1.setExtraParam('cid_id_origem', form.findField('cid_id_origem').getValue());
										store1.load({
											callback: function() {
												var max = store1.max('red_id', false);
												max = parseInt(max);
												if (max > 0) {
													var data = store1.findRecord('red_id', max);
													if (data) {
														combo1.setValue(data.get('red_id'));
													}
												}
											}
										});
									}
								}
							}
						}]
					}]
				},{
					style: {
						marginTop: 20
					},
					xtype: 'grid',
					itemId: 'cte-cubagem-grid',
					title: 'Quantidades da Carga e Dimensões/Cubagem',
					height: 300,
					store: CubagemStore,
					plugins: CubagemEditor,
					features: [{
						ftype: 'groupingsummary',
						groupHeaderTpl: 'Cargas',
						enableNoGroups: false,
						enableGroupingMenu: false
					}],
					enableColumnMove: false,
					enableColumnHide: false,
					columns: [{
						dataIndex: 'cte_dim_tipo_embalagem',
						text: 'Embalagem',
						tooltip: 'Tipo da embalegem para cálculo da cubagem',
						width: 100,
						menuDisabled: true,
						editor: {
							xtype: 'localcombo',
							options: ['QUADRADA','CILINDRICA']
						}
					},{
						dataIndex: 'cte_dim_volumes',
						text: 'Volumes',
						tooltip: 'Quantide total de cada tipo de mercadoria distinta de dimensões e peso',
						align: 'center',
						width: 100,
						menuDisabled: true,
						summaryType: 'sum',
						editor: {
							xtype: 'intfield',
							allowBlank: true,
							selectOnFocus: true,
							minValue: 0,
							maxValue: 9999999
						}
					},{
						dataIndex: 'cte_dim_peso_bruto',
						text: 'Peso Bruto (kg)',
						tooltip: 'Peso total da carga em kg distinta de dimensões e peso',
						align: 'right',
						flex: 1,
						menuDisabled: true,
						summaryType: 'sum',
						summaryRenderer: Ext.util.Format.brFloat,
						renderer: Ext.util.Format.brFloat,
						editor: {
							xtype: 'decimalfield',
							allowBlank: false,
							selectOnFocus: true,
							decimalPrecision: 4,
							minValue: 0,
							maxValue: 9999999.9999
						}
					},{
						dataIndex: 'cte_dim_cumprimento',
						text: 'Cumprimento (m)',
						tooltip: 'Cumprimento ou Profundidade em metros',
						align: 'right',
						flex: 1,
						menuDisabled: true,
						renderer: Ext.util.Format.brFloat,
						editor: {
							xtype: 'decimalfield',
							allowBlank: true,
							selectOnFocus: true,
							decimalPrecision: 3,
							minValue: 0,
							maxValue: 9999.999
						}
					},{
						dataIndex: 'cte_dim_altura',
						text: 'Altura (m)',
						tooltip: 'Altura ou Diâmetro em metros',
						align: 'right',
						flex: 1,
						menuDisabled: true,
						renderer: Ext.util.Format.brFloat,
						editor: {
							xtype: 'decimalfield',
							allowBlank: true,
							selectOnFocus: true,
							decimalPrecision: 3,
							minValue: 0,
							maxValue: 9999.999
						}
					},{
						dataIndex: 'cte_dim_largura',
						text: 'Largura (m)',
						tooltip: 'Largura em metros',
						align: 'right',
						flex: 1,
						menuDisabled: true,
						renderer: Ext.util.Format.brFloat,
						editor: {
							xtype: 'decimalfield',
							allowBlank: true,
							selectOnFocus: true,
							decimalPrecision: 3,
							minValue: 0,
							maxValue: 9999.999
						}
					},{
						dataIndex: 'cte_dim_cubagem_m3',
						text: 'Cubagem (m³)',
						tooltip: 'Quantidade total da cubagem de cada carga',
						align: 'right',
						flex: 1,
						menuDisabled: true,
						summaryType: 'sum',
						summaryRenderer: Ext.util.Format.brFloat,
						renderer: Ext.util.Format.brFloat,
						editor: {
							xtype: 'decimalfield',
							allowBlank: true,
							selectOnFocus: true,
							decimalPrecision: 4,
							minValue: 0,
							maxValue: 9999999.9999
						}
					},{
						dataIndex: 'cte_dim_peso_cubado',
						text: 'Peso Cubado (kg)',
						tooltip: 'Peso total cubado',
						align: 'right',
						flex: 1,
						menuDisabled: true,
						summaryType: 'sum',
						summaryRenderer: Ext.util.Format.brFloat,
						renderer: Ext.util.Format.brFloat,
						editor: {
							xtype: 'decimalfield',
							allowBlank: true,
							selectOnFocus: true,
							decimalPrecision: 4,
							minValue: 0,
							maxValue: 9999999.9999
						}
					},{
						dataIndex: 'cte_dim_peso_taxado',
						text: 'Peso taxado (kg)',
						tooltip: 'Peso total taxado',
						align: 'right',
						flex: 1,
						menuDisabled: true,
						summaryType: 'sum',
						summaryRenderer: Ext.util.Format.brFloat,
						renderer: Ext.util.Format.brFloat,
						editor: {
							xtype: 'decimalfield',
							allowBlank: true,
							selectOnFocus: true,
							decimalPrecision: 4,
							minValue: 0,
							maxValue: 9999999.9999
						}
					}],
					dockedItems: [{
						xtype: 'toolbar',
						dock: 'top',
						items: [{
							text: 'Incluir',
							iconCls: 'icon-plus',
							handler: function() {
								CubagemEditor.cancelEdit();
								CubagemStore.insert(0, Ext.create('CTE.Cubagem.data.Model'));
								CubagemEditor.startEditByPosition({row: 0, column: 1});
								this.up('grid').getView().refresh();
							}
						},{
							text: 'Excluir',
							iconCls: 'icon-minus',
							handler: function() {
								var selections = this.up('grid').getView().getSelectionModel().getSelection();
								if (!selections.length) {
									App.noRecordsSelected();
									return false;
								}
								CubagemStore.remove(selections);
							}
						}]
					}]
				},{
					style: {
						marginTop: 20
					},
					title: 'Mercadoria',
					items: [{
						items: [{
							flex: 2,
							xtype: 'produtocombo',
							fieldLabel: 'Informe o produto predominante',
							name: 'prod_id',
							hideTrigger: false,
							listeners: {
								select: function(field, records) {
									var record = records[0], form = me.getForm();
									form.findField('gt_rotulo').setValue(record.get('gt_id_codigo') + ' - ' + record.get('gt_descricao'));
								}
							}
						},{
							xtype: 'decimalfield',
							fieldLabel: 'Informe o valor total da carga',
							name: 'cte_valor_carga',
							value: 0,
							minValue: 0
						}]
					},{
						items: [{
							flex: 2,
							fieldLabel: 'CÓDIGO DO GRUPO DE TARIFA',
							name: 'gt_rotulo',
							readOnly: true,
							allowBlank: true
						},{
							fieldLabel: 'PESO TAXADO',
							name: 'cte_peso_taxado',
							readOnly: true,
							allowBlank: true,
							fieldStyle: {
								textAlign: 'right'
							}
						},{
							fieldLabel: 'VALOR MERCADORIA',
							name: 'cte_valor_mercadoria',
							readOnly: true,
							allowBlank: true,
							fieldStyle: {
								textAlign: 'right'
							}
						}]
					}]
				},{
					style: {
						marginTop: 20
					},
					xtype: 'grid',
					itemId: 'cte-componente-frete-grid',
					title: 'Componentes do Valor da Prestação',
					autoHeight: true,
					minHeight: 200,
					defaults: null,
					sortableColumns: false,
					plugins: Ext.create('Ext.grid.plugin.CellEditing',{
						clicksToEdit: 2,
						listeners: {
							edit: function(editor, e) {
								if (e.field == 'ccc_percentual_desconto' && e.value != e.originalValue) {
									if (e.value > 0 && e.record.get('ccc_valor') > 0) {
										var valorDesconto = App.descontoPercentual(e.value, e.record.get('ccc_valor'));
										valorDesconto = Ext.util.Format.round(valorDesconto, 2);
										e.record.set('ccc_valor_desconto', e.record.get('ccc_valor') - valorDesconto);
										e.record.set('ccc_valor', valorDesconto);
									} else {
										e.record.set('ccc_valor_desconto', 0);
									}
								} else if (e.field == 'ccc_valor_desconto' && e.value != e.originalValue) {
									if (e.value > 0 && e.record.get('ccc_valor') > 0) {
										e.record.set('ccc_percentual_desconto', Ext.util.Format.round((e.value / e.record.get('ccc_valor')) * 100, 0));
										e.record.set('ccc_valor', e.record.get('ccc_valor') + e.originalValue - e.value);
									} else {
										e.record.set('ccc_percentual_desconto', 0);
									}
								}
								var form = me.getForm(), 
								icmsField, 
								icms = 0, 
								valorIcms = 0, 
								valorTotal = 0, 
								valorSubTotal = 0,
								valorDesconto = 0,
								
								cidadeOrigemField = form.findField('cid_id_origem'),
								cidadeDestinoField = form.findField('cid_id_destino'),
								
								clie_ie_isento = form.findField('clie_ie_isento').getValue();
								cidade_origem = cidadeOrigemField.findRecordByValue(cidadeOrigemField.getValue()),
								cidade_destino = cidadeDestinoField.findRecordByValue(cidadeDestinoField.getValue()),
									 
								percReduc = form.findField('cte_perc_reduc_bc'), 
								sitTributaria = form.findField('cte_codigo_sit_tributaria');
								
								e.grid.getStore().each(function(record) {
									if (record.get('cf_nome').search(new RegExp("ICMS", "gi")) < 0) {
										valorSubTotal += record.get('ccc_valor');
									} else {
										icmsField = record;
									}
									valorTotal += record.get('ccc_valor');
									valorDesconto += record.get('ccc_valor_desconto');
								});
								
								if (cte_modal == 1) {
									if (cidade_origem.get('cid_uf').toUpperCase() == 'MG' && cidade_destino.get('cid_uf').toUpperCase() == 'MG') {
										icms = 0;
									} else if (cidade_origem.get('cid_uf').search(new RegExp("MG|PR|RS|SC|SP", "gi")) > -1 && cidade_destino.get('cid_uf').search(new RegExp("AC|AL|AM|AP|BA|CE|DF|ES|GO|MA|MT|MS|PA|PB|PE|PI|RN|RO|RR|SE|TO","gi")) > -1 && !clie_ie_isento) {
										icms = 7;
									} else {
										icms = 12;
									}
								} else {
									icms = 4;
								}
								
								if (e.field == 'ccc_valor' && e.record.get('cf_nome').search(new RegExp("ICMS", "gi")) >= 0) {
									if (e.value > 0) {
										valorTotal = valorSubTotal / (1 - (icms / 100));
										valorIcms = valorTotal * (icms / 100);
										//sitTributaria.setValue('90 - ICMS outros');
									} else if (icms > 0) {
										valorIcms = valorTotal * (icms / 100);
										//sitTributaria.setValue('40 - ICMS isenção');
									}
								} else if (icms > 0) {
									if (icmsField) {
										valorTotal = valorSubTotal / (1 - (icms / 100));
										valorIcms = valorTotal * (icms / 100);
										icmsField.set('ccc_valor', valorTotal - valorSubTotal);
										icmsField.set('ccc_tipo_tarifa', 'TAXA INCLUSA DE ICMS');
									} else {
										valorIcms = valorTotal * (icms / 100);
										percReduc.reset();
										percReduc.clearInvalid();
										percReduc.setDisabled(true);
									}
									sitTributaria.setValue('00 - Tributação normal do ICMS');
								} else {
									sitTributaria.setValue('40 - ICMS isenção');
								}
								
								form.findField('cte_aliquota_icms').setValue(Ext.util.Format.percent(icms));
								form.findField('cte_valor_icms').setValue(Ext.util.Format.brMoney(valorIcms));
								form.findField('cte_valor_bc').setValue(Ext.util.Format.brMoney(valorTotal));
								form.findField('cte_valor_total').setValue(valorTotal);
								form.findField('cte_valor_total_desconto').setValue(valorDesconto);
								form.findField('cte_valor_total_rotulo').setValue(Ext.util.Format.brMoney(valorTotal));
								form.findField('cte_valor_total_desconto_rotulo').setValue(Ext.util.Format.brMoney(valorDesconto));
								form.findField('cte_frete_manual').setValue(1);
								
								if (App.empresa.emp_simples_nacional) {
									sitTributaria.setValue('SIMPLES NACIONAL');
									
									var percReducBc = form.findField('cte_perc_reduc_bc'),
									valorBc = form.findField('cte_valor_bc'),
									icmsPerc = form.findField('cte_aliquota_icms'),
									icmsValor = form.findField('cte_valor_icms');
									outorgado = form.findField('cte_valor_cred_outorgado');
									
									percReducBc.reset();
									percReducBc.clearInvalid();
									percReducBc.setDisabled(true);
									
									valorBc.reset();
									valorBc.clearInvalid();
									valorBc.setDisabled(true);
									
									icmsPerc.reset();
									icmsPerc.clearInvalid();
									icmsPerc.setDisabled(true);
									
									icmsValor.reset();
									icmsValor.clearInvalid();
									icmsValor.setDisabled(true);
									
									outorgado.reset();
									outorgado.clearInvalid();
									outorgado.setDisabled(true);
								}
							}
						}
					}),
					store: Ext.create('Ext.data.JsonStore', {
						fields: [
							{name:'ccc_id', type:'int'},
							{name:'cte_id', type:'int'},
							{name:'cc_id', type:'int'},
							{name:'cf_id', type:'int'},
							{name:'cf_tipo', type:'int'},
							{name:'cf_nome', type:'string', defaultValue:''},
							{name:'cc_titulo', type:'string', defaultValue:''},
							{name:'ccc_tabela', type:'string', defaultValue:''},
							{name:'ccc_valor', type:'float', defaultValue:0},
							{name:'ccc_valor_tarifa_kg', type:'float', defaultValue:0},
							{name:'ccc_tipo_tarifa', type:'string', defaultValue:''},
							{name:'ccc_tipo_advalorem', type:'string', defaultValue:''},
							{name:'ccc_valor_desconto', type:'float', defaultValue:0},
							{name:'ccc_percentual_desconto', type:'float', defaultValue:0},
							{name:'ccc_exibir_valor_dacte', type:'boolean', defaultValue:1},
							{name:'ccc_exibir_desconto_dacte', type:'boolean', defaultValue:1}
						],
						autoLoad: false,
						autoDestroy: true,
						remoteSort: false,
						remoteGroup: false,
						remoteFilter: false,
						
						proxy: {
							type: 'ajax',
							url: 'mod/conhecimentos/ctes/php/response.php',
							filterParam: 'query',
							extraParams: {
								m: 'read_comp_calculo',
								cte_id: 0
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
							property: 'cf_tipo',
							direction: 'ASC'
						},{
							property: 'cf_id',
							direction: 'ASC'
						}]
					}),
					dockedItems: [{
						xtype: 'toolbar',
						dock: 'bottom',
						items: ['&nbsp;',{
							xtype: 'checkboxfield',
							name: 'exibir_calculo_pdf',
							boxLabel: 'Exibir no PDF'
						}]
					}],
					columns: [{
						dataIndex: 'cc_titulo',
						text: 'Título do componente',
						menuDisabled: true,
						flex: 1
					},{
						dataIndex: 'ccc_valor',
						text: 'Valor calculado do componente',
						align: 'right',
						menuDisabled: true,
						renderer: Ext.util.Format.brMoney,
						width: 180,
						editor: {
							xtype: 'decimalfield',
							minValue: 0,
							maxValue: 999999.99
						}
					},{
						dataIndex: 'ccc_valor_tarifa_kg',
						text: 'Valor da tarifa por kg',
						align: 'right',
						menuDisabled: true,
						renderer: Ext.util.Format.brMoney,
						width: 140
					},{
						dataIndex: 'ccc_tipo_tarifa',
						text: 'Tipo de Tarifa/Descrição',
						menuDisabled: true,
						flex: 2
					},{
						dataIndex: 'ccc_percentual_desconto',
						text: 'Desconto (%)',
						align: 'center',
						menuDisabled: true,
						renderer: Ext.util.Format.percent,
						width: 90,
						editor: {
							xtype: 'percentfield',
							minValue: 0,
							maxValue: 99.99
						}
					},{
						dataIndex: 'ccc_valor_desconto',
						text: 'Desconto (R$)',
						align: 'right',
						menuDisabled: true,
						renderer: Ext.util.Format.brMoney,
						width: 90,
						editor: {
							xtype: 'decimalfield',
							minValue: 0,
							maxValue: 999999.99
						}
					},{
						dataIndex: 'ccc_tabela',
						text: 'Origem de Cálculo',
						menuDisabled: true,
						width: 140
					}]
				},{
					style: {
						marginTop: 20
					},
					title: 'ICMS',
					items: [{
						items: [{
							xtype: 'localcombo',
							fieldLabel: 'Código da Situação Tributária',
							name: 'cte_codigo_sit_tributaria',
							value: App.empresa.emp_simples_nacional ? 'SIMPLES NACIONAL' : '00 - Tributação normal do ICMS',
							allowBlank: true,
							options: [
								'00 - Tributação normal do ICMS',
								'20 - Tributação com redução de BC do ICMS',
								'40 - ICMS isenção',
								'41 - ICMS não tributado',
								'51 - ICMS diferido',
								'60 - ICMS cobrado anteriormente por substituição tributária',
								'90 - ICMS outros',
								'90 - ICMS devido à UF de origem da prestação, quando diferente da UF emitente',
								'SIMPLES NACIONAL'
							],
							listeners: {
								select: function(field, records) {
									var form = me.getForm(), record = records[0],
									originalValue = field.getValue(),
									value = parseInt(originalValue.replace(/[^0-9]/gi, "")),
									percReducBc = form.findField('cte_perc_reduc_bc'),
									valorBc = form.findField('cte_valor_bc'),
									icmsPerc = form.findField('cte_aliquota_icms'),
									icmsValor = form.findField('cte_valor_icms');
									outorgado = form.findField('cte_valor_cred_outorgado');
									
									if (originalValue == 'SIMPLES NACIONAL') {
										percReducBc.reset();
										percReducBc.clearInvalid();
										percReducBc.setDisabled(true);
										
										valorBc.reset();
										valorBc.clearInvalid();
										valorBc.setDisabled(true);
										
										icmsPerc.reset();
										icmsPerc.clearInvalid();
										icmsPerc.setDisabled(true);
										
										icmsValor.reset();
										icmsValor.clearInvalid();
										icmsValor.setDisabled(true);
										
										outorgado.reset();
										outorgado.clearInvalid();
										outorgado.setDisabled(true);
									} else if (originalValue == '90 - ICMS devido à UF de origem da prestação, quando diferente da UF emitente') {
										outorgado.reset();
										outorgado.clearInvalid();
										outorgado.setDisabled(true);
									} else {
										var disabled = value == 0 || value == 40 || value == 41 || value == 51 || value == 60;
										if (disabled) {
											percReducBc.reset();
											percReducBc.clearInvalid();
										}
										percReducBc.setDisabled(disabled);
										
										disabled = value == 40 || value == 41 || value == 51 || value == 60;
										if (disabled) {
											valorBc.reset();
											valorBc.clearInvalid();
											
											icmsPerc.reset();
											icmsPerc.clearInvalid();
										
											icmsValor.reset();
											icmsValor.clearInvalid();
										}
										valorBc.setDisabled(disabled);
										icmsPerc.setDisabled(disabled);
										icmsValor.setDisabled(disabled);
										
										disabled = value == 0 || value == 20 || value == 40 || value == 41 || value == 51;
										if (disabled) {
											outorgado.reset();
											outorgado.clearInvalid();
										}
										outorgado.setDisabled(disabled);
									}
									
									form.isValid();
								}
							}
						},{
							xtype: 'textfield',
							fieldLabel: 'Valor do crédito Outorgado/Presumido',
							name: 'cte_valor_cred_outorgado',
							labelAlign: 'left',
							labelWidth: 230,
							disabled: true,
							allowBlank: true,
							fieldStyle: {
								textAlign: 'right'
							}
						}]
					},{
						items: [{
							xtype: 'percentfield',
							fieldLabel: 'Percentual de Redução da BC',
							name: 'cte_perc_reduc_bc',
							labelAlign: 'left',
							labelWidth: 230,
							disabled: true,
							allowBlank: true,
							minValue: 0,
							maxValue: 100,
							fieldStyle: {
								textAlign: 'right'
							}
						},{
							xtype: 'textfield',
							fieldLabel: 'Valor da BC do ICMS',
							name: 'cte_valor_bc',
							labelAlign: 'left',
							labelWidth: 230,
							readOnly: true,
							allowBlank: true,
							fieldStyle: {
								textAlign: 'right'
							}
						}]
					},{
						items: [{
							xtype: 'textfield',
							fieldLabel: 'Alíquota do ICMS',
							name: 'cte_aliquota_icms',
							labelAlign: 'left',
							labelWidth: 230,
							readOnly: true,
							allowBlank: true,
							fieldStyle: {
								textAlign: 'right'
							}
						},{
							xtype: 'textfield',
							fieldLabel: 'Valor do ICMS',
							name: 'cte_valor_icms',
							labelAlign: 'left',
							labelWidth: 230,
							readOnly: true,
							allowBlank: true,
							fieldStyle: {
								textAlign: 'right'
							}
						}]
					}]
				},{
					title: 'Observações para esta cotação',
					items: [{
						items: [{
							xtype: 'textareafield',
							name: 'observacoes',
							height: 100,
							hideLabel: true,
							allowBlank: true
						}]
					}]
				},{
					title: 'TOTAL DA COTAÇÃO',
					items: [{
						items: [{
							xtype: 'hiddenfield',
							name: 'cte_frete_manual',
							flex: null,
							width: 0,
							value: 0,
							allowBlank: true
						},{
							xtype: 'displayfield',
							fieldLabel: 'Valor total do desconto',
							name: 'cte_valor_total_desconto_rotulo',
							value: 'R$ 0,00',
							labelStyle: 'font-size:10pt',
							allowBlank: true,
							fieldStyle: {
								textAlign: 'right',
								fontSize: '18pt',
								color: 'green'
							}
						},{
							xtype: 'displayfield',
							fieldLabel: 'Valor total da prestação do serviço incluindo desconto',
							name: 'cte_valor_total_rotulo',
							value: 'R$ 0,00',
							labelStyle: 'font-size:10pt',
							allowBlank: true,
							flex: 2,
							fieldStyle: {
								textAlign: 'right',
								fontSize: '18pt',
								color: 'blue'
							}
						},{
							xtype: 'hiddenfield',
							name: 'cte_valor_total',
							flex: null,
							width: 0,
							value: 0,
							allowBlank: true
						},{
							xtype: 'hiddenfield',
							name: 'cte_valor_total_desconto',
							flex: null,
							width: 0,
							value: 0,
							allowBlank: true
						}]
					}]
				}],
				buttons: [{
					ui: 'green-button',
					text: 'NOVA COTAÇÃO',
					scale: 'medium',
					handler: function() {
						var form = me.getForm();
						form.reset();
						form.isValid();
						CubagemStore.removeAll();
						me.down('#cte-componente-frete-grid').getStore().removeAll();
						me.down('#save-btn').setDisabled(true);
					}
				},{
					ui: 'blue-button',
					text: 'CALCULAR',
					scale: 'medium',
					disabled: true,
					formBind: true,
					handler: function(btn) {
						var form = me.getForm(), originalText = btn.getText(), 
						
						tabela = form.findField('clie_tom_tabela').getValue(),
						prefix = tabela == 'NACIONAL' ? 'nac_' : tabela == 'ESPECIAL' ? 'esp_' : tabela == 'MINIMA' ? 'min_' : '',
						
						tomadorField = form.findField('clie_tomador_id'),
						cidadeOrigemField = form.findField('cid_id_origem'),
						cidadeDestinoField = form.findField('cid_id_destino'),
						prodGrid = me.down('#cte-cubagem-grid'),
						prodStore = prodGrid.getStore(),
						prodField = form.findField('prod_id'),
						redespachoField = form.findField('redespacho_id'),
						valorCarga = form.findField('cte_valor_carga').getValue(),
						
						grid = me.down('#cte-componente-frete-grid'),
						store = grid.getStore(), proxy = store.getProxy();
						
						var pesoTaxado = 0;
						prodStore.each(function(r){
							pesoTaxado += r.get('cte_dim_peso_taxado');
						});
						
						if (!pesoTaxado) {
							form.findField('cte_peso_taxado').markInvalid('***PESO TAXADO NÃO DEFINIDO***');
							return false;
						}
						if (!valorCarga) {
							form.findField('cte_valor_mercadoria').markInvalid('***VALOR MERCADORIA NÃO DEFINIDO***');
							return false;
						}
						if (!prodField.getValue() || Ext.isEmpty(prodField.getValue())) {
							form.findField('gt_rotulo').setValue('***PRODUTO NÃO DEFINIDO***');
							return false;
						}
						
						form.findField('cte_peso_taxado').setValue(Ext.util.Format.brDecimal(pesoTaxado) + ' kg');
						form.findField('cte_valor_mercadoria').setValue(Ext.util.Format.brMoney(valorCarga));
						
						var request = function(percLucro) {
							btn.setText('CALCULANDO...');
							btn.setDisabled(true);
							
							var redespacho = redespachoField.findRecordByValue(redespachoField.getValue()),
							cidade_id_destino = cidadeDestinoField.getValue();
							
							if (redespacho) {
								if (redespacho.get('cid_id_passagem') > 0) {
									cidade_id_destino = redespacho.get('cid_id_passagem');
								}
							}
							
							Ext.Ajax.request({
								url: 'mod/conhecimentos/ctes/php/response.php',
								method: 'get',
								params: {
									m: 'pegar_tabela',
									tabela: tabela,
									peso_taxado: pesoTaxado,
									clie_id: tomadorField.getValue(),
									cid_id_origem: cidadeOrigemField.getValue(),
									cid_id_destino: cidade_id_destino 
								},
								failure: Ext.Function.createSequence(App.ajaxFailure, function(){
									btn.setDisabled(false);
									btn.setText(originalText);
								}),
								success: function(response) {
									btn.setDisabled(false);
									btn.setText(originalText);
									
									var o = Ext.decode(response.responseText),
									tabelaCliente = Ext.isEmpty(o.tab_com_cliente) ? o.tab_sem_cliente : o.tab_com_cliente;
									tabelaCliente = tabelaCliente[0];
									if (Ext.isEmpty(tabelaCliente)) {
										App.notify('NENHUM REGISTRO FOI ENCONTRADA PARA TABELA DE PREÇO ' + tabela);
									} else {
										var tomador = tomadorField.findRecordByValue(tomadorField.getValue()),
										produto = prodField.findRecordByValue(prodField.getValue()),
										cidade_origem = cidadeOrigemField.findRecordByValue(cidadeOrigemField.getValue()),
										cidade_destino = cidadeDestinoField.findRecordByValue(cidadeDestinoField.getValue()),
										clie_ie_isento = form.findField('clie_ie_isento').getValue();
										
										proxy.setExtraParam('cte_id', 0);
										proxy.setExtraParam('cte_modal', cte_modal);
										proxy.setExtraParam('tabela_cliente', tabela);
										proxy.setExtraParam('cte_peso_bc', pesoTaxado);
										proxy.setExtraParam('cte_forma_pgto', 1);
										proxy.setExtraParam('cte_valor_carga', valorCarga);
										proxy.setExtraParam('tabela_cliente_record', Ext.encode({
											clie_id: tabelaCliente.clie_id,
											nac_id: tabelaCliente.nac_id,
											min_id: tabelaCliente.min_id,
											exp_id: tabelaCliente.id,
											nac_taxa_minima: tabelaCliente.nac_taxa_minima,
											espfx_peso_ate_kg: tabelaCliente.espfx_peso_ate_kg,
											espfx_excedente: tabelaCliente.espfx_excedente,
											espfx_valor: tabelaCliente.espfx_valor,
											exp_peso: tabelaCliente.peso_taxa_minima,
											exp_valor: tabelaCliente.valor_taxa_minima
										}));
										if (produto) {
											produto = produto.data;
											proxy.setExtraParam('produto_predominante', Ext.encode({
												gt_isento_icms: produto.gt_isento_icms,
												gt_obrigar_especifica: produto.gt_obrigar_especifica,
												prod_tarifa: produto.prod_tarifa,
												gt_id_codigo: produto.gt_id_codigo,
												iic_codigo: produto.iic_codigo,
												prod_tipo_advalorem: produto.prod_tipo_advalorem
											}));
										}
										var cid_destino_setup = false;
										if (redespacho) {
											redespacho = redespacho.data;
											proxy.setExtraParam('redespacho', Ext.encode({
												red_valor: redespacho.red_valor,
												red_ate_kg: redespacho.red_ate_kg,
												red_excedente: redespacho.red_excedente,
												cid_id_passagem: redespacho.cid_id_passagem,
												red_aceita_frete_a_pagar: redespacho.red_aceita_frete_a_pagar
											}));
											if (redespacho.cid_id_passagem > 0) {
												proxy.setExtraParam('cidade_destino', Ext.encode({
													cid_id: redespacho.cid_id_passagem,
													cid_uf: redespacho.cid_passagem_uf,
													cid_suframa: redespacho.cid_passagem_suframa,
													cid_valor_sefaz: redespacho.cid_passagem_valor_sefaz
												}));
												cidade_destino = {
													cid_id: redespacho.cid_id_passagem,
													cid_nome: redespacho.cid_passagem_nome,
													cid_nome_completo: redespacho.cid_passagem_nome,
													cid_codigo_municipio: redespacho.cid_passagem_codigo_municipio,
													cid_municipio: redespacho.cid_passagem_municipio,
													cid_uf: redespacho.cid_passagem_uf,
													cid_sigla: redespacho.cid_passagem_sigla,
													cid_nome_aeroporto: redespacho.cid_passagem_nome_aeroporto,
													cid_suframa: redespacho.cid_passagem_suframa,
													cid_valor_sefaz: redespacho.cid_passagem_valor_sefaz
												};
												cid_destino_setup = true;
											}
										}
										if (tomador) {
											tomador = tomador.data;
											proxy.setExtraParam('tomador', Ext.encode({
												clie_id: tomador.clie_id,
												clie_seguro_intra_estadual: tomador.clie_seguro_intra_estadual,
												clie_seguro_inter_estadual: tomador.clie_seguro_inter_estadual,
												clie_forma_aplicar_seguro: tomador.clie_forma_aplicar_seguro,
												clie_seguro_intra_estadual: tomador.clie_seguro_intra_estadual,
												clie_seguro_inter_estadual: tomador.clie_seguro_inter_estadual,
												clie_seguro_adval_tipo_1: tomador.clie_seguro_adval_tipo_1,
												clie_seguro_adval_tipo_2: tomador.clie_seguro_adval_tipo_2,
												clie_seguro_desconto: tomador.clie_seguro_desconto,
												clie_tom_aceita_suframa: tomador.clie_tom_aceita_suframa,
												clie_tom_taxa_sefaz: tomador.clie_tom_taxa_sefaz,
												clie_gris_percentual: tomador.clie_gris_percentual,
												clie_gris_valor_minimo: tomador.clie_gris_valor_minimo,
												num_notas: 0
											}));
										}
										if (cidade_origem) {
											cidade_origem = cidade_origem.data;
											proxy.setExtraParam('cidade_origem', Ext.encode({
												cid_id: cidade_origem.cid_id,
												cid_uf: cidade_origem.cid_uf
											}));
										}
										if (cidade_destino && !cid_destino_setup) {
											cidade_destino = cidade_destino.data;
											proxy.setExtraParam('cidade_destino', Ext.encode({
												cid_id: cidade_destino.cid_id,
												cid_uf: cidade_destino.cid_uf,
												cid_suframa: cidade_destino.cid_suframa,
												cid_valor_sefaz: cidade_destino.cid_valor_sefaz
											}));
										}
										store.load({
											callback: function(records) {
												if (!store.getProxy().extraParams.cte_id) {
													var icmsField, icms = 0, valorIcms = 0, valorTotal = 0, valorSubTotal = 0, valorDesconto = 0,
													percReduc = form.findField('cte_perc_reduc_bc'), 
													sitTributaria = form.findField('cte_codigo_sit_tributaria');
													Ext.each(records, function(record) {
														if (record.get('cf_nome').search(new RegExp("ICMS", "gi")) < 0) {
															valorSubTotal += record.get('ccc_valor');
														} else {
															icmsField = record;
														}
														valorTotal += record.get('ccc_valor');
														valorDesconto += record.get('ccc_valor_desconto');
													});
													if (percLucro > 0) {
														var valorLucro = Ext.util.Format.round((percLucro / 100) * valorSubTotal, 2);
														store.add({
															cc_titulo: 'LUCRO',
															ccc_valor: valorLucro,
															ccc_tipo_tarifa: 'MARGEM DE LUCRO ' + Ext.util.Format.percent(percLucro)
														});
														valorTotal += valorLucro;
														valorSubTotal += valorLucro;
													}
													if (cte_modal == 1) {
														if (cidade_origem.cid_uf.toUpperCase() == 'MG' && cidade_destino.cid_uf.toUpperCase() == 'MG') {
															icms = 0;
														} else if (cidade_origem.cid_uf.search(new RegExp("MG|PR|RS|SC|SP", "gi")) > -1 && cidade_destino.cid_uf.search(new RegExp("AC|AL|AM|AP|BA|CE|DF|ES|GO|MA|MT|MS|PA|PB|PE|PI|RN|RO|RR|SE|TO","gi")) > -1 && !clie_ie_isento) {
															icms = 7;
														} else {
															icms = 12;
														}
													} else {
														icms = 4;
													}
													
													if (icms > 0) {
														if (icmsField) {
															valorTotal = valorSubTotal / (1 - (icms / 100));
															valorIcms = valorTotal * (icms / 100);
															icmsField.set('ccc_valor', valorTotal - valorSubTotal);
															icmsField.set('ccc_tipo_tarifa', 'TAXA INCLUSA DE ICMS');
															icmsField.commit();
														} else {
															valorIcms = valorTotal * (icms / 100);
															percReduc.reset();
															percReduc.clearInvalid();
															percReduc.setDisabled(true);
														}
														sitTributaria.setValue('00 - Tributação normal do ICMS');
													} else {
														sitTributaria.setValue('40 - ICMS isenção');
													}
													
													form.findField('cte_aliquota_icms').setValue(Ext.util.Format.percent(icms));
													form.findField('cte_valor_icms').setValue(Ext.util.Format.brMoney(valorIcms));
													form.findField('cte_valor_bc').setValue(Ext.util.Format.brMoney(valorTotal));
													form.findField('cte_valor_total').setValue(valorTotal);
													form.findField('cte_valor_total_rotulo').setValue(Ext.util.Format.brMoney(valorTotal));
													form.findField('cte_valor_total_desconto_rotulo').setValue(Ext.util.Format.brMoney(valorDesconto));
													form.findField('cte_frete_manual').setValue(0);
													
													if (App.empresa.emp_simples_nacional) {
														sitTributaria.setValue('SIMPLES NACIONAL');
														
														var percReducBc = form.findField('cte_perc_reduc_bc'),
														valorBc = form.findField('cte_valor_bc'),
														icmsPerc = form.findField('cte_aliquota_icms'),
														icmsValor = form.findField('cte_valor_icms');
														outorgado = form.findField('cte_valor_cred_outorgado');
														
														percReducBc.reset();
														percReducBc.clearInvalid();
														percReducBc.setDisabled(true);
														
														valorBc.reset();
														valorBc.clearInvalid();
														valorBc.setDisabled(true);
														
														icmsPerc.reset();
														icmsPerc.clearInvalid();
														icmsPerc.setDisabled(true);
														
														icmsValor.reset();
														icmsValor.clearInvalid();
														icmsValor.setDisabled(true);
														
														outorgado.reset();
														outorgado.clearInvalid();
														outorgado.setDisabled(true);
													}
												}
												if (tomador) {
													var saveEnabled = tomador.clie_id > 0;
													me.down('#save-btn').setDisabled(!saveEnabled);
												}
											}
										});
									}
								}
							});
						};
						if (App.empresa.emp_margem_lucro_min > 0 && App.empresa.emp_margem_lucro_padrao > 0) {
							var win = Ext.create('Ext.ux.Window', {
								title: 'Margem de Lucro',
								width: 280,
								height: 150,
								autoShow: true,
								closable: true,
								minimizable: false,
								maximizable: false,
								resizable: false,
								layout: 'fit',
								items: {
									xtype: 'form',
									bodyPadding: 10,
									layout: 'anchor',
									defaults: {
										flex: 1,
										anchor: '100%',
										labelAlign: 'top',
										allowBlank: false,
										selectOnFocus: true
									},
									items: [{
										xtype: 'intfield',
										name: 'lucro',
										fieldLabel: 'Informe o percentual para margem de lucro',
										value: App.empresa.emp_margem_lucro_padrao,
										minValue: App.empresa.emp_margem_lucro_min,
										maxValue: 100
									}],
									buttons: [{
										text: 'CALCULAR',
										scale: 'medium',
										formBind: true,
										handler: function() {
											request(this.up('form').getForm().findField('lucro').getValue());
											win.close();
										}
									}]
								}
							});
						} else {
							request();
						}
					}
				},{
					itemId: 'save-btn',
					ui: 'orange-button',
					text: 'SALVAR',
					scale: 'medium',
					disabled: true,
					handler: function(btn) {
						var form = me.getForm();
						if (!form.isValid()) {
							return false;
						}
						var field = form.findField('clie_tomador_id'), isValid = field.getValue() > 0;
						if (!isValid) {
							field.markInvalid('***PARA SALVAR A COTAÇÃO É PRECISO INFORMAR O TOMADOR***');
							field.focus();
							return false;
						}
						
						var produtos = [], componentes = [],
						prodStore = me.down('#cte-cubagem-grid').getStore(), 
						calcStore = me.down('#cte-componente-frete-grid').getStore();
						prodStore.each(function(record){
							produtos.push(record.data);
						});
						calcStore.each(function(record){
							componentes.push(record.data);
						});
						
						if (!produtos.length || !componentes.length) {
							return false;
						}
						
						var originalText = btn.getText();
						btn.setText('SALVANDO...');
						btn.setDisabled(true);
						
						form.submit({
							clientValidation: true,
							url: 'mod/sac/cotacao/php/response.php',
							method: 'post',
							params: {
								m: 'save_cotacao',
								tomador: Ext.encode(field.findRecordByValue(field.getValue()).data),
								origem: form.findField('cid_id_origem').getRawValue(),
								destino: form.findField('cid_id_destino').getRawValue(),
								passagem: form.findField('redespacho_id').getRawValue(),
								produto: form.findField('prod_id').getRawValue(),
								produtos: Ext.encode(produtos),
								componentes: Ext.encode(componentes)
							},
							failure: Ext.Function.createSequence(App.formFailure, function() {
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(f, a) {
								btn.setDisabled(true);
								btn.setText(originalText);
								form.reset();
								form.isValid();
								prodStore.removeAll();
								calcStore.removeAll();
								var popup = window.open(a.result.url);
								if (!popup) {
									Ext.create('Ext.ux.Alert', {
										ui: 'black-alert',
										msg: 'Sua cotação foi salva e foi gerado um documento com sucesso no formato PDF. Porém o sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para evitar futuras mensagens, por gentileza adicione esse site na lista de excessões de seu navegador.',
										buttons: [{
											ui: 'red-button',
											text: 'ABRIR PDF',
											href: a.result.url
										}]
									});
								}
								cotacaoStore.reload();
							}
						});
					}
				}]
				
			}]
		});
		me.callParent(arguments);
	}
});