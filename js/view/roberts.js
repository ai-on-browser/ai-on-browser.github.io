var g=Object.defineProperty;var r=(t,e)=>g(t,"name",{value:e,configurable:!0});import h from"../../lib/model/roberts.js";var b=r(function(t,e){e.setting.ml.reference={title:"Roberts cross (Wikipedia)",url:"https://en.wikipedia.org/wiki/Roberts_cross"},e.colorSpace="gray";const o=r(()=>{const a=e._step;e._step=1;const n=e.trainInput,c=+t.select("[name=th]").property("value"),p=new h(c);for(let s=0;s<n.length;s++)for(let i=0;i<n[s].length;i++)n[s][i]=n[s][i].reduce((l,d)=>l+d,0)/n[s][i].length;let u=p.predict(n);e.trainResult=u.flat(),e._step=a},"fitModel");t.append("span").text(" threshold "),t.append("input").attr("type","number").attr("name","th").attr("value",50).attr("min",0).attr("max",200).on("change",o),t.append("input").attr("type","button").attr("value","Fit").on("click",o)},"dispRobertsCross");export default function k(t){t.setting.ml.usage='Click "Fit" button.',b(t.setting.ml.configElement,t)}r(k,"default");
