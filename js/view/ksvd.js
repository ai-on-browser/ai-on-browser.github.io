var u=Object.defineProperty;var e=(t,i)=>u(t,"name",{value:i,configurable:!0});import c from"../../lib/model/ksvd.js";import r from"../controller.js";export default function d(t){t.setting.ml.usage='Click and add data point. Next, click "Fit" button.',t.setting.ml.reference={author:"R. Rubinstein, M. Zibulevsky, M. Elad",title:"Efficient Implementation of the K-SVD Algorithm using Batch Orthogonal Matching Pursuit",year:2008};const i=new r(t);let n=null;const o=e(()=>{const l=t.dimension;n||(n=new c(t.trainInput,l)),n.fit();const s=n.predict();t.trainResult=s},"fitModel");i.stepLoopButtons().init(()=>{n=null,t.init()}).step(o)}e(d,"default");
