document.addEventListener('DOMContentLoaded', () => {
  // BASE DE DATOS DE MATERIALES Y PERFILES (Chile)
  const DATABASE = {
    wood: {
      density: 500,
      grades: [
        { id: "G1", name: "Pino Radiata Estructural G1", f_adm: 105, E: 105000 },
        { id: "G2", name: "Pino Radiata Estructural G2", f_adm: 75, E: 90000 },
        { id: "C24", name: "Madera Aserrada C24", f_adm: 120, E: 110000 }
      ]
    },
    steel: {
      density: 7850,
      f_adm: 1500, // kgf/cm2
      E: 2100000,  // kgf/cm2
      families: {
        tubular_rect: {
          name: "Tubo Rectangular",
          profiles: [
            { id: "tr80x40x2", name: "80 x 40 x 2.0 mm", A: 4.54, Ix: 41.2 },
            { id: "tr100x50x2", name: "100 x 50 x 2.0 mm", A: 5.74, Ix: 83.3 },
            { id: "tr100x50x3", name: "100 x 50 x 3.0 mm", A: 8.44, Ix: 118.0 },
            { id: "tr150x50x3", name: "150 x 50 x 3.0 mm", A: 10.84, Ix: 320.0 }
          ]
        },
        tubular_cuad: {
          name: "Tubo Cuadrado",
          profiles: [
            { id: "tc50x50x2", name: "50 x 50 x 2.0 mm", A: 3.74, Ix: 14.1 },
            { id: "tc75x75x3", name: "75 x 75 x 3.0 mm", A: 8.14, Ix: 68.3 },
            { id: "tc100x100x3", name: "100 x 100 x 3.0 mm", A: 11.44, Ix: 171.0 }
          ]
        },
        costanera: {
          name: "Perfil Costanera C",
          profiles: [
            { id: "c100x50x2", name: "100 x 50 x 15 x 2.0 mm", A: 4.19, Ix: 68.5 },
            { id: "c150x50x2", name: "150 x 50 x 15 x 2.0 mm", A: 5.19, Ix: 178.0 },
            { id: "c150x50x3", name: "150 x 50 x 15 x 3.0 mm", A: 7.56, Ix: 252.0 }
          ]
        }
      }
    }
  };

  // Nodos UI
  const selMaterial = document.getElementById('truss-material');
  const selGrade = document.getElementById('mat-grade');
  const uiDims = document.getElementById('ui-dims');
  const uiSteelFam = document.getElementById('ui-steel-family');
  const uiSteelProf = document.getElementById('ui-steel-profile');
  const selFamily = document.getElementById('steel-family');
  const selProfile = document.getElementById('steel-profile');
  
  const inB = document.getElementById('dim-b');
  const inH = document.getElementById('dim-h');
  
  const inLength = document.getElementById('truss-length');
  const inHeight = document.getElementById('truss-height');
  const inLoad = document.getElementById('load-q');
  const chkWeight = document.getElementById('include-weight');
  const typeTruss = document.getElementById('truss-type');
  const panelsTruss = document.getElementById('truss-panels');
  const defLimit = document.getElementById('deflection-limit');

  // Outputs UI
  const resFChord = document.getElementById('res-force-chord');
  const resFDiag = document.getElementById('res-force-diag');
  const resTension = document.getElementById('res-tension');
  const resAdm = document.getElementById('res-adm-tension');
  const statusRes = document.getElementById('status-resistencia');

  const resFlecha = document.getElementById('res-flecha');
  const resAdmFlecha = document.getElementById('res-adm-flecha');
  const statusFlecha = document.getElementById('status-flecha');

  const canvas = document.getElementById('truss-canvas');
  const ctx = canvas.getContext('2d');

  function initMaterialUI() {
    const mat = selMaterial.value;
    selGrade.innerHTML = '';
    
    if (mat === 'steel') {
      uiDims.style.display = 'none';
      uiSteelFam.style.display = 'flex';
      uiSteelProf.style.display = 'flex';
      
      selGrade.innerHTML = `<option value="A36">Acero A36 (fy=2500)</option>`;
      selFamily.innerHTML = '';
      for (const key in DATABASE.steel.families) {
        selFamily.innerHTML += `<option value="${key}">${DATABASE.steel.families[key].name}</option>`;
      }
      updateProfiles();
    } else {
      uiDims.style.display = 'flex';
      uiSteelFam.style.display = 'none';
      uiSteelProf.style.display = 'none';
      
      DATABASE.wood.grades.forEach(g => {
        selGrade.innerHTML += `<option value="${g.id}">${g.name}</option>`;
      });
    }
    calculateTruss();
  }

  function updateProfiles() {
    const fam = selFamily.value;
    selProfile.innerHTML = '';
    DATABASE.steel.families[fam].profiles.forEach(p => {
      selProfile.innerHTML += `<option value="${p.id}" data-a="${p.A}">${p.name}</option>`;
    });
    calculateTruss();
  }

  function calculateTruss() {
    const L_m = parseFloat(inLength.value) || 10;
    const H_m = parseFloat(inHeight.value) || 1.2;
    const q_user = parseFloat(inLoad.value) || 200; 
    const panels = parseInt(panelsTruss.value) || 6;
    const tType = typeTruss.value;

    let area = 0; // cm2
    let f_adm = 0; // kgf/cm2
    let E_mat = 0; // kgf/cm2
    const mat = selMaterial.value;
    
    if (mat === 'steel') {
      f_adm = DATABASE.steel.f_adm;
      E_mat = DATABASE.steel.E;
      const selectedOption = selProfile.options[selProfile.selectedIndex];
      area = selectedOption ? parseFloat(selectedOption.getAttribute('data-a')) : 5;
    } else {
      const b = parseFloat(inB.value) || 5;
      const h = parseFloat(inH.value) || 10;
      area = b * h;
      const gradeData = DATABASE.wood.grades.find(g => g.id === selGrade.value);
      f_adm = gradeData ? gradeData.f_adm : 75;
      E_mat = gradeData ? gradeData.E : 100000;
    }

    // Carga lineal total
    let q_total = q_user;
    if (chkWeight.checked) {
      const density = mat === 'steel' ? DATABASE.steel.density : DATABASE.wood.density;
      const peso_lineal = (area / 10000) * density;
      q_total += (peso_lineal * 2.8); // Ajuste por diagonal
    }

    // Momento Máximo y Cortante
    const M_max = (q_total * Math.pow(L_m, 2)) / 8; // kgf·m
    const V_max = (q_total * L_m) / 2; // kgf

    let N_chord = 0;
    let N_diag = 0;

    const panel_len = L_m / panels;

    if (tType === 'parallel') {
      // Viga reticulada de cordones paralelos (H constante)
      N_chord = (M_max * 100) / (H_m * 100); // kgf
      const theta = Math.atan((H_m * 100) / (panel_len * 100));
      N_diag = V_max / Math.sin(theta);
    } else {
      // Cerchas triangulares (H en el centro)
      N_chord = (M_max * 100) / (H_m * 100);
      const theta = Math.atan((H_m * 100) / (panel_len * 100));
      N_diag = V_max / Math.sin(theta);
    }

    const N_max = Math.max(N_chord, N_diag);
    const sigma = N_max / area; // kgf/cm2

    // Flecha (Deformación) aprox mediante inercia equivalente Steiner (2 * A * (H/2)^2)
    const H_cm = H_m * 100;
    const I_eq = 2 * area * Math.pow(H_cm / 2, 2); // cm4
    const L_cm = L_m * 100;
    const q_kgcm = q_total / 100;

    const flecha_cm = (5 * q_kgcm * Math.pow(L_cm, 4)) / (384 * E_mat * I_eq);
    const flecha_mm = flecha_cm * 10;

    const limitRatio = parseFloat(defLimit.value) || 300;
    const flecha_adm_mm = (L_cm / limitRatio) * 10;

    // Actualizar pantalla
    resFChord.textContent = N_chord.toFixed(2) + " kgf";
    resFDiag.textContent = N_diag.toFixed(2) + " kgf";
    resTension.textContent = sigma.toFixed(2) + " kgf/cm²";
    resAdm.textContent = f_adm.toFixed(2) + " kgf/cm²";

    resFlecha.textContent = flecha_mm.toFixed(2) + " mm";
    resAdmFlecha.textContent = flecha_adm_mm.toFixed(2) + " mm";

    // Validaciones
    if (sigma <= f_adm) {
      statusRes.innerHTML = '<span style="color:var(--adrawer-green);">CERCHA RESISTE</span>.';
      resTension.style.color = "var(--text-primary)";
    } else {
      statusRes.innerHTML = '<span style="color:var(--adrawer-magenta);">CHERCHA FALLA</span>.';
      resTension.style.color = "var(--adrawer-magenta)";
    }

    if (flecha_mm <= flecha_adm_mm) {
      statusFlecha.innerHTML = '<span style="color:var(--adrawer-green);">CUMPLE FLECHA</span>.';
      resFlecha.style.color = "var(--text-primary)";
    } else {
      statusFlecha.innerHTML = '<span style="color:var(--adrawer-magenta);">DEFORMACIÓN EXCESIVA</span>.';
      resFlecha.style.color = "var(--adrawer-magenta)";
    }

    drawTruss(L_m, H_m, tType, panels);
  }

function drawTruss(L, H, type, panels) {
  const W = canvas.width;
  const CH = canvas.height;
  ctx.clearRect(0, 0, W, CH);

  const margin = 35;
  const drawW = W - margin * 2;
  const drawH = CH - margin * 2;
  
  const scaleX = drawW / L;
  const scaleY = drawH / H;
  const scale = Math.min(scaleX, scaleY); 

  const offsetX = (W - (L * scale)) / 2;
  const offsetY = CH - margin; 
  const panelW = (L * scale) / panels;

  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const colorGreen = '#76ff89';
  const colorCyan = '#83ffff';

  // Identificar topología
  const isPlana = type.includes('plana');
  const basePattern = type.split('_')[0]; // 'howe', 'pratt', 'warren'
  const hasMontantes = type.includes('mod') || basePattern === 'howe' || basePattern === 'pratt';

  // Generar Nodos
  let bN = [], tN = [];
  for (let i = 0; i <= panels; i++) {
    bN.push({ x: offsetX + i * panelW, y: offsetY });
    
    let ptH = H;
    if (!isPlana) {
      ptH = (i <= panels / 2) ? (i / (panels / 2)) * H : ((panels - i) / (panels / 2)) * H;
    }
    tN.push({ x: offsetX + i * panelW, y: offsetY - (ptH * scale) });
  }

  // Dibujar Cuerdas Superior e Inferior
  ctx.strokeStyle = colorGreen;
  ctx.beginPath();
  for (let i = 0; i < panels; i++) {
    ctx.moveTo(bN[i].x, bN[i].y); ctx.lineTo(bN[i+1].x, bN[i+1].y);
    ctx.moveTo(tN[i].x, tN[i].y); ctx.lineTo(tN[i+1].x, tN[i+1].y);
  }
  ctx.stroke();

  // Dibujar Celosía
  ctx.strokeStyle = colorCyan;
  ctx.beginPath();

  // Montantes verticales
  if (hasMontantes) {
    for (let i = 1; i < panels; i++) {
      ctx.moveTo(bN[i].x, bN[i].y);
      ctx.lineTo(tN[i].x, tN[i].y);
    }
  }

  // Diagonales
  const mid = panels / 2;
  for (let i = 0; i < panels; i++) {
    if (basePattern === 'howe' || basePattern === 'pratt') {
      if (i < mid) {
        if (basePattern === 'howe') { ctx.moveTo(bN[i].x, bN[i].y); ctx.lineTo(tN[i+1].x, tN[i+1].y); } 
        else { ctx.moveTo(tN[i].x, tN[i].y); ctx.lineTo(bN[i+1].x, bN[i+1].y); }
      } else {
        if (basePattern === 'howe') { ctx.moveTo(bN[i+1].x, bN[i+1].y); ctx.lineTo(tN[i].x, tN[i].y); } 
        else { ctx.moveTo(tN[i+1].x, tN[i+1].y); ctx.lineTo(bN[i].x, bN[i].y); }
      }
    } else if (basePattern === 'warren') {
      if (i % 2 === 0) {
        ctx.moveTo(bN[i].x, bN[i].y); ctx.lineTo(tN[i+1].x, tN[i+1].y);
      } else {
        ctx.moveTo(tN[i].x, tN[i].y); ctx.lineTo(bN[i+1].x, bN[i+1].y);
      }
    }
  }
  ctx.stroke();
}
  // Listeners
  [selMaterial, selGrade, selFamily, selProfile, inB, inH, inLength, inHeight, inLoad, typeTruss, panelsTruss, chkWeight, defLimit].forEach(el => {
    if (el) {
      el.addEventListener('input', calculateTruss);
      el.addEventListener('change', () => {
        if (el === selMaterial) initMaterialUI();
        if (el === selFamily) updateProfiles();
      });
    }
  });

  initMaterialUI();
});