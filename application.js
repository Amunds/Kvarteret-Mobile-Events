$(function() {
  $.getJSON("http://et.kvarteret.no/endre/kvarteret_symfony_events/web/api/json/upcomingEvents?limit=10&offset=0", function(data) {
    $("#items").html($("#item_template").tmpl(data.data));
    $("#home").after($("#event_template").tmpl(data.data));
  });
});
$.jQTouch({
    icon: 'jqtouch.png',
    statusBar: 'black-translucent',
    preloadImages: [
        'jqtouch/themes/apple/img/backButton.png',
        'jqtouch/themes/apple/img/blueButton.png',
        'jqtouch/themes/apple/img/cancel.png',
        'jqtouch/themes/apple/img/chevron.png',
        'jqtouch/themes/apple/img/grayButton.png',
        'jqtouch/themes/apple/img/listArrowSel.png',
        'jqtouch/themes/apple/img/listGroup.png',
        'jqtouch/themes/apple/img/loading.gif',
        'jqtouch/themes/apple/img/on_off.png',
        'jqtouch/themes/apple/img/pinstripes.png',
        'jqtouch/themes/apple/img/selection.png',
        'jqtouch/themes/apple/img/thumb.png',
        'jqtouch/themes/apple/img/toggle.png',
        'jqtouch/themes/apple/img/toggleOn.png',
        'jqtouch/themes/apple/img/toolbar.png',
        'jqtouch/themes/apple/img/toolButton.png',
        'jqtouch/themes/apple/img/whiteButton.png'
        ]
});