Ext.define('CTE.Inutilizar.window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.cteinutilizarwin',
	
	initComponent: function() {
		var me = this, yearToday = parseInt(Ext.Date.format(new Date(), 'Y'));
		Ext.apply(this, {
			ui: 'red-window-active',
			title: 'Inutilizar CT-e',
			width: 350,
			height: 430,
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
				defaultType: 'textfield',
				items: [{
					xtype: 'displayfield',
					hideLabel: true,
					value: 'Inutilização de Conhecimentos: Preencher os campos corretamente e informar faixa <strong>inexistente</strong> de CT-e'
				},{
					xtype: 'intfield',
					fieldLabel: 'Faixa inicial inexistente do conhecimento',
					name: 'faixa_inicio',
					minValue: 0,
					maxValue: 999999999
				},{
					xtype: 'intfield',
					fieldLabel: 'Faixa término inexistente do conhecimento',
					name: 'faixa_fim',
					minValue: 0,
					maxValue: 999999999
				},{
					xtype: 'intfield',
					fieldLabel: 'Informe o número de série do conhecimento',
					name: 'serie',
					minValue: 0,
					maxValue: 999
				},{
					xtype: 'intfield',
					fieldLabel: 'Informe o ano abreviado do conhecimento',
					name: 'ano',
					value: yearToday,
					minValue: 2010,
					maxValue: yearToday
				},{
					xtype: 'textareafield',
					fieldLabel: 'Justifique',
					name: 'justifique',
					height: 90,
					value: 'PROBLEMA COM A NUMERACAO DO CTE'
				}],
				buttons: [{
					text: 'INUTILIZAR',
					scale: 'medium',
					formBind: true,
					handler: function(btn) {
						var form = me.down('form').getForm(),
						originalText = btn.getText();
						btn.setText('INUTILIZANDO...');
						btn.setDisabled(true);
						form.submit({
							clientValidation: true,
							url: 'mod/conhecimentos/ctes/php/response.php',
							method: 'post',
							params: {
								m: 'inutilizar'
							},
							failure: Ext.Function.createSequence(App.formFailure, function() {
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(f, a) {
								btn.setDisabled(false);
								btn.setText(originalText);
								me.close();
								Ext.create('Ext.ux.Alert', {
									ui: 'green-alert',
									msg: 'Inutilização efetuada com sucesso. Atualize a grade de Conhecimentos para ver a numeração de CTE(s) inutilizado(s).',
								});

							}
						});
					}
				}]
			}
		});
		me.callParent(arguments);
	}
});