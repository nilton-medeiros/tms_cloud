Ext.define('ColetasProgramadas.form.Panel', {
	extend: 'Ext.form.Panel',
	alias: 'widget.coletasprogramadasform',
	
	grid: null,
	setGrid: function(grid) {
		this.grid = grid;
	},
	
	initComponent: function() {
		var me = this;
		
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
				title: 'Agendamento',
				items: [{
					items: [{
						flex: null, width: 0,
						xtype: 'hiddenfield',
						name: 'clie_id',
						allowBlank: true
					},{
						flex: null, width: 0,
						xtype: 'hiddenfield',
						name: 'id',
						allowBlank: true
					}]
				},{
					items: [{
						flex: 2,
						xtype: 'clientecombo',
						fieldLabel: 'Cliente',
						name: 'clie_fake_id',
						extraParams: {
							clie_ativo: 1,
							clie_categoria: '0,4'
						},
						listeners: {
							select: function(field, records) {
								var record = records[0];
								me.getForm().findField('clie_id').setValue(record.get("clie_id"));
							}
						}
					}]
				},{
					items: [{
						xtype: 'localcombo',
						fieldLabel: 'Dia da semana',
						name: 'dia_da_semana',
						value: 'SEG',
						options: ['DOM','SEG','TER','QUA','QUI','SEX','SAB']
					},{
						xtype: 'timefield',
						fieldLabel: 'Primeiro horário',
						name: 'coletar_das',
						format: 'H:i',
						value: '08:00'
					},{
						xtype: 'timefield',
						fieldLabel: 'Último horário',
						name: 'coletar_ate',
						format: 'H:i',
						value: '18:00'
					}]
				},{
					items: [{
						xtype: 'textareafield',
						fieldLabel: 'Informações sobre a carga',
						name: 'descricao',
						maxLength: 500,
						allowBlank: true
					}]
				}]
			}],
			buttons: [{
				text: 'SALVAR',
				scale: 'medium',
				formBind: true,
				handler: function(btn) {
					var form = this.up('form').getForm();
					if (!form.isValid()) {
						return false;
					}
					var originalText = btn.getText();
					btn.setText('SALVANDO...');
					btn.setDisabled(true);
					form.submit({
						clientValidation: true,
						url: 'mod/sac/coletasprogramadas/php/response.php',
						method: 'post',
						params: {
							m: 'save_coleta'
						},
						failure: Ext.Function.createSequence(App.formFailure, function() {
							btn.setDisabled(false);
							btn.setText(originalText);
						}),
						success: function(f, a) {
							btn.setDisabled(false);
							btn.setText(originalText);
							
							me.newRecord();
							me.up('coletasprogramadaspanel').down('coletasprogramadasgrid').getStore().load({params:{id:a.result.id}});
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
		
		form.isValid();
		setTimeout(function(){
			form.findField('clie_fake_id').focus();
		}, 600);
	},
	
	loadRecord: function(record) {
		if (!record) {
			return false;
		}
		
		var me = this, form = me.getForm();
		form.reset();
		form.loadRecord(record);
		
		var field = form.findField('clie_fake_id');
		field.setValue(record.get("clie_id"));
		
		form.isValid();
		setTimeout(function(){
			field.focus();
		}, 600);
	}
});