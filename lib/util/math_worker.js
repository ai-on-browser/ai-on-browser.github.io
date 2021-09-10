import { Matrix } from './math.js'

self.addEventListener('message', function(e) {
	const data = e.data;
	if (data.call == 'eigenValues') {
		const mat = new Matrix(data.rows, data.cols, data.data)
		self.postMessage(mat.eigenValues());
	} else if (data.call == 'eigenVectors') {
		const mat = new Matrix(data.rows, data.cols, data.data)
		self.postMessage(mat.eigenVectors().value);
	}
}, false);
