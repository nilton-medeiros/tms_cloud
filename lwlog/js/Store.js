Ext.ns(
	'Usuario',
	'Usuario.combo',
	'Usuario.combo.Store',
	
	'Grupo',
	'Grupo.combo',
	'Grupo.combo.Store'
);

Usuario.combo.Store = Ext.create('Ext.data.Store', {
	model: 'Usuario.data.Model',
	storeId: 'usuario-combo-store',
	autoLoad: true,
	remoteSort: false,
	remoteFilter: false,
	proxy: {
		type: 'ajax',
		url: 'mod/sistema/usuarios/php/response.php',
		filterParam: 'query',
		extraParams: {
			m: 'usuarios_store'
		},
		reader: {
			type: 'json',
			root: 'data',
			totalProperty: 'total',
			successProperty: 'success',
			messageProperty: 'msg'
		},
		listeners: {
			exception: App.onProxyException
		}
	},
	sorters: [{
		property: 'user_nome',
		direction: 'ASC'
	}]
});

Grupo.combo.Store = Ext.create('Ext.data.Store', {
	fields: ['perm_id','perm_grupo'],
	storeId: 'grupo-combo-store',
	autoLoad: true,
	remoteSort: false,
	remoteFilter: false,
	proxy: {
		type: 'ajax',
		url: 'mod/sistema/usuarios/php/response.php',
		filterParam: 'query',
		extraParams: {
			m: 'grupos_store'
		},
		reader: {
			type: 'json',
			root: 'data',
			totalProperty: 'total',
			successProperty: 'success',
			messageProperty: 'msg'
		},
		listeners: {
			exception: App.onProxyException
		}
	},
	sorters: [{
		property: 'perm_grupo',
		direction: 'ASC'
	}]
});