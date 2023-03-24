Ext.define('Cliente.Fatura.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.clientefaturagrid',
	
	initComponent: function() {
		var me = this, statusRenderer = function(value, metaData, record) {
			switch (record.get('situacao_fatura')) {
				default: metaData.tdCls = 'bluecol'; break;
				case 'PAGAR HOJE': metaData.tdCls = 'yellowcol'; break;
				case 'PAGO NO PRAZO': metaData.tdCls = 'greencol'; break;
				case 'PAGO EM ATRASO': case 'EM ATRASO': metaData.tdCls = 'redcol'; break;
			}
			metaData.tdAttr = 'data-qtip="' + record.get('situacao') + ' ' + record.get('situacao_fatura') + ' - Conhecimentos: ' + record.get('lista_ctes') + '"';
			return value;
		};
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Financeiro.Receber.data.Model',
			autoLoad: App.cliente.clie_id > 0,
			autoDestroy: true,
			remoteSort: true,
			remoteFilter: true,
			remoteGroup: false,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/site/clientes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_receber',
					status: 'PENDENTES'
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
				property: 'vence_em',
				direction: 'DESC'
			}]
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableLocking: true,
			enableColumnHide: true,
			emptyText: 'Nenhum item encontrado',
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			features: [{
				ftype: 'filters',
	        	encode: true,
	        	local: false,
	        	filters: [{
	        		dataIndex: 'id',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'situacao_fatura',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['A VENCER','RECEBER HOJE','EM ATRASO','RECEBIDO NO PRAZO','RECEBIDO EM ATRASO']
	        	},{
	        		dataIndex: 'situacao',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['EM COBRANCA','LIQUIDADO','CANCELADO']
	        	},{
	        		dataIndex: 'tipo_carteira',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['BANCARIA','INTERNA','TERCEIRIZADA'] 
	        	},{
	        		dataIndex: 'cliefat_status_cobranca',
	        		type: 'list',
	        		phpMode: true,
	        		options: ['F','N','R','I']
	        	},{
	        		dataIndex: 'devedor_razao_social',
	        		type: 'string'
	        	},{
	        		dataIndex: 'devedor_cpf_cnpj',
	        		type: 'string'
	        	},{
	        		dataIndex: 'devedor_endereco',
	        		type: 'string'
	        	},{
	        		dataIndex: 'devedor_telefone',
	        		type: 'string'
	        	},{
	        		dataIndex: 'doc_fatura',
	        		type: 'string'
	        	},{
	        		dataIndex: 'emitido_em',
	        		type: 'date'
	        	},{
	        		dataIndex: 'lista_ctes',
	        		type: 'string'
	        	},{
	        		dataIndex: 'valor_ctes',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'valor_original',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'vence_em',
	        		type: 'date'
	        	},{
	        		dataIndex: 'valor_recebido',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'recebido_em',
	        		type: 'date'
	        	},{
	        		dataIndex: 'valor_multa',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'valor_juros',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'valor_acrescimo',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'valor_desconto',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'valor_abatimento',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'motivo_cancelado',
	        		type: 'string'
	        	},{
	        		dataIndex: 'nota_obs',
	        		type: 'string'
	        	},{
	        		dataIndex: 'emitido_boleto',
	        		type: 'boolean'
	        	},{
	        		dataIndex: 'email_enviado',
	        		type: 'boolean'
	        	},{
	        		dataIndex: 'cadastrado_por_nome',
	        		type: 'string'
	        	},{
	        		dataIndex: 'alterado_por_nome',
	        		type: 'string'
	        	},{
	        		dataIndex: 'cadastrado_em',
	        		type: 'date'
	        	},{
	        		dataIndex: 'alterado_em',
	        		type: 'date'
	        	},{
	        		dataIndex: 'versao',
	        		type: 'numeric'
	        	}]
	        }],
			columns: [{
				dataIndex: 'id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70
			},{
				text: 'Situação do faturamento',
				columns: [{
					dataIndex: 'situacao_fatura',
					text: 'Posição',
					tooltip: 'Posição financeira do recebimento',
					align: 'center',
					width: 100,
					sortable: true,
					renderer: statusRenderer
				},{
					dataIndex: 'situacao',
					text: 'Situação',
					tooltip: 'Situação da cobrança do faturamento',
					align: 'center',
					width: 100,
					sortable: true,
					renderer: statusRenderer
				}]
			},{
				text: 'Dados do título para cobrança',
				columns: [{
					dataIndex: 'doc_fatura',
					text: 'Número',
					tooltip: 'Número da fatura',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: statusRenderer
				},{
					xtype: 'datecolumn',
					dataIndex: 'emitido_em',
					text: 'Emitido em',
					format: 'D d/m/Y H:i',
					tooltip: 'Data/Hora da emissão da duplicata',
					align: 'right',
					width: 140,
					sortable: true
				},{
					dataIndex: 'lista_ctes',
					text: 'Conhecimentos',
					tooltip: 'Número dos conhecimentos envolvidos no faturamento',
					align: 'right',
					width: 100,
					sortable: true,
					renderer: function(value, metaData, record) {
						if (!Ext.isEmpty(value)) {
							metaData.tdAttr = 'data-qtip="' + value + '"';
						}
						return value;
					}
				},{
					dataIndex: 'valor_ctes',
					text: 'Total Conhecimentos',
					tooltip: 'Valor total dos conhecimentos no faturamento',
					align: 'right',
					width: 130,
					sortable: true,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'valor_original',
					text: 'Valor original',
					tooltip: 'Valor original do título para faturamento',
					align: 'right',
					width: 130,
					sortable: true,
					renderer: Ext.util.Format.brMoney
				},{
					xtype: 'datecolumn',
					dataIndex: 'vence_em',
					text: 'Vencimento',
					format: 'D d/m/Y',
					tooltip: 'Data do vencimento da fatura',
					align: 'right',
					width: 120,
					sortable: true
				}]
			},{
				text: 'Dados da baixa do título de cobrança',
				columns: [{
					dataIndex: 'valor_recebido',
					text: 'Valor Recebido',
					tooltip: 'Valor recebido do cliente devedor',
					align: 'right',
					width: 130,
					sortable: true,
					renderer: Ext.util.Format.brMoney
				},{
					xtype: 'datecolumn',
					dataIndex: 'recebido_em',
					text: 'Recebido em',
					format: 'D d/m/Y',
					tooltip: 'Data do recebimento da fatura pelo cliente devedor',
					align: 'right',
					width: 120,
					sortable: true
				},{
					dataIndex: 'valor_multa',
					text: 'Multa',
					tooltip: 'Valor da multa por atraso do pagamento',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'valor_juros',
					text: 'Juros',
					tooltip: 'Valor do juros por atraso do pagamento',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'valor_acrescimo',
					text: 'Acréscimo',
					tooltip: 'Valor de acréscimo na baixa do recebimento na fatura',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'valor_desconto',
					text: 'Desconto',
					tooltip: 'Valor de desconto na baixa do recebimento na fatura',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'valor_abatimento',
					text: 'Abatimento',
					tooltip: 'Valor de abatimento referente ao crédito do cliente devedor',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'tipo_carteira',
					text: 'Tipo de Carteira',
					tooltip: 'Cobrança terceirizada',
					align: 'center',
					sortable: true,
					width: 100
				},{
					dataIndex: 'banco_nome',
					text: 'Banco',
					tooltip: 'Banco para recebimento',
					width: 150
				},{
					dataIndex: 'agencia',
					text: 'Agência',
					tooltip: 'Número da agência para recebimento',
					align: 'right',
					width: 90
				},{
					dataIndex: 'conta_corrente',
					text: 'Conta',
					tooltip: 'Número da conta corrente para recebimento',
					align: 'right',
					width: 100
				}]
			},{
				text: 'Emissão dos documentos',
				columns: [{
					xtype: 'templatecolumn',
					dataIndex: 'pdf_duplicata',
					text: 'Duplicata',
					align: 'center',
					tpl: '<tpl if="pdf_duplicata"><a href="{pdf_duplicata}" target="_blank">ABRIR</a></tpl>'
				},{
					xtype: 'booleancolumn',
					dataIndex: 'emitido_boleto',
					text: 'Boleto',
					tooltip: 'Boleto foi emitido?',
					align: 'center',
					trueText: 'Sim',
					falseText: 'Não',
					width: 60,
					sortable: false
				},{
					xtype: 'booleancolumn',
					dataIndex: 'email_enviado',
					text: 'E-mail',
					tooltip: 'E-mail de cobrança foi enviado?',
					align: 'center',
					trueText: 'Sim',
					falseText: 'Não',
					width: 60,
					sortable: false
				}]
			},{
				text: 'Observações adicionais do faturamento',
				columns: [{
					dataIndex: 'nota_obs',
					text: 'Observações',
					tooltip: 'Observações gerais',
					width: 300,
					sortable: false,
					renderer: function(value, metaData, record) {
						if (!Ext.isEmpty(value)) {
							metaData.tdAttr = 'data-qtip="' + value + '"';
						}
						return value;
					}
				},{
					dataIndex: 'motivo_cancelado',
					text: 'Motivo de cancelamento',
					tooltip: 'Descrição do motivo do cancelamento do faturamento/recebimento',
					width: 300,
					sortable: false,
					renderer: function(value, metaData, record) {
						if (!Ext.isEmpty(value)) {
							metaData.tdAttr = 'data-qtip="' + value + '"';
						}
						return value;
					}
				}]
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					text: 'Exportar XLS',
					iconCls: 'icon-file-excel',
					tooltip: 'Exportar registros para o formato xls',
					handler: function() {
						Ext.create('Ext.ux.Window', {
							ui: 'blue-window-active',
							title: 'Exportar faturas (xls)',
							width: 320,
							height: 235,
							autoShow: true,
							closable: true,
							minimizable: false,
							maximizable: false,
							maximized: false,
							resizable: false,
							layout: 'fit',
							items: {
								xtype: 'form',
								bodyPadding: 10,
								defaults: {
									anchor: '100%',
									labelAlign: 'top',
									allowBlank: false,
									selectOnFocus: true
								},
								items: [{
									xtype: 'datefield',
									fieldLabel: 'Período inicial para o campo `Emitido em´',
									format: 'd/m/Y',
									vtype: 'daterange',
									name: 'periodo_inicial',
									itemId: 'periodo_inicial',
									endDateField: 'periodo_final'
								},{
									xtype: 'datefield',
									fieldLabel: 'Período final para o campo `Emitido em´',
									format: 'd/m/Y',
									vtype: 'daterange',
									name: 'periodo_final',
									itemId: 'periodo_final',
									startDateField : 'periodo_inicial'
								},{
									xtype: 'localcombo',
									fieldLabel: 'Selecione o tipo de filtro para relatório',
									name: 'status',
									value: 'TODOS',
									options: ['TODOS','PENDENTES','BAIXADOS']
								}],
								buttons: [{
									text: 'EXPORTAR',
									formBind: true,
									disabled: true,
									handler: function(btn) {
										var form = btn.up('form').getForm(),
										originalText = btn.getText();
										if (!form.isValid()) {
											return false;
										}
										btn.setText('EXPORTANDO...');
										btn.setDisabled(true);
										form.submit({
											clientValidation: true,
											url: 'mod/site/clientes/php/response.php',
											method: 'post',
											params: {
												m: 'export_receber_xls'
											},
											failure: Ext.Function.createSequence(App.formFailure, function() {
												btn.setDisabled(false);
												btn.setText(originalText);
											}),
											success: function(f, a) {
												btn.setDisabled(false);
												btn.setText(originalText);
												Ext.create('Ext.ux.Alert', {
													ui: 'black-alert',
													msg: 'Seu relatório foi gerado com sucesso nos formatos PDF e XLS.',
													buttons: [{
														ui: 'red-button',
														text: 'ABRIR PDF',
														href: a.result.pdf
													},{
														ui: 'green-button',
														text: 'ABRIR XLS',
														href: a.result.xls
													}]
												});
											}
										});
									}
								}]
							}
						});
					}
				},{
					text: 'Exportar TXT',
					iconCls: 'icon-file-css',
					tooltip: 'Exportar faturamentos para o formato txt',
					handler: function() {
						var win = Ext.create('Ext.ux.Window', {
							title: 'Exportar para o formato DOCCOB (txt)',
							width: 250,
							height: 195,
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
									anchor: '100%',
									labelAlign: 'top',
									allowBlank: false,
									selectOnFocus: true
								},
								items: [{
									xtype: 'datefield',
									vtype: 'daterange',
									fieldLabel: 'Data de início do faturamento',
									format: 'd/m/Y',
									name: 'data_faturamento_i',
									itemId: 'data_faturamento_i',
									endDateField: 'data_faturamento_f'
								},{
									xtype: 'datefield',
									vtype: 'daterange',
									fieldLabel: 'Data de término do faturamento',
									format: 'd/m/Y',
									name: 'data_faturamento_f',
									itemId: 'data_faturamento_f',
									startDateField: 'data_faturamento_i'
								}],
								buttons: [{
									text: 'EXPORTAR',
									scale: 'medium',
									formBind: true,
									handler: function(btn) {
										var form = this.up('form').getForm(), 
										originalText = btn.getText();
										btn.setText('EXPORTANDO...');
										btn.setDisabled(true);
										form.submit({
											clientValidation: true,
											url: 'mod/site/clientes/php/response.php',
											method: 'post',
											params: {
												m: 'export_receber_txt'
											},
											failure: Ext.Function.createSequence(App.formFailure, function() {
												btn.setDisabled(false);
												btn.setText(originalText);
											}),
											success: function(f, a) {
												btn.setDisabled(false);
												btn.setText(originalText);
												var popup = window.open(a.result.url);
												if (!popup) {
													Ext.create('Ext.ux.Alert', {
														ui: 'black-alert',
														msg: 'O sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para facilitar e evitar futura mensagem, por favor inclua nosso site na lista dos permitidos.<br/>O que você deseja fazer agora?',
														closeText: 'CANCELAR',
														buttons: {
															text: 'ABRIR ARQUIVO',
															url: a.result.url,
															hrefTarget: '_blank'
														}
													});
												}
											}
										});
									}
								}]
							}
						});
					}
				},'->',{
					itemId: 'view-filter',
					text: 'Exibindo (pendentes)',
					iconCls: 'icon-glasses-2',
					menu: {
						items: [{
							text: 'Todos',
							group: 'status-receber',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						},'-',{
							text: 'Pendentes',
							group: 'status-receber',
							checked: true,
							scope: this,
							checkHandler: this.onStatusChange
						},{
							text: 'Baixados',
							group: 'status-receber',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						}]
					}
				},{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: [
						'doc_fatura',
						'devedor_razao_social',
						'devedor_nome_fantasia',
						'devedor_cpf_cnpj',
						'tipo_carteira',
						'situacao',
						'motivo_cancelado',
						'nota_obs'
					]
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: me.store,
				displayInfo: true
			}]
		});
		
		me.callParent(arguments);
	},
	
	onStatusChange: function(item, checked) {
		if (checked) {
			var menu = this.down('#view-filter');
			menu.setText('Exibindo (' + item.text.toLowerCase() + ')');
			if (!this.store.isLoading()) {
				this.store.getProxy().setExtraParam('status', item.text.toUpperCase());
				this.store.clearFilter(true);
				this.store.load();
			}
		}
	}
});

