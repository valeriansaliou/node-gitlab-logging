/*
 * Node GitLab Logging
 *
 * Copyright 2014, Valerian Saliou
 * Author: Valerian Saliou <valerian@valeriansaliou.name>
 */


const NS = 'gitlab-logging';


// Import libs
const log = require('loglevel');
const node_gitlab = require('node-gitlab');


// Import modules
const helpers = require('./src/helpers');


// Sets log level
exports.set_loglevel = function(level) {
    log.setLevel(level);
};


// Handles an incoming error stacktrace
exports.handle = function(error, environment, options) {
    const FN = '[' + NS + '.handle' + ']';

    if(options.token === undefined || options.host === undefined ||
       options.project_id === undefined || options.assignee_id === undefined) {
        log.error(FN, 'Missing options, aborting!');
        return;
    }

    const gitlab_client = node_gitlab.create({
        api: url.resolve(options.host, '/api/v3'),
        privateToken: options.token
    });

    if(gitlab_client !== null && error) {
        helpers.engage(gitlab_client, error, environment, options);
    }
};
