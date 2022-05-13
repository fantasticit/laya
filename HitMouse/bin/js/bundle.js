(function () {
  'use strict';

  class Hammer extends Laya.Script {
      constructor() {
          super();
      }
      onAwake() {
          this.timerLine = null;
      }
      show() {
          if (this.timerLine) {
              this.timerLine.destroy();
          }
          this.owner.alpha = 1;
          this.owner.rotation = 0;
          this.timerLine = Laya.TimeLine.to(this.owner, { rotation: 50 }, 50)
              .to(this.owner, { rotation: -30 }, 100, null)
              .to(this.owner, { alpha: 0 }, 100, null, 100);
          this.timerLine.play(0, false);
      }
  }

  class FloatScore extends Laya.Script {
      constructor() {
          super();
      }
      onAwake() {
          this.timerLine = null;
      }
      show(type) {
          if (this.timerLine) {
              this.timerLine.destroy();
          }
          this.owner.skin = `res/score_100_${type}.png`;
          this.timerLine = Laya.TimeLine.to(this.owner, { y: this.owner.y - 100 }, 150, Laya.Ease.backOut).to(this.owner, { alpha: 0 }, 150, Laya.Ease.backOut, 300);
          this.timerLine.play(0, false);
          this.timerLine.on(Laya.Event.COMPLETE, this, () => {
              this.owner.removeSelf();
          });
      }
  }

  const GameConfig = {
      holes: [
          {
              x: -245,
              y: 0,
          },
          {
              x: -5,
              y: 0,
          },
          {
              x: 245,
              y: 0,
          },
          {
              x: -245,
              y: 125,
          },
          {
              x: -5,
              y: 125,
          },
          {
              x: 245,
              y: 125,
          },
          {
              x: -245,
              y: 270,
          },
          {
              x: -5,
              y: 270,
          },
          {
              x: 245,
              y: 270,
          },
      ],
  };

  const MouseType = [1, 2];
  class Mouse extends Laya.Script {
      constructor() {
          super();
      }
      onAwake() {
          this.timerLine = null;
          this.gameManager = null;
          this.type = 1;
          this.index = -1;
          this.isHited = false;
      }
      onClick() {
          if (this.isHited)
              return;
          this.owner.skin = `res/mouse_hited_${this.type}.png`;
          if (this.timerLine) {
              this.timerLine.destroy();
              this.timerLine = null;
          }
          this.timerLine = Laya.TimeLine.to(this.owner, { scaleX: 0, scaleY: 0 }, 300, null, 500);
          this.timerLine.play(0, false);
          this.timerLine.on(Laya.Event.COMPLETE, this, () => {
              this.owner.removeSelf();
              this.gameManager.removeMouse(this);
          });
          this.gameManager.onMouseHited(this);
          this.isHited = true;
      }
      show(gameManager, index, type) {
          this.gameManager = gameManager;
          this.index = index;
          this.type = type;
          this.owner.skin = `res/mouse_normal_${type}.png`;
          this.owner.scaleX = 0;
          this.owner.scaleY = 0;
          this.timerLine = Laya.TimeLine.to(this.owner, { scaleX: 1, scaleY: 1 }, 300).to(this.owner, { scaleX: 0, scaleY: 0 }, 300, null, 1000);
          this.timerLine.play(0, false);
          this.timerLine.on(Laya.Event.COMPLETE, this, () => {
              this.owner.removeSelf();
              this.gameManager.removeMouse(this);
          });
      }
  }

  class GameManager extends Laya.Script {
      constructor() {
          super();
          this.currentScore = 0;
          this.mouses = Array.from({ length: GameConfig.holes.length }, () => null);
          this.dialogStartGameNode = null;
          this.dialogStartGameButtonNode = null;
          this.countdownNode = null;
          this.scoreNode = null;
          this.dialogGameOverNode = null;
          this.dialogGameOverScoreNode = null;
          this.mouseContainer = null;
          this.prefabMouse = null;
          this.hammerNode = null;
          this.floatScoreNode = null;
      }
      onAwake() {
          this.isPlaying = false;
          this.btnPlayAgainNode = null;
          this.dialogStartGameNode.visible = true;
          this.dialogStartGameButtonNode.on(Laya.Event.MOUSE_DOWN, this, () => {
              this.startGame();
          });
          this.btnPlayAgainNode =
              this.dialogGameOverNode.getChildByName("btnPlayAgain");
          this.btnPlayAgainNode.on(Laya.Event.MOUSE_DOWN, this, () => {
              this.startGame();
          });
      }
      onCountDown() {
          this.currentCountdown--;
          if (this.currentCountdown <= 0) {
              this.countdownNode.text = "0";
              this.endGame();
          }
          else {
              this.countdownNode.text = "" + this.currentCountdown;
          }
      }
      startGame() {
          this.isPlaying = true;
          this.countdown = 60;
          this.currentCountdown = this.countdown;
          this.currentScore = 0;
          this.dialogStartGameNode.visible = false;
          this.dialogGameOverNode.visible = false;
          this.dialogGameOverScoreNode.text = "0";
          this.countdownNode.text = "" + this.currentCountdown;
          this.scoreNode.text = "0";
          Laya.timer.loop(1000, this, this.onCountDown);
          Laya.timer.once(1000, this, this.generateMouse, [
              this.getRandomInt(1, this.mouses.length),
          ]);
      }
      endGame() {
          this.isPlaying = false;
          this.dialogGameOverNode.visible = true;
          this.dialogGameOverScoreNode.text = "" + this.currentScore;
          Laya.timer.clear(this, this.onCountDown);
          Laya.SoundManager.playSound(`sound/gameover.mp3`, 1);
      }
      addMouse(mouse) {
          this.mouses[mouse.index] = mouse;
      }
      removeMouse(mouse) {
          this.mouses[mouse.index] = null;
      }
      generateMouse(number) {
          if (!this.isPlaying)
              return;
          Array.from({ length: number }, (_, i) => i).forEach((index) => {
              const mouse = this.prefabMouse.create();
              const pos = GameConfig.holes[index];
              mouse.pos(pos.x, pos.y);
              this.mouseContainer.addChild(mouse);
              const component = mouse.getComponent(Mouse);
              component.show(this, index, this.getRandomInt(1, MouseType.length));
              this.addMouse(component);
          });
          Laya.timer.once(2000, this, this.generateMouse, [
              this.getRandomInt(1, this.mouses.length),
          ]);
      }
      onMouseHited(mouse) {
          if (!this.isPlaying)
              return;
          const pos = GameConfig.holes[mouse.index];
          Laya.SoundManager.playSound(`sound/hit.mp3`, 1);
          const hammer = this.hammerNode.getComponent(Hammer);
          this.hammerNode.pos(pos.x + 60, pos.y - 60);
          hammer.show();
          const floatScoreNode = this.floatScoreNode.create();
          floatScoreNode.pos(pos.x - 60, pos.y - 60);
          this.mouseContainer.addChild(floatScoreNode);
          const floatScore = floatScoreNode.getComponent(FloatScore);
          floatScore.show(mouse.type);
          this.currentScore += mouse.type === 1 ? 100 : -100;
          this.scoreNode.text = "" + this.currentScore;
      }
      getRandomInt(left, right) {
          if (right < left)
              return -1;
          return left + ~~(Math.random() * (right - left + 1));
      }
  }

  class GameConfig$1 {
      constructor() { }
      static init() {
          var reg = Laya.ClassUtils.regClass;
          reg("game/Hammer.ts", Hammer);
          reg("game/FloatScore.ts", FloatScore);
          reg("game/GameManager.ts", GameManager);
          reg("game/Mouse.ts", Mouse);
      }
  }
  GameConfig$1.width = 960;
  GameConfig$1.height = 640;
  GameConfig$1.scaleMode = "fixedheight";
  GameConfig$1.screenMode = "horizontal";
  GameConfig$1.alignV = "middle";
  GameConfig$1.alignH = "center";
  GameConfig$1.startScene = "Main.scene";
  GameConfig$1.sceneRoot = "";
  GameConfig$1.debug = false;
  GameConfig$1.stat = false;
  GameConfig$1.physicsDebug = false;
  GameConfig$1.exportSceneToJson = true;
  GameConfig$1.init();

  class Main {
      constructor() {
          if (window["Laya3D"])
              Laya3D.init(GameConfig$1.width, GameConfig$1.height);
          else
              Laya.init(GameConfig$1.width, GameConfig$1.height, Laya["WebGL"]);
          Laya["Physics"] && Laya["Physics"].enable();
          Laya["DebugPanel"] && Laya["DebugPanel"].enable();
          Laya.stage.scaleMode = GameConfig$1.scaleMode;
          Laya.stage.screenMode = GameConfig$1.screenMode;
          Laya.stage.alignV = GameConfig$1.alignV;
          Laya.stage.alignH = GameConfig$1.alignH;
          Laya.URL.exportSceneToJson = GameConfig$1.exportSceneToJson;
          if (GameConfig$1.debug || Laya.Utils.getQueryString("debug") == "true")
              Laya.enableDebugPanel();
          if (GameConfig$1.physicsDebug && Laya["PhysicsDebugDraw"])
              Laya["PhysicsDebugDraw"].enable();
          if (GameConfig$1.stat)
              Laya.Stat.show();
          Laya.alertGlobalError(true);
          Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
      }
      onVersionLoaded() {
          Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
      }
      onConfigLoaded() {
          GameConfig$1.startScene && Laya.Scene.open(GameConfig$1.startScene);
      }
  }
  new Main();

}());
