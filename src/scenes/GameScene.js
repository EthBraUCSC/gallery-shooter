
export default class GameScene extends Phaser.Scene {
    constructor() {
      super('GameScene');
    }
  
    init() {
      this.score = 0;
      this.lives = 3;
      this.level = 1;
      this.fireRate = 400;      // ms between player shots
      this.lastFired = 0;       // timestamp of last shot
      this.waveDuration = 7000; // ms over which enemies can appear
    }
  
    create() {
      // Background
      this.add
        .tileSprite(400, 300, 800, 600, 'background')
        .setOrigin(0.5);
  
      // UI
      this.scoreText = this.add.text(16, 16, `Score ${this.score}`, {
        fontSize: '20px',
        fill: '#fff'
      });
      this.livesImage = this.add
        .image(750, 50, `life${this.lives}`)
        .setOrigin(0.5)
        .setScale(0.7);
  
      // Player
      this.player = this.physics.add
        .sprite(50, 300, 'player')
        .setCollideWorldBounds(true)
        .setScale(0.5)
        .setAngle(90);
  
      // Input
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
      });
      this.input.keyboard.on('keydown-SPACE', this.firePlayerBullet, this);
  
      // Groups
      this.playerBullets = this.physics.add.group();
      this.threats = this.physics.add.group(); // holds both enemies and their bullets
  
      // Collisions
      // Player bullets v enemy
      this.physics.add.overlap(
        this.playerBullets,
        this.threats,
        this.handlePlayerBulletHit,
        (playerBullet, threat) => threat.getData('type') !== 'enemyBullet',
        this
      );
  
      // Player v enemy 
      this.physics.add.overlap(
        this.player,
        this.threats,
        this.handlePlayerHitByThreat,
        null,
        this
      );
  
      // Shooter fire timer
      this.time.addEvent({
        delay: 1000,
        callback: this.fireEnemyBullets,
        callbackScope: this,
        loop: true
      });
  
      // Start first wave
      this.spawnWave();
    }
  
    update() {
      this.player.setVelocity(0);
  
      // Movement
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
        this.player.setVelocityX(-200);
      }
      if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
        this.player.setVelocityX(200);
      }
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
        this.player.setVelocityY(-200);
      }
      if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
        this.player.setVelocityY(200);
      }
  
      // Colliding enemy movement
      this.threats.getChildren().forEach(threatSprite => {
        if (
          threatSprite.getData('type') === 'collidingEnemy' &&
          threatSprite.active
        ) {
          this.physics.moveToObject(
            threatSprite,
            this.player,
            100 + this.level * 20
          );
        }
      });
    }
  
    firePlayerBullet() {
      if (this.time.now - this.lastFired < this.fireRate) return;
      this.lastFired = this.time.now;
  
      const newBullet = this.playerBullets.create(
        this.player.x + 20,
        this.player.y,
        'laser'
      );
      newBullet
        .setVelocityX(350)
        .setScale(0.5)
        .setAngle(90);
      this.sound.play('laserSound');
    }
  
    spawnWave() {
      this.player.setVisible(true);
      this.threats.clear(true, true); 
      // Spawn colliding enemies
      const collidingEnemyCount = 4 + this.level;
      if (collidingEnemyCount > 0) {
        this.spawnCollidingEnemy();
      }
      for (let i = 1; i < collidingEnemyCount; i++) {
        const delay = Phaser.Math.Between(500, this.waveDuration);
        this.time.delayedCall(delay, this.spawnCollidingEnemy, [], this);
      }
  
      // Spawn shooter enemies
      const shooterEnemyCount = 3 + this.level;
      if (shooterEnemyCount > 0) {
        this.spawnShooterEnemy();
      }
      for (let j = 1; j < shooterEnemyCount; j++) {
        const delay = Phaser.Math.Between(500, this.waveDuration);
        this.time.delayedCall(delay, this.spawnShooterEnemy, [], this);
      }
  
      // Refresh UI
      this.scoreText.setText(`Score ${this.score}`);
      this.livesImage.setTexture(`life${this.lives}`);
    }
  
    spawnCollidingEnemy() {
      if (this.lives <= 0) return;
  
      const spawnY = Phaser.Math.Between(50, 550);
      const collidingEnemySprite = this.threats.create(
        800,
        spawnY,
        'enemyOne'
      );
      collidingEnemySprite
        .setData('type', 'collidingEnemy')
        .setScale(0.5);
  
      const angleToPlayer = Phaser.Math.Angle.Between(
        collidingEnemySprite.x,
        collidingEnemySprite.y,
        this.player.x,
        this.player.y
      );
      collidingEnemySprite.setRotation(angleToPlayer);
    }
  
    spawnShooterEnemy() {
      if (this.lives <= 0) return;
  
      const spawnY = Phaser.Math.Between(30, 550);
      const shooterSprite = this.threats.create(
        800,spawnY,'enemyTwo'
      );
      shooterSprite.setData('type', 'shooter').setScale(0.5); 
      const angleToPlayer = Phaser.Math.Angle.Between(
        shooterSprite.x,
        shooterSprite.y,
        this.player.x,
        this.player.y
      );
      shooterSprite.setRotation(angleToPlayer);
    }
  
    fireEnemyBullets() {
      this.threats.getChildren().forEach(threatSprite => {
        if (
          threatSprite.getData('type') === 'shooter' && threatSprite.active
        ) {
          const enemyBulletSprite = this.threats.create(
            threatSprite.x - 20,threatSprite.y,'enemyLaser'
          );
          enemyBulletSprite.setData('type', 'enemyBullet');
          this.physics.moveToObject(
            enemyBulletSprite,this.player,200
          );
  
          const angleToPlayer = Phaser.Math.Angle.Between(
            enemyBulletSprite.x,enemyBulletSprite.y,this.player.x,this.player.y
          );
          enemyBulletSprite.setRotation(
            angleToPlayer + Phaser.Math.DegToRad(90)
          );
        }
      });
    }
  
    handlePlayerBulletHit(playerBullet, enemyOrThreat) {
      playerBullet.destroy();
      enemyOrThreat.destroy();
      this.sound.play('explosionSound');
  
      this.score += enemyOrThreat.getData('type') === 'shooter' ? 150 : 100;
      this.scoreText.setText(`Score ${this.score}`);
  
      if (this.threats.countActive() === 0) {
        this.endWave();
      }
    }
  
    handlePlayerHitByThreat(playerSprite, threatSprite) {
      threatSprite.destroy();
      playerSprite.setVisible(false);
      this.time.delayedCall(0, () => this.loseLifeAndRestartWave()); //Delay for freexzing issue
    }
  
    loseLifeAndRestartWave() {
      this.lives = Phaser.Math.Clamp(this.lives - 1, 0, 3);
      this.livesImage.setTexture(`life${this.lives}`);
  
      if (this.lives > 0) {
        this.spawnWave();
      } else {
        this.gameOver();
      }
    }
  
    endWave() {
      const nextWaveText = this.add
        .text(400, 300, 'Next Wave', {
          fontSize: '48px',
          fill: '#fff'
        })
        .setOrigin(0.5);
  
      this.time.delayedCall(2000, () => {
        nextWaveText.destroy();
        this.spawnWave();
      });
    }
  
    gameOver() {
      this.add
        .text(400, 300, 'GAME OVER', {
          fontSize: '64px',
          fill: '#fff'
        })
        .setOrigin(0.5);
  
      this.add
        .text(400, 360, 'Press SPACE to Restart', {
          fontSize: '24px',
          fill: '#fff'
        })
        .setOrigin(0.5);
  
      this.input.keyboard.once('keydown-SPACE', () =>
        this.scene.restart()
      );
    }
  }
  