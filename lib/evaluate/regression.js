export const rmse=(r,t)=>{const e=r.length;if(!Array.isArray(r[0])){let l=0;for(let n=0;n<e;n++)l+=(r[n]-t[n])**2;return Math.sqrt(l/e)}const l=r[0].length,n=Array(l).fill(0);for(let l=0;l<e;l++)for(let e=0;e<r[l].length;e++)n[e]+=(r[l][e]-t[l][e])**2;return n.map((r=>Math.sqrt(r/e)))};