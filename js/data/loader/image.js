var x=Object.defineProperty;var d=(i,e)=>x(i,"name",{value:e,configurable:!0});const w={AVERAGE:{name:"average",calc:d((i,e,t)=>(i+e+t)/3,"calc")},AMMA_AVERAGE:{name:"Gamma correction average",calc:d((i,e,t)=>(i+e+t)/3,"calc")},CIEXYZ:{name:"CIE XYZ",calc:d((i,e,t)=>.2126*i+.7152*e+.0722*t,"calc")},BT601:{name:"ITU-R Rec BT.601",calc:d((i,e,t)=>.299*i+.587*e+.114*t,"calc")},BT601_ROUGH1:{name:"Second decimal place of BT.601",calc:d((i,e,t)=>.3*i+.59*e+.11*t,"calc")},BT601_ROUGH2:{name:"First decimal place of BT.601",calc:d((i,e,t)=>.3*i+.6*e+.1*t,"calc")},BT709:{name:"ITU-R Rec BT.709",calc:d((i,e,t)=>.2126*i+.7152*e+.0722*t,"calc")},YCgCo:{name:"Y of YCgCo",calc:d((i,e,t)=>i/4+e/2+t/4,"calc")},HSV:{name:"V of HSV",calc:d((i,e,t)=>Math.max(i,e,t),"calc")},HLS:{name:"V of HSV",calc:d((i,e,t)=>(Math.max(i,e,t)+Math.min(i,e,t))/2,"calc")},G:{name:"Green",calc:d((i,e,t)=>e,"calc")},B:{name:"Blue",calc:d((i,e,t)=>t,"calc")}};export default class v{static{d(this,"ImageLoader")}static get colorSpaces(){return{RGB:"rgb",COL8:"8 colors",GRAY:"gray",BINARY:"binary",HLS:"hls",HSV:"hsv"}}static async load(e){if(e instanceof Blob)return new Promise(t=>{const s=new FileReader;s.readAsDataURL(e),s.onload=()=>{const m=new Image;m.src=s.result,m.onload=()=>{const l=document.createElement("canvas");l.width=m.width,l.height=m.height;const n=l.getContext("2d");n.drawImage(m,0,0);const a=n.getImageData(0,0,l.width,l.height),h=[];for(let c=0,r=0;c<l.height;c++){h[c]=[];for(let o=0;o<l.width;o++,r+=4)h[c][o]=[a.data[r],a.data[r+1],a.data[r+2],a.data[r+3]]}t(h)}}});if(e instanceof HTMLImageElement||e instanceof HTMLVideoElement){const t=document.createElement("canvas");t.width=e.videoWidth||e.width,t.height=e.videoHeight||e.height;const s=t.getContext("2d");s.drawImage(e,0,0,t.width,t.height);const m=s.getImageData(0,0,t.width,t.height),l=[];for(let n=0,a=0;n<t.height;n++){l[n]=[];for(let h=0;h<t.width;h++,a+=4)l[n][h]=Array.from(m.data.slice(a,a+4))}return l}}static reduce(e,t,s="mean"){const m=[],l=e[0][0].length;let n=null;s==="max"?n=Math.max:s==="mean"&&(n=d((a,h)=>a+h,"f"));for(let a=0,h=0;a<e.length;a+=t,h++){m[h]=[];for(let c=0,r=0;c<e[a].length;c+=t,r++){const o=Array(l).fill(0);for(let f=0;f<t;f++)if(!(e.length<=a+f)){for(let g=0;g<t;g++)if(!(e[a].length<=c+g))for(let u=0;u<l;u++)o[u]=n(o[u],e[a+f][c+g][u])}m[h][r]=o,s==="mean"&&(m[h][r]=o.map(f=>f/(t*t)))}}return m}static _convertSpace(e,t,s=!1,m=180){const[l,n,a,h]=e;if(t==="rgb")return s?[l/255,n/255,a/255]:[l,n,a];if(t==="8 colors"){const c=l>>7?255:0,r=n>>7?255:0,o=a>>7?255:0;return s?[c/255,r/255,o/255]:[c,r,o]}else if(t==="gray"){const c=w.BT709.calc(l,n,a);return s?[c/255]:[c]}else if(t==="binary"){let c=w.BT709.calc(l,n,a);return c=c<m?0:255,s?[c/255]:[c]}else if(t==="hls"){const c=Math.max(l,n,a),r=Math.min(l,n,a);let o=null;c!==r&&(r===a?o=60*(n-l)/(c-r)+60:r===l?o=60*(a-n)/(c-r)+180:r===n&&(o=60*(l-a)/(c-r)+300));const f=(c+r)/2,g=c-r;return s?[o/360,f/255,g/255]:[o,f,g]}else if(t==="hsv"){const c=Math.max(l,n,a),r=Math.min(l,n,a);let o=null;c!==r&&(r===a?o=60*(n-l)/(c-r)+60:r===l?o=60*(a-n)/(c-r)+180:r===n&&(o=60*(l-a)/(c-r)+300));const f=c,g=c-r;return s?[o/360,f/255,g/255]:[o,f,g]}}static applySpace(e,t,s=!1,m=180){const l=[];for(let n=0;n<e.length;n++){l[n]=[];for(let a=0;a<e[n].length;a++)l[n][a]=v._convertSpace(e[n][a],t,s,m)}return l}static createCanvas(e,t=80,s=null){const m=e[0].length,l=e.length;s||(s=Math.ceil(t*l/m));const n=document.createElement("canvas");n.width=m,n.height=l;const a=n.getContext("2d"),h=a.createImageData(n.width,n.height);for(let o=0,f=0;o<n.height;o++)for(let g=0;g<n.width;g++,f+=4)h.data[f]=e[o][g][0],e[o][g].length===1?(h.data[f+1]=e[o][g][0],h.data[f+2]=e[o][g][0],h.data[f+3]=255):e[o][g].length>=3&&(h.data[f+1]=e[o][g][1],h.data[f+2]=e[o][g][2],h.data[f+3]=e[o][g][3]||255);a.putImageData(h,0,0);const c=document.createElement("canvas");return c.width=t,c.height=s,c.getContext("2d").drawImage(n,0,0,n.width,n.height,0,0,t,s),c}}
