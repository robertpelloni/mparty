/**
 * NetplayManager.ts
 *
 * Middleware for orchestrating WebRTC peer-to-peer connections.
 * This class establishes low-latency UDP data channels to broadcast
 * packed 32-bit controller inputs between clients, enabling remote
 * multiplayer for the WASM emulation cores without relying on a centralized server.
 */

export class NetplayManager {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;

  // Configuration uses public STUN servers to resolve NAT traversal
  private readonly rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor() {}

  /**
   * Initializes the host instance, generating a connection offer.
   */
  public async hostGame(): Promise<RTCSessionDescriptionInit> {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Create the reliable/ordered data channel for input polling sync
    this.dataChannel = this.peerConnection.createDataChannel('mparty-netplay', {
      ordered: true,
      maxRetransmits: 3
    });

    this.setupChannelListeners();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    return offer;
  }

  /**
   * Joins an existing host's game by consuming their offer and generating an answer.
   */
  public async joinGame(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupChannelListeners();
    };

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  /**
   * Finalizes the handshake process for the host after receiving the client's answer.
   */
  public async acceptClientAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error("Peer connection not initialized.");
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  private setupChannelListeners(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('NetplayManager: Data channel established. Ready for input sync.');
    };

    this.dataChannel.onmessage = (event) => {
      // In a real implementation, this receives the remote peer's 32-bit controller state
      // and injects it into the local EmulationCore memory for player 2.
      const remoteInputBuffer = new Uint32Array(event.data);
      // console.log(`NetplayManager: Received remote input state: ${remoteInputBuffer[0]}`);
      console.log("Mock NetplayManager: Received WebSocket stream payload from mparty_cli.py.");
    };

    this.dataChannel.onerror = (error) => {
      console.error('NetplayManager: Data channel error:', error);
    };

    this.dataChannel.onclose = () => {
      console.log('NetplayManager: Peer disconnected.');
    };
  }

  /**
   * Broadcasts the local player's 32-bit input state to the connected peer.
   * This should be invoked per frame during the EmulationCore loop.
   */
  public broadcastLocalInput(packedInput: number): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const buffer = new Uint32Array([packedInput]);
      this.dataChannel.send(buffer.buffer);
    }
  }

  /**
   * Safely closes the peer-to-peer connection.
   */
  public disconnect(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    console.log('NetplayManager: Connections terminated.');
  }
}
