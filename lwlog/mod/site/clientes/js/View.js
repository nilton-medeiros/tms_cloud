Ext.define("Cliente.Panel", {
	extend: 'Ext.panel.Panel',
	alias: 'widget.clienteview',
	
	initComponent: function() {
		Ext.apply(this, {
			layout: 'border',
			border: false,
			bodyBorder: false,
			items: [{
				region: 'north',
				xtype: 'clientedocumentogrid',
				title: 'Documentos',
				split: true,
				collapsed: true,
				collapsible: true,
				minHeight: 150,
				height: window.innerHeight / 2
			},{
				region: 'center',
				xtype: 'clientectegrid',
				title: 'Conhecimentos'
			},{
				region: 'south',
				xtype: 'clienteocorrenciagrid',
				title: 'Ocorrências',
				split: true,
				collapsed: false,
				collapsible: true,
				minHeight: 150,
				height: window.innerHeight / 2
			}]
		});
		
		this.callParent(arguments);
	}
});