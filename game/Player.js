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
    gf.Sprite.call(this, anims, 1, 'stand');
    game.physics.addSprite(this);

    //active actions
    this.actions = {
        move: {}
    };

    this.movement = new gf.Vector();

    this.bindKeys();

    //anchor to middle
    this.anchor.x = 0.5;
}

gf.inherit(Player, gf.Sprite, {
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
            e.originalEvent.preventDefault();

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
    onCollide: function() {
        this._setMoveAnimation();
        //console.log(this.body.y);
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
            this.goto(0, anim).play();
    }
});
