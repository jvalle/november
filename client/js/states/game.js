function Game () {}

var playerSpeed = 100;
var fireRate = 150;
var nextFire = 0;

var taunts = [
	'You suck at JavaScript',
	'Pull Request Denied!',
	'I need a Dr. Pepper',
	'How\'s your game coming!?',
	'Did someone say build process?',
	'Rabbit Hole?!?!',
	'Linux linux linux li...',
	'I love computers',
	'Oh, that\'s really simple',
	'I\'m a huge asshole'
];

Game.prototype = {

	create: function () {
		this.map = this.game.add.tilemap('level');

		this.map.addTilesetImage('tiles', 'gameTiles');

		this.backgroundLayer = this.map.createLayer('backgroundLayer');
		this.blockedLayer = this.map.createLayer('blockedLayer');
		this.game.physics.enable(this.blockedLayer, Phaser.Physics.Arcade);

		this.map.setCollisionBetween(1, 200, true, 'blockedLayer');

		this.game.camera.follow(this.player);

		this.cursors = this.game.input.keyboard.addKeys({
			up   : Phaser.KeyCode.W,
			down : Phaser.KeyCode.S,
			left : Phaser.KeyCode.A,
			right: Phaser.KeyCode.D,
			reload : Phaser.KeyCode.R
		});

		this.backgroundLayer.resizeWorld();

		this.createItems();
	},

	createItems: function () {
		// create player
		this.playerStart = findObjectsByType('playerStart', this.map, 'objectLayer');

		this.player = this.game.add.sprite(this.playerStart[0].x, this.playerStart[0].y, 'player');
		this.game.physics.arcade.enable(this.player);
		this.player.anchor.setTo(0.5, 0.5);
		this.player.health = 100;

		// create bullets
		this.bullets = this.game.add.group();
		this.bullets.enableBody = true;
		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

		this.bullets.createMultiple(999, 'bullet');
		this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('outOfBoundsKill', true);

		// create enemy bullets
		this.enemyBullets = this.game.add.group();
		this.enemyBullets.enableBody = true;
		this.enemyBullets.physicsBodyType = Phaser.Physics.ARACDE;

		this.enemyBullets.createMultiple(999, 'bullet');
		this.enemyBullets.setAll('checkWorldBounds', true);
		this.enemyBullets.setAll('outOfBoundsKill', true);

		// create enemies
		this.enemies = this.game.add.group();
		this.enemies.enableBody = true;
		this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
		var en = findObjectsByType('enemy', this.map, 'objectLayer');
		en.forEach(function (enemy) {
			createFromTiledObject(enemy, this.enemies);
		}, this);
	},

	update: function () {

		this.game.physics.arcade.collide(this.player, this.blockedLayer);
		this.game.physics.arcade.collide(this.enemies, this.blockedLayer);
		this.game.physics.arcade.collide(this.bullets, this.blockedLayer, this.killBullet, null, this);
		this.game.physics.arcade.collide(this.enemyBullets, this.blockedLayer, this.killBullet, null, this);
		this.game.physics.arcade.overlap(this.bullets, this.enemies, this.enemyShot, null, this);
		this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.playerShot, null, this);

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

		if (this.input.activePointer.isDown) {
			this.fire();
		}

		this.enemies.forEach(function (enemy) {
			if (enemy.text) {
				enemy.text.x++;
			}
			// random movement
			if (Math.round(Math.random())) {
				enemy.body.velocity.x++;
			} else {
				enemy.body.velocity.x--;
			}

			if (Math.round(Math.random())) {
				enemy.body.velocity.y++;
			} else {
				enemy.body.velocity.y--;
			}

			if (Math.floor(Math.random() * 100) % 15 === 0) {
				this.enemyFire(enemy);
			}

			if (Math.floor(Math.random() * 100) % 50 === 0) {
				if (enemy.text) {
					return;
				}
				enemy.text = this.game.add.text(enemy.x + 32, enemy.y + 25, taunts[Math.round(Math.random() * taunts.length)], {
					font: '12px Arial',
					fill: '#000000'
				});
				setTimeout(function () {
					enemy.text.destroy();
					enemy.text = 0;
				}, 5000);
			}

		}, this);

	},

	fire: function () {
		if (this.game.time.now > nextFire && this.bullets.countDead() > 0) {
			nextFire = this.game.time.now + fireRate;

			var bullet = this.bullets.getFirstDead();
			bullet.reset(this.player.x + 8, this.player.y - 8);

			this.game.physics.arcade.moveToPointer(bullet, 300);
		}
	},

	enemyFire: function (enemy) {
		var bullet = this.enemyBullets.getFirstDead();
		if (!bullet) return;
		bullet.reset(enemy.x + 16, enemy.y);

		this.game.physics.arcade.moveToObject(bullet, this.player, 300);
	},

	killBullet: function (bullet, layer) {
		if (bullet && bullet.parent) {
			bullet.parent.remove(bullet);
		}
	},

	playerShot: function (bullet, player) {
		player.destroy();
		this.state.start('Boot');
		// this.youLose();
	},

	enemyShot: function (bullet, enemy) {
		if (enemy.health) {
			enemy.health -= 10;
			setTimeout(function () {
				enemy.tint = 16777215;
			}, 50);
			enemy.tint = 0xff0000;
		} else {
			this.enemies.remove(enemy);
			if (this.enemies.length === 0) {
				this.youWin();
			}
		}
		this.bullets.remove(bullet);
	},

	youLose: function () {
		var style = {
			font: '25px Arial',
			fill: '#ffffff',
			align: 'center'
		};
		this.game.add.text(10, this.game.world.centerY, '- you lose, try harder next time -', style);
		setTimeout(function () {
			this.state.start('Boot');
		}.bind(this), 5000);
	},

	youWin: function () {
		var style = {
			font: '18px Arial',
			fill: '#ffffff',
			align: 'center'
		};
		this.game.add.text(10, this.game.world.centerY, '- you win! now you can code in peace -', style);
		setTimeout(this.resetGame.bind(this), 5000);
	},

	resetGame: function () {
		this.state.start('Boot');
	}

};

function findObjectsByType (type, map, layer) {
	var result = [];

	map.objects[layer].forEach(function (el) {
		if (el.type === type) {
			el.y -= map.tileHeight;
			result.push(el);
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
