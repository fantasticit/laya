import GameManager from "./GameManager";

export type TMouseType = 1 | 2;

export const MouseType = [1, 2];

export default class Mouse extends Laya.Script {
  public owner: Laya.Image;
  private timerLine: Laya.TimeLine;
  private gameManager: GameManager;
  private isHited: boolean;
  public type: TMouseType;
  public index: number; // 索引

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
    if (this.isHited) return;

    this.owner.skin = `res/mouse_hited_${this.type}.png`;

    if (this.timerLine) {
      this.timerLine.destroy();
      this.timerLine = null;
    }

    this.timerLine = Laya.TimeLine.to(
      this.owner,
      { scaleX: 0, scaleY: 0 },
      300,
      null,
      500
    );
    this.timerLine.play(0, false);
    this.timerLine.on(Laya.Event.COMPLETE, this, () => {
      this.owner.removeSelf();
      this.gameManager.removeMouse(this);
    });

    this.gameManager.onMouseHited(this);
    this.isHited = true;
  }

  /**
   *
   * @param type 1 | 2, 1 加分， 2减分
   */
  show(gameManager, index: number, type: TMouseType) {
    this.gameManager = gameManager;
    this.index = index;
    this.type = type;

    this.owner.skin = `res/mouse_normal_${type}.png`;
    this.owner.scaleX = 0;
    this.owner.scaleY = 0;

    this.timerLine = Laya.TimeLine.to(
      this.owner,
      { scaleX: 1, scaleY: 1 },
      300
    ).to(this.owner, { scaleX: 0, scaleY: 0 }, 300, null, 1000);
    this.timerLine.play(0, false);
    this.timerLine.on(Laya.Event.COMPLETE, this, () => {
      this.owner.removeSelf();
      this.gameManager.removeMouse(this);
    });
  }
}
