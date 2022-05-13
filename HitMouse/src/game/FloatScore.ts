import { TMouseType } from "./Mouse";

export default class FloatScore extends Laya.Script {
  public owner: Laya.Image;
  private timerLine: Laya.TimeLine;

  constructor() {
    super();
  }

  onAwake() {
    this.timerLine = null;
  }

  show(type: TMouseType) {
    if (this.timerLine) {
      this.timerLine.destroy();
    }

    this.owner.skin = `res/score_100_${type}.png`;

    this.timerLine = Laya.TimeLine.to(
      this.owner,
      { y: this.owner.y - 100 },
      150,
      Laya.Ease.backOut
    ).to(this.owner, { alpha: 0 }, 150, Laya.Ease.backOut, 300);
    this.timerLine.play(0, false);
    this.timerLine.on(Laya.Event.COMPLETE, this, () => {
      this.owner.removeSelf();
    });
  }
}
