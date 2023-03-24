Ext.define("Especial.panel.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.especialview',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'especialgrid'
			},{
				region: 'east',
				xtype: 'especialespecificagrid',
				title: 'Faixas de Preço e Pesagem',
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