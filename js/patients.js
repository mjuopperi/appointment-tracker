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

function putPatient(e) {
  e.preventDefault();
  var name = $(this).find('input[name="name"]').val();
  var defaultAppointment = $('option:selected', $(this)).val();
  var patient = new Patient(name, defaultAppointment);
  patient._id = util.createId([patient.name, patient.defaultAppointment]);
  db.patients.put(patient).then(function(d) {
    $('form.add-patient').find('input[name="name"]').val('');
  }).catch(function (err) {
    alert('error:\n' + err)
  });
}

function removePatient() {
  var id = $(this).parent().data('id');
  db.patients.get(id).then(function(patient) {
    db.appointments.find({
      selector: { patientId: patient._id }
    }).then(function(result) {
      _.forEach(result.docs, function(appointment) {
        db.appointments.remove(appointment)
      });
      db.patients.remove(patient);
    }).catch(function(err) {
      alert('Virhe poistettaessa asiakasta:\n', err);
    });
  })
}

function updateName() {
  var id = $(this).parent().data('id');
  var name = $(this).parent().find('input[name="name"]').val();
  db.patients.get(id).then(function(patient) {
    patient.name = name;
    db.patients.put(patient);
  })
}

function updateDefaultAppointment() {
  var id = $(this).parent().data('id');
  var selectedOption = $("option:selected", this).val();
  db.patients.get(id).then(function(patient) {
    patient.defaultAppointment = selectedOption;
    db.patients.put(patient);
  })
}

function fillOptions() {
  util.renderOptions($('#patients').find('> form select'));
}

function updatePatients(change) {
  var patientList = $('ul.patients');
  if (change.deleted) {
    $('ul.patients').find('li[data-id="' + change.id + '"]').remove();
  } else if (util.isNew(change)) {
    var patient = renderPatient(change.doc);
    patientList.append(patient);
    util.initSelect(patient.find('select')[0], 'select-list');
  }
}

function showPatients() {
  db.patients.allDocs({
    include_docs: true
  }).then(function (result) {
    renderPatients(result.rows);
  }).catch(function (err) {
    alert('Asiakastietojen lataaminen epäonnistui.\n' + err);
  });
}

function renderPatients(patientData) {
  var patientList = $('ul.patients');
  patientList.empty();
  var patients = _.map(patientData, 'doc');
  _.each(patients, function(patient) {
    patientList.append(renderPatient(patient))
  });
  patientList.children().find('select').each(function() {
    util.initSelect(this, 'select-list');
  })
}

function renderPatient(patient) {
  var select = $('<select>', { name: 'default-appointment' });
  util.renderOptions(select, patient.defaultAppointment);
  return $('<li>', {'data-id': patient._id})
    .append($('<input>', {
      type: 'text',
      name: 'name',
      value: patient.name
    }))
    .append(select)
    .append($('<button>', {class: 'remove'}))
}

$(function() {
  var patientList = $('ul.patients');
  $('form.add-patient').submit(putPatient);
  patientList.on('click', 'button.remove', removePatient);
  patientList.on('keyup', 'input', _.debounce(updateName, 150));
  patientList.on('change', 'select', updateDefaultAppointment);
  db.patientChanges.on('change', updatePatients);
  fillOptions();
  showPatients();
  Select.init();
});
