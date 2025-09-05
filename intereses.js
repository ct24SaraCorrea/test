// intereses.js - Test de Intereses Vocacionales
(function(){
  const steps = [...document.querySelectorAll('.step')];
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const calcBtn = document.getElementById('calc');
  const fill = document.getElementById('fill');
  const ptext = document.getElementById('ptext');
  const resultados = document.getElementById('resultados');
  const totalesEl = document.getElementById('totales');
  const top3El = document.getElementById('top3');

  const saveBtn = document.getElementById('save');
  const loadBtn = document.getElementById('load');
  const clearBtn = document.getElementById('clear');
  const downloadBtn = document.getElementById('download');

  const NUM_STEPS = steps.length;
  let idx = 0;

  // Inicializa selects 10..1
  steps.forEach(step=>{
    const selects = step.querySelectorAll('select');
    selects.forEach(sel=>{
      sel.innerHTML = '<option value="">—</option>' + Array.from({length:10},(_,i)=>`<option value="${10-i}">${10-i}</option>`).join('');
      sel.addEventListener('change', ()=> validateUnique(step));
    });
  });

  function show(i){
    steps.forEach((s,k)=>s.style.display = (k===i)?'block':'none');
    prevBtn.disabled = i===0;
    nextBtn.style.display = (i<NUM_STEPS-1)?'inline-flex':'none';
    calcBtn.style.display = (i===NUM_STEPS-1)?'inline-flex':'none';
    updateProgress();
  }
  
  function updateProgress(){
    const completed = steps.reduce((acc,step)=> acc + (isStepComplete(step)?1:0), 0);
    const pct = Math.round((completed/NUM_STEPS)*100);
    fill.style.width = pct+'%';
    ptext.textContent = pct+'%';
  }
  
  function isStepComplete(step){
    const vals = [...step.querySelectorAll('select')].map(s=>s.value).filter(Boolean);
    return vals.length===10 && new Set(vals).size===10;
  }
  
  function validateUnique(step){
    const selects = [...step.querySelectorAll('select')];
    const used = {};
    let dup = false;
    selects.forEach(s=>{
      const v = s.value;
      s.classList.remove('err');
      if(v){
        if(used[v]) dup = true; else used[v]=true;
      }
    });
    if(dup){
      selects.forEach(s=>{ if(s.value && used[s.value]>1) s.classList.add('err'); });
    }
    nextBtn.disabled = !isStepComplete(steps[idx]) && idx<NUM_STEPS-1;
    calcBtn.disabled = !isStepComplete(steps[idx]) && idx===NUM_STEPS-1;
    updateProgress();
  }

  // Navegación
  prevBtn.addEventListener('click',()=>{ if(idx>0){ idx--; show(idx); } });
  nextBtn.addEventListener('click',()=>{
    if(!isStepComplete(steps[idx])){ alert('Completa la sección con valores 10..1 sin repetir.'); return; }
    if(idx<NUM_STEPS-1){ idx++; show(idx); }
  });

  // Cálculo
  calcBtn.addEventListener('click',()=>{
    if(!steps.every(isStepComplete)){ alert('Completa todas las secciones primero.'); return; }
    const totals = Array(11).fill(0);
    steps.forEach(step=>{
      step.querySelectorAll('select').forEach(sel=>{
        const col = Number(sel.dataset.col);
        const val = Number(sel.value||0);
        totals[col] += val;
      });
    });
    renderTotals(totals);
    resultados.hidden = false;
    resultados.scrollIntoView({behavior:'smooth',block:'start'});
  });

  function renderTotals(totals){
    const names = {
      1:'Asistencial',2:'Ejecutivo‑persuasivo',3:'Verbal',4:'Artístico‑plástico',5:'Artístico‑musical',
      6:'Organización',7:'Científico',8:'Cálculo',9:'Mecánico‑constructivo',10:'Actividad al aire libre'
    };
    totalesEl.innerHTML = '';
    for(let i=1;i<=10;i++){
      const chip = document.createElement('div');
      chip.className = 'badge';
      chip.textContent = `${i}. ${names[i]} — ${totals[i]} pts`;
      totalesEl.appendChild(chip);
    }
    const sorted = Array.from({length:10},(_,i)=>i+1).sort((a,b)=>totals[b]-totals[a]).slice(0,3);
    top3El.innerHTML = '';
    sorted.forEach(i=>{
      const li = document.createElement('li');
      li.textContent = `${i}. ${names[i]} (${totals[i]} pts)`;
      top3El.appendChild(li);
    });
  }

  // Guardar/Cargar/Limpiar/Descargar
  function collectData(){
    const data = { sections: [] };
    steps.forEach((step,si)=>{
      const rows = [];
      step.querySelectorAll('select').forEach((sel,ri)=>{
        rows.push({ item: ri+1, col: Number(sel.dataset.col), score: sel.value?Number(sel.value):null });
      });
      data.sections.push(rows);
    });
    return data;
  }
  
  function applyData(data){
    if(!data||!data.sections) return;
    steps.forEach((step,si)=>{
      const rows = data.sections[si]||[];
      const selects = step.querySelectorAll('select');
      rows.forEach((r,ri)=>{ if(selects[ri]) selects[ri].value = r.score??''; });
      validateUnique(step);
    });
  }
  
  saveBtn.addEventListener('click',()=>{ 
    localStorage.setItem('intereses_data', JSON.stringify(collectData())); 
    alert('✅ Guardado correctamente'); 
  });
  
  loadBtn.addEventListener('click',()=>{ 
    const d = JSON.parse(localStorage.getItem('intereses_data')||'null'); 
    applyData(d); 
    alert('📂 Datos cargados'); 
  });
  
  clearBtn.addEventListener('click',()=>{
    if(!confirm('¿Limpiar todas las respuestas?')) return;
    steps.forEach(step=> step.querySelectorAll('select').forEach(s=> s.value=''));
    resultados.hidden = true;
    updateProgress();
  });
  
  downloadBtn.addEventListener('click',()=>{
    const data = collectData();
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'intereses_resultados.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Estado inicial
  show(0);
})();
