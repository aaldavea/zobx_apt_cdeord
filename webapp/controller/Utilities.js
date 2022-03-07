sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"./Utilities"
], function (JSONModel, Fragment) {
	"use strict";
	var startDate, endDate;
	return {
		odata: {
			remove: function (oModel, oContext, fnSuccess, fnError) {
				sap.ui.core.BusyIndicator.show(0);

				oModel.remove(oContext.getPath(), {
					success: function (oResult) {
						if (fnSuccess)
							fnSuccess(this);
					}.bind(oContext.getProperty()),
					error: function (oError) {
						if (fnError)
							fnError(oError);
					}
				})
			},
			create: function (oModel, sUrl, oEntry, fnSuccess, fnError) {
				sap.ui.core.BusyIndicator.show(0);

				oModel.create(sUrl, oEntry, {
					success: function (oResult) {
						sap.ui.core.BusyIndicator.hide();
						if (fnSuccess)
							fnSuccess(oResult);
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						if (fnError)
							fnError(oError);
					}
				});
			},
			update: function (oModel, sUrl, oEntry, fnSuccess, fnError) {
				sap.ui.core.BusyIndicator.show(0);

				oModel.update(sUrl, oEntry, {
					success: function () {
						sap.ui.core.BusyIndicator.hide();
						if (fnSuccess)
							fnSuccess(oEntry);
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						if (fnError)
							fnError(oError);
					}
				});
			},
			read: function (oModel, sUrl, oParameters, fnSuccess, fnError) {
				sap.ui.core.BusyIndicator.show(0);

				oModel.read(sUrl, {
					urlParameters: oParameters instanceof Object ? oParameters : "",
					success: function (oResult) {
						sap.ui.core.BusyIndicator.hide();
						if (fnSuccess)
							fnSuccess(oResult);
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						if (fnError)
							fnError(oError);
					}
				});
			}
		},
		_openDialog: function (oView, sName, oController, fnAdicional) {
			Fragment.load({
				name: sName,
				controller: oController
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.open();
				if (fnAdicional) {
					fnAdicional(oDialog);
				}
			});
		},
		formatDate: function (sDate) {
			let oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			return oDateFormat.format(new Date(sDate));
		},
		validateForm: function (localModel, that, sForm, FlagMaterial) {
			let aMessages = [], oForm
			var sNameForm = sForm;
			var aForm = that.getView().byId(sNameForm).getContent().slice(1);

			oForm = that.getView().byId(sNameForm);
			oForm.getContent().slice(1).forEach(function (oFormContainer, iFormElement) {

				if (oFormContainer instanceof sap.m.Text) {
					return true;
				}
				if (oFormContainer instanceof sap.m.Input) {
					if (!oFormContainer.getValue()) {
						aMessages.push({
							type: "Error",
							title: that.getView().getModel("i18n").getResourceBundle().getText("Message.Required.MSG_WAR_3") + " " + aForm[iFormElement - 1].getText(),
							subtitle: aForm[iFormElement - 1].getText(),
						});
					}
				}
				if (oFormContainer instanceof sap.m.DateTimeInput) {
					if (oFormContainer.getDateValue() === null) {
						aMessages.push({
							type: "Error",
							title: that.getView().getModel("i18n").getResourceBundle().getText("Message.Required.MSG_WAR_3") + " " + aForm[iFormElement - 1].getText(),
							subtitle: aForm[iFormElement - 1].getText()
						});
					}
				}

				if (oFormContainer instanceof sap.m.MultiInput) {
					if (oFormContainer.getTokens().length === 0) {
						aMessages.push({
							type: "Error",
							title: that.getView().getModel("i18n").getResourceBundle().getText("Message.Required.MSG_WAR_3") + " " + aForm[iFormElement - 1].getText(),
							subtitle: aForm[iFormElement - 1].getText()
						});
					}
					aMessages = aMessages.slice(1);
				}

				if(oFormContainer instanceof sap.m.Input){
					if(oFormContainer.getId().includes("inp-Plant")){
						if(!oFormContainer.getValue() && FlagMaterial === "Materials"){
							aMessages.push({
								type: "Error",
								title: that.getView().getModel("i18n").getResourceBundle().getText("Message.Required.MSG_WAR_5"),
								subtitle: "Plant"
							});
						}
					}
				}

				if (oFormContainer instanceof sap.m.DateTimeInput) {
					if (oFormContainer.getDateValue() !== null) {

						if (oFormContainer.getId().includes("DateTime-StartDate")) {
							startDate = oFormContainer.getDateValue();
						} else if (oFormContainer.getId().includes("DateTime-EndDate")) {
							endDate = oFormContainer.getDateValue();
						}
						if (startDate !== undefined && endDate !== undefined) {
							if (endDate < startDate) {
								aMessages.push({
									type: "Error",
									title: that.getView().getModel("i18n").getResourceBundle().getText("Message.Required.MSG_WAR_4"),
									subtitle: "Start Date - End Date"
								});
							}
							startDate = undefined;
							endDate = undefined;
						}


					}

				}
			});

			// if (!aForm[1].getValue() && FlagMaterial === "Materials") {
			// 	console.log(aForm[1].getValue())
			// 	aMessages.push({
			// 		type: "Error",
			// 		title: that.getView().getModel("i18n").getResourceBundle().getText("Message.Required.MSG_WAR_5"),
			// 		subtitle: "Plant"
			// 	});
			// }

			// if(aForm[7] !== undefined  && aForm[5] !== undefined){
			//     if(aForm[7].getDateValue() !== null || aForm[7].getValue() !== '' && aForm[5].getDateValue() !== null || aForm[5].getValue() !== ''){
			//         if(aForm[7].getDateValue() < aForm[5].getDateValue()){
			//             aMessages.push({
			//                 type: "Error",
			//                 title: that.getView().getModel("i18n").getResourceBundle().getText("Message.Required.MSG_WAR_4"),
			//                 subtitle: "Start Date - End Date"
			//             });
			//         }
			//     } 
			// }



			localModel.setProperty("/Message", aMessages);
		},
		_showPopover: function (oController) {
			//var that = this;

			oController.oMessagePopover = new sap.m.MessagePopover({
				activeTitlePress: function (oEvent) {
					var oItem = oEvent.getParameter("item"),
						oPage = oController.getView().byId("messageHandlingPage"),
						oMessage = oItem.getBindingContext("message").getObject(),
						oControl = Element.registry.get(oMessage.getControlId());

					if (oControl) {
						oPage.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
						setTimeout(function () {
							oControl.focus();
						}, 300);
					}
				},
				items: {
					path: "localModel>/Message",
					template: new sap.m.MessageItem({
						title: "{localModel>title}",
						subtitle: "{localModel>subtitle}",
						//groupName: {parts: [{path: 'message>controlIds'}], formatter: this.getGroupName},
						//activeTitle: {parts: [{path: 'message>controlIds'}], formatter: this.isPositionable},
						type: "{localModel>type}",
						description: "{localModel>description}"
					})
				},
				groupItems: true
			});

			oController.getView().byId("btn-Error").addDependent(oController.oMessagePopover);
		},
		_showLog: function (that, aMessages, oDialog, fnAdicional) {
			that.oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: true,
				items: {
					path: "MSG_USR>/",
					template: new sap.m.MessageItem({
						type: '{MSG_USR>type}',
						title: '{MSG_USR>title}',
						description: '{MSG_USR>description}',
						subtitle: '{MSG_USR>subtitle}',
						counter: '{MSG_USR>counter}',
						markupDescription: '{MSG_USR>markupDescription}'
					})
				}
			});
			that.oMessageView.setModel(new JSONModel(aMessages), "MSG_USR");
			that.oDialog = new sap.m.Dialog({
				showHeader: false,
				content: that.oMessageView,
				contentHeight: "50%",
				contentWidth: "50%",
				verticalScrolling: false,
				beginButton: new sap.m.Button({
					press: function (oEvt) {
						that.oDialog.close();
						sap.ui.core.BusyIndicator.hide();
						if (oDialog) {
							oDialog.close();
						}
						if (fnAdicional)
							fnAdicional();
					},
					text: "Close"
				}),
				escapeHandler: function (oEvt) {
					that.oDialog.close();
					sap.ui.core.BusyIndicator.hide();
					if (oDialog) {
						oDialog.close();
					}
					if (fnAdicional)
						fnAdicional();
				}
			});
			that.getView().addDependent(that.oDialog);
			that.oDialog.open();
		},
		_showLog: function (that, aMensajes, FlagReference) {

			var aMessage = [];
			for (var i in aMensajes) {
				aMessage.push({
					"Type": aMensajes[i].Status,
					"Message": aMensajes[i].Status === "Error" ? aMensajes[i].Message : FlagReference === "X" ? "The reference has been generated " + aMensajes[i].RefOrder + " with material " + aMensajes[i].SetID : "The order has been generated " + aMensajes[i].OrderCreated + " with material " + aMensajes[i].RefSetMatId + " and plant " + aMensajes[i].Plant
				});
			}
			var mensajes = aMessage;

			for (var i = 0; i < mensajes.length; i++) {
				switch (mensajes[i].Type) {
					case "E":
						mensajes[i].Type = "Error";
						break;
					case "S":
						mensajes[i].Type = "Success";
						break;
					case "W":
						mensajes[i].Type = "Warning";
						break;
					case "I":
						mensajes[i].Type = "Information";
						break;
					case "error":
						mensajes[i].Type = "Error";
						break;
					case "success":
						mensajes[i].Type = "Success";
						break;
					case "Sucess":
						mensajes[i].Type = "Success";
						break;
					case "warning":
						mensajes[i].Type = "Warning";
						break;
					case "info":
						mensajes[i].Type = "Information";
						break;
				}
			}

			var oMessageTemplate = new sap.m.MessageItem({
				type: '{Type}',
				title: '{Message}'
			});

			var oModel = new sap.ui.model.json.JSONModel(mensajes);

			var oBackButton = new sap.m.Button({
				icon: sap.ui.core.IconPool.getIconURI("nav-back"),
				visible: false,
				press: function () {
					that.oMessageView.navigateBack();
					that.setVisible(false);
				}
			});

			that.oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "/",
					template: oMessageTemplate
				}
			});

			that.oMessageView.setModel(oModel);

			that.oDialog = new sap.m.Dialog({
				resizable: true,
				content: that.oMessageView,
				beginButton: new sap.m.Button({
					press: function () {
						that.oDialog.close();
					},
					text: "Close"
				}),
				customHeader: new sap.m.Bar({
					contentMiddle: [
						new sap.m.Text({
							text: "Messages"
						})
					],
					contentLeft: [oBackButton]
				}),
				contentHeight: "50%",
				contentWidth: "50%",
				verticalScrolling: false
			});

			that.oMessageView.navigateBack();
			that.oDialog.open();

		}
	};
});