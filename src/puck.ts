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
  private readonly onPointermove = (event: PointerEvent) => {
    event.preventDefault();
    const { clientX, clientY, offsetX, offsetY } = event;
    this.puckX = clientX - offsetX;
    this.puckY = clientY - offsetY;
    // TODO: Instead of dispatching a "mousemove" event, call the necessary part of the ContentHandler's onMouseMove() function.
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
    this.puck.addEventListener("pointermove", this.onPointermove);
  }

  disable(): void {
    this.puck.removeEventListener("pointermove", this.onPointermove);
  }
}