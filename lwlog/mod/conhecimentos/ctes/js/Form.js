Ext.define('CTE.form.Panel', {
	extend: 'Ext.form.Panel',
	alias: 'widget.cteform',
	
	tomador: null,
	tomTabela: 'NACIONAL',
	tabelaPrefix: 'nac_',
	tabelaCliente: null,
	tabelaFreteComCliente: null,
	tabelaFreteSemCliente: null,
	
	buscarTabela: function(params) {
		if (params.clie_id > 0 && params.cid_id_origem > 0 && params.cid_id_destino > 0 && !Ext.isEmpty(params.tabela)) {
			var me = this, form = me.getForm();
			Ext.Ajax.request({
				url: 'mod/conhecimentos/ctes/php/response.php',
				method: 'get',
				params: Ext.apply(params, {
					m: 'pegar_tabela'
				}),
				failure: App.ajaxFailure,
				success: function(response) {
					var o = Ext.decode(response.responseText);
					
					me.tabelaFreteComCliente = o.tab_com_cliente;
					me.tabelaFreteSemCliente = o.tab_sem_cliente;
					
					var results = Ext.isEmpty(o.tab_com_cliente) ? o.tab_sem_cliente : o.tab_com_cliente;
					
					if (!Ext.isEmpty(results)) {
						var prefix = 'nac_';
						
						if (params.tabela.search(/minima/gi) > -1) {
							prefix = 'min_';
						} else if (params.tabela.search(/especial/gi) > -1) {
							prefix = 'esp_';
						} else if (params.tabela.search(/expresso/gi) > -1) {
							prefix = '';
						}
						
						me.tabelaPrefix = prefix;
						
						var listID = Ext.Array.pluck(results, prefix + 'id'),
						maxID = parseInt(Ext.Array.max(listID));
						
						var isUpdate = form.findField('cte_id').getValue() > 0;
						
						if (!isUpdate) {
							Ext.each(results, function(data) {
								var id = parseInt(data[prefix + 'id']);
								if (id == maxID) {
									form.findField('cte_tp_data_entrega').setValue(parseInt(data[prefix + 'tipo_data_prev_entrega']));
									form.findField('cte_tp_hora_entrega').setValue(parseInt(data[prefix + 'tipo_hora_prev_entrega']));
									
									var prevDataEntrega = parseInt(data[prefix + 'tipo_data_prev_entrega']),
									prevHoraEntrega = parseInt(data[prefix + 'tipo_hora_prev_entrega']);
									
									switch (prevDataEntrega) {
										case 1: case 2: case 3:
											form.findField('cte_data_programada').setValue(Ext.Date.add(form.findField('cte_data_emissao').getValue(), Ext.Date.DAY, parseInt(data[prefix + 'dias_programado'])));
										break;
										case 4:
											form.findField('cte_data_inicial').setValue(Ext.Date.add(form.findField('cte_data_emissao').getValue(), Ext.Date.DAY, parseInt(data[prefix + 'dias_inicial'])));
											form.findField('cte_data_final').setValue(Ext.Date.add(form.findField('cte_data_inicial').getValue(), Ext.Date.DAY, parseInt(data[prefix + 'dias_final'])));
										break;
									}
									
									switch (prevHoraEntrega) {
										case 1: case 2: case 3:
											form.findField('cte_hora_programada').setValue(data[prefix + 'hora_programada']);
										break;
										case 4:
											form.findField('cte_hora_inicial').setValue(data[prefix + 'hora_inicial']);
											form.findField('cte_hora_final').setValue(data[prefix + 'hora_final']);
										break;
									}
									
									return false;
								}
							});
						}
					}
					
					me.tabelaCliente = results;
				}
			});
		}
	},
	
	handlerCTESub: function(contrib_icms) {
		var me = this, form = me.getForm(), ctesubDisabled = !contrib_icms,
		ctesubTab = me.down('tabpanel').down('#cte-sub-tab'),
		field1 = form.findField('ctesub_tom_chave_cte'),
		field2 = form.findField('ctesub_tom_chave_nfe'),
		field3 = form.findField('ctesub_cnpj_emitente_doc'),
		field4 = form.findField('ctesub_cpf_emitente_doc'),
		field5 = form.findField('ctesub_modelo'),
		field6 = form.findField('ctesub_serie'),
		field6 = form.findField('ctesub_sub_serie'),
		field7 = form.findField('ctesub_numero'),
		field8 = form.findField('ctesub_valor'),
		field9 = form.findField('ctesub_data_emissao'),
		field10= form.findField('ctesub_tom_chave_cte_nfe'),
		radio1 = ctesubTab.down('#ctesub_tom_tipo_doc1'),
		radio2 = ctesubTab.down('#ctesub_tom_tipo_doc2'),
		radio3 = ctesubTab.down('#ctesub_tom_tipo_doc3');
		
		field1.reset();
		field1.clearInvalid();
		field1.setDisabled(true);
		
		field2.reset();
		field2.clearInvalid();
		field2.setDisabled(true);
		
		field3.reset();
		field3.clearInvalid();
		field3.setDisabled(true);
		
		field4.reset();
		field4.clearInvalid();
		field4.setDisabled(true);
		
		field5.reset();
		field5.clearInvalid();
		field5.setDisabled(true);
		
		field6.reset();
		field6.clearInvalid();
		field6.setDisabled(true);
		
		field7.reset();
		field7.clearInvalid();
		field7.setDisabled(true);
		
		field8.reset();
		field8.clearInvalid();
		field8.setDisabled(true);
		
		field9.reset();
		field9.clearInvalid();
		field9.setDisabled(true);
		
		field10.reset();
		field10.clearInvalid();
		field10.setDisabled(!ctesubDisabled);
		
		radio1.setValue(false);
		radio2.setValue(false);
		radio3.setValue(false);
		
		radio1.setDisabled(ctesubDisabled);
		radio2.setDisabled(ctesubDisabled);
		radio3.setDisabled(ctesubDisabled);
	},
	
	EDAData: [],
	
	initComponent: function(){
		var me = this;
		
		var NFStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Documento.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_documentos',
					cte_id: 0
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
			groupField: 'cte_id',
			sorters: [{
				property: 'cte_doc_numero',
				direction: 'ASC'
			}],
			
			listeners: {
				load: function() {
					var record = me.getRecord();
					if (record) {
						if (record.get('cte_tipo_doc_anexo') != 1) {
							this.removeAll();
						}
					}
				},
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		NFeStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Documento.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_documentos',
					cte_id: 0
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
			groupField: 'cte_id',
			sorters: [{
				property: 'cte_doc_numero',
				direction: 'ASC'
			}],
			
			listeners: {
				load: function() {
					var record = me.getRecord();
					if (record) {
						if (record.get('cte_tipo_doc_anexo') != 2) {
							this.removeAll();
						}
					}
				},
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		NFOutrosStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Documento.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_documentos',
					cte_id: 0
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
			groupField: 'cte_id',
			sorters: [{
				property: 'cte_doc_numero',
				direction: 'ASC'
			}],
			
			listeners: {
				load: function() {
					var record = me.getRecord();
					if (record) {
						if (record.get('cte_tipo_doc_anexo') != 3) {
							this.removeAll();
						}
					}
				},
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		ppStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.ProdPerigoso.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_produtos_perigosos',
					cte_id: 0
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
				property: 'prod_nome_embarque',
				direction: 'ASC'
			},{
				property: 'prod_grupo_embalagem',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		EDAStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.eda.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_eda',
					cte_id: 0
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
				property: 'cte_eda_raz_social_nome',
				direction: 'ASC'
			}],
			
			listeners: {
				load: function(store, records) {
					if (records.length) {
						var foundRecord;
						Ext.each(records, function(record) {
							foundRecord = false;
							Ext.each(me.EDAData, function(item) {
								if (item.cte_eda_id == record.get('cte_eda_id')) {
									Ext.apply(item, record.data);
									foundRecord = true;
									return false;
								}
							});
							if (!foundRecord) {
								me.EDAData.push(Ext.apply({child:[]}, record.data));
							}
						});
					}
				},
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		DTAStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.dta.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_dta',
					cte_id: 0,
					cte_eda_id: 0
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
				property: 'cte_dta_data_emissao',
				direction: 'ASC'
			}],
			
			listeners: {
				load: function(store, records) {
					var grid = me.down('#cte-eda-grid'), 
					selected = grid.getSelectionModel().getSelection();
					if (records.length) {
						Ext.each(records, function(record) {
							Ext.each(me.EDAData, function(parent) {
								if (parent.cte_eda_id == record.get('cte_eda_id')) {
									var foundRecord = false;
									Ext.each(parent.child, function(child) {
										if (child.cte_dta_id == record.get('cte_dta_id')) {
											Ext.apply(child, record.data);
											foundRecord = true;
											return false;
										}
									});
									if (!foundRecord) {
										parent.child.push(record.data); 
									}
								}
							});
						});
					} else if (selected.length === 1) {
						selected = selected[0];
						Ext.each(me.EDAData, function(item) {
							if (item.cte_eda_id == selected.get('cte_eda_id') && item.child.length) {
								store.add(item.child);
							}
						});
					}
				},
				beforeload: function() {
					var params = this.getProxy().extraParams;
					return params.cte_id > 0 && params.cte_eda_id > 0;
				}
			}
		}),
		VNStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.VN.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_vn',
					cte_id: 0
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
				property: 'cte_vn_modelo',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		CubagemStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Cubagem.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_cubagem',
					cte_id: 0
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
			groupField: 'cte_id',
			sorters: [{
				property: 'cte_dim_tipo_embalagem',
				direction: 'ASC'
			},{
				property: 'cte_dim_volumes',
				direction: 'ASC'
			},{
				property: 'cte_dim_peso_bruto',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		ColetaStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.coleta.assoc.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_coleta',
					cte_id: 0
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
				property: 'oca_data_emissao',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		LacreStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.coleta.lacre.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_lacre',
					cte_id: 0
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
				property: 'lac_numero',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		VPStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.VP.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_vp',
					cte_id: 0
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
				property: 'cte_vp_valor_vale',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		VUCStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.VUC.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_vuc',
					cte_id: 0
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
				property: 'cte_rv_placa',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		MOStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.Motorista.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_motorista',
					cte_id: 0
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
				property: 'cte_mo_motorista',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		OCFStore = Ext.create('Ext.data.JsonStore', {
			model: 'CTE.OCF.data.Model',
			autoLoad: false,
			autoDestroy: true,
			remoteSort: false,
			remoteGroup: false,
			remoteFilter: false,
			
			proxy: {
				type: 'ajax',
				url: 'mod/conhecimentos/ctes/php/response.php',
				filterParam: 'query',
				extraParams: {
					m: 'read_ocf',
					cte_id: 0
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
				property: 'cte_ocf_titulo',
				direction: 'ASC'
			}],
			
			listeners: {
				beforeload: function() {
					return this.getProxy().extraParams.cte_id > 0;
				}
			}
		}),
		NFEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		NFeEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		NFOutrosEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		ppActiveRecord,
		ppEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2,
			listeners: {
				beforeedit: function(editor, e) {
					ppActiveRecord = e.record;
				}
			}
		}),
		EDAEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2,
			listeners: {
				edit: function(editor, e) {
					if (e.field == 'cte_eda_cnpj' && !Ext.isEmpty(e.value)) {
						e.record.set('cte_eda_cpf', '');
						e.record.set('cte_eda_tipo_doc', 'CNPJ');
					} else if (e.field == 'cte_eda_cpf' && !Ext.isEmpty(e.value)) {
						e.record.set('cte_eda_cnpj', '');
						e.record.set('cte_eda_ie_uf', '');
						e.record.set('cte_eda_tipo_doc', 'CPF'); 
					}
					if (!me.EDAID) {
						me.EDAID = EDAStore.max('cte_eda_id', false);
						me.EDAID = parseInt(me.EDAID);
						if (!me.EDAID) {
							me.EDAID = 0;
						}
					}
					if (!e.record.get('cte_eda_id')) {
						me.EDAID += 1;
						e.record.set('cte_eda_id', me.EDAID);
					}
					var foundRecord = false;
					if (me.EDAData.length) {
						Ext.each(me.EDAData, function(item) {
							if (item.cte_eda_id == e.record.get('cte_eda_id')) {
								Ext.apply(item, e.record.data);
								if (!item.hasOwnProperty('child')) {
									item.child = new Array();
								}
								foundRecord = true;
								return false;
							}
						});
					}
					if (!foundRecord) {
						me.EDAData.push(Ext.apply({child: []}, e.record.data));
					}
				}
			}
		}),
		DTAEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2,
			listeners: {
				edit: function(editor, e) {
					if (!e.record.get('cte_dta_id')) {
						var DTAID = parseInt(DTAStore.max('cte_dta_id', false));
						if (!DTAID) {
							DTAID = 0;
						}
						DTAID += 1;
						e.record.set('cte_dta_id', DTAID);
					}
					Ext.each(me.EDAData, function(parent) {
						if (parent.cte_eda_id == e.record.get('cte_eda_id')) {
							var foundRecord = false;
							Ext.each(parent.child, function(child) {
								if (child.cte_dta_id == e.record.get('cte_dta_id')) {
									Ext.apply(child, e.record.data);
									foundRecord = true;
									return false;
								}
							});
							if (!foundRecord) {
								parent.child.push(e.record.data);
							}
						}
					});
				}
			}
		}),
		VNEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		CubagemEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2,
			listeners: {
				beforeedit: function(editor, e) {
					if (e.field == 'cte_dim_largura' && e.record.get('cte_dim_tipo_embalagem') == 'CILINDRICA') {
						return false;
					}
				},
				afteredit: function(editor, e) {
					var fator = App.empresa.emp_tipo_calculo_cubagem == 'RODOVIARIO' ? 300 : 166.6667,
					pegarCubagem = function() {
						var cubagem = 0;
						if (e.record.get('cte_dim_tipo_embalagem') == 'QUADRADA') {
							cubagem = e.record.get('cte_dim_volumes') * (e.record.get('cte_dim_cumprimento') * e.record.get('cte_dim_altura') * e.record.get('cte_dim_largura'));
						} else {
							cubagem = e.record.get('cte_dim_volumes') * (e.record.get('cte_dim_cumprimento') * (e.record.get('cte_dim_altura') * e.record.get('cte_dim_altura')));
						}
						return cubagem;
					};
					if (e.field.search(new RegExp("volume|cumprimento|altura|largura", "gi")) > -1 && e.value != e.originalValue) {
						if (e.record.get('cte_dim_tipo_embalagem') == 'QUADRADA') {
							e.record.set('cte_dim_cubagem_m3', e.record.get('cte_dim_volumes') * (e.record.get('cte_dim_cumprimento') * e.record.get('cte_dim_altura') * e.record.get('cte_dim_largura')));
						} else {
							e.record.set('cte_dim_cubagem_m3', e.record.get('cte_dim_volumes') * (e.record.get('cte_dim_cumprimento') * (e.record.get('cte_dim_altura') * e.record.get('cte_dim_altura'))));
						}
						e.record.set('cte_dim_peso_cubado', e.record.get('cte_dim_cubagem_m3') * fator);
						
						if (e.record.get('cte_dim_peso_cubado') > e.record.get('cte_dim_peso_bruto')) {
							e.record.set('cte_dim_peso_taxado', App.roundMiddle(e.record.get('cte_dim_peso_cubado')));
						} else {
							e.record.set('cte_dim_peso_taxado', App.roundMiddle(e.record.get('cte_dim_peso_bruto')));
						}
					} else if (e.field == 'cte_dim_cubagem_m3' && e.value > 0 && e.value != pegarCubagem()) {
						e.record.set('cte_dim_cumprimento', 0);
						e.record.set('cte_dim_altura', 0);
						e.record.set('cte_dim_largura', 0);
					} else if (e.field == 'cte_dim_tipo_embalagem' && e.value == 'CILINDRICA') {
						e.record.set('cte_dim_largura', 0);
					} else if (e.field == 'cte_dim_peso_bruto' && e.value != e.originalValue) {
						e.record.set('cte_dim_peso_taxado', App.roundMiddle(e.value));
					}
					
					var volumes = 0, pesagem = 0, totais = me.totalizarDocumentos();
					CubagemStore.each(function(r) {
						volumes += r.get('cte_dim_volumes');
						pesagem += r.get('cte_dim_peso_taxado');
					});
					if (volumes > totais.volumes) {
						e.record.reject();
					}
					me.getForm().findField('cte_peso_bc').setValue(pesagem);
				}
			}
		}),
		ColetaEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		LacreEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		VPEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		VUCEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		MOEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		}),
		OCFEditor = Ext.create('Ext.grid.plugin.CellEditing',{
			clicksToEdit: 2
		});
		
		var localEntregaList = [{
			id: 0,
			field: 'O mesmo do destinatário'
		}], localColetaList = [{
			id: 0,
			field: 'O mesmo do remetente'
		}];
		if (App.empresa.emp_tipo_emitente == 'ND') {
			localEntregaList.push({
				id: 1,
				field: 'Local de entrega diferente do destinatário'
			});
			localColetaList.push({
				id: 1,
				field: 'Local de coleta diferente do remetente'
			});
		}
		
		Ext.apply(this, {
			items: [{
				xtype: 'fieldset',
				title: 'EMPRESA ATIVA PARA EMISSÃO DO CONHECIMENTO (CT-e)',
				collapsed: false,
				collapsible: true,
				defaults: {
					hideLabel: true,
					labelAlign: 'top',
					anchor: '100%',
					layout: {
						type: 'hbox',
						defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
					},
					defaults: {
						flex: 1,
						labelAlign: 'top',
						readOnly: true,
						selectOnFocus: true,
						fieldStyle: {
							backgroundColor: '#F5F6F7'
						}
					},
					defaultType: 'textfield'
				},
				defaultType: 'fieldcontainer',
				items: [{
					items: [{
						fieldLabel: 'Emitente',
						name: 'emp_razao_social',
						value: App.empresa.emp_sigla_cia + ' - ' + App.empresa.emp_razao_social
					},{
						fieldLabel: 'CNPJ',
						name: 'emp_cnpj',
						value: App.empresa.emp_cnpj
					},{
						fieldLabel: 'IE',
						name: 'emp_inscricao_estadual',
						value: App.empresa.emp_inscricao_estadual
					},{
						fieldLabel: 'Local',
						name: 'emp_cid_sigla',
						value: App.empresa.cid_sigla
					},{
						fieldLabel: 'Ambiente',
						name: 'emp_ambiente_sefaz',
						value: App.empresa.emp_ambiente_sefaz == 1 ? 'Produção' : 'Homologação'
					}]
				},{
					items: [{
						fieldLabel: 'Status',
						name: 'cte_situacao',
						value: 'DIGITAÇÃO'
					},{
						fieldLabel: 'Chave de acesso',
						name: 'cte_chave'
					},{
						xtype: 'hiddenfield',
						name: 'cte_id',
						flex: null,
						width: 0,
						value: 0,
						allowBlank: true
					},{
						fieldLabel: 'Número',
						name: 'cte_numero_rotulo'
					}]
				}]
			},{
				xtype: 'tabpanel',
				activeTab: 0,
				items: [{
					title: '1. Dados CT-e',
					bodyPadding: 10,
					autoScroll: true,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						collapsible: false,
						defaults: {
							hideLabel: true,
							labelAlign: 'top',
							anchor: '100%',
							layout: {
								type: 'hbox',
								defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
							},
							defaults: {
								flex: 1,
								labelAlign: 'top',
								allowBlank: true,
								selectOnFocus: true
							},
							defaultType: 'textfield'
						},
						defaultType: 'fieldcontainer'
					},
					defaultType: 'fieldset',
					items: [{
						title: 'Clientes',
						items: [{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Remetente',
								name: 'cte_remetente',
								value: 1,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [{
									id: 1,
									field: 'Com Remetente'
								},{
									id: 2,
									field: 'Sem Remetente: Redespacho Intermediário'
								},{
									id: 3,
									field: 'Sem Remetente: Serviço Vinculado a multimodal'
								}],
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm(),
										f1 = form.findField('clie_remetente_id'),
										f2 = form.findField('rem_cnpj_cpf'),
										f3 = form.findField('rem_cid_municipio'),
										f4 = form.findField('rem_cid_uf'),
										f5 = form.findField('rem_cid_sigla'),
										f6 = form.findField('rem_cid_nome_aeroporto'),
										f7 = form.findField('cte_outro_local_coleta'),
										f8 = form.findField('clie_coleta_id'),
										f9 = form.findField('col_cnpj_cpf'),
										f10 = form.findField('col_cid_municipio'),
										f11 = form.findField('col_cid_uf'),
										f12 = form.findField('col_cid_sigla'),
										f13 = form.findField('col_cid_nome_aeroporto'),
										f14 = form.findField('cte_tipo_servico'),
										disabled = record.get('id') != 1;
										if (disabled) {
											f1.reset();
											f2.reset();
											f3.reset();
											f4.reset();
											f5.reset();
											f6.reset();
											f7.setValue(0);
											
											form.findField('clie_destinatario_id').reset();
											form.findField('des_cnpj_cpf').reset();
											form.findField('des_cid_municipio').reset();
											form.findField('des_cid_uf').reset();
											form.findField('des_cid_sigla').reset();
											form.findField('des_cid_nome_aeroporto').reset();
											
											form.findField('cte_outro_local_entrega').setValue(0);
											form.findField('clie_entrega_id').reset();
											form.findField('ent_cnpj_cpf').reset();
											form.findField('ent_cid_municipio').reset();
											form.findField('ent_cid_uf').reset();
											form.findField('ent_cid_sigla').reset();
											form.findField('ent_cid_nome_aeroporto').reset();
										} else {
											form.findField('clie_expedidor_id').reset();
											form.findField('exp_cnpj_cpf').reset();
											form.findField('exp_cid_municipio').reset();
											form.findField('exp_cid_uf').reset();
											form.findField('exp_cid_sigla').reset();
											form.findField('exp_cid_nome_aeroporto').reset();
											
											form.findField('clie_recebedor_id').reset();
											form.findField('rec_cnpj_cpf').reset();
											form.findField('rec_cid_municipio').reset();
											form.findField('rec_cid_uf').reset();
											form.findField('rec_cid_sigla').reset();
											form.findField('rec_cid_nome_aeroporto').reset();
										}
										f1.setDisabled(disabled);
										f2.setDisabled(disabled);
										f3.setDisabled(disabled);
										f4.setDisabled(disabled);
										f5.setDisabled(disabled);
										f6.setDisabled(disabled);
										
										f7.setReadOnly(disabled);
										f8.setDisabled(true);
										f9.setDisabled(true);
										f10.setDisabled(true);
										f11.setDisabled(true);
										f12.setDisabled(true);
										f13.setDisabled(true);
										
										form.findField('cte_expedidor').setValue(disabled ? 1 : 0);
										form.findField('cte_expedidor').setReadOnly(!disabled);
										form.findField('clie_expedidor_id').setDisabled(!disabled);
										form.findField('exp_cnpj_cpf').setDisabled(!disabled);
										form.findField('exp_cid_municipio').setDisabled(!disabled);
										form.findField('exp_cid_uf').setDisabled(!disabled);
										form.findField('exp_cid_sigla').setDisabled(!disabled);
										form.findField('exp_cid_nome_aeroporto').setDisabled(!disabled);
										
										form.findField('cte_recebedor').setValue(disabled ? 1 : 0);
										form.findField('cte_recebedor').setReadOnly(!disabled);
										form.findField('clie_recebedor_id').setDisabled(!disabled);
										form.findField('rec_cnpj_cpf').setDisabled(!disabled);
										form.findField('rec_cid_municipio').setDisabled(!disabled);
										form.findField('rec_cid_uf').setDisabled(!disabled);
										form.findField('rec_cid_sigla').setDisabled(!disabled);
										form.findField('rec_cid_nome_aeroporto').setDisabled(!disabled);
										
										form.findField('cte_destinatario').setValue(record.get('id'));
										form.findField('cte_destinatario').setReadOnly(disabled);
										form.findField('clie_destinatario_id').setDisabled(disabled);
										form.findField('des_cnpj_cpf').setDisabled(disabled);
										form.findField('des_cid_municipio').setDisabled(disabled);
										form.findField('des_cid_uf').setDisabled(disabled);
										form.findField('des_cid_sigla').setDisabled(disabled);
										form.findField('des_cid_nome_aeroporto').setDisabled(disabled);
										
										form.findField('cte_outro_local_entrega').setReadOnly(disabled);
										form.findField('clie_entrega_id').setDisabled(true);
										form.findField('ent_cnpj_cpf').setDisabled(true);
										form.findField('ent_cid_municipio').setDisabled(true);
										form.findField('ent_cid_uf').setDisabled(true);
										form.findField('ent_cid_sigla').setDisabled(true);
										form.findField('ent_cid_nome_aeroporto').setDisabled(true);
										
										if (record.get('id') == 2) {
											f14.setValue(3);
										} else if (record.get('id') == 3) {
											f14.setValue(4);
										} else {
											f14.setValue(0);
										}
									}
								}
							},{
								flex: 2,
								xtype: 'clientecombo',
								fieldLabel: 'RAZÃO SOCIAL',
								name: 'clie_remetente_id',
								fireSelectEventOnValue: true,
								extraParams: {
									clie_ativo: 1,
									clie_categoria: '0,4'
								},
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm();
										form.findField('rem_cid_uf').setValue(record.get('cid_uf'));
										form.findField('rem_cid_municipio').setValue(record.get('cid_municipio'));
										form.findField('rem_cid_sigla').setValue(record.get('cid_sigla'));
										form.findField('rem_cid_nome_aeroporto').setValue(record.get('cid_nome_aeroporto'));
										form.findField('rem_cnpj_cpf').setValue(Ext.isEmpty(record.get('clie_cnpj')) ? record.get('clie_cpf') : record.get('clie_cnpj'));
										
										var temColeta = form.findField('clie_coleta_id').getValue() > 0;
										if (!temColeta) {
											var combo1 = form.findField('cid_id_origem'), 
											store1 = combo1.getStore(),
											proxy1 = store1.getProxy();
											proxy1.setExtraParam('cid_id', record.get('cid_id'));
											proxy1.setExtraParam('clie_id', record.get('clie_id'));
											store1.load({
												callback: function() {
													combo1.setValue(record.get('cid_id'));
												}
											});
										}
										
										me.tomador = record.data;
										var temTomador = form.findField('clie_tomador_id').getValue() > 0;
										if (!temTomador && form.findField('cte_tomador').getValue() == 0) {
											var combo2 = form.findField('redespacho_id'),
											store2 = combo2.getStore(),
											proxy2 = store2.getProxy();
											proxy2.setExtraParam('clie_id', record.get('clie_id'));
											proxy2.setExtraParam('cid_id_origem', record.get('cid_id'));
											store2.load({
												callback: function() {
													var max = store2.max('red_id', false);
													max = parseInt(max);
													if (max > 0) {
														var data = store2.findRecord('red_id', max);
														if (data) {
															combo2.setValue(data.get('red_id'));
														}
													}
												}
											});
											me.tomador = record.data;
											me.handlerCTESub(record.get('clie_contrib_icms'));
										}
									}
								}
							},{
								fieldLabel: 'CNPJ/CPF',
								name: 'rem_cnpj_cpf',
								readOnly: true
							},{
								fieldLabel: 'MUNICÍPIO',
								name: 'rem_cid_municipio',
								readOnly: true
							},{
								fieldLabel: 'UF',
								name: 'rem_cid_uf',
								flex: null,
								width: 50,
								readOnly: true
							},{
								fieldLabel: 'SIGLA',
								name: 'rem_cid_sigla',
								flex: null,
								width: 50,
								readOnly: true,
								allowBlank: true
							},{
								fieldLabel: 'AEROPORTO',
								name: 'rem_cid_nome_aeroporto',
								readOnly: true,
								allowBlank: true
							}]
						},{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Local de Coleta',
								name: 'cte_outro_local_coleta',
								value: 0,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: localColetaList,
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm(),
										f1 = form.findField('clie_coleta_id'),
										f2 = form.findField('col_cnpj_cpf'),
										f3 = form.findField('col_cid_municipio'),
										f4 = form.findField('col_cid_uf'),
										f5 = form.findField('col_cid_sigla'),
										f6 = form.findField('col_cid_nome_aeroporto'),
										f7 = form.findField('cte_remetente'),
										f8 = form.findField('clie_remetente_id'),
										f9 = form.findField('rem_cnpj_cpf'),
										f10 = form.findField('rem_cid_municipio'),
										f11 = form.findField('rem_cid_uf'),
										f12 = form.findField('rem_cid_sigla'),
										f13 = form.findField('rem_cid_nome_aeroporto'),
										disabled = record.get('id') != 1;
										if (disabled) {
											f1.reset();
											f2.reset();
											f3.reset();
											f4.reset();
											f5.reset();
											f6.reset();
											f7.setValue(1);
											f8.setDisabled(false);
											f9.setDisabled(false);
											f10.setDisabled(false);
											f11.setDisabled(false);
											f12.setDisabled(false);
											f13.setDisabled(false);
										}
										f1.setDisabled(disabled);
										f2.setDisabled(disabled);
										f3.setDisabled(disabled);
										f4.setDisabled(disabled);
										f5.setDisabled(disabled);
										f6.setDisabled(disabled);
									}
								}
							},{
								flex: 2,
								xtype: 'clientecombo',
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'clie_coleta_id',
								disabled: true,
								fireSelectEventOnValue: true,
								extraParams: {
									clie_ativo: 1,
									clie_categoria: '0,1,4'
								},
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm();
										form.findField('col_cid_uf').setValue(record.get('cid_uf'));
										form.findField('col_cid_municipio').setValue(record.get('cid_municipio'));
										form.findField('col_cid_sigla').setValue(record.get('cid_sigla'));
										form.findField('col_cid_nome_aeroporto').setValue(record.get('cid_nome_aeroporto'));
										form.findField('col_cnpj_cpf').setValue(Ext.isEmpty(record.get('clie_cnpj')) ? record.get('clie_cpf') : record.get('clie_cnpj'));
										
										var combo1 = form.findField('cid_id_origem'), 
										store1 = combo1.getStore(),
										proxy1 = store1.getProxy();
										proxy1.setExtraParam('cid_id', record.get('cid_id'));
										proxy1.setExtraParam('clie_id', record.get('clie_id'));
										store1.load({
											callback: function() {
												combo1.setValue(record.get('cid_id'));
											}
										});
										
										var temTomador = form.findField('clie_tomador_id').getValue() > 0;
										if (!temTomador && form.findField('cte_tomador').getValue() == 0) {
											var combo2 = form.findField('redespacho_id'),
											store2 = combo2.getStore(),
											proxy2 = store2.getProxy();
											proxy2.setExtraParam('clie_id', record.get('clie_id'));
											proxy2.setExtraParam('cid_id_origem', record.get('cid_id'));
											store2.load({
												callback: function() {
													var max = store2.max('red_id', false);
													max = parseInt(max);
													if (max > 0) {
														var data = store2.findRecord('red_id', max);
														if (data) {
															combo2.setValue(data.get('red_id'));
														}
													}
												}
											});
											me.tomador = record.data;
											me.handlerCTESub(record.get('clie_contrib_icms'));
										}
									}
								}
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'col_cnpj_cpf',
								disabled: true,
								readOnly: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'col_cid_municipio',
								disabled: true,
								readOnly: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'col_cid_uf',
								flex: null,
								width: 50,
								disabled: true,
								readOnly: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'col_cid_sigla',
								flex: null,
								width: 50,
								readOnly: true,
								disabled: true,
								allowBlank: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'col_cid_nome_aeroporto',
								readOnly: true,
								disabled: true,
								allowBlank: true
							}]
						},{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Expedidor',
								name: 'cte_expedidor',
								readOnly: true,
								value: 0,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [{
									id: 0,
									field: 'Sem Expedidor'
								},{
									id: 1,
									field: 'Com Expedidor'
								}],
								listeners: {
									beforeselect: function(field, record) {
										var form = me.getForm();
										if (form.findField('cte_remetente').getValue() != 1 && record.get('id') == 0) {
											return false;
										}
									},
									select: function(field, records) {
										var record = records[0], form = me.getForm(),
										f1 = form.findField('clie_expedidor_id'),
										f2 = form.findField('exp_cnpj_cpf'),
										f3 = form.findField('exp_cid_municipio'),
										f4 = form.findField('exp_cid_uf'),
										f5 = form.findField('exp_cid_sigla'),
										f6 = form.findField('exp_cid_nome_aeroporto'),
										disabled = record.get('id') != 1;
										if (disabled) {
											f1.reset();
											f2.reset();
											f3.reset();
											f4.reset();
											f5.reset();
											f6.reset();
										}
										f1.setDisabled(disabled);
										f2.setDisabled(disabled);
										f3.setDisabled(disabled);
										f4.setDisabled(disabled);
										f5.setDisabled(disabled);
										f6.setDisabled(disabled);
									}
								}
							},{
								flex: 2,
								xtype: 'clientecombo',
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'clie_expedidor_id',
								disabled: true,
								fireSelectEventOnValue: true,
								extraParams: {
									clie_ativo: 1,
									clie_categoria: '1,4'
								},
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm();
										form.findField('exp_cid_uf').setValue(record.get('cid_uf'));
										form.findField('exp_cid_municipio').setValue(record.get('cid_municipio'));
										form.findField('exp_cid_sigla').setValue(record.get('cid_sigla'));
										form.findField('exp_cid_nome_aeroporto').setValue(record.get('cid_nome_aeroporto'));
										form.findField('exp_cnpj_cpf').setValue(Ext.isEmpty(record.get('clie_cnpj')) ? record.get('clie_cpf') : record.get('clie_cnpj'));
										
										var temColeta = form.findField('clie_coleta_id').getValue() > 0;
										if (!temColeta) {
											var combo1 = form.findField('cid_id_origem'), 
											store1 = combo1.getStore(),
											proxy1 = store1.getProxy();
											proxy1.setExtraParam('cid_id', record.get('cid_id'));
											proxy1.setExtraParam('clie_id', record.get('clie_id'));
											store1.load({
												callback: function() {
													combo1.setValue(record.get('cid_id'));
												}
											});
										}
										
										var temTomador = form.findField('clie_tomador_id').getValue() > 0;
										if (!temTomador && form.findField('cte_tomador').getValue() == 1) {
											var combo1 = form.findField('redespacho_id'),
											store1 = combo1.getStore(),
											proxy1 = store1.getProxy();
											proxy1.setExtraParam('clie_id', record.get('clie_id'));
											store1.load({
												callback: function() {
													var max = store1.max('red_id', false);
													max = parseInt(max);
													if (max > 0) {
														var data = store1.findRecord('red_id', max);
														if (data) {
															combo1.setValue(data.get('red_id'));
														}
													}
												}
											});
											me.tomador = record.data;
											me.handlerCTESub(record.get('clie_contrib_icms'));
										}
									}
								}
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'exp_cnpj_cpf',
								readOnly: true,
								disabled: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'exp_cid_municipio',
								readOnly: true,
								disabled: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'exp_cid_uf',
								flex: null,
								width: 50,
								readOnly: true,
								disabled: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'exp_cid_sigla',
								flex: null,
								width: 50,
								readOnly: true,
								disabled: true,
								allowBlank: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'exp_cid_nome_aeroporto',
								readOnly: true,
								disabled: true,
								allowBlank: true
							}]
						},{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Destinatário',
								name: 'cte_destinatario',
								value: 1,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [{
									id: 1,
									field: 'Com Destinatário'
								},{
									id: 2,
									field: 'Sem Destinatário: Redespacho Intermediário'
								},{
									id: 3,
									field: 'Sem Destinatário: Serviço Vinculado a multimodal'
								}],
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm(),
										f1 = form.findField('clie_destinatario_id'),
										f2 = form.findField('des_cnpj_cpf'),
										f3 = form.findField('des_cid_municipio'),
										f4 = form.findField('des_cid_uf'),
										f5 = form.findField('des_cid_sigla'),
										f6 = form.findField('des_cid_nome_aeroporto'),
										f7 = form.findField('cte_outro_local_entrega'),
										f8 = form.findField('clie_entrega_id'),
										f9 = form.findField('ent_cnpj_cpf'),
										f10 = form.findField('ent_cid_municipio'),
										f11 = form.findField('ent_cid_uf'),
										f12 = form.findField('ent_cid_sigla'),
										f13 = form.findField('ent_cid_nome_aeroporto'),
										disabled = record.get('id') != 1;
										if (disabled) {
											f1.reset();
											f2.reset();
											f3.reset();
											f4.reset();
											f5.reset();
											f6.reset();
											f7.setValue(1);
											f8.setDisabled(false);
											f9.setDisabled(false);
											f10.setDisabled(false);
											f11.setDisabled(false);
											f12.setDisabled(false);
											f13.setDisabled(false);
										}
										f1.setDisabled(disabled);
										f2.setDisabled(disabled);
										f3.setDisabled(disabled);
										f4.setDisabled(disabled);
										f5.setDisabled(disabled);
										f6.setDisabled(disabled);
									}
								}
							},{
								flex: 2,
								xtype: 'clientecombo',
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'clie_destinatario_id',
								fireSelectEventOnValue: true,
								extraParams: {
									clie_ativo: 1,
									clie_categoria: '3,4'
								},
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm();
										form.findField('des_cid_uf').setValue(record.get('cid_uf'));
										form.findField('des_cid_municipio').setValue(record.get('cid_municipio'));
										form.findField('des_cid_sigla').setValue(record.get('cid_sigla'));
										form.findField('des_cid_nome_aeroporto').setValue(record.get('cid_nome_aeroporto'));
										form.findField('des_cnpj_cpf').setValue(Ext.isEmpty(record.get('clie_cnpj')) ? record.get('clie_cpf') : record.get('clie_cnpj'));
										
										var combo1 = form.findField('cid_id_destino'), 
										store1 = combo1.getStore(),
										proxy1 = store1.getProxy();
										proxy1.setExtraParam('cid_id', record.get('cid_id'));
										proxy1.setExtraParam('clie_id', record.get('clie_id'));
										store1.load({
											callback: function() {
												combo1.setValue(record.get('cid_id'));
											}
										});
										
										var temEntrega = form.findField('clie_entrega_id').getValue() > 0;
										if (!temEntrega) {
											var combo2 = form.findField('cte_codigo_rota');
											if (record.get('rota_id') > 0 && combo.getValue() != record.get('rota_id')) {
												combo2.getStore().load({
													params: {
														fieldFilter: 'rota_id',
														valueFilter: record.get('rota_id')
													},
													callback: function() {
														combo2.setValue(record.get('rota_codigo'));
													}
												});
											}
										}
										
										var temTomador = form.findField('clie_tomador_id').getValue() > 0;
										if (!temTomador && form.findField('cte_tomador').getValue() == 3) {
											var combo3 = form.findField('redespacho_id'),
											store3 = combo3.getStore();
											proxy3 = store3.getProxy();
											proxy3.setExtraParam('clie_id', record.get('clie_id'));
											proxy3.setExtraParam('cid_id_destino', record.get('cid_id'));
											store3.load({
												callback: function() {
													var max = store3.max('red_id', false);
													max = parseInt(max);
													if (max > 0) {
														var data = store3.findRecord('red_id', max);
														if (data) {
															combo3.setValue(data.get('red_id'));
														}
													}
												}
											});
											me.tomador = record.data;
											me.handlerCTESub(record.get('clie_contrib_icms'));
										}
									}
								}
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'des_cnpj_cpf',
								readOnly: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'des_cid_municipio',
								readOnly: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'des_cid_uf',
								flex: null,
								width: 50,
								readOnly: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'des_cid_sigla',
								flex: null,
								width: 50,
								readOnly: true,
								allowBlank: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'des_cid_nome_aeroporto',
								readOnly: true,
								allowBlank: true
							}]
						},{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Local de Entrega',
								name: 'cte_outro_local_entrega',
								value: 0,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: localEntregaList,
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm(),
										f1 = form.findField('clie_entrega_id'),
										f2 = form.findField('ent_cnpj_cpf'),
										f3 = form.findField('ent_cid_municipio'),
										f4 = form.findField('ent_cid_uf'),
										f5 = form.findField('ent_cid_sigla'),
										f6 = form.findField('ent_cid_nome_aeroporto'),
										f7 = form.findField('cte_destinatario'),
										f8 = form.findField('clie_destinatario_id'),
										f9 = form.findField('des_cnpj_cpf'),
										f10 = form.findField('des_cid_municipio'),
										f11 = form.findField('des_cid_uf'),
										f12 = form.findField('des_cid_sigla'),
										f13 = form.findField('des_cid_nome_aeroporto'),
										disabled = record.get('id') != 1;
										if (disabled) {
											f1.reset();
											f2.reset();
											f3.reset();
											f4.reset();
											f5.reset();
											f6.reset();
											f7.setValue(1);
											f8.setDisabled(false);
											f9.setDisabled(false);
											f10.setDisabled(false);
											f11.setDisabled(false);
											f12.setDisabled(false);
											f13.setDisabled(false);
										}
										f1.setDisabled(disabled);
										f2.setDisabled(disabled);
										f3.setDisabled(disabled);
										f4.setDisabled(disabled);
										f5.setDisabled(disabled);
										f6.setDisabled(disabled);
									}
								}
							},{
								flex: 2,
								xtype: 'clientecombo',
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'clie_entrega_id',
								disabled: true,
								fireSelectEventOnValue: true,
								extraParams: {
									clie_ativo: 1,
									clie_categoria: '2,3,4'
								},
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm();
										form.findField('ent_cid_uf').setValue(record.get('cid_uf'));
										form.findField('ent_cid_municipio').setValue(record.get('cid_municipio'));
										form.findField('ent_cid_sigla').setValue(record.get('cid_sigla'));
										form.findField('ent_cid_nome_aeroporto').setValue(record.get('cid_nome_aeroporto'));
										form.findField('ent_cnpj_cpf').setValue(Ext.isEmpty(record.get('clie_cnpj')) ? record.get('clie_cpf') : record.get('clie_cnpj'));
										
										var combo1 = form.findField('cid_id_destino'), 
										store1 = combo1.getStore(),
										proxy1 = store1.getProxy();
										proxy1.setExtraParam('cid_id', record.get('cid_id'));
										proxy1.setExtraParam('clie_id', record.get('clie_id'));
										store1.load({
											callback: function() {
												combo1.setValue(record.get('cid_id'));
											}
										});
										
										var combo2 = form.findField('cte_codigo_rota');
										if (record.get('rota_id') > 0 && combo.getValue() != record.get('rota_id')) {
											combo2.getStore().load({
												params: {
													fieldFilter: 'rota_id',
													valueFilter: record.get('rota_id')
												},
												callback: function() {
													combo2.setValue(record.get('rota_codigo'));
												}
											});
										}
										
										var temTomador = form.findField('clie_tomador_id').getValue() > 0;
										if (!temTomador && form.findField('cte_tomador').getValue() == 3) {
											var combo3 = form.findField('redespacho_id'),
											store3 = combo3.getStore(),
											proxy3 = store3.getProxy();
											proxy3.setExtraParam('clie_id', record.get('clie_id'));
											proxy3.setExtraParam('cid_id_destino', record.get('cid_id'));
											store3.load({
												callback: function() {
													var max = store3.max('red_id', false);
													max = parseInt(max);
													if (max > 0) {
														var data = store3.findRecord('red_id', max);
														if (data) {
															combo3.setValue(data.get('red_id'));
														}
													}
												}
											});
											me.tomador = record.data;
											me.handlerCTESub(record.get('clie_contrib_icms'));
										}
									}
								}
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'ent_cnpj_cpf',
								readOnly: true,
								disabled: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'ent_cid_municipio',
								readOnly: true,
								disabled: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'ent_cid_uf',
								flex: null,
								width: 50,
								readOnly: true,
								disabled: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'ent_cid_sigla',
								flex: null,
								width: 50,
								readOnly: true,
								disabled: true,
								allowBlank: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'ent_cid_nome_aeroporto',
								readOnly: true,
								disabled: true,
								allowBlank: true
							}]
						},{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Recebedor',
								name: 'cte_recebedor',
								//readOnly: true,
								value: 0,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [{
									id: 0,
									field: 'Sem Recebedor'
								},{
									id: 1,
									field: 'Com Recebedor'
								}],
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm(),
										f1 = form.findField('clie_recebedor_id'),
										f2 = form.findField('rec_cnpj_cpf'),
										f3 = form.findField('rec_cid_municipio'),
										f4 = form.findField('rec_cid_uf'),
										f5 = form.findField('rec_cid_sigla'),
										f6 = form.findField('rec_cid_nome_aeroporto'),
										disabled = record.get('id') != 1;
										if (disabled) {
											f1.reset();
											f2.reset();
											f3.reset();
											f4.reset();
											f5.reset();
											f6.reset();
										}
										f1.setDisabled(disabled);
										f2.setDisabled(disabled);
										f3.setDisabled(disabled);
										f4.setDisabled(disabled);
										f5.setDisabled(disabled);
										f6.setDisabled(disabled);
									}
								}
							},{
								flex: 2,
								xtype: 'clientecombo',
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'clie_recebedor_id',
								disabled: true,
								fireSelectEventOnValue: true,
								extraParams: {
									clie_ativo: 1,
									clie_categoria: '2,4'
								},
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm();
										form.findField('rec_cid_uf').setValue(record.get('cid_uf'));
										form.findField('rec_cid_municipio').setValue(record.get('cid_municipio'));
										form.findField('rec_cid_sigla').setValue(record.get('cid_sigla'));
										form.findField('rec_cid_nome_aeroporto').setValue(record.get('cid_nome_aeroporto'));
										form.findField('rec_cnpj_cpf').setValue(Ext.isEmpty(record.get('clie_cnpj')) ? record.get('clie_cpf') : record.get('clie_cnpj'));
										
										var combo1 = form.findField('redespacho_id'), 
										store1 = combo1.getStore(),
										proxy1 = store1.getProxy();
										proxy1.setExtraParam('clie_id', record.get('clie_id'));
										proxy1.setExtraParam('cid_id_origem', form.findField('cid_id_origem').getValue());
										proxy1.setExtraParam('cid_id_destino', form.findField('cid_id_destino').getValue());
										store1.load({
											callback: function() {
												combo1.setValue(store1.max("red_id"));
											}
										});
										
										var temEntrega = form.findField('clie_entrega_id').getValue() > 0;
										if (!temEntrega) {
											var combo2 = form.findField('cte_codigo_rota');
											if (record.get('rota_id') > 0 && combo.getValue() != record.get('rota_id')) {
												combo2.getStore().load({
													params: {
														fieldFilter: 'rota_id',
														valueFilter: record.get('rota_id')
													},
													callback: function() {
														combo2.setValue(record.get('rota_codigo'));
													}
												});
											}
										}
										
										var temTomador = form.findField('clie_tomador_id').getValue() > 0;
										if (!temTomador && form.findField('cte_tomador').getValue() == 2) {
											var combo1 = form.findField('redespacho_id'),
											store1 = combo1.getStore(),
											proxy1 = store1.getProxy();
											proxy1.setExtraParam('clie_id', record.get('clie_id'));
											store1.load({
												callback: function() {
													var max = store1.max('red_id', false);
													max = parseInt(max);
													if (max > 0) {
														var data = store1.findRecord('red_id', max);
														if (data) {
															combo1.setValue(data.get('red_id'));
														}
													}
												}
											});
											me.tomador = record.data;
											me.handlerCTESub(record.get('clie_contrib_icms'));
										}
									}
								}
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'rec_cnpj_cpf',
								readOnly: true,
								disabled: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'rec_cid_municipio',
								readOnly: true,
								disabled: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'rec_cid_uf',
								flex: null,
								width: 50,
								readOnly: true,
								disabled: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'rec_cid_sigla',
								flex: null,
								width: 50,
								readOnly: true,
								disabled: true,
								allowBlank: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'rec_cid_nome_aeroporto',
								readOnly: true,
								disabled: true,
								allowBlank: true
							}]
						},{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Tomador',
								name: 'cte_tomador',
								value: 0,
								options: [{
									id: 0,
									field: '1. Remetente'
								},{
									id: 1,
									field: '4. Expedidor'
								},{
									id: 2,
									field: '5. Recebedor'
								},{
									id: 3,
									field: '2. Destinatário'
								},{
									id: 4,
									field: '3. Outros'
								}],
								listeners: {
									beforeselect: function(field, record) {
										var form = me.getForm(), val = record.get('id'),
										rem = form.findField('cte_remetente').getValue(),
										exp = form.findField('cte_expedidor').getValue(),
										rec = form.findField('cte_recebedor').getValue(),
										des = form.findField('cte_destinatario').getValue();
										if (rem != 1 && val == 0) {
											return false;
										} else if (exp != 1 && val == 1) {
											return false;
										} else if (rec != 1 && val == 2) {
											return false;
										} else if (des != 1 && val == 3) {
											return false;
										}
									},
									select: function(field, records) {
										var record = records[0], form = me.getForm(),
										f1 = form.findField('clie_tomador_id'),
										f2 = form.findField('tom_cnpj_cpf'),
										f3 = form.findField('tom_cid_municipio'),
										f4 = form.findField('tom_cid_uf'),
										f5 = form.findField('tom_cid_sigla'),
										f6 = form.findField('tom_cid_nome_aeroporto'),
										disabled = record.get('id') != 4;
										if (disabled) {
											f1.reset();
											f2.reset();
											f3.reset();
											f4.reset();
											f5.reset();
											f6.reset();
										}
										f1.setDisabled(disabled);
										f2.setDisabled(disabled);
										f3.setDisabled(disabled);
										f4.setDisabled(disabled);
										f5.setDisabled(disabled);
										f6.setDisabled(disabled);
										
										var field = null;
										switch (record.get('id')) {
											case 0: field = 'clie_remetente_id'; break;
											case 1: field = 'clie_expedidor_id'; break;
											case 2: field = 'clie_recebedor_id'; break;
											case 3: field = 'clie_destinatario_id'; break;
										}
										if (!Ext.isEmpty(field)) {
											var combo = form.findField(field),
											data = combo.getStore().findRecord('clie_id', combo.getValue());
											if (!Ext.isEmpty(data)) {
												me.tomador = data.data;
												me.tomTabela = data.get('clie_tom_tabela');
												me.buscarTabela({
													tabela: data.get('clie_tom_tabela'),
													clie_id: data.get('clie_id'),
													cid_id_origem: form.findField('cid_id_origem').getValue(),
													cid_id_destino: form.findField('cid_id_destino').getValue(),
													peso_taxado: form.findField('cte_peso_bc').getValue()
												});
												me.handlerCTESub(data.get('clie_contrib_icms'));
												
												var prodField = form.findField('prod_id'), prodStore = prodField.getStore();
												prodStore.getProxy().setExtraParam('clie_id', data.get('clie_id'));
												prodStore.load();
												
												var redespachoField = form.findField('redespacho_id'),
												redespachoStore = redespachoField.getStore(),
												redespachoProxy = redespachoStore.getProxy();
												redespachoProxy.setExtraParam('clie_id', data.get('clie_id'));
												redespachoStore.load({
													callback: function() {
														var max = redespachoStore.max('red_id', false);
														max = parseInt(max);
														if (max > 0) {
															var result = redespachoStore.findRecord('red_id', max);
															if (result) {
																redespachoField.setValue(result.get('red_id'));
															}
														}
													}
												});
											}
										}
									}
								}
							},{
								flex: 2,
								xtype: 'clientecombo',
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'clie_tomador_id',
								disabled: true,
								fireSelectEventOnValue: true,
								extraParams: {
									clie_ativo: 1
								},
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm();
										form.findField('tom_cid_uf').setValue(record.get('cid_uf'));
										form.findField('tom_cid_municipio').setValue(record.get('cid_municipio'));
										form.findField('tom_cid_sigla').setValue(record.get('cid_sigla'));
										form.findField('tom_cid_nome_aeroporto').setValue(record.get('cid_nome_aeroporto'));
										form.findField('tom_cnpj_cpf').setValue(Ext.isEmpty(record.get('clie_cnpj')) ? record.get('clie_cpf') : record.get('clie_cnpj'));
										
										me.tomador = record.data;
										me.tomTabela = record.get('clie_tom_tabela');
										me.buscarTabela({
											tabela: record.get('clie_tom_tabela'),
											clie_id: record.get('clie_id'),
											cid_id_origem: form.findField('cid_id_origem').getValue(),
											cid_id_destino: form.findField('cid_id_destino').getValue(),
											peso_taxado: form.findField('cte_peso_bc').getValue()
										});
										me.handlerCTESub(record.get('clie_contrib_icms'));
										
										var prodField = form.findField('prod_id'), prodStore = prodField.getStore();
										prodStore.getProxy().setExtraParam('clie_id', record.get('clie_id'));
										prodStore.load();
										
										var combo1 = form.findField('redespacho_id'),
										store1 = combo1.getStore(),
										proxy1 = store1.getProxy();
										proxy1.setExtraParam('clie_id', record.get('clie_id'));
										store1.load({
											callback: function() {
												var max = store1.max('red_id', false);
												max = parseInt(max);
												if (max > 0) {
													var data = store1.findRecord('red_id', max);
													if (data) {
														combo1.setValue(data.get('red_id'));
														me.buscarTabela({
															tabela: me.tomTabela,
															clie_id: me.tomador.clie_id,
															cid_id_destino: data.get('cid_id_passagem'),
															cid_id_origem: form.findField('cid_id_origem').getValue(),
															peso_taxado: form.findField('cte_peso_bc').getValue()
														});
														form.findField('cid_id_passagem').setValue(data.get('cid_id_passagem'));
													}
												}
											}
										});
									}
								}
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'tom_cnpj_cpf',
								disabled: true,
								readOnly: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'tom_cid_municipio',
								disabled: true,
								readOnly: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'tom_cid_uf',
								flex: null,
								width: 50,
								disabled: true,
								readOnly: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'tom_cid_sigla',
								flex: null,
								width: 50,
								disabled: true,
								readOnly: true,
								allowBlank: true
							},{
								fieldLabel: '&nbsp;',
								labelSeparator: '',
								name: 'tom_cid_nome_aeroporto',
								disabled: true,
								readOnly: true,
								allowBlank: true
							}]
						}]
					},{
						title: 'Dados de Retirada',
						items: [{
							items: [{
								xtype: 'radiogroup',
								fieldLabel: 'Recebedor retira no Aeroporto, Filial, Porto ou Estação de Destino',
								labelSeparator: '?',
								height: 50,
								defaults: {
									name: 'cte_retira',
									checked: false
								},
								items: [{
									boxLabel: 'Sim',
									inputValue: 1
								},{
									boxLabel: 'Não',
									inputValue: 0,
									checked: true,
									listeners: {
										change: function(field, checked) {
											var form = me.getForm(),
											f1 = form.findField('cte_detalhe_retira');
											if (checked) {
												f1.reset();
											}
											f1.setDisabled(checked);
										}
									}
								}]
							},{
								fieldLabel: 'Detalhes (160 caracteres)',
								name: 'cte_detalhe_retira',
								flex: 2,
								disabled: true,
								allowBlank: true,
								maxLength: 160
							}]
						},{
							items: [{
								xtype: 'cidadecombo',
								fieldLabel: 'Cidade de Entrega (etiqueta)',
								name: 'cid_id_etiqueta_entrega',
								allowBlank: true
							},{
								fieldLabel: 'Endereço de Entrega (etiqueta)',
								name: 'cte_endereco_etiqueta_entrega',
								flex: 2,
								allowBlank: true,
								maxLength: 70
							}]
						}]
					},{
						title: 'Informações do CT-e',
						items: [{
							items: [{
								fieldLabel: 'Modelo',
								name: 'cte_modelo',
								flex: null,
								width: 50,
								readOnly: true,
								value: App.empresa.emp_cte_modelo
							},{
								fieldLabel: 'Série',
								name: 'cte_serie',
								flex: null,
								width: 50,
								readOnly: true,
								value: App.empresa.emp_cte_serie
							},{
								fieldLabel: 'Número',
								name: 'cte_numero',
								readOnly: true,
								value: '(aguardando alteração)'
							},{
								xtype: 'datefield',
								fieldLabel: 'Data da emissão',
								name: 'cte_data_emissao',
								format: 'd/m/Y',
								value: new Date(),
								//maxValue: new Date(),
								listeners: {
									change: function(field, newValue, oldValue) {
										if (!Ext.isEmpty(newValue)) {
											var form = me.getForm(), newDate = Ext.Date.add(newValue, Ext.Date.DAY, 1),
											f1 = form.findField('cte_data_programada'),
											f2 = form.findField('cte_data_inicial');
											
											f1.reset();
											f1.setMinValue(newDate);
											
											f2.reset();
											f2.setMinValue(newDate);
										}
									}
								}
							},{
								xtype: 'timefield',
								fieldLabel: 'Hora da emissão',
								name: 'cte_hora_emissao',
								format: 'H:i:s',
								value: new Date()
							},{
								fieldLabel: 'CFOP',
								name: 'cte_cfop',
								flex: null,
								width: 80,
								value: '(aguardando alteração)',
								readOnly: true
							},{
								fieldLabel: 'Natureza da Operação',
								name: 'cte_natureza_operacao',
								flex: 2,
								value: '(aguardando alteração)',
								readOnly: true
							},{
								xtype: 'intfield',
								fieldLabel: 'Minuta/Ordem Coleta',
								name: 'cte_minuta',
								allowBlank: true,
								maxValue: 99999999
							}]
						},{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Modal',
								name: 'cte_modal',
								value: ((App.empresa.emp_modal == 'Aereo') ? 2 : ((App.empresa.emp_modal == 'Rodoviario') ? 1 : 6)),
								readOnly: App.empresa.emp_modal == 'Aereo' || App.empresa.emp_modal == 'Rodoviario',
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [{
									id: 1,
									field: 'Rodoviário'
								},{
									id: 2,
									field: 'Aéreo'
								},{
									id: 3,
									field: 'Aquaviário'
								},{
									id: 4,
									field: 'Ferroviário'
								},{
									id: 5,
									field: 'Dutoviário'
								},{
									id: 6,
									field: 'Multimodal'
								}],
								listeners: {
									select: function(field, records) {
										var record = records[0], tp = me.down('tabpanel');
										tp.down('#cte-aereo-tab').tab.setVisible(record.get('id') == 2);
										tp.down('#cte-rodo1-tab').tab.setVisible(record.get('id') == 1);
										tp.down('#cte-rodo2-tab').tab.setVisible(record.get('id') == 1 && App.empresa.emp_aba_vale_pedagio);
										tp.down('#cte-rodo3-tab').tab.setVisible(record.get('id') == 1 && App.empresa.emp_aba_veiculos);
									}
								}
							},{
								xtype: 'localcombo',
								fieldLabel: 'Tipo de Serviço',
								name: 'cte_tipo_servico',
								value: 0,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [{
									id: 0,
									field: 'Normal'
								},{
									id: 1,
									field: 'Subcontratação'
								},{
									id: 2,
									field: 'Redespacho'
								},{
									id: 3,
									field: 'Redespacho Intermediário'
								},{
									id: 4,
									field: 'Serviço Vinculado à Multimodal'
								}],
								listeners: {
									beforeselect: function(field, record) {
										var form = me.getForm(),
										remField = form.findField('cte_remetente'),
										remValue = remField.getValue(),
										serValue = record.get('id');
										if (remValue == 2 && serValue != 3) {
											return false;
										} else if (remValue == 3 && serValue != 4) {
											return false;
										}
									}
								}
							},{
								xtype: 'localcombo',
								fieldLabel: 'Finalidade de Emissão',
								name: 'cte_tipo_do_cte',
								value: 0,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [{
									id: 0,
									field: 'CT-e Normal'
								},{
									id: 1,
									field: 'CT-e de Complemento de Valores'
								},{
									id: 2,
									field: 'CT-e de Anulação'
								},{
									id: 3,
									field: 'CT-e Substituto'
								}],
								listeners: {
									beforeselect: function(field, record) {
										return record.get('id') < 2;
									},
									select: function(field, records) {
										var record = records[0], form = me.getForm(),
										f1 = form.findField('cte_forma_emissao'),
										f2 = form.findField('cte_chave_referenciado'),
										
										disabled = record.get('id') == 2;
										if (disabled) {
											f1.setValue(1);
										}
										f1.setReadOnly(disabled);
										
										if (record.get('id') == 0) {
											f2.reset();
											f2.clearInvalid();
											f2.setDisabled(true);
										} else {
											f2.setDisabled(false);
											f2.focus();
										}
										
										var tp = me.down('tabpanel'), enableID = record.get('id');
										tp.down('#cte-sub-tab').tab.setVisible(enableID == 3);
										tp.down('#cte-anu-tab').tab.setVisible(enableID == 1 || enableID == 2);
										
										f1 = form.findField('ctout_chave_cte_complemento');
										f2 = form.findField('ctout_chave_cte_anulacao');
										
										if (enableID != 1) {
											f1.reset();
											f1.clearInvalid();
										}
										f1.setDisabled(enableID != 1);
										
										if (enableID != 2) {
											f2.reset();
											f2.clearInvalid();
										}
										f2.setDisabled(enableID != 2);
									}
								}
							},{
								xtype: 'localcombo',
								fieldLabel: 'Forma de Emissão',
								name: 'cte_forma_emissao',
								value: 1,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [{
									id: 1,
									field: 'Normal'
								},{
									id: 5,
									field: 'Contingência FSDA'
								},{
									id: 7,
									field: 'Autorização pela SVC-RS'
								},{
									id: 8,
									field: 'Autorização pela SVC-SP'
								}],
								listeners: {
									beforeselect: function(field, record) {
										return record.get('id') == 1;
									}
								}
							},{
								xtype: 'localcombo',
								fieldLabel: 'Forma de Pagamento',
								name: 'cte_forma_pgto',
								value: 0,
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [{
									id: 0,
									field: 'Pago'
								},{
									id: 1,
									field: 'À Pagar'
								},{
									id: 2,
									field: 'Outros (definido pelo cliente tomador)'
								}],
								listeners: {
									beforeselect: function(field, record) {
										var form = me.getForm(), tomadorField, f1, f2, r1, r2;
										
										switch (form.findField('cte_tomador').getValue()) {
											case 0: tomadorField = 'clie_remetente_id'; break;
											case 1: tomadorField = 'clie_expedidor_id'; break;
											case 2: tomadorField = 'clie_recebedor_id'; break;
											case 3: tomadorField = 'clie_destinatario_id'; break;
										}
										
										f1 = form.findField(tomadorField);
										f2 = form.findField('clie_destinatario_id');
										r1 = f1.getStore().getById(f1.getValue());
										r2 = f2.getStore().getById(f2.getValue());
										
										if (f1.getValue() != f2.getValue()) {
											if (record.get('id') == 1) {
												return r1.get('clie_tom_aceita_frete_a_pagar') && r2.get('clie_des_aceita_frete_a_pagar');
											} else if (record.get('id') == 2) {
												return r1.get('clie_tom_aceita_frete_outros');
											}
										}
									}
								}
							}]
						},{
							items: [{
								xtype: 'combo',
								fieldLabel: 'Local de início da prestação',
								name: 'cid_id_origem',
								valueField: 'cid_id',
								displayField: 'cid_nome_completo',
								editable: false,
								store: Ext.create('Ext.data.Store', {
									model: 'Cidade.data.Model',
									autoLoad: false,
									remoteSort: false,
									proxy: {
										type: 'ajax',
										url: 'mod/conhecimentos/ctes/php/response.php',
										extraParams: {
											clie_id: 0,
											m: 'aeroporto_store'
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
										property: 'cid_nome_completo',
										direction: 'ASC'
									}],
									listeners: {
										beforeload: function() {
											return this.getProxy().extraParams.clie_id > 0;
										}
									}
								}),
								listConfig: {
									width: 500,
									minWidth: 500,
									resizable: true
								},
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm(), 
										cid_id_origem = record.get('cid_id');
										
										me.buscarTabela({
											tabela: me.tomTabela,
											clie_id: me.tomador.clie_id,
											cid_id_origem: cid_id_origem,
											cid_id_destino: form.findField('cid_id_destino').getValue(),
											peso_taxado: form.findField('cte_peso_bc').getValue()
										});
										
										var combo1 = form.findField('redespacho_id'),
										store1 = combo1.getStore(),
										proxy1 = store1.getProxy();
										proxy1.setExtraParam('cid_id_origem', cid_id_origem);
										proxy1.setExtraParam('cid_id_destino', form.findField('cid_id_destino').getValue());
										store1.load({
											callback: function() {
												var max = store1.max('red_id', false);
												max = parseInt(max);
												if (max > 0) {
													var data = store1.findRecord('red_id', max);
													if (data) {
														combo1.setValue(data.get('red_id'));
														me.buscarTabela({
															tabela: me.tomTabela,
															clie_id: me.tomador.clie_id,
															cid_id_destino: data.get('cid_id_passagem'),
															cid_id_origem: cid_id_origem,
															peso_taxado: form.findField('cte_peso_bc').getValue()
														});
														form.findField('cid_id_passagem').setValue(data.get('cid_id_passagem'));
													}
												}
											}
										});
										
										var prodField = form.findField('prod_id'), prodStore = prodField.getStore();
										prodStore.getProxy().setExtraParam('clie_id', me.tomador.clie_id);
										prodStore.load();
									}
								}
							},{
								xtype: 'combo',
								fieldLabel: 'Local de término da prestação',
								name: 'cid_id_destino',
								valueField: 'cid_id',
								displayField: 'cid_nome_completo',
								editable: false,
								store: Ext.create('Ext.data.Store', {
									model: 'Cidade.data.Model',
									autoLoad: false,
									remoteSort: false,
									proxy: {
										type: 'ajax',
										url: 'mod/conhecimentos/ctes/php/response.php',
										extraParams: {
											clie_id: 0,
											m: 'aeroporto_store'
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
										property: 'cid_nome_completo',
										direction: 'ASC'
									}],
									listeners: {
										beforeload: function() {
											return this.getProxy().extraParams.clie_id > 0;
										}
									}
								}),
								listConfig: {
									width: 500,
									minWidth: 500,
									resizable: true
								},
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm(), 
										cid_id_destino = record.get('cid_id');
										
										me.buscarTabela({
											tabela: me.tomTabela,
											clie_id: me.tomador.clie_id,
											cid_id_destino: cid_id_destino,
											cid_id_origem: form.findField('cid_id_origem').getValue(),
											peso_taxado: form.findField('cte_peso_bc').getValue()
										});
										
										var grid2 = me.down('#cte-local-passagem-grid'), 
										store2 = grid2.getStore(),
										proxy2 = store2.getProxy();
										proxy2.setExtraParam('cid_id', cid_id_destino);
										store2.load();
										
										var combo1 = form.findField('redespacho_id'),
										store1 = combo1.getStore(),
										proxy1 = store1.getProxy();
										proxy1.setExtraParam('cid_id_destino', cid_id_destino);
										proxy1.setExtraParam('cid_id_origem', form.findField('cid_id_origem').getValue());
										store1.load({
											callback: function() {
												var max = store1.max('red_id', false);
												max = parseInt(max);
												if (max > 0) {
													var data = store1.findRecord('red_id', max);
													if (data) {
														combo1.setValue(data.get('red_id'));
														me.buscarTabela({
															tabela: me.tomTabela,
															clie_id: me.tomador.clie_id,
															cid_id_destino: data.get('cid_id_passagem'),
															cid_id_origem: form.findField('cid_id_origem').getValue(),
															peso_taxado: form.findField('cte_peso_bc').getValue()
														});
														form.findField('cid_id_passagem').setValue(data.get('cid_id_passagem'));
													}
												}
											}
										});
										
										var prodField = form.findField('prod_id'), prodStore = prodField.getStore();
										prodStore.getProxy().setExtraParam('clie_id', me.tomador.clie_id);
										prodStore.load();
										
										
										var combo2 = form.findField('clie_representante_id'),
										store2 = combo2.getStore(),
										proxy2 = store2.getProxy();
										proxy2.setExtraParam('cid_id_destino', cid_id_destino);
										store2.load();
									}
								}
							},{
								xtype: 'clientecombo',
								fieldLabel: 'Representante',
								name: 'clie_representante_id',
								allowBlank: true,
								showTrigger: true,
								extraParams: {
									clie_ativo: 1,
									clie_categoria: 5
								}
							}]
						},{
							items: [{
								xtype: 'combo',
								fieldLabel: 'Local de Passagem (VIA)',
								name: 'redespacho_id',
								valueField: 'red_id',
								displayField: 'cid_passagem_nome',
								editable: false,
								allowBlank: true,
								fireSelectEventOnValue: true,
								store: Ext.create('Ext.data.Store', {
									model: 'Taxa.Redespacho.data.Model',
									autoLoad: false,
									remoteSort: false,
									proxy: {
										type: 'ajax',
										url: 'mod/conhecimentos/ctes/php/response.php',
										extraParams: {
											clie_id: 0,
											cid_id_origem: 0,
											cid_id_destino: 0,
											m: 'redespacho_store'
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
										property: 'cid_passagem_nome',
										direction: 'ASC'
									}],
									listeners: {
										beforeload: function() {
											var params = this.getProxy().extraParams;
											return params.cid_id_origem > 0 && params.cid_id_destino > 0;
										}
									}
								}),
								listConfig: {
									width: 500,
									minWidth: 500,
									resizable: true,
									getInnerTpl: function() {
										return '{cid_passagem_nome}<br/><small><tpl if="red_nota">{red_nota}<br/></tpl>Cálculo: <tpl if="red_por_peso">Por peso<tpl else>Por CT-e</tpl> | Valor: {[Ext.util.Format.brMoney(values.red_valor)]} | Peso até: {red_ate_kg}kg | Excedente: {[Ext.util.Format.brMoney(values.red_excedente)]}/kg</small>';
									}
								},
								listeners: {
									select: function(field, records) {
										var form = me.getForm(), record = records[0];
										me.buscarTabela({
											tabela: me.tomTabela,
											clie_id: me.tomador ? me.tomador.clie_id : form.findField('clie_remetente_id').getValue(),
											cid_id_destino: record.get('cid_id_passagem'),
											cid_id_origem: form.findField('cid_id_origem').getValue(),
											peso_taxado: form.findField('cte_peso_bc').getValue()
										});
										form.findField('cid_id_passagem').setValue(record.get('cid_id_passagem'));
									}
								}
							},{
								xtype: 'hiddenfield',
								name: 'cid_id_passagem',
								width: 0,
								value: 0,
								flex: null,
								hideLabel: true,
								allowBlank: true
							},{
								fieldLabel: 'Chave de Acesso do CT-e referenciado',
								name: 'cte_chave_referenciado',
								disabled: true,
								allowBlank: true
							}]
						}]
					}]
				},{
					title: '2. Dados Complementares',
					bodyPadding: 10,
					autoScroll: true,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						collapsible: false,
						defaults: {
							hideLabel: true,
							labelAlign: 'top',
							anchor: '100%',
							layout: {
								type: 'hbox',
								defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
							},
							defaults: {
								flex: 1,
								labelAlign: 'top',
								allowBlank: true,
								selectOnFocus: true
							},
							defaultType: 'textfield'
						},
						defaultType: 'fieldcontainer'
					},
					defaultType: 'fieldset',
					items: [{
						title: 'Característica',
						items: [{
							items: [{
								fieldLabel: 'Característica adicional do transporte (REENTREGA; DEVOLUÇÃO; e etc...)',
								name: 'cte_carac_adic_transp',
								allowBlank: true,
								maxLength: 15
							},{
								fieldLabel: 'Característica adicional do serviço (TEXTO LIVRE: ENTREGA EXPRESSA; LOGÍSTICA)',
								name: 'cte_carac_adic_servico',
								allowBlank: true,
								maxLength: 30
							},{
								fieldLabel: 'Funcionário emissor do CT-e',
								name: 'cte_emissor',
								readOnly: true,
								value: App.usuario.user_login
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-local-passagem-grid',
						title: 'Previsão de Fluxo de Carga',
						height: 200,
						defaults: null,
						store: Ext.create('Ext.data.JsonStore', {
							fields: [
								{name:'cid_id', type:'int'},
								{name:'loc_id', type:'int'},
								{name:'loc_passagem', type:'string', defaultValue:''}
							],
							autoLoad: false,
							autoDestroy: true,
							remoteSort: false,
							remoteGroup: false,
							remoteFilter: false,
							
							proxy: {
								type: 'ajax',
								url: 'mod/cadastros/cidades/php/response.php',
								filterParam: 'query',
								extraParams: {
									m: 'read_passagens',
									cid_id: 0
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
								property: 'loc_passagem',
								direction: 'ASC'
							}],
							
							listeners: {
								beforeload: function() {
									return this.getProxy().extraParams.cid_id > 0;
								}
							}
						}),
						columns: [{
							dataIndex: 'loc_passagem',
							text: 'Passagem',
							align: 'center',
							menuDisabled: true,
							flex: 1
						}],
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: ['Código da rota de entrega:',{
								xtype: 'tbspacer'
							},{
								xtype: 'rotaentregacombo',
								valueField: 'rota_codigo',
								displayField: 'rota_codigo',
								name: 'cte_codigo_rota',
								allowBlank: true,
								width: 200
							}]
						}]
					},{
						title: 'Previsão de Entrega',
						items: [{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Previsão de Data',
								name: 'cte_tp_data_entrega',
								value: 0,
								options: [{
									id: 0,
									field: 'Sem data definida'
								},{
									id: 1,
									field: 'Na data'
								},{
									id: 2,
									field: 'Até a data'
								},{
									id: 3,
									field: 'A partir da data'
								},{
									id: 4,
									field: 'No período'
								}],
								listeners: {
									change: function(field, newValue, oldValue) {
										var form = me.getForm(),
										f1 = form.findField('cte_data_programada'),
										f2 = form.findField('cte_data_inicial'),
										f3 = form.findField('cte_data_final');
										switch (newValue) {
											case 1: case 2: case 3:
												f1.setDisabled(false);
												f2.reset();
												f2.clearInvalid();
												f2.setDisabled(true);
												f3.reset();
												f3.clearInvalid();
												f3.setDisabled(true);
											break;
											case 4:
												f1.reset();
												f1.clearInvalid();
												f1.setDisabled(true);
												f2.setDisabled(false);
												f3.setDisabled(false);
											break;
											default:
												f1.reset();
												f1.clearInvalid();
												f1.setDisabled(true);
												f2.reset();
												f2.clearInvalid();
												f2.setDisabled(true);
												f3.reset();
												f3.clearInvalid();
												f3.setDisabled(true);
											break;
										}
									}
								}
							},{
								xtype: 'datefield',
								format: 'd/m/Y',
								fieldLabel: 'Data',
								name: 'cte_data_programada',
								disabled: true,
								//minValue:  Ext.Date.add(new Date(), Ext.Date.DAY, 1),
								listeners: {
									change: function(field, newValue, oldValue) {
										me.getForm().findField('cte_data_entrega_prevista').setValue(newValue);
									}
								}
							},{
								xtype: 'datefield',
								format: 'd/m/Y',
								fieldLabel: 'Data inicial',
								name: 'cte_data_inicial',
								disabled: true,
								//minValue:  Ext.Date.add(new Date(), Ext.Date.DAY, 1),
								listeners: {
									change: function(field, newValue, oldValue) {
										if (!Ext.isEmpty(newValue)) {
											var form = me.getForm(),
											endField = form.findField('cte_data_final');
											//endField.setMinValue(Ext.Date.add(newValue, Ext.Date.DAY, 1));
											endField.isValid();
											me.getForm().findField('cte_data_entrega_prevista').setValue(newValue);
										}
									}
								}
							},{
								xtype: 'datefield',
								format: 'd/m/Y',
								fieldLabel: 'Data final',
								name: 'cte_data_final',
								disabled: true,
								listeners: {
									change: function(field, newValue, oldValue) {
										if (!Ext.isEmpty(newValue)) {
											var form = me.getForm(),
											startField = form.findField('cte_data_inicial');
											//startField.setMaxValue(Ext.Date.add(newValue, Ext.Date.DAY, -1));
											startField.isValid();
										}
									}
								}
							}]
						},{
							items: [{
								xtype: 'localcombo',
								fieldLabel: 'Previsão de Hora',
								name: 'cte_tp_hora_entrega',
								value: 0,
								options: [{
									id: 0,
									field: 'Sem hora definida'
								},{
									id: 1,
									field: 'Na hora'
								},{
									id: 2,
									field: 'Até a hora'
								},{
									id: 3,
									field: 'A partir da hora'
								},{
									id: 4,
									field: 'No intervalo de tempo'
								}],
								listeners: {
									change: function(field, newValue, oldValue) {
										var form = me.getForm(),
										f1 = form.findField('cte_hora_programada'),
										f2 = form.findField('cte_hora_inicial'),
										f3 = form.findField('cte_hora_final');
										switch (newValue) {
											case 1: case 2: case 3:
												f1.setDisabled(false);
												f2.reset();
												f2.clearInvalid();
												f2.setDisabled(true);
												f3.reset();
												f3.clearInvalid();
												f3.setDisabled(true);
											break;
											case 4:
												f1.reset();
												f1.clearInvalid();
												f1.setDisabled(true);
												f2.setDisabled(false);
												f3.setDisabled(false);
											break;
											default:
												f1.reset();
												f1.clearInvalid();
												f1.setDisabled(true);
												f2.reset();
												f2.clearInvalid();
												f2.setDisabled(true);
												f3.reset();
												f3.clearInvalid();
												f3.setDisabled(true);
											break;
										}
									}
								}
							},{
								xtype: 'timefield',
								format: 'H:i:s',
								fieldLabel: 'Hora',
								name: 'cte_hora_programada',
								disabled: true
							},{
								xtype: 'timefield',
								format: 'H:i:s',
								fieldLabel: 'Hora inicial',
								name: 'cte_hora_inicial',
								disabled: true
							},{
								xtype: 'timefield',
								format: 'H:i:s',
								fieldLabel: 'Hora final',
								name: 'cte_hora_final',
								disabled: true
							}]
						}]
					}]
				},{
					title: '3. Inf. Documentos',
					tooltip: 'Informações de Documentos',
					bodyPadding: 10,
					autoScroll: true,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						collapsible: false,
						defaults: {
							hideLabel: true,
							labelAlign: 'top',
							anchor: '100%',
							layout: {
								type: 'hbox',
								defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
							},
							defaults: {
								flex: 1,
								labelAlign: 'top',
								allowBlank: true,
								selectOnFocus: true
							},
							defaultType: 'textfield'
						},
						defaultType: 'fieldcontainer'
					},
					defaultType: 'fieldset',
					items: [{
						title: 'Escolha um dos tipos de documentos',
						items: [{
							items: [{
								xtype: 'radiofield',
								boxLabel: 'Notas Fiscais (eletrônica)',
								name: 'cte_tipo_doc_anexo',
								inputValue: 2,
								checked: true,
								listeners: {
									change: function(field, checked) {
										var grid = me.down('#cte-doc-nfe-grid');
										grid.setDisabled(!checked);
										if (!checked) {
											grid.getStore().removeAll();
										}
									}
								}
							},{
								xtype: 'radiofield',
								boxLabel: 'Notas Fiscais (papel)',
								name: 'cte_tipo_doc_anexo',
								inputValue: 1,
								checked: false,
								listeners: {
									change: function(field, checked) {
										var grid = me.down('#cte-doc-nf-grid');
										grid.setDisabled(!checked);
										if (!checked) {
											grid.getStore().removeAll();
										}
									}
								}
							},{
								xtype: 'radiofield',
								boxLabel: 'Outros documentos',
								name: 'cte_tipo_doc_anexo',
								inputValue: 3,
								checked: false,
								listeners: {
									change: function(field, checked) {
										var grid = me.down('#cte-doc-outros-grid');
										grid.setDisabled(!checked);
										if (!checked) {
											grid.getStore().removeAll();
										}
									}
								}
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-doc-nfe-grid',
						title: 'Remetente -> NF-e',
						height: 300,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						store: NFeStore,
						plugins: NFeEditor,
						features: [{
							ftype: 'groupingsummary',
							groupHeaderTpl: 'Documentos',
							enableNoGroups: false,
							enableGroupingMenu: false
						}],
						columns: [{
							dataIndex: 'cte_doc_chave_nfe',
							text: 'Chave de Acesso',
							tooltip: 'Chave de acesso da NF-e',
							menuDisabled: true,
							flex: 2,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 44
							}
						},{
							dataIndex: 'cte_doc_pin',
							text: 'PIN',
							tooltip: 'PIN atribuído pela SUFRAMA para a operação',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 999999999
							}
						},{
							dataIndex: 'cte_doc_volumes',
							text: 'Volumes',
							tooltip: 'Quantidade de Volumes',
							align: 'center',
							menuDisabled: true,
							flex: 1,
							summaryType: 'sum',
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 99999999
							}
						},{
							dataIndex: 'cte_doc_peso_total',
							text: 'Peso em KG',
							tooltip: 'Peso total em Kg: Informar para efeito de totalização',
							align: 'right',
							menuDisabled: true,
							flex: 1,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brFloat,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						},{
							dataIndex: 'cte_doc_valor_nota',
							text: 'Valor da Nota',
							tooltip: 'Valor total da Nota Fiscal',
							align: 'right',
							menuDisabled: true,
							flex: 1,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brMoney,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										NFeEditor.cancelEdit();
										NFeStore.insert(0, Ext.create('CTE.Documento.data.Model'));
										NFeEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									NFeEditor.cancelEdit();
									NFeStore.insert(0, Ext.create('CTE.Documento.data.Model'));
									NFeEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									NFeStore.remove(selections);
								}
							},'-',{
								text: 'Importar',
								iconCls: 'icon-file-xml',
								tooltip: 'Auto preenchimento da grade através da leitura da NF-e (XML)',
								handler: function() {
									var win = Ext.create('Ext.ux.Window', {
										ui: 'black-window-active',
										title: 'Importar NF-e somente arquivos XML',
										width: 350,
										height: 130,
										autoShow: true,
										maximizable: false,
										minimizable: false,
										resizable: false,
										closable: true,
										layout: 'fit',
										items: {
											xtype: 'form',
											bodyPadding: 5,
											defaults: {
												anchor: '100%',
												labelAlign: 'top',
												allowBlank: false,
												selectOnFocus: true
											},
											defaultType: 'filefield',
											items: [{
												fieldLabel: 'Selecione o arquivo xml',
												name: 'arquivos[]',
												buttonText: 'Buscar',
												emptyText: '(somente NF-e)',
												listeners: {
													afterrender:function(cmp){
														cmp.fileInputEl.set({
															accept: 'text/xml',
															multiple: 'multiple'
														});
													}
												}
											}],
											buttons: [{
												ui: 'green-button',
												text: 'IMPORTAR',
												formBind: true,
												handler: function(btn) {
													var form = this.up('form').getForm();
													if (!form.isValid()) {
														return false;
													}
													var originalText = btn.getText();
													btn.setText('IMPORTANDO...');
													btn.setDisabled(true);
													form.submit({
														clientValidation: true,
														url: 'mod/conhecimentos/ctes/php/response.php',
														method: 'post',
														params: {
															m: 'importar_nfe'
														},
														failure: Ext.Function.createSequence(App.formFailure, function() {
															btn.setDisabled(false);
															btn.setText(originalText);
														}),
														success: function(f, a) {
															//NFeStore.removeAll();
															NFeStore.add(a.result.records);
															win.close();
														}
													});
												}
											}]
										}
									});
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									NFeStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-doc-nf-grid',
						title: 'Remetente -> Nota fiscal',
						height: 300,
						disabled: true,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						store: NFStore,
						plugins: NFEditor,
						style: {
							marginTop: 20
						},
						features: [{
							ftype: 'groupingsummary',
							groupHeaderTpl: 'Documentos',
							enableNoGroups: false,
							enableGroupingMenu: false
						}],
						columns: [{
							dataIndex: 'cte_doc_serie',
							text: 'Série',
							tooltip: 'Série da Nota Fiscal (0 para série única)',
							menuDisabled: true,
							width: 70,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 999
							}
						},{
							dataIndex: 'cte_doc_numero',
							text: 'Número',
							tooltip: 'Número da Nota Fiscal',
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 20
							}
						},{
							xtype: 'datecolumn',
							dataIndex: 'cte_doc_data_emissao',
							text: 'Emitido em',
							tooltip: 'Data de emissão da Nota Fiscal',
							format: 'D d/m/Y',
							align: 'right',
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'datefield',
								format: 'd/m/Y',
								allowBlank: false,
								selectOnFocus: true
							}
						},{
							dataIndex: 'cte_doc_volumes',
							text: 'Volumes',
							tooltip: 'Quantidade de Volumes',
							align: 'center',
							menuDisabled: true,
							width: 80,
							summaryType: 'sum',
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 99999999
							}
						},{
							dataIndex: 'cte_doc_peso_total',
							text: 'Peso em KG',
							tooltip: 'Peso total em Kg: Informar para efeito de totalização',
							align: 'right',
							menuDisabled: true,
							width: 100,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brFloat,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						},{
							dataIndex: 'cte_doc_valor_produtos',
							text: 'Valor dos Produtos',
							tooltip: 'Valor total dos Produtos',
							align: 'right',
							menuDisabled: true,
							width: 120,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99 
							}
						},{
							dataIndex: 'cte_doc_valor_nota',
							text: 'Valor da Nota',
							tooltip: 'Valor total da Nota Fiscal',
							align: 'right',
							menuDisabled: true,
							width: 120,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brMoney,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						},{
							dataIndex: 'cte_doc_cfop',
							text: 'CFOP',
							tooltip: 'CFOP Predominante',
							align: 'center',
							menuDisabled: true,
							width: 70,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 9999
							}
						},{
							dataIndex: 'cte_doc_modelo',
							text: 'Modelo',
							tooltip: 'Modelo da Nota Fiscal',
							menuDisabled: true,
							width: 200,
							renderer: function(value, metaData, record) {
								if (value == 1) {
									return '01 - NF Modelo 01/1A e Avulsa';
								} else if (value == 4) {
									return '04 - NF de Produtor';
								}
							},
							editor: {
								xtype: 'localcombo',
								editable: false,
								allowBlank: false,
								options: [{
									id: 1,
									field: '01 - NF Modelo 01/1A e Avulsa'
								},{
									id: 4,
									field: '04 - NF de Produtor'
								}],
								listConfig: {
									resizable: true,
									minWidth: 300
								}
							}
						},{
							dataIndex: 'cte_doc_bc_icms',
							text: 'BC ICMS',
							tooltip: 'Base de Cálculo do ICMS',
							align: 'right',
							menuDisabled: true,
							width: 100,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						},{
							dataIndex: 'cte_doc_valor_icms',
							text: 'Valor do ICMS',
							tooltip: 'Valor total do ICMS',
							align: 'right',
							menuDisabled: true,
							width: 120,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						},{
							dataIndex: 'cte_doc_bc_icms_st',
							text: 'BASE ICMS ST',
							tooltip: 'Valor da Base de Cálculo do ICMS ST',
							align: 'right',
							menuDisabled: true,
							width: 100,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						},{
							dataIndex: 'cte_doc_valor_icms_st',
							text: 'Valor ICMS ST',
							tooltip: 'Valor Total do ICMS ST',
							align: 'right',
							menuDisabled: true,
							width: 120,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										NFEditor.cancelEdit();
										NFStore.insert(0, Ext.create('CTE.Documento.data.Model'));
										NFEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									NFEditor.cancelEdit();
									NFStore.insert(0, Ext.create('CTE.Documento.data.Model'));
									NFEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									NFStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									NFStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-doc-outros-grid',
						title: 'Remetente -> Outros Documentos',
						height: 300,
						disabled: true,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						store: NFOutrosStore,
						plugins: NFOutrosEditor,
						features: [{
							ftype: 'groupingsummary',
							groupHeaderTpl: 'Documentos',
							enableNoGroups: false,
							enableGroupingMenu: false
						}],
						style: {
							marginTop: 20
						},
						columns: [{
							dataIndex: 'cte_doc_tipo_doc',
							text: 'Tipo Documento',
							tooltip: 'Tipo de documento originário',
							menuDisabled: true,
							flex: 1,
							renderer: function(value, metaData, record) {
								if (value == 0) {
									return '00 - Declaração';
								} else if (value == 99) {
									return '99 - Outros';
								}
							},
							editor: {
								xtype: 'localcombo',
								options: [{
									id: 0,
									field: '00 - Declaração'
								},{
									id: 99,
									field: '99 - Outros'
								}],
								listConfig: {
									resizable: true,
									minWidth: 300
								}
							}
						},{
							dataIndex: 'cte_doc_numero',
							text: 'Número do Documento',
							tooltip: 'Número do Documento (Declaração/Outros)',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 20
							}
						},{
							xtype: 'datecolumn',
							dataIndex: 'cte_doc_data_emissao',
							text: 'Emitido em',
							tooltip: 'Data de emissão da Nota Fiscal',
							format: 'D d/m/Y',
							align: 'right',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'datefield',
								format: 'd/m/Y',
								allowBlank: false,
								selectOnFocus: true
							}
						},{
							dataIndex: 'cte_doc_descricao',
							text: 'Descrição',
							tooltip: 'Declaração/Descrição da mercadoria',
							flex: 2,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 60
							}
						},{
							dataIndex: 'cte_doc_volumes',
							text: 'Volumes',
							tooltip: 'Quantidade de Volumes',
							align: 'center',
							menuDisabled: true,
							flex: 1,
							summaryType: 'sum',
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 99999999
							}
						},{
							dataIndex: 'cte_doc_valor_nota',
							text: 'Valor do Documento',
							tooltip: 'Valor total do Documento',
							align: 'right',
							menuDisabled: true,
							flex: 1,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brMoney,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										NFOutrosEditor.cancelEdit();
										NFOutrosStore.insert(0, Ext.create('CTE.Documento.data.Model'));
										NFOutrosEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									NFOutrosEditor.cancelEdit();
									NFOutrosStore.insert(0, Ext.create('CTE.Documento.data.Model'));
									NFOutrosEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									NFOutrosStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									NFOutrosStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					}]
				},{
					title: '4. Inf. da Carga',
					tooltip: 'Informações da Carga',
					bodyPadding: 10,
					autoScroll: true,
					layout: 'anchor',
					listeners: {
						activate: Ext.Function.createSequence(me.onDefaultActivate, function() {
							if (!me.preencherSeguroBtnClicked) {
								me.down('tabpanel').down('#cte-info-seguro-grid').down('#preencher-seguro-btn').click();
								me.preencherSeguroBtnClicked = true;
							}
						})
					},
					defaults: {
						anchor: '100%',
						collapsible: false,
						defaults: {
							hideLabel: true,
							labelAlign: 'top',
							anchor: '100%',
							layout: {
								type: 'hbox',
								defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
							},
							defaults: {
								flex: 1,
								labelAlign: 'top',
								allowBlank: true,
								selectOnFocus: true
							},
							defaultType: 'textfield'
						},
						defaultType: 'fieldcontainer'
					},
					defaultType: 'fieldset',
					items: [{
						title: 'Informação da Carga',
						items: [{
							items: [{
								xtype: 'textfield',
								fieldLabel: 'Valor da Carga',
								name: 'cte_valor_carga_rotulo',
								readOnly: true,
								fieldStyle: {
									textAlign: 'right'
								}
							},{
								xtype: 'hiddenfield',
								name: 'cte_valor_carga',
								width: 0,
								value: 0,
								flex: null,
								hideLabel: true,
								allowBlank: true
							},{
								xtype: 'produtocombo',
								fieldLabel: 'Produto Predominante',
								name: 'prod_id',
								allowBlank: true,
								hideTrigger: false,
								fireSelectEventOnValue: true,
								listeners: {
									select: function(field, records) {
										var record = records[0], form = me.getForm();
										form.findField('gt_rotulo').setValue(record.get('gt_id_codigo') + ' - ' + record.get('gt_descricao'));
									}
								}
							},{
								xtype: 'hiddenfield',
								name: 'cte_peso_bc',
								flex: null,
								width: 0,
								value: 0,
								allowBlank: true
							},{
								fieldLabel: 'Outras Características do Produto',
								name: 'cte_outras_carac_carga',
								allowBlank: true,
								maxLength: 30
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-cubagem-grid',
						title: 'Quantidades da Carga e Dimensões/Cubagem',
						height: 300,
						store: CubagemStore,
						plugins: CubagemEditor,
						features: [{
							ftype: 'groupingsummary',
							groupHeaderTpl: 'Cargas',
							enableNoGroups: false,
							enableGroupingMenu: false
						}],
						enableColumnMove: false,
						enableColumnHide: false,
						columns: [{
							dataIndex: 'cte_dim_tipo_embalagem',
							text: 'Embalagem',
							tooltip: 'Tipo da embalegem para cálculo da cubagem',
							width: 100,
							menuDisabled: true,
							editor: {
								xtype: 'localcombo',
								options: ['QUADRADA','CILINDRICA']
							}
						},{
							dataIndex: 'cte_dim_volumes',
							text: 'Volumes',
							tooltip: 'Quantide total de cada tipo de mercadoria distinta de dimensões e peso',
							align: 'center',
							width: 100,
							menuDisabled: true,
							summaryType: 'sum',
							editor: {
								xtype: 'intfield',
								allowBlank: true,
								selectOnFocus: true,
								minValue: 0,
								maxValue: 9999999
							}
						},{
							dataIndex: 'cte_dim_peso_bruto',
							text: 'Peso Bruto (kg)',
							tooltip: 'Peso total da carga em kg distinta de dimensões e peso',
							align: 'right',
							flex: 1,
							menuDisabled: true,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brFloat,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								allowBlank: false,
								selectOnFocus: true,
								decimalPrecision: 4,
								minValue: 0,
								maxValue: 9999999.9999
							}
						},{
							dataIndex: 'cte_dim_cumprimento',
							text: 'Cumprimento (m)',
							tooltip: 'Cumprimento ou Profundidade em metros',
							align: 'right',
							flex: 1,
							menuDisabled: true,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								allowBlank: true,
								selectOnFocus: true,
								decimalPrecision: 3,
								minValue: 0,
								maxValue: 9999.999
							}
						},{
							dataIndex: 'cte_dim_altura',
							text: 'Altura (m)',
							tooltip: 'Altura ou Diâmetro em metros',
							align: 'right',
							flex: 1,
							menuDisabled: true,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								allowBlank: true,
								selectOnFocus: true,
								decimalPrecision: 3,
								minValue: 0,
								maxValue: 9999.999
							}
						},{
							dataIndex: 'cte_dim_largura',
							text: 'Largura (m)',
							tooltip: 'Largura em metros',
							align: 'right',
							flex: 1,
							menuDisabled: true,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								allowBlank: true,
								selectOnFocus: true,
								decimalPrecision: 3,
								minValue: 0,
								maxValue: 9999.999
							}
						},{
							dataIndex: 'cte_dim_cubagem_m3',
							text: 'Cubagem (m³)',
							tooltip: 'Quantidade total da cubagem de cada carga',
							align: 'right',
							flex: 1,
							menuDisabled: true,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brFloat,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								allowBlank: true,
								selectOnFocus: true,
								decimalPrecision: 4,
								minValue: 0,
								maxValue: 9999999.9999
							}
						},{
							dataIndex: 'cte_dim_peso_cubado',
							text: 'Peso Cubado (kg)',
							tooltip: 'Peso total cubado',
							align: 'right',
							flex: 1,
							menuDisabled: true,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brFloat,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								allowBlank: true,
								selectOnFocus: true,
								decimalPrecision: 4,
								minValue: 0,
								maxValue: 9999999.9999
							}
						},{
							dataIndex: 'cte_dim_peso_taxado',
							text: 'Peso taxado (kg)',
							tooltip: 'Peso total taxado',
							align: 'right',
							flex: 1,
							menuDisabled: true,
							summaryType: 'sum',
							summaryRenderer: Ext.util.Format.brFloat,
							renderer: Ext.util.Format.brFloat,
							editor: {
								xtype: 'decimalfield',
								allowBlank: true,
								selectOnFocus: true,
								decimalPrecision: 4,
								minValue: 0,
								maxValue: 9999999.9999
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										var volume = 0, peso = 0, totais = me.totalizarDocumentos();
										CubagemStore.each(function(r) {
											peso += r.get('cte_dim_peso_taxado');
											volume += r.get('cte_dim_volumes');
										});
										if (volume < totais.volumes && peso < totais.peso) {
											CubagemEditor.cancelEdit();
											CubagemStore.insert(0, Ext.create('CTE.Cubagem.data.Model', {
												cte_dim_peso_taxado: totais.peso - peso,
												cte_dim_peso_bruto: totais.peso - peso,
												cte_dim_volumes: totais.volumes - volume
											}));
											CubagemEditor.startEditByPosition({row: 0, column: 1});
											view.refresh();
										}
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									var volumes = 0, peso = 0, totais = me.totalizarDocumentos();
									CubagemStore.each(function(r) {
										peso += r.get('cte_dim_peso_bruto');
										volumes += r.get('cte_dim_volumes');
									});
									CubagemEditor.cancelEdit();
									CubagemStore.insert(0, Ext.create('CTE.Cubagem.data.Model', {
										cte_dim_peso_bruto: totais.peso - peso,
										cte_dim_volumes: totais.volumes - volumes
									}));
									CubagemEditor.startEditByPosition({row: 0, column: 1});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									CubagemStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									CubagemStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-info-seguro-grid',
						title: 'Informação do Seguro',
						height: 300,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						style: {
							marginTop: 20
						},
						store: Ext.create('Ext.data.JsonStore', {
							model: 'CTE.Seguro.data.Model',
							autoLoad: false,
							autoDestroy: true,
							remoteSort: false,
							remoteGroup: false,
							remoteFilter: false,
							
							proxy: {
								type: 'ajax',
								url: 'mod/conhecimentos/ctes/php/response.php',
								filterParam: 'query',
								extraParams: {
									m: 'read_seguros',
									cte_id: 0
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
								property: 'cte_seg_responsavel_rotulo',
								direction: 'ASC'
							},{
								property: 'cte_seg_seguradora',
								direction: 'ASC'
							}],
							
							listeners: {
								beforeload: function() {
									return this.getProxy().extraParams.cte_id > 0;
								}
							}
						}),
						plugins: Ext.create('Ext.grid.plugin.CellEditing',{
							clicksToEdit: 2
						}),
						columns: [{
							dataIndex: 'cte_seg_responsavel_rotulo',
							text: 'Responsável pelo Seguro',
							tooltip: 'Obrigatório pela lei 11.442/07 (RCTRC) para Modal Rodoviário',
							menuDisabled: true,
							flex: 2
						},{
							dataIndex: 'cte_seg_seguradora',
							text: 'Nome da Seguradora',
							tooltip: 'Obrigatório pela lei 11.442/07 (RCTRC) para Modal Rodoviário',
							menuDisabled: true,
							flex: 2
						},{
							dataIndex: 'cte_seg_apolice',
							text: 'Número da Apólice',
							tooltip: 'Obrigatório pela lei 11.442/07 (RCTRC) para Modal Rodoviário',
							align: 'right',
							menuDisabled: true,
							flex: 1
						},{
							dataIndex: 'cte_seg_averbacao',
							text: 'Número da Averbação',
							tooltip: 'Não é obrigatório, pois muitas averbações ocorrem após a emissão do CT-e, mensalmente, por exemplo',
							align: 'right',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 20
							}
						},{
							dataIndex: 'cte_seg_valor_carga',
							text: 'Valor Marcadoria',
							tooltip: 'Valor da Carga para efeito de averbação: Normalmente igual ao valor declarado da mercadoria, diferente por exemplo, quando a mercadoria transportada é isenta de tributos nacionais para exportação, onde é preciso averbar um valor maior, pois no caso de indenização, o valor a ser pago será maior',
							align: 'right',
							menuDisabled: true,
							flex: 1,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						}],
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								itemId: 'preencher-seguro-btn',
								text: 'Auto Preencher',
								iconCls: 'icon-pencil',
								handler: function(btn) {
									var form = me.getForm(),
									grid = btn.up('grid'), 
									store = grid.getStore(),
									originalText = btn.getText();
									
									btn.setText('Preenchendo...');
									btn.setDisabled(true);
									
									Ext.Ajax.request({
										url: 'mod/conhecimentos/ctes/php/response.php',
										method: 'get',
										params: {
											m: 'load_seguros',
											cte_id: form.findField('cte_id').getValue(),
											clie_remetente_id: form.findField('clie_remetente_id').getValue(),
											clie_coleta_id: form.findField('clie_coleta_id').getValue(),
											clie_expedidor_id: form.findField('clie_expedidor_id').getValue(),
											clie_recebedor_id: form.findField('clie_recebedor_id').getValue(),
											clie_destinatario_id: form.findField('clie_destinatario_id').getValue(),
											clie_entrega_id: form.findField('clie_entrega_id').getValue(),
											clie_tomador_id: form.findField('clie_tomador_id').getValue()
										},
										failure: Ext.Function.createSequence(App.ajaxFailure, function(){
											btn.setDisabled(false);
											btn.setText(originalText);
										}),
										success: function(response) {
											var o = Ext.decode(response.responseText);
											
											btn.setDisabled(false);
											btn.setText(originalText);
											
											if (!Ext.isEmpty(o.records)) {
												store.removeAll();
												store.add(o.records);
											}
										}
									});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var grid = this.up('grid'), selections = grid.getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									grid.getStore().remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									store = btn.up('grid').getStore(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									store.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-prod-perigosos-grid',
						title: 'Produtos Perigosos',
						height: 300,
						disabled: !App.empresa.emp_aba_prod_perig,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						store: ppStore,
						plugins: ppEditor,
						style: {
							marginTop: 20
						},
						columns: [{
							dataIndex: 'prod_numero_onu',
							text: 'Número ONU',
							tooltip: 'Número ONU/UN: Ver a legislação de transporte de produtos perigosos aplicadas ao modal',
							align: 'right',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 9999
							}
						},{
							dataIndex: 'prod_nome_embarque',
							text: 'Nome Apropriado para Embarque do Produto',
							tooltip: 'Obrigatório pela lei 11.442/07 (RCTRC) para Modal Rodoviário',
							menuDisabled: true,
							flex: 2,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 150
							}
						},{
							dataIndex: 'prod_classe_risco',
							text: 'Classe de Risco',
							tooltip: 'Classe ou subclasse/divisão, e risco subsidiário/risco secundário: Ver a legislação de transporte de produtos perigosos aplicadas ao modal',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 40
							}
						},{
							dataIndex: 'prod_grupo_embalagem',
							text: 'Grupo de Embalagem',
							tooltip: 'Ver a legislação de transporte de produtos perigosos aplicadas ao modal. Preenchimento obrigatório para o modal aéreo. A legislação para o modal rodoviário e ferroviário não atribui grupo de embalagem para todos os produtos, portanto haverá casos de não preenchimento desse campo',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 6
							}
						},{
							dataIndex: 'cte_pp_qtde_prod',
							text: 'Quantidade Total por Produto',
							tooltip: 'Preencher conforme a legislação de transporte de produtos perigosos aplicada ao modal',
							menuDisabled: true,
							width: 190,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 20
							}
						},{
							dataIndex: 'cte_pp_qtde_volumes',
							text: 'Quantidade e Tipo de Volumes',
							tooltip: 'Preencher conforme a legislação de transporte de produtos perigosos aplicada ao modal',
							menuDisabled: true,
							width: 190,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 60
							}
						},{
							dataIndex: 'prod_ponto_fulgor',
							text: 'Ponto de Fulgor',
							tooltip: 'No caso de transporte rodoviário e ferroviário, este campo não é exigido',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 6
							}
						},{
							dataIndex: 'iic_id',
							text: 'Código IATA',
							tooltip: 'Código/Sigla do produto perigoso (IATA IMP CODE)',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'iatacodigocombo',
								valueField: 'iic_id',
								displayField: 'iic_nome',
								allowBlank: true,
								listeners: {
									select: function(field, records) {
										var record = records[0];
										ppActiveRecord.set('iic_nome', record.get('iic_nome'));
									}
								}
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										ppEditor.cancelEdit();
										ppStore.insert(0, Ext.create('CTE.ProdPerigoso.data.Model'));
										ppEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function(btn) {
									ppEditor.cancelEdit();
									ppStore.insert(0, Ext.create('CTE.ProdPerigoso.data.Model'));
									ppEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									ppStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									ppStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					}]
				},{
					title: '5. Doc. de Transp. Ant.',
					tooltip: 'Documentos de Transporte Anterior',
					hidden: !App.empresa.emp_aba_doc_trans_ant,
					layout: {
						type: 'vbox',
						align: 'stretch',
						defaultMargins: {top: 0, right: 0, bottom: 20, left: 0}
					},
					defaults: {
						flex: 1,
						minHeight: 200,
						autoHeight: true
					},
					items: [{
						xtype: 'grid',
						itemId: 'cte-eda-grid',
						title: 'Emitentes',
						store: EDAStore,
						plugins: EDAEditor,
						enableColumnMove: false,
						enableColumnHide: false,
						listeners: {
							selectionchange: function(selModel, selections) {
								var record = selections.length === 1 ? selections[0]: null,
								DTAProxy = DTAStore.getProxy();
								DTAStore.removeAll();
								if (record) {
									DTAProxy.setExtraParam('cte_eda_id', record.get('cte_eda_id'));
									DTAProxy.setExtraParam('cte_id', EDAStore.getProxy().extraParams.cte_id);
									DTAStore.load();
								} else {
									DTAProxy.setExtraParam('cte_id', 0);
									DTAProxy.setExtraParam('cte_eda_id', 0);
								}
							}
						},
						columns: [{
							dataIndex: 'cte_eda_cnpj',
							text: 'CNPJ',
							tooltip: 'Em caso de pessoa jurídica preencher nesse campo',
							width: 150,
							menuDisabled: true,
							editor: {
								xtype: 'textfield',
								vtype: 'cnpj',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 14
							}
						},{
							dataIndex: 'cte_eda_cpf',
							text: 'CPF',
							tooltip: 'Em caso de pessoa física preencher nesse campo',
							width: 100,
							menuDisabled: true,
							editor: {
								xtype: 'textfield',
								vtype: 'cpf',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 11
							}
						},{
							dataIndex: 'cte_eda_ie',
							text: 'Inscrição Estadual',
							tooltip: 'Somente para pessoa jurídica',
							width: 150,
							menuDisabled: true,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 14
							}
						},{
							dataIndex: 'cte_eda_ie_uf',
							text: 'UF',
							tooltip: 'Unidade Federativa',
							align: 'center',
							width: 50,
							menuDisabled: true,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								minLength: 2,
								maxLength: 2
							}
						},{
							dataIndex: 'cte_eda_raz_social_nome',
							text: 'Razão Social/Nome',
							tooltip: 'Razão Social ou Nome do Emitente',
							flex: 1,
							menuDisabled: true,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 60
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										EDAEditor.cancelEdit();
										EDAStore.insert(0, Ext.create('CTE.eda.data.Model'));
										EDAEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									EDAEditor.cancelEdit();
									EDAStore.insert(0, Ext.create('CTE.eda.data.Model'));
									EDAEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									Ext.each(selections, function(record) {
										if (record.get('cte_eda_id') > 0) {
											var index = -1;
											Ext.each(me.EDAData, function(item, i) {
												if (item.cte_eda_id == record.get('cte_eda_id')) {
													index = i;
													return false;
												}
											});
											if (index >= 0) {
												me.EDAData.splice(index, 1);
											}
										}
									});
									EDAStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									EDAStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-dta-grid',
						title: 'Documentos Emitidos Anteriormente por Emitente',
						store: DTAStore,
						plugins: DTAEditor,
						enableColumnMove: false,
						enableColumnHide: false,
						columns: [{
							dataIndex: 'cte_dta_tpdoc_rotulo',
							text: 'Tipo do Documento originário',
							tooltip: 'Tipo de documento anterior em papel',
							width: 280,
							menuDisabled: true,
							editor: {
								xtype: 'localcombo',
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [
									'00 - CTRC',
									'01 - CTAC',
									'02 - ACT',
									'03 - NF Modelo 7',
									'04 - NF Modelo 27',
									'05 - Conhecimento Aéreo Nacional',
									'06 - CTMC',
									'07 - ATRE',
									'08 - DTA (Despacho de Transito Aduaneiro)',
									'09 - Conhecimento Aéreo Internacional',
									'10 – Conhecimento - Carta de Porte Internacional',
									'11 – Conhecimento Avulso',
									'12 - TIF (Transporte Internacional Ferroviário)',
									'99 - outros'
								]
							}
						},{
							dataIndex: 'cte_dta_serie',
							text: 'Série',
							tooltip: 'Série do documento em papel',
							align: 'right',
							width: 100,
							menuDisabled: true,
							editor: {
								xtype: 'intfield',
								allowBlank: true,
								selectOnFocus: true,
								minValue: 0,
								maxValue: 999
							}
						},{
							dataIndex: 'cte_dta_sub_serie',
							text: 'Sub Série',
							tooltip: 'Sub-Série do documento em papel',
							align: 'right',
							width: 100,
							menuDisabled: true,
							editor: {
								xtype: 'intfield',
								allowBlank: true,
								selectOnFocus: true,
								minValue: 0,
								maxValue: 99
							}
						},{
							dataIndex: 'cte_dta_numero',
							text: 'Número do Documento',
							align: 'right',
							flex: 1,
							menuDisabled: true,
							editor: {
								xtype: 'intfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 20
							}
						},{
							xtype: 'datecolumn',
							dataIndex: 'cte_dta_data_emissao',
							text: 'Emitido em',
							tooltip: 'Data de Emissão do Documento em Papel',
							format: 'D d/m/Y',
							align: 'right',
							width: 120,
							menuDisabled: true,
							editor: {
								xtype: 'datefield',
								allowBlank: false,
								selectOnFocus: true,
								format: 'd/m/Y'
							}
						},{
							dataIndex: 'cte_dta_chave',
							text: 'Chave de Acesso',
							tooltip: 'Chave de acesso ao documento eletrônico',
							flex: 2,
							menuDisabled: true,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 44
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										DTAEditor.cancelEdit();
										DTAStore.insert(0, Ext.create('CTE.dta.data.Model'));
										DTAEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									var grid = me.down('#cte-eda-grid'), 
									selected = grid.getSelectionModel().getSelection();
									if (selected.length === 1) {
										selected = selected[0];
										DTAEditor.cancelEdit();
										DTAStore.insert(0, Ext.create('CTE.dta.data.Model', {
											cte_eda_id: selected.get('cte_eda_id')
										}));
										DTAEditor.startEditByPosition({row: 0, column: 0});
									}
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									Ext.each(selections, function(record) {
										if (record.get('cte_dta_id') > 0) {
											Ext.each(me.EDAData, function(parent) {
												var index = -1;
												Ext.each(parent.child, function(child, i) {
													if (child.cte_dta_id == record.get('cte_dta_id')) {
														index = i;
														return false;
													}
												});
												if (index >= 0) {
													parent.child.splice(index, 1);
												}
											});
										}
									});
									EDAStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									DTAStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					}]
				},{
					title: '6. Veículos Novos',
					hidden: !App.empresa.emp_aba_veic_novos,
					layout: 'fit',
					defaults: {
						autoHeight: true,
						minHeight: window.innerHeight - 320
					},
					items: [{
						xtype: 'grid',
						itemId: 'cte-veiculos-novos-grid',
						enableColumnMove: false,
						enableColumnHide: false,
						store: VNStore,
						plugins: VNEditor,
						columns: [{
							dataIndex: 'cte_vn_chassi',
							text: 'Chassi',
							tooltip: 'Chassi do veículo',
							menuDisabled: true,
							width: 200,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 17
							}
						},{
							dataIndex: 'cte_vn_cor',
							text: 'Código Cor',
							tooltip: 'Código da cor de cada montadora',
							menuDisabled: true,
							width: 150,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 4
							}
						},{
							dataIndex: 'cte_vn_descricao_cor',
							text: 'Descrição da Cor',
							menuDisabled: true,
							width: 200,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 40
							}
						},{
							dataIndex: 'cte_vn_modelo',
							text: 'Modelo',
							tooltip: 'Código Marca Modelo: Utilizar tabela RENAVAM',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 6
							}
						},{
							dataIndex: 'cte_vn_valor_unit',
							text: 'Valor Veículo',
							align: 'right',
							menuDisabled: true,
							width: 120,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						},{
							dataIndex: 'cte_vn_frete_unit',
							text: 'Frete Unitário',
							align: 'right',
							menuDisabled: true,
							width: 120,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99 
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										VNEditor.cancelEdit();
										VNStore.insert(0, Ext.create('CTE.VN.data.Model'));
										VNEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									VNEditor.cancelEdit();
									VNStore.insert(0, Ext.create('CTE.VN.data.Model'));
									VNEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									VNStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									VNStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					}]
				},{
					itemId: 'cte-sub-tab',
					title: '7. CT-e de Substituição',
					bodyPadding: 10,
					hidden: true,
					autoScroll: true,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						collapsible: false,
						defaults: {
							hideLabel: true,
							labelAlign: 'top',
							anchor: '100%',
							layout: {
								type: 'hbox',
								defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
							},
							defaults: {
								flex: 1,
								labelAlign: 'top',
								allowBlank: true,
								selectOnFocus: true
							},
							defaultType: 'textfield'
						},
						defaultType: 'fieldcontainer'
					},
					defaultType: 'fieldset',
					items: [{
						title: 'Conhecimento Original',
						items: [{
							items: [{
								fieldLabel: 'Chave de Acesso do CT-e a ser substituído (original)',
								name: 'ctesub_chave_cte_original',
								maxLength: 44
							}]
						}]
					},{
						title: 'Tomador é contribuinte do ICMS',
						items: [{
							items: [{
								xtype: 'radio',
								fieldLabel: ' ',
								labelSeparator: '',
								boxLabel: 'CT-e',
								itemId: 'ctesub_tom_tipo_doc1',
								name: 'ctesub_tom_tipo_doc',
								inputValue: 'CTE',
								disabled: true,
								flex: null,
								width: 70,
								listeners: {
									change: function(field, checked) {
										var form = me.getForm();
										field1 = form.findField('ctesub_tom_chave_cte');
										if (!checked) {
											field1.reset();
											field1.clearInvalid();
										}
										field1.setDisabled(!checked);
									}
								}
							},{
								xtype: 'radio',
								fieldLabel: ' ',
								labelSeparator: '',
								boxLabel: 'NF-e',
								itemId: 'ctesub_tom_tipo_doc2',
								name: 'ctesub_tom_tipo_doc',
								inputValue: 'NFE',
								disabled: true,
								flex: null,
								width: 70,
								listeners: {
									change: function(field, checked) {
										var form = me.getForm(),
										field1 = form.findField('ctesub_tom_chave_nfe');
										if (!checked) {
											field1.reset();
											field1.clearInvalid();
										}
										field1.setDisabled(!checked);
									}
								}
							},{
								xtype: 'radio',
								fieldLabel: ' ',
								labelSeparator: '',
								boxLabel: 'Outros',
								itemId: 'ctesub_tom_tipo_doc3',
								name: 'ctesub_tom_tipo_doc',
								inputValue: 'PAPEL',
								flex: null,
								disabled: true,
								width: 70,
								listeners: {
									change: function(field, checked) {
										var form = me.getForm(),
										field1 = form.findField('ctesub_cnpj_emitente_doc'),
										field2 = form.findField('ctesub_cpf_emitente_doc'),
										field3 = form.findField('ctesub_modelo'),
										field4 = form.findField('ctesub_serie'),
										field5 = form.findField('ctesub_sub_serie'),
										field6 = form.findField('ctesub_numero'),
										field7 = form.findField('ctesub_valor'),
										field8 = form.findField('ctesub_data_emissao');
										if (!checked) {
											field1.reset();
											field1.clearInvalid();
											field2.reset();
											field2.clearInvalid();
											field3.reset();
											field3.clearInvalid();
											field4.reset();
											field4.clearInvalid();
											field5.reset();
											field5.clearInvalid();
											field6.reset();
											field6.clearInvalid();
											field7.reset();
											field7.clearInvalid();
											field8.reset();
											field8.clearInvalid();
										}
										field1.setDisabled(!checked);
										field2.setDisabled(!checked);
										field3.setDisabled(!checked);
										field4.setDisabled(!checked);
										field5.setDisabled(!checked);
										field6.setDisabled(!checked);
										field7.setDisabled(!checked);
										field8.setDisabled(!checked);
									}
								}
							},{
								fieldLabel: 'Chave de Acesso do CT-e emitido pelo Tomador',
								name: 'ctesub_tom_chave_cte',
								maxLength: 44,
								disabled: true
							},{
								fieldLabel: 'Chave de Acesso da NF-e emitida pelo Tomador',
								name: 'ctesub_tom_chave_nfe',
								maxLength: 44,
								disabled: true
							}]
						},{
							items: [{
								fieldLabel: 'Pessoa Jurídica (CNPJ)',
								name: 'ctesub_cnpj_emitente_doc',
								vtype: 'cnpj',
								maxLength: 14,
								disabled: true,
								checkChangeEvents: ['change'],
								listeners: {
									change: function(field, newValue) {
										var form = me.getForm(),
										field1 = form.findField('ctesub_cpf_emitente_doc'),
										disabled = !Ext.isEmpty(newValue);
										if (disabled) {
											field1.reset();
											field1.clearInvalid();
										}
										field1.setDisable(disabled);
									}
								}
							},{
								fieldLabel: 'Pessoa Física (CPF)',
								name: 'ctesub_cpf_emitente_doc',
								vtype: 'cpf',
								maxLength: 11,
								disabled: true,
								checkChangeEvents: ['change'],
								listeners: {
									change: function(field, newValue) {
										var form = me.getForm(),
										field1 = form.findField('ctesub_cnpj_emitente_doc'),
										disabled = !Ext.isEmpty(newValue);
										if (disabled) {
											field1.reset();
											field1.clearInvalid();
										}
										field1.setDisable(disabled);
									}
								}
							},{
								xtype: 'localcombo',
								fieldLabel: 'Modelo',
								name: 'ctesub_modelo',
								options: ['01', '1B', '02', '2D', '2E', '04', '06', '07', '08', '8B', '09', '10', '11', '13', '14', '15', '16', '17', '18', '20', '21', '22', '23', '24', '25', '26', '27', '28', '55'],
								disabled: true
							},{
								xtype: 'intfield',
								fieldLabel: 'Série',
								name: 'ctesub_serie',
								minValue: 0,
								maxValue: 999,
								disabled: true
							},{
								xtype: 'intfield',
								fieldLabel: 'Sub-série',
								name: 'ctesub_sub_serie',
								minValue: 0,
								maxValue: 999,
								disabled: true
							},{
								xtype: 'intfield',
								fieldLabel: 'Número',
								name: 'ctesub_numero',
								minValue: 0,
								maxValue: 999999,
								disabled: true
							},{
								xtype: 'decimalfield',
								fieldLabel: 'Valor',
								name: 'ctesub_valor',
								minValue: 0,
								maxValue: 9999999999999.99,
								disabled: true
							},{
								xtype: 'datefield',
								fieldLabel: 'Emitido em',
								name: 'ctesub_data_emissao',
								format: 'd/m/Y',
								disabled: true
							}]
						}]
					},{
						title: 'Tomador não é contribuinte do ICMS',
						items: [{
							items: [{
								fieldLabel: 'Chave de Acesso do CT-e de Anulação',
								name: 'ctesub_tom_chave_cte_nfe',
								maxLength: 44,
								disabled: true
							}]
						}]
					}]
				},{
					itemId: 'cte-anu-tab',
					title: '8. CT-e Outros/Anulação',
					bodyPadding: 10,
					hidden: true,
					autoScroll: true,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						collapsible: false,
						defaults: {
							hideLabel: true,
							labelAlign: 'top',
							anchor: '100%',
							layout: {
								type: 'hbox',
								defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
							},
							defaults: {
								flex: 1,
								labelAlign: 'top',
								disabled: true,
								allowBlank: true,
								selectOnFocus: true
							},
							defaultType: 'textfield'
						},
						defaultType: 'fieldcontainer'
					},
					defaultType: 'fieldset',
					items: [{
						title: 'CT-e de Complemento',
						items: [{
							items: [{
								fieldLabel: 'Chave de Acesso do CT-e a ser complementado',
								name: 'ctout_chave_cte_complemento',
								maxLength: 44
							}]
						}]
					},{
						title: 'CT-e de Anulação de Valores',
						items: [{
							items: [{
								fieldLabel: 'Chave de Acesso do CT-e a ser anulado',
								name: 'ctout_chave_cte_anulacao',
								maxLength: 44
							},{
								xtype: 'datefield',
								fieldLabel: 'Data de emissão da <strong>declaração</strong> do tomador não contribuinte de ICMS',
								format: 'd/m/Y'
							}]
						}]
					}]
				},{
					itemId: 'cte-aereo-tab',
					title: '9. Aéreo',
					bodyPadding: 10,
					hidden: App.empresa.emp_modal != 'Aereo',
					autoScroll: true,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						collapsible: false,
						defaults: {
							hideLabel: true,
							labelAlign: 'top',
							anchor: '100%',
							layout: {
								type: 'hbox',
								defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
							},
							defaults: {
								flex: 1,
								labelAlign: 'top',
								allowBlank: true,
								selectOnFocus: true
							},
							defaultType: 'textfield'
						},
						defaultType: 'fieldcontainer'
					},
					defaultType: 'fieldset',
					items: [{
						title: 'Dados da Cia Aérea (Master)',
						items: [{
							items: [{
								fieldLabel: 'Número Operacional do Conhecimento/Aéreo',
								name: 'cte_operacional_master',
								maxLength: 14
							},{
								fieldLabel: 'Identificação do Emissor (Filial, franquia ou representante legal da emissora do CT-e da empresa de transporte aéreo)',
								name: 'cte_emissora_master',
								maxLength: 14,
								flex: 2
							},{
								fieldLabel: 'Sigla CIA',
								name: 'cte_cia_master',
								flex: null,
								width: 100
							}]
						},{
							items: [{
								xtype: 'intfield',
								fieldLabel: 'Série',
								name: 'cte_serie_master',
								flex: null,
								width: 100,
								minValue: 0,
								maxValue: 999
							},{
								xtype: 'intfield',
								fieldLabel: 'Número',
								name: 'cte_numero_master',
								flex: null,
								width: 200,
								minValue: 0,
								maxValue: 999999999
							},{
								fieldLabel: 'Chave de Acesso do CT-e Master',
								name: 'cte_chave_master',
								maxLength: 44
							}]
						}]
					}]
				},{
					itemId: 'cte-rodo1-tab',
					title: '10. Rodoviário',
					tooltip: 'Rodoviário - Geral',
					hidden: App.empresa.emp_modal != 'Rodoviario',
					bodyPadding: 10,
					autoScroll: true,
					layout: 'anchor',
					defaults: {
						anchor: '100%',
						collapsible: false,
						defaults: {
							hideLabel: true,
							labelAlign: 'top',
							anchor: '100%',
							layout: {
								type: 'hbox',
								defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
							},
							defaults: {
								flex: 1,
								labelAlign: 'top',
								allowBlank: true,
								selectOnFocus: true
							},
							defaultType: 'textfield'
						},
						defaultType: 'fieldcontainer'
					},
					defaultType: 'fieldset',
					items: [{
						title: 'Principal',
						items: [{
							items: [{
								fieldLabel: 'RNTRC',
								name: 'emp_RNTRC',
								value: App.empresa.emp_RNTRC,
								readOnly: true,
								flex: null,
								width: 150
							},{
								xtype: 'datefield',
								fieldLabel: 'Data Prevista de Entrega',
								name: 'cte_data_entrega_prevista',
								format: 'd/m/Y',
								//minValue: new Date(),
								flex: null,
								width: 160
							},{
								xtype: 'radiogroup',
								fieldLabel: 'Indicador de Lotação',
								flex: null,
								width: 140,
								defaults: {
									name: 'cte_indicador_lotacao',
									checked: false
								},
								items: [{
									boxLabel: 'Sim',
									inputValue: 1,
									listeners: {
										change: function(field, checked) {
											me.down('tabpanel').down('#cte-rodo4-tab').tab.setVisible(checked && App.empresa.emp_aba_motoristas && App.empresa.emp_modal == 'Rodoviario');
										}
									}
								},{
									boxLabel: 'Não',
									inputValue: 0,
									checked: true
								}]
							},{
								xtype: 'intfield',
								fieldLabel: 'CIOT (Código Identificador da Operação de Transporte)',
								name: 'cte_ciot',
								allowBlank: true,
								minValue: 0,
								maxValue: 999999999999
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-ordem-coleta-grid',
						title: 'Ordem de Coleta Associadas (10 no máximo)',
						height: 300,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						store: ColetaStore,
						plugins: ColetaEditor,
						columns: [{
							dataIndex: 'oca_serie',
							text: 'Série',
							tooltip: 'Série da Ordem de Coleta de Carga (OCC)',
							menuDisabled: true,
							width: 70,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 999
							}
						},{
							dataIndex: 'oca_numero',
							text: 'Número',
							tooltip: 'Número da Ordem de Coleta de Carga (OCC)',
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 999999
							}
						},{
							xtype: 'datecolumn',
							dataIndex: 'oca_data_emissao',
							text: 'Emitido em',
							tooltip: 'Data de Emissão da Ordem de Coleta de Carga (OCC)',
							format: 'D d/m/Y',
							align: 'right',
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'datefield',
								format: 'd/m/Y',
								allowBlank: false,
								selectOnFocus: true
							}
						},{
							dataIndex: 'oca_cnpj_emitente',
							text: 'CNPJ Emitente',
							tooltip: 'CNPJ do Emitente da Ordem de Coleta de Carga (OCC)',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								vtype: 'cnpj',
								allowBlank: false
							}
						},{
							dataIndex: 'oca_inscricao_estadual',
							text: 'Inscrição Estadual',
							tooltip: 'Inscrição Estadual do Emitente Ordem de Coleta de Carga (OCC)',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 14
							}
						},{
							dataIndex: 'oca_uf_ie',
							text: 'UF',
							tooltip: 'Unidade Federativa do Emitente Ordem de Coleta de Carga (OCC)',
							menuDisabled: true,
							width: 80,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								minValue: 2,
								maxValue: 2 
							}
						},{
							dataIndex: 'oca_telefone',
							text: 'Telefone',
							tooltip: 'Telefone do Emitente Ordem de Coleta de Carga (OCC)',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 14
							}
						},{
							dataIndex: 'oca_codigo_interno',
							text: 'Código Interno',
							tooltip: 'Código Interno de Uso da Transportadora',
							menuDisabled: true,
							felx: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								maxLength: 10
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										ColetaEditor.cancelEdit();
										ColetaStore.insert(0, Ext.create('CTE.coleta.assoc.data.Model'));
										ColetaEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									ColetaEditor.cancelEdit();
									ColetaStore.insert(0, Ext.create('CTE.coleta.assoc.data.Model'));
									ColetaEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									ColetaStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									ColetaStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-lacres-grid',
						title: 'Lacres',
						height: 300,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						store: LacreStore,
						plugins: LacreEditor,
						style: {
							marginTop: 20
						},
						columns: [{
							dataIndex: 'lac_numero',
							text: 'Número do Lacre',
							tooltip: 'Série da Ordem de Coleta de Carga (OCC)',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 20
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										LacreEditor.cancelEdit();
										LacreStore.insert(0, Ext.create('CTE.coleta.lacre.data.Model'));
										LacreStore.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									LacreEditor.cancelEdit();
									LacreStore.insert(0, Ext.create('CTE.coleta.lacre.data.Model'));
									LacreEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									LacreStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									ColetaStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					}]
				},{
					itemId: 'cte-rodo2-tab',
					title: '11. Vale Pedágio',
					tooltip: 'Rodoviário - Vale Pedágio',
					hidden: App.empresa.emp_modal != 'Rodoviario' || !App.empresa.emp_aba_vale_pedagio,
					layout: 'fit',
					items: [{
						xtype: 'grid',
						itemId: 'cte-vale-pedagio-grid',
						autoHeight: true,
						minHeight: window.innerHeight - 320,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						store: VPStore,
						plugins: VPEditor,
						columns: [{
							dataIndex: 'cte_vp_cnpj_fornec',
							text: 'CNPJ Fornecedor',
							tooltip: 'CNPJ da Empresa Fornecedora do Vale-Pedágio, ou seja, empresa que fornece ao Responsável pelo Pagamento do Vale-Pedágio os dispositivos do Vale-Pedágio. Informar os zeros não significativos!',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								vtype: 'cnpj',
								maxLength: 14
							}
						},{
							dataIndex: 'cte_vp_comprov_compra',
							text: 'Número Comprovante',
							tooltip: 'Número de ordem do comprovante de compra do Vale-Pedágio fornecido para cada veículo ou combinação veicular,  por viagem',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 99999999999999999999
							}
						},{
							dataIndex: 'cte_vp_cnpj_responsavel',
							text: 'CNPJ responsável pelo pagamento',
							tooltip: 'Responsável pelo pagamento do Vale Pedágio. Informar somente quando o responsável não for o emitente do CT-e. Informar os zeros não significativos!',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								vtype: 'cnpj',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 14
							}
						},{
							dataIndex: 'cte_vp_valor_vale',
							text: 'Valor',
							align: 'right',
							tooltip: 'Valor do Vale-Pedágio',
							menuDisabled: true,
							flex: 1,
							renderer: Ext.util.Format.brMoney,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 9999999999999.99
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										VPEditor.cancelEdit();
										VPStore.insert(0, Ext.create('CTE.VP.data.Model'));
										VPEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									VPEditor.cancelEdit();
									VPStore.insert(0, Ext.create('CTE.VP.data.Model'));
									VPEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									ColetaStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									VPStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					}]
				},{
					itemId: 'cte-rodo3-tab',
					title: '12. Veículos',
					tooltip: 'Rodoviário - Veículos',
					hidden: !App.empresa.emp_aba_veiculos,
					layout: 'fit',
					items: [{
						xtype: 'grid',
						itemId: 'cte-rodo-veiculos-grid',
						autoHeight: true,
						minHeight: window.innerHeight - 320,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						store: VUCStore,
						plugins: VUCEditor,
						columns: [{
							dataIndex: 'cte_rv_codigo_interno',
							text: 'Cód. Interno',
							tooltip: 'Código Interno do Veículo',
							menuDisabled: true,
							width: 120,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 10
							}
						},{
							dataIndex: 'cte_rv_renavam',
							text: 'RENAVAM',
							tooltip: 'RENAVAM do veículo',
							menuDisabled: true,
							width: 120,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 9
							}
						},{
							dataIndex: 'cte_rv_placa',
							text: 'Placa',
							tooltip: 'Placa do veículo',
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 7
							}
						},{
							dataIndex: 'cte_rv_tara',
							text: 'Tara (kg)',
							align: 'center',
							tooltip: 'Tara em Kg',
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 999999
							}
						},{
							dataIndex: 'cte_rv_cap_kg',
							text: 'Capacidade (kg)',
							align: 'center',
							tooltip: 'Capacidade em Kg',
							menuDisabled: true,
							width: 110,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 999999
							}
						},{
							dataIndex: 'cte_rv_cap_m3',
							text: 'Capacidade (m³)',
							align: 'center',
							tooltip: 'Capacidade em metros cúbicos do veículo',
							menuDisabled: true,
							width: 110,
							editor: {
								xtype: 'intfield',
								minValue: 0,
								maxValue: 999999
							}
						},{
							dataIndex: 'cte_rv_tp_rodado_rotulo',
							text: 'Tipo de Rodado',
							tooltip: 'Capacidade em metros cúbicos do veículo',
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'localcombo',
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [
									'00 - Não aplicável',
									'01 - Truck',
									'02 - Toco',
									'03 - Cavalo Mecânico',
									'04 - VAN',
									'05 - Utilitário',
									'06 - Outros'
								]
							}
						},{
							dataIndex: 'cte_rv_tp_carroceria_rotulo',
							text: 'Tipo de Carroceria',
							tooltip: 'Tipo de Carroceria do Veículo',
							menuDisabled: true,
							width: 110,
							editor: {
								xtype: 'localcombo',
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [
									'00 - Não aplicável',
									'01 - Aberta',
									'02 - Fechada/Baú',
									'03 - Granelera',
									'04 - Porta Container',
									'05 - Sider'
								]
							}
						},{
							dataIndex: 'cte_rv_tp_veiculo_rotulo',
							text: 'Tipo de Veículo',
							menuDisabled: true,
							width: 110,
							editor: {
								xtype: 'localcombo',
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [
									'0 - Tração',
									'1 - Reboque'
								]
							}
						},{
							dataIndex: 'cte_rv_tp_propriedade_rotulo',
							text: 'Prop. Do Veículo',
							tooltip: 'Tipo de propriedade do veículo: Próprio ou Terceiro. Será próprio quando o proprietário, coproprietário ou arrendatário do veículo for o Emitente do CT-e, caso contrário será caracterizado como de propriedade de Terceiro',
							menuDisabled: true,
							width: 110,
							editor: {
								xtype: 'localcombo',
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [
									'P - Próprio',
									'T - Terceiro'
								]
							}
						},{
							dataIndex: 'cte_rv_uf_licenciado',
							text: 'UF Veículo',
							tooltip: 'Unidade Federativa em que veículo está licenciado',
							align: 'center',
							menuDisabled: true,
							width: 90,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								minLength: 2,
								maxLength: 2
							}
						},{
							dataIndex: 'cte_rv_cpf',
							text: 'CPF',
							tooltip: 'CPF do proprietário do veículo',
							menuDisabled: true,
							width: 90,
							editor: {
								xtype: 'textfield',
								vtype: 'cpf',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 11
							}
						},{
							dataIndex: 'cte_rv_cnpj',
							text: 'CNPJ',
							tooltip: 'CNPJ do proprietário do veículo',
							menuDisabled: true,
							width: 110,
							editor: {
								xtype: 'textfield',
								vtype: 'cnpj',
								maxLength: 14
							}
						},{
							dataIndex: 'cte_rv_rntrc',
							text: 'RNTRC',
							tooltip: 'Registro Nacional de Transportadores Rodoviários de Carga',
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 8
							}
						},{
							dataIndex: 'cte_rv_inscricao_estadual',
							text: 'Inscrição Estadual',
							tooltip: 'Inscrição Estadual do Proprietário do Veículo',
							menuDisabled: true,
							width: 120,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 14
							}
						},{
							dataIndex: 'cte_rv_uf_proprietario',
							text: 'UF Proprietário',
							tooltip: 'Unidade Federativa  do Proprietário do Veículo',
							align: 'center',
							menuDisabled: true,
							width: 100,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								minLength: 2,
								maxLength: 2
							}
						},{
							dataIndex: 'cte_rv_tp_proprietario_rotulo',
							text: 'Tipo de Proprietário',
							tooltip: 'Tipo de Proprietário do Veículo',
							menuDisabled: true,
							width: 120,
							editor: {
								xtype: 'localcombo',
								listConfig: {
									resizable: true,
									minWidth: 300
								},
								options: [
									'0 - TAC Agregado',
									'1 - TAC Independente',
									'2 - Outros' 
								]
							}
						},{
							dataIndex: 'cte_rv_razao_social',
							text: 'Razão Social/Nome',
							tooltip: 'Razão Social/Nome do Proprietário do Veículo',
							menuDisabled: true,
							width: 200,
							editor: {
								xtype: 'textfield',
								allowBlank: true,
								selectOnFocus: true,
								maxLength: 60
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										VUCEditor.cancelEdit();
										VUCStore.insert(0, Ext.create('CTE.VUC.data.Model'));
										VUCEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									VUCEditor.cancelEdit();
									VUCStore.insert(0, Ext.create('CTE.VUC.data.Model'));
									VUCEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									VUCStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									VPStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					}]
				},{
					itemId: 'cte-rodo4-tab',
					title: '13. Motoristas',
					tooltip: 'Rodoviário - Motoristas',
					hidden: App.empresa.emp_modal != 'Rodoviario' || !App.empresa.emp_aba_motoristas,
					layout: 'fit',
					items: [{
						xtype: 'grid',
						itemId: 'cte-motoristas-grid',
						autoHeight: true,
						minHeight: window.innerHeight - 320,
						defaults: null,
						enableColumnMove: false,
						enableColumnHide: false,
						store: MOStore,
						plugins: MOEditor,
						columns: [{
							dataIndex: 'cte_mo_cpf',
							text: 'CPF',
							tooltip: 'CPF do motorista',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								vtype: 'cpf',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 11
							}
						},{
							dataIndex: 'cte_mo_motorista',
							text: 'Nome',
							tooltip: 'Nome do motorista',
							menuDisabled: true,
							flex: 2,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 60
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										MOEditor.cancelEdit();
										MOStore.insert(0, Ext.create('CTE.Motorista.data.Model'));
										MOEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									MOEditor.cancelEdit();
									MOStore.insert(0, Ext.create('CTE.Motorista.data.Model'));
									MOEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									MOStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									MOStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					}]
				},{
					title: '14. Observações',
					bodyPadding: 10,
					autoScroll: true,
					layout: 'anchor',
					items: [{
						xtype: 'textareafield',
						labelAlign: 'top',
						fieldLabel: 'Observações Gerais (2000 caracteres)',
						name: 'cte_obs_gerais',
						anchor: '100%',
						allowBlank: true,
						selectOnFocus: true,
						maxLength: 2000,
						height: 200
					},{
						xtype: 'grid',
						itemId: 'cte-grid-obs-contrib-grid',
						title: ' Listagem de Observações do Contribuinte e de interesse do Fisco (10 no máximo por interessado)',
						height: 300,
						enableColumnMove: false,
						enableColumnHide: false,
						store: OCFStore,
						plugins: OCFEditor,
						columns: [{
							dataIndex: 'cte_ocf_interessado',
							text: 'Interessado',
							tooltip: 'A observação é do interesse do Contribuinte ou Fisco',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'localcombo',
								options: ['CONTRIBUINTE','FISCO'],
								allowBlank: false
							}
						},{
							dataIndex: 'cte_ocf_titulo',
							text: 'Título',
							tooltip: 'Identificação do campo',
							menuDisabled: true,
							flex: 1,
							editor: {
								xtype: 'textfield',
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 20
							}
						},{
							dataIndex: 'cte_ocf_texto',
							text: 'Texto',
							tooltip: 'Identificação do campo',
							menuDisabled: true,
							flex: 2,
							editor: {
								xtype: 'textareafield',
								grow: true,
								allowBlank: false,
								selectOnFocus: true,
								maxLength: 160
							}
						}],
						viewConfig: {
							listeners: {
								itemkeydown: function(view, record, item, index, e) {
									if (e.getKey() == e.INSERT) {
										OCFEditor.cancelEdit();
										OCFStore.insert(0, Ext.create('CTE.OCF.data.Model'));
										OCFEditor.startEditByPosition({row: 0, column: 0});
										e.preventDefault();
									}
								}
							}
						},
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'top',
							items: [{
								text: 'Incluir',
								iconCls: 'icon-plus',
								handler: function() {
									OCFEditor.cancelEdit();
									OCFStore.insert(0, Ext.create('CTE.OCF.data.Model'));
									OCFEditor.startEditByPosition({row: 0, column: 0});
								}
							},{
								text: 'Excluir',
								iconCls: 'icon-minus',
								handler: function() {
									var selections = this.up('grid').getView().getSelectionModel().getSelection();
									if (!selections.length) {
										App.noRecordsSelected();
										return false;
									}
									OCFStore.remove(selections);
								}
							}]
						},{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									OCFStore.reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					}]
				},{
					title: '15. Cálculos',
					bodyPadding: 10,
					autoScroll: true,
					layout: 'anchor',
					listeners: {
						activate: me.onDefaultActivate
					},
					defaults: {
						anchor: '100%',
						layout: {
							type: 'hbox',
							defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
						},
						defaults: {
							flex: 1,
							collapsible: false,
							defaults: {
								hideLabel: true,
								labelAlign: 'top',
								anchor: '100%',
								layout: {
									type: 'hbox',
									defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}
								},
								defaults: {
									flex: 1,
									labelAlign: 'top',
									allowBlank: true,
									selectOnFocus: true
								},
								defaultType: 'textfield'
							},
							defaultType: 'fieldcontainer'
						},
						defaultType: 'fieldset'
					},
					defaultType: 'fieldcontainer',
					items: [{
						items: [{
							title: 'Prestação de Serviço',
							items: [{
								items: [{
									fieldLabel: 'Tabela',
									name: 'cte_tabela_frete'
								},{
									fieldLabel: 'Código do Grupo de Tarifa',
									name: 'gt_rotulo'
								}]
							},{
								items: [{
									fieldLabel: 'Peso Taxado',
									name: 'cte_peso_taxado',
									fieldStyle: {
										textAlign: 'right'
									}
								},{
									fieldLabel: 'Valor da Mercadoria',
									name: 'cte_valor_mercadoria',
									fieldStyle: {
										textAlign: 'right'
									}
								}]
							}]
						},{
							title: 'Total',
							items: [{
								items: [{
									ui: 'blue-button',
									xtype: 'button',
									text: 'CALCULAR FRETE PARA EMISSÃO DO CONHECIMENTO ELETRÔNICO',
									scale: 'medium',
									handler: function() {
										var form = me.getForm();
										
										if (Ext.isEmpty(me.tabelaCliente)) {
											form.findField('cte_tabela_frete').setValue('***TABELA '+ me.tomTabela + ' NÃO DEFINIDA***');
											return false;
										}
										
										var prefix = me.tabelaPrefix,
										tabelaCliente = me.tabelaCliente[0],
										
										prodGrid = me.down('#cte-cubagem-grid'),
										prodStore = prodGrid.getStore(),
										prodField = form.findField('prod_id'),
										
										redespachoField = form.findField('redespacho_id'),
										cidadeOrigemField = form.findField('cid_id_origem'),
										cidadeDestinoField = form.findField('cid_id_destino'),
										destinatarioField = form.findField('clie_destinatario_id'),
										valorCarga = form.findField('cte_valor_carga').getValue(),
										
										grid = me.down('#cte-componente-frete-grid'),
										store = grid.getStore(), proxy = store.getProxy();
										
										var pesoTaxado = 0;
										prodStore.each(function(r){
											pesoTaxado += r.get('cte_dim_peso_taxado');
										});
										
										if (!pesoTaxado) {
											form.findField('cte_peso_taxado').setValue('***PESO TAXADO NÃO DEFINIDO***');
											return false;
										}
										if (!valorCarga) {
											form.findField('cte_valor_mercadoria').setValue('***VALOR MERCADORIA NÃO DEFINIDO***');
											return false;
										}
										if (!prodField.getValue() || Ext.isEmpty(prodField.getValue())) {
											form.findField('gt_rotulo').setValue('***PRODUTO NÃO DEFINIDO***');
											return false;
										}
										
										form.findField('cte_peso_bc').setValue(pesoTaxado);
										form.findField('cte_tabela_frete').setValue('#' + tabelaCliente[prefix + 'id'] + ' - ' + me.tomTabela);
										form.findField('cte_peso_taxado').setValue(Ext.util.Format.brDecimal(pesoTaxado) + ' kg');
										form.findField('cte_valor_mercadoria').setValue(Ext.util.Format.brMoney(valorCarga));
										
										var notas = me.totalizarNotas(),
										cte_modal = form.findField('cte_modal').getValue(),
										produto = prodField.findRecordByValue(prodField.getValue()),
										redespacho = redespachoField.findRecordByValue(redespachoField.getValue()),
										cidade_origem = cidadeOrigemField.findRecordByValue(cidadeOrigemField.getValue()),
										cidade_destino = cidadeDestinoField.findRecordByValue(cidadeDestinoField.getValue()),
										destinatario = destinatarioField.findRecordByValue(destinatarioField.getValue());
										
										if (Ext.isEmpty(cidade_destino) || Ext.isEmpty(cidade_origem)) {
											App.notify('ATENÇÃO! Cidade de Origem e Destino devem ser preenchidas, experimente selecionando novamente os registros nos campos de seleções no formulário.', 'red-alert');
											return false;
										}
										
										proxy.setExtraParam('m', 'read_comp_calculo');
										proxy.setExtraParam('cte_id', 0);
										proxy.setExtraParam('cte_modal', cte_modal);
										proxy.setExtraParam('tabela_cliente', me.tomTabela);
										proxy.setExtraParam('cte_peso_bc', pesoTaxado);
										proxy.setExtraParam('cte_forma_pgto', form.findField('cte_forma_pgto').getValue());
										proxy.setExtraParam('cte_valor_carga', valorCarga);
										proxy.setExtraParam('tabela_cliente_record', Ext.encode({
											clie_id: tabelaCliente.clie_id,
											nac_id: tabelaCliente.nac_id,
											min_id: tabelaCliente.min_id,
											exp_id: tabelaCliente.id,
											nac_taxa_minima: tabelaCliente.nac_taxa_minima,
											espfx_peso_ate_kg: tabelaCliente.espfx_peso_ate_kg,
											espfx_excedente: tabelaCliente.espfx_excedente,
											espfx_valor: tabelaCliente.espfx_valor,
											exp_peso: tabelaCliente.peso_taxa_minima,
											exp_valor: tabelaCliente.valor_taxa_minima
										}));
										if (produto) {
											produto = produto.data;
											proxy.setExtraParam('produto_predominante', Ext.encode({
												gt_isento_icms: produto.gt_isento_icms,
												gt_obrigar_especifica: produto.gt_obrigar_especifica,
												prod_tarifa: produto.prod_tarifa,
												gt_id_codigo: produto.gt_id_codigo,
												iic_codigo: produto.iic_codigo,
												prod_tipo_advalorem: produto.prod_tipo_advalorem
											}));
										}
										
										if (redespacho) {
											redespacho = redespacho.data;
											proxy.setExtraParam('redespacho', Ext.encode({
												red_valor: redespacho.red_valor,
												red_ate_kg: redespacho.red_ate_kg,
												red_excedente: redespacho.red_excedente,
												cid_id_passagem: redespacho.cid_id_passagem,
												red_aceita_frete_a_pagar: redespacho.red_aceita_frete_a_pagar
											}));
										}
										if (me.tomador) {
											proxy.setExtraParam('tomador', Ext.encode({
												clie_id: me.tomador.clie_id,
												clie_seguro_intra_estadual: me.tomador.clie_seguro_intra_estadual,
												clie_seguro_inter_estadual: me.tomador.clie_seguro_inter_estadual,
												clie_forma_aplicar_seguro: me.tomador.clie_forma_aplicar_seguro,
												clie_seguro_intra_estadual: me.tomador.clie_seguro_intra_estadual,
												clie_seguro_inter_estadual: me.tomador.clie_seguro_inter_estadual,
												clie_seguro_adval_tipo_1: me.tomador.clie_seguro_adval_tipo_1,
												clie_seguro_adval_tipo_2: me.tomador.clie_seguro_adval_tipo_2,
												clie_seguro_desconto: me.tomador.clie_seguro_desconto,
												clie_tom_aceita_suframa: me.tomador.clie_tom_aceita_suframa,
												clie_tom_taxa_sefaz: me.tomador.clie_tom_taxa_sefaz,
												clie_gris_percentual: me.tomador.clie_gris_percentual,
												clie_gris_valor_minimo: me.tomador.clie_gris_valor_minimo,
												num_notas: notas.quantidade
											}));
										}
										if (cidade_origem) {
											cidade_origem = cidade_origem.data;
											proxy.setExtraParam('cidade_origem', Ext.encode({
												cid_id: cidade_origem.cid_id,
												cid_uf: cidade_origem.cid_uf
											}));
										}
										if (cidade_destino) {
											cidade_destino = cidade_destino.data;
											proxy.setExtraParam('cidade_destino', Ext.encode({
												cid_id: cidade_destino.cid_id,
												cid_uf: cidade_destino.cid_uf,
												cid_suframa: cidade_destino.cid_suframa,
												cid_valor_sefaz: cidade_destino.cid_valor_sefaz
											}));
										}
										store.load({
											callback: function(records) {
												if (!store.getProxy().extraParams.cte_id) {
													var icmsField, icms = 0, valorIcms = 0, valorTotal = 0, valorSubTotal = 0, valorDesconto = 0,
													percReduc = form.findField('cte_perc_reduc_bc'), 
													sitTributaria = form.findField('cte_codigo_sit_tributaria');
													Ext.each(records, function(record) {
														if (record.get('cf_nome').search(new RegExp("ICMS", "gi")) < 0) {
															//valorSubTotal += (record.get('ccc_valor') - record.get('ccc_valor'));
															valorSubTotal += record.get('ccc_valor');
														} else {
															icmsField = record;
														}
														valorTotal += record.get('ccc_valor');
														valorDesconto += record.get('ccc_valor_desconto');
													});
													if (valorSubTotal > 0) {
														if (cte_modal == 1) {
															if (cidade_origem.cid_uf.toUpperCase() == 'MG' && cidade_destino.cid_uf.toUpperCase() == 'MG') {
																icms = 0;
															} else if (cidade_origem.cid_uf.search(new RegExp("MG|PR|RS|SC|SP", "gi")) > -1 && cidade_destino.cid_uf.search(new RegExp("AC|AL|AM|AP|BA|CE|DF|ES|GO|MA|MT|MS|PA|PB|PE|PI|RN|RO|RR|SE|TO","gi")) > -1 && destinatario.get('clie_contrib_icms')) {
																icms = 7;
															} else {
																icms = 12;
															}
														} else {
															icms = 4;
														}
													}
													
													if (icms > 0) {
														if (icmsField) {
															valorTotal = valorSubTotal / (1 - (icms / 100));
															valorIcms = valorTotal * (icms / 100);
															icmsField.set('ccc_valor', valorTotal - valorSubTotal);
															icmsField.set('ccc_tipo_tarifa', 'TAXA INCLUSA DE ICMS');
															icmsField.commit();
														} else {
															valorIcms = valorTotal * (icms / 100);
															percReduc.reset();
															percReduc.clearInvalid();
															percReduc.setDisabled(true);
														}
														sitTributaria.setValue('00 - Tributação normal do ICMS');
													} else {
														sitTributaria.setValue('40 - ICMS isenção');
													}
													
													form.findField('cte_aliquota_icms').setValue(Ext.util.Format.percent(icms));
													form.findField('cte_valor_icms').setValue(Ext.util.Format.brMoney(valorIcms));
													form.findField('cte_valor_bc').setValue(Ext.util.Format.brMoney(valorTotal));
													form.findField('cte_valor_total').setValue(valorTotal);
													form.findField('cte_valor_total_rotulo').setValue(Ext.util.Format.brMoney(valorTotal));
													form.findField('cte_valor_total_desconto_rotulo').setValue(Ext.util.Format.brMoney(valorDesconto));
													form.findField('cte_frete_manual').setValue(0);
													
													if (App.empresa.emp_simples_nacional) {
														sitTributaria.setValue('SIMPLES NACIONAL');
														
														var percReducBc = form.findField('cte_perc_reduc_bc'),
														valorBc = form.findField('cte_valor_bc'),
														icmsPerc = form.findField('cte_aliquota_icms'),
														icmsValor = form.findField('cte_valor_icms');
														outorgado = form.findField('cte_valor_cred_outorgado');
														
														percReducBc.reset();
														percReducBc.clearInvalid();
														percReducBc.setDisabled(true);
														
														valorBc.reset();
														valorBc.clearInvalid();
														valorBc.setDisabled(true);
														
														icmsPerc.reset();
														icmsPerc.clearInvalid();
														icmsPerc.setDisabled(true);
														
														icmsValor.reset();
														icmsValor.clearInvalid();
														icmsValor.setDisabled(true);
														
														outorgado.reset();
														outorgado.clearInvalid();
														outorgado.setDisabled(true);
													}
												}
											}
										});
									}
								}]
							},{
								items: [{
									xtype: 'hiddenfield',
									name: 'cte_frete_manual',
									flex: null,
									width: 0,
									value: 0,
									allowBlank: true
								},{
									xtype: 'displayfield',
									fieldLabel: 'Valor total do desconto',
									name: 'cte_valor_total_desconto_rotulo',
									value: 'R$ 0,00',
									labelStyle: 'font-size:10pt',
									fieldStyle: {
										textAlign: 'right',
										fontSize: '18pt',
										color: 'green'
									}
								},{
									xtype: 'displayfield',
									fieldLabel: 'Valor total da prestação do serviço incluindo desconto',
									name: 'cte_valor_total_rotulo',
									value: 'R$ 0,00',
									labelStyle: 'font-size:10pt',
									flex: 2,
									fieldStyle: {
										textAlign: 'right',
										fontSize: '18pt',
										color: 'blue'
									}
								},{
									xtype: 'hiddenfield',
									name: 'cte_valor_total',
									flex: null,
									width: 0,
									value: 0,
									allowBlank: true
								}]
							}]
						}]
					},{
						xtype: 'grid',
						itemId: 'cte-componente-frete-grid',
						title: 'Componentes do Valor da Prestação',
						autoHeight: true,
						minHeight: 200,
						defaults: null,
						sortableColumns: false,
						plugins: Ext.create('Ext.grid.plugin.CellEditing',{
							clicksToEdit: 2,
							listeners: {
								edit: function(editor, e) {
									if (e.field == 'ccc_percentual_desconto' && e.value != e.originalValue) {
										if (e.value > 0 && e.record.get('ccc_valor') > 0) {
											var valorDesconto = App.descontoPercentual(e.value, e.record.get('ccc_valor'));
											valorDesconto = Ext.util.Format.round(valorDesconto, 2);
											e.record.set('ccc_valor_desconto', e.record.get('ccc_valor') - valorDesconto);
											e.record.set('ccc_valor', valorDesconto);
										} else {
											e.record.set('ccc_valor_desconto', 0);
										}
									} else if (e.field == 'ccc_valor_desconto' && e.value != e.originalValue) {
										if (e.value > 0 && e.record.get('ccc_valor') > 0) {
											e.record.set('ccc_percentual_desconto', Ext.util.Format.round((e.value / e.record.get('ccc_valor')) * 100, 0));
											e.record.set('ccc_valor', e.record.get('ccc_valor') + e.originalValue - e.value);
										} else {
											e.record.set('ccc_percentual_desconto', 0);
										}
									}
									var form = me.getForm(), 
									icmsField, 
									icms = 0, 
									valorIcms = 0, 
									valorTotal = 0, 
									valorSubTotal = 0,
									valorDesconto = 0,
									
									destinatarioField = form.findField('clie_destinatario_id'),
									cidadeOrigemField = form.findField('cid_id_origem'),
									cidadeDestinoField = form.findField('cid_id_destino'),
									
									destinatario = destinatarioField.findRecordByValue(destinatarioField.getValue());
									cidade_origem = cidadeOrigemField.findRecordByValue(cidadeOrigemField.getValue()),
									cidade_destino = cidadeDestinoField.findRecordByValue(cidadeDestinoField.getValue()),
									
									cidade_origem = cidade_origem.data;
									cidade_destino = cidade_destino.data;
									
									cte_modal = form.findField('cte_modal').getValue(),
									percReduc = form.findField('cte_perc_reduc_bc'), 
									sitTributaria = form.findField('cte_codigo_sit_tributaria');
									
									e.grid.getStore().each(function(record) {
										if (record.get('cf_nome').search(new RegExp("ICMS", "gi")) < 0) {
											valorSubTotal += record.get('ccc_valor');
										} else {
											icmsField = record;
										}
										valorTotal += record.get('ccc_valor');
										valorDesconto += record.get('ccc_valor_desconto');
									});
									
									if (valorSubTotal > 0) {
										if (cte_modal == 1) {
											if (cidade_origem.cid_uf.toUpperCase() == 'MG' && cidade_destino.cid_uf.toUpperCase() == 'MG') {
												icms = 0;
											} else if (cidade_origem.cid_uf.search(new RegExp("MG|PR|RS|SC|SP", "gi")) > -1 && cidade_destino.cid_uf.search(new RegExp("AC|AL|AM|AP|BA|CE|DF|ES|GO|MA|MT|MS|PA|PB|PE|PI|RN|RO|RR|SE|TO","gi")) > -1 && destinatario.get('clie_contrib_icms')) {
												icms = 7;
											} else {
												icms = 12;
											}
										} else {
											icms = 4;
										}
									}
									
									if (e.field == 'ccc_valor' && e.record.get('cf_nome').search(new RegExp("ICMS", "gi")) >= 0) {
										if (e.value > 0) {
											valorTotal = valorSubTotal / (1 - (icms / 100));
											valorIcms = valorTotal * (icms / 100);
											//sitTributaria.setValue('90 - ICMS outros');
										} else {
											valorIcms = valorTotal * (icms / 100);
											//sitTributaria.setValue('40 - ICMS isenção');
										}
									} else if (icms > 0) {
										if (icmsField) {
											valorTotal = valorSubTotal / (1 - (icms / 100));
											valorIcms = valorTotal * (icms / 100);
											icmsField.set('ccc_valor', valorTotal - valorSubTotal);
											icmsField.set('ccc_tipo_tarifa', 'TAXA INCLUSA DE ICMS');
										} else {
											valorIcms = valorTotal * (icms / 100);
											percReduc.reset();
											percReduc.clearInvalid();
											percReduc.setDisabled(true);
										}
										sitTributaria.setValue('00 - Tributação normal do ICMS');
									} else {
										sitTributaria.setValue('40 - ICMS isenção');
									}
									
									form.findField('cte_aliquota_icms').setValue(Ext.util.Format.percent(icms));
									form.findField('cte_valor_icms').setValue(Ext.util.Format.brMoney(valorIcms));
									form.findField('cte_valor_bc').setValue(Ext.util.Format.brMoney(valorTotal));
									form.findField('cte_valor_total').setValue(valorTotal);
									form.findField('cte_valor_total_rotulo').setValue(Ext.util.Format.brMoney(valorTotal));
									form.findField('cte_valor_total_desconto_rotulo').setValue(Ext.util.Format.brMoney(valorDesconto));
									form.findField('cte_frete_manual').setValue(1);
									
									if (App.empresa.emp_simples_nacional) {
										sitTributaria.setValue('SIMPLES NACIONAL');
										
										var percReducBc = form.findField('cte_perc_reduc_bc'),
										valorBc = form.findField('cte_valor_bc'),
										icmsPerc = form.findField('cte_aliquota_icms'),
										icmsValor = form.findField('cte_valor_icms');
										outorgado = form.findField('cte_valor_cred_outorgado');
										
										percReducBc.reset();
										percReducBc.clearInvalid();
										percReducBc.setDisabled(true);
										
										valorBc.reset();
										valorBc.clearInvalid();
										valorBc.setDisabled(true);
										
										icmsPerc.reset();
										icmsPerc.clearInvalid();
										icmsPerc.setDisabled(true);
										
										icmsValor.reset();
										icmsValor.clearInvalid();
										icmsValor.setDisabled(true);
										
										outorgado.reset();
										outorgado.clearInvalid();
										outorgado.setDisabled(true);
									}
								}
							}
						}),
						store: Ext.create('Ext.data.JsonStore', {
							fields: [
								{name:'ccc_id', type:'int'},
								{name:'cte_id', type:'int'},
								{name:'cc_id', type:'int'},
								{name:'cf_id', type:'int'},
								{name:'cf_tipo', type:'int'},
								{name:'cf_nome', type:'string', defaultValue:''},
								{name:'cc_titulo', type:'string', defaultValue:''},
								{name:'ccc_tabela', type:'string', defaultValue:''},
								{name:'ccc_valor', type:'float', defaultValue:0},
								{name:'ccc_valor_tarifa_kg', type:'float', defaultValue:0},
								{name:'ccc_tipo_tarifa', type:'string', defaultValue:''},
								{name:'ccc_tipo_advalorem', type:'string', defaultValue:''},
								{name:'ccc_valor_desconto', type:'float', defaultValue:0},
								{name:'ccc_percentual_desconto', type:'float', defaultValue:0},
								{name:'ccc_exibir_valor_dacte', type:'boolean', defaultValue:1},
								{name:'ccc_exibir_desconto_dacte', type:'boolean', defaultValue:1}
							],
							autoLoad: false,
							autoDestroy: true,
							remoteSort: false,
							remoteGroup: false,
							remoteFilter: false,
							
							proxy: {
								type: 'ajax',
								url: 'mod/conhecimentos/ctes/php/response.php',
								filterParam: 'query',
								extraParams: {
									m: 'read_comp_calculo',
									cte_id: 0
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
								property: 'cf_tipo',
								direction: 'ASC'
							},{
								property: 'cf_id',
								direction: 'ASC'
							}]
						}),
						columns: [{
							dataIndex: 'cc_titulo',
							text: 'Título do componente',
							menuDisabled: true,
							flex: 1
						},{
							dataIndex: 'ccc_valor',
							text: 'Valor calculado do componente',
							align: 'right',
							menuDisabled: true,
							renderer: Ext.util.Format.brMoney,
							width: 180,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 999999.99
							}
						},{
							xtype: 'booleancolumn',
							dataIndex: 'ccc_exibir_valor_dacte',
							text: 'Exibir...',
							tooltip: 'Exibir valor na DACTE mesmo quando for zero',
							trueText:'Sim', 
							falseText: 'Não',
							align: 'center',
							menuDisabled: true,
							width: 50,
							editor: {
								xtype: 'checkbox',
								inputValue: 1
							}
						},{
							dataIndex: 'ccc_valor_tarifa_kg',
							text: 'Valor da tarifa por kg',
							align: 'right',
							menuDisabled: true,
							renderer: Ext.util.Format.brMoney,
							width: 140
						},{
							dataIndex: 'ccc_tipo_tarifa',
							text: 'Tipo de Tarifa/Descrição',
							menuDisabled: true,
							flex: 2
						},{
							dataIndex: 'ccc_percentual_desconto',
							text: 'Desconto (%)',
							align: 'center',
							menuDisabled: true,
							renderer: Ext.util.Format.percent,
							width: 90,
							editor: {
								xtype: 'percentfield',
								minValue: 0,
								maxValue: 99.99
							}
						},{
							dataIndex: 'ccc_valor_desconto',
							text: 'Desconto (R$)',
							align: 'right',
							menuDisabled: true,
							renderer: Ext.util.Format.brMoney,
							width: 90,
							editor: {
								xtype: 'decimalfield',
								minValue: 0,
								maxValue: 999999.99
							}
						},{
							xtype: 'booleancolumn',
							dataIndex: 'ccc_exibir_desconto_dacte',
							text: 'Exibir...',
							tooltip: 'Exibir desconto no campo de observações na DACTE',
							trueText:'Sim', 
							falseText: 'Não',
							align: 'center',
							menuDisabled: true,
							width: 50,
							editor: {
								xtype: 'checkbox',
								inputValue: 1
							}
						},{
							dataIndex: 'ccc_tabela',
							text: 'Origem de Cálculo',
							menuDisabled: true,
							width: 140
						}],
						dockedItems: [{
							xtype: 'toolbar',
							dock: 'bottom',
							items: [{
								text: 'Atualizar',
								iconCls: 'x-tbar-loading',
								handler: function(btn) {
									var originalText = btn.getText(),
									refreshText = 'Atualizando...';
									btn.setText(originalText == refreshText ? 'Atualizar' : 'Atualizando...');
									this.up('grid').getStore().reload({
										callback: function() {
											btn.setText(originalText);
										}
									});
								}
							}]
						}]
					},{
						style: {
							marginTop: 20
						},
						items: [{
							title: 'ICMS',
							items: [{
								items: [{
									xtype: 'localcombo',
									fieldLabel: 'Código da Situação Tributária',
									name: 'cte_codigo_sit_tributaria',
									value: App.empresa.emp_simples_nacional ? 'SIMPLES NACIONAL' : '00 - Tributação normal do ICMS',
									options: [
										'00 - Tributação normal do ICMS',
										'20 - Tributação com redução de BC do ICMS',
										'40 - ICMS isenção',
										'41 - ICMS não tributado',
										'51 - ICMS diferido',
										'60 - ICMS cobrado anteriormente por substituição tributária',
										'90 - ICMS outros',
										'90 - ICMS devido à UF de origem da prestação, quando diferente da UF emitente',
										'SIMPLES NACIONAL'
									],
									listeners: {
										select: function(field, records) {
											var form = me.getForm(), record = records[0],
											originalValue = field.getValue(),
											value = parseInt(originalValue.replace(/[^0-9]/gi, "")),
											percReducBc = form.findField('cte_perc_reduc_bc'),
											valorBc = form.findField('cte_valor_bc'),
											icmsPerc = form.findField('cte_aliquota_icms'),
											icmsValor = form.findField('cte_valor_icms');
											outorgado = form.findField('cte_valor_cred_outorgado');
											
											if (originalValue == 'SIMPLES NACIONAL') {
												percReducBc.reset();
												percReducBc.clearInvalid();
												percReducBc.setDisabled(true);
												
												valorBc.reset();
												valorBc.clearInvalid();
												valorBc.setDisabled(true);
												
												icmsPerc.reset();
												icmsPerc.clearInvalid();
												icmsPerc.setDisabled(true);
												
												icmsValor.reset();
												icmsValor.clearInvalid();
												icmsValor.setDisabled(true);
												
												outorgado.reset();
												outorgado.clearInvalid();
												outorgado.setDisabled(true);
											} else if (originalValue == '90 - ICMS devido à UF de origem da prestação, quando diferente da UF emitente') {
												outorgado.reset();
												outorgado.clearInvalid();
												outorgado.setDisabled(true);
											} else {
												var disabled = value == 0 || value == 40 || value == 41 || value == 51 || value == 60;
												if (disabled) {
													percReducBc.reset();
													percReducBc.clearInvalid();
												}
												percReducBc.setDisabled(disabled);
												
												disabled = value == 40 || value == 41 || value == 51 || value == 60;
												if (disabled) {
													valorBc.reset();
													valorBc.clearInvalid();
													
													icmsPerc.reset();
													icmsPerc.clearInvalid();
												
													icmsValor.reset();
													icmsValor.clearInvalid();
												}
												valorBc.setDisabled(disabled);
												icmsPerc.setDisabled(disabled);
												icmsValor.setDisabled(disabled);
												
												disabled = value == 0 || value == 20 || value == 40 || value == 41 || value == 51;
												if (disabled) {
													outorgado.reset();
													outorgado.clearInvalid();
												}
												outorgado.setDisabled(disabled);
											}
											
											form.isValid();
										}
									}
								}]
							},{
								items: [{
									xtype: 'percentfield',
									fieldLabel: 'Percentual de Redução da BC',
									name: 'cte_perc_reduc_bc',
									labelAlign: 'left',
									labelWidth: 230,
									disabled: true,
									minValue: 0,
									maxValue: 100,
									fieldStyle: {
										textAlign: 'right'
									}
								}]
							},{
								items: [{
									xtype: 'textfield',
									fieldLabel: 'Valor da BC do ICMS',
									name: 'cte_valor_bc',
									labelAlign: 'left',
									labelWidth: 230,
									readOnly: true,
									fieldStyle: {
										textAlign: 'right'
									}
								}]
							},{
								items: [{
									xtype: 'textfield',
									fieldLabel: 'Alíquota do ICMS',
									name: 'cte_aliquota_icms',
									labelAlign: 'left',
									labelWidth: 230,
									readOnly: true,
									fieldStyle: {
										textAlign: 'right'
									}
								}]
							},{
								items: [{
									xtype: 'textfield',
									fieldLabel: 'Valor do ICMS',
									name: 'cte_valor_icms',
									labelAlign: 'left',
									labelWidth: 230,
									readOnly: true,
									fieldStyle: {
										textAlign: 'right'
									}
								}]
							},{
								items: [{
									xtype: 'textfield',
									fieldLabel: 'Valor do crédito Outorgado/Presumido',
									name: 'cte_valor_cred_outorgado',
									labelAlign: 'left',
									labelWidth: 230,
									disabled: true,
									fieldStyle: {
										textAlign: 'right'
									}
								}]
							}]
						},{
							title: 'Informações adicionais de interesse do Fisco',
							items: [{
								items: [{
									xtype: 'textareafield',
									name: 'cte_info_fisco',
									hideLabel: true,
									allowBlank: true,
									maxLength: 2000,
									height: 202
								}]
							}]
						}]
					}]
				}]
			}],
			buttons: [{
				ui: 'blue-button',
				text: 'SALVAR',
				scale: 'medium',
				formBind: true,
				handler: me.save
			}]
		});
		me.callParent(arguments);
	},
	
	save: function(btn) {
		var me = this.up('cteform') || this, form = me.getForm();
		if (!form.isValid()) {
			return false;
		}
		
		var tp = me.down('tabpanel'),
		grid17 = tp.down('#cte-componente-frete-grid'),
		store17 = grid17.getStore();
		
		if (App.empresa.emp_tipo_emitente != 'ND') {
			var record = form.getRecord(), 
			semTomador = Ext.isEmpty(me.tabelaCliente) || Ext.isEmpty(me.tomTabela),
			notificar = function() {
				Ext.create('Ext.ux.Alert', {
					ui: 'black-alert',
					msg: 'Não foi possível encontrar a tabela do tomador. Deseja informar valor fechado?',
					closeText: 'CANCELAR',
					layout: 'form',
					items: [{
						xtype: 'form',
						bodyPadding: 5,
						defaults: {
							anchor: '100%',
							labelAlign: 'top',
							allowBlank: false,
							selectOnFocus: true
						},
						items: [{
							xtype: 'decimalfield',
							fieldLabel: 'Informe o valor total para fechamento do CT-e',
							name: 'valor_total_cte'
						}]
					}],
					buttons: [{
						ui: 'green-button',
						text: 'CONFIRMAR',
						autoClose: true,
						handler: function() {
							var aFORM = this.up('alert').down('form').getForm(),
							valorFechado = aFORM.findField('valor_total_cte').getValue(),
							destinatarioField = form.findField('clie_destinatario_id'),
							cidadeOrigemField = form.findField('cid_id_origem'),
							cidadeDestinoField = form.findField('cid_id_destino'),
							cte_modal = form.findField('cte_modal').getValue(),
							cidade_origem = cidadeOrigemField.findRecordByValue(cidadeOrigemField.getValue()),
							cidade_destino = cidadeDestinoField.findRecordByValue(cidadeDestinoField.getValue()),
							destinatario = destinatarioField.findRecordByValue(destinatarioField.getValue());
							
							if (Ext.isEmpty(cidade_destino) || Ext.isEmpty(cidade_origem)) {
								App.notify('ATENÇÃO! Cidade de Origem e Destino devem ser preenchidas, experimente selecionando novamente os registros nos campos de seleções no formulário.', 'red-alert');
								return false;
							}
							cidade_origem = cidade_origem.data;
							cidade_destino = cidade_destino.data;
							
							store17.getProxy().setExtraParam('m', 'read_valor_cheio');
							store17.getProxy().setExtraParam('valor_cheio', valorFechado);
							store17.load({
								callback: function(records) {
									var icmsField, icms = 0, valorIcms = 0, valorTotal = 0, valorSubTotal = 0, valorDesconto = 0,
									percReduc = form.findField('cte_perc_reduc_bc'), 
									sitTributaria = form.findField('cte_codigo_sit_tributaria');
									Ext.each(records, function(record) {
										if (record.get('cf_nome').search(new RegExp("ICMS", "gi")) < 0) {
											//valorSubTotal += (record.get('ccc_valor') - record.get('ccc_valor'));
											valorSubTotal += record.get('ccc_valor');
										} else {
											icmsField = record;
										}
										valorTotal += record.get('ccc_valor');
										valorDesconto += record.get('ccc_valor_desconto');
									});
									
									if (valorSubTotal > 0) {
										if (cte_modal == 1) {
											if (cidade_origem.cid_uf.toUpperCase() == 'MG' && cidade_destino.cid_uf.toUpperCase() == 'MG') {
												icms = 0;
											} else if (cidade_origem.cid_uf.search(new RegExp("MG|PR|RS|SC|SP", "gi")) > -1 && cidade_destino.cid_uf.search(new RegExp("AC|AL|AM|AP|BA|CE|DF|ES|GO|MA|MT|MS|PA|PB|PE|PI|RN|RO|RR|SE|TO","gi")) > -1 && destinatario.get('clie_contrib_icms')) {
												icms = 7;
											} else {
												icms = 12;
											}
										} else {
											icms = 4;
										}
									}
									
									if (icms > 0) {
										if (icmsField) {
											valorTotal = valorSubTotal / (1 - (icms / 100));
											valorIcms = valorTotal * (icms / 100);
											icmsField.set('ccc_valor', valorTotal - valorSubTotal);
											icmsField.set('ccc_tipo_tarifa', 'TAXA INCLUSA DE ICMS');
											icmsField.commit();
										} else {
											valorIcms = valorTotal * (icms / 100);
											percReduc.reset();
											percReduc.clearInvalid();
											percReduc.setDisabled(true);
										}
										sitTributaria.setValue('00 - Tributação normal do ICMS');
									} else {
										sitTributaria.setValue('40 - ICMS isenção');
									}
									
									form.findField('cte_aliquota_icms').setValue(Ext.util.Format.percent(icms));
									form.findField('cte_valor_icms').setValue(Ext.util.Format.brMoney(valorIcms));
									form.findField('cte_valor_bc').setValue(Ext.util.Format.brMoney(valorTotal));
									form.findField('cte_valor_total').setValue(valorTotal);
									form.findField('cte_valor_total_rotulo').setValue(Ext.util.Format.brMoney(valorTotal));
									form.findField('cte_valor_total_desconto_rotulo').setValue(Ext.util.Format.brMoney(valorDesconto));
									form.findField('cte_frete_manual').setValue(1);
									
									if (App.empresa.emp_simples_nacional) {
										sitTributaria.setValue('SIMPLES NACIONAL');
										
										var percReducBc = form.findField('cte_perc_reduc_bc'),
										valorBc = form.findField('cte_valor_bc'),
										icmsPerc = form.findField('cte_aliquota_icms'),
										icmsValor = form.findField('cte_valor_icms');
										outorgado = form.findField('cte_valor_cred_outorgado');
										
										percReducBc.reset();
										percReducBc.clearInvalid();
										percReducBc.setDisabled(true);
										
										valorBc.reset();
										valorBc.clearInvalid();
										valorBc.setDisabled(true);
										
										icmsPerc.reset();
										icmsPerc.clearInvalid();
										icmsPerc.setDisabled(true);
										
										icmsValor.reset();
										icmsValor.clearInvalid();
										icmsValor.setDisabled(true);
										
										outorgado.reset();
										outorgado.clearInvalid();
										outorgado.setDisabled(true);
									}
								}
							});
							form.findField('cte_frete_manual').setValue(1);
						}
					}]
				});
			};
			if (record) {
				if (semTomador && !record.get('cte_frete_manual')) {
					notificar();
					return false;
				}
			} else if (semTomador) {
				var freteManual = parseInt(form.findField('cte_frete_manual').getValue());
				if (!freteManual) {
					notificar();
					return false;
				}
			}
		}
		
		var tp = me.down('tabpanel'),
		//grid1 = tp.down('#cte-local-passagem-grid'),
		grid2 = tp.down('#cte-doc-nfe-grid'),
		grid3 = tp.down('#cte-doc-nf-grid'),
		grid4 = tp.down('#cte-doc-outros-grid'),
		grid5 = tp.down('#cte-cubagem-grid'),
		grid6 = tp.down('#cte-info-seguro-grid'),
		grid7 = tp.down('#cte-prod-perigosos-grid'),
		//grid8 = tp.down('#cte-eda-grid'),
		//grid9 = tp.down('#cte-dta-grid'),
		grid10 = tp.down('#cte-veiculos-novos-grid'),
		grid11 = tp.down('#cte-ordem-coleta-grid'),
		grid12 = tp.down('#cte-lacres-grid'),
		grid13 = tp.down('#cte-vale-pedagio-grid'),
		grid14 = tp.down('#cte-rodo-veiculos-grid'),
		grid15 = tp.down('#cte-motoristas-grid'),
		grid16 = tp.down('#cte-grid-obs-contrib-grid'),
		
		//store1 = grid1.getStore(),
		store2 = grid2.getStore(),
		store3 = grid3.getStore(),
		store4 = grid4.getStore(),
		store5 = grid5.getStore(),
		store6 = grid6.getStore(),
		store7 = grid7.getStore(),
		/*store8 = grid8.getStore(),
		store9 = grid9.getStore(),*/
		store10 = grid10.getStore(),
		store11 = grid11.getStore(),
		store12 = grid12.getStore(),
		store13 = grid13.getStore(),
		store14 = grid14.getStore(),
		store15 = grid15.getStore(),
		store16 = grid16.getStore(),
		
		//record1 = [],
		record2 = [],
		record3 = [],
		record4 = [],
		record5 = [],
		record6 = [],
		record7 = [],
		//record8 = [],
		//record9 = [],
		record10 = [],
		record11 = [],
		record12 = [],
		record13 = [],
		record14 = [],
		record15 = [],
		record16 = [],
		record17 = [];
		/*
		store1.each(function(record) {
			if (!Ext.isEmpty(record.get('loc_passagem')) && record.get('cid_id') > 0 && record.get('loc_id') > 0) {
				record1.push(record.data);
			}
		});
		*/
		store2.each(function(record) {
			//if (!Ext.isEmpty(record.get('cte_doc_chave_nfe')) && record.get('cte_doc_volumes') > 0) {
				record2.push(record.data);
			//}
		});
		
		store3.each(function(record) {
			//if (record.get('cte_doc_serie') > 0 && !Ext.isEmpty(record.get('cte_doc_numero')) && record.get('cte_doc_volumes') > 0) {
				record3.push(record.data);
			//}
		});
		
		store4.each(function(record) {
			//if (!Ext.isEmpty(record.get('cte_doc_numero')) && record.get('cte_doc_volumes') > 0) {
				record4.push(record.data);
			//}
		});
		
		var pesoCubado = 0, pesoBruto = 0, cubagem = 0, volumes = 0;
		store5.each(function(record) {
			if (!Ext.isEmpty(record.get('cte_dim_tipo_embalagem')) && record.get('cte_dim_volumes') > 0 && record.get('cte_dim_peso_bruto') > 0) {
				record5.push(record.data);
				volumes += record.get('cte_dim_volumes');
				cubagem += record.get('cte_dim_cubagem_m3');
				pesoBruto += record.get('cte_dim_peso_bruto');
				pesoCubado += record.get('cte_dim_peso_cubado');
			}
		});
		
		store6.each(function(record) {
			if (record.get('cte_seg_responsavel') > 0 && !Ext.isEmpty(record.get('cte_seg_responsavel_rotulo')) && !Ext.isEmpty(record.get('cte_seg_seguradora'))) {
				record6.push(record.data);
			}
		});
		
		store7.each(function(record) {
			if (record.get('prod_numero_onu') > 0 && !Ext.isEmpty(record.get('cte_pp_qtde_prod')) && !Ext.isEmpty(record.get('cte_pp_qtde_volumes'))) {
				record7.push(record.data);
			}
		});
		/*
		store8.each(function(record) {
			if (!Ext.isEmpty(record.get('cte_eda_raz_social_nome'))) {
				record8.push(record.data);
			}
		});
		
		store9.each(function(record) {
			if (!Ext.isEmpty(record.get('cte_dta_tpdoc_rotulo')) && !Ext.isEmpty(record.get('cte_dta_data_emissao'))) {
				record9.push(record.data);
			}
		});
		*/
		store10.each(function(record) {
			if (!Ext.isEmpty(record.get('cte_vn_chassi')) && !Ext.isEmpty(record.get('cte_vn_cor')) && !Ext.isEmpty(record.get('cte_vn_modelo'))) {
				record10.push(record.data);
			}
		});
		
		store11.each(function(record) {
			if (!Ext.isEmpty(record.get('oca_cnpj_emitente'))) {
				record11.push(record.data);
			}
		});
		
		store12.each(function(record) {
			if (!Ext.isEmpty(record.get('lac_numero'))) {
				record12.push(record.data);
			}
		});
		
		store13.each(function(record) {
			if (!Ext.isEmpty(record.get('cte_vp_cnpj_fornec')) && record.get('cte_vp_comprov_compra') > 0) {
				record13.push(record.data);
			}
		});
		
		store14.each(function(record) {
			if (!Ext.isEmpty(record.get('cte_rv_renavam'))) {
				record14.push(record.data);
			}
		});
		
		store15.each(function(record) {
			if (!Ext.isEmpty(record.get('cte_mo_cpf')) && !Ext.isEmpty(record.get('cte_mo_motorista'))) {
				record15.push(record.data);
			}
		});
		
		store16.each(function(record) {
			if (!Ext.isEmpty(record.get('cte_ocf_titulo')) && !Ext.isEmpty(record.get('cte_ocf_texto'))) {
				record16.push(record.data);
			}
		});
		
		store17.each(function(record) {
			record17.push(record.data);
		});
		
		var cte_tabela_id = 0;
		if (!Ext.isEmpty(me.tabelaCliente)) {
			cte_tabela_id = me.tabelaCliente[0][me.tabelaPrefix + 'id'];
		}
		
		if (!me.CTEGrid) {
			me.CTEGrid = Ext.ComponentQuery.query('ctesgrid');
			me.CTEGrid = Ext.isArray(me.CTEGrid) ? me.CTEGrid[0] : me.CTEGrid;
			if (!me.CTEGrid) {
				App.notify('Não foi possível localizar a grade de consulta dos conhecimentos, provavelmente foi fechada anteriormente. Caso contrário feche e abra novamente a guia Conhecimentos');
				return false;
			}
		}
		
		var originalText = btn.getText();
		btn.setText('SALVANDO...');
		btn.setDisabled(true);
		
		form.submit({
			clientValidation: true,
			url: 'mod/conhecimentos/ctes/php/response.php',
			method: 'post',
			params: {
				m: 'save_cte',
				cte_tabela_cliente: me.tomTabela,
				cte_tabela_id: cte_tabela_id,
				cte_peso_bruto: pesoBruto,
				cte_peso_cubado: pesoCubado,
				cte_cubagem_m3: cubagem,
				cte_qtde_volumes: volumes,
				ctes_documentos: record2.length > 0 ? Ext.encode(record2) : record3.length > 0 ? Ext.encode(record3) : record4.length > 0 ? Ext.encode(record4) : Ext.encode(new Array()),
				ctes_dimensoes: Ext.encode(record5),
				ctes_seguro: Ext.encode(record6),
				ctes_prod_perigosos: Ext.encode(record7),
				ctes_documentos_anteriores: Ext.encode(me.EDAData),
				//ctes_emitentes_ant: Ext.encode(record8),
				//ctes_doc_transp_ant: Ext.encode(record9),
				ctes_veiculos_novos: Ext.encode(record10),
				ctes_rod_coletas: Ext.encode(record11),
				ctes_rod_lacres: Ext.encode(record12),
				ctes_rod_vale_pedagio: Ext.encode(record13),
				ctes_rod_veiculos: Ext.encode(record14),
				ctes_rod_motoristas: Ext.encode(record15),
				ctes_obs_contr_fisco: Ext.encode(record16),
				ctes_comp_calculo: Ext.encode(record17)
			},
			failure: Ext.Function.createSequence(App.formFailure, function(){
				btn.setDisabled(false);
				btn.setText(originalText);
			}),
			success: function(f, a) {
				btn.setDisabled(false);
				btn.setText(originalText);
				
				var CTEStore = me.CTEGrid.getStore(),
				CTESM = me.CTEGrid.getSelectionModel();
				CTEStore.load({
					params: {
						cte_id: a.result.cte_id
					},
					callback: function(records) {
						CTESM.select(records);
						var record = CTEStore.findRecord('cte_id', a.result.cte_id);
						if (record) {
							if (App.empresa.emp_tipo_emitente == 'ND') {
								if (Ext.isEmpty(a.result.minuta_embarque)) {
									App.notify('Não foi possível gerar o PDF referente a Minuta de Embarque');
									me.newRecord();
								} else {
									Ext.create('Ext.ux.Alert', {
										ui: 'black-alert',
										msg: 'Conhecimento: "' + record.get('cte_numero') + '" e Minuta: "' + record.get('cte_minuta') + '" foi salvo com sucesso e encontra-se em digitação.<br/>O que você deseja fazer com esse conhecimento?',
										closeText: 'EDITAR',
										buttons: [{
											ui: 'green-button',
											text: 'FINALIZAR',
											autoClose: true,
											handler: function() {
												me.newRecord();
											}
										},{
											ui: 'red-button',
											text: 'ABRIR PDF',
											href: a.result.minuta_embarque,
											hrefTarget: '_blank'
										}]
									});
									window.open(a.result.minuta_embarque);
								}
							} else {
								var popup = Ext.create('Ext.ux.Alert', {
									ui: 'black-alert',
									msg: 'Conhecimento: "' + record.get('cte_numero') + '" e Minuta: "' + record.get('cte_minuta') + '" foi salvo com sucesso e encontra-se em digitação.<br/>O que você deseja fazer com esse conhecimento?',
									closeText: 'FECHAR',
									onCloseDialog: function() {
										me.newRecord();
									},
									buttons: [{
										ui: 'blue-button',
										text: 'VALIDAR',
										autoClose: false,
										handler: function() {
											var pbtn = this, pOriginalText = pbtn.getText();
											
											btn.setText('VALIDANDO...');
											btn.setDisabled(true);
											pbtn.setText('VALIDANDO...');
											pbtn.setDisabled(true);
											
											Ext.Ajax.request({
												url: 'mod/conhecimentos/ctes/php/response.php',
												method: 'post',
												params: {
													m: 'validar',
													cte_id: record.get('cte_id'),
													prod_id: record.get('prod_id'),
													cte_valor_carga: record.get('cte_valor_carga'),
													cte_tipo_do_cte: record.get('cte_tipo_do_cte'),
													cte_tipo_servico: record.get('cte_tipo_servico'),
													clie_remetente_id: record.get('clie_remetente_id'),
													clie_destinatario_id: record.get('clie_destinatario_id'),
													clie_expedidor_id: record.get('clie_expedidor_id'),
													clie_recebedor_id: record.get('clie_recebedor_id'),
													cte_chave_referenciado: record.get('cte_chave_referenciado'),
													cte_data_hora_emissao: record.get('cte_data_hora_emissao'),
													cte_valor_total: record.get('cte_valor_total'),
													cte_valor_icms: record.get('cte_valor_icms'),
													cte_modal: record.get('cte_modal'),
													cte_data_entrega_prevista: record.get('cte_data_entrega_prevista')
												},
												failure: Ext.Function.createSequence(App.ajaxFailure, function(){
													btn.setDisabled(false);
													btn.setText(originalText);
													pbtn.setDisabled(false);
													pbtn.setText(originalText);
												}),
												success: function(response) {
													var o = Ext.decode(response.responseText);
													o.erros = parseInt(o.erros);
													
													btn.setDisabled(false);
													btn.setText(originalText);
													pbtn.setDisabled(false);
													pbtn.setText(originalText);
													
													if (o.erros > 0 && !Ext.isEmpty(o.html)) {
														Ext.create('Ext.ux.Alert', {
															ui: 'red-alert',
															msg: o.html
														});
													} else {
														me.newRecord();
														record.set('cte_situacao', 'VALIDADO');
														popup.close();
													}
												}
											});
										}
									},{
										ui: 'green-button',
										text: 'VALIDAR E TRANSMITIR',
										autoClose: false,
										handler: function() {
											var pbtn = this, pOriginalText = pbtn.getText();
											
											btn.setText('VALIDANDO...');
											btn.setDisabled(true);
											pbtn.setText('VALIDANDO...');
											pbtn.setDisabled(true);
											
											Ext.Ajax.request({
												url: 'mod/conhecimentos/ctes/php/response.php',
												method: 'post',
												params: {
													m: 'validar',
													cte_id: record.get('cte_id'),
													prod_id: record.get('prod_id'),
													cte_valor_carga: record.get('cte_valor_carga'),
													cte_tipo_do_cte: record.get('cte_tipo_do_cte'),
													cte_tipo_servico: record.get('cte_tipo_servico'),
													clie_remetente_id: record.get('clie_remetente_id'),
													clie_destinatario_id: record.get('clie_destinatario_id'),
													clie_expedidor_id: record.get('clie_expedidor_id'),
													clie_recebedor_id: record.get('clie_recebedor_id'),
													cte_chave_referenciado: record.get('cte_chave_referenciado'),
													cte_data_hora_emissao: record.get('cte_data_hora_emissao'),
													cte_valor_total: record.get('cte_valor_total'),
													cte_valor_icms: record.get('cte_valor_icms'),
													cte_modal: record.get('cte_modal'),
													cte_data_entrega_prevista: record.get('cte_data_entrega_prevista')
												},
												failure: Ext.Function.createSequence(App.ajaxFailure, function(){
													btn.setDisabled(false);
													btn.setText(originalText);
													pbtn.setDisabled(false);
													pbtn.setText(pOriginalText);
												}),
												success: function(response1) {
													var o = Ext.decode(response1.responseText);
													o.erros = parseInt(o.erros);
													
													btn.setDisabled(false);
													btn.setText(originalText);
													pbtn.setDisabled(false);
													pbtn.setText(originalText);
													
													if (o.erros > 0 && !Ext.isEmpty(o.html)) {
														Ext.create('Ext.ux.Alert', {
															ui: 'red-alert',
															msg: o.html
														});
													} else {
														record.set('cte_situacao', 'VALIDADO');
														
														btn.setText('TRANSMITINDO...');
														btn.setDisabled(true);
														pbtn.setText('TRANSMITINDO...');
														pbtn.setDisabled(true);
														
														Ext.Ajax.request({
															url: 'mod/conhecimentos/ctes/php/response.php',
															method: 'post',
															params: {
																m: 'transmitir',
																id: record.get('cte_id')
															},
															failure: function(){
																btn.setDisabled(false);
																btn.setText(originalText);
																pbtn.setDisabled(false);
																pbtn.setText(originalText);
																
																CTEStore.load({params: {cte_id: a.result.cte_id}});
																me.newRecord();
																popup.close();
															},
															success: function(response2) {
																var o = Ext.decode(response2.responseText);
																
																btn.setDisabled(false);
																btn.setText(originalText);
																pbtn.setDisabled(false);
																pbtn.setText(originalText);
																
																if (o.success) {
																	CTEStore.load({params: {cte_id: a.result.cte_id}});
																	me.newRecord();
																	popup.close();
																} else {
																	App.warning(o);
																}
															}
														});
													}
												}
											});
										}
									}]
								});
							}
						} else {
							me.newRecord();
						}
					}
				});
			}
		});
	},
	
	setGrid: function(grid) {
		this.CTEGrid = grid;
	},
	
	newRecord: function() {
		var me = this, form = me.getForm();
		form.reset();
		
		me.EDAData = new Array();
		
		var tp = me.down('tabpanel'),
		grid1 = tp.down('#cte-local-passagem-grid'),
		grid2 = tp.down('#cte-doc-nfe-grid'),
		grid3 = tp.down('#cte-doc-nf-grid'),
		grid4 = tp.down('#cte-doc-outros-grid'),
		grid5 = tp.down('#cte-cubagem-grid'),
		grid6 = tp.down('#cte-info-seguro-grid'),
		grid7 = tp.down('#cte-prod-perigosos-grid'),
		grid8 = tp.down('#cte-eda-grid'),
		grid9 = tp.down('#cte-dta-grid'),
		grid10 = tp.down('#cte-veiculos-novos-grid'),
		grid11 = tp.down('#cte-ordem-coleta-grid'),
		grid12 = tp.down('#cte-lacres-grid'),
		grid13 = tp.down('#cte-vale-pedagio-grid'),
		grid14 = tp.down('#cte-rodo-veiculos-grid'),
		grid15 = tp.down('#cte-motoristas-grid'),
		grid16 = tp.down('#cte-grid-obs-contrib-grid'),
		grid17 = tp.down('#cte-componente-frete-grid'),
		
		store1 = grid1.getStore(),
		store2 = grid2.getStore(),
		store3 = grid3.getStore(),
		store4 = grid4.getStore(),
		store5 = grid5.getStore(),
		store6 = grid6.getStore(),
		store7 = grid7.getStore(),
		store8 = grid8.getStore(),
		store9 = grid9.getStore(),
		store10 = grid10.getStore(),
		store11 = grid11.getStore(),
		store12 = grid12.getStore(),
		store13 = grid13.getStore(),
		store14 = grid14.getStore(),
		store15 = grid15.getStore(),
		store16 = grid16.getStore(),
		store17 = grid17.getStore();
		
		store1.getProxy().setExtraParam('cid_id', 0);
		store1.removeAll();
		
		store2.getProxy().setExtraParam('cte_id', 0);
		store2.removeAll();
		
		store3.getProxy().setExtraParam('cte_id', 0);
		store3.removeAll();
		
		store4.getProxy().setExtraParam('cte_id', 0);
		store4.removeAll();
		
		store5.getProxy().setExtraParam('cte_id', 0);
		store5.removeAll();
		
		store6.getProxy().setExtraParam('cte_id', 0);
		store6.removeAll();
		
		store7.getProxy().setExtraParam('cte_id', 0);
		store7.removeAll();
		
		store8.getProxy().setExtraParam('cte_id', 0);
		store8.removeAll();
		
		store9.getProxy().setExtraParam('cte_eda_id', 0);
		store9.removeAll();
		
		store10.getProxy().setExtraParam('cte_id', 0);
		store10.removeAll();
		
		store11.getProxy().setExtraParam('cte_id', 0);
		store11.removeAll();
		
		store12.getProxy().setExtraParam('cte_id', 0);
		store12.removeAll();
		
		store13.getProxy().setExtraParam('cte_id', 0);
		store13.removeAll();
		
		store14.getProxy().setExtraParam('cte_id', 0);
		store14.removeAll();
		
		store15.getProxy().setExtraParam('cte_id', 0);
		store15.removeAll();
		
		store16.getProxy().setExtraParam('cte_id', 0);
		store16.removeAll();
		
		store17.getProxy().setExtraParam('cte_id', 0);
		store17.getProxy().setExtraParam('m', 'read_comp_calculo');
		store17.removeAll();
		
		tp.setActiveTab(0);
		me.activeIndexTab = 0;
		
		form.isValid();
		setTimeout(function(){
			form.findField('cte_remetente').focus();
		}, 600);
	},
	
	loadRecord: function(record) {
		if (!record) {
			return false;
		}
		
		var me = this, form = me.getForm();
		form.reset();
		form.loadRecord(record);
		
		form.findField('cte_situacao').setValue('DIGITAÇÃO');
		form.findField('cte_numero_rotulo').setValue(record.get('cte_numero'));
		form.findField('cte_peso_taxado').setValue(Ext.util.Format.brDecimal(record.get('cte_peso_bc')) + ' kg');
		form.findField('cte_valor_mercadoria').setValue(Ext.util.Format.brMoney(record.get('cte_valor_carga')));
		form.findField('cte_valor_total_rotulo').setValue(Ext.util.Format.brMoney(record.get('cte_valor_total')));
		
		form.findField('cte_valor_bc').setValue(Ext.util.Format.brMoney(record.get('cte_valor_bc')));
		form.findField('cte_valor_icms').setValue(Ext.util.Format.brMoney(record.get('cte_valor_icms')));
		form.findField('cte_aliquota_icms').setValue(Ext.util.Format.percent(record.get('cte_aliquota_icms')));
		
		var tp = me.down('tabpanel'),
		grid1 = tp.down('#cte-local-passagem-grid'),
		grid2 = tp.down('#cte-doc-nfe-grid'),
		grid3 = tp.down('#cte-doc-nf-grid'),
		grid4 = tp.down('#cte-doc-outros-grid'),
		grid5 = tp.down('#cte-cubagem-grid'),
		grid6 = tp.down('#cte-info-seguro-grid'),
		grid7 = tp.down('#cte-prod-perigosos-grid'),
		grid8 = tp.down('#cte-eda-grid'),
		grid9 = tp.down('#cte-dta-grid'),
		grid10 = tp.down('#cte-veiculos-novos-grid'),
		grid11 = tp.down('#cte-ordem-coleta-grid'),
		grid12 = tp.down('#cte-lacres-grid'),
		grid13 = tp.down('#cte-vale-pedagio-grid'),
		grid14 = tp.down('#cte-rodo-veiculos-grid'),
		grid15 = tp.down('#cte-motoristas-grid'),
		grid16 = tp.down('#cte-grid-obs-contrib-grid'),
		grid17 = tp.down('#cte-componente-frete-grid'),
		
		store1 = grid1.getStore(),
		store2 = grid2.getStore(),
		store3 = grid3.getStore(),
		store4 = grid4.getStore(),
		store5 = grid5.getStore(),
		store6 = grid6.getStore(),
		store7 = grid7.getStore(),
		store8 = grid8.getStore(),
		store9 = grid9.getStore(),
		store10 = grid10.getStore(),
		store11 = grid11.getStore(),
		store12 = grid12.getStore(),
		store13 = grid13.getStore(),
		store14 = grid14.getStore(),
		store15 = grid15.getStore(),
		store16 = grid16.getStore(),
		store17 = grid17.getStore();
		
		store1.getProxy().setExtraParam('cid_id', record.get('cid_id_destino'));
		store1.load();
		
		store2.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store2.load();
		
		store3.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store3.load();
		
		store4.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store4.load();
		
		store5.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store5.load();
		
		store6.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store6.load();
		
		store7.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store7.load();
		
		store8.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store8.load();
		
		store10.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store10.load();
		
		store11.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store11.load();
		
		store12.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store12.load();
		
		store13.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store13.load();
		
		store14.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store14.load();
		
		store15.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store15.load();
		
		store16.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store16.load();
		
		store17.getProxy().setExtraParam('cte_id', record.get('cte_id'));
		store17.load({
			callback: function(records) {
				var valorDesconto = 0;
				Ext.each(records, function(record) {
					valorDesconto += record.get('ccc_valor_desconto');
				});
				form.findField('cte_valor_total_desconto_rotulo').setValue(Ext.util.Format.brMoney(valorDesconto));
			}
		});
		
		form.isValid();
		setTimeout(function(){
			form.findField('cte_remetente').focus();
		}, 600);
		
		setTimeout(function(){
			if (record.get('prod_id') > 0) {
				form.findField('prod_id').setValue(record.get('prod_id'));
			}
			if (record.get('cid_id_origem') > 0) {
				form.findField('cid_id_origem').setValue(record.get('cid_id_origem'));
			}
			if (record.get('cid_id_destino') > 0) {
				form.findField('cid_id_destino').setValue(record.get('cid_id_destino'));
			}
			if (record.get('cid_id_passagem') > 0) {
				form.findField('cid_id_passagem').setValue(record.get('cid_id_passagem'));
			}
			if (record.get('cid_id_etiqueta_entrega') > 0) {
				form.findField('cid_id_etiqueta_entrega').setValue(record.get('cid_id_etiqueta_entrega'));
			}
		}, 3000);
	},
	
	activeIndexTab: 0,
	
	prevTab: function() {
		var me = this, tp = me.down('tabpanel'), 
		nextTab = me.activeIndexTab - 1;
		if (nextTab < 0) {
			nextTab = 0;
		}
		var tab = tp.getComponent(nextTab).tab, visible = tab.isVisible();
		while (visible === false) {
			nextTab--;
			tab = tp.getComponent(nextTab);
			if (tab) {
				tab = tab.tab;
				visible = tab.isVisible();
			} else {
				nextTab = 0;
				break;
			}
		}
		tp.setActiveTab(nextTab);
		me.activeIndexTab = nextTab;
	},
	
	nextTab: function() {
		var me = this, tp = me.down('tabpanel'), 
		nextTab = me.activeIndexTab + 1;
		if (nextTab >= tp.items.length) {
			nextTab = tp.items.length - 1;
		}
		var tab = tp.getComponent(nextTab).tab, visible = tab.isVisible();
		while (visible === false) {
			nextTab++;
			tab = tp.getComponent(nextTab);
			if (tab) {
				tab = tab.tab;
				visible = tab.isVisible();
			} else {
				nextTab = 0;
				break;
			}
		}
		tp.setActiveTab(nextTab);
		me.activeIndexTab = nextTab;
	},
	
	totalizarDocumentos: function() {
		var me = this.up('cteform') || this, form = me.getForm(), totais = {
			volumes: 0,
			quantidade: 0,
			valorCarga: 0,
			peso: 0
		};
		
		me.down('#cte-doc-nf-grid').getStore().each(function(record) {
			totais.volumes += record.get('cte_doc_volumes');
			totais.valorCarga += record.get('cte_doc_valor_nota');
			totais.peso += record.get('cte_doc_peso_total');
			totais.quantidade ++;
		});
		
		me.down('#cte-doc-nfe-grid').getStore().each(function(record) {
			totais.volumes += record.get('cte_doc_volumes');
			totais.valorCarga += record.get('cte_doc_valor_nota');
			totais.peso += record.get('cte_doc_peso_total');
			totais.quantidade ++;
		});
		
		me.down('#cte-doc-outros-grid').getStore().each(function(record) {
			totais.volumes += record.get('cte_doc_volumes');
			totais.valorCarga += record.get('cte_doc_valor_nota');
			totais.peso += record.get('cte_doc_peso_total');
			totais.quantidade ++;
		});
		return totais;
	},
	
	totalizarNotas: function() {
		var me = this.up('cteform') || this, form = me.getForm(), totais = {
			volumes: 0,
			quantidade: 0,
			valorCarga: 0
		};
		
		me.down('#cte-doc-nf-grid').getStore().each(function(record) {
			totais.volumes += record.get('cte_doc_volumes');
			totais.valorCarga += record.get('cte_doc_valor_nota');
			totais.quantidade ++;
		});
		
		me.down('#cte-doc-nfe-grid').getStore().each(function(record) {
			totais.volumes += record.get('cte_doc_volumes');
			totais.valorCarga += record.get('cte_doc_valor_nota');
			totais.quantidade ++;
		});
		
		return totais;
	},
	
	onDefaultActivate: function() {
		var me = this.up('cteform') || this, form = me.getForm(), valorCarga = 0;
		me.down('#cte-doc-nf-grid').getStore().each(function(record) {
			valorCarga += record.get('cte_doc_valor_nota');
		});
		if (!valorCarga) {
			me.down('#cte-doc-nfe-grid').getStore().each(function(record) {
				valorCarga += record.get('cte_doc_valor_nota');
			});
		}
		if (!valorCarga) {
			me.down('#cte-doc-outros-grid').getStore().each(function(record) {
				valorCarga += record.get('cte_doc_valor_nota');
			});
		}
		form.findField('cte_valor_carga').setValue(valorCarga);
		form.findField('cte_valor_carga_rotulo').setValue(Ext.util.Format.brMoney(valorCarga));
	}
});