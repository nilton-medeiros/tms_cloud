Ext.define("Financeiro.Receber.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.financeiroreceberpanel',
	
	initComponent: function() {
		var me = this;
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'contasrecebergrid'
			},{
				itemId: 'east-panel',
				region: 'east',
				title: 'Guia rápido',
				split: true,
				collapsed: false,
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
					xtype: 'form',
					itemId: 'edit-form',
					title: 'Editar faturamento em aberto',
					disabled: true,
					autoScroll: true,
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
							labelAlign: 'top',
							allowBlank: false,
							selectOnFocus: true
						},
						defaultType: 'textfield'
					},
					defaultType: 'fieldcontainer',
					items: [{
						items: [{
							xtype: 'localcombo',
							fieldLabel: 'Tipo de carteira (cobrança) da fatura',
							options: ['BANCARIA','INTERNA','TERCEIRIZADA'],
							name: 'tipo_carteira'
						},{
							xtype: 'hiddenfield',
							name: 'id',
							flex: null,
							width: 0,
							value: 0
						}]
					},{
						items: [{
							xtype: 'decimalfield',
							fieldLabel: 'Valor original do título',
							name: 'valor_original',
							value: 0,
							minValue: 0,
							maxValue: 99999999999.99
						},{
							xtype: 'datefield',
							fieldLabel: 'Data do vencimento da fatura',
							format: 'd/m/Y',
							name: 'vence_em'
						}]
					},{
						items: [{
							xtype: 'decimalfield',
							fieldLabel: 'Valor recebido referente a fatura',
							name: 'valor_recebido',
							value: 0,
							minValue: 0,
							maxValue: 99999999999.99
						},{
							xtype: 'datefield',
							fieldLabel: 'Data do recebimento da fatura',
							format: 'd/m/Y',
							name: 'recebido_em',
							allowBlank: true
						}]
					},{
						items: [{
							xtype: 'decimalfield',
							fieldLabel: 'Multa',
							name: 'valor_multa',
							value: 0,
							minValue: 0,
							maxValue: 99999999999.99
						},{
							xtype: 'decimalfield',
							fieldLabel: 'Juros',
							name: 'valor_juros',
							value: 0,
							minValue: 0,
							maxValue: 99999999999.99
						},{
							xtype: 'decimalfield',
							fieldLabel: 'Acréscimo',
							name: 'valor_acrescimo',
							value: 0,
							minValue: 0,
							maxValue: 99999999999.99
						},{
							xtype: 'decimalfield',
							fieldLabel: 'Desconto',
							name: 'valor_desconto',
							value: 0,
							minValue: 0,
							maxValue: 99999999999.99
						},{
							xtype: 'decimalfield',
							fieldLabel: 'Abatimento',
							name: 'valor_abatimento',
							value: 0,
							minValue: 0,
							maxValue: 99999999999.99
						}]
					},{
						items: [{
							xtype: 'checkboxfield',
							boxLabel: 'Boleto foi gerado?',
							name: 'emitido_boleto',
							allowBlank: true,
							inputValue: 1
						},{
							xtype: 'checkboxfield',
							boxLabel: 'E-mail foi enviado?',
							name: 'email_enviado',
							allowBlank: true,
							inputValue: 1
						}]
					},{
						items: [{
							xtype: 'textareafield',
							fieldLabel: 'Observações gerais',
							name: 'nota_obs',
							height: 100,
							allowBlank: true
						}]
					},{
						items: [{
							xtype: 'textareafield',
							fieldLabel: 'Motivo de cancelamento',
							name: 'motivo_cancelado',
							height: 100,
							allowBlank: true
						}]
					}],
					buttons: [{
						ui: 'blue-button',
						text: 'SALVAR',
						scale: 'medium',
						formBind: true,
						handler: function(btn) {
							var originalText = btn.getText();
							btn.setText('SALVANDO...');
							btn.setDisabled(true);
							var form = this.up('form').getForm();
							form.submit({
								clientValidation: true,
								url: 'mod/financeiro/receber/php/response.php',
								method: 'post',
								params: {
									m: 'save_receber'
								},
								failure: Ext.Function.createSequence(App.formFailure, function() {
									btn.setDisabled(false);
									btn.setText(originalText);
								}),
								success: function(f, a) {
									btn.setDisabled(false);
									btn.setText(originalText);
									var record = form.getRecord();
									me.down('contasrecebergrid').getStore().load({
										params: {
											id: record.get('id')
										}
									});
								}
							});
						}
					}]
				},{
					xtype: 'contasreceberctegrid',
					title: 'CONHECIMENTOS FATURADOS'
				},{
					xtype: 'form',
					itemId: 'email-form',
					title: 'Enviar cobrança por e-mail para cliente',
					disabled: true,
					autoScroll: true,
					bodyPadding: 10,
					defaults: {
						anchor: '100%',
						labelAlign: 'top',
						selectOnFocus: true,
						allowBlank: false
					},
					defaultType: 'textfield',
					items: [{
						fieldLabel: 'Enviar e-mail para (utilize ";" para separar os e-mails)',
						name: 'email_to'
					},{
						fieldLabel: 'Enviar e-mail com cópia para (utilize ";" para separar os e-mails)',
						name: 'email_cc',
						allowBlank: true
					},{
						fieldLabel: 'Enviar e-mail com cópia oculta para (utilize ";" para separar os e-mails)',
						name: 'email_cco',
						allowBlank: true
					},{
						fieldLabel: 'Assunto da mensagem',
						name: 'email_subject'
					},{
						xtype: 'filefield', 
						fieldLabel: 'Anexar arquivo (opcional)',
						name: 'email_anexo',
						buttonText: 'Buscar',
						emptyText: 'Selecione um documento',
						allowBlank: true
					},{
						hideLabel: true,
						xtype: 'displayfield',
						name: 'email_attach',
						value: '(sem anexo)'
					},{
						xtype: 'htmleditor',
						fieldLabel: 'Mensagem',
						name: 'email_message',
						height: 300,
						disabled: false,
						enableFormat: true,
						enableColors: true,
						enableAlignments: false,
						enableFont: false,
						enableFontSize: false,
						enableSourceEdit: false,
						enableLists: false,
						fixBoldTagError: true
					}],
					buttons: [{
						ui: 'blue-button',
						text: 'ENVIAR',
						scale: 'medium',
						formBind: true,
						handler: function(btn) {
							var panel = this.up('form'), form = panel.getForm(), record = panel.getRecord();
							if (!form.isValid() || !record) return false;
							var originalText = btn.getText();
							btn.setText('Enviando...');
							btn.setDisabled(true);
							form.submit({
								clientValidation: true,
								url: 'mod/financeiro/receber/php/response.php',
								method: 'post',
								params: {
									m: 'email_cliente',
									id: record.get('id'),
									filename: record.get('pdf_duplicata')
								},
								failure: Ext.Function.createSequence(App.formFailure, function(){
									btn.setDisabled(false);
									btn.setText(originalText);
								}),
								success: function(f, a) {
									btn.setDisabled(false);
									btn.setText(originalText);
									form.reset();
									panel.setDisabled(true);
									record.set('email_enviado', 1);
								}
							});
						}
					}]
				},{
					xtype: 'contasreceberdevedorgrid',
					title: 'RECEBIMENTOS AGRUPADOS POR CLIENTES',
					tools: [{
						type: 'refresh',
						tooltip: 'Atualizar listagem',
						handler: function(e, toolEl, panel) {
							panel.up('contasreceberdevedorgrid').getStore().reload();
						}
					},{
						type: 'maximize',
						tooltip: 'Maximizar',
						handler: function() {
							Ext.create('Ext.ux.Window', {
								ui: 'blue-window-active',
								title: 'Recebimentos por Clientes',
								width: 800,
								height: 600,
								autoShow: true,
								closable: true,
								resizable: true,
								maximized: true,
								maximizable: true,
								minimizable: false,
								layout: 'fit',
								items: {
									xtype: 'contasreceberdevedorgrid'
								}
							});
						}
					}]
				}]
			}]
		});
		
		this.callParent(arguments);
	}
});