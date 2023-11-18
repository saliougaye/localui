import { ReactNode, useContext } from 'react';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import { withEmotionCache } from '@emotion/react';
import {
  unstable_useEnhancedEffect as useEnhancedEffect,
  getInitColorSchemeScript,
  useTheme,
} from '@mui/material';
import ClientStyleContext from './src/ClientStyleContext';
import Layout from './src/Layout';
import { computeTitle } from './src/utils';
import type { MetaFunction, LinksFunction } from '@remix-run/node';

// https://remix.run/docs/en/main/route/meta
export const meta: MetaFunction = () => [
  computeTitle(),
  {
    name: 'description',
    content:
      'A simple UI to interact with real or emulated AWS services (LocalStack, Minio, etc).',
  },
  {
    name: 'apple-mobile-web-app-title',
    content: 'LocalUI',
  },
  {
    name: 'application-name',
    content: 'LocalUI',
  },
  {
    name: 'msapplication-TileColor',
    content: '#232f3e',
  },
  {
    name: 'msapplication-config',
    content: '/icons/browserconfig.xml',
  },
  {
    name: 'theme-color',
    content: '#232f3e',
  },
];

// https://remix.run/docs/en/main/route/links
export const links: LinksFunction = () => [
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/icons/apple-touch-icon.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/icons/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '192x192',
    href: '/icons/android-chrome-192x192.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/icons/favicon-16x16.png',
  },
  {
    rel: 'manifest',
    href: '/icons/site.webmanifest',
  },
  {
    rel: 'mask-icon',
    href: '/icons/safari-pinned-tab.svg',
    color: '#232f3e',
  },
  {
    rel: 'shortcut icon',
    href: '/icons/favicon.ico',
  },
];

interface DocumentProps {
  children: ReactNode;
  title?: string;
}

const Document = withEmotionCache(
  ({ children, title }: DocumentProps, emotionCache) => {
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEnhancedEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach(tag => {
        // eslint-disable-next-line no-underscore-dangle
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      // We suppress hydration warnings for the html element because on the
      // server we always SSR with light color scheme, but on the client we
      // want to use the system color scheme and we do that as first thing
      // to avoid a flash of light color scheme for dark mode users
      <html lang="en" data-mui-color-scheme="light" suppressHydrationWarning>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          {title ? <title>{title}</title> : null}
          <Meta />
          <Links />
          <style>
            {`
              html, body {
                margin: 0;
                padding: 0;
                height: 100%;
              }

              body {
                display: flex;
                flex-direction: column;
              }
            `}
          </style>
          <meta
            name="emotion-insertion-point"
            content="emotion-insertion-point"
          />
          {getInitColorSchemeScript({ defaultMode: 'system' })}
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  },
);

// https://remix.run/docs/en/main/route/component
// https://remix.run/docs/en/main/file-conventions/routes
export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}

// https://remix.run/docs/en/main/route/error-boundary
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    let message;
    switch (error.status) {
      case 401:
        message = (
          <p>
            Oops! Looks like you tried to visit a page that you do not have
            access to.
          </p>
        );
        break;
      case 404:
        message = (
          <p>Oops! Looks like you tried to visit a page that does not exist.</p>
        );
        break;

      default:
        throw new Error(error.data || error.statusText);
    }

    return (
      <Document title={`${error.status} ${error.statusText}`}>
        <Layout>
          <h1>
            {error.status}: {error.statusText}
          </h1>
          {message}
        </Layout>
      </Document>
    );
  }

  if (error instanceof Error) {
    console.error(error);
    return (
      <Document title="Error!">
        <Layout>
          <div>
            <h1>There was an error</h1>
            <p>{error.message}</p>
            <hr />
            <p>
              Hey, developer, you should replace this with what you want your
              users to see.
            </p>
          </div>
        </Layout>
      </Document>
    );
  }

  return <h1>Unknown Error</h1>;
}
