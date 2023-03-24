Ext.define('Permissao.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.permissaogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Permissao.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sistema/permissoes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_permissoes'
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
				property: 'perm_grupo',
				direction: 'ASC'
			}]
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 1,
			listeners: {
				edit: function(editor, e) {
					Ext.Ajax.request({
						url: 'mod/sistema/permissoes/php/response.php',
						method: 'post',
						params: Ext.applyIf({
							m: 'save_permissoes'
						}, e.record.data),
						failure: App.ajaxFailure,
						success: function(response) {
							var o = Ext.decode(response.responseText);
							if (o.success) {
								e.record.set('perm_id', o.perm_id);
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
			enableColumnMove: false,
			enableColumnResize: false,
			emptyText: 'Nenhum item encontrado',
			plugins: [me.editing],
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			columns: [{
				dataIndex: 'perm_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				locked: true,
				menuDisabled: true,
				width: 70
			},{
				dataIndex: 'perm_grupo',
				text: 'Grupo',
				locked: true,
				menuDisabled: true,
				width: 200,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 40
				}
			},{
				text: 'Acesso ao menu Sistema',
				menuDisabled: true,
				columns: [{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_empresas',
					text: 'Empresas',
					tooltip: 'Empresas',
					menuDisabled: false,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_usuarios',
					text: 'Usuários',
					tooltip: 'Usuários',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_permissoes',
					text: 'Permissões',
					tooltip: 'Grupo de permissões (grupo de usuários)',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_log_eventos',
					text: 'Log de Eventos',
					tooltip: 'Log do Sistema',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				}]
			},{
				text: 'Acesso ao menu Conhecimentos',
				menuDisabled: true,
				columns: [{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_gerenciar_cte',
					text: 'Gerenciar CT-e',
					tooltip: 'Gerenciar CT-e',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_consulta_inutilizacoes',
					text: 'Consultar Inutilizados',
					tooltip: 'Consultar Inutilizações neste Software',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_inutilizar_cte',
					text: 'Inutilizar CT-e',
					tooltip: 'Inutilizar faixa de numeração',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_composicao_frete',
					text: 'Composição Frete',
					tooltip: 'Composição do Frete: Campos que farão ou não parte do frete',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_composicao_calculo',
					text: 'Composição Cálculo',
					tooltip: 'Composição do Cálculo: Quais campos da tabela Composição de frete farão parte do cálculo.',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				}]
			},{
				text: 'Acesso ao menu Cadastros',
				menuDisabled: true,
				columns: [{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_clientes',
					text: 'Clientes',
					tooltip: 'Clientes',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_municipios',
					text: 'Cidades',
					tooltip: 'Localidades (Municípios)',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_grupo_tarifas',
					text: 'Grupo Tarifas',
					tooltip: 'Grupo de tarifas Geral e Específicas usada na tabela de produtos',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_iata_imp_codes',
					text: 'Códigos IATA',
					tooltip: 'Códigos de Produtos perigosos: Interline Message Procedure',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_produtos',
					text: 'Produtos',
					tooltip: 'Produtos',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_rotas_entregas',
					text: 'Rotas Entregas',
					tooltip: 'Rotas de Entregas',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_ocorrencias',
					text: 'Ocorrências',
					tooltip: 'Ocorrências',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_bancos',
					text: 'Bancos',
					tooltip: 'Bancos',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_praca_pagamento',
					text: 'Praça Pagamento',
					tooltip: 'Praças de Pagamento, utilizadas na impressão de boletos bancários',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_cfop',
					text: 'Códigos CFOP',
					tooltip: 'Tabela de CFOP - CÓDIGOS FISCAIS DE OPERAÇÕES E PRESTAÇÕES',
					width: 150,
					menuDisabled: true,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				}]
			},{
				text: 'Acesso ao menu Tabelas',
				menuDisabled: false,
				columns: [{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_tab_nacional',
					text: 'Nacional',
					tooltip: 'Tabela Nacional',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_tab_especial',
					text: 'Especial',
					tooltip: 'Tabela Especial',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_tab_minima',
					text: 'Mínima',
					tooltip: 'Tabela Mínima',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_tab_expresso',
					text: 'Expresso',
					tooltip: 'Tabela Expresso Nacional',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				}]
			},{
				text: 'Acesso ao menu Taxas',
				menuDisabled: true,
				columns: [{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_tx_terrestres',
					text: 'Terrestres',
					tooltip: 'Taxas Terrestres',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_tx_redespacho',
					text: 'Redespacho',
					tooltip: 'Taxa de Redespacho Rodoviário',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_tx_seguro_rctrc',
					text: 'Seguro RCTRC',
					tooltip: 'Taxa para Responsabilidade Civil do Transportador Rodoviário Carga',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				}]
			},{
				text: 'Acesso ao menu Financeiro',
				menuDisabled: true,
				columns: [{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_faturamento',
					text: 'Faturamento',
					tooltip: 'Faturamento',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_cta_receber',
					text: 'Contas à Receber',
					tooltip: 'Contas à Receber',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_cta_pagar',
					text: 'Contas à Pagar',
					tooltip: 'Contas à Pagar',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_desconto_taxa_clie',
					text: 'Desc. Taxa Cliente',
					tooltip: 'Desconto sobre taxas por cliente. Taxas da tabela Composição do Frete',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				}]
			},{
				text: 'Acesso ao menu SAC',
				menuDisabled: true,
				columns: [{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_cotacoes',
					text: 'Cotações',
					tooltip: 'Cotações',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_informacoes',
					text: 'Informações',
					tooltip: 'Informações',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_coleta',
					text: 'Minuta de Embarque',
					tooltip: 'Minuta de Embarque',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				},{
					xtype: 'booleancolumn',
					trueText:'Sim', 
					falseText: 'Não',
					align: 'center',
					dataIndex: 'perm_menu_romaneios',
					text: 'Romaneios',
					tooltip: 'Romaneios',
					menuDisabled: true,
					width: 150,
					editor: {
						xtype: 'checkbox',
						inputValue: 1
					}
				}]
			},{
				text: 'Última modificações',
				menuDisabled: true,
				columns: [{
					dataIndex: 'perm_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					menuDisabled: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'perm_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					menuDisabled: true
				},{
					dataIndex: 'perm_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					menuDisabled: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'perm_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					menuDisabled: true
				},{
					dataIndex: 'perm_versao',
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
					text: 'Novo grupo',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Permissao.data.Model'));
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
							if (record.get('perm_id') > 0) {
								id.push(record.get('perm_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/sistema/permissoes/php/response.php',
							method: 'post',
							params: {
								m: 'delete_permissoes',
								perm_id: id.join(',')
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
					fields: ['perm_grupo']
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