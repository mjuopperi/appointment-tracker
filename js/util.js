var pouchCollate = require('pouchdb-collate');
var moment = require('moment');
var clndr = require('clndr');
var Select = require('tether-select');
var $ = require('jquery');
var _ = require('lodash');

var appointmentType = require('./appointment').TYPE;

function getKey(obj, val) {
  return _.findKey(obj, function(chr) { return chr == val });
}

function createId(values) {
  return pouchCollate.toIndexableString(values).replace(/\u0000/g, '\u0001');
}

function isNew(change) {
  return change.doc._rev.startsWith('1-');
}

function renderOptions(select, selected) {
  _.each(appointmentType, function(text, value) {
    select.append($('<option>', { value: value, text: text }));
  });
  if (typeof selected !== 'undefined') select.val(selected);
}

function initSelect(select, className) {
  return new Select({
    el: select,
    className: 'select-theme-default ' + className
  });
}

function renderCalendar(date, events, container) {
  date.locale('fi');
  moment.locale('fi');
  return container.clndr({
    startWithMonth: date,
    events: events,
    template: $('#calendar-template').html(),
    daysOfTheWeek: ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']
  });
}

module.exports = {
  getKey: getKey,
  createId: createId,
  isNew: isNew,
  renderOptions: renderOptions,
  initSelect: initSelect,
  renderCalendar: renderCalendar
};
