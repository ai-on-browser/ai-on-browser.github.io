import{BasePlatform}from"./base.js";export default class DocumentPlatform extends BasePlatform{constructor(t,e){super(t,e)}init(){0===this.svg.select("g.dc-render").size()&&this.svg.append("g").classed("dc-render",!0).style("transform","scale(1, -1) translate(0, -100%)"),this._r=this.svg.select("g.dc-render"),this._r.selectAll("*").remove();const t=this.svg.node();this.svg.selectAll("g:not(.dc-render)").filter((function(){return this.parentNode===t})).style("visibility","hidden"),this.render()}render(){}fit(t){const e=this.datas.x[0].map((t=>t.toLowerCase()));t(e,null,(t=>{this._pred=t,this._displayResults(t,e)}))}predict(t){const e=this.datas.x[0],[s,i]=this.datas.ordinal(e);t(s,(t=>{this._pred=t,this._displayResults(t,s)}))}_displayResults(t,e){this._r.selectAll("*").remove();let s=[],i=[];for(let e=0;e<t[0].length;e++){const l=t.map((t=>t[e]));s.push(Math.max(...l)),i.push(Math.min(...l))}const l=this.width,r=this.height-20,a=[l,r].map(((t,e)=>(t-10)/(s[e]-i[e]))),n=Math.min(...a),h=[5,20];for(let t=0;t<a.length;t++)a[t]>n&&(isFinite(a[t])?h[t]+=(a[t]-n)*(s[t]-i[t])/2:h[t]=[l,r][t]/2-i[t]);for(let s=0;s<t.length;s++){const l=t[s].map(((t,e)=>(t-i[e])*n+h[e]));this._r.append("text").attr("x",l[0]).attr("y",l[1]).text(e[s]).append("title").text(e[s])}}terminate(){this._r.remove(),this.svg.selectAll("g").style("visibility",null)}}