Ext.define('Usuario.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.usuariogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Usuario.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sistema/usuarios/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_usuarios',
					ativo: 1
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
				property: 'user_nome',
				direction: 'ASC'
			}]	
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 2,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
				},
				edit: function(editor, e) {
					if (!Ext.isEmpty(e.record.get('user_nome')) && !Ext.isEmpty(e.record.get('user_login')) && !Ext.isEmpty(e.record.get('user_senha')) && !Ext.isEmpty(e.record.get('user_email')) && e.record.get("perm_id") > 0) {
						Ext.Ajax.request({
							url: 'mod/sistema/usuarios/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_usuarios'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('user_id', o.user_id);
									e.record.commit();
									var foundRecord = Usuario.combo.Store.findRecord('user_id', o.user_id);
									if (foundRecord) {
										foundRecord.set(e.record.data);
									} else {
										Usuario.combo.Store.add(e.record);
									}
								} else {
									e.record.reject();
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
			features: [{
				ftype: 'filters',
	        	encode: true,
	        	local: false
	        }],
			columns: [{
				dataIndex: 'user_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'user_nome',
				text: 'Usuário',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 60
				}
			},{
				dataIndex: 'user_email', 
				text: 'E-mail',
				width: 250,
				filterable: true,
				editor: {
					xtype: 'textfield',
					vtype: 'email',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 80
				}
			},{
				dataIndex: 'user_login', 
				text: 'Login',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 45
				}
			},{
				dataIndex: 'user_senha',
				text: 'Senha',
				width: 100,
				filterable: false,
				renderer: function(value, metaData, record) {
					return App.usuario.user_id == record.get('user_id') ? value : '****';
				},
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					inputType: 'password',
					maxLength: 10
				}
			},{
				dataIndex: 'user_celular',
				text: 'Celular',
				align: 'right',
				width: 120,
				filterable: true,
				editor: {
					xtype: 'textfield',
					vtype: 'phone',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 15
				}
			},{
				dataIndex: 'perm_grupo',
				text: 'Grupo',
				tooltip: 'Grupo de permissões',
				width: 150,
				filterable: true,
				editor: {
					xtype: 'grupocombo',
					valueField: 'perm_grupo',
					displayField: 'perm_grupo',
					editable: false,
					listeners: {
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set('perm_id', record.get('perm_id'));
						}
					}
				}
			},{
				text: 'Empresa de acesso ao sistema',
				tooltip: 'Empresa de acesso ao sistema',
				width: 300,
				filterable: true,
				renderer: function(value, metaData, record) {
					return record.get('user_empresas_nome');
				},
				editor: {
					xtype: 'empresacombo',
					valueField: 'emp_login',
					displayField: 'emp_login',
					delimiter: ', ',
					multiSelect: true,
					showTrigger: true,
					listeners: {
						select: function(field, records) {
							var selected = [], label = [];
							Ext.each(records, function(record) {
								label.push(record.get('emp_login'));
								selected.push(record.get('emp_id'));
							});
							me.activeRecord.set('user_empresas_id', selected.join(','));
							me.activeRecord.set('user_empresas_nome', label.join(', '));
						}
					}
				}
			},{
				xtype: 'booleancolumn',
				dataIndex:'user_ativo',
				text: 'Ativo', 
				align: 'center',
				trueText:'Sim', 
				falseText: 'Não',
				width: 75,
				editor: {
					xtype: 'checkbox',
					inputValue: 1
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'user_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'user_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'user_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'user_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'user_versao',
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
					text: 'Novo usuário',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Usuario.data.Model'));
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
							
						var id = [], records = [];
						Ext.each(selections, function(record) {
							if (record.get('user_id') != App.usuario.user_id) {
								if (record.get('user_id') > 0) {
									id.push(record.get('user_id'));
								}
								records.push(record);
							}
						});
						me.store.remove(records);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/sistema/usuarios/php/response.php',
							method: 'post',
							params: {
								m: 'delete_usuarios',
								user_id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'-',{
					text: 'Exibindo (ativos) ',
					iconCls: 'icon-glasses-2',
					itemId: 'view-filter',
					menu: {
						items: [{
							text: 'Ativos',
							group: 'status',
							checked: true,
							scope: me,
							checkHandler: me.onStatusChange
						},{
							text: 'Inativos',
							group: 'status',
							checked: false,
							scope: me,
							checkHandler: me.onStatusChange
						}]
					}
				},'-',{
					text: 'Enviar e-mail com os dados de acesso',
					iconCls: 'icon-mail',
					handler: function(btn) {
						var selections = me.getView().getSelectionModel().getSelection();
						if (!selections.length) {
							App.noRecordsSelected();
							return false;
						}
						
						var id = [];
						Ext.each(selections, function(record) {
							if (record.get('user_id') > 0) {
								id.push(record.get('user_id'));
							}
							
						});
						if (!id.length) {
							return false;
						}
						
						var originalText = btn.getText();
						btn.setDisabled(true);
						btn.setText('Enviando...');
						
						Ext.Ajax.request({
							url: 'mod/sistema/usuarios/php/response.php',
							method: 'post',
							params: {
								m: 'enviar_email',
								user_id: id.join(',')
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function() {
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								btn.setDisabled(false);
								btn.setText(originalText);
								var o = Ext.decode(response.responseText);
								if (!o.success) {
									App.warning(o);
								}
							}
						});
					}
				},'->',{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: ['user_nome', 'user_email', 'user_login', 'perm_grupo']
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: me.store,
				displayInfo: true
			}],
			listeners: {
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0);
				}
			}
		});
		
		me.callParent(arguments);
	},
	
	onStatusChange: function(item, checked) {
		if (checked) {
			var menu = this.down('#view-filter');
			if (item.text == 'Ativos') {
				menu.setText('Exibindo (ativos)');
			} else {
				menu.setText('Exibindo (inativos)');
			}
			this.store.getProxy().setExtraParam('ativo', (item.text == 'Ativos' ? 1 : 0));
			this.store.clearFilter(true);
			this.store.load();
		}
	}
});