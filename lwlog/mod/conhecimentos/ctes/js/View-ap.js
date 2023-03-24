Ext.define("CTE.tab.Panel", {
	extend: 'Ext.tab.Panel',
	alias: 'widget.ctesview',
	
	initComponent: function() {
		var MOStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Motorista.data.Model',
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
					m: 'read_motorista',
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
				property: 'cte_mo_motorista',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		ocorStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Ocorrencia.data.Model',
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
					m: 'read_ocorrencias',
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
				property: 'cte_ocor_quando',
				direction: 'DESC'
			}],
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}), ocorRecord, ocorEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2,
			listeners: {
				edit: function(editor, e) {
					if (e.record.get("ocor_id") == 1 && Ext.isEmpty(e.record.get("cte_ocor_recebedor_nome"))) {
						return true;
					}
					Ext.Ajax.request({
						url: 'mod/conhecimentos/ctes/php/response.php',
						method: 'post',
						params: Ext.apply({
							m: 'save_ocorrencias'
						}, e.record.data),
						failure: App.ajaxFailure,
						success: function(response) {
							var o = Ext.decode(response.responseText);
							if (o.success) {
								e.record.set('cte_ocor_id', o.cte_ocor_id);
								e.record.commit();
							} else {
								App.warning(o);
							}
						}
					});
				},
				beforeedit: function(editor, e) {
					ocorRecord = e.record;
					return ocorStore.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		MOEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2,
			listeners: {
				edit: function(editor, e) {
					if (e.record.get("cte_id") > 0 && !Ext.isEmpty(e.record.get("cte_mo_cpf")) == 1 && !Ext.isEmpty(e.record.get("cte_mo_motorista"))) {
						Ext.Ajax.request({
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: Ext.apply({
								m: 'save_motorista'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('cte_mo_id', o.cte_mo_id);
									e.record.commit();
								} else {
									App.warning(o);
								}
							}
						});
					}
				}
			}
		});
		this.documentoCombo = Ext.create('Documento.form.Select', {
			listeners: {
				select: function(field, records) {
					var record = records[0];
					ocorRecord.set('cte_doc_numero', record.get('cte_doc_numero'));
				}
			}
		});
		Ext.apply(this, {
			activeTab: 0,
			items: [{
				itemId: 'tab-0',
				title: 'Consulta',
				iconCls: 'icon-search',
				layout: 'border',
				border: false,
				bodyBorder: false,
				items: [{
					region: 'center',
					xtype: 'ctesgrid'
				},{
					itemId: 'east-panel',
					region: 'east',
					title: 'Mais informações',
					split: true,
					collapsed: true,
					collapsible: true,
					width: window.innerWidth / 2,
					minWidth: window.innerWidth / 2,
					maxWidth: window.innerWidth - 50,
					layout: {
						type: 'accordion',
						titleCollapse: true,
						animate: true,
						activeOnTop: true
					},
					items: [{
						itemId: 'cte-documento-grid',
						xtype: 'grid',
						title: 'NOTAS FISCAIS E DOCUMENTOS',
						tools: [{
							type: 'refresh',
							tooltip: 'Atualizar listagem',
							handler: function(e, toolEl, panel) {
								panel.up('grid').getStore().reload();
							}
						}],
						multiSelect: false,
						enableColumnMove: false,
						enableColumnHide: false,
						features: [{
							ftype: 'groupingsummary',
							groupHeaderTpl: 'Documentos',
							enableNoGroups: false,
							enableGroupingMenu: false
						}],
						store: Ext.create('Ext.data.JsonStore', {
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
								property: 'cte_doc_serie',
								direction: 'ASC'
							},{
								property: 'cte_doc_numero',
								direction: 'ASC'
							},{
								property: 'cte_doc_chave_nfe',
								direction: 'ASC'
							}],
							listeners: {
								beforeload: function() {
									return this.getProxy().extraParams.cte_id > 0;
								}
							}
						}),
						columns: [{
							dataIndex: 'cte_doc_tipo_doc_rotulo',
							text: 'Tipo Documento',
							tooltip: 'Tipo de documento originário',
							menuDisabled: true
						},{
							dataIndex: 'cte_doc_serie',
							text: 'Série',
							tooltip: 'Série da Nota Fiscal (0 para série única)',
							menuDisabled: true,
							width: 70
						},{
							dataIndex: 'cte_doc_numero',
							text: 'Número',
							tooltip: 'Número da Nota Fiscal',
							menuDisabled: true,
							width: 100
						},{
							dataIndex: 'cte_doc_chave_nfe',
							text: 'Chave de Acesso',
							tooltip: 'Chave de acesso da NF-e',
							menuDisabled: true,
							width: 150
						},{
							xtype: 'datecolumn',
							dataIndex: 'cte_doc_data_emissao',
							text: 'Emitido em',
							tooltip: 'Data de emissão da Nota Fiscal',
							format: 'D d/m/Y',
							align: 'right',
							menuDisabled: true,
							width: 100
						},{
							dataIndex: 'cte_doc_pin',
							text: 'PIN',
							tooltip: 'PIN atribuído pela SUFRAMA para a operação',
							menuDisabled: true,
							width: 70
						},{
							dataIndex: 'cte_doc_volumes',
							text: 'Volumes',
							tooltip: 'Quantidade de Volumes',
							align: 'center',
							menuDisabled: true,
							width: 80,
							summaryType: 'sum'
						},{
							dataIndex: 'cte_doc_peso_total',
							text: 'Peso em KG',
							tooltip: 'Peso total em Kg: Informar para efeito de totalização',
							align: 'right',
							menuDisabled: true,
							width: 100,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brFloat,
							renderer: Ext.util.Format.brFloat
						},{
							dataIndex: 'cte_doc_valor_produtos',
							text: 'Valor dos Produtos',
							tooltip: 'Valor total dos Produtos',
							align: 'right',
							menuDisabled: true,
							width: 120,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brMoney,
							renderer: Ext.util.Format.brMoney
						},{
							dataIndex: 'cte_doc_valor_nota',
							text: 'Valor da Nota',
							tooltip: 'Valor total da Nota Fiscal',
							align: 'right',
							menuDisabled: true,
							width: 120,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brMoney,
							renderer: Ext.util.Format.brMoney
						},{
							dataIndex: 'cte_doc_cfop',
							text: 'CFOP',
							tooltip: 'CFOP Predominante',
							align: 'center',
							menuDisabled: true,
							width: 70
						},{
							dataIndex: 'cte_doc_modelo_rotulo',
							text: 'Modelo',
							tooltip: 'Modelo da Nota Fiscal',
							menuDisabled: true,
							width: 200
						},{
							dataIndex: 'cte_doc_bc_icms',
							text: 'BC ICMS',
							tooltip: 'Base de Cálculo do ICMS',
							align: 'right',
							menuDisabled: true,
							width: 100,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brMoney,
							renderer: Ext.util.Format.brMoney
						},{
							dataIndex: 'cte_doc_valor_icms',
							text: 'Valor do ICMS',
							tooltip: 'Valor total do ICMS',
							align: 'right',
							menuDisabled: true,
							width: 120,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brMoney,
							renderer: Ext.util.Format.brMoney
						},{
							dataIndex: 'cte_doc_bc_icms_st',
							text: 'BASE ICMS ST',
							tooltip: 'Valor da Base de Cálculo do ICMS ST',
							align: 'right',
							menuDisabled: true,
							width: 100,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brMoney,
							renderer: Ext.util.Format.brMoney
						},{
							dataIndex: 'cte_doc_valor_icms_st',
							text: 'Valor ICMS ST',
							tooltip: 'Valor Total do ICMS ST',
							align: 'right',
							menuDisabled: true,
							width: 120,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brMoney,
							renderer: Ext.util.Format.brMoney
						}]
					},{
						itemId: 'cte-ocorrencia-grid',
						xtype: 'grid',
						title: 'ENTREGAS E OCORRÊNCIAS',
						tools: [{
							type: 'refresh',
							tooltip: 'Atualizar listagem',
							handler: function(e, toolEl, panel) {
								panel.up('grid').getStore().reload();
							}
						}],
						multiSelect: false,
						enableColumnMove: false,
						enableColumnHide: false,
						store: ocorStore,
						plugins: ocorEditor,
						columns: [{
							dataIndex: 'cte_ocor_id',
							tdCls: 'x-grid-cell-special',
							text: 'ID',
							align: 'right',
							width: 70,
							sortable: true,
							groupable: false
						},{
							dataIndex: 'ocor_nome',
							text: 'Ocorrência',
							tooltip: 'Código e Descrição da ocorrência',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 450,
							editor: {
								xtype: 'ocorrenciacombo',
								valueField: 'ocor_nome',
								displayField: 'ocor_nome',
								allowBlank: false,
								selectOnFocus: true,
								listeners: {
									select: function(field, records) {
										var record = records[0];
										ocorRecord.set({
											ocor_id: record.get('ocor_id'),
											ocor_codigo: record.get('ocor_codigo'),
											ocor_descricao: record.get('ocor_descricao'),
											ocor_modal: record.get('ocor_modal'),
											ocor_caracteristica: record.get('ocor_caracteristica'),
											ocor_modal_caracteristica: record.get('ocor_modal') + ' - ' + record.get('ocor_caracteristica')
										});
									}
								}
							}
						},{
							dataIndex: 'ocor_modal_caracteristica',
							text: 'Característica',
							tooltip: 'Característa da ocorrência',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 150
						},{
							dataIndex: 'cte_doc_id',
							text: 'Documento',
							tooltip: 'Nota Fiscal ou Documento referente a ocorrência',
							width: 100,
							editor: this.documentoCombo,
							renderer: function(value, metaData, record) {
								return record.get('cte_doc_numero');
							}
						},{
							xtype: 'datecolumn',
							dataIndex: 'cte_ocor_quando_data',
							text: 'Ocorreu em',
							format: 'D d/m/Y',
							align: 'right',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 120,
							editor: {
								xtype: 'datefield',
								format: 'd/m/Y',
								allowBlank: false,
								selectOnFocus: true,
								maxValue: new Date()
							}
						},{
							dataIndex: 'cte_ocor_quando_hora',
							text: 'Ocorreu às',
							align: 'right',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 120,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true
							}
						},{
							dataIndex: 'cte_ocor_volumes',
							text: 'Volumes',
							align: 'center',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'intfield',
								allowBlank: false,
								minValue: 1,
								maxValue: 99999
							}
						},{
							dataIndex: 'cte_ocor_peso_bruto',
							text: 'Peso Bruto (kg)',
							align: 'right',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 100,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								allowBlank: false,
								minValue: 0,
								maxValue: 999999999.9
							}
						},{
							dataIndex: 'cte_ocor_entregador_nome',
							text: 'Entregador',
							tooltip: 'Nome do entregador',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 200,
							editor: {
								xtype: 'textfield',
								selectOnFocus: true,
								maxLength: 60
							}
						},{
							dataIndex: 'cte_ocor_entregador_doc',
							text: 'Entregador (doc)',
							tooltip: 'Documento do entregador',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'textfield',
								selectOnFocus: true,
								maxLength: 20
							}
						},{
							dataIndex: 'cte_ocor_recebedor_nome',
							text: 'Recebedor',
							tooltip: 'Nome do recebedor',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 200,
							editor: {
								xtype: 'textfield',
								selectOnFocus: true,
								maxLength: 60
							}
						},{
							dataIndex: 'cte_ocor_recebedor_doc',
							text: 'Recebedor (doc)',
							tooltip: 'Documento do recebedor',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'textfield',
								selectOnFocus: true,
								maxLength: 20
							}
						},{
							dataIndex: 'cte_ocor_nota',
							text: 'Relato sobre a ocorrência',
							sortable: false,
							groupable: false,
							menuDisabled: true,
							width: 500,
							editor: {
								xtype: 'textfield',
								selectOnFocus: true,
								maxLength: 2000
							}
						},{
							xtype: 'templatecolumn',
							dataIndex: 'cte_ocor_comprovante',
							text: 'Comprovante',
							tooltip: 'Link de acesso ao comprovante de entrega digitalizado',
							align: 'center',
							sortable: false,
							groupable: false,
							menuDisabled: true,
							width: 90,
							tpl: '<tpl if="cte_ocor_comprovante"><a href="{cte_ocor_comprovante}" target="_blank">ABRIR</a><tpl else>N/D</tpl>'
						},{
							dataIndex: 'cte_ocor_cia_aerea',
							text: 'Cia Aérea',
							tooltip: 'Sigla da companhia aérea',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 70,
							editor: {
								xtype: 'textfield',
								selectOnFocus: true,
								minLength: 2,
								maxLength: 2
							}
						},{
							dataIndex: 'cte_ocor_voo',
							text: 'Vôo',
							tooltip: 'Número do vôo',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 70,
							editor: {
								xtype: 'intfield',
								selectOnFocus: true,
								minValue: 0,
								maxValue: 99999
							}
						},{
							dataIndex: 'cte_ocor_base',
							text: 'Base',
							tooltip: 'Sigla da localidade',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 70,
							editor: {
								xtype: 'textfield',
								selectOnFocus: true,
								minLength: 3,
								maxLength: 3
							}
						},{
							dataIndex: 'cte_ocor_serie_master',
							text: 'Série Master',
							tooltip: 'Número da série do conhecimento master',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 70,
							editor: {
								xtype: 'intfield',
								selectOnFocus: true,
								minValue: 0,
								maxValue: 999
							}
						},{
							dataIndex: 'cte_ocor_numero_master',
							text: 'Número Master',
							tooltip: 'Número do conhecimento master',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 90,
							editor: {
								xtype: 'intfield',
								selectOnFocus: true,
								minValue: 0,
								maxValue: 999999999
							}
						},{
							dataIndex: 'cte_ocor_operacional_master',
							text: 'Nº Operacional Master',
							tooltip: 'Número operacional do conheciento master',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 90,
							editor: {
								xtype: 'textfield',
								selectOnFocus: true,
								maxLength: 14
							}
						},{
							dataIndex: 'cte_ocor_chave_master',
							text: 'Chave Master',
							tooltip: 'Chave eletrônica do conhecimento master',
							sortable: true,
							groupable: false,
							menuDisabled: true,
							width: 90,
							editor: {
								xtype: 'textfield',
								selectOnFocus: true,
								maxLength: 44
							}
						},{
							text: 'Última modificações',
							columns: [{
								dataIndex: 'cte_ocor_cadastrado_por_nome',
								text: 'Cadastrado por',
								width: 200,
								filterable: true
							},{
								xtype: 'datecolumn',
								dataIndex: 'cte_ocor_cadastrado_em',
								text: 'Cadastrado em',
								format: 'D d/m/Y H:i',
								align: 'right',
								width: 140,
								filterable: true
							},{
								dataIndex: 'cte_ocor_alterado_por_nome',
								text: 'Alterado por',
								width: 200,
								filterable: true
							},{
								xtype: 'datecolumn',
								dataIndex: 'cte_ocor_alterado_em',
								text: 'Alterado em',
								format: 'D d/m/Y H:i',
								align: 'right',
								width: 140,
								filterable: true
							},{
								dataIndex: 'cte_ocor_versao',
								text: 'Alterações',
								tooltip: 'Quantidade de alterações afetadas no registro',
								align: 'right',
								width: 100
							}]
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										var cte_id = ocorStore.getProxy().extraParams.cte_id;
										if (cte_id > 0) {
											ocorEditor.cancelEdit();
											ocorStore.insert(0, Ext.create('CTE.Ocorrencia.data.Model', {
												cte_id: cte_id,
												cte_ocor_cadastrado_por: App.usuario.user_id,
												cte_ocor_cadastrado_por_nome: App.usuario.user_nome,
												cte_ocor_cadastrado_em: new Date()
											}));
											ocorEditor.startEditByPosition({row: 0, column: 1});
										}
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
									var cte_id = ocorStore.getProxy().extraParams.cte_id;
									if (cte_id > 0) {
										ocorEditor.cancelEdit();
										ocorStore.insert(0, Ext.create('CTE.Ocorrencia.data.Model', {
											cte_id: cte_id,
											cte_ocor_cadastrado_por: App.usuario.user_id,
											cte_ocor_cadastrado_por_nome: App.usuario.user_nome,
											cte_ocor_cadastrado_em: new Date()
										}));
										ocorEditor.startEditByPosition({row: 0, column: 1});
									}
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									if (!ocorStore.getProxy().extraParams.cte_id) {
										return false;
									}
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									var id = [];
									Ext.each(selections, function(record) {
										if (record.get('cte_ocor_id')) {
											id.push(record.get('cte_ocor_id'));
										}
									});
									ocorStore.remove(selections);
									if (!id.length) {
										return true;
									}
									Ext.Ajax.request({
										url: 'mod/conhecimentos/ctes/php/response.php',
										method: 'post',
										params: {
											m: 'delete_ocorrencias',
											cte_ocor_id: id.join(',')
										},
										failure: App.ajaxFailure,
										success: App.ajaxSuccess
									});
								}
							},'-',{
								text: 'Enviar comprovante',
								iconCls: 'icon-upload-3',
								tooltip: 'Faz upload do comprovante de entrega digitalizado',
								handler: function() {
									if (!ocorStore.getProxy().extraParams.cte_id) {
										return false;
									}
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (selections.length !== 1) {
										return false;
									}
									var record = selections[0];
									if (!record.get('cte_ocor_id')/* || record.get('ocor_caracteristica') != 'ENTREGA'*/) {
										return false;
									}
									var win = Ext.create('Ext.ux.Window', {
										ui: 'blue-window-active',
										title: '#' + record.get('cte_ocor_id') + ' - Enviar comprovante de entrega',
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
												fieldLabel: 'Selecione o arquivo digitalizado',
												name: 'cte_ocor_comprovante',
												buttonText: 'Buscar',
												emptyText: '(somente imagem)',
												listeners: {
													afterrender:function(cmp){
														cmp.fileInputEl.set({
															accept:'image/*'
														});
													}
												}
											}],
											buttons: [{
												text: 'ENVIAR',
												formBind: true,
												handler: function(btn) {
													var form = this.up('form').getForm();
													if (!form.isValid()) {
														return false;
													}
													var originalTex = btn.getText();
													btn.setText('ENVIANDO...');
													btn.setDisabled(true);
													form.submit({
														clientValidation: true,
														url: 'mod/conhecimentos/ctes/php/response.php',
														method: 'post',
														params: {
															m: 'upload_comprovante_entrega',
															cte_ocor_id: record.get('cte_ocor_id')
														},
														failure: Ext.Function.createSequence(App.formFailure, function() {
															btn.setDisabled(false);
															btn.setText(originalTex);
														}),
														success: function(f, a) {
															record.set('cte_ocor_comprovante', a.result.cte_ocor_comprovante);
															record.commit();
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
									ocorStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					},{
						xtype: 'grid',
						title: 'MOTORISTAS',
						itemId: 'cte-motorista-grid',
						enableColumnMove: false,
						enableColumnHide: false,
						store: MOStore,
						plugins: MOEditor,
						columns: [{
							dataIndex: 'cte_mo_cpf',
							text: 'CPF',
							tooltip: 'CPF do motorista',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								vtype: 'cpf',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 11
							}
						},{
							dataIndex: 'cte_mo_motorista',
							text: 'Nome',
							tooltip: 'Nome do motorista',
							menuDisabled: true,
							flex: 2,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 60
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									var cte_id = MOStore.getProxy().extraParams.cte_id;
									if (e.getKey() == e.INSERT && cte_id > 0) {
										MOEditor.cancelEdit();
										MOStore.insert(0, Ext.create('CTE.Motorista.data.Model', {
											cte_id: cte_id
										}));
										MOEditor.startEditByPosition({row: 0, column: 0});
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
									var cte_id = MOStore.getProxy().extraParams.cte_id;
									if (cte_id > 0) {
										MOEditor.cancelEdit();
										MOStore.insert(0, Ext.create('CTE.Motorista.data.Model', {
											cte_id: cte_id
										}));
										MOEditor.startEditByPosition({row: 0, column: 0});
									}
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									if (!MOStore.getProxy().extraParams.cte_id) {
										return false;
									}
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									var id = [];
									Ext.each(selections, function(record) {
										if (record.get('cte_mo_id')) {
											id.push(record.get('cte_mo_id'));
										}
									});
									MOStore.remove(selections);
									if (!id.length) {
										return true;
									}
									Ext.Ajax.request({
										url: 'mod/conhecimentos/ctes/php/response.php',
										method: 'post',
										params: {
											m: 'delete_motorista',
											cte_mo_id: id.join(',')
										},
										failure: App.ajaxFailure,
										success: App.ajaxSuccess
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
									MOStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					},{
						itemId: 'cte-evento-grid',
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
						enableColumnMove: false,
						enableColumnHide: false,
						store: Ext.create('Ext.data.JsonStore', {
							model: 'CTE.Evento.data.Model',
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
									m: 'read_eventos',
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
								property: 'cte_ev_data_hora',
								direction: 'DESC'
							}],
							listeners: {
								beforeload: function() {
									return this.getProxy().extraParams.cte_id > 0;
								}
							}
						}),
						columns: [{
							xtype: 'datecolumn',
							dataIndex: 'cte_ev_data_hora',
							text: 'Ocorrido em',
							tooltip: 'Data e Hora do retorno da Sefaz',
							align: 'right',
							format: 'D d/m/Y H:i',
							menuDisabled: true,
							flex: 1
						},{
							dataIndex: 'cte_ev_detalhe',
							text: 'Evento',
							tooltip: 'Detalhes sobre o evento',
							menuDisabled: true,
							flex: 2,
							renderer: function(value, metaData, record) {
								metaData.tdAttr = 'data-qtip="' + value +'"';
								return value;
							}
						},{
							dataIndex: 'cte_ev_protocolo',
							text: 'Protocolo',
							tooltip: 'Número do protocolo de retorno da Sefaz',
							menuDisabled: true,
							flex: 1
						},{
							dataIndex: 'cte_ev_evento',
							text: 'Código',
							tooltip: 'Código do evento',
							menuDisabled: true,
							flex: 1
						}]
					}]
				}]
			},{
				xtype: 'cteform',
				title: 'Emissão',
				iconCls: 'icon-pencil',
				autoScroll: true
			}]
		});
		
		this.callParent(arguments);
	}
});