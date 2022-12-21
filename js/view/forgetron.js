import Forgetron from"../../lib/model/forgetron.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Step".',e.setting.ml.reference={author:"O. Dekel, S. Shalev-Shwartz, Y. Singer",title:"The Forgetron: A Kernel-Based Perceptron on a Fixed Budget",year:2005};const t=new Controller(e);let n=null;const o=t.select(["oneone","onerest"]),l=t.select(["gaussian","polynomial"]),r=t.input.number({label:" beta ",min:1,max:100,value:10});t.stepLoopButtons().init((()=>{n=null,e.init()})).step((t=>{n||(n=new EnsembleBinaryModel((function(){return new Forgetron(r.value,l.value)}),o.value)),n.fit(e.trainInput,e.trainOutput.map((e=>e[0])));const i=n.predict(e.testInput(3));e.testResult(i),t&&t()})).epoch()}