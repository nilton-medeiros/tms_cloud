Ext.ns('Img.show','Edit.contato');
Edit.contato = {
	format: function(cmp, record) {
		return '<a href="javascript:;" onclick="Edit.contato.show(\' ' + cmp + ' \', ' + Ext.encode(record).replace(/\"/gi, "'") + ')">editar</a>';
	},
	show: function(cmp, record) {
		var win = Ext.create('Contato.edit.Window', {cmp: cmp, record: record});
		win.doLayout();
	}
};
Img.show = function(filename){
	var win = Ext.create('Ext.ux.Alert', {
		ui: 'black-alert',
		msg: '<span style="color:white;">Carregando...<span>'
	});
	var img = new Image();
	img.onload = function() {
		var w = 'auto', h = 'auto';
		if (this.width > window.innerWidth) {
			w = (window.innerWidth - (0.5 * window.innerWidth));
			this.width = w;
		}
		if (this.height > window.innerHeight) {
			h = (window.innerHeight - (0.5 * window.innerHeight));
			this.height = h;
		}
		var height = Math.round(this.height + 60);
		win.setHeight(height);
		win.animate({to:{top:((window.innerHeight - height) / 2)}});
		win.update('<img src="'+this.src+'" width="'+w+'" height="'+h+'" class="img-center"/>');
	};
	img.src = filename;
};
/*
 * Window Component
 */
Ext.define('Ext.ux.Alert', {
	extend: 'Ext.Panel',
	alias: 'widget.alert',
	
	bodyPadding: 10,
	msg: null,
	modal: true,
	buttons: null,
	onCloseDialog: null,
	closeText: 'FECHAR',
	
	initComponent: function() {
		if (!this.ui || this.ui == 'default') this.ui = 'green-alert';
		
		this.baseHeight = window.innerHeight;
		
		Ext.apply(this, {
			y: 0 - this.baseHeight,
			width: '100%',
			minHeight: 100,
			style: 'opacity:0;',
			bodyStyle: 'font-size: 18px;',
			bodyPadding: 10,
			autoShow: true,
			floating: true,
			header: false,
			resizable: false,
			maximizable: false,
			draggable: false,
			html: this.msg,
			buttonAlign: 'center'
		});
		
		var newButtons = new Array(), closeHandler = function(){
			this.up('alert').close();
		}, closeButton = {
			text: this.closeText,
			scale: 'medium',
			handler: Ext.isFunction(this.onCloseDialog) ? Ext.Function.createSequence(this.onCloseDialog, closeHandler) : closeHandler
		};
		
		if (Ext.isArray(this.buttons)) {
			if (this.buttons.length) {
				var i;
				for (i=0; i<this.buttons.length; i++) {
					var button = this.buttons[i];
					button.scale = 'medium';
					if (typeof(button.autoClose) == "undefined") {
						button.autoClose = true;
					}
					if (Ext.isFunction(button.handler) && button.autoClose) {
						button.handler = Ext.Function.createSequence(button.handler, function(){this.up('alert').close();});
					}
					newButtons.push(button);
				}
			}
			newButtons.push(closeButton);
			this.buttons = newButtons;
		} else if (Ext.isObject(this.buttons)) {
			this.buttons.scale = 'medium';
			if (typeof(this.buttons.autoClose) == "undefined") {
				this.buttons.autoClose = true;
			}
			if (Ext.isFunction(this.buttons.handler) && this.buttons.autoClose) {
				this.buttons.handler = Ext.Function.createSequence(this.buttons.handler, function(){this.up('alert').close();});
			}
			newButtons.push(this.buttons);
			newButtons.push(closeButton);
			this.buttons = newButtons;
		} else {
			this.buttons = [closeButton];
		}
		
		this.callParent(arguments);
	},
	
	onShow: function() {
		var me = this;
		me.callParent(arguments);
		me.syncFx().animate({
			duration: 600,
			from: {
				opacity: 0,
				top: 0 - me.getHeight()
			},
			to: {
				opacity: 1,
				top: ((me.baseHeight - me.getHeight()) / 2)
			},
			callback: function() {
				me.doLayout();
			}
		});
	},
	
	doClose: function() {
		var me = this;
		me.syncFx().animate({
			duration: 600,
			to: {
				opacity: 0,
				top: 0 - me.getHeight()
			},
			callback: function() {
				me.fireEvent('close', me);
				me[me.closeAction]();
			}
		});
	}
});

Ext.define('Ext.ux.Notify', {
	extend: 'Ext.Panel',
	alias: 'widget.notify',
	
	msg: null,
	sleep: 15,
	canceled: false,
	
	initComponent: function() {
		if (!this.ui || this.ui == 'default') this.ui = 'green-alert';
		Ext.apply(this, {
			y: 0 - (this.height || 100),
			width: '100%',
			minHeight: 100,
			style: 'opacity:0;',
			bodyStyle: 'font-size: 18px;',
			bodyPadding: 10,
			autoShow: true,
			floating: true,
			modal: false,
			header: false,
			resizable: false,
			maximizable: false,
			draggable: false,
			html: this.msg,
			buttonAlign: 'right',
			buttons: [{
				text: 'Fechar',
				scale: 'medium',
				scope: this,
				handler: function() {
					this.sleep = null;
					this.canceled = true;
					this.close();
				}
			}]
		});
		this.callParent(arguments);
	},
	
	onShow: function() {
		var me = this;
		me.callParent(arguments);
		me.syncFx().animate({
			duration: 600,
			to: {
				opacity: 0.8,
				top: 0
			},
			callback: function() {
				me.close();
			}
		});
	},
	
	doClose: function() {
		var me = this;
		me.syncFx().animate({
			duration: 600,
			delay: (me.sleep > 0) ? me.sleep * 1000 : 0,
			to: {
				opacity: 0,
				top: 0 - me.getHeight()
			},
			callback: function() {
				if (!me.canceled && me) {
					me.fireEvent('close', me);
					me[me.closeAction]();
				}
			}
		});
	}
});

Ext.define('Ext.ux.Window', {
	extend: 'Ext.Window',
	alias: 'widget.fadewindow',
	
	initComponent: function() {
		this.constrain = true;
		if (this.style) {
			this.style += 'opacity:0;';
		} else {
			this.style = 'opacity:0;';
		}
		this.callParent(arguments);
	},
	
	onShow: function() {
		var me = this;
		me.callParent(arguments);
		me.syncFx().animate({
			duration: 1000,
			from: {opacity: 0},
			to: {opacity: 1},
			callback: function() {
				me.doLayout();
			}
		});
	},
	
	doClose: function() {
		var me = this;
		me.syncFx().animate({
			duration: 500,
			from: {opacity: 1},
			to: {opacity: 0},
			callback: function() {
				if (me.hidden) {
					me.fireEvent('close', me);
					if (me.closeAction == 'destroy') {
						me.destroy();
					}
				} else {
					me.hide(me.animateTarget, me.doClose, me);
				}
			}
		});
	}
});

Ext.define('Export.Window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.exportwindow',
	
	url: null,
	action: null,
	fields: null,
	defaultData: null,
	
	initComponent: function() {
		var me = this, activeRecord,
		store = Ext.create('Ext.data.Store', {
			data: me.defaultData,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			fields: [
				{name:'id', type:'string', defaultValue:''}, 
				{name:'field', type:'string', defaultValue:''},
				{name:'sort_id', type:'string', defaultValue:'-'},
				{name:'sort_label', type:'string', defaultValue:'Nenhum'},
				{name:'pos', type:'int', defaultValue:1}
			],
			sorters: [{
				property: 'pos',
				direction: 'ASC'
			}]
		}),
		editing = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 1,
			listeners: {
				beforeedit: function(editor, e) {
					activeRecord = e.record;
				}
			}
		});
		
		Ext.apply(this, {
			title: 'Exportar XLS - ' + me.title,
			width: 900,
			height: 500,
			minWidth: 800,
			minHeight: 400,
			modal: false,
			autoShow: true,
			maximized: true,
			maximizable: true,
			minimizable: false,
			resizable: true,
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
			defaults: {
				flex: 1,
				border: true
			},
			items: [{
				itemId: 'fields-grid',
				xtype: 'grid',
				title: 'Listagem dos campos para exportação',
				emptyText: '',
				margins:'0 5 0 0',
				loadMask: false,
				multiSelect: true,
				enableLocking: false,
				enableColumnHide: false,
				enableColumnMove: false,
				enableColumnResize: false,
				store: store,
				plugins: [editing],
				columns: [{
					dataIndex: 'pos',
					text: '#',
					align: 'right',
					tooltip: 'Número da posição do campo',
					tdCls: 'x-grid-cell-special',
					width: 50,
					menuDisabled: true,
					editor: {
						xtype: 'intfield',
						minValue: 0,
						allowBlank: false,
						selectOnFocus: true
					}
				},{
					dataIndex: 'field',
					text: 'Campo',
					tooltip: 'Nome do campo que será exportado',
					flex: 1,
					menuDisabled: true,
					editor: {
						xtype: 'localcombo',
						valueField: 'field',
						editable: false,
						allowBlank: false,
						options: me.fields,
						listeners: {
							select: function(combo, records) {
								var record = records[0];
								activeRecord.set('id', record.get('id'));
							}
						}
					}
				},{
					dataIndex: 'sort_label',
					text: 'Ordenação',
					align: 'center',
					tooltip: 'Tipo de ordernação que o campo será sortido',
					width: 100,
					menuDisabled: true,
					editor: {
						xtype: 'localcombo',
						valueField: 'field',
						editable: false,
						allowBlank: false,
						options: [{
							id: '-',
							field: 'Nenhum'
						},{
							id: 'ASC',
							field: 'Crescente'
						},{
							id: 'DESC',
							field: 'Decrescente'
						}],
						listeners: {
							select: function(combo, records) {
								var record = records[0];
								activeRecord.set('sort_id', record.get('id'));
							}
						}
					}
				}],
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						text: 'Incluir',
						iconCls: 'icon-plus',
						tooltip: 'Incluir campo para exportação',
						handler: function() {
							var position = store.count();
							editing.cancelEdit();
							store.insert(0, {
								id:'',
								field:'',
								sort_id:'-',
								sort_label:'Nenhum',
								pos: (position > 0) ? (position + 1) : 1
							});
							editing.startEditByPosition({row: 0, column: 1});
						}
					},{
						text: 'Excluir',
						iconCls: 'icon-minus',
						tooltip: 'Excluir campo da listagem de exportação',
						handler: function() {
							store.remove(me.down('#fields-grid').getView().getSelectionModel().getSelection());
						}
					}]
				}]
			},{
				flex: 2,
				xtype: 'filtrogrid',
				title: 'Cláusula para filtro da exportação',
				fieldStorage: me.fields
			}],
			buttons: [{
				text: 'EXPORTAR',
				scale: 'medium',
				handler: function(btn) {
					store.sort('pos', 'ASC');
					var selectFields = [];
					store.each(function(record){
						selectFields.push(record.data);
					});
					if (!selectFields.length) {
						App.notify('Para continuar com a exportação, você precisa selecionar pelo menos um campo para prosseguir com a operação.');
						return false;
					}
					var filterFields = me.down('filtrogrid').getRecords(false);
					if (Ext.isEmpty(filterFields)) {
						App.notify('Para continuar com a exportação, você precisa informar pelo menos uma cláusula de filtro para prosseguir com a operação');
						return false;
					}
					var originalText = btn.getText();
					btn.setText('EXPORTANDO...');
					btn.setDisabled(true);
					Ext.Ajax.request({
						url: me.url,
						method: 'post',
						params: {
							m: me.action,
							fields: Ext.encode(selectFields),
							filters: Ext.encode(filterFields)
						},
						failure: Ext.Function.createSequence(App.ajaxFailure, function(){
							btn.setDisabled(false);
							btn.setText(originalText);
						}),
						success: function(response) {
							btn.setDisabled(false);
							btn.setText(originalText);
							var o = Ext.decode(response.responseText);
							if (o.success && !Ext.isEmpty(o.xls)) {
								var popup = window.open(o.xls);
								if (!popup) {
									Ext.create('Ext.ux.Alert', {
										ui: 'black-alert',
										msg: 'Seus registros foram exportados com sucesso, porém o sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para facilitar e evitar futura mensagem, por favor inclua nosso site na lista dos permitidos.<br/>O que você deseja fazer agora?',
										closeText: 'CANCELAR',
										buttons: [{
											text: 'ABRIR ARQUIVO',
											url: o.xls,
											hrefTarget: '_blank'
										}]
									});
								}
								//me.close();
							} else {
								App.warning(o);
							}
						}
					});
				}
			}]
		});
		me.callParent(arguments);
	}
});

