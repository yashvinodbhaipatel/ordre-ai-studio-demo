// State-machine smoke checks. These do not replace real browser/accessibility tests.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const nodes = new Map();
let checked = 0;
function node(key) {
  if (!nodes.has(key)) nodes.set(key, {
    innerHTML: '', textContent: '', value: '', dataset: {}, style: {}, open: false,
    classList: { add(){}, remove(){}, toggle(){} },
    setAttribute(){}, focus(){}, addEventListener(){},
    showModal(){ this.open=true; }, close(){ this.open=false; }
  });
  return nodes.get(key);
}
const context = vm.createContext({
  console, structuredClone, Date, URL, Blob,
  setTimeout:()=>1, clearTimeout(){}, setInterval:()=>1,
  document:{querySelector:node,querySelectorAll:()=>Array(checked).fill({}),documentElement:{dataset:{}},addEventListener(){},createElement:()=>({click(){}})},
  window:{addEventListener(){},scrollTo(){}},location:{hash:''},
  localStorage:{getItem:()=>null,setItem(){}}
});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8'),context);
const run=s=>vm.runInContext(s,context);
assert.match(node('#main').innerHTML,/Good morning, Yash/);
for (const page of ['productions','casting','assets','approvals','queue','brand','system']) {
  run(`navigate('${page}',false)`);
  assert(node('#main').innerHTML.length>500, `${page} renders`);
}
run("startProduction(); wizardNext()");
assert.match(node('#wizard-error').textContent,/name/);
assert.equal(run('wizardStep'),0);
run("state.role='ORDRE visitor'");
assert.equal(run('canProduce()'),false);
assert.equal(run('canApprove()'),false);
run("state.role='Operator'");
assert.equal(run('canProduce()'),true);
assert.equal(run('canApprove()'),false);
run("state.role='Producer'; close(); startProduction({name:'Test collection',brief:'Soft light',product:true,productName:'Sample trench',scenario:'normal'}); createJob(); state.jobs[0].started=Date.now()-13000; tick()");
assert.equal(run('state.jobs[0].status'),'review');
assert.equal(run('state.reviews.length'),4);
run('tick()');
assert.equal(run('state.reviews.length'),4,'completion is idempotent');
run('review(state.reviews[0].id); decide(true)');
assert.match(node('#review-error').textContent,/three quality/);
assert.equal(run('state.reviews[0].status'),'review');
checked=3;
node('#review-note').value='Reviewed all product details.';
run('decide(true)');
assert.equal(run('state.reviews[0].status'),'approved');
for (const scenario of ['failed','blocked']) {
  run(`startProduction({name:'${scenario}',brief:'Neutral clothing',product:true,productName:'Sample trench',scenario:'${scenario}'}); createJob(); state.jobs[0].started=Date.now()-13000; tick()`);
  assert.equal(run('state.jobs[0].status'),scenario);
  assert.equal(run('state.reviews.length'),4,'failed/blocked jobs create no output');
}
run("review('r2'); state.role='Operator'; decide(true)");
assert.equal(run("state.reviews.find(r=>r.id==='r2').status"),'review','operators cannot approve');
node('#review-note').value=''; run('decide(false)');
assert.match(node('#review-error').textContent,/needs to change/);
node('#review-note').value='Please correct the hem.';run('decide(false)');
assert.equal(run("state.reviews.find(r=>r.id==='r2').status"),'changes');
assert.equal(run("esc('<img src=x onerror=alert(1)>')"),'&lt;img src=x onerror=alert(1)&gt;');
console.log('PASS: 8 routes, required brief validation, role gates, generation completion, duplicate prevention, failed/blocked recovery states, human approval checks, review notes and HTML escaping.');
