import{MultiDimensionalData}from"./base.js";import stringToFunction from"../expression.js";const exprUsage="\nVariables:\n  x: x-axis value\n  y: y-axis value (if the dimension is greater than 1)\n  z: z-axis value (if the dimension is greater than 2)\n  t: Index of the data\n  n: Total number of the data\nConstants:\n  pi: PI\n  e: E\nOperations:\n  +: Add/Positive\n  -: Subtract/Negative\n  *: Multiply\n  /: Divide\n  ^: Power\n  %: Modulus\n  !: Not\n  ||: Or\n  &&: And\n  ==: Equal\n  !=: Not equal\n  <: Less\n  <=: Less or equal\n  >: Greater\n  >=: Greater or equal\nFunctions:\n  abs: Absolute\n  ceil: Ceil\n  floor: Floor\n  round: Round\n  sqrt: Square root\n  cbrt: Qubic root\n  sin: Sine\n  cos: Cosine\n  tan: Tangent\n  asin: Arcsine\n  acos: Arccosine\n  atan: Arctangent\n  tanh: Hyperbolic tangent\n  exp: Exponential\n  log: Logarithm\n  sign: Sign\n  rand: Random value in [0, 1)\n  randn: Random value from normal distribution\n  cond: Switch values with a condition. cond(condition, when truthy, when falsy)\n";export default class FunctionalData extends MultiDimensionalData{constructor(t){super(t),this._n=100,this._x=[],this._y=[],this._defaultrange=[[0,10]],this._range=[[0,10]],this._axisNames=["x","y","z"],this._depRpn=[];const e=this;this._presets={linear:{expr:"x"},sin:{expr:"sin(x)"},tanh:{expr:"tanh(x)",get range(){const t=[];for(let n=0;n<e._d;n++)t[n]=[-5,5];return t}},gaussian:{get expr(){return 1===e._d?"exp(-(x ^ 2) / 2)":"4 * exp(-(x ^ 2 + y ^ 2) / 2)"},get range(){return 1===e._d?[[-5,5]]:2===e._d?[[-3,3],[-3,3]]:[[-3,3],[-3,3],[-3,3]]}},expdist:{expr:"0.5 * exp(-0.5 * x)",dim:1},plaid:{get expr(){return 1===e._d?"abs(floor(x)) % 2 + 1":2===e._d?"(abs(floor(x)) + abs(floor(y))) % 2 + 1":"(abs(floor(x)) + abs(floor(y)) + abs(floor(z))) % 2 + 1"},get range(){return 1===e._d?[[-2,2]]:2===e._d?[[-2,2],[-2,2]]:[[-2,2],[-2,2],[-2,2]]}},spiral:{expr:"(abs(1 * atan(y / x) - sqrt(x ^ 2 + y ^ 2)) % 4 < 2) + 1",range:[[-5,5],[-5,5]],dim:2},swiss_roll:{expr:"t / 50",range:["t / 40 * sin(t / 40)","t / 40 * cos(t / 40)",[-2,2]],dim:2},trefoil_knot:{expr:"4 * sin(t / n * 2 * pi) +  4",range:["sin(t / n * 2 * pi) + 2 * sin(4 * t / n * pi)","cos(t / n * 2 * pi) - 2 * cos(4 * t / n * pi)","-sin(6 * t / n * pi)"],dim:3}};const n=()=>{const t=this.preset;this._range=(this._presets[t].range||this._defaultrange).map((t=>t.concat())),this._range.length=this._d;for(let t=0;t<this._d;t++){s.select("[name="+this._axisNames[t]+"]").selectAll(".axis-domain").style("display","none"),this._range[t]||(this._range[t]=this._defaultrange[t]),Array.isArray(this._range[t])?this._axisDomains[t].range=this._range[t]:this._axisDomains[t].expr=this._range[t]}s.select("input[name=expr]").property("value",this._presets[t].expr),this._rpn=stringToFunction(this._presets[t].expr)},a=t=>{this._d=t,s.select("[name=dim]").property("value",t),this._defaultrange=[];for(let t=0;t<this._d;this._defaultrange[t++]=[0,10]);const e=this._axisNames.slice(0,this._d);s.select("span[name=expr]").text(` f(${["t",...e].join(",")}) = `);for(let t=0;t<this._axisNames.length;t++)s.select(`[name=${this._axisNames[t]}]`).style("display",t<this._d?null:"none");this._tf.style("display",1===this._d?null:"none"),s.select("[name=number]").property("value",this._n=[100,500,500][this._d-1]),this.setting.ml.refresh(),this.setting.vue.$forceUpdate()},s=this.setting.data.configElement;s.append("div").text("Dimension").append("input").attr("type","number").attr("name","dim").attr("min",1).attr("max",3).attr("value",this._d=1).on("change",(()=>{a(+s.select("[name=dim]").property("value")),Promise.resolve().then((()=>{n(),this._createData()}))}));const r=s.append("div");this._setPreset=t=>{s.select("[name=preset]").property("value",t),this._presets[t].dim&&a(this._presets[t].dim),Promise.resolve().then((()=>{n(),this._createData()}))},r.append("span").text("Preset"),r.append("select").attr("name","preset").on("change",(()=>{const t=s.select("[name=preset]").property("value");this._setPreset(t),this.setting.vue.pushHistory()})).selectAll("option").data(Object.keys(this._presets)).enter().append("option").attr("value",(t=>t)).text((t=>t)),s.append("span").attr("name","expr").text(" f(t, x) = ").attr("title",exprUsage),s.append("input").attr("type","text").attr("name","expr").attr("value",this._presets.linear.expr).attr("title",exprUsage).on("change",(()=>{const t=s.select("input[name=expr]").property("value");this._rpn=stringToFunction(t),this._createData()})),this._rpn=stringToFunction(this._presets.linear.expr),s.append("span").text(" Domain ");const i=s.append("div").style("display","inline-block");this._axisDomains=[];for(let t=0;t<this._axisNames.length;t++){const e=this._axisNames[t],n=i.append("div").attr("name",e),a=this;this._axisDomains[t]={set expr(e){n.select("select").property("value","func"),n.selectAll(".axis-domain").style("display","none"),n.select("[name=func]").style("display",null),n.select("input[name=dep_expr]").property("value",e),a._depRpn[t]=stringToFunction(e)},set range(e){n.select("select").property("value","range"),n.selectAll(".axis-domain").style("display","none"),n.select("[name=range]").style("display",null),n.select("[name=min]").property("value",a._range[t][0]=e[0]),n.select("[name=max]").property("value",a._range[t][1]=e[1]),a._depRpn[t]=null}},n.append("select").on("change",(()=>{const e=n.select("select").property("value");if(n.selectAll(".axis-domain").style("display","none"),n.select(`[name=${e}]`).style("display",null),"func"===e){const e=n.select("input[name=dep_expr]").property("value");this._depRpn[t]=stringToFunction(e)}else this._depRpn[t]=null,this._range[t][0]=+n.select("[name=min]").property("value"),this._range[t][1]=+n.select("[name=max]").property("value");this._createData()})).selectAll("option").data(["range","func"]).enter().append("option").attr("value",(t=>t)).text((t=>t));const s=n.append("span").attr("name","range").classed("axis-domain",!0);s.append("input").attr("type","number").attr("name","min").attr("max",1e3).attr("min",-1e3).attr("value",0).on("change",(()=>{this._range[t][0]=+s.select("[name=min]").property("value"),this._createData()})),s.append("span").text(`<= ${e} <=`),s.append("input").attr("type","number").attr("name","max").attr("max",1e3).attr("min",-1e3).attr("value",10).on("change",(()=>{this._range[t][1]=+s.select("[name=max]").property("value"),this._createData()}));const r=n.append("span").attr("name","func").style("display","none").classed("axis-domain",!0);r.append("span").text(`f(${["t",...this._axisNames.slice(0,t)].join(",")}) = `),r.append("input").attr("type","text").attr("name","dep_expr").attr("value","rand()").on("change",(()=>{const e=n.select("input[name=dep_expr]").property("value");this._depRpn[t]=stringToFunction(e),this._createData()})),t>0&&n.style("display","none")}s.append("span").text(" Number "),s.append("input").attr("type","number").attr("name","number").attr("max",1e3).attr("min",1).attr("value",100).on("change",(()=>{this._n=+s.select("[name=number]").property("value"),this._createData()})),s.append("span").text(" Noise "),s.append("input").attr("type","number").attr("name","error_scale").attr("step",.1).attr("value",.1).attr("min",0).attr("max",10).on("change",(()=>{this._createData()})),this._tf=this.setting.svg.append("g").classed("true-function",!0).append("path").attr("stroke","blue").attr("stroke-opacity",.3).attr("fill-opacity",0),this._createData()}get series(){const t=super.series;return t.values=this._y.map((t=>[t])),t}get y(){return["CF"].indexOf(this._manager.platform.task)>=0?this._y.map((t=>Math.round(t))):this._y}get availTask(){return 1===this._d?["RG","IN","TF","SM","TP","CP"]:["RG","CF","AD","DR","FS"]}get dimension(){return this._d}get domain(){return this._range}get preset(){return this.setting.data.configElement.select("[name=preset]").property("value")}get params(){return{preset:this.preset}}set params(t){t.preset&&this._setPreset(t.preset)}_fitData(t){return t.map(((t,e)=>t*(this._range[e][1]-this._range[e][0])+this._range[e][0]))}_createData(){const t=+this.setting.data.configElement.select("input[name=error_scale]").property("value");this._x=[];for(let t=0;t<this._n;t++)if(1===this._d)this._x.push(this._fitData([t/this._n]));else{const t=[];for(let e=0;e<this._d;e++)t[e]=Math.random();this._x.push(this._fitData(t))}for(let t=0;t<this._d;t++)if(this._depRpn[t]){this._range[t]=[1/0,-1/0];for(let e=0;e<this._n;e++){const n=this._x[e].slice(0,t),a=this._depRpn[t]({x:n[0],y:n[1],z:n[2],t:e,n:this._n});this._x[e][t]=a,this._range[t][0]=Math.min(this._range[t][0],a),this._range[t][1]=Math.max(this._range[t][1],a)}}this._y=this._x.map(((t,e)=>this._rpn({x:t[0],y:t[1],z:t[2],t:e,n:this._n})));const e=this._x.map(((t,e)=>[t,this._y[e]]));for(let e=0;e<this._n;e++)this._y[e]+=t*Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random());this._manager.waitReady((()=>{if(this._manager.platform.render(),this._renderer._make_selector(this._axisNames.slice(0,this._d)),this._renderer.render(),1===this._d){const t=d3.line().x((t=>t[0])).y((t=>t[1]));this._tf.attr("d",t(e.map((t=>this._renderer.toPoint(t)))))}}))}at(t){return Object.defineProperties({},{x:{get:()=>this._x[t],set:e=>{this._x[t]=e.slice(0,this._d),this._manager.platform.render()}},y:{get:()=>this._y[t],set:e=>{this._y[t]=e,this._manager.platform.render()}},point:{get:()=>this.points[t]}})}terminate(){super.terminate(),this.setting.svg.select("g.true-function").remove()}}