import { WORLD, AMMO } from './engine.mjs';
const names=['husky','settings','bubble','ammo-slot','orange','notice','back','retry','tabby','rain-dog','hp-bg','hp-fill','turn-strip','cat','brown-dog','clock','aim-glow','badge','nbg_bg','nbg_grass_bg','nbg_maintree','nbg_tree_1','nbg_tree_2','nbg_tree_3','nbg_tree_4','nbg_stick_1','nbg_stick_2','nbg_grass_1','nbg_grass_2','nbg_light_top','nbg_light_grass','zrope00_0','zknot00_0','zbranch00_0','rope-strip','claw-shot'];
const art={};
export const PET_ART=['orange','tabby','cat','husky','rain-dog','brown-dog'];
export async function loadAssets(){await Promise.all(names.map(name=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{art[name]=im;resolve();};im.onerror=()=>reject(new Error(`无法读取场景素材：${name}`));im.src=new URL(`./assets/original/${name}.png`,import.meta.url).href;})));}
function image(c,name,x,y,w,h,alpha=1){const im=art[name];if(!im)return;c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function centered(c,name,x,y,w,h,alpha=1){image(c,name,x-w/2,y-h/2,w,h,alpha);}
export function drawPet(c,p,x,y,scale=1,time=0){
 const im=art[PET_ART[p.id]];if(!im)return;const h=85*scale,w=h*im.width/im.height;
 c.save();c.translate(x,y);c.rotate(p.rotation||0);if(p.team===1)c.scale(-1,1);c.drawImage(im,-w/2,-h*.43,w,h);c.restore();
}
export class Renderer{
 constructor(canvas,battle){this.canvas=canvas;this.c=canvas.getContext('2d');this.battle=battle;this.effects=[];this.drag=null;this.shake=0;this.resize();}
 resize(){const rect=this.canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);this.dpr=dpr;this.cssWidth=rect.width;this.cssHeight=rect.height;this.canvas.width=Math.round(rect.width*dpr);this.canvas.height=Math.round(rect.height*dpr);this.scale=Math.min(rect.width/WORLD.width,rect.height/WORLD.height);this.offsetX=(rect.width-WORLD.width*this.scale)/2;this.offsetY=(rect.height-WORLD.height*this.scale)/2;}
 screenToWorld(x,y){return {x:(x-this.offsetX)/this.scale,y:(y-this.offsetY)/this.scale};}
 consume(events){for(const e of events){if(e.type==='damage')this.effects.push({...e,age:0,life:1.2});if(e.type==='impact'){this.effects.push({...e,age:0,life:.42});this.shake=3;for(let i=0;i<10;i++)this.effects.push({type:'spark',x:e.x,y:e.y,vx:Math.cos(i*2.4)*90,vy:Math.sin(i*2.4)*100-35,color:e.color,age:0,life:.7});}if(e.type==='splash')for(let i=0;i<12;i++)this.effects.push({type:'spark',x:e.x,y:e.y,vx:(i-6)*17,vy:-80-Math.sin(i*7)*60,color:'#fff5b9',age:0,life:.8});}}
 background(c,t){
  const extra=this.offsetX/this.scale;
  image(c,'nbg_bg',-extra-2,-2,1204+2*extra,652);
  image(c,'nbg_grass_bg',-extra-2,228,1204+2*extra,440);
  image(c,'nbg_tree_2',100,396,90,112,.8);image(c,'nbg_tree_3',845,319,75,160,.7);
  image(c,'nbg_grass_1',-50,400,350,108);image(c,'nbg_grass_2',900,410,350,108);
  image(c,'nbg_tree_1',210,-190,350,830);
  image(c,'nbg_tree_1',-200-extra,-110,360,850);
  c.save();c.translate(1200+extra,0);c.scale(-1,1);image(c,'nbg_tree_1',-190,-120,370,860);c.restore();
  image(c,'nbg_stick_1',-210,28,520,180);
  c.save();c.translate(1200,0);c.scale(-1,1);image(c,'nbg_stick_1',-210,28,520,180);c.restore();
  image(c,'nbg_light_grass',300,426,590,185,.36);image(c,'nbg_light_top',435,-20,330,190,.45);
 }
 rig(c,team){const x=team===0?92:818,center=team===0?237:963;for(let y=54;y<118;y+=32)image(c,'rope-strip',center-3,y,6,Math.min(32,118-y));image(c,'zbranch00_0',x,103,290,38);}
 pet(c,p,t){
  if(!p.alive&&!p.falling)return;const b=this.battle,selected=p.alive&&p.id===b.selected&&b.phase==='aim';
  if(p.alive){const dx=p.x-p.anchorX,dy=p.y-25-p.anchorY,len=Math.hypot(dx,dy);c.save();c.translate(p.anchorX,p.anchorY);c.rotate(-Math.atan2(dx,dy));for(let y=0;y<len;y+=33)image(c,'rope-strip',-3,y,6,Math.min(33,len-y));c.restore();centered(c,'zknot00_0',p.anchorX,p.anchorY,17,26);}
  if(selected){c.save();c.translate(p.x,p.y+5);c.rotate(t*.75);centered(c,'aim-glow',0,0,105,105,.78);c.restore();}
  drawPet(c,p,p.x,p.y,.9,t);
  if(p.alive){image(c,'hp-bg',p.x-25,p.y-48,50,8);if(p.hp>0){c.save();c.beginPath();c.rect(p.x-23,p.y-47,46*p.hp/100,6);c.clip();image(c,'hp-fill',p.x-23,p.y-47,46,6);c.restore();}
   if(p.hp<100||selected){c.font='bold 11px sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#342c1d';c.strokeText(p.name,p.x,p.y+62);c.fillStyle='#fff6d9';c.fillText(p.name,p.x,p.y+62);}
  }
 }
 ammo(c,ammo,x,y,size=1,rotation=0){const name=ammo==='bone'?'zbranch00_0':ammo==='burst'?'badge':'claw-shot';c.save();c.translate(x,y);c.rotate(rotation);centered(c,name,0,0,ammo==='bone'?32*size:ammo==='paw'?32*size:21*size,ammo==='bone'?13*size:ammo==='paw'?13*size:23*size);c.restore();}
 draw(dt=0){const c=this.c,b=this.battle;c.setTransform(this.dpr*this.scale,0,0,this.dpr*this.scale,this.offsetX*this.dpr,this.offsetY*this.dpr);c.save();if(this.shake>.1){c.translate(Math.sin(b.time*121)*this.shake,Math.cos(b.time*111)*this.shake*.6);this.shake*=Math.exp(-dt*13);}this.background(c,b.time);this.rig(c,0);this.rig(c,1);for(const p of b.pets)this.pet(c,p,b.time);
  if(b.phase==='aim'){for(const [i,p] of b.trajectory().entries()){c.beginPath();c.arc(p.x,p.y,Math.max(1.5,3-i*.035),0,Math.PI*2);c.fillStyle=`rgba(255,255,240,${Math.max(.15,.96-i*.018)})`;c.fill();}const o=b.shotOrigin();this.ammo(c,b.ammo,o.x,o.y,.7);}
  if(b.projectile){const s=b.projectile;s.trail.forEach((p,i)=>{c.fillStyle=`rgba(255,249,211,${i/s.trail.length*.4})`;c.beginPath();c.arc(p.x,p.y,2+i*.2,0,Math.PI*2);c.fill();});this.ammo(c,s.ammo,s.x,s.y,1.1,s.age*6);}
  this.effects=this.effects.filter(e=>e.age<e.life);for(const e of this.effects){e.age+=dt;const a=e.age/e.life;c.save();c.globalAlpha=Math.max(0,1-a);if(e.type==='damage'){c.font='900 24px sans-serif';c.textAlign='center';c.strokeStyle='#58271e';c.lineWidth=5;c.strokeText(e.text,e.x,e.y-20-e.age*40);c.fillStyle='#fff5d5';c.fillText(e.text,e.x,e.y-20-e.age*40);}if(e.type==='impact')centered(c,'aim-glow',e.x,e.y,e.radius*(.8+a*2),e.radius*(.8+a*2));if(e.type==='spark'){e.x+=e.vx*dt;e.vy+=200*dt;e.y+=e.vy*dt;c.fillStyle=e.color;c.fillRect(e.x,e.y,3*(1-a)+1,4*(1-a)+1);}c.restore();}c.restore();
 }
}
