const TYPE = {
  HOME: 'Koti',
  DAYCARE: 'Päiväkoti',
  SCHOOL: 'Koulu',
  STEERING: 'Ohjauskäynti',
  EVALUATION: 'Arviointi',
  HOJKS: 'HOJKS',
  KUSU: 'KUSU',
  ARKI: 'ARKI',
  APU: 'APU'
};

function Appointment(patient, duration, type, date) {
  this.patientId = patient._id;
  this.patientName = patient.name;
  this.duration = duration;
  this.type = type;
  this.date = date;
}

module.exports = Appointment;

module.exports = {
  TYPE: TYPE,
  Appointment: Appointment
};
