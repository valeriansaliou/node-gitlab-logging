/*
 * Node GitLab Logging
 *
 * Copyright 2014, Valerian Saliou
 * Author: Valerian Saliou <valerian@valeriansaliou.name>
 */


const NS = 'gitlab-logging/helpers';


// Import libs
const log = require('loglevel');
const crypto = require('crypto');


// Process issue checksum
function __checksum(error) {
    const FN = '[' + NS + '.__checksum' + ']';

    return crypto.createHash('md5').update(error).digest('hex');
}


// Process issue data
function __data(error, options, checksum) {
    const FN = '[' + NS + '.__data' + ']';

    var description = {
        head: '#### :zap: Note: this issue has been automatically opened.',
        trace: '```javascript\n' + error + '\n```'
    };

    var data = {};

    data.title = ('[ERROR@' + options.environment + '] Events Server Exception (' + checksum + ')');
    data.description = description.head + '\n\n---\n\n' + description.trace;

    return data;
}


// Handles project list from GitLab
function __handle_list(gitlab_client, options, error, issues, issue_data, callback) {
    const FN = '[' + NS + '.__handle_list' + ']';

    try {
        if(error !== null) {
            log.error(FN, 'Could not list issues from GitLab');

            if(typeof callback == 'function') {
                callback();
            }
        } else {
            var existing_issue_id = null;
            var existing_issue_state = null;

            for(var i in issues) {
                if(issues[i].title == issue_data.title) {
                    existing_issue_id = issues[i].id;
                    existing_issue_state = issues[i].state;

                    break;
                }
            }

            if(existing_issue_id !== null) {
                if(existing_issue_state !== 'opened') {
                    __reopen(gitlab_client, options, existing_issue_id, callback);
                } else {
                    log.info(FN, 'Issue existsnd a is already opened, not re-opening');

                    if(typeof callback == 'function') {
                        callback();
                    }
                }
            } else {
                __create(gitlab_client, options, issue_data, callback);
            }
        }
    } catch(_e) {
        log.error(FN, _e);

        if(typeof callback == 'function') {
          callback();
        }
    }
}


// Reopens a closed issue
function __reopen(gitlab_client, options, existing_issue_id, callback) {
    const FN = '[' + NS + '.__reopen' + ']';

    gitlab_client.issues.edit(
        options.project_id,
        existing_issue_id, {
            description: 'Reopened from backend because the exception happened once again.',
            state_event: 'reopen'
        }, function(error, row) {
            __handle_reopen(error, row, callback);
        }
    );
}


// Handles the reopening response
function __handle_reopen(error, row, callback) {
    const FN = '[' + NS + '.__handle_reopen' + ']';

    try {
        if(error !== null || row.state !== 'reopened') {
            log.error(FN, 'Could not re-open existing issue on GitLab');
        } else {
            log.info(FN, 'Re-opened existing issue on GitLab');
        }

        if(typeof callback == 'function') {
            callback();
        }
    } catch(_e) {
        log.error(FN, _e);

        if(typeof callback == 'function') {
          callback();
        }
    }
}


// Creates a new issue
function __create(gitlab_client, options, issue_data, callback) {
    const FN = '[' + NS + '.__create' + ']';

    gitlab_client.issues.create(
        options.project_id, {
            title: issue_data.title,
            description: issue_data.description,
            assignee_id: options.assignee_id,
            labels: 'node, error, bug'
        }, function(error, row) {
            __handle_create(error, row, callback);
        }
    );
}


// Handles the creation response
function __handle_create(error, row, callback) {
    const FN = '[' + NS + '.__handle_create' + ']';

    try {
        if(error !== null) {
            log.error(FN, 'Could not open issue on GitLab');
        } else {
            log.info(FN, 'Opened issue on GitLab');
        }

        if(typeof callback == 'function') {
            callback();
        }
    } catch(_e) {
        log.error(FN, _e);

        if(typeof callback == 'function') {
          callback();
        }
    }
}


// Engages the issue opening process
exports.__engage = function(gitlab_client, error, options, callback) {
    const FN = '[' + NS + '.__engage' + ']';

    try {
        log.info(FN, 'Engaging GitLab issue opening process...');

        // Process issue SHA-1 checksum
        var checksum = __checksum(error);

        // Process issue data
        var issue_data = __data(error, options, checksum);

        // Check if issue already exists
        gitlab_client.issues.all({
            project_id: options.project_id
        }, function(error, issues) {
            __handle_list(gitlab_client, options, error, issues, issue_data, callback);
        });
    } catch(_e) {
        log.error(FN, _e);

        if(typeof callback == 'function') {
          callback();
        }
    }
};
