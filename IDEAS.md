# IDEAS

## Aggressive Ideas & Expansions

- **Automated AI Matching**: What if we hooked up an LLM directly into the build loop? It modifies a `.c` file, runs `make`, checks the output hash against the expected target ROM byte, and automatically self-corrects until it matches exactly.
- **Universal Save State Format**: Create a JSON-based save state manager that translates save states between N64 versions to persist progress across game generations.
- **WASM Netplay Protocol**: Implement a lightweight WebRTC-based rollback netcode layer specifically tailored for the inputs of Mario Party, bypassing traditional lockstep emulators.
- **Asset Extraction Web Viewer**: Build a separate frontend tool that directly parses the extracted `assets/` folder (textures, 3D models) and displays them natively in a Three.js gallery for easy viewing before they are injected into the game.