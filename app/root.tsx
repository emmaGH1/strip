import { configureTracking } from "@agent-native/core/client/analytics";
import { appPath } from "@agent-native/core/client/api-path";
import { useDbSync } from "@agent-native/core/client/hooks";
import { createAgentNativeQueryClient } from "@agent-native/core/client/hooks";
import { getLocaleInitScript, useT } from "@agent-native/core/client/i18n";
import { getThemeInitScript } from "@agent-native/core/client/theme";
import { AppProviders } from "@agent-native/toolkit/app/providers";
import { useCommandMenuShortcut } from "@agent-native/toolkit/app/shared";
import { CommandMenu } from "@agent-native/toolkit/app/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useRouteLoaderData,
} from "react-router";
import type { LinksFunction } from "react-router";

import { Layout as AppLayout } from "@/components/layout/Layout";
import { AppToolkitProvider } from "@/components/ui/toolkit-provider";
import { useNavigationState } from "@/hooks/use-navigation-state";
import { APP_TITLE } from "@/lib/app-config";
import {
  HOME_PATH,
  isChatPathname,
  NEW_CHAT_PATH,
  skeletonLayoutForPath,
  threadIdFromPath,
} from "@/lib/chat-paths";
import { TAB_ID } from "@/lib/tab-id";

import { isPublicEntry } from "../shared/public-entry";
import { i18nCatalog } from "./i18n";

import stylesheet from "./global.css?url";

configureTracking({
  // Telemetry must not probe a protected engine endpoint on public pages.
  // Authenticated AppProviders/Home still use the real readiness gate.
  llmConnectionStatus: false,
  getDefaultProps: (_name, properties) => ({
    ...properties,
    app: "strip-proof-scaffold",
    template: "chat",
  }),
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

// Only the public image URL crosses the server/client boundary, never environment data.
export function loader({ request }: { request: Request }) {
  return {
    ogImage: new URL(appPath("/og.png"), process.env.APP_URL || request.url)
      .href,
  };
}

const THEME_INIT_SCRIPT = getThemeInitScript();
const LOCALE_INIT_SCRIPT = getLocaleInitScript();

export function Layout({ children }: { children: React.ReactNode }) {
  const brand = useRouteLoaderData<typeof loader>("root");
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, interactive-widget=resizes-content"
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <script
          data-agent-native-locale-init
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: LOCALE_INIT_SCRIPT }}
        />
        <meta name="theme-color" content="#F4EFE6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content={APP_TITLE} />
        <link
          rel="icon"
          type="image/x-icon"
          sizes="16x16 32x32 48x48"
          href={appPath("/favicon.ico")}
        />
        <link rel="icon" type="image/svg+xml" href={appPath("/favicon.svg")} />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={appPath("/apple-touch-icon.png")}
        />
        <link rel="manifest" href={appPath("/manifest.json")} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Strip" />
        <meta
          property="og:title"
          content="Release notes nobody reads? Ship a strip."
        />
        <meta
          property="og:image"
          content={brand?.ogImage ?? appPath("/og.png")}
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Strip — Release notes nobody reads? Ship a strip. Illustrative comic, fictional dialogue."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content={brand?.ogImage ?? appPath("/og.png")}
        />
        <meta
          name="twitter:image:alt"
          content="Strip — Release notes nobody reads? Ship a strip. Illustrative comic, fictional dialogue."
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function DbSyncSetup() {
  const qc = useQueryClient();
  const location = useLocation();
  useNavigationState();
  useDbSync({
    queryClient: qc,
    ignoreSource: TAB_ID,
    ...(location.pathname === "/home"
      ? {
          realtime: {
            reason:
              "External MCP agents and other tabs can change this owner's Library or open Studio",
          },
          // Serverless uses the framework poll, not local SSE. Both values
          // override the default minute-scale idle base; empty polls still
          // back off 1×/2×/5× (at most 5 s while visible and healthy).
          interval: 1_000,
          fallbackInterval: 1_000,
        }
      : {}),
    pauseWhenHidden: true,
  });
  return null;
}

function ThemeToggleItem() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useT();
  const isDark = resolvedTheme === "dark";
  return (
    <CommandMenu.Item
      onSelect={() => setTheme(isDark ? "light" : "dark")}
      keywords={["theme", "dark", "light", "mode"]}
    >
      {t("root.toggleTheme")}
    </CommandMenu.Item>
  );
}

function AppContent() {
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const navigate = useNavigate();
  const t = useT();
  const location = useLocation();
  const isChatThread = threadIdFromPath(location.pathname) !== null;
  useCommandMenuShortcut(useCallback(() => setCmdkOpen(true), []));
  // CommandMenu includes authenticated model/readiness queries even when closed.
  // Public entry pages must stay outside the workspace's authenticated surfaces.
  if (isPublicEntry(location.pathname)) return <Outlet />;
  return (
    <>
      <CommandMenu
        open={cmdkOpen}
        onOpenChange={setCmdkOpen}
        chatStorageKey="chat"
      >
        <CommandMenu.Group heading={t("root.commandActions")}>
          {isChatThread ? (
            <CommandMenu.Item
              onSelect={() =>
                window.dispatchEvent(new Event("agent-chat:new-chat"))
              }
            >
              {t("chat.newChat")}
            </CommandMenu.Item>
          ) : null}
          {location.pathname !== HOME_PATH ? (
            <CommandMenu.Item onSelect={() => navigate(HOME_PATH)}>
              {t("navigation.home")}
            </CommandMenu.Item>
          ) : null}
          {!isChatPathname(location.pathname) ? (
            <CommandMenu.Item onSelect={() => navigate(NEW_CHAT_PATH)}>
              {t("navigation.chat")}
            </CommandMenu.Item>
          ) : null}
          <CommandMenu.Item
            onSelect={() => navigate("/settings/agent")}
            keywords={[
              "agent",
              "context",
              "files",
              "connections",
              "jobs",
              "access",
            ]}
          >
            {t("settings.openAgentSettings")}
          </CommandMenu.Item>
        </CommandMenu.Group>
        <CommandMenu.Group heading={t("root.commandAppearance")}>
          <ThemeToggleItem />
        </CommandMenu.Group>
      </CommandMenu>
      {isPublicEntry(location.pathname) ? (
        <Outlet />
      ) : (
        <AppLayout>
          <Outlet />
        </AppLayout>
      )}
    </>
  );
}

export default function Root() {
  const [queryClient] = useState(() => createAgentNativeQueryClient());
  // The path, not the visitor, picks the shell, so the SSR shell stays one
  // cached page per URL.
  const { pathname } = useLocation();
  return (
    <AppToolkitProvider>
      <AppProviders
        queryClient={queryClient}
        isPublicPath={isPublicEntry(pathname)}
        defaultTheme="light"
        skeletonLayout={skeletonLayoutForPath(pathname)}
        i18n={{ catalog: i18nCatalog }}
      >
        {!isPublicEntry(pathname) ? <DbSyncSetup /> : null}
        <AppContent />
      </AppProviders>
    </AppToolkitProvider>
  );
}

export { ErrorBoundary } from "@agent-native/toolkit/app/shared/ErrorBoundary";
