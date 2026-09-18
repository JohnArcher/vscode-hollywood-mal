import { LogOutputChannel, window } from 'vscode';

/**
 * Shared output channel, visible under View > Output > Hollywood.
 *
 * Tasks and commands both fail silently by nature — an empty task list or a terminal that
 * never opens looks exactly like a broken extension — so every decision is logged here.
 */
let channel: LogOutputChannel | undefined;

export function log(): LogOutputChannel {
  channel ??= window.createOutputChannel('Hollywood', { log: true });
  return channel;
}

export function disposeLog(): void {
  channel?.dispose();
  channel = undefined;
}
