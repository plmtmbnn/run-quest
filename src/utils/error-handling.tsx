/**
 * Comprehensive Error Handling System for Run-Quest
 * 
 * Centralized error handling, reporting, and recovery mechanisms
 * to improve game stability and user experience.
 */

import React from 'react';
import { storageRepository } from '@/storage/storage-repository';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'debug';

/**
 * Error context for better debugging
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  file?: string;
  line?: number;
  userAgent?: string;
  timestamp: number;
  sessionId?: string;
  gameDay?: number;
  [key: string]: any;
}

/**
 * Structured error information
 */
export interface GameError {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  type: 'runtime' | 'validation' | 'network' | 'storage' | 'game_logic';
  recoverable: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Error reporting configuration
 */
export interface ErrorReportingConfig {
  enabled: boolean;
  logToConsole: boolean;
  sendToServer: boolean;
  serverEndpoint?: string;
  maxReportsPerSession: number;
  includeStackTrace: boolean;
}

/**
 * Default error reporting configuration
 */
const DEFAULT_CONFIG: ErrorReportingConfig = {
  enabled: true,
  logToConsole: process.env.NODE_ENV !== 'production',
  sendToServer: process.env.NODE_ENV === 'production',
  serverEndpoint: '/api/errors',
  maxReportsPerSession: 10,
  includeStackTrace: process.env.NODE_ENV !== 'production',
};

/**
 * Error reporting state
 */
let errorConfig: ErrorReportingConfig = DEFAULT_CONFIG;
let reportedErrors: GameError[] = [];
let sessionId: string = '';
let errorCount: number = 0;

/**
 * Initialize error handling system
 */
export function initializeErrorHandling(config?: Partial<ErrorReportingConfig>): void {
  errorConfig = { ...DEFAULT_CONFIG, ...config };
  sessionId = generateSessionId();
  errorCount = 0;
  reportedErrors = [];
  
  // Set up global error handlers
  setupGlobalErrorHandlers();
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set up global error handlers
 */
function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError({
      message: `Unhandled promise rejection: ${event.reason}`,
      severity: 'high',
      type: 'runtime',
      recoverable: false,
      context: {
        action: 'unhandled_rejection',
        timestamp: Date.now(),
        sessionId,
      },
    });
  });

  // Global error handler
  window.addEventListener('error', (event) => {
    reportError({
      message: `Global error: ${event.message}`,
      stack: event.error?.stack,
      severity: 'critical',
      type: 'runtime',
      recoverable: false,
      context: {
        action: 'global_error',
        file: event.filename,
        line: event.lineno,
        timestamp: Date.now(),
        sessionId,
      },
    });
  });
}

/**
 * Report an error with structured information
 */
export function reportError(error: Partial<GameError> & { message: string }): string {
  if (!errorConfig.enabled) return '';

  // Check rate limiting
  if (errorCount >= errorConfig.maxReportsPerSession) {
    if (errorConfig.logToConsole) {
      console.warn('⚠️ Error reporting rate limit exceeded');
    }
    return '';
  }

  const gameError: GameError = {
    id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    message: error.message,
    stack: errorConfig.includeStackTrace ? error.stack : undefined,
    severity: error.severity || 'medium',
    type: error.type || 'runtime',
    recoverable: error.recoverable !== false,
    context: {
      timestamp: Date.now(),
      sessionId,
      ...error.context,
    },
    metadata: error.metadata,
  };

  // Log to console if enabled
  if (errorConfig.logToConsole) {
    const severityIcon = getSeverityIcon(gameError.severity);
    const severityColor = getSeverityColor(gameError.severity);
    
    console.groupCollapsed(
      `%c${severityIcon} [${gameError.severity.toUpperCase()}] ${gameError.message}`,
      `color: ${severityColor}; font-weight: bold;`
    );
    console.log('Context:', gameError.context);
    if (gameError.stack) {
      console.log('Stack:', gameError.stack);
    }
    if (gameError.metadata) {
      console.log('Metadata:', gameError.metadata);
    }
    console.groupEnd();
  }

  // Store error for potential batch reporting
  reportedErrors.push(gameError);
  errorCount++;

  // Send to server if enabled
  if (errorConfig.sendToServer && errorConfig.serverEndpoint) {
    sendErrorToServer(gameError).catch(() => {
      // Silently fail if server reporting fails
    });
  }

  // Attempt recovery for recoverable errors
  if (gameError.recoverable) {
    attemptErrorRecovery(gameError);
  }

  return gameError.id;
}

