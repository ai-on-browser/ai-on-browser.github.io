import{onnx}from"../onnx_importer.js";import{requireTensor}from"../utils.js";export default{import:(t,i)=>[...requireTensor(t,i.inputList),{type:"div",input:i.inputList,name:i.outputList[0]}]};