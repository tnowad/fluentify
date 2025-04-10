type LogLevel = "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG" | "LOG";

interface LoggerContext {
  scope?: string;
}

export class Logger {
  private context: LoggerContext;
  private loggerName: string;

  constructor(loggerName: string, context: LoggerContext = {}) {
    this.loggerName = loggerName;
    this.context = context;
  }

  private getTimestamp(): string {
    const date = new Date();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();

    let hh = date.getHours();
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    const isPM = hh >= 12;

    hh = hh % 12 || 12;
    const hhStr = String(hh).padStart(1, " ");

    const period = isPM ? "PM" : "AM";

    return `${MM}/${dd}/${yyyy}, ${hhStr}:${mm}:${ss} ${period}`;
  }

  private logMessage(level: LogLevel, message: string, ...data: any[]): void {
    const timestamp = this.getTimestamp();
    const levelStr = level.padStart(7, " ");
    const loggerStr = `[${this.loggerName}${
      this.context.scope ? `:${this.context.scope}` : ""
    }]`;
    const enviroment = (
      typeof window == "undefined" ? "server" : "client"
    ).padEnd(5, " ");

    const formattedMessage = `[Next] ${enviroment} - ${timestamp} ${levelStr} ${loggerStr} ${message}`;

    const logMethod = {
      FATAL: console.error,
      ERROR: console.error,
      WARN: console.warn,
      INFO: console.info,
      DEBUG: console.debug,
      LOG: console.log,
    }[level];

    logMethod(formattedMessage, ...data);
  }

  public fatal(message: string, ...data: any[]): void {
    this.logMessage("FATAL", message, ...data);
  }

  public error(message: string, ...data: any[]): void {
    this.logMessage("ERROR", message, ...data);
  }

  public warn(message: string, ...data: any[]): void {
    this.logMessage("WARN", message, ...data);
  }

  public info(message: string, ...data: any[]): void {
    this.logMessage("INFO", message, ...data);
  }

  public debug(message: string, ...data: any[]): void {
    this.logMessage("DEBUG", message, ...data);
  }

  public log(message: string, ...data: any[]): void {
    this.logMessage("LOG", message, ...data);
  }

  public child(additionalContext: LoggerContext): Logger {
    return new Logger(this.loggerName, {
      ...this.context,
      ...additionalContext,
    });
  }
}

export const logger = new Logger("RootLogger");
