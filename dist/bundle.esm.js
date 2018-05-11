import _ from 'lodash';
import path from 'path';
import filePathOneLayer from 'file-path-one-layer';

function lift() {
  /* eslint-disable global-require */

  /* eslint-disable import/no-dynamic-require */

  /* eslint max-len: ["error", 150] */
  // eslint-disable-next-line no-multi-assign
  let policies = this.policies = {}; // eslint-disable-next-line no-multi-assign

  let policiesPath = this.config.paths.policies = path.join(this.projectPath, 'policies');
  return filePathOneLayer(policiesPath).then(files => {
    files.forEach(file => {
      let config = require(file.path);

      policies[file.name] = config.default ? config.default : config;
    });
  }).then(() => {
    this.config.controllerActionPolicies = {};
    this.config.policies = this.config.policies || {};
    let defaultPolicies = this.config.policies['*'] || [];

    _.forEach(this.controllers, (controller, controllerName) => {
      let controllerPolicies = this.config.policies[controllerName] || {};
      let defaultControllerPolicies = controllerPolicies['*'] || defaultPolicies;

      _.forEach(controller, (action, actionName) => {
        if (_.isFunction(action)) {
          this.config.controllerActionPolicies[`${controllerName}.${actionName}`] = controllerPolicies[actionName] || defaultControllerPolicies;
        }
      });
    });

    let unknownPolicies = [];
    this.controllerActionPolicies = _.mapValues(this.config.controllerActionPolicies, policyNames => {
      return _.map(policyNames, policyName => {
        let policy = this.policies[policyName];

        if (!policy) {
          unknownPolicies.push(policyName);
        }

        return policy;
      });
    });

    if (unknownPolicies.length) {
      return Promise.reject(new Error(`Unknown policy:${unknownPolicies.join(',')}`));
    }

    return Promise.resolve();
  });
}

module.exports = lift;
//# sourceMappingURL=bundle.esm.js.map
