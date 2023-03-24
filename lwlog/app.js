Ext.onReady(function() {
	Ext.QuickTips.init();
	Ext.FocusManager.on('componentfocus', function(fm, cmp) {
		if (cmp.isXType('gridview')) {
			var sm = cmp.getSelectionModel();
			if (!sm.hasSelection()) {
				sm.select(0);
			}
		}
	});
	Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
	Ext.EventManager.addListener(Ext.getBody(), 'keydown', function(e){
		var isTextField = new String(e.getTarget().type).search(new RegExp("text", "gi")) >= 0;
		if (!isTextField && e.getKey() == e.BACKSPACE) {
			e.preventDefault();
		}
	});
	
	App.keyMap = new Ext.util.KeyMap({
		target: window,
		binding: [{
			ctrl: true,
			key: Ext.EventObject.F3,
			fn: function() {
				App.toggleKeyboard();
			}
		},{
			ctrl: true,
			key: Ext.EventObject.F1,
			fn: function() {
				App.vp.down('tabpanel').down('#home-tab').down('#cambiobtn').click();
			}
		},{
			ctrl: true,
			key: Ext.EventObject.F2,
			fn: function() {
				App.vp.down('tabpanel').down('#home-tab').down('#telefonebtn').click();
			}
		},{
			ctrl: true,
			alt: true,
			key: Ext.EventObject.L,
			fn: function() {
				Ext.Ajax.request({
					url: 'php/response.php',
					method: 'get',
					params: {m: 'logout'},
					callback: function() {
						App.task.login();
					}
				});
			}
		},{
			ctrl: true,
			alt: true,
			key: Ext.EventObject.S,
			fn: function() {
				window.location = '?logout';
			}
		},{
			key: Ext.EventObject.PAGE_UP,
			fn: function() {
				var cmp = App.vp.down('tabpanel');
				cmp = cmp.getActiveTab();
				if (cmp.getXType() == 'ctesview') {
					cmp = cmp.getActiveTab();
					if (cmp.getXType() == 'cteform') {
						cmp.prevTab();
					}
				}
			}
		},{
			key: Ext.EventObject.PAGE_DOWN,
			fn: function() {
				var cmp = App.vp.down('tabpanel');
				cmp = cmp.getActiveTab();
				if (cmp.getXType() == 'ctesview') {
					cmp = cmp.getActiveTab();
					if (cmp.getXType() == 'cteform') {
						cmp.nextTab();
					}
				}
			}
		}]
	});
	
	/*
	 * Viewport
	 */
	App.vp = Ext.create('Ext.Viewport', {
		layout: 'border',
		items: [{
			region: 'north',
			xtype: 'toolbar',
			items: [{
				text: 'Sistema',
				menu: [{
					text: 'Empresas',
					iconCls: 'icon-menu-userbusiness',
					disabled: App.permissoes.perm_menu_empresas == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('empresaview');
						if (!view) {
							view = tp.add({
								xtype: 'empresaview',
								title: 'Empresas',
								iconCls: 'icon-user-3',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},{
					text: 'Usuários',
					iconCls: 'icon-menu-user',
					disabled: App.permissoes.perm_menu_usuarios == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('usuariogrid');
						if (!view) {
							view = tp.add({
								xtype: 'usuariogrid',
								title: 'Usuários',
								iconCls: 'icon-user',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},{
					text: 'Permissões',
					iconCls: 'icon-menu-lock',
					disabled: App.permissoes.perm_menu_permissoes == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('permissaogrid');
						if (!view) {
							view = tp.add({
								xtype: 'permissaogrid',
								title: 'Permissões',
								iconCls: 'icon-locked',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},'-',{
					text: 'Log do sistema',
					iconCls: 'icon-menu-history',
					disabled: App.permissoes.perm_menu_log_eventos == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('systemlogview');
						if (!view) {
							view = tp.add({
								xtype: 'systemlogview',
								title: 'Log do sistema',
								iconCls: 'icon-history',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				}]
			},{
				text: 'Conhecimentos',
				menu: [{
					text: 'Gerenciar CT-e',
					iconCls: 'icon-menu-cloud',
					tooltip: 'Emitir e consultar conhecimentos existentes',
					disabled: App.permissoes.perm_menu_gerenciar_cte == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('ctesview');
						if (!view) {
							view = tp.add({
								xtype: 'ctesview',
								title: 'Conhecimentos',
								iconCls: 'icon-cloud',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},{
					text: 'Inutilizar CT-e',
					iconCls: 'icon-menu-block',
					tooltip: 'Inutilizar faixa de número de conhecimentos inexistentes',
					disabled: App.permissoes.perm_menu_inutilizar_cte == 0,
					handler: function() {
						Ext.create('CTE.Inutilizar.window', {
							autoShow: true
						});
					}
				},'-',{
					text: 'Componentes',
					iconCls: 'icon-menu-editnotes',
					menu: [{
						text: 'Composição do Frete',
						iconCls: 'icon-menu-pencil',
						disabled: App.permissoes.perm_menu_composicao_frete == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('composicaofretegrid');
							if (!view) {
								view = tp.add({
									xtype: 'composicaofretegrid',
									title: 'Composição do Frete',
									iconCls: 'icon-pencil',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},{
						text: 'Composição do Cálculo',
						iconCls: 'icon-menu-pencil',
						disabled: App.permissoes.perm_menu_composicao_calculo == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('composicaocalculogrid');
							if (!view) {
								view = tp.add({
									xtype: 'composicaocalculogrid',
									title: 'Composição do Cálculo',
									iconCls: 'icon-pencil',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},'-',{
						text: 'Descontos',
						tooltip: 'Gerenciamento de Desconto para Cliente',
						iconCls: 'icon-menu-percentage',
						disabled: App.permissoes.perm_menu_desconto_taxa_clie == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('taxadescontogrid');
							if (!view) {
								view = tp.add({
									xtype: 'taxadescontogrid',
									title: 'Descontos',
									iconCls: 'icon-pushpin',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					}]
				},'-',{
					text: 'Gerenciar MDF-e',
					iconCls: 'icon-menu-cloud',
					tooltip: 'Gerar Manifesto Eletrônico de Documentos Fiscais (MDF-e)',
					disabled: App.empresa.emp_tipo_emitente == 'ND',
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('mdfpanel');
						if (!view) {
							view = tp.add({
								xtype: 'mdfpanel',
								title: 'MDF-e',
								iconCls: 'icon-cloud',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				}]
			},{
				text: 'Cadastros',
				menu: [{
					text: 'Clientes',
					tooltip: 'Gerenciamento da carteira de clientes',
					iconCls: 'icon-menu-userbusiness',
					disabled: App.permissoes.perm_menu_clientes == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('clienteview');
						if (!view) {
							view = tp.add({
								xtype: 'clienteview',
								title: 'Clientes',
								iconCls: 'icon-user-3',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},'-',{
					text: 'Cidades',
					tooltip: 'Gerenciamento dos municípios',
					iconCls: 'icon-menu-building',
					disabled: App.permissoes.perm_menu_municipios == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('cidadeview');
						if (!view) {
							view = tp.add({
								xtype: 'cidadeview',
								title: 'Cidades',
								iconCls: 'icon-pencil',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},'-',{
					text: 'Tabelas',
					iconCls: 'icon-menu-network',
					menu: [{
						text: 'Nacional',
						tooltip: 'Gerenciamento da Tabela Nacional',
						iconCls: 'icon-menu-network',
						disabled: App.permissoes.perm_menu_tab_nacional == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('nacionalview');
							if (!view) {
								view = tp.add({
									xtype: 'nacionalview',
									title: 'Tabela Nacional',
									iconCls: 'icon-sitemap',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},{
						text: 'Especial',
						tooltip: 'Gerenciamento da Tabela Especial',
						iconCls: 'icon-menu-network',
						disabled: App.permissoes.perm_menu_tab_especial == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('especialgrid');
							if (!view) {
								view = tp.add({
									xtype: 'especialgrid',
									title: 'Tabela Especial',
									iconCls: 'icon-sitemap',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},{
						text: 'Mínima',
						tooltip: 'Gerenciamento da Tabela Mínima',
						iconCls: 'icon-menu-network',
						disabled: App.permissoes.perm_menu_tab_minima == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('minimaview');
							if (!view) {
								view = tp.add({
									xtype: 'minimaview',
									title: 'Tabela Mínima',
									iconCls: 'icon-sitemap',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},{
						text: 'Expresso',
						tooltip: 'Gerenciamento da Tabela Rodoviário Expresso Nacional',
						iconCls: 'icon-menu-network',
						disabled: App.permissoes.perm_menu_tab_expresso == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('expressoview');
							if (!view) {
								view = tp.add({
									xtype: 'expressoview',
									title: 'Tabela Expresso',
									iconCls: 'icon-sitemap',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					}]
				},{
					text: 'Taxas',
					iconCls: 'icon-menu-percentage',
					menu: [{
						text: 'Terrestres',
						tooltip: 'Gerenciamento das Taxas Terrestres',
						iconCls: 'icon-menu-percentage',
						disabled: App.permissoes.perm_menu_tx_terrestres == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('taxaterrestregrid');
							if (!view) {
								view = tp.add({
									xtype: 'taxaterrestreview',
									title: 'Taxas Terrestres',
									iconCls: 'icon-pushpin',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},{
						text: 'Redespacho',
						tooltip: 'Gerenciamento das Taxas de Redespacho Rodoviário',
						iconCls: 'icon-menu-percentage',
						disabled: App.permissoes.perm_menu_tx_redespacho == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('taxaredespachogrid');
							if (!view) {
								view = tp.add({
									xtype: 'taxaredespachoview',
									title: 'Taxas de Redespacho',
									iconCls: 'icon-pushpin',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},'-',{
						text: 'Seguro RCTR-C',
						iconCls: 'icon-menu-percentage',
						tooltip: 'Taxas para Responsabilidade Civil do Transportador Rodoviário Carga',
						disabled: App.permissoes.perm_menu_tx_seguro_rctrc == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('segurorctrc');
							if (!view) {
								view = tp.add({
									xtype: 'segurorctrc',
									title: 'Seguro RCTR-C',
									iconCls: 'icon-pushpin',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					}]
				},'-',{
					text: 'CFOP Códigos',
					tooltip: 'Gerenciamento da Tabela de CFOP - CÓDIGOS FISCAIS DE OPERAÇÕES E PRESTAÇÕES',
					iconCls: 'icon-menu-pencil',
					disabled: App.permissoes.perm_menu_cfop == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('cfopcodigogrid');
						if (!view) {
							view = tp.add({
								xtype: 'cfopcodigogrid',
								title: 'CFOP Códigos',
								iconCls: 'icon-pencil',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},{
					text: 'Ocorrências',
					iconCls: 'icon-menu-pencil',
					disabled: App.permissoes.perm_menu_ocorrencias == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('ocorrenciagrid');
						if (!view) {
							view = tp.add({
								xtype: 'ocorrenciagrid',
								title: 'Ocorrências',
								iconCls: 'icon-pencil',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},'-',{
					text: 'Produtos',
					iconCls: 'icon-menu-editnotes',
					menu: [{
						text: 'Produtos',
						tooltip: 'Gerenciamento dos produtos',
						iconCls: 'icon-menu-pencil',
						disabled: App.permissoes.perm_menu_produtos == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('produtogrid');
							if (!view) {
								view = tp.add({
									xtype: 'produtogrid',
									title: 'Produtos',
									iconCls: 'icon-pencil',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},'-',{
						text: 'Grupos de Tarifas',
						tooltip: 'Gerenciamento do Grupo de Tarifas',
						iconCls: 'icon-menu-pencil',
						disabled: App.permissoes.perm_menu_grupo_tarifas == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('grupotarifagrid');
							if (!view) {
								view = tp.add({
									xtype: 'grupotarifagrid',
									title: 'Grupos de Tarifas',
									iconCls: 'icon-pencil',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},{
						text: 'IATA Códigos',
						tooltip: 'Gerenciamento dos Códigos de Produtos perigosos',
						iconCls: 'icon-menu-warning',
						disabled: App.permissoes.perm_menu_iata_imp_codes == 0,
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('iatacodigogrid');
							if (!view) {
								view = tp.add({
									xtype: 'iatacodigogrid',
									title: 'IATA Códigos',
									iconCls: 'icon-warning',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					}]
				},'-',{
					text: 'Rotas de Entregas',
					tooltip: 'Gerenciamento das Rotas de Entregas',
					iconCls: 'icon-menu-directions',
					disabled: App.permissoes.perm_menu_rotas_entregas == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('rotaentregagrid');
						if (!view) {
							view = tp.add({
								xtype: 'rotaentregagrid',
								title: 'Rotas de Entregas',
								iconCls: 'icon-tab-2',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},'-',{
					text: 'Bancos',
					tooltip: 'Cadastro dos bancos e contas correntes',
					iconCls: 'icon-menu-home',
					disabled: App.permissoes.perm_menu_bancos == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('bancogrid');
						if (!view) {
							view = tp.add({
								xtype: 'bancogrid',
								title: 'Bancos',
								iconCls: 'icon-home',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},{
					text: 'Praça de Pagamento',
					tooltip: 'Gerenciamento das Praças de Pagamento, utilizadas na impressão de boletos bancários',
					iconCls: 'icon-menu-home',
					disabled: App.permissoes.perm_menu_praca_pagamento == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('pracapagamentogrid');
						if (!view) {
							view = tp.add({
								xtype: 'pracapagamentogrid',
								title: 'Praça de Pagamento',
								iconCls: 'icon-home',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},'-',{
					text: 'Frota',
					iconCls: 'icon-menu-truck',
					menu: [{
						text: 'Agregados',
						iconCls: 'icon-menu-truck',
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('agregadosgrid');
							if (!view) {
								view = tp.add({
									xtype: 'agregadosgrid',
									title: 'Agregados',
									iconCls: 'icon-truck',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},{
						text: 'Motoristas',
						iconCls: 'icon-menu-truck',
						tooltip: 'Cadastro de condutores de veículos',
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('motoristaspanel');
							if (!view) {
								view = tp.add({
									xtype: 'motoristaspanel',
									title: 'Motoristas',
									iconCls: 'icon-truck',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					},{
						text: 'Veículos',
						iconCls: 'icon-menu-truck',
						tooltip: 'Cadastro de veículos próprios e de agregados',
						handler: function() {
							var tp = App.vp.down('tabpanel'), view = tp.down('veiculospanel');
							if (!view) {
								view = tp.add({
									xtype: 'veiculospanel',
									title: 'Veículos',
									iconCls: 'icon-truck',
									closable: true
								});
							}
							tp.setActiveTab(view);
						}
					}]
				}]
			},{
				text: 'Financeiro',
				menu: [{
					text: 'Contas à Receber',
					iconCls: 'icon-menu-dollar',
					disabled: App.permissoes.perm_menu_cta_receber == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('financeiroreceberpanel');
						if (!view) {
							view = tp.add({
								xtype: 'financeiroreceberpanel',
								title: 'Contas à Receber',
								iconCls: 'icon-money',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				}]
			},{
				text: 'SAC',
				menu: [{
					text: 'Cotação',
					iconCls: 'icon-menu-editnotes',
					disabled: App.permissoes.perm_menu_informacoes == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('saccotacaoform');
						if (!view) {
							view = tp.add({
								xtype: 'saccotacaoform',
								title: 'Cotação',
								iconCls: 'icon-pencil',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},{
					text: 'Minuta de Embarque',
					iconCls: 'icon-menu-truck',
					disabled: App.permissoes.perm_menu_coleta == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('coletaview');
						if (!view) {
							view = tp.add({
								xtype: 'coletaview',
								title: 'Minuta de Embarque',
								iconCls: 'icon-truck',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},'-',{
					text: 'Coletas',
					iconCls: 'icon-menu-truck',
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('coletaspanel');
						if (!view) {
							view = tp.add({
								xtype: 'coletaspanel',
								title: 'Coletas',
								iconCls: 'icon-truck',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},{
					text: 'Coletas Programadas',
					iconCls: 'icon-menu-calendar',
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('coletasprogramadaspanel');
						if (!view) {
							view = tp.add({
								xtype: 'coletasprogramadaspanel',
								title: 'Coletas Programadas',
								iconCls: 'icon-calendar',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				},'-',{
					text: 'Romaneios',
					iconCls: 'icon-menu-copy',
					disabled: App.permissoes.perm_menu_romaneios == 0,
					handler: function() {
						var tp = App.vp.down('tabpanel'), view = tp.down('romaneioview');
						if (!view) {
							view = tp.add({
								xtype: 'romaneioview',
								title: 'Romaneios',
								iconCls: 'icon-copy',
								closable: true
							});
						}
						tp.setActiveTab(view);
					}
				}]
			},'->',{
				text: App.usuario.user_nome,
				tooltip: 'Clique aqui para alterar seus dados',
				handler: function() {
					var win = Ext.getCmp('user-win');
					if (!win) {
						win = Ext.create('Usuario.Window', {
							id: 'user-win'
						});
					}
					win.show();
					win.loadRecord(App.usuario);
				}
			},{
				xtype: 'empresacombo',
				valueField: 'emp_login',
				displayField: 'emp_login',
				emptyText: App.empresa.emp_login,
				style: {
					color: 'red',
					fontWeight: 'bold'
				},
				fieldStyle: {
					color: 'red',
					fontWeight: 'bold'
				},
				width: 300,
				listeners: {
					select: function(field, records) {
						var record = records[0];
						window.location = 'app.php?empid=' + record.get('emp_id');
					}
				}
			},'-',{
				xtype: 'splitbutton',
				text: 'Sair',
				iconCls: 'icon-exit',
				tooltip: 'Para sair pressione a qualquer momento a sequência (CTRL + ALT + S) do seu teclado.',
				handler: function(){
					window.location = '?logout';
				},
				menu: {
					items: [{
						text: 'Bloquear sessão',
						iconCls: 'icon-menu-lock',
						tooltip: 'Para bloquear a sessão pressione a qualquer momento a sequência (CTRL + ALT + L) do seu teclado.',
						handler: function(me){
							me.setDisabled(true); 
							Ext.Ajax.request({
								url: 'php/response.php',
								method: 'post', 
								params: {
									m: 'logout'
								},
								callback: function() {
									me.setDisabled(false); 
									App.task.login();
								}
							});
						}
					}]
				}
			}]
		},{
			ui: 'blue-tab',
			region: 'center',
			xtype: 'tabpanel',
			activeTab: 0,
			layout: 'fit',
			items: [{
				title: 'Home',
				itemId: 'home-tab',
				iconCls: 'icon-cloud',
				bodyCls: 'logo-bg',
				contentEl: 'pc-google-finance',
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						text: 'Câmbio',
						itemId: 'cambiobtn',
						iconCls: 'icon-exchange',
						tooltip: 'Conversor de moeda (fonte: Google Finance). Quando precisar, pressoine a qualquer momento a sequência (CTRL + F1) do seu teclado',
						handler: function() {
							Ext.create('Ext.ux.Window', {
								ui: 'black-window',
								title: 'Conversor de Moeda',
								width: 220,
								height: 285,
								autoShow: true,
								maximizable: false,
								minimizable: false,
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
										xtype: 'moedacombo',
										fieldLabel: 'Selecione uma moeda de origem',
										name: 'from',
										value: 'EURO'
									},{
										xtype: 'decimalfield',
										fieldLabel: 'Informe o valor para conversão',
										name: 'ammount',
										minValue: 1,
										value: 1
									},{
										xtype: 'moedacombo',
										fieldLabel: 'Selecione uma moeda de destino',
										name: 'to',
										value: 'REAL'
									},{
										xtype: 'decimalfield',
										fieldLabel: 'Resultado da conversão',
										name: 'result',
										value: App.cambio.euro,
										readOnly: true
									}],
									buttons: [{
										ui: 'orange-button',
										text: 'Converter',
										scale: 'medium',
										formBind: true,
										disabled: true,
										handler: function(btn) {
											btn.setDisabled(true);
											btn.setText('Convertendo...');
											btn.up('form').getForm().submit({
												clientValidation: true,
												url: 'php/response.php',
												method: 'post',
												params: {
													m: 'cambio_store'
												},
												failure: App.formFailure,
												success: function(f, a) {
													f.findField('result').setValue(a.result.cambio);
													btn.setDisabled(false);
													btn.setText('Converter');
												}
											});
										}
									}]
								}
							});
						}
					},'->',{
						text: 'Sugestões',
						tooltip: 'Clique aqui para reportar um erro/falha ou enviar sugestões do ' + App.projeto + '. Sua opinião é muito importante para nós.',
						iconCls: 'icon-mail',
						handler: function() {
							var win = Ext.create('Suggestion.Window');
							win.getComponent(0).getForm().isValid();
						}
					},'-',{
						text: 'Acessibilidade',
						itemId: 'keyboard-btn',
						tooltip: 'Habilite ou Desabilite a navegação por teclado a qualquer momento pressionando (CTRL + F3) do seu teclado',
						iconCls: 'icon-accessibility-2',
						pressed: App.usuario.usar_teclado,
						enableToggle: true,
						toggleHandler: function(btn, pressed) {
							App.toggleKeyboard(pressed);
						}
					},'-',{
						text: 'Suporte',
						tooltip: 'Atendimento online, tire suas dúvidas, saiba por onde começar',
						iconCls: 'icon-help',
						hrefTarget: '_self',
						url: 'skype:nilton.sistrom.ti?chat'
					}]
				}]
			}]
		}]
	});
	
	/*
	 * Tasks
	 */
	App.task = {
		delay: {
			/*
			 * in Minutes
			 */
			checkLogin: (3 * 60), // 3 min
			reloadStore: (60 * 60) // 60 min
		},
		run: function() {
			Ext.Function.defer(function(){App.task.checkLogin();}, App.task.delay.checkLogin * 1000);
			Ext.Function.defer(function(){App.task.reloadStore();}, App.task.delay.reloadStore * 1000);
		},
		login: function() {
			if (Ext.getCmp('login-win')) return false;
			var submit = function(form) {
				if (!form.getForm().isValid()) return false;
				var login = form.getForm().findField('usuario_login'),
				senha = form.getForm().findField('usuario_senha');
				if (Ext.data.validations.emailRe.test(login.getValue()) && login.getValue() != App.usuario.user_email) {
					login.markInvalid('Endereço de e-mail inválid: Somente o(a) ' + App.usuario.nome + ' poderá desbloquear essa sessão.');
					login.focus();
					return false;
				} else if (login.getValue() != App.usuario.user_login) {
					login.markInvalid('Login inválido: Somente o(a) ' + App.usuario.nome + ' poderá desbloquear essa sessão.');
					login.focus();
					return false;
				}
				if (senha.getValue() != App.usuario.user_senha) {
					senha.markInvalid('Senha inválida');
					senha.focus();
					return false;
				}
				form.down('#login').disable();
				form.getForm().submit({
					clientValidation: true,
					url: 'php/response.php',
					method: 'post',
					params: {
						m: 'autenticar_usuario',
						empresas_id: App.empresa.emp_id
					},
					failure: App.formFailure,
					success: function(f, a) {
						form.up('window').close();
					}
				});
			};
			Ext.create('Ext.ux.Window', {
				id: 'login-win',
				ui: 'black-window',
				title: App.usuario.user_nome + ' - Acesso Restrito',
				width: 350,
				height: 240,
				modal: true,
				autoShow: true,
				maximizable: false,
				minimizable: false,
				resizable: false,
				closable: false,
				draggable: false,
				layout: 'fit',
				items: {
					xtype: 'form',
					bodyPadding: 5,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						labelAlign: 'top',
						selectOnFocus: true,
						allowBlank: false,
						listeners: {
							specialkey: function(f, e) {
								if (e.getKey() == e.ENTER) {
									submit(this.up('form'));
								}
							}
						}
					},
					defaultType: 'textfield',
					items: [{
						hideLabel: true,
						xtype: 'displayfield',
						name: 'info',
						value: 'Por motivo de segurança sua sessão foi bloqueada. Forneça seus dados de acesso novamente para desbloquear sua sessão.'
					},{
						fieldLabel: 'Somente ' + App.usuario.user_nome + ' poderá desbloquear essa sessão',
						name: 'usuario_login',
						value: App.usuario.user_login,
						readOnly: true
					},{
						fieldLabel: 'Senha',
						name: 'usuario_senha',
						inputType: 'password'
					}],
					buttons: [{
						ui: 'orange-button',
						text: 'Sair',
						scale: 'medium',
						handler: function(){
							window.location = '?logout';
						}
					},{
						ui: 'green-button',
						text: 'Desbloquear',
						scale: 'medium',
						itemId: 'login',
						formBind: true,
						disabled: true,
						handler: function(){
							submit(this.up('form'));
						}
					}]
				}
			});
		},
		checkConsole: function() {
			window.setTimeout(App.task.checkConsole, 10000);
			if (window.console && window.console.firebug) {
				//Firebug is enabled
				console.debug('Firebug is enabled.');
			} else {
				//Firebug is not enabled
				console.debug('Firebug is not enabled.');
			}
		},
		checkLogin: function() {
			Ext.Ajax.request({
				url: 'php/response.php',
				method: 'get',
				params: {m: 'checar_login'},
				success: function(response) {
					var o = Ext.decode(response.responseText);
					if (!o.logged) {
						App.task.login();
					}
					Ext.Function.defer(function(){App.task.checkLogin();}, App.task.delay.checkLogin * 1000);
				}
			});
		},
		reloadStore: function() {
			Ext.data.StoreManager.each(function(store){store.reload();});
			Ext.Function.defer(function(){App.task.reloadStore();}, App.task.delay.reloadStore * 1000);
		}
	};
	App.task.run();
});