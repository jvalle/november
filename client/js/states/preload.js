function Preload () {}

Preload.prototype = {

	preload: function () {
		// load game assets
		this.load.tilemap('level', 'assets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.image('gameTiles', 'assets/tiles.png');
		this.load.image('player', 'assets/player.png');
	},

	create: function () {
		this.state.start('Game');
	}

};

module.exports = Preload;
