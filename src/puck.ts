export interface PuckOpts {
  width: number;
  height: number;
  borderColor: string;
  backgroundColor: string;
}

export class RikaiPuck {
  private readonly puck: HTMLDivElement = document.createElement("div");
  private static defaultOpts: PuckOpts = {
    width: 50,
    height: 50,
    borderColor: "#b7e7ff",
    backgroundColor: "#5c73b8",
  };
  private _puckX: number;
  private get puckX(): number {
    return this._puckX;
  }
  private set puckX(x: number){
    this._puckX = x;
    this.puck.style.transform = `translate(${x}px, ${this.puckY}px)`;
  }
  private _puckY: number;
  private get puckY(): number {
    return this._puckY;
  }
  private set puckY(y: number){
    this._puckY = y;
    this.puck.style.transform = `translate(${this.puckX}px, ${y}px)`;
  }

  private _puckWidth: number;
  private get puckWidth(): number {
    return this._puckWidth;
  }
  private set puckWidth(width: number){
    this._puckWidth = width;
    this.puck.style.width = `${width}px`;
  }
  private _puckHeight: number;
  private get puckHeight(): number {
    return this._puckHeight;
  }
  private set puckHeight(height: number){
    this._puckHeight = height;
    this.puck.style.height = `${height}px`;
  }

  constructor(opts: Partial<PuckOpts> = RikaiPuck.defaultOpts){
    const {
      width,
      height,
      backgroundColor,
      borderColor,
    } = Object.assign({}, RikaiPuck.defaultOpts, opts);

    this.puck.style.position = "fixed";
    this.puckWidth = width;
    this.puckHeight = height;
    this.puck.style.top = "0";
    this.puck.style.left = "0";
    this.puck.style.boxSizing = "border-box";
    this.puck.style.backgroundColor = backgroundColor;
    this.puck.style.touchAction = "manipulation";
    this.puck.style.borderRadius = "15px";
    this.puck.style.border = `2px solid ${borderColor}`;
    // We use a z-index one higher than the Rikai popup itself.
    this.puck.style.zIndex = "1000002";
  }

  private readonly onTouchstart = (event: TouchEvent) => {
    // console.log(0);
  }
  private readonly onTouchend = (event: TouchEvent) => {
    // console.log(1);
  }
  private readonly onTouchcancel = (event: TouchEvent) => {
    // console.log(2);
  }
  private readonly onTouchleave = (event: TouchEvent) => {
    // console.log(3);
  }
  private readonly onTouchmove = (event: TouchEvent | MouseEvent) => {
    // console.log(`${event.type}`, event);
    event.preventDefault();
    const { clientX, clientY } = (event as TouchEvent).targetTouches ? (event as TouchEvent).targetTouches[0] : event as MouseEvent;
    this.puckX = clientX - this.puckWidth / 2;
    this.puckY = clientY - this.puckHeight / 2;
    window.dispatchEvent(
      new MouseEvent(
        "mousemove",
        {
          clientX: this.puckX,
          // Offset by at least one pixel so that Rikai doesn't attempt to tunnel into the puck rather than the text.
          clientY: this.puckY - 1,
        }
      )
    );
  }

  render(parent: HTMLElement): void {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const safeAreaInsetRight = 16; // TODO: calculate properly
    const safeAreaInsetBottom = 200; // TODO: calculate properly
    this.puckX = viewportWidth - this.puckWidth - safeAreaInsetRight;
    this.puckY = viewportHeight - this.puckHeight - safeAreaInsetBottom;

    parent.appendChild(this.puck);
  }

  unmount(): void {
    this.puck.parentElement?.removeChild(this.puck);
    this.disable();
  }

  enable(): void {
    this.puck.addEventListener("touchstart", this.onTouchstart);
    this.puck.addEventListener("touchend", this.onTouchend);
    this.puck.addEventListener("touchcancel", this.onTouchcancel);
    this.puck.addEventListener("touchleave", this.onTouchleave);
    this.puck.addEventListener("touchmove", this.onTouchmove);
    this.puck.addEventListener("mousemove", this.onTouchmove);
  }

  disable(): void {
    this.puck.removeEventListener("touchstart", this.onTouchstart);
    this.puck.removeEventListener("touchend", this.onTouchend);
    this.puck.removeEventListener("touchcancel", this.onTouchcancel);
    this.puck.removeEventListener("touchleave", this.onTouchleave);
    this.puck.removeEventListener("touchmove", this.onTouchmove);
    this.puck.removeEventListener("mousemove", this.onTouchmove);
  }
}