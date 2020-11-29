import chalk from 'chalk'

export function success(succesLog: string): void {
  console.log(`[${chalk.green('OK')}] > ${succesLog}`)
}

export function error(errorLog: string): void {
  console.log(`[${chalk.red('ERROR')}] > ${errorLog}`)
}

export function warning(warningLog: string): void {
  console.log(`[${chalk.hex('#ff9900').italic('WARNING')}] > ${warningLog}`)
}
