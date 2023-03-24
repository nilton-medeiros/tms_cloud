Ext.define("Cidade.panel.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.cidadeview',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'cidadegrid'
			},{
				region: 'east',
				title: 'Locais de Passagens da Carga',
				xtype: 'passagemgrid',
				split: true,
				disabled: true,
				collapsed: false,
				collapsible: true,
				width: 350,
				minWidth: 200,
				maxWidth: 400
			}]
		});
		
		this.callParent(arguments);
	}
});