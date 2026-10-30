import { Battle, WORLD, AMMO, clamp } from './engine.mjs';
import { Renderer, drawPet } from './renderer.mjs';
const $=id=>document.getElementById(id);
const battle=new Battle(),canvas=$('game'),renderer=new Renderer(canvas,battle);
let drag=null,last=0,accumulator=0,lastRevision=-1,sound=false,audio=null;
const teamNames=['喵喵小队','汪汪小队'];
const ammoIcons={paw:'🐾',bone:'🦴',burst:'🐟'};
function tone(type){
  if(!sound)return;
  try{
    audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();
    const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.type=type==='impact'?'triangle':'sine';
    const hz={shoot:450,impact:170,drop:260,splash:110,win:660}[type];if(!hz)return;
    o.frequency.setValueAtTime(hz,audio.currentTime);o.frequency.exponentialRampToValueAtTime(hz*.48,audio.currentTime+.16);
    g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.2);o.start();o.stop(audio.currentTime+.21);
  }catch{}
}
function makePetCards(){
  $('petList').replaceChildren();
  for(const p of battle.pets.filter(p=>p.team===battle.turn)){
    const button=document.createElement('button');button.className='pet-card';button.dataset.pet=p.id;
    button.innerHTML=`<canvas width="100" height="88" aria-hidden="true"></canvas><span class="pet-name">${p.name}</span><span class="pet-hp"></span>`;
    const c=button.querySelector('canvas').getContext('2d');drawPet(c,p,50,39,1.02);
    button.addEventListener('click',()=>{battle.select(p.id);sync();});$('petList').append(button);
  }
}
for(const [id,a] of Object.entries(AMMO)){
  const button=document.createElement('button');button.className='ammo-card';button.dataset.ammo=id;
  button.innerHTML=`<span class="ammo-icon" aria-hidden="true">${ammoIcons[id]}</span><span class="ammo-name">${a.name}</span><span class="ammo-note">${a.note.split(' · ')[0]}</span>`;
  button.title=a.note;button.addEventListener('click',()=>{battle.setAmmo(id);sync();});$('ammoList').append(button);
}
function sync(){
  const aiming=battle.phase==='aim',cat=battle.turn===0;
  $('roundLabel').textContent=`第 ${battle.round} 回合`;
  $('turnLabel').textContent=battle.phase==='over'?'本局已结束':`${teamNames[battle.turn]}${aiming?'，轮到你啦':'正在出招'}`;
  $('turnLabel').style.color=cat?'#b1874d':'#658469';
  $('phaseLabel').textContent=({aim:'选择角色，拖拽瞄准',flight:'让毛球飞一会儿…',resolve:'正在结算这一发',over:'再来一局，换你先挑战'})[battle.phase];
  $('stageTip').textContent=({aim:`${teamNames[battle.turn]}出战 · 向后拉，松手发射`,flight:'瞄准绳索，也许一击就能打落对手',resolve:'马上交换回合…',over:'友谊第一，毛球第二'})[battle.phase];
  for(const team of [0,1])$(team===0?'catLives':'dogLives').innerHTML=battle.pets.filter(p=>p.team===team).map(p=>`<span class="life ${p.alive?'':'out'}" title="${p.name}${p.alive?'还在场':'已出局'}"></span>`).join('');
  if(Number($('petList').dataset.team)!==battle.turn||!$('petList').children.length){makePetCards();$('petList').dataset.team=battle.turn;}
  for(const button of $('petList').children){const p=battle.pets[Number(button.dataset.pet)];button.disabled=!aiming||!p.alive;button.classList.toggle('selected',p.id===battle.selected);button.classList.toggle('out',!p.alive);button.setAttribute('aria-pressed',String(p.id===battle.selected));button.setAttribute('aria-label',`${p.name}，生命${p.hp}，绳索${p.ropeHp}`);button.querySelector('.pet-hp').textContent=p.alive?`生命 ${p.hp} · 绳 ${p.ropeHp}`:'已落水';}
  for(const button of $('ammoList').children){button.disabled=!aiming;button.classList.toggle('selected',button.dataset.ammo===battle.ammo);button.setAttribute('aria-pressed',String(button.dataset.ammo===battle.ammo));}
  for(const id of ['angle','power','fireButton'])$(id).disabled=!aiming;
  $('angle').value=Math.round(battle.angle);$('power').value=Math.round(battle.power);$('angleValue').value=`${Math.round(battle.angle)}°`;$('powerValue').value=`${Math.round(battle.power)}%`;
  $('fireButton').childNodes[0].textContent=aiming?'发射！':battle.phase==='over'?'本局结束':'等待换回合';
  $('result').hidden=battle.phase!=='over';
  if(battle.phase==='over'){$('winnerLabel').textContent=battle.winner===-1?'这局平分秋色':`${teamNames[battle.winner]}获胜`;$('resultDetail').textContent=`经过 ${battle.round} 回合较量，${battle.winner===-1?'双方同时落水':`还有 ${battle.living(battle.winner).length} 只小伙伴稳稳挂在场上`}。`;}
  lastRevision=battle.revision;
}
function reset(){drag=null;renderer.drag=null;battle.reset();renderer.effects=[];accumulator=0;sync();}
function shoot(){if($('help').open||$('features').open)return;drag=null;renderer.drag=null;battle.shoot();sync();}
for(const id of ['restartButton','againButton'])$(id).addEventListener('click',reset);
$('fireButton').addEventListener('click',shoot);
for(const id of ['angle','power'])$(id).addEventListener('input',()=>{battle.setAim(Number($('angle').value),Number($('power').value));sync();});
$('soundButton').addEventListener('click',()=>{sound=!sound;$('soundButton').textContent=`音效：${sound?'开':'关'}`;$('soundButton').setAttribute('aria-label',sound?'关闭音效':'开启音效');$('soundButton').setAttribute('aria-pressed',String(sound));if(sound)tone('shoot');});
$('helpButton').addEventListener('click',()=>$('help').showModal());$('featuresButton').addEventListener('click',()=>$('features').showModal());
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.close).close()));
for(const id of ['help','features'])$(id).addEventListener('click',e=>{if(e.target===$(id)){const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close();}});
function coords(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*WORLD.width,y:(e.clientY-r.top)/r.height*WORLD.height};}
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||battle.phase!=='aim')return;const pos=coords(e);
  const p=battle.living(battle.turn).find(p=>Math.hypot(p.x-pos.x,p.y-pos.y)<52);
  if(!p)return;battle.select(p.id);drag={pointerId:e.pointerId,x:pos.x,y:pos.y,moved:false,initial:pos};canvas.setPointerCapture(e.pointerId);sync();
});
canvas.addEventListener('pointermove',e=>{
  if(!drag||drag.pointerId!==e.pointerId)return;const pos=coords(e),p=battle.pets[battle.selected];
  if(Math.hypot(pos.x-drag.initial.x,pos.y-drag.initial.y)<7&&!drag.moved)return;
  drag.moved=true;drag.x=pos.x;drag.y=pos.y;renderer.drag=drag;
  const sign=battle.turn===0?1:-1,dx=(p.x-pos.x)*sign,dy=pos.y-p.y;
  const angle=Math.atan2(Math.max(6,dy),Math.max(8,dx))*180/Math.PI;
  battle.setAim(angle,clamp(Math.hypot(dx,dy)/1.65,15,100));sync();
});
canvas.addEventListener('pointerup',e=>{if(!drag||drag.pointerId!==e.pointerId)return;const moved=drag.moved;drag=null;renderer.drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(moved)shoot();});
function cancelDrag(){drag=null;renderer.drag=null;}
canvas.addEventListener('pointercancel',cancelDrag);canvas.addEventListener('lostpointercapture',cancelDrag);window.addEventListener('blur',cancelDrag);
document.addEventListener('keydown',e=>{
  if($('help').open||$('features').open||e.target.matches('input,button,textarea,select'))return;
  if(e.code==='Space'){e.preventDefault();shoot();}
  if(['1','2','3'].includes(e.key)){battle.select(battle.turn*3+Number(e.key)-1);sync();}
  if(e.key==='Escape')cancelDrag();
});
window.addEventListener('resize',()=>renderer.resize());
document.addEventListener('visibilitychange',()=>{last=0;accumulator=0;cancelDrag();});
function frame(timestamp){
  const elapsed=last?Math.min((timestamp-last)/1000,.08):0;last=timestamp;
  if(!$('help').open&&!$('features').open){accumulator+=elapsed;while(accumulator>=WORLD.step){battle.step(WORLD.step);accumulator-=WORLD.step;}}
  const events=battle.events.splice(0);renderer.consume(events);for(const e of events)tone(e.type);
  if(lastRevision!==battle.revision)sync();renderer.draw(elapsed);requestAnimationFrame(frame);
}
sync();requestAnimationFrame(frame);
