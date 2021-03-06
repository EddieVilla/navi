/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Extend c3 to listen to incoming resize events
 * Usage:
 * {{navi-vis-c3-chart
 *   classNames=classNames
 *   data=dataConfig
 *   dataSelection=dataSelectionConfig // Promise which resolves to anomalous data
 *   axis=axisConfig
 *   grid=gridConfig
 *   legend=legendConfig
 *   point=pointConfig
 *   tooltip=tooltipConfig
 *   containerComponent=container
 *  }}
 */
import Ember from 'ember';
import C3Chart from 'ember-c3/components/c3-chart';
import { inject as service } from '@ember/service';
import $ from'jquery';

const { computed, get, getProperties, set } = Ember;

/* globals c3: true */
export default C3Chart.extend({
  /**
   * @property {Service} metricName
   */
  metricName: service(),

  /**
   * @property {Array} classNames
   */
  classNames: ['navi-vis-c3-chart'],

  /**
   * Fires when the `data` property updates
   *
   * @method dataDidChange
   * @override
   */
  dataDidChange() {
    // Add custom classes to each data series for easier reference and coloring
    let { data, dataClasses } = getProperties(this, 'data', 'dataClasses'),
        dataWithClasses = Ember.assign({}, { classes: dataClasses }, data);

    get(this, 'chart').load(dataWithClasses);

    /*
     * select data points (if any)
     * chart.select() triggers resize internally
     */
    let dataSelection = get(this, 'dataSelection');
    if (dataSelection) {
      dataSelection.then((insightsData) => {
        let metricName = get(this, 'metricName'),
            metrics = get(this, 'axis.y.series.config.metrics').map(metric => metricName.getDisplayName(metric)),
            dataSelectionIndices = insightsData.mapBy('index');
        get(this, 'chart').select(metrics, dataSelectionIndices);
      });
    } else {
      /*
       * need not call _resizeFunc explicity when there is data to be selected
       * otherwise the highlighted data circles are mis-aligned
       */

      //Call resize on initial render
      this._resizeFunc();
    }
  },

  /**
   * @property {Object} chart - c3 object reference
   */
  chart: computed('_config', '_chart', function() {
    if (!get(this, '_chart')) {
      let config = get(this, '_config');
      set(this, '_chart', c3.generate(config));
    }
    return get(this, '_chart');
  }),

  /**
   * @property {Object} map of series id to series class name
   */
  dataClasses: computed('data', function() {
    let seriesIds = Ember.A(get(this, 'chart').data()).mapBy('id');

    // Give each series a unique class
    return seriesIds.reduce((seriesToClassMap, seriesId, seriesIndex) => {
      seriesToClassMap[seriesId] = `chart-series-${seriesIndex}`;

      return seriesToClassMap;
    }, {});
  }),

  /**
   * Destroys c3 chart
   *
   * @method didUpdateAttrs
   * @private
   * @returns {Void}
   */
  _teardownChart() {
    get(this, 'chart').destroy();
    set(this, '_chart', null);
  },

  /**
   * Called when the attributes passed into the component have been updated
   *
   * @method didUpdateAttrs
   * @override
   */
  didUpdateAttrs() {
    this._super(...arguments);

    this._teardownChart();
    this.dataDidChange();
  },

  /**
   * Resize the chart
   *
   * @method _resizeFunc
   * @private
   */
  _resizeFunc() {
    // Fill the parent container
    if(!get(this, 'isDestroyed') && !get(this, 'isDestroying')) {
      this.$().css('max-height', '100%');
      this.$().css('min-height', '100%');

      get(this, 'chart').resize();
    }
  },

  didInsertElement() {

    //load data
    this.dataDidChange();

    // Call resize on initial render
    Ember.run.next(this, '_resizeFunc');

    // Call resize on resize event
    let container = $(get(this, 'containerComponent.element'));
    if (container.length) {
      container.on('resizestop.navi-vis-c3-chart', () => {
        Ember.run.scheduleOnce('afterRender', this, '_resizeFunc');
      });
    }
  },

  willDestroyElement() {
    this._super(...arguments);

    let container = $(get(this, 'containerComponent.element'));
    if (container.length) {
      container.off('.navi-vis-c3-chart');
    }

    this._teardownChart();
  }
});
/* globals c3: false */
