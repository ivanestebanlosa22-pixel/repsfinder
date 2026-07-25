'use strict';

// Parser CSV/TSV sin dependencias, compatible con los exports reales de Google Sheets:
// - CSV (coma): RFC4180 — campos entre comillas dobles cuando contienen comas/comillas/saltos de
//   línea, comillas internas escapadas duplicándolas (""). Google Sheets → Archivo → Descargar → CSV.
// - TSV (tabulador): sin comillas de escape — un tabulador o salto de línea literal SIEMPRE separa
//   campos/filas, y un `"` dentro de una celda es texto literal (nunca inicia una cita). Google
//   Sheets → Archivo → Descargar → TSV, o pegar un rango copiado desde Sheets.
// El delimitador se autodetecta por archivo: si la primera línea contiene un tabulador, se trata
// como TSV; si no, como CSV.

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  return firstLine.includes('\t') ? '\t' : ',';
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const useQuotes = delimiter === ','; // en TSV las comillas son texto literal, nunca escape
  const src = text.replace(/^﻿/, ''); // strip BOM si lo trae el export

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const next = src[i + 1];

    if (useQuotes && inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (useQuotes && c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // ignorado, \n lo cierra
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  // última celda/fila si el archivo no termina en salto de línea
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function parseCSV(text, delimiter) {
  return parseDelimited(text, delimiter || detectDelimiter(text));
}

// Convierte filas CSV/TSV (primera fila = cabecera) en objetos { columna: valor }
function csvToObjects(text, delimiter) {
  const rows = parseCSV(text, delimiter);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((key, i) => {
      obj[key] = (r[i] ?? '').trim();
    });
    return obj;
  });
}

module.exports = { parseCSV, csvToObjects, detectDelimiter };
