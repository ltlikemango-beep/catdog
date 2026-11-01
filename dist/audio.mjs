// 背景音乐独立于战斗音效；只在真实用户操作之后请求播放。
export function setupMusic(){
  const track=document.getElementById('backgroundMusic');
  const button=document.getElementById('musicButton');
  const label=document.getElementById('musicLabel');
  const key='catdog.music.enabled';
  let enabled=true,interacted=false,failed=false,waiting=false;
  try{enabled=localStorage.getItem(key)!=='off';}catch{}
  track.volume=.22;
  function render(){
    label.textContent=failed?'音乐：重试':waiting?'音乐：点按播放':`音乐：${enabled?'开':'关'}`;
    button.setAttribute('aria-pressed',String(enabled));
    button.setAttribute('aria-label',failed?'重新加载背景音乐':enabled?'关闭背景音乐':'开启背景音乐');
    button.title=enabled?'青青树林 · 60 秒循环，首次点按后播放':'背景音乐已关闭';
  }
  async function play(){
    if(!enabled||!interacted||document.hidden)return;
    try{
      await track.play();
      // 用户可能在加载音频期间关闭了音乐或切到了后台。
      if(!enabled||document.hidden)track.pause();
      failed=false;waiting=false;
    }catch(error){
      if(!enabled||document.hidden)return;
      if(error.name==='AbortError')return;
      waiting=error.name==='NotAllowedError';failed=!waiting;
    }
    render();
  }
  function activate(event){if(!event.isTrusted)return;interacted=true;void play();}
  document.addEventListener('pointerdown',activate,{capture:true});
  document.addEventListener('click',activate,{capture:true});
  document.addEventListener('keydown',activate,{capture:true});
  button.addEventListener('click',()=>{
    interacted=true;
    if(failed&&enabled){failed=false;track.load();}
    else enabled=!enabled;
    try{localStorage.setItem(key,enabled?'on':'off');}catch{}
    if(enabled)void play();else{track.pause();waiting=false;}
    render();
  });
  track.addEventListener('error',()=>{failed=true;render();});
  track.addEventListener('playing',()=>{failed=false;waiting=false;render();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)track.pause();else void play();});
  window.addEventListener('pagehide',()=>track.pause());
  window.addEventListener('pageshow',()=>{if(interacted)void play();});
  render();
}