Ext.define('Cliente.Documento.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.clientedocumentogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
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
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: false,
			enableLocking: true,
			enableColumnHide: true,
			emptyText: 'Nenhum item encontrado',
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			features: [{
				ftype: 'filters',
	        	encode: true,
	        	local: true
	        },{
				ftype: 'groupingsummary',
				groupHeaderTpl: 'Documentos',
				enableNoGroups: false,
				enableGroupingMenu: false
			}],
			columns: [{
				dataIndex: 'cte_doc_serie',
				text: 'Série',
				filterable: true,
				width: 70
			},{
				dataIndex: 'cte_doc_numero',
				text: 'Número',
				tooltip: 'Número da Nota Fiscal',
				filterable: true,
				width: 100,
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_doc_data_emissao',
				text: 'Emitido em',
				tooltip: 'Data de emissão da Nota Fiscal',
				format: 'D d/m/Y',
				align: 'right',
				filterable: true,
				width: 100
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
				}
			},{
				dataIndex: 'cte_doc_bc_icms',
				text: 'BC ICMS',
				tooltip: 'Base de Cálculo do ICMS',
				align: 'right',
				menuDisabled: true,
				width: 100,
				renderer: Ext.util.Format.brMoney
			},{
				dataIndex: 'cte_doc_valor_icms',
				text: 'Valor do ICMS',
				tooltip: 'Valor total do ICMS',
				align: 'right',
				menuDisabled: true,
				width: 120,
				renderer: Ext.util.Format.brMoney
			},{
				dataIndex: 'cte_doc_bc_icms_st',
				text: 'BASE ICMS ST',
				tooltip: 'Valor da Base de Cálculo do ICMS ST',
				align: 'right',
				menuDisabled: true,
				width: 100,
				renderer: Ext.util.Format.brMoney
			},{
				dataIndex: 'cte_doc_valor_icms_st',
				text: 'Valor ICMS ST',
				tooltip: 'Valor Total do ICMS ST',
				align: 'right',
				menuDisabled: true,
				width: 120,
				renderer: Ext.util.Format.brMoney
			}],
			dockedItems: [{
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
			}]
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Cliente.Ocorrencia.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.clienteocorrenciagrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
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
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: false,
			enableLocking: true,
			enableColumnHide: true,
			emptyText: 'Nenhum item encontrado',
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			features: [{
				ftype: 'filters',
	        	encode: true,
	        	local: true
	        }],
			columns: [{
				dataIndex: 'cte_ocor_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				sortable: true,
				groupable: false,
				filterable: true
			},{
				dataIndex: 'ocor_nome',
				text: 'Ocorrência',
				tooltip: 'Código e Descrição da ocorrência',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 450
			},{
				dataIndex: 'ocor_modal_caracteristica',
				text: 'Característica',
				tooltip: 'Característa da ocorrência',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 150
			},{
				dataIndex: 'cte_doc_numero',
				text: 'Documento',
				tooltip: 'Nota Fiscal ou Documento referente a ocorrência',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 100
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_ocor_quando_data',
				text: 'Ocorreu em',
				format: 'D d/m/Y',
				align: 'right',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 120
			},{
				dataIndex: 'cte_ocor_quando_hora',
				text: 'Ocorreu às',
				align: 'right',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 120
			},{
				dataIndex: 'cte_ocor_volumes',
				text: 'Volumes',
				align: 'center',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 100
			},{
				dataIndex: 'cte_ocor_peso_bruto',
				text: 'Peso Bruto (kg)',
				align: 'right',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 100,
				renderer: Ext.util.Format.brFloat
			},{
				dataIndex: 'cte_ocor_entregador_nome',
				text: 'Entregador',
				tooltip: 'Nome do entregador',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 200
			},{
				dataIndex: 'cte_ocor_entregador_doc',
				text: 'Entregador (doc)',
				tooltip: 'Documento do entregador',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 100
			},{
				dataIndex: 'cte_ocor_recebedor_nome',
				text: 'Recebedor',
				tooltip: 'Nome do recebedor',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 200
			},{
				dataIndex: 'cte_ocor_recebedor_doc',
				text: 'Recebedor (doc)',
				tooltip: 'Documento do recebedor',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 100
			},{
				dataIndex: 'cte_ocor_nota',
				text: 'Relato sobre a ocorrência',
				sortable: false,
				groupable: false,
				filterable: true,
				width: 500
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
				filterable: true,
				width: 70
			},{
				dataIndex: 'cte_ocor_voo',
				text: 'Vôo',
				tooltip: 'Número do vôo',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 70
			},{
				dataIndex: 'cte_ocor_base',
				text: 'Base',
				tooltip: 'Sigla da localidade',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 70
			},{
				dataIndex: 'cte_ocor_serie_master',
				text: 'Série Master',
				tooltip: 'Número da série do conhecimento master',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 70
			},{
				dataIndex: 'cte_ocor_numero_master',
				text: 'Número Master',
				tooltip: 'Número do conhecimento master',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 90
			},{
				dataIndex: 'cte_ocor_operacional_master',
				text: 'Nº Operacional Master',
				tooltip: 'Número operacional do conheciento master',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 90
			},{
				dataIndex: 'cte_ocor_chave_master',
				text: 'Chave Master',
				tooltip: 'Chave eletrônica do conhecimento master',
				sortable: true,
				groupable: false,
				filterable: true,
				width: 90
			}],
			dockedItems: [{
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
			}]
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Cliente.CTE.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.clientectegrid',
	
	initComponent: function() {
		var me = this, statusRenderer = function(value, metaData, record) {
			switch (record.get('cte_situacao')) {
				case 'AUTORIZADO': 
				case 'ME EMITIDA':metaData.tdCls = 'bluecol'; break;
				case 'VALIDADO': metaData.tdCls = 'yellowcol'; break;
				case 'TRANSMITIDO': metaData.tdCls = 'greencol'; break;
				case 'REJEITADO':
				case 'DENEGADO': metaData.tdCls = 'redcol'; break;
				case 'CANCELADO': metaData.tdCls = 'graycol'; break;
				case 'INUTILIZADO':
				case 'SUBSTITUÍDO':
				case 'ANULADO': metaData.tdCls = 'orangecol'; break;
			}
			metaData.tdAttr = 'data-qtip="Número: ' + record.get('cte_numero') + ' / Minuta: ' + record.get('cte_minuta') + '<br/>' + record.get('cte_situacao') + ' "';
			return value;
		};
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 30,
			
			proxy: {
				type: 'ajax',
				url: 'mod/site/clientes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_cte'
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
			}],
			
			listeners: {
				load: function(store, records) {
					Ext.Function.defer(function(){
						me.getSelectionModel().select(0);
					}, 2500);
				}
			}
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: false,
			enableLocking: true,
			enableColumnHide: true,
			emptyText: 'Nenhum item encontrado',
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
				dataIndex: 'cte_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'cte_serie',
				text: 'Série',
				tooltip: 'Série do CT-e',
				align: 'right',
				width: 70,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'cte_numero',
				text: 'Número',
				tooltip: 'Número do CT-e',
				align: 'right',
				width: 90,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'cte_minuta',
				text: 'Minuta',
				tooltip: 'Número da minuta ou ordem de coleta',
				align: 'right',
				width: 70,
				filterable: true,
				renderer: statusRenderer
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_data_hora_emissao',
				text: 'Emitido em',
				format: 'D d/m/Y H:i',
				tooltip: 'Data/Hora da emissão do CT-e',
				align: 'right',
				width: 140,
				filterable: true
			},{
				dataIndex: 'rem_razao_social',
				text: 'Rementente',
				width: 300,
				filterable: true,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="CNPJ/CPF: ' + record.get('rem_cnpj_cpf') + '"';
					return value;
				}
			},{
				dataIndex: 'rem_cnpj_cpf',
				text: 'Remetente (DOC)',
				tooltip: 'CNPJ/CPF Remetente',
				hidden: true,
				filterable: true,
				width: 150,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + record.get('rem_razao_social') + '"';
					return value;
				}
			},{
				dataIndex: 'cid_origem_nome_completo',
				text: 'Origem',
				width: 300,
				filterable: true
			},{
				dataIndex: 'des_razao_social',
				text: 'Destinatário',
				width: 300,
				filterable: true,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="CNPJ/CPF: ' + record.get('des_cnpj_cpf') + '"';
					return value;
				}
			},{
				dataIndex: 'des_cnpj_cpf',
				text: 'Destinatário (DOC)',
				tooltip: 'CNPJ/CPF Destinatário',
				hidden: true,
				filterable: true,
				width: 150,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + record.get('des_razao_social') + '"';
					return value;
				}
			},{
				dataIndex: 'cid_passagem_nome_completo',
				text: 'Passagem',
				width: 300,
				hidden: true,
				filterable: true
			},{
				dataIndex: 'cid_destino_nome_completo',
				text: 'Destino',
				width: 300,
				filterable: true
			},{
				dataIndex: 'cte_valor_total',
				text: 'Valor CT-e',
				tooltip: 'Valor total do conhecimento',
				align: 'right',
				width: 120,
				renderer: Ext.util.Format.brMoney,
				filterable: true
			},{
				dataIndex: 'cte_tipo_do_cte_nome',
				text: 'Tipo CT-e',
				width: 200,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['0 - CT-e Normal', '1 - CT-e de Complemento de Valores', '2 - CT-e de Anulação', '3 - CT-e Substituto']
				}
			},{
				dataIndex: 'cte_forma_emissao_nome',
				text: 'Forma Emissão',
				width: 200,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['1 - Normal', '5 - Contingência FSDA', '7 - Autorização pela SVC-RS', '8 - Autorização pela SVC-SP']
				}
			},{
				dataIndex: 'cte_tipo_servico_nome',
				text: 'Tipo Serviço',
				width: 200,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['0 - Normal', '1 - Subcontratação', '2 - Redespacho', '3 - Redespacho Intermediário', '4 - Serviço Vinculado à Multimodal']
				}
			},{
				dataIndex: 'cte_situacao',
				text: 'Situação',
				align: 'center',
				width: 125,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['DIGITAÇÃO','VALIDADO','TRANSMITIDO','AUTORIZADO','REJEITADO','DENEGADO','CANCELADO','INUTILIZADO','ANULADO','SUBSTITUÍDO','ME EMITIDA']
				},
				renderer: statusRenderer
			},{
				dataIndex: 'cte_chave',
				text: 'Chave',
				width: 280,
				filterable: true
			},{
				dataIndex: 'lista_documentos',
				text: 'Documentos',
				width: 180,
				filterable: true,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + value + '"';
					return value;
				}
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_data_hora_autorizacao',
				text: 'Autorizado em',
				format: 'D d/m/Y H:i',
				tooltip: 'Data/Hora da autorização do CT-e',
				align: 'right',
				width: 140,
				filterable: true
			},{
				xtype: 'templatecolumn',
				dataIndex: 'cte_xml',
				text: 'XML',
				align: 'center',
				width: 90,
				sortable: false,
				filterable: false,
				menuDisabled: true,
				tpl: '<tpl if="cte_xml"><a href="{cte_xml}" target="_blank">ABRIR</a></tpl>'
			},{
				xtype: 'templatecolumn',
				dataIndex: 'cte_pdf',
				text: 'PDF',
				align: 'center',
				width: 90,
				sortable: false,
				filterable: false,
				menuDisabled: true,
				tpl: '<tpl if="cte_pdf"><a href="{cte_pdf}" target="_blank">ABRIR</a></tpl>'
			},{
				xtype: 'templatecolumn',
				dataIndex: 'cte_cancelado_xml',
				text: 'XML CANCELADO',
				tooltip: 'XML do CT-e CANCELADO',
				align: 'center',
				width: 115,
				sortable: false,
				filterable: false,
				menuDisabled: true,
				tpl: '<tpl if="cte_cancelado_xml"><a href="{cte_cancelado_xml}" target="_blank">ABRIR</a></tpl>'
			},{
				xtype: 'templatecolumn',
				dataIndex: 'cte_cancelado_pdf',
				text: 'PDF CANCELADO',
				tooltip: 'PDF do CT-e CANCELADO',
				align: 'center',
				width: 115,
				sortable: false,
				filterable: false,
				menuDisabled: true,
				tpl: '<tpl if="cte_cancelado_pdf"><a href="{cte_cancelado_pdf}" target="_blank">ABRIR</a></tpl>'
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_data_entrega_ultima',
				text: 'Última entrega',
				format: 'D d/m/Y H:i',
				tooltip: 'Data/Hora da última entrega referente as ocorrências',
				align: 'right',
				width: 140,
				filterable: true
			},{
				dataIndex: 'cte_perc_entregue',
				text: 'Entregue',
				tooltip: 'Percentual entregue referente as ocorrências',
				align: 'center',
				width: 90,
				filterable: true,
				renderer: Ext.util.Format.percent
			},{
				xtype: 'booleancolumn',
				dataIndex:'cte_faturado',
				text: 'Faturamento', 
				align: 'center',
				trueText:'Faturado', 
				falseText: 'À Faturar',
				width: 100,
				filterable: true
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					text: 'Exportar XLS',
					iconCls: 'icon-file-excel',
					tooltip: 'Exportar registros para o formato xls',
					handler: function() {
						Ext.create('Export.Window', {
							title: 'Conhecimentos (CT-e)',
							url: 'mod/site/clientes/php/response.php',
							action: 'export_cte_xls',
							defaultData: [{
								pos: 1,
								id: 'cte_minuta',
								field: 'Minuta'
							},{
								pos: 2,
								id: 'cte_serie',
								field: 'Série'
							},{
								pos: 3,
								id: 'cte_numero',
								field: 'Número',
								sort_id: 'ASC',
								sort_label: 'Crescente'
							},{
								pos: 4,
								id: 'cte_chave',
								field: 'Chave'
							},{
								pos: 5,
								id: 'cte_data_hora_emissao',
								field: 'Emitido em'
							},{
								pos: 6,
								id: 'rem_razao_social',
								field: 'Remetente (razão social)'
							},{
								pos: 7,
								id: 'rem_cid_sigla',
								field: 'Remetente (sigla)'
							},{
								pos: 8,
								id: 'tom_razao_social',
								field: 'Tomador (razão social)'
							},{
								pos: 9,
								id: 'tom_cid_sigla',
								field: 'Tomador (sigla)'
							},{
								pos: 10,
								id: 'cid_origem_sigla',
								field: 'Cidade Origem (sigla)'
							},{
								pos: 11,
								id: 'cid_origem_municipio',
								field: 'Cidade Origem (município)'
							},{
								pos: 12,
								id: 'cid_origem_uf',
								field: 'UF Origem'
							},{
								pos: 13,
								id: 'cid_destino_sigla',
								field: 'Cidade Destino (sigla)'
							},{
								pos: 14,
								id: 'cid_destino_municipio',
								field: 'Cidade Destino (município)'
							},{
								pos: 15,
								id: 'cid_destino_uf',
								field: 'UF Destino'
							},{
								pos: 16,
								id: 'cte_forma_pgto_nome',
								field: 'Forma Pagamento'
							},{
								pos: 17,
								id: 'cte_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								pos: 18,
								id: 'cte_perc_entregue',
								field: 'Percentual Entregue'
							},{
								pos: 19,
								id: 'cte_peso_bruto',
								field: 'Peso Bruto'
							},{
								pos: 20,
								id: 'cte_peso_cubado',
								field: 'Peso Cubado'
							},{
								pos: 21,
								id:'cte_peso_bc',
								field: 'Peso Taxado' 
							},{
								pos: 22,
								id: 'cte_qtde_volumes',
								field: 'Volumes'
							},{
								pos: 23,
								id: 'cte_valor_carga',
								field: 'Valor Carga'
							},{
								pos: 24,
								id: 'cte_valor_total',
								field: 'Valor CT-e'
							},{
								pos: 25,
								id: 'cte_situacao',
								field: 'Situação'
							}],
							fields: [{
								id: 'cte_serie',
								field: 'Série'
							},{
								id: 'cte_numero',
								field: 'Número'
							},{
								id: 'cte_minuta',
								field: 'Minuta'
							},{
								id: 'cte_chave',
								field: 'Chave'
							},{
								id: 'cte_data_hora_emissao',
								field: 'Emitido em'
							},{
								id: 'cte_natureza_operacao',
								field: 'Natureza da Operação'
							},{
								id: 'rem_razao_social',
								field: 'Remetente (razão social)'
							},{
								id: 'rem_nome_fantasia',
								field: 'Remetente (nome fantasia)'
							},{
								id: 'rem_cnpj_cpf',
								field: 'Remetente (cnpj/cpf)'
							},{
								id: 'rem_cid_sigla',
								field: 'Remetente (sigla)'
							},{
								id: 'exp_razao_social',
								field: 'Expedidor (razão social)'
							},{
								id: 'exp_nome_fantasia',
								field: 'Expedidor (nome fantasia)'
							},{
								id: 'exp_cnpj_cpf',
								field: 'Expedidor (cnpj/cpf)'
							},{
								id: 'exp_cid_sigla',
								field: 'Expedidor (sigla)'
							},{
								id: 'tom_razao_social',
								field: 'Tomador (razão social)'
							},{
								id: 'tom_nome_fantasia',
								field: 'Tomador (nome fantasia)'
							},{
								id: 'tom_cnpj_cpf',
								field: 'Tomador (cnpj/cpf)'
							},{
								id: 'tom_cid_sigla',
								field: 'Tomador (sigla)'
							},{
								id: 'des_razao_social',
								field: 'Destinatário'
							},{
								id: 'cid_origem_sigla',
								field: 'Cidade Origem (sigla)'
							},{
								id: 'cid_origem_municipio',
								field: 'Cidade Origem (município)'
							},{
								id: 'cid_origem_uf',
								field: 'UF Origem'
							},{
								id: 'cid_destino_sigla',
								field: 'Cidade Destino (sigla)'
							},{
								id: 'cid_destino_municipio',
								field: 'Cidade Destino (município)'
							},{
								id: 'cid_destino_uf',
								field: 'UF Destino'
							},{
								id: 'cte_tipo_do_cte_nome',
								field: 'Tipo CT-e'
							},{
								id: 'cte_forma_pgto_nome',
								field: 'Forma Pagamento'
							},{
								id: 'cte_data_entrega_prevista',
								field: 'Data Entrega (prevista)'
							},{
								id: 'cte_data_entrega_efetuada',
								field: 'Data Entrega (efetuada)'
							},{
								id: 'cte_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								id: 'cte_perc_entregue',
								field: 'Percentual Entregue'
							},{
								id: 'cte_modal_nome',
								field: 'Modal'
							},{
								id: 'cte_forma_emissao_nome',
								field: 'Forma Emissão'
							},{
								id: 'cte_tabela_frete',
								field: 'Tabela Frete'
							},{
								id: 'cte_tipo_servico_nome',
								field: 'Tipo Serviço'
							},{
								id: 'cte_cfop',
								field: 'CFOP'
							},{
								id: 'cte_carac_adic_transp',
								field: 'Característica adicional do transporte'
							},{
								id: 'cte_carac_adic_servico',
								field: 'Característica adicional do serviço'
							},{
								id: 'cte_outras_carac_carga',
								field: 'Outras características do produto'
							},{
								id: 'produto_predominante_nome',
								field: 'Produto Predominante'
							},{
								id: 'cte_situacao',
								field: 'Situação'
							},{
								id: 'cte_peso_bruto',
								field: 'Peso Bruto'
							},{
								id: 'cte_peso_cubado',
								field: 'Peso Cubado'
							},{
								id:'cte_peso_bc',
								field: 'Peso Taxado' 
							},{
								id: 'cte_cubagem_m3',
								field: 'Cubagem'
							},{
								id: 'cte_qtde_volumes',
								field: 'Volumes'
							},{
								id: 'cte_valor_carga',
								field: 'Valor Carga'
							},{
								id: 'cte_valor_total',
								field: 'Valor CT-e'
							},{
								id: 'cte_aliquota_icms',
								field: 'Alíquota ICMS'
							},{
								id: 'cte_valor_icms',
								field: 'Valor ICMS'
							},{
								id: 'cte_data_hora_autorizacao',
								field: 'Autorizado em'
							},{
								id: 'cte_cadastrado_por_nome',
								field: 'Cadastrado por'
							},{
								id: 'cte_cadastrado_em',
								field: 'Cadastrado em'
							},{
								id: 'cte_alterado_por_nome',
								field: 'Alterado por'
							},{
								id: 'cte_alterado_em',
								field: 'Alterado em'
							},{
								id: 'cte_versao',
								field: 'Versão'
							},{
								id: 'cte_obs_gerais',
								field: 'Observações Gerais'
							},{
								id: 'lista_documentos_numeros',
								field: 'Nº Documentos'
							},{
								id: 'recebedor_nome',
								field: 'Recebedor'
							},{
								id: 'recebedor_doc',
								field: 'Recebedor (DOC)'
							}]
						});
					}
				},{
					text: 'Exportar TXT',
					iconCls: 'icon-file-css',
					tooltip: 'Exportar conhecimentos com documentos e ocorrências para o formato txt',
					handler: function() {
						Ext.create('Export.Window', {
							title: 'Conhecimentos, Documentos/Notas/Recibos e Ocorrências (CT-e)',
							url: 'mod/site/clientes/php/response.php',
							action: 'export_cte_txt',
							defaultData: [{
								pos: 1,
								id: 'cte_doc_numero',
								field: 'Número (DOC)'
							},{
								pos: 2,
								id:'cte_doc_serie', 
								field:'Série (DOC)'
							},{
								pos: 3,
								id: 'cte_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								pos: 4,
								id:'cte_ocor_quando_data', 
								field:'Data (OCOR)',
								sort_id: 'DESC',
								sort_label: 'Decrescente'
							},{
								pos: 5,
								id:'ocor_descricao', 
								field:'Descrição (OCOR)'
							},{
								pos: 6,
								id: 'rem_cnpj_cpf',
								field: 'Remetente (cnpj/cpf)'
							}],
							fields: [{
								id: 'cte_serie',
								field: 'Série'
							},{
								id: 'cte_numero',
								field: 'Número'
							},{
								id: 'cte_minuta',
								field: 'Minuta'
							},{
								id: 'cte_chave',
								field: 'Chave'
							},{
								id: 'cte_data_hora_emissao',
								field: 'Emitido em'
							},{
								id: 'cte_natureza_operacao',
								field: 'Natureza da Operação'
							},{
								id: 'rem_razao_social',
								field: 'Remetente (razão social)'
							},{
								id: 'rem_nome_fantasia',
								field: 'Remetente (nome fantasia)'
							},{
								id: 'rem_cnpj_cpf',
								field: 'Remetente (cnpj/cpf)'
							},{
								id: 'rem_cid_sigla',
								field: 'Remetente (sigla)'
							},{
								id: 'exp_razao_social',
								field: 'Expedidor (razão social)'
							},{
								id: 'exp_nome_fantasia',
								field: 'Expedidor (nome fantasia)'
							},{
								id: 'exp_cnpj_cpf',
								field: 'Expedidor (cnpj/cpf)'
							},{
								id: 'exp_cid_sigla',
								field: 'Expedidor (sigla)'
							},{
								id: 'tom_razao_social',
								field: 'Tomador (razão social)'
							},{
								id: 'tom_nome_fantasia',
								field: 'Tomador (nome fantasia)'
							},{
								id: 'tom_cnpj_cpf',
								field: 'Tomador (cnpj/cpf)'
							},{
								id: 'tom_cid_sigla',
								field: 'Tomador (sigla)'
							},{
								id: 'des_razao_social',
								field: 'Destinatário'
							},{
								id: 'cid_origem_sigla',
								field: 'Cidade Origem (sigla)'
							},{
								id: 'cid_origem_municipio',
								field: 'Cidade Origem (município)'
							},{
								id: 'cid_origem_uf',
								field: 'UF Origem'
							},{
								id: 'cid_destino_sigla',
								field: 'Cidade Destino (sigla)'
							},{
								id: 'cid_destino_municipio',
								field: 'Cidade Destino (município)'
							},{
								id: 'cid_destino_uf',
								field: 'UF Destino'
							},{
								id: 'cte_tipo_do_cte_nome',
								field: 'Tipo CT-e'
							},{
								id: 'cte_forma_pgto_nome',
								field: 'Forma Pagamento'
							},{
								id: 'cte_data_entrega_prevista',
								field: 'Data Entrega (prevista)'
							},{
								id: 'cte_data_entrega_efetuada',
								field: 'Data Entrega (efetuada)'
							},{
								id: 'cte_data_entrega_ultima',
								field: 'Última Entrega'
							},{
								id: 'cte_perc_entregue',
								field: 'Percentual Entregue'
							},{
								id: 'cte_modal_nome',
								field: 'Modal'
							},{
								id: 'cte_forma_emissao_nome',
								field: 'Forma Emissão'
							},{
								id: 'cte_tabela_frete',
								field: 'Tabela Frete'
							},{
								id: 'cte_tipo_servico_nome',
								field: 'Tipo Serviço'
							},{
								id: 'cte_cfop',
								field: 'CFOP'
							},{
								id: 'cte_carac_adic_transp',
								field: 'Característica adicional do transporte'
							},{
								id: 'cte_carac_adic_servico',
								field: 'Característica adicional do serviço'
							},{
								id: 'cte_outras_carac_carga',
								field: 'Outras características do produto'
							},{
								id: 'produto_predominante_nome',
								field: 'Produto Predominante'
							},{
								id: 'cte_situacao',
								field: 'Situação'
							},{
								id: 'cte_peso_bruto',
								field: 'Peso Bruto'
							},{
								id: 'cte_peso_cubado',
								field: 'Peso Cubado'
							},{
								id:'cte_peso_bc',
								field: 'Peso Taxado' 
							},{
								id: 'cte_cubagem_m3',
								field: 'Cubagem'
							},{
								id: 'cte_qtde_volumes',
								field: 'Volumes'
							},{
								id: 'cte_valor_carga',
								field: 'Valor Carga'
							},{
								id: 'cte_valor_total',
								field: 'Valor CT-e'
							},{
								id: 'cte_aliquota_icms',
								field: 'Alíquota ICMS'
							},{
								id: 'cte_valor_icms',
								field: 'Valor ICMS'
							},{
								id: 'cte_data_hora_autorizacao',
								field: 'Autorizado em'
							},{
								id: 'cte_cadastrado_por_nome',
								field: 'Cadastrado por'
							},{
								id: 'cte_cadastrado_em',
								field: 'Cadastrado em'
							},{
								id: 'cte_alterado_por_nome',
								field: 'Alterado por'
							},{
								id: 'cte_alterado_em',
								field: 'Alterado em'
							},{
								id: 'cte_versao',
								field: 'Versão'
							},{
								id: 'cte_obs_gerais',
								field: 'Observações Gerais'
							},{
								id:'cte_doc_serie', 
								field:'Série (DOC)'
							},{
								id:'cte_doc_data_emissao',
								field:'Emissão (DOC)'
							},{
								id:'cte_doc_numero',
								field:'Número (DOC)'
							},{
								id:'cte_doc_cfop', 
								field:'CFOP (DOC)'
							},{
								id:'cte_doc_modelo', 
								field:'Modelo (DOC)'
							},{
								id:'cte_doc_volumes', 
								field:'Volumes (DOC)'
							},{
								id:'cte_doc_bc_icms',
								field:'BC ICMS (DOC)'
							},{
								id:'cte_doc_valor_icms',
								field:'Valor ICMS (DOC)'
							},{
								id:'cte_doc_bc_icms_st',
								field:'BC ISM ST (DOC)'
							},{
								id:'cte_doc_valor_icms_st',
								field:'Valor ICMS ST (DOC)'
							},{
								id:'cte_doc_peso_total', 
								field:'Peso Total (DOC)'
							},{
								id:'cte_doc_pin', 
								field:'PIN (DOC)'
							},{
								id:'cte_doc_valor_produtos', 
								field:'Valor Produtos (DOC)'
							},{
								id:'cte_doc_valor_nota', 
								field:'Valor (DOC)'
							},{
								id:'cte_doc_chave_nfe',
								field:'Chave (DOC)'
							},{
								id:'cte_doc_tipo_doc', 
								field:'Tipo (DOC)'
							},{
								id:'cte_doc_descricao', 
								field:'Descrição (DOC)'
							},{
								id:'cte_ocor_quando_data', 
								field:'Data (OCOR)'
							},{
								id:'cte_ocor_quando_hora', 
								field:'Hora (OCOR)'
							},{
								id:'cte_ocor_cia_aerea',
								field:'CIA (OCOR)'
							},{
								id:'cte_ocor_voo', 
								field:'Vôo (OCOR)'
							},{
								id:'cte_ocor_base', 
								field:'Base (OCOR)'
							},{
								id:'cte_ocor_serie_master', 
								field:'Série Master (OCOR)'
							},{
								id:'cte_ocor_numero_master', 
								field:'Número Master (OCOR)'
							},{
								id:'cte_ocor_operacional_master', 
								field:'Operacional Master (OCOR)'
							},{
								id:'cte_ocor_chave_master', 
								field:'Chave Master (OCOR)'
							},{
								id:'cte_ocor_volumes',
								field:'Volumes (OCOR)'
							},{
								id:'cte_ocor_peso_bruto',
								field:'Peso (OCOR)'
							},{
								id:'cte_ocor_entregador_nome',
								field:'Entregador (OCOR)'
							},{
								id:'cte_ocor_entregador_doc', 
								field:'Doc Entregador (OCOR)'
							},{
								id:'cte_ocor_recebedor_nome',
								field:'Recebedor (OCOR)'
							},{
								id:'cte_ocor_recebedor_doc',
								field:'Doc Recebedor (OCOR)'
							},{
								id:'cte_ocor_nota',
								field:'Notas (OCOR)'
							},{
								id:'ocor_codigo', 
								field:'Código (OCOR)'
							},{
								id:'ocor_descricao', 
								field:'Descrição (OCOR)'
							},{
								id:'ocor_modal', 
								field:'Modal (OCOR)'
							},{
								id:'ocor_caracteristica', 
								field:'Característica (OCOR)'
							},{
								id:'ocor_nome', 
								field:'Nome (OCOR)'
							},{
								id:'ocor_modal_caracteristica', 
								field:'Caracterísitca Modal (OCOR)'
							}]
						});
					}
				},'->',{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: [
						'cte_numero',
						'cte_serie',
						'rem_razao_social',
						'rem_nome_fantasia',
						'col_razao_social',
						'col_nome_fantasia',
						'exp_razao_social',
						'exp_nome_fantasia',
						'rec_razao_social',
						'rec_nome_fantasia',
						'des_razao_social',
						'des_nome_fantasia',
						'ent_razao_social',
						'ent_nome_fantasia',
						'tom_razao_social',
						'tom_nome_fantasia',
						'cid_origem_nome_completo',
						'cid_destino_nome_completo',
						'cid_passagem_nome_completo',
						'produto_predominante',
						'recebedor_nome',
						'lista_documentos'
					]
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: me.store,
				displayInfo: true
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					var tp = me.up('clienteview'),
					grid1 = tp.down('clientedocumentogrid'),
					grid2 = tp.down('clienteocorrenciagrid'),
					store1 = grid1.getStore(),
					store2 = grid2.getStore(),
					proxy1 = store1.getProxy(),
					proxy2 = store2.getProxy();
					if (selections.length === 1) {
						var record = selections[0];
						proxy1.setExtraParam('cte_id', record.get('cte_id'));
						proxy2.setExtraParam('cte_id', record.get('cte_id'));
						store1.load();
						store2.load();
					} else {
						store1.removeAll();
						store2.removeAll();
						proxy1.setExtraParam('cte_id', 0);
						proxy2.setExtraParam('cte_id', 0);
					}
				}
			}
		});
		
		me.callParent(arguments);
	}
});