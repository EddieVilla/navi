/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{prediction-contextdata-intervals-warning
 *        response=response
 *        annotationData=annotationData
 *        onDetailsToggle=(action 'resizeVisualization' warningAnimationDuration)
 *   }}
 */
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import Moment from 'moment';
import layout from '../templates/components/missing-intervals-warning';

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

  /**
   * @property {Array} predictioncontextdataIntervals - The formatted intervals displayed in the details section
   */
  predictioncontextdataIntervals: computed('response', function() {
    return ['hi'];
  }),

  /**
   * @property {Boolean} showDetails - Determines whether the component is expanded or collapsed
   */
  showDetails: false,

  /**
   * @property {Boolean} warningEnabled - Shows the warning if missing intervals are present
   */
  warningEnabled: computed.notEmpty('predictioncontextdataIntervals')
});
