/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard response
 */

import Ember from 'ember';

export default Ember.Object.extend({
  /**
   * @method normalize - normalizes the JSON response
   * @param response {Object} - JSON response object
   * @returns {Object} - normalized JSON object
   */
  normalize(payload){
    if(payload){
      return {
        rows: payload.rows,
        meta: payload.meta || {}
      };
    }
  }
});
