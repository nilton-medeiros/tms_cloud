Ext.define("Empresa.tab.Panel", {
	extend: 'Ext.tab.Panel',
	alias: 'widget.empresaview',
	
	initComponent: function() {
		Ext.apply(this, {
			activeTab: 0,
			items: [{
				xtype: 'empresagrid',
				title: 'Consulta',
				iconCls: 'icon-search'
			},{
				xtype: 'empresaform',
				title: 'Editar',
				iconCls: 'icon-pencil',
				autoScroll: true
			}]
		});
		
		this.callParent(arguments);
	}
});