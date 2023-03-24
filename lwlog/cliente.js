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
			items: ['->',{
				text: App.cliente.clie_razao_social,
				tooltip: 'Clique aqui para alterar seus dados',
				disabled: App.cliente.clie_id <= 0,
				handler: function() {
					if (!App.cliente.clie_id) return false;
					var win = Ext.create('Ext.ux.Window', {
						ui: 'orange-window',
						title: 'Alterar dados',
						width: 300,
						height: 190,
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
							defaultType: 'textfield',
							items: [{
								fieldLabel: 'Informe seu novo login',
								name: 'clie_login',
								maxLength: 15,
								value: App.cliente.clie_login
							},{
								fieldLabel: 'Informe sua nova senha',
								name: 'clie_senha',
								maxLength: 15,
								value: App.cliente.clie_senha
							}],
							buttons: [{
								text: 'ALTERAR',
								scale: 'medium',
								formBind: true,
								disabled: true,
								handler: function(btn) {
									btn.setDisabled(true);
									btn.setText('ALTERANDO...');
									btn.up('form').getForm().submit({
										clientValidation: true,
										url: 'mod/site/clientes/php/response.php',
										method: 'post',
										params: {
											m: 'alterar_senha_cliente',
											clie_id: App.cliente.clie_id
										},
										failure: App.formFailure,
										success: function(f, a) {
											win.close();
										}
									});
								}
							}]
						}
					});
				}
			},'-',{
				text: 'Sair',
				iconCls: 'icon-exit',
				tooltip: 'Para sair pressione a qualquer momento a sequência (CTRL + ALT + S) do seu teclado.',
				handler: function(){
					window.location = '?logout';
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
						url: 'skype:luciano.moreira75?chat'
					}]
				}]
			},{
				xtype: 'clienteview',
				title: 'Conhecimentos',
				iconCls: 'icon-cloud'
			},{
				xtype: 'clientefaturagrid',
				title: 'Faturas',
				iconCls: 'icon-money',
				hidden: App.cliente.clie_id <= 0,
				visible: App.cliente.clie_id > 0,
				disabled: App.cliente.clie_id <= 0
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
			checkLogin: (3 * 60) // 3 min
		},
		run: function() {
			App.vp.down('tabpanel').setActiveTab(1);
			Ext.Function.defer(function(){App.task.checkLogin();}, App.task.delay.checkLogin * 1000);
		},
		login: function() {
			if (Ext.getCmp('login-win')) return false;
			var submit = function(form) {
				if (!form.getForm().isValid()) return false;
				var login = form.getForm().findField('cliente_login'),
				senha = form.getForm().findField('cliente_senha');
				if (login.getValue() != App.cliente.clie_login) {
					login.markInvalid('Login inválido');
					login.focus();
					return false;
				}
				if (senha.getValue() != App.cliente.clie_senha) {
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
						m: 'autenticar_cliente'
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
				title: App.cliente.clie_razao_social + ' - Acesso Restrito',
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
						value: 'Por motivo de segurança sua sessão foi bloqueada. Forneça seus dados de acesso para desbloquear'
					},{
						fieldLabel: 'Login',
						name: 'cliente_login',
						value: App.cliente.clie_login,
						readOnly: true
					},{
						fieldLabel: 'Senha',
						name: 'cliente_senha',
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
		checkLogin: function() {
			Ext.Ajax.request({
				url: 'php/response.php',
				method: 'get',
				params: {m: 'checar_login_cliente'},
				success: function(response) {
					var o = Ext.decode(response.responseText);
					if (!o.logged) {
						App.task.login();
					}
					Ext.Function.defer(function(){App.task.checkLogin();}, App.task.delay.checkLogin * 1000);
				}
			});
		}
	};
	App.task.run();
});