var game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'main');

game.state.add('Boot', require('./states/boot'));
game.state.add('Preload', require('./states/preload'));
game.state.add('Game', require('./states/game'));

game.state.start('Boot');
