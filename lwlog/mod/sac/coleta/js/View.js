Ext.define("Coleta.tab.Panel", {
	extend: 'Ext.tab.Panel',
	alias: 'widget.coletaview',
	
	initComponent: function() {
		Ext.apply(this, {
			activeTab: 0,
			items: [{
				xtype: 'coletagrid',
				title: 'Consulta',
				iconCls: 'icon-search'
			},{
				xtype: 'coletaform',
				title: 'Emissão',
				iconCls: 'icon-pencil',
				autoScroll: true
			}]
		});
		
		this.callParent(arguments);
	}
});