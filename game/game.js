var $demo = $('#demo'),
    width = $demo.width(),
    height = $demo.height(),
    game = new gf.Game($demo[0], {
        width: width,
        height: height,
        transparent: true
    }),
    player;

function setup() {
    //add the clouds
    for(var i = 1; i < 10; ++i) {
        game.world.add.obj(new Cloud(game));
    }

    var map = game.world.add.tilemap('world', true);

    map.findLayer('player').addChild(player = new Player(game));

    game.camera.follow(player);
}

function teardown() {
    //destroy gamestate and make a new one
    game.state.active.destroy();
    game.state.add('__default', true);
}

//need to load cloud atlas
game.load.atlas('items', 'game/data/items.png', 'game/data/items.json', null, gf.ATLAS_FORMAT.JSON_HASH);
game.load.atlas('players', 'game/data/players.png', 'game/data/players.json', null, gf.ATLAS_FORMAT.JSON_HASH);
game.load.tilemap('world', 'game/data/world.json', null, gf.FILE_FORMAT.JSON);

//on loading done
game.load.on('complete', function() {
    //startup
    setup();

    //start rendering
    game.render();
});

//start loading
game.load.start();

//expose game object for use elsewhere
window.gfdemo = {
    game: game,
    setup: setup,
    teardown: teardown
};
