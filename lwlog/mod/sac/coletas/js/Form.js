Ext.define('Coletas.form.Panel', {
	extend: 'Ext.form.Panel',
	alias: 'widget.coletasform',
	
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
				title: 'Coleta',
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
						flex: 2,
						xtype: 'datefield',
						fieldLabel: 'Coletar em',
						name: 'coletar_em',
						format: 'd/m/Y',
						value: new Date()
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
						name: 'nota_coleta',
						maxLength: 500,
						allowBlank: true
					}]
				}]
			},{
				title: 'Motorista e Veículo',
				items: [{
					items: [{
						xtype: 'motoristacombo',
						fieldLabel: 'Motorista',
						name: 'mot_id',
						allowBlank: true,
						extraParams: {coleta:true}
					},{
						xtype: 'veiculocombo',
						fieldLabel: 'Veículo',
						name: 'veic_trac_id',
						allowBlank: true,
						extraParams: {coleta:true}
					}]
				},{
					items: [{
						xtype: 'textareafield',
						fieldLabel: 'Informações do motorista referente a baixa',
						name: 'nota_motorista',
						allowBlank: true
					}]
				}]
			},{
				title: 'Situação/Baixa da coleta',
				items: [{
					items: [{
						xtype: 'localcombo',
						fieldLabel: 'Status',
						name: 'status',
						value: 'AGUARDANDO',
						options: ['AGUARDANDO','EM ADAMENTO','COLETADA','CANCELADA'],
						listeners: {
							select: function(field, records) {
								var record = records[0], form = me.getForm(),
								field1 = form.findField('coletado_em'),
								field2 = form.findField('coletado_as');
								if (record.get("field") != "COLETADA") {
									field1.reset();
									field2.reset();
									field1.clearInvalid();
									field2.clearInvalid();
								}
								field1.setDisabled(record.get("field") != "COLETADA");
								field2.setDisabled(record.get("field") != "COLETADA");
							}
						}
					},{
						xtype: 'datefield',
						fieldLabel: 'Coletado em',
						name: 'coletado_em',
						format: 'd/m/Y',
						disabled: true
					},{
						xtype: 'timefield',
						fieldLabel: 'Coletado ás',
						name: 'coletado_as',
						format: 'H:i',
						disabled: true				
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
						url: 'mod/sac/coletas/php/response.php',
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
							me.up('coletaspanel').down('coletasgrid').getStore().load({params:{id:a.result.id}});
							
							if (!Ext.isEmpty(a.result.pdf)) {
								var popup = window.open(a.result.pdf);
								if (!popup) {
									Ext.create('Ext.ux.Alert', {
										ui: 'black-alert',
										msg: 'O sistema gerou um documento para coleta, porém o sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para facilitar e evitar futura mensagem, por favor inclua nosso site na lista dos permitidos.<br/>O que você deseja fazer agora?',
										closeText: 'CANCELAR',
										buttons: [{
											text: 'ABRIR ARQUIVO',
											url: a.result.pdf,
											hrefTarget: '_blank'
										}]
									});
								}
							}
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
			form.findField('clie_id').focus();
		}, 600);
	},
	
	loadRecord: function(record) {
		if (!record) {
			return false;
		}
		
		var me = this, form = me.getForm();
		form.reset();
		form.loadRecord(record);
		
		if (!Ext.isEmpty(record.get("concluida_em"))) {
			var coletadoEm = form.findField("coletado_em"), coletadoAs = form.findField("coletado_as");
			coletadoEm.setValue(record.get("concluida_em"));
			coletadoAs.setValue(Ext.Date.format(record.get("concluida_em"), "H:i"));
		}
		
		var field = form.findField('clie_fake_id');
		field.setValue(record.get("clie_id"));
		
		form.isValid();
		setTimeout(function(){
			field.focus();
		}, 600);
	}
});