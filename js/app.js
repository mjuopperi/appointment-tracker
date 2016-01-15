var moment = require('moment');
var $ = require('jquery');
var _ = require('lodash');

var overview = require('./js/overview');
require('./js/appointments');
require('./js/patients');

function switchSection() {
  $(this).addClass('active').parent().siblings().children('button').removeClass('active');
  $('section#' + $(this).attr('name')).show().siblings('section').hide();
  if($(this).attr('name') === 'overview') overview.updateCalendar(overview.currentDate);
}

$(function() {
  $('nav button').click(switchSection);
});
