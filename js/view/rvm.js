var l=Object.defineProperty;var n=(e,t)=>l(e,"name",{value:t,configurable:!0});import r from"../../lib/model/rvm.js";import s from"../controller.js";export default function u(e){e.setting.ml.usage='Click and add data point. Next, click "Fit" button.',e.setting.ml.reference={title:"Relevance vector machine (Wikipedia)",url:"https://en.wikipedia.org/wiki/Relevance_vector_machine"};const t=new s(e);let i=null;const c=n(()=>{i.fit(e.trainInput,e.trainOutput);let o=i.predict(e.testInput(4));e.testResult(o)},"fitModel");t.stepLoopButtons().init(()=>{i=new r,e.init()}).step(c).epoch()}n(u,"default");
