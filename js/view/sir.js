import SlicedInverseRegression from"../../lib/model/sir.js";var dispSIR=function(e,t){t.setting.ml.reference={title:"Sliced inverse regression (Wikipedia)",url:"https://en.wikipedia.org/wiki/Sliced_inverse_regression"};const i=()=>{const i=+e.select("[name=s]").property("value"),n=t.dimension,r=new SlicedInverseRegression(i).predict(t.trainInput,t.trainOutput.map((e=>e[0])),n);t.trainResult=r};e.append("span").text(" s "),e.append("input").attr("type","number").attr("name","s").attr("value",10).attr("min",1).attr("max",100).on("change",i),e.append("input").attr("type","button").attr("value","Fit").on("click",i)};export default function(e){e.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispSIR(e.setting.ml.configElement,e)}