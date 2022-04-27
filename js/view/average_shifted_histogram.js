import Matrix from"../../lib/util/matrix.js";import AverageShiftedHistogram from"../../lib/model/average_shifted_histogram.js";var dispAverageShiftedHistogram=function(t,a){const e=()=>{const e=+t.select("[name=bin]").property("value"),i=+t.select("[name=aggregate]").property("value"),n=a.width/(a.datas.domain[0][1]-a.datas.domain[0][0]),r=new AverageShiftedHistogram({domain:a.datas.domain,size:e/n},i).fit(a.trainInput);let p=Matrix.fromArray(r).value;const m=Math.max(...p);p=p.map((t=>specialCategory.density(t/m))),a.testInput(e),a.testResult(p)};t.append("span").text("bin size "),t.append("input").attr("type","number").attr("name","bin").attr("min",1).attr("max",100).attr("value",10).on("change",e),t.append("span").text("aggregate "),t.append("input").attr("type","number").attr("name","aggregate").attr("min",1).attr("max",100).attr("value",10).on("change",e),t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>e()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispAverageShiftedHistogram(t.setting.ml.configElement,t)}