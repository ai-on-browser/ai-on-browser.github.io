var l=Object.defineProperty;var n=(e,t)=>l(e,"name",{value:t,configurable:!0});import u from"../../lib/model/ensemble_binary.js";import o from"../../lib/model/least_square.js";import $ from"../controller.js";export default function d(e){e.setting.ml.usage='Click and add data point. Next, click "Fit" button.',e.setting.ml.reference={title:"Least squares (Wikipedia)",url:"https://en.wikipedia.org/wiki/Least_squares"},e.setting.ml.detail=`
The model form is
$$
f(X) = \\sum_{k=1}^m a_k g_k(X) + \\epsilon
$$

In the least-squares setting, the loss function can be written as
$$
L(W) = \\| f(X) - y \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
Therefore, the optimum parameter $ \\hat{a} $ is estimated as
$$
\\hat{a} = \\left( G^T G \\right)^{-1} G^T y
$$
where $ G_{ij} = g_i(x_j) $.
`;const t=new $(e),r=n(()=>{let i;e.task==="CF"?i=new u(()=>new o,s.value):i=new o,i.fit(e.trainInput,e.trainOutput);const a=i.predict(e.testInput(2));e.testResult(a)},"fitModel");let s=null;e.task==="CF"&&(s=t.select(["oneone","onerest"])),t.input.button("Fit").on("click",()=>r())}n(d,"default");
