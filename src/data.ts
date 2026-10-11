export const statuses = ['想看','正在追','已看完','已弃剧'] as const;
export type Drama = {id:string;title:string;country:string;year:number;total:number;watched:number;rating:number;status:typeof statuses[number];notes:string;poster:string;updated:number};
export const blank = ():Drama => ({id:crypto.randomUUID(),title:'',country:'日本',year:new Date().getFullYear(),total:12,watched:0,rating:0,status:'想看',notes:'',poster:'',updated:Date.now()});
export const samples:Drama[] = [
 ['美丽的他','日本',2021,6,6,9.2,'已看完','有些心动，藏在每一次不经意的注视里。','violet'],
 ['语义错误','韩国',2022,8,5,8.8,'正在追','从针锋相对到慢慢靠近，连日常都变得可爱。','coral'],
 ['以你的心诠释我的爱','泰国',2020,5,2,9.5,'正在追','把青春、海风和那些说不出口的心事，都留在这里。','teal'],
 ['到了30岁还是处男，似乎会变成魔法师','日本',2020,12,0,0,'想看','','blue']
].map((r,i)=>({id:`example-${i}`,title:r[0] as string,country:r[1] as string,year:r[2] as number,total:r[3] as number,watched:r[4] as number,rating:r[5] as number,status:r[6] as Drama['status'],notes:r[7] as string,poster:'',updated:Date.now()-i*60000}));
export function validate(value:unknown):Drama[] {
 if(!value || typeof value!=='object') throw Error('备份格式不正确。');
 const v=value as {version?:unknown;dramas?:unknown};
 if(v.version!==1 || !Array.isArray(v.dramas) || v.dramas.length>10000) throw Error('请导入本网站导出的版本 1 JSON 备份。');
 const ids=new Set<string>();
 return v.dramas.map((d:unknown)=>{
  if(!d || typeof d!=='object') throw Error('备份包含无效记录。');
  const x=d as Drama;
  if(typeof x.id!=='string'||!x.id||ids.has(x.id)||typeof x.title!=='string'||!x.title.trim()||x.title.length>150||typeof x.country!=='string'||x.country.length>50||typeof x.notes!=='string'||x.notes.length>20000||typeof x.poster!=='string'||(x.poster!==''&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(x.poster))||x.poster.length>15000000||!statuses.includes(x.status)||!Number.isInteger(x.year)||x.year<1900||x.year>2200||!Number.isInteger(x.total)||x.total<1||x.total>10000||!Number.isInteger(x.watched)||x.watched<0||x.watched>x.total||!Number.isFinite(x.rating)||x.rating<0||x.rating>10||!Number.isFinite(x.updated)) throw Error('备份包含无效字段、重复编号或不支持的海报格式。');
  ids.add(x.id);return {id:x.id,title:x.title.trim(),country:x.country,year:x.year,total:x.total,watched:x.watched,rating:x.rating,status:x.status,notes:x.notes,poster:x.poster,updated:x.updated};
 });
}
export function openDB():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('love-screening-room',1);r.onupgradeneeded=()=>{r.result.createObjectStore('data');};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('请关闭其他打开本网站的标签页再试。'));});}
export async function load():Promise<Drama[]>{const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');const s=tx.objectStore('data');const r=s.get('dramas');let result:Drama[]=[];r.onsuccess=()=>{result=r.result??samples;if(r.result===undefined)s.put(result,'dramas');};tx.oncomplete=()=>{db.close();resolve(result);};tx.onabort=()=>{db.close();reject(tx.error);};});}
export async function save(dramas:Drama[]){const db=await openDB();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').put(dramas,'dramas');tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>{db.close();reject(tx.error);};});}
export const backup=(dramas:Drama[])=>JSON.stringify({app:'恋爱放映室',version:1,exportedAt:new Date().toISOString(),dramas},null,2);
