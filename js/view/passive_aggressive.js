import PA from"../../lib/model/passive_aggressive.js";import EnsembleBinaryModel from"../../lib/model/ensemble_binary.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".';const t=new Controller(e);let n=null;const l=t.select(["oneone","onerest"]),o=t.select(["PA","PA-1","PA-2"]);t.stepLoopButtons().init((()=>{n=null,e.init()})).step((()=>{n||(n=new EnsembleBinaryModel((function(){const e=o.value;return new PA("PA"===e?0:"PA-1"===e?1:2)}),l.value)),n.fit(e.trainInput,e.trainOutput.map((e=>e[0])));const t=n.predict(e.testInput(3));e.testResult(t)})).epoch()}