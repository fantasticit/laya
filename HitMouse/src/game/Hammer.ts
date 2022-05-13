export default class Hammer extends Laya.Script {
  public owner: Laya.Image;
  private timerLine: Laya.TimeLine;

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