Ext.define('Report.Error', {
	extend: 'Ext.ux.Window',
	alias: 'widget.errorwin',
	
	error: '',
	
	getError: function() {
		return this.error;
	},
	
	initComponent: function() {
		Ext.apply(this, {
			title: 'Erro do Sistema',
			ui: 'red-window-active',
			width: 600,
			height: 500,
			modal: true,
			autoShow: true,
			maximizable: false,
			minimizable: false,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'form',
				url: 'php/response.php',
				bodyPadding: 5,
				layout: 'anchor',
				defaults: {
					anchor: '100%',
					labelAlign: 'top',
					selectOnFocus: true,
					allowBlank: false,
					height: 200
				},
				defaultType: 'textarea',
				items: [{
					fieldLabel: 'O sistema se comportou de uma forma inesperada, detalhes sobre o erro',
					name: 'server_response',
					readOnly: true,
					value: this.error
				},{
					fieldLabel: 'Envie sua mensagem nos informando o que aconteceu',
					emptyText: 'Explique aqui exatamente o que você estava fazendo. O que exatamente levou a esse erro? Ajude-nos a identificar mais rápido a origem do erro, obrigado!',
					name: 'user_response'
				}],
				buttons: [{
					text: 'Enviar',
					scale: 'medium',
					formBind: true,
					disabled: true,
					handler: function(btn) {
						var f = btn.up('form');
						btn.disable();
						f.submit({
							params: {
								m: 'enviar_relatorio_erro'
							},
							method: 'post',
							success: function(form, action) {
								f.up('errorwin').close();
								App.notify('O relatório de erro foi enviado para o suporte. Nossa equipe irá solucionar o problema e entrará em contato através do seu e-mail cadastrado no sistema.', 'blue-alert');
								btn.enable();
							},
							failure: function(form, action) {
								f.up('errorwin').close();
								App.notify('Ocorreu um erro ao enviar e-mail. Não foi possível estabelecer conexão com o Servidor SMTP, mas nossa equipa irá analisar o arquivo de log. Entraremos em contato assim que possível, através do seu e-mail cadastrado no sistema.', 'red-alert');
								btn.enable();
							}
						});
					}
				}]
			}
		});
		this.callParent(arguments);
	}
});

Ext.define('SenhaAcesso.Window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.senhaacessowindow',
	
	action: '',
	actionName: '',
	scope: this,
	callback: null,
	
	initComponent: function() {
		Ext.apply(this, {
			ui: 'orange-window-active',
			title: 'Acesso Negado!',
			width: 350,
			height: 235,
			modal: true,
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
					allowBlank: false,
					listeners: {
						specialkey: this.onEnterkey
					}
				},
				defaultType: 'textfield',
				items: [{
					hideLabel: true,
					xtype: 'displayfield',
					name: 'info',
					value: 'Por favor chame seu supervisor para executar essa ação' + (this.actionName ? ' "'+this.actionName+'"' : '')
				},{
					fieldLabel: 'E-mail',
					name: 'email',
					vtype: 'email',
					maxLength: 165
				},{
					fieldLabel: 'Senha',
					name: 'senha',
					inputType: 'password',
					maxLength: 20
				}],
				buttons: [{
					text: 'Liberar',
					scale: 'medium',
					itemId: 'save',
					formBind: true,
					disabled: true,
					handler: this.onSave
				}]
			}
		});
		
		this.callParent(arguments);
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
	
	save: function() {
		var me = this, form = me.down('form').getForm();
		form.submit({
			clientValidation: true,
			url: 'php/response.php',
			method: 'post',
			params: {
				m: 'liberar_acesso',
				action: me.action
			},
			failure: App.formFailure,
			success: function(f, a) {
				me.hide();
				Ext.callback(me.callback, me.scope, [me]);
				me.close();
			}
		});
	}
});

Ext.define('Update.Window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.updatewindow',
	
	storeToUpdate: null,
	fieldStorage: null,
	tableName: null,
	
	initComponent: function() {
		Ext.apply(this, {
			ui: 'green-window-active',
			title: 'Manutenção (alteração) - ' + this.title,
			width: 740,
			height: 500,
			modal: false,
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
					anchor: '100%'
				},
				items: [{
					xtype: 'fieldcontainer',
					hideLabel: true,
					layout: {
						type: 'hbox',
						defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
					},
					defaults: {
						labelAlign: 'top',
						selectOnFocus: true,
						allowBlank: false
					},
					items: [{
						flex: 1,
						xtype: 'localcombo',
						fieldLabel: 'Qual campo?',
						name: 'campo',
						options: this.fieldStorage
					},{
						flex: 2,
						xtype: 'textfield',
						fieldLabel: 'Alterar para',
						name: 'resultado'
					}]
				},{
					xtype: 'filtrogrid',
					title: 'Cláusula para filtro',
					fieldStorage: this.fieldStorage,
					height: 360
				}],
				buttons: [{
					text: 'Executar',
					scale: 'medium',
					itemId: 'save',
					formBind: true,
					disabled: true,
					handler: this.onSave
				}]
			},
			listeners: {
				destroy: function() {
					if (this.storeToUpdate) {
						if (this.storeToUpdate.getCount() > 0) {
							this.storeToUpdate.reload();							
						}
					}
				}
			}
		});
		this.callParent(arguments);
	},
	
	onSave: function() {
		this.disable();
		var win		=	this.up('window'),
			records =	win.down('filtrogrid').getRecords();
		if (records) {
			win.save(records);
		} else {
			Ext.create('Ext.ux.Alert', {
				ui: 'red-alert',
				msg: 'ATENÇÃO!<br/>Você não selecionou nenhum filtro e isso afeterá todos os registros.<br/>Deseja continuar com a alteração?',
				buttons: [{
					text: 'Continuar com alteração',
					handler: function() {
						win.save();
					}
				}]
			});
		}
	},
	
	save: function(filtros) {
		filtros = filtros || null;
		var me = this, form = me.down('form').getForm();
		form.submit({
			clientValidation: true,
			url: 'php/response.php',
			method: 'post',
			params: {
				m: 'update_table',
				table: me.tableName,
				filters: filtros
			},
			failure: App.formFailure,
			success: App.formSuccess
		});
	}
});

Ext.define('Delete.Window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.deletewindow',
	
	storeToUpdate: null,
	fieldStorage: null,
	tableName: null,
	
	initComponent: function() {
		Ext.apply(this, {
			ui: 'green-window-active',
			title: 'Manutenção (exclusão) - ' + this.title,
			width: 740,
			height: 500,
			modal: false,
			autoShow: true,
			maximizable: false,
			minimizable: false,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'filtrogrid',
				fieldStorage: this.fieldStorage
			},
			buttons: [{
				text: 'Executar',
				scale: 'medium',
				itemId: 'save',
				handler: this.onSave
			}],
			listeners: {
				destroy: function() {
					if (this.storeToUpdate) {
						this.storeToUpdate.reload();
					}
				}
			}
		});
		this.callParent(arguments);
	},
	
	onSave: function() {
		var win		=	this.up('window'),
			records =	win.down('filtrogrid').getRecords();
		if (!records) {
			App.noRecordsSelected();
			return false;
		}
		win.save(records);
	},
	
	save: function(filtros) {
		Ext.Ajax.request({
			url: 'php/response.php',
			method: 'post',
			params: {
				m: 'delete_table',
				table: this.tableName,
				filters: filtros
			},
			failure: App.ajaxFailure,
			success: App.ajaxSuccess
		});
	}
});

