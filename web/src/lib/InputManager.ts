/**
 * InputManager.ts
 *
 * Middleware for mapping browser-native Keyboard and Gamepad API inputs
 * into the 32-bit controller packet formats expected by N64/GameCube
 * WebAssembly emulators.
 */

export interface ControllerState {
  a: boolean;
  b: boolean;
  z: boolean;
  start: boolean;
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;
  joyX: number; // -128 to 127
  joyY: number; // -128 to 127
}

export class InputManager {
  private state: ControllerState;

  constructor() {
    this.state = {
      a: false, b: false, z: false, start: false,
      dpadUp: false, dpadDown: false, dpadLeft: false, dpadRight: false,
      joyX: 0, joyY: 0
    };
  }

  /**
   * Binds global keyboard and gamepad event listeners to the window.
   */
  public attachListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
    console.log("InputManager: Browser input listeners attached.");
  }

  public detachListeners(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    console.log("InputManager: Browser input listeners detached.");
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.updateKey(e.code, true);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.updateKey(e.code, false);
  };

  private handleGamepadConnected = (e: GamepadEvent) => {
    console.log(`InputManager: Gamepad connected at index ${e.gamepad.index}: ${e.gamepad.id}.`);
  };

  private updateKey(code: string, isPressed: boolean) {
    switch(code) {
      case 'KeyX': this.state.a = isPressed; break;
      case 'KeyZ': this.state.b = isPressed; break;
      case 'Enter': this.state.start = isPressed; break;
      case 'ArrowUp': this.state.joyY = isPressed ? 127 : 0; break;
      case 'ArrowDown': this.state.joyY = isPressed ? -128 : 0; break;
      case 'ArrowLeft': this.state.joyX = isPressed ? -128 : 0; break;
      case 'ArrowRight': this.state.joyX = isPressed ? 127 : 0; break;
    }
  }

  /**
   * Polls the current state of attached Gamepads.
   * This should be called once per frame by the EmulationCore loop.
   */
  public pollGamepads(): void {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;

    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];

    if (gp) {
      // Very basic mock mapping for a standard Xbox/PlayStation controller
      this.state.a = gp.buttons[0]?.pressed || false;
      this.state.b = gp.buttons[1]?.pressed || false;

      // Analog stick mapping (deadzone filtering)
      const xAxis = gp.axes[0];
      const yAxis = gp.axes[1];
      this.state.joyX = Math.abs(xAxis) > 0.1 ? Math.floor(xAxis * 127) : 0;
      this.state.joyY = Math.abs(yAxis) > 0.1 ? Math.floor(-yAxis * 127) : 0;
    }
  }

  /**
   * Returns the packed 32-bit integer representing the N64 controller state
   * to be passed directly into the WASM emulator memory boundary.
   */
  public getPackedN64State(): number {
    this.pollGamepads();

    // N64 Controller packed state mock format:
    // Bit 0: A, Bit 1: B, Bit 2: Z, Bit 3: Start, Bits 16-23: X, Bits 24-31: Y
    let packed = 0;
    if (this.state.a) packed |= (1 << 0);
    if (this.state.b) packed |= (1 << 1);
    if (this.state.z) packed |= (1 << 2);
    if (this.state.start) packed |= (1 << 3);

    // Analog sticks
    packed |= ((this.state.joyX & 0xFF) << 16);
    packed |= ((this.state.joyY & 0xFF) << 24);

    return packed;
  }
}
