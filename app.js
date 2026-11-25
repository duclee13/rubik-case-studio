/* Rubik Case Studio — 3x3 Engine, Dual SVG Renderer & Alpha PNG/SVG Exporter */
(() => {
  'use strict';

  // Standard Western color scheme: U=Yellow, D=White, F=Blue, R=Red, B=Green, L=Orange
  const PALETTE_ROUNDED = {
    Y: '#FFEE00',
    W: '#FFFFFF',
    B: '#1D4ED8',
    G: '#00A800',
    R: '#D50000',
    O: '#F57C00',
    X: '#808080',
  };

  const PALETTE_CLASSIC = {
    Y: '#FFFF00',
    W: '#FFFFFF',
    B: '#0000FF',
    G: '#00CC00',
    R: '#FF0000',
    O: '#FF9900',
    X: '#404040',
  };

  const PRESETS = [
    { group: 'H', name: 'H1', alg: "R U R' U R U' R' U R U2 R'" },
    { group: 'H', name: 'H2', alg: "F R U' R' U R U2 R' U' R U R' U' F'" },
    { group: 'H', name: 'H3', alg: "R U R' U R U L' U R' U' L" },
    { group: 'H', name: 'H4', alg: "F R U R' U' R U R' U' R U R' U' F'" },
    { group: 'Pi', name: 'P1', alg: "R U2 R2 U' R2 U' R2 U2 R" },
    { group: 'Pi', name: 'P2', alg: "R' F2 R U2 R U2 R' F2 U' R U' R'" },
    { group: 'Pi', name: 'P3', alg: "R' U' F' R U R' U' R' F R2 U2 R' U2 R" },
    { group: 'Pi', name: 'P4', alg: "R U R' U' R' F R2 U R' U' R U R' U' F'" },
    { group: 'Pi', name: 'P5', alg: "R U' L' U R' U L U L' U L" },
    { group: 'Pi', name: 'P6', alg: "R2 D' R U R' D R U R U' R' U R U R' U R" },
    { group: 'U', name: 'U1', alg: "R' U' R U' R' U2 R2 U R' U R U2 R'" },
    { group: 'U', name: 'U2', alg: "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R" },
    { group: 'U', name: 'U3', alg: "R2 D R' U2 R D' R' U2 R'" },
    { group: 'U', name: 'U4', alg: "F R U' R' U R U R' U R U' R' F'" },
    { group: 'U', name: 'U5', alg: "R2 D' R U2 R' D R U2 R" },
    { group: 'U', name: 'U6', alg: "R2 D' R U R' D R U R U' R' U' R" },
    { group: 'T', name: 'T1', alg: "R U2 R' U' R U' R2 U2 R U R' U R" },
    { group: 'T', name: 'T2', alg: "R' U R U2 R' L' U R U' L" },
    { group: 'T', name: 'T3', alg: "l' U' L U l F' L' F" },
    { group: 'T', name: 'T4', alg: "F R U R' U' R U' R' U' R U R' F'" },
    { group: 'T', name: 'T5', alg: "r U R' U' r' F R F'" },
    { group: 'T', name: 'T6', alg: "R' U R2 D r' U2 r D' R2 U' R" },
    { group: 'L', name: 'L1', alg: "R' U2 R U R' U' R U R' U' R U R' U R" },
    { group: 'L', name: 'L2', alg: "R' U2 R' D' R U2 R' D R2" },
    { group: 'L', name: 'L3', alg: "R U2 R D R' U2 R D' R2" },
    { group: 'L', name: 'L4', alg: "F R' F' r U R U' r'" },
    { group: 'L', name: 'L5', alg: "x R' U R D' R' U' R D x'" },
    { group: 'L', name: 'L6', alg: "R' U' R U R' F' R U R' U' R' F R2" },
  ];

  // --- 3x3 Cube Simulator ---
  function solvedCube() {
    return {
      U: Array(9).fill('Y'),
      D: Array(9).fill('W'),
      F: Array(9).fill('B'),
      B: Array(9).fill('G'),
      L: Array(9).fill('O'),
      R: Array(9).fill('R'),
    };
  }

  function cloneCube(c) {
    return { U: [...c.U], D: [...c.D], F: [...c.F], B: [...c.B], L: [...c.L], R: [...c.R] };
  }

  function rotCW(f) {
    return [f[6], f[3], f[0], f[7], f[4], f[1], f[8], f[5], f[2]];
  }

  function moveOnce(c, m) {
    c = cloneCube(c);
    let t;
    switch (m) {
      case 'U':
        c.U = rotCW(c.U);
        t = c.F.slice(0, 3);
        c.F.splice(0, 3, ...c.R.slice(0, 3));
        c.R.splice(0, 3, ...c.B.slice(0, 3));
        c.B.splice(0, 3, ...c.L.slice(0, 3));
        c.L.splice(0, 3, ...t);
        break;
      case 'D':
        c.D = rotCW(c.D);
        t = c.F.slice(6, 9);
        c.F.splice(6, 3, ...c.L.slice(6, 9));
        c.L.splice(6, 3, ...c.B.slice(6, 9));
        c.B.splice(6, 3, ...c.R.slice(6, 9));
        c.R.splice(6, 3, ...t);
        break;
      case 'R':
        c.R = rotCW(c.R);
        t = [c.U[2], c.U[5], c.U[8]];
        [c.U[2], c.U[5], c.U[8]] = [c.F[2], c.F[5], c.F[8]];
        [c.F[2], c.F[5], c.F[8]] = [c.D[2], c.D[5], c.D[8]];
        [c.D[2], c.D[5], c.D[8]] = [c.B[6], c.B[3], c.B[0]];
        [c.B[6], c.B[3], c.B[0]] = t;
        break;
      case 'L':
        c.L = rotCW(c.L);
        t = [c.U[0], c.U[3], c.U[6]];
        [c.U[0], c.U[3], c.U[6]] = [c.B[8], c.B[5], c.B[2]];
        [c.B[8], c.B[5], c.B[2]] = [c.D[0], c.D[3], c.D[6]];
        [c.D[0], c.D[3], c.D[6]] = [c.F[0], c.F[3], c.F[6]];
        [c.F[0], c.F[3], c.F[6]] = t;
        break;
      case 'F':
        c.F = rotCW(c.F);
        t = [c.U[6], c.U[7], c.U[8]];
        [c.U[6], c.U[7], c.U[8]] = [c.L[8], c.L[5], c.L[2]];
        [c.L[8], c.L[5], c.L[2]] = [c.D[2], c.D[1], c.D[0]];
        [c.D[2], c.D[1], c.D[0]] = [c.R[0], c.R[3], c.R[6]];
        [c.R[0], c.R[3], c.R[6]] = t;
        break;
      case 'B':
        c.B = rotCW(c.B);
        t = [c.U[0], c.U[1], c.U[2]];
        [c.U[0], c.U[1], c.U[2]] = [c.R[2], c.R[5], c.R[8]];
        [c.R[2], c.R[5], c.R[8]] = [c.D[8], c.D[7], c.D[6]];
        [c.D[8], c.D[7], c.D[6]] = [c.L[6], c.L[3], c.L[0]];
        [c.L[6], c.L[3], c.L[0]] = t;
        break;
      case 'M':
        t = [c.U[1], c.U[4], c.U[7]];
        [c.U[1], c.U[4], c.U[7]] = [c.B[7], c.B[4], c.B[1]];
        [c.B[7], c.B[4], c.B[1]] = [c.D[1], c.D[4], c.D[7]];
        [c.D[1], c.D[4], c.D[7]] = [c.F[1], c.F[4], c.F[7]];
        [c.F[1], c.F[4], c.F[7]] = t;
        break;
      case 'E':
        t = [c.F[3], c.F[4], c.F[5]];
        [c.F[3], c.F[4], c.F[5]] = [c.L[3], c.L[4], c.L[5]];
        [c.L[3], c.L[4], c.L[5]] = [c.B[3], c.B[4], c.B[5]];
        [c.B[3], c.B[4], c.B[5]] = [c.R[3], c.R[4], c.R[5]];
        [c.R[3], c.R[4], c.R[5]] = t;
        break;
      case 'S':
        t = [c.U[3], c.U[4], c.U[5]];
        [c.U[3], c.U[4], c.U[5]] = [c.L[7], c.L[4], c.L[1]];
        [c.L[7], c.L[4], c.L[1]] = [c.D[5], c.D[4], c.D[3]];
        [c.D[5], c.D[4], c.D[3]] = [c.R[1], c.R[4], c.R[7]];
        [c.R[1], c.R[4], c.R[7]] = t;
        break;
      case 'r': c = moveOnce(c, 'R'); c = moveOnce(c, 'M'); c = moveOnce(c, 'M'); c = moveOnce(c, 'M'); break;
      case 'l': c = moveOnce(c, 'L'); c = moveOnce(c, 'M'); break;
      case 'u': c = moveOnce(c, 'U'); c = moveOnce(c, 'E'); c = moveOnce(c, 'E'); c = moveOnce(c, 'E'); break;
      case 'd': c = moveOnce(c, 'D'); c = moveOnce(c, 'E'); break;
      case 'f': c = moveOnce(c, 'F'); c = moveOnce(c, 'S'); break;
      case 'b': c = moveOnce(c, 'B'); c = moveOnce(c, 'S'); c = moveOnce(c, 'S'); c = moveOnce(c, 'S'); break;
      case 'x':
        c = moveOnce(c, 'R');
        c = moveOnce(c, 'M'); c = moveOnce(c, 'M'); c = moveOnce(c, 'M');
        c = moveOnce(c, 'L'); c = moveOnce(c, 'L'); c = moveOnce(c, 'L');
        break;
      case 'y':
        c = moveOnce(c, 'U');
        c = moveOnce(c, 'E'); c = moveOnce(c, 'E'); c = moveOnce(c, 'E');
        c = moveOnce(c, 'D'); c = moveOnce(c, 'D'); c = moveOnce(c, 'D');
        break;
      case 'z':
        c = moveOnce(c, 'F');
        c = moveOnce(c, 'S');
        c = moveOnce(c, 'B'); c = moveOnce(c, 'B'); c = moveOnce(c, 'B');
        break;
      default: break;
    }
    return c;
  }

  function expandParens(str) {
    let s = str.replace(/[’`]/g, "'");
    let guard = 0;
    while (/\([^()]+\)\d*/.test(s) && guard++ < 20) {
      s = s.replace(/\(([^()]+)\)(\d*)/g, (_, inner, count) => {
        const n = count ? Math.min(parseInt(count, 10), 12) : 1;
        return Array(n).fill(inner.trim()).join(' ');
      });
    }
    return s;
  }

  function parseTokens(alg) {
    const clean = expandParens(alg);
    const regex = /([URFDLBMESurfdlbxyz])([2']?)/g;
    const tokens = [];
    let m;
    while ((m = regex.exec(clean)) !== null) {
      tokens.push({ base: m[1], mod: m[2] });
    }
    return tokens;
  }

  function invertTokens(tokens) {
    return tokens.slice().reverse().map(t => ({
      base: t.base,
      mod: t.mod === "'" ? '' : (t.mod === '2' ? '2' : "'"),
    }));
  }

  function applyTokens(cube, tokens) {
    let c = cube;
    for (const t of tokens) {
      const n = t.mod === '2' ? 2 : (t.mod === "'" ? 3 : 1);
      for (let i = 0; i < n; i++) c = moveOnce(c, t.base);
    }
    return c;
  }

  function extractTopView(c, mask) {
    const s = {
      U0: c.U[0], U1: c.U[1], U2: c.U[2],
      U3: c.U[3], U4: c.U[4], U5: c.U[5],
      U6: c.U[6], U7: c.U[7], U8: c.U[8],
      B0: c.B[2], B1: c.B[1], B2: c.B[0],
      F0: c.F[0], F1: c.F[1], F2: c.F[2],
      L0: c.L[0], L1: c.L[1], L2: c.L[2],
      R0: c.R[2], R1: c.R[1], R2: c.R[0],
    };
    if (mask === 'coll') {
      s.B1 = 'X'; s.F1 = 'X'; s.L1 = 'X'; s.R1 = 'X';
    } else if (mask === 'oll') {
      for (const k of Object.keys(s)) {
        if (s[k] !== 'Y') s[k] = 'X';
      }
    }
    return s;
  }

  // --- Rounded Path Helper (per-corner radii) ---
  function roundedRectPath(x, y, w, h, tl, tr, br, bl) {
    return [
      `M ${x + tl} ${y}`,
      `H ${x + w - tr}`,
      tr ? `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr}` : `L ${x + w} ${y}`,
      `V ${y + h - br}`,
      br ? `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h}` : `L ${x + w} ${y + h}`,
      `H ${x + bl}`,
      bl ? `A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl}` : `L ${x} ${y + h}`,
      `V ${y + tl}`,
      tl ? `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}` : `L ${x} ${y}`,
      'Z',
    ].join(' ');
  }

  // --- SVG Renderer 1: Modern Rounded (Florian Speedcube style matching image_8d93a1.png) ---
  function renderRoundedSVG(stickers, size = 320) {
    const P = PALETTE_ROUNDED;
    // Coordinate space: 300x300, strictly transparent background
    // Center 3x3 black housing: x=46..254, y=46..254 (208x208)
    // Side black housings:
    // Top: x=46..254, y=14..46 (h=32)
    // Bottom: x=46..254, y=254..286 (h=32)
    // Left: x=14..46, y=46..254 (w=32)
    // Right: x=254..286, y=46..254 (w=32)
    const parts = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${size}" height="${size}">`,
      // Black base housings (no background rect!)
      '<rect x="46" y="46" width="208" height="208" fill="#000000"/>',
      '<rect x="46" y="14" width="208" height="32" fill="#000000"/>',
      '<rect x="46" y="254" width="208" height="32" fill="#000000"/>',
      '<rect x="14" y="46" width="32" height="208" fill="#000000"/>',
      '<rect x="254" y="46" width="32" height="208" fill="#000000"/>',
    ];

    // 3x3 U stickers (each 60x60, gap=8, offset=52)
    // Inner corners towards center get Florian radius = 17, outer corners = 2
    const F = 17;
    const S = 2.5;
    const radiiMap = [
      [S, S, F, S], // U0 (TL)
      [S, S, F, F], // U1 (T)
      [S, S, S, F], // U2 (TR)
      [S, F, F, S], // U3 (L)
      [F, F, F, F], // U4 (C)
      [F, S, S, F], // U5 (R)
      [S, F, S, S], // U6 (BL)
      [F, F, S, S], // U7 (B)
      [F, S, S, S], // U8 (BR)
    ];

    for (let idx = 0; idx < 9; idx++) {
      const r = Math.floor(idx / 3);
      const col = idx % 3;
      const x = 52 + col * 68;
      const y = 52 + r * 68;
      const [tl, tr, br, bl] = radiiMap[idx];
      const key = `U${idx}`;
      const d = roundedRectPath(x, y, 60, 60, tl, tr, br, bl);
      parts.push(`<path data-sticker="${key}" d="${d}" fill="${P[stickers[key]]}"/>`);
    }

    // Side strips (60x22 or 22x60, rx=4)
    const sideSpecs = [
      // Top (B0, B1, B2)
      ['B0', 52, 19, 60, 22], ['B1', 120, 19, 60, 22], ['B2', 188, 19, 60, 22],
      // Bottom (F0, F1, F2)
      ['F0', 52, 259, 60, 22], ['F1', 120, 259, 60, 22], ['F2', 188, 259, 60, 22],
      // Left (L0, L1, L2)
      ['L0', 19, 52, 22, 60], ['L1', 19, 120, 22, 60], ['L2', 19, 188, 22, 60],
      // Right (R0, R1, R2)
      ['R0', 259, 52, 22, 60], ['R1', 259, 120, 22, 60], ['R2', 259, 188, 22, 60],
    ];
    for (const [key, x, y, w, h] of sideSpecs) {
      parts.push(`<rect data-sticker="${key}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4.5" fill="${P[stickers[key]]}"/>`);
    }

    parts.push('</svg>');
    return parts.join('');
  }

  // --- SVG Renderer 2: Classic Trapezoid (J Perm style matching image_8d9669.png) ---
  function renderClassicSVG(stickers, size = 320) {
    const P = PALETTE_CLASSIC;
    // Coordinate space: 300x300, strictly transparent background
    // 3x3 grid: x=54..246, y=54..246 (cell = 64, stroke = 5)
    const parts = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${size}" height="${size}">`,
    ];

    const sw = 4.5;
    const stroke = '#000000';

    // Trapezoidal side strips (outer edges taper inward by 10px)
    const sidePolys = [
      // Back (top)
      ['B0', '54,48 116,48 116,22 64,22'],
      ['B1', '120,48 180,48 180,22 120,22'],
      ['B2', '184,48 246,48 236,22 184,22'],
      // Front (bottom)
      ['F0', '54,252 116,252 116,278 64,278'],
      ['F1', '120,252 180,252 180,278 120,278'],
      ['F2', '184,252 246,252 236,278 184,278'],
      // Left
      ['L0', '48,54 48,116 22,116 22,64'],
      ['L1', '48,120 48,180 22,180 22,120'],
      ['L2', '48,184 48,246 22,236 22,184'],
      // Right
      ['R0', '252,54 252,116 278,116 278,64'],
      ['R1', '252,120 252,180 278,180 278,120'],
      ['R2', '252,184 252,246 278,236 278,184'],
    ];

    for (const [key, pts] of sidePolys) {
      parts.push(`<polygon data-sticker="${key}" points="${pts}" fill="${P[stickers[key]]}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`);
    }

    // 3x3 U face squares
    for (let idx = 0; idx < 9; idx++) {
      const r = Math.floor(idx / 3);
      const col = idx % 3;
      const x = 54 + col * 64;
      const y = 54 + r * 64;
      const key = `U${idx}`;
      parts.push(`<rect data-sticker="${key}" x="${x}" y="${y}" width="64" height="64" fill="${P[stickers[key]]}" stroke="${stroke}" stroke-width="${sw}"/>`);
    }

    parts.push('</svg>');
    return parts.join('');
  }

  // --- App State ---
  const state = {
    algMode: 'invert',
    mask: 'coll',
    paintColor: 'Y',
    stickers: {},
    customPainted: false,
  };

  // --- DOM Elements ---
  const algInput = document.getElementById('algInput');
  const clearAlgBtn = document.getElementById('clearAlgBtn');
  const presetSelect = document.getElementById('presetSelect');
  const maskSelect = document.getElementById('maskSelect');
  const resetCubeBtn = document.getElementById('resetCubeBtn');
  const paletteEl = document.getElementById('palette');
  const fileNameInput = document.getElementById('fileNameInput');
  const sizeSelect = document.getElementById('sizeSelect');
  const stageRounded = document.getElementById('stageRounded');
  const stageClassic = document.getElementById('stageClassic');
  const themeToggle = document.getElementById('themeToggle');
  const toastEl = document.getElementById('toast');

  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  function populatePresets() {
    const groups = [...new Set(PRESETS.map(p => p.group))];
    for (const g of groups) {
      const og = document.createElement('optgroup');
      og.label = `Nhóm ${g}`;
      for (const p of PRESETS.filter(x => x.group === g)) {
        const opt = document.createElement('option');
        opt.value = p.name;
        opt.textContent = `${p.name} — ${p.alg}`;
        og.appendChild(opt);
      }
      presetSelect.appendChild(og);
    }
  }

  function computeFromAlg() {
    const tokens = parseTokens(algInput.value);
    const run = state.algMode === 'invert' ? invertTokens(tokens) : tokens;
    const cube = applyTokens(solvedCube(), run);
    state.stickers = extractTopView(cube, state.mask);
    state.customPainted = false;
    renderStages();
  }

  function renderStages() {
    stageRounded.innerHTML = renderRoundedSVG(state.stickers, 300);
    stageClassic.innerHTML = renderClassicSVG(state.stickers, 300);
  }

  function handleStickerClick(e) {
    const el = e.target.closest('[data-sticker]');
    if (!el) return;
    const key = el.getAttribute('data-sticker');
    state.stickers[key] = state.paintColor;
    state.customPainted = true;
    renderStages();
  }

  // --- Transparent PNG & SVG Export (Windows + iOS Safari safe) ---
  function svgToTransparentPngBlob(svgMarkup, px) {
    return new Promise((resolve, reject) => {
      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = px;
        canvas.height = px;
        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.clearRect(0, 0, px, px); // Strictly 100% transparent alpha channel
        ctx.drawImage(img, 0, 0, px, px);
        URL.revokeObjectURL(url);
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('PNG export failed'));
        }, 'image/png');
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  async function saveBlob(blob, filename) {
    // On iOS Safari, Web Share API with File preserves PNG alpha transparency directly into Photos/Files
    if (isIOS() && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
          return;
        }
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function cleanFileName() {
    const raw = (fileNameInput.value || 'rubik-case').trim();
    return raw.replace(/[^a-zA-Z0-9_-]+/g, '-') || 'rubik-case';
  }

  async function exportSingle(style, format) {
    const px = parseInt(sizeSelect.value, 10) || 1024;
    const base = cleanFileName();
    const svg = style === 'rounded'
      ? renderRoundedSVG(state.stickers, px)
      : renderClassicSVG(state.stickers, px);

    if (format === 'svg') {
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      await saveBlob(blob, `${base}-${style}.svg`);
      showToast(`Đã tải ${base}-${style}.svg`);
    } else {
      const blob = await svgToTransparentPngBlob(svg, px);
      await saveBlob(blob, `${base}-${style}.png`);
      showToast(`Đã tải ${base}-${style}.png (${px}×${px}, nền trong suốt)`);
    }
  }

  async function copyPng(style) {
    try {
      const px = parseInt(sizeSelect.value, 10) || 1024;
      const svg = style === 'rounded'
        ? renderRoundedSVG(state.stickers, px)
        : renderClassicSVG(state.stickers, px);
      const blob = await svgToTransparentPngBlob(svg, px);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('Đã sao chép ảnh PNG nền trong suốt');
    } catch {
      showToast('Trình duyệt không hỗ trợ sao chép ảnh trực tiếp');
    }
  }

  // --- Theme ---
  function initTheme() {
    const saved = localStorage.getItem('rcs-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('rcs-theme', next);
  });

  // --- Event Listeners ---
  document.querySelectorAll('[data-alg-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-alg-mode]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.algMode = btn.dataset.algMode;
      computeFromAlg();
    });
  });

  algInput.addEventListener('input', () => {
    presetSelect.value = '';
    computeFromAlg();
  });

  clearAlgBtn.addEventListener('click', () => {
    algInput.value = '';
    presetSelect.value = '';
    computeFromAlg();
    algInput.focus();
  });

  presetSelect.addEventListener('change', () => {
    const found = PRESETS.find(p => p.name === presetSelect.value);
    if (!found) return;
    algInput.value = found.alg;
    fileNameInput.value = `coll-${found.name.toLowerCase()}`;
    state.algMode = 'invert';
    document.querySelectorAll('[data-alg-mode]').forEach(b => {
      b.classList.toggle('active', b.dataset.algMode === 'invert');
    });
    computeFromAlg();
  });

  maskSelect.addEventListener('change', () => {
    state.mask = maskSelect.value;
    computeFromAlg();
  });

  document.querySelectorAll('[data-auf]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.auf;
      const cur = algInput.value.trim();
      algInput.value = cur ? `${m} ${cur}` : m;
      computeFromAlg();
    });
  });

  resetCubeBtn.addEventListener('click', () => {
    algInput.value = '';
    presetSelect.value = '';
    fileNameInput.value = 'rubik-case';
    computeFromAlg();
    showToast('Đã đặt lại trạng thái');
  });

  paletteEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.swatch');
    if (!btn) return;
    paletteEl.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    state.paintColor = btn.dataset.color;
  });

  stageRounded.addEventListener('click', handleStickerClick);
  stageClassic.addEventListener('click', handleStickerClick);

  document.querySelectorAll('[data-dl]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [style, fmt] = btn.dataset.dl.split('-');
      exportSingle(style, fmt);
    });
  });

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => copyPng(btn.dataset.copy));
  });

  document.getElementById('downloadBothPngBtn').addEventListener('click', async () => {
    await exportSingle('rounded', 'png');
    await new Promise(r => setTimeout(r, 250));
    await exportSingle('classic', 'png');
  });

  document.getElementById('downloadBothSvgBtn').addEventListener('click', async () => {
    await exportSingle('rounded', 'svg');
    await new Promise(r => setTimeout(r, 250));
    await exportSingle('classic', 'svg');
  });

  // Init
  initTheme();
  populatePresets();
  computeFromAlg();
})();
