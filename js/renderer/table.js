import BaseRenderer from"./base.js";export default class TableRenderer extends BaseRenderer{constructor(t){super(t),0===this.svg.select("g.rc-render").size()&&this.svg.append("g").classed("rc-render",!0).style("transform","scale(1, -1) translate(0, -100%)"),this._r=this.svg.select("g.rc-render"),this._r.selectAll("*").remove();const e=this.svg.node();this.svg.selectAll("g:not(.rc-render)").filter((function(){return this.parentNode===e})).style("visibility","hidden")}render(){this._r.selectAll("*").remove();const t=this.datas;if(!t)return;const e=this._r.append("foreignObject").attr("x",0).attr("y",0).attr("width",this.width).attr("height",this.height).style("overflow","scroll").append("xhtml:table").attr("width",this.width).attr("height",this.height).attr("border",1).style("border-collapse","collapse"),r=t.columnNames,s=t.x,n=t.y;if(r){const t=e.append("tr");for(const e of r)t.append("td").text(e);n&&n.length>0&&t.append("td").text("target")}const l=e;for(let e=0;e<t.length;e++){const r=l.append("tr");for(let n=0;n<s[e].length;n++)r.append("td").text(t._input_category_names[n]?t._input_category_names[n][s[e][n]]:s[e][n]);n&&n.length>0&&r.append("td").text(t._output_category_names?t._output_category_names[n[e]-1]:n[e])}}terminate(){this._r?.remove(),this.svg.selectAll("g").style("visibility",null),super.terminate()}}