function Boot () {}

Boot.prototype = {

	preload: function () {

	},

	create: function () {
		this.game.stage.backgroundColor = '#fff';

		this.state.start('preload');
	}

};

module.exports = Boot;
