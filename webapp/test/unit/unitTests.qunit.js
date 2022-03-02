/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comsap.build.custom./zobx_apt_cdeord/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
