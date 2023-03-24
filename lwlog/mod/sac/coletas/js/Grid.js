Ext.define('Coletas.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.coletasgrid',
	
	initComponent: function() {
		var me = this, statusRenderer = function(value, metaData, record) {
			switch (record.get('status')) {
				case 'COLETADA': metaData.tdCls = 'bluecol'; break;
				case 'EM ADAMENTO': metaData.tdCls = 'greencol'; break;
				case 'CANCELADA': metaData.tdCls = 'redcol'; break;
			}
			metaData.tdAttr = 'data-qtip="' + record.get('status') + '"';
			return value;
		};
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'Coletas.data.Model',
			autoLoad: true,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 30,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sac/coletas/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_coleta',
					status: 'EM ABERTO'
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
				dataIndex: 'id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				width: 70,
				filterable: true,
				renderer: function(value, metaData, record) {
					return Ext.isEmpty(record.get('coleta_pdf')) ? value : '<a href="' + record.get('coleta_pdf') + '" target="_blank">' + value + '</a>';
				}
			},{
				xtype: 'datecolumn',
				dataIndex: 'coletar_em',
				text: 'Coletar em',
				format: 'D d/m/Y',
				tooltip: 'Data/Hora para coletar carga no cliente',
				align: 'right',
				width: 120,
				filterable: true
			},{
				dataIndex: 'status',
				text: 'Status',
				tooltip: 'Situação da coleta',
				align: 'center',
				width: 100,
				filterable: false
			},{
				text: 'Horário',
				tooltip: 'Horário disponível para coleta',
				align: 'center',
				width: 100,
				sortable: false,
				filterable: false,
				renderer: function(value, metaData, record) {
					return record.get("coletar_das") + ' - ' + record.get("coletar_ate");
				}
			},{
				dataIndex: 'nota_coleta',
				text: 'Observações para coleta',
				tooltip: 'Informações sobre a carga a ser coletada',
				width: 250,
				filterable: true,
				renderer: statusRenderer
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
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'clie_endereco',
				text: 'Endereço',
				tooltip: 'Local onde será feita a coleta',
				width: 420,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'cliente_fones',
				text: 'Telefones',
				tooltip: 'Telefones para contato do cliente',
				width: 150,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'motorista_nome',
				text: 'Motorista',
				tooltip: 'Nome do motorista responsável para coleta',
				width: 150,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'motorista_celular',
				text: 'Celular',
				tooltip: 'Celular do motorista responsável para coleta',
				width: 100,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'motorista_email',
				text: 'E-mail',
				tooltip: 'E-mail do motorista responsável para coleta',
				width: 100,
				hidden: true,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'veiculo_placa',
				text: 'Placa Veículo',
				tooltip: 'Placa do veículo utilizado para coleta',
				width: 100,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'veiculo_tipo',
				text: 'Tipo Veículo',
				tooltip: 'Tipo do veículo utilizado para coleta',
				width: 120,
				filterable: true,
				renderer: statusRenderer
			},{
				dataIndex: 'veiculo_carroceria',
				text: 'Carroceria Veículo',
				tooltip: 'Carroceria do veículo utilizado para coleta',
				width: 120,
				filterable: true,
				renderer: statusRenderer
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
					tooltip: 'Incluir nova coleta',
					handler: function() {
						var form = me.up('coletaspanel').down('coletasform');
						form.expand();
						form.setGrid(me);
						setTimeout(function(){
							form.newRecord();
						}, 1000);
					}
				},{
					iconCls: 'icon-minus',
					text: 'Excluir',
					tooltip: 'Excluir coleta selecionada',
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
							url: 'mod/sac/coletas/php/response.php',
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
					itemId: 'view-filter',
					text: 'Exibindo (em aberto)',
					iconCls: 'icon-glasses-2',
					menu: {
						items: [{
							text: 'Todos',
							group: 'status-coleta',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						},'-',{
							text: 'Em aberto',
							group: 'status-coleta',
							checked: true,
							scope: this,
							checkHandler: this.onStatusChange
						},{
							text: 'Finalizadas',
							group: 'status-coleta',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						},{
							text: 'Canceladas',
							group: 'status-coleta',
							checked: false,
							scope: this,
							checkHandler: this.onStatusChange
						}]
					}
				},{
					xtype: 'searchfield',
					width: 250,
					grid: me,
					store: me.store,
					fields: [
						'clie_razao_social',
						'clie_nome_fantasia',
						'clie_cnpj_cpf',
						'clie_endereco',
						'cliente_fones',
						'motorista_nome',
						'veiculo_placa',
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
					var eastPanel = me.up('coletaspanel'), mailForm = eastPanel.down('#email-form');
					if (selections.length === 1) {
						var record = selections[0];
						
						var coletaForm = eastPanel.down('coletasform');
						coletaForm.setGrid(me);
						coletaForm.loadRecord(record);
						
						if (Ext.isEmpty(record.get('coleta_pdf'))) {
							mailForm.getForm().reset();
							mailForm.setDisabled(true);
							mailForm.setTitle('Enviar e-mail para...');
						} else {
							var message = '<span style="font-family: \'Segoe UI\', \'Open Sans\', Verdana, Arial, Helvetica, sans-serif; font-size: 11pt; font-weight: 300; line-height: 20px;">'
							+ 'Prezado cliente,'
							+ '<br/><br/>'
							+ 'Conforme solicitado segue anexo ordem de coleta número ' + record.get('id') + '.'
							+ '<br/><br/>'
							+ 'Dúvidas estamos a total disposição.'
							+ '<br/><br/>'
							+ 'Horário para coletas e entregas Seg. a Sex. das 9 às 18h.'
							+ '<br/><br/>'
							+ 'Contato: ' + App.empresa.emp_fone1 + ' / ' + App.empresa.emp_fone2
							+ '<br/><br/>'
							+ 'Atenciosamente,<br/><br/>Equipe ' + App.empresa.emp_nome_fantasia
							+ '</span><br/>'
							+ '<img style="width:230px; height:auto;" src="' + App.empresa.logo_url + '"/>'
							+ '<p style="font-family: \'Segoe UI\', \'Open Sans\', Verdana, Arial, Helvetica, sans-serif; font-size: 8pt; font-weight: 300; line-height: 20px;">Este email foi enviado pelo sistema ' + App.projeto + '<br/>EMAIL AUTOMÁTICO, NÃO RESPONDA ESSA MENSAGEM</p>';
							
							mailForm.setDisabled(false);
							mailForm.loadRecord(record);
							mailForm.setTitle('Enviar e-mail para ' + record.get('clie_razao_social'));
							mailForm = mailForm.getForm();
							mailForm.findField('email_subject').setValue('COLETA #' + record.get('id'));
							mailForm.findField('email_attach').setValue('<a href="' + record.get('coleta_pdf') + '" target="_blank">Anexo: COLETA #' + record.get('id') + '</a>');
							mailForm.findField('email_message').setValue(message);
						}
					} else {
						mailForm.getForm().reset();
						mailForm.setDisabled(true);
						mailForm.setTitle('Enviar e-mail para...');
					}
				}
			}
		});
		
		me.callParent(arguments);
	},
	
	onStatusChange: function(item, checked) {
		if (checked) {
			var menu = this.down('#view-filter');
			menu.setText('Exibindo (' + item.text.toLowerCase() + ')');
			if (!this.store.isLoading()) {
				this.store.getProxy().setExtraParam('status', item.text.toUpperCase());
				this.store.clearFilter(true);
				this.store.load();
			}
		}
	}
});