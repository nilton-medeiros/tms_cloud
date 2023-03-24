Ext.define("Motoristas.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.motoristaspanel',
	
	initComponent: function() {
		var me = this;
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'motoristasgrid'
			},{
				region: 'east',
				xtype: 'motoristasveiculosgrid',
				title: 'Veículos',
				split: true,
				collapsed: false,
				collapsible: true,
				width: 300,
				minWidth: 200,
				maxWidth: window.innerWidth / 3
			}]
		});
		
		this.callParent(arguments);
	}
});