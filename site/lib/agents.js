'use strict';

// Reglas de datos de agentes — Sección 2 del encargo. NO NEGOCIABLE.
// Cualquier cambio aquí debe venir de una instrucción explícita de Iván, nunca de un dato de la hoja.

const CONFIRMED = {
  usfans: { display: 'USFans', code: 'RCGD5Y' },
  litbuy: { display: 'Litbuy', code: 'YBMHFG55L' },
  superbuy: { display: 'Superbuy', code: 'Ey3NrI' },
  mulebuy: { display: 'Mulebuy', code: '200642502' },
  oopbuy: { display: 'Oopbuy', code: 'GH40R4J0O' },
};

// Kakobuy: código forzado, no condicionado a lo que traiga la hoja. Enlace fijo, sin plantilla
// de producto (no hay una plantilla de Kakobuy confirmada contra la hoja real — ver DISCOVERY.md §5).
const KAKOBUY_FORCED = {
  display: 'Kakobuy',
  code: 'FINDSES',
  url: 'https://ikako.vip/r/FINDSES',
};

// Exclusión permanente. Aparezca lo que aparezca en la hoja, nunca se publican.
const PERMANENTLY_EXCLUDED = new Set(['joyagoo', 'cnfans']);

// Condicionales: se publican solo si el código que trae la hoja coincide EXACTO con el valor
// "visto hoy" documentado en el encargo. Si no coincide o no hay fila en la hoja, se excluyen.
const CONDITIONAL = {
  allchinabuy: { display: 'AllChinaBuy', expectedCode: 'ELEwZR' },
  hipobuy: { display: 'Hipobuy', expectedCode: 'YZKOGE9NE' },
  acbuy: { display: 'ACBuy', expectedCode: 'UD3WIU' },
};

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Intenta extraer el código de referido de una URL de agente probando los formatos de parámetro
// conocidos en el código fuente de la app (src/utils/agentLinks.ts) y en las filas reales de la hoja.
function extractCode(url) {
  if (!url) return null;
  const patterns = [
    /[?&]inviteCode=([^&]+)/i,
    /[?&]ref=([^&]+)/i,
    /[?&]partnercode=([^&]+)/i,
    /[?&]affcode=([^&]+)/i,
    /[?&]u=([^&]+)/i,
    /[?&]code=([^&]+)/i,
    /ikako\.vip\/r\/([^/?]+)/i,
    /ikako\.vip\/([^/?]+)/i,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}

function isVisible(mostrarValue) {
  const v = String(mostrarValue || '').trim().toUpperCase();
  if (v === '') return true; // igual que la app: vacío = mostrar
  return ['TRUE', 'SI', 'SÍ', 'YES', 'VERDADERO', '1'].includes(v);
}

// Sustituye el ID de producto de ejemplo embebido en una plantilla de enlace por el ID real,
// replicando exactamente la lógica de app/(tabs)/validar.tsx (líneas 657-663):
// agent.linkFormat.match(/(\d{5,})/) -> reemplaza esa cadena por el productId real.
function buildProductLink(linkFormatTemplate, realWeidianId) {
  if (!linkFormatTemplate || !realWeidianId) return null;
  const match = linkFormatTemplate.match(/(\d{5,})/);
  if (!match) return null;
  return linkFormatTemplate.replace(match[1], realWeidianId);
}

/**
 * Valida una fila de agente (de data/agents.csv o data/validar.csv) contra las reglas no
 * negociables de la Sección 2. No decide "publicar de todas formas": si hay conflicto, excluye
 * y registra el motivo para el informe de verificación.
 *
 * @param {string} rawName - nombre del agente tal como viene en la fila de la hoja
 * @param {string} urlWithCode - una URL de esa fila que contenga el código de referido (register o productLink o formato de link)
 * @returns {{ publish: boolean, display: string|null, code: string|null, reason: string, conflict: boolean }}
 */
function validateAgentRow(rawName, urlWithCode) {
  const key = normalizeName(rawName);

  if (PERMANENTLY_EXCLUDED.has(key)) {
    return { publish: false, display: null, code: null, reason: `Exclusión permanente (${rawName})`, conflict: false };
  }

  if (key === 'kakobuy') {
    const sheetCode = extractCode(urlWithCode);
    const conflict = sheetCode && sheetCode !== KAKOBUY_FORCED.code;
    return {
      publish: true,
      display: KAKOBUY_FORCED.display,
      code: KAKOBUY_FORCED.code,
      forcedUrl: KAKOBUY_FORCED.url,
      reason: conflict
        ? `Código forzado a ${KAKOBUY_FORCED.code} por instrucción no-negociable; la hoja/código fuente trae "${sheetCode}" (conflicto de 3 vías, ver DISCOVERY.md §5)`
        : `Código forzado a ${KAKOBUY_FORCED.code} por instrucción no-negociable`,
      conflict: !!conflict,
    };
  }

  if (CONFIRMED[key]) {
    const expected = CONFIRMED[key];
    const sheetCode = extractCode(urlWithCode);
    if (sheetCode && sheetCode !== expected.code) {
      return {
        publish: false,
        display: expected.display,
        code: null,
        reason: `CONFLICTO CRÍTICO: la hoja trae código "${sheetCode}" para ${expected.display}, pero el código no-negociable es "${expected.code}". No se publica. Revisar con Iván.`,
        conflict: true,
      };
    }
    return {
      publish: true,
      display: expected.display,
      code: expected.code,
      reason: 'Coincide con el código no-negociable',
      conflict: false,
    };
  }

  if (CONDITIONAL[key]) {
    const expected = CONDITIONAL[key];
    const sheetCode = extractCode(urlWithCode);
    if (sheetCode === expected.expectedCode) {
      return {
        publish: true,
        display: expected.display,
        code: expected.expectedCode,
        reason: `Código de la hoja coincide con el valor "visto hoy" (${expected.expectedCode})`,
        conflict: false,
      };
    }
    return {
      publish: false,
      display: expected.display,
      code: null,
      reason: `Sin confirmar: la hoja trae "${sheetCode || '(sin código detectado)'}", no coincide con el valor "visto hoy" (${expected.expectedCode}). No se publica sin confirmación explícita de Iván.`,
      conflict: true,
    };
  }

  // Agente no listado en absoluto en la Sección 2 del encargo (ej. SUGARGOO visto oculto en la hoja).
  return {
    publish: false,
    display: rawName,
    code: null,
    reason: `Agente "${rawName}" no está en la tabla no-negociable de la Sección 2 — no se publica sin instrucción explícita.`,
    conflict: false,
  };
}

module.exports = {
  CONFIRMED,
  KAKOBUY_FORCED,
  PERMANENTLY_EXCLUDED,
  CONDITIONAL,
  normalizeName,
  extractCode,
  isVisible,
  buildProductLink,
  validateAgentRow,
};
