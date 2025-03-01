var window = typeof window !== 'undefined' ? window : null; var self = typeof self !== 'undefined' ? self : null;
var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var onnx_pb$1 = {};

var googleProtobuf = {};

/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/

(function (exports) {
	var aa="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value);},e="undefined"!=typeof window&&window===commonjsGlobal?commonjsGlobal:"undefined"!=typeof commonjsGlobal&&null!=commonjsGlobal?commonjsGlobal:commonjsGlobal;function ba(a,b){if(b){var c=e;a=a.split(".");for(var d=0;d<a.length-1;d++){var f=a[d];f in c||(c[f]={});c=c[f];}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&aa(c,a,{configurable:true,writable:true,value:b});}}
	function ca(a){var b=0;return function(){return b<a.length?{done:false,value:a[b++]}:{done:true}}}function da(){da=function(){};e.Symbol||(e.Symbol=ea);}function fa(a,b){this.a=a;aa(this,"description",{configurable:true,writable:true,value:b});}fa.prototype.toString=function(){return this.a};var ea=function(){function a(c){if(this instanceof a)throw new TypeError("Symbol is not a constructor");return new fa("jscomp_symbol_"+(c||"")+"_"+b++,c)}var b=0;return a}();
	function ha(){da();var a=e.Symbol.iterator;a||(a=e.Symbol.iterator=e.Symbol("Symbol.iterator"));"function"!=typeof Array.prototype[a]&&aa(Array.prototype,a,{configurable:true,writable:true,value:function(){return ia(ca(this))}});ha=function(){};}function ia(a){ha();a={next:a};a[e.Symbol.iterator]=function(){return this};return a}
	function ja(a,b){ha();a instanceof String&&(a+="");var c=0,d={next:function(){if(c<a.length){var f=c++;return {value:b(f,a[f]),done:false}}d.next=function(){return {done:true,value:void 0}};return d.next()}};d[Symbol.iterator]=function(){return d};return d}ba("Array.prototype.entries",function(a){return a?a:function(){return ja(this,function(b,c){return [b,c]})}});var ka=commonjsGlobal||self;
	function g(a,b,c){a=a.split(".");c=c||ka;a[0]in c||"undefined"==typeof c.execScript||c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)a.length||void 0===b?c[d]&&c[d]!==Object.prototype[d]?c=c[d]:c=c[d]={}:c[d]=b;}
	function k(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return "array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return "object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return "array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return "function"}else return "null";
	else if("function"==b&&"undefined"==typeof a.call)return "object";return b}function la(a){var b=typeof a;return "object"==b&&null!=a||"function"==b}function ma(a,b,c){g(a,b,c);}function na(a,b){function c(){}c.prototype=b.prototype;a.prototype=new c;a.prototype.constructor=a;}var oa="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function pa(a,b){for(var c,d,f=1;f<arguments.length;f++){d=arguments[f];for(c in d)a[c]=d[c];for(var h=0;h<oa.length;h++)c=oa[h],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c]);}}var qa=Array.prototype.forEach?function(a,b){Array.prototype.forEach.call(a,b,void 0);}:function(a,b){for(var c=a.length,d="string"===typeof a?a.split(""):a,f=0;f<c;f++)f in d&&b.call(void 0,d[f],f,a);},l=Array.prototype.map?function(a,b){return Array.prototype.map.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=Array(c),f="string"===typeof a?a.split(""):a,h=0;h<c;h++)h in f&&(d[h]=b.call(void 0,f[h],h,a));return d};
	function ra(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)}function sa(a,b,c,d){var f="Assertion failed";if(c){f+=": "+c;var h=d;}else a&&(f+=": "+a,h=b);throw Error(f,h||[]);}function n(a,b,c){for(var d=[],f=2;f<arguments.length;++f)d[f-2]=arguments[f];a||sa("",null,b,d);return a}function ta(a,b,c){for(var d=[],f=2;f<arguments.length;++f)d[f-2]=arguments[f];"string"!==typeof a&&sa("Expected string but got %s: %s.",[k(a),a],b,d);}
	function ua(a,b,c){for(var d=[],f=2;f<arguments.length;++f)d[f-2]=arguments[f];Array.isArray(a)||sa("Expected array but got %s: %s.",[k(a),a],b,d);}function p(a,b){for(var c=[],d=1;d<arguments.length;++d)c[d-1]=arguments[d];throw Error("Failure"+(a?": "+a:""),c);}function q(a,b,c,d){for(var f=[],h=3;h<arguments.length;++h)f[h-3]=arguments[h];a instanceof b||sa("Expected instanceof %s but got %s.",[va(b),va(a)],c,f);}
	function va(a){return a instanceof Function?a.displayName||a.name||"unknown type name":a instanceof Object?a.constructor.displayName||a.constructor.name||Object.prototype.toString.call(a):null===a?"null":typeof a}function r(a,b){this.c=a;this.b=b;this.a={};this.arrClean=true;if(0<this.c.length){for(a=0;a<this.c.length;a++){b=this.c[a];var c=b[0];this.a[c.toString()]=new wa(c,b[1]);}this.arrClean=true;}}g("jspb.Map",r,void 0);
	r.prototype.g=function(){if(this.arrClean){if(this.b){var a=this.a,b;for(b in a)if(Object.prototype.hasOwnProperty.call(a,b)){var c=a[b].a;c&&c.g();}}}else {this.c.length=0;a=u(this);a.sort();for(b=0;b<a.length;b++){var d=this.a[a[b]];(c=d.a)&&c.g();this.c.push([d.key,d.value]);}this.arrClean=true;}return this.c};r.prototype.toArray=r.prototype.g;
	r.prototype.Mc=function(a,b){for(var c=this.g(),d=[],f=0;f<c.length;f++){var h=this.a[c[f][0].toString()];v(this,h);var m=h.a;m?(n(b),d.push([h.key,b(a,m)])):d.push([h.key,h.value]);}return d};r.prototype.toObject=r.prototype.Mc;r.fromObject=function(a,b,c){b=new r([],b);for(var d=0;d<a.length;d++){var f=a[d][0],h=c(a[d][1]);b.set(f,h);}return b};function w(a){this.a=0;this.b=a;}w.prototype.next=function(){return this.a<this.b.length?{done:false,value:this.b[this.a++]}:{done:true,value:void 0}};
	"undefined"!=typeof Symbol&&(w.prototype[Symbol.iterator]=function(){return this});r.prototype.Jb=function(){return u(this).length};r.prototype.getLength=r.prototype.Jb;r.prototype.clear=function(){this.a={};this.arrClean=false;};r.prototype.clear=r.prototype.clear;r.prototype.Cb=function(a){a=a.toString();var b=this.a.hasOwnProperty(a);delete this.a[a];this.arrClean=false;return b};r.prototype.del=r.prototype.Cb;
	r.prototype.Eb=function(){var a=[],b=u(this);b.sort();for(var c=0;c<b.length;c++){var d=this.a[b[c]];a.push([d.key,d.value]);}return a};r.prototype.getEntryList=r.prototype.Eb;r.prototype.entries=function(){var a=[],b=u(this);b.sort();for(var c=0;c<b.length;c++){var d=this.a[b[c]];a.push([d.key,v(this,d)]);}return new w(a)};r.prototype.entries=r.prototype.entries;r.prototype.keys=function(){var a=[],b=u(this);b.sort();for(var c=0;c<b.length;c++)a.push(this.a[b[c]].key);return new w(a)};
	r.prototype.keys=r.prototype.keys;r.prototype.values=function(){var a=[],b=u(this);b.sort();for(var c=0;c<b.length;c++)a.push(v(this,this.a[b[c]]));return new w(a)};r.prototype.values=r.prototype.values;r.prototype.forEach=function(a,b){var c=u(this);c.sort();for(var d=0;d<c.length;d++){var f=this.a[c[d]];a.call(b,v(this,f),f.key,this);}};r.prototype.forEach=r.prototype.forEach;
	r.prototype.set=function(a,b){var c=new wa(a);this.b?(c.a=b,c.value=b.g()):c.value=b;this.a[a.toString()]=c;this.arrClean=false;return this};r.prototype.set=r.prototype.set;function v(a,b){return a.b?(b.a||(b.a=new a.b(b.value)),b.a):b.value}r.prototype.get=function(a){if(a=this.a[a.toString()])return v(this,a)};r.prototype.get=r.prototype.get;r.prototype.has=function(a){return a.toString()in this.a};r.prototype.has=r.prototype.has;
	r.prototype.Jc=function(a,b,c,d,f){var h=u(this);h.sort();for(var m=0;m<h.length;m++){var t=this.a[h[m]];b.Va(a);c.call(b,1,t.key);this.b?d.call(b,2,v(this,t),f):d.call(b,2,t.value);b.Ya();}};r.prototype.serializeBinary=r.prototype.Jc;r.deserializeBinary=function(a,b,c,d,f,h,m){for(;b.oa()&&!b.bb();){var t=b.c;1==t?h=c.call(b):2==t&&(a.b?(n(f),m||(m=new a.b),d.call(b,m,f)):m=d.call(b));}n(void 0!=h);n(void 0!=m);a.set(h,m);};
	function u(a){a=a.a;var b=[],c;for(c in a)Object.prototype.hasOwnProperty.call(a,c)&&b.push(c);return b}function wa(a,b){this.key=a;this.value=b;this.a=void 0;}function xa(a){if(8192>=a.length)return String.fromCharCode.apply(null,a);for(var b="",c=0;c<a.length;c+=8192)b+=String.fromCharCode.apply(null,ra(a,c,c+8192));return b}var ya={"\x00":"\\0","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\x0B",'"':'\\"',"\\":"\\\\","<":"\\u003C"},za={"'":"\\'"};var Aa={},x=null;function Ba(a,b){ void 0===b&&(b=0);Ca();b=Aa[b];for(var c=[],d=0;d<a.length;d+=3){var f=a[d],h=d+1<a.length,m=h?a[d+1]:0,t=d+2<a.length,B=t?a[d+2]:0,M=f>>2;f=(f&3)<<4|m>>4;m=(m&15)<<2|B>>6;B&=63;t||(B=64,h||(m=64));c.push(b[M],b[f],b[m]||"",b[B]||"");}return c.join("")}function Da(a){var b=a.length,c=3*b/4;c%3?c=Math.floor(c):-1!="=.".indexOf(a[b-1])&&(c=-1!="=.".indexOf(a[b-2])?c-2:c-1);var d=new Uint8Array(c),f=0;Ea(a,function(h){d[f++]=h;});return d.subarray(0,f)}
	function Ea(a,b){function c(B){for(;d<a.length;){var M=a.charAt(d++),La=x[M];if(null!=La)return La;if(!/^[\s\xa0]*$/.test(M))throw Error("Unknown base64 encoding at char: "+M);}return B}Ca();for(var d=0;;){var f=c(-1),h=c(0),m=c(64),t=c(64);if(64===t&&-1===f)break;b(f<<2|h>>4);64!=m&&(b(h<<4&240|m>>2),64!=t&&b(m<<6&192|t));}}
	function Ca(){if(!x){x={};for(var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),b=["+/=","+/","-_=","-_.","-_"],c=0;5>c;c++){var d=a.concat(b[c].split(""));Aa[c]=d;for(var f=0;f<d.length;f++){var h=d[f];void 0===x[h]&&(x[h]=f);}}}}g("jspb.ConstBinaryMessage",function(){},void 0);g("jspb.BinaryMessage",function(){},void 0);g("jspb.BinaryConstants.FieldType",{yb:-1,ee:1,FLOAT:2,ke:3,te:4,je:5,xb:6,wb:7,BOOL:8,re:9,ie:10,le:11,ce:12,se:13,ge:14,me:15,ne:16,oe:17,pe:18,he:30,ve:31},void 0);g("jspb.BinaryConstants.WireType",{yb:-1,ue:0,xb:1,de:2,qe:3,fe:4,wb:5},void 0);
	g("jspb.BinaryConstants.FieldTypeToWireType",function(a){switch(a){case 5:case 3:case 13:case 4:case 17:case 18:case 8:case 14:case 31:return 0;case 1:case 6:case 16:case 30:return 1;case 9:case 11:case 12:return 2;case 2:case 7:case 15:return 5;default:return  -1}},void 0);g("jspb.BinaryConstants.INVALID_FIELD_NUMBER",-1,void 0);g("jspb.BinaryConstants.FLOAT32_EPS",1.401298464324817E-45,void 0);g("jspb.BinaryConstants.FLOAT32_MIN",1.1754943508222875E-38,void 0);
	g("jspb.BinaryConstants.FLOAT32_MAX",3.4028234663852886E38,void 0);g("jspb.BinaryConstants.FLOAT64_EPS",4.9E-324,void 0);g("jspb.BinaryConstants.FLOAT64_MIN",2.2250738585072014E-308,void 0);g("jspb.BinaryConstants.FLOAT64_MAX",1.7976931348623157E308,void 0);g("jspb.BinaryConstants.TWO_TO_20",1048576,void 0);g("jspb.BinaryConstants.TWO_TO_23",8388608,void 0);g("jspb.BinaryConstants.TWO_TO_31",2147483648,void 0);g("jspb.BinaryConstants.TWO_TO_32",4294967296,void 0);
	g("jspb.BinaryConstants.TWO_TO_52",4503599627370496,void 0);g("jspb.BinaryConstants.TWO_TO_63",0x7fffffffffffffff,void 0);g("jspb.BinaryConstants.TWO_TO_64",1.8446744073709552E19,void 0);g("jspb.BinaryConstants.ZERO_HASH","\x00\x00\x00\x00\x00\x00\x00\x00",void 0);var y=0,z=0;g("jspb.utils.getSplit64Low",function(){return y},void 0);g("jspb.utils.getSplit64High",function(){return z},void 0);function Fa(a){var b=a>>>0;a=Math.floor((a-b)/4294967296)>>>0;y=b;z=a;}g("jspb.utils.splitUint64",Fa,void 0);function A(a){var b=0>a;a=Math.abs(a);var c=a>>>0;a=Math.floor((a-c)/4294967296);a>>>=0;b&&(a=~a>>>0,c=(~c>>>0)+1,4294967295<c&&(c=0,a++,4294967295<a&&(a=0)));y=c;z=a;}g("jspb.utils.splitInt64",A,void 0);
	function Ga(a){var b=0>a;a=2*Math.abs(a);Fa(a);a=y;var c=z;b&&(0==a?0==c?c=a=4294967295:(c--,a=4294967295):a--);y=a;z=c;}g("jspb.utils.splitZigzag64",Ga,void 0);
	function Ha(a){var b=0>a?1:0;a=b?-a:a;if(0===a)0<1/a?y=z=0:(z=0,y=2147483648);else if(isNaN(a))z=0,y=2147483647;else if(3.4028234663852886E38<a)z=0,y=(b<<31|2139095040)>>>0;else if(1.1754943508222875E-38>a)a=Math.round(a/Math.pow(2,-149)),z=0,y=(b<<31|a)>>>0;else {var c=Math.floor(Math.log(a)/Math.LN2);a*=Math.pow(2,-c);a=Math.round(8388608*a);16777216<=a&&++c;z=0;y=(b<<31|c+127<<23|a&8388607)>>>0;}}g("jspb.utils.splitFloat32",Ha,void 0);
	function Ia(a){var b=0>a?1:0;a=b?-a:a;if(0===a)z=0<1/a?0:2147483648,y=0;else if(isNaN(a))z=2147483647,y=4294967295;else if(1.7976931348623157E308<a)z=(b<<31|2146435072)>>>0,y=0;else if(2.2250738585072014E-308>a)a/=Math.pow(2,-1074),z=(b<<31|a/4294967296)>>>0,y=a>>>0;else {var c=a,d=0;if(2<=c)for(;2<=c&&1023>d;)d++,c/=2;else for(;1>c&&-1022<d;)c*=2,d--;a*=Math.pow(2,-d);z=(b<<31|d+1023<<20|1048576*a&1048575)>>>0;y=4503599627370496*a>>>0;}}g("jspb.utils.splitFloat64",Ia,void 0);
	function C(a){var b=a.charCodeAt(4),c=a.charCodeAt(5),d=a.charCodeAt(6),f=a.charCodeAt(7);y=a.charCodeAt(0)+(a.charCodeAt(1)<<8)+(a.charCodeAt(2)<<16)+(a.charCodeAt(3)<<24)>>>0;z=b+(c<<8)+(d<<16)+(f<<24)>>>0;}g("jspb.utils.splitHash64",C,void 0);function D(a,b){return 4294967296*b+(a>>>0)}g("jspb.utils.joinUint64",D,void 0);function E(a,b){var c=b&2147483648;c&&(a=~a+1>>>0,b=~b>>>0,0==a&&(b=b+1>>>0));a=D(a,b);return c?-a:a}g("jspb.utils.joinInt64",E,void 0);
	function Ja(a,b,c){var d=b>>31;return c(a<<1^d,(b<<1|a>>>31)^d)}g("jspb.utils.toZigzag64",Ja,void 0);function Ka(a,b){return Ma(a,b,E)}g("jspb.utils.joinZigzag64",Ka,void 0);function Ma(a,b,c){var d=-(a&1);return c((a>>>1|b<<31)^d,b>>>1^d)}g("jspb.utils.fromZigzag64",Ma,void 0);function Na(a){var b=2*(a>>31)+1,c=a>>>23&255;a&=8388607;return 255==c?a?NaN:Infinity*b:0==c?b*Math.pow(2,-149)*a:b*Math.pow(2,c-150)*(a+Math.pow(2,23))}g("jspb.utils.joinFloat32",Na,void 0);
	function Oa(a,b){var c=2*(b>>31)+1,d=b>>>20&2047;a=4294967296*(b&1048575)+a;return 2047==d?a?NaN:Infinity*c:0==d?c*Math.pow(2,-1074)*a:c*Math.pow(2,d-1075)*(a+4503599627370496)}g("jspb.utils.joinFloat64",Oa,void 0);function Pa(a,b){return String.fromCharCode(a>>>0&255,a>>>8&255,a>>>16&255,a>>>24&255,b>>>0&255,b>>>8&255,b>>>16&255,b>>>24&255)}g("jspb.utils.joinHash64",Pa,void 0);g("jspb.utils.DIGITS","0123456789abcdef".split(""),void 0);
	function F(a,b){function c(f,h){f=f?String(f):"";return h?"0000000".slice(f.length)+f:f}if(2097151>=b)return ""+D(a,b);var d=(a>>>24|b<<8)>>>0&16777215;b=b>>16&65535;a=(a&16777215)+6777216*d+6710656*b;d+=8147497*b;b*=2;1E7<=a&&(d+=Math.floor(a/1E7),a%=1E7);1E7<=d&&(b+=Math.floor(d/1E7),d%=1E7);return c(b,0)+c(d,b)+c(a,1)}g("jspb.utils.joinUnsignedDecimalString",F,void 0);function G(a,b){var c=b&2147483648;c&&(a=~a+1>>>0,b=~b+(0==a?1:0)>>>0);a=F(a,b);return c?"-"+a:a}
	g("jspb.utils.joinSignedDecimalString",G,void 0);function Qa(a,b){C(a);a=y;var c=z;return b?G(a,c):F(a,c)}g("jspb.utils.hash64ToDecimalString",Qa,void 0);g("jspb.utils.hash64ArrayToDecimalStrings",function(a,b){for(var c=Array(a.length),d=0;d<a.length;d++)c[d]=Qa(a[d],b);return c},void 0);
	function H(a){function b(m,t){for(var B=0;8>B&&(1!==m||0<t);B++)t=m*f[B]+t,f[B]=t&255,t>>>=8;}function c(){for(var m=0;8>m;m++)f[m]=~f[m]&255;}n(0<a.length);var d=false;"-"===a[0]&&(d=true,a=a.slice(1));for(var f=[0,0,0,0,0,0,0,0],h=0;h<a.length;h++)b(10,a.charCodeAt(h)-48);d&&(c(),b(1,1));return xa(f)}g("jspb.utils.decimalStringToHash64",H,void 0);g("jspb.utils.splitDecimalString",function(a){C(H(a));},void 0);function Ra(a){return String.fromCharCode(10>a?48+a:87+a)}
	function Sa(a){return 97<=a?a-97+10:a-48}g("jspb.utils.hash64ToHexString",function(a){var b=Array(18);b[0]="0";b[1]="x";for(var c=0;8>c;c++){var d=a.charCodeAt(7-c);b[2*c+2]=Ra(d>>4);b[2*c+3]=Ra(d&15);}return b.join("")},void 0);g("jspb.utils.hexStringToHash64",function(a){a=a.toLowerCase();n(18==a.length);n("0"==a[0]);n("x"==a[1]);for(var b="",c=0;8>c;c++)b=String.fromCharCode(16*Sa(a.charCodeAt(2*c+2))+Sa(a.charCodeAt(2*c+3)))+b;return b},void 0);
	g("jspb.utils.hash64ToNumber",function(a,b){C(a);a=y;var c=z;return b?E(a,c):D(a,c)},void 0);g("jspb.utils.numberToHash64",function(a){A(a);return Pa(y,z)},void 0);g("jspb.utils.countVarints",function(a,b,c){for(var d=0,f=b;f<c;f++)d+=a[f]>>7;return c-b-d},void 0);
	g("jspb.utils.countVarintFields",function(a,b,c,d){var f=0;d*=8;if(128>d)for(;b<c&&a[b++]==d;)for(f++;;){var h=a[b++];if(0==(h&128))break}else for(;b<c;){for(h=d;128<h;){if(a[b]!=(h&127|128))return f;b++;h>>=7;}if(a[b++]!=h)break;for(f++;h=a[b++],0!=(h&128););}return f},void 0);function Ta(a,b,c,d,f){var h=0;if(128>d)for(;b<c&&a[b++]==d;)h++,b+=f;else for(;b<c;){for(var m=d;128<m;){if(a[b++]!=(m&127|128))return h;m>>=7;}if(a[b++]!=m)break;h++;b+=f;}return h}
	g("jspb.utils.countFixed32Fields",function(a,b,c,d){return Ta(a,b,c,8*d+5,4)},void 0);g("jspb.utils.countFixed64Fields",function(a,b,c,d){return Ta(a,b,c,8*d+1,8)},void 0);g("jspb.utils.countDelimitedFields",function(a,b,c,d){var f=0;for(d=8*d+2;b<c;){for(var h=d;128<h;){if(a[b++]!=(h&127|128))return f;h>>=7;}if(a[b++]!=h)break;f++;for(var m=0,t=1;h=a[b++],m+=(h&127)*t,t*=128,0!=(h&128););b+=m;}return f},void 0);
	g("jspb.utils.debugBytesToTextFormat",function(a){var b='"';if(a){a=Ua(a);for(var c=0;c<a.length;c++)b+="\\x",16>a[c]&&(b+="0"),b+=a[c].toString(16);}return b+'"'},void 0);
	g("jspb.utils.debugScalarToTextFormat",function(a){if("string"===typeof a){a=String(a);for(var b=['"'],c=0;c<a.length;c++){var d=a.charAt(c),f=d.charCodeAt(0),h=c+1,m;if(!(m=ya[d])){if(!(31<f&&127>f))if(f=d,f in za)d=za[f];else if(f in ya)d=za[f]=ya[f];else {m=f.charCodeAt(0);if(31<m&&127>m)d=f;else {if(256>m){if(d="\\x",16>m||256<m)d+="0";}else d="\\u",4096>m&&(d+="0");d+=m.toString(16).toUpperCase();}d=za[f]=d;}m=d;}b[h]=m;}b.push('"');a=b.join("");}else a=a.toString();return a},void 0);
	g("jspb.utils.stringToByteArray",function(a){for(var b=new Uint8Array(a.length),c=0;c<a.length;c++){var d=a.charCodeAt(c);if(255<d)throw Error("Conversion error: string contains codepoint outside of byte range");b[c]=d;}return b},void 0);
	function Ua(a){if(a.constructor===Uint8Array)return a;if(a.constructor===ArrayBuffer)return new Uint8Array(a);if(a.constructor===Array)return new Uint8Array(a);if(a.constructor===String)return Da(a);if(a instanceof Uint8Array)return new Uint8Array(a.buffer,a.byteOffset,a.byteLength);p("Type not convertible to Uint8Array.");return new Uint8Array(0)}g("jspb.utils.byteSourceToUint8Array",Ua,void 0);function I(a,b,c){this.b=null;this.a=this.c=this.h=0;this.v=false;a&&this.H(a,b,c);}g("jspb.BinaryDecoder",I,void 0);var Va=[];I.getInstanceCacheLength=function(){return Va.length};function Wa(a,b,c){if(Va.length){var d=Va.pop();a&&d.H(a,b,c);return d}return new I(a,b,c)}I.alloc=Wa;I.prototype.Ca=function(){this.clear();100>Va.length&&Va.push(this);};I.prototype.free=I.prototype.Ca;I.prototype.clone=function(){return Wa(this.b,this.h,this.c-this.h)};I.prototype.clone=I.prototype.clone;
	I.prototype.clear=function(){this.b=null;this.a=this.c=this.h=0;this.v=false;};I.prototype.clear=I.prototype.clear;I.prototype.Y=function(){return this.b};I.prototype.getBuffer=I.prototype.Y;I.prototype.H=function(a,b,c){this.b=Ua(a);this.h=void 0!==b?b:0;this.c=void 0!==c?this.h+c:this.b.length;this.a=this.h;};I.prototype.setBlock=I.prototype.H;I.prototype.Db=function(){return this.c};I.prototype.getEnd=I.prototype.Db;I.prototype.setEnd=function(a){this.c=a;};I.prototype.setEnd=I.prototype.setEnd;
	I.prototype.reset=function(){this.a=this.h;};I.prototype.reset=I.prototype.reset;I.prototype.B=function(){return this.a};I.prototype.getCursor=I.prototype.B;I.prototype.Ma=function(a){this.a=a;};I.prototype.setCursor=I.prototype.Ma;I.prototype.advance=function(a){this.a+=a;n(this.a<=this.c);};I.prototype.advance=I.prototype.advance;I.prototype.ya=function(){return this.a==this.c};I.prototype.atEnd=I.prototype.ya;I.prototype.Qb=function(){return this.a>this.c};I.prototype.pastEnd=I.prototype.Qb;
	I.prototype.getError=function(){return this.v||0>this.a||this.a>this.c};I.prototype.getError=I.prototype.getError;I.prototype.w=function(a){for(var b=128,c=0,d=0,f=0;4>f&&128<=b;f++)b=this.b[this.a++],c|=(b&127)<<7*f;128<=b&&(b=this.b[this.a++],c|=(b&127)<<28,d|=(b&127)>>4);if(128<=b)for(f=0;5>f&&128<=b;f++)b=this.b[this.a++],d|=(b&127)<<7*f+3;if(128>b)return a(c>>>0,d>>>0);p("Failed to read varint, encoding is invalid.");this.v=true;};I.prototype.readSplitVarint64=I.prototype.w;
	I.prototype.ea=function(a){return this.w(function(b,c){return Ma(b,c,a)})};I.prototype.readSplitZigzagVarint64=I.prototype.ea;I.prototype.ta=function(a){var b=this.b,c=this.a;this.a+=8;for(var d=0,f=0,h=c+7;h>=c;h--)d=d<<8|b[h],f=f<<8|b[h+4];return a(d,f)};I.prototype.readSplitFixed64=I.prototype.ta;I.prototype.kb=function(){for(;this.b[this.a]&128;)this.a++;this.a++;};I.prototype.skipVarint=I.prototype.kb;I.prototype.mb=function(a){for(;128<a;)this.a--,a>>>=7;this.a--;};I.prototype.unskipVarint=I.prototype.mb;
	I.prototype.o=function(){var a=this.b;var b=a[this.a];var c=b&127;if(128>b)return this.a+=1,n(this.a<=this.c),c;b=a[this.a+1];c|=(b&127)<<7;if(128>b)return this.a+=2,n(this.a<=this.c),c;b=a[this.a+2];c|=(b&127)<<14;if(128>b)return this.a+=3,n(this.a<=this.c),c;b=a[this.a+3];c|=(b&127)<<21;if(128>b)return this.a+=4,n(this.a<=this.c),c;b=a[this.a+4];c|=(b&15)<<28;if(128>b)return this.a+=5,n(this.a<=this.c),c>>>0;this.a+=5;128<=a[this.a++]&&128<=a[this.a++]&&128<=a[this.a++]&&128<=a[this.a++]&&128<=
	a[this.a++]&&n(false);n(this.a<=this.c);return c};I.prototype.readUnsignedVarint32=I.prototype.o;I.prototype.da=function(){return ~~this.o()};I.prototype.readSignedVarint32=I.prototype.da;I.prototype.O=function(){return this.o().toString()};I.prototype.Ea=function(){return this.da().toString()};I.prototype.readSignedVarint32String=I.prototype.Ea;I.prototype.Ia=function(){var a=this.o();return a>>>1^-(a&1)};I.prototype.readZigzagVarint32=I.prototype.Ia;I.prototype.Ga=function(){return this.w(D)};
	I.prototype.readUnsignedVarint64=I.prototype.Ga;I.prototype.Ha=function(){return this.w(F)};I.prototype.readUnsignedVarint64String=I.prototype.Ha;I.prototype.sa=function(){return this.w(E)};I.prototype.readSignedVarint64=I.prototype.sa;I.prototype.Fa=function(){return this.w(G)};I.prototype.readSignedVarint64String=I.prototype.Fa;I.prototype.Ja=function(){return this.w(Ka)};I.prototype.readZigzagVarint64=I.prototype.Ja;I.prototype.fb=function(){return this.ea(Pa)};
	I.prototype.readZigzagVarintHash64=I.prototype.fb;I.prototype.Ka=function(){return this.ea(G)};I.prototype.readZigzagVarint64String=I.prototype.Ka;I.prototype.Gc=function(){var a=this.b[this.a];this.a+=1;n(this.a<=this.c);return a};I.prototype.readUint8=I.prototype.Gc;I.prototype.Ec=function(){var a=this.b[this.a],b=this.b[this.a+1];this.a+=2;n(this.a<=this.c);return a<<0|b<<8};I.prototype.readUint16=I.prototype.Ec;
	I.prototype.m=function(){var a=this.b[this.a],b=this.b[this.a+1],c=this.b[this.a+2],d=this.b[this.a+3];this.a+=4;n(this.a<=this.c);return (a<<0|b<<8|c<<16|d<<24)>>>0};I.prototype.readUint32=I.prototype.m;I.prototype.ga=function(){var a=this.m(),b=this.m();return D(a,b)};I.prototype.readUint64=I.prototype.ga;I.prototype.ha=function(){var a=this.m(),b=this.m();return F(a,b)};I.prototype.readUint64String=I.prototype.ha;
	I.prototype.Xb=function(){var a=this.b[this.a];this.a+=1;n(this.a<=this.c);return a<<24>>24};I.prototype.readInt8=I.prototype.Xb;I.prototype.Vb=function(){var a=this.b[this.a],b=this.b[this.a+1];this.a+=2;n(this.a<=this.c);return (a<<0|b<<8)<<16>>16};I.prototype.readInt16=I.prototype.Vb;I.prototype.P=function(){var a=this.b[this.a],b=this.b[this.a+1],c=this.b[this.a+2],d=this.b[this.a+3];this.a+=4;n(this.a<=this.c);return a<<0|b<<8|c<<16|d<<24};I.prototype.readInt32=I.prototype.P;
	I.prototype.ba=function(){var a=this.m(),b=this.m();return E(a,b)};I.prototype.readInt64=I.prototype.ba;I.prototype.ca=function(){var a=this.m(),b=this.m();return G(a,b)};I.prototype.readInt64String=I.prototype.ca;I.prototype.aa=function(){var a=this.m();return Na(a)};I.prototype.readFloat=I.prototype.aa;I.prototype.Z=function(){var a=this.m(),b=this.m();return Oa(a,b)};I.prototype.readDouble=I.prototype.Z;I.prototype.pa=function(){return !!this.b[this.a++]};I.prototype.readBool=I.prototype.pa;
	I.prototype.ra=function(){return this.da()};I.prototype.readEnum=I.prototype.ra;
	I.prototype.fa=function(a){var b=this.b,c=this.a;a=c+a;for(var d=[],f="";c<a;){var h=b[c++];if(128>h)d.push(h);else if(192>h)continue;else if(224>h){var m=b[c++];d.push((h&31)<<6|m&63);}else if(240>h){m=b[c++];var t=b[c++];d.push((h&15)<<12|(m&63)<<6|t&63);}else if(248>h){m=b[c++];t=b[c++];var B=b[c++];h=(h&7)<<18|(m&63)<<12|(t&63)<<6|B&63;h-=65536;d.push((h>>10&1023)+55296,(h&1023)+56320);}8192<=d.length&&(f+=String.fromCharCode.apply(null,d),d.length=0);}f+=xa(d);this.a=c;return f};
	I.prototype.readString=I.prototype.fa;I.prototype.Dc=function(){var a=this.o();return this.fa(a)};I.prototype.readStringWithLength=I.prototype.Dc;I.prototype.qa=function(a){if(0>a||this.a+a>this.b.length)return this.v=true,p("Invalid byte length!"),new Uint8Array(0);var b=this.b.subarray(this.a,this.a+a);this.a+=a;n(this.a<=this.c);return b};I.prototype.readBytes=I.prototype.qa;I.prototype.ia=function(){return this.w(Pa)};I.prototype.readVarintHash64=I.prototype.ia;
	I.prototype.$=function(){var a=this.b,b=this.a,c=a[b],d=a[b+1],f=a[b+2],h=a[b+3],m=a[b+4],t=a[b+5],B=a[b+6];a=a[b+7];this.a+=8;return String.fromCharCode(c,d,f,h,m,t,B,a)};I.prototype.readFixedHash64=I.prototype.$;function J(a,b,c){this.a=Wa(a,b,c);this.O=this.a.B();this.b=this.c=-1;this.h=false;this.v=null;}g("jspb.BinaryReader",J,void 0);var K=[];J.clearInstanceCache=function(){K=[];};J.getInstanceCacheLength=function(){return K.length};function Xa(a,b,c){if(K.length){var d=K.pop();a&&d.a.H(a,b,c);return d}return new J(a,b,c)}J.alloc=Xa;J.prototype.zb=Xa;J.prototype.alloc=J.prototype.zb;J.prototype.Ca=function(){this.a.clear();this.b=this.c=-1;this.h=false;this.v=null;100>K.length&&K.push(this);};
	J.prototype.free=J.prototype.Ca;J.prototype.Fb=function(){return this.O};J.prototype.getFieldCursor=J.prototype.Fb;J.prototype.B=function(){return this.a.B()};J.prototype.getCursor=J.prototype.B;J.prototype.Y=function(){return this.a.Y()};J.prototype.getBuffer=J.prototype.Y;J.prototype.Hb=function(){return this.c};J.prototype.getFieldNumber=J.prototype.Hb;J.prototype.Lb=function(){return this.b};J.prototype.getWireType=J.prototype.Lb;J.prototype.Mb=function(){return 2==this.b};
	J.prototype.isDelimited=J.prototype.Mb;J.prototype.bb=function(){return 4==this.b};J.prototype.isEndGroup=J.prototype.bb;J.prototype.getError=function(){return this.h||this.a.getError()};J.prototype.getError=J.prototype.getError;J.prototype.H=function(a,b,c){this.a.H(a,b,c);this.b=this.c=-1;};J.prototype.setBlock=J.prototype.H;J.prototype.reset=function(){this.a.reset();this.b=this.c=-1;};J.prototype.reset=J.prototype.reset;J.prototype.advance=function(a){this.a.advance(a);};J.prototype.advance=J.prototype.advance;
	J.prototype.oa=function(){if(this.a.ya())return  false;if(this.getError())return p("Decoder hit an error"),false;this.O=this.a.B();var a=this.a.o(),b=a>>>3;a&=7;if(0!=a&&5!=a&&1!=a&&2!=a&&3!=a&&4!=a)return p("Invalid wire type: %s (at position %s)",a,this.O),this.h=true,false;this.c=b;this.b=a;return  true};J.prototype.nextField=J.prototype.oa;J.prototype.Oa=function(){this.a.mb(this.c<<3|this.b);};J.prototype.unskipHeader=J.prototype.Oa;
	J.prototype.Lc=function(){var a=this.c;for(this.Oa();this.oa()&&this.c==a;)this.C();this.a.ya()||this.Oa();};J.prototype.skipMatchingFields=J.prototype.Lc;J.prototype.lb=function(){0!=this.b?(p("Invalid wire type for skipVarintField"),this.C()):this.a.kb();};J.prototype.skipVarintField=J.prototype.lb;J.prototype.gb=function(){if(2!=this.b)p("Invalid wire type for skipDelimitedField"),this.C();else {var a=this.a.o();this.a.advance(a);}};J.prototype.skipDelimitedField=J.prototype.gb;
	J.prototype.hb=function(){5!=this.b?(p("Invalid wire type for skipFixed32Field"),this.C()):this.a.advance(4);};J.prototype.skipFixed32Field=J.prototype.hb;J.prototype.ib=function(){1!=this.b?(p("Invalid wire type for skipFixed64Field"),this.C()):this.a.advance(8);};J.prototype.skipFixed64Field=J.prototype.ib;J.prototype.jb=function(){var a=this.c;do{if(!this.oa()){p("Unmatched start-group tag: stream EOF");this.h=true;break}if(4==this.b){this.c!=a&&(p("Unmatched end-group tag"),this.h=true);break}this.C();}while(1)};
	J.prototype.skipGroup=J.prototype.jb;J.prototype.C=function(){switch(this.b){case 0:this.lb();break;case 1:this.ib();break;case 2:this.gb();break;case 5:this.hb();break;case 3:this.jb();break;default:p("Invalid wire encoding for field.");}};J.prototype.skipField=J.prototype.C;J.prototype.Hc=function(a,b){null===this.v&&(this.v={});n(!this.v[a]);this.v[a]=b;};J.prototype.registerReadCallback=J.prototype.Hc;J.prototype.Ic=function(a){n(null!==this.v);a=this.v[a];n(a);return a(this)};
	J.prototype.runReadCallback=J.prototype.Ic;J.prototype.Yb=function(a,b){n(2==this.b);var c=this.a.c,d=this.a.o();d=this.a.B()+d;this.a.setEnd(d);b(a,this);this.a.Ma(d);this.a.setEnd(c);};J.prototype.readMessage=J.prototype.Yb;J.prototype.Ub=function(a,b,c){n(3==this.b);n(this.c==a);c(b,this);this.h||4==this.b||(p("Group submessage did not end with an END_GROUP tag"),this.h=true);};J.prototype.readGroup=J.prototype.Ub;
	J.prototype.Gb=function(){n(2==this.b);var a=this.a.o(),b=this.a.B(),c=b+a;a=Wa(this.a.Y(),b,a);this.a.Ma(c);return a};J.prototype.getFieldDecoder=J.prototype.Gb;J.prototype.P=function(){n(0==this.b);return this.a.da()};J.prototype.readInt32=J.prototype.P;J.prototype.Wb=function(){n(0==this.b);return this.a.Ea()};J.prototype.readInt32String=J.prototype.Wb;J.prototype.ba=function(){n(0==this.b);return this.a.sa()};J.prototype.readInt64=J.prototype.ba;J.prototype.ca=function(){n(0==this.b);return this.a.Fa()};
	J.prototype.readInt64String=J.prototype.ca;J.prototype.m=function(){n(0==this.b);return this.a.o()};J.prototype.readUint32=J.prototype.m;J.prototype.Fc=function(){n(0==this.b);return this.a.O()};J.prototype.readUint32String=J.prototype.Fc;J.prototype.ga=function(){n(0==this.b);return this.a.Ga()};J.prototype.readUint64=J.prototype.ga;J.prototype.ha=function(){n(0==this.b);return this.a.Ha()};J.prototype.readUint64String=J.prototype.ha;J.prototype.zc=function(){n(0==this.b);return this.a.Ia()};
	J.prototype.readSint32=J.prototype.zc;J.prototype.Ac=function(){n(0==this.b);return this.a.Ja()};J.prototype.readSint64=J.prototype.Ac;J.prototype.Bc=function(){n(0==this.b);return this.a.Ka()};J.prototype.readSint64String=J.prototype.Bc;J.prototype.Rb=function(){n(5==this.b);return this.a.m()};J.prototype.readFixed32=J.prototype.Rb;J.prototype.Sb=function(){n(1==this.b);return this.a.ga()};J.prototype.readFixed64=J.prototype.Sb;J.prototype.Tb=function(){n(1==this.b);return this.a.ha()};
	J.prototype.readFixed64String=J.prototype.Tb;J.prototype.vc=function(){n(5==this.b);return this.a.P()};J.prototype.readSfixed32=J.prototype.vc;J.prototype.wc=function(){n(5==this.b);return this.a.P().toString()};J.prototype.readSfixed32String=J.prototype.wc;J.prototype.xc=function(){n(1==this.b);return this.a.ba()};J.prototype.readSfixed64=J.prototype.xc;J.prototype.yc=function(){n(1==this.b);return this.a.ca()};J.prototype.readSfixed64String=J.prototype.yc;
	J.prototype.aa=function(){n(5==this.b);return this.a.aa()};J.prototype.readFloat=J.prototype.aa;J.prototype.Z=function(){n(1==this.b);return this.a.Z()};J.prototype.readDouble=J.prototype.Z;J.prototype.pa=function(){n(0==this.b);return !!this.a.o()};J.prototype.readBool=J.prototype.pa;J.prototype.ra=function(){n(0==this.b);return this.a.sa()};J.prototype.readEnum=J.prototype.ra;J.prototype.fa=function(){n(2==this.b);var a=this.a.o();return this.a.fa(a)};J.prototype.readString=J.prototype.fa;
	J.prototype.qa=function(){n(2==this.b);var a=this.a.o();return this.a.qa(a)};J.prototype.readBytes=J.prototype.qa;J.prototype.ia=function(){n(0==this.b);return this.a.ia()};J.prototype.readVarintHash64=J.prototype.ia;J.prototype.Cc=function(){n(0==this.b);return this.a.fb()};J.prototype.readSintHash64=J.prototype.Cc;J.prototype.w=function(a){n(0==this.b);return this.a.w(a)};J.prototype.readSplitVarint64=J.prototype.w;
	J.prototype.ea=function(a){n(0==this.b);return this.a.w(function(b,c){return Ma(b,c,a)})};J.prototype.readSplitZigzagVarint64=J.prototype.ea;J.prototype.$=function(){n(1==this.b);return this.a.$()};J.prototype.readFixedHash64=J.prototype.$;J.prototype.ta=function(a){n(1==this.b);return this.a.ta(a)};J.prototype.readSplitFixed64=J.prototype.ta;function L(a,b){n(2==a.b);var c=a.a.o();c=a.a.B()+c;for(var d=[];a.a.B()<c;)d.push(b.call(a.a));return d}J.prototype.gc=function(){return L(this,this.a.da)};
	J.prototype.readPackedInt32=J.prototype.gc;J.prototype.hc=function(){return L(this,this.a.Ea)};J.prototype.readPackedInt32String=J.prototype.hc;J.prototype.ic=function(){return L(this,this.a.sa)};J.prototype.readPackedInt64=J.prototype.ic;J.prototype.jc=function(){return L(this,this.a.Fa)};J.prototype.readPackedInt64String=J.prototype.jc;J.prototype.qc=function(){return L(this,this.a.o)};J.prototype.readPackedUint32=J.prototype.qc;J.prototype.rc=function(){return L(this,this.a.O)};
	J.prototype.readPackedUint32String=J.prototype.rc;J.prototype.sc=function(){return L(this,this.a.Ga)};J.prototype.readPackedUint64=J.prototype.sc;J.prototype.tc=function(){return L(this,this.a.Ha)};J.prototype.readPackedUint64String=J.prototype.tc;J.prototype.nc=function(){return L(this,this.a.Ia)};J.prototype.readPackedSint32=J.prototype.nc;J.prototype.oc=function(){return L(this,this.a.Ja)};J.prototype.readPackedSint64=J.prototype.oc;J.prototype.pc=function(){return L(this,this.a.Ka)};
	J.prototype.readPackedSint64String=J.prototype.pc;J.prototype.bc=function(){return L(this,this.a.m)};J.prototype.readPackedFixed32=J.prototype.bc;J.prototype.cc=function(){return L(this,this.a.ga)};J.prototype.readPackedFixed64=J.prototype.cc;J.prototype.dc=function(){return L(this,this.a.ha)};J.prototype.readPackedFixed64String=J.prototype.dc;J.prototype.kc=function(){return L(this,this.a.P)};J.prototype.readPackedSfixed32=J.prototype.kc;J.prototype.lc=function(){return L(this,this.a.ba)};
	J.prototype.readPackedSfixed64=J.prototype.lc;J.prototype.mc=function(){return L(this,this.a.ca)};J.prototype.readPackedSfixed64String=J.prototype.mc;J.prototype.fc=function(){return L(this,this.a.aa)};J.prototype.readPackedFloat=J.prototype.fc;J.prototype.$b=function(){return L(this,this.a.Z)};J.prototype.readPackedDouble=J.prototype.$b;J.prototype.Zb=function(){return L(this,this.a.pa)};J.prototype.readPackedBool=J.prototype.Zb;J.prototype.ac=function(){return L(this,this.a.ra)};
	J.prototype.readPackedEnum=J.prototype.ac;J.prototype.uc=function(){return L(this,this.a.ia)};J.prototype.readPackedVarintHash64=J.prototype.uc;J.prototype.ec=function(){return L(this,this.a.$)};J.prototype.readPackedFixedHash64=J.prototype.ec;function Ya(a,b,c,d,f){this.ma=a;this.Ba=b;this.la=c;this.Na=d;this.na=f;}g("jspb.ExtensionFieldInfo",Ya,void 0);function Za(a,b,c,d,f,h){this.Za=a;this.za=b;this.Aa=c;this.Wa=d;this.Ab=f;this.Nb=h;}g("jspb.ExtensionFieldBinaryInfo",Za,void 0);Ya.prototype.F=function(){return !!this.la};Ya.prototype.isMessageType=Ya.prototype.F;function N(){}g("jspb.Message",N,void 0);N.GENERATE_TO_OBJECT=true;N.GENERATE_FROM_OBJECT=true;var $a="function"==typeof Uint8Array;N.prototype.Ib=function(){return this.b};
	N.prototype.getJsPbMessageId=N.prototype.Ib;
	N.initialize=function(a,b,c,d,f,h){a.f=null;b||(b=c?[c]:[]);a.b=c?String(c):void 0;a.D=0===c?-1:0;a.u=b;a:{c=a.u.length;b=-1;if(c&&(b=c-1,c=a.u[b],!(null===c||"object"!=typeof c||Array.isArray(c)||$a&&c instanceof Uint8Array))){a.G=b-a.D;a.i=c;break a} -1<d?(a.G=Math.max(d,b+1-a.D),a.i=null):a.G=Number.MAX_VALUE;}a.a={};if(f)for(d=0;d<f.length;d++)b=f[d],b<a.G?(b+=a.D,a.u[b]=a.u[b]||ab):(bb(a),a.i[b]=a.i[b]||ab);if(h&&h.length)for(d=0;d<h.length;d++)cb(a,h[d]);};
	var ab=Object.freeze?Object.freeze([]):[];function bb(a){var b=a.G+a.D;a.u[b]||(a.i=a.u[b]={});}function db(a,b,c){for(var d=[],f=0;f<a.length;f++)d[f]=b.call(a[f],c,a[f]);return d}N.toObjectList=db;N.toObjectExtension=function(a,b,c,d,f){for(var h in c){var m=c[h],t=d.call(a,m);if(null!=t){for(var B in m.Ba)if(m.Ba.hasOwnProperty(B))break;b[B]=m.Na?m.na?db(t,m.Na,f):m.Na(f,t):t;}}};
	N.serializeBinaryExtensions=function(a,b,c,d){for(var f in c){var h=c[f],m=h.Za;if(!h.Aa)throw Error("Message extension present that was generated without binary serialization support");var t=d.call(a,m);if(null!=t)if(m.F())if(h.Wa)h.Aa.call(b,m.ma,t,h.Wa);else throw Error("Message extension present holding submessage without binary support enabled, and message is being serialized to binary format");else h.Aa.call(b,m.ma,t);}};
	N.readBinaryExtension=function(a,b,c,d,f){var h=c[b.c];if(h){c=h.Za;if(!h.za)throw Error("Deserializing extension whose generated code does not support binary format");if(c.F()){var m=new c.la;h.za.call(b,m,h.Ab);}else m=h.za.call(b);c.na&&!h.Nb?(b=d.call(a,c))?b.push(m):f.call(a,c,[m]):f.call(a,c,m);}else b.C();};function O(a,b){if(b<a.G){b+=a.D;var c=a.u[b];return c===ab?a.u[b]=[]:c}if(a.i)return c=a.i[b],c===ab?a.i[b]=[]:c}N.getField=O;N.getRepeatedField=function(a,b){return O(a,b)};
	function eb(a,b){a=O(a,b);return null==a?a:+a}N.getOptionalFloatingPointField=eb;function fb(a,b){a=O(a,b);return null==a?a:!!a}N.getBooleanField=fb;N.getRepeatedFloatingPointField=function(a,b){var c=O(a,b);a.a||(a.a={});if(!a.a[b]){for(var d=0;d<c.length;d++)c[d]=+c[d];a.a[b]=true;}return c};N.getRepeatedBooleanField=function(a,b){var c=O(a,b);a.a||(a.a={});if(!a.a[b]){for(var d=0;d<c.length;d++)c[d]=!!c[d];a.a[b]=true;}return c};
	function gb(a){if(null==a||"string"===typeof a)return a;if($a&&a instanceof Uint8Array)return Ba(a);p("Cannot coerce to b64 string: "+k(a));return null}N.bytesAsB64=gb;function hb(a){if(null==a||a instanceof Uint8Array)return a;if("string"===typeof a)return Da(a);p("Cannot coerce to Uint8Array: "+k(a));return null}N.bytesAsU8=hb;N.bytesListAsB64=function(a){ib(a);return a.length&&"string"!==typeof a[0]?l(a,gb):a};N.bytesListAsU8=function(a){ib(a);return !a.length||a[0]instanceof Uint8Array?a:l(a,hb)};
	function ib(a){if(a&&1<a.length){var b=k(a[0]);qa(a,function(c){k(c)!=b&&p("Inconsistent type in JSPB repeated field array. Got "+k(c)+" expected "+b);});}}function jb(a,b,c){a=O(a,b);return null==a?c:a}N.getFieldWithDefault=jb;N.getBooleanFieldWithDefault=function(a,b,c){a=fb(a,b);return null==a?c:a};N.getFloatingPointFieldWithDefault=function(a,b,c){a=eb(a,b);return null==a?c:a};N.getFieldProto3=jb;
	N.getMapField=function(a,b,c,d){a.f||(a.f={});if(b in a.f)return a.f[b];var f=O(a,b);if(!f){if(c)return;f=[];P(a,b,f);}return a.f[b]=new r(f,d)};function P(a,b,c){q(a,N);b<a.G?a.u[b+a.D]=c:(bb(a),a.i[b]=c);return a}N.setField=P;N.setProto3IntField=function(a,b,c){return Q(a,b,c,0)};N.setProto3FloatField=function(a,b,c){return Q(a,b,c,0)};N.setProto3BooleanField=function(a,b,c){return Q(a,b,c,false)};N.setProto3StringField=function(a,b,c){return Q(a,b,c,"")};
	N.setProto3BytesField=function(a,b,c){return Q(a,b,c,"")};N.setProto3EnumField=function(a,b,c){return Q(a,b,c,0)};N.setProto3StringIntField=function(a,b,c){return Q(a,b,c,"0")};function Q(a,b,c,d){q(a,N);c!==d?P(a,b,c):b<a.G?a.u[b+a.D]=null:(bb(a),delete a.i[b]);return a}N.addToRepeatedField=function(a,b,c,d){q(a,N);b=O(a,b);void 0!=d?b.splice(d,0,c):b.push(c);return a};function kb(a,b,c,d){q(a,N);(c=cb(a,c))&&c!==b&&void 0!==d&&(a.f&&c in a.f&&(a.f[c]=void 0),P(a,c,void 0));return P(a,b,d)}
	N.setOneofField=kb;function cb(a,b){for(var c,d,f=0;f<b.length;f++){var h=b[f],m=O(a,h);null!=m&&(c=h,d=m,P(a,h,void 0));}return c?(P(a,c,d),c):0}N.computeOneofCase=cb;N.getWrapperField=function(a,b,c,d){a.f||(a.f={});if(!a.f[c]){var f=O(a,c);if(d||f)a.f[c]=new b(f);}return a.f[c]};N.getRepeatedWrapperField=function(a,b,c){lb(a,b,c);b=a.f[c];b==ab&&(b=a.f[c]=[]);return b};function lb(a,b,c){a.f||(a.f={});if(!a.f[c]){for(var d=O(a,c),f=[],h=0;h<d.length;h++)f[h]=new b(d[h]);a.f[c]=f;}}
	N.setWrapperField=function(a,b,c){q(a,N);a.f||(a.f={});var d=c?c.g():c;a.f[b]=c;return P(a,b,d)};N.setOneofWrapperField=function(a,b,c,d){q(a,N);a.f||(a.f={});var f=d?d.g():d;a.f[b]=d;return kb(a,b,c,f)};N.setRepeatedWrapperField=function(a,b,c){q(a,N);a.f||(a.f={});c=c||[];for(var d=[],f=0;f<c.length;f++)d[f]=c[f].g();a.f[b]=c;return P(a,b,d)};
	N.addToRepeatedWrapperField=function(a,b,c,d,f){lb(a,d,b);var h=a.f[b];h||(h=a.f[b]=[]);c=c?c:new d;a=O(a,b);void 0!=f?(h.splice(f,0,c),a.splice(f,0,c.g())):(h.push(c),a.push(c.g()));return c};N.toMap=function(a,b,c,d){for(var f={},h=0;h<a.length;h++)f[b.call(a[h])]=c?c.call(a[h],d,a[h]):a[h];return f};function mb(a){if(a.f)for(var b in a.f){var c=a.f[b];if(Array.isArray(c))for(var d=0;d<c.length;d++)c[d]&&c[d].g();else c&&c.g();}}N.prototype.g=function(){mb(this);return this.u};
	N.prototype.toArray=N.prototype.g;N.prototype.toString=function(){mb(this);return this.u.toString()};N.prototype.getExtension=function(a){if(this.i){this.f||(this.f={});var b=a.ma;if(a.na){if(a.F())return this.f[b]||(this.f[b]=l(this.i[b]||[],function(c){return new a.la(c)})),this.f[b]}else if(a.F())return !this.f[b]&&this.i[b]&&(this.f[b]=new a.la(this.i[b])),this.f[b];return this.i[b]}};N.prototype.getExtension=N.prototype.getExtension;
	N.prototype.Kc=function(a,b){this.f||(this.f={});bb(this);var c=a.ma;a.na?(b=b||[],a.F()?(this.f[c]=b,this.i[c]=l(b,function(d){return d.g()})):this.i[c]=b):a.F()?(this.f[c]=b,this.i[c]=b?b.g():b):this.i[c]=b;return this};N.prototype.setExtension=N.prototype.Kc;N.difference=function(a,b){if(!(a instanceof b.constructor))throw Error("Messages have different types.");var c=a.g();b=b.g();var d=[],f=0,h=c.length>b.length?c.length:b.length;a.b&&(d[0]=a.b,f=1);for(;f<h;f++)nb(c[f],b[f])||(d[f]=b[f]);return new a.constructor(d)};
	N.equals=function(a,b){return a==b||!(!a||!b)&&a instanceof b.constructor&&nb(a.g(),b.g())};function ob(a,b){a=a||{};b=b||{};var c={},d;for(d in a)c[d]=0;for(d in b)c[d]=0;for(d in c)if(!nb(a[d],b[d]))return  false;return  true}N.compareExtensions=ob;
	function nb(a,b){if(a==b)return  true;if(!la(a)||!la(b))return "number"===typeof a&&isNaN(a)||"number"===typeof b&&isNaN(b)?String(a)==String(b):false;if(a.constructor!=b.constructor)return  false;if($a&&a.constructor===Uint8Array){if(a.length!=b.length)return  false;for(var c=0;c<a.length;c++)if(a[c]!=b[c])return  false;return  true}if(a.constructor===Array){var d=void 0,f=void 0,h=Math.max(a.length,b.length);for(c=0;c<h;c++){var m=a[c],t=b[c];m&&m.constructor==Object&&(n(void 0===d),n(c===a.length-1),d=m,m=void 0);t&&t.constructor==
	Object&&(n(void 0===f),n(c===b.length-1),f=t,t=void 0);if(!nb(m,t))return  false}return d||f?(d=d||{},f=f||{},ob(d,f)):true}if(a.constructor===Object)return ob(a,b);throw Error("Invalid type in JSPB array");}N.compareFields=nb;N.prototype.Bb=function(){return pb(this)};N.prototype.cloneMessage=N.prototype.Bb;N.prototype.clone=function(){return pb(this)};N.prototype.clone=N.prototype.clone;N.clone=function(a){return pb(a)};function pb(a){return new a.constructor(qb(a.g()))}
	N.copyInto=function(a,b){q(a,N);q(b,N);n(a.constructor==b.constructor,"Copy source and target message should have the same type.");a=pb(a);for(var c=b.g(),d=a.g(),f=c.length=0;f<d.length;f++)c[f]=d[f];b.f=a.f;b.i=a.i;};function qb(a){if(Array.isArray(a)){for(var b=Array(a.length),c=0;c<a.length;c++){var d=a[c];null!=d&&(b[c]="object"==typeof d?qb(n(d)):d);}return b}if($a&&a instanceof Uint8Array)return new Uint8Array(a);b={};for(c in a)d=a[c],null!=d&&(b[c]="object"==typeof d?qb(n(d)):d);return b}
	N.registerMessageType=function(a,b){b.we=a;};var R={dump:function(a){q(a,N,"jspb.Message instance expected");n(a.getExtension,"Only unobfuscated and unoptimized compilation modes supported.");return R.X(a)}};g("jspb.debug.dump",R.dump,void 0);
	R.X=function(a){var b=k(a);if("number"==b||"string"==b||"boolean"==b||"null"==b||"undefined"==b||"undefined"!==typeof Uint8Array&&a instanceof Uint8Array)return a;if("array"==b)return ua(a),l(a,R.X);if(a instanceof r){var c={};a=a.entries();for(var d=a.next();!d.done;d=a.next())c[d.value[0]]=R.X(d.value[1]);return c}q(a,N,"Only messages expected: "+a);b=a.constructor;var f={$name:b.name||b.displayName};for(t in b.prototype){var h=/^get([A-Z]\w*)/.exec(t);if(h&&"getExtension"!=t&&"getJsPbMessageId"!=
	t){var m="has"+h[1];if(!a[m]||a[m]())m=a[t](),f[R.$a(h[1])]=R.X(m);}}if(a.extensionObject_)return f.$extensions="Recursive dumping of extensions not supported in compiled code. Switch to uncompiled or dump extension object directly",f;for(d in b.extensions)if(/^\d+$/.test(d)){m=b.extensions[d];var t=a.getExtension(m);h=void 0;m=m.Ba;var B=[],M=0;for(h in m)B[M++]=h;h=B[0];null!=t&&(c||(c=f.$extensions={}),c[R.$a(h)]=R.X(t));}return f};R.$a=function(a){return a.replace(/^[A-Z]/,function(b){return b.toLowerCase()})};function S(){this.a=[];}g("jspb.BinaryEncoder",S,void 0);S.prototype.length=function(){return this.a.length};S.prototype.length=S.prototype.length;S.prototype.end=function(){var a=this.a;this.a=[];return a};S.prototype.end=S.prototype.end;S.prototype.l=function(a,b){n(a==Math.floor(a));n(b==Math.floor(b));n(0<=a&&4294967296>a);for(n(0<=b&&4294967296>b);0<b||127<a;)this.a.push(a&127|128),a=(a>>>7|b<<25)>>>0,b>>>=7;this.a.push(a);};S.prototype.writeSplitVarint64=S.prototype.l;
	S.prototype.A=function(a,b){n(a==Math.floor(a));n(b==Math.floor(b));n(0<=a&&4294967296>a);n(0<=b&&4294967296>b);this.s(a);this.s(b);};S.prototype.writeSplitFixed64=S.prototype.A;S.prototype.j=function(a){n(a==Math.floor(a));for(n(0<=a&&4294967296>a);127<a;)this.a.push(a&127|128),a>>>=7;this.a.push(a);};S.prototype.writeUnsignedVarint32=S.prototype.j;S.prototype.M=function(a){n(a==Math.floor(a));n(-2147483648<=a&&2147483648>a);if(0<=a)this.j(a);else {for(var b=0;9>b;b++)this.a.push(a&127|128),a>>=7;this.a.push(1);}};
	S.prototype.writeSignedVarint32=S.prototype.M;S.prototype.va=function(a){n(a==Math.floor(a));n(0<=a&&1.8446744073709552E19>a);A(a);this.l(y,z);};S.prototype.writeUnsignedVarint64=S.prototype.va;S.prototype.ua=function(a){n(a==Math.floor(a));n(-9223372036854776e3<=a&&0x7fffffffffffffff>a);A(a);this.l(y,z);};S.prototype.writeSignedVarint64=S.prototype.ua;S.prototype.wa=function(a){n(a==Math.floor(a));n(-2147483648<=a&&2147483648>a);this.j((a<<1^a>>31)>>>0);};S.prototype.writeZigzagVarint32=S.prototype.wa;
	S.prototype.xa=function(a){n(a==Math.floor(a));n(-9223372036854776e3<=a&&0x7fffffffffffffff>a);Ga(a);this.l(y,z);};S.prototype.writeZigzagVarint64=S.prototype.xa;S.prototype.Ta=function(a){this.W(H(a));};S.prototype.writeZigzagVarint64String=S.prototype.Ta;S.prototype.W=function(a){var b=this;C(a);Ja(y,z,function(c,d){b.l(c>>>0,d>>>0);});};S.prototype.writeZigzagVarintHash64=S.prototype.W;S.prototype.be=function(a){n(a==Math.floor(a));n(0<=a&&256>a);this.a.push(a>>>0&255);};S.prototype.writeUint8=S.prototype.be;
	S.prototype.ae=function(a){n(a==Math.floor(a));n(0<=a&&65536>a);this.a.push(a>>>0&255);this.a.push(a>>>8&255);};S.prototype.writeUint16=S.prototype.ae;S.prototype.s=function(a){n(a==Math.floor(a));n(0<=a&&4294967296>a);this.a.push(a>>>0&255);this.a.push(a>>>8&255);this.a.push(a>>>16&255);this.a.push(a>>>24&255);};S.prototype.writeUint32=S.prototype.s;S.prototype.V=function(a){n(a==Math.floor(a));n(0<=a&&1.8446744073709552E19>a);Fa(a);this.s(y);this.s(z);};S.prototype.writeUint64=S.prototype.V;
	S.prototype.Qc=function(a){n(a==Math.floor(a));n(-128<=a&&128>a);this.a.push(a>>>0&255);};S.prototype.writeInt8=S.prototype.Qc;S.prototype.Pc=function(a){n(a==Math.floor(a));n(-32768<=a&&32768>a);this.a.push(a>>>0&255);this.a.push(a>>>8&255);};S.prototype.writeInt16=S.prototype.Pc;S.prototype.S=function(a){n(a==Math.floor(a));n(-2147483648<=a&&2147483648>a);this.a.push(a>>>0&255);this.a.push(a>>>8&255);this.a.push(a>>>16&255);this.a.push(a>>>24&255);};S.prototype.writeInt32=S.prototype.S;
	S.prototype.T=function(a){n(a==Math.floor(a));n(-9223372036854776e3<=a&&0x7fffffffffffffff>a);A(a);this.A(y,z);};S.prototype.writeInt64=S.prototype.T;S.prototype.ka=function(a){n(a==Math.floor(a));n(-9223372036854776e3<=+a&&0x7fffffffffffffff>+a);C(H(a));this.A(y,z);};S.prototype.writeInt64String=S.prototype.ka;S.prototype.L=function(a){n(Infinity===a||-Infinity===a||isNaN(a)||-34028234663852886e22<=a&&3.4028234663852886E38>=a);Ha(a);this.s(y);};S.prototype.writeFloat=S.prototype.L;
	S.prototype.J=function(a){n(Infinity===a||-Infinity===a||isNaN(a)||-17976931348623157e292<=a&&1.7976931348623157E308>=a);Ia(a);this.s(y);this.s(z);};S.prototype.writeDouble=S.prototype.J;S.prototype.I=function(a){n("boolean"===typeof a||"number"===typeof a);this.a.push(a?1:0);};S.prototype.writeBool=S.prototype.I;S.prototype.R=function(a){n(a==Math.floor(a));n(-2147483648<=a&&2147483648>a);this.M(a);};S.prototype.writeEnum=S.prototype.R;S.prototype.ja=function(a){this.a.push.apply(this.a,a);};
	S.prototype.writeBytes=S.prototype.ja;S.prototype.N=function(a){C(a);this.l(y,z);};S.prototype.writeVarintHash64=S.prototype.N;S.prototype.K=function(a){C(a);this.s(y);this.s(z);};S.prototype.writeFixedHash64=S.prototype.K;
	S.prototype.U=function(a){var b=this.a.length;ta(a);for(var c=0;c<a.length;c++){var d=a.charCodeAt(c);if(128>d)this.a.push(d);else if(2048>d)this.a.push(d>>6|192),this.a.push(d&63|128);else if(65536>d)if(55296<=d&&56319>=d&&c+1<a.length){var f=a.charCodeAt(c+1);56320<=f&&57343>=f&&(d=1024*(d-55296)+f-56320+65536,this.a.push(d>>18|240),this.a.push(d>>12&63|128),this.a.push(d>>6&63|128),this.a.push(d&63|128),c++);}else this.a.push(d>>12|224),this.a.push(d>>6&63|128),this.a.push(d&63|128);}return this.a.length-
	b};S.prototype.writeString=S.prototype.U;function T(a,b){this.lo=a;this.hi=b;}g("jspb.arith.UInt64",T,void 0);T.prototype.cmp=function(a){return this.hi<a.hi||this.hi==a.hi&&this.lo<a.lo?-1:this.hi==a.hi&&this.lo==a.lo?0:1};T.prototype.cmp=T.prototype.cmp;T.prototype.La=function(){return new T((this.lo>>>1|(this.hi&1)<<31)>>>0,this.hi>>>1>>>0)};T.prototype.rightShift=T.prototype.La;T.prototype.Da=function(){return new T(this.lo<<1>>>0,(this.hi<<1|this.lo>>>31)>>>0)};T.prototype.leftShift=T.prototype.Da;
	T.prototype.cb=function(){return !!(this.hi&2147483648)};T.prototype.msb=T.prototype.cb;T.prototype.Ob=function(){return !!(this.lo&1)};T.prototype.lsb=T.prototype.Ob;T.prototype.Ua=function(){return 0==this.lo&&0==this.hi};T.prototype.zero=T.prototype.Ua;T.prototype.add=function(a){return new T((this.lo+a.lo&4294967295)>>>0>>>0,((this.hi+a.hi&4294967295)>>>0)+(4294967296<=this.lo+a.lo?1:0)>>>0)};T.prototype.add=T.prototype.add;
	T.prototype.sub=function(a){return new T((this.lo-a.lo&4294967295)>>>0>>>0,((this.hi-a.hi&4294967295)>>>0)-(0>this.lo-a.lo?1:0)>>>0)};T.prototype.sub=T.prototype.sub;function rb(a,b){var c=a&65535;a>>>=16;var d=b&65535,f=b>>>16;b=c*d+65536*(c*f&65535)+65536*(a*d&65535);for(c=a*f+(c*f>>>16)+(a*d>>>16);4294967296<=b;)b-=4294967296,c+=1;return new T(b>>>0,c>>>0)}T.mul32x32=rb;T.prototype.eb=function(a){var b=rb(this.lo,a);a=rb(this.hi,a);a.hi=a.lo;a.lo=0;return b.add(a)};T.prototype.mul=T.prototype.eb;
	T.prototype.Xa=function(a){if(0==a)return [];var b=new T(0,0),c=new T(this.lo,this.hi);a=new T(a,0);for(var d=new T(1,0);!a.cb();)a=a.Da(),d=d.Da();for(;!d.Ua();)0>=a.cmp(c)&&(b=b.add(d),c=c.sub(a)),a=a.La(),d=d.La();return [b,c]};T.prototype.div=T.prototype.Xa;T.prototype.toString=function(){for(var a="",b=this;!b.Ua();){b=b.Xa(10);var c=b[0];a=b[1].lo+a;b=c;}""==a&&(a="0");return a};T.prototype.toString=T.prototype.toString;
	function U(a){for(var b=new T(0,0),c=new T(0,0),d=0;d<a.length;d++){if("0">a[d]||"9"<a[d])return null;c.lo=parseInt(a[d],10);b=b.eb(10).add(c);}return b}T.fromString=U;T.prototype.clone=function(){return new T(this.lo,this.hi)};T.prototype.clone=T.prototype.clone;function V(a,b){this.lo=a;this.hi=b;}g("jspb.arith.Int64",V,void 0);V.prototype.add=function(a){return new V((this.lo+a.lo&4294967295)>>>0>>>0,((this.hi+a.hi&4294967295)>>>0)+(4294967296<=this.lo+a.lo?1:0)>>>0)};V.prototype.add=V.prototype.add;
	V.prototype.sub=function(a){return new V((this.lo-a.lo&4294967295)>>>0>>>0,((this.hi-a.hi&4294967295)>>>0)-(0>this.lo-a.lo?1:0)>>>0)};V.prototype.sub=V.prototype.sub;V.prototype.clone=function(){return new V(this.lo,this.hi)};V.prototype.clone=V.prototype.clone;V.prototype.toString=function(){var a=0!=(this.hi&2147483648),b=new T(this.lo,this.hi);a&&(b=(new T(0,0)).sub(b));return (a?"-":"")+b.toString()};V.prototype.toString=V.prototype.toString;
	function sb(a){var b=0<a.length&&"-"==a[0];b&&(a=a.substring(1));a=U(a);if(null===a)return null;b&&(a=(new T(0,0)).sub(a));return new V(a.lo,a.hi)}V.fromString=sb;function W(){this.c=[];this.b=0;this.a=new S;this.h=[];}g("jspb.BinaryWriter",W,void 0);function tb(a,b){var c=a.a.end();a.c.push(c);a.c.push(b);a.b+=c.length+b.length;}function X(a,b){Y(a,b,2);b=a.a.end();a.c.push(b);a.b+=b.length;b.push(a.b);return b}function Z(a,b){var c=b.pop();c=a.b+a.a.length()-c;for(n(0<=c);127<c;)b.push(c&127|128),c>>>=7,a.b++;b.push(c);a.b++;}W.prototype.pb=function(a,b,c){tb(this,a.subarray(b,c));};W.prototype.writeSerializedMessage=W.prototype.pb;
	W.prototype.Pb=function(a,b,c){null!=a&&null!=b&&null!=c&&this.pb(a,b,c);};W.prototype.maybeWriteSerializedMessage=W.prototype.Pb;W.prototype.reset=function(){this.c=[];this.a.end();this.b=0;this.h=[];};W.prototype.reset=W.prototype.reset;W.prototype.ab=function(){n(0==this.h.length);for(var a=new Uint8Array(this.b+this.a.length()),b=this.c,c=b.length,d=0,f=0;f<c;f++){var h=b[f];a.set(h,d);d+=h.length;}b=this.a.end();a.set(b,d);d+=b.length;n(d==a.length);this.c=[a];return a};
	W.prototype.getResultBuffer=W.prototype.ab;W.prototype.Kb=function(a){return Ba(this.ab(),a)};W.prototype.getResultBase64String=W.prototype.Kb;W.prototype.Va=function(a){this.h.push(X(this,a));};W.prototype.beginSubMessage=W.prototype.Va;W.prototype.Ya=function(){n(0<=this.h.length);Z(this,this.h.pop());};W.prototype.endSubMessage=W.prototype.Ya;function Y(a,b,c){n(1<=b&&b==Math.floor(b));a.a.j(8*b+c);}
	W.prototype.Nc=function(a,b,c){switch(a){case 1:this.J(b,c);break;case 2:this.L(b,c);break;case 3:this.T(b,c);break;case 4:this.V(b,c);break;case 5:this.S(b,c);break;case 6:this.Qa(b,c);break;case 7:this.Pa(b,c);break;case 8:this.I(b,c);break;case 9:this.U(b,c);break;case 10:p("Group field type not supported in writeAny()");break;case 11:p("Message field type not supported in writeAny()");break;case 12:this.ja(b,c);break;case 13:this.s(b,c);break;case 14:this.R(b,c);break;case 15:this.Ra(b,c);break;
	case 16:this.Sa(b,c);break;case 17:this.rb(b,c);break;case 18:this.sb(b,c);break;case 30:this.K(b,c);break;case 31:this.N(b,c);break;default:p("Invalid field type in writeAny()");}};W.prototype.writeAny=W.prototype.Nc;function ub(a,b,c){null!=c&&(Y(a,b,0),a.a.j(c));}function vb(a,b,c){null!=c&&(Y(a,b,0),a.a.M(c));}W.prototype.S=function(a,b){null!=b&&(n(-2147483648<=b&&2147483648>b),vb(this,a,b));};W.prototype.writeInt32=W.prototype.S;
	W.prototype.ob=function(a,b){null!=b&&(b=parseInt(b,10),n(-2147483648<=b&&2147483648>b),vb(this,a,b));};W.prototype.writeInt32String=W.prototype.ob;W.prototype.T=function(a,b){null!=b&&(n(-9223372036854776e3<=b&&0x7fffffffffffffff>b),null!=b&&(Y(this,a,0),this.a.ua(b)));};W.prototype.writeInt64=W.prototype.T;W.prototype.ka=function(a,b){null!=b&&(b=sb(b),Y(this,a,0),this.a.l(b.lo,b.hi));};W.prototype.writeInt64String=W.prototype.ka;
	W.prototype.s=function(a,b){null!=b&&(n(0<=b&&4294967296>b),ub(this,a,b));};W.prototype.writeUint32=W.prototype.s;W.prototype.ub=function(a,b){null!=b&&(b=parseInt(b,10),n(0<=b&&4294967296>b),ub(this,a,b));};W.prototype.writeUint32String=W.prototype.ub;W.prototype.V=function(a,b){null!=b&&(n(0<=b&&1.8446744073709552E19>b),null!=b&&(Y(this,a,0),this.a.va(b)));};W.prototype.writeUint64=W.prototype.V;W.prototype.vb=function(a,b){null!=b&&(b=U(b),Y(this,a,0),this.a.l(b.lo,b.hi));};
	W.prototype.writeUint64String=W.prototype.vb;W.prototype.rb=function(a,b){null!=b&&(n(-2147483648<=b&&2147483648>b),null!=b&&(Y(this,a,0),this.a.wa(b)));};W.prototype.writeSint32=W.prototype.rb;W.prototype.sb=function(a,b){null!=b&&(n(-9223372036854776e3<=b&&0x7fffffffffffffff>b),null!=b&&(Y(this,a,0),this.a.xa(b)));};W.prototype.writeSint64=W.prototype.sb;W.prototype.$d=function(a,b){null!=b&&null!=b&&(Y(this,a,0),this.a.W(b));};W.prototype.writeSintHash64=W.prototype.$d;
	W.prototype.Zd=function(a,b){null!=b&&null!=b&&(Y(this,a,0),this.a.Ta(b));};W.prototype.writeSint64String=W.prototype.Zd;W.prototype.Pa=function(a,b){null!=b&&(n(0<=b&&4294967296>b),Y(this,a,5),this.a.s(b));};W.prototype.writeFixed32=W.prototype.Pa;W.prototype.Qa=function(a,b){null!=b&&(n(0<=b&&1.8446744073709552E19>b),Y(this,a,1),this.a.V(b));};W.prototype.writeFixed64=W.prototype.Qa;W.prototype.nb=function(a,b){null!=b&&(b=U(b),Y(this,a,1),this.a.A(b.lo,b.hi));};W.prototype.writeFixed64String=W.prototype.nb;
	W.prototype.Ra=function(a,b){null!=b&&(n(-2147483648<=b&&2147483648>b),Y(this,a,5),this.a.S(b));};W.prototype.writeSfixed32=W.prototype.Ra;W.prototype.Sa=function(a,b){null!=b&&(n(-9223372036854776e3<=b&&0x7fffffffffffffff>b),Y(this,a,1),this.a.T(b));};W.prototype.writeSfixed64=W.prototype.Sa;W.prototype.qb=function(a,b){null!=b&&(b=sb(b),Y(this,a,1),this.a.A(b.lo,b.hi));};W.prototype.writeSfixed64String=W.prototype.qb;W.prototype.L=function(a,b){null!=b&&(Y(this,a,5),this.a.L(b));};
	W.prototype.writeFloat=W.prototype.L;W.prototype.J=function(a,b){null!=b&&(Y(this,a,1),this.a.J(b));};W.prototype.writeDouble=W.prototype.J;W.prototype.I=function(a,b){null!=b&&(n("boolean"===typeof b||"number"===typeof b),Y(this,a,0),this.a.I(b));};W.prototype.writeBool=W.prototype.I;W.prototype.R=function(a,b){null!=b&&(n(-2147483648<=b&&2147483648>b),Y(this,a,0),this.a.M(b));};W.prototype.writeEnum=W.prototype.R;W.prototype.U=function(a,b){null!=b&&(a=X(this,a),this.a.U(b),Z(this,a));};
	W.prototype.writeString=W.prototype.U;W.prototype.ja=function(a,b){null!=b&&(b=Ua(b),Y(this,a,2),this.a.j(b.length),tb(this,b));};W.prototype.writeBytes=W.prototype.ja;W.prototype.Rc=function(a,b,c){null!=b&&(a=X(this,a),c(b,this),Z(this,a));};W.prototype.writeMessage=W.prototype.Rc;W.prototype.Sc=function(a,b,c){null!=b&&(Y(this,1,3),Y(this,2,0),this.a.M(a),a=X(this,3),c(b,this),Z(this,a),Y(this,1,4));};W.prototype.writeMessageSet=W.prototype.Sc;
	W.prototype.Oc=function(a,b,c){null!=b&&(Y(this,a,3),c(b,this),Y(this,a,4));};W.prototype.writeGroup=W.prototype.Oc;W.prototype.K=function(a,b){null!=b&&(n(8==b.length),Y(this,a,1),this.a.K(b));};W.prototype.writeFixedHash64=W.prototype.K;W.prototype.N=function(a,b){null!=b&&(n(8==b.length),Y(this,a,0),this.a.N(b));};W.prototype.writeVarintHash64=W.prototype.N;W.prototype.A=function(a,b,c){Y(this,a,1);this.a.A(b,c);};W.prototype.writeSplitFixed64=W.prototype.A;
	W.prototype.l=function(a,b,c){Y(this,a,0);this.a.l(b,c);};W.prototype.writeSplitVarint64=W.prototype.l;W.prototype.tb=function(a,b,c){Y(this,a,0);var d=this.a;Ja(b,c,function(f,h){d.l(f>>>0,h>>>0);});};W.prototype.writeSplitZigzagVarint64=W.prototype.tb;W.prototype.Ed=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)vb(this,a,b[c]);};W.prototype.writeRepeatedInt32=W.prototype.Ed;W.prototype.Fd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.ob(a,b[c]);};
	W.prototype.writeRepeatedInt32String=W.prototype.Fd;W.prototype.Gd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++){var d=b[c];null!=d&&(Y(this,a,0),this.a.ua(d));}};W.prototype.writeRepeatedInt64=W.prototype.Gd;W.prototype.Qd=function(a,b,c,d){if(null!=b)for(var f=0;f<b.length;f++)this.A(a,c(b[f]),d(b[f]));};W.prototype.writeRepeatedSplitFixed64=W.prototype.Qd;W.prototype.Rd=function(a,b,c,d){if(null!=b)for(var f=0;f<b.length;f++)this.l(a,c(b[f]),d(b[f]));};
	W.prototype.writeRepeatedSplitVarint64=W.prototype.Rd;W.prototype.Sd=function(a,b,c,d){if(null!=b)for(var f=0;f<b.length;f++)this.tb(a,c(b[f]),d(b[f]));};W.prototype.writeRepeatedSplitZigzagVarint64=W.prototype.Sd;W.prototype.Hd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.ka(a,b[c]);};W.prototype.writeRepeatedInt64String=W.prototype.Hd;W.prototype.Ud=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)ub(this,a,b[c]);};W.prototype.writeRepeatedUint32=W.prototype.Ud;
	W.prototype.Vd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.ub(a,b[c]);};W.prototype.writeRepeatedUint32String=W.prototype.Vd;W.prototype.Wd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++){var d=b[c];null!=d&&(Y(this,a,0),this.a.va(d));}};W.prototype.writeRepeatedUint64=W.prototype.Wd;W.prototype.Xd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.vb(a,b[c]);};W.prototype.writeRepeatedUint64String=W.prototype.Xd;
	W.prototype.Md=function(a,b){if(null!=b)for(var c=0;c<b.length;c++){var d=b[c];null!=d&&(Y(this,a,0),this.a.wa(d));}};W.prototype.writeRepeatedSint32=W.prototype.Md;W.prototype.Nd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++){var d=b[c];null!=d&&(Y(this,a,0),this.a.xa(d));}};W.prototype.writeRepeatedSint64=W.prototype.Nd;W.prototype.Od=function(a,b){if(null!=b)for(var c=0;c<b.length;c++){var d=b[c];null!=d&&(Y(this,a,0),this.a.Ta(d));}};W.prototype.writeRepeatedSint64String=W.prototype.Od;
	W.prototype.Pd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++){var d=b[c];null!=d&&(Y(this,a,0),this.a.W(d));}};W.prototype.writeRepeatedSintHash64=W.prototype.Pd;W.prototype.yd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.Pa(a,b[c]);};W.prototype.writeRepeatedFixed32=W.prototype.yd;W.prototype.zd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.Qa(a,b[c]);};W.prototype.writeRepeatedFixed64=W.prototype.zd;
	W.prototype.Ad=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.nb(a,b[c]);};W.prototype.writeRepeatedFixed64String=W.prototype.Ad;W.prototype.Jd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.Ra(a,b[c]);};W.prototype.writeRepeatedSfixed32=W.prototype.Jd;W.prototype.Kd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.Sa(a,b[c]);};W.prototype.writeRepeatedSfixed64=W.prototype.Kd;W.prototype.Ld=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.qb(a,b[c]);};
	W.prototype.writeRepeatedSfixed64String=W.prototype.Ld;W.prototype.Cd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.L(a,b[c]);};W.prototype.writeRepeatedFloat=W.prototype.Cd;W.prototype.wd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.J(a,b[c]);};W.prototype.writeRepeatedDouble=W.prototype.wd;W.prototype.ud=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.I(a,b[c]);};W.prototype.writeRepeatedBool=W.prototype.ud;
	W.prototype.xd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.R(a,b[c]);};W.prototype.writeRepeatedEnum=W.prototype.xd;W.prototype.Td=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.U(a,b[c]);};W.prototype.writeRepeatedString=W.prototype.Td;W.prototype.vd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.ja(a,b[c]);};W.prototype.writeRepeatedBytes=W.prototype.vd;W.prototype.Id=function(a,b,c){if(null!=b)for(var d=0;d<b.length;d++){var f=X(this,a);c(b[d],this);Z(this,f);}};
	W.prototype.writeRepeatedMessage=W.prototype.Id;W.prototype.Dd=function(a,b,c){if(null!=b)for(var d=0;d<b.length;d++)Y(this,a,3),c(b[d],this),Y(this,a,4);};W.prototype.writeRepeatedGroup=W.prototype.Dd;W.prototype.Bd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.K(a,b[c]);};W.prototype.writeRepeatedFixedHash64=W.prototype.Bd;W.prototype.Yd=function(a,b){if(null!=b)for(var c=0;c<b.length;c++)this.N(a,b[c]);};W.prototype.writeRepeatedVarintHash64=W.prototype.Yd;
	W.prototype.ad=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.M(b[c]);Z(this,a);}};W.prototype.writePackedInt32=W.prototype.ad;W.prototype.bd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.M(parseInt(b[c],10));Z(this,a);}};W.prototype.writePackedInt32String=W.prototype.bd;W.prototype.cd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.ua(b[c]);Z(this,a);}};W.prototype.writePackedInt64=W.prototype.cd;
	W.prototype.md=function(a,b,c,d){if(null!=b){a=X(this,a);for(var f=0;f<b.length;f++)this.a.A(c(b[f]),d(b[f]));Z(this,a);}};W.prototype.writePackedSplitFixed64=W.prototype.md;W.prototype.nd=function(a,b,c,d){if(null!=b){a=X(this,a);for(var f=0;f<b.length;f++)this.a.l(c(b[f]),d(b[f]));Z(this,a);}};W.prototype.writePackedSplitVarint64=W.prototype.nd;W.prototype.od=function(a,b,c,d){if(null!=b){a=X(this,a);for(var f=this.a,h=0;h<b.length;h++)Ja(c(b[h]),d(b[h]),function(m,t){f.l(m>>>0,t>>>0);});Z(this,a);}};
	W.prototype.writePackedSplitZigzagVarint64=W.prototype.od;W.prototype.dd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++){var d=sb(b[c]);this.a.l(d.lo,d.hi);}Z(this,a);}};W.prototype.writePackedInt64String=W.prototype.dd;W.prototype.pd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.j(b[c]);Z(this,a);}};W.prototype.writePackedUint32=W.prototype.pd;
	W.prototype.qd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.j(parseInt(b[c],10));Z(this,a);}};W.prototype.writePackedUint32String=W.prototype.qd;W.prototype.rd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.va(b[c]);Z(this,a);}};W.prototype.writePackedUint64=W.prototype.rd;W.prototype.sd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++){var d=U(b[c]);this.a.l(d.lo,d.hi);}Z(this,a);}};
	W.prototype.writePackedUint64String=W.prototype.sd;W.prototype.hd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.wa(b[c]);Z(this,a);}};W.prototype.writePackedSint32=W.prototype.hd;W.prototype.jd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.xa(b[c]);Z(this,a);}};W.prototype.writePackedSint64=W.prototype.jd;W.prototype.kd=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.W(H(b[c]));Z(this,a);}};
	W.prototype.writePackedSint64String=W.prototype.kd;W.prototype.ld=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.W(b[c]);Z(this,a);}};W.prototype.writePackedSintHash64=W.prototype.ld;W.prototype.Wc=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(4*b.length),a=0;a<b.length;a++)this.a.s(b[a]);};W.prototype.writePackedFixed32=W.prototype.Wc;W.prototype.Xc=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(8*b.length),a=0;a<b.length;a++)this.a.V(b[a]);};
	W.prototype.writePackedFixed64=W.prototype.Xc;W.prototype.Yc=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(8*b.length),a=0;a<b.length;a++){var c=U(b[a]);this.a.A(c.lo,c.hi);}};W.prototype.writePackedFixed64String=W.prototype.Yc;W.prototype.ed=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(4*b.length),a=0;a<b.length;a++)this.a.S(b[a]);};W.prototype.writePackedSfixed32=W.prototype.ed;
	W.prototype.fd=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(8*b.length),a=0;a<b.length;a++)this.a.T(b[a]);};W.prototype.writePackedSfixed64=W.prototype.fd;W.prototype.gd=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(8*b.length),a=0;a<b.length;a++)this.a.ka(b[a]);};W.prototype.writePackedSfixed64String=W.prototype.gd;W.prototype.$c=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(4*b.length),a=0;a<b.length;a++)this.a.L(b[a]);};W.prototype.writePackedFloat=W.prototype.$c;
	W.prototype.Uc=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(8*b.length),a=0;a<b.length;a++)this.a.J(b[a]);};W.prototype.writePackedDouble=W.prototype.Uc;W.prototype.Tc=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(b.length),a=0;a<b.length;a++)this.a.I(b[a]);};W.prototype.writePackedBool=W.prototype.Tc;W.prototype.Vc=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.R(b[c]);Z(this,a);}};W.prototype.writePackedEnum=W.prototype.Vc;
	W.prototype.Zc=function(a,b){if(null!=b&&b.length)for(Y(this,a,2),this.a.j(8*b.length),a=0;a<b.length;a++)this.a.K(b[a]);};W.prototype.writePackedFixedHash64=W.prototype.Zc;W.prototype.td=function(a,b){if(null!=b&&b.length){a=X(this,a);for(var c=0;c<b.length;c++)this.a.N(b[c]);Z(this,a);}};W.prototype.writePackedVarintHash64=W.prototype.td;(exports.debug=R,exports.Map=r,exports.Message=N,exports.BinaryReader=J,exports.BinaryWriter=W,exports.ExtensionFieldInfo=Ya,exports.ExtensionFieldBinaryInfo=Za,exports.exportSymbol=ma,exports.inherits=na,exports.object={extend:pa},exports.typeOf=k); 
} (googleProtobuf));

