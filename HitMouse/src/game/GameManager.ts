import GameConfig from "./GameConfig";
import Mouse, { MouseType } from "./Mouse";
import Hammer from "./Hammer";
import FloatScore from "./FloatScore";

export default class GameManager extends Laya.Script {
  /** @prop {name:dialogStartGameNode, tips:"游戏开始弹窗", type:Node, default:null}*/
  /** @prop {name:dialogStartGameButtonNode, tips:"游戏开始按钮", type:Node, default:null}*/
  /** @prop {name:countdownNode, tips:"倒计时", type:Node, default:null}*/
  /** @prop {name:scoreNode, tips:"得分", type:Node, default:null}*/
  /** @prop {name:dialogGameOverNode, tips:"游戏结束", type:Node, default:null}*/
  /** @prop {name:dialogGameOverScoreNode, tips:"游戏结束分数", type:Node, default:null}*/
  /** @prop {name:mouseContainer, tips:"老鼠容器", type:Node, default:null}*/
  /** @prop {name:prefabMouse, tips:"老鼠预制体", type:Prefab, default:null}*/
  /** @prop {name:hammerNode, tips:"锤子", type:Node, default:null}*/
  /** @prop {name:floatScoreNode, tips:"浮动分数", type:Prefab, default:null}*/

  // 以下为 UI 节点绑定
  private dialogStartGameNode: Laya.Sprite;
  private dialogStartGameButtonNode: Laya.Image;
  private countdownNode: Laya.Label;
  private scoreNode: Laya.Label;
  private dialogGameOverNode: Laya.Sprite;
  private dialogGameOverScoreNode: Laya.Label;
  private btnPlayAgainNode: Laya.Node;
  private mouseContainer: Laya.Node;
  private prefabMouse: Laya.Prefab;
  private hammerNode: Laya.Image;
  private floatScoreNode: Laya.Prefab;

  // 以下为私有变量
  private countdown: number; // 总共倒计时
  private isPlaying: boolean;
  private currentCountdown: number; // 倒计时剩余时间
  private currentScore: number = 0; // 当前得分
  private mouses: Array<Mouse> = Array.from(
    { length: GameConfig.holes.length },
    () => null
  );

  constructor() {
    super();
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
    } else {
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

  /**
   * 保存老鼠实例
   * @param mouse
   */
  addMouse(mouse: Mouse) {
    this.mouses[mouse.index] = mouse;
  }

  /**
   * 删除老鼠实例
   * @param mouse
   */
  removeMouse(mouse: Mouse) {
    this.mouses[mouse.index] = null;
  }

  /**
   * 生成老鼠
   * @param number
   */
  generateMouse(number) {
    if (!this.isPlaying) return;

    Array.from({ length: number }, (_, i) => i).forEach((index) => {
      const mouse = this.prefabMouse.create();
      const pos = GameConfig.holes[index];
      mouse.pos(pos.x, pos.y);
      this.mouseContainer.addChild(mouse);

      const component = mouse.getComponent(Mouse);
      component.show(this, index, this.getRandomInt(1, MouseType.length));
      this.addMouse(component);
    });

    // 每隔 2s 生成新的老鼠
    Laya.timer.once(2000, this, this.generateMouse, [
      this.getRandomInt(1, this.mouses.length),
    ]);
  }

  onMouseHited(mouse: Mouse) {
    if (!this.isPlaying) return;

    const pos = GameConfig.holes[mouse.index];

    Laya.SoundManager.playSound(`sound/hit.mp3`, 1);

    // 显示锤子
    const hammer = this.hammerNode.getComponent(Hammer);
    this.hammerNode.pos(pos.x + 60, pos.y - 60);
    hammer.show();

    // 显示浮动分数
    const floatScoreNode = this.floatScoreNode.create();
    floatScoreNode.pos(pos.x - 60, pos.y - 60);
    this.mouseContainer.addChild(floatScoreNode);
    const floatScore = floatScoreNode.getComponent(FloatScore);
    floatScore.show(mouse.type);

    // 计算分数
    this.currentScore += mouse.type === 1 ? 100 : -100;
    this.scoreNode.text = "" + this.currentScore;
  }

  getRandomInt(left: number, right: number) {
    if (right < left) return -1;
    return left + ~~(Math.random() * (right - left + 1));
  }
}