Ext.define('Contato.edit.Window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.contatoeditwin',
	
	cmp: null,
	record: null,
	
	initComponent: function() {
		Ext.apply(this, {
			title: 'Editar - Contato',
			ui: 'blue-window-active',
			width: 745,
			height: 400,
			modal: true,
			autoShow: true,
			maximizable: false,
			minimizable: false,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'form',
				url: 'php/response.php',
				bodyPadding: 5,
				layout: 'anchor',
				defaults: {
					anchor: '100%',
					hideLabel: true,
					layout: {
						type: 'hbox',
						defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
					},
					defaults: {
						flex: 1,
						labelAlign: 'top',
						allowBlank: true,
						selectOnFocus: true,
						listeners: {
							specialkey: this.onEnterkey
						}
					},
					defaultType: 'textfield'
				},
				defaultType: 'fieldcontainer',
				items: [{
					items: [{
						fieldLabel: 'Nome',
						name: 'con_nome',
						allowBlank: false,
						maxLength: 40
					},{
						xtype: 'hiddenfield',
						name: 'id',
						flex: null
					},{
						xtype: 'datefield',
						fieldLabel: 'Nascimento',
						name: 'con_nascimento',
						format: 'd/m/Y',
						maxValue: new Date(),
						flex: null,
						width: 200
					}]
				},{
					items: [{
						fieldLabel: 'Telefone',
						name: 'con_fone',
						vtype: 'phone',
						maxLength: 15
					},{
						fieldLabel: 'Ramal',
						name: 'con_ramal',
						flex: null,
						width: 100,
						maxLength: 5				
					},{
						fieldLabel: 'Celular',
						name: 'con_celular',
						vtype: 'phone',
						maxLength: 15
					}]
				},{
					items: [{
						fieldLabel: 'Setor',
						name: 'con_setor',
						maxLength: 40
					},{
						fieldLabel: 'Função',
						name: 'con_funcao',
						maxLength: 60
					},{
						fieldLabel: 'E-mail',
						name: 'con_email',
						vtype: 'email',
						maxLength: 80,
						flex: 2
					}]
				},{
					items: [{
						xtype: 'localcombo',
						fieldLabel: 'Formato para recebimento do CT-e',
						name: 'con_recebe_cte',
						value: 'N',
						options: [{
							id: 'P',
							field: 'PDF'
						},{
							id: 'X',
							field: 'XML'
						},{
							id: 'A',
							field: 'PDF e XML'
						},{
							id: 'N',
							field: 'Nenhum'
						}]
					},{
						fieldLabel: 'E-mail para recebimento do CT-e',
						name: 'con_email_cte',
						maxLength: 80,
						flex: 2
					}]
				},{
					items: [{
						xtype: 'textareafield',
						name: 'con_nota',
						height: 100
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
		
		if (this.record) {
			this.loadRecord(this.record);
		}
	},
	
	save: function() {
		var me = this, form = me.down('form').getForm();
		if (!form.isValid()) {
			return false;
		}
		form.submit({
			clientValidation: true,
			method: 'post',
			params: {
				m: 'save_contato'
			},
			failure: App.formFailure,
			success: function(f, a) {
				if (me.cmp) {
					var grid = Ext.ComponentQuery.query(me.cmp);
					if (grid) {
						grid = grid[0];
						if (grid.getXType().search(new RegExp("grid", "gi")) > -1) {
							var sm = grid.getSelectionModel(), selected = sm.getSelection();
							if (selected.length) {
								selected = grid.getStore().indexOf(selected[0]);
								grid.getStore().reload({
									callback: function(){
										sm.select(selected);
									}
								});
							}
						}
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
		var me = this.down('form'), form = me.getForm();
		form.loadRecord(Ext.create('Contato.data.Model', record));
	}
});

Ext.define('Cliente.pergunta.window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.clienteperguntawin',
	
	onJ: Ext.emptyFn,
	onF: Ext.emptyFn,
	
	initComponent: function() {
		Ext.apply(this, {
			ui: 'black-window',
			title: 'Cadastro de cliente',
			html: 'Selecione o tipo de pessoa',
			closable: false,
			autoShow: true,
			autoDestroy: true,
			maximizable: false,
			minimizable: false,
			resizable: false,
			modal: true,
			width: 270,
			height: 120,
			bodyPadding: 10,
			buttonAlign: 'center',
			bodyStyle: 'font-size:18px;',
			buttons: [{
				ui: 'orange-button',
				text: 'JURÍDICA',
				scale: 'medium',
				handler: Ext.Function.createSequence(this.onJ, function(){this.up('clienteperguntawin').close();})
			},{
				ui: 'green-button',
				text: 'FÍSICA',
				scale: 'medium',
				handler: Ext.Function.createSequence(this.onF, function(){this.up('clienteperguntawin').close();})
			}]
		});
		this.callParent(arguments);
	}
});

Ext.define('Email.Window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.emailwin',
	
	emails: null,
	usuario: null,
	assunto: null,
	mensagem: null,
	
	initComponent: function() {
		Ext.apply(this, {
			title: 'Enviar e-mail',
			ui: 'black-window-active',
			width: 900,
			height: 540,
			modal: true,
			autoShow: true,
			maximizable: false,
			minimizable: false,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'form',
				url: 'php/response.php',
				bodyPadding: 5,
				layout: 'anchor',
				defaults: {
					anchor: '100%',
					labelAlign: 'top',
					selectOnFocus: true,
					allowBlank: true
				},
				items: [{
					xtype: 'usuariocombo',
					fieldLabel: 'E/ou se preferir selecione os usuários individualmente',
					name: 'usuarios[]',
					valueField: 'email',
					delimiter: ';',
					multiSelect: true,
					value: this.usuario
				},{
					xtype: 'textfield',
					fieldLabel: 'E/ou se preferir informe o e-mail separados por ";" sem aspas.',
					name: 'emails',
					value: this.emails
				},{
					xtype: 'textfield',
					fieldLabel: 'Informe o assunto para essa mensagem',
					name: 'assunto',
					value: this.assunto,
					allowBlank: false
				},{
					xtype: 'htmleditor',
					fieldLabel: 'Mensagem',
					name: 'mensagem',
					value: this.mensagem + '<br/>' + App.usuario.assinatura,
					height: 245,
					allowBlank: false,
					enableLists: false,
					enableSourceEdit: false,
					enableFont: false,
					enableFontSize: false
				}],
				buttons: [{
					text: 'Enviar',
					scale: 'medium',
					ui: 'green-button',
					formBind: true,
					disabled: true,
					handler: function() {
						var me = this, f = me.up('form'), msgField = f.getForm().findField('mensagem');
						if (msgField.getValue() == App.usuario.assinatura) {
							msgField.setFieldLabel('Mensagem <span style="color:red;">(Favor preencher esse campo corretamente)</span>');
							return false;
						}
						me.setDisabled(true);
						me.setText('Enviando...');
						f.submit({
							params: {
								m: 'enviar_email'
							},
							method: 'post',
							success: function(form, action) {
								f.up('emailwin').close();
								App.notify('E-mail enviado com sucesso', 'blue-alert');
							},
							failure: function(form, action) {
								f.up('emailwin').close();
								App.notify('Servidor de e-mail não responde. Tente novamente mais tarde!', 'red-alert');
							}
						});
					}
				}]
			}
		});
		this.callParent(arguments);
	}
});
Ext.define('Suggestion.Window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.suggestionwin',
	
	ui: 'black-window-active',
	
	initComponent: function() {
		Ext.apply(this, {
			title: 'Enviar sugestão ou reportar uma falha do sistema',
			width: 500,
			height: 540,
			modal: true,
			autoShow: true,
			maximizable: false,
			minimizable: false,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'form',
				url: 'php/response.php',
				bodyPadding: 5,
				layout: 'anchor',
				defaults: {
					anchor: '100%',
					labelAlign: 'top',
					selectOnFocus: true,
					allowBlank: false
				},
				items: [{
					xtype: 'localcombo',
					fieldLabel: 'Selecione a sua opção de envio da mensagem',
					name: 'tipo',
					value: 'SUGESTÃO',
					options: ['REPORTAR UM ERRO/FALHA','SUGESTÃO']
				},{
					xtype: 'textfield',
					fieldLabel: 'Informe o assunto para essa mensagem',
					name: 'assunto',
					emptyText: 'Digite aqui sobre o que se trata essa mensagem'
				},{
					xtype: 'filefield',
					fieldLabel: 'Deseja anexar algum arquivo modelo para uso de referência?',
					name: 'arquivo',
					buttonText: 'Buscar',
					emptyText: 'Arquivo permitido: Imagem ou Documento [até 2MB]',
					allowBlank: true
				},{
					xtype: 'htmleditor',
					fieldLabel: 'Mensagem',
					name: 'mensagem',
					value: App.usuario.assinatura,
					height: 300,
					allowBlank: false,
					enableLists: false,
					enableSourceEdit: false,
					enableFont: false,
					enableFontSize: false
				}],
				buttons: [{
					text: 'Enviar',
					scale: 'medium',
					ui: 'green-button',
					formBind: true,
					disabled: true,
					handler: function() {
						var me = this, f = me.up('form'), msgField = f.getForm().findField('mensagem');
						if (msgField.getValue() == App.usuario.assinatura) {
							msgField.setFieldLabel('Mensagem <span style="color:red;">(Favor preencher esse campo corretamente)</span>');
							return false;
						}
						me.setDisabled(true);
						me.setText('Enviando...');
						f.submit({
							params: {
								m: 'enviar_email',
								suggestion: 1
							},
							method: 'post',
							success: function(form, action) {
								f.up('suggestionwin').close();
								App.notify('Sua mensagem foi enviada com sucesso. Obrigado por nos contatar, sua opinião é muito importante para nós!', 'black-alert');
							},
							failure: function(form, action) {
								f.up('suggestionwin').close();
								App.notify('Servidor de e-mail não responde. Tente novamente mais tarde!', 'red-alert');
							}
						});
					}
				}]
			}
		});
		this.callParent(arguments);
	}
});
/*
 * End of Window Component
 */

/*
 * Grid Component
 */
Ext.define('Contato.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.contatogrid',
	
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
			model: 'Contato.data.Model',
			autoLoad: me.clie_id > 0,
			autoDestroy: true,
			remoteSort: false,
			remoteFilter: false,
			remoteGroup: false,
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.clie_id > 0;
				}
			},
			
			proxy: {
				type: 'ajax',
				url: 'php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_contato',
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
				property: 'con_nome',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.clie_id > 0;
				}
			}
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 1,
			listeners: {
				edit: function(editor, e) {
					if (me.clie_id > 0 && !Ext.isEmpty(e.record.get('con_nome')) && !Ext.isEmpty(e.record.get('con_setor'))) {
						Ext.Ajax.request({
							url: 'php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_contato',
								clie_id: me.clie_id
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('con_id', o.con_id);
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
			emptyText: '',
			plugins: [me.editing],
			columns: [{
				dataIndex: 'con_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70
			},{
				dataIndex: 'con_nome',
				text: 'Nome',
				width: 200,
				hideable: false,
				editor: {
					xtype: 'textfield',
					maxLength: 40,
					selectOnFocus: true,
					allowBlank: false
				}
			},{
				dataIndex: 'con_setor',
				text: 'Setor',
				width: 100,
				editor: {
					xtype: 'textfield',
					maxLength: 40,
					selectOnFocus: true
				}
			},{
				dataIndex: 'con_funcao',
				text: 'Função',
				width: 100,
				editor: {
					xtype: 'textfield',
					maxLength: 60,
					selectOnFocus: true
				}
			},{
				dataIndex: 'con_fone',
				text: 'Telefone',
				width: 120,
				hideable: false,
				editor: {
					xtype: 'textfield',
					vtype: 'phone',
					maxLength: 15,
					selectOnFocus: true
				}
			},{
				dataIndex: 'con_ramal',
				text: 'Ramal',
				width: 70,
				hideable: false,
				editor: {
					xtype: 'textfield',
					maxLength: 5,
					selectOnFocus: true
				}
			},{
				dataIndex: 'con_celular',
				text: 'Celular',
				width: 120,
				hideable: false,
				editor: {
					xtype: 'textfield',
					vtype: 'phone',
					maxLength: 15,
					selectOnFocus: true
				}
			},{
				dataIndex: 'con_email',
				text: 'E-mail',
				width: 200,
				editor: {
					xtype: 'textfield',
					vtype: 'email',
					maxLength: 80,
					selectOnFocus: true
				}
			},{
				xtype: 'datecolumn',
				dataIndex: 'con_nascimento',
				text: 'Nascimento',
				format: 'D d/m/Y',
				width: 120,
				editor: {
					xtype: 'datefield',
					format: 'd/m/Y',
					maxValue: new Date(),
					selectOnFocus: true
				}
			},{
				dataIndex: 'con_recebe_cte',
				text: 'Recebe CT-e',
				tooltip: 'Formato para recebimento do CT-e',
				width: 100,
				editor: {
					xtype: 'localcombo',
					options: ['P','X','A','N'],
					options: [{
						id: 'P',
						field: 'PDF'
					},{
						id: 'X',
						field: 'XLS'
					},{
						id: 'A',
						field: 'Ambos'
					},{
						id: 'N',
						field: 'Nenhum'
					}]
				},
				renderer: function(value, metaData, record) {
					var tooltip = '';
					if (value == 'P') {
						tooltip = 'PDF';
					} else if (value == 'X') {
						tooltip = 'XLS';
					} else if (value == 'A') {
						tooltip = 'PDF e XLS';
					} else {
						tooltip = 'Nenhum';
					}
					return tooltip;
				}
			},{
				dataIndex: 'con_email_cte',
				text: 'E-mail CT-e',
				tooltip: 'E-mail para recebimento do CT-e',
				width: 200,
				editor: {
					xtype: 'textfield',
					vtype: 'email',
					maxLength: 80,
					selectOnFocus: true
				}
			},{
				dataIndex: 'con_nota',
				text: 'Notas',
				width: 300,
				editor: {
					xtype: 'textareafield',
					grow: true,
					selectOnFocus: true
				}
			},{
				text: 'Última modificações',
				menuDisabled: true,
				columns: [{
					dataIndex: 'con_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					menuDisabled: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'con_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					menuDisabled: true
				},{
					dataIndex: 'con_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					menuDisabled: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'con_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					menuDisabled: true
				},{
					dataIndex: 'con_versao',
					text: 'Alterações',
					tooltip: 'Quantidade de alterações afetadas no registro',
					align: 'right',
					width: 100
				}]
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Novo contato',
					handler: function() {
						if (me.checkIDBeforeInsert && !me.clie_id) {
							return false;
						}
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Contato.data.Model', {
							clie_id: me.clie_id
						}));
						me.editing.startEditByPosition({row: 0, column: 1});
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
					itemId: 'delete',
					disabled: true,
					handler: function() {
						me.exclude();
					}
				}]
			},{
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
					text: 'Atualizar',
					iconCls: 'x-tbar-loading',
					scope: me.store,
					handler: function(){
						if (this.isFiltered()) {
							this.reload();
						} else {
							this.load();
						}
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
	
	getRecords: function(encode) {
		if (typeof(encode) == "undefined") encode = true;
		var data = new Array();
		this.store.each(function(record){data.push(record.data);});
		this.store.commitChanges();
		if (!data.length) return null;
		return encode ? Ext.encode(data) : data;
	},
	
	exclude: function() {
		var selections = this.getView().getSelectionModel().getSelection();
			
		if (!selections.length) {
			App.noRecordsSelected();
			return false;
		}
		this.store.remove(selections);
		
		var id = [];
		Ext.each(selections, function(record) {
			if (record.get('con_id') > 0) {
				id.push(record.get('con_id'));
			}
		});
		
		if (!id.length) {
			return false;
		}
		Ext.Ajax.request({
			url: 'php/response.php',
			method: 'post',
			params: {
				m: 'delete_contato',
				con_id: id.join(',')
			},
			failure: App.ajaxFailure,
			success: App.ajaxDeleteSuccess
		});
	}
});

Ext.define('Filtro.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.filtrogrid',
	
	fieldStorage: null,
	
	activeRecord: null,
	
	isReport: false,
	border: false,
	
	groupReport: null,
	groupDefault: null,
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.Store', {
			model: 'Filtro.data.Model',
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			sorters: [{
				property: 'campo',
				direction: 'ASC'
			},{
				property: 'operador',
				direction: 'ASC'
			},{
				property: 'resultado',
				direction: 'ASC'
			}]
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 1,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
				}
			}
		});
		
		var dockedItems = [{
			xtype: 'toolbar',
			dock: 'top',
			items: [{
				iconCls: 'icon-plus',
				text: 'Novo filtro',
				handler: function() {
					var pos = me.store.getCount();
					me.editing.cancelEdit();
					me.store.insert(pos, Ext.create('Filtro.data.Model'));
					me.editing.startEditByPosition({row: pos, column: 0});
				}
			},{
				iconCls: 'icon-minus',
				text: 'Excluir',
				itemId: 'delete',
				disabled: true,
				handler: function() {
					var selections = me.getView().getSelectionModel().getSelection();
					if (selections.length) {
						me.store.remove(selections);
					} else {
						App.noRecordsSelected();
					}
				}
			}]
		}];
		
		if (me.isReport === true) {
			dockedItems[0].items.push('->');
			dockedItems[0].items.push('Ordenar por:&nbsp;');
			dockedItems[0].items.push({
				width: 250,
				itemId: 'orderfield',
				xtype: 'localcombo',
				options: me.fieldStorage,
				multiSelect: true,
				listeners: {
					reset: function() {
						me.sorters = null;
					},
					select: function(field, records) {
						var orderfield = me.down('#dirfield'), orderby = orderfield.getValue();
						if (Ext.isEmpty(orderby)) {
							orderby = 'ASC';
							orderfield.setValue(orderby);
						}
						me.sorters = [];
						Ext.each(records, function(record){
							me.sorters.push({
								property: record.get('id'),
								direction: orderby
							});
						});
					}
				}
			},{
				width: 70,
				itemId: 'dirfield',
				xtype: 'localcombo',
				value: 'ASC',
				options: ['ASC','DESC']
			});
			
			dockedItems.push({
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
					xtype: 'radio',
					boxLabel: 'Detalhado',
					name: 'typereport',
					itemId: 'detalhado',
					checked: true
				},'&nbsp;',{
					xtype: 'radio',
					boxLabel: 'Resumido',
					name: 'typereport',
					itemId: 'resumido'
				},'->','Agrupar por:&nbsp;',{
					width: 250,
					itemId: 'groupfield',
					xtype: 'localcombo',
					options: me.fieldStorage
				}]
			});
			
			if (!Ext.isEmpty(me.groupReport)) {
				var key = dockedItems.length - 1;
				dockedItems[key].items.push('-');
				dockedItems[key].items.push({
					width: 250,
					itemId: 'groupreport',
					xtype: 'localcombo',
					value: me.groupDefault,
					options: me.groupReport
				});
			}
		}
		
		Ext.apply(this, {
			emptyText: '',
			loadMask: false,
			multiSelect: true,
			enableLocking: false,
			enableColumnHide: false,
			enableColumnMove: false,
			enableColumnResize: false,
			plugins: [me.editing],
			columns: [{
				dataIndex: 'campo_rotulo',
				text: 'Onde o campo selecionado',
				tooltip: 'Campo para filtro',
				flex: 1,
				hideable: false,
				sortable: false,
				menuDisabled: true,
				editor: {
					xtype: 'localcombo',
					valueField: 'field',
					options: me.fieldStorage,
					listeners: {
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set('campo', record.get('id'));
						}
					}
				}
			},{
				dataIndex: 'operador_rotulo',
				text: 'For',
				tooltip: 'Operador lógico para filtro',
				width: 90,
				hideable: false,
				sortable: false,
				menuDisabled: true,
				editor: {
					xtype: 'localcombo',
					valueField: 'field',
					options: [{
						id: '=',
						field: 'Igual'
					},{
						id: '!=',
						field: 'Diferente'
					},{
						id: '<',
						field: 'Menor'
					},{
						id: '>',
						field: 'Maior'
					},{
						id: '<=',
						field: 'Menor igual'
					},{
						id: '>=',
						field: 'Maior igual'
					},{
						id: 'LIKE',
						field: 'Parecido'
					}],
					listeners: {
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set('operador', record.get('id'));
						}
					}
				}
			},{
				dataIndex: 'resultado',
				text: 'Resultado',
				flex: 2,
				hideable: false,
				sortable: false,
				menuDisabled: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true
				}
			}],
			dockedItems: dockedItems,
			listeners: {
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0);
				}
			}
		});
		
		me.callParent(arguments);
	},
	
	getReportParams: function(encode) {
		if (typeof(encode) == "undefined") encode = true;
		var result = {
			sorters: this.sorters || null,
			reportview: this.down('#resumido').getValue() ? 2 : 1,
			groupfield: this.down('#groupfield').getValue(),
			grouplabel: this.down('#groupfield').getRawValue().toUpperCase(),
			groupreport: this.down('#groupreport').getValue()
		};
		return encode ? Ext.encode(result) : result;
	},
	
	getRecords: function(encode) {
		if (typeof(encode) == "undefined") encode = true;
		var data = new Array();
		this.store.each(function(record){data.push(record.data);});
		this.store.commitChanges();
		if (!data.length) return null;
		return encode ? Ext.encode(data) : data;
	}
});
/*
 * End of Grid Component
 */

