// ========================================
// Custom Logger
// ========================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: any;
}

class Logger {
  private level: LogLevel;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor() {
    const envLevel = (process.env.LOG_LEVEL?.toLowerCase() || 'error') as LogLevel;
    this.level = this.levels[envLevel] !== undefined ? envLevel : 'error';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, meta?: LogMeta | Error): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta instanceof Error ? { error: meta.message, stack: meta.stack } : meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: LogMeta): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: LogMeta): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: LogMeta): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, error?: Error | LogMeta, meta?: LogMeta): void {
    if (this.shouldLog('error')) {
      const finalMeta = error instanceof Error ? error : { ...error, ...meta };
      console.error(this.formatMessage('error', message, finalMeta));
    }
  }
}

export const logger = new Logger();