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

// Taken from http://ednortonengineeringsociety.blogspot.com/2010/10/detecting-offline-status-in-html-5.html
function checkNetworkStatus(callback, async) {
	if (typeof async != 'boolean') {
		async = true;
	}

	if (navigator.onLine) {
	// Just because the browser says we're online doesn't mean we're online. The browser lies.
	// Check to see if we are really online by making a call for a static JSON resource on
	// the originating Web site. If we can get to it, we're online. If not, assume we're
	// offline.
		$.ajaxSetup({
			async: async,
			cache: false,
			dataType: "json",
			error: function (req, status, ex) {
				console.log("Error: " + ex);
				// We might not be technically "offline" if the error is not a timeout, but
				// otherwise we're getting some sort of error when we shouldn't, so we're
				// going to treat it as if we're offline.
				// Note: This might not be totally correct if the error is because the
				// manifest is ill-formed.
				callback(false);
			},
			success: function (data, status, req) {
				callback(true);
			},
			timeout: 5000,
			type: "GET",
			url: "ping.js"
		});
		$.ajax();
	} else {
		callback(false);
	}
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
				if (t.isOnline()) {
					t.clearCache();
				}
				t.refresh();
			});
			
			loadMoreBtn = $('#loadMoreBtn');
			loadMoreBtn.click(function (e) {
				t.loadMore();
				e.preventDefault();
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

			t.isOnline(false);
			refreshBtn.click();

			if (!t.hasCache()) {
				$('#noLocalstorage').removeClass('hide');
			}

			if (navigator.userAgent.search(/opera mini/i) > -1) {
				loadMoreBtn.removeClass('hide');
			}
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
				if (setButtonStatus == true) {
					loadMoreBtn.removeClass('disabled');
					$('#noMoreEvents').addClass('hide');
				}
				return true;
			} else {
				if (setButtonStatus == true) {
					loadMoreBtn.addClass('disabled');
					$('#noMoreEvents').removeClass('hide');
				}
				return false;
			}
		},

		refresh : function () {
			var queryParams = {};
			var t = this;

			state.offset = 0;
			state.totalCount = 0;

			queryParams.limit = state.limit;
			queryParams.offset = state.offset;

			t.loadEvents(queryParams, function (data) {
				t.addEventsToList(data, true);
				t.canLoadMoreEvents(true);
			});
		},

		loading : function (loading, description) {
			var indicator = $('#progress');

			if (loading == true) {
				if (indicator.length == 0) {
					// It doesn't exist, we can add it
					if ((typeof description == 'undefined') || (typeof description != 'string') || (description == '')) {
						description = 'Laster...';
					}

					$('.current').append('<div id="progress">' + description + '</div>');
					indicator = $('#progress');
					indicator.css('top', ($(window).scrollTop() + parseInt(indicator.css('top'), 10)) + 'px' );
					console.log('showing process window at ' + ($(window).scrollTop() + parseInt(indicator.css('top'), 10)) + 'px');
				}
			} else {
				if (indicator.length != 0) {
					console.log('removes progress window');
					indicator.empty().remove();
				}
			}
		},

		loadMore : function () {
			var queryParams = {};
			var t = this;

			if (!eventApp.canLoadMoreEvents()) return false;

			queryParams.limit = state.limit;
			queryParams.offset = state.offset + state.limit;

			t.loadEvents(queryParams, function (data) {
				t.addEventsToList(data);
				t.canLoadMoreEvents(true);
			});
		},
		
		isOnline : function (async) {
			var t = this;

			if (!("onLine" in t)) {
				t.onLine = navigator.onLine;
			}

			if (typeof async != "boolean") {
				async = true;
			}

			checkNetworkStatus(function (isOnline) {
				console.log('isOnline: ' + isOnline);
				t.onLine = isOnline;
				if (isOnline == true) {
					$('#noConnection').addClass('hide');
				} else {
					$('#noConnection').removeClass('hide');
				}
			}, async);

			return t.onLine;
		},

		loadEvents : function (queryParams, callback) {
			var t = this;
			t.loading(true);
			
			var requestKey = b64_md5(JSON.stringify(queryParams));

			//alert(t.isOnline());

			if (t.isOnline()) {
				$.ajax({
					url: eventServer + "/api/json/filteredEvents?callback=?",
					dataType: 'json',
					data: queryParams,
					success: function (json) {
						state.offset = json.offset;
						state.totalCount = json.totalCount;
						state.limit = json.limit;

						console.log('GOT RESPONSE! ' + json.count + ' elements');

						t.setCache(requestKey, JSON.stringify(json));

						callback(json);
						t.loading(false);
					},
					error: function (xhr, textStatus, errorThrown) {
						console.log('error loading events: ' + textStatus + ' msg: ' + errorThrown);
						t.loading(false);
					},
					timeout: 10000
				});
			} else {
				var json = t.getCache(requestKey);

				if ((json != false) && (json != null)) {
					json = JSON.parse(json);

					state.offset = json.offset;
					state.totalCount = json.totalCount;
					state.limit = json.limit;

					callback(json);
				}

				t.loading(false);
			}
		},
		
		getCache : function (key) {
			if (!window.localStorage) return;

			return localStorage.getItem(key);
		},

		deleteCache : function (key) {
			if (!window.localStorage) return;

			return localStorage.removeItem(key);
		},

		setCache : function (key, value) {
			if (!window.localStorage) return;
			// Value should be of kind string

			return localStorage.setItem(key, value);
		},
		
		clearCache : function () {
			if (!window.localStorage) return;
			
			localStorage.clear();
		},
		
		hasCache : function () {
			return (typeof window.localStorage != 'undefined');
		}
	};
})(jQuery);

$.jQTouch({
	icon: 'jqtouch.png',
	statusBar: 'black-translucent',
	useAnimations: false,
	preloadimages: [
		'jqtouch/themes/kvarteret/img/backButton.png',
		'jqtouch/themes/kvarteret/img/refresh.png',
		'logo.png'
	],
});

$(document).ready(function () {
	eventApp.init();
});
