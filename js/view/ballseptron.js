var a=Object.defineProperty;var i=(e,t)=>a(e,"name",{value:t,configurable:!0});import p from"../../lib/model/ballseptron.js";import d from"../../lib/model/ensemble_binary.js";import m from"../controller.js";export default function h(e){e.setting.ml.usage='Click and add data point. Then, click "Step".',e.setting.ml.reference={author:"S. Shalev-Shwartz, Y.Singer",title:"A New Perspective on an Old Perceptron Algorithm",year:2005};const t=new m(e);let n=null;const r=i(o=>{n||(n=new d(function(){return new p(s.value)},l.value)),n.fit(e.trainInput,e.trainOutput.map(c=>c[0]));const u=n.predict(e.testInput(3));e.testResult(u),o&&o()},"calc"),l=t.select(["oneone","onerest"]),s=t.input.number({label:" radius ",min:0,max:100,step:.1,value:.1});t.stepLoopButtons().init(()=>{n=null,e.init()}).step(r).epoch()}i(h,"default");
