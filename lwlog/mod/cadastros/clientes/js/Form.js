Ext.define('Cliente.Aeroporto.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.cliaeroportogrid',
	
	clie_id: 0,
	cid_uf: null,
	
	setCidUF: function(cid_uf) {
		/* Comentado devido a uma excessão da emissão de CTE Redepascho Intermediário 29/01/2016 
		var me = this, 
		combo = me.cidadeEditor,
		store = combo.getStore(),
		proxy = store.getProxy();
		me.cid_uf = cid_uf;
		if (Ext.isEmpty(cid_uf)) {
			store.removeAll();
			combo.reset();
		} else if (cid_uf != proxy.extraParams.cid_uf) {
			var selected = [];
			me.store.each(function(r){
				if (r.get('cid_uf') != cid_uf) {
					selected.push(r);
				}
			});
			if (selected.length) {
				me.store.remove(selected);
			}
		} 
		proxy.setExtraParam('cid_uf', cid_uf);*/
	},
	
	setClieID: function(clie_id) {
		var me = this, 
		store = me.store,
		proxy = store.getProxy();
		if (clie_id > 0 && proxy.extraParams.clie_id != clie_id) {
			proxy.setExtraParam('clie_id', clie_id);
			store.load();
		} else {
			store.removeAll();
			proxy.setExtraParam('clie_id', 0);
		}
		me.clie_id = clie_id;
	},
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Cidade.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/clientes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_cidades',
					clie_id: me.clie_id
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
				property: 'cid_nome',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.clie_id > 0;
				}
			}
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 1,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
					/*return !Ext.isEmpty(me.cid_uf);*/
				},
				edit: function(editor, e) {
					if (me.clie_id > 0 && e.record.get('cid_id') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/clientes/php/response.php',
							method: 'post',
							params: {
								m: 'save_cidades',
								clie_id: me.clie_id,
								cid_id: e.record.get('cid_id')
							},
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.commit();
								} else {
									App.warning(o);
								}
							}
						});
					}
				}
			}
		});
		
		me.cidadeEditor = Ext.create('Cidade.form.Select', {
			xtype: 'cidadecombo',
			valueField: 'cid_nome',
			displayField: 'cid_nome',
			allowBlank: false,
			selectOnFocus: true,
			listeners: {
				select: function(f, records) {
					var record = records[0];
					me.activeRecord.set('cid_id', record.get('cid_id'));
					me.activeRecord.set('cid_sigla', record.get('cid_sigla'));
					me.activeRecord.set('cid_nome_aeroporto', record.get('cid_nome_aeroporto'));
				}
			}
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableColumnHide: false,
			emptyText: 'Nenhum item encontrado',
			plugins: [me.editing],
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			columns: [{
				dataIndex: 'cid_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				filterable: true,
				width: 70
			},{
				dataIndex: 'cid_nome',
				text: 'Cidade',
				width: 300,
				editor: me.cidadeEditor
			},{
				dataIndex: 'cid_sigla', 
				text: 'Sigla',
				tooltip: 'Sigla Aérea',
				width: 60
			},{
				dataIndex: 'cid_nome_aeroporto',
				text: 'Aeroporto',
				tooltip: 'Nome do Aeroporto',
				width: 300
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Incluir',
					handler: function() {
						/*if (Ext.isEmpty(me.cid_uf)) {
							return false;
						}*/
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Cidade.data.Model'));
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
						if (me.clie_id > 0) {
							var cid_id = [];
							Ext.each(selections, function(record){
								if (record.get('cid_id') > 0) {
									cid_id.push(record.get('cid_id'));
								}
							});
							if (cid_id.length) {
								Ext.Ajax.request({
									url: 'mod/cadastros/clientes/php/response.php',
									method: 'post',
									params: {
										m: 'delete_cidades',
										clie_id: me.clie_id,
										cid_id: cid_id.join(',')
									},
									failure: App.ajaxFailure,
									success: App.ajaxDeleteSuccess
								});
							}
						}
						me.store.remove(selections);
					}
				}]
			},{
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
					text: 'Atualizar',
					iconCls: 'x-tbar-loading',
					handler: function(btn) {
						var originalText = btn.getText(),
						refreshText = 'Atualizando...';
						btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
						me.store.reload({
							callback: function() {
								btn.setText(originalText);
							}
						});
					}
				}]
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0);
				}
			}
		});
		
		me.callParent(arguments);
	},
	
	getDataID: function() {
		var selected = [];
		this.store.each(function(record) {
			if (record.get('cid_id') > 0) {
				selected.push(record.get('cid_id'));
			}
		});
		return selected.join(',');
	}
});

