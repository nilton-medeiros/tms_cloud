Ext.define('SystemLog.grid.Panel', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.systemloggrid',
	
	initComponent: function() {
		var me = this;
		
		me.store = Ext.create('Ext.data.JsonStore', {
			model: 'SystemLog.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: true,
			remoteGroup: false,
			remoteFilter: true,
			pageSize: 100,
			
			proxy: {
				type: 'ajax',
				url: 'mod/sistema/systemlog/php/response.php',
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
				property: 'sys_log_id',
				direction: 'DESC'
			}]
		});
		
		Ext.apply(this, {
			border: false,
			loadMask: false,
			multiSelect: true,
			enableColumnHide: false,
			emptyText: 'Nenhum item encontrado',
			viewConfig: {
				stripeRows: true,
				enableTextSelection: true
			},
			features: [{
	        	ftype: 'filters',
	        	encode: true,
	        	local: false
	        }],
			columns: [{
				dataIndex: 'sys_log_id',
				tdCls: 'x-grid-cell-special',
				text: 'ID',
				align: 'right',
				filterable: true,
				width: 70
			},{
				xtype: 'datecolumn',
				dataIndex: 'sys_log_data_evento', 
				text: 'Registrado em', 
				format:'D d/m/Y H:i',
				align: 'right',
				width: 140,
				filterable: true
			},{
				dataIndex: 'sys_log_tabela',
				text: 'Tabela afetada',
				width: 200,
				filterable: true
			},{
				dataIndex: 'sys_log_evento',
				text: 'Evento',
				width: 100,
				filter: {
					type: 'list',
					phpMode: true,
					options: ['INCLUSÃO', 'ALTERAÇÃO', 'EXCLUSÃO']
				}
			},{
				dataIndex: 'sys_log_evento_id',
				text: 'ID afetado',
				align: 'right',
				width: 70,
				filterable: true
			},{
				dataIndex: 'sys_log_descricao',
				text: 'Detalhes',
				width: 760,
				filterable: true,
				renderer: function(v) {
					return v.replace(/\r/g, "<br/>");
				}
			},{
				dataIndex: 'sys_log_usuario',
				text: 'Usuário responsável',
				width: 200,
				filterable: true
			}],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'top',
				items: ['->',{
					xtype: 'searchfield',
					grid: me,
					store: me.store,
					width: 250,
					fields: ['sys_log_tabela','sys_log_descricao','sys_log_usuario']
				}]
			},{
				xtype: 'pagingtoolbar',
				dock: 'bottom',
				store: me.store,
				displayInfo: true
			}]
		});
		me.callParent(arguments);
	}
});