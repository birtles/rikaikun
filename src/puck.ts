import {
  getOrCreateEmptyContainer,
  removeContentContainer,
} from './content-container';

import puckStyles from '../css/puck.css';

export class RikaiPuck {
  private puck: HTMLDivElement | undefined;
  private enabled = false;

  private puckX: number;
  private puckY: number;
  private puckWidth: number;
  private puckHeight: number;

  private setPosition(x: number, y: number) {
    this.puckX = x;
    this.puckY = y;
    if (this.puck) {
      this.puck.style.transform = `translate(${this.puckX}px, ${this.puckY}px)`;
    }
  }

  private setPositionWithinSafeArea(x: number, y: number) {
    if (!this.puck) {
      return;
    }

    const computedStyle = getComputedStyle(this.puck);
    const safeAreaTop = parseFloat(
      computedStyle.getPropertyValue('--tenten-puck-safe-area-inset-top')
    );
    const safeAreaRight = parseFloat(
      computedStyle.getPropertyValue('--tenten-puck-safe-area-inset-right')
    );
    const safeAreaBottom = parseFloat(
      computedStyle.getPropertyValue('--tenten-puck-safe-area-inset-bottom')
    );
    const safeAreaLeft = parseFloat(
      computedStyle.getPropertyValue('--tenten-puck-safe-area-inset-left')
    );

    if (
      isNaN(safeAreaTop) ||
      isNaN(safeAreaRight) ||
      isNaN(safeAreaBottom) ||
      isNaN(safeAreaLeft)
    ) {
      return;
    }

    /**
     * window.innerWidth returns the viewport width, including the width of any scrollbars.
     *
     * In practice, it seems that modern browsers (at least on macOS) lay their scrollbars over
     * the viewport rather than offsetting it, so we should be fine to not compensate for them.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
     * @see https://stackoverflow.com/a/7205786/5951226
     */
    const { innerWidth, innerHeight } = window;

    const minX = safeAreaLeft;
    const maxX = innerWidth - safeAreaRight - this.puckWidth;
    const minY = safeAreaTop;
    const maxY = innerHeight - safeAreaBottom - this.puckHeight;

    this.setPosition(
      Math.min(Math.max(minX, x), maxX),
      Math.min(Math.max(minY, y), maxY)
    );
  }

  private readonly onPointerMove = (event: PointerEvent) => {
    if (!this.puckWidth || !this.puckHeight || !this.enabled) {
      return;
    }

    event.preventDefault();

    const { clientX, clientY } = event;
    this.setPositionWithinSafeArea(
      clientX - this.puckWidth / 2,
      clientY - this.puckHeight / 2
    );

    // Work out where we want to lookup
    const targetX = this.puckX;
    // Offset by at least one pixel so that Rikai doesn't attempt to tunnel into
    // the puck rather than the text.
    const targetY = this.puckY - 1;

    // Make sure the target is an actual element since the mousemove handler
    // expects that.
    const target = document.elementFromPoint(targetX, targetY);
    if (target) {
      target.dispatchEvent(
        new MouseEvent('mousemove', {
          // Make sure the event bubbles up to the listener on the window
          bubbles: true,
          clientX: targetX,
          clientY: targetY,
        })
      );
    }
  };

  // Prevent any mouse events on the puck itself from being used for lookup.
  //
  // At least in Firefox we can get _both_ pointer events and mouse events being
  // dispatched.
  private readonly onMouseMove = (event: MouseEvent) => {
    event.stopPropagation();
  };

  private readonly onWindowResize = (event: UIEvent) => {
    this.setPositionWithinSafeArea(this.puckX, this.puckY);
  };

  render({ doc, theme }: { doc: Document; theme: string }): void {
    // Set up shadow tree
    const container = getOrCreateEmptyContainer({
      doc,
      id: 'tenten-ja-puck',
      styles: puckStyles.toString(),
    });

    // Create puck elem
    this.puck = doc.createElement('div');
    this.puck.classList.add('puck');
    container.shadowRoot!.append(this.puck);

    // Set theme styles
    if (theme !== 'default') {
      this.puck.classList.add(`-${theme}`);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.puck.classList.add('-black');
    }

    // Calculate the puck size
    if (!this.puckWidth || !this.puckHeight) {
      const { width, height } = this.puck.getBoundingClientRect();
      this.puckWidth = width;
      this.puckHeight = height;
    }

    // Place in the bottom-right of the safe area
    this.setPositionWithinSafeArea(
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER
    );

    // Add event listeners
    if (this.enabled) {
      window.addEventListener('resize', this.onWindowResize);
      this.puck.addEventListener('pointermove', this.onPointerMove);
      this.puck.addEventListener('mousemove', this.onMouseMove, {
        capture: true,
      });
    }
  }

  setTheme(theme: string) {
    if (!this.puck) {
      return;
    }

    for (const className of this.puck.classList.values()) {
      if (className.startsWith('-')) {
        this.puck.classList.remove(className);
      }
    }

    this.puck.classList.add(`-${theme}`);
  }

  unmount(): void {
    removeContentContainer('tenten-ja-puck');
    this.disable();
    this.puck = undefined;
  }

  enable(): void {
    this.enabled = true;
    if (this.puck) {
      window.addEventListener('resize', this.onWindowResize);
      this.puck.addEventListener('pointermove', this.onPointerMove);
      this.puck.addEventListener('mousemove', this.onMouseMove, {
        capture: true,
      });
    }
  }

  disable(): void {
    this.enabled = false;
    if (this.puck) {
      window.removeEventListener('resize', this.onWindowResize);
      this.puck.removeEventListener('pointermove', this.onPointerMove);
      this.puck.removeEventListener('mousemove', this.onMouseMove, {
        capture: true,
      });
    }
  }
}
