'use strict';

// Parser CSV mínimo, sin dependencias, compatible con el export estándar de Google Sheets:
// separador coma, campos entre comillas dobles cuando contienen comas/comillas/saltos de línea,
// comillas internas escapadas duplicándolas (""), líneas terminadas en \r\n o \n.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, ''); // strip BOM si lo trae el export

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const next = src[i + 1];

    if (inQuotes) {
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

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
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

// Convierte filas CSV (primera fila = cabecera) en objetos { columna: valor }
function csvToObjects(text) {
  const rows = parseCSV(text);
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

module.exports = { parseCSV, csvToObjects };