/*
 * Textfield Component
 */
Ext.define('Ext.ux.SearchField', {
	extend: 'Ext.form.field.Trigger',
	alias: 'widget.searchfield',
	
	triggerCls: 'x-form-search-trigger',
	
	grid: null,
	store: null,
	fields: null,
	normalSearch: true,
	
	initComponent: function() {
		var me = this;
		me.addEvents('beforefilter');
		me.emptyText = 'Pesquisar...',
		me.on('specialkey', function(f, e) {
			if (e.getKey() == e.ENTER) {
				me.doSearch();
			}
		});
		if (me.store) {
			var proxy = me.store.getProxy();
			proxy.setExtraParam('normalquery', me.normalSearch);
		}
		me.callParent(arguments);
	},
	
	toggleNormalSearch: function(enable) {
		var me = this;
		if (me.store) {
			if (typeof(enable) == "undefined") {
				enable = !me.normalSearch;
			}
			me.normalSearch = enable;
			me.store.getProxy().setExtraParam('normalquery', enable);
		}
	},
	
	onRender: function() {
		var me = this;
		me.callParent(arguments);
		Ext.Function.defer(me.initTooltip, 800, me.inputEl);
	},
	
	initTooltip: function() {
		var me = this, qt = Ext.DomHelper.append(Ext.getBody(), {
			tag: 'span',
			cls: 'tooltip',
			html: 'Comece pesquisando!',
			style: {
				opacity: 0
			}
		}, true);
		qt.applyStyles({
			top: 0 - qt.getHeight(),
			left: me.getX() + (me.getWidth() / 2) - (qt.getWidth() / 2)
		});
		qt.syncFx().animate({
			duration: 800,
			from: {opacity: 0},
			to: {
				opacity: 1,
				top: (me.getY() + 1) - qt.getHeight()
			}
		});
		Ext.Function.defer(function(){
			qt.syncFx().animate({
				duration: 800,
				remove: true,
				to: {
					opacity: 0,
					top: 0 - qt.getHeight()
				}
			});
		}, 10000);
		var onDemiss = function(){
			qt.syncFx().animate({
				duration: 800,
				remove: true,
				to: {
					opacity: 0,
					top: 0 - qt.getHeight()
				}
			});
		};
		qt.on('click', onDemiss);
		qt.on('mouseenter', onDemiss);
	},
	
	onTriggerClick: function() {
		if (this.triggerCls == 'x-form-clear-trigger') {
			this.clearSearch();
		} else {
			this.doSearch();
		}
	},
	
	doSearch: function() {
		if (this.store && this.fields) {
			var v = this.getRawValue(); if (v == this.emptyText) return;
			var el = Ext.select('#' + this.getId() + ' div.' + this.triggerCls);
			
			this.triggerCls = 'x-form-clear-trigger';
			
			el.removeCls('x-form-search-trigger');
			el.addCls('x-form-clear-trigger');
			
			if (Ext.isEmpty(v)) {
				this.clearSearch();
				return;
			}

			if (this.query != v) {
				this.fireEvent('beforefilter', this, this.store, this.grid);
				this.store.clearFilter(true);
				var filter = new Array();
				Ext.each(this.fields, function(field){filter.push({property: field, value: v});});
				this.store.filter(filter);
				this.query = v;
			}
		}
	},
	
	clearSearch: function(silence) {
		this.fireEvent('clearfilter', this, this.store, this.grid);
		
		if (typeof(silence) == "undefined") silence = false;
		var el = Ext.select('#' + this.getId() + ' div.' + this.triggerCls);
		
		this.triggerCls = 'x-form-search-trigger';
		
		el.removeCls('x-form-clear-trigger');
		el.addCls('x-form-search-trigger');
		
		this.query = null;
		this.reset();
		
		if (this.store) this.store.clearFilter(silence);
	}
});
Ext.define('Ext.ux.TreeSearchField', {
	extend: 'Ext.form.field.Trigger',
	alias: 'widget.treesearchfield',
	
	triggerCls: 'x-form-search-trigger',
	
	local: true,
	store: null,
	fields: null,
	
	initComponent: function() {
		this.emptyText = 'Pesquisar...',
		this.on('specialkey', function(f, e){if (e.getKey() == e.ENTER) {this.doSearch();}}, this);
		this.callParent(arguments);
	},
	
	onTriggerClick: function() {
		if (this.triggerCls == 'x-form-clear-trigger') {
			this.clearSearch();
		} else {
			this.doSearch();
		}
	},
	
	doSearch: function(){
		var me = this;
		if (me.store && me.fields) {
			if (me.store.isLoading()) return false;
			
			var v = me.getRawValue(); if (v == me.emptyText) return;
			var el = Ext.select('#' + me.getId() + ' div.' + me.triggerCls);
			
			me.triggerCls = 'x-form-clear-trigger';
			
			el.removeCls('x-form-search-trigger');
			el.addCls('x-form-clear-trigger');
			
			if (Ext.isEmpty(v)) {
				me.clearSearch();
				return;
			}
			
			if (me.query != v) {
				me.clearFilter();
				if (me.local) {
					v = v.toLowerCase();
					me.removedNodes = new Array();
					var er = new RegExp(v, 'gi'), cascade = function(node) {
						node = node || me.store.getRootNode();
						if (node.hasChildNodes()) {
							Ext.each(node.childNodes, function(child){
								cascade(child);
							});
						}
						if (node.isLeaf()) {
							var search, testAll = false;
							Ext.each(me.fields, function(field){
								search = node.get(field);
								if (Ext.isString(search)) search = search.toLowerCase();
								if (er.test(search)) testAll = true;
							});
							if (!testAll) {
								node.remove();
								me.removedNodes.push(node);
							}
						}
					};
					cascade();
					me.store.getRootNode().expand(true);
				} else {
					me.disable();
					var filter = [];
					Ext.each(me.fields, function(field){filter.push({property: field, value: v});});
					me.store.getProxy().setExtraParam('query', Ext.encode(filter));
					me.store.load({callback:function(){me.enable();}});
				}
				me.query = v;
			}
		}
	},
	
	clearFilter: function() {
		var me = this;
		Ext.each(me.removedNodes, function(node){
			var rNode = me.store.getNodeById(node.get('pai_id')) || me.store.getRootNode();
			if (rNode) {
				node = rNode.appendChild(node);
				node.set('leaf', true);
				node.commit();
			}
		});
	},
	
	clearSearch: function() {
		var me = this, el = Ext.select('#' + me.getId() + ' div.' + me.triggerCls);
		
		me.triggerCls = 'x-form-search-trigger';
		
		el.removeCls('x-form-clear-trigger');
		el.addCls('x-form-search-trigger');
		
		me.query = null;
		me.reset();
		
		if (me.store) {
			if (me.local) {
				me.clearFilter();
			} else {
				me.disable();
				me.store.getProxy().setExtraParam('query', null);
				me.store.load({callback: function(){me.enable();}});
			}
		}
	}
});
Ext.define('Ext.ux.CnpjField', {
	extend: 'Ext.form.field.Trigger',
	alias: 'widget.cnpjfield',
	
	triggerCls: 'x-form-search-trigger',
	
	formalias: 'form',
	fields: {
		razao_social: 'razao_social',
		nome_fantasia: 'nome_fantasia',
		ie: 'ie',
		endereco: 'endereco',
		numero: 'numero',
		complemento: 'complemento',
		cep: 'cep',
		bairro: 'bairro',
		cidade: 'cidade',
		uf: 'uf',
		situacao_cadastral_receita: 'situacao_cadastral_receita'
	},
	
	initComponent: function() {
		this.vtype = 'cnpj';
		this.callParent(arguments);
	},
	
	onTriggerClick: function() {
		if (this.triggerCls == 'x-form-search-trigger') {
			this.showCaptcha();
		}
	},
	
	showCaptcha: function() {
		var me = this, v = me.getRawValue(); if (v == me.emptyText) return;
		if (Ext.isEmpty(v)) {
			me.markInvalid('Você precisa informar o CNPJ');
			return;
		}
		me.triggerCls = 'x-form-loading-trigger';
		Ext.Ajax.request({
			url: 'php/response.php',
			method: 'post',
			params: {
				m: 'receita_captcha'
			},
			failure: function() {
				me.reset();
				me.triggerCls = 'x-form-search-trigger';
			},
			success: function(response) {
				var o = Ext.decode(response.responseText);
				if (!o.success) {
					me.markInvalid('Não foi possível detectar captcha da receita.gov');
					return false;
				}
				me.triggerCls = 'x-form-search-trigger';
				var win = Ext.create('Ext.ux.Alert', {
					ui: 'black-alert',
					msg: '<span style="color:white;">Carregando...<span>',
					buttons: [{
						text: 'COLETAR DADOS',
						autoClose: false,
						handler: function() {
							var btn = this, captcha = win.down('textfield[name=captcha]');
							if (Ext.isEmpty(captcha.getRawValue())) {
								captcha.markInvalid('Captcha inválido');
								captcha.focus();
								return false;
							}
							btn.setDisabled(true);
							Ext.Ajax.request({
								url: 'php/response.php',
								method: 'post',
								params: {
									m: 'receita_cnpj',
									cnpj: v.replace(new RegExp("[^0-9]",'gi'), ""),
									captcha: captcha.getRawValue(),
									token: o.token
								},
								failure: App.ajaxFailure,
								success: function(response) {
									var r = Ext.decode(response.responseText), form = me.findParentByType(me.formalias || 'form').getForm();
									if (form && r.dados) {
										if (r.dados.hasOwnProperty('nomeEmpre')) form.findField(me.fields.razao_social).setValue(r.dados.nomeEmpre.toUpperCase());
										if (r.dados.hasOwnProperty('tituloEstab')) {
											if (r.dados.tituloEstab.indexOf("*") > -1) {
												form.findField(me.fields.nome_fantasia).setValue(r.dados.nomeEmpre.toUpperCase());
											} else {
												form.findField(me.fields.nome_fantasia).setValue(r.dados.tituloEstab.toUpperCase());
											}
										}
										if (r.dados.hasOwnProperty('logradouro') && !Ext.isEmpty(me.fields.endereco)) {
											var enderecoField = form.findField(me.fields.endereco);
											if (enderecoField){
												enderecoField.setValue(r.dados.logradouro.toUpperCase());
											}
										}
										if (r.dados.hasOwnProperty('numero') && !Ext.isEmpty(me.fields.numero)) {
											var numField = form.findField(me.fields.numero);
											if (numField) {
												numField.setValue(r.dados.numero);
											}
										}
										if (r.dados.hasOwnProperty('complemento') && !Ext.isEmpty(me.fields.complemento)) {
											var complementoField = form.findField(me.fields.complemento);
											if (complementoField) {
												complementoField.setValue(r.dados.complemento.toUpperCase());
											}
										}
										if (r.dados.hasOwnProperty('bairro') && !Ext.isEmpty(me.fields.bairro)) {
											var bairroField = form.findField(me.fields.bairro);
											if (bairroField) {
												bairroField.setValue(r.dados.bairro.toUpperCase());
											}
										}
										if (r.dados.hasOwnProperty('cep') && !Ext.isEmpty(me.fields.cep)) {
											var cepField = form.findField(me.fields.cep);
											if (cepField) {
												cepField.setValue(r.dados.cep.replace(/[^0-9]/g, ""));
											}
										}
										if (r.dados.hasOwnProperty('municipio') && !Ext.isEmpty(me.fields.cidade)) {
											var cidadeField = form.findField(me.fields.cidade);
											if (cidadeField) {
												cidadeField.setValue(r.dados.municipio.toUpperCase());
											}
										}
										if (r.dados.hasOwnProperty('uf') && !Ext.isEmpty(me.fields.uf)) {
											var ufField = form.findField(me.fields.uf);
											if (ufField) {
												ufField.setValue(r.dados.uf.toUpperCase());
											}
										}
										if (r.dados.hasOwnProperty('sitCad') && !Ext.isEmpty(me.fields.situacao_cadastral_receita)) {
											var sitCadField = form.findField(me.fields.situacao_cadastral_receita);
											if (sitCadField) {
												sitCadField.setValue(r.dados.sitCad.toUpperCase());
											}
										}
										//if (r.dados.hasOwnProperty('numeroInsc')) form.findField(me.fields.ie).setValue(r.dados.numeroInsc);
									}
									win.close();
								}
							});
						}
					}]
				});
				var img = new Image();
				img.onload = function() {
					var originalWidth = this.width, w = 'auto', h = 'auto';
					if (this.width > window.innerWidth) {
						w = (window.innerWidth - (0.5 * window.innerWidth));
						this.width = w;
					}
					if (this.height > window.innerHeight) {
						h = (window.innerHeight - (0.5 * window.innerHeight));
						this.height = h;
					}
					var height = Math.round(this.height + 60);
					win.animate({to:{top:((window.innerHeight - height) / 2)}});
					win.update('<img src="'+this.src+'" width="'+w+'" height="'+h+'" class="img-center"/>');
					win.add([{
						xtype: 'textfield',
						emptyText: 'Informe o que está na imagem',
						name: 'captcha',
						allowBlank: false,
						width: originalWidth,
						fieldStyle: {
							marginLeft: ((window.innerWidth / 2) - (originalWidth / 2) - 10)
						}
					}]);
					win.setHeight(height + 30);
					win.doLayout();
				};
				img.src = 'php/getcaptcha.php?id=' + o.id;
			}
		});
	}
});
/*
 * End of Textfield Component
 */

