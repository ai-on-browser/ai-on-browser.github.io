import OrdinalRegression from"../../lib/model/ordinal_regression.js";import Controller from"../controller.js";export default function(t){t.setting.ml.usage='Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.',t.setting.ml.reference={title:"Ordinal regression (Wikipedia)",url:"https://en.wikipedia.org/wiki/Ordinal_regression"};const e=new Controller(t);let i=null;const n=e.input.number({label:" Learning rate ",value:.001,min:0,max:100,step:.001});e.stepLoopButtons().init((()=>{i=new OrdinalRegression(n.value),t.init()})).step((()=>{if(!i)return;i.fit(t.trainInput,t.trainOutput.map((t=>t[0])));const e=i.predict(t.testInput(4));t.testResult(e)})).epoch()}