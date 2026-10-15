import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
window.__museumModuleReady=true;document.getElementById('engineWarning')?.remove();const $=id=>document.getElementById(id);
const video=$('tour');
// Audio is started within the Enter click gesture to respect browser autoplay rules.
const music=$('museumMusic');
const soundButton=$('audioToggle');
const BASE_VOLUME=0.68;
const ARCHIVE_VOLUME=BASE_VOLUME*0.30;
let soundEnabled=true,fadeToken=0,audioContext=null;
music.volume=BASE_VOLUME;
function reflectSound(){soundButton.textContent=soundEnabled?'SOUND ON ◖))':'SOUND OFF ◖×';soundButton.setAttribute('aria-pressed',String(!soundEnabled));}
function fadeMusic(target,seconds=1){
  const token=++fadeToken;
  const startVolume=music.volume, start=performance.now(), duration=Math.max(.01,seconds)*1000;
  function tick(now){if(token!==fadeToken)return;const x=Math.min(1,(now-start)/duration);const smooth=x*x*(3-2*x);music.volume=startVolume+(target-startVolume)*smooth;if(x<1)requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
}
function startMusic(){if(!soundEnabled)return;music.volume=open?ARCHIVE_VOLUME:BASE_VOLUME;music.play().catch(err=>{console.warn('Music playback was blocked:',err);soundEnabled=false;reflectSound();});}
function scanChime(){
  if(!soundEnabled)return;
  try{
    audioContext??=new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
    const now=audioContext.currentTime;
    [670,940].forEach((freq,i)=>{
      const osc=audioContext.createOscillator();const gain=audioContext.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(freq,now+i*.075);osc.frequency.exponentialRampToValueAtTime(freq*1.16,now+i*.075+.18);
      gain.gain.setValueAtTime(.0001,now+i*.075);
      gain.gain.exponentialRampToValueAtTime(.045,now+i*.075+.025);
      gain.gain.exponentialRampToValueAtTime(.0001,now+i*.075+.38);
      osc.connect(gain).connect(audioContext.destination);osc.start(now+i*.075);osc.stop(now+i*.075+.4);
    });
  }catch(err){console.warn('Scan cue unavailable',err)}
}
soundButton.addEventListener('click',()=>{
  soundEnabled=!soundEnabled;
  if(soundEnabled){music.volume=open?ARCHIVE_VOLUME:BASE_VOLUME;startMusic();}
  else{++fadeToken;music.pause();}
  reflectSound();
});
reflectSound();
// Confirmed mapping: specimen 02 is a control specimen with no video trigger.
const stops=[{time:10,id:1},{time:14,id:9},{time:17,id:3},{time:19,id:4},{time:24,id:5},{time:25,id:8},{time:29,id:6},{time:34,id:7},{time:37,id:10}];
let records=[], activeIndex=-1, active=null, lastTime=0, open=false;
const completed=new Set();
const byId=id=>records.find(r=>r.id===id);
const format=t=>`${String(Math.floor((t||0)/60)).padStart(2,'0')}:${String(Math.floor((t||0)%60)).padStart(2,'0')}`;
fetch('specimens.json').then(r=>{if(!r.ok)throw Error('Archive data unavailable');return r.json()}).then(r=>records=r).catch(err=>{console.error(err);$('enter').disabled=true;$('enter').textContent='ARCHIVE DATA UNAVAILABLE'});
function showPause(index){activeIndex=index;active=byId(stops[index].id);if(!active)return;completed.add(index);video.pause();$('detectedName').textContent=active.name;$('detectedCase').textContent='CASE NO. '+active.case;$('pauseOverlay').classList.add('visible');}
function checkStops(){if(activeIndex>=0||open||!records.length)return;const t=video.currentTime;if(t<lastTime-.6){ // seek backwards re-arms subsequent stops
 for(let i=0;i<stops.length;i++)if(stops[i].time>=t)completed.delete(i);
 }for(let i=0;i<stops.length;i++){if(completed.has(i))continue;const st=stops[i];if(lastTime<=st.time+.12&&t>=st.time){showPause(i);break;}}lastTime=t;}
video.addEventListener('timeupdate',()=>{checkStops();$('clock').textContent=`${format(video.currentTime)} / ${format(video.duration||58.36)}`;$('progress').style.width=(video.currentTime/(video.duration||58.36)*100)+'%';});
video.addEventListener('seeked',()=>{lastTime=video.currentTime;});
$('enter').onclick=async()=>{startMusic();$('intro').classList.add('hidden');if(video.ended){video.currentTime=0;completed.clear()}lastTime=video.currentTime;await video.play().catch(console.error)};
$('toggle').onclick=()=>{if(activeIndex>=0||open)return;if(video.paused)video.play();else video.pause()};
video.addEventListener('play',()=>{$('toggle').textContent='PAUSE II'});video.addEventListener('pause',()=>{$('toggle').textContent='PLAY ▶'});
video.addEventListener('ended',()=>{if(soundEnabled)fadeMusic(0,1);music.pause();music.currentTime=0;$('intro').classList.remove('hidden');$('enter').textContent='RESTART EXPLORATION →';activeIndex=-1;completed.clear();});
function continueTour(){activeIndex=-1;active=null;$('pauseOverlay').classList.remove('visible');lastTime=video.currentTime;video.play().catch(console.error)}
$('skip').onclick=continueTour;$('hotspot').onclick=()=>{if(active)openArchive(active)};
const escapeHTML=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function openArchive(r){scanChime();if(soundEnabled)fadeMusic(ARCHIVE_VOLUME,0.9);open=true;$('archive').classList.add('open');$('cvName').textContent=r.name;$('caseNumber').textContent=r.case;$('basic').innerHTML=[['DATE OF DISCOVERY',r.date],['HEIGHT',r.height],['WEIGHT',r.weight],['GENDER',r.gender]].map(([k,v])=>`<div class="meta"><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join('');for(const id of ['security','risk','stars','features','behavior','notes'])$(id).textContent=r[id];$('viewId').textContent='SPECIMEN '+String(r.id).padStart(2,'0')+' / '+r.case;$('fallback').src=r.image;$('loading').style.display='block';$('loading').textContent='LOADING SPECIMEN SCAN…';document.querySelector('.cv').scrollTop=0;loadModel(r);}
$('close').onclick=()=>{if(soundEnabled)fadeMusic(BASE_VOLUME,1);open=false;$('archive').classList.remove('open');disposeCurrent();continueTour()};window.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)$('close').click()});
let renderer,scene,camera,holder,pointCloud,solid,requestedId=0,spin=true,showSolid=false,raf=0,orbit=0,pitch=0,mouseDown=false,mouseX=0,mouseY=0;
const canvas=$('glcanvas'),viewer=$('viewer');
function ensureRenderer(){if(renderer)return;renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(37,1,.01,200);scene.add(new THREE.AmbientLight(0xcbeaff,1.6));const light=new THREE.DirectionalLight(0x86daff,2.1);light.position.set(3,4,5);scene.add(light);holder=new THREE.Group();scene.add(holder);}
function disposeCurrent(){requestedId++;cancelAnimationFrame(raf);if(holder){while(holder.children.length){const c=holder.children[0];holder.remove(c);c.traverse(o=>{if(o.geometry?.userData?.generated)o.geometry.dispose();if(o.material?.userData?.generated)o.material.dispose()})}}pointCloud=null;solid=null;}
function modelCloud(source){const meshes=[];source.traverse(o=>{if(o.isMesh&&o.geometry?.attributes?.position)meshes.push(o)});if(!meshes.length)throw Error('No mesh found in GLB');source.updateMatrixWorld(true);
// Compute area-weighted sample allocation, so complex models get consistent dot density.
const measures=meshes.map(m=>{const geom=m.geometry;const pos=geom.getAttribute('position');const ix=geom.index;let area=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3();const limit=ix?ix.count:pos.count;for(let i=0;i<limit-2;i+=3){const ai=ix?ix.getX(i):i,bi=ix?ix.getX(i+1):i+1,ci=ix?ix.getX(i+2):i+2;a.fromBufferAttribute(pos,ai).applyMatrix4(m.matrixWorld);b.fromBufferAttribute(pos,bi).applyMatrix4(m.matrixWorld);c.fromBufferAttribute(pos,ci).applyMatrix4(m.matrixWorld);ab.subVectors(b,a);ac.subVectors(c,a);area+=ab.cross(ac).length()*.5}return area});const total=measures.reduce((a,b)=>a+b,0)||1;const positions=[];let count=0;const p=new THREE.Vector3();for(let k=0;k<meshes.length;k++){let mesh=meshes[k];if(!measures[k])continue;let sampleCount=Math.max(120,Math.round(19000*measures[k]/total));const sampler=new MeshSurfaceSampler(mesh).build();for(let i=0;i<sampleCount;i++){sampler.sample(p);p.applyMatrix4(mesh.matrixWorld);positions.push(p.x,p.y,p.z);}count+=sampleCount}
const pointsGeometry=new THREE.BufferGeometry();pointsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));pointsGeometry.userData.generated=true;const mat=new THREE.PointsMaterial({color:0x54dfff,size:.012,sizeAttenuation:true,transparent:true,opacity:.87,depthWrite:false});mat.userData.generated=true;return {points:new THREE.Points(pointsGeometry,mat),count};}
function loadModel(r){disposeCurrent();$('fallback').style.display='none';if(!r.model){showFallback('NO 3D MODEL PROVIDED');return}const id=requestedId;try{ensureRenderer()}catch(err){console.error(err);showFallback('WEBGL UNAVAILABLE');return}new GLTFLoader().load(r.model,gltf=>{if(id!==requestedId)return;try{const root=gltf.scene;root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());const max=Math.max(size.x,size.y,size.z)||1;const result=modelCloud(root);pointCloud=result.points;const solidGroup=root.clone(true);solid=solidGroup;const transform=new THREE.Group();transform.position.copy(center).multiplyScalar(-2.65/max);transform.scale.setScalar(2.65/max);transform.add(pointCloud);const solidTransform=new THREE.Group();solidTransform.position.copy(center).multiplyScalar(-2.65/max);solidTransform.scale.setScalar(2.65/max);solidTransform.add(solidGroup);holder.add(transform,solidTransform);solidTransform.visible=false;$('pointCount').textContent=result.count.toLocaleString()+' POINTS / TRUE GLB';$('loading').style.display='none';orbit=0;pitch=0;spin=true;showSolid=false;$('toggleMode').textContent='SHOW SOLID';$('toggleSpin').textContent='PAUSE ROTATION';camera.position.set(0,.05,5.1);camera.lookAt(0,0,0);animate();}catch(err){console.error(err);showFallback('MODEL SCAN FAILED')};},undefined,err=>{console.error(err);if(id===requestedId)showFallback('MODEL FAILED TO LOAD')});}
function showFallback(message){$('loading').textContent=message;$('fallback').style.display='block';$('pointCount').textContent='REFERENCE IMAGE';}
function animate(){if(!open||!renderer)return;raf=requestAnimationFrame(animate);const w=viewer.clientWidth,h=viewer.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}if(spin)orbit+=.004;holder.rotation.y=orbit;holder.rotation.x=pitch;renderer.render(scene,camera)}
$('toggleSpin').onclick=()=>{spin=!spin;$('toggleSpin').textContent=spin?'PAUSE ROTATION':'AUTO ROTATE'};
$('toggleMode').onclick=()=>{if(!holder||holder.children.length<2)return;showSolid=!showSolid;holder.children[0].visible=!showSolid;holder.children[1].visible=showSolid;$('toggleMode').textContent=showSolid?'SHOW POINT CLOUD':'SHOW SOLID'};
$('resetCamera').onclick=()=>{orbit=0;pitch=0;if(camera){camera.position.set(0,.05,5.1);camera.lookAt(0,0,0)}};
canvas.addEventListener('pointerdown',e=>{mouseDown=true;mouseX=e.clientX;mouseY=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!mouseDown)return;orbit+=(e.clientX-mouseX)*.008;pitch=Math.max(-.7,Math.min(.7,pitch+(e.clientY-mouseY)*.005));mouseX=e.clientX;mouseY=e.clientY});canvas.addEventListener('pointerup',()=>mouseDown=false);canvas.addEventListener('pointercancel',()=>mouseDown=false);
canvas.addEventListener('wheel',e=>{if(open&&camera){e.preventDefault();camera.position.z=Math.max(3,Math.min(9,camera.position.z+e.deltaY*.003))}},{passive:false});
