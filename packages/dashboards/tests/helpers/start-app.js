import Application from '../../app';
import config from '../../config/environment';
import registerPowerSelectHelpers from '../../tests/helpers/ember-power-select';
import registerBasicDropdownHelpers from 'ember-basic-dropdown/test-support/helpers';
import { merge } from '@ember/polyfills';
import { run } from '@ember/runloop';

registerPowerSelectHelpers();
registerBasicDropdownHelpers();

export default function startApp(attrs) {
  let attributes = merge({}, config.APP);
  attributes = merge(attributes, attrs); // use defaults, but you can override;

  return run(() => {
    let application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
}
