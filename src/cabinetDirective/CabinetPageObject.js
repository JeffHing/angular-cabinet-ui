/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * The test object for the cabinet directive.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var extend = require('extend-this');
var HasStyle = require('HasStyle');
var AngularTestContext = require('angular-test-context');
var cabinetDirective = require('angular-cabinet-directive');
var CabinetConfig = require('./CabinetConfig');
var DrawerTriggerPageObject =
    require('./drawerTriggerDirective/DrawerTriggerPageObject');
var DrawerContentsPageObject =
    require('./drawerContentsDirective/DrawerContentsPageObject');

// Private model name.
var MODEL = '_cabinetPageObject';

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = CabinetPageObject;

//-------------------------------------
// Test object
//-------------------------------------

/*
 * @constructor
 */
function CabinetPageObject(html, scopeProperties, options) {
    var m = this[MODEL] = {};

    // Add cabinet directives to module.
    angular.module('testApp', []);
    cabinetDirective('testApp', options);

    // Create test context.
    var testContext = new AngularTestContext('testApp');


    // Compile the HTML snippet.
    var cabinetEl = testContext.compile(html, scopeProperties);

    //
    // Adjust element selectors according to the directive names.
    //
    var config = new CabinetConfig(options);
    var directiveNames = config.directiveNames;
    var triggerSelector = '[' +
        config.snakeCase(directiveNames.drawerTrigger) + ']';
    var contentsSelector = '[' +
        config.snakeCase(directiveNames.drawerContents) + ']';

    //
    // Create test objects from elements in compiled HTML.
    //
    var i;

    // Create a DrawerTriggerPageObject for each trigger.
    m.triggerPageObjects = [];
    var triggerElements = $(cabinetEl).find(triggerSelector);
    for (i = 0; i < triggerElements.length; i++) {
        m.triggerPageObjects.push(
            new DrawerTriggerPageObject($(triggerElements[i]),
                directiveNames.drawerTrigger)
        );
    }

    // Create a DrawerContentsPageObject for each contents.
    m.contentsPageObjects = [];
    var contentsElements = $(cabinetEl).find(contentsSelector);
    for (i = 0; i < contentsElements.length; i++) {
        m.contentsPageObjects.push(
            new DrawerContentsPageObject($(contentsElements[i]))
        );
    }

    // Extend this test object.
    extend(this)
        .withCall(HasStyle, cabinetEl)
        .withDelegate(testContext, '!compile');
}

var proto = CabinetPageObject.prototype;

/*
 * Indicates whether the element has the default class.
 *
 * @returns {boolean}
 */
proto.hasDefaultClass = function() {
    return this.hasClass('cabinet');
};

/*
 * Returns the DrawerTriggerPageObject.
 *
 * @param {number} index
 * @returns {object} The test object.
 */
proto.getTrigger = function(index) {
    var m = this[MODEL];
    return m.triggerPageObjects[index];
};

/*
 * Returns the DrawerContentsPageObject.
 *
 * @param {number} index
 * @returns {object} The test object.
 */
proto.getContents = function(index) {
    var m = this[MODEL];
    return m.contentsPageObjects[index];

};

// Mixin HasStyle
extend(proto).with(HasStyle.prototype);