Ext.ns('App');
App = {
	projeto: '',
	siteUrl: '',
	cliente: {},
	usuario: {},
	empresa: {},
	permissoes: {},
	cambio: {
		dolar: 0,
		euro: 0, 
		franco: 0,
		iene: 0,
		iuan: 0,
		libra: 0,
		peso: 0,
		options: ['DÓLAR', 'EURO', 'FRANCO', 'IENE', 'IUAN', 'LIBRA', 'PESO', 'REAL'],
		process: function(moeda) {
			if (moeda == 'REAL') {
				moeda = 'BRL';
			} else if (moeda == 'DÓLAR') {
				moeda = 'USD';
			} else if (moeda == 'EURO') {
				moeda = 'EUR';
			} else if (moeda == 'FRANCO') {
				moeda = 'XOF';
			} else if (moeda == 'IENE') {
				moeda = 'JPY';
			} else if (moeda == 'IUAN') {
				moeda = 'CNY';
			} else if (moeda == 'LIBRA') {
				moeda = 'LBP';
			} else if (moeda == 'PESO') {
				moeda = 'DOP';
			}
			return moeda;
		},
		exchange: function(config) {
			config = Ext.applyIf(config, {from: 'USD', to:'BRL', ammount: 1, callback: null});
			if (!config.callback) return App.cambio.conversor(config.from);
			Ext.Ajax.request({
				url: 'php/response.php',
				method: 'post',
				params: {
					m: 'cambio_store',
					to: App.cambio.process(config.to),
					from: App.cambio.process(config.from),
					ammount: config.ammount
				},
				failure: App.ajaxFailure,
				success: function(response) {
					var o = Ext.decode(response.responseText);
					if (o.success) {
						config.callback(o.cambio, o.cotacao);
					}
				}
			});
		},
		conversor: function(moeda) {
			if (moeda == 'DÓLAR') return App.cambio.dolar;
			else if (moeda == 'EURO') return App.cambio.euro;
			else if (moeda == 'FRANCO') return App.cambio.franco;
			else if (moeda == 'IENE') return App.cambio.iene;
			else if (moeda == 'IUAN') return App.cambio.iuan;
			else if (moeda == 'LIBRA') return App.cambio.libra;
			else if (moeda == 'PESO') return App.cambio.peso;
			else return 0;
		}
	},
	
	title: document.title,
	isMobile: function() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/gi.test(navigator.userAgent);
	},
	
	sleep: function(seconds) {
		var milliseconds = (seconds * 1000), i, start = new Date().getTime();
		for (i=0; i<1e7; i++) {
			if ((new Date().getTime() - start) > milliseconds){
				break;
			}
		}
	},
	
	notify: function(msg, ui, sleep) {
		Ext.create('Ext.ux.Notify', {
			ui: ui || 'orange-alert',
			msg: msg,
			sleep: sleep || 15
		});
	},
	
	acessoNegado: function(msg) {
		Ext.create('Ext.ux.Notify', {
			ui: 'red-alert',
			msg: 'Você não tem permissão para essa ação'
		});
	},
	
	warning: function(o){
		if (o.error) {
			if (o.logged === false) {
				App.task.login();
			} else {
				Ext.create('Report.Error', {error:o.error});
			}
		} else {
			var message = o.msg || null;
			if (!Ext.isEmpty(message)) Ext.create('Ext.ux.Notify', {ui: 'orange-alert', msg: message});
		}
	},
	
	ajaxCopySuccess: function(response) {
		var o = Ext.decode(response.responseText);
		if (!o.success) {
			if (o.error) {
				if (o.logged === false) {
					App.task.login();
				} else {
					Ext.create('Report.Error', {error:o.error});
				}
			} else {
				App.noRecordsCopied();
			}
		} else {
			App.notify('Registro(s) copiado(s) com sucesso!');
		}
	},
	
	ajaxDeleteSuccess: function(response) {
		var o = Ext.decode(response.responseText);
		if (!o.success) {
			if (o.error) {
				if (o.logged === false) {
					App.task.login();
				} else {
					Ext.create('Report.Error', {error:o.error});
				}
			} else {
				App.noRecordsDeleted();
			}
		}
	},
	
	ajaxProccessResponse: function(o) {
		if (o.hasOwnProperty('responseText')) o = Ext.decode(o.responseText);
		if (!o.success) {
			if (o.error) {
				if (o.logged === false) {
					App.task.login();
				} else {
					Ext.create('Report.Error', {error:o.error});
				}
			}
		}
	},
	
	ajaxFailure: function(response) {
		if (App.isMobile()) {
			Ext.Msg.alert(response.status, 'Servidor não pode responder no momento, tente novamente ou mais tarde, se o erro persistir contate o administrador (<a href="mailto:suporte@sistrom.com.br">suporte@sistrom.com.br</a>)');
		} else {
			Ext.create('Ext.ux.Notify', {
				ui: 'orange-alert',
				msg: 'Status: #' + response.status + '<br/>Servidor não pode responder no momento, tente novamente ou mais tarde, se o erro persistir contate o administrador (<a href="mailto:suporte@sistrom.com.br">suporte@sistrom.com.br</a>)'
			});
		}
	},
	
	ajaxSuccess: function(response) {
		var o = Ext.decode(response.responseText);
		if (o.success) {
			if (!Ext.isEmpty(o.msg)) {
				Ext.create('Ext.ux.Notify', {
					ui: 'green-alert',
					msg: o.msg
				});
			}
		} else {
			if (o.error) {
				if (o.logged === false) {
					App.task.login();
				} else {
					Ext.create('Report.Error', {error:o.error});
				}
			} else if (!Ext.isEmpty(o.msg)) {
				Ext.create('Ext.ux.Notify', {
					ui: 'red-alert',
					msg: o.msg
				});
			}
		}
	},
	
	formSuccess: function(f, a) {
		var r = a.result || {msg:null};
		if (!Ext.isEmpty(r.msg)) Ext.create('Ext.ux.Notify', {
			ui: 'green-alert',
			msg: r.msg
		});
	},
	
	formFailure: function(f, a) {
		var message;
		switch (a.failureType) {
			case Ext.form.action.Action.CLIENT_INVALID:
				message = 'Formulário não pode ser enviado, se houver campos inválidos.';
				break;
			case Ext.form.action.Action.CONNECT_FAILURE:
				message = 'Ocorreu uma falha na comunicação com o servidor.';
				break;
			case Ext.form.action.Action.SERVER_INVALID:
				message = a.result.msg || null;
				if (!App.isMobile()) {
					if (a.result.error) {
						if (a.result.logged === false) {
							App.task.login();
						} else {
							Ext.create('Report.Error', {error:a.result.error});
							message = null;
						}
					}
				}
				break;
		}
		if (message) {
			if (App.isMobile()) {
				Ext.Msg.alert('Erro', message);
			} else {
				Ext.create('Ext.ux.Notify', {
					ui: 'red-alert',
					msg: message
				});
			}
		}
		if (a.result.hasOwnProperty('suspended')) {
			if (a.result.suspended) {
				Ext.Function.defer(function(){window.location = '?logout';}, 1000);
			}
		}
	},
	
	onProxyException: function(proxy, response, operation) {
		var o = Ext.decode(response.responseText);
		if (o.logged === false) {
			App.task.login();
		} else {
			var msg = operation.getError(), errorExist = false, errorWin = Ext.ComponentQuery.query('errorwin');
			if (errorWin) {
				Ext.each(errorWin, function(me){
					if (me.getError() == msg) {
						errorExist = true;
						return false;
					}
				});
			}
			if (!errorExist) {
				Ext.create('Report.Error', {error: msg});
			}
		}
	},
	
	manyRecordsSelected: function() {
		Ext.create('Ext.ux.Notify', {
			ui: 'orange-alert',
			msg: 'Seleção inválida, somente é permito uma única seleção. Por favor selecione apenas 1 (um) registro.'
		});
	},
	
	noRecordsSelected: function() {
		Ext.create('Ext.ux.Notify', {
			ui: 'orange-alert',
			msg: 'Antes de continuar você deve selecionar pelo menos 1 (um) registro. Por favor selecione um registro.'
		});
	},
	
	noRecordsDeleted: function() {
		Ext.create('Ext.ux.Notify', {
			ui: 'orange-alert',
			msg: 'AVISO! Seu registro não pode ser excluído pelos possíveis dois motivos: 1) Algum usuário pode ter excluído alguns segundos antes. 2) Registro relacionado com outros registros, nesse caso, será necessário excluir suas dependências primeiro.'
		});
	},
	
	noRecordsUpdated: function() {
		Ext.create('Ext.ux.Notify', {
			ui: 'orange-alert',
			msg: 'AVISO! Seu registro não pode ser alterado, pois se encontra aberto para edição por outro usuário.'
		});
	},
	
	noRecordsCopied: function() {
		Ext.create('Ext.ux.Notify', {
			ui: 'orange-alert',
			msg: 'AVISO! Seu registro não pode ser copiado, pois se encontra aberto para edição por outro usuário.'
		});
	},
	
	deletedRecordMsg: function() {
		Ext.create('Ext.ux.Notify', {
			ui: 'orange-alert',
			msg: 'AVISO! Esse registro já foi excluído anteriormente, não será possível prosseguir com a ação.'
		});
	},
	
	roundMiddle: function(number) {
		var nInteiro = parseInt(number),
		nFracao = number - nInteiro;
		if (nFracao > 0.0 && nFracao < 0.5) {
			number = nInteiro + 0.5;
		} else if (nFracao > 0.5) {
			number = nInteiro + 1;
		}
		return number;
	},
	
	acrescimoPercentual: function(p, v) {
		if (!p) return v;
		return (v + ((p / 100) * v));
	},
	
	descontoPercentual: function(p, v) {
		if (!p) return v;
		return (v - ((p / 100) * v));
	},
	
	keyBoardStatus: false,
	toggleKeyboard: function(enable) {
		if (typeof(enable) == "undefined") {
			enable = !App.keyBoardStatus;
		}
		if (enable) {
			Ext.FocusManager.enable(true);
		} else {
			Ext.FocusManager.disable();
		}
		App.keyBoardStatus = enable;
		var btn = App.vp.down('tabpanel');
		if (btn) btn = btn.down('#home-tab');
		if (btn) btn = btn.down('#keyboard-btn');
		if (btn) btn.toggle(enable, true);
	},
	
	validateFilename: function(str, sep) {
		sep = sep || "";
		if (typeof(str) != "string") {
			str = new String(str);
		}
		return str.replace(new RegExp("[+?/$%*:|\"<>.,\]", "gi"), sep);
	}
};

Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ext': 'sencha',
		'Ext.ux': 'sencha/extjs/ux'
	}
});
Ext.require('Ext.ux.grid.FiltersFeature');

window.onbeforeunload = function() {
	return "ATENÇÃO! Você está saindo do sistema, antes de continuar certifque que suas informações foram salvas anteriormente.";
};