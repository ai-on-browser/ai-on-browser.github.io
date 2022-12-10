import ADALINE from"../../lib/model/adaline.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Step".';const t=new Controller(e);let n=null;const l=t.select(["oneone","onerest"]),o=t.input.number({label:" Learning rate ",min:0,max:100,step:.1,value:.1});t.stepLoopButtons().init((()=>{n=null,e.init()})).step((t=>{n||(n=new EnsembleBinaryModel((function(){return new ADALINE(o.value)}),l.value));const i=e.trainOutput.map((e=>e[0]));n.fit(e.trainInput,i);const r=n.predict(e.testInput(3));e.testResult(r),t&&t()})).epoch()}