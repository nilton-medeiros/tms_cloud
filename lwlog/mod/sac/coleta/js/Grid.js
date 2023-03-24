Ext.define('Coleta.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.coletagrid',
	
	initComponent: function() {
		var me = this, statusRenderer = function(value, metaData, record) {
			switch (record.get('cte_situacao')) {
				case 'AUTORIZADO': metaData.tdCls = 'bluecol'; break;
				case 'VALIDADO': metaData.tdCls = 'yellowcol'; break;
				case 'TRANSMITIDO': metaData.tdCls = 'greencol'; break;
				case 'REJEITADO':
				case 'DENEGADO': 
				case 'CANCELADO': metaData.tdCls = 'redcol'; break;
				case 'INUTILIZADO':
				case 'SUBSTITUÍDO':
				case 'ANULADO': metaData.tdCls = 'orangecol'; break;
			}
			metaData.tdAttr = 'data-qtip="Número: ' + record.get('cte_numero') + ' / Minuta: ' + record.get('cte_minuta') + '<br/>' + record.get('cte_situacao') + ' "';
			return value;
		};
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 30,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sac/coleta/php/response.php',
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
				property: 'cte_id',
				direction: 'DESC'
			}]
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableLocking: true,
			enableColumnHide: true,
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
				dataIndex: 'cte_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'cte_serie',
				text: 'Série',
				tooltip: 'Série do CT-e',
				align: 'right',
				width: 70,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'cte_numero',
				text: 'Número',
				tooltip: 'Número do CT-e',
				align: 'right',
				width: 90,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'cte_minuta',
				text: 'Minuta',
				tooltip: 'Número da minuta ou ordem de coleta',
				align: 'right',
				width: 70,
				filterable: true,
				renderer: function(value, metaData, record) {
					return Ext.isEmpty(record.get('coleta_pdf')) ? value : '<a href="' + record.get('coleta_pdf') + '" target="_blank">' + value + '</a>';
				}
			},{
				xtype: 'datecolumn',
				dataIndex: 'cte_data_hora_emissao',
				text: 'Emitido em',
				format: 'D d/m/Y H:i',
				tooltip: 'Data/Hora da emissão do CT-e',
				align: 'right',
				width: 140,
				filterable: true
			},{
				dataIndex: 'rem_razao_social',
				text: 'Rementente',
				width: 300,
				filterable: true
			},{
				dataIndex: 'des_razao_social',
				text: 'Destinatário',
				width: 300,
				filterable: true
			},{
				dataIndex: 'cid_origem_nome_completo',
				text: 'Origem',
				width: 300,
				filterable: true
			},{
				dataIndex: 'cid_passagem_nome_completo',
				text: 'Passagem',
				width: 300,
				hidden: true,
				filterable: true
			},{
				dataIndex: 'cid_destino_nome_completo',
				text: 'Destino',
				width: 300,
				filterable: true
			},{
				dataIndex: 'lista_documentos',
				text: 'Documentos',
				width: 180,
				filterable: true,
				renderer: function(value, metaData, record) {
					metaData.tdAttr = 'data-qtip="' + value + '"';
					return value;
				}
			},{
				text: 'Última modificações',
				columns: [{
					dataIndex: 'cte_cadastrado_por_nome',
					text: 'Cadastrado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cte_cadastrado_em',
					text: 'Cadastrado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'cte_alterado_por_nome',
					text: 'Alterado por',
					width: 200,
					filterable: true
				},{
					xtype: 'datecolumn',
					dataIndex: 'cte_alterado_em',
					text: 'Alterado em',
					format: 'D d/m/Y H:i',
					align: 'right',
					width: 140,
					filterable: true
				},{
					dataIndex: 'cte_versao',
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
					tooltip: 'Emitir um novo conhecimento (CT-e)',
					handler: function() {
						var tp = me.up('coletaview');
						tp.setActiveTab(1);
						var form = tp.getActiveTab();
						form.newRecord();
						form.setGrid(me);
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
					tooltip: 'Excluir conhecimento selecionado',
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
							if (record.get('cte_id') > 0) {
								id.push(record.get('cte_id'));
							}
						});
						me.store.remove(selections);
						
						if (!id.length) {
							return false;
						}
						Ext.Ajax.request({
							url: 'mod/sac/coleta/php/response.php',
							method: 'post',
							params: {
								m: 'delete_coleta',
								cte_id: id.join(',')
							},
							failure: App.ajaxFailure,
							success: App.ajaxDeleteSuccess
						});
					}
				},'-',{
					text: 'Formulário',
					tooltip: 'Gerar formulário em PDF da coleta',
					iconCls: 'icon-file-pdf',
					handler: function(btn) {
						var originalText = btn.getText();
						btn.setText('Gerando PDF...');
						btn.setDisabled(true);
						Ext.Ajax.request({
							url: 'mod/sac/coleta/php/response.php',
							method: 'get',
							params: {
								m: 'gerar_pdf_form'
							},
							failure: Ext.Function.createSequence(App.ajaxFailure, function(){
								btn.setDisabled(false);
								btn.setText(originalText);
							}),
							success: function(response) {
								btn.setDisabled(false);
								btn.setText(originalText);
								var o = Ext.decode(response.responseText);
								if (o.success) {
									var popup = window.open(o.pdf);
									if (!popup) {
										Ext.create('Ext.ux.Alert', {
											ui: 'black-alert',
											msg: 'Sua formulário para coleta foi gerada com sucesso no formato PDF. Porém o sistema detectou que seu navegador está bloqueando janelas do tipo popup. Para evitar futuras mensagens, por gentileza adicione esse site na lista de excessões de seu navegador.',
											buttons: [{
												ui: 'red-button',
												text: 'ABRIR PDF',
												href: o.pdf
											}]
										});
									}
								} else {
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
					fields: [
						'cte_numero',
						'cte_serie',
						'rem_razao_social',
						'rem_nome_fantasia',
						'des_razao_social',
						'des_nome_fantasia',
						'tom_razao_social',
						'tom_nome_fantasia',
						'cid_origem_nome_completo',
						'cid_destino_nome_completo',
						'cid_passagem_nome_completo',
						'produto_predominante',
						'lista_documentos'
					]
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: me.store,
				displayInfo: true
			}],
			listeners: {
				itemdblclick: function(grid, record) {
					var tp = me.up('coletaview');
					tp.setActiveTab(1);
					var form = tp.getActiveTab();
					form.loadRecord(record);
					form.setGrid(grid);
				},
				selectionchange: function(selModel, selections) {
					me.down('#delete').setDisabled(selections.length === 0); 
				}
			}
		});
		
		me.callParent(arguments);
	}
});