/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Delivery Rules Mock Data
 */

export default [
  {
    id: 1,
    createdOn: '2017-01-01 00:00:00',
    updatedOn: '2017-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: 2,
    deliveryType: 'dashboard',
    frequency: 'week',
    schedulingRules: {
      stopAfter: '2017-09-04 00:00:00',
      every: '2 weeks'
    },
    format: {
      type: 'pdf'
    },
    recipients: [ 'user-or-list1@navi.io', 'user-or-list2@navi.io' ],
    version: 1
  }
];
