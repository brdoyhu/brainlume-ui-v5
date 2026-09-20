/* Three-channel illustrative EEG. No sensor data or clinical calculations. */
const previousSessionView=session;
const eegScreens=['measure','before','after'];
let eegSeconds=4,eegLastScreen='',eegLastFrame=0,eegLastPaint=0;
session=function(){
 if(!eegScreens.includes(S.screen))return previousSessionView();
 if(eegLastScreen!==S.screen){eegSeconds=4;eegLastScreen=S.screen;}
 const blocked=S.bad||S.disconnected;
 const status=S.disconnected?'Disconnected':S.bad?'Check contact':S.paused?'Paused':'Recording';
 return `<div class="session eeg-session ${blocked?'signal-blocked':''}">${S.screen==='measure'?'<div class="measure-top">State check · About 3 minutes</div>':steps()}<div class="eeg-heading"><h1>Your brain activity.</h1><p>Stay still and let the signal settle.</p></div><section class="eeg-panel" aria-label="Three simulated EEG channels"><div class="eeg-panel-head"><h2>EEG signals</h2><span class="eeg-status ${blocked?'warning':''}"><i></i>${status}</span></div><div class="eeg-meta"><span>3 channels · Simulated data</span><span>±50 µV</span></div>${[1,2,3].map((c)=>`<div class="eeg-channel channel-${c}"><div class="eeg-channel-head"><strong>CH${c}</strong><span><b data-eeg-value="${c}">—</b> <small>µV</small></span></div><svg viewBox="0 0 300 72" role="img" aria-label="Channel ${c} simulated EEG waveform"><path class="eeg-grid" d="M0 12H300M0 36H300M0 60H300M0 0V72M75 0V72M150 0V72M225 0V72M300 0V72"/><path class="eeg-trace" data-eeg-path="${c}" d="M0 36H300"/></svg></div>`).join('')}<div class="eeg-axis"><span>−4 s</span><span>−2 s</span><span>Now</span></div></section>${blocked?`<div class="banner warning">${S.disconnected?'Connection lost. Completed stages are saved. Reconnect to continue.':'Adjust the forehead contact and stay still. Recording will continue when the signal improves.'}</div>`:''}<div class="eeg-time"><div class="timer" id="timer">${time(S.elapsed)}</div><div class="timer-label">${blocked?'Waiting for signal':S.paused?'Recording paused':'Active recording time'}</div><div class="timer-label" id="valid">Valid signal collected: ${time(S.elapsed)}</div></div><p class="eeg-note">${blocked?'Traces are held. No new samples are being recorded.':S.paused?'Traces are held while recording is paused.':'Live-style preview only · Not a real EEG reading.'}</p><div class="session-actions">${S.disconnected?btn('Reconnect','reconnect','secondary'):S.bad?btn('Check contact','good-signal','secondary'):btn(`${icon(S.paused?'play':'pause')} ${S.paused?'Resume':'Pause'}`,'pause','secondary')}${btn('End session','end','secondary')}</div></div>`;
};
function eegSample(t,c){
 const amplitude=1+.23*Math.sin(t*.67+c);
 return amplitude*(13*Math.sin(2*Math.PI*(8.4+c*.73)*t+c)+6*Math.sin(2*Math.PI*(4.3+c*.3)*t+2*c)+3*Math.sin(2*Math.PI*(18.6+c)*t)+2*Math.sin(2*Math.PI*31.7*t+c*.6));
}
function paintEEG(){
 for(let c=1;c<=3;c++){
  const path=document.querySelector(`[data-eeg-path="${c}"]`);if(!path)continue;
  let d='';for(let i=0;i<=384;i++){const t=eegSeconds-4+i/96;d+=(i?'L':'M')+(i*300/384).toFixed(2)+' '+(36-eegSample(t,c)*.58).toFixed(2);}
  path.setAttribute('d',d);
  const value=document.querySelector(`[data-eeg-value="${c}"]`);
  value.textContent=S.bad||S.disconnected?'—':eegSample(eegSeconds,c).toFixed(1);
 }
}
const reducedEEGMotion=matchMedia('(prefers-reduced-motion: reduce)');
function eegFrame(now){
 const dt=eegLastFrame?Math.min((now-eegLastFrame)/1000,.1):0;eegLastFrame=now;
 const visible=eegScreens.includes(S.screen)&&!document.hidden;
 if(visible){
  if(!S.paused&&!S.bad&&!S.disconnected&&!S.modal)eegSeconds+=dt;
  if(now-eegLastPaint>(reducedEEGMotion.matches?1000:50)){paintEEG();eegLastPaint=now;}
 }else eegLastScreen='';
 requestAnimationFrame(eegFrame);
}
document.addEventListener('click',e=>{const action=e.target.closest('[data-action]')?.dataset.action;if(['start-check','start-recovery','wear-ready','preview'].includes(action)){eegSeconds=4;eegLastPaint=0}},true);
render();paintEEG();requestAnimationFrame(eegFrame);
