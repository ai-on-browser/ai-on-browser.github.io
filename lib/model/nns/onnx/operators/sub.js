import"../onnx_importer.js";import{requireTensor as e}from"../utils.js";export default{import(r,t){return[...e(r,t.getInputList()),{type:"sub",input:t.getInputList(),name:t.getOutputList()[0]}]}};
