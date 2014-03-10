/*
 * Node GitLab Logging
 *
 * Copyright 2014, Valerian Saliou
 * Author: Valerian Saliou <valerian@valeriansaliou.name>
 */


const NS = 'gitlab-logging';


// Import libs
const log = require('loglevel');
const url = require('url');
const node_gitlab = require('node-gitlab');


// Import modules
const helpers = require('./src/helpers');


// Globals
var OPTIONS = null;


// Configures options
exports.configure = function(options) {
    if(options.token === undefined || options.host === undefined ||
       options.project_id === undefined || options.assignee_id === undefined) {
        log.error(FN, 'A required argument is missing, not saving configuration');
        return false;
    }

    if(options.environment === null) {
        options.environment = process.env.NODE_ENV || 'development';
    }

    OPTIONS = options;

    return true;
};


// Sets log level
exports.set_loglevel = function(level) {
    log.setLevel(level);
};


// Handles an incoming error stacktrace
exports.handle = function(error) {
    const FN = '[' + NS + '.handle' + ']';

    if(OPTIONS === null) {
        log.error(FN, 'Please configure the module before using it! Usage: configure(options)');
        return;
    }

    const gitlab_client = node_gitlab.create({
        api: url.resolve(OPTIONS.host, '/api/v3'),
        privateToken: OPTIONS.token
    });

    if(gitlab_client !== null && error) {
        helpers.__engage(gitlab_client, error, OPTIONS);
    }
};
