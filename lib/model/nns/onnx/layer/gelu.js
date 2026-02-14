import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle gelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'gelu'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const opset = model.getOpsetImportList()[0]
		if (opset.getDomain() === '' && opset.getVersion() >= 20) {
			const node = new onnx.NodeProto()
			node.setOpType('Gelu')
			node.addInput(input)
			node.addOutput(obj.name)

			const graph = model.getGraph()
			graph.addNode(node)
		} else {
			const tensor1 = getConstNodeName(model, 1)
			const tensor2 = getConstNodeName(model, 2)
			const tensor_p = getConstNodeName(model, 0.3275911)
			const tensor_a1 = getConstNodeName(model, 0.254829592)
			const tensor_a2 = getConstNodeName(model, -0.284496736)
			const tensor_a3 = getConstNodeName(model, 1.421413741)
			const tensor_a4 = getConstNodeName(model, -1.453152027)
			const tensor_a5 = getConstNodeName(model, 1.061405429)

			const node_sqrt2 = new onnx.NodeProto()
			node_sqrt2.setOpType('Sqrt')
			node_sqrt2.addInput(tensor2)
			node_sqrt2.addOutput(`${obj.name}_sqrt2`)

			const node_v = new onnx.NodeProto()
			node_v.setOpType('Div')
			node_v.addInput(input)
			node_v.addInput(`${obj.name}_sqrt2`)
			node_v.addOutput(`${obj.name}_v`)

			const node_abs = new onnx.NodeProto()
			node_abs.setOpType('Abs')
			node_abs.addInput(`${obj.name}_v`)
			node_abs.addOutput(`${obj.name}_abs`)

			const node_mul_p = new onnx.NodeProto()
			node_mul_p.setOpType('Mul')
			node_mul_p.addInput(`${obj.name}_abs`)
			node_mul_p.addInput(tensor_p)
			node_mul_p.addOutput(`${obj.name}_mul_p`)

			const node_add1 = new onnx.NodeProto()
			node_add1.setOpType('Add')
			node_add1.addInput(`${obj.name}_mul_p`)
			node_add1.addInput(tensor1)
			node_add1.addOutput(`${obj.name}_add1`)

			const node_t = new onnx.NodeProto()
			node_t.setOpType('Reciprocal')
			node_t.addInput(`${obj.name}_add1`)
			node_t.addOutput(`${obj.name}_t`)

			const node_mul_a5 = new onnx.NodeProto()
			node_mul_a5.setOpType('Mul')
			node_mul_a5.addInput(`${obj.name}_t`)
			node_mul_a5.addInput(tensor_a5)
			node_mul_a5.addOutput(`${obj.name}_mul_a5`)

			const node_add_a4 = new onnx.NodeProto()
			node_add_a4.setOpType('Add')
			node_add_a4.addInput(`${obj.name}_mul_a5`)
			node_add_a4.addInput(tensor_a4)
			node_add_a4.addOutput(`${obj.name}_add_a4`)

			const node_mul_a4 = new onnx.NodeProto()
			node_mul_a4.setOpType('Mul')
			node_mul_a4.addInput(`${obj.name}_add_a4`)
			node_mul_a4.addInput(`${obj.name}_t`)
			node_mul_a4.addOutput(`${obj.name}_mul_a4`)

			const node_add_a3 = new onnx.NodeProto()
			node_add_a3.setOpType('Add')
			node_add_a3.addInput(`${obj.name}_mul_a4`)
			node_add_a3.addInput(tensor_a3)
			node_add_a3.addOutput(`${obj.name}_add_a3`)

			const node_mul_a3 = new onnx.NodeProto()
			node_mul_a3.setOpType('Mul')
			node_mul_a3.addInput(`${obj.name}_add_a3`)
			node_mul_a3.addInput(`${obj.name}_t`)
			node_mul_a3.addOutput(`${obj.name}_mul_a3`)

			const node_add_a2 = new onnx.NodeProto()
			node_add_a2.setOpType('Add')
			node_add_a2.addInput(`${obj.name}_mul_a3`)
			node_add_a2.addInput(tensor_a2)
			node_add_a2.addOutput(`${obj.name}_add_a2`)

			const node_mul_a2 = new onnx.NodeProto()
			node_mul_a2.setOpType('Mul')
			node_mul_a2.addInput(`${obj.name}_add_a2`)
			node_mul_a2.addInput(`${obj.name}_t`)
			node_mul_a2.addOutput(`${obj.name}_mul_a2`)

			const node_add_a1 = new onnx.NodeProto()
			node_add_a1.setOpType('Add')
			node_add_a1.addInput(`${obj.name}_mul_a2`)
			node_add_a1.addInput(tensor_a1)
			node_add_a1.addOutput(`${obj.name}_add_a1`)

			const node_mul_a1 = new onnx.NodeProto()
			node_mul_a1.setOpType('Mul')
			node_mul_a1.addInput(`${obj.name}_add_a1`)
			node_mul_a1.addInput(`${obj.name}_t`)
			node_mul_a1.addOutput(`${obj.name}_mul_a1`)

			const node_pow = new onnx.NodeProto()
			node_pow.setOpType('Pow')
			node_pow.addInput(`${obj.name}_v`)
			node_pow.addInput(tensor2)
			node_pow.addOutput(`${obj.name}_pow`)

			const node_neg = new onnx.NodeProto()
			node_neg.setOpType('Neg')
			node_neg.addInput(`${obj.name}_pow`)
			node_neg.addOutput(`${obj.name}_neg`)

			const node_exp = new onnx.NodeProto()
			node_exp.setOpType('Exp')
			node_exp.addInput(`${obj.name}_neg`)
			node_exp.addOutput(`${obj.name}_exp`)

			const node_mul = new onnx.NodeProto()
			node_mul.setOpType('Mul')
			node_mul.addInput(`${obj.name}_mul_a1`)
			node_mul.addInput(`${obj.name}_exp`)
			node_mul.addOutput(`${obj.name}_mul`)

			const node_erf = new onnx.NodeProto()
			node_erf.setOpType('Sub')
			node_erf.addInput(tensor1)
			node_erf.addInput(`${obj.name}_mul`)
			node_erf.addOutput(`${obj.name}_erf`)

			const node_sign = new onnx.NodeProto()
			node_sign.setOpType('Sign')
			node_sign.addInput(`${obj.name}_v`)
			node_sign.addOutput(`${obj.name}_sign`)

			const node_sign_erf = new onnx.NodeProto()
			node_sign_erf.setOpType('Mul')
			node_sign_erf.addInput(`${obj.name}_erf`)
			node_sign_erf.addInput(`${obj.name}_sign`)
			node_sign_erf.addOutput(`${obj.name}_sign_erf`)

			const node_erf_add1 = new onnx.NodeProto()
			node_erf_add1.setOpType('Add')
			node_erf_add1.addInput(tensor1)
			node_erf_add1.addInput(`${obj.name}_sign_erf`)
			node_erf_add1.addOutput(`${obj.name}_erf_add1`)

			const node_mul_v = new onnx.NodeProto()
			node_mul_v.setOpType('Mul')
			node_mul_v.addInput(input)
			node_mul_v.addInput(`${obj.name}_erf_add1`)
			node_mul_v.addOutput(`${obj.name}_mul_v`)

			const node_div2 = new onnx.NodeProto()
			node_div2.setOpType('Div')
			node_div2.addInput(`${obj.name}_mul_v`)
			node_div2.addInput(tensor2)
			node_div2.addOutput(obj.name)

			const graph = model.getGraph()
			graph.addNode(node_sqrt2)
			graph.addNode(node_v)
			graph.addNode(node_abs)
			graph.addNode(node_mul_p)
			graph.addNode(node_add1)
			graph.addNode(node_t)
			graph.addNode(node_mul_a5)
			graph.addNode(node_add_a4)
			graph.addNode(node_mul_a4)
			graph.addNode(node_add_a3)
			graph.addNode(node_mul_a3)
			graph.addNode(node_add_a2)
			graph.addNode(node_mul_a2)
			graph.addNode(node_add_a1)
			graph.addNode(node_mul_a1)
			graph.addNode(node_pow)
			graph.addNode(node_neg)
			graph.addNode(node_exp)
			graph.addNode(node_mul)
			graph.addNode(node_erf)
			graph.addNode(node_sign)
			graph.addNode(node_sign_erf)
			graph.addNode(node_erf_add1)
			graph.addNode(node_mul_v)
			graph.addNode(node_div2)
		}
	},
}
