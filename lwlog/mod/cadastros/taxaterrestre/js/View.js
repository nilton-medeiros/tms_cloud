Ext.define("Taxa.Terrestre.panel.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.taxaterrestreview',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'taxaterrestregrid'
			},{
				xtype: 'taxasexcecoesgrid',
				itemId: 'child-grid',
				region: 'east',
				title: 'Exceções de clientes',
				split: true,
				collapsed: true,
				collapsible: true,
				width: window.innerWidth / 2,
				minWidth: window.innerWidth / 3,
				maxWidth: window.innerWidth / 2
			}]
		});
		
		this.callParent(arguments);
	}
});