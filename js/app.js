var moment = require('moment');
var $ = require('jquery');
var _ = require('lodash');

require('./js/appointments');
require('./js/patients');

function switchSection() {
  $(this).addClass('active').parent().siblings().children('button').removeClass('active');
  $('section#' + $(this).attr('name')).show().siblings('section').hide();
}

$(function() {
  $('nav button').click(switchSection);
});
