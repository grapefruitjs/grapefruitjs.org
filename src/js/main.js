(function($, window, undefined) {
    var $container,
        $description,
        $feature,
        $desc,
        $descParent;

    $(function() {
        $container = $('.feature-overlay').hide();
        $description = $('p', $container);
        $feature = $('.feature');

        //register listeners
        $feature.on({
            mouseover: showOverlay,
            mouseout: hideOverlay
        });
    });

    function showOverlay(e) {
        if($desc) {
            $descParent.append($desc.hide());
        }

        $descParent = $(e.currentTarget);
        $desc = $descParent.find('.desc');

        $description.append($desc.show());
        $container.show();
    }

    function hideOverlay() {
        $container.hide();

        if($descParent) {
            $descParent.append($desc.hide());
            $desc = $descParent = null;
        }
    }
})(jQuery, window);
