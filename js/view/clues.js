import CLUES from"../../lib/model/clues.js";import Controller from"../controller.js";export default function(t){t.setting.ml.usage='Click and add data point. Then, click "Fit" button.';const n=new Controller(t),e=n.input.number({label:"alpha",min:.01,max:10,step:.01,value:.05});n.input.button("Fit").on("click",(()=>{const n=new CLUES(e.value);n.fit(t.trainInput);const o=n.predict();t.trainResult=o.map((t=>t+1)),l.value=n.size}));const l=n.text({label:" Clusters: "})}