import winston from 'winston';

/**
 * Centralized logger. Console transport only by default so CI log output stays readable;
 * a file transport is added automatically when LOG_TO_FILE=true for local debugging.
 */
const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack ?? message}`;
});

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
  }),
];

if (process.env.LOG_TO_FILE === 'true') {
  transports.push(new winston.transports.File({ filename: 'logs/test-run.log' }));
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: combine(errors({ stack: true }), timestamp()),
  transports,
});

export default logger;
