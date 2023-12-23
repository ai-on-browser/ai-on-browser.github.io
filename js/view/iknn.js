var r=Object.defineProperty;var n=(t,e)=>r(t,"name",{value:e,configurable:!0});import s from"../../lib/model/iknn.js";import m from"../controller.js";export default function d(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".',t.setting.ml.reference={author:"Y. Song, J. Huang, D. Zhou, H. Zha, C. L. Giles",title:"IKNN: Informative K-Nearest Neighbor Pattern Classification",year:2007};const e=new m(t),a=n(()=>{const i=new s(u.value,l.value);i.fit(t.trainInput,t.trainOutput.map(c=>c[0]));const o=i.predict(t.testInput(4));t.testResult(o)},"fitModel"),u=e.input.number({label:"k",min:1,max:1e3,value:100}),l=e.input.number({label:"i",min:1,max:1e3,value:5});e.input.button("Calculate").on("click",a)}n(d,"default");
