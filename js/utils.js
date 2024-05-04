var c=Object.defineProperty;var i=(r,t)=>c(r,"name",{value:t,configurable:!0});export class BaseWorker{static{i(this,"BaseWorker")}constructor(t,e){this._worker=new Worker(t,e)}_postMessage(t){const e=new Promise(s=>{const o=i(l=>{this._worker.removeEventListener("message",o,!1),s(l)},"event_cb");this._worker.addEventListener("message",o,!1)});return this._worker.postMessage(t),e}terminate(){this._worker.terminate()}}const a=i((r,t,e)=>({r,g:t,b:e,toString(){return`rgb(${r}, ${t}, ${e})`}}),"rgb"),n={"-2":a(255,0,0),"-1":a(255,255,255),0:a(0,0,0)};export const specialCategory={error:-2,errorRate:r=>-1-r,dummy:-2,density:r=>-1+r,never:-3},getCategoryColor=i(function(r){if(isNaN(r))return n[0];if(!Number.isInteger(r)){let t=getCategoryColor(Math.floor(r)),e=getCategoryColor(Math.ceil(r)),s=r-Math.floor(r);return a(Math.round(t.r+(e.r-t.r)*s),Math.round(t.g+(e.g-t.g)*s),Math.round(t.b+(e.b-t.b)*s))}if(r=r%1e3,!n[r]){let t=0;for(;;){t+=1;const e=[Math.random(),Math.random(),Math.random()];if(e.every(o=>o>.8))continue;let s=1/0;for(const o of Object.keys(n)){if(+o<0||Math.abs(+o-r)>10)continue;const l=(e[0]-n[o].r/256)**2+(e[1]-n[o].g/256)**2+(e[2]-n[o].b/256)**2;l<s&&(s=l)}if(Math.random()-t/200<Math.sqrt(s/3)){n[r]=a(Math.floor(e[0]*256),Math.floor(e[1]*256),Math.floor(e[2]*256));break}}}return n[r]},"getCategoryColor");export class EventEmitter{static{i(this,"EventEmitter")}constructor(){this._listeners={}}on(t,e,s=!1){this._listeners[t]||(this._listeners[t]=[]),this._listeners[t].push({cb:e,once:s})}once(t,e){this.on(t,e,!0)}emit(t,...e){const s=this._listeners[t];if(s)for(let o=s.length-1;o>=0;o--)s[o].cb(...e),s[o].once&&s.splice(o,1)}off(t,e){const s=this._listeners[t];if(s)for(let o=s.length-1;o>=0;o--)s[o]===e&&s.splice(o,1)}}
