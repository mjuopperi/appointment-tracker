var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
var moment = require('moment');
var Select = require('tether-select');
var $ = require('jquery');
var _ = require('lodash');

var util = require('./util');
var db = require('./db');

var Patient = require('./patient');
var Appointment = require('./appointment').Appointment;
var appointmentType = require('./appointment').TYPE;

var calendar;

function saveAppointment() {
  var patientId = $('#appointments').find('select[name="patient"]').val();
  db.patients.get(patientId).then(function(patient) {
    var defaultAppointmentType = util.getKey(appointmentType, patient.defaultAppointment);
    var date = $('.day.selected').first().data('date');
    var appointment = new Appointment(patient, 1, defaultAppointmentType, date);
    db.appointments.post(appointment).then(function(d) {
    }).catch(function (err) {
      alert('error:\n' + err)
    });
  })
}

function updateAppointment() {
  var id = $(this).parent().data('id');
  var duration = $(this).parent().find('input[name="duration"]').val();
  var type = $(this).parent().find('select[name="appointment-type"]').val();
  db.appointments.get(id).then(function(appointment) {
    appointment.duration = duration;
    appointment.type = type;
    db.appointments.put(appointment);
  }).catch(function(err) {
    alert('Terapiakäynnin päivitys epäonnistui:\n', err);
  })
}

function removeAppointment() {
  var id = $(this).parent().data('id');
  db.appointments.get(id).then(function(appointment) {
    db.appointments.remove(appointment);
  })
}

function updatePatientSelect() {
  return db.patients.allDocs({
    include_docs: true
  }).then(function (result) {
    renderPatientSelect(result.rows);
    initCalendar()
  }).catch(function (err) {
    alert('Asiakastietojen lataaminen epäonnistui.\n' + err);
  });
}

function renderPatientSelect(patientData) {
  var select = $('#appointments select[name="patient"]');
  select.empty();
  _(patientData).map('doc').forEach(function(patient) {
    select.append($('<option>', { value: patient._id, text: patient.name }))
  }).value();
}

function showAppointments(date) {
  $('.event-listing-title').text('Terapiakäynnit ' + moment(date).format('D.M.YYYY'));
  var patientId = $('option:selected', $('#appointments').find('select[name="patient"]')).val();
  db.appointments.find({
    selector: { patientId: patientId, date: date}
  }).then(function(result) {
    renderAppointments(result.docs);
  }).catch(function(err) {
    alert('Virhe haettaessa asiakaskäyntejä:\n', err);
  })
}

function renderAppointments(appointments) {
  var eventList = $('#appointments').find('.event-listing .events');
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
  util.renderOptions(select, util.getKey(appointmentType, appointment.type));
  return $('<li>', {'data-id': appointment._id})
    .append($('<input>', {
      type: 'text',
      name: 'duration',
      value: appointment.duration
    }))
    .append(select)
    .append($('<button>', {class: 'remove'}))
}

function updateCalendar(change) {
  if (util.isNew(change) || change.deleted) {
    initCalendar()
  }
}

function initCalendar() {
  var patientId = $('#appointments').find('select[name="patient"]').val();
  if (!!patientId) {
    db.appointments.find({
      selector: {patientId: patientId}
    }).then(function (result) {
      if (typeof calendar !== 'undefined') updateEvents(result.docs);
      else {
        calendar = util.renderCalendar(moment(), result.docs, $('#appointments').find('.calendar'));
        $('.today').addClass('selected');
        showAppointments($('.today').data('date'));
      }
    }).catch(function (err) {
      alert('Virhe kalenterin luonnissa:\n' + err);
    });
  }
}

function updateEvents(appointments) {
  var selectedDate = $('.calendar .selected').data('date');
  calendar.setEvents(appointments);
  $('.calendar .days').find('[data-date="' + selectedDate + '"]').addClass('selected');
  showAppointments(selectedDate);
}

$(function() {
  updatePatientSelect().then(initCalendar);
  var calendarContainer = $('.calendar');
  calendarContainer.on('click', '.day', function(e) {
    $(this).addClass('selected').siblings().removeClass('selected');
    showAppointments($(this).data('date'));
  });
  calendarContainer.on('click', 'button.add-event', saveAppointment);
  calendarContainer.on('click', 'button.remove', removeAppointment);
  calendarContainer.on('change', 'select[name="appointment-type"]', updateAppointment);
  calendarContainer.on('keyup', 'input', _.debounce(updateAppointment, 150));
  $('#appointments').find('select[name="patient"]').change(initCalendar);
  db.patientChanges.on('change', updatePatientSelect);
  db.appointmentChanges.on('change', updateCalendar);
});
