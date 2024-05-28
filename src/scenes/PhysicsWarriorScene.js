import Phaser from 'phaser';

export default class PhysicsWarriorScene extends Phaser.Scene {
    constructor() {
        super('physics-warrior-scene');
    }

    init() {
        this.gameHalfWidth = this.scale.width * 0.5;
        this.gameHalfHeight = this.scale.height * 0.5;
        this.player = undefined;
        this.enemy = undefined;
        this.slash = undefined;

        this.startGame = false;
        this.questionText = undefined;
        this.resultText = undefined;
        this.answerInput = undefined;
        this.optionButtons = [];

        this.endGame = false;

        this.questions = [
            { type: 'sentence', question: 'What is the unit of force?', correctAnswer: 'Newton' },
            { type: 'sentence', question: 'What is the acceleration due to gravity on Earth?', correctAnswer: '9.8 m/s²' },
            { type: 'sentence', question: 'What is the formula for kinetic energy?', correctAnswer: '0.5 * mass * velocity^2' },
            { type: 'sentence', question: 'What is the first law of motion?', correctAnswer: 'Inertia' },
            { type: 'sentence', question: 'What is the speed of light?', correctAnswer: '299,792,458 m/s' },
            { type: 'mcq', question: 'What is the unit of power?', options: ['Watt', 'Newton', 'Joule'], correctAnswer: 'Watt' },
            { type: 'mcq', question: 'What is the formula for work?', options: ['force * distance', 'mass * acceleration', 'velocity * time'], correctAnswer: 'force * distance' },
            { type: 'mcq', question: 'What is the third law of motion?', options: ['Action-Reaction', 'Inertia', 'Acceleration'], correctAnswer: 'Action-Reaction' },
            { type: 'mcq', question: 'What is the formula for pressure?', options: ['force / area', 'mass / volume', 'density * gravity'], correctAnswer: 'force / area' },
            { type: 'mcq', question: 'What is the unit of energy?', options: ['Joule', 'Watt', 'Newton'], correctAnswer: 'Joule' }
        ];
        this.currentQuestionIndex = 0;
        this.correctAnswer = undefined;
        this.playerAttack = false;
        this.enemyAttack = false;

        this.score = 0;
        this.scoreLabel = undefined;

        this.timer = 30;
        this.timerLabel = undefined;

        this.movement = undefined;
    }

    preload() {
        this.load.image('physics-bg', 'images/physics-bg.jpeg');
        this.load.image('ground', 'images/tile.png');
        this.load.spritesheet('player', 'images/adventurer_tilesheet.png', {
            frameWidth: 80,
            frameHeight: 110,
        });
        this.load.spritesheet('enemy', 'images/zombie_tilesheet.png', {
            frameWidth: 80,
            frameHeight: 110,
        });

        this.load.spritesheet('slash', 'images/slash.png', {
            frameWidth: 42,
            frameHeight: 88,
        });
    }

    create() {
        this.add.image(300, 250, 'physics-bg');
        const tile = this.physics.add.staticImage(200, 500, 'ground');

        this.player = this.physics.add.sprite(50, 50, 'player');
        this.enemy = this.physics.add.sprite(250, 50, 'enemy');

        this.physics.add.collider(this.player, tile);
        this.physics.add.collider(this.enemy, tile);

        this.scoreLabel = this.add.text(10, 10, 'Score: 0', {
            //@ts-ignore
            fill: 'white', backgroundColor: 'black'
        }).setDepth(1);

        this.timerLabel = this.add.text(380, 10, 'Time: 30', {
            //@ts-ignore
            fill: 'white', backgroundColor: 'black'
        }).setDepth(1);

        this.slash = this.physics.add.sprite(240, 60, 'slash')
            .setActive(false)
            .setVisible(true)
            .setGravityY(-500)
            .setOffset(0, -10)
            .setDepth(1)
            .setCollideWorldBounds(true);

        this.createAnimation();
        this.gameStart();

        this.input.keyboard.on('keydown', this.handleKeyDown, this);
        this.displayNextQuestion();
    }