Ext.define('Cliente.Produto.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.cliprodutogrid',
	
	clie_id: 0,
	checkIDBeforeInsert: false,
	
	setClieID: function(clie_id) {
		var me = this, 
		store = me.store,
		proxy = store.getProxy();
		if (clie_id > 0 && proxy.extraParams.clie_id != clie_id) {
			proxy.setExtraParam('clie_id', clie_id);
			store.load();
		} else {
			store.removeAll();
			proxy.setExtraParam('clie_id', 0);
		}
		me.clie_id = clie_id;
	},
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Produto.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/clientes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_produtos'
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
				property: 'prod_nome',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.clie_id > 0;
				}
			}
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 1,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
				},
				edit: function(editor, e) {
					if (me.clie_id > 0 && e.record.get('prod_id') > 0) {
						Ext.Ajax.request({
							url: 'mod/cadastros/clientes/php/response.php',
							method: 'post',
							params: {
								m: 'save_produtos',
								clie_id: me.clie_id,
								prod_id: e.record.get('prod_id')
							},
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.commit();
								} else {
									App.warning(o);
								}
							}
						});
					}
				}
			}
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableColumnHide: false,
			emptyText: 'Nenhum item encontrado',
			plugins: [me.editing],
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			columns: [{
				dataIndex: 'prod_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70
			},{
				dataIndex: 'gt_descricao',
				text: 'Grupos de Tarifas',
				align: 'right',
				width: 200
			},{
				dataIndex: 'prod_nome',
				text: 'Produto',
				width: 500,
				editor: {
					xtype: 'produtocombo',
					valueField: 'prod_nome',
					displayField: 'prod_nome',
					allowBlank: false,
					selectOnFocus: true,
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('prod_id', record.get('prod_id'));
							me.activeRecord.set('gt_descricao', record.get('gt_id_codigo') + ' - ' + record.get('gt_descricao'));
							me.activeRecord.set('iic_nome', record.get('iic_nome'));
						}
					}
				}
			},{
				dataIndex: 'iic_nome',
				text: 'IATA',
				tooltip: 'IATA IMP (Interline Message Procedure) CODES - Para produtos perigosos',
				align: 'center',
				width: 300
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Incluir',
					handler: function() {
						if (me.checkIDBeforeInsert && !me.clie_id) {
							return false;
						}
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Produto.data.Model'));
						me.editing.startEditByPosition({row: 0, column: 2});
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
						if (me.clie_id > 0) {
							var prod_id = [];
							Ext.each(selections, function(record){
								if (record.get('prod_id') > 0) {
									prod_id.push(record.get('prod_id'));
								}
							});
							if (prod_id.length) {
								Ext.Ajax.request({
									url: 'mod/cadastros/clientes/php/response.php',
									method: 'post',
									params: {
										m: 'delete_produtos',
										clie_id: me.clie_id,
										prod_id: prod_id.join(',')
									},
									failure: App.ajaxFailure,
									success: App.ajaxDeleteSuccess
								});
							}
						}
						me.store.remove(selections);
					}
				}]
			},{
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
					text: 'Atualizar',
					iconCls: 'x-tbar-loading',
					handler: function(btn) {
						var originalText = btn.getText(),
						refreshText = 'Atualizando...';
						btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
						me.store.reload({
							callback: function() {
								btn.setText(originalText);
							}
						});
					}
				}]
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0);
				}
			}
		});
		
		me.callParent(arguments);
	},
	
	getDataID: function() {
		var selected = [];
		this.store.each(function(record) {
			if (record.get('prod_id') > 0) {
				selected.push(record.get('prod_id'));
			}
		});
		return selected.join(',');
	}
});