/**
 * Get icon for severity level
 */
function getSeverityIcon(severity: ErrorSeverity): string {
  const icons = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
    debug: '🔵',
  };
  return icons[severity] || '⚪';
}

/**
 * Get color for severity level
 */
function getSeverityColor(severity: ErrorSeverity): string {
  const colors = {
    critical: '#ef4444', // red-500
    high: '#f97316',   // orange-500
    medium: '#f59e0b', // amber-500
    low: '#10b981',   // emerald-500
    debug: '#3b82f6',  // blue-500
  };
  return colors[severity] || '#6b7280';
}

/**
 * Send error to server
 */
async function sendErrorToServer(error: GameError): Promise<void> {
  if (!errorConfig.serverEndpoint) return;

  try {
    const response = await fetch(errorConfig.serverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {
          ...error,
          // Remove potentially sensitive information
          context: {
            ...error.context,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          },
        },
        sessionId,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
  } catch (error) {
    // Silently fail - we don't want error reporting to cause more errors
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to send error to server:', error);
    }
  }
}

/**
 * Attempt to recover from an error
 */
function attemptErrorRecovery(error: GameError): void {
  if (errorConfig.logToConsole) {
    console.log(`🔄 Attempting recovery from: ${error.message}`);
  }

  // Implement specific recovery strategies based on error type
  switch (error.type) {
    case 'storage':
      recoverFromStorageError(error);
      break;
    case 'game_logic':
      recoverFromGameLogicError(error);
      break;
    case 'validation':
      recoverFromValidationError(error);
      break;
    default:
      // Generic recovery - just log and continue
      break;
  }
}

/**
 * Recover from storage errors
 */
function recoverFromStorageError(error: GameError): void {
  if (errorConfig.logToConsole) {
    console.log('💾 Attempting storage recovery...');
  }

  // Try to restore from backup or reset to defaults
  try {
    // For now, just log the error
    // In a full implementation, you might:
    // 1. Try to load from backup storage
    // 2. Reset to default state
    // 3. Notify user of data loss
  } catch (recoveryError) {
    reportError({
      message: `Storage recovery failed: ${recoveryError}`,
      severity: 'high',
      type: 'storage',
      recoverable: false,
      context: error.context,
    });
  }
}

/**
 * Recover from game logic errors
 */
function recoverFromGameLogicError(error: GameError): void {
  if (errorConfig.logToConsole) {
    console.log('🎮 Attempting game logic recovery...');
  }

  // For game logic errors, we might:
  // 1. Roll back to previous state
  // 2. Skip the problematic operation
  // 3. Use fallback values
}

/**
 * Recover from validation errors
 */
function recoverFromValidationError(error: GameError): void {
  if (errorConfig.logToConsole) {
    console.log('✅ Attempting validation recovery...');
  }

  // For validation errors, we might:
  // 1. Use default values
  // 2. Clamp values to valid ranges
  // 3. Skip the invalid operation
}

/**
 * Create an error boundary component for React
 */
