export const WORLD = { width:1200, height:650, gravity:355, water:606, step:1/120 };
export const AMMO = {
  paw: { name:'爪爪弹', note:'轻快 · 适合直接命中', speed:1, damage:52, ropeDamage:30, radius:10, color:'#f8bd66' },
  bone:{ name:'骨头弹', note:'重击 · 一发击断绳索', speed:.9, damage:67, ropeDamage:65, radius:12, color:'#fff5d9' },
  burst:{ name:'鱼鱼弹', note:'爆破 · 伤害附近目标', speed:.93, damage:34, ropeDamage:25, radius:11, blast:83, color:'#87cddd' }
};
export const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
export function pointSegmentDistance(px,py,ax,ay,bx,by) {
  const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
  const t=len ? clamp(((px-ax)*dx+(py-ay)*dy)/len,0,1) : 0;
  return Math.hypot(px-ax-t*dx,py-ay-t*dy);
}
export function segmentCircleHit(ax,ay,bx,by,cx,cy,r) {
  const dx=bx-ax,dy=by-ay,fx=ax-cx,fy=ay-cy,a=dx*dx+dy*dy;
  if (fx*fx+fy*fy<=r*r) return 0;
  if (!a) return null;
  const b=2*(fx*dx+fy*dy),c=fx*fx+fy*fy-r*r,d=b*b-4*a*c;
  if(d<0)return null;
  const t=(-b-Math.sqrt(d))/(2*a);
  return t>=0&&t<=1 ? t:null;
}
function segmentHit(ax,ay,bx,by,cx,cy,dx,dy) {
  const rx=bx-ax,ry=by-ay,sx=dx-cx,sy=dy-cy,den=rx*sy-ry*sx;
  if(Math.abs(den)<1e-8)return null;
  const t=((cx-ax)*sy-(cy-ay)*sx)/den,u=((cx-ax)*ry-(cy-ay)*rx)/den;
  return t>=0&&t<=1&&u>=0&&u<=1?t:null;
}
export function capsuleHit(ax,ay,bx,by,cx,cy,dx,dy,r) {
  const len=Math.hypot(dx-cx,dy-cy);
  if(!len)return segmentCircleHit(ax,ay,bx,by,cx,cy,r);
  if(pointSegmentDistance(ax,ay,cx,cy,dx,dy)<=r)return 0;
  const nx=-(dy-cy)/len*r,ny=(dx-cx)/len*r;
  const ts=[segmentCircleHit(ax,ay,bx,by,cx,cy,r),segmentCircleHit(ax,ay,bx,by,dx,dy,r),
    segmentHit(ax,ay,bx,by,cx+nx,cy+ny,dx+nx,dy+ny),segmentHit(ax,ay,bx,by,cx-nx,cy-ny,dx-nx,dy-ny)].filter(t=>t!==null);
  return ts.length?Math.min(...ts):null;
}
export class Battle {
  constructor(){this.reset();}
  reset(){
    this.pets=[];this.events=[];this.time=0;this.turn=0;this.round=1;this.phase='aim';this.selected=0;
    this.ammo='paw';this.angle=38;this.power=76;this.projectile=null;this.resolveTime=0;this.winner=null;this.revision=(this.revision||0)+1;
    const names=[['橘子','奶糖','团子'],['豆柴','可乐','二哈']];
    for(let team=0;team<2;team++)for(let slot=0;slot<3;slot++){
      const anchorX=team===0?130+slot*115:1070-slot*115;
      const length=[146,244,167][slot],theta=[-.025,.015,-.02][slot];
      this.pets.push({id:team*3+slot,team,slot,name:names[team][slot],anchorX,anchorY:123,length,theta,omega:0,
        x:anchorX+Math.sin(theta)*length,y:123+Math.cos(theta)*length,hp:100,ropeHp:60,alive:true,falling:false,vx:0,vy:0,rotation:0});
    }
  }
  changed(){this.revision++;}
  living(team){return this.pets.filter(p=>p.team===team&&p.alive);}
  select(id){const p=this.pets[id];if(this.phase!=='aim'||!p?.alive||p.team!==this.turn)return false;this.selected=id;this.changed();return true;}
  setAim(angle,power){this.angle=clamp(angle,5,82);this.power=clamp(power,15,100);this.changed();}
  setAmmo(id){if(this.phase==='aim'&&AMMO[id]){this.ammo=id;this.changed();}}
  launchVector(){
    const sign=this.turn===0?1:-1,angle=this.angle*Math.PI/180,speed=(180+this.power*4.9)*AMMO[this.ammo].speed;
    return {vx:sign*Math.cos(angle)*speed,vy:-Math.sin(angle)*speed};
  }
  shotOrigin(){const p=this.pets[this.selected],v=this.launchVector(),len=Math.hypot(v.vx,v.vy);return {x:p.x+v.vx/len*36,y:p.y+v.vy/len*36};}
  shoot(){
    if(this.phase!=='aim'||!this.pets[this.selected]?.alive)return false;
    const origin=this.shotOrigin(),v=this.launchVector();
    this.projectile={...origin,...v,team:this.turn,ammo:this.ammo,age:0,trail:[]};this.phase='flight';this.events.push({type:'shoot',...origin});this.changed();return true;
  }
  collision(ax,ay,bx,by,team,ammo){
    const r=AMMO[ammo].radius,hits=[];
    for(const p of this.pets){
      if(!p.alive||p.team===team)continue;
      const body=segmentCircleHit(ax,ay,bx,by,p.x,p.y,27+r);
      const rope=capsuleHit(ax,ay,bx,by,p.anchorX,p.anchorY,p.x,p.y-23,3+r);
      if(body!==null)hits.push({t:body,pet:p,kind:'body'});
      if(rope!==null)hits.push({t:rope,pet:p,kind:'rope'});
    }
    hits.sort((a,b)=>a.t-b.t);return hits[0]||null;
  }
  damage(p,kind,amount,impact){
    if(!p.alive)return;
    if(kind==='rope')p.ropeHp=Math.max(0,p.ropeHp-amount);else p.hp=Math.max(0,p.hp-amount);
    p.omega+=clamp((impact.vx||0)*.0009,-.55,.55);
    this.events.push({type:'damage',x:p.x,y:kind==='rope'?p.y-48:p.y-28,text:kind==='rope'?`绳索 −${Math.round(amount)}`:`−${Math.round(amount)}`,team:p.team});
    if(p.hp<=0||p.ropeHp<=0){p.alive=false;p.falling=true;p.vx=(impact.vx||100)*.20;p.vy=-70;this.events.push({type:'drop',x:p.x,y:p.y});}
    this.changed();
  }
  impact(hit,shot){
    const a=AMMO[shot.ammo];this.damage(hit.pet,hit.kind,hit.kind==='rope'?a.ropeDamage:a.damage,shot);
    if(a.blast){
      for(const p of this.pets){
        if(!p.alive||p.team===shot.team||p===hit.pet)continue;
        const body=Math.hypot(p.x-shot.x,p.y-shot.y),rope=pointSegmentDistance(shot.x,shot.y,p.anchorX,p.anchorY,p.x,p.y-23);
        if(body<a.blast+27)this.damage(p,'body',Math.round(a.damage*(1-body/(a.blast+50))*.9),shot);
        if(rope<a.blast)this.damage(p,'rope',Math.round(a.ropeDamage*(1-rope/(a.blast+20))),shot);
      }
    }
    this.events.push({type:'impact',x:shot.x,y:shot.y,color:a.color,radius:a.blast||32});
    this.projectile=null;this.phase='resolve';this.resolveTime=1.25;this.changed();
  }
  finishTurn(){
    const left=this.living(0).length,right=this.living(1).length;
    if(!left||!right){this.winner=left?0:right?1:-1;this.phase='over';this.events.push({type:'win',team:this.winner});}
    else{this.turn=1-this.turn;this.round++;this.selected=this.living(this.turn)[0].id;this.phase='aim';this.events.push({type:'turn',team:this.turn});}
    this.changed();
  }
  step(dt=WORLD.step){
    this.time+=dt;
    for(const p of this.pets){
      if(p.falling){p.vy+=WORLD.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rotation+=p.vx*.003*dt;
        if(p.y>WORLD.water+24){p.falling=false;p.y=WORLD.water+50;this.events.push({type:'splash',x:p.x,y:WORLD.water});}}
      else if(p.alive){p.omega+=(-2.1*Math.sin(p.theta)-p.omega*1.5+Math.sin(this.time*1.15+p.id)*.025)*dt;p.theta+=p.omega*dt;
        p.x=p.anchorX+Math.sin(p.theta)*p.length;p.y=p.anchorY+Math.cos(p.theta)*p.length;}
    }
    if(this.projectile){
      const s=this.projectile,ax=s.x,ay=s.y;s.vy+=WORLD.gravity*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.age+=dt;
      const hit=this.collision(ax,ay,s.x,s.y,s.team,s.ammo);
      if(hit){s.x=ax+(s.x-ax)*hit.t;s.y=ay+(s.y-ay)*hit.t;this.impact(hit,s);}
      else if(s.x<-90||s.x>WORLD.width+90||s.y>WORLD.water||s.age>7){
        this.events.push({type:s.y>WORLD.water?'splash':'miss',x:s.x,y:Math.min(s.y,WORLD.water)});this.projectile=null;this.phase='resolve';this.resolveTime=.8;this.changed();
      }else if(Math.floor(s.age*45)!==Math.floor((s.age-dt)*45)){s.trail.push({x:s.x,y:s.y});if(s.trail.length>17)s.trail.shift();}
    }else if(this.phase==='resolve'){this.resolveTime-=dt;if(this.resolveTime<=0)this.finishTurn();}
  }
  trajectory(){
    if(this.phase!=='aim')return [];
    const v=this.launchVector(),s={...this.shotOrigin(),...v},points=[];
    for(let i=0;i<170;i++){
      const ax=s.x,ay=s.y;s.vy+=WORLD.gravity*WORLD.step;s.x+=s.vx*WORLD.step;s.y+=s.vy*WORLD.step;
      if(i%5===0)points.push({x:s.x,y:s.y});
      if(this.collision(ax,ay,s.x,s.y,this.turn,this.ammo)||s.y>WORLD.water||s.x<0||s.x>WORLD.width)break;
    }
    return points;
  }
}