/*
 * ComboBox, SelectField Componentes
 */
Ext.define('Ext.ux.ComboGrid', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.combogrid'],

	// copied from ComboBox
	createPicker: function() {
		/*
		 * Usage
			xtype: 'combogrid',
			valueField: 'name',
			displayField: 'name',
			store: yourstore,
			listConfig: {
				columns: [{
					header: 'Name',
					dataIndex: 'name',
				}]
			}
		*/
		var me = this, picker, menuCls = Ext.baseCSSPrefix + 'menu', 
		opts = Ext.apply({
			selModel: {
				mode: me.multiSelect ? 'SIMPLE' : 'SINGLE'
			},
			floating: true,
			hidden: true,
			ownerCt: me.ownerCt,
			cls: me.el.up('.' + menuCls) ? menuCls : '',
			store: me.store,
			displayField: me.displayField,
			focusOnToFront: false,
			pageSize: me.pageSize
		}, me.listConfig, me.defaultListConfig);
		
		// NOTE: we simply use a grid panel
		//picker = me.picker = Ext.create('Ext.view.BoundList', opts);
		picker = me.picker = Ext.create('Ext.grid.Panel', opts);
		// hack: pass getNode() to the view
		picker.getNode = function() {
			picker.getView().getNode(arguments);
		};

		me.mon(picker, {
			itemclick: me.onItemClick,
			refresh: me.onListRefresh,
			scope: me
		});

		me.mon(picker.getSelectionModel(), {
			selectionChange: me.onListSelectionChange,
			scope: me
		});
		
		return picker;
	}
});

