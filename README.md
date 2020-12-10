node-gitlab-logging
===================

node-gitlab-logging is a custom log handler that has been written with the purpose of auto-opening (and assigning) issues on GitLab everytime something goes south with NodeJS code.

Useful for production deployments, where you want to track the issues directly from GitLab, not from a dark server log file.

node-gitlab-logging is smart enough to recognize similar errors, thus not opening blindly a new issue everytime.

## Setup

* Add `gitlab-logging` to your package.json dependencies.

* Then, require and configure the module using the code below:

```javascript
gitlab_logging = require('gitlab-logging');

/* GitLab options */
gitlab_logging.configure({
    // Required
    host: 'https://gitlab.server.tld',
    user: 'gitlab.user',
    token: 'USER_GITLAB_TOKEN',         // Get this from GitLab user account information
    project_id: 114,                    // Get the project ID from the DB
    assignee_id: 2,                     // Get the assignee ID from the DB (optional, you can drop this parameter)

    // Optional
    environment: 'production'           // The NodeJS environment in use, useful when you pre-process the NODE_ENV value
});
```

* Then, when you need to handle an error, just call:

```javascript
// Boom, the error variable value will be redirected to your GitLab issues tracker!
gitlab_logging.handle(error);
```

* If you need to catch all unhandled errors (which is recommended!), use the following code:

```javascript
process.on('uncaughtException', function(error) {
    var error_message = error.stack || error;

    // Log to console
    console.error('uncaughtException', error_message);

    // Pipe error to GitLab
    gitlab.handle(error_message, function() {
        // Recommended: kill the NodeJS process (restart a clean one via forever)
        // The process is killed after the issue gets opened (respectfully of network delays)
        process.exit(1);
    });
});
```

* Enjoy!

## Notes

* This module is kept up-to-date with latest GitLab API changes. Thus, ensure you're running the latest GitLab version in time when using node-gitlab-logging!

* node-gitlab-logging has been built by the happy folks at [Waaave Network](https://waaave.com/), for their website needs.
