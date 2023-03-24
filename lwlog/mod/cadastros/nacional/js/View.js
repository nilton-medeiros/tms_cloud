Ext.define("Nacional.panel.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.nacionalview',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'nacionalgrid'
			},{
				itemId: 'east-panel',
				region: 'east',
				title: 'Tabelas: Geral e Específica',
				split: true,
				collapsed: true,
				collapsible: true,
				width: window.innerWidth / 2,
				minWidth: window.innerWidth / 3,
				maxWidth: window.innerWidth / 2,
				layout: {
					type: 'accordion',
					titleCollapse: true,
					animate: true,
					activeOnTop: true
				},
				items: [{
					xtype: 'nacionalgeralgrid',
					title: 'Tabela Geral'
				},{
					xtype: 'nacionalespecificagrid',
					title: 'Tabela Específica'
				}]
			}]
		});
		
		this.callParent(arguments);
	}
});