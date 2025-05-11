export default class BootScene extends Phaser.Scene{
    constructor(){ super('BootScene'); }
    preload(){
        this.load.image(
            'player', 'assets/PNG/playerShip3_red.png'
        );
        this.load.image(
            'laser', 'assets/PNG/Lasers/laserGreen07.png'
        )
        this.load.image(
            'enemyLaser', 'assets/PNG/Lasers/laserBlue02.png'
        );
        this.load.image(
            'enemyOne', 'assets/PNG/Enemies/enemyGreen5.png'
        );
        this.load.image(
            'enemyTwo', 'assets/PNG/Enemies/enemyBlue1.png'
        );
        this.load.image(
            'background', 'assets/Backgrounds/darkPurple.png'
        );
        this.load.audio(
            'explosionSound', 'assets/audio/explosionCrunch_002.ogg'
        )
        this.load.audio(
            'laserSound', 'assets/audio/laserLarge_003.ogg'
        )
        //Numbers for lives
        this.load.image(
            'life3', 'assets/PNG/UI/numeral3.png'
        );
        this.load.image(
            'life2', 'assets/PNG/UI/numeral2.png'
        );
        this.load.image(
            'life1', 'assets/PNG/UI/numeral1.png'
        );
        this.load.image(
            'life0', 'assets/PNG/UI/numeral0.png'
        );

    }
    create() {
        this.scene.start('GameScene');
    }
}