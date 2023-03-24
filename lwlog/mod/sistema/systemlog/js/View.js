Ext.define("SystemLog.tab.Panel", {
	extend: 'Ext.tab.Panel',
	alias: 'widget.systemlogview',
	
	initComponent: function() {
		Ext.apply(this, {
			activeTab: 0,
			items: [{
				title: 'Histórico de uso',
				iconCls: 'icon-search',
				xtype: 'systemloggrid'
			},{
				title: 'Log (banco de dados)',
				iconCls: 'icon-bug',
				layout: 'fit',
				autoScroll: true,
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						text: 'Limpar',
						iconCls: 'icon-remove',
						scope: this,
						handler: function(me) {
							this.clearFile('db_errors.log', me.up('panel'));
						}
					}]
				}],
				loader: {
					url: 'mod/sistema/systemlog/php/response.php',
					contentType: 'html',
					autoLoad: true,
					params: {
						m: 'read_file',
						file: 'db_errors.log'
					},
					listeners: {
						beforeload: function() {
							return App.permissoes.consultar_log && App.usuario.admin;
						}
					}
				}
			},{
				title: 'Log (sistema)',
				iconCls: 'icon-bug',
				layout: 'fit',
				autoScroll: true,
				dockedItems: [{
					xtype: 'toolbar',
					dock: 'top',
					items: [{
						text: 'Limpar',
						iconCls: 'icon-remove',
						scope: this,
						handler: function(me) {
							this.clearFile('sys_errors.log', me.up('panel'));
						}
					}]
				}],
				loader: {
					url: 'mod/sistema/systemlog/php/response.php',
					contentType: 'html',
					autoLoad: true,
					params: {
						m: 'read_file',
						file: 'sys_errors.log'
					},
					listeners: {
						beforeload: function() {
							return App.permissoes.consultar_log && App.usuario.admin;
						}
					}
				} 
			}]
		});
		
		this.callParent(arguments);
	},
	
	clearFile: function(file, panel) {
		Ext.Ajax.request({
			url: 'mod/sistema/systemlog/php/response.php',
			method: 'post',
			params: {
				m: 'clear_file',
				file: file
			},
			failure: App.ajaxFailure,
			success: function(response) {
				var o = Ext.decode(response.responseText);
				if (!o.success) {
					App.warning(o);
				} else {
					panel.update('');
				}
			}
		});
	}
});