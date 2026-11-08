import { createToolkitAuthPlugin } from "@agent-native/toolkit/app/auth/server";

export default createToolkitAuthPlugin({
  workspaceAppPublicPaths: ["/", "/landing-a", "/landing-b", "/landing-c"],
  rootAuth: false,
  marketing: false,
});
