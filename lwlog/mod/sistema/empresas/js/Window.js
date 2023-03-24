Ext.define('Empresa.Window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.empresawindow',
	
	initComponent: function() {
		Ext.apply(this, {
			title: 'Meus dados',
			ui: 'blue-window-active',
			width: 1140,
			height: 615,
			modal: true,
			maximizable: false,
			minimizable: false,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'form',
				layout: 'anchor',
				bodyPadding: 5,
				defaults: {
					anchor: '100%',
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
							labelAlign: 'top',
							allowBlank: false,
							selectOnFocus: true,
							listeners: {
								specialkey: this.onEnterkey
							}
						},
						defaultType: 'textfield'
					},
					defaultType: 'fieldcontainer'
				},
				defaultType: 'fieldset',
				items: [{
					title: 'Dados cadastrais',
					items: [{
						itemId: 'main-fc-area',
						items: [{
							fieldLabel: 'Razão Social',
							name: 'razao_social',
							maxLength: 255,
							flex: 1
						},{
							fieldLabel: 'Nome Fantasia',
							name: 'nome_fantasia',
							maxLength: 255,
							flex: 1
						},{
							fieldLabel: 'CNPJ',
							name: 'cnpj',
							width: 110,
							readOnly: true
						},{
							fieldLabel: 'Inscrição Municipal',
							name: 'im',
							width: 120,
							readOnly: true,
							allowBlank: true
						},{
							fieldLabel: 'Inscrição Estadual',
							name: 'ie',
							width: 120,
							readOnly: true,
							allowBlank: true
						},{
							xtype: 'hiddenfield',
							name: 'id'
						},{
							xtype: 'filefield', 
							fieldLabel: 'Logotipo',
							name: 'logotipo',
							buttonText: 'Buscar',
							emptyText: 'Selecione uma imagem',
							width: 200
						}]
					},{
						items:[{
							xtype: 'enderecocombo',
							name: 'endereco',
							emptyText: 'Endereço',
							fieldLabel: 'Endereço',
							maxLength: 165,
							flex: 1,
							fields: {
								useDefaults: true
							}
						},{
							name: 'complemento',
							emptyText: 'Complemento',
							fieldLabel: 'Complemento',
							maxLength: 45,
							allowBlank: true,
							width: 140
						},{
							name: 'cep',
							emptyText: 'CEP',
							fieldLabel: 'CEP',
							width: 100,
							maxLength: 9
						},{
							name: 'bairro',
							emptyText: 'Bairro',
							fieldLabel: 'Bairro',
							width: 140,
							maxLength: 45
						},{
							name: 'cidade',
							emptyText: 'Cidade',
							fieldLabel: 'Cidade',
							width: 140,
							maxLength: 45
						},{
							name: 'uf',
							emptyText: 'UF',
							fieldLabel: 'UF',
							width: 50,
							maxLength: 2
						}]
					},{
						items: [{
							xtype: 'hiddenfield',
							name: 'telefone1',
							allowBlank: true
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'displayfield',
							value: '+55',
							name: 'telefone1_cod_pais',
							width: 20
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'intfield',
							name: 'telefone1_cod_ddd',
							emptyText: 'DDD',
							allowNegative: false,
							minValue: 0,
							maxValue: 99,
							width: 40
						},{
							fieldLabel: 'Telefone #1',
							xtype: 'intfield',
							name: 'telefone1_numero',
							emptyText: 'Fone',
							allowNegative: false,
							maxLength: 10,
							width: 100
						},{
							xtype: 'hiddenfield',
							name: 'telefone2',
							allowBlank: true
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'displayfield',
							value: '+55',
							name: 'telefone2_cod_pais',
							allowBlank: true,
							width: 20
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'intfield',
							name: 'telefone2_cod_ddd',
							emptyText: 'DDD',
							allowBlank: true,
							allowNegative: false,
							minValue: 0,
							maxValue: 99,
							width: 40
						},{
							fieldLabel: 'Telefone #2',
							xtype: 'intfield',
							name: 'telefone2_numero',
							emptyText: 'Fone',
							allowBlank: true,
							allowNegative: false,
							maxLength: 10,
							width: 100
						},{
							xtype: 'hiddenfield',
							name: 'fax1',
							allowBlank: true
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'displayfield',
							value: '+55',
							name: 'fax1_cod_pais',
							allowBlank: true,
							width: 20
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'intfield',
							name: 'fax1_cod_ddd',
							emptyText: 'DDD',
							allowBlank: true,
							allowNegative: false,
							minValue: 0,
							maxValue: 99,
							width: 40,
							value: App.empresa.cod_ddd
						},{
							fieldLabel: 'Fax #1',
							xtype: 'intfield',
							name: 'fax1_numero',
							emptyText: 'Fax',
							allowBlank: true,
							allowNegative: false,
							maxLength: 10,
							width: 100
						},{
							xtype: 'hiddenfield',
							name: 'fax2',
							allowBlank: true
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'displayfield',
							value: '+55',
							name: 'fax2_cod_pais',
							allowBlank: true,
							width: 20
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'intfield',
							name: 'fax2_cod_ddd',
							emptyText: 'DDD',
							allowBlank: true,
							allowNegative: false,
							minValue: 0,
							maxValue: 99,
							width: 40,
							value: App.empresa.cod_ddd
						},{
							fieldLabel: 'Fax #2',
							xtype: 'intfield',
							name: 'fax2_numero',
							emptyText: 'Fax',
							allowBlank: true,
							allowNegative: false,
							maxLength: 10
						},{
							fieldLabel: 'E-mail',
							name: 'email',
							vtype: 'email',
							maxLength: 255,
							flex: 1 
						},{
							fieldLabel: 'Site',
							name: 'site',
							vtype: 'url',
							maxLength: 255,
							allowBlank: true,
							flex: 1
						}]
					}]
				},{
					title: 'Responsável',
					items: [{
						items: [{
							fieldLabel: 'Primeiro e último nome',
							name: 'responsavel_nome',
							maxLength: 165,
							flex: 1
						},{
							fieldLabel: 'E-mail',
							name: 'responsavel_email',
							vtype: 'email',
							maxLength: 165,
							flex: 1
						},{
							xtype: 'hiddenfield',
							name: 'responsavel_telefone',
							allowBlank: true
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'displayfield',
							value: '+55',
							name: 'responsavel_telefone_cod_pais',
							allowBlank: true,
							width: 20
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'intfield',
							name: 'responsavel_telefone_cod_ddd',
							emptyText: 'DDD',
							allowBlank: true,
							allowNegative: false,
							minValue: 0,
							maxValue: 99,
							width: 40
						},{
							fieldLabel: 'Telefone',
							xtype: 'intfield',
							name: 'responsavel_telefone_numero',
							emptyText: 'Fone',
							allowBlank: true,
							allowNegative: false,
							maxLength: 10,
							width: 100
						},{
							xtype: 'hiddenfield',
							name: 'responsavel_celular',
							allowBlank: true
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'displayfield',
							value: '+55',
							name: 'responsavel_celular_cod_pais',
							width: 20
						},{
							fieldLabel: '&nbsp;',
							labelSeparator: '',
							xtype: 'intfield',
							name: 'responsavel_celular_cod_ddd',
							emptyText: 'DDD',
							allowNegative: false,
							minValue: 0,
							maxValue: 99,
							width: 40
						},{
							fieldLabel: 'Celular',
							xtype: 'intfield',
							name: 'responsavel_celular_numero',
							emptyText: 'Celular',
							allowNegative: false,
							maxLength: 10,
							width: 100
						},{
							fieldLabel: 'Responsável Rádio',
							name: 'responsavel_radio',
							allowBlank: true,
							maxLength: 20,
							width: 150
						}]
					}]
				},{
					title: 'Configurações para orçamentos/pedidos de venda:',
					items: [{
						items: [{
							xtype: 'percentfield',
							fieldLabel: 'IPI (%)',
							name: 'perc_ipi',
							allowNegative: false,
							minValue: 0,
							maxValue: 100,
							width: 80
						},{
							xtype: 'percentfield',
							fieldLabel: 'Imposto Materiral (%)',
							name: 'perc_imposto_mat',
							allowNegative: false,
							minValue: 0,
							maxValue: 100,
							flex: 1
						},{
							xtype: 'percentfield',
							fieldLabel: 'Imposto Beneficamento (%)',
							name: 'perc_imposto_benef',
							allowNegative: false,
							hideTrigger: true,
							minValue: 0,
							maxValue: 100,
							flex: 1
						},{
							xtype: 'percentfield',
							fieldLabel: 'Imposto Mão de Obra (%)',
							name: 'perc_imposto_mdo',
							allowNegative: false,
							minValue: 0,
							maxValue: 100,
							flex: 1
						},{
							xtype: 'percentfield',
							fieldLabel: 'Serviço/Produto (%)',
							name: 'perc_imposto_geral',
							allowNegative: false,
							minValue: 0,
							maxValue: 100,
							flex: 1
						},{
							xtype: 'percentfield',
							fieldLabel: 'Margem para orçamento (%)',
							name: 'perc_margem_orcamento',
							allowNegative: false,
							minValue: 0,
							maxValue: 100,
							flex: 1
						},{
							xtype: 'intfield',
							fieldLabel: 'DDD',
							name: 'cod_ddd',
							allowNegative: false,
							value: App.empresa.cod_ddd,
							width: 50
						}]
					}]
				},{
					title: 'Plano PreventivoCloud',
					items: [{
						items: [{
							xtype: 'displayfield',
							fieldLabel: 'Plano atual',
							name: 'plano_atual',
							width: 200
						},{
							xtype: 'displayfield',
							fieldLabel: 'Orçamentos',
							name: 'orcamentos',
							width: 80
						},{
							xtype: 'planosprecoscombo',
							fieldLabel: 'Alterar plano',
							name: 'prev_planos_id',
							flex: 1
						},{
							xtype: 'checkbox',
							name: 'auto_expandir_plano',
							fieldLabel: 'Selecione essa opção se deseja que seu plano seja flexível, por demanda',
							boxLabel: 'Auto ajustar meu plano',
							allowBlank: true,
							inputValue: 1,
							checked: false,
							flex: 1
						}]
					}]
				}],
				buttons: [{
					text: 'Salvar',
					itemId: 'save',
					scale: 'medium',
					formBind: true,
					disabled: true,
					handler: this.onSave
				}]
			}
		});
		
		this.callParent(arguments);
	},
	
	save: function() {
		var me = this, form = me.down('form').getForm();
		form.findField('telefone1').setValue('+55 ' + form.findField('telefone1_cod_ddd').getValue() + ' ' + form.findField('telefone1_numero').getValue());
		form.findField('telefone2').setValue('+55 ' + form.findField('telefone2_cod_ddd').getValue() + ' ' + form.findField('telefone2_numero').getValue());
		form.findField('fax1').setValue('+55 ' + form.findField('fax1_cod_ddd').getValue() + ' ' + form.findField('fax1_numero').getValue());
		form.findField('fax2').setValue('+55 ' + form.findField('fax2_cod_ddd').getValue() + ' ' + form.findField('fax2_numero').getValue());
		form.findField('responsavel_telefone').setValue('+55 ' + form.findField('responsavel_telefone_cod_ddd').getValue() + ' ' + form.findField('responsavel_telefone_numero').getValue());
		form.findField('responsavel_celular').setValue('+55 ' + form.findField('responsavel_celular_cod_ddd').getValue() + ' ' + form.findField('responsavel_celular_numero').getValue());
		form.submit({
			clientValidation: true,
			url: 'mod/sistema/empresas/php/response.php',
			method: 'post',
			params: {m: 'save_empresa'},
			failure: App.formFailure,
			success: function(f, a) {
				Ext.apply(App.empresa, f.getValues());
				if (a.result.hasOwnProperty('logotipo')) {
					if (!Ext.isEmpty(a.result.logotipo)) {
						App.empresa.logotipo = a.result.logotipo;
					}
				}
				me.close();
			}
		});
	},
	
	onEnterkey: function(f, e) {
		if (e.getKey() == e.ENTER) {
			var form = this.up('form');
			if (form.getForm().isValid()) {
				var me = this.up('window');
				me.down('#save').disable();
				me.save();
			}
		}
	},
	
	onSave: function() {
		this.disable();
		this.up('window').save();
	},
	
	loadRecord: function(record) {
		if (record) {
			var me = this.down('form'), form = me.getForm(),
			record = Ext.create('Empresa.data.Model', record);
			
			form.loadRecord(record);
			
			var logotipo = record.get('logotipo');
			
			if (!Ext.isEmpty(logotipo)) {
				var container = me.down('#main-fc-area');
				if (container) {
					container.remove(form.findField('logotipo'));
					container.add({
						xtype: 'displayfield',
						fieldLabel: 'Logotipo',
						name: 'logotipo_trocar',
						value: '<a onclick="Img.show(\'mod/sistema/empresas/logo/'+logotipo+'\')" href="javascript:;">visualizar</a> | <a class="cp-change-logo" href="javascript:;">trocar</a>'
					});
					var changeLogoLink = form.findField('logotipo_trocar').getEl().down('a.cp-change-logo');
					if (changeLogoLink) {
						changeLogoLink.on('click', function(){
							var logoField = form.findField('logotipo_trocar');
							logoField.animate({
								duration: 800,
								from: {opacity:1},
								to: {opacity:0},
								callback: function() {
									container.remove(logoField);
									container.add({
										xtype: 'filefield', 
										fieldLabel: 'Logotipo',
										name: 'logotipo',
										buttonText: 'Buscar',
										emptyText: 'Selecione uma imagem',
										style: 'opacity:0;',
										width: 200
									});
									form.findField('logotipo').animate({
										duaration: 800,
										from:{opacity:0},
										to:{opacity:1}
									});
								}
							});
						});
					}
				}
			}
			
			if (record.get('perfil') == 'modulos_marmoraria') {
				form.findField('perc_ipi').setVisible(true);
				form.findField('perc_imposto_mat').setVisible(true);
				form.findField('perc_imposto_benef').setVisible(true);
				form.findField('perc_imposto_mdo').setVisible(true);
				form.findField('perc_margem_orcamento').setVisible(true);
				form.findField('perc_imposto_geral').setVisible(false);
			} else {
				form.findField('perc_ipi').setVisible(false);
				form.findField('perc_imposto_mat').setVisible(false);
				form.findField('perc_imposto_benef').setVisible(false);
				form.findField('perc_imposto_mdo').setVisible(false);
				form.findField('perc_margem_orcamento').setVisible(false);
				form.findField('perc_imposto_geral').setVisible(true);
			}
			
			var telefone1 = record.get('telefone1').split(' '),
				telefone2 = record.get('telefone2').split(' '),
				fax1 = record.get('fax1').split(' '),
				fax2 = record.get('fax2').split(' '),
				responsavel_telefone = record.get('responsavel_telefone').split(' '),
				responsavel_celular = record.get('responsavel_celular').split(' ');
			
			if (telefone1.length == 3) {
				form.findField('telefone1_cod_ddd').setValue(telefone1[1]);
				form.findField('telefone1_numero').setValue(telefone1[2]);
			}
			
			if (telefone2.length == 3) {
				form.findField('telefone2_cod_ddd').setValue(telefone2[1]);
				form.findField('telefone2_numero').setValue(telefone2[2]);
			}
			
			if (fax1.length == 3) {
				form.findField('fax1_cod_ddd').setValue(fax1[1]);
				form.findField('fax1_numero').setValue(fax1[2]);
			}
			
			if (fax2.length == 3) {
				form.findField('fax2_cod_ddd').setValue(fax2[1]);
				form.findField('fax2_numero').setValue(fax2[2]);
			}
			if (responsavel_telefone.length == 3) {
				form.findField('responsavel_telefone_cod_ddd').setValue(responsavel_telefone[1]);
				form.findField('responsavel_telefone_numero').setValue(responsavel_telefone[2]);
			}
			
			if (responsavel_celular.length == 3) {
				form.findField('responsavel_celular_cod_ddd').setValue(responsavel_celular[1]);
				form.findField('responsavel_celular_numero').setValue(responsavel_celular[2]);
			}
		}
	}
});