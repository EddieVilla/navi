/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{prediction-contextdata-intervals-warning
 *       response=response
 *       onDetailsToggle=(action 'resizeVisualization')
 *   }}
 */
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import Moment from 'moment';
import layout from '../templates/components/prediction-contextdata-intervals-warning';

const DATE_FORMAT = 'YYYY[/]MM[/]DD';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName
   */
  tagName: '',

  /**
   * @property {Array} classNames
   */
  classNames: ['prediction-contextdata-intervals-warning'],

  // TODO change the name to just intervals
  /**
   * @property {Array} missingIntervals - The formatted intervals displayed in the details section
   */
  //TODO change name from missingIntervals to predictionIntervals?
  missingIntervals: computed('annotationData', function() { // TODO use annotationData instead of response?
    return get(this, 'annotationData').then(function(response) {
      debugger;
      return response;
    });
  }),

  /**
   * @property {Boolean} showDetails - Determines whether the component is expanded or collapsed
   */
  showDetails: false,

  /**
   * @property {Boolean} warningEnabled - Shows the warning if missing intervals are present
   */
  warningEnabled: computed.notEmpty('missingIntervals')
});
