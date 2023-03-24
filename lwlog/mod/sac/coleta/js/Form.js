Ext.define('Coleta.form.Panel', {
	extend: 'Ext.form.Panel',
	alias: 'widget.coletaform',
	
	grid: null,
	setGrid: function(grid) {
		this.grid = grid;
	},
	
	initComponent: function() {
		var me = this;
		
		var NFStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Documento.data.Model',
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
					m: 'read_documentos',
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
			groupField: 'cte_id',
			sorters: [{
				property: 'cte_doc_numero',
				direction: 'ASC'
			}],
			
			listeners: {
				load: function() {
					var record = me.getRecord();
					if (record) {
						if (record.get('cte_tipo_doc_anexo') != 1) {
							this.removeAll();
						}
					}
				},
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		NFeStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Documento.data.Model',
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
					m: 'read_documentos',
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
			groupField: 'cte_id',
			sorters: [{
				property: 'cte_doc_numero',
				direction: 'ASC'
			}],
			
			listeners: {
				load: function() {
					var record = me.getRecord();
					if (record) {
						if (record.get('cte_tipo_doc_anexo') != 2) {
							this.removeAll();
						}
					}
				},
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		NFOutrosStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Documento.data.Model',
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
					m: 'read_documentos',
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
			groupField: 'cte_id',
			sorters: [{
				property: 'cte_doc_numero',
				direction: 'ASC'
			}],
			
			listeners: {
				load: function() {
					var record = me.getRecord();
					if (record) {
						if (record.get('cte_tipo_doc_anexo') != 3) {
							this.removeAll();
						}
					}
				},
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		NFEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		NFeEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		NFOutrosEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		});
		
		var CubagemStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Cubagem.data.Model',
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
					m: 'read_cubagem',
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
			groupField: 'cte_id',
			sorters: [{
				property: 'cte_dim_tipo_embalagem',
				direction: 'ASC'
			},{
				property: 'cte_dim_volumes',
				direction: 'ASC'
			},{
				property: 'cte_dim_peso_bruto',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
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
		
		
		Ext.apply(this, {
			bodyPadding: 10,
			autoScroll: true,
			layout: 'anchor',
			defaults: {
				anchor: '100%',
				collapsed: false,
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
				title: 'Remetente',
				items: [{
					items: [{
						xtype: 'clientecombo',
						fieldLabel: 'Cliente',
						name: 'clie_remetente_id',
						extraParams: {
							clie_ativo: 1,
							clie_categoria: '0,4'
						},
						listeners: {
							select: function(field, records) {
								var record = records[0], form = me.getForm();
								form.findField('clie_remetente_record_id').setValue(record.get('clie_id'));
								form.findField('cid_id_origem').setValue(record.get('cid_id'));
								form.findField('rem_end_logradouro').setValue(record.get('clie_logradouro'));
								form.findField('rem_end_numero').setValue(record.get('clie_numero'));
								form.findField('rem_end_complemento').setValue(record.get('clie_complemento'));
								form.findField('rem_end_bairro').setValue(record.get('clie_bairro'));
								form.findField('rem_end_cep').setValue(record.get('clie_cep'));
								var cidField = form.findField('rem_cid_nome_completo');
								cidField.setValue(record.get('cid_uf') + ' - ' + record.get('cid_municipio'));
								if (!Ext.isEmpty(record.get('cid_nome_aeroporto'))) {
									cidField.setValue(cidField.getValue() + ' (' + record.get('cid_nome_aeroporto') + ')');
								}
							}
						}
					},{
						xtype: 'hiddenfield',
						name: 'clie_remetente_record_id',
						flex: null,
						width: 0,
						hideLabel: true
					},{
						xtype: 'hiddenfield',
						name: 'cte_id',
						flex: null,
						width: 0,
						hideLabel: true,
						allowBlank: true
					},{
						xtype: 'hiddenfield',
						name: 'cid_id_origem',
						flex: null,
						width: 0,
						hideLabel: true,
						allowBlank: true
					},{
						fieldLabel: 'Endereço',
						name: 'rem_end_logradouro',
						readOnly: true,
						allowBlank: true
					},{
						fieldLabel: 'Número',
						name: 'rem_end_numero',
						flex: null,
						width: 90,
						readOnly: true,
						allowBlank: true
					}]
				},{
					items: [{
						fieldLabel: 'Complemento',
						name: 'rem_end_complemento',
						readOnly: true,
						allowBlank: true
					},{
						fieldLabel: 'Bairro',
						name: 'rem_end_bairro',
						readOnly: true,
						allowBlank: true
					},{
						fieldLabel: 'CEP',
						name: 'rem_end_cep',
						flex: null,
						width: 120,
						readOnly: true,
						allowBlank: true
					},{
						flex: 2,
						fieldLabel: 'UF / Cidade / Aeroporto',
						name: 'rem_cid_nome_completo',
						readOnly: true,
						allowBlank: true
					}]
				}]
			},{
				title: 'Destinatário',
				items: [{
					items: [{
						xtype: 'clientecombo',
						fieldLabel: 'Cliente',
						name: 'clie_destinatario_id',
						extraParams: {
							clie_ativo: 1,
							clie_categoria: '3,4'
						},
						listeners: {
							select: function(field, records) {
								var record = records[0], form = me.getForm();
								form.findField('clie_destinatario_record_id').setValue(record.get('clie_id'));
								form.findField('cid_id_destino').setValue(record.get('cid_id'));
								form.findField('des_end_logradouro').setValue(record.get('clie_logradouro'));
								form.findField('des_end_numero').setValue(record.get('clie_numero'));
								form.findField('des_end_complemento').setValue(record.get('clie_complemento'));
								form.findField('des_end_bairro').setValue(record.get('clie_bairro'));
								form.findField('des_end_cep').setValue(record.get('clie_cep'));
								var cidField = form.findField('des_cid_nome_completo');
								cidField.setValue(record.get('cid_uf') + ' - ' + record.get('cid_municipio'));
								if (!Ext.isEmpty(record.get('cid_nome_aeroporto'))) {
									cidField.setValue(cidField.getValue() + ' (' + record.get('cid_nome_aeroporto') + ')');
								}
							}
						}
					},{
						xtype: 'hiddenfield',
						name: 'clie_destinatario_record_id',
						flex: null,
						width: 0,
						hideLabel: true
					},{
						xtype: 'hiddenfield',
						name: 'cid_id_destino',
						flex: null,
						width: 0,
						hideLabel: true,
						allowBlank: true
					},{
						fieldLabel: 'Endereço',
						name: 'des_end_logradouro',
						readOnly: true,
						allowBlank: true
					},{
						fieldLabel: 'Número',
						name: 'des_end_numero',
						flex: null,
						width: 90,
						readOnly: true,
						allowBlank: true
					}]
				},{
					items: [{
						fieldLabel: 'Complemento',
						name: 'des_end_complemento',
						readOnly: true,
						allowBlank: true
					},{
						fieldLabel: 'Bairro',
						name: 'des_end_bairro',
						readOnly: true,
						allowBlank: true
					},{
						fieldLabel: 'CEP',
						name: 'des_end_cep',
						flex: null,
						width: 120,
						readOnly: true,
						allowBlank: true
					},{
						flex: 2,
						fieldLabel: 'UF / Cidade / Aeroporto',
						name: 'des_cid_nome_completo',
						readOnly: true,
						allowBlank: true
					}]
				}]
			},{
				title: 'Tomador',
				items: [{
					items: [{
						xtype: 'clientecombo',
						fieldLabel: 'Cliente',
						name: 'clie_tomador_id',
						extraParams: {
							clie_ativo: 1
						},
						listeners: {
							select: function(field, records) {
								var record = records[0], form = me.getForm();
								form.findField('clie_tomador_record_id').setValue(record.get('clie_id'));
								form.findField('tom_end_logradouro').setValue(record.get('clie_logradouro'));
								form.findField('tom_end_numero').setValue(record.get('clie_numero'));
								form.findField('tom_end_complemento').setValue(record.get('clie_complemento'));
								form.findField('tom_end_bairro').setValue(record.get('clie_bairro'));
								form.findField('tom_end_cep').setValue(record.get('clie_cep'));
								var cidField = form.findField('tom_cid_nome_completo');
								cidField.setValue(record.get('cid_uf') + ' - ' + record.get('cid_municipio'));
								if (!Ext.isEmpty(record.get('cid_nome_aeroporto'))) {
									cidField.setValue(cidField.getValue() + ' (' + record.get('cid_nome_aeroporto') + ')');
								}
							}
						}
					},{
						xtype: 'hiddenfield',
						name: 'clie_tomador_record_id',
						flex: null,
						width: 0,
						hideLabel: true
					},{
						fieldLabel: 'Endereço',
						name: 'tom_end_logradouro',
						readOnly: true,
						allowBlank: true
					},{
						fieldLabel: 'Número',
						name: 'tom_end_numero',
						flex: null,
						width: 90,
						readOnly: true,
						allowBlank: true
					}]
				},{
					items: [{
						fieldLabel: 'Complemento',
						name: 'tom_end_complemento',
						readOnly: true,
						allowBlank: true
					},{
						fieldLabel: 'Bairro',
						name: 'tom_end_bairro',
						readOnly: true,
						allowBlank: true
					},{
						fieldLabel: 'CEP',
						name: 'tom_end_cep',
						flex: null,
						width: 120,
						readOnly: true,
						allowBlank: true
					},{
						flex: 2,
						fieldLabel: 'UF / Cidade / Aeroporto',
						name: 'tom_cid_nome_completo',
						readOnly: true,
						allowBlank: true
					}]
				}]
			},{
				title: 'Escolha um dos tipos de documentos',
				items: [{
					items: [{
						xtype: 'radiofield',
						boxLabel: 'Notas Fiscais (eletrônica)',
						name: 'cte_tipo_doc_anexo',
						inputValue: 2,
						checked: true,
						listeners: {
							change: function(field, checked) {
								var grid = me.down('#cte-doc-nfe-grid');
								grid.setDisabled(!checked);
								if (!checked) {
									grid.getStore().removeAll();
								}
							}
						}
					},{
						xtype: 'radiofield',
						boxLabel: 'Notas Fiscais (papel)',
						name: 'cte_tipo_doc_anexo',
						inputValue: 1,
						checked: false,
						listeners: {
							change: function(field, checked) {
								var grid = me.down('#cte-doc-nf-grid');
								grid.setDisabled(!checked);
								if (!checked) {
									grid.getStore().removeAll();
								}
							}
						}
					},{
						xtype: 'radiofield',
						boxLabel: 'Outros documentos',
						name: 'cte_tipo_doc_anexo',
						inputValue: 3,
						checked: false,
						listeners: {
							change: function(field, checked) {
								var grid = me.down('#cte-doc-outros-grid');
								grid.setDisabled(!checked);
								if (!checked) {
									grid.getStore().removeAll();
								}
							}
						}
					}]
				}]
			},{
				xtype: 'grid',
				itemId: 'cte-doc-nfe-grid',
				title: 'Remetente -> NF-e',
				height: 300,
				defaults: null,
				enableColumnMove: false,
				enableColumnHide: false,
				store: NFeStore,
				plugins: NFeEditor,
				features: [{
					ftype: 'groupingsummary',
					groupHeaderTpl: 'Documentos',
					enableNoGroups: false,
					enableGroupingMenu: false
				}],
				columns: [{
					dataIndex: 'cte_doc_chave_nfe',
					text: 'Chave de Acesso',
					tooltip: 'Chave de acesso da NF-e',
					menuDisabled: true,
					flex: 2,
					editor: {
						xtype: 'textfield',
						allowBlank: false,
						selectOnFocus: true,
						maxLength: 44
					}
				},{
					dataIndex: 'cte_doc_pin',
					text: 'PIN',
					tooltip: 'PIN atribuído pela SUFRAMA para a operação',
					menuDisabled: true,
					flex: 1,
					editor: {
						xtype: 'intfield',
						minValue: 0,
						maxValue: 999999999
					}
				},{
					dataIndex: 'cte_doc_volumes',
					text: 'Volumes',
					tooltip: 'Quantidade de Volumes',
					align: 'center',
					menuDisabled: true,
					flex: 1,
					summaryType: 'sum',
					editor: {
						xtype: 'intfield',
						minValue: 0,
						maxValue: 99999999
					}
				},{
					dataIndex: 'cte_doc_descricao',
					text: 'Descrição',
					tooltip: 'Declaração/Descrição da mercadoria',
					flex: 2,
					editor: {
						xtype: 'textfield',
						allowBlank: true,
						selectOnFocus: true,
						maxLength: 60
					}
				},{
					dataIndex: 'cte_doc_peso_total',
					text: 'Peso em KG',
					tooltip: 'Peso total em Kg: Informar para efeito de totalização',
					align: 'right',
					menuDisabled: true,
					flex: 1,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brFloat,
					renderer: Ext.util.Format.brFloat,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99
					}
				},{
					dataIndex: 'cte_doc_valor_nota',
					text: 'Valor da Nota',
					tooltip: 'Valor total da Nota Fiscal',
					align: 'right',
					menuDisabled: true,
					flex: 1,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99
					}
				}],
				viewConfig: {
					listeners: {
						itemkeydown: function(view, record, item, index, e) {
							if (e.getKey() == e.INSERT) {
								NFeEditor.cancelEdit();
								NFeStore.insert(0, Ext.create('CTE.Documento.data.Model'));
								NFeEditor.startEditByPosition({row: 0, column: 0});
								e.preventDefault();
							}
						}
					}
				},
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						text: 'Incluir',
						iconCls: 'icon-plus',
						handler: function() {
							NFeEditor.cancelEdit();
							NFeStore.insert(0, Ext.create('CTE.Documento.data.Model'));
							NFeEditor.startEditByPosition({row: 0, column: 0});
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
							NFeStore.remove(selections);
						}
					},'-',{
						text: 'Importar',
						iconCls: 'icon-file-xml',
						tooltip: 'Auto preenchimento da grade através da leitura da NF-e (XML)',
						handler: function() {
							var win = Ext.create('Ext.ux.Window', {
								ui: 'black-window-active',
								title: 'Importar NF-e somente arquivos XML',
								width: 350,
								height: 130,
								autoShow: true,
								maximizable: false,
								minimizable: false,
								resizable: false,
								closable: true,
								layout: 'fit',
								items: {
									xtype: 'form',
									bodyPadding: 5,
									defaults: {
										anchor: '100%',
										labelAlign: 'top',
										allowBlank: false,
										selectOnFocus: true
									},
									defaultType: 'filefield',
									items: [{
										fieldLabel: 'Selecione o arquivo xml',
										name: 'arquivos[]',
										buttonText: 'Buscar',
										emptyText: '(somente NF-e)',
										listeners: {
											afterrender:function(cmp){
												cmp.fileInputEl.set({
													accept: 'text/xml',
													multiple: 'multiple'
												});
											}
										}
									}],
									buttons: [{
										ui: 'green-button',
										text: 'IMPORTAR',
										formBind: true,
										handler: function(btn) {
											var form = this.up('form').getForm();
											if (!form.isValid()) {
												return false;
											}
											var originalText = btn.getText();
											btn.setText('IMPORTANDO...');
											btn.setDisabled(true);
											form.submit({
												clientValidation: true,
												url: 'mod/conhecimentos/ctes/php/response.php',
												method: 'post',
												params: {
													m: 'importar_nfe'
												},
												failure: Ext.Function.createSequence(App.formFailure, function() {
													btn.setDisabled(false);
													btn.setText(originalText);
												}),
												success: function(f, a) {
													//NFeStore.removeAll();
													NFeStore.add(a.result.records);
													win.close();
												}
											});
										}
									}]
								}
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
							NFeStore.load({
								callback: function() {
									btn.setText(originalText);
								}
							});
						}
					}]
				}]
			},{
				xtype: 'grid',
				itemId: 'cte-doc-nf-grid',
				title: 'Remetente -> Nota fiscal',
				height: 300,
				disabled: true,
				defaults: null,
				enableColumnMove: false,
				enableColumnHide: false,
				store: NFStore,
				plugins: NFEditor,
				style: {
					marginTop: 20
				},
				features: [{
					ftype: 'groupingsummary',
					groupHeaderTpl: 'Documentos',
					enableNoGroups: false,
					enableGroupingMenu: false
				}],
				columns: [{
					dataIndex: 'cte_doc_serie',
					text: 'Série',
					tooltip: 'Série da Nota Fiscal (0 para série única)',
					menuDisabled: true,
					width: 70,
					editor: {
						xtype: 'intfield',
						minValue: 0,
						maxValue: 999
					}
				},{
					dataIndex: 'cte_doc_numero',
					text: 'Número',
					tooltip: 'Número da Nota Fiscal',
					menuDisabled: true,
					width: 100,
					editor: {
						xtype: 'textfield',
						allowBlank: false,
						selectOnFocus: true,
						maxLength: 20
					}
				},{
					xtype: 'datecolumn',
					dataIndex: 'cte_doc_data_emissao',
					text: 'Emitido em',
					tooltip: 'Data de emissão da Nota Fiscal',
					format: 'D d/m/Y',
					align: 'right',
					menuDisabled: true,
					width: 100,
					editor: {
						xtype: 'datefield',
						format: 'd/m/Y',
						allowBlank: false,
						selectOnFocus: true,
						maxValue: new Date()
					}
				},{
					dataIndex: 'cte_doc_volumes',
					text: 'Volumes',
					tooltip: 'Quantidade de Volumes',
					align: 'center',
					menuDisabled: true,
					width: 80,
					summaryType: 'sum',
					editor: {
						xtype: 'intfield',
						minValue: 0,
						maxValue: 99999999
					}
				},{
					dataIndex: 'cte_doc_peso_total',
					text: 'Peso em KG',
					tooltip: 'Peso total em Kg: Informar para efeito de totalização',
					align: 'right',
					menuDisabled: true,
					width: 100,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brFloat,
					renderer: Ext.util.Format.brFloat,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99
					}
				},{
					dataIndex: 'cte_doc_descricao',
					text: 'Descrição',
					tooltip: 'Declaração/Descrição da mercadoria',
					width: 250,
					editor: {
						xtype: 'textfield',
						allowBlank: true,
						selectOnFocus: true,
						maxLength: 60
					}
				},{
					dataIndex: 'cte_doc_valor_produtos',
					text: 'Valor dos Produtos',
					tooltip: 'Valor total dos Produtos',
					align: 'right',
					menuDisabled: true,
					width: 120,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99 
					}
				},{
					dataIndex: 'cte_doc_valor_nota',
					text: 'Valor da Nota',
					tooltip: 'Valor total da Nota Fiscal',
					align: 'right',
					menuDisabled: true,
					width: 120,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99
					}
				},{
					dataIndex: 'cte_doc_cfop',
					text: 'CFOP',
					tooltip: 'CFOP Predominante',
					align: 'center',
					menuDisabled: true,
					width: 70,
					editor: {
						xtype: 'intfield',
						minValue: 0,
						maxValue: 9999
					}
				},{
					dataIndex: 'cte_doc_modelo',
					text: 'Modelo',
					tooltip: 'Modelo da Nota Fiscal',
					menuDisabled: true,
					width: 200,
					renderer: function(value, metaData, record) {
						if (value == 1) {
							return '01 - NF Modelo 01/1A e Avulsa';
						} else if (value == 4) {
							return '04 - NF de Produtor';
						}
					},
					editor: {
						xtype: 'localcombo',
						editable: false,
						allowBlank: false,
						options: [{
							id: 1,
							field: '01 - NF Modelo 01/1A e Avulsa'
						},{
							id: 4,
							field: '04 - NF de Produtor'
						}],
						listConfig: {
							resizable: true,
							minWidth: 300
						}
					}
				},{
					dataIndex: 'cte_doc_bc_icms',
					text: 'BC ICMS',
					tooltip: 'Base de Cálculo do ICMS',
					align: 'right',
					menuDisabled: true,
					width: 100,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99
					}
				},{
					dataIndex: 'cte_doc_valor_icms',
					text: 'Valor do ICMS',
					tooltip: 'Valor total do ICMS',
					align: 'right',
					menuDisabled: true,
					width: 120,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99
					}
				},{
					dataIndex: 'cte_doc_bc_icms_st',
					text: 'BASE ICMS ST',
					tooltip: 'Valor da Base de Cálculo do ICMS ST',
					align: 'right',
					menuDisabled: true,
					width: 100,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99
					}
				},{
					dataIndex: 'cte_doc_valor_icms_st',
					text: 'Valor ICMS ST',
					tooltip: 'Valor Total do ICMS ST',
					align: 'right',
					menuDisabled: true,
					width: 120,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99
					}
				}],
				viewConfig: {
					listeners: {
						itemkeydown: function(view, record, item, index, e) {
							if (e.getKey() == e.INSERT) {
								NFEditor.cancelEdit();
								NFStore.insert(0, Ext.create('CTE.Documento.data.Model'));
								NFEditor.startEditByPosition({row: 0, column: 0});
								e.preventDefault();
							}
						}
					}
				},
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						text: 'Incluir',
						iconCls: 'icon-plus',
						handler: function() {
							NFEditor.cancelEdit();
							NFStore.insert(0, Ext.create('CTE.Documento.data.Model'));
							NFEditor.startEditByPosition({row: 0, column: 0});
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
							NFStore.remove(selections);
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
							NFStore.load({
								callback: function() {
									btn.setText(originalText);
								}
							});
						}
					}]
				}]
			},{
				xtype: 'grid',
				itemId: 'cte-doc-outros-grid',
				title: 'Remetente -> Outros Documentos',
				height: 300,
				disabled: true,
				defaults: null,
				enableColumnMove: false,
				enableColumnHide: false,
				store: NFOutrosStore,
				plugins: NFOutrosEditor,
				features: [{
					ftype: 'groupingsummary',
					groupHeaderTpl: 'Documentos',
					enableNoGroups: false,
					enableGroupingMenu: false
				}],
				style: {
					marginTop: 20
				},
				columns: [{
					dataIndex: 'cte_doc_tipo_doc',
					text: 'Tipo Documento',
					tooltip: 'Tipo de documento originário',
					menuDisabled: true,
					flex: 1,
					renderer: function(value, metaData, record) {
						if (value == 0) {
							return '00 - Declaração';
						} else if (value == 99) {
							return '99 - Outros';
						}
					},
					editor: {
						xtype: 'localcombo',
						options: [{
							id: 0,
							field: '00 - Declaração'
						},{
							id: 99,
							field: '99 - Outros'
						}],
						listConfig: {
							resizable: true,
							minWidth: 300
						}
					}
				},{
					dataIndex: 'cte_doc_numero',
					text: 'Número do Documento',
					tooltip: 'Número do Documento (Declaração/Outros)',
					menuDisabled: true,
					flex: 1,
					editor: {
						xtype: 'textfield',
						allowBlank: false,
						selectOnFocus: true,
						maxLength: 20
					}
				},{
					xtype: 'datecolumn',
					dataIndex: 'cte_doc_data_emissao',
					text: 'Emitido em',
					tooltip: 'Data de emissão da Nota Fiscal',
					format: 'D d/m/Y',
					align: 'right',
					menuDisabled: true,
					flex: 1,
					editor: {
						xtype: 'datefield',
						format: 'd/m/Y',
						allowBlank: false,
						selectOnFocus: true,
						maxValue: new Date()
					}
				},{
					dataIndex: 'cte_doc_descricao',
					text: 'Descrição',
					tooltip: 'Declaração/Descrição da mercadoria',
					flex: 2,
					editor: {
						xtype: 'textfield',
						allowBlank: true,
						selectOnFocus: true,
						maxLength: 60
					}
				},{
					dataIndex: 'cte_doc_volumes',
					text: 'Volumes',
					tooltip: 'Quantidade de Volumes',
					align: 'center',
					menuDisabled: true,
					flex: 1,
					summaryType: 'sum',
					editor: {
						xtype: 'intfield',
						minValue: 0,
						maxValue: 99999999
					}
				},{
					dataIndex: 'cte_doc_valor_nota',
					text: 'Valor do Documento',
					tooltip: 'Valor total do Documento',
					align: 'right',
					menuDisabled: true,
					flex: 1,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 9999999999999.99
					}
				}],
				viewConfig: {
					listeners: {
						itemkeydown: function(view, record, item, index, e) {
							if (e.getKey() == e.INSERT) {
								NFOutrosEditor.cancelEdit();
								NFOutrosStore.insert(0, Ext.create('CTE.Documento.data.Model'));
								NFOutrosEditor.startEditByPosition({row: 0, column: 0});
								e.preventDefault();
							}
						}
					}
				},
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						text: 'Incluir',
						iconCls: 'icon-plus',
						handler: function() {
							NFOutrosEditor.cancelEdit();
							NFOutrosStore.insert(0, Ext.create('CTE.Documento.data.Model'));
							NFOutrosEditor.startEditByPosition({row: 0, column: 0});
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
							NFOutrosStore.remove(selections);
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
							NFOutrosStore.load({
								callback: function() {
									btn.setText(originalText);
								}
							});
						}
					}]
				}]
			},{
				title: 'Informação da Carga',
				items: [{
					items: [{
						xtype: 'decimalfield',
						fieldLabel: 'Valor da Carga',
						name: 'cte_valor_carga',
						value: 0
					},{
						xtype: 'produtocombo',
						fieldLabel: 'Produto Predominante',
						name: 'prod_id',
						allowBlank: true,
						hideTrigger: false
					},{
						fieldLabel: 'Outras Características do Produto',
						name: 'cte_outras_carac_carga',
						allowBlank: true,
						maxLength: 30
					}]
				}]
			},{
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
				viewConfig: {
					listeners: {
						itemkeydown: function(view, record, item, index, e) {
							if (e.getKey() == e.INSERT) {
								CubagemEditor.cancelEdit();
								CubagemStore.insert(0, Ext.create('CTE.Cubagem.data.Model'));
								CubagemEditor.startEditByPosition({row: 0, column: 1});
								view.refresh();
								e.preventDefault();
							}
						}
					}
				},
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
							CubagemStore.load({
								callback: function() {
									btn.setText(originalText);
								}
							});
						}
					}]
				}]
			}],
			buttons: [{
				ui: 'blue-button',
				text: 'SALVAR',
				scale: 'medium',
				formBind: true,
				handler: function(btn) {
					var form = me.getForm();
					if (!form.isValid()) {
						return false;
					}
					
					var grid1 = me.down('#cte-doc-nf-grid'),
					grid2 = me.down('#cte-doc-nfe-grid'),
					grid3 = me.down('#cte-doc-outros-grid'),
					grid4 = me.down('#cte-cubagem-grid'),
					store1 = grid1.getStore(),
					store2 = grid2.getStore(),
					store3 = grid3.getStore(),
					store4 = grid4.getStore(),
					record1 = [], record2 = [], record3 = [], record4 = [];
					
					store1.each(function(record){
						if (record.get('cte_doc_serie') > 0 && !Ext.isEmpty(record.get('cte_doc_numero')) && record.get('cte_doc_volumes') > 0) {
							record1.push(record.data);
						}
					});
					store2.each(function(record){
						if (!Ext.isEmpty(record.get('cte_doc_chave_nfe')) && record.get('cte_doc_volumes') > 0) {
							record2.push(record.data);
						}
					});
					store3.each(function(record){
						if (!Ext.isEmpty(record.get('cte_doc_numero')) && record.get('cte_doc_volumes') > 0) {
							record3.push(record.data);
						}
					});
					store4.each(function(record){
						if (!Ext.isEmpty(record.get('cte_dim_tipo_embalagem')) && record.get('cte_dim_volumes') > 0 && record.get('cte_dim_peso_bruto') > 0) {
							record4.push(record.data);
						}
					});
					
					Ext.Msg.prompt('Minuta', 'Informe o número da minuta ou em branco para preenchimento automático', function(buttonId, text) {
						if (buttonId == 'ok') {
							var originalText = btn.getText();
							btn.setText('SALVANDO...');
							btn.setDisabled(true);
							
							form.submit({
								clientValidation: true,
								url: 'mod/sac/coleta/php/response.php',
								method: 'post',
								params: {
									m: 'save_coleta',
									cte_minuta: parseInt(text),
									ctes_dimensoes: Ext.encode(record4),
									ctes_documentos: record1.length > 0 ? Ext.encode(record1) : record2.length > 0 ? Ext.encode(record2) : record3.length > 0 ? Ext.encode(record3) : Ext.encode(new Array())
								},
								failure: Ext.Function.createSequence(App.formFailure, function(){
									btn.setDisabled(false);
									btn.setText(originalText);
								}),
								success: function(f, a) {
									btn.setDisabled(false);
									btn.setText(originalText);
									var CTEStore = me.grid.getStore(),
									CTESM = me.grid.getSelectionModel();
									CTEStore.load({
										params: {
											cte_id: a.result.cte_id
										},
										callback: function(records) {
											CTESM.select(records);
										}
									});
									me.newRecord();
									var popup = window.open(a.result.pdf);
									if (!popup) {
										Ext.create('Ext.ux.Alert', {
											ui: 'black-alert',
											msg: 'Sua minuta foi gerada com sucesso no formato PDF. Porém o sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para evitar futuras mensagens, por gentileza adicione esse site na lista de excessões de seu navegador.',
											buttons: [{
												ui: 'red-button',
												text: 'ABRIR PDF',
												href: a.result.pdf
											}]
										});
									}
								}
							});
						}
					});
				}
			}]
		});
		me.callParent(arguments);
	},
	
	newRecord: function() {
		var me = this, form = me.getForm();
		form.reset();
		
		var grid1 = me.down('#cte-doc-nf-grid'),
		grid2 = me.down('#cte-doc-nfe-grid'),
		grid3 = me.down('#cte-doc-outros-grid'),
		grid4 = me.down('#cte-cubagem-grid'),
		
		store1 = grid1.getStore(),
		store2 = grid2.getStore(),
		store3 = grid3.getStore(),
		store4 = grid4.getStore();
		
		store1.getProxy().setExtraParam('cte_id', 0);
		store1.removeAll();
		
		store2.getProxy().setExtraParam('cte_id', 0);
		store2.removeAll();
		
		store3.getProxy().setExtraParam('cte_id', 0);
		store3.removeAll();
		
		store4.getProxy().setExtraParam('cte_id', 0);
		store4.removeAll();
		
		form.isValid();
		setTimeout(function(){
			form.findField('clie_remetente_id').focus();
		}, 600);
	},
	
	loadRecord: function(record) {
		if (!record) {
			return false;
		}
		
		var me = this, form = me.getForm();
		form.reset();
		form.loadRecord(record);
		
		var grid1 = me.down('#cte-doc-nfe-grid'),
		grid2 = me.down('#cte-doc-nf-grid'),
		grid3 = me.down('#cte-doc-outros-grid'),
		grid4 = me.down('#cte-cubagem-grid'),
		
		store1 = grid1.getStore(),
		store2 = grid2.getStore(),
		store3 = grid3.getStore(),
		store4 = grid4.getStore();
		
		store1.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store1.load();
		
		store2.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store2.load();
		
		store3.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store3.load();
		
		store4.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store4.load();
		
		form.isValid();
		setTimeout(function(){
			form.findField('clie_remetente_id').focus();
			form.findField('clie_tomador_record_id').setValue(record.get('clie_tomador_id'));
			form.findField('clie_remetente_record_id').setValue(record.get('clie_remetente_id'));
			form.findField('clie_destinatario_record_id').setValue(record.get('clie_destinatario_id'));
		}, 600);
		
		setTimeout(function(){
			if (record.get('prod_id') > 0) {
				form.findField('prod_id').setValue(record.get('prod_id'));
			}
		}, 3000);
	}
});