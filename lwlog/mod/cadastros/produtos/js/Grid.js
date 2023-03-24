Ext.define('Produto.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.produtogrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Produto.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/produtos/php/response.php',
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
				property: 'prod_codigo',
				direction: 'ASC'
			},{
				property: 'prod_produto',
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
					if (!Ext.isEmpty(e.record.get('iic_codigo')) && !Ext.isEmpty(e.record.get('iic_descricao'))) {
						Ext.Ajax.request({
							url: 'mod/cadastros/produtos/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_produtos'
							}, e.record.data),
							failure: App.ajaxFailure,
							success: function(response) {
								var o = Ext.decode(response.responseText);
								if (o.success) {
									e.record.set('prod_id', o.prod_id);
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
				dataIndex: 'prod_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'prod_tarifa',
				text: 'Tipo',
				tooltip: 'Tipo de Tarifa',
				width: 90,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['GERAL', 'ESPECIFICA']
				},
				editor: {
					xtype: 'localcombo',
					options: ['GERAL', 'ESPECIFICA']
				}
			},{
				dataIndex: 'gt_id_codigo',
				text: 'Tarifa',
				tooltip: 'Grupos de Tarifas',
				align: 'right',
				width: 90,
				filterable: true,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + record.get('gt_descricao') + '"';
					return value;
				},
				editor: {
					xtype: 'grupotarifacombo',
					valueField: 'gt_id_codigo',
					displayField: 'gt_id_codigo',
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('gt_descricao', record.get('gt_descricao'));
						}
					}
				}
			},{
				dataIndex: 'prod_codigo',
				text: 'Código',
				tooltip: 'Código NCM (Nomenclatura Comum do MERCOSUL)',
				align: 'right',
				width: 90,
				filterable: true,
				editor: {
					xtype: 'intfield',
					minValue: 0,
					maxValue: 999999999
				}
			},{
				dataIndex: 'prod_produto',
				text: 'Produto (nome)',
				tooltip: 'Nome do produto',
				width: 450,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true,
					maxLength: 60
				}
			},{
				dataIndex: 'prod_tipo_advalorem',
				text: 'Tipo de Advalorem',
				width: 200,
				editor: {
					xtype: 'localcombo',
					options: ['1 - Normal','2 - Valor dobrado','3 - 3% do valor da mercadoria']
				}
			},{
				dataIndex: 'iic_codigo',
				text: 'IATA',
				tooltip: 'IATA IMP (Interline Message Procedure) CODES - Para produtos perigosos',
				align: 'center',
				width: 80,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + record.get('iic_nome') + '"';
					return value;
				},
				editor: {
					xtype: 'iatacodigocombo',
					valueField: 'iic_codigo',
					displayField: 'iic_codigo',
					listeners: {
						select: function(f, records) {
							var record = records[0];
							me.activeRecord.set('iic_id', record.get('iic_id'));
							me.activeRecord.set('iic_nome', record.get('iic_nome'));
							me.activeRecord.set('iic_descricao', record.get('iic_descricao'));
						}
					}
				}
			},{
				dataIndex: 'prod_numero_onu', 
				text: 'Número ONU/UN',
				tooltip: 'Número ONU/UN: Ver a legislação de transporte de produtos perigosos aplicadas ao modal',
				align: 'right',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 5
				}
			},{
				dataIndex: 'prod_nome_embarque',
				text: 'Embarque (nome)',
				tooltip: 'Nome apropriado para embarque do produto',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 150
				}
			},{
				dataIndex: 'prod_classe_risco',
				text: 'Classe de Risco',
				tooltip: 'Classe ou subclasse/divisão, e risco subsidiário/risco secundário: Ver a legislação de transporte de produtos perigosos aplicadas ao modal.',
				width: 200,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 40
				}
			},{
				dataIndex: '',
				text: 'Embalagem',
				tooltip: 'Grupo de Embalagem',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 40
				}
			},{
				dataIndex: 'prod_ponto_fulgor',
				text: 'Fulgor',
				tooltip: 'Ponto de Fulgor: No caso de transporte rodoviário e ferroviário, este campo não é exigido.',
				width: 100,
				filterable: true,
				editor: {
					xtype: 'textfield',
					allowBlank: true,
					selectOnFocus: true,
					maxLength: 40
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'prod_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'prod_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'prod_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'prod_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'prod_versao',
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
					text: 'Novo produto',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('Produto.data.Model'));
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
							if (record.get('prod_id') > 0) {
								id.push(record.get('prod_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/produtos/php/response.php',
							method: 'post',
							params: {
								m: 'delete_produtos',
								prod_id: id.join(',')
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
					fields: ['prod_codigo','prod_produto','prod_nome_embarque','prod_classe_risco','prod_grupo_embalagem','prod_ponto_fulgor']
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