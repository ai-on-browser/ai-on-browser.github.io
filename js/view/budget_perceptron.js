var c=Object.defineProperty;var i=(e,t)=>c(e,"name",{value:t,configurable:!0});import d from"../../lib/model/budget_perceptron.js";import m from"../../lib/model/ensemble_binary.js";import p from"../controller.js";export default function b(e){e.setting.ml.usage='Click and add data point. Then, click "Step".',e.setting.ml.reference={author:"K. Crammer, J. Kandola, Y. Singer",title:"Online Classification on a Budget",year:2003};const t=new p(e);let n=null;const o=i(()=>{n||(n=new m(function(){return new d(l.value,a.value)},u.value)),n.fit(e.trainInput,e.trainOutput.map(r=>r[0]));const s=n.predict(e.testInput(3));e.testResult(s)},"calc"),u=t.select(["oneone","onerest"]),l=t.input.number({label:" beta ",min:0,max:100,step:.1,value:1}),a=t.input.number({label:" budgets ",min:0,max:100,value:10});t.stepLoopButtons().init(()=>{n=null,e.init()}).step(o).epoch()}i(b,"default");
