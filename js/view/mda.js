var s=Object.defineProperty;var i=(t,e)=>s(t,"name",{value:e,configurable:!0});import a from"../../lib/model/mda.js";import r from"../controller.js";export default function p(t){t.setting.ml.usage='Click and add data point. Then, click "Calculate".';const e=new r(t);let n=null;const u=i(()=>{n||(n=new a(c.value),n.init(t.trainInput,t.trainOutput.map(o=>o[0]))),n.fit();const l=n.predict(t.testInput(3));t.testResult(l)},"calc"),c=e.input.number({label:" r ",min:1,max:100,value:10});e.stepLoopButtons().init(()=>{n=null,t.init()}).step(u).epoch()}i(p,"default");
