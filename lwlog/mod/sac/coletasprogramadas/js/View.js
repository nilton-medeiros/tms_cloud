Ext.define("ColetasProgramadas.tab.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.coletasprogramadaspanel',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'coletasprogramadasgrid'
			},{
				region: 'east',
				xtype: 'coletasprogramadasform',
				title: 'Formulário',
				split: false,
				collapsed: false,
				collapsible: true,
				autoScroll: true,
				width: 450
			}]
		});
		
		this.callParent(arguments);
	}
});