Ext.define('Cliente.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.clientegrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Cliente.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/cadastros/clientes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_clientes',
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
				property: 'clie_razao_social',
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
				dataIndex: 'clie_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'clie_categoria_nome',
				text: 'Categoria',
				width: 90,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['0 - Remetente', '1 - Expedidor', '2 - Recebedor', '3 - Destinatário', '4 - Todos', '5 - Representante']
				}
			},{
				xtype: 'booleancolumn',
				dataIndex:'clie_ativo',
				text: 'Status', 
				align: 'center',
				trueText:'Ativo', 
				falseText: 'Inativo',
				width: 75,
				filterable: false
			},{
				dataIndex: 'clie_razao_social',
				text: 'Razão Social/Nome',
				width: 200,
				filterable: true
			},{
				dataIndex: 'clie_nome_fantasia', 
				text: 'Nome Fantasia/Apelido',
				width: 200,
				filterable: true
			},{
				dataIndex: 'clie_tom_tabela',
				text: 'Tabela',
				tooltip: 'Tabela usada para cálculo',
				width: 90,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['NACIONAL', 'ESPECIAL', 'MINIMA', 'EXPRESSO']
				}
			},{
				dataIndex: 'clie_tipo_estabelecimento', 
				text: 'Estabelecimento',
				tooltip: 'Tipo de Estabelecimento',
				width: 150,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['TRANSPORTADORA', 'INDÚSTRIA', 'COMERCIAL', 'COMUNICAÇÕES', 'ENERGIA ELÉTRICA', 'PRODUTOR RURAL', 'PESSOA FÍSICA']
				}
			},{
				dataIndex: 'clie_cnpj',
				text: 'CNPJ',
				width: 100,
				filterable: true
			},{
				dataIndex: 'clie_cpf',
				text: 'CPF',
				width: 100,
				filterable: true
			},{
				dataIndex: 'cid_nome',
				text: 'Cidade',
				width: 200,
				filterable: true
			},{
				dataIndex: 'clie_fone1',
				text: 'Telefone #1',
				width: 100,
				filterable: true
			},{
				dataIndex: 'clie_fone2',
				text: 'Telefone #2',
				width: 100,
				filterable: true
			},{
				dataIndex: 'clie_login',
				text: 'Login',
				tooltip: 'Login de acesso ao site',
				width: 100,
				filterable: true
			},{
				dataIndex: 'clie_senha',
				text: 'Senha',
				tooltip: 'Senha de acesso ao site',
				width: 100,
				filterable: true
			},{
				text: 'Última modificações',
				menuDisabled: true,
				columns: [{
					dataIndex: 'clie_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					menuDisabled: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'clie_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					menuDisabled: true
				},{
					dataIndex: 'clie_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					menuDisabled: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'clie_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					menuDisabled: true
				},{
					dataIndex: 'clie_versao',
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
					text: 'Novo cliente',
					handler: function() {
						var tp = me.up('clienteview');
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
							if (record.get('clie_id') > 0) {
								id.push(record.get('clie_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/cadastros/clientes/php/response.php',
							method: 'post',
							params: {
								m: 'delete_clientes',
								clie_id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'->',{
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
				},{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: ['clie_razao_social','clie_nome_fantasia','clie_cnpj','clie_cpf','clie_rg','clie_inscr_estadual','clie_inscr_municipal']
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: this.store,
				displayInfo: true,
				items: ['-', {
					text: 'Exportar XLS',
					iconCls: 'icon-file-excel',
					tooltip: 'Exportar registros para o formato xls',
					handler: function() {
						Ext.create('Export.Window', {
							title: 'Clientes',
							url: 'mod/cadastros/clientes/php/response.php',
							action: 'export_xls',
							defaultData: [{
								pos: 1,
								id: 'clie_id',
								field: 'ID',
								sort_id: 'ASC',
								sort_label: 'Crescente'
							},{
								pos: 2,
								id: 'clie_categoria_nome',
								field: 'Categoria'
							},{
								pos: 3,
								id: 'clie_ativo',
								field: 'Status'
							},{
								pos: 4,
								id: 'clie_razao_social',
								field: 'Razão Social/Nome'
							},{
								pos: 5,
								id: 'clie_nome_fantasia',
								field: 'Nome Fantasia/Apelido'
							},{
								pos: 6,
								id: 'clie_tom_tabela',
								field: 'Tabela'
							},{
								pos: 7,
								id: 'clie_tipo_estabelecimento',
								field: 'Estabelecimento'
							},{
								pos: 8,
								id: 'clie_cnpj',
								field: 'CNPJ'
							},{
								pos: 9,
								id: 'clie_cpf',
								field: 'CPF'
							},{
								pos: 10,
								id: 'cid_nome',
								field: 'Cidade'
							},{
								pos: 11,
								id: 'clie_fone1',
								field: 'Telefone #1'
							},{
								pos: 12,
								id: 'clie_fone2',
								field: 'Telefone #2'
							}],
							fields: [{
								id: 'clie_id',
								field: 'ID'
							},{
								id: 'clie_categoria_nome',
								field: 'Categoria'
							},{
								id: 'clie_ativo',
								field: 'Status'
							},{
								id: 'clie_razao_social',
								field: 'Razão Social/Nome'
							},{
								id: 'clie_nome_fantasia',
								field: 'Nome Fantasia/Apelido'
							},{
								id: 'clie_tom_tabela',
								field: 'Tabela'
							},{
								id: 'clie_tipo_estabelecimento',
								field: 'Estabelecimento'
							},{
								id: 'clie_cnpj',
								field: 'CNPJ'
							},{
								id: 'clie_cpf',
								field: 'CPF'
							},{
								id: 'cid_nome',
								field: 'Cidade'
							},{
								id: 'clie_fone1',
								field: 'Telefone #1'
							},{
								id: 'clie_fone2',
								field: 'Telefone #2'
							},{
								id: 'clie_login',
								field: 'Login'
							},{
								id: 'clie_senha',
								field: 'Senha'
							}]
						});
					}
				}]
			}],
			listeners: {
				itemdblclick: function(grid, record) {
					var tp = me.up('clienteview');
					tp.setActiveTab(1);
					var form = tp.getActiveTab();
					form.loadRecord(record);
				},
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0);
					var record = selections.length === 1 ? selections[0] : null,
					tab = me.up('#tab-0'),
					panel = tab.down('#east-panel'),
					grid1 = panel.down('cliaeroportogrid'),
					grid2 = panel.down('cliprodutogrid'),
					grid3 = panel.down('contatogrid'),
					form1 = panel.down('clientefaturaform');
					if (record) {
						grid1.setCidUF(record.get('cid_uf'));
						grid1.setClieID(record.get('clie_id'));
						grid2.setClieID(record.get('clie_id'));
						grid3.setClieID(record.get('clie_id'));
						form1.setDisabled(false);
						form1.loadRecord(record);
					} else {
						grid1.setCidUF(null);
						grid1.setClieID(0);
						grid2.setClieID(0);
						grid3.setClieID(0);
						form1.getForm().reset();
						form1.setDisabled(true);
					}
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