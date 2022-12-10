import{SelectiveSamplingPerceptron,SelectiveSamplingAdaptivePerceptron}from"../../lib/model/selective_sampling_perceptron.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Step".';const t=new Controller(e);let n=null;const l=t.select(["","adaptive"]),i=t.select(["oneone","onerest"]),a=t.input.number({label:" Smoothing parameter ",min:0,max:100,step:.1,value:1}),r=t.input.number({label:" Learning rate ",min:0,max:100,step:.1,value:.1});t.stepLoopButtons().init((()=>{n=null,e.init()})).step((t=>{n||(n=new EnsembleBinaryModel((function(){return"adaptive"===l.value?new SelectiveSamplingAdaptivePerceptron(a.value,r.value):new SelectiveSamplingPerceptron(a.value,r.value)}),i.value)),n.fit(e.trainInput,e.trainOutput.map((e=>e[0])));const o=n.predict(e.testInput(3));e.testResult(o),t&&t()})).epoch()}