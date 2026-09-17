/**
 * check-definitions — hält IntelliSense-Daten und Syntax-Highlighting synchron.
 *
 * `src/definitions/*.json` (IntelliSense) und `syntaxes/hollywood.tmLanguage.json`
 * (Highlighting) sind zwei voneinander unabhängige Datenquellen. Jede neue Funktion,
 * Konstante und Preproc-Anweisung muss in beiden landen — genau das läuft erfahrungsgemäß
 * bei jedem Hollywood-Major auseinander.
 *
 * Aufruf: npm run check-definitions
 * Exit-Code 1, sobald ein FEHLER gemeldet wird (WARNUNGen sind informativ).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const defDir = join(root, 'src/definitions');
const grammarPath = join(root, 'syntaxes/hollywood.tmLanguage.json');

// ---------------------------------------------------------------------------
// Bewusste Ausnahmen. Jeder Eintrag braucht eine Begründung — sonst gehört er
// nicht hierher, sondern in die Definitionen bzw. ins Grammar.
// ---------------------------------------------------------------------------

/** Steht in den Definitionen, wird im Grammar aber von einer anderen Regel abgedeckt. */
const FUNCTIONS_COVERED_ELSEWHERE = new Set([
  'Return', // repository.keywords, als keyword.control
]);

/**
 * Steht nur im Grammar, nicht in den Definitionen.
 *
 * Aktuell leer: die 16 Altnamen (ApplyPatch, ConsolePrintChr, die vier Coroutinen-
 * Funktionen, DebugStr/DebugVal, die drei Dump*-Funktionen, ForceVideoMode, JoyFire,
 * SetAttribute, SetLayerLight, CreateRainbowBGPic) wurden am 2026-09-16 entfernt —
 * gegen die HW-11-Doku geprüft, keiner davon existiert dort noch. Teilweise umbenannt:
 * ForceVideoMode -> ForceVideoDriver, ConsolePrintChr -> ConsolePrint,
 * DebugStr/DebugVal -> DebugPrint.
 *
 * Neue Einträge hier nur mit Begründung — sonst gehört der Name in die Definitionen.
 */
const FUNCTIONS_GRAMMAR_ONLY = new Set([]);

/** Keine echten Konstanten, sondern Eigenheiten der Hollywood-Doku. */
const CONSTANTS_DOC_ARTIFACTS = new Set([
  'BULLET_XXX',        // Platzhalter in der Doku
  'BULLET_ALPHA',      // Platzhalter in der Doku
  'ATTRRAW',           // Platzhalter: die Doku schreibt "#ATTRRAWxxx" für die ganze Familie
  'DATE_8',            // Aufzählung im Fließtext, keine Konstante
  'USELAYERPOSITON',   // Tippfehler in der Hollywood-Doku statt #USELAYERPOSITION
]);

/**
 * Echte Konstanten, die es in Hollywood 11 aber nicht mehr gibt: im IDE-Export nicht
 * enthalten, in der Doku nur noch bei veralteten Funktionen erwähnt. Nicht nachtragen.
 */
const CONSTANTS_OBSOLETE = new Set([
  'PLAYONCE',   // nur in Beispielen von IsAnimPlaying/WaitAnimEnd, beide seit V1.0 obsolet
  'TYPEWRITER', // DisplayTransitionFX: "no longer supported since V3.1"
]);

// ---------------------------------------------------------------------------

let errors = 0;
let warnings = 0;

const fail = (msg) => { errors++; console.error(`FEHLER   ${msg}`); };
const warn = (msg) => { warnings++; console.warn(`WARNUNG  ${msg}`); };

