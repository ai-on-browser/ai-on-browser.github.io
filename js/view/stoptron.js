import Stoptron from"../../lib/model/stoptron.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";import Controller from"../controller.js";export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Step".';const e=new Controller(t);let n=null;const o=e.select(["oneone","onerest"]),l=e.select(["gaussian","polynomial"]),i=e.input.number({label:" cache size ",min:0,max:1e3,value:10});e.stepLoopButtons().init((()=>{n=null,t.init()})).step((e=>{n||(n=new EnsembleBinaryModel((function(){return new Stoptron(i.value,l.value)}),o.value),n.init(t.trainInput,t.trainOutput.map((t=>t[0])))),n.fit();const r=n.predict(t.testInput(3));t.testResult(r),e&&e()})).epoch()}