Ext.define('Empresa.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.empresacombo',
	
	valueField: 'emp_id',	
	displayField: 'emp_login',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 50,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Empresa.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/sistema/empresas/php/response.php',
					extraParams: {
						m: 'empresas_store'
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
					property: 'emp_login',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 300,
				resizable: true,
				getInnerTpl: function() {
					return '{emp_razao_social}<br/><small>{emp_login}</small>';
				}
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Cliente.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.clientecombo',
	
	valueField: 'clie_id',	
	displayField: 'clie_razao_social',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		if (!Ext.isObject(this.extraParams)) {
			this.extraParams = {};
		}
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Cliente.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/clientes/php/response.php',
					extraParams: Ext.applyIf({
						m: 'clientes_store'
					}, this.extraParams),
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
					property: 'clie_razao_social',
					direction: 'ASC'
				},{
					property: 'clie_nome_fantasia',
					direction: 'ASC'
				},{
					property: 'clie_categoria_nome',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 500,
				resizable: true,
				getInnerTpl: function() {
					return '<tpl if="cid_sigla">{cid_sigla} - </tpl>{clie_razao_social}<br/><small>{clie_nome_fantasia} ({clie_categoria_nome}) - {clie_cnpj} {clie_cpf}<br/>{cid_municipio}/{cid_uf}</small>';
				}
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Contato.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.contatocombo',
	
	clie_id: 0,
	valueField: 'con_id',
	displayField: 'con_nome',
	showTrigger: false,
	forceSelection: true,
	
	setClieId: function(id) {
		this.clie_id = id;
		this.store.getProxy().setExtraParam('clie_id', id);
		this.store.load();
	},
	
	initComponent: function() {
		Ext.apply(this, {
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			queryMode: 'local',
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Contato.data.Model',
				autoLoad: this.clie_id > 0,
				remoteSort: false,
				listeners: {
					beforeload: function() {
						return this.getProxy().extraParams.clie_id > 0;
					}
				},
				proxy: {
					type: 'ajax',
					url: 'php/response.php',
					extraParams: {
						m: 'read_contato',
						clie_id: this.clie_id
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
					property: 'con_nome',
					direction: 'ASC'
				}]
			})
		});
		
		this.callParent(arguments);
	}
});

Ext.define('Grupo.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.grupocombo',
	
	valueField: 'perm_id',
	displayField: 'perm_grupo',
	delimiter: ',',
	
	initComponent: function() {
		Ext.apply(this, {
			typeAhead: true,
			queryMode: 'local',
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Grupo.combo.Store,
			listConfig: {
				resizable: true,
				minWidth: 200
			}
		});
		this.callParent(arguments);
	}
});

Ext.define('Usuario.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.usuariocombo',
	
	valueField: 'user_id',
	displayField: 'user_nome',
	delimiter: ',',
	
	initComponent: function() {
		Ext.apply(this, {
			typeAhead: true,
			queryMode: 'local',
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Usuario.combo.Store,
			listConfig: {
				resizable: true,
				minWidth: 200
			}
		});
		this.callParent(arguments);
	}
});

Ext.define('Cidade.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.cidadecombo',
	
	valueField: 'cid_id',
	displayField: 'cid_nome',
	delimiter: ', ',
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: true,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Cidade.data.Model',
				autoLoad: false,
				remoteSort: true,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/cidades/php/response.php',
					extraParams: {
						m: 'cidades_store'
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
				}]
			}),
			listConfig: {
				minWidth: 300,
				resizable: true,
				getInnerTpl: function() {
					return '{cid_nome_completo}';
				}
			}
		});
		this.callParent(arguments);
	}
});

Ext.define('GrupoTarifa.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.grupotarifacombo',
	
	valueField: 'gt_id_codigo',	
	displayField: 'gt_descricao',
	especifica: false,
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'GrupoTarifa.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/grupostarifas/php/response.php',
					extraParams: {
						m: 'grupos_tarifas_store',
						especifica: this.especifica
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
					property: 'gt_id_codigo',
					direction: 'ASC'
				},{
					property: 'gt_descricao',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 400,
				resizable: true,
				getInnerTpl: function() {
					return '{gt_id_codigo} - {gt_descricao}';
				}
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('IATACodigo.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.iatacodigocombo',
	
	valueField: 'iic_id',	
	displayField: 'iic_nome',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'IATACodigo.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/iatacodigos/php/response.php',
					extraParams: {
						m: 'iata_codigos_store'
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
					property: 'iic_nome',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 400,
				resizable: true,
				getInnerTpl: function() {
					return '{iic_nome}';
				}
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('CFOPCodigo.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.cfopcodigocombo',
	
	valueField: 'cfop_id',	
	displayField: 'cfop_nome',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'CFOPCodigo.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/cfopcodigos/php/response.php',
					extraParams: {
						m: 'cfop_codigos_store'
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
					property: 'cfop_nome',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 400,
				resizable: true
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Produto.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.produtocombo',
	
	valueField: 'prod_id',
	displayField: 'prod_nome',
	delimiter: ', ',
	hideTrigger: true,
	
	initComponent: function() {
		if (!Ext.isObject(this.extraParams)) {
			this.extraParams = {};
		}
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Produto.data.Model',
				autoLoad: false,
				remoteSort: true,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/produtos/php/response.php',
					extraParams: Ext.applyIf({
						m: 'produtos_store'
					}, this.extraParams),
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
				}]
			}),
			listConfig: {
				minWidth: 300,
				resizable: true,
				getInnerTpl: function() {
					return '{prod_nome}<tpl if="iic_nome"><br/><small>{iic_nome}</small></tpl>';
				}
			}
		});
		this.callParent(arguments);
	}
});

Ext.define('RotaEntrega.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.rotaentregacombo',
	
	valueField: 'rota_id',
	displayField: 'rota_nome',
	delimiter: ', ',
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: true,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'RotaEntrega.data.Model',
				autoLoad: false,
				remoteSort: true,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/rotasentregas/php/response.php',
					extraParams: {
						m: 'rotas_store'
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
					property: 'rota_nome',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 300,
				resizable: true
			}
		});
		this.callParent(arguments);
	}
});

Ext.define('PracaPagamento.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.pracapagamentocombo',
	
	valueField: 'prp_id',	
	displayField: 'prp_praca_pagto',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'PracaPagamento.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/pracaspagamentos/php/response.php',
					extraParams: {
						m: 'pracas_pagamentos_store'
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
					property: 'prp_praca_pagto',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 300,
				resizable: true
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Composicao.Calculo.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.composicaocalculocombo',
	
	valueField: 'cc_id',	
	displayField: 'cc_titulo',
	
	showTrigger: false,
	forceSelection: true,
	
	cf_tipo: null,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Composicao.Calculo.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/conhecimentos/composicaocalculo/php/response.php',
					extraParams: {
						m: 'calculo_store',
						cf_tipo: this.cf_tipo
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
					property: 'cc_titulo',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 300,
				resizable: true
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Composicao.Frete.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.composicaofretecombo',
	
	valueField: 'cf_id',	
	displayField: 'cf_nome',
	
	showTrigger: false,
	forceSelection: true,
	
	cf_tipo: null,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Composicao.Frete.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/conhecimentos/composicaofrete/php/response.php',
					extraParams: {
						m: 'frete_store',
						cf_tipo: this.cf_tipo
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
					property: 'cf_nome',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 300,
				resizable: true
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Ocorrencia.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.ocorrenciacombo',
	
	valueField: 'ocor_id',
	displayField: 'ocor_nome',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Ocorrencia.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/ocorrencias/php/response.php',
					extraParams: {
						m: 'ocorrencia_store'
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
					property: 'ocor_nome',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 300,
				resizable: true,
				getInnerTpl: function() {
					return '{ocor_nome}<br/><small>{ocor_modal} - {ocor_caracteristica}</small>';
				}
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Documento.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.documentocombo',
	
	valueField: 'cte_doc_id',	
	displayField: 'cte_doc_numero',
	forceSelection: true,
	
	cte_id: 0,
	setCteId: function(id) {
		var proxy = this.store.getProxy();
		if (proxy.extraParams.cte_id != id) {
			proxy.setExtraParam('cte_id', id);
			this.store.load();
		}
		this.cte_id = id;
	},
	
	initComponent: function() {
		Ext.apply(this, {
			editable: false,
			queryMode: 'local',
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'CTE.Documento.data.Model',
				autoLoad: true,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/conhecimentos/ctes/php/response.php',
					extraParams: {
						m: 'documentos_store',
						cte_id: this.cte_id
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
					property: 'cte_doc_numero',
					direction: 'ASC'
				}],
				listeners: {
					beforeload: function() {
						return this.getProxy().extraParams.cte_id > 0;
					}
				}
			}),
			listConfig: {
				minWidth: 300,
				resizable: true
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Banco.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.bancocombo',
	
	valueField: 'id',
	displayField: 'banco',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Banco.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/bancos/php/response.php',
					extraParams: {
						m: 'banco_store'
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
					property: 'banco_nome',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 300,
				resizable: true,
				getInnerTpl: function() {
					return '{banco}<tpl if="conta_corrente"><br/><small>AG: {agencia} | C/C: {conta_corrente}</small></tpl>';
				}
			}
		});
		
		this.callParent(arguments);
		
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Endereco.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.enderecocombo',
	
	formalias: 'form',
	valueField: 'endereco_numero',
	displayField: 'endereco_numero',
	fields: {
		useDefaults: false,
		cep: null,
		bairro: null,
		cidade: null,
		uf: null,
		numero: null
	},
	
	initComponent: function() {
		Ext.apply(this, {
			xtype: 'combo',
			minChars: 10,
			typeAhead: true,
			hideTrigger: true,
			store: Ext.create('Ext.data.Store', {
				model: 'Endereco.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'php/response.php',
					extraParams: {
						m: 'endereco_store'
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
					property: 'full',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				minWidth: 500,
				resizable: true,
				getInnerTpl: function() {
					return '{endereco_numero}<br/>{cep} {bairro}<br/>{cidade}/{estado}';
				}
			}
		});
		
		if (this.fields.useDefaults) {
			this.fields.cep = 'cep';
			this.fields.bairro = 'bairro';
			this.fields.cidade = 'cidade';
			this.fields.uf = 'uf';
			this.fields.numero = 'numero';
		}
		
		this.callParent(arguments);
		
		this.on('select', this.onSelect);
	},
	
	onSelect: function(f, r, i) {
		r = r[0];
		try {
			var form = this.findParentByType(this.formalias || 'form').getForm();
			if (!Ext.isEmpty(this.fields.bairro)) {
				var bairroField = form.findField(this.fields.bairro);
				if (bairroField) {
					bairroField.setValue(r.get('bairro'));
				}
			}
			if (!Ext.isEmpty(this.fields.cep)) {
				var cepField = form.findField(this.fields.cep);
				if (cepField) {
					cepField.setValue(r.get('cep').replace(/[^0-9]/g, ""));
				}
			}
			if (!Ext.isEmpty(this.fields.cidade)) {
				var cidadeField = form.findField(this.fields.cidade);
				if (cidadeField) {
					cidadeField.setValue(r.get('cidade'));
				}
			}
			if (!Ext.isEmpty(this.fields.uf)) {
				var ufField = form.findField(this.fields.uf);
				if (ufField) {
					ufField.setValue(r.get('estado'));
				}
			}
			if (!Ext.isEmpty(this.fields.numero)) {
				var numField = form.findField(this.fields.numero);
				if (numField) {
					numField.setValue(r.get('numero'));
				}
			}
		} catch (e) {
			Ext.create('Report.Error', {error:e.message});
		}
	}
});

Ext.define('Month.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.monthcombo',
	
	valueField: 'monthvalue',
	displayField: 'monthname',
	
	initComponent: function() {
		Ext.apply(this, {
			queryMode: 'local',
			store: Ext.create('Ext.data.Store', {
				autoDestroy: true,
				remoteSort: false,
				remoteGroup: false,
				remoteFilter: false,
				fields: ['monthvalue', 'monthname'],
				sorters: [{
					property:'monthvalue',
					direction:'ASC'
				}], 
				data: [{
					monthvalue: 1,
					monthname: 'JANEIRO'
				},{
					monthvalue: 2,
					monthname: 'FEVEREIRO'
				},{
					monthvalue: 3,
					monthname: 'MARÇO'
				},{
					monthvalue: 4,
					monthname: 'ABRIL'
				},{
					monthvalue: 5,
					monthname: 'MAIO'
				},{
					monthvalue: 6,
					monthname: 'JUNHO'
				},{
					monthvalue: 7,
					monthname: 'JULHO'
				},{
					monthvalue: 8,
					monthname: 'AGOSTO'
				},{
					monthvalue: 9,
					monthname: 'SETEMBRO'
				},{
					monthvalue: 10,
					monthname: 'OUTUBRO'
				},{
					monthvalue: 11,
					monthname: 'NOVEMBRO'
				},{
					monthvalue: 12,
					monthname: 'DEZEMBRO'
				}]
			})
		});
		this.callParent(arguments);
	}
});

Ext.define('LocalCombo.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.localcombo',
	
	options: null,
	valueField: 'id',
	displayField: 'field',
	
	initComponent: function() {
		var data = new Array();
		if (Ext.isArray(this.options)) {
			if (this.options.length) {
				var i, item;
				for (i = 0; i < this.options.length; i++) {
					item = this.options[i];
					if (Ext.isObject(item)) {
						data.push({
							id: item.id,
							field: item.field
						});
					} else if (Ext.isArray(item)) {
						data.push({
							id: item[0],
							field: item[1]
						});
					} else {
						data.push({
							id: item,
							field: item
						});
					}
				}
			}
		}
		Ext.apply(this, {
			editable: false,
			queryMode: 'local',
			store:  Ext.create('Ext.data.Store', {
				data: data,
				autoDestroy: true,
				remoteSort: false,
				remoteGroup: false,
				remoteFilter: false,
				fields: ['id', 'field'],
				sorters: [{
					property: 'field',
					direction: 'ASC'
				}]
			})
		});
		this.callParent(arguments);
	}
});

Ext.define('Moeda.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.moedacombo',
	
	initComponent: function() {
		var options = new Array();
		Ext.Array.each(App.cambio.options, function(name) {options.push({moeda: name});});
		this.store =  Ext.create('Ext.data.Store', {
			data : options,
			fields: ['moeda'],
			sorters: [{
				property: 'moeda', 
				direction: 'ASC'
			}]
		});
		
		Ext.apply(this, {
			displayField: 'moeda',
			valueField: 'moeda',
			queryMode: 'local',
			selectOnFocus: true,
			hideTrigger: false,
			editable: false,
			listConfig: {
				width: 120,
				minWidth: 120,
				resizable: true,
				getInnerTpl: function() {
					return '{moeda}<small style="float:right;">{[Ext.util.Format.brMoney(App.cambio.conversor(values.moeda))]}</small>';
				}
			}
		});
		this.callParent(arguments);
	}
});

Ext.define('Agregado.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.agregadocombo',
	
	valueField: 'id',
	displayField: 'xNome',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Agregados.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/agregados/php/response.php',
					extraParams: {
						m: 'agregado_store'
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
					property: 'xNome',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				resizable: true,
				minWidth: 200
			}
		});
		
		this.callParent(arguments);
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Motorista.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.motoristacombo',
	
	valueField: 'id',
	displayField: 'nome',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		if (!Ext.isObject(this.extraParams)) {
			this.extraParams = {};
		}
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Motoristas.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/motoristas/php/response.php',
					extraParams: Ext.applyIf({
						m: 'motorista_store'
					}, this.extraParams),
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
					property: 'nome',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				resizable: true,
				minWidth: 200
			}
		});
		
		this.callParent(arguments);
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});

