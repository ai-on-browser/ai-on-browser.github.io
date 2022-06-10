class OP{constructor(t,n,e){this.name=t,this.p=n,this.f=e}get length(){return this.f.length}}const uops={"+":new OP("+",4,(t=>t)),"-":new OP("-",4,(t=>-t)),"!":new OP("!",4,(t=>t?0:1))},bops={"||":new OP("||",-2,((t,n)=>t||n?1:0)),"&&":new OP("&&",-1,((t,n)=>t||n?1:0)),"==":new OP("==",0,((t,n)=>t===n?1:0)),"!=":new OP("!=",0,((t,n)=>t!==n?1:0)),"<":new OP("<",0,((t,n)=>t<n?1:0)),"<=":new OP("<=",0,((t,n)=>t<=n?1:0)),">":new OP(">",0,((t,n)=>t>n?1:0)),">=":new OP(">=",0,((t,n)=>t>=n?1:0)),"-":new OP("-",1,((t,n)=>t-n)),"+":new OP("+",1,((t,n)=>t+n)),"*":new OP("*",2,((t,n)=>t*n)),"/":new OP("/",2,((t,n)=>t/n)),"//":new OP("//",2,((t,n)=>Math.floor(t/n))),"%":new OP("%",2,((t,n)=>t%n)),"^":new OP("^",3,((t,n)=>t**n))},funcs={abs:Math.abs,ceil:Math.ceil,floor:Math.floor,round:Math.round,sqrt:Math.sqrt,cbrt:Math.cbrt,sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,tanh:Math.tanh,exp:Math.exp,log:Math.log,sign:Math.sign,rand:Math.random,randn:()=>Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random()),cond:(t,n,e)=>t?n:e,__at:(t,n)=>t[n]},consts={pi:Math.PI,e:Math.E},tokenTable=[...Object.keys(bops),...Object.keys(uops),"(",")",",","[","]"];tokenTable.sort(((t,n)=>n.length-t.length));const tokenize=t=>{let n=0;const e=[],s=e=>{for(const s of tokenTable)if(s===t.slice(n+e,n+e+s.length))return s;return null};for(;n<t.length;){if(" "===t[n]){n++;continue}const o=s(0);if(o){n+=o.length,e.push(o);continue}let h=1;for(;h<t.length-n&&(" "!==t[n+h]&&!s(h));h++);e.push(t.slice(n,n+h)),n+=h}return e},construct=t=>{const n=tokenize(t),e=[],s=[];let o=!1;for(const t of n)if(consts[t])e.push(consts[t]),o=!0;else if(funcs[t])s.push(t),o=!1;else if(uops[t]||bops[t]){if(o&&!bops[t]||!o&&!uops[t])throw`Invalid operation '${t}'.`;const n=o?bops[t]:uops[t];for(;;){const t=s[s.length-1];if(!(t instanceof OP&&t.p>=n.p))break;e.push(s.pop())}s.push(n),o=!1}else if(","===t){for(;;){if(0===s.length)throw"Invalid parenthesis";if("("===s[s.length-1])break;e.push(s.pop())}o=!1}else if("("===t)s.push(t),o=!1;else if(")"===t){for(;;){const t=s.pop();if(!t)throw"Invalid parenthesis";if("("===t){funcs[s[s.length-1]]&&e.push(s.pop());break}e.push(t)}o=!0}else if("["===t)s.push(t),o=!1;else if("]"===t){for(;;){const t=s.pop();if(!t)throw"Invalid parenthesis";if("["===t){funcs[s[s.length-1]]&&e.push(s.pop()),e.push("__at");break}e.push(t)}o=!0}else Number.isFinite(+t)?(e.push(+t),o=!0):(e.push(t),o=!0);for(;s.length>0;)e.push(s.pop());return e},execute=(t,n)=>{let e=t.length-1;const s=()=>{if("number"==typeof t[e])return t[e--];if(Object.hasOwn(n,t[e]))return n[t[e--]];const o=t[e--];if(o instanceof OP){const t=[];for(let n=0;n<o.length;n++)t.unshift(s());return o.f(...t)}if(funcs[o]){const t=funcs[o].length,n=[];for(let e=0;e<t;e++)n.unshift(s());return funcs[o](...n)}return 0};return s()},stringToFunction=t=>{const n=construct(t);return t=>execute(n,t)};export default stringToFunction;