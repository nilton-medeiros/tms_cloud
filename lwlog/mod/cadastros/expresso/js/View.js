Ext.define("Expresso.panel.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.expressoview',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'expressogrid'
			},{
				itemId: 'east-panel',
				region: 'east',
				title: 'Tabela de Excedentes',
				split: true,
				collapsed: true,
				collapsible: true,
				width: 370,
				minWidth: 350,
				maxWidth: window.innerWidth / 2,
				layout: {
					type: 'accordion',
					titleCollapse: true,
					animate: true,
					activeOnTop: true
				},
				items: [{
					xtype: 'expressoexcedentegrid',
					title: 'Pesagem e Valores'
				}]
			}]
		});
		
		this.callParent(arguments);
	}
});