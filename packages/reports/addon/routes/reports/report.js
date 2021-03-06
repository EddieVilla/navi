/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

const { computed, get, set } = Ember;

export default Ember.Route.extend({
  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: Ember.inject.service(),

  /**
   * @property {Service} user
   */
  user: Ember.inject.service(),

  /**
   * @property {Service} naviVisualizations
   */
  naviVisualizations: Ember.inject.service(),

  /**
   * @property {Ember.Service} reportActionDispatcher
   */
  reportActionDispatcher: Ember.inject.service(),

  /**
   * @property {String} defaultVisualizationType - visualization type if not
   *                                               specified in report
   */
  defaultVisualizationType: computed(function() {
    return get(this, 'naviVisualizations').defaultVisualization();
  }),

  /**
   * @method model
   * @param {Object} params
   * @param {String} params.reportId - persisted id or temp id of report to fetch
   * @returns {DS.Model|Promise} model for requested report
   */
  model({ reportId }) {
    return get(this, 'user').findOrRegister().then(() =>
      this._findByTempId(reportId) || this.store.findRecord('report', reportId)
    ).then(this._defaultVisualization.bind(this));
  },

  /**
   * @method afterModel
   * @param {DS.Model} report - resolved report model
   * @override
   */
  afterModel(report) {
    if (get(report, 'isNew') && get(report, 'request.validations.isInvalid')) {
      return this.replaceWith(`${this.routeName}.new`, get(report, 'tempId'));
    }

    if (get(report, 'request.validations.isInvalid')) {
      return this.replaceWith(`${this.routeName}.invalid`, get(report, 'tempId') || get(report, 'id'));
    }
  },

  /**
   * @method _findByTempId
   * @private
   * @param {String} id - temp id of local report
   * @returns {DS.Model} report with matching temp id
   *
   */
  _findByTempId(id) {
    return Ember.A(this.store.peekAll('report')).findBy('tempId', id);
  },

  /**
   * Sets default visualization if required
   *
   * @method _defaultVisualization
   * @private
   * @param {DS.Model} report - report model
   * @returns {DS.Model} report with update visualization if required
   *
   */
  _defaultVisualization(report) {
    if(!get(report, 'visualization.type')) {
      set(report, 'visualization',
        this.store.createFragment(get(this, 'defaultVisualizationType'), {}));
    }
    return report;
  },

  /**
   * Rolling back dirty attributes on transition
   * @method deactivate
   * @override
   */
  deactivate() {
    let model = this.currentModel;
    if(!get(model, 'isNew') && get(model, 'hasDirtyAttributes')){
      this.send('revertChanges', model);
    }
  },

  actions: {
    /**
     * @action runReport
     * transition to view subroute if runReport is not handled in subroutes
     */
    runReport(report) {
      this.transitionTo(`${this.routeName}.view`, get(report, 'tempId') || get(report, 'id'));
    },

    /**
     * @action validate
     * @param {Object} request - object to validate
     * @returns {Promise} promise that resolves or rejects based on validation status
     */
    validate(report) {
      return get(report, 'request').validate().then(({ validations }) => {
        if (get(validations, 'isInvalid')) {
          // Transition to invalid route to show user validation errors
          return this.transitionTo(
            `${this.routeName}.invalid`,
            get(report, 'tempId') || get(report, 'id'))
            .then(() => Ember.RSVP.reject()
            );
        }

        return Ember.RSVP.resolve();
      });
    },

    /**
     * @action revertChanges
     * @param {Object} report - object to rollback
     */
    revertChanges(report) {
      report.rollbackAttributes();
    },

    /**
     * @action saveReport
     * @param {DS.Model} report - object to save
     */
    saveReport(report) {
      report.save().then(() => {
        get(this, 'naviNotifications').add({
          message: 'Report was successfully saved!',
          type: 'success',
          timeout: 'short'
        });

        // Switch from temp id to permanent id
        this.replaceWith('reports.report.view', get(report, 'id'));
      }).catch(() => {
        get(this, 'naviNotifications').add({
          message: 'OOPS! An error occurred while saving the report',
          type: 'danger',
          timeout: 'medium'
        });
      });
    },

    /**
     * @action updateTitle
     *
     * Updates report model's title, unless new title is empty
     * @param {String} title
     */
    updateTitle(title) {
      if(!Ember.isEmpty(title)) {
        set(this.currentModel, 'title', title);
      }
    },

    /**
     * @action setMode
     * @param {Boolean} mode - view/edit mode of report
     */
    setMode(mode) {
      this.controller.set('mode', mode);
    },

    /**
     * @action setHasReportRun
     * @param {Boolean} value
     */
    setHasReportRun(value) {
      this.controller.set('hasReportRun', value);
    },

    /**
     * @action onUpdateVisualizationConfig
     *
     * Update visualization metadata in report
     * @param {Object} metadataUpdates
     */
    onUpdateVisualizationConfig(metadataUpdates) {
      let metadata = get(this, 'currentModel.visualization.metadata');

      set(this.currentModel, 'visualization.metadata',
        Ember.$.extend(true, {}, metadata, metadataUpdates)
      );
    },

    /**
     * @action onUpdateReport
     */
    onUpdateReport(actionType, ...args) {
      /*
       * Whenever the request updates, disable the add to dashboard button until the user runs the request
       * This prevents the user from adding an invalid report/visualization to a dashboard
       */
      this.send('setHasReportRun', false);

      /*
       *dispatch action if arguments are passed through
       *TODO validate actionType is a valid report action
       */
      if(actionType){
        get(this, 'reportActionDispatcher').dispatch(actionType, this, ...args);
      }
    },

    /**
     * @action toggleFavorite - toggles favorite model
     */
    toggleFavorite(report) {
      let user = get(this, 'user').getUser(),
          isFavorite = get(report, 'isFavorite'),
          updateOperation = isFavorite ? 'removeObject' : 'addObject',
          rollbackOperation = isFavorite ? 'addObject' : 'removeObject';

      get(user, 'favoriteReports')[updateOperation](report);
      user.save().catch(() => {
        //manually rollback - fix once ember-data has a way to rollback relationships
        get(user, 'favoriteReports')[rollbackOperation](report);
        get(this, 'naviNotifications').add({
          message: 'OOPS! An error occurred while updating favorite reports',
          type: 'danger',
          timeout: 'medium'
        });
      });
    }
  }
});
