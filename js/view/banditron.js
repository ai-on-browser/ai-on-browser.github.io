import Banditron from"../../lib/model/banditron.js";import Controller from"../controller.js";export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Step".';const n=new Controller(t);let e=null;const o=n.input.number({label:" gamma ",min:0,max:.5,step:.1,value:.1});n.stepLoopButtons().init((()=>{e=null,t.init()})).step((n=>{e||(e=new Banditron(o.value),e.init(t.trainInput,t.trainOutput.map((t=>t[0])))),e.fit();const i=e.predict(t.testInput(3));t.testResult(i),n&&n()})).epoch()}