function Game () {}

var playerSpeed = 100;

Game.prototype = {

	create: function () {
		this.map = this.game.add.tilemap('level');

		this.map.addTilesetImage('tiles', 'gameTiles');

		this.backgroundLayer = this.map.createLayer('backgroundLayer');
		this.blockedLayer = this.map.createLayer('blockedLayer');

		this.map.setCollisionBetween(1, 200, true, 'blockedLayer');

		this.playerStart = findObjectsByType('playerStart', this.map, 'objectLayer');

		this.player = this.game.add.sprite(this.playerStart[0].x, this.playerStart[0].y, 'player');
		this.game.physics.arcade.enable(this.player);
		this.player.anchor.setTo(0.5, 0.5);

		this.game.camera.follow(this.player);

		this.cursors = this.game.input.keyboard.addKeys({
			up   : Phaser.KeyCode.W,
			down : Phaser.KeyCode.S,
			left : Phaser.KeyCode.A,
			right: Phaser.KeyCode.D
		});

		this.backgroundLayer.resizeWorld();
	},

	update: function () {

		this.game.physics.arcade.collide(this.player, this.blockedLayer);

		this.player.rotation = this.game.physics.arcade.angleToPointer(this.player) + Math.PI / 2;

		this.player.body.velocity.y = 0;
		this.player.body.velocity.x = 0;

		if (this.cursors.up.isDown) {
			this.player.body.velocity.y -= playerSpeed;
		} else if (this.cursors.down.isDown) {
			this.player.body.velocity.y += playerSpeed;
		}

		if (this.cursors.left.isDown) {
			this.player.body.velocity.x -= playerSpeed;
		} else if (this.cursors.right.isDown) {
			this.player.body.velocity.x += playerSpeed;
		}
	},

	render: function () {
		this.game.debug.spriteInfo(this.player, 32, 32);
	}

};

function findObjectsByType (type, map, layer) {
	var result = [];

	map.objects[layer].forEach(function (el) {
		if (el.type === type) {
			el.y -= map.tileHeight;
			result.push(el)
		}
	});
	return result;
}

function createFromTiledObject (el, group) {
	var sprite = group.create(el.x, el.y, el.properties.sprite);

	Object.keys(el.properties).forEach(function (key) {
		sprite[key] = el.properties[key];
	});
}

module.exports = Game;
