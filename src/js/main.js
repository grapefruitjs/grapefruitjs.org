var featureOverview = (function() {
    var featureQuery = '.feature';
    var overlayQuery = '.feature-overlay';
    function registerListeners() {
        $(featureQuery).on('mouseover', showOverlay);
        $(featureQuery).on('mouseout', hideOverlay);
    }
    function showOverlay(e) {
        $(overlayQuery).html(
            $(e.currentTarget).find('.desc').html()
        );
        $(overlayQuery).show();
        $(overlayQuery).addClass('show');
    }
    function hideOverlay() {
        $(overlayQuery).hide();
        $(overlayQuery).removeClass('show');
    }
    return {
        init: function() {
            registerListeners();
        }
    };

})();

featureOverview.init();