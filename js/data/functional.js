import{MultiDimensionalData}from"./base.js";import stringToFunction from"../expression.js";const exprUsage="\nVariables:\n  x: Data vector. x[0] means the first axis value.\n  t: Index of the data\n  n: Total number of the data\n  d: Number of dimensions\nConstants:\n  pi: Pi (about 3.14159)\n  e: Napier's constant (about 2.71828) \nOperations:\n  +: Add/Positive\n  -: Subtract/Negative\n  *: Multiply\n  /: Divide\n  ^: Power\n  %: Modulus\n  !: Not\n  ||: Or\n  &&: And\n  ==: Equal\n  !=: Not equal\n  <: Less\n  <=: Less or equal\n  >: Greater\n  >=: Greater or equal\nFunctions:\n  abs: Absolute\n  ceil: Ceil\n  floor: Floor\n  round: Round\n  sqrt: Square root\n  cbrt: Qubic root\n  sin: Sine\n  cos: Cosine\n  tan: Tangent\n  asin: Arcsine\n  acos: Arccosine\n  atan: Arctangent\n  tanh: Hyperbolic tangent\n  exp: Exponential\n  log: Logarithm\n  sign: Sign\n  rand: Random value in [0, 1)\n  randn: Random value from normal distribution\n  cond: Switch values with a condition. cond(condition, when truthy, when falsy)\n";export default class FunctionalData extends MultiDimensionalData{constructor(t){super(t),this._n=100,this._x=[],this._y=[],this._defaultrange=[[0,10]],this._range=[[0,10]],this._axisDomains=[],this._depRpn=[];const e=this;this._presets={linear:{expr:"x[0]"},sin:{expr:"sin(x[0])"},tanh:{expr:"tanh(x[0])",get range(){const t=[];for(let n=0;n<e._d;n++)t[n]=[-5,5];return t}},gaussian:{get expr(){return 1===e._d?"exp(-(x[0] ^ 2) / 2)":"4 * exp(-(x[0] ^ 2 + x[1] ^ 2) / 2)"},get range(){return 1===e._d?[[-5,5]]:2===e._d?[[-3,3],[-3,3]]:[[-3,3],[-3,3],[-3,3]]}},expdist:{expr:"0.5 * exp(-0.5 * x[0])",dim:1},plaid:{get expr(){return 1===e._d?"abs(floor(x[0])) % 2 + 1":2===e._d?"(abs(floor(x[0])) + abs(floor(x[1]))) % 2 + 1":"(abs(floor(x[0])) + abs(floor(x[1])) + abs(floor(x[2]))) % 2 + 1"},get range(){return 1===e._d?[[-2,2]]:2===e._d?[[-2,2],[-2,2]]:[[-2,2],[-2,2],[-2,2]]}},spiral:{expr:"(abs(1 * atan(x[1] / x[0]) - sqrt(x[0] ^ 2 + x[1] ^ 2)) % 4 < 2) + 1",range:[[-5,5],[-5,5]],dim:2},swiss_roll:{expr:"t / 50",range:["t / 40 * sin(t / 40)","t / 40 * cos(t / 40)",[-2,2]],dim:2},trefoil_knot:{expr:"4 * sin(t / n * 2 * pi) +  4",range:["sin(t / n * 2 * pi) + 2 * sin(4 * t / n * pi)","cos(t / n * 2 * pi) - 2 * cos(4 * t / n * pi)","-sin(6 * t / n * pi)"],dim:3},saddle:{expr:"x[2]",range:[[-1,1],[-1,1],"x[0] ^ 2 - x[1] ^ 2"],dim:3}};const n=()=>{const t=this.preset;this._range=(this._presets[t].range||this._defaultrange).map((t=>t.concat())),this._range.length=this._d;for(let t=0;t<this._d;t++){s.select(`[name=x${t}]`).selectAll(".axis-domain").style("display","none"),this._range[t]||(this._range[t]=this._defaultrange[t]),Array.isArray(this._range[t])?this._axisDomains[t].range=this._range[t]:this._axisDomains[t].expr=this._range[t]}s.select("input[name=expr]").property("value",this._presets[t].expr),this._rpn=stringToFunction(this._presets[t].expr)},a=t=>{this._d=t,s.select("[name=dim]").property("value",t),this._defaultrange=[];for(let t=0;t<this._d;this._defaultrange[t++]=[0,10]);i.selectAll("*").remove(),this._axisDomains=[];for(let t=0;t<this._d;t++){const e=i.append("div").attr("name",`x${t}`),n=this;this._axisDomains[t]={set expr(a){e.select("select").property("value","func"),e.selectAll(".axis-domain").style("display","none"),e.select("[name=func]").style("display",null),e.select("input[name=dep_expr]").property("value",a),n._depRpn[t]=stringToFunction(a)},set range(a){e.select("select").property("value","range"),e.selectAll(".axis-domain").style("display","none"),e.select("[name=range]").style("display",null),e.select("[name=min]").property("value",n._range[t][0]=a[0]),e.select("[name=max]").property("value",n._range[t][1]=a[1]),n._depRpn[t]=null}},e.append("select").on("change",(()=>{const n=e.select("select").property("value");if(e.selectAll(".axis-domain").style("display","none"),e.select(`[name=${n}]`).style("display",null),"func"===n){const n=e.select("input[name=dep_expr]").property("value");this._depRpn[t]=stringToFunction(n)}else this._depRpn[t]=null,this._range[t][0]=+e.select("[name=min]").property("value"),this._range[t][1]=+e.select("[name=max]").property("value");this._createData()})).selectAll("option").data(["range","func"]).enter().append("option").attr("value",(t=>t)).text((t=>t));const a=e.append("span").attr("name","range").classed("axis-domain",!0);a.append("input").attr("type","number").attr("name","min").attr("max",1e3).attr("min",-1e3).attr("value",0).on("change",(()=>{this._range[t][0]=+a.select("[name=min]").property("value"),this._createData()})),a.append("span").text(`<= x[${t}] <=`),a.append("input").attr("type","number").attr("name","max").attr("max",1e3).attr("min",-1e3).attr("value",10).on("change",(()=>{this._range[t][1]=+a.select("[name=max]").property("value"),this._createData()}));const s=e.append("span").attr("name","func").style("display","none").classed("axis-domain",!0);s.append("span").text(` x[${t}] = `),0===t?s.append("span").text("f(t) = "):1===t?s.append("span").text("f(t, x[0]) = "):2===t?s.append("span").text("f(t, x[0], x[1]) = "):s.append("span").text(`f(t, x[0], ..., x[${t-1}]) = `),s.append("input").attr("type","text").attr("name","dep_expr").attr("value","rand()").on("change",(()=>{const n=e.select("input[name=dep_expr]").property("value");this._depRpn[t]=stringToFunction(n),this._createData()}))}this._tf.style("display",1===this._d?null:"none"),s.select("[name=number]").property("value",this._n=1===this._d?100:500)},s=this.setting.data.configElement;s.append("div").text("Dimension").append("input").attr("type","number").attr("name","dim").attr("min",1).attr("max",10).attr("value",this._d=1).on("change",(()=>{a(+s.select("[name=dim]").property("value")),Promise.resolve().then((()=>{n(),this._createData()}))}));const r=s.append("div");this._setPreset=t=>{s.select("[name=preset]").property("value",t),this._presets[t].dim&&this._presets[t].dim!==this._d&&a(this._presets[t].dim),Promise.resolve().then((()=>{n(),this._createData()}))},r.append("span").text("Preset"),r.append("select").attr("name","preset").on("change",(()=>{const t=s.select("[name=preset]").property("value");this._setPreset(t),this.setting.vue.pushHistory()})).selectAll("option").data(Object.keys(this._presets)).enter().append("option").attr("value",(t=>t)).text((t=>t)),s.append("span").attr("name","expr").text(" f(t, x) = ").attr("title",exprUsage),s.append("input").attr("type","text").attr("name","expr").attr("value",this._presets.linear.expr).attr("title",exprUsage).on("change",(()=>{const t=s.select("input[name=expr]").property("value");this._rpn=stringToFunction(t),this._createData()})),this._rpn=stringToFunction(this._presets.linear.expr),s.append("span").text(" Domain ");const i=s.append("div").style("display","inline-block");s.append("span").text(" Number "),s.append("input").attr("type","number").attr("name","number").attr("max",1e3).attr("min",1).attr("value",100).on("change",(()=>{this._n=+s.select("[name=number]").property("value"),this._createData()})),s.append("span").text(" Noise "),s.append("input").attr("type","number").attr("name","error_scale").attr("step",.1).attr("value",.1).attr("min",0).attr("max",10).on("change",(()=>{this._createData()})),this._tf=this.setting.svg.append("g").classed("true-function",!0).append("path").attr("stroke","blue").attr("stroke-opacity",.3).attr("fill-opacity",0),a(this._d),this._createData()}get series(){const t=super.series;return t.values=this._y.map((t=>[t])),t}get y(){return["CF"].indexOf(this._manager.platform.task)>=0?this._y.map((t=>Math.round(t))):this._y}get availTask(){return 1===this._d?["RG","IN","TF","SM","TP","CP"]:["RG","IN","CF","AD","DR","FS"]}get dimension(){return this._d}get domain(){return this._range}get preset(){return this.setting.data.configElement.select("[name=preset]").property("value")}get params(){return{preset:this.preset}}set params(t){t.preset&&this._setPreset(t.preset)}_fitData(t){return t.map(((t,e)=>t*(this._range[e][1]-this._range[e][0])+this._range[e][0]))}_createData(){const t=+this.setting.data.configElement.select("input[name=error_scale]").property("value");this._x=[];for(let t=0;t<this._n;t++)if(1===this._d)this._x.push(this._fitData([t/this._n]));else{const t=[];for(let e=0;e<this._d;e++)t[e]=Math.random();this._x.push(this._fitData(t))}for(let t=0;t<this._d;t++)if(this._depRpn[t]){this._range[t]=[1/0,-1/0];for(let e=0;e<this._n;e++){const n=this._x[e].slice(0,t),a=this._depRpn[t]({x:n,t:e,n:this._n,d:this._d});this._x[e][t]=a,this._range[t][0]=Math.min(this._range[t][0],a),this._range[t][1]=Math.max(this._range[t][1],a)}}this._y=this._x.map(((t,e)=>this._rpn({x:t,t:e,n:this._n,d:this._d})));const e=this._x.map(((t,e)=>[t,this._y[e]]));for(let e=0;e<this._n;e++)this._y[e]+=t*Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random());this._manager.onReady((()=>{const t=[];for(let e=0;e<this._d;e++)t.push(`x[${e}]`);if(this._make_selector(t),1===this._d){const t=d3.line().x((t=>t[0])).y((t=>t[1]));this._tf.attr("d",t(e.map((t=>this._manager.platform._renderer.toPoint(t)))))}}))}at(t){return Object.defineProperties({},{x:{get:()=>this._x[t],set:e=>{this._x[t]=e.slice(0,this._d),this._manager.platform.render()}},y:{get:()=>this._y[t],set:e=>{this._y[t]=e,this._manager.platform.render()}},point:{get:()=>this.points[t]}})}terminate(){super.terminate(),this.setting.svg.select("g.true-function").remove()}}