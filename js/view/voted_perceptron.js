import VotedPerceptron from"../../lib/model/voted_perceptron.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Step".';const t=new Controller(e);let n=null;const o=t.select(["oneone","onerest"]),l=t.input.number({label:" Learning rate ",min:0,max:100,step:.1,value:.1});t.stepLoopButtons().init((()=>{n=null,e.init()})).step((t=>{n||(n=new EnsembleBinaryModel((function(){return new VotedPerceptron(l.value)}),o.value)),n.fit(e.trainInput,e.trainOutput.map((e=>e[0])));const r=n.predict(e.testInput(3));e.testResult(r),t&&t()})).epoch()}