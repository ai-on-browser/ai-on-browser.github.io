import COLL from"../../lib/model/coll.js";import Controller from"../controller.js";export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.';const n=new Controller(t);let l=null;const e=()=>{l||(l=new COLL(o.value),l.init(t.trainInput)),l.fit();const n=l.predict(o.value);t.trainResult=n.map((t=>t+1))},o=n.input.number({label:" k ",min:1,max:1e3,value:3}).on("change",e);n.stepLoopButtons().init((()=>{l=null,t.init()})).step(e).epoch()}