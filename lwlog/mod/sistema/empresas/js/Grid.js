Ext.define('Empresa.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.empresagrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Empresa.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sistema/empresas/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_empresas',
					ativa: 1
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
				property: 'emp_razao_social',
				direction: 'ASC'
			}]
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableColumnHide: false,
			emptyText: 'Nenhum item encontrado',
			features: [{
				ftype: 'filters',
	        	encode: true,
	        	local: false
	        }],
			viewConfig: {
				stripeRows: true,
				enableTextSelection: false
			},
			columns: [{
				dataIndex: 'emp_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'emp_razao_social',
				text: 'Razão Social',
				width: 200,
				filterable: true
			},{
				dataIndex: 'emp_nome_fantasia', 
				text: 'Nome Fantasia',
				width: 200,
				filterable: true
			},{
				dataIndex: 'emp_sigla_cia', 
				text: 'Sigla',
				align: 'center',
				width: 60,
				filterable: true
			},{
				dataIndex: 'emp_cnpj',
				text: 'CNPJ',
				width: 120,
				filterable: true
			},{
				dataIndex: 'emp_inscricao_estadual',
				text: 'IE',
				tooltip: 'Inscrição Estadual',
				width: 120,
				filterable: true
			},{
				dataIndex: 'cid_nome',
				text: 'Cidade UF',
				width: 200,
				filterable: true
			},{
				dataIndex: 'emp_modal',
				text: 'Modal',
				tootlip: 'Tipo de Modal',
				width: 100,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['Aereo', 'Rodoviario', 'Ambos']
				}
			},{
				xtype: 'booleancolumn',
				dataIndex:'emp_ativa',
				text: 'Status', 
				align: 'center',
				trueText:'Ativa', 
				falseText: 'Inativa',
				width: 75,
				filterable: false
			},{
				dataIndex: 'emp_faturamento',
				text: 'Faturamento',
				tooltip: 'Frequência do Faturamento',
				width: 100,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['DECENDIAL', 'SEMANAL', 'QUINZENAL', 'MENSAL']
				}
			},{
				dataIndex: 'emp_dias_vecto',
				text: 'Dias p/ Vecto',
				tooltip: 'Dias para Vencimento',
				align: 'right',
				width: 100,
				filterable: true
			},{
				dataIndex: 'emp_taxa_min_nac',
				text: 'Taxa Min. Nac.',
				tooltip: 'Taxa Mínima Nacional',
				align: 'right',
				width: 100,
				renderer: Ext.util.Format.brMoney
			},{
				text: 'Última modificações',
				menuDisabled: true,
				columns: [{
					dataIndex: 'emp_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					menuDisabled: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'emp_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					menuDisabled: true
				},{
					dataIndex: 'emp_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					menuDisabled: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'emp_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					menuDisabled: true
				},{
					dataIndex: 'emp_versao',
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
					text: 'Nova empresa',
					handler: function() {
						var tp = me.up('empresaview');
						tp.setActiveTab(1);
						tp.getActiveTab().newRecord();
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
							if (record.get('emp_id') > 0) {
								id.push(record.get('emp_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/sistema/empresas/php/response.php',
							method: 'post',
							params: {
								m: 'delete_empresas',
								emp_id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'-',{
					text: 'Exibindo (ativas) ',
					iconCls: 'icon-glasses-2',
					itemId: 'view-filter',
					menu: {
						items: [{
							text: 'Ativas',
							group: 'status',
							checked: true,
							scope: me,
							checkHandler: me.onStatusChange
						},{
							text: 'Inativas',
							group: 'status',
							checked: false,
							scope: me,
							checkHandler: me.onStatusChange
						}]
					}
				},'->',{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: ['emp_razao_social','emp_nome_fantasia','emp_sigla_cia','emp_cnpj','emp_inscricao_estadual','emp_endereco','emp_RNTRC']
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: this.store,
				displayInfo: true
			}],
			listeners: {
				itemdblclick: function(grid, record) {
					var tp = me.up('empresaview');
					tp.setActiveTab(1);
					var form = tp.getActiveTab();
					form.loadRecord(record);
				},
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
			if (item.text == 'Ativas') {
				menu.setText('Exibindo (ativas)');
			} else {
				menu.setText('Exibindo (inativas)');
			}
			this.store.getProxy().setExtraParam('ativa', (item.text == 'Ativas' ? 1 : 0));
			this.store.clearFilter(true);
			this.store.load();
		}
	}
});