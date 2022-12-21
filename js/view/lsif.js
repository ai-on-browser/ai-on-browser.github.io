import LSIF from"../../lib/model/lsif.js";import{SquaredLossMICPD}from"../../lib/model/squared_loss_mi.js";import Controller from"../controller.js";export default function(e){e.setting.ml.usage='Click and add data point. Then, click "Calculate".',e.setting.ml.reference={author:"T. Kanamori, S. Hido, M. Sugiyama",title:"A Least-squares Approach to Direct Importance Estimation",year:2009};const t=new Controller(e),l=t.input.number({label:" window = ",min:1,max:100,value:20}),o=t.input.number({label:" threshold = ",min:0,max:1e3,step:.01,value:.01}).on("change",(()=>{e.threshold=o.value}));t.input.button("Calculate").on("click",(function(){const t=new LSIF([100,10,1,.1,.01,.001],[100,10,1,.1,.01,.001],3,100),a=new SquaredLossMICPD(t,l.value).predict(e.trainInput);for(let e=0;e<3*l.value/4;e++)a.unshift(0);e.trainResult=a,e.threshold=o.value}))}