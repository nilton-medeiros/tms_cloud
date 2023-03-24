Ext.define("Veiculos.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.veiculospanel',
	
	initComponent: function() {
		var me = this;
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'veiculosgrid'
			},{
				region: 'east',
				xtype: 'veiculoscondutoresgrid',
				title: 'Condutores',
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