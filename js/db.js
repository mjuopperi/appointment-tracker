var fs = require('fs');
var PouchDB = require('pouchdb');

fs.existsSync("db") || fs.mkdirSync("db");
const patients = new PouchDB('db/patients');
const appointments = new PouchDB('db/appointments');


var patientChanges = patients.changes({
  since: 'now',
  live: true,
  include_docs: true
});

var appointmentChanges = appointments.changes({
  since: 'now',
  live: true,
  include_docs: true
});

module.exports = {
  patients: patients,
  appointments: appointments,
  patientChanges: patientChanges,
  appointmentChanges: appointmentChanges
};