Ext.define('Veiculo.form.Select', {
	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.veiculocombo',
	
	valueField: 'id',
	displayField: 'placa',
	
	showTrigger: false,
	forceSelection: true,
	
	initComponent: function() {
		if (!Ext.isObject(this.extraParams)) {
			this.extraParams = {};
		}
		Ext.apply(this, {
			pageSize: 10,
			typeAhead: true,
			hideTrigger: !this.showTrigger,
			valueNotFoundTex: 'Nenhum item encontrado...',
			store: Ext.create('Ext.data.Store', {
				model: 'Veiculos.data.Model',
				autoLoad: false,
				remoteSort: false,
				proxy: {
					type: 'ajax',
					url: 'mod/cadastros/veiculos/php/response.php',
					extraParams: Ext.applyIf({
						m: 'veiculo_store'
					}, this.extraParams),
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
					property: 'placa',
					direction: 'ASC'
				}]
			}),
			listConfig: {
				resizable: true,
				minWidth: 200,
				getInnerTpl: function() {
					return '{placa} {tpRod_rotulo}';
				}
			}
		});
		
		this.callParent(arguments);
		if (!Ext.isEmpty(this.loadValue)) this.setValue(this.loadValue);
	}
});
/*
 * End of ComboBox Components
 */
/*
 * Custum Fields
 */
Ext.define('Integer.form.field', {
	extend: 'Ext.form.field.Number',
	alias: 'widget.intfield',
	
	hideTrigger: true,
	initComponent: function() {
		Ext.apply(this, {
			selectOnFocus: true,
			allowDecimals: false,
			keyNavEnabled: true,
			mouseWheelEnabled: false
		});
		this.callParent(arguments);
	}
});

Ext.define('Percent.form.field', {
	extend: 'Ext.form.field.Number',
	alias: 'widget.percentfield',
	
	hideTrigger: true,
	maxValue: 999.99,
	
	initComponent: function() {
		Ext.apply(this, {
			allowBlank: false,
			selectOnFocus: true,
			allowDecimals: true,
			keyNavEnabled: true,
			mouseWheelEnabled: false
		});
		this.callParent(arguments);
	}
});

Ext.define('Mathematic.form.field', {
	extend: 'Ext.form.field.Text',
	alias: 'widget.mathematicfield',	
	
	initComponent: function() {
		Ext.apply(this, {
			selectOnFocus: true,
			emptyText: 'expressão matemática',
			stripCharsRe: new RegExp('[^0-9\,\+\-\/\*\(\)]','gi'),
			fieldStyle: {
				textAlign: 'right'
			}
		});
		this.callParent(arguments);
	}
});

Ext.define('Decimal.form.field', {
	extend: 'Ext.form.field.Number',
	alias: 'widget.decimalfield',
	
	hideTrigger: true,
	initComponent: function() {
		Ext.apply(this, {
			allowBlank: false,
			selectOnFocus: true,
			allowDecimals: true,
			keyNavEnabled: true,
			mouseWheelEnabled: false
		});
		this.callParent(arguments);
	}
});

Ext.define('Cambio.form.field', {
	extend: 'Ext.form.field.Number',
	alias: 'widget.cambiofield',
	
	cambioTo: 'BRL',
	cambioFrom: 'USD',
	cambioRate: 0,
	cambioText: 'Convertendo...',
	value: 0,
	
	initComponent: function() {
		Ext.apply(this, {
			allowBlank: false,
			selectOnFocus: true,
			allowDecimals: true,
			hideTrigger: true,
			keyNavEnabled: true,
			mouseWheelEnabled: false
		});
		this.callParent(arguments);
		if (!Ext.isEmpty(this.cambioFrom) && !Ext.isEmpty(this.cambioTo) && this.cambioRate > 0) {
			this.exchange(this.cambioFrom, this.cambioTo, this.cambioRate);
		}
	},
	
	exchange: function(cambioFrom, cambioTo, cambioRate) {
		var me = this;
		if (Ext.isEmpty(cambioFrom) || Ext.isEmpty(cambioTo) || Ext.isEmpty(cambioRate) || cambioRate <= 0) {
			me.markInvalid('Parâmetro inválido.');
			return false;
		}
		me.cambioTo = App.cambio.process(cambioTo);
		me.cambioFrom = App.cambio.process(cambioFrom);
		me.cambioRate = cambioRate;
		me.setValue(null);
		me.setRawValue(me.cambioText);
		me.setReadOnly(true);
		Ext.Ajax.request({
			url: 'php/response.php',
			method: 'post',
			params: {
				m: 'cambio_store',
				to: me.cambioTo,
				from: me.cambioFrom,
				ammount: me.cambioRate
			},
			failure: Ext.Function.createSequence(App.ajaxFailure, function() {
				me.setReadOnly(false);
				me.setRawValue(null);
				me.reset();
			}),
			success: function(response) {
				var o = Ext.decode(response.responseText);
				me.setReadOnly(false);
				me.setRawValue(null);
				me.reset();
				if (o.success) {
					me.setValue(o.cambio);
					me.inputEl.set({'data-qtip':  + me.cambioFrom + ' (' + me.cambioRate + ') -> ' + me.cambioTo + ' (' + o.cotacao + ') = ' + o.cambio});
				}
			}
		});
	}
});
/*
 * End of Custum Field
 */
/**
 * Grid Columns
 */
Ext.define('Ext.grid.column.Tooltip', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.tooltipcolumn',
	alternateClassName: 'Ext.grid.TooltipColumn',
	
	initComponent: function() {
		var me = this, 
		defaultRenderer = me.renderer, 
		renderer = function(value, metaData, record) {
			metaData.tdAttr = 'data-qtip="' + value + '"';
			return value;
		};
		if (Ext.isFunction(defaultRenderer)) {
			me.renderer = Ext.Function.createSequence(renderer, defaultRenderer);
		} else {
			me.renderer = defaultRenderer;
		}
		me.callParent(arguments);
	}
});

Ext.define('Ext.grid.column.Progress', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.progresscolumn',
	alternateClassName: 'Ext.grid.ProgressColumn',
	
	progressUI: 'default',
	
	initComponent: function() {
		var me = this;
		me.renderer = function(value, metaData, record) {
			var id = Ext.id(), ui = me.progressUI;
			if (ui == 'auto') {
				if (value >= 75) {
					ui = 'blue-progress';
				} else if (value <= 74 && value >= 50) {
					ui = 'green-progress';
				} else if (value <= 49 && value >= 25) {
					ui = 'orange-progress';
				} else {
					ui = 'red-progress';
				}
			}
			Ext.Function.defer(function () {
				Ext.widget('progressbar', {
					ui: ui,
					renderTo: id,
					value: value / 100,
					width: '100%',
					text: Ext.util.Format.percent(value),
					animate: true
				});
			}, 50);
			return Ext.String.format('<div id="{0}"></div>', id);
		};
		me.callParent(arguments);
	}
});

Ext.define('Ext.grid.column.Rating', {
	extend: 'Ext.grid.column.Column',
	alias: 'widget.ratingcolumn',
	alternateClassName: 'Ext.grid.RatingColumn',
	
	defaultRenderer: function(v) {
		var id = Ext.id();
		var html = [
			'<div class="x-form-rating-field" id="' + id + '-inputEl" aria-invalid="false" data-errorqtip="" style="-moz-user-select: text;">',
			'<div class="x-rating-container" id="' + id + '-container">',
			'<span class="x-rating-item '+(v >= 1 ? 'x-rating-selected' : '')+'"></span>',
			'<span class="x-rating-item '+(v >= 2 ? 'x-rating-selected' : '')+'"></span>',
			'<span class="x-rating-item '+(v >= 3 ? 'x-rating-selected' : '')+'"></span>',
			'<span class="x-rating-item '+(v >= 4 ? 'x-rating-selected' : '')+'"></span>',
			'<span class="x-rating-item '+(v >= 5 ? 'x-rating-selected' : '')+'"></span>',
			'</div>',
			'</div>'
		].join('');
		return html;
	}
});

