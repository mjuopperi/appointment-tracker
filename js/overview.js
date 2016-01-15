var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
var moment = require('moment');
var $ = require('jquery');
var _ = require('lodash');

var util = require('./util');
var db = require('./db');

var Patient = require('./patient');
var Appointment = require('./appointment').Appointment;
var appointmentType = require('./appointment').TYPE;

function byMonth(appointment) {
  return moment(appointment.date).format('YYYY-MM')
}

function groupByPatient(appointments) {
  return _.chain(appointments).groupBy('patientId').map(function(appointments) {
    var appointmentsByDate = groupByDate(appointments);
    return {
      patientId: appointments[0].patientId,
      patientName: appointments[0].patientName,
      appointments: appointmentsByDate,
      sum: _.chain(appointmentsByDate).map('sum').sum()
    }
  }).value()
}

function groupByDate(appointments) {
  return _.chain(appointments)
    .groupBy(byMonth).pairs()
    .map(function(val) {
      var date = moment(val[0]);
      var appointments = sumByType(val[1]);
      return {
        year: date.year(),
        month: date.month(),
        appointments: appointments,
        sum: sumAppointments(appointments)
      }
    }).value();
}

function sumByType(appointments) {
  return _.chain(appointments).reduce(function(result, appointment) {
    result[appointment.type] = result[appointment.type] || 0 ;
    result[appointment.type] += parseInt(appointment.duration);
    return result;
  }, {}).value()
}

function getStuff(year, callback) {
  var start = moment().year(year).startOf('year').valueOf();
  var end = moment().year(year).endOf('year').valueOf();
  db.appointments.find({
    selector: {
      patientId: { $gt: null },
      date: { $gte : parseInt(start), $lte: end }
    },
    sort: [{ patientId: 'desc' }, { date: 'desc' }]
  }).then(callback)
}

function sumAppointments(appointments) {
  return _.chain(appointments).values().sum().value();
}

function renderYear(year, patientAppointments) {
  return _.map(patientAppointments, function(patient) {
    patient.appointments = _.range(12).map(function (month) {
      var data = _.find(patient.appointments, function (o) {
        return o.month == month;
      });
      if (typeof data !== 'undefined') return data;
      else return {
        year: year,
        month: month,
        appointments: [],
        sum: 0
      }
    });
    return patient;
  });
}

function renderPatientYear(patientData, year) {
  $('<div>', {class: 'patient-row'})
}

function updatePatientSelect() {
  return db.patients.allDocs({
    include_docs: true
  }).then(function (result) {
    renderPatientSelect(result.rows);
    //initCalendar()
  }).catch(function (err) {
    alert('Asiakastietojen lataaminen epäonnistui.\n' + err);
  });
}

function renderPatientSelect(patientData) {
  var select = $('#overview select[name="patient"]');
  select.empty();
  select.append($('<option>', { value: 'all', text: 'Kaikki' }));
  _(patientData).map('doc').forEach(function(patient) {
    select.append($('<option>', { value: patient._id, text: patient.name }))
  }).value();
}

function previousYear() {
  currentDate.subtract(1, 'year');
  updateCalendar(currentDate);
}
function nextYear() {
  currentDate.add(1, 'year');
  updateCalendar(currentDate);
}

function updateCalendar(date) {
  getStuff(date.year(), function(stuff) {
    var data = {
      year: date.year(),
      monthNames: moment.monthsShort(),
      patientData: renderYear(date.year(), groupByPatient(stuff.docs))
    };
    util.renderMonthCalendar(data, $('#overview').find('.year-calendar'));
  });
}

var currentDate = moment();

module.exports = {
  updateCalendar: updateCalendar,
  currentDate: currentDate
};

$(function() {
  updatePatientSelect();
  updateCalendar(currentDate);
  var calendar = $('.year-calendar');
  calendar.on('click', '.previous-year-button', previousYear);
  calendar.on('click', '.next-year-button', nextYear);
});
