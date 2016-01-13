var PouchDB = require('pouchdb');
var moment = require('moment');
var Select = require('tether-select');
var $ = require('jquery');
var _ = require('lodash');

var util = require('./util');
var db = require('./db');

var Patient = require('./patient');
var Appointment = require('./appointment').Appointment;
var appointmentType = require('./appointment').TYPE;

function clear() {
  db.appointments.allDocs({
    include_docs: true
  }).then(function (result) {
    _.map(result.rows, 'doc').forEach(function(dud) {
      db.appointments.remove(dud);
    })
  })
}

function putAppointment() {
  var patientId = $('option:selected', $('#appointments select[name="patient"]')).val();
  db.patients.get(patientId).then(function(patient) {
    var defaultAppointmentType = util.getKey(appointmentType, patient.defaultAppointment);
    var date = $('.day.selected').first().data('date');
    var appointment = new Appointment(patient, 1, defaultAppointmentType, date);
    appointment._id = util.createId([appointment.patientId, appointment.type, appointment.date]);

    db.appointments.put(appointment).then(function(d) {
    }).catch(function (err) {
      alert('error:\n' + err)
    });
  })
}

function updatePatientSelect() {
  db.patients.allDocs({
    include_docs: true
  }).then(function (result) {
    renderPatientSelect(result.rows);
  }).catch(function (err) {
    alert('Asiakastietojen lataaminen epäonnistui.\n' + err);
  });
}

function renderPatientSelect(patientData) {
  var select = $('#appointments select[name="patient"]');
  _(patientData).map('doc').forEach(function(patient) {
    select.append($('<option>', { value: patient._id, text: patient.name }))
  }).value();
}

function renderAppointments(appointments) {
  var eventList = $('#appointments .event-listing .events');
  eventList.empty();
  _.forEach(appointments, function(appointment) {
    eventList.append(renderAppointment(appointment));
  });
  eventList.children().find('select').each(function() {
    util.initSelect(this, 'select-list');
  })
}

function renderAppointment(appointment) {
  var select = $('<select>', { name: 'appointment-type' });
  util.renderOptions(select, Appointment.appointmentType);
  return $('<li>', {'data-id': appointment._id})
    .append($('<input>', {
      type: 'number',
      name: 'duration',
      value: appointment.duration
    }))
    .append(select)
    .append($('<button>', {class: 'remove'}))
}

$(function() {
  db.patientChanges.on('change', updatePatientSelect);
  updatePatientSelect();
  var a = new Appointment('54Aava4Koulu', 1, appointmentType.SCHOOL, moment().add(2, 'd'));
  var appointments = [a,a,a,a,a];
  util.renderCalendar(moment(), appointments, $('#appointments .calendar'));
  $('.today').addClass('selected');
  $('.calendar').on('click', '.day', function(e) {
    $(this).addClass('selected').siblings().removeClass('selected');
    renderAppointments(); // get date
  });
  $('.add-event').click(putAppointment);
});
