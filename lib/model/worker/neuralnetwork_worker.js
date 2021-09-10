import { Matrix } from '../../util/math.js'
import NeuralNetwork from '../neuralnetwork.js'

self.model = {};
self.epoch = {};

self.addEventListener('message', function(e) {
	const data = e.data;
	if (data.mode == 'init') {
		const id = Math.random().toString(32).substring(2);
		self.model[id] = new NeuralNetwork(data.layers, data.loss, data.optimizer);
		self.epoch[id] = 0;
		self.postMessage(id);
	} else if (data.mode == 'fit') {
		const samples = data.x.length;
		if (samples == 0) {
			self.postMessage(null);
			return;
		}

		const loss = self.model[data.id].fit(data.x, data.y, data.iteration, data.rate, data.batch_size, data.options);
		self.epoch[data.id] += data.iteration;
		self.postMessage({
			epoch: self.epoch[data.id],
			loss: loss,
		});
	} else if (data.mode == 'predict') {
		const samples = data.x.length;
		if (samples == 0) {
			self.postMessage([]);
			return;
		}

		const y = self.model[data.id].calc(data.x, null, data.out, data.options);
		if (y instanceof Matrix) {
			self.postMessage(y.toArray());
		} else {
			for (const k of Object.keys(y)) {
				y[k] = y[k].toArray();
			}
			self.postMessage(y);
		}
	} else if (data.mode === 'close') {
		delete self.model[data.id];
	} else if (data.mode === 'copy') {
		const id = Math.random().toString(32).substring(2);
		self.model[id] = self.model[data.id].copy();
		self.epoch[id] = 0;
		self.postMessage(id);
	}
}, false);
