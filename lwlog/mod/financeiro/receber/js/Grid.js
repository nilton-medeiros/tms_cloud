Ext.define('Financeiro.Receber.CTe.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.contasreceberctegrid',
	
	cta_rec_id: 0,
	setCtaRecId: function(id) {
		var store = this.store, proxy = store.getProxy();
		if (id > 0 && id != this.cta_rec_id) {
			proxy.setExtraParam('cta_rec_id', id);
			this.cta_rec_id = id;
			store.load();
		} else {
			store.clearFilter();
			store.removeAll();
		}
	},
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name:'cte_id', type:'int', defaultValue:0},
				{name:'cte_serie', type:'int', defaultValue:0},
				{name:'cte_minuta', type:'int', defaultValue:0},
				{name:'cte_numero', type:'string', defaultValue:''},
				{name:'cte_valor_total', type:'float', defaultValue:0},
				{name:'cte_faturado', type:'boolean', defaultValue:false},
				{name:'clie_tomador_id', type:'int', defaultValue:0},
				{name:'tom_razao_social', type:'string', defaultValue:''},
				{name:'cte_tipo_carteira', type:'string', defaultValue:'BANCARIA'},
				{name:'cte_data_hora_emissao', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue: new Date()}
			],
			autoLoad: true,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cta_rec_id > 0;
				}
			},
			
			proxy: {
				type: 'ajax',
				url: 'mod/financeiro/receber/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_faturado',
					cta_rec_id: me.cta_rec_id
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
			
			groupField: 'tom_razao_social',
			sorters: [{
				property: 'tom_razao_social',
				direction: 'ASC'
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
	        	local: true
	        },{
				ftype: 'groupingsummary',
				groupHeaderTpl: '{name}',
				hideGroupedHeader: true,
				enableGroupingMenu: false
			}],
			columns: [{
				flex: 1,
				dataIndex: 'cte_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				filterable: true
			},{
				flex: 1,
				dataIndex: 'cte_serie',
				text: 'Série',
				tooltip: 'Série do CT-e',
				align: 'right',
				filterable: true
			},{
				flex: 1,
				dataIndex: 'cte_numero',
				text: 'Número',
				tooltip: 'Número do CT-e',
				align: 'right',
				filterable: true
			},{
				flex: 1,
				dataIndex: 'cte_minuta',
				text: 'Minuta',
				tooltip: 'Número da minuta ou ordem de coleta',
				align: 'right',
				filterable: true
			},{
				flex: 1,
				xtype: 'datecolumn',
				dataIndex: 'cte_data_hora_emissao',
				text: 'Emitido em',
				format: 'D d/m/Y H:i',
				tooltip: 'Data/Hora da emissão do CT-e',
				align: 'right',
				filterable: true
			},{
				flex: 1,
				dataIndex: 'cte_tipo_carteira',
				text: 'Cobrança',
				tooltip: 'Tipo de carteria para cobrança',
				align: 'center',
				filter: {
					type: 'list',
					options: ['BANCARIA','INTERNA','TERCEIRIZADA']
				}
			},{
				flex: 1,
				dataIndex: 'cte_valor_total',
				text: 'Valor',
				tooltip: 'Valor total do conhecimento',
				align: 'right',
				filterable: true,
				summaryType: 'sum',
				summaryRenderer: Ext.util.Format.brMoney,
				renderer: Ext.util.Format.brMoney
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: ['->',{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: ['tom_razao_social']
				}]
			}]
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Financeiro.Receber.Devedor.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.contasreceberdevedorgrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name:'empresa', type:'string', defaultValue:''},
				{name:'list_id', type:'string', defaultValue:''},
				{name:'devedor_razao_social', type:'string', defaultValue:''},
				{name:'valor_ctes', type:'float', defaultValue:0},
				{name:'valor_original', type:'float', defaultValue:0},
				{name:'total_vencer', type:'float', defaultValue:0},
				{name:'total_hoje', type:'float', defaultValue:0},
				{name:'total_atrasado', type:'float', defaultValue:0},
				{name:'total_recebido', type:'float', defaultValue:0}
			],
			autoLoad: true,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/financeiro/receber/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_devedor'
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
			
			groupField: 'empresa',
			sorters: [{
				property: 'devedor_razao_social',
				direction: 'ASC'
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
	        	local: true,
	        	filters: [{
	        		dataIndex: 'devedor_razao_social',
	        		type: 'string'
	        	},{
	        		dataIndex: 'valor_ctes',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'valor_original',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'total_vencer',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'total_hoje',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'total_atrasado',
	        		type: 'numeric'
	        	},{
	        		dataIndex: 'total_recebido',
	        		type: 'numeric'
	        	}]
	        },{
				ftype: 'groupingsummary',
				groupHeaderTpl: '{name}',
				hideGroupedHeader: true,
				enableGroupingMenu: false
			}],
			columns: [{
				dataIndex: 'devedor_razao_social',
				text: 'Cliente',
				tooltip: 'Nome do cliente devedor',
				width: 450,
				summaryType: 'count',
				summaryRenderer: function(value, summaryData, dataIndex) {
					return ((value === 0 || value > 1) ? '(' + value + ' Clientes)' : '(1 Cliente)');
				}
			},{
				text: 'Títulos e Recebido',
				columns: [{
					dataIndex: 'valor_ctes',
					text: 'Conhecimentos',
					tooltip: 'Valor total dos conhecimentos no faturamento',
					align: 'right',
					width: 130,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'valor_original',
					text: 'RECEBER',
					tooltip: 'Valor original do título no faturamento',
					align: 'right',
					width: 130,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'total_recebido',
					text: 'RECEBIDO',
					tdCls: 'greencol',
					tooltip: 'Valor total recebido do cliente até hoje',
					align: 'right',
					width: 130,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney
				}]
			},{
				text: 'Pendentes',
				columns: [{
					dataIndex: 'total_hoje',
					text: 'HOJE',
					tdCls: 'yellowcol',
					tooltip: 'Valor total com vencimento para hoje',
					align: 'right',
					width: 130,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'total_atrasado',
					text: 'ATRASADO',
					tdCls: 'redcol',
					tooltip: 'Valor total dos títulos em atraso',
					align: 'right',
					width: 130,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney
				},{
					dataIndex: 'total_vencer',
					text: 'À VENCER',
					tdCls: 'bluecol',
					tooltip: 'Valor total dos tíutlo à vencer',
					align: 'right',
					width: 130,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney
				}]
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: ['->',{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: ['devedor_razao_social']
				}]
			}]
		});
		
		me.callParent(arguments);
	}
});

