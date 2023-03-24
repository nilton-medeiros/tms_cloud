Ext.define("Minima.panel.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.minimaview',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'minimagrid'
			},{
				region: 'east',
				xtype: 'minimafaixagrid',
				title: 'Faixas de Pesos e Valores',
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