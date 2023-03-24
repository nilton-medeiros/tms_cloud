
/**
 *	Lista de Log do Sistema
 *	@example
 * 		Ext.create('DBLog.grid.Panel');
 */
Ext.define('DBLog.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.dbloggrid',
	label: 'Eventos',
	
	initComponent: function() {
		var me = this, onBeforeLoad = function(){return App.permissoes.consultar_log;};
		
		this.store = Ext.create('Ext.data.JsonStore', {
			model: 'DBLog.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			listeners: {
				beforeload: onBeforeLoad
			},
			
			proxy: {
				type: 'ajax',
				url: 'mod/sistema/dblog/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_log'
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
				property: 'data_hora',
				direction: 'DESC'
			},{
				property: 'usuario',
				direction: 'ASC'
			}]
		});
		
		if (!App.permissoes.consultar_log) {
			Ext.create('SenhaAcesso.Window', {
				action: 'consultar_log',
				actionName: 'Consultar Eventos',
				scope: this.store,
				callback: function() {
					this.removeListener('beforeload', onBeforeLoad);
					if (this.autoLoad) this.load();
				}
			});
		}
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			emptyText: 'Nenhum item encontrado',
			viewConfig: {
				stripeRows: true,
				enableTextSelection: true
			},
			features: [{
				ftype: 'grouping',
				groupHeaderTpl: '{name}',
				enableNoGroups: true,
				enableGroupingMenu: true
	        },{
	        	ftype: 'filters',
	        	encode: true,
	        	local: false
	        }],
			columns: [{
				xtype: 'rownumberer',
				text: "#",
				width: 50,
				sortable: false,
				filterable: false,
				groupable: false
			},{
				dataIndex: 'usuario',
				text: 'Usuário',
				width: 200,
				hideable: false,
				filterable: true,
				groupable: true
			},{
				dataIndex: 'evento',
				text: 'Evento',
				width: 760,
				hideable: false,
				sortable: true,
				filterable: true,
				groupable: false,
				renderer: Ext.util.Format.nl2br
			},{
				xtype: 'datecolumn',
				dataIndex: 'data_hora', 
				text: 'Registrado em', 
				format:'D d/m/Y H:i',
				width: 140,
				hideable: false,
				filter: true,
				groupable: true
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				hidden: !App.usuario.admin,
				items: [{
					text: 'Limpar',
					iconCls: 'icon-remove',
					hidden: !App.usuario.admin,
					tooltip: 'Excluir históricos a partir de uma data retroativa',
					handler: function() {
						var win = Ext.create('Ext.ux.Window', {
							ui: 'orange-window-active',
							title: 'Limpar Histórico de Uso',
							width: 250,
							height: 200,
							autoShow: true,
							autoDestroy: true,
							resizable: false,
							maximizable: false,
							minimizable: false,
							modal: false,
							layout: 'fit',
							items: {
								xtype: 'form',
								bodyPadding: 10,
								layout: 'anchor',
								defaults: {
									anchor: '100%',
									labelAlign: 'top',
									format: 'd/m/Y',
									vtype: 'daterange',
									selectOnFocus: true,
									allowBlank: false
								},
								defaultType: 'datefield',
								items: [{
									fieldLabel: 'Informe o data inicial para exclusão',
									name: 'data_inicio',
									itemId: 'data_inicio',
									endDateField: 'data_termino',
									maxValue: new Date()
								},{
									fieldLabel: 'Informe a data final para exclusão',
									name: 'data_termino',
									itemId: 'data_termino',
									startDateField: 'data_inicio',
									maxValue: new Date()
								}],
								buttons: [{
									text: 'CONFIRMAR EXCLUSÃO',
									scale: 'medium',
									formBind: true,
									disabled: true,
									handler: function(btn) {
										var panel = btn.up('form'), form = panel.getForm();
										if (!form.isValid()) return false;
										var originalText = btn.getText();
										btn.setText('Excluindo...');
										btn.setDisabled(true);
										form.submit({
											clientValidation: true,
											url: 'mod/sistema/dblog/php/response.php',
											method: 'post',
											params: {
												m: 'clear_log',
												idate: Ext.Date.format(form.findField('data_inicio').getValue(), 'D d/m/Y'),
												fdate: Ext.Date.format(form.findField('data_termino').getValue(), 'D d/m/Y')
											},
											failure: Ext.Function.createSequence(App.formFailure, function(f, a){
												btn.setDisabled(false);
												btn.setText(originalText);
											}),
											success: function(f, a) {
												me.store.load();
												win.close();
											}
										});
									}
								}]
							}
						});
					}
				},'->',{
					xtype: 'searchfield',
					store: this.store,
					width: 250,
					fields: ['usuario','evento']
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: this.store,
				displayInfo: true
			}]
		});
		this.callParent(arguments);
	}
});