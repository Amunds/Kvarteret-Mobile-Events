var eventServer = "http://et.kvarteret.no/endre/kvarteret_events/web";

var queryParams = {
  limit: 20,
  offset: 0,
};

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
      $("#items").append($('<li class="date_header">' + date + '</li>'));
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
