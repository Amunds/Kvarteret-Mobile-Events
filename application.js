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
	var state = {}, loadMoreBtn, refreshBtn, home;
	var eventServer = "http://et.kvarteret.no/endre/kvarteret_events/web";

	eventApp = {

		init : function () {
			var t = this;

			state.limit = 20;
			state.offset = 0;
			state.totalCount = 0;

			refreshBtn = $('#refreshEvents');
			refreshBtn.click(function () {
				eventApp.refresh();
			});

			jQuery(window).scrollstop(function (e) {
				/**
				 * This function is meant to be used when triggers are needed
				 * on pages where scrollevents aare used
				 */

				var currentElem = $('.current').eq(0); // Get the page with class attribute containing 'current', should be only one
				var id = currentElem.attr('id');

				var win = $(window);
				var doc = $(document);

				if (id == 'home') {
					var currentHeight = win.scrollTop() + win.height();
					var totalHeight = doc.height();

					if ( Math.abs(currentHeight - totalHeight) <= 1 ) {
						// Somewhat hack for android, can't scroll to full height
						// We're at the bottom of the page
						if (t.canLoadMoreEvents()) {
							t.loadMore();
						}
					}
				}
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
					$("#items").append($('<li id="' + dateId + '" class="date_header">' + formatDate(date) + '</li>'));
				}

				$.each(this, function (index, eventIndex) {
					var event = data.data[eventIndex];
					$("#items").append($("#item_template").tmpl(event));
				});
			});

			$("#home").after($("#event_template").tmpl(data.data));
		},

		canLoadMoreEvents : function (setButtonStatus) {
			if ((state.offset + state.limit) < state.totalCount) {
				return true;
			} else {
				return false;
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
				eventApp.canLoadMoreEvents(true);
			});
		},

		loadMore : function () {
			var queryParams = {};

			if (!eventApp.canLoadMoreEvents()) return false;

			queryParams.limit = state.limit;
			queryParams.offset = state.offset + state.limit;

			eventApp.loadEvents(queryParams, function (data) {
				eventApp.addEventsToList(data);
				eventApp.canLoadMoreEvents(true);
			});
		},

		loadEvents : function (queryParams, callback) {
			$.retrieveJSON(eventServer + "/api/json/filteredEvents?callback=?", queryParams, function(json, status, data) {
				//alert('isonline:' + navigator.onLine);
				if (navigator.onLine && (status == 'cached')) {
					return null;
				} else {
					//alert('will render');
					state.offset = json.offset;
					state.totalCount = json.totalCount;
					state.limit = json.limit;
					callback(json);
				}
			});
		}
	};
})(jQuery);

$(document).ready(function () {
	eventApp.init();
});

$.jQTouch({
    icon: 'jqtouch.png',
    statusBar: 'black-translucent'
});
