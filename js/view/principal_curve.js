import PrincipalCurve from"../../lib/model/principal_curve.js";var dispPC=function(i,t){let n=new PrincipalCurve;t.setting.ml.controller.stepLoopButtons().init((()=>{n=new PrincipalCurve,t.init()})).step((i=>{t.fit(((e,l,o)=>{const r=t.dimension;n.fit(e);o(n.predict(e,r)),i&&i()}))}))};export default function(i){i.setting.ml.usage='Click and add data point. Next, click "Fit" button.',dispPC(i.setting.ml.configElement,i)}