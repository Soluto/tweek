/*eslint no-console: 0*/
import { red, green } from 'cli-color'

function logWithColor(color, msgs) {
  console.log(...[ color('[tweek-editor]') ].concat(msgs))
}

export function log(...msgs) {
  console.log(...[ '[tweek-editor]' ].concat(msgs))
}

export function logError(...msgs) {
  logWithColor(red, msgs)
}

export function logTask(...msgs) {
  logWithColor(green, msgs)
}