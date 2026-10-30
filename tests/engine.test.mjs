import test from 'node:test';
import assert from 'node:assert/strict';
import { Battle, WORLD, segmentCircleHit, capsuleHit } from '../dist/engine.mjs';
function settle(b,seconds=9){for(let i=0;i<seconds/WORLD.step;i++)b.step();}
test('高速炮弹跨过细绳和角色时仍能检测命中',()=>{
  assert.equal(segmentCircleHit(0,0,100,0,50,0,5),.45);
  assert.notEqual(capsuleHit(0,0,100,0,50,-40,50,40,4),null);
  assert.equal(capsuleHit(0,0,100,0,50,10,50,40,4),null);
});
test('只能在瞄准阶段选择己方存活角色，不能连发',()=>{
  const b=new Battle();assert.equal(b.select(3),false);assert.equal(b.select(1),true);
  assert.equal(b.shoot(),true);assert.equal(b.shoot(),false);assert.equal(b.select(2),false);
  settle(b);assert.equal(b.phase,'aim');assert.equal(b.turn,1);assert.equal(b.round,2);
});
test('重击断绳后角色出局，绳索命中不直接扣角色生命',()=>{
  const b=new Battle(),p=b.pets[3];b.setAmmo('bone');b.shoot();
  const s=b.projectile;s.x=p.x;s.y=p.y-55;
  b.impact({pet:p,kind:'rope'},s);
  assert.equal(p.ropeHp,0);assert.equal(p.hp,100);assert.equal(p.alive,false);
  assert.equal(b.living(1).length,2);settle(b,3);assert.equal(b.turn,1);
  assert.equal(b.select(p.id),false);assert.equal(p.falling,false);
});
test('普通弹两次直接命中可打落角色',()=>{
  const b=new Battle(),p=b.pets[3];b.damage(p,'body',52,{vx:400});assert.equal(p.alive,true);
  b.damage(p,'body',52,{vx:400});assert.equal(p.hp,0);assert.equal(p.alive,false);
});
test('爆破弹影响附近敌方，己方不会受伤',()=>{
  const b=new Battle(),target=b.pets[3],other=b.pets[4],friend=b.pets[0];
  other.x=target.x+40;other.y=target.y;friend.x=target.x-10;friend.y=target.y;
  b.setAmmo('burst');b.shoot();const s=b.projectile;s.x=target.x;s.y=target.y;
  b.impact({pet:target,kind:'body'},s);
  assert.equal(target.hp,66);assert.ok(other.hp<100);assert.equal(friend.hp,100);
});
test('最后一名敌方出局会结算，结算后不允许发射',()=>{
  const b=new Battle();for(const p of b.living(1))b.damage(p,'rope',100,{vx:200});
  b.phase='resolve';b.resolveTime=.1;settle(b,2);
  assert.equal(b.phase,'over');assert.equal(b.winner,0);assert.equal(b.shoot(),false);
  b.reset();assert.equal(b.phase,'aim');assert.equal(b.winner,null);assert.equal(b.living(1).length,3);
});
test('两个方向的高低角度发射都能结束，且只切换一次回合',()=>{
  for(const team of [0,1])for(const angle of [5,38,82])for(const power of [15,100]){
    const b=new Battle();b.turn=team;b.selected=team*3;b.setAim(angle,power);b.shoot();settle(b,10);
    assert.equal(b.phase,'aim');assert.equal(b.turn,1-team);assert.equal(b.round,2);
  }
});
test('真实飞行命中绳索并能完成整局',()=>{
  const b=new Battle();let shots=0;
  // Search the same public launch controls a player has, using stationary initial geometry.
  while(b.phase!=='over'&&shots<40){
    b.ammo='bone';
    let choice=null;
    for(let angle=5;angle<=82&&!choice;angle+=1)for(let power=15;power<=100&&!choice;power+=1){
      b.angle=angle;b.power=power;const v=b.launchVector(),o=b.shotOrigin();let x=o.x,y=o.y,vy=v.vy;
      for(let i=0;i<7/WORLD.step;i++){
        const ax=x,ay=y;vy+=WORLD.gravity*WORLD.step;x+=v.vx*WORLD.step;y+=vy*WORLD.step;
        const h=b.collision(ax,ay,x,y,b.turn,b.ammo);
        if(h){if(h.kind==='rope')choice={angle,power};break;}
        if(y>WORLD.water||x<0||x>1200)break;
      }
    }
    assert.ok(choice,'存在能击中目标绳索的发射参数');
    b.setAim(choice.angle,choice.power);b.shoot();shots++;
    for(let i=0;i<10/WORLD.step&&b.phase!=='aim'&&b.phase!=='over';i++)b.step();
  }
  assert.equal(b.phase,'over');assert.ok(shots<=40);
});
