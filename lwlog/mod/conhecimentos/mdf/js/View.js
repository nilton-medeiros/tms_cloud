Ext.define("MDF.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.mdfpanel',
	
	initComponent: function() {
		var me = this;
		
		var perEdit = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 1,
			listeners: {
				beforeedit: function(editor, e) {
					return e.record.get('mdfe_id' > 0);
				},
				edit: function(editor, e) {
					if (!Ext.isEmpty(e.record.get('UFPer')) && e.record.get('mdfe_id') > 0) {
						Ext.Ajax.request({
							url: 'mod/conhecimentos/mdf/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_percursos'
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
		}),
		perStore = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name:"id", type:"int"},
				{name:"mdfe_id", type:"int"},
				{name:"UFPer", type:"string", defaultValue:""}
			],
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.mdfe_id > 0;
				}
			},
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/mdf/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_percursos',
					mdfe_id: 0
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
				property: 'id',
				direction: 'ASC'
			}]
		});
		
		var motStore = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name:"mdfe_id", type:"int"},
				{name:"mot_id", type:"int"},
				{name:"cte_mo_id", type:"int"},
				{name:"veic_trac_id", type:"int"},
				{name:"veiculo", type:"string"},
				{name:"motorista", type:"string"}
			],
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.mdfe_id > 0;
				}
			},
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/mdf/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_motorista',
					mdfe_id: 0
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
				property: 'mot_nome',
				direction: 'ASC'
			}]
		});
		
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				xtype: 'mdfesgrid',
				region: 'center',
			},{
				itemId: 'east-panel',
				region: 'east',
				title: 'Mais informações',
				split: true,
				collapsed: true,
				collapsible: true,
				width: window.innerWidth / 2,
				minWidth: window.innerWidth / 3,
				maxWidth: window.innerWidth - 50,
				layout: {
					type: 'accordion',
					titleCollapse: true,
					animate: true,
					activeOnTop: true
				},
				items: [{
					itemId: 'mdfe-cte-grid',
					xtype: 'grid',
					title: 'CONHECIMENTOS',
					tools: [{
						type: 'refresh',
						tooltip: 'Atualizar listagem',
						handler: function(e, toolEl, panel) {
							panel.up('grid').getStore().reload();
						}
					}],
					multiSelect: false,
					enableLocking: false,
					enableColumnHide: false,
					enableColumnMove: false,
					emptyText: 'Nenhum item encontrado',
					store: Ext.create('Ext.data.JsonStore', {
						fields: [
							{name:"cte_id", type:"int"},
							{name:"cte_serie", type:"string"},
							{name:"cte_numero", type:"string"},
							{name:"cte_minuta", type:"string"},
							{name:"cte_chave", type:"string"},
							{name:"cte_pdf", type:"string"},
							{name:"cid_destino", type:"string"}
						],
						autoLoad: false,
						autoDestroy: true,
						remoteSort: false,
						remoteGroup: false,
						remoteFilter: false,
						listeners: {
							beforeload: function() {
								return this.getProxy().extraParams.mdfe_id > 0;
							}
						},
						proxy: {
							type: 'ajax',
							url: 'mod/conhecimentos/mdf/php/response.php',
							filterParam: 'query',
							extraParams: {
								m: 'read_cte',
								mdfe_id: 0
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
							property: 'cte_id',
							direction: 'DESC'
						}]
					}),
					columns: [{
						width: 70,
						dataIndex: 'cte_id',
						tdCls: 'x-grid-cell-special',
						text: 'ID',
						align: 'right'
					},{
						flex: 1,
						dataIndex: 'cte_numero',
						text: 'Número',
						tooltip: 'Número do CT-e',
						align: 'right'
					},{
						flex: 1,
						dataIndex: 'cte_chave',
						text: 'Chave',
						tooltip: 'Número da chave do CT-e',
						align: 'right'
					},{
						flex: 2,
						dataIndex: 'cid_destino',
						text: 'Destino',
						tooltip: 'Cidade de destino'
					},{
						flex: 1,
						xtype: 'templatecolumn',
						dataIndex: 'cte_pdf',
						text: 'PDF',
						align: 'center',
						sortable: false,
						menuDisabled: true,
						tpl: '<tpl if="cte_pdf"><a href="{cte_pdf}" target="_blank">ABRIR</a></tpl>'
					}]
				},{
					itemId: 'mdfe-mot-grid',
					xtype: 'grid',
					title: 'MOTORISTAS',
					tools: [{
						type: 'refresh',
						tooltip: 'Atualizar listagem',
						handler: function(e, toolEl, panel) {
							panel.up('grid').getStore().reload();
						}
					}],
					multiSelect: false,
					enableLocking: false,
					enableColumnHide: false,
					enableColumnMove: false,
					emptyText: 'Nenhum item encontrado',
					store: motStore,
					columns: [{
						flex: 1,
						dataIndex: "veiculo",
						text: "Veículo",
						menuDisabled: true
					},{
						flex: 1,
						dataIndex: "motorista",
						text: "Motorista",
						menuDisabled: true
					}],
					dockedItems: [{
						xtype: 'toolbar',
						dock: 'top',
						items: [{
							text: 'Incluir',
							iconCls: 'icon-plus',
							tooltip: 'Incluir somente a UF de passagem, não inserir UF de origem e destino',
							handler: function() {
								var mdfe_id = motStore.getProxy().extraParams.mdfe_id;
								if (mdfe_id > 0) {
									var win = Ext.create("Ext.ux.Window", {
										title: 'Incluir Motorista',
										width: 400,
										height: 195,
										autoShow: true,
										closable: true,
										maximized: false,
										minimizable: false,
										maximizable: false,
										resizable: false,
										layout: 'fit',
										items: {
											xtype: 'form',
											bodyPadding: 5,
											layout: 'anchor',
											defaults: {
												anchor: '100%',
												labelAlign: 'top',
												selectOnFocus: true,
												allowBlank: false
											},
											items: [{
												xtype: 'veiculocombo',
												name: 'veic_id',
												fieldLabel: 'Veículo',
												listeners: {
													reset: function() {
														var form = this.up('form').getForm(),
														motField = form.findField('mot_id'),
														motStore = motField.getStore();
														motStore.getProxy().setExtraParam("veic_id", 0);
														motStore.removeAll();
														motField.reset();
														motField.clearInvalid();
														motField.setDisabled(true);
													},
													select: function(field, records) {
														var record = records[0],
														form = field.up('form').getForm(),
														motField = form.findField('mot_id'),
														motStore = motField.getStore();
														motStore.getProxy().setExtraParam("veic_id", record.get("id"));
														motField.reset();
														motField.clearInvalid();
														motField.setDisabled(true);
														motStore.load({
															callback: function() {
																motField.setDisabled(false);
															}
														});
													}
												}
											},{
												xtype: 'combo',
												name: 'mot_id',
												valueField: "id",
												displayField: "nome_cpf",
												fieldLabel: 'Motorista',
												disabled: true,
												typeAhead: true,
												forceSelection: true,
												valueNotFoundTex: 'Nenhum item encontrado...',
												store: Ext.create('Ext.data.Store', {
													fields: [
														{name:"id", type:"int"},
														{name:"nome_cpf", type:"string"}
													],
													autoLoad: false,
													remoteSort: false,
													proxy: {
														type: 'ajax',
														url: 'mod/conhecimentos/mdf/php/response.php',
														extraParams: {
															m: 'motorista_store',
															veic_id: 0,
															mdfe_id: mdfe_id
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
														property: 'nome',
														direction: 'ASC'
													}],
													listeners: {
														beforeload: function() {
															var params = this.getProxy().extraParams;
															return params.mdfe_id > 0 && params.veic_id > 0;
														}
													}
												}),
												listConfig: {
													resizable: true,
													minWidth: 200
												}
											}],
											buttons: [{
												text: 'Salvar',
												scale: 'medium',
												formBind: true,
												disabled: true,
												handler: function(btn) {
													var originalText = btn.getText();
													btn.setDisabled(true);
													btn.setText('Salvando...');
													btn.up('form').getForm().submit({
														clientValidation: true,
														url: 'mod/conhecimentos/mdf/php/response.php',
														method: 'post',
														params: {
															m: 'save_motorista',
															mdfe_id: mdfe_id
														},
														failure: Ext.Function.createSequence(App.formFailure, function(){
															btn.setDisabled(false);
															btn.setText(originalText);
														}),
														success: function(f, a) {
															win.close();
															motStore.reload();
														}
													});
												}
											}]
										}
									});
								}
							}
						},{
							text: 'Excluir',
							iconCls: 'icon-minus',
							itemId: 'delete',
							disabled: true,
							handler: function() {
								var selections = this.up('grid').getView().getSelectionModel().getSelection();
								if (!selections.length) {
									App.noRecordsSelected();
									return false;
								}
								var records = [];
								Ext.each(selections, function(record) {
									if (record.get("cte_mo_id") > 0 || (record.get("mot_id") > 0 && record.get("veic_trac_id") > 0)) {
										records.push(record.data);
									}
								});
								motStore.remove(selections);
								if (!records.length) {
									return false;
								}
								Ext.Ajax.request({
									url: 'mod/conhecimentos/mdf/php/response.php',
									method: 'post',
									params: {
										m: 'delete_motorista',
										records: Ext.encode(records)
									},
									failure: App.ajaxFailure,
									success: App.ajaxDeleteSuccess
								});
							}
						}]
					}],
					listeners: {
						selectionchange: function(selModel, selections) {
							me.down('#east-panel').down('#mdfe-mot-grid').down('#delete').setDisabled(selections.length === 0);
						}
					}
				},{
					itemId: 'mdfe-per-grid',
					xtype: 'grid',
					title: 'PERCURSOS',
					tools: [{
						type: 'refresh',
						tooltip: 'Atualizar listagem',
						handler: function(e, toolEl, panel) {
							panel.up('grid').getStore().reload();
						}
					}],
					multiSelect: false,
					enableLocking: false,
					enableColumnHide: false,
					enableColumnMove: false,
					emptyText: 'Nenhum item encontrado',
					store: perStore,
					plugins: perEdit,
					columns: [{
						width: 70,
						dataIndex: 'id',
						tdCls: 'x-grid-cell-special',
						text: 'ID',
						align: 'right',
						menuDisabled: true
					},{
						flex: 1,
						dataIndex: 'UFPer',
						text: 'UF de passagem',
						align: 'left',
						menuDisabled: true,
						editor: {
							xtype: 'localcombo',
							options: ['AC','AL','AM','AP','BA','CE','DF','ES','EX','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
						}
					}],
					dockedItems: [{
						xtype: 'toolbar',
						dock: 'top',
						items: [{
							text: 'Incluir',
							iconCls: 'icon-plus',
							tooltip: 'Incluir somente a UF de passagem, não inserir UF de origem e destino',
							handler: function() {
								var mdfe_id = perStore.getProxy().extraParams.mdfe_id;
								if (mdfe_id > 0) {
									perEdit.cancelEdit();
									perStore.insert(0, {mdfe_id: mdfe_id});
									perEdit.startEditByPosition({row: 0, column: 1});
								}
							}
						},{
							text: 'Excluir',
							iconCls: 'icon-minus',
							itemId: 'delete',
							disabled: true,
							handler: function() {
								var selections = this.up('grid').getView().getSelectionModel().getSelection();
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
								perStore.remove(selections);
								if (!id.length) {
									return false;
								}
								Ext.Ajax.request({
									url: 'mod/conhecimentos/mdf/php/response.php',
									method: 'post',
									params: {
										m: 'delete_percursos',
										id: id.join(',')
									},
									failure: App.ajaxFailure,
									success: App.ajaxDeleteSuccess
								});
							}
						}]
					}],
					listeners: {
						selectionchange: function(selModel, selections) {
							me.down('#east-panel').down('#mdfe-per-grid').down('#delete').setDisabled(selections.length === 0);
						}
					}
				},{
					itemId: 'mdfe-evento-grid',
					xtype: 'grid',
					title: 'EVENTOS',
					tools: [{
						type: 'refresh',
						tooltip: 'Atualizar listagem',
						handler: function(e, toolEl, panel) {
							panel.up('grid').getStore().reload();
						}
					}],
					multiSelect: false,
					enableLocking: false,
					enableColumnHide: false,
					enableColumnMove: false,
					store: Ext.create('Ext.data.JsonStore', {
						model: 'MDFE.Evento.data.Model',
						autoLoad: false,
						autoDestroy: true,
						remoteSort: false,
						remoteGroup: false,
						remoteFilter: false,
						proxy: {
							type: 'ajax',
							url: 'mod/conhecimentos/mdf/php/response.php',
							filterParam: 'query',
							extraParams: {
								m: 'read_eventos',
								mdfe_id: 0
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
							property: 'data_hora',
							direction: 'DESC'
						}],
						listeners: {
							beforeload: function() {
								return this.getProxy().extraParams.mdfe_id > 0;
							}
						}
					}),
					columns: [{
						xtype: 'datecolumn',
						dataIndex: 'data_hora',
						text: 'Ocorrido em',
						tooltip: 'Data e Hora do retorno da Sefaz',
						align: 'right',
						format: 'D d/m/Y H:i',
						menuDisabled: true,
						flex: 1
					},{
						dataIndex: 'detalhe',
						text: 'Evento',
						tooltip: 'Detalhes sobre o evento',
						menuDisabled: true,
						flex: 2,
						renderer: function(value, metaData, record) {
							metaData.tdAttr = 'data-qtip="' + value +'"';
							return value;
						}
					},{
						dataIndex: 'protocolo',
						text: 'Protocolo',
						tooltip: 'Número do protocolo de retorno da Sefaz',
						menuDisabled: true,
						flex: 1
					},{
						dataIndex: 'evento',
						text: 'Código',
						tooltip: 'Código do evento',
						menuDisabled: true,
						flex: 1
					}]
				}]
			}]
		});
		
		this.callParent(arguments);
	}
});