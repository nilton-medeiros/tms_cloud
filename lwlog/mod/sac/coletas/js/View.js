Ext.define("Coletas.tab.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.coletaspanel',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'coletasgrid'
			},{
				region: 'east',
				split: false,
				collapsed: false,
				collapsible: true,
				autoScroll: true,
				width: 450,
				layout: {
					type: 'accordion',
					titleCollapse: true,
					animate: true,
					activeOnTop: true
				},
				items: [{
					xtype: 'coletasform',
					title: 'Formulário'
				},{
					xtype: 'form',
					itemId: 'email-form',
					title: 'Enviar e-mail para...',
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
								url: 'mod/sac/coletas/php/response.php',
								method: 'post',
								params: {
									m: 'email_cliente',
									id: record.get('id'),
									filename: record.get('coleta_filename')
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