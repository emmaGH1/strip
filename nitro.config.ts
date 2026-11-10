// Agent-Native's production build calls createNitro, which loads this file.
// Vite's agentNative({ nitro }) options configure development only.
// --prebuilt reads the emitted __server.func/.vc-config.json, not source globs.
export default {
  vercel: {
    functions: {
      regions: ["fra1"], // colocated with Neon's eu-central-1 endpoint
      maxDuration: 300, // existing Hobby + Fluid Compute allowance
    },
  },
};