/** Zerlegt eine match-Regel der Form \b(Eins|Zwei|Drei)\b in ihre Namensliste. */
function alternation(match) {
  const open = match.indexOf('(');
  const close = match.lastIndexOf(')');
  if (open < 0 || close < open) throw new Error(`Unerwartete Regelform: ${match.slice(0, 60)}…`);
  return match.slice(open + 1, close).split('|');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const grammar = readJson(grammarPath);
const rule = (name) => {
  const r = grammar.repository[name]?.patterns?.[0];
  if (!r?.match) throw new Error(`repository.${name}.patterns[0].match nicht gefunden`);
  return r;
};

/** Meldet die Differenz zwischen zwei Namensmengen. */
function compare(label, fromDefs, fromGrammar, { ignoreMissing, ignoreExtra } = {}) {
  const missing = [...fromDefs].filter((n) => !fromGrammar.has(n) && !ignoreMissing?.has(n)).sort();
  const extra = [...fromGrammar].filter((n) => !fromDefs.has(n) && !ignoreExtra?.has(n)).sort();

  console.log(`\n${label}: ${fromDefs.size} in den Definitionen, ${fromGrammar.size} im Grammar`);
  if (!missing.length && !extra.length) {
    console.log('  synchron');
    return;
  }
  if (missing.length) fail(`${label}: ${missing.length} fehlen im Grammar: ${missing.join(', ')}`);
  if (extra.length) fail(`${label}: ${extra.length} stehen nur im Grammar: ${extra.join(', ')}`);
}

/**
 * Regex-Alternationen matchen von links nach rechts, nicht am längsten. Ohne
 * abschließende Wortgrenze verschluckt ein kürzerer Eintrag jeden längeren, der mit ihm
 * beginnt (@ELSE vor @ELSEIF). Diese Prüfung fängt genau diesen Fehler ab.
 */
function checkPrefixSafety(label, ruleName) {
  const { match } = rule(ruleName);
  const names = alternation(match);
  const guarded = match.trimEnd().endsWith('\\b');
  if (guarded) return;

  const collisions = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (names[j].startsWith(names[i])) collisions.push(`"${names[i]}" vor "${names[j]}"`);
    }
  }
  if (collisions.length) {
    fail(`${label}: Regel endet nicht auf \\b, dadurch verdeckte Einträge: ${collisions.join(', ')}`);
  }
}

// --- 1. Funktionen ---------------------------------------------------------

const libraryFiles = readdirSync(defDir).filter((f) => f.endsWith('_library.json'));
const defFunctions = new Set();
for (const file of libraryFiles) {
  for (const entry of readJson(join(defDir, file))) {
    if (entry.name) defFunctions.add(entry.name);
  }
}
compare('Funktionen', defFunctions, new Set(alternation(rule('inbuiltfunctions').match)), {
  ignoreMissing: FUNCTIONS_COVERED_ELSEWHERE,
  ignoreExtra: FUNCTIONS_GRAMMAR_ONLY,
});
checkPrefixSafety('Funktionen', 'inbuiltfunctions');

// --- 2. Preprozessor -------------------------------------------------------

const defPreproc = new Set(readJson(join(defDir, 'preprocessor.json')).map((e) => e.name));
compare('Preprozessor', defPreproc, new Set(alternation(rule('preproc').match)));
checkPrefixSafety('Preprozessor', 'preproc');

// --- 3. Konstanten ---------------------------------------------------------

const defConstants = new Set(
  readJson(join(defDir, 'constants.json')).map((e) => e.name.replace(/^#/, ''))
);
compare('Konstanten', defConstants, new Set(alternation(rule('constants').match)));

// --- 4. In der Doku erwähnte, aber unbekannte Konstanten -------------------
// Findet neue Konstanten automatisch: Hollywood beschreibt sie in den Funktionstexten,
// lange bevor sie jemand in constants.json nachträgt.

const referenced = new Map(); // Konstante -> Set der Fundstellen
const collect = (value, origin) => {
  if (typeof value === 'string') {
    for (const [, name] of value.matchAll(/#([A-Z][A-Z0-9_]+)/g)) {
      if (!referenced.has(name)) referenced.set(name, new Set());
      referenced.get(name).add(origin);
    }
  } else if (Array.isArray(value)) {
    value.forEach((v) => collect(v, origin));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collect(v, origin));
  }
};

for (const file of readdirSync(defDir).filter((f) => f.endsWith('.json') && f !== 'constants.json')) {
  for (const entry of readJson(join(defDir, file))) {
    collect(entry, entry.name ?? file);
  }
}

const unknown = [...referenced.keys()]
  .filter((n) => !defConstants.has(n) && !CONSTANTS_DOC_ARTIFACTS.has(n) && !CONSTANTS_OBSOLETE.has(n))
  .sort();

console.log(`\nIn Doku-Texten erwähnte Konstanten: ${referenced.size} verschieden`);
if (unknown.length) {
  warn(`${unknown.length} davon fehlen in constants.json:`);
  for (const name of unknown) {
    console.warn(`           #${name}  (erwähnt bei: ${[...referenced.get(name)].sort().slice(0, 4).join(', ')})`);
  }
  console.warn('           Vollständigkeit nur über den Konstanten-Export aus der Hollywood-IDE.');
} else {
  console.log('  alle bekannt');
}

// --- Ergebnis --------------------------------------------------------------

console.log(`\n${errors} Fehler, ${warnings} Warnungen.`);
process.exit(errors > 0 ? 1 : 0);