Ext.define('Financeiro.Receber.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.contasrecebergrid',
	
	initComponent: function() {
		var me = this, statusRenderer = function(value, metaData, record) {
			switch (record.get('situacao_fatura')) {
				default: metaData.tdCls = 'bluecol'; break;
				case 'RECEBER HOJE': metaData.tdCls = 'yellowcol'; break;
				case 'RECEBIDO NO PRAZO': metaData.tdCls = 'greencol'; break;
				case 'RECEBIDO EM ATRASO': case 'EM ATRASO': metaData.tdCls = 'redcol'; break;
			}
			metaData.tdAttr = 'data-qtip="' + record.get('situacao') + ' ' + record.get('situacao_fatura') + ' - Conhecimentos: ' + record.get('lista_ctes') + '"';
			return value;
		};
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Financeiro.Receber.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteFilter: true,
			remoteGroup: false,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/financeiro/receber/php/response.php',
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
			/*plugins: Ext.create('Ext.grid.plugin.CellEditing', {
				clicksToEdit: 1,
				listeners: {
					beforeedit: function(editor, e) {
						return e.record.get('situacao_fatura').search(new RegExp("RECEBIDO", "gi")) < 0;
					},
					edit: function(editor, e) {
						Ext.Ajax.request({
							url: 'mod/financeiro/receber/php/response.php',
							method: 'post',
							params: {
								m: 'save_receber',
								field: e.field,
								value: e.value,
								id: e.record.get('id')
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								e.record.reject();
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.commit();
								} else {
									App.warning(o);
								}
							}
						});
					}
				}
			}),*/
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
				text: 'Dados do cliente devedor',
				columns: [{
					dataIndex: 'devedor_razao_social',
					text: 'Cliente',
					tooltip: 'Nome do cliente devedor',
					width: 300,
					sortable: true,
					renderer: function(value, metaData, record) {
						if (!Ext.isEmpty(record.get('devedor_nome_fantasia'))) {
							metaData.tdAttr = 'data-qtip="' + record.get('devedor_nome_fantasia') + '"';
						}
						return value;
					}
				},{
					dataIndex: 'devedor_cpf_cnpj',
					text: 'CPF/CNPJ',
					tooltip: 'CPF ou CNPJ do cliente devedor',
					align: 'right',
					width: 100,
					sortable: false
				},{
					dataIndex: 'devedor_endereco',
					text: 'Endereço',
					tooltip: 'Endereço de cobrança do cliente devedor',
					width: 600,
					hidden: true,
					sortable: false
				},{
					dataIndex: 'devedor_telefone',
					text: 'Telefones',
					tooltip: 'Telefones para contato do cliente devedor',
					width: 160,
					hidden: true,
					sortable: false
				},{
					dataIndex: 'cliefat_status_cobranca',
					text: 'Situação',
					tooltip: 'Situação atual referente a cobrança do cliente',
					align: 'center',
					width: 70,
					sortable: true,
					renderer: function(value, metaData, record) {
						var tooltip = 'Faturar';
						metaData.tdCls = 'bluecol'; 
						if (value == 'I') {
							tooltip = 'Inadimplente';
							metaData.tdCls = 'redcol'; 
						} else if (value == 'N') {
							tooltip = 'Não faturar';
							metaData.tdCls = 'yellowcol'; 
						} else if (value == 'R') {
							tooltip = 'Recibo';
							metaData.tdCls = 'greencol'; 
						}
						metaData.tdAttr = 'data-qtip="' + tooltip + '"';
						return value;
					}
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
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 99999999999.99
					}
				},{
					xtype: 'datecolumn',
					dataIndex: 'vence_em',
					text: 'Vencimento',
					format: 'D d/m/Y',
					tooltip: 'Data do vencimento da fatura',
					align: 'right',
					width: 120,
					sortable: true,
					editor: {
						xtype: 'datefield',
						format: 'd/m/Y',
						allowBlank: false,
						selectOnFocus: true
					}
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
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 99999999999.99
					}
				},{
					xtype: 'datecolumn',
					dataIndex: 'recebido_em',
					text: 'Recebido em',
					format: 'D d/m/Y',
					tooltip: 'Data do recebimento da fatura pelo cliente devedor',
					align: 'right',
					width: 120,
					sortable: true,
					editor: {
						xtype: 'datefield',
						format: 'd/m/Y',
						selectOnFocus: true
					}
				},{
					dataIndex: 'valor_multa',
					text: 'Multa',
					tooltip: 'Valor da multa por atraso do pagamento',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 99999999.99
					}
				},{
					dataIndex: 'valor_juros',
					text: 'Juros',
					tooltip: 'Valor do juros por atraso do pagamento',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 99999999.99
					}
				},{
					dataIndex: 'valor_acrescimo',
					text: 'Acréscimo',
					tooltip: 'Valor de acréscimo na baixa do recebimento na fatura',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 99999999.99
					}
				},{
					dataIndex: 'valor_desconto',
					text: 'Desconto',
					tooltip: 'Valor de desconto na baixa do recebimento na fatura',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 99999999.99
					}
				},{
					dataIndex: 'valor_abatimento',
					text: 'Abatimento',
					tooltip: 'Valor de abatimento referente ao crédito do cliente devedor',
					align: 'right',
					width: 90,
					sortable: true,
					renderer: Ext.util.Format.brMoney,
					editor: {
						xtype: 'decimalfield',
						minValue: 0,
						maxValue: 99999999.99
					}
				},{
					dataIndex: 'tipo_carteira',
					text: 'Tipo de Carteira',
					tooltip: 'Cobrança terceirizada',
					align: 'center',
					sortable: true,
					width: 100,
					editor: {
						xtype: 'localcombo',
						options: ['BANCARIA','INTERNA','TERCEIRIZADA'],
						allowBlank: false
					}
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
					sortable: false,
					editor: {
						xtype: 'checkboxfield',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					dataIndex: 'email_enviado',
					text: 'E-mail',
					tooltip: 'E-mail de cobrança foi enviado?',
					align: 'center',
					trueText: 'Sim',
					falseText: 'Não',
					width: 60,
					sortable: false,
					editor: {
						xtype: 'checkboxfield',
						inputValue: 1
					}
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
					},
					editor: {
						xtype: 'textareafield',
						grow: true,
						selectOnFocus: true
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
					},
					editor: {
						xtype: 'textareafield',
						grow: true,
						selectOnFocus: true
					}
				}]
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					sortable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					sortable: true
				},{
					dataIndex: 'alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					sortable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					sortable: true
				},{
					dataIndex: 'versao',
					text: 'Alterações',
					tooltip: 'Quantidade de alterações afetadas no registro',
					align: 'right',
					width: 100,
					sortable: true
				}]
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Faturar',
					tooltip: 'Listar conhecimentos em aberto para faturamento do cliente tomador',
					handler: function() {
						me.onFaturar();
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
					tooltip: 'Excluir faturamento selecionado',
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
							url: 'mod/financeiro/receber/php/response.php',
							method: 'post',
							params: {
								m: 'delete_receber',
								id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'-',{
					text: 'Duplicata',
					itemId: 'duplicata-btn',
					iconCls: 'icon-file-pdf',
					tooltip: 'Emitir extrato de conferência do faturamento',
					disabled: true,
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						if (selections.length != 1) {
							App.manyRecordsSelected();
							return false;
						}
						var record = selections[0], originalText = btn.getText();
						if (record.get('cliefat_status_cobranca') != 'F' || record.get('tipo_carteira') != 'BANCARIA') {
							return false;
						}
						btn.setText('Gerando PDF...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/financeiro/receber/php/response.php',
							method: 'post',
							params: {
								m: 'gerar_duplicata',
								id: record.get('id')
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								var o = Ext.decode(response.responseText);
								
								btn.setDisabled(false);
								btn.setText(originalText);
								
								if (o.success) {
									var popup = window.open(o.pdf);
									if (!popup) {
										Ext.create('Ext.ux.Alert', {
											ui: 'black-alert',
											msg: 'Sua duplicata foi gerada com sucesso no formato PDF. Porém o sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para evitar futuras mensagens, por gentileza adicione esse site na lista de excessões de seu navegador.',
											buttons: [{
												ui: 'red-button',
												text: 'ABRIR PDF',
												href: o.pdf
											}]
										});
									}
									record.set('pdf_duplicata', o.pdf);
								} else {
									App.warning(o);
								}
							}
						});
					}
				},'-',{
					text: 'Baixa em lote',
					iconCls: 'icon-checkmark',
					handler: function() {
						var win = Ext.create('Ext.ux.Window', {
							ui: 'blue-window-active',
							title: 'Baixa em lote - Contas à Receber',
							width: 480,
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
									hideLabel: true,
									labelAlign: 'top',
									anchor: '100%',
									layout: {
										type: 'hbox',
										defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
									},
									defaults: {
										flex: 1,
										format: 'd/m/Y',
										labelAlign: 'top',
										allowBlank: false,
										selectOnFocus: true
									},
									defaultType: 'datefield'
								},
								defaultType: 'fieldcontainer',
								items: [{
									items: [{
										fieldLabel: 'Vencimentos que iniciam em',
										vtype: 'daterange',
										name: 'vencimento_em',
										itemId: 'vencimento_em',
										endDateField: 'vencimento_ate'
									},{
										fieldLabel: 'Vencimentos que terminam em',
										vtype: 'daterange',
										name: 'vencimento_ate',
										itemId: 'vencimento_ate',
										startDateField: 'vencimento_em'
									}]
								},{
									items: [{
										fieldLabel: 'Definir data do recebimento',
										name: 'recebido_em',
										emptyText: 'Em branco para data de recebimento igual do vencimento',
										value: new Date(),
										allowBlank: true
									}]
								}],
								buttons: [{
									ui: 'blue-button',
									text: 'BAIXAR',
									scale: 'medium',
									formBind: true,
									handler: function(btn) {
										var form = this.up('form').getForm(), 
										originalText = btn.getText();
										btn.setText('BAIXANDO...');
										btn.setDisabled(true);
										form.submit({
											clientValidation: true,
											url: 'mod/financeiro/receber/php/response.php',
											method: 'post',
											params: {
												m: 'baixa_emlote'
											},
											failure: Ext.Function.createSequence(App.formFailure, function() {
												btn.setDisabled(false);
												btn.setText(originalText);
											}),
											success: function(f, a) {
												btn.setDisabled(false);
												btn.setText(originalText);
												win.close();
											}
										});
									}
								}]
							}
						});
					}
				},'-',{
					text: 'Relatório',
					iconCls: 'icon-book',
					handler: function() {
						Ext.create('Ext.ux.Window', {
							ui: 'blue-window-active',
							title: 'Relatório - Contas à Receber',
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
									text: 'GERAR RELATÓRIO',
									formBind: true,
									disabled: true,
									handler: function(btn) {
										var form = btn.up('form').getForm(),
										originalText = btn.getText();
										if (!form.isValid()) {
											return false;
										}
										btn.setText('Gerando...');
										btn.setDisabled(true);
										form.submit({
											clientValidation: true,
											url: 'mod/financeiro/receber/php/response.php',
											method: 'post',
											params: {
												m: 'relatorio'
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
					text: 'Exportar DOCCOB',
					iconCls: 'icon-file-css',
					tooltip: 'Exportar faturamentos para o formato DOCCOB',
					handler: function() {
						var win = Ext.create('Ext.ux.Window', {
							title: 'Exportar para o formato DOCCOB (txt)',
							width: 390,
							height: 245,
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
									xtype: 'clientecombo',
									fieldLabel: 'Informe cliente para exportação',
									name: 'clie_id'
								},{
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
											url: 'mod/financeiro/receber/php/response.php',
											method: 'post',
											params: {
												m: 'export_doccob'
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
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					var view = me.up('financeiroreceberpanel'),
					eastPanel = view.down('#east-panel'),
					grid1 = eastPanel.down('contasreceberctegrid'),
					editForm = eastPanel.down('#edit-form'),
					mailForm = eastPanel.down('#email-form'),
					btn1 = me.down('#delete'), 
					btn2 = me.down('#duplicata-btn');
					if (selections.length === 1) {
						var record = selections[0], disabled = record.get('situacao_fatura').search(new RegExp("RECEBIDO","gi")) > -1;
						btn1.setDisabled(disabled);
						btn2.setDisabled(disabled && !Ext.isEmpty(record.get('pdf_duplicata')) && record.get('cliefat_status_cobranca') != 'F' && record.get('tipo_carteira') != 'BANCARIA');
						grid1.setCtaRecId(record.get('id'));
						grid1.setTitle(record.get('id') + '# ' + record.get('doc_fatura') + ' - CONHECIMENTOS FATURADOS');
						editForm.setDisabled(false);
						editForm.loadRecord(record);
						editForm.setTitle(record.get('id') + '# ' + record.get('doc_fatura') + ' - EDITAR');
						
						var message = '<span style="font-family: \'Segoe UI\', \'Open Sans\', Verdana, Arial, Helvetica, sans-serif; font-size: 11pt; font-weight: 300; line-height: 20px;">'
						+ 'Prezado cliente,'
						+ '<br/><br/>'
						+ 'Segue fatura em anexa com data de vencimento na ' + Ext.Date.format(record.get('vence_em'), 'l d/m/Y') + ' (' + record.get('situacao_fatura') + ').'
						+ '<br/><br/>'
						+ 'Detalhes:'
						+ '<br/><br/>'
						+ 'Sacado<br/>CNPJ/CPF' + record.get('devedor_cpf_cnpj') + ' - ' + record.get('devedor_razao_social')
						+ '<br/><br/>'
						+ 'Obs.: Qualquer problema, contate a equipe do Financeiro ' + App.empresa.emp_nome_fantasia + ', que está à sua disposição através do e-mail <a href="mailto:' + App.empresa.emp_email_comercial + '">' + App.empresa.emp_email_comercial + '</a> ou do telefone ' + App.empresa.emp_fone1
						+ '<br/><br/>'
						+ 'Atenciosamente,<br/><br/>Equipe ' + App.empresa.emp_nome_fantasia
						+ '</span><br/>'
						+ '<img style="width:230px; height:auto;" src="' + App.empresa.logo_url + '"/>'
						+ '<p style="font-family: \'Segoe UI\', \'Open Sans\', Verdana, Arial, Helvetica, sans-serif; font-size: 8pt; font-weight: 300; line-height: 20px;">Este email foi enviado pelo sistema ' + App.projeto + '<br/>EMAIL AUTOMÁTICO, NÃO RESPONDA ESSA MENSAGEM</p>';
						
						mailForm.setDisabled(false);
						mailForm.loadRecord(record);
						mailForm.setTitle(record.get('email_enviado') ? 'ESTE CLIENTE JÁ RECEBEU E-MAIL ANTERIORMENTE. <span class="blink">E-MAIL JÁ ENVIADO</span>' : 'Enviar e-mail de cobrança para ' + record.get('devedor_razao_social'));
						mailForm = mailForm.getForm();
						mailForm.findField('email_to').setValue(record.get('cliefat_email'));
						mailForm.findField('email_subject').setValue('FATURA ' + record.get('doc_fatura') + ' ' + record.get('situacao_fatura') + ' - ID #' + record.get('id'));
						mailForm.findField('email_attach').setValue('<a href="' + record.get('pdf_duplicata') + '" target="_blank">Anexo: FATURA ' + record.get('doc_fatura') + '</a>');
						mailForm.findField('email_message').setValue(message);
					} else if (selections.length > 1) {
						var exclude = 0;
						Ext.each(selections, function(record) {
							if (record.get('situacao_fatura').search(new RegExp("RECEBIDO", "gi"))  < 0) {
								exclude ++;
							}
						});
						if (exclude > 0) {
							btn1.setDisabled(false);
							btn1.setText('Excluir (' + exclude + ')');
						} else {
							btn1.setText('Excluir');
							btn1.setDisabled(true);
						}
						btn2.setDisabled(true);
					} else {
						btn1.setText('Excluir');
						btn1.setDisabled(true);
						btn2.setDisabled(true);
						grid1.setCtaRecId(0);
						grid1.setTitle('CONHECIMENTOS FATURADOS');
						editForm.getForm().reset();
						editForm.setDisabled(true);
						editForm.setTitle('Editar faturamento em aberto');
						mailForm.getForm().reset();
						mailForm.setDisabled(true);
					}
				}
			}
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
	},
	
	onFaturar: function() {
		var mainStore = this.getStore(),
		win, dToday = new Date(), 
		dHoje = {
			data: dToday, 
			dia: parseInt(dToday.getDate()),
			semana: parseInt(dToday.getDay())
		}, 
		dPeriodo = {
			inicial: dToday, 
			final: dToday
		};
		
		var segunda = 1;
		if (dHoje.semana != segunda) {
			var diff = dHoje.semana - segunda;
			if (diff > 0) {
				diff *= -1;
			}
			dPeriodo.inicial = Ext.Date.add(dToday, Ext.Date.DAY, diff);
		}
		
		if (App.empresa.emp_faturamento == 'SEMANAL') {
			dPeriodo.final = Ext.Date.add(dPeriodo.inicial, Ext.Date.DAY, 7);
		} else if (App.empresa.emp_faturamento == 'QUINZENAL') {
			dPeriodo.final = Ext.Date.add(dPeriodo.inicial, Ext.Date.DAY, 15);
		} else if (App.empresa.emp_faturamento == 'MENSAL') {
			dPeriodo.inicial.setDate(1);
			dPeriodo.final = new Date(dPeriodo.inicial.getFullYear(), dPeriodo.inicial.getMonth() + 1, 0);
		} else {
			if (dHoje.dia < 11) {
				dPeriodo.inicial.setDate(1);
				dPeriodo.final.setDate(10);
			} else if (dHoje.dia > 10 && dHoje.dia < 21) {
				dPeriodo.inicial.setDate(11);
				dPeriodo.final.setDate(20);
			} else {
				dPeriodo.inicial.setDate(21);
				dPeriodo.final = new Date(dPeriodo.inicial.getFullYear(), dPeriodo.inicial.getMonth() + 1, 0);
			}
		}
		
		var sumRecords = function(records) {
			var form = win.down('#form-south').getForm(),
			bField = form.findField('valor_total_bancaria'),
			iField = form.findField('valor_total_interna'),
			tField = form.findField('valor_total_terceirizada'),
			gField = form.findField('valor_total_geral');
			 
			var tipo, value = bValue = iValue = tValue = gValue = 0;
			
			if (!Ext.isEmpty(records) && Ext.isArray(records)) {
				Ext.each(records, function(record) {
					if (record.get('cte_faturado')) {
						tipo = record.get('cte_tipo_carteira');
						value = record.get('cte_valor_total');
						if (tipo == 'INTERNA') {
							iValue += value;
						} else if (tipo == 'TERCEIRIZADA') {
							tValue += value;
						} else {
							bValue += value;
						}
						gValue += value;
					}
				});
			}
			
			bField.setValue(Ext.util.Format.brMoney(bValue));
			iField.setValue(Ext.util.Format.brMoney(iValue));
			tField.setValue(Ext.util.Format.brMoney(tValue));
			gField.setValue(Ext.util.Format.brMoney(gValue));
		}, store = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name:'cte_id', type:'int', defaultValue:0},
				{name:'cte_serie', type:'int', defaultValue:0},
				{name:'cte_minuta', type:'int', defaultValue:0},
				{name:'cte_numero', type:'string', defaultValue:''},
				{name:'cte_valor_total', type:'float', defaultValue:0},
				{name:'cte_faturado', type:'boolean', defaultValue:false},
				{name:'clie_tomador_id', type:'int', defaultValue:0},
				{name:'tom_razao_social', type:'string', defaultValue:''},
				{name:'cte_tipo_carteira', type:'string', defaultValue:'BANCARIA'},
				{name:'cte_data_hora_emissao', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue: new Date()}
			],
			autoLoad: true,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			listeners: {
				load: function(self, records) {
					sumRecords(records || null);
				},
				beforeload: function() {
					var params = this.getProxy().extraParams;
					return !Ext.isEmpty(params.periodo_inicial) && !Ext.isEmpty(params.periodo_final);
				}
			},
			
			proxy: {
				type: 'ajax',
				url: 'mod/financeiro/receber/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_ctes',
					clie_tomador_id: 0,
					periodo_inicial: Ext.Date.format(dPeriodo.inicial, 'd/m/Y'),
					periodo_final: Ext.Date.format(dPeriodo.final, 'd/m/Y')
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
			
			groupField: 'tom_razao_social',
			sorters: [{
				property: 'cte_id',
				direction: 'DESC'
			}]
		});
		
		win = Ext.create('Ext.ux.Window', {
			ui: 'green-window-active',
			title: 'Faturamento - Contas à Receber',
			width: 800,
			height: 600,
			autoShow: true,
			closable: true,
			minimizable: false,
			maximizable: true,
			maximized: true,
			boder: false,
			bodyBorder: false,
			layout: 'border',
			items: [{
				itemId: 'form-north',
				xtype: 'form',
				region: 'north',
				split: false,
				collapsed: false,
				collapsible: false,
				border: false,
				bodyBorder: false,
				bodyPadding: 10,
				height: 100,
				layout: {
					type: 'hbox',
					defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
				},
				defaults: {
					flex: 1,
					labelAlign: 'top',
					selectOnFocus: true,
					listeners: {
						specialkey: function(f, e) {
							if (e.getKey() == e.ENTER) {
								f.up('form').down('#buscar-btn').click();
							}
						}
					}
				},
				defaultType: 'textfield',
				items: [{
					flex: 2,
					xtype: 'clientecombo',
					fieldLabel: 'Se necessário, informe o tomador',
					name: 'clie_tomador_id',
					itemId: 'clie_tomador_id'
				},{
					xtype: 'bancocombo',
					fieldLabel: 'Conta para recebimento',
					emptyText: 'Em branco para padrão',
					name: 'bco_id',
					itemId: 'bco_id',
					allowBlank: true
				},{
					xtype: 'datefield',
					fieldLabel: 'Período inicial',
					format: 'd/m/Y',
					vtype: 'daterange',
					name: 'periodo_inicial',
					itemId: 'periodo_inicial',
					endDateField: 'periodo_final',
					allowBlank: false,
					listeners: {
						specialkey: function(f, e) {
							if (e.getKey() == e.ENTER) {
								f.up('form').down('#buscar-btn').click();
							}
						},
						afterrender: function(field) {
							window.setTimeout(function(){
								field.setValue(dPeriodo.inicial);
							}, 1000);
						}
					}
				},{
					xtype: 'datefield',
					fieldLabel: 'Período final',
					format: 'd/m/Y',
					vtype: 'daterange',
					name: 'periodo_final',
					itemId: 'periodo_final',
					startDateField : 'periodo_inicial',
					checkChangeEvents: ['change'],
					allowBlank: false,
					listeners: {
						specialkey: function(f, e) {
							if (e.getKey() == e.ENTER) {
								f.up('form').down('#buscar-btn').click();
							}
						},
						afterrender: function(field) {
							window.setTimeout(function(){
								field.setValue(dPeriodo.final);
							}, 1000);
						},
						change: function(field, newValue) {
							var form = field.up('form').getForm();
							form.findField('vencimento').setValue(Ext.Date.add(newValue, Ext.Date.DAY, App.empresa.emp_dias_vecto));
						}
					}
				},{
					xtype: 'datefield',
					fieldLabel: 'Vencimento da fatura',
					name: 'vencimento',
					itemId: 'vencimento',
					format: 'd/m/Y',
					value: Ext.Date.add(dPeriodo.final, Ext.Date.DAY, App.empresa.emp_dias_vecto),
					allowBlank: false
				}],
				buttons: [{
					itemId: 'buscar-btn',
					text: 'Buscar',
					formBind: true,
					handler: function() {
						var btn = this, originalText = btn.getText(), form = btn.up('form').getForm(), proxy = store.getProxy();
						proxy.setExtraParam('clie_tomador_id', form.findField('clie_tomador_id').getValue());
						proxy.setExtraParam('periodo_inicial', form.findField('periodo_inicial').getValue());
						proxy.setExtraParam('periodo_final', form.findField('periodo_final').getValue());
						btn.setText('Buscando...');
						btn.setDisabled(true);
						store.load({
							callback: function() {
								btn.setDisabled(false);
								btn.setText(originalText);
							}
						});
					}
				}]
			},{
				xtype: 'grid',
				region: 'center',
				title: 'Conhecimentos em aberto',
				store: store,
				plugins: Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit: 1,
					listeners: {
						edit: function(editor, e) {
							sumRecords(store.data.items || null);
						}
					}
				}),
				features: [{
					ftype: 'filters',
	        		local: true
				},{
					ftype: 'groupingsummary',
					groupHeaderTpl: '{name}',
					hideGroupedHeader: true,
					enableGroupingMenu: false
				}],
				columns: [{
					flex: 1,
					dataIndex: 'cte_id',
					tdCls: 'x-grid-cell-special',
					text: 'ID',
					align: 'right',
					filterable: true
				},{
					flex: 1,
					dataIndex: 'cte_serie',
					text: 'Série',
					tooltip: 'Série do CT-e',
					align: 'right',
					filterable: true
				},{
					flex: 1,
					dataIndex: 'cte_numero',
					text: 'Número',
					tooltip: 'Número do CT-e',
					align: 'right',
					filterable: true
				},{
					flex: 1,
					dataIndex: 'cte_minuta',
					text: 'Minuta',
					tooltip: 'Número da minuta ou ordem de coleta',
					align: 'right',
					filterable: true
				},{
					flex: 1,
					xtype: 'datecolumn',
					dataIndex: 'cte_data_hora_emissao',
					text: 'Emitido em',
					format: 'D d/m/Y H:i',
					tooltip: 'Data/Hora da emissão do CT-e',
					align: 'right',
					filterable: true
				},{
					flex: 1,
					dataIndex: 'cte_tipo_carteira',
					text: 'Cobrança',
					tooltip: 'Tipo de carteria para cobrança',
					align: 'center',
					filter: {
						type: 'list',
						options: ['BANCARIA','INTERNA','TERCEIRIZADA']
					}
				},{
					flex: 1,
					dataIndex: 'cte_valor_total',
					text: 'Valor',
					tooltip: 'Valor total do conhecimento',
					align: 'right',
					filterable: true,
					summaryType: 'sum',
					summaryRenderer: Ext.util.Format.brMoney,
					renderer: Ext.util.Format.brMoney
				},{
					flex: 1,
					xtype: 'booleancolumn',
					dataIndex: 'cte_faturado',
					text: 'Faturar',
					align: 'center',
					trueText: 'Sim',
					falseText: 'Não',
					filterable: true,
					editor: {
						xtype: 'checkboxfield',
						inputValue: 1
					}
				}]
			},{
				itemId: 'form-south',
				xtype: 'form',
				region: 'south',
				split: false,
				collapsed: false,
				collapsible: false,
				border: false,
				bodyBorder: false,
				bodyPadding: 10,
				height: 60,
				layout: {
					type: 'hbox',
					defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
				},
				defaults: {
					flex: 1,
					labelAlign: 'top',
					readOnly: true,
					selectOnFocus: true,
					value: Ext.util.Format.brMoney(0),
					fieldStyle: {
						textAlign: 'right',
						fontSize: '14px'
					}
				},
				defaultType: 'displayfield',
				items: [{
					fieldLabel: 'TOTAL BANCÁRIA',
					name: 'valor_total_bancaria',
					itemId: 'valor_total_bancaria'
				},{
					fieldLabel: 'TOTAL INTERNA',
					name: 'valor_total_interna',
					itemId: 'valor_total_interna'
				},{
					fieldLabel: 'TOTAL TERCEIRIZADA',
					name: 'valor_total_terceirizada',
					itemId: 'valor_total_terceirizada'
				},{
					fieldLabel: 'TOTAL GERAL',
					name: 'valor_total_geral',
					itemId: 'valor_total_geral',
					fieldStyle: {
						textAlign: 'right',
						fontSize: '14px',
						fontWeight: 'bold'
					}
				}]
			}],
			buttons: [{
				text: 'FATURAR',
				scale: 'medium',
				handler: function(btn) {
					var form = win.down('#form-north').getForm(),
					vencimento = Ext.Date.format(form.findField('vencimento').getValue(), 'd/m/Y');
					if (Ext.isEmpty(vencimento)) {
						return false;
					}
					var ids = [];
					store.clearFilter();
					store.each(function(record) {
						if (record.get('cte_faturado')) {
							ids.push(record.get('cte_id'));
						}
					});
					if (!ids.length) {
						return false;
					}
					var originalText = btn.getText();
					btn.setText('FATURANDO...');
					btn.setDisabled(true);
					Ext.Ajax.request({
						url: 'mod/financeiro/receber/php/response.php',
						method: 'post',
						params: {
							m: 'faturar',
							vencimento: vencimento,
							list_id: ids.join(','),
							bco_id: form.findField('bco_id').getValue()
						},
						failure: Ext.Function.createSequence(App.ajaxFailure, function(){
							btn.setDisabled(false);
							btn.setText(originalText);
						}),
						success: function(response) {
							var o = Ext.decode(response.responseText);
							
							btn.setDisabled(false);
							btn.setText(originalText);
							
							if (o.success) {
								/*if (!Ext.isEmpty(o.pdf) && Ext.isArray(o.pdf)) {
									var popup;
									Ext.each(o.pdf, function(file){
										popup = window.open(file);
										if (!popup) {
											Ext.create('Ext.ux.Alert', {
												ui: 'black-alert',
												msg: 'Sua duplicata foi gerada com sucesso no formato PDF. Porém o sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para evitar futuras mensagens, por gentileza adicione esse site na lista de excessões de seu navegador.',
												buttons: [{
													ui: 'red-button',
													text: 'ABRIR PDF',
													href: file
												}]
											});
										}									
									});
								}*/
								mainStore.load({params: {id: o.list_id}});
								win.close();
							} else {
								App.warning(o);
							}
						}
					});
				}
			}]
		});
	}
});