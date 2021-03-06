var fs = require('fs');
var PouchDB = require('pouchdb');

fs.existsSync("db") || fs.mkdirSync("db");
const patients = new PouchDB('db/patients');
const appointments = new PouchDB('db/appointments');

appointments.createIndex({
  index: {
    fields: ['patientId', 'date']
  }
}).then(function (result) {
  console.log('Created index: ', result);
}).catch(function (err) {
  alert('Indeksin luonti epäonnistui:\n', err);
});

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
