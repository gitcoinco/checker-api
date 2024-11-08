import { basename } from 'path';
import { createLogger, format, type Logger, transports } from 'winston';
const { combine, timestamp, printf, colorize } = format;

const customTimestampFormat = 'YYYY-MM-DD HH:mm:ss';

const customFormat = (prefix: string): ReturnType<typeof printf> =>
  printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}] [${prefix}]: ${message}`;
  });

const createCustomLogger = (prefix?: string): Logger => {
  const loggerPrefix = prefix ?? basename(__filename, '.ts');

  return createLogger({
    level: 'info',
    format: combine(
      timestamp({ format: customTimestampFormat }),
      customFormat(loggerPrefix)
    ),
    transports: [
      new transports.Console({
        format: combine(
          colorize(),
          timestamp({ format: customTimestampFormat }),
          customFormat(loggerPrefix)
        ),
      }),
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' }),
    ],
  });
};

export { createCustomLogger as createLogger };
