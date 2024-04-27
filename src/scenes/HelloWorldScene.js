import Phaser from 'phaser';

export default class HelloWorldScene extends Phaser.Scene {

    constructor() {
        super('hello-world-scene');
    }

    preload() {
        this.load.image('', 'images/');
    }

    create() {
        this.add.image(960, 540, '');
    }

}