export class ErrorBoundary extends React.Component<{
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}, { hasError: boolean; error?: Error }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ hasError: true, error });
    
    reportError({
      message: `UI Error: ${error.message}`,
      stack: error.stack,
      severity: 'high',
      type: 'runtime',
      recoverable: true,
      context: {
        component: errorInfo.componentStack?.split('\n')[0] || '',
        action: 'render',
        timestamp: Date.now(),
        sessionId,
      },
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-rose-50 dark:bg-rose-950/10 p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-[2rem] p-6 text-center max-w-md">
            <div className="text-4xl mb-4">🚨</div>
            <h3 className="font-heading font-black text-base text-slate-800 dark:text-white mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              We encountered an error while rendering this component.
            </p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="py-2.5 rounded-xl text-xs font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Safe function execution with error handling
 */
export function safeExecute<T>(
  fn: () => T,
  context: Partial<ErrorContext> = {},
  fallback?: T
): T {
  try {
    return fn();
  } catch (error) {
    reportError({
      message: `Safe execution failed: ${error}`,
      severity: 'medium',
      type: 'runtime',
      recoverable: true,
      context: {
        action: 'safe_execute',
        timestamp: Date.now(),
        sessionId,
        ...context,
      },
    });

    return fallback as T;
  }
}

/**
 * Safe async function execution with error handling
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  context: Partial<ErrorContext> = {},
  fallback?: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    reportError({
      message: `Safe async execution failed: ${error}`,
      severity: 'medium',
      type: 'runtime',
      recoverable: true,
      context: {
        action: 'safe_execute_async',
        timestamp: Date.now(),
        sessionId,
        ...context,
      },
    });

    return fallback as T;
  }
}

/**
 * Validate function input with error handling
 */
export function validateInput<T>(
  input: unknown,
  validator: (input: unknown) => T,
  context: Partial<ErrorContext> = {}
): T {
  try {
    return validator(input);
  } catch (error) {
    reportError({
      message: `Input validation failed: ${error}`,
      severity: 'medium',
      type: 'validation',
      recoverable: false,
      context: {
        action: 'validate_input',
        timestamp: Date.now(),
        sessionId,
        ...context,
      },
      metadata: { input: JSON.stringify(input, null, 2) },
    });

    throw error;
  }
}

/**
 * Create a retry mechanism for flaky operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    shouldRetry?: (error: unknown) => boolean;
    context?: Partial<ErrorContext>;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    shouldRetry = () => true,
    context = {},
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries && shouldRetry(error)) {
        reportError({
          message: `Operation failed, retrying (${attempt}/${maxRetries}): ${error}`,
          severity: 'low',
          type: 'runtime',
          recoverable: true,
          context: {
            action: 'retry_operation',
            attempt,
            timestamp: Date.now(),
            sessionId,
            ...context,
          },
        });

        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      } else {
        break;
      }
    }
  }

  // If we get here, all retries failed
  reportError({
    message: `Operation failed after ${maxRetries} retries: ${lastError}`,
    severity: 'high',
    type: 'runtime',
    recoverable: false,
    context: {
      action: 'retry_operation',
      timestamp: Date.now(),
      sessionId,
      ...context,
    },
  });

  throw lastError;
}

/**
 * Get all reported errors for debugging
 */
export function getReportedErrors(): GameError[] {
  return [...reportedErrors];
}

/**
 * Clear reported errors (useful for testing)
 */
export function clearReportedErrors(): void {
  reportedErrors = [];
  errorCount = 0;
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  byType: Record<string, number>;
} {
  const bySeverity: Record<ErrorSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    debug: 0,
  };

  const byType: Record<string, number> = {};

  for (const error of reportedErrors) {
    bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    byType[error.type] = (byType[error.type] || 0) + 1;
  }

  return {
    total: reportedErrors.length,
    bySeverity,
    byType,
  };
}

/**
 * Check if we're in a recoverable state
 */
export function isRecoverableState(): boolean {
  // Check for critical errors that might make the game unplayable
  const criticalErrors = reportedErrors.filter(
    (e) => e.severity === 'critical' && !e.recoverable
  );
  
  return criticalErrors.length === 0;
}

// Initialize error handling when this module is imported
if (typeof window !== 'undefined') {
  initializeErrorHandling();
}