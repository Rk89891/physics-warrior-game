import Phaser from 'phaser';
import HelloWorldScene from './scenes/PhysicsWarriorScene';
import PhysicsWarriorScene from './scenes/PhysicsWarriorScene';

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 600,
    height: 500,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: true
        },
    },

    

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [PhysicsWarriorScene],
}

export default new Phaser.Game(config)
