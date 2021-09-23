import ImageData from"./image.js";export default class CameraData extends ImageData{constructor(t){super(t),this._size=[240,360];const e=this.setting.data.configElement;this._mngelm=e.append("div"),this._mngelm.append("input").attr("type","button").attr("value","Add data").on("click",(()=>this.startVideo())),this._slctImg=this._mngelm.append("select").on("change",(()=>{this._manager.platform.render(),this._thumbnail.selectAll("*").remove(),this._thumbnail.node().append(this._createCanvas(this.x[0]))})),this._thumbnail=this._mngelm.append("span"),this._videoElm=e.append("div"),this.startVideo(),this._x=[],this._y=[]}get availTask(){return["SG","DN","ED"]}get x(){const t=+this._slctImg.property("value")-1;return 0!==this._x.length&&this._x[t]?[this._x[t]]:[]}startVideo(t){this._mngelm.style("display","none"),this._videoElm.append("div").text("Click video to use as data.");const e=this._videoElm.append("div").append("select").attr("name","devices").on("change",(()=>{const t=e.property("value");this.stopVideo(),this.startVideo(t)}));this._video=this._videoElm.append("video").attr("width",this._size[1]).attr("height",this._size[0]).property("autoplay",!0).on("click",(()=>{this.readImage(this._video,(t=>{this._x.push(t),this._y.push(0),this._slctImg.append("option").attr("value",this._x.length).text(this._x.length),this._slctImg.property("value",this._x.length),this._thumbnail.selectAll("*").remove(),this._thumbnail.node().append(this._createCanvas(t)),this.stopVideo(),this._mngelm.style("display",null),this._manager.platform.render&&setTimeout((()=>{this._manager.platform.render()}),0)}))})).node(),navigator.mediaDevices.getUserMedia({video:{deviceId:t}}).then((t=>{this._video.srcObject=t,navigator.mediaDevices.enumerateDevices().then((i=>{e.selectAll("option").data(i.filter((t=>"videoinput"===t.kind))).enter().append("option").property("value",(t=>t.deviceId)).text((t=>t.label)),t.getTracks().forEach((t=>{e.property("value",t.getSettings().deviceId)}))}))})).catch((t=>{console.error(t),this.stopVideo()}))}stopVideo(){if(this._video){const t=this._video.srcObject;t&&(t.getTracks().forEach((t=>{t.stop()})),this._video.srcObject=null),this._video=null}this._videoElm.selectAll("*").remove()}terminate(){super.terminate(),this.stopVideo()}}