(function (exports) {
	// source: onnx.proto
	/**
	 * @fileoverview
	 * @enhanceable
	 * @suppress {missingRequire} reports error on implicit type usages.
	 * @suppress {messageConventions} JS Compiler reports an error if a variable or
	 *     field starts with 'MSG_' and isn't a translatable message.
	 * @public
	 */
	// GENERATED CODE -- DO NOT EDIT!
	/* eslint-disable */
	// @ts-nocheck

	var jspb = googleProtobuf;
	var goog = jspb;
	var global = (function() { return this || window || global || self || Function('return this')(); }).call(null);

	goog.exportSymbol('proto.onnx.AttributeProto', null, global);
	goog.exportSymbol('proto.onnx.AttributeProto.AttributeType', null, global);
	goog.exportSymbol('proto.onnx.FunctionProto', null, global);
	goog.exportSymbol('proto.onnx.GraphProto', null, global);
	goog.exportSymbol('proto.onnx.ModelProto', null, global);
	goog.exportSymbol('proto.onnx.NodeProto', null, global);
	goog.exportSymbol('proto.onnx.OperatorSetIdProto', null, global);
	goog.exportSymbol('proto.onnx.OperatorStatus', null, global);
	goog.exportSymbol('proto.onnx.SparseTensorProto', null, global);
	goog.exportSymbol('proto.onnx.StringStringEntryProto', null, global);
	goog.exportSymbol('proto.onnx.TensorAnnotation', null, global);
	goog.exportSymbol('proto.onnx.TensorProto', null, global);
	goog.exportSymbol('proto.onnx.TensorProto.DataLocation', null, global);
	goog.exportSymbol('proto.onnx.TensorProto.DataType', null, global);
	goog.exportSymbol('proto.onnx.TensorProto.Segment', null, global);
	goog.exportSymbol('proto.onnx.TensorShapeProto', null, global);
	goog.exportSymbol('proto.onnx.TensorShapeProto.Dimension', null, global);
	goog.exportSymbol('proto.onnx.TensorShapeProto.Dimension.ValueCase', null, global);
	goog.exportSymbol('proto.onnx.TrainingInfoProto', null, global);
	goog.exportSymbol('proto.onnx.TypeProto', null, global);
	goog.exportSymbol('proto.onnx.TypeProto.Map', null, global);
	goog.exportSymbol('proto.onnx.TypeProto.Optional', null, global);
	goog.exportSymbol('proto.onnx.TypeProto.Sequence', null, global);
	goog.exportSymbol('proto.onnx.TypeProto.SparseTensor', null, global);
	goog.exportSymbol('proto.onnx.TypeProto.Tensor', null, global);
	goog.exportSymbol('proto.onnx.TypeProto.ValueCase', null, global);
	goog.exportSymbol('proto.onnx.ValueInfoProto', null, global);
	goog.exportSymbol('proto.onnx.Version', null, global);
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.AttributeProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.AttributeProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.AttributeProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.AttributeProto.displayName = 'proto.onnx.AttributeProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.ValueInfoProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.ValueInfoProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.ValueInfoProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.ValueInfoProto.displayName = 'proto.onnx.ValueInfoProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.NodeProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.NodeProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.NodeProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.NodeProto.displayName = 'proto.onnx.NodeProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TrainingInfoProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.TrainingInfoProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.TrainingInfoProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TrainingInfoProto.displayName = 'proto.onnx.TrainingInfoProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.ModelProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.ModelProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.ModelProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.ModelProto.displayName = 'proto.onnx.ModelProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.StringStringEntryProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
	};
	goog.inherits(proto.onnx.StringStringEntryProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.StringStringEntryProto.displayName = 'proto.onnx.StringStringEntryProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TensorAnnotation = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.TensorAnnotation.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.TensorAnnotation, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TensorAnnotation.displayName = 'proto.onnx.TensorAnnotation';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.GraphProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.GraphProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.GraphProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.GraphProto.displayName = 'proto.onnx.GraphProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TensorProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.TensorProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.TensorProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TensorProto.displayName = 'proto.onnx.TensorProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TensorProto.Segment = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
	};
	goog.inherits(proto.onnx.TensorProto.Segment, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TensorProto.Segment.displayName = 'proto.onnx.TensorProto.Segment';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.SparseTensorProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.SparseTensorProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.SparseTensorProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.SparseTensorProto.displayName = 'proto.onnx.SparseTensorProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TensorShapeProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.TensorShapeProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.TensorShapeProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TensorShapeProto.displayName = 'proto.onnx.TensorShapeProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TensorShapeProto.Dimension = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.onnx.TensorShapeProto.Dimension.oneofGroups_);
	};
	goog.inherits(proto.onnx.TensorShapeProto.Dimension, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TensorShapeProto.Dimension.displayName = 'proto.onnx.TensorShapeProto.Dimension';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TypeProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, proto.onnx.TypeProto.oneofGroups_);
	};
	goog.inherits(proto.onnx.TypeProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TypeProto.displayName = 'proto.onnx.TypeProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TypeProto.Tensor = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
	};
	goog.inherits(proto.onnx.TypeProto.Tensor, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TypeProto.Tensor.displayName = 'proto.onnx.TypeProto.Tensor';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TypeProto.Sequence = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
	};
	goog.inherits(proto.onnx.TypeProto.Sequence, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TypeProto.Sequence.displayName = 'proto.onnx.TypeProto.Sequence';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TypeProto.Map = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
	};
	goog.inherits(proto.onnx.TypeProto.Map, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TypeProto.Map.displayName = 'proto.onnx.TypeProto.Map';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TypeProto.Optional = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
	};
	goog.inherits(proto.onnx.TypeProto.Optional, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TypeProto.Optional.displayName = 'proto.onnx.TypeProto.Optional';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.TypeProto.SparseTensor = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
	};
	goog.inherits(proto.onnx.TypeProto.SparseTensor, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.TypeProto.SparseTensor.displayName = 'proto.onnx.TypeProto.SparseTensor';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.OperatorSetIdProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
	};
	goog.inherits(proto.onnx.OperatorSetIdProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.OperatorSetIdProto.displayName = 'proto.onnx.OperatorSetIdProto';
	}
	/**
	 * Generated by JsPbCodeGenerator.
	 * @param {Array=} opt_data Optional initial data array, typically from a
	 * server response, or constructed directly in Javascript. The array is used
	 * in place and becomes part of the constructed object. It is not cloned.
	 * If no data is provided, the constructed object will be empty, but still
	 * valid.
	 * @extends {jspb.Message}
	 * @constructor
	 */
	proto.onnx.FunctionProto = function(opt_data) {
	  jspb.Message.initialize(this, opt_data, 0, -1, proto.onnx.FunctionProto.repeatedFields_, null);
	};
	goog.inherits(proto.onnx.FunctionProto, jspb.Message);
	if (goog.DEBUG && !COMPILED) {
	  /**
	   * @public
	   * @override
	   */
	  proto.onnx.FunctionProto.displayName = 'proto.onnx.FunctionProto';
	}

	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.AttributeProto.repeatedFields_ = [7,8,9,10,11,23,15];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.AttributeProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.AttributeProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.AttributeProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.AttributeProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    name: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    refAttrName: (f = jspb.Message.getField(msg, 21)) == null ? undefined : f,
	    docString: (f = jspb.Message.getField(msg, 13)) == null ? undefined : f,
	    type: (f = jspb.Message.getField(msg, 20)) == null ? undefined : f,
	    f: (f = jspb.Message.getOptionalFloatingPointField(msg, 2)) == null ? undefined : f,
	    i: (f = jspb.Message.getField(msg, 3)) == null ? undefined : f,
	    s: msg.getS_asB64(),
	    t: (f = msg.getT()) && proto.onnx.TensorProto.toObject(includeInstance, f),
	    g: (f = msg.getG()) && proto.onnx.GraphProto.toObject(includeInstance, f),
	    sparseTensor: (f = msg.getSparseTensor()) && proto.onnx.SparseTensorProto.toObject(includeInstance, f),
	    tp: (f = msg.getTp()) && proto.onnx.TypeProto.toObject(includeInstance, f),
	    floatsList: (f = jspb.Message.getRepeatedFloatingPointField(msg, 7)) == null ? undefined : f,
	    intsList: (f = jspb.Message.getRepeatedField(msg, 8)) == null ? undefined : f,
	    stringsList: msg.getStringsList_asB64(),
	    tensorsList: jspb.Message.toObjectList(msg.getTensorsList(),
	    proto.onnx.TensorProto.toObject, includeInstance),
	    graphsList: jspb.Message.toObjectList(msg.getGraphsList(),
	    proto.onnx.GraphProto.toObject, includeInstance),
	    sparseTensorsList: jspb.Message.toObjectList(msg.getSparseTensorsList(),
	    proto.onnx.SparseTensorProto.toObject, includeInstance),
	    typeProtosList: jspb.Message.toObjectList(msg.getTypeProtosList(),
	    proto.onnx.TypeProto.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.AttributeProto}
	 */
	proto.onnx.AttributeProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.AttributeProto;
	  return proto.onnx.AttributeProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.AttributeProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.AttributeProto}
	 */
	proto.onnx.AttributeProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setName(value);
	      break;
	    case 21:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setRefAttrName(value);
	      break;
	    case 13:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDocString(value);
	      break;
	    case 20:
	      var value = /** @type {!proto.onnx.AttributeProto.AttributeType} */ (reader.readEnum());
	      msg.setType(value);
	      break;
	    case 2:
	      var value = /** @type {number} */ (reader.readFloat());
	      msg.setF(value);
	      break;
	    case 3:
	      var value = /** @type {number} */ (reader.readInt64());
	      msg.setI(value);
	      break;
	    case 4:
	      var value = /** @type {!Uint8Array} */ (reader.readBytes());
	      msg.setS(value);
	      break;
	    case 5:
	      var value = new proto.onnx.TensorProto;
	      reader.readMessage(value,proto.onnx.TensorProto.deserializeBinaryFromReader);
	      msg.setT(value);
	      break;
	    case 6:
	      var value = new proto.onnx.GraphProto;
	      reader.readMessage(value,proto.onnx.GraphProto.deserializeBinaryFromReader);
	      msg.setG(value);
	      break;
	    case 22:
	      var value = new proto.onnx.SparseTensorProto;
	      reader.readMessage(value,proto.onnx.SparseTensorProto.deserializeBinaryFromReader);
	      msg.setSparseTensor(value);
	      break;
	    case 14:
	      var value = new proto.onnx.TypeProto;
	      reader.readMessage(value,proto.onnx.TypeProto.deserializeBinaryFromReader);
	      msg.setTp(value);
	      break;
	    case 7:
	      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedFloat() : [reader.readFloat()]);
	      for (var i = 0; i < values.length; i++) {
	        msg.addFloats(values[i]);
	      }
	      break;
	    case 8:
	      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedInt64() : [reader.readInt64()]);
	      for (var i = 0; i < values.length; i++) {
	        msg.addInts(values[i]);
	      }
	      break;
	    case 9:
	      var value = /** @type {!Uint8Array} */ (reader.readBytes());
	      msg.addStrings(value);
	      break;
	    case 10:
	      var value = new proto.onnx.TensorProto;
	      reader.readMessage(value,proto.onnx.TensorProto.deserializeBinaryFromReader);
	      msg.addTensors(value);
	      break;
	    case 11:
	      var value = new proto.onnx.GraphProto;
	      reader.readMessage(value,proto.onnx.GraphProto.deserializeBinaryFromReader);
	      msg.addGraphs(value);
	      break;
	    case 23:
	      var value = new proto.onnx.SparseTensorProto;
	      reader.readMessage(value,proto.onnx.SparseTensorProto.deserializeBinaryFromReader);
	      msg.addSparseTensors(value);
	      break;
	    case 15:
	      var value = new proto.onnx.TypeProto;
	      reader.readMessage(value,proto.onnx.TypeProto.deserializeBinaryFromReader);
	      msg.addTypeProtos(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.AttributeProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.AttributeProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.AttributeProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.AttributeProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {string} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeString(
	      1,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 21));
	  if (f != null) {
	    writer.writeString(
	      21,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 13));
	  if (f != null) {
	    writer.writeString(
	      13,
	      f
	    );
	  }
	  f = /** @type {!proto.onnx.AttributeProto.AttributeType} */ (jspb.Message.getField(message, 20));
	  if (f != null) {
	    writer.writeEnum(
	      20,
	      f
	    );
	  }
	  f = /** @type {number} */ (jspb.Message.getField(message, 2));
	  if (f != null) {
	    writer.writeFloat(
	      2,
	      f
	    );
	  }
	  f = /** @type {number} */ (jspb.Message.getField(message, 3));
	  if (f != null) {
	    writer.writeInt64(
	      3,
	      f
	    );
	  }
	  f = /** @type {!(string|Uint8Array)} */ (jspb.Message.getField(message, 4));
	  if (f != null) {
	    writer.writeBytes(
	      4,
	      f
	    );
	  }
	  f = message.getT();
	  if (f != null) {
	    writer.writeMessage(
	      5,
	      f,
	      proto.onnx.TensorProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getG();
	  if (f != null) {
	    writer.writeMessage(
	      6,
	      f,
	      proto.onnx.GraphProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getSparseTensor();
	  if (f != null) {
	    writer.writeMessage(
	      22,
	      f,
	      proto.onnx.SparseTensorProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getTp();
	  if (f != null) {
	    writer.writeMessage(
	      14,
	      f,
	      proto.onnx.TypeProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getFloatsList();
	  if (f.length > 0) {
	    writer.writeRepeatedFloat(
	      7,
	      f
	    );
	  }
	  f = message.getIntsList();
	  if (f.length > 0) {
	    writer.writeRepeatedInt64(
	      8,
	      f
	    );
	  }
	  f = message.getStringsList_asU8();
	  if (f.length > 0) {
	    writer.writeRepeatedBytes(
	      9,
	      f
	    );
	  }
	  f = message.getTensorsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      10,
	      f,
	      proto.onnx.TensorProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getGraphsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      11,
	      f,
	      proto.onnx.GraphProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getSparseTensorsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      23,
	      f,
	      proto.onnx.SparseTensorProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getTypeProtosList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      15,
	      f,
	      proto.onnx.TypeProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * @enum {number}
	 */
	proto.onnx.AttributeProto.AttributeType = {
	  UNDEFINED: 0,
	  FLOAT: 1,
	  INT: 2,
	  STRING: 3,
	  TENSOR: 4,
	  GRAPH: 5,
	  SPARSE_TENSOR: 11,
	  TYPE_PROTO: 13,
	  FLOATS: 6,
	  INTS: 7,
	  STRINGS: 8,
	  TENSORS: 9,
	  GRAPHS: 10,
	  SPARSE_TENSORS: 12,
	  TYPE_PROTOS: 14
	};

	/**
	 * optional string name = 1;
	 * @return {string}
	 */
	proto.onnx.AttributeProto.prototype.getName = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setName = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearName = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasName = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional string ref_attr_name = 21;
	 * @return {string}
	 */
	proto.onnx.AttributeProto.prototype.getRefAttrName = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 21, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setRefAttrName = function(value) {
	  return jspb.Message.setField(this, 21, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearRefAttrName = function() {
	  return jspb.Message.setField(this, 21, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasRefAttrName = function() {
	  return jspb.Message.getField(this, 21) != null;
	};


	/**
	 * optional string doc_string = 13;
	 * @return {string}
	 */
	proto.onnx.AttributeProto.prototype.getDocString = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setDocString = function(value) {
	  return jspb.Message.setField(this, 13, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearDocString = function() {
	  return jspb.Message.setField(this, 13, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasDocString = function() {
	  return jspb.Message.getField(this, 13) != null;
	};


	/**
	 * optional AttributeType type = 20;
	 * @return {!proto.onnx.AttributeProto.AttributeType}
	 */
	proto.onnx.AttributeProto.prototype.getType = function() {
	  return /** @type {!proto.onnx.AttributeProto.AttributeType} */ (jspb.Message.getFieldWithDefault(this, 20, 0));
	};


	/**
	 * @param {!proto.onnx.AttributeProto.AttributeType} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setType = function(value) {
	  return jspb.Message.setField(this, 20, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearType = function() {
	  return jspb.Message.setField(this, 20, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasType = function() {
	  return jspb.Message.getField(this, 20) != null;
	};


	/**
	 * optional float f = 2;
	 * @return {number}
	 */
	proto.onnx.AttributeProto.prototype.getF = function() {
	  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 2, 0.0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setF = function(value) {
	  return jspb.Message.setField(this, 2, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearF = function() {
	  return jspb.Message.setField(this, 2, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasF = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * optional int64 i = 3;
	 * @return {number}
	 */
	proto.onnx.AttributeProto.prototype.getI = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setI = function(value) {
	  return jspb.Message.setField(this, 3, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearI = function() {
	  return jspb.Message.setField(this, 3, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasI = function() {
	  return jspb.Message.getField(this, 3) != null;
	};


	/**
	 * optional bytes s = 4;
	 * @return {!(string|Uint8Array)}
	 */
	proto.onnx.AttributeProto.prototype.getS = function() {
	  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
	};


	/**
	 * optional bytes s = 4;
	 * This is a type-conversion wrapper around `getS()`
	 * @return {string}
	 */
	proto.onnx.AttributeProto.prototype.getS_asB64 = function() {
	  return /** @type {string} */ (jspb.Message.bytesAsB64(
	      this.getS()));
	};


	/**
	 * optional bytes s = 4;
	 * Note that Uint8Array is not supported on all browsers.
	 * @see http://caniuse.com/Uint8Array
	 * This is a type-conversion wrapper around `getS()`
	 * @return {!Uint8Array}
	 */
	proto.onnx.AttributeProto.prototype.getS_asU8 = function() {
	  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
	      this.getS()));
	};


	/**
	 * @param {!(string|Uint8Array)} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setS = function(value) {
	  return jspb.Message.setField(this, 4, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearS = function() {
	  return jspb.Message.setField(this, 4, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasS = function() {
	  return jspb.Message.getField(this, 4) != null;
	};


	/**
	 * optional TensorProto t = 5;
	 * @return {?proto.onnx.TensorProto}
	 */
	proto.onnx.AttributeProto.prototype.getT = function() {
	  return /** @type{?proto.onnx.TensorProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TensorProto, 5));
	};


	/**
	 * @param {?proto.onnx.TensorProto|undefined} value
	 * @return {!proto.onnx.AttributeProto} returns this
	*/
	proto.onnx.AttributeProto.prototype.setT = function(value) {
	  return jspb.Message.setWrapperField(this, 5, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearT = function() {
	  return this.setT(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasT = function() {
	  return jspb.Message.getField(this, 5) != null;
	};


	/**
	 * optional GraphProto g = 6;
	 * @return {?proto.onnx.GraphProto}
	 */
	proto.onnx.AttributeProto.prototype.getG = function() {
	  return /** @type{?proto.onnx.GraphProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.GraphProto, 6));
	};


	/**
	 * @param {?proto.onnx.GraphProto|undefined} value
	 * @return {!proto.onnx.AttributeProto} returns this
	*/
	proto.onnx.AttributeProto.prototype.setG = function(value) {
	  return jspb.Message.setWrapperField(this, 6, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearG = function() {
	  return this.setG(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasG = function() {
	  return jspb.Message.getField(this, 6) != null;
	};


	/**
	 * optional SparseTensorProto sparse_tensor = 22;
	 * @return {?proto.onnx.SparseTensorProto}
	 */
	proto.onnx.AttributeProto.prototype.getSparseTensor = function() {
	  return /** @type{?proto.onnx.SparseTensorProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.SparseTensorProto, 22));
	};


	/**
	 * @param {?proto.onnx.SparseTensorProto|undefined} value
	 * @return {!proto.onnx.AttributeProto} returns this
	*/
	proto.onnx.AttributeProto.prototype.setSparseTensor = function(value) {
	  return jspb.Message.setWrapperField(this, 22, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearSparseTensor = function() {
	  return this.setSparseTensor(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasSparseTensor = function() {
	  return jspb.Message.getField(this, 22) != null;
	};


	/**
	 * optional TypeProto tp = 14;
	 * @return {?proto.onnx.TypeProto}
	 */
	proto.onnx.AttributeProto.prototype.getTp = function() {
	  return /** @type{?proto.onnx.TypeProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto, 14));
	};


	/**
	 * @param {?proto.onnx.TypeProto|undefined} value
	 * @return {!proto.onnx.AttributeProto} returns this
	*/
	proto.onnx.AttributeProto.prototype.setTp = function(value) {
	  return jspb.Message.setWrapperField(this, 14, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearTp = function() {
	  return this.setTp(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.AttributeProto.prototype.hasTp = function() {
	  return jspb.Message.getField(this, 14) != null;
	};


	/**
	 * repeated float floats = 7;
	 * @return {!Array<number>}
	 */
	proto.onnx.AttributeProto.prototype.getFloatsList = function() {
	  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedFloatingPointField(this, 7));
	};


	/**
	 * @param {!Array<number>} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setFloatsList = function(value) {
	  return jspb.Message.setField(this, 7, value || []);
	};


	/**
	 * @param {number} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.addFloats = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 7, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearFloatsList = function() {
	  return this.setFloatsList([]);
	};


	/**
	 * repeated int64 ints = 8;
	 * @return {!Array<number>}
	 */
	proto.onnx.AttributeProto.prototype.getIntsList = function() {
	  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedField(this, 8));
	};


	/**
	 * @param {!Array<number>} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setIntsList = function(value) {
	  return jspb.Message.setField(this, 8, value || []);
	};


	/**
	 * @param {number} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.addInts = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 8, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearIntsList = function() {
	  return this.setIntsList([]);
	};


	/**
	 * repeated bytes strings = 9;
	 * @return {!(Array<!Uint8Array>|Array<string>)}
	 */
	proto.onnx.AttributeProto.prototype.getStringsList = function() {
	  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 9));
	};


	/**
	 * repeated bytes strings = 9;
	 * This is a type-conversion wrapper around `getStringsList()`
	 * @return {!Array<string>}
	 */
	proto.onnx.AttributeProto.prototype.getStringsList_asB64 = function() {
	  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
	      this.getStringsList()));
	};


	/**
	 * repeated bytes strings = 9;
	 * Note that Uint8Array is not supported on all browsers.
	 * @see http://caniuse.com/Uint8Array
	 * This is a type-conversion wrapper around `getStringsList()`
	 * @return {!Array<!Uint8Array>}
	 */
	proto.onnx.AttributeProto.prototype.getStringsList_asU8 = function() {
	  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
	      this.getStringsList()));
	};


	/**
	 * @param {!(Array<!Uint8Array>|Array<string>)} value
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.setStringsList = function(value) {
	  return jspb.Message.setField(this, 9, value || []);
	};


	/**
	 * @param {!(string|Uint8Array)} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.addStrings = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 9, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearStringsList = function() {
	  return this.setStringsList([]);
	};


	/**
	 * repeated TensorProto tensors = 10;
	 * @return {!Array<!proto.onnx.TensorProto>}
	 */
	proto.onnx.AttributeProto.prototype.getTensorsList = function() {
	  return /** @type{!Array<!proto.onnx.TensorProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.TensorProto, 10));
	};


	/**
	 * @param {!Array<!proto.onnx.TensorProto>} value
	 * @return {!proto.onnx.AttributeProto} returns this
	*/
	proto.onnx.AttributeProto.prototype.setTensorsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 10, value);
	};


	/**
	 * @param {!proto.onnx.TensorProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorProto}
	 */
	proto.onnx.AttributeProto.prototype.addTensors = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 10, opt_value, proto.onnx.TensorProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearTensorsList = function() {
	  return this.setTensorsList([]);
	};


	/**
	 * repeated GraphProto graphs = 11;
	 * @return {!Array<!proto.onnx.GraphProto>}
	 */
	proto.onnx.AttributeProto.prototype.getGraphsList = function() {
	  return /** @type{!Array<!proto.onnx.GraphProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.GraphProto, 11));
	};


	/**
	 * @param {!Array<!proto.onnx.GraphProto>} value
	 * @return {!proto.onnx.AttributeProto} returns this
	*/
	proto.onnx.AttributeProto.prototype.setGraphsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 11, value);
	};


	/**
	 * @param {!proto.onnx.GraphProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.GraphProto}
	 */
	proto.onnx.AttributeProto.prototype.addGraphs = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.onnx.GraphProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearGraphsList = function() {
	  return this.setGraphsList([]);
	};


	/**
	 * repeated SparseTensorProto sparse_tensors = 23;
	 * @return {!Array<!proto.onnx.SparseTensorProto>}
	 */
	proto.onnx.AttributeProto.prototype.getSparseTensorsList = function() {
	  return /** @type{!Array<!proto.onnx.SparseTensorProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.SparseTensorProto, 23));
	};


	/**
	 * @param {!Array<!proto.onnx.SparseTensorProto>} value
	 * @return {!proto.onnx.AttributeProto} returns this
	*/
	proto.onnx.AttributeProto.prototype.setSparseTensorsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 23, value);
	};


	/**
	 * @param {!proto.onnx.SparseTensorProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.SparseTensorProto}
	 */
	proto.onnx.AttributeProto.prototype.addSparseTensors = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 23, opt_value, proto.onnx.SparseTensorProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearSparseTensorsList = function() {
	  return this.setSparseTensorsList([]);
	};


	/**
	 * repeated TypeProto type_protos = 15;
	 * @return {!Array<!proto.onnx.TypeProto>}
	 */
	proto.onnx.AttributeProto.prototype.getTypeProtosList = function() {
	  return /** @type{!Array<!proto.onnx.TypeProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.TypeProto, 15));
	};


	/**
	 * @param {!Array<!proto.onnx.TypeProto>} value
	 * @return {!proto.onnx.AttributeProto} returns this
	*/
	proto.onnx.AttributeProto.prototype.setTypeProtosList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 15, value);
	};


	/**
	 * @param {!proto.onnx.TypeProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TypeProto}
	 */
	proto.onnx.AttributeProto.prototype.addTypeProtos = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 15, opt_value, proto.onnx.TypeProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.AttributeProto} returns this
	 */
	proto.onnx.AttributeProto.prototype.clearTypeProtosList = function() {
	  return this.setTypeProtosList([]);
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.ValueInfoProto.repeatedFields_ = [4];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.ValueInfoProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.ValueInfoProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.ValueInfoProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.ValueInfoProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    name: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    type: (f = msg.getType()) && proto.onnx.TypeProto.toObject(includeInstance, f),
	    docString: (f = jspb.Message.getField(msg, 3)) == null ? undefined : f,
	    metadataPropsList: jspb.Message.toObjectList(msg.getMetadataPropsList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.ValueInfoProto}
	 */
	proto.onnx.ValueInfoProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.ValueInfoProto;
	  return proto.onnx.ValueInfoProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.ValueInfoProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.ValueInfoProto}
	 */
	proto.onnx.ValueInfoProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setName(value);
	      break;
	    case 2:
	      var value = new proto.onnx.TypeProto;
	      reader.readMessage(value,proto.onnx.TypeProto.deserializeBinaryFromReader);
	      msg.setType(value);
	      break;
	    case 3:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDocString(value);
	      break;
	    case 4:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addMetadataProps(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.ValueInfoProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.ValueInfoProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.ValueInfoProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.ValueInfoProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {string} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeString(
	      1,
	      f
	    );
	  }
	  f = message.getType();
	  if (f != null) {
	    writer.writeMessage(
	      2,
	      f,
	      proto.onnx.TypeProto.serializeBinaryToWriter
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 3));
	  if (f != null) {
	    writer.writeString(
	      3,
	      f
	    );
	  }
	  f = message.getMetadataPropsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      4,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional string name = 1;
	 * @return {string}
	 */
	proto.onnx.ValueInfoProto.prototype.getName = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.ValueInfoProto} returns this
	 */
	proto.onnx.ValueInfoProto.prototype.setName = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.ValueInfoProto} returns this
	 */
	proto.onnx.ValueInfoProto.prototype.clearName = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ValueInfoProto.prototype.hasName = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional TypeProto type = 2;
	 * @return {?proto.onnx.TypeProto}
	 */
	proto.onnx.ValueInfoProto.prototype.getType = function() {
	  return /** @type{?proto.onnx.TypeProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto, 2));
	};


	/**
	 * @param {?proto.onnx.TypeProto|undefined} value
	 * @return {!proto.onnx.ValueInfoProto} returns this
	*/
	proto.onnx.ValueInfoProto.prototype.setType = function(value) {
	  return jspb.Message.setWrapperField(this, 2, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.ValueInfoProto} returns this
	 */
	proto.onnx.ValueInfoProto.prototype.clearType = function() {
	  return this.setType(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ValueInfoProto.prototype.hasType = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * optional string doc_string = 3;
	 * @return {string}
	 */
	proto.onnx.ValueInfoProto.prototype.getDocString = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.ValueInfoProto} returns this
	 */
	proto.onnx.ValueInfoProto.prototype.setDocString = function(value) {
	  return jspb.Message.setField(this, 3, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.ValueInfoProto} returns this
	 */
	proto.onnx.ValueInfoProto.prototype.clearDocString = function() {
	  return jspb.Message.setField(this, 3, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ValueInfoProto.prototype.hasDocString = function() {
	  return jspb.Message.getField(this, 3) != null;
	};


	/**
	 * repeated StringStringEntryProto metadata_props = 4;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.ValueInfoProto.prototype.getMetadataPropsList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 4));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.ValueInfoProto} returns this
	*/
	proto.onnx.ValueInfoProto.prototype.setMetadataPropsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 4, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.ValueInfoProto.prototype.addMetadataProps = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.ValueInfoProto} returns this
	 */
	proto.onnx.ValueInfoProto.prototype.clearMetadataPropsList = function() {
	  return this.setMetadataPropsList([]);
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.NodeProto.repeatedFields_ = [1,2,5,9];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.NodeProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.NodeProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.NodeProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.NodeProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    inputList: (f = jspb.Message.getRepeatedField(msg, 1)) == null ? undefined : f,
	    outputList: (f = jspb.Message.getRepeatedField(msg, 2)) == null ? undefined : f,
	    name: (f = jspb.Message.getField(msg, 3)) == null ? undefined : f,
	    opType: (f = jspb.Message.getField(msg, 4)) == null ? undefined : f,
	    domain: (f = jspb.Message.getField(msg, 7)) == null ? undefined : f,
	    overload: (f = jspb.Message.getField(msg, 8)) == null ? undefined : f,
	    attributeList: jspb.Message.toObjectList(msg.getAttributeList(),
	    proto.onnx.AttributeProto.toObject, includeInstance),
	    docString: (f = jspb.Message.getField(msg, 6)) == null ? undefined : f,
	    metadataPropsList: jspb.Message.toObjectList(msg.getMetadataPropsList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.NodeProto}
	 */
	proto.onnx.NodeProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.NodeProto;
	  return proto.onnx.NodeProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.NodeProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.NodeProto}
	 */
	proto.onnx.NodeProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {string} */ (reader.readString());
	      msg.addInput(value);
	      break;
	    case 2:
	      var value = /** @type {string} */ (reader.readString());
	      msg.addOutput(value);
	      break;
	    case 3:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setName(value);
	      break;
	    case 4:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setOpType(value);
	      break;
	    case 7:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDomain(value);
	      break;
	    case 8:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setOverload(value);
	      break;
	    case 5:
	      var value = new proto.onnx.AttributeProto;
	      reader.readMessage(value,proto.onnx.AttributeProto.deserializeBinaryFromReader);
	      msg.addAttribute(value);
	      break;
	    case 6:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDocString(value);
	      break;
	    case 9:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addMetadataProps(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.NodeProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.NodeProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.NodeProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.NodeProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = message.getInputList();
	  if (f.length > 0) {
	    writer.writeRepeatedString(
	      1,
	      f
	    );
	  }
	  f = message.getOutputList();
	  if (f.length > 0) {
	    writer.writeRepeatedString(
	      2,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 3));
	  if (f != null) {
	    writer.writeString(
	      3,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 4));
	  if (f != null) {
	    writer.writeString(
	      4,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 7));
	  if (f != null) {
	    writer.writeString(
	      7,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 8));
	  if (f != null) {
	    writer.writeString(
	      8,
	      f
	    );
	  }
	  f = message.getAttributeList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      5,
	      f,
	      proto.onnx.AttributeProto.serializeBinaryToWriter
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 6));
	  if (f != null) {
	    writer.writeString(
	      6,
	      f
	    );
	  }
	  f = message.getMetadataPropsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      9,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * repeated string input = 1;
	 * @return {!Array<string>}
	 */
	proto.onnx.NodeProto.prototype.getInputList = function() {
	  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 1));
	};


	/**
	 * @param {!Array<string>} value
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.setInputList = function(value) {
	  return jspb.Message.setField(this, 1, value || []);
	};


	/**
	 * @param {string} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.addInput = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.clearInputList = function() {
	  return this.setInputList([]);
	};


	/**
	 * repeated string output = 2;
	 * @return {!Array<string>}
	 */
	proto.onnx.NodeProto.prototype.getOutputList = function() {
	  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 2));
	};


	/**
	 * @param {!Array<string>} value
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.setOutputList = function(value) {
	  return jspb.Message.setField(this, 2, value || []);
	};


	/**
	 * @param {string} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.addOutput = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 2, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.clearOutputList = function() {
	  return this.setOutputList([]);
	};


	/**
	 * optional string name = 3;
	 * @return {string}
	 */
	proto.onnx.NodeProto.prototype.getName = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.setName = function(value) {
	  return jspb.Message.setField(this, 3, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.clearName = function() {
	  return jspb.Message.setField(this, 3, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.NodeProto.prototype.hasName = function() {
	  return jspb.Message.getField(this, 3) != null;
	};


	/**
	 * optional string op_type = 4;
	 * @return {string}
	 */
	proto.onnx.NodeProto.prototype.getOpType = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.setOpType = function(value) {
	  return jspb.Message.setField(this, 4, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.clearOpType = function() {
	  return jspb.Message.setField(this, 4, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.NodeProto.prototype.hasOpType = function() {
	  return jspb.Message.getField(this, 4) != null;
	};


	/**
	 * optional string domain = 7;
	 * @return {string}
	 */
	proto.onnx.NodeProto.prototype.getDomain = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.setDomain = function(value) {
	  return jspb.Message.setField(this, 7, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.clearDomain = function() {
	  return jspb.Message.setField(this, 7, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.NodeProto.prototype.hasDomain = function() {
	  return jspb.Message.getField(this, 7) != null;
	};


	/**
	 * optional string overload = 8;
	 * @return {string}
	 */
	proto.onnx.NodeProto.prototype.getOverload = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.setOverload = function(value) {
	  return jspb.Message.setField(this, 8, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.clearOverload = function() {
	  return jspb.Message.setField(this, 8, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.NodeProto.prototype.hasOverload = function() {
	  return jspb.Message.getField(this, 8) != null;
	};


	/**
	 * repeated AttributeProto attribute = 5;
	 * @return {!Array<!proto.onnx.AttributeProto>}
	 */
	proto.onnx.NodeProto.prototype.getAttributeList = function() {
	  return /** @type{!Array<!proto.onnx.AttributeProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.AttributeProto, 5));
	};


	/**
	 * @param {!Array<!proto.onnx.AttributeProto>} value
	 * @return {!proto.onnx.NodeProto} returns this
	*/
	proto.onnx.NodeProto.prototype.setAttributeList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 5, value);
	};


	/**
	 * @param {!proto.onnx.AttributeProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.AttributeProto}
	 */
	proto.onnx.NodeProto.prototype.addAttribute = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.onnx.AttributeProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.clearAttributeList = function() {
	  return this.setAttributeList([]);
	};


	/**
	 * optional string doc_string = 6;
	 * @return {string}
	 */
	proto.onnx.NodeProto.prototype.getDocString = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.setDocString = function(value) {
	  return jspb.Message.setField(this, 6, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.clearDocString = function() {
	  return jspb.Message.setField(this, 6, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.NodeProto.prototype.hasDocString = function() {
	  return jspb.Message.getField(this, 6) != null;
	};


	/**
	 * repeated StringStringEntryProto metadata_props = 9;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.NodeProto.prototype.getMetadataPropsList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 9));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.NodeProto} returns this
	*/
	proto.onnx.NodeProto.prototype.setMetadataPropsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 9, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.NodeProto.prototype.addMetadataProps = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 9, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.NodeProto} returns this
	 */
	proto.onnx.NodeProto.prototype.clearMetadataPropsList = function() {
	  return this.setMetadataPropsList([]);
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.TrainingInfoProto.repeatedFields_ = [3,4];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TrainingInfoProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TrainingInfoProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TrainingInfoProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TrainingInfoProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    initialization: (f = msg.getInitialization()) && proto.onnx.GraphProto.toObject(includeInstance, f),
	    algorithm: (f = msg.getAlgorithm()) && proto.onnx.GraphProto.toObject(includeInstance, f),
	    initializationBindingList: jspb.Message.toObjectList(msg.getInitializationBindingList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance),
	    updateBindingList: jspb.Message.toObjectList(msg.getUpdateBindingList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TrainingInfoProto}
	 */
	proto.onnx.TrainingInfoProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TrainingInfoProto;
	  return proto.onnx.TrainingInfoProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TrainingInfoProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TrainingInfoProto}
	 */
	proto.onnx.TrainingInfoProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = new proto.onnx.GraphProto;
	      reader.readMessage(value,proto.onnx.GraphProto.deserializeBinaryFromReader);
	      msg.setInitialization(value);
	      break;
	    case 2:
	      var value = new proto.onnx.GraphProto;
	      reader.readMessage(value,proto.onnx.GraphProto.deserializeBinaryFromReader);
	      msg.setAlgorithm(value);
	      break;
	    case 3:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addInitializationBinding(value);
	      break;
	    case 4:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addUpdateBinding(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TrainingInfoProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TrainingInfoProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TrainingInfoProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TrainingInfoProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = message.getInitialization();
	  if (f != null) {
	    writer.writeMessage(
	      1,
	      f,
	      proto.onnx.GraphProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getAlgorithm();
	  if (f != null) {
	    writer.writeMessage(
	      2,
	      f,
	      proto.onnx.GraphProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getInitializationBindingList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      3,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getUpdateBindingList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      4,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional GraphProto initialization = 1;
	 * @return {?proto.onnx.GraphProto}
	 */
	proto.onnx.TrainingInfoProto.prototype.getInitialization = function() {
	  return /** @type{?proto.onnx.GraphProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.GraphProto, 1));
	};


	/**
	 * @param {?proto.onnx.GraphProto|undefined} value
	 * @return {!proto.onnx.TrainingInfoProto} returns this
	*/
	proto.onnx.TrainingInfoProto.prototype.setInitialization = function(value) {
	  return jspb.Message.setWrapperField(this, 1, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TrainingInfoProto} returns this
	 */
	proto.onnx.TrainingInfoProto.prototype.clearInitialization = function() {
	  return this.setInitialization(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TrainingInfoProto.prototype.hasInitialization = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional GraphProto algorithm = 2;
	 * @return {?proto.onnx.GraphProto}
	 */
	proto.onnx.TrainingInfoProto.prototype.getAlgorithm = function() {
	  return /** @type{?proto.onnx.GraphProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.GraphProto, 2));
	};


	/**
	 * @param {?proto.onnx.GraphProto|undefined} value
	 * @return {!proto.onnx.TrainingInfoProto} returns this
	*/
	proto.onnx.TrainingInfoProto.prototype.setAlgorithm = function(value) {
	  return jspb.Message.setWrapperField(this, 2, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TrainingInfoProto} returns this
	 */
	proto.onnx.TrainingInfoProto.prototype.clearAlgorithm = function() {
	  return this.setAlgorithm(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TrainingInfoProto.prototype.hasAlgorithm = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * repeated StringStringEntryProto initialization_binding = 3;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.TrainingInfoProto.prototype.getInitializationBindingList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 3));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.TrainingInfoProto} returns this
	*/
	proto.onnx.TrainingInfoProto.prototype.setInitializationBindingList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 3, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.TrainingInfoProto.prototype.addInitializationBinding = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TrainingInfoProto} returns this
	 */
	proto.onnx.TrainingInfoProto.prototype.clearInitializationBindingList = function() {
	  return this.setInitializationBindingList([]);
	};


	/**
	 * repeated StringStringEntryProto update_binding = 4;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.TrainingInfoProto.prototype.getUpdateBindingList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 4));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.TrainingInfoProto} returns this
	*/
	proto.onnx.TrainingInfoProto.prototype.setUpdateBindingList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 4, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.TrainingInfoProto.prototype.addUpdateBinding = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TrainingInfoProto} returns this
	 */
	proto.onnx.TrainingInfoProto.prototype.clearUpdateBindingList = function() {
	  return this.setUpdateBindingList([]);
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.ModelProto.repeatedFields_ = [8,14,20,25];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.ModelProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.ModelProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.ModelProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.ModelProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    irVersion: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    opsetImportList: jspb.Message.toObjectList(msg.getOpsetImportList(),
	    proto.onnx.OperatorSetIdProto.toObject, includeInstance),
	    producerName: (f = jspb.Message.getField(msg, 2)) == null ? undefined : f,
	    producerVersion: (f = jspb.Message.getField(msg, 3)) == null ? undefined : f,
	    domain: (f = jspb.Message.getField(msg, 4)) == null ? undefined : f,
	    modelVersion: (f = jspb.Message.getField(msg, 5)) == null ? undefined : f,
	    docString: (f = jspb.Message.getField(msg, 6)) == null ? undefined : f,
	    graph: (f = msg.getGraph()) && proto.onnx.GraphProto.toObject(includeInstance, f),
	    metadataPropsList: jspb.Message.toObjectList(msg.getMetadataPropsList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance),
	    trainingInfoList: jspb.Message.toObjectList(msg.getTrainingInfoList(),
	    proto.onnx.TrainingInfoProto.toObject, includeInstance),
	    functionsList: jspb.Message.toObjectList(msg.getFunctionsList(),
	    proto.onnx.FunctionProto.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.ModelProto}
	 */
	proto.onnx.ModelProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.ModelProto;
	  return proto.onnx.ModelProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.ModelProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.ModelProto}
	 */
	proto.onnx.ModelProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {number} */ (reader.readInt64());
	      msg.setIrVersion(value);
	      break;
	    case 8:
	      var value = new proto.onnx.OperatorSetIdProto;
	      reader.readMessage(value,proto.onnx.OperatorSetIdProto.deserializeBinaryFromReader);
	      msg.addOpsetImport(value);
	      break;
	    case 2:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setProducerName(value);
	      break;
	    case 3:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setProducerVersion(value);
	      break;
	    case 4:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDomain(value);
	      break;
	    case 5:
	      var value = /** @type {number} */ (reader.readInt64());
	      msg.setModelVersion(value);
	      break;
	    case 6:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDocString(value);
	      break;
	    case 7:
	      var value = new proto.onnx.GraphProto;
	      reader.readMessage(value,proto.onnx.GraphProto.deserializeBinaryFromReader);
	      msg.setGraph(value);
	      break;
	    case 14:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addMetadataProps(value);
	      break;
	    case 20:
	      var value = new proto.onnx.TrainingInfoProto;
	      reader.readMessage(value,proto.onnx.TrainingInfoProto.deserializeBinaryFromReader);
	      msg.addTrainingInfo(value);
	      break;
	    case 25:
	      var value = new proto.onnx.FunctionProto;
	      reader.readMessage(value,proto.onnx.FunctionProto.deserializeBinaryFromReader);
	      msg.addFunctions(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.ModelProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.ModelProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.ModelProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.ModelProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {number} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeInt64(
	      1,
	      f
	    );
	  }
	  f = message.getOpsetImportList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      8,
	      f,
	      proto.onnx.OperatorSetIdProto.serializeBinaryToWriter
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 2));
	  if (f != null) {
	    writer.writeString(
	      2,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 3));
	  if (f != null) {
	    writer.writeString(
	      3,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 4));
	  if (f != null) {
	    writer.writeString(
	      4,
	      f
	    );
	  }
	  f = /** @type {number} */ (jspb.Message.getField(message, 5));
	  if (f != null) {
	    writer.writeInt64(
	      5,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 6));
	  if (f != null) {
	    writer.writeString(
	      6,
	      f
	    );
	  }
	  f = message.getGraph();
	  if (f != null) {
	    writer.writeMessage(
	      7,
	      f,
	      proto.onnx.GraphProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getMetadataPropsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      14,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getTrainingInfoList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      20,
	      f,
	      proto.onnx.TrainingInfoProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getFunctionsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      25,
	      f,
	      proto.onnx.FunctionProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional int64 ir_version = 1;
	 * @return {number}
	 */
	proto.onnx.ModelProto.prototype.getIrVersion = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.setIrVersion = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearIrVersion = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ModelProto.prototype.hasIrVersion = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * repeated OperatorSetIdProto opset_import = 8;
	 * @return {!Array<!proto.onnx.OperatorSetIdProto>}
	 */
	proto.onnx.ModelProto.prototype.getOpsetImportList = function() {
	  return /** @type{!Array<!proto.onnx.OperatorSetIdProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.OperatorSetIdProto, 8));
	};


	/**
	 * @param {!Array<!proto.onnx.OperatorSetIdProto>} value
	 * @return {!proto.onnx.ModelProto} returns this
	*/
	proto.onnx.ModelProto.prototype.setOpsetImportList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 8, value);
	};


	/**
	 * @param {!proto.onnx.OperatorSetIdProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.OperatorSetIdProto}
	 */
	proto.onnx.ModelProto.prototype.addOpsetImport = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 8, opt_value, proto.onnx.OperatorSetIdProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearOpsetImportList = function() {
	  return this.setOpsetImportList([]);
	};


	/**
	 * optional string producer_name = 2;
	 * @return {string}
	 */
	proto.onnx.ModelProto.prototype.getProducerName = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.setProducerName = function(value) {
	  return jspb.Message.setField(this, 2, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearProducerName = function() {
	  return jspb.Message.setField(this, 2, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ModelProto.prototype.hasProducerName = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * optional string producer_version = 3;
	 * @return {string}
	 */
	proto.onnx.ModelProto.prototype.getProducerVersion = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.setProducerVersion = function(value) {
	  return jspb.Message.setField(this, 3, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearProducerVersion = function() {
	  return jspb.Message.setField(this, 3, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ModelProto.prototype.hasProducerVersion = function() {
	  return jspb.Message.getField(this, 3) != null;
	};


	/**
	 * optional string domain = 4;
	 * @return {string}
	 */
	proto.onnx.ModelProto.prototype.getDomain = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.setDomain = function(value) {
	  return jspb.Message.setField(this, 4, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearDomain = function() {
	  return jspb.Message.setField(this, 4, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ModelProto.prototype.hasDomain = function() {
	  return jspb.Message.getField(this, 4) != null;
	};


	/**
	 * optional int64 model_version = 5;
	 * @return {number}
	 */
	proto.onnx.ModelProto.prototype.getModelVersion = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.setModelVersion = function(value) {
	  return jspb.Message.setField(this, 5, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearModelVersion = function() {
	  return jspb.Message.setField(this, 5, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ModelProto.prototype.hasModelVersion = function() {
	  return jspb.Message.getField(this, 5) != null;
	};


	/**
	 * optional string doc_string = 6;
	 * @return {string}
	 */
	proto.onnx.ModelProto.prototype.getDocString = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.setDocString = function(value) {
	  return jspb.Message.setField(this, 6, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearDocString = function() {
	  return jspb.Message.setField(this, 6, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ModelProto.prototype.hasDocString = function() {
	  return jspb.Message.getField(this, 6) != null;
	};


	/**
	 * optional GraphProto graph = 7;
	 * @return {?proto.onnx.GraphProto}
	 */
	proto.onnx.ModelProto.prototype.getGraph = function() {
	  return /** @type{?proto.onnx.GraphProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.GraphProto, 7));
	};


	/**
	 * @param {?proto.onnx.GraphProto|undefined} value
	 * @return {!proto.onnx.ModelProto} returns this
	*/
	proto.onnx.ModelProto.prototype.setGraph = function(value) {
	  return jspb.Message.setWrapperField(this, 7, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearGraph = function() {
	  return this.setGraph(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.ModelProto.prototype.hasGraph = function() {
	  return jspb.Message.getField(this, 7) != null;
	};


	/**
	 * repeated StringStringEntryProto metadata_props = 14;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.ModelProto.prototype.getMetadataPropsList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 14));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.ModelProto} returns this
	*/
	proto.onnx.ModelProto.prototype.setMetadataPropsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 14, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.ModelProto.prototype.addMetadataProps = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 14, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearMetadataPropsList = function() {
	  return this.setMetadataPropsList([]);
	};


	/**
	 * repeated TrainingInfoProto training_info = 20;
	 * @return {!Array<!proto.onnx.TrainingInfoProto>}
	 */
	proto.onnx.ModelProto.prototype.getTrainingInfoList = function() {
	  return /** @type{!Array<!proto.onnx.TrainingInfoProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.TrainingInfoProto, 20));
	};


	/**
	 * @param {!Array<!proto.onnx.TrainingInfoProto>} value
	 * @return {!proto.onnx.ModelProto} returns this
	*/
	proto.onnx.ModelProto.prototype.setTrainingInfoList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 20, value);
	};


	/**
	 * @param {!proto.onnx.TrainingInfoProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TrainingInfoProto}
	 */
	proto.onnx.ModelProto.prototype.addTrainingInfo = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 20, opt_value, proto.onnx.TrainingInfoProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearTrainingInfoList = function() {
	  return this.setTrainingInfoList([]);
	};


	/**
	 * repeated FunctionProto functions = 25;
	 * @return {!Array<!proto.onnx.FunctionProto>}
	 */
	proto.onnx.ModelProto.prototype.getFunctionsList = function() {
	  return /** @type{!Array<!proto.onnx.FunctionProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.FunctionProto, 25));
	};


	/**
	 * @param {!Array<!proto.onnx.FunctionProto>} value
	 * @return {!proto.onnx.ModelProto} returns this
	*/
	proto.onnx.ModelProto.prototype.setFunctionsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 25, value);
	};


	/**
	 * @param {!proto.onnx.FunctionProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.FunctionProto}
	 */
	proto.onnx.ModelProto.prototype.addFunctions = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 25, opt_value, proto.onnx.FunctionProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.ModelProto} returns this
	 */
	proto.onnx.ModelProto.prototype.clearFunctionsList = function() {
	  return this.setFunctionsList([]);
	};





	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.StringStringEntryProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.StringStringEntryProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.StringStringEntryProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.StringStringEntryProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    key: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    value: (f = jspb.Message.getField(msg, 2)) == null ? undefined : f
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.StringStringEntryProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.StringStringEntryProto;
	  return proto.onnx.StringStringEntryProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.StringStringEntryProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.StringStringEntryProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setKey(value);
	      break;
	    case 2:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setValue(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.StringStringEntryProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.StringStringEntryProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.StringStringEntryProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.StringStringEntryProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {string} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeString(
	      1,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 2));
	  if (f != null) {
	    writer.writeString(
	      2,
	      f
	    );
	  }
	};


	/**
	 * optional string key = 1;
	 * @return {string}
	 */
	proto.onnx.StringStringEntryProto.prototype.getKey = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.StringStringEntryProto} returns this
	 */
	proto.onnx.StringStringEntryProto.prototype.setKey = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.StringStringEntryProto} returns this
	 */
	proto.onnx.StringStringEntryProto.prototype.clearKey = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.StringStringEntryProto.prototype.hasKey = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional string value = 2;
	 * @return {string}
	 */
	proto.onnx.StringStringEntryProto.prototype.getValue = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.StringStringEntryProto} returns this
	 */
	proto.onnx.StringStringEntryProto.prototype.setValue = function(value) {
	  return jspb.Message.setField(this, 2, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.StringStringEntryProto} returns this
	 */
	proto.onnx.StringStringEntryProto.prototype.clearValue = function() {
	  return jspb.Message.setField(this, 2, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.StringStringEntryProto.prototype.hasValue = function() {
	  return jspb.Message.getField(this, 2) != null;
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.TensorAnnotation.repeatedFields_ = [2];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TensorAnnotation.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TensorAnnotation.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TensorAnnotation} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorAnnotation.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    tensorName: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    quantParameterTensorNamesList: jspb.Message.toObjectList(msg.getQuantParameterTensorNamesList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TensorAnnotation}
	 */
	proto.onnx.TensorAnnotation.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TensorAnnotation;
	  return proto.onnx.TensorAnnotation.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TensorAnnotation} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TensorAnnotation}
	 */
	proto.onnx.TensorAnnotation.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setTensorName(value);
	      break;
	    case 2:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addQuantParameterTensorNames(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TensorAnnotation.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TensorAnnotation.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TensorAnnotation} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorAnnotation.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {string} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeString(
	      1,
	      f
	    );
	  }
	  f = message.getQuantParameterTensorNamesList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      2,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional string tensor_name = 1;
	 * @return {string}
	 */
	proto.onnx.TensorAnnotation.prototype.getTensorName = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.TensorAnnotation} returns this
	 */
	proto.onnx.TensorAnnotation.prototype.setTensorName = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorAnnotation} returns this
	 */
	proto.onnx.TensorAnnotation.prototype.clearTensorName = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorAnnotation.prototype.hasTensorName = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * repeated StringStringEntryProto quant_parameter_tensor_names = 2;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.TensorAnnotation.prototype.getQuantParameterTensorNamesList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 2));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.TensorAnnotation} returns this
	*/
	proto.onnx.TensorAnnotation.prototype.setQuantParameterTensorNamesList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 2, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.TensorAnnotation.prototype.addQuantParameterTensorNames = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorAnnotation} returns this
	 */
	proto.onnx.TensorAnnotation.prototype.clearQuantParameterTensorNamesList = function() {
	  return this.setQuantParameterTensorNamesList([]);
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.GraphProto.repeatedFields_ = [1,5,15,11,12,13,14,16];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.GraphProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.GraphProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.GraphProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.GraphProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    nodeList: jspb.Message.toObjectList(msg.getNodeList(),
	    proto.onnx.NodeProto.toObject, includeInstance),
	    name: (f = jspb.Message.getField(msg, 2)) == null ? undefined : f,
	    initializerList: jspb.Message.toObjectList(msg.getInitializerList(),
	    proto.onnx.TensorProto.toObject, includeInstance),
	    sparseInitializerList: jspb.Message.toObjectList(msg.getSparseInitializerList(),
	    proto.onnx.SparseTensorProto.toObject, includeInstance),
	    docString: (f = jspb.Message.getField(msg, 10)) == null ? undefined : f,
	    inputList: jspb.Message.toObjectList(msg.getInputList(),
	    proto.onnx.ValueInfoProto.toObject, includeInstance),
	    outputList: jspb.Message.toObjectList(msg.getOutputList(),
	    proto.onnx.ValueInfoProto.toObject, includeInstance),
	    valueInfoList: jspb.Message.toObjectList(msg.getValueInfoList(),
	    proto.onnx.ValueInfoProto.toObject, includeInstance),
	    quantizationAnnotationList: jspb.Message.toObjectList(msg.getQuantizationAnnotationList(),
	    proto.onnx.TensorAnnotation.toObject, includeInstance),
	    metadataPropsList: jspb.Message.toObjectList(msg.getMetadataPropsList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.GraphProto}
	 */
	proto.onnx.GraphProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.GraphProto;
	  return proto.onnx.GraphProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.GraphProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.GraphProto}
	 */
	proto.onnx.GraphProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = new proto.onnx.NodeProto;
	      reader.readMessage(value,proto.onnx.NodeProto.deserializeBinaryFromReader);
	      msg.addNode(value);
	      break;
	    case 2:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setName(value);
	      break;
	    case 5:
	      var value = new proto.onnx.TensorProto;
	      reader.readMessage(value,proto.onnx.TensorProto.deserializeBinaryFromReader);
	      msg.addInitializer(value);
	      break;
	    case 15:
	      var value = new proto.onnx.SparseTensorProto;
	      reader.readMessage(value,proto.onnx.SparseTensorProto.deserializeBinaryFromReader);
	      msg.addSparseInitializer(value);
	      break;
	    case 10:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDocString(value);
	      break;
	    case 11:
	      var value = new proto.onnx.ValueInfoProto;
	      reader.readMessage(value,proto.onnx.ValueInfoProto.deserializeBinaryFromReader);
	      msg.addInput(value);
	      break;
	    case 12:
	      var value = new proto.onnx.ValueInfoProto;
	      reader.readMessage(value,proto.onnx.ValueInfoProto.deserializeBinaryFromReader);
	      msg.addOutput(value);
	      break;
	    case 13:
	      var value = new proto.onnx.ValueInfoProto;
	      reader.readMessage(value,proto.onnx.ValueInfoProto.deserializeBinaryFromReader);
	      msg.addValueInfo(value);
	      break;
	    case 14:
	      var value = new proto.onnx.TensorAnnotation;
	      reader.readMessage(value,proto.onnx.TensorAnnotation.deserializeBinaryFromReader);
	      msg.addQuantizationAnnotation(value);
	      break;
	    case 16:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addMetadataProps(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.GraphProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.GraphProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.GraphProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.GraphProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = message.getNodeList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      1,
	      f,
	      proto.onnx.NodeProto.serializeBinaryToWriter
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 2));
	  if (f != null) {
	    writer.writeString(
	      2,
	      f
	    );
	  }
	  f = message.getInitializerList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      5,
	      f,
	      proto.onnx.TensorProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getSparseInitializerList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      15,
	      f,
	      proto.onnx.SparseTensorProto.serializeBinaryToWriter
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 10));
	  if (f != null) {
	    writer.writeString(
	      10,
	      f
	    );
	  }
	  f = message.getInputList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      11,
	      f,
	      proto.onnx.ValueInfoProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getOutputList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      12,
	      f,
	      proto.onnx.ValueInfoProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getValueInfoList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      13,
	      f,
	      proto.onnx.ValueInfoProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getQuantizationAnnotationList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      14,
	      f,
	      proto.onnx.TensorAnnotation.serializeBinaryToWriter
	    );
	  }
	  f = message.getMetadataPropsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      16,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * repeated NodeProto node = 1;
	 * @return {!Array<!proto.onnx.NodeProto>}
	 */
	proto.onnx.GraphProto.prototype.getNodeList = function() {
	  return /** @type{!Array<!proto.onnx.NodeProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.NodeProto, 1));
	};


	/**
	 * @param {!Array<!proto.onnx.NodeProto>} value
	 * @return {!proto.onnx.GraphProto} returns this
	*/
	proto.onnx.GraphProto.prototype.setNodeList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 1, value);
	};


	/**
	 * @param {!proto.onnx.NodeProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.NodeProto}
	 */
	proto.onnx.GraphProto.prototype.addNode = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.onnx.NodeProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearNodeList = function() {
	  return this.setNodeList([]);
	};


	/**
	 * optional string name = 2;
	 * @return {string}
	 */
	proto.onnx.GraphProto.prototype.getName = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.setName = function(value) {
	  return jspb.Message.setField(this, 2, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearName = function() {
	  return jspb.Message.setField(this, 2, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.GraphProto.prototype.hasName = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * repeated TensorProto initializer = 5;
	 * @return {!Array<!proto.onnx.TensorProto>}
	 */
	proto.onnx.GraphProto.prototype.getInitializerList = function() {
	  return /** @type{!Array<!proto.onnx.TensorProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.TensorProto, 5));
	};


	/**
	 * @param {!Array<!proto.onnx.TensorProto>} value
	 * @return {!proto.onnx.GraphProto} returns this
	*/
	proto.onnx.GraphProto.prototype.setInitializerList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 5, value);
	};


	/**
	 * @param {!proto.onnx.TensorProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorProto}
	 */
	proto.onnx.GraphProto.prototype.addInitializer = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.onnx.TensorProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearInitializerList = function() {
	  return this.setInitializerList([]);
	};


	/**
	 * repeated SparseTensorProto sparse_initializer = 15;
	 * @return {!Array<!proto.onnx.SparseTensorProto>}
	 */
	proto.onnx.GraphProto.prototype.getSparseInitializerList = function() {
	  return /** @type{!Array<!proto.onnx.SparseTensorProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.SparseTensorProto, 15));
	};


	/**
	 * @param {!Array<!proto.onnx.SparseTensorProto>} value
	 * @return {!proto.onnx.GraphProto} returns this
	*/
	proto.onnx.GraphProto.prototype.setSparseInitializerList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 15, value);
	};


	/**
	 * @param {!proto.onnx.SparseTensorProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.SparseTensorProto}
	 */
	proto.onnx.GraphProto.prototype.addSparseInitializer = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 15, opt_value, proto.onnx.SparseTensorProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearSparseInitializerList = function() {
	  return this.setSparseInitializerList([]);
	};


	/**
	 * optional string doc_string = 10;
	 * @return {string}
	 */
	proto.onnx.GraphProto.prototype.getDocString = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.setDocString = function(value) {
	  return jspb.Message.setField(this, 10, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearDocString = function() {
	  return jspb.Message.setField(this, 10, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.GraphProto.prototype.hasDocString = function() {
	  return jspb.Message.getField(this, 10) != null;
	};


	/**
	 * repeated ValueInfoProto input = 11;
	 * @return {!Array<!proto.onnx.ValueInfoProto>}
	 */
	proto.onnx.GraphProto.prototype.getInputList = function() {
	  return /** @type{!Array<!proto.onnx.ValueInfoProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.ValueInfoProto, 11));
	};


	/**
	 * @param {!Array<!proto.onnx.ValueInfoProto>} value
	 * @return {!proto.onnx.GraphProto} returns this
	*/
	proto.onnx.GraphProto.prototype.setInputList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 11, value);
	};


	/**
	 * @param {!proto.onnx.ValueInfoProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.ValueInfoProto}
	 */
	proto.onnx.GraphProto.prototype.addInput = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.onnx.ValueInfoProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearInputList = function() {
	  return this.setInputList([]);
	};


	/**
	 * repeated ValueInfoProto output = 12;
	 * @return {!Array<!proto.onnx.ValueInfoProto>}
	 */
	proto.onnx.GraphProto.prototype.getOutputList = function() {
	  return /** @type{!Array<!proto.onnx.ValueInfoProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.ValueInfoProto, 12));
	};


	/**
	 * @param {!Array<!proto.onnx.ValueInfoProto>} value
	 * @return {!proto.onnx.GraphProto} returns this
	*/
	proto.onnx.GraphProto.prototype.setOutputList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 12, value);
	};


	/**
	 * @param {!proto.onnx.ValueInfoProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.ValueInfoProto}
	 */
	proto.onnx.GraphProto.prototype.addOutput = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 12, opt_value, proto.onnx.ValueInfoProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearOutputList = function() {
	  return this.setOutputList([]);
	};


	/**
	 * repeated ValueInfoProto value_info = 13;
	 * @return {!Array<!proto.onnx.ValueInfoProto>}
	 */
	proto.onnx.GraphProto.prototype.getValueInfoList = function() {
	  return /** @type{!Array<!proto.onnx.ValueInfoProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.ValueInfoProto, 13));
	};


	/**
	 * @param {!Array<!proto.onnx.ValueInfoProto>} value
	 * @return {!proto.onnx.GraphProto} returns this
	*/
	proto.onnx.GraphProto.prototype.setValueInfoList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 13, value);
	};


	/**
	 * @param {!proto.onnx.ValueInfoProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.ValueInfoProto}
	 */
	proto.onnx.GraphProto.prototype.addValueInfo = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 13, opt_value, proto.onnx.ValueInfoProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearValueInfoList = function() {
	  return this.setValueInfoList([]);
	};


	/**
	 * repeated TensorAnnotation quantization_annotation = 14;
	 * @return {!Array<!proto.onnx.TensorAnnotation>}
	 */
	proto.onnx.GraphProto.prototype.getQuantizationAnnotationList = function() {
	  return /** @type{!Array<!proto.onnx.TensorAnnotation>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.TensorAnnotation, 14));
	};


	/**
	 * @param {!Array<!proto.onnx.TensorAnnotation>} value
	 * @return {!proto.onnx.GraphProto} returns this
	*/
	proto.onnx.GraphProto.prototype.setQuantizationAnnotationList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 14, value);
	};


	/**
	 * @param {!proto.onnx.TensorAnnotation=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorAnnotation}
	 */
	proto.onnx.GraphProto.prototype.addQuantizationAnnotation = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 14, opt_value, proto.onnx.TensorAnnotation, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearQuantizationAnnotationList = function() {
	  return this.setQuantizationAnnotationList([]);
	};


	/**
	 * repeated StringStringEntryProto metadata_props = 16;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.GraphProto.prototype.getMetadataPropsList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 16));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.GraphProto} returns this
	*/
	proto.onnx.GraphProto.prototype.setMetadataPropsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 16, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.GraphProto.prototype.addMetadataProps = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 16, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.GraphProto} returns this
	 */
	proto.onnx.GraphProto.prototype.clearMetadataPropsList = function() {
	  return this.setMetadataPropsList([]);
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.TensorProto.repeatedFields_ = [1,4,5,6,7,13,10,11,16];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TensorProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TensorProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TensorProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    dimsList: (f = jspb.Message.getRepeatedField(msg, 1)) == null ? undefined : f,
	    dataType: (f = jspb.Message.getField(msg, 2)) == null ? undefined : f,
	    segment: (f = msg.getSegment()) && proto.onnx.TensorProto.Segment.toObject(includeInstance, f),
	    floatDataList: (f = jspb.Message.getRepeatedFloatingPointField(msg, 4)) == null ? undefined : f,
	    int32DataList: (f = jspb.Message.getRepeatedField(msg, 5)) == null ? undefined : f,
	    stringDataList: msg.getStringDataList_asB64(),
	    int64DataList: (f = jspb.Message.getRepeatedField(msg, 7)) == null ? undefined : f,
	    name: (f = jspb.Message.getField(msg, 8)) == null ? undefined : f,
	    docString: (f = jspb.Message.getField(msg, 12)) == null ? undefined : f,
	    rawData: msg.getRawData_asB64(),
	    externalDataList: jspb.Message.toObjectList(msg.getExternalDataList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance),
	    dataLocation: (f = jspb.Message.getField(msg, 14)) == null ? undefined : f,
	    doubleDataList: (f = jspb.Message.getRepeatedFloatingPointField(msg, 10)) == null ? undefined : f,
	    uint64DataList: (f = jspb.Message.getRepeatedField(msg, 11)) == null ? undefined : f,
	    metadataPropsList: jspb.Message.toObjectList(msg.getMetadataPropsList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TensorProto}
	 */
	proto.onnx.TensorProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TensorProto;
	  return proto.onnx.TensorProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TensorProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TensorProto}
	 */
	proto.onnx.TensorProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedInt64() : [reader.readInt64()]);
	      for (var i = 0; i < values.length; i++) {
	        msg.addDims(values[i]);
	      }
	      break;
	    case 2:
	      var value = /** @type {number} */ (reader.readInt32());
	      msg.setDataType(value);
	      break;
	    case 3:
	      var value = new proto.onnx.TensorProto.Segment;
	      reader.readMessage(value,proto.onnx.TensorProto.Segment.deserializeBinaryFromReader);
	      msg.setSegment(value);
	      break;
	    case 4:
	      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedFloat() : [reader.readFloat()]);
	      for (var i = 0; i < values.length; i++) {
	        msg.addFloatData(values[i]);
	      }
	      break;
	    case 5:
	      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedInt32() : [reader.readInt32()]);
	      for (var i = 0; i < values.length; i++) {
	        msg.addInt32Data(values[i]);
	      }
	      break;
	    case 6:
	      var value = /** @type {!Uint8Array} */ (reader.readBytes());
	      msg.addStringData(value);
	      break;
	    case 7:
	      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedInt64() : [reader.readInt64()]);
	      for (var i = 0; i < values.length; i++) {
	        msg.addInt64Data(values[i]);
	      }
	      break;
	    case 8:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setName(value);
	      break;
	    case 12:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDocString(value);
	      break;
	    case 9:
	      var value = /** @type {!Uint8Array} */ (reader.readBytes());
	      msg.setRawData(value);
	      break;
	    case 13:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addExternalData(value);
	      break;
	    case 14:
	      var value = /** @type {!proto.onnx.TensorProto.DataLocation} */ (reader.readEnum());
	      msg.setDataLocation(value);
	      break;
	    case 10:
	      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedDouble() : [reader.readDouble()]);
	      for (var i = 0; i < values.length; i++) {
	        msg.addDoubleData(values[i]);
	      }
	      break;
	    case 11:
	      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedUint64() : [reader.readUint64()]);
	      for (var i = 0; i < values.length; i++) {
	        msg.addUint64Data(values[i]);
	      }
	      break;
	    case 16:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addMetadataProps(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TensorProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TensorProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TensorProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = message.getDimsList();
	  if (f.length > 0) {
	    writer.writeRepeatedInt64(
	      1,
	      f
	    );
	  }
	  f = /** @type {number} */ (jspb.Message.getField(message, 2));
	  if (f != null) {
	    writer.writeInt32(
	      2,
	      f
	    );
	  }
	  f = message.getSegment();
	  if (f != null) {
	    writer.writeMessage(
	      3,
	      f,
	      proto.onnx.TensorProto.Segment.serializeBinaryToWriter
	    );
	  }
	  f = message.getFloatDataList();
	  if (f.length > 0) {
	    writer.writePackedFloat(
	      4,
	      f
	    );
	  }
	  f = message.getInt32DataList();
	  if (f.length > 0) {
	    writer.writePackedInt32(
	      5,
	      f
	    );
	  }
	  f = message.getStringDataList_asU8();
	  if (f.length > 0) {
	    writer.writeRepeatedBytes(
	      6,
	      f
	    );
	  }
	  f = message.getInt64DataList();
	  if (f.length > 0) {
	    writer.writePackedInt64(
	      7,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 8));
	  if (f != null) {
	    writer.writeString(
	      8,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 12));
	  if (f != null) {
	    writer.writeString(
	      12,
	      f
	    );
	  }
	  f = /** @type {!(string|Uint8Array)} */ (jspb.Message.getField(message, 9));
	  if (f != null) {
	    writer.writeBytes(
	      9,
	      f
	    );
	  }
	  f = message.getExternalDataList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      13,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	  f = /** @type {!proto.onnx.TensorProto.DataLocation} */ (jspb.Message.getField(message, 14));
	  if (f != null) {
	    writer.writeEnum(
	      14,
	      f
	    );
	  }
	  f = message.getDoubleDataList();
	  if (f.length > 0) {
	    writer.writePackedDouble(
	      10,
	      f
	    );
	  }
	  f = message.getUint64DataList();
	  if (f.length > 0) {
	    writer.writePackedUint64(
	      11,
	      f
	    );
	  }
	  f = message.getMetadataPropsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      16,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * @enum {number}
	 */
	proto.onnx.TensorProto.DataType = {
	  UNDEFINED: 0,
	  FLOAT: 1,
	  UINT8: 2,
	  INT8: 3,
	  UINT16: 4,
	  INT16: 5,
	  INT32: 6,
	  INT64: 7,
	  STRING: 8,
	  BOOL: 9,
	  FLOAT16: 10,
	  DOUBLE: 11,
	  UINT32: 12,
	  UINT64: 13,
	  COMPLEX64: 14,
	  COMPLEX128: 15,
	  BFLOAT16: 16,
	  FLOAT8E4M3FN: 17,
	  FLOAT8E4M3FNUZ: 18,
	  FLOAT8E5M2: 19,
	  FLOAT8E5M2FNUZ: 20,
	  UINT4: 21,
	  INT4: 22
	};

	/**
	 * @enum {number}
	 */
	proto.onnx.TensorProto.DataLocation = {
	  DEFAULT: 0,
	  EXTERNAL: 1
	};




	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TensorProto.Segment.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TensorProto.Segment.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TensorProto.Segment} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorProto.Segment.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    begin: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    end: (f = jspb.Message.getField(msg, 2)) == null ? undefined : f
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TensorProto.Segment}
	 */
	proto.onnx.TensorProto.Segment.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TensorProto.Segment;
	  return proto.onnx.TensorProto.Segment.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TensorProto.Segment} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TensorProto.Segment}
	 */
	proto.onnx.TensorProto.Segment.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {number} */ (reader.readInt64());
	      msg.setBegin(value);
	      break;
	    case 2:
	      var value = /** @type {number} */ (reader.readInt64());
	      msg.setEnd(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TensorProto.Segment.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TensorProto.Segment.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TensorProto.Segment} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorProto.Segment.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {number} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeInt64(
	      1,
	      f
	    );
	  }
	  f = /** @type {number} */ (jspb.Message.getField(message, 2));
	  if (f != null) {
	    writer.writeInt64(
	      2,
	      f
	    );
	  }
	};


	/**
	 * optional int64 begin = 1;
	 * @return {number}
	 */
	proto.onnx.TensorProto.Segment.prototype.getBegin = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.TensorProto.Segment} returns this
	 */
	proto.onnx.TensorProto.Segment.prototype.setBegin = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorProto.Segment} returns this
	 */
	proto.onnx.TensorProto.Segment.prototype.clearBegin = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorProto.Segment.prototype.hasBegin = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional int64 end = 2;
	 * @return {number}
	 */
	proto.onnx.TensorProto.Segment.prototype.getEnd = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.TensorProto.Segment} returns this
	 */
	proto.onnx.TensorProto.Segment.prototype.setEnd = function(value) {
	  return jspb.Message.setField(this, 2, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorProto.Segment} returns this
	 */
	proto.onnx.TensorProto.Segment.prototype.clearEnd = function() {
	  return jspb.Message.setField(this, 2, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorProto.Segment.prototype.hasEnd = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * repeated int64 dims = 1;
	 * @return {!Array<number>}
	 */
	proto.onnx.TensorProto.prototype.getDimsList = function() {
	  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedField(this, 1));
	};


	/**
	 * @param {!Array<number>} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setDimsList = function(value) {
	  return jspb.Message.setField(this, 1, value || []);
	};


	/**
	 * @param {number} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.addDims = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 1, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearDimsList = function() {
	  return this.setDimsList([]);
	};


	/**
	 * optional int32 data_type = 2;
	 * @return {number}
	 */
	proto.onnx.TensorProto.prototype.getDataType = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setDataType = function(value) {
	  return jspb.Message.setField(this, 2, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearDataType = function() {
	  return jspb.Message.setField(this, 2, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorProto.prototype.hasDataType = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * optional Segment segment = 3;
	 * @return {?proto.onnx.TensorProto.Segment}
	 */
	proto.onnx.TensorProto.prototype.getSegment = function() {
	  return /** @type{?proto.onnx.TensorProto.Segment} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TensorProto.Segment, 3));
	};


	/**
	 * @param {?proto.onnx.TensorProto.Segment|undefined} value
	 * @return {!proto.onnx.TensorProto} returns this
	*/
	proto.onnx.TensorProto.prototype.setSegment = function(value) {
	  return jspb.Message.setWrapperField(this, 3, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearSegment = function() {
	  return this.setSegment(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorProto.prototype.hasSegment = function() {
	  return jspb.Message.getField(this, 3) != null;
	};


	/**
	 * repeated float float_data = 4;
	 * @return {!Array<number>}
	 */
	proto.onnx.TensorProto.prototype.getFloatDataList = function() {
	  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedFloatingPointField(this, 4));
	};


	/**
	 * @param {!Array<number>} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setFloatDataList = function(value) {
	  return jspb.Message.setField(this, 4, value || []);
	};


	/**
	 * @param {number} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.addFloatData = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 4, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearFloatDataList = function() {
	  return this.setFloatDataList([]);
	};


	/**
	 * repeated int32 int32_data = 5;
	 * @return {!Array<number>}
	 */
	proto.onnx.TensorProto.prototype.getInt32DataList = function() {
	  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedField(this, 5));
	};


	/**
	 * @param {!Array<number>} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setInt32DataList = function(value) {
	  return jspb.Message.setField(this, 5, value || []);
	};


	/**
	 * @param {number} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.addInt32Data = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 5, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearInt32DataList = function() {
	  return this.setInt32DataList([]);
	};


	/**
	 * repeated bytes string_data = 6;
	 * @return {!(Array<!Uint8Array>|Array<string>)}
	 */
	proto.onnx.TensorProto.prototype.getStringDataList = function() {
	  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 6));
	};


	/**
	 * repeated bytes string_data = 6;
	 * This is a type-conversion wrapper around `getStringDataList()`
	 * @return {!Array<string>}
	 */
	proto.onnx.TensorProto.prototype.getStringDataList_asB64 = function() {
	  return /** @type {!Array<string>} */ (jspb.Message.bytesListAsB64(
	      this.getStringDataList()));
	};


	/**
	 * repeated bytes string_data = 6;
	 * Note that Uint8Array is not supported on all browsers.
	 * @see http://caniuse.com/Uint8Array
	 * This is a type-conversion wrapper around `getStringDataList()`
	 * @return {!Array<!Uint8Array>}
	 */
	proto.onnx.TensorProto.prototype.getStringDataList_asU8 = function() {
	  return /** @type {!Array<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
	      this.getStringDataList()));
	};


	/**
	 * @param {!(Array<!Uint8Array>|Array<string>)} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setStringDataList = function(value) {
	  return jspb.Message.setField(this, 6, value || []);
	};


	/**
	 * @param {!(string|Uint8Array)} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.addStringData = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 6, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearStringDataList = function() {
	  return this.setStringDataList([]);
	};


	/**
	 * repeated int64 int64_data = 7;
	 * @return {!Array<number>}
	 */
	proto.onnx.TensorProto.prototype.getInt64DataList = function() {
	  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedField(this, 7));
	};


	/**
	 * @param {!Array<number>} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setInt64DataList = function(value) {
	  return jspb.Message.setField(this, 7, value || []);
	};


	/**
	 * @param {number} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.addInt64Data = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 7, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearInt64DataList = function() {
	  return this.setInt64DataList([]);
	};


	/**
	 * optional string name = 8;
	 * @return {string}
	 */
	proto.onnx.TensorProto.prototype.getName = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setName = function(value) {
	  return jspb.Message.setField(this, 8, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearName = function() {
	  return jspb.Message.setField(this, 8, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorProto.prototype.hasName = function() {
	  return jspb.Message.getField(this, 8) != null;
	};


	/**
	 * optional string doc_string = 12;
	 * @return {string}
	 */
	proto.onnx.TensorProto.prototype.getDocString = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setDocString = function(value) {
	  return jspb.Message.setField(this, 12, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearDocString = function() {
	  return jspb.Message.setField(this, 12, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorProto.prototype.hasDocString = function() {
	  return jspb.Message.getField(this, 12) != null;
	};


	/**
	 * optional bytes raw_data = 9;
	 * @return {!(string|Uint8Array)}
	 */
	proto.onnx.TensorProto.prototype.getRawData = function() {
	  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
	};


	/**
	 * optional bytes raw_data = 9;
	 * This is a type-conversion wrapper around `getRawData()`
	 * @return {string}
	 */
	proto.onnx.TensorProto.prototype.getRawData_asB64 = function() {
	  return /** @type {string} */ (jspb.Message.bytesAsB64(
	      this.getRawData()));
	};


	/**
	 * optional bytes raw_data = 9;
	 * Note that Uint8Array is not supported on all browsers.
	 * @see http://caniuse.com/Uint8Array
	 * This is a type-conversion wrapper around `getRawData()`
	 * @return {!Uint8Array}
	 */
	proto.onnx.TensorProto.prototype.getRawData_asU8 = function() {
	  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
	      this.getRawData()));
	};


	/**
	 * @param {!(string|Uint8Array)} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setRawData = function(value) {
	  return jspb.Message.setField(this, 9, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearRawData = function() {
	  return jspb.Message.setField(this, 9, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorProto.prototype.hasRawData = function() {
	  return jspb.Message.getField(this, 9) != null;
	};


	/**
	 * repeated StringStringEntryProto external_data = 13;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.TensorProto.prototype.getExternalDataList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 13));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.TensorProto} returns this
	*/
	proto.onnx.TensorProto.prototype.setExternalDataList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 13, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.TensorProto.prototype.addExternalData = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 13, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearExternalDataList = function() {
	  return this.setExternalDataList([]);
	};


	/**
	 * optional DataLocation data_location = 14;
	 * @return {!proto.onnx.TensorProto.DataLocation}
	 */
	proto.onnx.TensorProto.prototype.getDataLocation = function() {
	  return /** @type {!proto.onnx.TensorProto.DataLocation} */ (jspb.Message.getFieldWithDefault(this, 14, 0));
	};


	/**
	 * @param {!proto.onnx.TensorProto.DataLocation} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setDataLocation = function(value) {
	  return jspb.Message.setField(this, 14, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearDataLocation = function() {
	  return jspb.Message.setField(this, 14, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorProto.prototype.hasDataLocation = function() {
	  return jspb.Message.getField(this, 14) != null;
	};


	/**
	 * repeated double double_data = 10;
	 * @return {!Array<number>}
	 */
	proto.onnx.TensorProto.prototype.getDoubleDataList = function() {
	  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedFloatingPointField(this, 10));
	};


	/**
	 * @param {!Array<number>} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setDoubleDataList = function(value) {
	  return jspb.Message.setField(this, 10, value || []);
	};


	/**
	 * @param {number} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.addDoubleData = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 10, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearDoubleDataList = function() {
	  return this.setDoubleDataList([]);
	};


	/**
	 * repeated uint64 uint64_data = 11;
	 * @return {!Array<number>}
	 */
	proto.onnx.TensorProto.prototype.getUint64DataList = function() {
	  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedField(this, 11));
	};


	/**
	 * @param {!Array<number>} value
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.setUint64DataList = function(value) {
	  return jspb.Message.setField(this, 11, value || []);
	};


	/**
	 * @param {number} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.addUint64Data = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 11, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearUint64DataList = function() {
	  return this.setUint64DataList([]);
	};


	/**
	 * repeated StringStringEntryProto metadata_props = 16;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.TensorProto.prototype.getMetadataPropsList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 16));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.TensorProto} returns this
	*/
	proto.onnx.TensorProto.prototype.setMetadataPropsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 16, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.TensorProto.prototype.addMetadataProps = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 16, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorProto} returns this
	 */
	proto.onnx.TensorProto.prototype.clearMetadataPropsList = function() {
	  return this.setMetadataPropsList([]);
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.SparseTensorProto.repeatedFields_ = [3];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.SparseTensorProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.SparseTensorProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.SparseTensorProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.SparseTensorProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    values: (f = msg.getValues()) && proto.onnx.TensorProto.toObject(includeInstance, f),
	    indices: (f = msg.getIndices()) && proto.onnx.TensorProto.toObject(includeInstance, f),
	    dimsList: (f = jspb.Message.getRepeatedField(msg, 3)) == null ? undefined : f
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.SparseTensorProto}
	 */
	proto.onnx.SparseTensorProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.SparseTensorProto;
	  return proto.onnx.SparseTensorProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.SparseTensorProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.SparseTensorProto}
	 */
	proto.onnx.SparseTensorProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = new proto.onnx.TensorProto;
	      reader.readMessage(value,proto.onnx.TensorProto.deserializeBinaryFromReader);
	      msg.setValues(value);
	      break;
	    case 2:
	      var value = new proto.onnx.TensorProto;
	      reader.readMessage(value,proto.onnx.TensorProto.deserializeBinaryFromReader);
	      msg.setIndices(value);
	      break;
	    case 3:
	      var values = /** @type {!Array<number>} */ (reader.isDelimited() ? reader.readPackedInt64() : [reader.readInt64()]);
	      for (var i = 0; i < values.length; i++) {
	        msg.addDims(values[i]);
	      }
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.SparseTensorProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.SparseTensorProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.SparseTensorProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.SparseTensorProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = message.getValues();
	  if (f != null) {
	    writer.writeMessage(
	      1,
	      f,
	      proto.onnx.TensorProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getIndices();
	  if (f != null) {
	    writer.writeMessage(
	      2,
	      f,
	      proto.onnx.TensorProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getDimsList();
	  if (f.length > 0) {
	    writer.writeRepeatedInt64(
	      3,
	      f
	    );
	  }
	};


	/**
	 * optional TensorProto values = 1;
	 * @return {?proto.onnx.TensorProto}
	 */
	proto.onnx.SparseTensorProto.prototype.getValues = function() {
	  return /** @type{?proto.onnx.TensorProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TensorProto, 1));
	};


	/**
	 * @param {?proto.onnx.TensorProto|undefined} value
	 * @return {!proto.onnx.SparseTensorProto} returns this
	*/
	proto.onnx.SparseTensorProto.prototype.setValues = function(value) {
	  return jspb.Message.setWrapperField(this, 1, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.SparseTensorProto} returns this
	 */
	proto.onnx.SparseTensorProto.prototype.clearValues = function() {
	  return this.setValues(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.SparseTensorProto.prototype.hasValues = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional TensorProto indices = 2;
	 * @return {?proto.onnx.TensorProto}
	 */
	proto.onnx.SparseTensorProto.prototype.getIndices = function() {
	  return /** @type{?proto.onnx.TensorProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TensorProto, 2));
	};


	/**
	 * @param {?proto.onnx.TensorProto|undefined} value
	 * @return {!proto.onnx.SparseTensorProto} returns this
	*/
	proto.onnx.SparseTensorProto.prototype.setIndices = function(value) {
	  return jspb.Message.setWrapperField(this, 2, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.SparseTensorProto} returns this
	 */
	proto.onnx.SparseTensorProto.prototype.clearIndices = function() {
	  return this.setIndices(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.SparseTensorProto.prototype.hasIndices = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * repeated int64 dims = 3;
	 * @return {!Array<number>}
	 */
	proto.onnx.SparseTensorProto.prototype.getDimsList = function() {
	  return /** @type {!Array<number>} */ (jspb.Message.getRepeatedField(this, 3));
	};


	/**
	 * @param {!Array<number>} value
	 * @return {!proto.onnx.SparseTensorProto} returns this
	 */
	proto.onnx.SparseTensorProto.prototype.setDimsList = function(value) {
	  return jspb.Message.setField(this, 3, value || []);
	};


	/**
	 * @param {number} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.SparseTensorProto} returns this
	 */
	proto.onnx.SparseTensorProto.prototype.addDims = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 3, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.SparseTensorProto} returns this
	 */
	proto.onnx.SparseTensorProto.prototype.clearDimsList = function() {
	  return this.setDimsList([]);
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.TensorShapeProto.repeatedFields_ = [1];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TensorShapeProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TensorShapeProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TensorShapeProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorShapeProto.toObject = function(includeInstance, msg) {
	  var obj = {
	    dimList: jspb.Message.toObjectList(msg.getDimList(),
	    proto.onnx.TensorShapeProto.Dimension.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TensorShapeProto}
	 */
	proto.onnx.TensorShapeProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TensorShapeProto;
	  return proto.onnx.TensorShapeProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TensorShapeProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TensorShapeProto}
	 */
	proto.onnx.TensorShapeProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = new proto.onnx.TensorShapeProto.Dimension;
	      reader.readMessage(value,proto.onnx.TensorShapeProto.Dimension.deserializeBinaryFromReader);
	      msg.addDim(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TensorShapeProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TensorShapeProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TensorShapeProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorShapeProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = message.getDimList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      1,
	      f,
	      proto.onnx.TensorShapeProto.Dimension.serializeBinaryToWriter
	    );
	  }
	};



	/**
	 * Oneof group definitions for this message. Each group defines the field
	 * numbers belonging to that group. When of these fields' value is set, all
	 * other fields in the group are cleared. During deserialization, if multiple
	 * fields are encountered for a group, only the last value seen will be kept.
	 * @private {!Array<!Array<number>>}
	 * @const
	 */
	proto.onnx.TensorShapeProto.Dimension.oneofGroups_ = [[1,2]];

	/**
	 * @enum {number}
	 */
	proto.onnx.TensorShapeProto.Dimension.ValueCase = {
	  VALUE_NOT_SET: 0,
	  DIM_VALUE: 1,
	  DIM_PARAM: 2
	};

	/**
	 * @return {proto.onnx.TensorShapeProto.Dimension.ValueCase}
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.getValueCase = function() {
	  return /** @type {proto.onnx.TensorShapeProto.Dimension.ValueCase} */(jspb.Message.computeOneofCase(this, proto.onnx.TensorShapeProto.Dimension.oneofGroups_[0]));
	};



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TensorShapeProto.Dimension.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TensorShapeProto.Dimension} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorShapeProto.Dimension.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    dimValue: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    dimParam: (f = jspb.Message.getField(msg, 2)) == null ? undefined : f,
	    denotation: (f = jspb.Message.getField(msg, 3)) == null ? undefined : f
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TensorShapeProto.Dimension}
	 */
	proto.onnx.TensorShapeProto.Dimension.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TensorShapeProto.Dimension;
	  return proto.onnx.TensorShapeProto.Dimension.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TensorShapeProto.Dimension} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TensorShapeProto.Dimension}
	 */
	proto.onnx.TensorShapeProto.Dimension.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {number} */ (reader.readInt64());
	      msg.setDimValue(value);
	      break;
	    case 2:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDimParam(value);
	      break;
	    case 3:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDenotation(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TensorShapeProto.Dimension.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TensorShapeProto.Dimension} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TensorShapeProto.Dimension.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {number} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeInt64(
	      1,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 2));
	  if (f != null) {
	    writer.writeString(
	      2,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 3));
	  if (f != null) {
	    writer.writeString(
	      3,
	      f
	    );
	  }
	};


	/**
	 * optional int64 dim_value = 1;
	 * @return {number}
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.getDimValue = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.TensorShapeProto.Dimension} returns this
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.setDimValue = function(value) {
	  return jspb.Message.setOneofField(this, 1, proto.onnx.TensorShapeProto.Dimension.oneofGroups_[0], value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorShapeProto.Dimension} returns this
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.clearDimValue = function() {
	  return jspb.Message.setOneofField(this, 1, proto.onnx.TensorShapeProto.Dimension.oneofGroups_[0], undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.hasDimValue = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional string dim_param = 2;
	 * @return {string}
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.getDimParam = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.TensorShapeProto.Dimension} returns this
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.setDimParam = function(value) {
	  return jspb.Message.setOneofField(this, 2, proto.onnx.TensorShapeProto.Dimension.oneofGroups_[0], value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorShapeProto.Dimension} returns this
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.clearDimParam = function() {
	  return jspb.Message.setOneofField(this, 2, proto.onnx.TensorShapeProto.Dimension.oneofGroups_[0], undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.hasDimParam = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * optional string denotation = 3;
	 * @return {string}
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.getDenotation = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.TensorShapeProto.Dimension} returns this
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.setDenotation = function(value) {
	  return jspb.Message.setField(this, 3, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TensorShapeProto.Dimension} returns this
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.clearDenotation = function() {
	  return jspb.Message.setField(this, 3, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TensorShapeProto.Dimension.prototype.hasDenotation = function() {
	  return jspb.Message.getField(this, 3) != null;
	};


	/**
	 * repeated Dimension dim = 1;
	 * @return {!Array<!proto.onnx.TensorShapeProto.Dimension>}
	 */
	proto.onnx.TensorShapeProto.prototype.getDimList = function() {
	  return /** @type{!Array<!proto.onnx.TensorShapeProto.Dimension>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.TensorShapeProto.Dimension, 1));
	};


	/**
	 * @param {!Array<!proto.onnx.TensorShapeProto.Dimension>} value
	 * @return {!proto.onnx.TensorShapeProto} returns this
	*/
	proto.onnx.TensorShapeProto.prototype.setDimList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 1, value);
	};


	/**
	 * @param {!proto.onnx.TensorShapeProto.Dimension=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.TensorShapeProto.Dimension}
	 */
	proto.onnx.TensorShapeProto.prototype.addDim = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 1, opt_value, proto.onnx.TensorShapeProto.Dimension, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.TensorShapeProto} returns this
	 */
	proto.onnx.TensorShapeProto.prototype.clearDimList = function() {
	  return this.setDimList([]);
	};



	/**
	 * Oneof group definitions for this message. Each group defines the field
	 * numbers belonging to that group. When of these fields' value is set, all
	 * other fields in the group are cleared. During deserialization, if multiple
	 * fields are encountered for a group, only the last value seen will be kept.
	 * @private {!Array<!Array<number>>}
	 * @const
	 */
	proto.onnx.TypeProto.oneofGroups_ = [[1,4,5,9,8]];

	/**
	 * @enum {number}
	 */
	proto.onnx.TypeProto.ValueCase = {
	  VALUE_NOT_SET: 0,
	  TENSOR_TYPE: 1,
	  SEQUENCE_TYPE: 4,
	  MAP_TYPE: 5,
	  OPTIONAL_TYPE: 9,
	  SPARSE_TENSOR_TYPE: 8
	};

	/**
	 * @return {proto.onnx.TypeProto.ValueCase}
	 */
	proto.onnx.TypeProto.prototype.getValueCase = function() {
	  return /** @type {proto.onnx.TypeProto.ValueCase} */(jspb.Message.computeOneofCase(this, proto.onnx.TypeProto.oneofGroups_[0]));
	};



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TypeProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TypeProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TypeProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    tensorType: (f = msg.getTensorType()) && proto.onnx.TypeProto.Tensor.toObject(includeInstance, f),
	    sequenceType: (f = msg.getSequenceType()) && proto.onnx.TypeProto.Sequence.toObject(includeInstance, f),
	    mapType: (f = msg.getMapType()) && proto.onnx.TypeProto.Map.toObject(includeInstance, f),
	    optionalType: (f = msg.getOptionalType()) && proto.onnx.TypeProto.Optional.toObject(includeInstance, f),
	    sparseTensorType: (f = msg.getSparseTensorType()) && proto.onnx.TypeProto.SparseTensor.toObject(includeInstance, f),
	    denotation: (f = jspb.Message.getField(msg, 6)) == null ? undefined : f
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TypeProto}
	 */
	proto.onnx.TypeProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TypeProto;
	  return proto.onnx.TypeProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TypeProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TypeProto}
	 */
	proto.onnx.TypeProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = new proto.onnx.TypeProto.Tensor;
	      reader.readMessage(value,proto.onnx.TypeProto.Tensor.deserializeBinaryFromReader);
	      msg.setTensorType(value);
	      break;
	    case 4:
	      var value = new proto.onnx.TypeProto.Sequence;
	      reader.readMessage(value,proto.onnx.TypeProto.Sequence.deserializeBinaryFromReader);
	      msg.setSequenceType(value);
	      break;
	    case 5:
	      var value = new proto.onnx.TypeProto.Map;
	      reader.readMessage(value,proto.onnx.TypeProto.Map.deserializeBinaryFromReader);
	      msg.setMapType(value);
	      break;
	    case 9:
	      var value = new proto.onnx.TypeProto.Optional;
	      reader.readMessage(value,proto.onnx.TypeProto.Optional.deserializeBinaryFromReader);
	      msg.setOptionalType(value);
	      break;
	    case 8:
	      var value = new proto.onnx.TypeProto.SparseTensor;
	      reader.readMessage(value,proto.onnx.TypeProto.SparseTensor.deserializeBinaryFromReader);
	      msg.setSparseTensorType(value);
	      break;
	    case 6:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDenotation(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TypeProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TypeProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TypeProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = message.getTensorType();
	  if (f != null) {
	    writer.writeMessage(
	      1,
	      f,
	      proto.onnx.TypeProto.Tensor.serializeBinaryToWriter
	    );
	  }
	  f = message.getSequenceType();
	  if (f != null) {
	    writer.writeMessage(
	      4,
	      f,
	      proto.onnx.TypeProto.Sequence.serializeBinaryToWriter
	    );
	  }
	  f = message.getMapType();
	  if (f != null) {
	    writer.writeMessage(
	      5,
	      f,
	      proto.onnx.TypeProto.Map.serializeBinaryToWriter
	    );
	  }
	  f = message.getOptionalType();
	  if (f != null) {
	    writer.writeMessage(
	      9,
	      f,
	      proto.onnx.TypeProto.Optional.serializeBinaryToWriter
	    );
	  }
	  f = message.getSparseTensorType();
	  if (f != null) {
	    writer.writeMessage(
	      8,
	      f,
	      proto.onnx.TypeProto.SparseTensor.serializeBinaryToWriter
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 6));
	  if (f != null) {
	    writer.writeString(
	      6,
	      f
	    );
	  }
	};





	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TypeProto.Tensor.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TypeProto.Tensor.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TypeProto.Tensor} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.Tensor.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    elemType: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    shape: (f = msg.getShape()) && proto.onnx.TensorShapeProto.toObject(includeInstance, f)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TypeProto.Tensor}
	 */
	proto.onnx.TypeProto.Tensor.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TypeProto.Tensor;
	  return proto.onnx.TypeProto.Tensor.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TypeProto.Tensor} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TypeProto.Tensor}
	 */
	proto.onnx.TypeProto.Tensor.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {number} */ (reader.readInt32());
	      msg.setElemType(value);
	      break;
	    case 2:
	      var value = new proto.onnx.TensorShapeProto;
	      reader.readMessage(value,proto.onnx.TensorShapeProto.deserializeBinaryFromReader);
	      msg.setShape(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TypeProto.Tensor.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TypeProto.Tensor.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TypeProto.Tensor} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.Tensor.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {number} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeInt32(
	      1,
	      f
	    );
	  }
	  f = message.getShape();
	  if (f != null) {
	    writer.writeMessage(
	      2,
	      f,
	      proto.onnx.TensorShapeProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional int32 elem_type = 1;
	 * @return {number}
	 */
	proto.onnx.TypeProto.Tensor.prototype.getElemType = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.TypeProto.Tensor} returns this
	 */
	proto.onnx.TypeProto.Tensor.prototype.setElemType = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TypeProto.Tensor} returns this
	 */
	proto.onnx.TypeProto.Tensor.prototype.clearElemType = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.Tensor.prototype.hasElemType = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional TensorShapeProto shape = 2;
	 * @return {?proto.onnx.TensorShapeProto}
	 */
	proto.onnx.TypeProto.Tensor.prototype.getShape = function() {
	  return /** @type{?proto.onnx.TensorShapeProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TensorShapeProto, 2));
	};


	/**
	 * @param {?proto.onnx.TensorShapeProto|undefined} value
	 * @return {!proto.onnx.TypeProto.Tensor} returns this
	*/
	proto.onnx.TypeProto.Tensor.prototype.setShape = function(value) {
	  return jspb.Message.setWrapperField(this, 2, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto.Tensor} returns this
	 */
	proto.onnx.TypeProto.Tensor.prototype.clearShape = function() {
	  return this.setShape(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.Tensor.prototype.hasShape = function() {
	  return jspb.Message.getField(this, 2) != null;
	};





	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TypeProto.Sequence.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TypeProto.Sequence.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TypeProto.Sequence} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.Sequence.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    elemType: (f = msg.getElemType()) && proto.onnx.TypeProto.toObject(includeInstance, f)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TypeProto.Sequence}
	 */
	proto.onnx.TypeProto.Sequence.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TypeProto.Sequence;
	  return proto.onnx.TypeProto.Sequence.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TypeProto.Sequence} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TypeProto.Sequence}
	 */
	proto.onnx.TypeProto.Sequence.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = new proto.onnx.TypeProto;
	      reader.readMessage(value,proto.onnx.TypeProto.deserializeBinaryFromReader);
	      msg.setElemType(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TypeProto.Sequence.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TypeProto.Sequence.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TypeProto.Sequence} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.Sequence.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = message.getElemType();
	  if (f != null) {
	    writer.writeMessage(
	      1,
	      f,
	      proto.onnx.TypeProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional TypeProto elem_type = 1;
	 * @return {?proto.onnx.TypeProto}
	 */
	proto.onnx.TypeProto.Sequence.prototype.getElemType = function() {
	  return /** @type{?proto.onnx.TypeProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto, 1));
	};


	/**
	 * @param {?proto.onnx.TypeProto|undefined} value
	 * @return {!proto.onnx.TypeProto.Sequence} returns this
	*/
	proto.onnx.TypeProto.Sequence.prototype.setElemType = function(value) {
	  return jspb.Message.setWrapperField(this, 1, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto.Sequence} returns this
	 */
	proto.onnx.TypeProto.Sequence.prototype.clearElemType = function() {
	  return this.setElemType(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.Sequence.prototype.hasElemType = function() {
	  return jspb.Message.getField(this, 1) != null;
	};





	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TypeProto.Map.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TypeProto.Map.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TypeProto.Map} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.Map.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    keyType: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    valueType: (f = msg.getValueType()) && proto.onnx.TypeProto.toObject(includeInstance, f)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TypeProto.Map}
	 */
	proto.onnx.TypeProto.Map.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TypeProto.Map;
	  return proto.onnx.TypeProto.Map.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TypeProto.Map} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TypeProto.Map}
	 */
	proto.onnx.TypeProto.Map.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {number} */ (reader.readInt32());
	      msg.setKeyType(value);
	      break;
	    case 2:
	      var value = new proto.onnx.TypeProto;
	      reader.readMessage(value,proto.onnx.TypeProto.deserializeBinaryFromReader);
	      msg.setValueType(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TypeProto.Map.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TypeProto.Map.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TypeProto.Map} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.Map.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {number} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeInt32(
	      1,
	      f
	    );
	  }
	  f = message.getValueType();
	  if (f != null) {
	    writer.writeMessage(
	      2,
	      f,
	      proto.onnx.TypeProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional int32 key_type = 1;
	 * @return {number}
	 */
	proto.onnx.TypeProto.Map.prototype.getKeyType = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.TypeProto.Map} returns this
	 */
	proto.onnx.TypeProto.Map.prototype.setKeyType = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TypeProto.Map} returns this
	 */
	proto.onnx.TypeProto.Map.prototype.clearKeyType = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.Map.prototype.hasKeyType = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional TypeProto value_type = 2;
	 * @return {?proto.onnx.TypeProto}
	 */
	proto.onnx.TypeProto.Map.prototype.getValueType = function() {
	  return /** @type{?proto.onnx.TypeProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto, 2));
	};


	/**
	 * @param {?proto.onnx.TypeProto|undefined} value
	 * @return {!proto.onnx.TypeProto.Map} returns this
	*/
	proto.onnx.TypeProto.Map.prototype.setValueType = function(value) {
	  return jspb.Message.setWrapperField(this, 2, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto.Map} returns this
	 */
	proto.onnx.TypeProto.Map.prototype.clearValueType = function() {
	  return this.setValueType(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.Map.prototype.hasValueType = function() {
	  return jspb.Message.getField(this, 2) != null;
	};





	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TypeProto.Optional.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TypeProto.Optional.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TypeProto.Optional} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.Optional.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    elemType: (f = msg.getElemType()) && proto.onnx.TypeProto.toObject(includeInstance, f)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TypeProto.Optional}
	 */
	proto.onnx.TypeProto.Optional.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TypeProto.Optional;
	  return proto.onnx.TypeProto.Optional.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TypeProto.Optional} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TypeProto.Optional}
	 */
	proto.onnx.TypeProto.Optional.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = new proto.onnx.TypeProto;
	      reader.readMessage(value,proto.onnx.TypeProto.deserializeBinaryFromReader);
	      msg.setElemType(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TypeProto.Optional.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TypeProto.Optional.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TypeProto.Optional} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.Optional.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = message.getElemType();
	  if (f != null) {
	    writer.writeMessage(
	      1,
	      f,
	      proto.onnx.TypeProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional TypeProto elem_type = 1;
	 * @return {?proto.onnx.TypeProto}
	 */
	proto.onnx.TypeProto.Optional.prototype.getElemType = function() {
	  return /** @type{?proto.onnx.TypeProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto, 1));
	};


	/**
	 * @param {?proto.onnx.TypeProto|undefined} value
	 * @return {!proto.onnx.TypeProto.Optional} returns this
	*/
	proto.onnx.TypeProto.Optional.prototype.setElemType = function(value) {
	  return jspb.Message.setWrapperField(this, 1, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto.Optional} returns this
	 */
	proto.onnx.TypeProto.Optional.prototype.clearElemType = function() {
	  return this.setElemType(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.Optional.prototype.hasElemType = function() {
	  return jspb.Message.getField(this, 1) != null;
	};





	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.TypeProto.SparseTensor.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.TypeProto.SparseTensor.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.TypeProto.SparseTensor} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.SparseTensor.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    elemType: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    shape: (f = msg.getShape()) && proto.onnx.TensorShapeProto.toObject(includeInstance, f)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.TypeProto.SparseTensor}
	 */
	proto.onnx.TypeProto.SparseTensor.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.TypeProto.SparseTensor;
	  return proto.onnx.TypeProto.SparseTensor.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.TypeProto.SparseTensor} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.TypeProto.SparseTensor}
	 */
	proto.onnx.TypeProto.SparseTensor.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {number} */ (reader.readInt32());
	      msg.setElemType(value);
	      break;
	    case 2:
	      var value = new proto.onnx.TensorShapeProto;
	      reader.readMessage(value,proto.onnx.TensorShapeProto.deserializeBinaryFromReader);
	      msg.setShape(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.TypeProto.SparseTensor.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.TypeProto.SparseTensor.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.TypeProto.SparseTensor} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.TypeProto.SparseTensor.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {number} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeInt32(
	      1,
	      f
	    );
	  }
	  f = message.getShape();
	  if (f != null) {
	    writer.writeMessage(
	      2,
	      f,
	      proto.onnx.TensorShapeProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional int32 elem_type = 1;
	 * @return {number}
	 */
	proto.onnx.TypeProto.SparseTensor.prototype.getElemType = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.TypeProto.SparseTensor} returns this
	 */
	proto.onnx.TypeProto.SparseTensor.prototype.setElemType = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TypeProto.SparseTensor} returns this
	 */
	proto.onnx.TypeProto.SparseTensor.prototype.clearElemType = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.SparseTensor.prototype.hasElemType = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional TensorShapeProto shape = 2;
	 * @return {?proto.onnx.TensorShapeProto}
	 */
	proto.onnx.TypeProto.SparseTensor.prototype.getShape = function() {
	  return /** @type{?proto.onnx.TensorShapeProto} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TensorShapeProto, 2));
	};


	/**
	 * @param {?proto.onnx.TensorShapeProto|undefined} value
	 * @return {!proto.onnx.TypeProto.SparseTensor} returns this
	*/
	proto.onnx.TypeProto.SparseTensor.prototype.setShape = function(value) {
	  return jspb.Message.setWrapperField(this, 2, value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto.SparseTensor} returns this
	 */
	proto.onnx.TypeProto.SparseTensor.prototype.clearShape = function() {
	  return this.setShape(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.SparseTensor.prototype.hasShape = function() {
	  return jspb.Message.getField(this, 2) != null;
	};


	/**
	 * optional Tensor tensor_type = 1;
	 * @return {?proto.onnx.TypeProto.Tensor}
	 */
	proto.onnx.TypeProto.prototype.getTensorType = function() {
	  return /** @type{?proto.onnx.TypeProto.Tensor} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto.Tensor, 1));
	};


	/**
	 * @param {?proto.onnx.TypeProto.Tensor|undefined} value
	 * @return {!proto.onnx.TypeProto} returns this
	*/
	proto.onnx.TypeProto.prototype.setTensorType = function(value) {
	  return jspb.Message.setOneofWrapperField(this, 1, proto.onnx.TypeProto.oneofGroups_[0], value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto} returns this
	 */
	proto.onnx.TypeProto.prototype.clearTensorType = function() {
	  return this.setTensorType(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.prototype.hasTensorType = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional Sequence sequence_type = 4;
	 * @return {?proto.onnx.TypeProto.Sequence}
	 */
	proto.onnx.TypeProto.prototype.getSequenceType = function() {
	  return /** @type{?proto.onnx.TypeProto.Sequence} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto.Sequence, 4));
	};


	/**
	 * @param {?proto.onnx.TypeProto.Sequence|undefined} value
	 * @return {!proto.onnx.TypeProto} returns this
	*/
	proto.onnx.TypeProto.prototype.setSequenceType = function(value) {
	  return jspb.Message.setOneofWrapperField(this, 4, proto.onnx.TypeProto.oneofGroups_[0], value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto} returns this
	 */
	proto.onnx.TypeProto.prototype.clearSequenceType = function() {
	  return this.setSequenceType(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.prototype.hasSequenceType = function() {
	  return jspb.Message.getField(this, 4) != null;
	};


	/**
	 * optional Map map_type = 5;
	 * @return {?proto.onnx.TypeProto.Map}
	 */
	proto.onnx.TypeProto.prototype.getMapType = function() {
	  return /** @type{?proto.onnx.TypeProto.Map} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto.Map, 5));
	};


	/**
	 * @param {?proto.onnx.TypeProto.Map|undefined} value
	 * @return {!proto.onnx.TypeProto} returns this
	*/
	proto.onnx.TypeProto.prototype.setMapType = function(value) {
	  return jspb.Message.setOneofWrapperField(this, 5, proto.onnx.TypeProto.oneofGroups_[0], value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto} returns this
	 */
	proto.onnx.TypeProto.prototype.clearMapType = function() {
	  return this.setMapType(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.prototype.hasMapType = function() {
	  return jspb.Message.getField(this, 5) != null;
	};


	/**
	 * optional Optional optional_type = 9;
	 * @return {?proto.onnx.TypeProto.Optional}
	 */
	proto.onnx.TypeProto.prototype.getOptionalType = function() {
	  return /** @type{?proto.onnx.TypeProto.Optional} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto.Optional, 9));
	};


	/**
	 * @param {?proto.onnx.TypeProto.Optional|undefined} value
	 * @return {!proto.onnx.TypeProto} returns this
	*/
	proto.onnx.TypeProto.prototype.setOptionalType = function(value) {
	  return jspb.Message.setOneofWrapperField(this, 9, proto.onnx.TypeProto.oneofGroups_[0], value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto} returns this
	 */
	proto.onnx.TypeProto.prototype.clearOptionalType = function() {
	  return this.setOptionalType(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.prototype.hasOptionalType = function() {
	  return jspb.Message.getField(this, 9) != null;
	};


	/**
	 * optional SparseTensor sparse_tensor_type = 8;
	 * @return {?proto.onnx.TypeProto.SparseTensor}
	 */
	proto.onnx.TypeProto.prototype.getSparseTensorType = function() {
	  return /** @type{?proto.onnx.TypeProto.SparseTensor} */ (
	    jspb.Message.getWrapperField(this, proto.onnx.TypeProto.SparseTensor, 8));
	};


	/**
	 * @param {?proto.onnx.TypeProto.SparseTensor|undefined} value
	 * @return {!proto.onnx.TypeProto} returns this
	*/
	proto.onnx.TypeProto.prototype.setSparseTensorType = function(value) {
	  return jspb.Message.setOneofWrapperField(this, 8, proto.onnx.TypeProto.oneofGroups_[0], value);
	};


	/**
	 * Clears the message field making it undefined.
	 * @return {!proto.onnx.TypeProto} returns this
	 */
	proto.onnx.TypeProto.prototype.clearSparseTensorType = function() {
	  return this.setSparseTensorType(undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.prototype.hasSparseTensorType = function() {
	  return jspb.Message.getField(this, 8) != null;
	};


	/**
	 * optional string denotation = 6;
	 * @return {string}
	 */
	proto.onnx.TypeProto.prototype.getDenotation = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.TypeProto} returns this
	 */
	proto.onnx.TypeProto.prototype.setDenotation = function(value) {
	  return jspb.Message.setField(this, 6, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.TypeProto} returns this
	 */
	proto.onnx.TypeProto.prototype.clearDenotation = function() {
	  return jspb.Message.setField(this, 6, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.TypeProto.prototype.hasDenotation = function() {
	  return jspb.Message.getField(this, 6) != null;
	};





	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.OperatorSetIdProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.OperatorSetIdProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.OperatorSetIdProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.OperatorSetIdProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    domain: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    version: (f = jspb.Message.getField(msg, 2)) == null ? undefined : f
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.OperatorSetIdProto}
	 */
	proto.onnx.OperatorSetIdProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.OperatorSetIdProto;
	  return proto.onnx.OperatorSetIdProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.OperatorSetIdProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.OperatorSetIdProto}
	 */
	proto.onnx.OperatorSetIdProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDomain(value);
	      break;
	    case 2:
	      var value = /** @type {number} */ (reader.readInt64());
	      msg.setVersion(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.OperatorSetIdProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.OperatorSetIdProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.OperatorSetIdProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.OperatorSetIdProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {string} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeString(
	      1,
	      f
	    );
	  }
	  f = /** @type {number} */ (jspb.Message.getField(message, 2));
	  if (f != null) {
	    writer.writeInt64(
	      2,
	      f
	    );
	  }
	};


	/**
	 * optional string domain = 1;
	 * @return {string}
	 */
	proto.onnx.OperatorSetIdProto.prototype.getDomain = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.OperatorSetIdProto} returns this
	 */
	proto.onnx.OperatorSetIdProto.prototype.setDomain = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.OperatorSetIdProto} returns this
	 */
	proto.onnx.OperatorSetIdProto.prototype.clearDomain = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.OperatorSetIdProto.prototype.hasDomain = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * optional int64 version = 2;
	 * @return {number}
	 */
	proto.onnx.OperatorSetIdProto.prototype.getVersion = function() {
	  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
	};


	/**
	 * @param {number} value
	 * @return {!proto.onnx.OperatorSetIdProto} returns this
	 */
	proto.onnx.OperatorSetIdProto.prototype.setVersion = function(value) {
	  return jspb.Message.setField(this, 2, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.OperatorSetIdProto} returns this
	 */
	proto.onnx.OperatorSetIdProto.prototype.clearVersion = function() {
	  return jspb.Message.setField(this, 2, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.OperatorSetIdProto.prototype.hasVersion = function() {
	  return jspb.Message.getField(this, 2) != null;
	};



	/**
	 * List of repeated fields within this message type.
	 * @private {!Array<number>}
	 * @const
	 */
	proto.onnx.FunctionProto.repeatedFields_ = [4,5,6,11,7,9,12,14];



	if (jspb.Message.GENERATE_TO_OBJECT) {
	/**
	 * Creates an object representation of this proto.
	 * Field names that are reserved in JavaScript and will be renamed to pb_name.
	 * Optional fields that are not set will be set to undefined.
	 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
	 * For the list of reserved names please see:
	 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
	 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
	 *     JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @return {!Object}
	 */
	proto.onnx.FunctionProto.prototype.toObject = function(opt_includeInstance) {
	  return proto.onnx.FunctionProto.toObject(opt_includeInstance, this);
	};


	/**
	 * Static version of the {@see toObject} method.
	 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
	 *     the JSPB instance for transitional soy proto support:
	 *     http://goto/soy-param-migration
	 * @param {!proto.onnx.FunctionProto} msg The msg instance to transform.
	 * @return {!Object}
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.FunctionProto.toObject = function(includeInstance, msg) {
	  var f, obj = {
	    name: (f = jspb.Message.getField(msg, 1)) == null ? undefined : f,
	    inputList: (f = jspb.Message.getRepeatedField(msg, 4)) == null ? undefined : f,
	    outputList: (f = jspb.Message.getRepeatedField(msg, 5)) == null ? undefined : f,
	    attributeList: (f = jspb.Message.getRepeatedField(msg, 6)) == null ? undefined : f,
	    attributeProtoList: jspb.Message.toObjectList(msg.getAttributeProtoList(),
	    proto.onnx.AttributeProto.toObject, includeInstance),
	    nodeList: jspb.Message.toObjectList(msg.getNodeList(),
	    proto.onnx.NodeProto.toObject, includeInstance),
	    docString: (f = jspb.Message.getField(msg, 8)) == null ? undefined : f,
	    opsetImportList: jspb.Message.toObjectList(msg.getOpsetImportList(),
	    proto.onnx.OperatorSetIdProto.toObject, includeInstance),
	    domain: (f = jspb.Message.getField(msg, 10)) == null ? undefined : f,
	    overload: (f = jspb.Message.getField(msg, 13)) == null ? undefined : f,
	    valueInfoList: jspb.Message.toObjectList(msg.getValueInfoList(),
	    proto.onnx.ValueInfoProto.toObject, includeInstance),
	    metadataPropsList: jspb.Message.toObjectList(msg.getMetadataPropsList(),
	    proto.onnx.StringStringEntryProto.toObject, includeInstance)
	  };

	  if (includeInstance) {
	    obj.$jspbMessageInstance = msg;
	  }
	  return obj;
	};
	}


	/**
	 * Deserializes binary data (in protobuf wire format).
	 * @param {jspb.ByteSource} bytes The bytes to deserialize.
	 * @return {!proto.onnx.FunctionProto}
	 */
	proto.onnx.FunctionProto.deserializeBinary = function(bytes) {
	  var reader = new jspb.BinaryReader(bytes);
	  var msg = new proto.onnx.FunctionProto;
	  return proto.onnx.FunctionProto.deserializeBinaryFromReader(msg, reader);
	};


	/**
	 * Deserializes binary data (in protobuf wire format) from the
	 * given reader into the given message object.
	 * @param {!proto.onnx.FunctionProto} msg The message object to deserialize into.
	 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
	 * @return {!proto.onnx.FunctionProto}
	 */
	proto.onnx.FunctionProto.deserializeBinaryFromReader = function(msg, reader) {
	  while (reader.nextField()) {
	    if (reader.isEndGroup()) {
	      break;
	    }
	    var field = reader.getFieldNumber();
	    switch (field) {
	    case 1:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setName(value);
	      break;
	    case 4:
	      var value = /** @type {string} */ (reader.readString());
	      msg.addInput(value);
	      break;
	    case 5:
	      var value = /** @type {string} */ (reader.readString());
	      msg.addOutput(value);
	      break;
	    case 6:
	      var value = /** @type {string} */ (reader.readString());
	      msg.addAttribute(value);
	      break;
	    case 11:
	      var value = new proto.onnx.AttributeProto;
	      reader.readMessage(value,proto.onnx.AttributeProto.deserializeBinaryFromReader);
	      msg.addAttributeProto(value);
	      break;
	    case 7:
	      var value = new proto.onnx.NodeProto;
	      reader.readMessage(value,proto.onnx.NodeProto.deserializeBinaryFromReader);
	      msg.addNode(value);
	      break;
	    case 8:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDocString(value);
	      break;
	    case 9:
	      var value = new proto.onnx.OperatorSetIdProto;
	      reader.readMessage(value,proto.onnx.OperatorSetIdProto.deserializeBinaryFromReader);
	      msg.addOpsetImport(value);
	      break;
	    case 10:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setDomain(value);
	      break;
	    case 13:
	      var value = /** @type {string} */ (reader.readString());
	      msg.setOverload(value);
	      break;
	    case 12:
	      var value = new proto.onnx.ValueInfoProto;
	      reader.readMessage(value,proto.onnx.ValueInfoProto.deserializeBinaryFromReader);
	      msg.addValueInfo(value);
	      break;
	    case 14:
	      var value = new proto.onnx.StringStringEntryProto;
	      reader.readMessage(value,proto.onnx.StringStringEntryProto.deserializeBinaryFromReader);
	      msg.addMetadataProps(value);
	      break;
	    default:
	      reader.skipField();
	      break;
	    }
	  }
	  return msg;
	};


	/**
	 * Serializes the message to binary data (in protobuf wire format).
	 * @return {!Uint8Array}
	 */
	proto.onnx.FunctionProto.prototype.serializeBinary = function() {
	  var writer = new jspb.BinaryWriter();
	  proto.onnx.FunctionProto.serializeBinaryToWriter(this, writer);
	  return writer.getResultBuffer();
	};


	/**
	 * Serializes the given message to binary data (in protobuf wire
	 * format), writing to the given BinaryWriter.
	 * @param {!proto.onnx.FunctionProto} message
	 * @param {!jspb.BinaryWriter} writer
	 * @suppress {unusedLocalVariables} f is only used for nested messages
	 */
	proto.onnx.FunctionProto.serializeBinaryToWriter = function(message, writer) {
	  var f = undefined;
	  f = /** @type {string} */ (jspb.Message.getField(message, 1));
	  if (f != null) {
	    writer.writeString(
	      1,
	      f
	    );
	  }
	  f = message.getInputList();
	  if (f.length > 0) {
	    writer.writeRepeatedString(
	      4,
	      f
	    );
	  }
	  f = message.getOutputList();
	  if (f.length > 0) {
	    writer.writeRepeatedString(
	      5,
	      f
	    );
	  }
	  f = message.getAttributeList();
	  if (f.length > 0) {
	    writer.writeRepeatedString(
	      6,
	      f
	    );
	  }
	  f = message.getAttributeProtoList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      11,
	      f,
	      proto.onnx.AttributeProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getNodeList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      7,
	      f,
	      proto.onnx.NodeProto.serializeBinaryToWriter
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 8));
	  if (f != null) {
	    writer.writeString(
	      8,
	      f
	    );
	  }
	  f = message.getOpsetImportList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      9,
	      f,
	      proto.onnx.OperatorSetIdProto.serializeBinaryToWriter
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 10));
	  if (f != null) {
	    writer.writeString(
	      10,
	      f
	    );
	  }
	  f = /** @type {string} */ (jspb.Message.getField(message, 13));
	  if (f != null) {
	    writer.writeString(
	      13,
	      f
	    );
	  }
	  f = message.getValueInfoList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      12,
	      f,
	      proto.onnx.ValueInfoProto.serializeBinaryToWriter
	    );
	  }
	  f = message.getMetadataPropsList();
	  if (f.length > 0) {
	    writer.writeRepeatedMessage(
	      14,
	      f,
	      proto.onnx.StringStringEntryProto.serializeBinaryToWriter
	    );
	  }
	};


	/**
	 * optional string name = 1;
	 * @return {string}
	 */
	proto.onnx.FunctionProto.prototype.getName = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.setName = function(value) {
	  return jspb.Message.setField(this, 1, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearName = function() {
	  return jspb.Message.setField(this, 1, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.FunctionProto.prototype.hasName = function() {
	  return jspb.Message.getField(this, 1) != null;
	};


	/**
	 * repeated string input = 4;
	 * @return {!Array<string>}
	 */
	proto.onnx.FunctionProto.prototype.getInputList = function() {
	  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 4));
	};


	/**
	 * @param {!Array<string>} value
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.setInputList = function(value) {
	  return jspb.Message.setField(this, 4, value || []);
	};


	/**
	 * @param {string} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.addInput = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 4, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearInputList = function() {
	  return this.setInputList([]);
	};


	/**
	 * repeated string output = 5;
	 * @return {!Array<string>}
	 */
	proto.onnx.FunctionProto.prototype.getOutputList = function() {
	  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 5));
	};


	/**
	 * @param {!Array<string>} value
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.setOutputList = function(value) {
	  return jspb.Message.setField(this, 5, value || []);
	};


	/**
	 * @param {string} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.addOutput = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 5, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearOutputList = function() {
	  return this.setOutputList([]);
	};


	/**
	 * repeated string attribute = 6;
	 * @return {!Array<string>}
	 */
	proto.onnx.FunctionProto.prototype.getAttributeList = function() {
	  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 6));
	};


	/**
	 * @param {!Array<string>} value
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.setAttributeList = function(value) {
	  return jspb.Message.setField(this, 6, value || []);
	};


	/**
	 * @param {string} value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.addAttribute = function(value, opt_index) {
	  return jspb.Message.addToRepeatedField(this, 6, value, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearAttributeList = function() {
	  return this.setAttributeList([]);
	};


	/**
	 * repeated AttributeProto attribute_proto = 11;
	 * @return {!Array<!proto.onnx.AttributeProto>}
	 */
	proto.onnx.FunctionProto.prototype.getAttributeProtoList = function() {
	  return /** @type{!Array<!proto.onnx.AttributeProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.AttributeProto, 11));
	};


	/**
	 * @param {!Array<!proto.onnx.AttributeProto>} value
	 * @return {!proto.onnx.FunctionProto} returns this
	*/
	proto.onnx.FunctionProto.prototype.setAttributeProtoList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 11, value);
	};


	/**
	 * @param {!proto.onnx.AttributeProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.AttributeProto}
	 */
	proto.onnx.FunctionProto.prototype.addAttributeProto = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.onnx.AttributeProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearAttributeProtoList = function() {
	  return this.setAttributeProtoList([]);
	};


	/**
	 * repeated NodeProto node = 7;
	 * @return {!Array<!proto.onnx.NodeProto>}
	 */
	proto.onnx.FunctionProto.prototype.getNodeList = function() {
	  return /** @type{!Array<!proto.onnx.NodeProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.NodeProto, 7));
	};


	/**
	 * @param {!Array<!proto.onnx.NodeProto>} value
	 * @return {!proto.onnx.FunctionProto} returns this
	*/
	proto.onnx.FunctionProto.prototype.setNodeList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 7, value);
	};


	/**
	 * @param {!proto.onnx.NodeProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.NodeProto}
	 */
	proto.onnx.FunctionProto.prototype.addNode = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.onnx.NodeProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearNodeList = function() {
	  return this.setNodeList([]);
	};


	/**
	 * optional string doc_string = 8;
	 * @return {string}
	 */
	proto.onnx.FunctionProto.prototype.getDocString = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.setDocString = function(value) {
	  return jspb.Message.setField(this, 8, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearDocString = function() {
	  return jspb.Message.setField(this, 8, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.FunctionProto.prototype.hasDocString = function() {
	  return jspb.Message.getField(this, 8) != null;
	};


	/**
	 * repeated OperatorSetIdProto opset_import = 9;
	 * @return {!Array<!proto.onnx.OperatorSetIdProto>}
	 */
	proto.onnx.FunctionProto.prototype.getOpsetImportList = function() {
	  return /** @type{!Array<!proto.onnx.OperatorSetIdProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.OperatorSetIdProto, 9));
	};


	/**
	 * @param {!Array<!proto.onnx.OperatorSetIdProto>} value
	 * @return {!proto.onnx.FunctionProto} returns this
	*/
	proto.onnx.FunctionProto.prototype.setOpsetImportList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 9, value);
	};


	/**
	 * @param {!proto.onnx.OperatorSetIdProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.OperatorSetIdProto}
	 */
	proto.onnx.FunctionProto.prototype.addOpsetImport = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 9, opt_value, proto.onnx.OperatorSetIdProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearOpsetImportList = function() {
	  return this.setOpsetImportList([]);
	};


	/**
	 * optional string domain = 10;
	 * @return {string}
	 */
	proto.onnx.FunctionProto.prototype.getDomain = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.setDomain = function(value) {
	  return jspb.Message.setField(this, 10, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearDomain = function() {
	  return jspb.Message.setField(this, 10, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.FunctionProto.prototype.hasDomain = function() {
	  return jspb.Message.getField(this, 10) != null;
	};


	/**
	 * optional string overload = 13;
	 * @return {string}
	 */
	proto.onnx.FunctionProto.prototype.getOverload = function() {
	  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, ""));
	};


	/**
	 * @param {string} value
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.setOverload = function(value) {
	  return jspb.Message.setField(this, 13, value);
	};


	/**
	 * Clears the field making it undefined.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearOverload = function() {
	  return jspb.Message.setField(this, 13, undefined);
	};


	/**
	 * Returns whether this field is set.
	 * @return {boolean}
	 */
	proto.onnx.FunctionProto.prototype.hasOverload = function() {
	  return jspb.Message.getField(this, 13) != null;
	};


	/**
	 * repeated ValueInfoProto value_info = 12;
	 * @return {!Array<!proto.onnx.ValueInfoProto>}
	 */
	proto.onnx.FunctionProto.prototype.getValueInfoList = function() {
	  return /** @type{!Array<!proto.onnx.ValueInfoProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.ValueInfoProto, 12));
	};


	/**
	 * @param {!Array<!proto.onnx.ValueInfoProto>} value
	 * @return {!proto.onnx.FunctionProto} returns this
	*/
	proto.onnx.FunctionProto.prototype.setValueInfoList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 12, value);
	};


	/**
	 * @param {!proto.onnx.ValueInfoProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.ValueInfoProto}
	 */
	proto.onnx.FunctionProto.prototype.addValueInfo = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 12, opt_value, proto.onnx.ValueInfoProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearValueInfoList = function() {
	  return this.setValueInfoList([]);
	};


	/**
	 * repeated StringStringEntryProto metadata_props = 14;
	 * @return {!Array<!proto.onnx.StringStringEntryProto>}
	 */
	proto.onnx.FunctionProto.prototype.getMetadataPropsList = function() {
	  return /** @type{!Array<!proto.onnx.StringStringEntryProto>} */ (
	    jspb.Message.getRepeatedWrapperField(this, proto.onnx.StringStringEntryProto, 14));
	};


	/**
	 * @param {!Array<!proto.onnx.StringStringEntryProto>} value
	 * @return {!proto.onnx.FunctionProto} returns this
	*/
	proto.onnx.FunctionProto.prototype.setMetadataPropsList = function(value) {
	  return jspb.Message.setRepeatedWrapperField(this, 14, value);
	};


	/**
	 * @param {!proto.onnx.StringStringEntryProto=} opt_value
	 * @param {number=} opt_index
	 * @return {!proto.onnx.StringStringEntryProto}
	 */
	proto.onnx.FunctionProto.prototype.addMetadataProps = function(opt_value, opt_index) {
	  return jspb.Message.addToRepeatedWrapperField(this, 14, opt_value, proto.onnx.StringStringEntryProto, opt_index);
	};


	/**
	 * Clears the list making it empty but non-null.
	 * @return {!proto.onnx.FunctionProto} returns this
	 */
	proto.onnx.FunctionProto.prototype.clearMetadataPropsList = function() {
	  return this.setMetadataPropsList([]);
	};


	/**
	 * @enum {number}
	 */
	proto.onnx.Version = {
	  _START_VERSION: 0,
	  IR_VERSION_2017_10_10: 1,
	  IR_VERSION_2017_10_30: 2,
	  IR_VERSION_2017_11_3: 3,
	  IR_VERSION_2019_1_22: 4,
	  IR_VERSION_2019_3_18: 5,
	  IR_VERSION_2019_9_19: 6,
	  IR_VERSION_2020_5_8: 7,
	  IR_VERSION_2021_7_30: 8,
	  IR_VERSION_2023_5_5: 9,
	  IR_VERSION: 10
	};

	/**
	 * @enum {number}
	 */
	proto.onnx.OperatorStatus = {
	  EXPERIMENTAL: 0,
	  STABLE: 1
	};

	goog.object.extend(exports, proto.onnx); 
} (onnx_pb$1));

var onnx_pb = /*@__PURE__*/getDefaultExportFromCjs(onnx_pb$1);

export { onnx_pb as default };
