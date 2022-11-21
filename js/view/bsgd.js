import BSGD from"../../lib/model/bsgd.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Step".';const t=new Controller(e);let n=null;const l=t.select(["oneone","onerest"]),o=t.select(["gaussian","polynomial"]),a=t.select(["removal","projection","merging"]),i=t.input.number({label:" B ",min:0,max:100,value:10}),u=t.input.number({label:" eta ",min:0,max:100,step:.1,value:1}),r=t.input.number({label:" lambda ",min:0,max:100,step:.1,value:.1});t.stepLoopButtons().init((()=>{n=null,e.init()})).step((t=>{n||(n=new EnsembleBinaryModel((function(){return new BSGD(i.value,u.value,r.value,a.value,o.value)}),l.value),n.init(e.trainInput,e.trainOutput.map((e=>e[0])))),n.fit();const m=n.predict(e.testInput(3));e.testResult(m),t&&t()})).epoch()}