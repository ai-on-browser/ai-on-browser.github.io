var r=Object.defineProperty;var n=(t,e)=>r(t,"name",{value:e,configurable:!0});import l from"../../lib/model/mars.js";import a from"../controller.js";export default function s(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',t.setting.ml.reference={author:"J. H. Friedman",title:"MULTIVARIATE ADAPTIVE REGRESSION SPLINES",year:1990};const e=new a(t),o=n(()=>{const i=new l(u.value);i.fit(t.trainInput,t.trainOutput);const c=i.predict(t.testInput(2));t.testResult(c)},"fitModel"),u=e.input.number({label:"M max",max:100,min:1,value:5});e.input.button("Fit").on("click",o)}n(s,"default");
