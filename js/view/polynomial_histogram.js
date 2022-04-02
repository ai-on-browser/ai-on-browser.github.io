import Matrix from"../../lib/util/matrix.js";import PolynomialHistogram from"../../lib/model/polynomial_histogram.js";var dispPolynomialHistogram=function(t,a){const e=e=>{const n=+t.select("[name=p]").property("value"),i=+t.select("[name=h]").property("value"),p=new PolynomialHistogram(n,i);p.fit(a.trainInput);let r=Matrix.fromArray(p.predict(a.testInput(4)));r.div(r.max()),r=r.value.map(specialCategory.density),a.testResult(r)};t.append("span").text("p "),t.append("input").attr("type","number").attr("name","p").attr("min",0).attr("max",2).attr("value",2).on("change",e),t.append("span").text(" h "),t.append("input").attr("type","number").attr("name","h").attr("min",0).attr("value",.1).attr("step",.01).on("change",e),t.append("input").attr("type","button").attr("value","Fit").on("click",(()=>e()))};export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispPolynomialHistogram(t.setting.ml.configElement,t)}