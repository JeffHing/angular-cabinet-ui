/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * accordion directive.
 */
'use strict';

//--------------------------------------
// Module dependencies and variables
//--------------------------------------

var cabinetDirective = require('angular-cabinet-ui');

require('./directive.css');

//--------------------------------------
// Module exports
//--------------------------------------

module.exports = function(moduleName) {

    cabinetDirective(moduleName, {
        directiveNames: {
            cabinet: 'accordion',
            drawerTrigger: 'accordionTrigger',
            drawerContents: 'accordionContents',
            drawerClass: 'accordionClass'
        }
    });
};
