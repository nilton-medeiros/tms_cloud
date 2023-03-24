Ext.define('SeguroRCTRC.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.segurorctrc',
	
	initComponent: function() {
		var me = this, 
		UFOptions = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'SeguroRCTRC.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/rctrc/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_rctrc'
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
				property: 'uf_origem',
				direction: 'ASC'
			},{
				property: 'uf_destino',
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
					if (!Ext.isEmpty(e.record.get('uf_origem')) && !Ext.isEmpty(e.record.get('uf_destino')) && e.record.get('percentual') > 0) {
						Ext.Ajax.request({
							url: 'mod/conhecimentos/rctrc/php/response.php',
							method: 'post',
							params: Ext.applyIf({
								m: 'save_rctrc'
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
				dataIndex: 'uf_origem',
				text: 'Origem (UF)',
				tooltip: 'UF de origem da viagem',
				align: 'center',
				width: 90,
				filter: {
					type: 'list',
					options: UFOptions,
					phpMode: true
				},
				editor: {
					xtype: 'localcombo',
					allowBlank: false,
					options: UFOptions
				}
			},{
				dataIndex: 'uf_destino',
				text: 'Destino (UF)',
				tooltip: 'UF de destino da viagem',
				align: 'center',
				width: 90,
				filter: {
					type: 'list',
					options: UFOptions,
					phpMode: true
				},
				editor: {
					xtype: 'localcombo',
					allowBlank: false,
					options: UFOptions
				}
			},{
				dataIndex: 'percentual',
				text: 'Percentual',
				tooltip: 'Taxa para o seguro obrigatório de Responsabilidade Civil do Transportador Rodoviário Carga (RCTR-C)',
				width: 90,
				align: 'right',
				filterable: true,
				renderer: Ext.util.Format.percent,
				editor: {
					xtype: 'percentfield',
					minValue: 0,
					maxValue: 100
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'versao',
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
					text: 'Nova taxa',
					handler: function() {
						me.editing.cancelEdit();
						me.store.insert(0, Ext.create('SeguroRCTRC.data.Model'));
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
							url: 'mod/conhecimentos/rctrc/php/response.php',
							method: 'post',
							params: {
								m: 'delete_rctrc',
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
					fields: ['uf_origem','uf_destino']
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