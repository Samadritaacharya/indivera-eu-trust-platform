(()=>{
const head=document.head;
if(!head.querySelector('link[rel="manifest"]')){const link=document.createElement('link');link.rel='manifest';link.href='/manifest.webmanifest';head.append(link);}
if(!head.querySelector('meta[name="theme-color"]')){const meta=document.createElement('meta');meta.name='theme-color';meta.content='#171716';head.append(meta);}
let promptEvent=null;
const button=document.createElement('button');button.type='button';button.className='iv-install';button.textContent='Install';button.hidden=true;button.setAttribute('aria-label','Install IndiVera app');
const top=document.querySelector('.topbar');if(top)top.append(button);
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;button.hidden=false;});
button.addEventListener('click',async()=>{if(!promptEvent)return;promptEvent.prompt();await promptEvent.userChoice;promptEvent=null;button.hidden=true;});
window.addEventListener('appinstalled',()=>{button.hidden=true;document.documentElement.dataset.installed='true';});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{}));}
})();
