/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{show-all-filter-vals
 *      filter=filter
 *      updateFilterValues=(action updateFilterValuesAction)
 *      cancel=(action cancelAction)
 *   }}
 */
import Ember from 'ember';
import layout from '../templates/components/show-all';

const { assert, set, get } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['show-all'],

  /**
   * @property {Object} filter - filter object
   */
  filter: undefined,

  /**
   * @property {Array} values - buffer containing changes to filter values
   */
  values: undefined,

  /**
   * @property {Boolean} filterValsDidChange - boolean to indicate if values got updated
   */
  filterValsDidChange: false,

  /**
   * @method init
   */
  init() {
    this._super(...arguments);

    let filter = get(this, 'filter');
    assert('filter must be defined', filter);

    set(this, 'values', [].concat(get(filter, 'values').toArray()));// Shallow copy of filter values array
  },

  actions: {
    removeFilterVal(filterVal) {
      Ember.A(get(this, 'values')).removeObject(filterVal);
      set(this, 'filterValsDidChange', true);
    }
  }
});