    update(time, delta) {
        if (this.correctAnswer === true && !this.playerAttack) {
            console.log('Player Correct Answer');
            this.player.anims.play('player-attack', true);
            this.time.delayedCall(500, () => {
                //@ts-ignore
                this.createSlash(this.player.x + 60, this.player.y, 4, 600);
            });
            this.playerAttack = true;
            this.score += 10;
            this.scoreLabel.setText('Score: ' + this.score);
            this.time.delayedCall(1000, () => {
                this.correctAnswer = undefined;
                this.playerAttack = false;
                this.displayNextQuestion();
            });
        }

        if (this.correctAnswer === false && !this.enemyAttack) {
            console.log('Player Incorrect Answer');
            this.enemy.anims.play('enemy-attack', true);
            this.time.delayedCall(500, () => {
                //@ts-ignore
                this.createSlash(this.enemy.x - 60, this.enemy.y, 2, -600, true);
            });
            this.enemyAttack = true;
            this.time.delayedCall(1000, () => {
                this.correctAnswer = undefined;
                this.enemyAttack = false;
                this.displayNextQuestion();
            });
        }

        if (this.startGame) {
            this.timer -= delta / 1000;
            this.timerLabel.setText('Time: ' + Math.max(0, Math.floor(this.timer)));
            if (this.timer <= 0) {
                console.log('Timer Ended');
                this.startGame = false;
                this.endGame = true;
                this.timerLabel.setText('Time: 0');
                this.resultText = this.add.text(this.gameHalfWidth, this.gameHalfHeight, 'Game Over', {
                    //@ts-ignore
                    fill: 'white', backgroundColor: 'black'
                }).setOrigin(0.5).setDepth(1);
            }
        }
    }

    createAnimation() {
        this.anims.create({
            key: 'player-standby',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
            frameRate: 5,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-attack',
            frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'enemy-standby',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 2 }),
            frameRate: 5,
            repeat: -1,
        });

        this.anims.create({
            key: 'enemy-attack',
            frames: this.anims.generateFrameNumbers('enemy', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    gameStart() {
        console.log('Game Started');
        this.startGame = true;
        this.player.anims.play('player-standby', true);
        this.enemy.anims.play('enemy-standby', true);
    }

    displayNextQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            console.log('All Questions Completed');
            this.startGame = false;
            this.endGame = true;
            this.resultText = this.add.text(this.gameHalfWidth, this.gameHalfHeight, 'All Questions Completed!', {
                //@ts-ignore
                fill: 'white', backgroundColor: 'black'
            }).setOrigin(0.5).setDepth(1);
            return;
        }

        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (this.questionText) {
            this.questionText.destroy();
        }
        if (this.answerInput) {
            this.answerInput.destroy();
        }
        this.optionButtons.forEach(button => button.destroy());
        this.optionButtons = [];

        if (currentQuestion.type === 'sentence') {
            this.questionText = this.add.text(this.gameHalfWidth, 100, currentQuestion.question, {
                //@ts-ignore
                fill: 'white', backgroundColor: 'black'
            }).setOrigin(0.5).setDepth(1);
            this.answerInput = this.add.dom(this.gameHalfWidth, 200, 'input', {
                width: '200px', height: '20px', backgroundColor: 'white'
            }).setDepth(1);
            this.answerInput.node.addEventListener('keydown', (event) => {
                //@ts-ignore
                if (event.key === 'Enter') {
                    //@ts-ignore
                    this.checkAnswer(this.answerInput.node.value);
                }
            });
        } else if (currentQuestion.type === 'mcq') {
            this.questionText = this.add.text(this.gameHalfWidth, 100, currentQuestion.question, {
                //@ts-ignore
                fill: 'white', backgroundColor: 'black'
            }).setOrigin(0.5).setDepth(1);
            currentQuestion.options.forEach((option, index) => {
                const button = this.add.text(this.gameHalfWidth, 150 + index * 40, option, {
                    //@ts-ignore
                    fill: 'white', backgroundColor: 'blue'
                }).setOrigin(0.5).setDepth(1).setInteractive();

                button.on('pointerdown', () => {
                    this.checkAnswer(option);
                });

                this.optionButtons.push(button);
            });
        }

        this.currentQuestionIndex++;
    }

    checkAnswer(userAnswer) {
        const currentQuestion = this.questions[this.currentQuestionIndex - 1];
        if (userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) {
            this.correctAnswer = true;
        } else {
            this.correctAnswer = false;
        }
    }

    handleKeyDown(event) {
        if (this.answerInput && this.answerInput.node) {
            //@ts-ignore
            this.answerInput.node.focus();
        }
    }
}
