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