Ext.define('FileManager.tree.Panel', {
	extend: 'Ext.tree.Panel',
	alias: 'widget.filemanagerpanel',
	
	path: null,
	setPath: function(str) {
		if (this.path != str && !Ext.isEmpty(str)) {
			this.path = str;
			this.store.getProxy().setExtraParam('path', str);
			this.store.load();
		}
	},
	
	title: 'Arquivos',
	hideFolder: null,
	onFileUpload: Ext.emptyFn,
	
	initComponent: function() {
		this.store = Ext.create('Ext.data.TreeStore', {
			fields: [
				{name:'id', type:'string', defaultValue:''},
				{name:'file', type:'string', defaultValue:''},
				{name:'size', type:'float', defaultValue:0},
				{name:'date', type:'date', dateFormat:'Y-m-d H:i:s', defaultValue: new Date()},
				{name:'url', type:'string', defaultValue:''}
			],
			root: {
				id: 0,
				file: 'Raíz',
				expanded: true
			},
			listeners: {
				beforeload: function() {
					return !Ext.isEmpty(this.getProxy().extraParams.path);
				}
			},
			proxy: {
				type: 'ajax',
				url: 'php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_filemanager',
					path: this.path,
					hide: this.hideFolder
				},
				reader: {
					type: 'json',
					successProperty: 'success',
					messageProperty: 'msg'
				},
				listeners: {
					exception: App.onProxyException
				}
			}
		});
		var me = this;
		Ext.apply(this, {
			useArrows: true,
			rootVisible: false,
			multiSelect: false,
			enableColumnHide: false,
			enableColumnMove: false,
			sortableColumns: false,
			enableColumnResize: false,
			columns: [{
				xtype: 'treecolumn',
				dataIndex: 'file',
				text: 'Nome',
				flex: 2,
				menuDisabled: true
			},{
				dataIndex: 'date',
				text: 'Modificado em',
				align: 'right',
				flex: 1,
				menuDisabled: true,
				renderer: function(value, metaData, record) {
					return Ext.util.Format.date(record.get('date'), 'D d/m/Y H:i');
				}
			},{
				dataIndex: 'size',
				text: 'Tamanho',
				align: 'right',
				menuDisabled: true,
				width: 80,
				renderer: function(value, metaData, record) {
					return Ext.util.Format.fileSize(record.get('size'));
				}
			}],
			viewConfig: {
				allowCopy: true,
				plugins: {
					ptype: 'treeviewdragdrop',
					allowCopy: true,
					appendOnly: true,
					containerScroll: true
				},
				listeners: {
					itemcontextmenu: {
						scope: me,
						fn: me.onItemContextMenu
					},
					beforedrop: {
						scope: me,
						fn: me.onBeforeDropNode
					}
				}
			},
			tools: [{
				type: 'expand',
				tooltip: 'Expandir árvore de itens',
				handler: function(){
					me.expandAll();
				}
			},{
				type: 'collapse',
				tooltip: 'Recolher os itens',
				handler: function(){
					me.collapseAll();
				}
			},{
				type: 'refresh',
				tooltip: 'Atualizar árvore de itens',
				handler: function(){
					me.store.load();
				}
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					text: 'Nova pasta',
					itemId: 'newfolder',
					iconCls: 'icon-folder',
					disabled: true,
					handler: function() {
						if (Ext.isEmpty(me.path)) return false;
						var selections = me.getView().getSelectionModel().getSelection(),
						record = selections.length ? selections[0] : null, root, path;
						if (record) {
							if (record.isLeaf()) {
								path = record.parentNode.data.id;
								root = false;
							} else {
								path = record.get('id');
								root = false;
							}
						} else {
							path = me.path;
							root = true;
						}
						Ext.create('Ext.ux.Alert', {
							ui: 'black-alert',
							closeText: 'CANCELAR',
							items: {
								xtype: 'form',
								layout: 'anchor',
								defaults: {
									labelAlign: 'top',
									allowBlank: false,
									selectOnFocus: true,
									anchor: '100%'
								},
								defaultType: 'textfield',
								items: {
									fieldLabel: 'Informe novo nome',
									name: 'newname',
									maxLength: 250
								}
							},
							buttons: {
								text: 'CRIAR PASTA',
								autoClose: false,
								handler: function() {
									var btn = this, 
									win = btn.up('alert'), 
									alertform = win.down('form').getForm();
									if (!alertform.isValid()) return false;
									btn.setText('Criando...');
									btn.setDisabled(true);
									alertform.submit({
										reset: false,
										clientValidation: true,
										url: 'php/response.php',
										method: 'post',
										params: {
											m: 'create_filemanager',
											relative: root,
											fullpath: path
										},
										failure: App.formFailure,
										success: function(f, a) {
											me.store.load({
												callback: function() {
													if (win) win.close();
												}
											});
										}
									});
								}
							}
						});
					}
				},'->',{
					xtype: 'uploadbutton',
					text: 'Enviar',
					iconCls: 'icon-upload',
					disabled: true,
					plugins: [{
						ptype: 'ux.upload.window',
						title: 'Gerenciador de upload - tamanho máximo permitido 5mb',
						width: 520,
						height: 350
					}],
					uploader: {
						url: 'php/response.php?m=upload_filemanager',
						uploadpath: me.path,
						autoStart: false,
						max_file_size: '5mb',
						statusQueuedText: 'Pronto para enviar',
						statusUploadingText: 'Enviando ({0}%)',
						statusFailedText: '<span style="color: red">Erro</span>',
						statusDoneText: '<span style="color: green">OK</span>',
						statusInvalidSizeText: 'Arquivo é muito grande',
						statusInvalidExtensionText: 'Tipo de arquivo inválido',
						listeners: {
							uploadcomplete: function(uploader, files) {
								if (files.length) {
									var i=0, names = new Array();
									for (; i<files.length; ++i) {
										names.push(files[i].name);
									}
									Ext.Ajax.request({
										url: 'php/response.php',
										method: 'post',
										params: {
											m: 'moveupload_filemanager',
											uploadpath: uploader.uploadpath,
											filesnames: names.join("\n")
										},
										failure: App.ajaxFailure,
										success: function(response) {
											var o = Ext.decode(response.responseText);
											if (o.success) {
												me.store.load();
												Ext.callback(me.onFileUpload, me, [uploader.uploadpath, names]);
											} else {
												App.warning(o);
											}
										}
									});
								}
							}
						}
					}
				}]
			}],
			listeners: {
				afterrender: function() {
					var btn = me.down('uploadbutton');
					window.setTimeout(function(){btn.setDisabled(true);}, 1000);
				},
				selectionchange: function(selModel, selections) {
					var record = selections.length ? selections[0] : null,
					newfolder = me.down('#newfolder'),
					uploadbtn = me.down('uploadbutton');
					if (record) {
						if (record.get('file') == 'Sistema' || record.parentNode.data.file == 'Sistema') {
							newfolder.setDisabled(true);
							uploadbtn.setDisabled(true);
						} else {
							newfolder.setDisabled(false);
							uploadbtn.setDisabled(record.isLeaf());
							uploadbtn.uploader.setUploadPath(record.get('id'));
						}
					} else {
						newfolder.setDisabled(true);
						uploadbtn.setDisabled(true);
					}
				}
			}
		});
		this.callParent(arguments);
	},
	
	onItemContextMenu: function(view, record, item, index, e) {
		e.preventDefault();
		if (!record.isRoot() && this.path.search(new RegExp(record.get('file'), "gi")) < 0) {
			var me = this, disabled = record.get('file') == 'Sistema' || record.parentNode.data.file == 'Sistema', 
			menu = Ext.create('Ext.menu.Menu', {
				autoDestroy: true,
				items: [{
					text: 'Download',
					iconCls: 'icon-menu-clouddown',
					disabled: !record.isLeaf(),
					handler: function() {
						var popup = window.open(record.get('url'));
						if (!popup) {
							Ext.create('Ext.ux.Alert', {
								ui: 'black-alert',
								msg: 'O sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para facilitar e evitar futura mensagem, por favor inclua nosso site na lista dos permitidos.<br/>O que você deseja fazer agora?',
								closeText: 'CANCELAR',
								buttons: {
									text: 'ABRIR ARQUIVO',
									url: record.get('url'),
									hrefTarget: '_blank'
								}
							});
						}
					}
				},'-',{
					text: 'Renomear',
					iconCls: 'icon-menu-pencil',
					disabled: disabled,
					handler: function() {
						Ext.create('Ext.ux.Alert', {
							ui: 'black-alert',
							closeText: 'CANCELAR',
							items: {
								xtype: 'form',
								layout: 'anchor',
								defaults: {
									labelAlign: 'top',
									allowBlank: false,
									selectOnFocus: true,
									anchor: '100%'
								},
								defaultType: 'textfield',
								items: {
									fieldLabel: 'Informe novo nome',
									name: 'newname',
									value: record.get('file'),
									maxLength: 250
								}
							},
							buttons: {
								text: 'RENOMEAR',
								autoClose: false,
								handler: function() {
									var btn = this, 
									win = btn.up('alert'), 
									alertform = win.down('form').getForm();
									if (!alertform.isValid()) return false;
									btn.setText('Renomeando...');
									btn.setDisabled(true);
									alertform.submit({
										reset: false,
										clientValidation: true,
										url: 'php/response.php',
										method: 'post',
										params: {
											m: 'rename_filemanager',
											file: record.get('file'),
											filename: record.get('id')
										},
										failure: App.formFailure,
										success: function(f, a) {
											var oldValue = record.get('file'), 
											newValue = alertform.findField('newname').getValue();
											record.set('file', newValue);
											record.commit();
											win.close();
										}
									});
								}
							}
						});
					}
				},{
					text: 'Excluir',
					iconCls: 'icon-menu-remove',
					disabled: disabled,
					handler: function() {
						Ext.create('Ext.ux.Alert', {
							ui: 'red-alert',
							msg: 'ATENÇÃO! Essa operação é irreversível. Deseja mesmo excluir pasta/arquivo (' + record.get('file') + ') selecionado?',
							closeText: 'CANCELAR',
							buttons: {
								text: 'EXCLUIR',
								autoClose: false,
								handler: function() {
									var btn = this, win = btn.up('alert');
									btn.setText('Excluindo...');
									btn.setDisabled(true);
									Ext.Ajax.request({
										url: 'php/response.php',
										method: 'post',
										params: {
											m: 'delete_filemanager',
											fullpath: record.get('id')
										},
										failure: App.ajaxFailure,
										success: function(response) {
											var o = Ext.decode(response.responseText);
											if (o.success) {
												record.remove();
											} else {
												App.warning(o);
											}
											win.close();
										}
									});
								}
							}
						});
					}
				}]
			});
			menu.on('close', function(){Ext.destroy(menu);});
			menu.on('hide', function(){Ext.destroy(menu);});
			menu.showAt(e.getXY());
		}
	},
	
	onBeforeDropNode: function(node, data, overModel, dropPosition, dropHandler, eOpts) {
		dropHandler.wait = true;
		var me = this, 
		dragNode = data.records[0];
		dropNode = data.view.getRecord(node);
		if (dragNode.get('file') == 'Sistema' || dragNode.parentNode.data.file == 'Sistema' || dropNode.get('file') == 'Sistema' || dropNode.parentNode.data.file == 'Sistema') {
			dropHandler.cancelDrop();
			return false;
		}
		Ext.Ajax.request({
			url: 'php/response.php',
			method: 'post',
			params: {
				m: 'copymove_filemanager',
				drag_id: dragNode.get('id'),
				drop_id: dropNode.get('id'),
				drag_file: dragNode.get('file'),
				operation: data.copy ? 'copy' : 'move'
			},
			failure: App.ajaxFailure,
			success: function(response) {
				var o = Ext.decode(response.responseText);
				if (o.success) {
					dropHandler.processDrop();
				} else {
					dropHandler.cancelDrop();
					App.warning(o);
				}
			}
		});
	}
});