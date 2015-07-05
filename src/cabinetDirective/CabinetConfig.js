/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Configuration object for cabinet directive.
 */
'use strict';

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = CabinetConfig;

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var SNAKE_CASE_REGEXP = /[A-Z]/g;

//-------------------------------------
// Configuration object
//-------------------------------------

/*
 * Manages the configuration options for the cabinet directive.
 *
 * @constructor
 * @param {object} [options]
 */
function CabinetConfig(options) {

    this.openOnHover = false;
    this.oneAlwaysOpen = false;
    this.allowMultipleOpen = false;
    this.opened = [];
    this.closed = [];

    // The element classes should only be accessed through the
    // elementClass() function. They are initially derived from
    // the directive names using camelcase to snakecase conversion.
    this.elementClasses = {};

    // The directive names should not be modified after
    // the directives are created.
    this.directiveNames = {
        cabinet: 'cabinet',
        drawerTrigger: 'drawerTrigger',
        drawerContents: 'drawerContents',
        drawerClass: 'drawerClass'
    };

    // Directive names are only valid when passed through constructor.
    if (options && options.directiveNames) {
        angular.extend(this.directiveNames, options.directiveNames);
    }

    // Create element classes from directive names.
    for (var key in this.directiveNames) {
        var directiveName = this.directiveNames[key];
        this.elementClasses[directiveName] = this.snakeCase(directiveName);
    }

    if (options) {
        this.copyOptions(options);
    }
}

var proto = CabinetConfig.prototype;

/*
 * Copy valid options into config.
 *
 * @param {object} options
 * @param {boolean} [isArrayRef]
 *    True to copy reference for arrays rather than copy.
 */
proto.copyOptions = function(options, isArrayRef) {
    var i, key;

    var booleanKeys = ['openOnHover', 'oneAlwaysOpen', 'allowMultipleOpen'];
    for (i = 0; i < booleanKeys.length; i++) {
        key = booleanKeys[i];
        if (options[key] !== undefined) {
            this[key] = options[key];
        }
    }

    var arrayKeys = ['opened', 'closed'];
    for (i = 0; i < arrayKeys.length; i++) {
        key = arrayKeys[i];
        if (options[key] !== undefined) {
            this[key] = isArrayRef ? options[key] : options[key].splice(0);
        }
    }

    if (options.elementClasses !== undefined) {
        angular.extend(this.elementClasses, options.elementClasses);
    }
};

/*
 * Returns the element class for the directive.
 *
 * @param {string} directiveName Use original directive names only.
 * @return {string}
 */
proto.getElementClass = function(directiveName) {
    var optDirectiveName = this.directiveNames[directiveName];
    return this.elementClasses[optDirectiveName];
};

/*
 * Replaces the directive element's class with the config's
 * element class.
 *
 * @param {string} directiveName Use original directive names only.
 * @param {string} element The directive element.
 * @return {string} classToReplace The element class to replace
 */
proto.replaceElementClass = function(directiveName, element, classToReplace) {
    var newClass = this.elementClass(directiveName);

    if (newClass !== classToReplace) {
        element.removeClass(classToReplace);
        element.addClass(newClass);
    }
    return newClass;
};

/*
 * Converts name from camel case to snake case.
 *
 * Modified angular code snippet.
 * @param {string} name
 * @return {string}
 */
proto.snakeCase = function(name) {
    return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
        return (pos ? '-' : '') + letter.toLowerCase();
    });
};