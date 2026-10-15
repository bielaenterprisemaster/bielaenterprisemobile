import { DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React from 'react';
import { Platform } from 'react-native';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

function postRuntimeError(payload: {
  source: string;
  message: string;
  stack?: string;
  componentStack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}) {
  if (Platform.OS !== 'web') return;
  if (typeof window === 'undefined') return;
  try {
    window.parent?.postMessage(
      {
        type: 'preview:runtime-error',
        message: payload.message,
        filename: payload.filename ?? '',
        lineno: payload.lineno ?? 0,
        colno: payload.colno ?? 0,
        stack: payload.stack ?? '',
        componentStack: payload.componentStack ?? '',
        source: payload.source,
      },
      '*',
    );
  } catch {
    // never let error reporting itself throw
  }
}

const REACT_ERROR_PATTERNS = [
  'The above error occurred',
  'Invalid value used',
];

if (
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  typeof window.addEventListener === 'function'
) {
  const handleError = (e: ErrorEvent) => {
    postRuntimeError({
      source: 'error',
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error?.stack ?? '',
    });
  };

  const handleRejection = (e: PromiseRejectionEvent) => {
    postRuntimeError({
      source: 'unhandledrejection',
      message: e.reason instanceof Error ? e.reason.message : String(e.reason),
      stack: e.reason instanceof Error ? (e.reason.stack ?? '') : '',
    });
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);

  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    try {
      const joined = args
        .map((a) => (typeof a === 'string' ? a : a instanceof Error ? a.message : ''))
        .filter(Boolean)
        .join(' ');
      if (joined && REACT_ERROR_PATTERNS.some((p) => joined.includes(p))) {
        const errArg = args.find((a): a is Error => a instanceof Error);
        postRuntimeError({
          source: 'console-error',
          message: joined,
          stack: errArg?.stack ?? '',
        });
      }
    } catch {
      // never let error reporting itself throw
    }
    originalConsoleError.apply(console, args as []);
  };
}

class PreviewErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    postRuntimeError({
      source: 'react-error-boundary',
      message: error?.message ?? String(error),
      stack: error?.stack ?? '',
      componentStack: info?.componentStack ?? '',
    });
  }

  render() {

    return this.props.children;
  }
}

export default function RootLayout() {

  return (
    
  <GluestackUIProvider mode="light">
      <PreviewErrorBoundary>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PreviewErrorBoundary>
    </GluestackUIProvider>
  
  );
}