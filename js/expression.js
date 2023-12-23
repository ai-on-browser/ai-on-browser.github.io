var M=Object.defineProperty;var l=(t,e)=>M(t,"name",{value:e,configurable:!0});class a{static{l(this,"OP")}constructor(e,h,s){this.name=e,this.p=h,this.f=s}get length(){return this.f.length}}const f={"+":new a("+",4,t=>t),"-":new a("-",4,t=>-t),"!":new a("!",4,t=>t?0:1)},u={"||":new a("||",-2,(t,e)=>t||e?1:0),"&&":new a("&&",-1,(t,e)=>t||e?1:0),"==":new a("==",0,(t,e)=>t===e?1:0),"!=":new a("!=",0,(t,e)=>t!==e?1:0),"<":new a("<",0,(t,e)=>t<e?1:0),"<=":new a("<=",0,(t,e)=>t<=e?1:0),">":new a(">",0,(t,e)=>t>e?1:0),">=":new a(">=",0,(t,e)=>t>=e?1:0),"-":new a("-",1,(t,e)=>t-e),"+":new a("+",1,(t,e)=>t+e),"*":new a("*",2,(t,e)=>t*e),"/":new a("/",2,(t,e)=>t/e),"//":new a("//",2,(t,e)=>Math.floor(t/e)),"%":new a("%",2,(t,e)=>t%e),"^":new a("^",3,(t,e)=>t**e)},c={abs:Math.abs,ceil:Math.ceil,floor:Math.floor,round:Math.round,sqrt:Math.sqrt,cbrt:Math.cbrt,sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,tanh:Math.tanh,exp:Math.exp,log:Math.log,sign:Math.sign,rand:Math.random,randn:()=>Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random()),cond:(t,e,h)=>t?e:h,__at:(t,e)=>t[e]},w={pi:Math.PI,e:Math.E},g=[...Object.keys(u),...Object.keys(f),"(",")",",","[","]"];g.sort((t,e)=>e.length-t.length);const b=l(t=>{let e=0;const h=[],s=l(o=>{for(const n of g)if(n===t.slice(e+o,e+o+n.length))return n;return null},"isToken");for(;e<t.length;){if(t[e]===" "){e++;continue}const o=s(0);if(o){e+=o.length,h.push(o);continue}let n=1;for(;n<t.length-e&&!(t[e+n]===" "||s(n));n++);h.push(t.slice(e,e+n)),e+=n}return h},"tokenize"),k=l(t=>{const e=b(t),h=[],s=[];let o=!1;for(const n of e)if(w[n])h.push(w[n]),o=!0;else if(c[n])s.push(n),o=!1;else if(f[n]||u[n]){if(o&&!u[n]||!o&&!f[n])throw`Invalid operation '${n}'.`;const r=o?u[n]:f[n];for(;;){const i=s[s.length-1];if(i instanceof a&&i.p>=r.p)h.push(s.pop());else break}s.push(r),o=!1}else if(n===","){for(;;){if(s.length===0)throw"Invalid parenthesis";if(s[s.length-1]==="(")break;h.push(s.pop())}o=!1}else if(n==="(")s.push(n),o=!1;else if(n===")"){for(;;){const r=s.pop();if(!r)throw"Invalid parenthesis";if(r==="("){c[s[s.length-1]]&&h.push(s.pop());break}h.push(r)}o=!0}else if(n==="[")s.push(n),o=!1;else if(n==="]"){for(;;){const r=s.pop();if(!r)throw"Invalid parenthesis";if(r==="["){c[s[s.length-1]]&&h.push(s.pop()),h.push("__at");break}h.push(r)}o=!0}else Number.isFinite(+n)?(h.push(+n),o=!0):(h.push(n),o=!0);for(;s.length>0;)h.push(s.pop());return h},"construct"),d=l((t,e)=>{let s=t.length-1;const o=l(()=>{if(typeof t[s]=="number")return t[s--];if(Object.hasOwn(e,t[s]))return e[t[s--]];const n=t[s--];if(n instanceof a){const r=[];for(let i=0;i<n.length;i++)r.unshift(o());return n.f(...r)}if(c[n]){const r=c[n].length,i=[];for(let p=0;p<r;p++)i.unshift(o());return c[n](...i)}return 0},"calc");return o()},"execute"),m=l(t=>{const e=k(t);return h=>d(e,h)},"stringToFunction");export default m;
