/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard metadata
 */

import Ember from 'ember';

export default Ember.Object.extend({

  /**
   * @method _normalizeTable - normalizes the table object
   * @param rawTables {Array} - array of table objects
   * @returns {Object} - normalized table object
   */
  _normalizeTable: function(rawTables) {
    // build dimension and metric arrays
    let dimensions = [],
        metrics = [],
        tables = rawTables.map((table) => {

          let timeGrains = table.timeGrains.map((timegrain) => {

            dimensions = dimensions.concat(timegrain.dimensions);

            /*
             * since in fili, the metric valueTypes come under key `type`, remap it to `valuetype` and set `type` to what
             * it's supposed to be so it doesn't override the model
             */
            metrics = metrics.concat(timegrain.metrics.map(metric => Object.assign(
              {valueType: metric.type},
              metric,
              {type: 'metric'}
            )));

            // build time-grain object
            return {
              name: timegrain.name,
              longName: timegrain.longName,
              description: timegrain.description,
              retention: timegrain.retention,
              metricIds: Ember.A(timegrain.metrics).mapBy('name'),
              dimensionIds: Ember.A(timegrain.dimensions).mapBy('name')
            };

          });

          // build table object
          return {
            name: table.name,
            longName: table.longName,
            description: table.description,
            category: table.category,
            timeGrains: timeGrains
          };
        });

    return {
      tables: tables,
      dimensions: dimensions,
      metrics: metrics
    };
  },

  /**
   * @method normalize - normalizes the JSON response
   * @param response {Object} - JSON response object
   * @returns {Object} - normalized JSON object
   */
  normalize(payload){
    if (payload && payload.tables) {
      return this._normalizeTable(payload.tables);
    }
  }
});
