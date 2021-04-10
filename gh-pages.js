const ghpages = require('gh-pages');

ghpages.publish('dist', {
    remote: 'upstream'
}, callback);