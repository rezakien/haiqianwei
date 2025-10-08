//Video loading
$('head').append(`<style>lite-youtube {width:100%;max-width:720px;margin:0 auto;background-color:#000;position:relative;display:block;contain:content;background-position:center center;background-size:cover;cursor:pointer;}
lite-youtube::before {content:'';display:block;position:absolute;top:0;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==);background-position:top;background-repeat:repeat-x;height:60px;padding-bottom:50px;width:100%;transition:all 0.2s cubic-bezier(0,0,0.2,1);}
lite-youtube::after {content:"";display:block;padding-bottom:calc(100% / (16 / 9));}
lite-youtube > iframe {width:100%;height:100%;position:absolute;top:0;left:0;border:0;}
lite-youtube > .lty-playbtn {display:block;width:68px;height:48px;position:absolute;cursor:pointer;transform:translate3d(-50%,-50%,0);top:50%;left:50%;z-index:1;background-color:transparent;background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24 27 14v20" fill="white"/></svg>');filter:grayscale(100%);transition:filter .1s cubic-bezier(0,0,0.2,1);border:none;}
lite-youtube:hover > .lty-playbtn,lite-youtube .lty-playbtn:focus {filter:none;}
lite-youtube.lyt-activated {cursor:unset;}
lite-youtube.lyt-activated::before,lite-youtube.lyt-activated > .lty-playbtn {opacity:0;pointer-events:none;}
.lyt-visually-hidden {clip:rect(0 0 0 0);clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px;}</style>`)

class LiteYTEmbed extends HTMLElement {
connectedCallback(){
this.videoId = this.getAttribute('videoid');
let playBtnEl = this.querySelector('.lty-playbtn');
this.playLabel = (playBtnEl && playBtnEl.textContent.trim()) || this.getAttribute('playlabel') || 'Play';
if (!this.style.backgroundImage){
this.style.backgroundImage = `url("https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg")`;
}
if (!playBtnEl){
playBtnEl = document.createElement('button');
playBtnEl.type = 'button';
playBtnEl.classList.add('lty-playbtn');
this.append(playBtnEl);}
if (!playBtnEl.textContent){
const playBtnLabelEl = document.createElement('span');
playBtnLabelEl.className = 'lyt-visually-hidden';
playBtnLabelEl.textContent = this.playLabel;
playBtnEl.append(playBtnLabelEl);}
playBtnEl.removeAttribute('href');
this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {once: true});
this.addEventListener('click', this.addIframe);
this.needsYTApiForAutoplay = navigator.vendor.includes('Apple') || navigator.userAgent.includes('Mobi');}
static addPrefetch(kind, url, as){
const linkEl = document.createElement('link');
linkEl.rel = kind;
linkEl.href = url;
if (as){linkEl.as = as;}
document.head.append(linkEl);}
static warmConnections(){
if (LiteYTEmbed.preconnected) return;
LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube.com');
LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');
LiteYTEmbed.addPrefetch('preconnect', 'https://googleads.g.doubleclick.net');
LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
LiteYTEmbed.preconnected = true;}
fetchYTPlayerApi(){
if (window.YT || (window.YT && window.YT.Player)) return;
this.ytApiPromise = new Promise((res, rej) => {
var el = document.createElement('script');
el.src = 'https://www.youtube.com/iframe_api';
el.async = true;
el.onload = _ => {
YT.ready(res);};
el.onerror = rej;
this.append(el);});}

async addYTPlayerIframe(params){
this.fetchYTPlayerApi();
await this.ytApiPromise;
const videoPlaceholderEl = document.createElement('div')
this.append(videoPlaceholderEl);
const paramsObj = Object.fromEntries(params.entries());
new YT.Player(videoPlaceholderEl, {
width: '100%',videoId: this.videoId,
playerVars: paramsObj,
events: {'onReady': event => {event.target.playVideo();}}});}

async addIframe(){
if (this.classList.contains('lyt-activated')) return;
this.classList.add('lyt-activated');

const params = new URLSearchParams(this.getAttribute('params') || []);
params.append('autoplay', '1');
params.append('playsinline', '1');

if (this.needsYTApiForAutoplay){
return this.addYTPlayerIframe(params);}

const iframeEl = document.createElement('iframe');
iframeEl.width = 560;
iframeEl.height = 315;
iframeEl.title = this.playLabel;
iframeEl.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
iframeEl.allowFullscreen = true;
iframeEl.src = `https://www.youtube.com/embed/${encodeURIComponent(this.videoId)}?${params.toString()}`;
this.append(iframeEl);
iframeEl.focus();}}
customElements.define('lite-youtube', LiteYTEmbed);
//end