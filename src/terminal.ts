import { ChildProcess, spawn } from 'child_process';
import { basename } from 'path';
import { EventEmitter, Pseudoterminal, window } from 'vscode';
import { log } from './log';

/** One reusable terminal, so repeated runs do not pile up. */
const TERMINAL_NAME = 'Hollywood';

/** Dim text, for the lines this extension adds around the compiler's own output. */
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

/** A terminal expects CRLF; a plain \n would only move the cursor down one row. */
function forTerminal(chunk: Buffer): string {
  return chunk.toString('utf8').replace(/\r?\n/g, '\r\n');
}

/**
 * Runs the compiler in a terminal and leaves the terminal open afterwards.
 *
 * The process is spawned directly rather than typed into a shell, so paths with spaces
 * need no quoting and the behaviour does not depend on whether the user runs cmd,
 * PowerShell or a POSIX shell.
 *
 * It drives a `Pseudoterminal` instead of being passed as the terminal's `shellPath`:
 * with a shellPath the compiler *is* the shell, so the terminal is disposed the moment it
 * exits — taking the error message with it. Here the close event is never fired, so the
 * output stays until the user closes the terminal.
 */
export function runInHollywoodTerminal(exePath: string, args: string[], cwd: string | undefined): void {
  window.terminals.find(terminal => terminal.name === TERMINAL_NAME)?.dispose();

  const writeEmitter = new EventEmitter<string>();
  let child: ChildProcess | undefined;
  let closed = false;

  /** Nothing is written once the terminal is gone, so a late event cannot revive it. */
  const write = (text: string) => {
    if (!closed) {
      writeEmitter.fire(text);
    }
  };

  const pty: Pseudoterminal = {
    onDidWrite: writeEmitter.event,

    open: () => {
      write(`${DIM}> ${exePath} ${args.join(' ')}${RESET}\r\n\r\n`);
      log().info(`Started (cwd ${cwd ?? '(none)'}): ${exePath} ${args.join(' ')}`);

      child = spawn(exePath, args, { cwd });
      child.stdout?.on('data', (chunk: Buffer) => write(forTerminal(chunk)));
      child.stderr?.on('data', (chunk: Buffer) => write(forTerminal(chunk)));

      child.on('error', error => {
        write(`\r\n${DIM}Could not start ${exePath}: ${error.message}${RESET}\r\n`);
        log().error(`Could not start ${exePath}: ${error.message}`);
      });

      // Deliberately no onDidClose: the terminal stays so the output can be read. What
      // bounds this is that every run disposes the previous Hollywood terminal, which
      // calls close() below — so only ever one terminal, one emitter, one process.
      child.on('close', code => {
        write(`\r\n${DIM}[${basename(exePath)} finished with exit code ${code ?? 0}]${RESET}\r\n`);
        log().info(`${basename(exePath)} finished with exit code ${code ?? 0}.`);
        // The process is done; nothing here needs to hold on to it any longer.
        child = undefined;
      });
    },

    close: () => {
      closed = true;
      child?.kill();
      child = undefined;
      writeEmitter.dispose();
    }
  };

  const terminal = window.createTerminal({ name: TERMINAL_NAME, pty });
  terminal.show(true);
}
