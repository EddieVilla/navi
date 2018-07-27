import { moduleForComponent, test } from 'ember-qunit';
import { set } from '@ember/object';
import { later } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('prediction-contextdata-intervals-warning', 'Integration | Component | prediction contextdata intervals warning', {
  integration: true
});

test('missing intervals present', function(assert) {
  assert.expect(6);

  let response = {
    meta: {
      missingIntervals: [
        '2018-11-10 00:00:00.000/2018-11-13 00:00:00.000',
        '2018-11-14 00:00:00.000/2018-11-16 00:00:00.000',
        '2018-11-19 00:00:00.000/2018-11-20 00:00:00.000'
      ]
    }
  };
  set(this, 'response', response);
  set(this, 'onDetailsToggle', () => {});

  this.render(hbs`{{prediction-contextdata-intervals-warning
    response=response
    onDetailsToggle=onDetailsToggle
  }}`);

  assert.equal(this.$('.prediction-contextdata-intervals-warning__message-text').text().trim(),
    'Results have missing data.',
    'The component is visible when missing intervals are present and the warning is displayed');

  assert.notOk(this.$('.prediction-contextdata-intervals-warning__details-content').is(':visible'),
    'The details section is not expanded by default');

  this.$('.prediction-contextdata-intervals-warning__contents').click();

  assert.ok(this.$('.prediction-contextdata-intervals-warning__details-content').is(':visible'),
    'The details section expands when the component is clicked');

  assert.deepEqual(this.$('.prediction-contextdata-intervals-warning__date-interval').toArray().map(elm => elm.innerHTML),
    ['2018/11/10 - 2018/11/12', '2018/11/14 - 2018/11/15', '2018/11/19'],
    'The missing intervals are displayed correctly');

  assert.equal(this.$('.prediction-contextdata-intervals-warning__disclaimer').text().trim(),
    'Note: Listed intervals include both the start and end dates.',
    'The disclaimer is shown when the details are expanded');

  this.$('.prediction-contextdata-intervals-warning__contents').click();

  assert.notOk(this.$('.prediction-contextdata-intervals-warning__details-content').is(':visible'),
    'The details section collapses when the component is clicked');
});

test('no missing intervals', function(assert) {
  assert.expect(1);

  let response = { meta: { } };
  set(this, 'response', response);

  this.render(hbs`{{prediction-contextdata-intervals-warning
    response=response
  }}`);

  assert.notOk(this.$('.prediction-contextdata-intervals-warning__footer').is(':visible'),
    'The component is not visible when there are no missing intervals');
});

test('onDetailsToggle', function(assert) {
  const done = assert.async();

  assert.expect(1);

  let response = {
    meta: {
      missingIntervals: [
        '2018-11-10 00:00:00.000/2018-11-13 00:00:00.000',
        '2018-11-14 00:00:00.000/2018-11-16 00:00:00.000',
        '2018-11-19 00:00:00.000/2018-11-20 00:00:00.000'
      ]
    }
  };
  set(this, 'response', response);
  set(this, 'onDetailsToggle', () => assert.ok(true, 'onDetailsToggle action is called when the details are toggled'));

  this.render(hbs`{{prediction-contextdata-intervals-warning
    response=response
    onDetailsToggle=onDetailsToggle
  }}`);

  this.$('.prediction-contextdata-intervals-warning__contents').click();

  later(() => done(), 300);
});
