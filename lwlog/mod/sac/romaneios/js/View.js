Ext.define("Romaneio.panel.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.romaneioview',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'center',
				xtype: 'romaneiogrid'
			},{
				itemId: 'east-panel',
				region: 'east',
				title: 'Notas Fiscais e Veículos',
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
					xtype: 'romaneionfgrid',
					title: 'Notas Fiscais'
				},{
					xtype: 'romaneioveiculogrid',
					title: 'Veículos'
				}]
			}]
		});
		
		this.callParent(arguments);
	}
});