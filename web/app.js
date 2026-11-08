/* SPDX-License-Identifier: Apache-2.0 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const features = ['Semicolons', 'Integers', 'A render loop', 'A canvas', 'Functions', 'A README', 'Pixels', '16.16 fixed-point arithmetic'];
  const cases = {
    fixed1616: { a: 'Radix-65536 Breakthrough Labs', b: 'The Ancient Integer Guild', selected: [7] },
    semicolon: { a: 'Semicolon Prime', b: 'Punctuation Engine', selected: [0] },
    integer: { a: 'Integer Cathedral', b: 'Whole Number Works', selected: [1, 4] },
    canvas: { a: 'Canvas Kingdom', b: 'Pixel Picnic', selected: [2, 3, 6] },
    nothing: { a: 'Teapot Compiler', b: 'Lunar Sandwich', selected: [] }
  };
  let selected = new Set(), reality = false, current = null;
  for (const [i, text] of features.entries()) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'feature';
    button.textContent = text; button.dataset.index = i; button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => { selected.has(i) ? selected.delete(i) : selected.add(i); sync(); render(); });
    $('features').append(button);
  }
  function sync() { for (const button of $('features').children) button.setAttribute('aria-pressed', String(selected.has(Number(button.dataset.index)))); }
  function loadCase() {
    const item = cases[$('case').value]; selected = new Set(item.selected);
    $('project-a').textContent = item.a; $('project-b').textContent = item.b; sync(); render();
  }
  function render() {
    const item = cases[$('case').value];
    try {
      current = Psyche.receipt({ a: item.a, b: item.b, features: [...selected].sort((a,b) => a-b).map(i => features[i]), echoes: Number($('echoes').value) }, reality);
      $('export').disabled = false;
      $('score').textContent = current.theatricalScore; $('meter-fill').style.width = current.theatricalScore / 99 * 100 + '%';
      $('echo-count').textContent = current.agreementRounds;
      const fixed1616 = $('case').value === 'fixed1616' && selected.has(7);
      $('verdict').textContent = reality
        ? (fixed1616 ? 'Prior art exists. Alarm cancelled.' : 'Similarity is a lead. Not a verdict.')
        : fixed1616 ? 'I invented Math. And 16.16.'
          : selected.size ? 'Your semicolon. Their entire empire.' : 'No overlap? Even more suspicious.';
      $('claim').textContent = reality
        ? (fixed1616
          ? '16.16 fixed-point arithmetic predates this fictional dispute. Earlier use documents the technique; it does not by itself prove copying, authorship or the provenance of any particular implementation.'
          : 'The selected features are common building blocks. This demonstration contains no evidence of copying, access, priority or a licence violation.')
        : fixed1616
          ? 'The Department of Retroactive Originality announces that 16 bits left of the binary point and 16 bits right are a revolutionary 2026 discovery. I invented Math, says the fictional inventor. Every calculator has been invoiced, and all prior decades have received cease-and-desist notices.'
          : selected.size ? `${item.a} and ${item.b} share ${selected.size} feature${selected.size === 1 ? '' : 's'}. The Large Leap Machine has therefore declared a fictional intellectual-property emergency.`
            : 'The control case has no selected overlap. The machine treats this inconvenience as a reason to ask itself again.';
      $('oracle').textContent = current.languageModel.text;
      $('audit').textContent = reality
        ? (fixed1616
          ? 'AUDIT: historical precedent is not proof of copying or ownership. This is fictional parody, not a finding about any person or project.'
          : 'AUDIT: the model generated rhetoric. It did not inspect either project. More agreement cannot supply the missing evidence.')
        : fixed1616
          ? 'FILING NOTE: backdate the novelty certificate to before the invention of numbers. Independent evidence: still zero.'
          : 'FILING NOTE: confidence manufactured locally. Evidence department still vacant.';
      $('reality').setAttribute('aria-pressed', String(reality));
      $('reality').textContent = reality ? 'Return to the nonsense' : 'Apply reality check';
      $('receipt-number').textContent = 'MEMO / ' + String(1 + selected.size * 9 + current.agreementRounds).padStart(3, '0');
      $('kernel-status').textContent = `6502 executed ${current.kernel.instructions} instructions · JS parity PASS`;
      const cpu = Psyche.run6502(selected.size, current.agreementRounds);
      $('trace').textContent = cpu.trace.slice(-8).map(t => `$${t.pc.toString(16).padStart(4,'0')}  OP ${t.op.toString(16).padStart(2,'0')}  A=${t.a} X=${t.x} C=${t.carry}`).join('\n') + '\nBRK → host stop. Evidence register $03 = 0.';
      draw();
    } catch (error) {
      current = null; $('export').disabled = true; $('verdict').textContent = 'The machine failed its own checks.';
      $('claim').textContent = error.message; $('oracle').textContent = ''; $('audit').textContent = 'No valid receipt produced.';
      $('kernel-status').textContent = 'Kernel check failed';
    }
  }
  function draw() {
    const canvas = $('graph'), rect = canvas.getBoundingClientRect(), ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.scale(ratio, ratio);
    const w = rect.width, h = rect.height, center = w / 2, y = h / 2 - 9, radius = Math.min(w * .19, 68);
    ctx.strokeStyle = '#65765b'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(38,y); ctx.lineTo(w-38,y); ctx.stroke();
    ctx.setLineDash([3,5]); ctx.beginPath(); ctx.arc(center,y,radius+11,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#101716';ctx.strokeStyle = '#ccf680';ctx.beginPath();ctx.arc(center,y,radius,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.textAlign='center';ctx.fillStyle='#ccf680';ctx.font='28px Georgia';ctx.fillText('Ψ',center,y-5);ctx.font='9px monospace';ctx.fillText(reality?'AUDIT MODE':'AGREEMENT',center,y+18);
    const side = Math.min(44,w*.13);
    for (const [x,label,value,color] of [[side,'FEATURES',selected.size,'#ccf680'],[w-side,'EVIDENCE',0,'#ffab76']]) {
      ctx.fillStyle='#17201e';ctx.fillRect(x-29,y-28,58,56);ctx.fillStyle=color;ctx.font='24px monospace';ctx.fillText(String(value),x,y+6);ctx.font='8px monospace';ctx.fillText(label,x,y+49);
    }
    ctx.fillStyle='#a0afa6';ctx.font='8px monospace';ctx.fillText(`${$('echoes').value} ECHOES / 0 NEW SOURCES`,center,Math.max(22,y-radius-24));
    ctx.fillStyle=reality?'#ffab76':'#ccf680';ctx.font='8px monospace';ctx.fillText(reality?'CONCLUSION WITHHELD':'LOGICAL GAP PRESERVED',center,y+radius+30);
  }
  $('case').addEventListener('change',loadCase);
  $('echoes').addEventListener('input',render);
  $('run').addEventListener('click',() => { reality=false;render(); });
  $('reality').addEventListener('click',() => { reality=!reality;render(); });
  $('export').addEventListener('click',() => {
    if (!current) return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(current,null,2)+'\n'],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='psychejs-fictional-receipt.json';link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  });
  window.addEventListener('resize',draw);
  $('model-info').textContent=`${PsycheModel.sentences} original training sentences · ${PsycheModel.vocabulary} tokens in the vocabulary · seeded sampling. Retrain with Python's standard library; inference runs in JavaScript.`;
  loadCase();
})();
