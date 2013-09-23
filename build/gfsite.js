/**
 * @license
 * GrapeFruit Website - v0.0.1
 * Copyright (c) 2013, Chad Engler
 * https://github.com/grapefruitjs/grapefruitjs.org
 *
 * Compiled: 2013-09-22
 *
 * GrapeFruit Website is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function($, window, undefined) {
    $(function() {
        

function Player(game) {
    this.game = game;

    //is this sprite able to move?
    this.locked = false;

    //maximum health of this entity
    this.maxHealth = 3;

    //current health of this entity
    this.health = 3;

    //moveSpeed the ent moves at
    this.moveSpeed = 200;

    //the texture atlas our textures are in
    this.atlas = game.cache.getTextures('players');

    //the type of player (can be 'p1/p1_', 'p2/p2_', or 'p3/p3_')
    this.type = 'p1/p1_';

    //setup animations
    var anims = {};
    this.addAnim(anims, 'duck');
    this.addAnim(anims, 'hurt');
    this.addAnim(anims, 'jump');
    this.addAnim(anims, 'stand');
    this.addAnim(anims, 'walk', 11);

    //call parent ctor
    gf.AnimatedSprite.call(this, anims, 1, 'stand');
    game.state.active.physics.addSprite(this);

    //active actions
    this.actions = {
        move: {}
    };

    this.movement = new gf.Vector();

    this.bindKeys();

    //anchor to middle
    this.anchor.x = 0.5;
}

gf.inherit(Player, gf.AnimatedSprite, {
    addAnim: function(o, name, count) {
        if(!count) {
            o[name] = [this.atlas[this.type + name + '.png']];
        } else {
            o[name] = {
                frames: [],
                speed: 0.8,
                loop: true
            };

            for(var i = 1; i <= count; ++i) {
                var s = (i < 10 ? '0' : '') + i;

                o[name].frames.push(this.atlas[this.type + name + s + '.png']);
            }
        }
    },
    bindKeys: function() {
        //bind the keyboard
        this.game.input.keyboard.on(gf.Keyboard.KEY.W, this._boundMoveUp = this.onMove.bind(this, 'up'));
        //this.game.input.keyboard.on(gf.Keyboard.KEY.S, this._boundMoveDown = this.onMove.bind(this, 'down'));
        this.game.input.keyboard.on(gf.Keyboard.KEY.A, this._boundMoveLeft = this.onMove.bind(this, 'left'));
        this.game.input.keyboard.on(gf.Keyboard.KEY.D, this._boundMoveRight = this.onMove.bind(this, 'right'));
    },
    onMove: function(dir, e) {
        if(e.originalEvent)
            e.input.preventDefault(e.originalEvent);

        // .down is keypressed down
        if(e.down) {
            if(this.actions.move[dir]) return; //skip repeats (holding a key down)

            this.actions.move[dir] = true;
        } else {
            this.actions.move[dir] = false;
        }

        this._checkMovement();
    },
    lock: function() {
        this.setVelocity([0, 0]);
        this.locked = true;
    },
    unlock: function() {
        this._setMoveAnimation();
        this.setVelocity(this.movement);
        this.locked = false;
    },
    isGrounded: function() {
        return (this.body.touching & gf.DIRECTION.BOTTOM);
    },
    onCollide: function(obj) {
        this._setMoveAnimation();
    },
    _checkMovement: function() {
        //set X
        if(this.actions.move.left && this.actions.move.right)
            this.movement.x = 0;
        else if(this.actions.move.left)
            this.movement.x = -this.moveSpeed;
        else if(this.actions.move.right)
            this.movement.x = this.moveSpeed;
        else
            this.movement.x = 0;

        if(this.actions.move.up && this.isGrounded())
            this.movement.y = -this.moveSpeed * 2;
        else
            this.movement.y = 0;

        if(this.locked) return;

        this.body.velocity.x = this.movement.x;

        if(this.movement.y) {
            this.body.velocity.y = this.movement.y;
            this.body.touching &= ~gf.DIRECTION.BOTTOM;
        }

        this._setMoveAnimation();
    },
    _setMoveAnimation: function(force) {
        var anim;

        if(force) {
            anim = force;
        } else if(!this.isGrounded()) {
            anim = 'jump';
        } else if(this.movement.x) {
            anim = 'walk';
        } else {
            anim = 'stand';
        }

        if(this.movement.x) {
            if(this.movement.x > 0) {
                this.scale.x = 1;
            } else {
                this.scale.x = -1;
            }
        }

        if(this.currentAnimation !== anim)
            this.gotoAndPlay(anim);
    }
});

function Cloud(game) {
    var tx = game.cache.getTextures('items')['cloud' + gf.math.randomInt(1, 3) + '.png'];

    this.game = game;

    this.speed = gf.math.randomInt(8, 20);

    this._dx = 0;

    gf.Sprite.call(this, tx);

    this.position.x = gf.math.randomInt(0, game.width - this.width);
    this.position.y = gf.math.randomInt(0, game.height - this.height - 150);
}

gf.inherit(Cloud, gf.Sprite, {
    updateTransform: function() {
        this._dx += this.speed * this.game.timings.lastDelta;

        var dx = gf.math.floor(this._dx);
        if(dx) {
            this.position.x -= dx;
            this._dx -= dx;

            //if off the left side, wrap to right side
            if(this.position.x < -this.width) {
                this.position.x = this.game.width;
            }
        }

        gf.Sprite.prototype.updateTransform.apply(this, arguments);
    }
});

var $demo = $('#demo'),
    width = $demo.width(),
    height = $demo.height(),
    game = new gf.Game($demo[0], {
        width: width,
        height: height,
        transparent: true
    });

function setup() {
    //add the clouds
    for(var i = 1; i < 10; ++i) {
        game.world.add.obj(new Cloud(game));
    }

    gfdemo.map = game.world.add.tilemap('world', true);
    gfdemo.player = gfdemo.map.findLayer('player').addChild(new Player(game));

    game.camera.follow(gfdemo.player);
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

game.on('tick', function(dt) {
    game.physics.collide(gfdemo.player, game.world, function(player, obj) {
        player.onCollide(obj);
    });
});

//expose game object for use elsewhere
window.gfdemo = {
    game: game,
    setup: setup,
    teardown: teardown
};


    });
})(jQuery, window);