Ext.define('Cliente.form.Panel', {
	extend: 'Ext.form.Panel',
	alias: 'widget.clienteform',
	
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
				title: 'Identificação do Cliente',
				items: [{
					items: [{
						xtype: 'localcombo',
						fieldLabel: 'Categoria',
						name: 'clie_categoria',
						flex: null,
						width: 150,
						value: 4,
						options: [{
							id: 0,
							field: 'Remetente'
						},{
							id: 1,
							field: 'Expedidor'
						},{
							id: 2,
							field: 'Recebedor'
						},{
							id: 3,
							field: 'Destinatário'
						},{
							id: 4,
							field: 'Todos'
						},{
							id: 5,
							field: 'Representante'
						}]
					},{
						xtype: 'hiddenfield',
						name: 'clie_id',
						allowBlank: true,
						flex: null
					},{
						fieldLabel: 'Razão Social/Nome',
						name: 'clie_razao_social',
						maxLength: 60
					},{
						fieldLabel: 'Nome Fantasia/Apelido',
						name: 'clie_nome_fantasia',
						maxLength: 60,
						allowBlank: true
					},{
						xtype: 'localcombo', 
						fieldLabel: 'Estabelecimento',
						name: 'clie_tipo_estabelecimento',
						value: 'COMERCIAL',
						flex: null,
						width: 200,
						options: ['TRANSPORTADORA', 'INDÚSTRIA', 'COMERCIAL', 'COMUNICAÇÕES', 'ENERGIA ELÉTRICA', 'PRODUTOR RURAL','PESSOA FÍSICA']
					},{
						xtype: 'checkboxfield',
						fieldLabel: 'Status',
						boxLabel: 'Ativo',
						name: 'clie_ativo',
						checked: true,
						inputValue: 1,
						flex: null,
						width: 60
					},{
						xtype: 'checkboxfield',
						fieldLabel: 'Compartilhar registro',
						boxLabel: 'Compartilhar entre empresas',
						name: 'clie_compartilhado',
						inputValue: 1,
						checked: false,
						flex: null,
						width: 200
					}]
				},{
					items: [{
						xtype: 'radiogroup',
						fieldLabel: 'Tipo de Documento',
						flex: null,
						width: 150,
						defaults: {
							name: 'clie_tipo_documento',
							checked: false
						},
						items: [{
							boxLabel: 'CNPJ',
							inputValue: 'CNPJ',
							checked: true,
							listeners: {
								change: function(f, checked) {
									var form = f.up('form').getForm(),
									f1 = form.findField('clie_cnpj'),
									f2 = form.findField('clie_ie_isento'),
									f3 = form.findField('clie_inscr_estadual'),
									f4 = form.findField('clie_inscr_municipal'),
									f5 = form.findField('clie_cpf'),
									f6 = form.findField('clie_rg'),
									f7 = form.findField('clie_situacao_cadastral'),
									f8 = form.findField('clie_contrib_icms'),
									f9 = form.findField('clie_codigo_transporte');
									
									if (checked) {
										f1.setVisible(true);
										f1.allowBlank = false;
										
										f2.setVisible(true);
										f3.setVisible(true);
										f4.setVisible(true);
										f7.setVisible(true);
										f8.setVisible(true);
										f9.setVisible(true);
										
										f5.allowBlank = true;
										f5.reset();
										f5.clearInvalid();
										f5.setVisible(false);
										
										f6.reset();
										f6.clearInvalid();
										f6.setVisible(false);
									} else {
										f1.allowBlank = true;
										f1.reset();
										f1.clearInvalid();
										f1.setVisible(false);
										
										f2.reset();
										f2.clearInvalid();
										f2.setVisible(false);
										
										f3.reset();
										f3.clearInvalid();
										f3.setVisible(false);
										
										f4.reset();
										f4.clearInvalid();
										f4.setVisible(false);
										
										f7.reset();
										f7.clearInvalid();
										f7.setVisible(false);
										
										f8.reset();
										f8.clearInvalid();
										f8.setVisible(false);
										
										f9.reset();
										f9.clearInvalid();
										f9.setVisible(false);
										
										f5.setVisible(true);
										f5.allowBlank = false;
										
										f6.setVisible(true);
									}
								}
							}
						},{
							boxLabel: 'CPF',
							inputValue: 'CPF'
						}]
					},{
						xtype: 'cnpjfield',
						fieldLabel: 'CNPJ',
						name: 'clie_cnpj',
						formalias: 'clienteform',
						maxLength: 14,
						allowBlank: true,
						fields: {
							razao_social: 'clie_razao_social',
							nome_fantasia: 'clie_nome_fantasia',
							ie: 'clie_inscr_estadual',
							endereco: 'clie_logradouro',
							complemento: 'clie_complemento',
							cep: 'clie_cep',
							bairro: 'clie_bairro',
							numero: 'clie_numero',
							situacao_cadastral_receita: 'clie_situacao_cadastral'
						}
					},{
						xtype: 'checkboxfield',
						fieldLabel: 'Inscrição Estadual',
						boxLabel: 'ISENTO',
						name: 'clie_ie_isento',
						inputValue: 1,
						flex: null,
						width: 150,
						allowBlank: true,
						listeners: {
							change: function(f, checked) {
								var form = f.up('form').getForm(),
								f1 = form.findField('clie_inscr_estadual');
								f1.setValue('');
								f1.setReadOnly(checked);
							}
						}
					},{
						fieldLabel: 'Inscrição Estadual',
						name: 'clie_inscr_estadual',
						maxLength: 14,
						allowBlank: true
					},{
						fieldLabel: 'Inscrição Municipal',
						name: 'clie_inscr_municipal',
						maxLength: 14,
						allowBlank: true
					},{
						fieldLabel: 'CPF',
						name: 'clie_cpf',
						vtype: 'cpf',
						maxLength: 14,
						hidden: true,
						allowBlank: true
					},{
						fieldLabel: 'RG',
						name: 'clie_rg',
						maxLength: 11,
						hidden: true,
						allowBlank: true
					},{
						fieldLabel: 'Situação Cadastral',
						name: 'clie_situacao_cadastral',
						maxLength: 20,
						allowBlank: true
					},{
						xtype: 'checkboxfield',
						fieldLabel: 'Cliente Contribuinte',
						boxLabel: 'ICMS',
						name: 'clie_contrib_icms',
						inputValue: 1,
						flex: null,
						width: 150,
						allowBlank: true
					},{
						fieldLabel: 'Código de Transporte',
						name: 'clie_codigo_transporte',
						maxLength: 20,
						allowBlank: true
					}]
				}]
			},{
				title: 'Endereço e Acesso ao site',
				items: [{
					items: [{
						xtype: 'enderecocombo',
						fieldLabel: 'Logradouro',
						name: 'clie_logradouro',
						valueField: 'endereco',
						displayField: 'endereco',
						maxLength: 60,
						flex: 2,
						fields: {
							cep: 'clie_cep',
							bairro: 'clie_bairro',
							numero: 'clie_numero'
						}
					},{
						fieldLabel: 'Número',
						name: 'clie_numero',
						maxLength: 20
					},{
						fieldLabel: 'Complemento',
						name: 'clie_complemento',
						maxLength: 60,
						flex: 2,
						allowBlank: true
					}]
				},{
					items: [{
						fieldLabel: 'Bairro',
						name: 'clie_bairro',
						maxLength: 60
					},{
						fieldLabel: 'CEP',
						name: 'clie_cep',
						maxLength: 8
					},{
						xtype: 'cidadecombo',
						fieldLabel: 'Cidade',
						name: 'cid_id',
						listeners: {
							reset: function() {
								this.up('form').down('cliaeroportogrid').setCidUF(null);
							},
							select: function(f, records) {
								var record = records[0], me = f.up('form'),
								form = me.getForm(),
								f1 = form.findField('cid_sigla'),
								f2 = form.findField('cid_nome_aeroporto');
								f1.setValue(record.get('cid_sigla'));
								f2.setValue(record.get('cid_nome_aeroporto'));
								me.down('cliaeroportogrid').setCidUF(record.get('cid_uf'));
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
						name: 'clie_fone1',
						vtype: 'phone',
						maxLength: 15
					},{
						fieldLabel: 'Telefone #2',
						name: 'clie_fone2',
						vtype: 'phone',
						maxLength: 15,
						allowBlank: true
					},{
						fieldLabel: 'Login de acesso ao site',
						name: 'clie_login',
						maxLength: 15,
						allowBlank: true
					},{
						fieldLabel: 'Senha de acesso ao site',
						name: 'clie_senha',
						maxLength: 15,
						allowBlank: true
					}]
				}]
			},{
				title: 'Informações do Seguro',
				items: [{
					items: [{
						fieldLabel: 'Seguradora',
						name: 'clie_seguradora',
						maxLength: 60,
						allowBlank: true
					},{
						fieldLabel: 'Apólice',
						name: 'clie_apolice',
						maxLength: 20,
						allowBlank: true
					},{
						xtype: 'localcombo',
						fieldLabel: 'Forma para Aplicar Seguro',
						name: 'clie_forma_aplicar_seguro',
						value: 'Nenhum',
						options: ['Nenhum','Intra/Inter Estadual','Ad valorem Tipo 1 e 2','Taxa RCTR-C'],
						listeners: {
							reset: function() {
								var form = this.up('form').getForm(),
								//f1 = form.findField('clie_seguro_desconto'),
								f2 = form.findField('clie_seguro_intra_estadual'),
								f3 = form.findField('clie_seguro_inter_estadual'),
								f4 = form.findField('clie_seguro_adval_tipo_1'),
								f5 = form.findField('clie_seguro_adval_tipo_2');
								/*
								f1.reset();
								f1.clearInvalid();
								f1.setDisabled(true);
								*/
								f2.reset();
								f2.clearInvalid();
								f2.setDisabled(true);
								
								f3.reset();
								f3.clearInvalid();
								f3.setDisabled(true);
								
								f4.reset();
								f4.clearInvalid();
								f4.setDisabled(true);
								
								f5.reset();
								f5.clearInvalid();
								f5.setDisabled(true);
							},
							select: function(f, records) {
								var record = records[0], value = f.getValue(),
								form = f.up('form').getForm(),
								//f1 = form.findField('clie_seguro_desconto'),
								f2 = form.findField('clie_seguro_intra_estadual'),
								f3 = form.findField('clie_seguro_inter_estadual'),
								f4 = form.findField('clie_seguro_adval_tipo_1'),
								f5 = form.findField('clie_seguro_adval_tipo_2');
								
								if (value == 'Intra/Inter Estadual') {
									//f1.setDisabled(false);
									f2.setDisabled(false);
									f3.setDisabled(false);
									
									f4.reset();
									f4.clearInvalid();
									f4.setDisabled(true);
									
									f5.reset();
									f5.clearInvalid();
									f5.setDisabled(true);
								} else if (value == 'Ad valorem Tipo 1 e 2') {
									//f1.setDisabled(false);
									f4.setDisabled(false);
									f5.setDisabled(false);
									
									f2.reset();
									f2.clearInvalid();
									f2.setDisabled(true);
									
									f3.reset();
									f3.clearInvalid();
									f3.setDisabled(true);
								} else {
									/*
									f1.reset();
									f1.clearInvalid();
									f1.setDisabled(true);
									*/
									f2.reset();
									f2.clearInvalid();
									f2.setDisabled(true);
									
									f3.reset();
									f3.clearInvalid();
									f3.setDisabled(true);
									
									f4.reset();
									f4.clearInvalid();
									f4.setDisabled(true);
									
									f5.reset();
									f5.clearInvalid();
									f5.setDisabled(true);
								}
							}
						}
					},{
						xtype: 'percentfield',
						fieldLabel: 'Desconto sob Seguro/Advalorem (%)',
						name: 'clie_seguro_desconto',
						value: 0,
						minValue: 0,
						maxValue: 100
					}]
				},{
					items: [{
						xtype: 'percentfield',
						fieldLabel: 'Intra Estadual (%)',
						name: 'clie_seguro_intra_estadual',
						decimalPrecision: 6,
						value: 0,
						minValue: 0,
						maxValue: 9.999999,
						disabled: true
					},{
						xtype: 'percentfield',
						fieldLabel: 'Inter Estadual (%)',
						name: 'clie_seguro_inter_estadual',
						decimalPrecision: 6,
						value: 0,
						minValue: 0,
						maxValue: 9.999999,
						disabled: true
					},{
						xtype: 'percentfield',
						fieldLabel: 'Advalorem Tipo #1 (%)',
						name: 'clie_seguro_adval_tipo_1',
						decimalPrecision: 6,
						value: 0,
						minValue: 0,
						maxValue: 9.999999,
						disabled: true
					},{
						xtype: 'percentfield',
						fieldLabel: 'Advalorem Tipo #2 (%)',
						name: 'clie_seguro_adval_tipo_2',
						decimalPrecision: 6,
						value: 0,
						minValue: 0,
						maxValue: 9.999999,
						disabled: true
					}]
				},{
					items: [{
						xtype: 'percentfield',
						fieldLabel: 'Informe o percentual da alíquota GRIS (Gerenciamento de Risco e Segurança)',
						name: 'clie_gris_percentual',
						value: 0,
						minValue: 0,
						maxValue: 999.99
					},{
						xtype: 'decimalfield',
						fieldLabel: 'Informe o valor mínimo da alíquota GRIS (Gerenciamento de Risco e Segurança)',
						name: 'clie_gris_valor_minimo',
						value: 0,
						minValue: 0,
						maxValue: 999999.99
					}]
				}]
			},{
				title: 'Modalidade de Pagamento e outros',
				items: [{
					items: [{
						xtype: 'checkboxgroup',
						fieldLabel: 'Quando Tomador',
						allowBlank: true,
						flex: 2,
						defaults: {
							inputValue: 1,
							checked: false
						},
						items: [{
							boxLabel: 'Aceita frete pago',
							name: 'clie_tom_aceita_frete_pago',
							checked: true
						},{
							boxLabel: 'Aceita frete à pagar',
							name: 'clie_tom_aceita_frete_a_pagar',
							checked: true
						},{
							boxLabel: 'Aceita outros',
							name: 'clie_tom_aceita_frete_outros'
						},{
							boxLabel: 'Aceita Suframa',
							name: 'clie_tom_aceita_suframa'
						}]
					},{
						xtype: 'localcombo',
						fieldLabel: 'Tipo de taxa da Sefaz',
						name: 'clie_tom_taxa_sefaz',
						value: 3,
						options: [{
							id: 1,
							field: 'Multiplicar taxa pela quantidade na NF'
						},{
							id: 2,
							field: 'Não multiplicar, valor cheio'
						},{
							id: 3,
							field: 'Não cobrar, não calcular'
						}]
					},{
						xtype: 'localcombo',
						fieldLabel: 'Tabela de uso do Tomador de Serviços',
						name: 'clie_tom_tabela',
						value: 'NACIONAL',
						options: ['NACIONAL', 'ESPECIAL', 'MINIMA', 'EXPRESSO']
					}]
				},{
					items: [{
						xtype: 'checkboxfield',
						fieldLabel: 'Quando Destinatário',
						boxLabel: 'Aceita frete à pagar',
						name: 'clie_des_aceita_frete_a_pagar',
						inputValue: 1,
						checked: false
					},{
						fieldLabel: 'Inscrição Suframa do Destinatário',
						name: 'clie_des_inscricao_suframa',
						maxLength: 9,
						allowBlank: true
					},{
						xtype: 'rotaentregacombo',
						fieldLabel: 'Rotas de Entregas',
						name: 'rota_id',
						allowBlank: true
					},{
						xtype: 'intfield',
						fieldLabel: 'Sequência da Rota',
						name: 'clie_sequencia_rota',
						maxValue: 99999,
						allowBlank: true,
						allowNegative: false
					}]
				}]
			},{
				xtype: 'cliaeroportogrid',
				title: 'Aeroportos / Locais',
				height: 300,
				minHeight: 300,
				resizable: true,
				resizeHandles: 's',
				style: {
					marginBottom: '10px'
				}
			},{
				xtype: 'cliprodutogrid',
				title: 'Produtos',
				height: 300,
				minHeight: 300,
				resizable: true,
				resizeHandles: 's',
				style: {
					marginBottom: '10px'
				}
			},{
				xtype: 'contatogrid',
				title: 'Contatos',
				height: 300,
				minHeight: 300,
				resizable: true,
				resizeHandles: 's'
			},{
				title: 'Envio automático de e-mail - <span style="color:red;">ATENÇÃO! Separe os e-mails por linha, utilizando a tecla "ENTER" de seu teclado.</span>',
				items: [{
					items: [{
						xtype: 'textareafield',
						fieldLabel: 'Quais e-mails devem receber a notificação das alterações nas ocorrências',
						name: 'clie_lista_emails_ocorrencias',
						stripCharsRe: new RegExp('[;, ]','gi'),
						allowBlank: true,
						height: 200
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
		var aeroportos = me.down('cliaeroportogrid').getDataID(),
		produtos = me.down('cliprodutogrid').getDataID(),
		contatos = me.down('contatogrid').getRecords(true);
		
		var originalText = btn.getText();
		btn.setText('Salvando...');
		btn.setDisabled(true);
		
		form.submit({
			clientValidation: true,
			url: 'mod/cadastros/clientes/php/response.php',
			method: 'post',
			params: {
				m: 'save_clientes',
				produtos: produtos,
				contatos: contatos,
				aeroportos: aeroportos
			},
			failure: Ext.Function.createSequence(App.formFailure, function(){
				btn.setDisabled(false);
				btn.setText(originalText);
			}),
			success: function(f, a) {
				btn.setDisabled(false);
				btn.setText(originalText);
				me.newRecord();
			}
		});
	},
	
	newRecord: function() {
		var me = this, form = me.getForm();
		form.reset();
		form.isValid();
		
		var grid1 = me.down('cliaeroportogrid'),
		grid2 = me.down('cliprodutogrid'),
		grid3 = me.down('contatogrid');
		
		grid1.setClieID(0);
		grid1.setCidUF(null);
		grid2.setClieID(0);
		grid3.setClieID(0);
		
		setTimeout(function(){
			form.findField('clie_razao_social').focus();
		}, 600);
		
		me.doLayout();
	},
	
	loadRecord: function(record) {
		if (!record) {
			return false;
		}
		var me = this, form = me.getForm(), fasField = form.findField('clie_forma_aplicar_seguro');
		form.reset();
		
		fasField.suspendEvents(false);
		
		form.loadRecord(record);
		
		form.findField('clie_seguro_adval_tipo_1').setDisabled(record.get('clie_seguro_adval_tipo_1') <= 0);
		form.findField('clie_seguro_adval_tipo_2').setDisabled(record.get('clie_seguro_adval_tipo_2') <= 0);
		form.findField('clie_seguro_intra_estadual').setDisabled(record.get('clie_seguro_intra_estadual') <= 0);
		form.findField('clie_seguro_inter_estadual').setDisabled(record.get('clie_seguro_inter_estadual') <= 0);
		
		fasField.resumeEvents();
		
		var grid1 = me.down('cliaeroportogrid'),
		grid2 = me.down('cliprodutogrid'),
		grid3 = me.down('contatogrid');
		
		grid1.setClieID(record.get('clie_id'));
		grid1.setCidUF(record.get('cid_uf'));
		grid2.setClieID(record.get('clie_id'));
		grid3.setClieID(record.get('clie_id'));
		
		form.isValid();
		setTimeout(function(){
			form.findField('clie_razao_social').focus();
		}, 600);
		
		me.doLayout();
	}
});

Ext.define('Cliente.Fatura.form.Panel', {
	extend: 'Ext.form.Panel',
	alias: 'widget.clientefaturaform',
	
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
				title: 'Cobrança',
				items: [{
					items: [{
						xtype: 'pracapagamentocombo',
						fieldLabel: 'Praça de Pagamento',
						name: 'prp_id',
						listeners: {
							afterrender: function() {
								this.getStore().load();
							}
						}
					},{
						xtype: 'hiddenfield',
						name: 'clie_id',
						flex: null
					},{
						xtype: 'localcombo',
						fieldLabel: 'Status / Situação para cobrança',
						name: 'cliefat_status_cobranca',
						options: [{
							id: 'F',
							field: 'Faturar'
						},{
							id: 'N',
							field: 'Não faturar'
						},{
							id: 'R',
							field: 'Recibo'
						},{
							id: 'I',
							field: 'Inadimplente'
						}]
					},{
						xtype: 'localcombo',
						fieldLabel: 'Tipo Carteira',
						name: 'cliefat_tipo_carteira',
						options: ['BANCARIA','INTERNA','TERCEIRIZADA'],
						value: 'BANCARIA'
					}]
				},{
					items: [{
						xtype: 'intfield',
						fieldLabel: 'Acrescentar Dias ao Vencimento',
						name: 'cliefat_dias_ao_vecto',
						value: 0,
						minValue: 0,
						maxValue: 99
					},{
						xtype: 'intfield',
						fieldLabel: 'Dias para Protesto',
						name: 'cliefat_dias_protestar',
						value: 0,
						minValue: 0,
						maxValue: 99
					},{
						xtype: 'intfield',
						fieldLabel: 'Dias Permitido em Atraso',
						name: 'cliefat_dias_em_atraso',
						value: 0,
						minValue: 0,
						maxValue: 99
					}]
				},{
					items: [{
						xtype: 'checkboxfield',
						boxLabel: 'Tornar cliente pagador inadimplente automaticamente quando em atraso',
						name: 'auto_inadimplente',
						inputValue: 1
					}]
				}]
			},{
				title: 'Endereço de Cobrança',
				items: [{
					items: [{
						xtype: 'checkboxfield',
						fieldLabel: 'Endereço',
						boxLabel: 'O Mesmo',
						name: 'cliefat_endereco_o_mesmo',
						inputValue: 1,
						listeners: {
							change: function(f, checked) {
								var form = f.up('form').getForm(),
								f1 = form.findField('cliefat_logradouro'),
								f2 = form.findField('cliefat_numero'),
								f3 = form.findField('cliefat_complemento'),
								f4 = form.findField('cliefat_bairro'),
								f5 = form.findField('cliefat_cep'),
								f6 = form.findField('cliefat_cid_id_fk');
								if (checked) {
									var record = form.getRecord();
									f1.setValue(record.get('clie_logradouro'));
									f2.setValue(record.get('clie_numero'));
									f3.setValue(record.get('clie_complemento'));
									f4.setValue(record.get('clie_bairro'));
									f5.setValue(record.get('clie_cep'));
									f6.setValue(record.get('cid_id'));
								}
								f1.setReadOnly(checked);
								f2.setReadOnly(checked);
								f3.setReadOnly(checked);
								f4.setReadOnly(checked);
								f5.setReadOnly(checked);
								f6.setReadOnly(checked);
							}
						}
					},{
						xtype: 'enderecocombo',
						fieldLabel: 'Logradouro',
						name: 'cliefat_logradouro',
						valueField: 'endereco',
						displayField: 'endereco',
						maxLength: 60,
						flex: 2,
						fields: {
							cep: 'cliefat_cep',
							bairro: 'cliefat_bairro',
							numero: 'cliefat_numero'
						}
					},{
						fieldLabel: 'Número',
						name: 'cliefat_numero',
						maxLength: 20
					},{
						fieldLabel: 'Complemento',
						name: 'cliefat_complemento',
						maxLength: 60,
						flex: 2,
						allowBlank: true
					}]
				},{
					items: [{
						fieldLabel: 'Bairro',
						name: 'cliefat_bairro',
						maxLength: 60
					},{
						fieldLabel: 'CEP',
						name: 'cliefat_cep',
						maxLength: 8
					},{
						xtype: 'cidadecombo',
						fieldLabel: 'Cidade',
						name: 'cliefat_cid_id_fk'
					}]
				},{
					items: [{
						fieldLabel: 'E-mail para cobrança',
						name: 'cliefat_email',
						vtype: 'email',
						maxLength: 80,
						allowBlank: true
					}]
				}]
			},{
				title: 'Linha de observação na impressão da duplicata',
				items: [{
					items: [{
						xtype: 'textareafield',
						name: 'cliefat_obs_duplicata',
						height: 100,
						hideLabel: true,
						allowBlank: true
					}]
				}]
			}],
			buttons: [{
				text: 'SALVAR',
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
			url: 'mod/cadastros/clientes/php/response.php',
			method: 'post',
			params: {
				m: 'save_dados_faturamento'
			},
			failure: Ext.Function.createSequence(App.formFailure, function(){
				btn.setDisabled(false);
				btn.setText(originalText);
			}),
			success: function(f, a) {
				btn.setDisabled(false);
				btn.setText(originalText);
			}
		});
	},
	
	loadRecord: function(record) {
		if (!record) {
			return false;
		}
		var me = this, form = me.getForm();
		form.reset();
		form.loadRecord(record);
		form.isValid();
		
		me.doLayout();
	}
});