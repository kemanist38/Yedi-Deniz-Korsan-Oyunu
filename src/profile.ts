// Kaptan profili: oyuncu nicki. İlk ad ücretsizdir; sonraki her değişiklik inci tutar ve iki değişiklik arasında 1 gün beklenir.
export type Profile={nick:string;changedAt:number;named:boolean};
export const NICK_CHANGE_COST=50;
export const NICK_COOLDOWN_MS=24*60*60*1000;
export const NICK_MIN=3,NICK_MAX=16;
const STORAGE='kara-yelken-profile-v1';
export function loadProfile():Profile{
  try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw&&typeof raw.nick==='string')return{nick:raw.nick,changedAt:raw.changedAt||0,named:!!raw.named};}catch{}
  return{nick:'Kaptan',changedAt:0,named:false};
}
export function saveProfile(p:Profile){try{localStorage.setItem(STORAGE,JSON.stringify(p));}catch{}}
// Harf, rakam, alt çizgi ve nokta; 3–16 karakter
export function nickError(n:string){if(n.length<NICK_MIN||n.length>NICK_MAX)return`Nick ${NICK_MIN}–${NICK_MAX} karakter olmalı`;if(!/^[\p{L}\p{N}_.]+$/u.test(n))return'Nick yalnızca harf, rakam, _ ve . içerebilir';return'';}
// Seviyeye göre kaptan rütbesi (gemi altındaki unvan)
export const RANKS=['Miço','Tayfa','Lostromo','Serdümen','Kaptan','Süvari Kaptan','Kaptan Paşa','Amiral','Kaptan-ı Deryâ'];
export const rankOf=(level:number)=>RANKS[Math.max(0,Math.min(RANKS.length-1,level-1))];
