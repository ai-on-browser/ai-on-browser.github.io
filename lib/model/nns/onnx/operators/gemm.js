import{onnx}from"../onnx_importer.js";import{loadTensor,loadAttribute}from"../utils.js";import Matrix from"../../../../util/matrix.js";export default{import(t,r){const o={};for(const t of r.attributeList)o[t.name]=loadAttribute(t);const i=[];let a=r.inputList[0];o.transA&&i.push({type:"transpose",input:[a],name:a+="_t"});const n={};for(const i of t.graph.initializerList)if(i.name===r.inputList[1])n.w=Matrix.fromArray(loadTensor(i)),o.transB&&(n.w=n.w.t),n.w.mult(o.alpha),n.w=n.w.toArray();else if(i.name===r.inputList[2]){const t=loadTensor(i);!Array.isArray(t)||Array.isArray(t[0])?n.b=Matrix.fromArray(t):n.b=new Matrix(1,t.length,t),n.b.mult(o.beta),n.b=n.b.toArray()}return i.push({type:"full",input:[a],name:r.outputList[0],w:n.w,b:n.b}),i}};