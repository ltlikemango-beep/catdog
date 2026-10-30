import { WORLD, AMMO } from './engine.mjs';
const ink='#536348';
function ellipse(c,x,y,rx,ry,fill,stroke=null){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function line(c,points,color,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function round(c,x,y,w,h,r,fill,stroke=null){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
function path(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke();}}
export function drawPet(c,p,x,y,scale=1,time=0){
  c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(p.rotation||0);c.lineWidth=2.4;c.lineJoin='round';
  const cat=p.team===0,slot=p.slot,fur=cat?['#eeb56f','#f7edda','#c8c6bc'][slot]:['#d6a16d','#f1cc87','#bec5c5'][slot];
  const dark=cat?['#bd8245','#c6a97d','#929889'][slot]:['#9a6a47','#bf9963','#6b767b'][slot];
  // Compact hand-drawn bodies, ears and expressive faces, all original canvas artwork.
  if(cat){c.beginPath();c.moveTo(-22,16);c.bezierCurveTo(-44,13,-38,1,-35,0);c.strokeStyle=dark;c.lineWidth=7;c.stroke();}
  else{c.beginPath();c.moveTo(23,16);c.bezierCurveTo(40,13,39,-1,29,0);c.strokeStyle=dark;c.lineWidth=7;c.stroke();}
  c.lineWidth=2.4;ellipse(c,0,20,20,19,fur,ink);ellipse(c,0,25,12,11,'#fff3dd');
  ellipse(c,-14,34,9,5,fur,ink);ellipse(c,14,34,9,5,fur,ink);
  if(cat){
    path(c,[[-26,-10],[-24,-34],[-8,-21]],fur,ink);path(c,[[8,-21],[25,-34],[27,-8]],fur,ink);
    path(c,[[-22,-15],[-21,-27],[-12,-20]],'#d6a29b');path(c,[[13,-20],[22,-27],[23,-14]],'#d6a29b');
  }else if(slot===0){
    path(c,[[-27,-10],[-22,-35],[-7,-21]],fur,ink);path(c,[[7,-21],[22,-35],[28,-8]],fur,ink);
    path(c,[[-22,-14],[-20,-28],[-13,-19]],'#c08e7c');path(c,[[13,-19],[20,-28],[23,-12]],'#c08e7c');
  }else if(slot===1){ellipse(c,-24,-7,9,20,dark,ink);ellipse(c,24,-7,9,20,dark,ink);}
  else{path(c,[[-27,-5],[-24,-36],[-6,-20]],dark,ink);path(c,[[6,-20],[24,-36],[27,-5]],dark,ink);}
  ellipse(c,0,-3,29,26,fur,ink);
  if(cat&&slot===0){line(c,[[-11,-24],[-8,-16]],dark,3);line(c,[[0,-28],[0,-18]],dark,3);line(c,[[11,-24],[8,-16]],dark,3);}
  if(cat&&slot===1){ellipse(c,-16,-14,10,11,'#d1a37c');ellipse(c,13,-17,9,9,'#9b9a83');}
  if(!cat&&slot===2){path(c,[[-22,-19],[-4,-15],[0,-4],[4,-15],[22,-19],[16,5],[0,13],[-16,5]],'#f4f0de');}
  if(!cat){ellipse(c,0,7,19,12,'#fff1dc');if(slot===0){ellipse(c,-17,1,9,8,'#fff1dc');ellipse(c,17,1,9,8,'#fff1dc');}}
  const blink=Math.sin(time*1.1+p.id*3)>0.996;
  if(blink){line(c,[[-14,-4],[-7,-4]],ink,2.4);line(c,[[7,-4],[14,-4]],ink,2.4);}
  else{ellipse(c,-11,-4,2.6,3.4,ink);ellipse(c,11,-4,2.6,3.4,ink);ellipse(c,-10,-5,0.8,1,'#fff');ellipse(c,12,-5,.8,1,'#fff');}
  ellipse(c,-20,7,5,3,'#e6a89b99');ellipse(c,20,7,5,3,'#e6a89b99');
  path(c,[[-4,4],[4,4],[0,8]],cat?'#c9867c':ink);
  c.beginPath();c.moveTo(-7,10);c.quadraticCurveTo(-3,14,0,9);c.quadraticCurveTo(3,14,7,10);c.strokeStyle=ink;c.lineWidth=1.6;c.stroke();
  if(cat){line(c,[[-19,10],[-32,7]],'#8b8a6f',1.2);line(c,[[-20,14],[-33,15]],'#8b8a6f',1.2);line(c,[[19,10],[32,7]],'#8b8a6f',1.2);line(c,[[20,14],[33,15]],'#8b8a6f',1.2);}
  // Team neckerchief.
  path(c,[[-15,18],[15,18],[5,25],[0,34],[-5,24]],cat?'#d88b65':'#749e8a',ink);
  ellipse(c,-19,21,6,8,fur,ink);ellipse(c,19,21,6,8,fur,ink);
  c.restore();
}
export class Renderer{
  constructor(canvas,battle){this.canvas=canvas;this.c=canvas.getContext('2d');this.battle=battle;this.effects=[];this.drag=null;this.shake=0;this.accumulator=0;this.resize();}
  resize(){const dpr=Math.min(window.devicePixelRatio||1,2);this.canvas.width=WORLD.width*dpr;this.canvas.height=WORLD.height*dpr;this.dpr=dpr;}
  consume(events){for(const e of events){
    if(e.type==='damage')this.effects.push({...e,age:0,life:1.25});
    if(e.type==='impact'){this.effects.push({...e,age:0,life:.48});this.shake=3.5;for(let i=0;i<11;i++)this.effects.push({type:'spark',x:e.x,y:e.y,vx:Math.cos(i*2.4)*90,vy:Math.sin(i*2.4)*100-35,color:e.color,age:0,life:.7});}
    if(e.type==='splash')for(let i=0;i<13;i++)this.effects.push({type:'spark',x:e.x,y:e.y,vx:(i-6)*17,vy:-80-Math.sin(i*7)*60,color:'#eaffed',age:0,life:.8});
  }}
  background(c,t){
    let g=c.createLinearGradient(0,0,0,650);g.addColorStop(0,'#e4edcd');g.addColorStop(.6,'#dbe9c5');g.addColorStop(1,'#bed5ad');c.fillStyle=g;c.fillRect(0,0,1200,650);
    // Gentle sun glow, clouds and distant mountain silhouettes.
    g=c.createRadialGradient(645,90,4,645,90,230);g.addColorStop(0,'#fffbe9c9');g.addColorStop(1,'#fffbe900');c.fillStyle=g;c.fillRect(400,0,500,360);
    ellipse(c,650,95,44,44,'#fff8d6aa');
    for(const [x,y,s] of [[105,68,1],[575,52,.85],[1035,81,1.1],[750,184,.65]]){const drift=Math.sin(t*.045+x)*9;c.save();c.translate(x+drift,y);c.scale(s,s);ellipse(c,0,0,48,13,'#f7f8df80');ellipse(c,-14,-7,24,16,'#f7f8df80');ellipse(c,15,-10,24,18,'#f7f8df80');c.restore();}
    path(c,[[0,360],[105,248],[205,325],[365,214],[520,354],[685,267],[850,348],[1035,220],[1200,330],[1200,650],[0,650]],'#c7d9b5');
    path(c,[[0,450],[140,355],[325,430],[485,300],[700,434],[870,328],[1080,425],[1200,366],[1200,650],[0,650]],'#b5cda7');
    for(const [x,y,s] of [[45,360,1.3],[430,410,.8],[787,397,.9],[1160,355,1.35]]){round(c,x-5,y,10,170,5,'#9ebd91');ellipse(c,x,y-12,49*s,75*s,'#a1c294');ellipse(c,x-25*s,y+15*s,35*s,48*s,'#a6c699');}
    // Dreamy forest undergrowth and two tiny floating islands.
    path(c,[[0,528],[60,510],[120,525],[200,510],[295,540],[400,525],[510,563],[630,545],[760,564],[880,527],[960,537],[1070,510],[1200,528],[1200,650],[0,650]],'#9fbd94');
    for(const x of [-20,90,175,260,380,820,940,1030,1130,1220]){ellipse(c,x,558+Math.sin(x)*7,61,33,'#89ad89');ellipse(c,x+15,550,34,31,'#91b58c');}
    // Water has no standing floor: detached pets fall out of the match.
    g=c.createLinearGradient(0,565,0,650);g.addColorStop(0,'#a9cebc');g.addColorStop(1,'#79b5a4');c.fillStyle=g;c.fillRect(0,575,1200,75);
    for(let i=0;i<15;i++){const x=(i*97+Math.sin(t*.3+i)*10)%1200;line(c,[[x,602+(i%3)*15],[x+25+(i%2)*22,602+(i%3)*15]],'#d6e8ca66',2);}
    this.island(c,178,555,150);this.island(c,1022,555,150);
    // Delicate foreground leaves.
    for(const side of [0,1]){c.save();if(side){c.translate(1200,0);c.scale(-1,1);}line(c,[[0,650],[39,591],[60,561]],'#668b6a',3);for(const [x,y,a] of [[18,616,-.5],[38,592,.7],[51,574,-.5]]){c.save();c.translate(x,y);c.rotate(a);ellipse(c,0,0,10,23,'#709a76');c.restore();}c.restore();}
    // Little drifting pollen motes.
    for(let i=0;i<18;i++){const x=(i*149+t*(2+i%3))%1200,y=175+(i*71)%370+Math.sin(t*.4+i)*8;ellipse(c,x,y,2,2,'#fff6b477');}
  }
  island(c,x,y,w){
    path(c,[[x-w/2,y],[x-w*.25,y+45],[x+5,y+70],[x+w*.3,y+37],[x+w/2,y]],'#bca58a');
    path(c,[[x-w*.25,y+20],[x+5,y+70],[x+w*.3,y+37],[x+20,y+7]],'#aa987f');
    ellipse(c,x,y,w/2,17,'#8ea580');ellipse(c,x,y-4,w/2-3,14,'#d1d9a2');
    for(let i=0;i<5;i++)ellipse(c,x-48+i*23,y-6+Math.sin(i)*4,5,2,'#f5f0c4');
  }
  rig(c,team){
    c.save();if(team===1){c.translate(1200,0);c.scale(-1,1);}
    // Suspended wooden frame with leafy brackets.
    line(c,[[69,119],[89,85],[377,85],[400,118]],'#846f51',12);line(c,[[69,116],[400,116]],'#7d6f52',16);line(c,[[69,111],[400,111]],'#b79d6c',6);
    for(const x of [91,377]){round(c,x-13,94,26,37,8,'#b29d70');line(c,[[x-10,104],[x+9,111],[x-9,118]],'#e2ce9d',2.5);}
    for(const [x,y,r] of [[78,87,-.6],[99,81,.6],[114,84,1.1],[380,81,-.7],[399,92,.8]]){c.save();c.translate(x,y);c.rotate(r);ellipse(c,0,0,9,16,'#88a478');line(c,[[0,-9],[0,10]],'#a9bd8b',1);c.restore();}
    c.restore();
  }
  pet(c,p,t){
    if(!p.alive&&!p.falling)return;
    const b=this.battle,selected=p.alive&&p.id===b.selected&&b.phase==='aim';
    if(p.alive){
      c.save();c.lineCap='round';const rope=p.ropeHp<35?'#bf9874':'#a29a70';
      line(c,[[p.anchorX,p.anchorY],[p.x,p.y-23]],rope,4.5);
      const dx=p.x-p.anchorX,dy=p.y-23-p.anchorY,len=Math.hypot(dx,dy);
      for(let k=12;k<len;k+=14){const x=p.anchorX+dx*k/len,y=p.anchorY+dy*k/len;line(c,[[x-2,y-2],[x+2,y+2]],'#e1d7a7',1.5);}
      ellipse(c,p.anchorX,p.anchorY,6,4,'#8b805c');
      // The bead identifies remaining rope strength.
      ellipse(c,p.x,p.y-39,7,7,p.ropeHp<35?'#d78d6f':'#f4e4b8','#a49268');c.restore();
    }
    if(selected){ellipse(c,p.x,p.y+41,38,8,'#74905e28');c.save();c.setLineDash([4,7]);c.lineDashOffset=-t*13;c.beginPath();c.arc(p.x,p.y,45,0,Math.PI*2);c.strokeStyle='#f7fbdf';c.lineWidth=2;c.stroke();c.restore();
      path(c,[[p.x-6,p.y-61],[p.x+6,p.y-61],[p.x,p.y-53]],'#63855a');
    }
    drawPet(c,p,p.x,p.y,.93,t);
    if(p.alive){
      round(c,p.x-25,p.y+47,50,5,3,'#637b5233');round(c,p.x-25,p.y+47,Math.max(0,50*p.hp/100),5,3,p.hp<=35?'#d98b6c':p.team===0?'#d49b58':'#7a9e73');
      c.font='10px -apple-system, sans-serif';c.textAlign='center';c.fillStyle='#657c59';c.fillText(p.name,p.x,p.y+68);
      if(selected){round(c,p.x-23,p.y+75,46,16,8,'#ffffe8d9');c.font='8px sans-serif';c.fillStyle='#789169';c.fillText('正在出战',p.x,p.y+86);}
    }
  }
  ammo(c,ammo,x,y,size=1,rotation=0){
    c.save();c.translate(x,y);c.rotate(rotation);c.scale(size,size);c.lineWidth=2;
    if(ammo==='bone'){
      round(c,-13,-5,26,10,5,'#fff6df',ink);for(const a of [-1,1]){ellipse(c,12*a,-5,5,5,'#fff6df',ink);ellipse(c,12*a,5,5,5,'#fff6df',ink);}round(c,-11,-3,22,6,2,'#fff6df');
    }else if(ammo==='burst'){
      path(c,[[6,0],[19,-10],[19,10]],'#8dc5c9',ink);ellipse(c,-2,0,15,10,'#9fd6d3',ink);ellipse(c,-10,-2,2,2,ink);line(c,[[1,-6],[1,6]],'#6faaa9',1.5);
    }else{
      ellipse(c,0,3,10,8,'#f6ba6d',ink);for(const [px,py] of [[-10,-4],[-4,-10],[4,-10],[11,-4]])ellipse(c,px,py,4,5,'#f6ba6d',ink);
    }c.restore();
  }
  draw(dt=0){
    const c=this.c,b=this.battle;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,1200,650);c.save();
    if(this.shake>.1){c.translate(Math.sin(b.time*121)*this.shake,Math.cos(b.time*111)*this.shake*.6);this.shake*=Math.exp(-dt*13);}
    this.background(c,b.time);this.rig(c,0);this.rig(c,1);
    // Center mark is intentionally light so the battlefield stays legible.
    c.textAlign='center';c.fillStyle='#78966a44';c.font='italic 700 44px Georgia,serif';c.fillText('vs',600,318);
    c.font='9px sans-serif';c.fillStyle='#7c96653d';c.fillText('毛 球 派 对',600,339);
    for(const p of b.pets)this.pet(c,p,b.time);
    if(b.phase==='aim'){
      const points=b.trajectory();points.forEach((p,i)=>ellipse(c,p.x,p.y,Math.max(1.4,3-i*.045),Math.max(1.4,3-i*.045),`rgba(255,255,229,${Math.max(.2,.94-i*.022)})`));
      const o=b.shotOrigin();this.ammo(c,b.ammo,o.x,o.y,.75);
      if(this.drag){const p=b.pets[b.selected];line(c,[[p.x,p.y],[this.drag.x,this.drag.y]],'#fff8e8aa',3);ellipse(c,this.drag.x,this.drag.y,8,8,'#fff9e7aa');}
    }
    if(b.projectile){const s=b.projectile;s.trail.forEach((p,i)=>ellipse(c,p.x,p.y,2+i*.28,2+i*.28,`rgba(255,249,211,${i/s.trail.length*.5})`));this.ammo(c,s.ammo,s.x,s.y,1.1,s.age*6);}
    this.effects=this.effects.filter(e=>e.age<e.life);
    for(const e of this.effects){e.age+=dt;const a=e.age/e.life;c.save();c.globalAlpha=Math.max(0,1-a);
      if(e.type==='damage'){round(c,e.x-35,e.y-18-e.age*35,70,24,9,'#fffcdfef');c.fillStyle='#9d7153';c.font='bold 12px sans-serif';c.textAlign='center';c.fillText(e.text,e.x,e.y-2-e.age*35);}
      if(e.type==='impact'){ellipse(c,e.x,e.y,e.radius*(.25+a),e.radius*(.25+a),'#fff7d22a');c.beginPath();c.arc(e.x,e.y,e.radius*(.2+a*.7),0,Math.PI*2);c.strokeStyle='#fff8d8';c.lineWidth=3*(1-a);c.stroke();}
      if(e.type==='spark'){e.x+=e.vx*dt;e.vy+=200*dt;e.y+=e.vy*dt;ellipse(c,e.x,e.y,3*(1-a)+1,4*(1-a)+1,e.color);}
      c.restore();
    }
    c.restore();
  }
}
