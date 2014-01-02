var featureOverview = (function() {
    var featureQuery = '.feature';
    var overlayContainer = '.feature-overlay';
    var overlayDescription = '.feature-overlay p';
    function registerListeners() {
        $(featureQuery).on('mouseover', showOverlay);
        $(featureQuery).on('mouseout', hideOverlay);
    }
    function showOverlay(e) {
        var content = $(e.currentTarget).find('.desc').html();
        $(overlayDescription).html(content);
        $(overlayContainer).fadeIn(100);
    }
    function hideOverlay() {
        $(overlayContainer).stop().fadeOut(200);
    }
    return {
        init: function() {
            registerListeners();
        }
    };

})();


featureOverview.init();

