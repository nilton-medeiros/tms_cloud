/**
 * Portuguese/Brazil Translation by Weber Souza
 * 08 April 2007
 * Updated by Allan Brazute Alves (EthraZa)
 * 06 September 2007
 * Updated by Leonardo Lima
 * 05 March 2008
 * Updated by Juliano Tarini (jtarini)
 * 22 April 2008
 */
Ext.onReady(function() {
    var cm = Ext.ClassManager,
        exists = Ext.Function.bind(cm.get, cm);

    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Carregando...</div>';
    }
    
    Ext.define("Ext.locale.pt_BR.grid.Panel", {
        override: "Ext.grid.Panel",
        ddText: "{0} registro(s) selecionado(s)",
        emptyText: "Nenhum item encontrado",
        emptyTextStart: "Comece pesquisando...",
        emptyCls: Ext.baseCSSPrefix + 'grid-empty',
        
        colEditorIndex: null,
        
        startEdit: function() {
        	var grid = this, editor = grid.getPlugin('cellplugin');
			if (editor && grid.getStore().getCount() > 0) {
				if (!grid.colEditorIndex) {
					var i = j = 0, length = grid.columns.length, column;
					for (i = 0; i < length; i++) {
						column = grid.columns[i];
						if (column.hasOwnProperty('editor')) {
							if (!Ext.isEmpty(column.editor)) {
								grid.colEditorIndex = i;
								break;
							}
						} else if (column.hasOwnProperty('columns')) {
							for (j = 0; j < grid.columns[i].columns.length; j++) {
								column = grid.columns[i].columns[j];
								if (column.hasOwnProperty('editor')) {
									if (!Ext.isEmpty(column.editor)) {
										grid.colEditorIndex = i;
										break;
									}
								}
							}
						}
					}
				}
				var rowIndex = 0, selections = grid.down('gridview').getSelectionModel().getSelection();
				if (selections.length == 1) {
					rowIndex = grid.getStore().indexOf(selections[0]);
				}
				editor.startEditByPosition({row: rowIndex, column: grid.colEditorIndex});
			}
		},
		
        initComponent: function() {
        	var me = this;
        	me.callParent(arguments);
        	me.on('afterrender', function() {
        		me.getEl().on('keydown', function(e) {
					if (e.getKey() == e.F2) {
						me.startEdit();
					}
				});
        	});
        }
    });
	Ext.define("Ext.locale.pt_BR.tree.Panel", {
		override: "Ext.tree.Panel",
		/*
		isContainerPanel : function() {
			return !this.items || !!this.child('treepanel');
		},
		
		onRootChange: function(root) {
			if (!this.isContainerPanel()) {
				this.callOverridden(arguments);
			}
		},
		
		constructor: function(config) {
			config = config || {};
			this.enableAnimations = false;  // PATCH
			delete config.animate;
			this.callParent(config);
			this.onRootChange(this.store.getRootNode());// PATCH
		},
		*/
        findLeafNodes: function(rNode) {
			rNode = rNode || this.getRootNode();
			var childNodes = rNode.childNodes;
			if (childNodes.length) {
				var i, child, found, nodes = new Array();
				for(i=0; i<childNodes.length; i++) {
					child = childNodes[i];
					if (child.isLeaf()) {
						nodes.push(child);
					} else {
						found = this.findLeafNodes(child);
						if (found) nodes = Ext.Array.merge(found, nodes);
					}
				}
				return nodes;
			} else {
				return null;
			}
		},
		
		getParentNodesId: function(parentId) {
			var me = this, 
			store = me.getStore(),
			nodes = [],
			recursive = function(node) {
				if (node) {
					if (node.isLeaf()) {
						node = store.getNodeById(node.parentId);
						recursive(node);
					} else {
						nodes.push(node.get('id'));
					}
				}
			};
			var targetNode = store.getNodeById(parentId);
			if (targetNode) {
				recursive(targetNode);
			}
			return nodes;
		},
		
		expandNodeById : function(targetId, parentId) {
			var me = this, 
			store = me.getStore(),
			rootNode = store.getRootNode(),
			parentNodes = me.getParentNodesId(parentId);
			parentNodes = Ext.Array.merge(parentNodes, Ext.Array.from(targetId));
			var i=0 ;
			for (; i<parentNodes.length; ++i) {
				parentNodes[i] = parseInt(parentNodes[i]);
			}
			me.store.load({
				callback: function() {
					var cascade = function(node) {
						if (parentNodes.indexOf(node.get('id')) > -1) {
							node.expand(false, function(){
								me.scrollToNode(node);
								if (node.hasChildNodes()) {
									Ext.each(node.childNodes, function(child){
										cascade(child);
									});
								}
							});
						}
					};
					Ext.each(rootNode.childNodes, function(child){cascade(child);});
				}
			});
		},
		
		scrollToNode: function(node) {
			var view = this.down('treeview'),
			nodeHTML = view.getNode(node);
			if (nodeHTML) {
				view.getEl().scrollChildIntoView(nodeHTML);
			}
		}
	});
	Ext.define("Ext.locale.pt_BR.button.Button", {
		override: "Ext.button.Button",
		
		click : function() {
			if (!this.disabled) {
				if (this.enableToggle && (this.allowDepress !== false || !this.pressed)) {
					this.toggle();
				}
				if (this.menu && !this.menu.isVisible() && !this.ignoreNextClick) {
					this.showMenu();
				}
				this.fireEvent("click", this);
				if (this.handler) {
					this.handler.call(this.scope || this, this);
				}
			}
		}
	});
	Ext.define("Ext.locale.pt_BR.grid.plugin.DragDrop", {
		override: "Ext.grid.plugin.DragDrop",
        dragText: "{0} registro{1} selecionado{1}"
	});
	Ext.define("Ext.locale.pt_BR.tree.plugin.DragDrop", {
		override: "Ext.tree.plugin.TreeViewDragDrop",
        dragText: "{0} registro{1} selecionado{1}"
	});
	Ext.define("Ext.locale.pt_BR.grid.feature.Grouping", {
        override: "Ext.grid.feature.Grouping",
        groupByText: 'Agrupar coluna',
        showGroupsText: 'Mostrar em grupo' 
    });
    
    Ext.define("Ext.locale.pt_BR.grid.Lockable", {
    	override: "Ext.grid.Lockable",
    	unlockText: 'Descongelar coluna',
    	lockText: 'Congelar coluna'
    });
    
    Ext.define("Ext.locale.pt_BR.TabPanelItem", {
        override: "Ext.TabPanelItem",
        closeText: "Fechar"
    });

    Ext.define("Ext.locale.pt_BR.form.field.Base", {
        override: "Ext.form.field.Base",
        invalidText: "O valor para este campo é inválido"
    });

    // changing the msg text below will affect the LoadMask
    Ext.define("Ext.locale.pt_BR.view.AbstractView", {
        override: "Ext.view.AbstractView",
        msg: "Carregando...",
        loadingText: "Carregando...",
        preserveScrollOnRefresh: true
    });
	Ext.define("Ext.locale.pt_BR.view.View", {
        override: "Ext.view.View",
        emptyText: "",
        preserveScrollOnRefresh: true
    });
    Ext.define("Ext.locale.pt_BR.LoadMask", {
        override: "Ext.LoadMask",
        msg: "Carregando...",
        loadingText: "Carregando..." 
    });
    
    Ext.define("Ext.locale.pt_BR.FiltersFeature", {
    	override: "Ext.ux.grid.FiltersFeature",
    	menuFilterText :  'Filtro'
    });
        
    Ext.define("Ext.locale.pt_BR.ListMenu", {
    	override: "Ext.ux.grid.menu.ListMenu",
    	labelField :  'Texto',
    	loadingText : 'Carregando...'
    });
    
    Ext.define("Ext.locale.pt_BR.RangeMenu", {
    	override: "Ext.ux.grid.menu.RangeMenu",
    	fieldLabels: {
	        gt: 'Maior que',
	        lt: 'Menor que',
	        eq: 'Igual'
        },
        menuItemCfgs : {
        	emptyText: 'Informe um número...',
        	selectOnFocus: true,
        	width: 155
        }
	});
	
	Ext.define("Ext.locale.pt_BR.DateFilter", {
    	override: "Ext.ux.grid.filter.DateFilter",
    	afterText : 'Depois',
	    beforeText : 'Antes',
	    onText : 'Em',
	    dateFormat: 'd/m/Y'
	});
	
	Ext.define("Ext.locale.pt_BR.BooleanFilter", {
    	override: "Ext.ux.grid.filter.BooleanFilter",
    	yesText : 'Sim',
    	noText : 'Não'
	});
	
    if (Ext.Date) {
        Ext.Date.monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        Ext.Date.getShortMonthName = function(month) {
            return Ext.Date.monthNames[month].substring(0, 3);
        };

        Ext.Date.monthNumbers = {
            Jan: 0,
            Fev: 1,
            Mar: 2,
            Abr: 3,
            Mai: 4,
            Jun: 5,
            Jul: 6,
            Ago: 7,
            Set: 8,
            Out: 9,
            Nov: 10,
            Dez: 11
        };

        Ext.Date.getMonthNumber = function(name) {
            return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        };

        Ext.Date.dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    }

    if (Ext.MessageBox) {
        Ext.MessageBox.buttonText = {
            ok: "OK",
            cancel: "Cancelar",
            yes: "Sim",
            no: "Não"
        };
    }
    
	if (exists('Ext.String')) {
		Ext.apply(Ext.String, {
			addslashes: function(str) {
				return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
			}
		});
	}
	
    if (exists('Ext.util.Format')) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: 'R$ ',
            // Brazilian Real
            dateFormat: 'd/m/Y',
            
            DateDiff: {
            	inDays: function(d1, d2) {
            		d1 = d1 || new Date();
            		d2 = d2 || new Date();
            		var t2 = d2.getTime();
            		var t1 = d1.getTime();
            		return Math.ceil((t2-t1)/(24*3600*1000));
            	},
            	inWeeks: function(d1, d2) {
            		d1 = d1 || new Date();
            		d2 = d2 || new Date();
            		var t2 = d2.getTime();
            		var t1 = d1.getTime();
            		return Math.ceil((t2-t1)/(24*3600*1000*7));
            	},
            	inMonths: function(d1, d2) {
            		d1 = d1 || new Date();
            		d2 = d2 || new Date();
            		var d1Y = d1.getFullYear();
            		var d2Y = d2.getFullYear();
            		var d1M = d1.getMonth();
            		var d2M = d2.getMonth();
            		return Math.ceil((d2M+12*d2Y)-(d1M+12*d1Y));
            	},
            	inYears: function(d1, d2) {
            		d1 = d1 || new Date();
            		d2 = d2 || new Date();
            		return Math.ceil(d2.getFullYear()-d1.getFullYear());
            	}
            }
        });
        Ext.util.Format.capitalizewords = function(v) {
        	var letters = "\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00DF-\\u00F6\\u00F8-\\u00FF\\u0101\\u0103\\u0105\\u0107\\u0109\\u010B\\u010D\\u010F\\u0111\\u0113\\u0115\\u0117\\u0119\\u011B\\u011D\\u011F\\u0121\\u0123\\u0125\\u0127\\u0129\\u012B\\u012D\\u012F\\u0131\\u0133\\u0135\\u0137\\u0138\\u013A\\u013C\\u013E\\u0140\\u0142\\u0144\\u0146\\u0148\\u0149\\u014B\\u014D\\u014F\\u0151\\u0153\\u0155\\u0157\\u0159\\u015B\\u015D\\u015F\\u0161\\u0163\\u0165\\u0167\\u0169\\u016B\\u016D\\u016F\\u0171\\u0173\\u0175\\u0177\\u017A\\u017C\\u017E-\\u0180\\u0183\\u0185\\u0188\\u018C\\u018D\\u0192\\u0195\\u0199-\\u019B\\u019E\\u01A1\\u01A3\\u01A5\\u01A8\\u01AA\\u01AB\\u01AD\\u01B0\\u01B4\\u01B6\\u01B9\\u01BA\\u01BD-\\u01BF\\u01C6\\u01C9\\u01CC\\u01CE\\u01D0\\u01D2\\u01D4\\u01D6\\u01D8\\u01DA\\u01DC\\u01DD\\u01DF\\u01E1\\u01E3\\u01E5\\u01E7\\u01E9\\u01EB\\u01ED\\u01EF\\u01F0\\u01F3\\u01F5\\u01F9\\u01FB\\u01FD\\u01FF\\u0201\\u0203\\u0205\\u0207\\u0209\\u020B\\u020D\\u020F\\u0211\\u0213\\u0215\\u0217\\u0219\\u021B\\u021D\\u021F\\u0221\\u0223\\u0225\\u0227\\u0229\\u022B\\u022D\\u022F\\u0231\\u0233-\\u0239\\u023C\\u023F\\u0240\\u0242\\u0247\\u0249\\u024B\\u024D\\u024F-\\u0293\\u0295-\\u02AF\\u0371\\u0373\\u0377\\u037B-\\u037D\\u0390\\u03AC-\\u03CE\\u03D0\\u03D1\\u03D5-\\u03D7\\u03D9\\u03DB\\u03DD\\u03DF\\u03E1\\u03E3\\u03E5\\u03E7\\u03E9\\u03EB\\u03ED\\u03EF-\\u03F3\\u03F5\\u03F8\\u03FB\\u03FC\\u0430-\\u045F\\u0461\\u0463\\u0465\\u0467\\u0469\\u046B\\u046D\\u046F\\u0471\\u0473\\u0475\\u0477\\u0479\\u047B\\u047D\\u047F\\u0481\\u048B\\u048D\\u048F\\u0491\\u0493\\u0495\\u0497\\u0499\\u049B\\u049D\\u049F\\u04A1\\u04A3\\u04A5\\u04A7\\u04A9\\u04AB\\u04AD\\u04AF\\u04B1\\u04B3\\u04B5\\u04B7\\u04B9\\u04BB\\u04BD\\u04BF\\u04C2\\u04C4\\u04C6\\u04C8\\u04CA\\u04CC\\u04CE\\u04CF\\u04D1\\u04D3\\u04D5\\u04D7\\u04D9\\u04DB\\u04DD\\u04DF\\u04E1\\u04E3\\u04E5\\u04E7\\u04E9\\u04EB\\u04ED\\u04EF\\u04F1\\u04F3\\u04F5\\u04F7\\u04F9\\u04FB\\u04FD\\u04FF\\u0501\\u0503\\u0505\\u0507\\u0509\\u050B\\u050D\\u050F\\u0511\\u0513\\u0515\\u0517\\u0519\\u051B\\u051D\\u051F\\u0521\\u0523\\u0525\\u0561-\\u0587\\u1D00-\\u1D2B\\u1D62-\\u1D77\\u1D79-\\u1D9A\\u1E01\\u1E03\\u1E05\\u1E07\\u1E09\\u1E0B\\u1E0D\\u1E0F\\u1E11\\u1E13\\u1E15\\u1E17\\u1E19\\u1E1B\\u1E1D\\u1E1F\\u1E21\\u1E23\\u1E25\\u1E27\\u1E29\\u1E2B\\u1E2D\\u1E2F\\u1E31\\u1E33\\u1E35\\u1E37\\u1E39\\u1E3B\\u1E3D\\u1E3F\\u1E41\\u1E43\\u1E45\\u1E47\\u1E49\\u1E4B\\u1E4D\\u1E4F\\u1E51\\u1E53\\u1E55\\u1E57\\u1E59\\u1E5B\\u1E5D\\u1E5F\\u1E61\\u1E63\\u1E65\\u1E67\\u1E69\\u1E6B\\u1E6D\\u1E6F\\u1E71\\u1E73\\u1E75\\u1E77\\u1E79\\u1E7B\\u1E7D\\u1E7F\\u1E81\\u1E83\\u1E85\\u1E87\\u1E89\\u1E8B\\u1E8D\\u1E8F\\u1E91\\u1E93\\u1E95-\\u1E9D\\u1E9F\\u1EA1\\u1EA3\\u1EA5\\u1EA7\\u1EA9\\u1EAB\\u1EAD\\u1EAF\\u1EB1\\u1EB3\\u1EB5\\u1EB7\\u1EB9\\u1EBB\\u1EBD\\u1EBF\\u1EC1\\u1EC3\\u1EC5\\u1EC7\\u1EC9\\u1ECB\\u1ECD\\u1ECF\\u1ED1\\u1ED3\\u1ED5\\u1ED7\\u1ED9\\u1EDB\\u1EDD\\u1EDF\\u1EE1\\u1EE3\\u1EE5\\u1EE7\\u1EE9\\u1EEB\\u1EED\\u1EEF\\u1EF1\\u1EF3\\u1EF5\\u1EF7\\u1EF9\\u1EFB\\u1EFD\\u1EFF-\\u1F07\\u1F10-\\u1F15\\u1F20-\\u1F27\\u1F30-\\u1F37\\u1F40-\\u1F45\\u1F50-\\u1F57\\u1F60-\\u1F67\\u1F70-\\u1F7D\\u1F80-\\u1F87\\u1F90-\\u1F97\\u1FA0-\\u1FA7\\u1FB0-\\u1FB4\\u1FB6\\u1FB7\\u1FBE\\u1FC2-\\u1FC4\\u1FC6\\u1FC7\\u1FD0-\\u1FD3\\u1FD6\\u1FD7\\u1FE0-\\u1FE7\\u1FF2-\\u1FF4\\u1FF6\\u1FF7\\u210A\\u210E\\u210F\\u2113\\u212F\\u2134\\u2139\\u213C\\u213D\\u2146-\\u2149\\u214E\\u2184\\u2C30-\\u2C5E\\u2C61\\u2C65\\u2C66\\u2C68\\u2C6A\\u2C6C\\u2C71\\u2C73\\u2C74\\u2C76-\\u2C7C\\u2C81\\u2C83\\u2C85\\u2C87\\u2C89\\u2C8B\\u2C8D\\u2C8F\\u2C91\\u2C93\\u2C95\\u2C97\\u2C99\\u2C9B\\u2C9D\\u2C9F\\u2CA1\\u2CA3\\u2CA5\\u2CA7\\u2CA9\\u2CAB\\u2CAD\\u2CAF\\u2CB1\\u2CB3\\u2CB5\\u2CB7\\u2CB9\\u2CBB\\u2CBD\\u2CBF\\u2CC1\\u2CC3\\u2CC5\\u2CC7\\u2CC9\\u2CCB\\u2CCD\\u2CCF\\u2CD1\\u2CD3\\u2CD5\\u2CD7\\u2CD9\\u2CDB\\u2CDD\\u2CDF\\u2CE1\\u2CE3\\u2CE4\\u2CEC\\u2CEE\\u2D00-\\u2D25\\uA641\\uA643\\uA645\\uA647\\uA649\\uA64B\\uA64D\\uA64F\\uA651\\uA653\\uA655\\uA657\\uA659\\uA65B\\uA65D\\uA65F\\uA663\\uA665\\uA667\\uA669\\uA66B\\uA66D\\uA681\\uA683\\uA685\\uA687\\uA689\\uA68B\\uA68D\\uA68F\\uA691\\uA693\\uA695\\uA697\\uA723\\uA725\\uA727\\uA729\\uA72B\\uA72D\\uA72F-\\uA731\\uA733\\uA735\\uA737\\uA739\\uA73B\\uA73D\\uA73F\\uA741\\uA743\\uA745\\uA747\\uA749\\uA74B\\uA74D\\uA74F\\uA751\\uA753\\uA755\\uA757\\uA759\\uA75B\\uA75D\\uA75F\\uA761\\uA763\\uA765\\uA767\\uA769\\uA76B\\uA76D\\uA76F\\uA771-\\uA778\\uA77A\\uA77C\\uA77F\\uA781\\uA783\\uA785\\uA787\\uA78C\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFF41-\\uFF5A\\u0041-\\u005A\\u00C0-\\u00D6\\u00D8-\\u00DE\\u0100\\u0102\\u0104\\u0106\\u0108\\u010A\\u010C\\u010E\\u0110\\u0112\\u0114\\u0116\\u0118\\u011A\\u011C\\u011E\\u0120\\u0122\\u0124\\u0126\\u0128\\u012A\\u012C\\u012E\\u0130\\u0132\\u0134\\u0136\\u0139\\u013B\\u013D\\u013F\\u0141\\u0143\\u0145\\u0147\\u014A\\u014C\\u014E\\u0150\\u0152\\u0154\\u0156\\u0158\\u015A\\u015C\\u015E\\u0160\\u0162\\u0164\\u0166\\u0168\\u016A\\u016C\\u016E\\u0170\\u0172\\u0174\\u0176\\u0178\\u0179\\u017B\\u017D\\u0181\\u0182\\u0184\\u0186\\u0187\\u0189-\\u018B\\u018E-\\u0191\\u0193\\u0194\\u0196-\\u0198\\u019C\\u019D\\u019F\\u01A0\\u01A2\\u01A4\\u01A6\\u01A7\\u01A9\\u01AC\\u01AE\\u01AF\\u01B1-\\u01B3\\u01B5\\u01B7\\u01B8\\u01BC\\u01C4\\u01C7\\u01CA\\u01CD\\u01CF\\u01D1\\u01D3\\u01D5\\u01D7\\u01D9\\u01DB\\u01DE\\u01E0\\u01E2\\u01E4\\u01E6\\u01E8\\u01EA\\u01EC\\u01EE\\u01F1\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FC\\u01FE\\u0200\\u0202\\u0204\\u0206\\u0208\\u020A\\u020C\\u020E\\u0210\\u0212\\u0214\\u0216\\u0218\\u021A\\u021C\\u021E\\u0220\\u0222\\u0224\\u0226\\u0228\\u022A\\u022C\\u022E\\u0230\\u0232\\u023A\\u023B\\u023D\\u023E\\u0241\\u0243-\\u0246\\u0248\\u024A\\u024C\\u024E\\u0370\\u0372\\u0376\\u0386\\u0388-\\u038A\\u038C\\u038E\\u038F\\u0391-\\u03A1\\u03A3-\\u03AB\\u03CF\\u03D2-\\u03D4\\u03D8\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2\\u03E4\\u03E6\\u03E8\\u03EA\\u03EC\\u03EE\\u03F4\\u03F7\\u03F9\\u03FA\\u03FD-\\u042F\\u0460\\u0462\\u0464\\u0466\\u0468\\u046A\\u046C\\u046E\\u0470\\u0472\\u0474\\u0476\\u0478\\u047A\\u047C\\u047E\\u0480\\u048A\\u048C\\u048E\\u0490\\u0492\\u0494\\u0496\\u0498\\u049A\\u049C\\u049E\\u04A0\\u04A2\\u04A4\\u04A6\\u04A8\\u04AA\\u04AC\\u04AE\\u04B0\\u04B2\\u04B4\\u04B6\\u04B8\\u04BA\\u04BC\\u04BE\\u04C0\\u04C1\\u04C3\\u04C5\\u04C7\\u04C9\\u04CB\\u04CD\\u04D0\\u04D2\\u04D4\\u04D6\\u04D8\\u04DA\\u04DC\\u04DE\\u04E0\\u04E2\\u04E4\\u04E6\\u04E8\\u04EA\\u04EC\\u04EE\\u04F0\\u04F2\\u04F4\\u04F6\\u04F8\\u04FA\\u04FC\\u04FE\\u0500\\u0502\\u0504\\u0506\\u0508\\u050A\\u050C\\u050E\\u0510\\u0512\\u0514\\u0516\\u0518\\u051A\\u051C\\u051E\\u0520\\u0522\\u0524\\u0531-\\u0556\\u10A0-\\u10C5\\u1E00\\u1E02\\u1E04\\u1E06\\u1E08\\u1E0A\\u1E0C\\u1E0E\\u1E10\\u1E12\\u1E14\\u1E16\\u1E18\\u1E1A\\u1E1C\\u1E1E\\u1E20\\u1E22\\u1E24\\u1E26\\u1E28\\u1E2A\\u1E2C\\u1E2E\\u1E30\\u1E32\\u1E34\\u1E36\\u1E38\\u1E3A\\u1E3C\\u1E3E\\u1E40\\u1E42\\u1E44\\u1E46\\u1E48\\u1E4A\\u1E4C\\u1E4E\\u1E50\\u1E52\\u1E54\\u1E56\\u1E58\\u1E5A\\u1E5C\\u1E5E\\u1E60\\u1E62\\u1E64\\u1E66\\u1E68\\u1E6A\\u1E6C\\u1E6E\\u1E70\\u1E72\\u1E74\\u1E76\\u1E78\\u1E7A\\u1E7C\\u1E7E\\u1E80\\u1E82\\u1E84\\u1E86\\u1E88\\u1E8A\\u1E8C\\u1E8E\\u1E90\\u1E92\\u1E94\\u1E9E\\u1EA0\\u1EA2\\u1EA4\\u1EA6\\u1EA8\\u1EAA\\u1EAC\\u1EAE\\u1EB0\\u1EB2\\u1EB4\\u1EB6\\u1EB8\\u1EBA\\u1EBC\\u1EBE\\u1EC0\\u1EC2\\u1EC4\\u1EC6\\u1EC8\\u1ECA\\u1ECC\\u1ECE\\u1ED0\\u1ED2\\u1ED4\\u1ED6\\u1ED8\\u1EDA\\u1EDC\\u1EDE\\u1EE0\\u1EE2\\u1EE4\\u1EE6\\u1EE8\\u1EEA\\u1EEC\\u1EEE\\u1EF0\\u1EF2\\u1EF4\\u1EF6\\u1EF8\\u1EFA\\u1EFC\\u1EFE\\u1F08-\\u1F0F\\u1F18-\\u1F1D\\u1F28-\\u1F2F\\u1F38-\\u1F3F\\u1F48-\\u1F4D\\u1F59\\u1F5B\\u1F5D\\u1F5F\\u1F68-\\u1F6F\\u1FB8-\\u1FBB\\u1FC8-\\u1FCB\\u1FD8-\\u1FDB\\u1FE8-\\u1FEC\\u1FF8-\\u1FFB\\u2102\\u2107\\u210B-\\u210D\\u2110-\\u2112\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u2130-\\u2133\\u213E\\u213F\\u2145\\u2183\\u2C00-\\u2C2E\\u2C60\\u2C62-\\u2C64\\u2C67\\u2C69\\u2C6B\\u2C6D-\\u2C70\\u2C72\\u2C75\\u2C7E-\\u2C80\\u2C82\\u2C84\\u2C86\\u2C88\\u2C8A\\u2C8C\\u2C8E\\u2C90\\u2C92\\u2C94\\u2C96\\u2C98\\u2C9A\\u2C9C\\u2C9E\\u2CA0\\u2CA2\\u2CA4\\u2CA6\\u2CA8\\u2CAA\\u2CAC\\u2CAE\\u2CB0\\u2CB2\\u2CB4\\u2CB6\\u2CB8\\u2CBA\\u2CBC\\u2CBE\\u2CC0\\u2CC2\\u2CC4\\u2CC6\\u2CC8\\u2CCA\\u2CCC\\u2CCE\\u2CD0\\u2CD2\\u2CD4\\u2CD6\\u2CD8\\u2CDA\\u2CDC\\u2CDE\\u2CE0\\u2CE2\\u2CEB\\u2CED\\uA640\\uA642\\uA644\\uA646\\uA648\\uA64A\\uA64C\\uA64E\\uA650\\uA652\\uA654\\uA656\\uA658\\uA65A\\uA65C\\uA65E\\uA662\\uA664\\uA666\\uA668\\uA66A\\uA66C\\uA680\\uA682\\uA684\\uA686\\uA688\\uA68A\\uA68C\\uA68E\\uA690\\uA692\\uA694\\uA696\\uA722\\uA724\\uA726\\uA728\\uA72A\\uA72C\\uA72E\\uA732\\uA734\\uA736\\uA738\\uA73A\\uA73C\\uA73E\\uA740\\uA742\\uA744\\uA746\\uA748\\uA74A\\uA74C\\uA74E\\uA750\\uA752\\uA754\\uA756\\uA758\\uA75A\\uA75C\\uA75E\\uA760\\uA762\\uA764\\uA766\\uA768\\uA76A\\uA76C\\uA76E\\uA779\\uA77B\\uA77D\\uA77E\\uA780\\uA782\\uA784\\uA786\\uA78B\\uFF21-\\uFF3A\\u01C5\\u01C8\\u01CB\\u01F2\\u1F88-\\u1F8F\\u1F98-\\u1F9F\\u1FA8-\\u1FAF\\u1FBC\\u1FCC\\u1FFC\\u02B0-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0374\\u037A\\u0559\\u0640\\u06E5\\u06E6\\u07F4\\u07F5\\u07FA\\u081A\\u0824\\u0828\\u0971\\u0E46\\u0EC6\\u10FC\\u17D7\\u1843\\u1AA7\\u1C78-\\u1C7D\\u1D2C-\\u1D61\\u1D78\\u1D9B-\\u1DBF\\u2071\\u207F\\u2090-\\u2094\\u2C7D\\u2D6F\\u2E2F\\u3005\\u3031-\\u3035\\u303B\\u309D\\u309E\\u30FC-\\u30FE\\uA015\\uA4F8-\\uA4FD\\uA60C\\uA67F\\uA717-\\uA71F\\uA770\\uA788\\uA9CF\\uAA70\\uAADD\\uFF70\\uFF9E\\uFF9F\\u01BB\\u01C0-\\u01C3\\u0294\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u063F\\u0641-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u0800-\\u0815\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0972\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3D\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E45\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EDC\\u0EDD\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8B\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10D0-\\u10FA\\u1100-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17DC\\u1820-\\u1842\\u1844-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C77\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u2135-\\u2138\\u2D30-\\u2D65\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u3006\\u303C\\u3041-\\u3096\\u309F\\u30A1-\\u30FA\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31B7\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCB\\uA000-\\uA014\\uA016-\\uA48C\\uA4D0-\\uA4F7\\uA500-\\uA60B\\uA610-\\uA61F\\uA62A\\uA62B\\uA66E\\uA6A0-\\uA6E5\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA6F\\uAA71-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB\\uAADC\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA2D\\uFA30-\\uFA6D\\uFA70-\\uFAD9\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF66-\\uFF6F\\uFF71-\\uFF9D\\uFFA0-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC";
			var regex = new RegExp("(^|[^" + letters + "])([" + letters + "])", "g");
			return new String(v).replace(regex, function(s, m1, m2) {
				return m1 + m2.toUpperCase();
			});
		};
        Ext.util.Format.brMoney = function(v) {
        	return Ext.util.Format.currency(v);
        };
        Ext.util.Format.money = function(v) {
        	return Ext.util.Format.number(v, '0,0.00');
        };
        Ext.util.Format.brDecimal = function(v) {
        	return Ext.util.Format.number(v, '0.0000');
        };
        Ext.util.Format.brFloat = function(v) {
        	v = Ext.util.Format.round(v, 2);
        	var format = '0', str = new String(v).split('.');
        	if (str.length == 2) {
        		var dec = parseInt(str[1]);
    			if (dec > 0) {
    				var pos1 = parseInt(Ext.util.Format.substr(str[1], 0, 1));
    				pos2 = parseInt(Ext.util.Format.substr(str[1], 1, 1));
    				format = (dec > 10 || (pos1 == 0 && pos2 > 0)) ? '0.00' : '0.0';
    			}
        	}
        	return Ext.util.Format.number(v, format);
        };
        Ext.util.Format.percent = function(v) {
        	v = Ext.util.Format.round(v, 2);
        	var format = '0', str = new String(v).split('.');
        	if (str.length == 2) {
        		var dec = parseInt(str[1]);
    			if (dec > 0) {
    				var pos1 = parseInt(Ext.util.Format.substr(str[1], 0, 1)); pos2 = parseInt(Ext.util.Format.substr(str[1], 1, 1));
    				format = (dec > 10 || (pos1 == 0 && pos2 > 0)) ? '0.00' : '0.0';
    			}
        	}
        	return Ext.util.Format.number(v, format) + ' %';
        };
        Ext.util.Format.parseFloat = function(v) {
        	if (Ext.isNumeric(v)) return parseFloat(v);
        	var n = new String(v).split(','), m = n[0].replace(/\./gi, '');
        	var result = (n.length == 2) ? m + '.' + n[1] : m + '.00';
        	return parseFloat(result);
        };
        Ext.util.Format.addressLink = function(gmapaddress, dfaddress) {
			gmapaddress = gmapaddress.split(';');
			dfaddress = dfaddress.split("<br/><br/>");
			var result = new Array();
        	Ext.Array.each(gmapaddress, function(name, index) {
        		if (!Ext.isEmpty(name)) {
        			result.push('<a href="http://maps.google.com/maps?q='+name+'" target="_blank">'+dfaddress[index]+'</a>');
        		}
        	});
        	return result.join('<br/><br/>');
		};
        Ext.util.Format.siteLink = function(v) {return Ext.util.Format.siteLinks(v);};
        Ext.util.Format.siteLinks = function(v, delimiter) {
        	if (Ext.isEmpty(v)) return '';
        	if (typeof(delimiter) == "undefined") delimiter = ',';
        	else if (typeof(delimiter) != "string") delimiter = ',';
        	else if (delimiter.search(new RegExp("<br[\s/]*>|,|\\||\\n")) < 0) delimiter = ',';
        	if (!Ext.isArray(v)) v = v.split(delimiter);
        	var result = new Array();
        	Ext.Array.each(v, function(name) {
        		if (!Ext.isEmpty(name)) {
        			result.push('<a href="'+name+'" target="_blank">'+name+'</a>');
        		}
        	});
        	return result.join("<br/>");
        };
        Ext.util.Format.emailLink = function(v) {return Ext.util.Format.emailLinks(v);};
        Ext.util.Format.emailLinks = function(v, delimiter) {
        	if (Ext.isEmpty(v)) return '';
        	if (typeof(delimiter) == "undefined") delimiter = ',';
        	else if (typeof(delimiter) != "string") delimiter = ',';
        	else if (delimiter.search(new RegExp("<br[\s/]*>|,|\\||\\n")) < 0) delimiter = ',';
        	if (!Ext.isArray(v)) v = v.split(delimiter);
        	var result = new Array();
        	Ext.Array.each(v, function(name) {
        		if (!Ext.isEmpty(name)) {
        			result.push('<a href="mailto:'+name+'">'+name+'</a>');
        		}
        	});
        	return result.join("<br/>");
        };
        Ext.util.Format.phoneLink = function(v) {return Ext.util.Format.phoneLinks(v);        	};
        Ext.util.Format.phoneLinks = function(v, delimiter) {
        	if (Ext.isEmpty(v)) return '';
        	if (typeof(delimiter) == "undefined") delimiter = ',';
        	else if (typeof(delimiter) != "string") delimiter = ',';
        	else if (delimiter.search(new RegExp("<br[\s/]*>|,|\\||\\n")) < 0) delimiter = ',';
        	if (!Ext.isArray(v)) v = v.split(delimiter);
        	var result = new Array();
        	Ext.Array.each(v, function(name) {
        		if (!Ext.isEmpty(name)) {
        			result.push('<a href="tel:'+name+'">'+name+'</a>');
        		}
        	});
        	return result.join("<br/>");
        };
    }

    Ext.define("Ext.locale.pt_BR.picker.Date", {
        override: "Ext.picker.Date",
        todayText: "Hoje",
        minText: "Esta data é anterior a menor data",
        maxText: "Esta data é posterior a maior data",
        disabledDaysText: "",
        disabledDatesText: "",
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Próximo Mês (Control+Direita)',
        prevText: 'Mês Anterior (Control+Esquerda)',
        monthYearText: 'Escolha um Mês (Control+Cima/Baixo para mover entre os anos)',
        todayTip: "{0} (Espaço)",
        format: "d/m/Y",
        startDay: 0
    });

    Ext.define("Ext.locale.pt_BR.picker.Month", {
        override: "Ext.picker.Month",
        okText: "&#160;OK&#160;",
        cancelText: "Cancelar"
    });

    Ext.define("Ext.locale.pt_BR.toolbar.Paging", {
        override: "Ext.PagingToolbar",
        beforePageText: "Página",
        afterPageText: "de {0}",
        firstText: "Primeira Página",
        prevText: "Página Anterior",
        nextText: "Próxima Página",
        lastText: "Última Página",
        refreshText: "Atualizar",
        displayMsg: "<b>{0} à {1} de {2} registro(s)</b>",
        emptyMsg: 'Sem registros para exibir'
    });
    
    Ext.define("Ext.locale.pt_BR.form.field.Text", {
        override: "Ext.form.field.Text",
        minLengthText: "O tamanho mínimo para este campo é {0}",
        maxLengthText: "O tamanho máximo para este campo é {0}",
        blankText: "Este campo é obrigatório.",
        regexText: "",
        inputAttrTpl: 'x-webkit-speech',
        emptyText: null,
        
        onRender: function() {
        	var me = this;
        	me.callParent(arguments);
        	Ext.Function.defer(function(){
        		me.inputEl.dom.onwebkitspeechchange = function(e) {
        			var value = me.inputEl.dom.value.toUpperCase(), xtype = me.getXType();
        			if (xtype == 'searchfield') {
        				me.setValue(value);
        				me.doSearch();
        			} else if(xtype == 'cnpjfield') {
        				me.setValue(value);
        				me.showCaptcha();
        			} else if (xtype == 'textfield') {
        				me.setValue(value);
        			} else {
        				me.reset();
        				me.setRawValue(value);
        				me.doQuery(value);
        				if (!me.isExpanded) me.expand();
        				me.select(me.findRecordByDisplay(value));
        			}
        		};
        	}, 1000);
        }
    });

    Ext.define("Ext.locale.pt_BR.form.field.Number", {
        override: "Ext.form.field.Number",
        minText: "O valor mínimo para este campo é {0}",
        maxText: "O valor máximo para este campo é {0}",
        nanText: "{0} não é um número válido",
        decimalSeparator: ',',
        fieldStyle: {
        	textAlign: 'right'
        }
    });

    Ext.define("Ext.locale.pt_BR.form.field.Date", {
        override: "Ext.form.field.Date",
        disabledDaysText: "Desabilitado",
        disabledDatesText: "Desabilitado",
        minText: "A data deste campo deve ser posterior a {0}",
        maxText: "A data deste campo deve ser anterior a {0}",
        invalidText: "{0} não é uma data válida - deve ser informado no formato {1}",
        format: "d/m/Y",
        altFormats : "d/m/Y|m/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|d-m-y|m-d-y|d-m-Y|m-d-Y|d/m|m/d|d-m|m-d|dm|md|dmy|mdy|dmY|mdY|d|Y-m-d|n-j|n/j"
    });

    Ext.define("Ext.locale.pt_BR.form.field.CheckboxGroup", {
        override: "Ext.form.CheckboxGroup",
        blankText : "Você precisa selecionar pelo menos um item desse grupo"
    });

	Ext.define("Ext.locale.pt_BR.form.field.RadioGroup", {
        override: "Ext.form.RadioGroup",
        blankText : "Você precisa selecionar um item desse grupo"
    });
    
    Ext.define("Ext.locale.pt_BR.form.field.ComboBox", {
        override: "Ext.form.field.ComboBox",
        
        enableRegEx: true,
        valueNotFoundText: undefined,
        
        resetValueOnTrigger: true,
        fireSelectEventOnValue: false,
        onNotFoundReloadStore: true,
        
        onFocus: function() {
	        var me = this;
	        me.callParent(arguments);
	        if (!me.mimicing) {
	            me.bodyEl.addCls(me.wrapFocusCls);
	            me.mimicing = true;
	            me.mon(me.doc, 'mousedown', me.mimicBlur, me, {
	                delay: 10
	            });
	            if (me.monitorTab) {
	                me.on('specialkey', me.checkTab, me);
	            }
	        }
        	me.handlerTriggerCls();
	    },
        
        onBlur: function() {
        	this.callParent(arguments);
        	this.handlerTriggerCls();
        },
        
        handlerTriggerCls: function() {
        	var el = Ext.select('#' + this.getId() + ' div.' + this.triggerCls);
        	if (Ext.isEmpty(this.getSubmitValue())) {
				el.removeCls('x-form-clear-trigger');
				el.addCls('x-form-arrow-trigger');
				this.triggerCls = 'x-form-arrow-trigger';
        	} else {
        		el.removeCls('x-form-arrow-trigger');
				el.addCls('x-form-clear-trigger');
				this.triggerCls = 'x-form-clear-trigger';
        	}
        },
        
        onTriggerClick: function() {
        	var me = this;
	        if (!me.readOnly && !me.disabled) {
	        	if (me.triggerCls == 'x-form-clear-trigger') {
	        		if (me.resetValueOnTrigger === true) {
		        		me.setValue(null);
		        		if (me.hasListener('reset')) {
		        			me.fireEvent('reset', me);
		        		}
	        		}
	        		me.handlerTriggerCls();
	        	}
	            if (me.isExpanded) {
	                me.collapse();
	            } else {
	                me.onFocus({});
	                if (me.triggerAction === 'all') {
	                    me.doQuery(me.allQuery, true);
	                } else {
	                    me.doQuery(me.getRawValue(), false, true);
	                }
	            }
	            me.inputEl.focus();
	        }
        },
        
        setValue: function(value, doSelect) {
			var me = this,
			valueNotFoundText = me.valueNotFoundText,
			inputEl = me.inputEl,
			dataObj,
			oldValue,
			notFoundValues,
			matchedRecords = [],
			displayTplData = [],
			processedValue = [];
			
			if (me.store) {
				if (me.store.loading) {
					// Called while the Store is loading. Ensure it is processed by the onLoad method.
					me.value = value;
					me.setHiddenValue(me.value);
					return me;
				}
			}
			
			if (Ext.isArray(me.value)) {
				oldValue = [];
				Ext.each(me.value, function(item) {
					if (Ext.isObject(item)) {
						oldValue.push(item.get(me.valueField));
					} else {
						oldValue.push(item);
					}
				});
				oldValue.join(',');
			} else {
				oldValue = me.value;
			}
			
			// This method processes multi-values, so ensure value is an array.
			if (me.multiSelect === true && Ext.isEmpty(value) === false) {
				var values = [], isid = false;
				if (!Ext.isArray(value)) {
					isid = me.valueField.search(new RegExp("id", "gi")) > -1,
					delimiter = isid ? ',' : me.delimiter;
					value = value.split(delimiter);
				}
				Ext.each(value, function(item) {
					item = isid ? parseInt(item) : item;
					values.push(item);
				});
				value = values;
			}
			value = Ext.Array.from(value);
			var newValue = [];
			Ext.each(value, function(item) {
				if (Ext.isEmpty(item) === false) {
					newValue.push(item);
				}
			});
			newValue = newValue.join(',');
			
			var i=0, record;
			notFoundValues = [];
			for (; i<value.length; ++i) {
				record = value[i];
				if (!record || !record.isModel) {
					record = me.findRecordByValue(record);
				}
				if (record) {
					matchedRecords.push(record);
					displayTplData.push(record.data);
					processedValue.push(record.get(me.valueField));
				} else {
					if (Ext.isEmpty(value[i]) === false) {
						notFoundValues.push(value[i]);
					}
					if (me.forceSelection === false) {
						processedValue.push(value[i]);
						dataObj = {};
						dataObj[me.displayField] = value[i];
						displayTplData.push(dataObj);
					} else if (Ext.isDefined(valueNotFoundText)) {
						displayTplData.push(valueNotFoundText);
					}
				}
			}
			
			me.setHiddenValue(processedValue);
			me.value = me.multiSelect === true ? processedValue : processedValue[0];
			if (!Ext.isDefined(me.value)) {
				me.value = null;
			}
			me.displayTplData = displayTplData;
			me.lastSelection = me.valueModels = matchedRecords;
			if (inputEl && me.emptyText && !Ext.isEmpty(value)) {
				inputEl.removeCls(me.emptyCls);
			}
			me.setRawValue(me.getDisplayValue());
			me.checkChange();
			if (doSelect !== false) {
				me.syncSelection();
			}
			me.applyEmptyText();
			
			if (me.fireSelectEventOnValue === true && me.hasListener('select') && matchedRecords.length > 0) {
				me.fireEvent('select', me, matchedRecords);
			}
			
			if (me.store && me.onNotFoundReloadStore === true && me.queryMode != 'local' && Ext.isEmpty(notFoundValues) === false && Ext.isEmpty(newValue) === false && newValue != oldValue) {
				me.store.load({
					params: {
						fieldFilter: me.valueField,
						valueFilter: newValue
					},
					callback: function(records) {
						if (records.length && !Ext.isEmpty(value)) {
							if (me.store.findRecord(me.valueField, value)) {
								me.setValue(value);
							}
						}
					}
				});
			}
			
			return me;
		},
		doQuery: function(queryString, forceAll, rawQuery) {
			queryString = queryString || '';
			// store in object and pass by reference in 'beforequery'
			// so that client code can modify values.
			var me = this,
			qe = {
				query: queryString,
				forceAll: forceAll,
				combo: me,
				cancel: false
			},
			store = me.store,
			isLocalMode = me.queryMode === 'local',
			needsRefresh;
			if (me.fireEvent('beforequery', qe) === false || qe.cancel) {
				return false;
			}
			// get back out possibly modified values
			queryString = qe.query;
			forceAll = qe.forceAll;
			// query permitted to run
			if (forceAll || (queryString.length >= me.minChars)) {
				// expand before starting query so LoadMask can position itself correctly
				me.expand();
				// make sure they aren't querying the same thing
				if (!me.queryCaching || me.lastQuery !== queryString) {
					me.lastQuery = queryString;
					if (isLocalMode) {
						// forceAll means no filtering - show whole dataset.
						store.suspendEvents();
						needsRefresh = me.clearFilter();
						if (queryString || !forceAll) {
							me.activeFilter = new Ext.util.Filter({
								root: 'data',
								property: me.displayField,
								value: me.enableRegEx ? new RegExp(queryString, "gi") : queryString
							});
							store.filter(me.activeFilter);
							needsRefresh = true;
						} else {
							delete me.activeFilter;
						}
						store.resumeEvents();
						if (me.rendered && needsRefresh) {
							me.getPicker().refresh();
						}
					} else {
						// Set flag for onLoad handling to know how the Store was loaded
						me.rawQuery = rawQuery;
						// In queryMode: 'remote', we assume Store filters are added by the developer as remote filters,
						// and these are automatically passed as params with every load call, so we do *not* call clearFilter.
						if (me.pageSize) {
							// if we're paging, we've changed the query so start at page 1.
							me.loadPage(1);
						} else {
							store.load({
								params: me.getParams(queryString)
							});
						}
					}
				}
				// Clear current selection if it does not match the current value in the field
				if (me.getRawValue() !== me.getDisplayValue()) {
					me.ignoreSelection++;
					me.picker.getSelectionModel().deselectAll();
					me.ignoreSelection--;
				}
				if (isLocalMode) {
					me.doAutoSelect();
				}
				if (me.typeAhead) {
					me.doTypeAhead();
				}
			}
			return true;
		}
    }, function() {
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText: "Carregando..."
        });
    });

    if (exists('Ext.form.field.VTypes')) {
        Ext.apply(Ext.form.field.VTypes, {
            emailText: 'Este campo deve ser um endereço de e-mail válido, no formato "usuario@dominio.com.br"',
            urlText: 'Este campo deve ser uma URL no formato "http:/' + '/www.dominio.com.br"',
            alphaText: 'Este campo deve conter apenas letras e _',
            alphanumText: 'Este campo deve conter apenas letras, números e _'
        });
    }

    Ext.define("Ext.locale.pt_BR.form.field.HtmlEditor", {
        override: "Ext.form.field.HtmlEditor",
        createLinkText: 'Por favor, entre com a URL do link:',
        
        fixBoldTagError: false,
        
		/**
		 * Syncs the contents of the editor iframe with the textarea.
		 * @protected
		 */
		syncValue : function(){
			var me = this, body, changed, html, bodyStyle, match;
			if (me.initialized) {
				body = me.getEditorBody();
				if (me.fixBoldTagError === true) {
					body.innerHTML = body.innerHTML.replace(/<b>/gi, '<b style="font-weight:bold;">');
				}
				html = body.innerHTML;
				if (Ext.isWebKit) {
					bodyStyle = body.getAttribute('style'); // Safari puts text-align styles on the body element!
					match = bodyStyle.match(/text-align:(.*?);/i);
					if (match && match[1]) {
						html = '<div style="' + match[0] + '">' + html + '</div>';
					}
				}
				html = me.cleanHtml(html);
				if (me.fireEvent('beforesync', me, html) !== false) {
					if (me.textareaEl.dom.value != html) {
						me.textareaEl.dom.value = html;
						changed = true;
					}
					me.fireEvent('sync', me, html);
					if (changed) {
						// we have to guard this to avoid infinite recursion because getValue
						// calls this method...
						me.checkChange();
					}
				}
			}
		}
    }, function() {
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            buttonTips: {
                bold: {
                    title: 'Negrito (Ctrl+B)',
                    text: 'Deixa o texto selecionado em negrito.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic: {
                    title: 'Itálico (Ctrl+I)',
                    text: 'Deixa o texto selecionado em itálico.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline: {
                    title: 'Sublinhado (Ctrl+U)',
                    text: 'Sublinha o texto selecionado.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize: {
                    title: 'Aumentar Texto',
                    text: 'Aumenta o tamanho da fonte.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize: {
                    title: 'Diminuir Texto',
                    text: 'Diminui o tamanho da fonte.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor: {
                    title: 'Cor de Fundo',
                    text: 'Muda a cor do fundo do texto selecionado.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor: {
                    title: 'Cor da Fonte',
                    text: 'Muda a cor do texto selecionado.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft: {
                    title: 'Alinhar à Esquerda',
                    text: 'Alinha o texto à esquerda.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter: {
                    title: 'Centralizar Texto',
                    text: 'Centraliza o texto no editor.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright: {
                    title: 'Alinhar à Direita',
                    text: 'Alinha o texto à direita.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist: {
                    title: 'Lista com Marcadores',
                    text: 'Inicia uma lista com marcadores.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist: {
                    title: 'Lista Numerada',
                    text: 'Inicia uma lista numerada.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink: {
                    title: 'Link',
                    text: 'Transforma o texto selecionado em um link.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit: {
                    title: 'Editar Fonte',
                    text: 'Troca para o modo de edição de código fonte.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    });
    
	Ext.define("Ext.locale.pt_BR.grid.header.Container", {
    	override: "Ext.grid.header.Container",
    	sortAscText: "Ordem Ascendente",
    	sortDescText: "Ordem Descendente",
    	lockText: "Bloquear Coluna",
    	unlockText: "Desbloquear Coluna",
    	columnsText: "Colunas",
    	
    	menuSortAscCls: Ext.baseCSSPrefix + 'hmenu-sort-asc',
    	menuSortDescCls: Ext.baseCSSPrefix + 'hmenu-sort-desc',
    	menuColsIcon: Ext.baseCSSPrefix + 'cols-icon',
        
        menuAdjustableSizeIcon: Ext.baseCSSPrefix + "measure-icon",
        adjustableSizeText: "Ajustar Tamanho",
        adjustableSize: true,
        
        getMenuItems: function() {
			var me = this, menuItems = [], hideableColumns = me.enableColumnHide ? me.getColumnMenu(me) : null;
			
			if (me.sortable) {
				menuItems = [{
					itemId: 'ascItem',
					text: me.sortAscText,
					cls: me.menuSortAscCls,
					handler: me.onSortAscClick,
					scope: me
				},{
					itemId: 'descItem',
					text: me.sortDescText,
					cls: me.menuSortDescCls,
					handler: me.onSortDescClick,
					scope: me
				}];
			}
			
			if (hideableColumns && hideableColumns.length) {
				menuItems.push('-', {
					itemId: 'columnItem',
					text: me.columnsText,
					cls: me.menuColsIcon,
					menu: hideableColumns,
					hideOnClick: false
				});
			}
			
			if (me.adjustableSize) {
				menuItems.push('-', {
					text: me.adjustableSizeText,
					cls: me.menuAdjustableSizeIcon,
					hideOnClick: false,
					menu: {
						items: {
							xtype: 'numberfield',
							allowNegative: false,
							allowDecimals: false,
							hideTrigger: false,
							keyNavEnabled: true,
							mouseWheelEnabled: true,
							step: 50,
							value: 100,
							minValue: 100,
							listeners: {
								change: {
									scope: me,
									fn: me.onAdjustableSizeChange
								}
							}
						}
					}
				});
			}
			return menuItems;
		},
		
		onAdjustableSizeChange: function(field, value) {
			value = parseInt(value);
			if (value >= 100) {
				var menu = this.getMenu(), activeHeader = menu.activeHeader;
				activeHeader.setWidth(value);
			}
		}
    });

    Ext.define("Ext.locale.pt_BR.grid.PropertyColumnModel", {
        override: "Ext.grid.PropertyColumnModel",
        nameText: "Nome",
        valueText: "Valor",
        dateFormat: "d/m/Y"
    });
    
	Ext.apply(Ext.form.field.VTypes, {
		
		phone: function(val, field) {
			var phoneTest = /^\d{1,3}\s\d{8,}$/i;
			return phoneTest.test(val);
		},
		phoneText: 'Telefone deve estar no formato da receita 99 99999999',
		phoneMask: /[\d\s]/i,
		
		cnpj: function(val, field) {
			var cnpj = val,
			valida = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
			dig1= new Number,
			dig2= new Number,
			exp = /\.|\-|\//g;
        
			cnpj = cnpj.toString().replace(exp, ""); 
			var i, digito = new Number(eval(cnpj.charAt(12) + cnpj.charAt(13)));
			for(i=0; i<valida.length; i++){
				dig1 += (i>0? (cnpj.charAt(i-1)*valida[i]):0);  
				dig2 += cnpj.charAt(i)*valida[i];       
			}
			dig1 = (((dig1%11) < 2)? 0 : (11-(dig1%11)));
			dig2 = (((dig2%11) < 2)? 0 : (11-(dig2%11)));
			
			return ((dig1 * 10) + dig2) == digito;
		},
		cnpjText: 'CNPJ Inválido (somente números)',
		cnpjMask: /[\d]/i,
		
		cpf: function(val, field) {
			var Soma = 0, Resto = 0;
			if (val == "00000000000") {
				return false;
			}
			var i;
			for (i=1; i<=9; i++) {
				Soma = Soma + parseInt(val.substring(i-1, i)) * (11 - i);
			}
			Resto = (Soma * 10) % 11;
			if ((Resto == 10) || (Resto == 11)) {
				Resto = 0;
			}
			if (Resto != parseInt(val.substring(9, 10))) {
				return false;
			}
			Soma = 0;
			for (i = 1; i <= 10; i++) {
				Soma = Soma + parseInt(val.substring(i-1, i)) * (12 - i);
			}
			Resto = (Soma * 10) % 11;
			if ((Resto == 10) || (Resto == 11)) {
				Resto = 0;
			}
			if (Resto != parseInt(val.substring(10, 11))) {
				return false;
			}
			return true;
		},
		cpfText: 'CPF Inválido (somente números)',
		cpfMask: /[\d]/i,
		
		numdate: function(val, field) {
			var numdateTest = /^(\d{1,})$|^(\d{1,}\.\d{1,2})$|^(\d{2}\/\d{2}\/\d{4})$/i;
			return numdateTest.test(val);
		},
		numdateText: 'Somente é permitido formato do tipo numérico ou data',
		numdateMask: /[\d\/\.]/i,
		
		daterange: function(val, field) {
			var date = field.parseDate(val);
			if (!date) {
				return false;
			}
			if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
				var start = field.up('form').down('#' + field.startDateField);
				start.setMaxValue(date);
				start.validate();
				this.dateRangeMax = date;
			} else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
				var end = field.up('form').down('#' + field.endDateField);
				end.setMinValue(date);
				end.validate();
				this.dateRangeMin = date;
	        }
	        return true;
	    },
	    daterangeText: 'Data inicial deve ser menor que a Data Final',
		
		password: function(val, field) {
			if (field.initialPassField) {
				var pwd = field.up('form').down('#' + field.initialPassField);
				return (val == pwd.getValue());
			}
			return true;
	    },
	    passwordText: 'Senha não confere'
	});
});