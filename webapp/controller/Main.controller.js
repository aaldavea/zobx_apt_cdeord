sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./Utilities",
	"sap/m/MessageBox",
	'sap/m/Token',
	"sap/ui/model/Filter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, Utilities, MessageBox, Token, Filter) {
		"use strict";
		var that;
		var oModel;
		var localModel, flag = false;
		return Controller.extend("com.sap.build.custom.zobx_apt_cdeord.controller.Main", {

			onInit: function (evt) {
				that = this;
				localModel = that.getView().getModel("localModel");
				oModel = that.getView().getModel();

				localModel.setProperty("/visibles", {
					"/SpForm-SingleSet": true,
					"/SpForm-MultipSet": false,
					"/SpForm-CrUpRefer": false,
				});
				localModel.setProperty("/SingleSet", {
					"OrderSet": [{}]
				});
				localModel.setProperty("/Reference", {
					"SetIdMaterials": []
				});
				localModel.setProperty("/bBtnError", false);
			},
			onAfterRendering: function () {
				that.byId("SimpleForm-SingleSet").setVisible(true);
				that.byId("SimpleForm-MultipleSet").setVisible(false);
				that.byId("SimpleForm-Reference").setVisible(false);
			},
			changeCombo: function (e) {
				var combo = that.getView().byId('cdCombo').getSelectedItem().getKey();
				localModel.setProperty("/bBtnError", false);
				if (combo == 1) {

					that.byId("btn-SingleSet").setVisible(true);
					that.byId("btn-Reference").setVisible(true);
					that.byId("btn-Clean").setVisible(true);

					localModel.setProperty("/visibles/SpForm-SingleSet", true);
					localModel.setProperty("/visibles/SpForm-MultipSet", false);
					localModel.setProperty("/visibles/SpForm-CrUpRefer", false);
					// that.byId("panel-SaveClean").setVisible(true);

				} else if (combo == 2) {

					that.byId("btn-SingleSet").setVisible(false);
					that.byId("btn-Reference").setVisible(false);
					that.byId("btn-Clean").setVisible(false);

					localModel.setProperty("/visibles/SpForm-SingleSet", false);
					localModel.setProperty("/visibles/SpForm-MultipSet", true);
					localModel.setProperty("/visibles/SpForm-CrUpRefer", false);
					// that.byId("panel-SaveClean").setVisible(false);

				} else {
					that.byId("btn-SingleSet").setVisible(true);
					that.byId("btn-Reference").setVisible(true);
					that.byId("btn-Clean").setVisible(true);

					localModel.setProperty("/visibles/SpForm-SingleSet", false);
					localModel.setProperty("/visibles/SpForm-MultipSet", false);
					localModel.setProperty("/visibles/SpForm-CrUpRefer", true);
					// that.byId("panel-SaveClean").setVisible(true);

				}
			},
			onValidateChange: function () {
				if (flag) {
					that.validateInput();
				}

			},
			_openPlant: function () {
				Utilities._openDialog(that.getView(), "com.sap.build.custom.zobx_apt_cdeord.view.fragment.Plant", that, function (oDialog) {
					sap.ui.getCore().byId("Dlg-Plant-searchField").setPlaceholder("Search");
					sap.ui.getCore().byId("Dlg-Plant-cancel").setText("Cancel");
				});
				localModel.setProperty("/SingleSet/OrderSet/0/RefSetMatId", "");
			},
			_openMaterials: function () {
				let aMessageErros = [];
				var sValueFilter = localModel.getProperty("/SingleSet/OrderSet/0/Plant");
				if (!sValueFilter) {
					Utilities.validateForm(localModel, that, "SimpleForm-SingleSet", "Materials");
					aMessageErros = localModel.getProperty("/Message");
					if (aMessageErros.length > 0) {
						that.getView().byId("btn-Error").setText(aMessageErros.length);
						localModel.setProperty("/bBtnError", true);
						Utilities._showPopover(that);
						return;
					} else {
						localModel.setProperty("/bBtnError", false);
					}
				}

				Utilities._openDialog(that.getView(), "com.sap.build.custom.zobx_apt_cdeord.view.fragment.Material", that, function (oDialog) {
					let oBinding = oDialog.getBinding("items");

					sap.ui.getCore().byId("Dlg-Material-searchField").setPlaceholder("Search");
					sap.ui.getCore().byId("Dlg-Material-cancel").setText("Cancel");

					if (sValueFilter) {
						oBinding.filter([new sap.ui.model.Filter("plant", "EQ", sValueFilter)]);
					}
				});
			},
			_openMultiMaterials: function () {
				Utilities._openDialog(that.getView(), "com.sap.build.custom.zobx_apt_cdeord.view.fragment.MultiMaterial", that, function (oDialog) {

					sap.ui.getCore().byId("Dlg-MultiMaterial-searchField").setPlaceholder("Search");
					sap.ui.getCore().byId("Dlg-MultiMaterial-cancel").setText("Cancel");

				});
			},
			_cancelDialog: function (oEvent) {
				oEvent.getSource().destroy();
				that.getView().getAggregation("dependents").forEach(function (oAggregation) {
					if (oAggregation instanceof sap.m.SelectDialog) {
						oAggregation.destroy();
					}
				});
			},
			_confirmDialog: function (oEvent, oModel, oProperty, dataProperty) {
				let oPropertyData = oEvent.getParameter("selectedItem").getBindingContext(oModel).getProperty();
				localModel.setProperty("/SingleSet/OrderSet/0/" + oProperty, oPropertyData[dataProperty]);
				that.onValidateChange();
				that._cancelDialog(oEvent);
			},
			_confirmDlgMulti: function (oEvent) {
				let oSelectedItems = oEvent.getParameter("selectedItems");
				let aTokens = [];
				for (var i in oSelectedItems) {
					let oProperty = oSelectedItems[i].getBindingContext("ZCDS_MATERIALS_CDS").getProperty();
					let oPropertyData = {
						SetID: oProperty.material
					};
					aTokens.push(oPropertyData);
				}
				localModel.setProperty("/Reference/SetIdMaterials", aTokens);
				that._cancelDialog(oEvent);
			},
			_searchPlant: function (oEvent) {
				let oList = oEvent.getParameter("itemsBinding");
				let aFilters = [];

				if (oEvent.getParameter("value")) {
					aFilters.push(new Filter("name", "Contains", oEvent.getParameter("value")))
					aFilters.push(new Filter("plant", "Contains", oEvent.getParameter("value")))
				}

				oList.filter(aFilters.length > 0 ? new Filter(aFilters, false) : []);
			},
			_searchMaterial: function (oEvent) {
				let oList = oEvent.getParameter("itemsBinding");
				let aFilters = [];
				let sPlant = localModel.getProperty("/SingleSet/OrderSet/0/Plant");

				if (oEvent.getParameter("value")) {
					aFilters.push(new Filter("material", "Contains", oEvent.getParameter("value")))
					// aFilters.push(new Filter("plant", "Contains", oEvent.getParameter("value")))	   
				}
				aFilters.push(new Filter("plant", "Contains", sPlant))

				oList.filter(aFilters.length > 0 ? new Filter(aFilters, true) : []);
			},
			_searchMultiMaterials: function (oEvent) {
				let oList = oEvent.getParameter("itemsBinding");
				let aFilters = [];

				if (oEvent.getParameter("value")) {
					aFilters.push(new Filter("material", "Contains", oEvent.getParameter("value")))
					aFilters.push(new Filter("plant", "Contains", oEvent.getParameter("value")))
				}

				oList.filter(aFilters.length > 0 ? new Filter(aFilters, false) : []);
			},
			onCerrarPopUp: function (oEvent) {
				var id = oEvent.getSource().data("id");
				if (that.byId(id) === undefined) {
					sap.ui.getCore().byId(id).close();
					sap.ui.getCore().byId(id).destroy();
				} else {
					that.byId(id).close();
					that.byId(id).destroy();
				}
			},
			handleValueChange: function (oEvent) {

				let typeFile = oEvent.getParameter("newValue").includes("xlsx");

				if (typeFile === "xlsx") {

				}

				if (oEvent.getSource().oFileUpload.files.length > 0) {
					let name = oEvent.getParameter("newValue");
					let file = oEvent.getSource().oFileUpload.files[0];
					let reader = new FileReader();
					reader.readAsBinaryString(file);
					reader.onload = (event) => {
						let data = event.target.result;
						let workbook = XLSX.read(data, { type: "binary" });
						workbook.SheetNames.forEach(sheet => {
							let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
							// rowObject.forEach(function(oLine){
							// 	oLine.OrderSet = [{
							// 		"Plant": oLine.Plant,
							// 		"RefSetMatId": oLine.RefSetMatId,
							// 		"DcomOrderEnd": oLine.DcomOrderEnd,
							// 		"DcomOrderStart": oLine.DcomOrderStart,
							// 		"NumberOrderSet": oLine.NumberOrderSet
							// 	}]; 
							// 	delete oLine.Plant;
							// 	delete oLine.RefSetMatId;
							// 	delete oLine.DcomOrderEnd;
							// 	delete oLine.DcomOrderStart;
							// 	delete oLine.NumberOrderSet;
							// });	 
							localModel.setProperty("/listaExcel", rowObject);
							that.byId("File-FileUploader").setValue(null);
							sap.ui.core.BusyIndicator.show(0);
							Utilities._openDialog(that.getView(), "com.sap.build.custom.zobx_apt_cdeord.view.fragment.tabla", that, function (oDialog) {
								sap.ui.core.BusyIndicator.hide();
							});
						});
					}
				}
			},
			_pressError: function (oEvent) {
				that.oMessagePopover.toggle(oEvent.getSource());
			},
			_saveSingleSet: function () {
				let value = that.validateInput();
				let oEntry = that.getView().getModel("localModel").getProperty("/SingleSet");
				let sUrl = "/DCom_HeaderSet";
				if (value) {
					sap.ui.core.BusyIndicator.show();
					Utilities.odata.create(oModel, sUrl, oEntry, function (oResult) {
						let aResults = oResult.OrderSet.results;
						Utilities._showLog(that, aResults, "");

						if (aResults[0].Status !== "Error") {
							localModel.setProperty("/SingleSet/OrderSet", [{}]);
						}
					}, function (oError) {
						MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("Message.Error.Description.MSG_ERR_EXCEL"));
					});
				}
			},

			validateInput: function () {
				
				let aMessageErros = [];

				Utilities.validateForm(localModel, that, "SimpleForm-SingleSet");
				aMessageErros = localModel.getProperty("/Message");

				if (aMessageErros.length > 0) {
					that.getView().byId("btn-Error").setText(aMessageErros.length);
					localModel.setProperty("/bBtnError", true);
					Utilities._showPopover(that);
					flag = true;
					// that.byId("inp-Plant").attachChange(that, that.onValidateChange);
					// that.byId("inp-RsetMadID").attachChange(that, that.onValidateChange);
					// that.byId("DateTime-StartDate").attachChange(that, that.onValidateChange);
					// that.byId("DateTime-EndDate").attachChange(that, that.onValidateChange);
					// that.byId("inp-NumberOrder").attachChange(that, that.onValidateChange);
					return false;
				} else {
					localModel.setProperty("/bBtnError", false);
					return true;
				}
			},

			_saveExcel: function () {

				let oEntry = {};
				let sUrl = "/DCom_HeaderSet";
				let _oEntry = that.getView().getModel("localModel").getProperty("/listaExcel");

				for (var i in _oEntry) {
					_oEntry[i].DcomOrderEnd = Utilities.formatDate(_oEntry[i].DcomOrderEnd);
					_oEntry[i].DcomOrderStart = Utilities.formatDate(_oEntry[i].DcomOrderStart);
				}
				oEntry["OrderSet"] = _oEntry;

				that._closeDialog("dlgTable");
				sap.ui.core.BusyIndicator.show();
				Utilities.odata.create(oModel, sUrl, oEntry, function (oResult) {
					let aResults = oResult.OrderSet.results;
					Utilities._showLog(that, aResults, "");
				}, function (oError) {
					MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("Message.Error.Description.MSG_ERR_EXCEL"));
				});
			},
			_saveReference: function () {
				let oEntry = {};
				let sUrl = "/Reference_OrderSet";
				let aMessageErros = [];
				let aTokens = [];
				let MultiInput = that.byId("MultiInput-Reference");
				let oPropertyData;

				if (MultiInput.getValue() !== "") {
					oPropertyData = {
						SetID: MultiInput.getValue()
					};
					aTokens.push(oPropertyData);
				}

				for (var i in MultiInput.getTokens()) {
					let oProperty = MultiInput.getTokens()[i].mProperties.text;
					oPropertyData = {
						SetID: oProperty
					}
					aTokens.push(oPropertyData);
				}

				oEntry["SetIdMaterials"] = aTokens;

				Utilities.validateForm(localModel, that, "SimpleForm-Reference");
				aMessageErros = localModel.getProperty("/Message");

				if (aMessageErros.length > 0) {
					that.getView().byId("btn-Error").setText(aMessageErros.length);
					localModel.setProperty("/bBtnError", true);
					Utilities._showPopover(that);
					return;
				} else {
					localModel.setProperty("/bBtnError", false);
				}
				sap.ui.core.BusyIndicator.show();
				Utilities.odata.create(oModel, sUrl, oEntry, function (oResult) {

					let aResults = oResult.SetIdMaterials.results;
					that.byId("MultiInput-Reference").setValue();
					that.byId("MultiInput-Reference").setTokens([]);
					localModel.setProperty("/Reference/SetIdMaterials", []);

					Utilities._showLog(that, aResults, "X");

				}, function (oError) {
					MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("Message.Error.Description.MSG_ERR_2"));
				});
			},
			_clean: function () {
				localModel.setProperty("/SingleSet/OrderSet", [{}]);
				localModel.setProperty("/Reference/SetIdMaterials", []);
			},
			_closeDialog: function (sName) {
				if (that.byId(sName)) {
					that.byId(sName).close();
					that.byId(sName).destroy();
				} else {
					sap.ui.getCore().byId(sName).close();
					sap.ui.getCore().byId(sName).destroy();
				}
			},
			changePlant: function (oEvent) {
				let sPlant = oEvent.getSource().getValue();
				let oModel = that.getView().getModel("ZCDS_MATERIALS_CDS");
				let sUrl = "/ZCDS_MATERIALS";
				let oParameters = {};

				that.byId("inp-RsetMadID").setValue();
				localModel.setProperty("/SingleSet/OrderSet/0/RefSetMatId", "");

				oParameters["$filter"] = "plant eq '" + sPlant + "'"
				Utilities.odata.read(oModel, sUrl, oParameters, function (oResult) {
					localModel.setProperty("/MATERIALS", oResult.results);
					that.onValidateChange();
				}, function (oError) {
					console.log(oError);
				});
			},
			changeMaterial: function (oEvent) {
				debugger
				// localModel.setProperty("/SingleSet/OrderSet/0/RefSetMatId", sMaterial);
				let text = oEvent.getParameter("value");
				let materials = localModel.getProperty("/MATERIALS");
				console.log(materials);
				materials.map(item => {
					if (item.material == text) {
						that.onValidateChange();
					}
				})
			},
			changeMultiMaterial: function (oEvent) {
				let aTokens = [];
				let sMaterial = oEvent.getSource().getValue();
				debugger
				// for(var i in oSelectedItems){
				// 	let oProperty = oSelectedItems[i].getBindingContext("ZCDS_MATERIALS_CDS").getProperty();
				// 	let oPropertyData = {
				// 		SetID: oProperty.material
				// 	};
				// 	aTokens.push(oPropertyData);
				// }
				// localModel.setProperty("/Reference/SetIdMaterials", aTokens); 
			},
			liveUpperCase: function (oEvent) {
				oEvent.getSource().setValue(oEvent.getSource().getValue().toUpperCase());
				
			}
		});
	});
