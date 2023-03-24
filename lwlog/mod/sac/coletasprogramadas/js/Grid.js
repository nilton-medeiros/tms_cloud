Ext.define('ColetasProgramadas.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.coletasprogramadasgrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'ColetasProgramadas.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 30,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sac/coletasprogramadas/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_coleta'
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
				property: 'id',
				direction: 'DESC'
			}]
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableLocking: false,
			enableColumnHide: false,
			emptyText: 'Nenhum item encontrado',
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
				dataIndex: 'dia_da_semana',
				text: 'Dia',
				tooltip: 'Dia da semana',
				align: 'center',
				width: 70,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['DOM','SEG','TER','QUA','QUI','SEX','SAB']
				}
			},{
				dataIndex: 'coletar_das',
				text: 'Primeiro Horário',
				tooltip: 'Primeiro horário disponível para coleta',
				align: 'center',
				width: 100,
				sortable: false,
				filterable: false
			},{
				dataIndex: 'coletar_ate',
				text: 'Último Horário',
				tooltip: 'Último horário disponível para coleta',
				align: 'center',
				width: 100,
				sortable: false,
				filterable: false
			},{
				dataIndex: 'descricao',
				text: 'Observações para coleta',
				tooltip: 'Informações sobre a carga a ser coletada',
				width: 250,
				filterable: true
			},{
				dataIndex: 'clie_razao_social',
				text: 'Cliente',
				tooltip: 'Cliente onde a carga será coletada',
				width: 420,
				filterable: true,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + record.get('clie_nome_fantasia') + '"';
					return value;
				}
			},{
				dataIndex: 'clie_cnpj_cpf',
				text: 'CNPJ/CPF',
				tooltip: 'CNPJ ou CPF do cliente',
				width: 100,
				filterable: true
			},{
				dataIndex: 'clie_endereco',
				text: 'Endereço',
				tooltip: 'Local onde será feita a coleta',
				width: 420,
				filterable: true
			},{
				dataIndex: 'cliente_fones',
				text: 'Telefones',
				tooltip: 'Telefones para contato do cliente',
				width: 150,
				filterable: true
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cte_cadastrado_por_nome',
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
					text: 'Novo',
					tooltip: 'Incluir nova coleta programadas',
					handler: function() {
						var form = me.up('coletasprogramadaspanel').down('coletasprogramadasform');
						form.expand();
						form.setGrid(me);
						setTimeout(function(){
							form.newRecord();
						}, 1000);
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
					tooltip: 'Excluir coleta programada selecionada',
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
							url: 'mod/sac/coletasprogramadas/php/response.php',
							method: 'post',
							params: {
								m: 'delete_coleta',
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
					fields: [
						'clie_razao_social',
						'clie_nome_fantasia',
						'clie_cnpj_cpf',
						'clie_endereco',
						'descricao',
						'cadastrado_por_nome',
						'alterado_por_nome'
					]
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
					if (selections.length === 1) {
						var form = me.up('coletasprogramadaspanel').down('coletasprogramadasform');
						form.setGrid(me);
						form.loadRecord(selections[0]);
					}
				}
			}
		});
		
		me.callParent(arguments);
	}
});