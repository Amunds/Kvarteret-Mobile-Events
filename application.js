var eventServer = "http://et.kvarteret.no/endre/kvarteret_events/web";

var queryParams = {
  limit: 20,
  offset: 0,
};

function formatDate(dateString) {
  // Will format a date according to norwegian standards
  var months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];

  var dateComponent = dateString.split('-');
  var year = parseInt(dateComponent[0]);
  var month = parseInt(dateComponent[1]) - 1;
  var day = parseInt(dateComponent[2]);

  return day + '. '+ months[month] + ' ' + year;
}

function formatTime(timeString) {
  var timeCollection = timeString.split(':');

  var hour = timeCollection[0];
  var minute = timeCollection[1];
  var second = timeCollection[2];

  return hour + ':' + minute;
}

$(function() {
  $.retrieveJSON(eventServer + "/api/json/upcomingEvents?callback=?", queryParams,function(data) {
    var dates = {};
    $.each(data.data, function(index) {
     if (typeof(dates[this.startDate]) == 'undefined') {
       dates[this.startDate] = new Array();
     }
     dates[this.startDate].push(index);
    });
    $("#items").html('');
    $.each(dates, function(date) {
      $("#items").append($('<li class="date_header">' + formatDate(date) + '</li>'));
      $.each(this, function (index, eventIndex) {
        var event = data.data[eventIndex];
        $("#items").append($("#item_template").tmpl(event));
     });
    });
    
    //$("#items").html($("#item_template").tmpl(data.data));
    $("#home").after($("#event_template").tmpl(data.data));
  });
});

$.jQTouch({
    icon: 'jqtouch.png',
    statusBar: 'black-translucent'
});
