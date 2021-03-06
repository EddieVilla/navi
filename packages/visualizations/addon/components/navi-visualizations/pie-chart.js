/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/pie-chart
 *   model=model
 *   options=options
 * }}
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { guidFor } from '@ember/object/internals';
import layout from '../../templates/components/navi-visualizations/pie-chart';
import tooltipLayout from '../../templates/chart-tooltips/pie-chart';
import $ from 'jquery';
import { smartFormatNumber } from 'navi-core/helpers/smart-format-number';
import DimensionBuilder from 'navi-visualizations/chart-builders/dimension';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName - don't render a DOM element
   */
  tagName: '',

  /**
   * @property {Service} metricName
   */
  metricName: service(),

  /**
   * @property {String} chartId - return pie-chart-widget with its ember id appended to it
   */
  chartId: computed(function() {
    return `pie-chart-widget-${guidFor(this)}`;
  }),

  /**
   * @property {Array} widgetClassNames - since pie-chart is a tagless wrapper component,
   * classes specified here are applied to the underlying c3-chart component
   */
  widgetClassNames: computed(function() {
    return ['pie-chart-widget', this.get('chartId')];
  }),

  /**
   * @property {Object} request
   */
  request: computed.alias('model.firstObject.request'),

  /**
   * @property {Object} builder - Series builder for pie chart
   */
  builder: DimensionBuilder.create(),

  /**
   * @property {Object} seriesConfig - config for chart series
   */
  seriesConfig: computed.readOnly('options.series.config'),

  /**
   * Formatter for label (percentage value) shown on pie slices
   * @property {Object} pieConfig - pie chart specific config
   */
  pieConfig: computed(function() {
    return {
      pie: {
        label: {
          format: (value, ratio) => {
            return smartFormatNumber([ratio * 100]) + '%';
          }
        }
      }
    };
  }),

  /**
   * @property {String} metricDisplayName - display name for metric
   */
  metricDisplayName: computed('options', function() {
    let metric = get(this, 'seriesConfig.metric');

    return get(this, 'metricName') && get(this, 'metricName').getDisplayName(metric);
  }),

  /**
   * @property {Object} chart data config
   */
  dataConfig: computed('model.firstObject', 'seriesConfig', function() {
    let response = get(this, 'model.firstObject.response'),
        request = get(this, 'request'),
        seriesConfig = get(this, 'seriesConfig'),
        seriesData = get(this, 'builder').buildData(get(response, 'rows'), seriesConfig, request);

    return {
      data: {
        type: 'pie',
        json: seriesData
      }
    };
  }),

  /**
   * @property {Object} config - config options for the chart
   */
  config: computed('options', 'dataConfig', function() {
    return $.extend(true, {},
      get(this, 'pieConfig'),
      get(this, 'options'),
      get(this, 'dataConfig'),
      { tooltip: get(this, 'chartTooltip') }
    );
  }),

  /**
   * @property {Component} tooltipComponent - component used for rendering HTMLBars templates
   */
  tooltipComponent: computed(function() {
    let owner = getOwner(this),
        byXSeries = get(this, 'builder.byXSeries'),
        tooltipComponent = Component.extend(
          owner.ownerInjection(),

          {
            layout: tooltipLayout,

            rowData: computed('x', 'requiredToolTipData', function() {
              // Get the full data for this combination of x + series
              let series = get(this, 'requiredToolTipData'),
                  dataForSeries = byXSeries.getDataForKey(get(this, 'x') + series.id) || [];

              return dataForSeries[0];
            })
          },
          { renderer: owner.lookup('renderer:-dom') }
        );

    return tooltipComponent;
  }),

  /**
   * @property {Object} chartTooltip - configuration for tooltip
   */
  chartTooltip: computed('seriesConfig.metric', function() {
    let tooltipComponent = get(this, 'tooltipComponent'),
        rawData = get(this, 'dataConfig.data.json'),
        metric = get(this, 'seriesConfig.metric');

    return {
      contents(tooltipData) {
        let x = rawData[0].x.rawValue,
            tooltip = tooltipComponent.create({
              x,
              requiredToolTipData: tooltipData[0],
              metric
            });

        run(() => {
          let element = document.createElement('div');
          tooltip.appendTo(element);
        });

        let innerHTML = tooltip.element.innerHTML;
        tooltip.destroy();
        return innerHTML;
      }
    };
  }),

  /**
   * Fires before the element is destroyed
   * @method willDestroy
   * @override
   */
  willDestroy() {
    this._removeMetricLabel();
  },

  /**
   * Removes metric label from pie chart
   * @method _removeTitle
   * @private
   */
  _removeMetricLabel() {
    let tspans = d3.selectAll(`.${this.get('chartId')} text.c3-title > .pie-metric-label`);
    tspans.remove();
  },

  /**
   * Creates the pie chart's metric label
   * @method _drawMetricLabel
   * @private
   */
  _drawMetricLabel() {
    let titleElm    = d3.select(`.${this.get('chartId')} text.c3-title`),
        svgElm      = d3.select(`.${this.get('chartId')} svg`),
        chartElm    = d3.select(`.${this.get('chartId')} .c3-chart-arcs`),

        /*
         * We want the metric label to be just to the left of the pie chart
         * Find the x translation of the pie chart element and subtract half the chart's width and 50 more pixels
         */
        xTranslate  = d3.transform(chartElm.attr('transform')).translate[0] - (chartElm.node().getBBox().width / 2) - 50,
        yTranslate  = svgElm.style('height').replace('px', '') / 2, //vertically center the label in the svg
        metricTitle = get(this, 'metricDisplayName');

    titleElm.insert('tspan')
      .attr('class', 'pie-metric-label')
      .attr('y', 0)
      .attr('x', 0)
      .text(metricTitle);

    //rotate the label to be vertical and place it just left of the pie chart
    titleElm.attr('text-anchor', 'middle')
      .attr('transform', `translate(${xTranslate}, ${yTranslate}) rotate(-90)`);
  },

  /**
   * @property {Object} actions
   */
  actions: {
    /**
     * Redraws the metric label. Called when pie chart is rendered.
     * @method redrawMetricLabel
     * @private
     */
    redrawMetricLabel() {
      if(!get(this, 'isDestroyed') && !get(this, 'isDestroying')){
        this._removeMetricLabel();
        this._drawMetricLabel();
      }
    }
  }
});
