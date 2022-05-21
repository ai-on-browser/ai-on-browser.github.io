import{BaseData}from"./base.js";export default class ImageData extends BaseData{constructor(e){super(e)}static get colorSpaces(){return{RGB:"rgb",COL8:"8 colors",GRAY:"gray",BINARY:"binary",HLS:"hls",HSV:"hsv"}}static get grayScales(){return{AVERAGE:{name:"average",calc:(e,t,a)=>(e+t+a)/3},AMMA_AVERAGE:{name:"Gamma correction average",calc:(e,t,a)=>(e+t+a)/3},CIEXYZ:{name:"CIE XYZ",calc:(e,t,a)=>.2126*e+.7152*t+.0722*a},BT601:{name:"ITU-R Rec BT.601",calc:(e,t,a)=>.299*e+.587*t+.114*a},BT601_ROUGH1:{name:"Second decimal place of BT.601",calc:(e,t,a)=>.3*e+.59*t+.11*a},BT601_ROUGH2:{name:"First decimal place of BT.601",calc:(e,t,a)=>.3*e+.6*t+.1*a},BT709:{name:"ITU-R Rec BT.709",calc:(e,t,a)=>.2126*e+.7152*t+.0722*a},YCgCo:{name:"Y of YCgCo",calc:(e,t,a)=>e/4+t/2+a/4},HSV:{name:"V of HSV",calc:(e,t,a)=>Math.max(e,t,a)},HLS:{name:"V of HSV",calc:(e,t,a)=>(Math.max(e,t,a)+Math.min(e,t,a))/2},G:{name:"Green",calc:(e,t,a)=>t},B:{name:"Blue",calc:(e,t,a)=>a}}}get availTask(){return["SG","DN","ED"]}async readImage(e){if(e instanceof Blob)return new Promise((t=>{const a=new FileReader;a.readAsDataURL(e),a.onload=()=>{const e=new Image;e.src=a.result,e.onload=()=>{const a=document.createElement("canvas");a.width=e.width,a.height=e.height;const n=a.getContext("2d");n.drawImage(e,0,0);const c=n.getImageData(0,0,a.width,a.height),r=[];for(let e=0,t=0;e<a.height;e++){r[e]=[];for(let n=0;n<a.width;n++,t+=4)r[e][n]=[c.data[t],c.data[t+1],c.data[t+2],c.data[t+3]]}t(r)}}}));if(e instanceof HTMLImageElement||e instanceof HTMLVideoElement){const e=document.createElement("canvas");e.width=this._video.videoWidth,e.height=this._video.videoHeight;const t=e.getContext("2d");t.drawImage(this._video,0,0,e.width,e.height);const a=t.getImageData(0,0,e.width,e.height),n=[];for(let t=0,c=0;t<e.height;t++){n[t]=[];for(let r=0;r<e.width;r++,c+=4)n[t][r]=Array.from(a.data.slice(c,c+4))}return n}}_reduce(e,t,a="mean"){const n=[],c=e[0][0].length;let r=null;"max"===a?r=Math.max:"mean"===a&&(r=(e,t)=>e+t);for(let l=0,o=0;l<e.length;l+=t,o++){n[o]=[];for(let h=0,i=0;h<e[l].length;h+=t,i++){const s=Array(c).fill(0);for(let a=0;a<t;a++)if(!(e.length<=l+a))for(let n=0;n<t;n++)if(!(e[l].length<=h+n))for(let t=0;t<c;t++)s[t]=r(s[t],e[l+a][h+n][t]);n[o][i]=s,"mean"===a&&(n[o][i]=s.map((e=>e/(t*t))))}}return n}_convertSpace(e,t,a=!1,n=180){const[c,r,l,o]=e;if("rgb"===t)return a?[c/255,r/255,l/255]:[c,r,l];if("8 colors"===t){const e=c>>7?255:0,t=r>>7?255:0,n=l>>7?255:0;return a?[e/255,t/255,n/255]:[e,t,n]}if("gray"===t){const e=ImageData.grayScales.BT709.calc(c,r,l);return a?[e/255]:[e]}if("binary"===t){let e=ImageData.grayScales.BT709.calc(c,r,l);return e=e<n?0:255,a?[e/255]:[e]}if("hls"===t){const e=Math.max(c,r,l),t=Math.min(c,r,l);let n=null;e!==t&&(t===l?n=60*(r-c)/(e-t)+60:t===c?n=60*(l-r)/(e-t)+180:t===r&&(n=60*(c-l)/(e-t)+300));const o=(e+t)/2,h=e-t;return a?[n/360,o/255,h/255]:[n,o,h]}if("hsv"===t){const e=Math.max(c,r,l),t=Math.min(c,r,l);let n=null;e!==t&&(t===l?n=60*(r-c)/(e-t)+60:t===c?n=60*(l-r)/(e-t)+180:t===r&&(n=60*(c-l)/(e-t)+300));const o=e,h=e-t;return a?[n/360,o/255,h/255]:[n,o,h]}}_applySpace(e,t,a=!1,n=180){const c=[];for(let r=0;r<e.length;r++){c[r]=[];for(let l=0;l<e[r].length;l++)c[r][l]=this._convertSpace(e[r][l],t,a,n)}return c}_createCanvas(e,t=80,a=null){const n=e[0].length,c=e.length;a||(a=Math.ceil(t*c/n));const r=document.createElement("canvas");r.width=n,r.height=c;const l=r.getContext("2d"),o=l.createImageData(r.width,r.height);for(let t=0,a=0;t<r.height;t++)for(let n=0;n<r.width;n++,a+=4)o.data[a]=e[t][n][0],1===e[t][n].length?(o.data[a+1]=e[t][n][0],o.data[a+2]=e[t][n][0],o.data[a+3]=255):e[t][n].length>=3&&(o.data[a+1]=e[t][n][1],o.data[a+2]=e[t][n][2],o.data[a+3]=e[t][n][3]||255);l.putImageData(o,0,0);const h=document.createElement("canvas");h.width=t,h.height=a;return h.getContext("2d").drawImage(r,0,0,r.width,r.height,0,0,t,a),h}}