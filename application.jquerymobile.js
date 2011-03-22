function formatDate(dateString) {
  // Will format a date according to norwegian standards
  var months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];

  var dateComponent = dateString.split('-');
  var year = parseInt(dateComponent[0], 10);
  var month = parseInt(dateComponent[1], 10) - 1;
  var day = parseInt(dateComponent[2], 10);

  return day + '. '+ months[month] + ' ' + year;
}

function formatTime(timeString) {
  var timeCollection = timeString.split(':');

  var hour = timeCollection[0];
  var minute = timeCollection[1];
  var second = timeCollection[2];

  return hour + ':' + minute;
}

var eventApp;

(function ($) {
	var state = {}, loadMoreBtn, refreshBtn;
	var eventServer = "http://et.kvarteret.no/endre/kvarteret_events/web";

	eventApp = {

		init : function () {
			state.limit = 20;
			state.offset = 0;
			state.totalCount = 0;

			loadMoreBtn = $('#loadMoreEvents');
			loadMoreBtn.click(function () {
				eventApp.loadMore();
			});

			refreshBtn = $('#refreshEvents');
			refreshBtn.click(function () {
				eventApp.refresh();
			});

			eventApp.refresh();
		},

		addEventsToList : function (data, clear) {
			if (clear == true) {
				$("#items").empty();
				$(".event").empty().remove();
			}

			var dates = {};
			$.each(data.data, function(index) {
				if (typeof(dates[this.startDate]) == 'undefined') {
					dates[this.startDate] = new Array();
				}
				dates[this.startDate].push(index);
			});

			$.each(dates, function(date) {
				var dateId = 'date_' + date.replace('-', '_');

				if ($('#' + dateId).length == 0) {
					$("#items").append($('<li id="' + dateId + '" data-role="list-divider" class="date_header">' + formatDate(date) + '</li>'));
				}

				$.each(this, function (index, eventIndex) {
					var event = data.data[eventIndex];
					$("#items").append($("#item_template").tmpl(event));
				});
			});

			$("#home").after($("#event_template").tmpl(data.data));

			$('#items').listview('refresh');
			$(".event").page();
		},

		canLoadMoreEvents : function () {
			if ((state.offset + state.limit) < state.totalCount) {
				loadMoreBtn.button('enable');
			} else {
				loadMoreBtn.button('disable');
			}
		},

		refresh : function () {
			var queryParams = {};

			state.offset = 0;
			state.totalCount = 0;

			queryParams.limit = state.limit;
			queryParams.offset = state.offset;

			eventApp.loadEvents(queryParams, function (data) {
				eventApp.addEventsToList(data, true);
				eventApp.canLoadMoreEvents();
			});
		},

		loadMore : function () {
			var queryParams = {};

			queryParams.limit = state.limit;
			queryParams.offset = state.offset + state.limit;

			eventApp.loadEvents(queryParams, function (data) {
				eventApp.addEventsToList(data);
				eventApp.canLoadMoreEvents();
			});
		},

		loadEvents : function (queryParams, callback) {
			$.mobile.pageLoading();
			$.retrieveJSON(eventServer + "/api/json/filteredEvents?callback=?", queryParams, function(data) {
				state.offset = data.offset;
				state.totalCount = data.totalCount;
				state.limit = data.limit;
				callback(data);
				$.mobile.pageLoading(true);
			});
		}
	};
})(jQuery);

$(document).ready(function () {
	eventApp.init();
});
