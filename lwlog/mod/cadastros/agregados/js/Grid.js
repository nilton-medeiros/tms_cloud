Ext.define('Agregados.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.agregadosgrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Agregados.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/agregados/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_agregado'
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
		});
		
		me.editing = Ext.create('Ext.grid.plugin.CellEditing',{
			pluginId: 'cellplugin',
			clicksToEdit: 2,
			listeners: {
				beforeedit: function(editor, e) {
					me.activeRecord = e.record;
				},
				edit: function(editor, e) {
					if (!Ext.isEmpty(e.record.get('tipo_documento')) && !Ext.isEmpty(e.record.get('documento')) && !Ext.isEmpty(e.record.get('xNome'))) {
						Ext.Ajax.request({
							url: 'mod/cadastros/agregados/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_agregado'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('id', o.id);
									e.record.commit();
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
				dataIndex: 'id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'tipo_documento',
				text: 'Tipo',
				tooltip: 'Tipo do documento CNPJ/CPF',
				align: 'left',
				width: 50,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['CNPJ','CPF']
				},
				editor: {
					xtype: 'localcombo',
					options: ['CNPJ','CPF']
				}
			},{
				dataIndex: 'documento',
				text: 'Documento',
				tooltip: 'Número do CNPJ/CPF',
				align: 'right',
				width: 150,
				filterable: true,
				editor: {
					xtype: 'intfield',
					allowBlank: false,
					minValue: 0,
					maxValue: 99999999999999
				}
			},{
				dataIndex: 'xNome',
				text: 'Nome',
				tooltip: 'Razão Social ou Nome do proprietário',
				width: 250,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 60
				}
			},{
				dataIndex: 'RNTRC',
				text: 'RNTRC',
				tootlip: 'Registro Nacional dos Transportadores Rodoviários de Carga; Registro obrigatório do proprietário, coproprietário ou arrendatário do veículo junto à ANTT para exercer a atividade de transportador rodoviário de cargas por conta de terceiros e mediante remun...',
				width: 80,
				align: 'right',
				filterable: true,
				editor: {
					xtype: 'intfield',
					allowBlank: false,
					minValue: 0,
					maxValue: 99999999
				}
			},{
				dataIndex: 'IE',
				text: 'Inscrição Estadual',
				width: 150,
				align: 'right',
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 9999999999
				}
			},{
				dataIndex: 'UF',
				text: 'UF',
				width: 50,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['AC','AL','AM','AP','BA','CE','DF','ES','EX','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
				},
				editor: {
					xtype: 'localcombo',
					allowBlank: false,
					options: ['AC','AL','AM','AP','BA','CE','DF','ES','EX','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'] 
				}
			},{
				dataIndex: 'tpProp_rotulo',
				text: 'Tipo Proprietário',
				width: 150,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['TAC - Agregado','TAC Independente','Outros']
				},
				editor: {
					xtype: 'localcombo',
					valueField: 'field',
					allowBlank: false,
					options: [{
						id: 0,
						field: 'TAC - Agregado'
					},{
						id: 1,
						field: 'TAC Independente'
					},{
						id: 2,
						field: 'Outros'
					}],
					listeners: {
						select: function(field, records) {
							var record = records[0];
							me.activeRecord.set('tpProp', record.get('id'));
						}
					}
				}
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					iconCls: 'icon-plus',
					text: 'Novo agregado',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Agregados.data.Model'));
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
						
						var id = [];
						Ext.each(selections, function(record) {
							if (record.get('id') > 0) {
								id.push(record.get('id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/agregados/php/response.php',
							method: 'post',
							params: {
								m: 'delete_agregado',
								id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'->',{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: ['xNome','documento','tpProp_rotulo','IE','RNTRC']
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
	}
});