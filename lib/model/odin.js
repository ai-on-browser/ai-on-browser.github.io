export default class ODIN{constructor(t=5,r=0){this._k=t,this._t=r}_d(t,r){return Math.sqrt(t.reduce(((t,e,s)=>t+(e-r[s])**2),0))}predict(t){const r=t.length,e=[];for(let s=0;s<r;s++){e[s]=[],e[s][s]=0;for(let r=0;r<s;r++)e[s][r]=e[r][s]=this._d(t[s],t[r])}const s=Array(r).fill(0);for(let t=0;t<r;t++){const r=e[t].map(((t,r)=>[t,r]));r.sort(((t,r)=>t[0]-r[0]));for(let t=1;t<Math.min(this._k+1,r.length);t++)s[r[t][1]]+=1}return s.map((t=>t<=this._t))}}