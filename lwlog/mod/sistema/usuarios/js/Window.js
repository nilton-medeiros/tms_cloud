Ext.define('Usuario.Window', {
	extend: 'Ext.ux.Window',
	alias: 'widget.usuariowindow',
	
	initComponent: function() {
		Ext.apply(this, {
			title: 'Meus dados',
			ui: 'orange-window-active',
			width: 480,
			height: 245,
			modal: true,
			maximizable: false,
			minimizable: false,
			resizable: false,
			layout: 'fit',
			items: {
				xtype: 'form',
				bodyPadding: 5,
				layout: 'anchor',
				defaults: {
					anchor: '100%',
					hideLabel: true,
					layout: {
						type: 'hbox',
						defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
					},
					defaults: {
						flex: 1,
						labelAlign: 'top',
						allowBlank: false,
						selectOnFocus: true,
						listeners: {
							specialkey: this.onEnterkey
						}
					},
					defaultType: 'textfield'
				},
				defaultType: 'fieldcontainer',
				items: [{
					items: [{
						fieldLabel: 'Nome',
						name: 'user_nome',
						maxLength: 60
					}]
				},{
					items: [{
						fieldLabel: 'Login',
						name: 'user_login',
						maxLength: 45
					},{
						fieldLabel: 'Senha',
						name: 'user_senha',
						inputType: 'password',
						maxLength: 10
					}]
				},{
					items: [{
						fieldLabel: 'Celular',
						name: 'user_celular',
						vtype: 'phone',
						maxLength: 15
					},{
						fieldLabel: 'E-mail',
						name: 'user_email',
						vtype: 'email',
						maxLength: 80,
						flex: 2
					}]
				}],
				buttons: [{
					text: 'Salvar',
					itemId: 'save',
					scale: 'medium',
					formBind: true,
					disabled: true,
					handler: this.onSave
				}]
			}
		});
		
		this.callParent(arguments);
	},
	
	save: function() {
		var me = this, form = me.down('form').getForm();
		form.submit({
			clientValidation: true,
			url: 'mod/sistema/usuarios/php/response.php',
			method: 'post',
			params: {
				m: 'save_usuario',
				user_id: App.usuario.user_id,
				user_ativo: App.usuario.user_ativo
			},
			failure: App.formFailure,
			success: function(f, a) {
				Ext.apply(App.usuario, f.getValues());
				var record = Usuario.combo.Store.findRecord('user_id', App.usuario.user_id);
				if (record) {
					record.set(App.usuario);
					record.commit();
				}
				me.close();
			}
		});
	},
	
	onEnterkey: function(f, e) {
		if (e.getKey() == e.ENTER) {
			var form = this.up('form');
			if (form.getForm().isValid()) {
				var me = this.up('window');
				me.down('#save').disable();
				me.save();
			}
		}
	},
	
	onSave: function() {
		this.disable();
		this.up('window').save();
	},
	
	loadRecord: function(record) {
		if (record) {
			var form = this.down('form').getForm();
			form.loadRecord(Ext.create('Usuario.data.Model', record));
		}		
	}
});