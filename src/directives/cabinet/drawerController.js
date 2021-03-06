/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Drawer controller.
 */
'use strict';

//-------------------------------------
// Dependencies and variables
//-------------------------------------

// Private model name.
var MODEL = '_drawerController';

//-------------------------------------
// Exports
//-------------------------------------

module.exports = DrawerController;

//-------------------------------------
// Controller
//-------------------------------------

/*
 * Manages the user events from the drawerTrigger directive and the
 * drawerContents directive to determine when to make a request to
 * the cabinet controller to open or close the drawer.
 *
 * @constructor
 *
 * @param {object} cabinetCtrl The cabinet controller.
 * @param {number} index The index of this drawer controller.
 * @param {object} $timeout The angular timeout service
 */
function DrawerController(cabinetCtrl, index, $timeout) {
    this[MODEL] = new DrawerModel(cabinetCtrl, index, $timeout);
}

var controllerProto = DrawerController.prototype;

/*
 * Opens or closes the drawer.
 *
 * @param {boolean} [isOpen]
 * @return {boolean} False if close failed
 */
controllerProto.open = function(isOpen) {
    var m = this[MODEL];
    m.isOpen = isOpen;
    if (!m.notifyOpenListeners(m.isOpen)) {
        m.isOpen = true;
        return false;
    }
    return true;
};

/*
 * Indicates whether the drawer is currently open.
 *
 * @return {boolean} The current open state.
 */
controllerProto.isOpen = function() {
    var m = this[MODEL];
    return m.isOpen;
};

/*
 * Adds a listener which is notified when the drawer's open state changes.
 *
 * @param {function} listener
 */
controllerProto.addOpenListener = function(listener) {
    var m = this[MODEL];
    m.openListeners.push(listener);
};

/*
 * Disables the timer. Used for testing only.
 *
 * @param {boolean} isDisabled
 */
controllerProto.disableTimer = function(isDisabled) {
    var m = this[MODEL];
    m.isTimerDisabled = isDisabled;
};

//
// Handle events from trigger directive.
//
controllerProto.onMouseClick = function() {
    var m = this[MODEL];
    m.requestOpen(!m.isOpen);
};

controllerProto.onMouseEnterTrigger = function() {
    var m = this[MODEL];
    if (m.config.openOnHover) {
        m.requestOpen(true);
    }
};

controllerProto.onMouseLeaveTrigger = function() {
    var m = this[MODEL];
    if (m.config.openOnHover) {
        m.requestOpen(false);
    }
};

//
// Handle events from contents directive.
//
controllerProto.onMouseEnterContents = function() {
    this.onMouseEnterTrigger();
};

controllerProto.onMouseLeaveContents = function() {
    this.onMouseLeaveTrigger();
};

//-------------------------------------
// Controller's model.
//-------------------------------------

/*
 * @constructor
 *
 * @param {object} cabinetCtrl The cabinet controller.
 * @param {number} index The index of this drawer controller.
 * @param {object} $timeout The angular timeout service
 */
function DrawerModel(cabinetCtrl, index, timeout) {
    var self = this;

    // The index of this controller.
    self.index = index;

    // Cabinet controller.
    self.cabinetCtrl = cabinetCtrl;

    // Current configuration. Read-only.
    self.config = {};

    // Current open state of drawer.
    self.isOpen = false;

    // Listeners to notify when the open state changes.
    self.openListeners = [];

    // Handle spurious open state changes.
    self.timeout = timeout;
    self.openTimeoutTask = undefined;
    self.requestedOpenState = null;

    // For unit testing. Angular timer mock inconvenient to use.
    self.isTimerDisabled = false;

    // Listen for config changes.
    cabinetCtrl.addConfigListener(function(config) {
        self.config = config;
    });
}

var modelProto = DrawerModel.prototype;

/*
 * Notifies the listeners that the open state has changed.
 *
 * @param {boolean} isOpen
 * @returns {boolean} False if closed failed.
 */
modelProto.notifyOpenListeners = function(isOpen) {
    for (var i = 0; i < this.openListeners.length; i++) {
        var ret = this.openListeners[i](isOpen);
        if (!isOpen && typeof ret === 'boolean' && !ret) {
            // Restore open for previous listeners.
            for (var j = 0; j < i; j++) {
                this.openListeners[j](true);
            }
            return false;
        }
    }
    return true;
};

/*
 * Requests the cabinet controller to open this drawer.
 *
 * Handles spurious open state changes when hovering between
 * drawer trigger and drawer contents by delaying setting of open state
 * by 5ms. If open state changes before then, timer is reset with
 * new value.
 *
 * @param {boolean} isOpen
 */
modelProto.requestOpen = function(isOpen) {
    var self = this;

    // Return immediately if the request is for the same state.
    if (self.requestedOpenState !== null) {
        if (self.requestedOpenState === isOpen) {
            return;
        }
    } else if (self.isOpen === isOpen) {
        return;
    }

    self.requestedOpenState = isOpen;

    // For unit testing.
    if (self.isTimerDisabled) {
        openDrawer();
        return;
    }

    if (self.openTimeoutTask) {
        self.timeout.cancel(self.openTimeoutTask);
    }
    self.openTimeoutTask = self.timeout(function() {}, 5);
    self.openTimeoutTask.then(
        openDrawer
    );

    function openDrawer() {
        self.cabinetCtrl.openDrawer(self.index, self.requestedOpenState);
        self.requestedOpenState = null;
    }
};
