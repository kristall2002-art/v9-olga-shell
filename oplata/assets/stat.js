/* Счётчик посещений olga-sshell.ru для админки бота @olgasshell_bot (03.11.2026).
   Без cookie и без IP: на сервер уходят только событие, источник одним словом и страница.
   Визит — раз на вкладку (метка в sessionStorage, на сервер не уходит). Работает только на olga-sshell.ru. */
(function(){
"use strict";
var host=location.hostname;
if(host!=="olga-sshell.ru"&&host!=="www.olga-sshell.ru")return;
var ua=navigator.userAgent||"";
if(navigator.webdriver||/bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(ua))return;
/* свои заходы Ольги и Сергея: один раз открыть olga-sshell.ru/#nostat — этот браузер больше не считается */
try{if(location.hash==="#nostat")localStorage.setItem("os-nostat","1");if(localStorage.getItem("os-nostat"))return;}catch(x){}
var URL_HIT="https://stat.olga-sshell.ru/h";
function send(e,s){
  var u=URL_HIT+"?e="+e+"&s="+encodeURIComponent(s)+"&p="+encodeURIComponent(location.pathname);
  try{if(navigator.sendBeacon&&navigator.sendBeacon(u))return;}catch(x){}
  try{fetch(u,{method:"POST",mode:"no-cors",keepalive:true});}catch(x){(new Image()).src=u;}
}
/* откуда пришли: метка в ссылке (?from= или utm_source), иначе по адресу предыдущей страницы */
function source(){
  var tag="";
  try{var q=new URLSearchParams(location.search);tag=q.get("from")||q.get("utm_source")||"";}catch(x){}
  tag=tag.toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,30);
  if(tag)return "u:"+tag;
  var r;try{r=new URL(document.referrer);}catch(x){return "none";}
  var d=r.hostname.toLowerCase().replace(/^www\./,"");
  if(d==="olga-sshell.ru")return "";
  if(/(^|\.)(yandex\.[a-z]+|ya\.ru)$/.test(d))return /^\/maps/.test(r.pathname)?"yamaps":"ya";
  if(/(^|\.)google\.[a-z.]+$/.test(d))return "google";
  if(/(^|\.)(t\.me|telegram\.org|telegram\.me)$/.test(d))return "tg";
  if(/(^|\.)(vk\.com|vk\.ru)$/.test(d))return "vk";
  if(/(^|\.)max\.ru$/.test(d))return "max";
  if(/(^|\.)instagram\.com$/.test(d))return "ig";
  if(/(^|\.)(whatsapp\.com|wa\.me)$/.test(d))return "wa";
  if(/(^|\.)2gis\.[a-z]+$/.test(d))return "2gis";
  return "d:"+d.replace(/[^a-z0-9.-]/g,"").slice(0,60);
}
try{
  if(!sessionStorage.getItem("os-v")){
    var s=source();
    sessionStorage.setItem("os-v","1");
    if(s)send("v",s);
  }
}catch(x){var s2=source();if(s2)send("v",s2);}
/* нажатия: «Записаться» (бот в Telegram), MAX, написать Ольге, позвонить */
var KINDS=[
  [/^https:\/\/t\.me\/olgasshell_bot/i,"book"],
  [/^https:\/\/max\.ru\/se14525840_bot/i,"maxbot"],
  [/^https:\/\/t\.me\/olga_sshell(\/|\?|$)/i,"tg"],
  [/^https:\/\/wa\.me\//i,"wa"],
  [/^tel:/i,"phone"],
  [/^mailto:/i,"mail"],
  [/^https:\/\/t\.me\/olga_sshelll/i,"tgchannel"],
  [/^https:\/\/max\.ru\/se14525840_biz/i,"maxchannel"],
  [/instagram\.com/i,"ig"]
];
document.addEventListener("click",function(ev){
  var a=ev.target&&ev.target.closest?ev.target.closest("a[href]"):null;if(!a)return;
  var h=a.href||"";
  for(var i=0;i<KINDS.length;i++){if(KINDS[i][0].test(h)){send("c",KINDS[i][1]);return;}}
},true);
})();
