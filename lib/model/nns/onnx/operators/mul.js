import{onnx}from"../onnx_importer.js";import{requireTensor}from"../utils.js";export default{import:(t,r)=>[...requireTensor(t,r.inputList),{type:"mult",input:r.inputList,name:r.outputList[0]}]};