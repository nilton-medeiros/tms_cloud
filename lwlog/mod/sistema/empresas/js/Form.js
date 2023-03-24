Ext.define('Empresa.form.Panel', {
	extend: 'Ext.form.Panel',
	alias: 'widget.empresaform',
	
	initComponent: function(){
		Ext.apply(this, {
			bodyPadding: 10,
			autoScroll: true,
			layout: 'anchor',
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
				title: 'Identificação do Emitente',
				items: [{
					itemId: 'main-fc-area',
					items: [{
						fieldLabel: 'Razão Social',
						name: 'emp_razao_social',
						maxLength: 60
					},{
						fieldLabel: 'Nome Fantasia',
						name: 'emp_nome_fantasia',
						maxLength: 60
					},{
						xtype: 'hiddenfield',
						name: 'emp_id',
						allowBlank: true,
						flex: null
					},{
						xtype: 'filefield', 
						fieldLabel: 'Logotipo',
						name: 'emp_logotipo',
						buttonText: 'Buscar',
						emptyText: 'Selecione uma imagem',
						width: 200,
						flex: null,
						listeners: {
							afterrender:function(cmp){
								cmp.fileInputEl.set({
									accept:'image/*'
								});
							}
						}
					}]
				},{
					items: [{
						xtype: 'cnpjfield',
						fieldLabel: 'CNPJ',
						name: 'emp_cnpj',
						formalias: 'empresaform',
						maxLength: 14,
						fields: {
							razao_social: 'emp_razao_social',
							nome_fantasia: 'emp_nome_fantasia',
							ie: 'emp_inscricao_estadual',
							endereco: 'emp_logradouro',
							complemento: 'emp_complemento',
							cep: 'emp_cep',
							bairro: 'emp_bairro',
							numero: 'emp_numero'
						}
					},{
						fieldLabel: 'Inscrição Estadual',
						name: 'emp_inscricao_estadual',
						maxLength: 14
					},{
						fieldLabel: 'Sigla CIA / Filial',
						name: 'emp_sigla_cia',
						maxLength: 3,
						minLength: 2
					},{
						xtype: 'localcombo',
						fieldLabel: 'Tipo de cubagem',
						name: 'emp_tipo_calculo_cubagem',
						flex: null,
						width: 115,
						value: 'AEREO',
						options: ['AEREO','RODOVIARIO']
					},{
						xtype: 'radiogroup',
						fieldLabel: 'Modal',
						flex: null,
						width: 250,
						defaults: {
							name: 'emp_modal',
							checked: false
						},
						items: [{
							boxLabel: 'Ambos',
							inputValue: 'Ambos'
						},{
							boxLabel: 'Aéreo',
							inputValue: 'Aereo',
							checked: true,
							listeners: {
								change: function(f, checked) {
									var form = f.up('form').getForm(),
									field = form.findField('emp_RNTRC');
									field.setReadOnly(checked);
									field.allowBlank = checked;
									form.isValid();
								}
							}
						},{
							itemId: 'rod-radio',
							boxLabel: 'Rodoviário',
							inputValue: 'Rodoviario',
							listeners: {
								change: function(f, checked) {
									var me = f.up('form'), form = me.getForm(),
									f1 = form.findField('emp_seguradora'),
									f2 = form.findField('emp_apolice'),
									isEmiteCte = me.down('#emitcte-radio').getValue();
									f1.allowBlank = !checked && !isEmiteCte;
									f2.allowBlank = !checked && !isEmiteCte;
									form.isValid();
								}
							}
						}]
					},{
						xtype: 'checkboxfield',
						fieldLabel: 'Status',
						boxLabel: 'Ativa',
						name: 'emp_ativa',
						inputValue: 1,
						checked: true,
						flex: null,
						width: 60
					}]
				}]
			},{
				title: 'Endereço',
				items: [{
					items: [{
						xtype: 'enderecocombo',
						fieldLabel: 'Logradouro',
						name: 'emp_logradouro',
						valueField: 'endereco',
						displayField: 'endereco',
						maxLength: 60,
						flex: 2,
						fields: {
							cep: 'emp_cep',
							bairro: 'emp_bairro',
							numero: 'emp_numero'
						}
					},{
						fieldLabel: 'Número',
						name: 'emp_numero',
						maxLength: 20
					},{
						fieldLabel: 'Complemento',
						name: 'emp_complemento',
						maxLength: 60,
						flex: 2,
						allowBlank: true
					}]
				},{
					items: [{
						fieldLabel: 'Bairro',
						name: 'emp_bairro',
						maxLength: 60
					},{
						fieldLabel: 'CEP',
						name: 'emp_cep',
						maxLength: 8
					},{
						xtype: 'cidadecombo',
						fieldLabel: 'Cidade',
						name: 'cid_id_fk',
						listeners: {
							select: function(f, records) {
								var record = records[0],
								form = f.up('form').getForm(),
								f1 = form.findField('cid_sigla'),
								f2 = form.findField('cid_nome_aeroporto');
								f1.setValue(record.get('cid_sigla'));
								f2.setValue(record.get('cid_nome_aeroporto'));
							}
						}
					},{
						fieldLabel: 'SIGLA',
						name: 'cid_sigla',
						readOnly: true,
						allowBlank: true,
						flex: null,
						width: 80
					},{
						fieldLabel: 'AEROPORTO',
						name: 'cid_nome_aeroporto',
						readOnly: true,
						allowBlank: true
					}]
				},{
					items: [{
						fieldLabel: 'Telefone #1',
						name: 'emp_fone1',
						vtype: 'phone',
						maxLength: 15
					},{
						fieldLabel: 'Telefone #2',
						name: 'emp_fone2',
						vtype: 'phone',
						maxLength: 15,
						allowBlank: true
					}]
				}]
			},{
				title: 'Emissão de CT-e / Cotação',
				items: [{
					items: [{
						xtype: 'radiogroup',
						fieldLabel: 'Tipo de Ambiente',
						flex: null,
						width: 200,
						defaults: {
							name: 'emp_ambiente_sefaz',
							checked: false
						},
						items: [{
							boxLabel: 'Produção',
							inputValue: 1
						},{
							boxLabel: 'Homologação',
							checked: true,
							inputValue: 2
						}]
					},{
						xtype: 'radiogroup',
						fieldLabel: 'Tipo de Emitente',
						flex: null,
						width: 350,
						defaults: {
							name: 'emp_tipo_emitente',
							checked: false
						},
						items: [{
							itemId: 'emitcte-radio',
							boxLabel: 'Emitente CT-e',
							inputValue: 'CTE',
							checked: true,
							listeners: {
								change: function(f, checked) {
									var me = f.up('form'), form = me.getForm(),
									f1 = form.findField('emp_email_contabil'),
									f2 = form.findField('emp_email_comercial'),
									f3 = form.findField('emp_seguradora'),
									f4 = form.findField('emp_apolice'),
									f5 = form.findField('emp_email_CCO'),
									isRod = me.down('#rod-radio').getValue();
									f1.allowBlank = !checked;
									f2.allowBlank = !checked;
									f3.allowBlank = !checked && !isRod;
									f4.allowBlank = !checked && !isRod;
									f5.setValue(checked);
								}
							}
						},{
							boxLabel: 'Cia Aérea/AWB',
							inputValue: 'AWB'
						},{
							boxLabel: 'Nota Despacho',
							inputValue: 'ND'
						}]
					},{
						xtype: 'radiogroup',
						fieldLabel: 'DACTE - Layout',
						flex: null,
						width: 200,
						defaults: {
							name: 'emp_dacte_layout',
							checked: false
						},
						items: [{
							boxLabel: 'Retrato',
							inputValue: 'RETRATO',
							checked: true
						},{
							boxLabel: 'Paisagem',
							inputValue: 'PAISAGEM'
						}]
					},{
						xtype: 'decimalfield',
						fieldLabel: 'Versão do XML',
						name: 'emp_versao_layout_xml',
						value: 2
					},{
						fieldLabel: 'Modelo',
						name: 'emp_cte_modelo',
						value: 57,
						maxLength: 2,
						minLength: 2
					},{
						xtype: 'intfield',
						fieldLabel: 'Série',
						name: 'emp_cte_serie',
						value: 0,
						minValue: 0,
						maxValue: 999
					}]
				},{
					items: [{
						xtype: 'intfield',
						fieldLabel: 'Percentual para margem mínima para cálculo do lucro na cotação',
						name: 'emp_margem_lucro_min',
						value: 0,
						minValue: 0,
						maxValue: 100
					},{
						xtype: 'intfield',
						fieldLabel: 'Percentual padrão para margem do lucro na cotação',
						name: 'emp_margem_lucro_padrao',
						value: 0,
						minValue: 0,
						maxValue: 100
					}]
				}]
			},{
				title: 'Impostos e Registro Nacional de Transporte Rodoviário de Cargas',
				items: [{
					items: [{
						xtype: 'checkboxfield',
						name: 'emp_simples_nacional',
						fieldLabel: '&nbsp;',
						labelSeparator: '',
						boxLabel: 'Optante pelo Simples Nacional',
						inputValue: 1,
						listeners: {
							change: function(f, checked) {
								var form = f.up('form').getForm(),
								f1 = form.findField('emp_PIS'),
								f2 = form.findField('emp_COFINS');
								if (checked) {
									f1.reset();
									f1.clearInvalid();
									f2.reset();
									f2.clearInvalid();
								}
								f1.setDisabled(checked);
								f2.setDisabled(checked);
							}
						}
					},{
						xtype: 'decimalfield',
						fieldLabel: 'PIS',
						name: 'emp_PIS',
						value: 0,
						minValue: 0,
						maxValue: 9999.99
					},{
						xtype: 'decimalfield',
						fieldLabel: 'COFINS',
						name: 'emp_COFINS',
						value: 0,
						minValue: 0,
						maxValue: 9999.99
					},{
						fieldLabel: 'RNTRC',
						name: 'emp_RNTRC',
						maxLength: 14,
						readOnly: true
					}]
				}]
			},{
				title: 'Informações de integração CT-e -> Sefaz',
				items: [{
					items: [{
						fieldLabel: 'E-mail Contabilidade',
						name: 'emp_email_contabil',
						//vtype: 'email',
						maxLength: 250
					},{
						fieldLabel: 'E-mail Comercial',
						name: 'emp_email_comercial',
						//vtype: 'email',
						maxLength: 250
					},{
						xtype: 'checkboxfield',
						fieldLabel: 'Cópia oculta',
						boxLabel: 'E-mail CCO',
						name: 'emp_email_CCO',
						inputValue: 1,
						flex: null,
						width: 100,
						checked: true
					},{
						xtype: 'radiogroup',
						fieldLabel: 'Envio de arquivos por e-mail',
						flex: null,
						width: 250,
						defaults: {
							name: 'emp_enviar_cte',
							checked: false
						},
						items: [{
							boxLabel: 'XML',
							inputValue: 'XML'
						},{
							boxLabel: 'PDF',
							inputValue: 'PDF'
						},{
							boxLabel: 'Ambos',
							inputValue: 'Ambos',
							checked: true
						}]
					}]
				}]
			},{
				title: 'Mostrar / Ocultar Abas não utilizadas durante a digitação do CT-e',
				items: [{
					items: [{
						xtype: 'checkboxgroup',
						fieldLabel: 'Aéreo/Rodoviário',
						allowBlank: true,
						defaults: {
							allowBlank: true,
							checked: true,
							inputValue: 1
						},
						items: [{
							boxLabel: 'Documento de Transporte Aterior',
							name: 'emp_aba_doc_trans_ant'
						},{
							boxLabel: 'Produtos Perigosos',
							name: 'emp_aba_prod_perig'
						},{
							boxLabel: 'Veículos Novos',
							name: 'emp_aba_veic_novos'
						}]
					},{
						xtype: 'displayfield',
						fieldLabel: '&nbsp;',
						labelSeparator: '',
						value: '&nbsp;',
						flex: null,
						width: 10
					},{
						xtype: 'checkboxgroup',
						fieldLabel: 'Rodoviário',
						allowBlank: true,
						defaults: {
							allowBlank: true,
							checked: true,
							inputValue: 1
						},
						items: [{
							boxLabel: 'Vale Pedágio',
							name: 'emp_aba_vale_pedagio',
						},{
							boxLabel: 'Veículos',
							name: 'emp_aba_veiculos'
						},{
							boxLabel: 'Motoristas',
							name: 'emp_aba_motoristas'
						}]
					}]
				}]
			},{
				title: 'Informações do Seguro',
				items: [{
					items: [{
						fieldLabel: 'Seguradora',
						name: 'emp_seguradora',
						maxLength: 60,
						flex: 2,
						allowBlank: true,
						checkChangeEvents: ['change'],
						listeners: {
							change: function(f, newValue) {
								var form = f.up('form').getForm(),
								f1 = form.findField('emp_apolice');
								f1.allowBlank = Ext.isEmpty(newValue);
							}
						}
					},{
						fieldLabel: 'Apólice',
						name: 'emp_apolice',
						maxLength: 20,
						allowBlank: true,
						checkChangeEvents: ['change'],
						listeners: {
							change: function(f, newValue) {
								var form = f.up('form').getForm(),
								f1 = form.findField('emp_seguradora');
								if (Ext.isEmpty(f1.getValue()) && !Ext.isEmpty(newValue)) {
									f.reset();
								}
							}
						}
					}]
				},{
					items: [{
						xtype: 'displayfield',
						fieldLabel: 'Notas',
						value: 'Dados obrigatórios apenas no Modal Rodoviário, depois da lei 11.442/07, para os demais modais são opcionais.<br><br>Em casos que o tomador do serviço, remetente ou destinatário tenham seguro próprio, poderá ser informado pelo emissor durante a digitação do CT-e a seguradora do mesmo previamente informada no cadastro de clientes.'
					}]
				},{
					items: [{
						xtype: 'decimalfield',
						fieldLabel: 'Taxa Mínima Nacional',
						name: 'emp_taxa_min_nac',
						value: 0,
						minValue: 0,
						maxValue: 9999.99
					},{
						flex: 2,
						xtype: 'displayfield',
						hibeLabel: true,
						value: '<br>Taxa Mínima Nacional para esta empresa, usada como delimitador entre produtos como bijuterias e outros no cálculo do advalorem (seguro).'
					}]
				}]
			},{
				title: 'Faturamento',
				items: [{
					items: [{
						xtype: 'radiogroup',
						fieldLabel: 'Frequência do Faturamento',
						defaults: {
							name: 'emp_faturamento',
							checked: false
						},
						items: [{
							boxLabel: 'Decendial',
							inputValue: 'DECENDIAL'
						},{
							boxLabel: 'Semanal',
							inputValue: 'SEMANAL',
							checked: true
						},{
							boxLabel: 'Quinzenal',
							inputValue: 'QUINZENAL'
						},{
							boxLabel: 'Mensal',
							inputValue: 'MENSAL'
						}]
					},{
						xtype: 'intfield',
						fieldLabel: 'Dias para vencimento',
						name: 'emp_dias_vecto',
						value: 11,
						minValue: 0,
						maxValue: 99,
						flex: null,
						width: 150
					},{
						xtype: 'displayfield',
						value: 'Quantidade de dias corridos para o vencimento do boleto após última data do período. O vencimento não pode ser menor que a data de emissão do boleto.'
					}]
				}]
			}],
			buttons: [{
				text: 'Salvar',
				scale: 'medium',
				disabled: true,
				formBind: true,
				handler: this.save
			}]
		});
		this.callParent(arguments);
	},
	
	save: function(btn) {
		var me = btn.up('form'), form = me.getForm();
		if (!form.isValid()) {
			return false;
		}
		
		var originalText = btn.getText();
		btn.setText('Salvando...');
		btn.setDisabled(true);
		
		form.submit({
			clientValidation: true,
			url: 'mod/sistema/empresas/php/response.php',
			method: 'post',
			params: {
				m: 'save_empresas'
			},
			failure: Ext.Function.createSequence(App.formFailure, function(){
				btn.setDisabled(false);
				btn.setText(originalText);
			}),
			success: function(f, a) {
				btn.setDisabled(false);
				btn.setText(originalText);
				if (App.empresa.emp_id == a.result.emp_id) {
					Ext.apply(App.empresa, f.getValues());
					if (!Ext.isEmpty(a.result.emp_logotipo)) {
						App.empresa.emp_logotipo = a.result.emp_logotipo;
						App.empresa.logo_url = App.siteUrl + 'alexpress/mod/sistema/empresas/logo/' + a.result.emp_logotipo;
					}
				}
				f.reset();
				f.isValid();
			}
		});
	},
	
	newRecord: function() {
		var me = this, form = me.getForm();
		
		var container = me.down('#main-fc-area'),
		logoField = form.findField('logotipo_trocar');
		
		if (logoField) {
			container.remove(logoField);
			container.add({
				xtype: 'filefield', 
				fieldLabel: 'Logotipo',
				name: 'emp_logotipo',
				buttonText: 'Buscar',
				emptyText: 'Selecione uma imagem',
				width: 200,
				flex: null,
				listeners: {
					afterrender:function(cmp){
						cmp.fileInputEl.set({
							accept:'image/*'
						});
					}
				}
			});
		}
		
		form.reset();
		form.isValid();
		
		setTimeout(function(){
			form.findField('emp_razao_social').focus();
		}, 600);
	},
	
	loadRecord: function(record) {
		if (!record) {
			return false;
		}
		var me = this, form = me.getForm();
		form.reset();
		form.loadRecord(record);
		
		var logotipo = record.get('emp_logotipo');
		
		if (!Ext.isEmpty(logotipo)) {
			var container = me.down('#main-fc-area');
			
			container.remove(form.findField('emp_logotipo'));
			container.remove(form.findField('logotipo_trocar'));
			
			container.add({
				flex: null,
				width: 200,
				xtype: 'displayfield',
				fieldLabel: 'Logotipo',
				name: 'logotipo_trocar',
				value: '<a onclick="Img.show(\'mod/sistema/empresas/logo/'+logotipo+'\')" href="javascript:;">visualizar</a> | <a class="cp-change-logo" href="javascript:;">trocar</a>'
			});
			
			var changeLogoLink = form.findField('logotipo_trocar').getEl().down('a.cp-change-logo');
			
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
							name: 'emp_logotipo',
							buttonText: 'Buscar',
							emptyText: 'Selecione uma imagem',
							style: 'opacity:0;',
							width: 200,
							flex: null,
							listeners: {
								afterrender:function(cmp){
									cmp.fileInputEl.set({
										accept:'image/*'
									});
								}
							}
						});
						form.findField('emp_logotipo').animate({
							duaration: 800,
							from: {
								opacity:0
							},
							to: {
								opacity:1
							}
						});
					}
				});
			});
		}
			
		form.isValid();
		setTimeout(function(){
			form.findField('emp_razao_social').focus();
		}, 600);
	}
});