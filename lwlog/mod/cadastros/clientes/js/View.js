Ext.define("Cliente.tab.Panel", {
	extend: 'Ext.tab.Panel',
	alias: 'widget.clienteview',
	
	initComponent: function() {
		Ext.apply(this, {
			activeTab: 0,
			items: [{
				itemId: 'tab-0',
				title: 'Consulta',
				iconCls: 'icon-search',
				layout: 'border',
				border: false,
				bodyBorder: false,
				items: [{
					region: 'center',
					xtype: 'clientegrid'
				},{
					itemId: 'east-panel',
					region: 'east',
					title: 'Mais informações',
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
						xtype: 'contatogrid',
						title: 'Contatos',
						checkIDBeforeInsert: true
					},{
						xtype: 'cliaeroportogrid',
						title: 'Aeroportos / Locais'
					},{
						xtype: 'clientefaturaform',
						title: 'Dados para faturamento',
						disabled: true
					},{
						xtype: 'cliprodutogrid',
						title: 'Produtos',
						checkIDBeforeInsert: true
					}]
				}]
			},{
				xtype: 'clienteform',
				title: 'Editar',
				iconCls: 'icon-pencil',
				autoScroll: true
			}]
		});
		
		this.callParent(arguments);
	}
});