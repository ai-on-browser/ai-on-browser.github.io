import BrahmaguptaInterpolation from"../../lib/model/brahmagupta_interpolation.js";var dispBrahmagupta=function(elm,platform){const calcBrahmagupta=function(){platform.fit(((tx,ty)=>{const model=new BrahmaguptaInterpolation;model.fit(tx.map((v=>v[0])),ty.map((v=>v[0])));platform.predict(((px,cb)=>{const pred=model.predict(px.map((v=>v[0])));cb(pred)}),1)}))};elm.append("input").attr("type","button").attr("value","Calculate").on("click",calcBrahmagupta)};export default function(platform){platform.setting.ml.usage='Click and add data point. Then, click "Calculate".';dispBrahmagupta(platform.setting.ml.configElement,platform)}