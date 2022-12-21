import KernelizedPegasos from"../../lib/model/kernelized_pegasos.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Step".',e.setting.ml.reference={author:"S. Shalev-Shwartz, Y. Singer, N. Srebro, A. Cotter",title:"Pegasos: Primal Estimated sub-GrAdient SOlver for SVM",year:2011};const t=new Controller(e);let n=null;const l=t.select(["oneone","onerest"]),r=t.select(["gaussian","polynomial"]),o=t.input.number({label:" Learning rate ",min:0,max:100,step:.1,value:.1});t.stepLoopButtons().init((()=>{n=null,e.init()})).step((t=>{n||(n=new EnsembleBinaryModel((function(){return new KernelizedPegasos(o.value,r.value)}),l.value),n.init(e.trainInput,e.trainOutput.map((e=>e[0])))),n.fit();const i=n.predict(e.testInput(3));e.testResult(i),t&&t()})).epoch()}