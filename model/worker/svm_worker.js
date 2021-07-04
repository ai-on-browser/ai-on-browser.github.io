importScripts('../../js/math.js');
importScripts('../../js/ensemble.js');

self.model = null;

self.addEventListener('message', function(e) {
	const data = e.data;
	if (data.mode == 'init') {
		let kernel = Array.isArray(data.kernel) ? data.kernel[0] : data.kernel;
		let kernel_args = Array.isArray(data.kernel) ? data.kernel.slice(1) : [];
		if (data.method == 'onerest') {
			self.model = new OneVsRestModel(SVM, null, [Kernel[kernel](...kernel_args)]);
		} else {
			self.model = new OneVsOneModel(SVM, null, [Kernel[kernel](...kernel_args)]);
		}
		self.model.init(data.x, data.y);
	} else if (data.mode == 'fit') {
		if (self.model) {
			for (let i = 0; i < data.iteration; i++) {
				self.model.fit();
			}
		}
		self.postMessage(null);
	} else if (data.mode == 'predict') {
		self.postMessage(self.model ? self.model.predict(data.x) : null);
	}
}, false);

const Kernel = {
	"gaussian": (d = 1) => ((a, b) => {
		let r = a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0)
		return Math.exp(-r / (2 * d * d));
	}),
	"linear": () => ((a, b) => a.reduce((acc, v, i) => acc + v * b[i], 0))
}

class SVM {
	constructor(kernel) {
		this._n = 0;
		this._a = [];
		this._x = [];
		this._t = [];
		this._b = 0;

		this._C = 1000;
		this._eps = 0.001;
		this._tolerance = 0.001;
		this._err = [];

		this._kernel = kernel;
	}

	init(train_x, train_y) {
		this._n = train_x.length;
		this._a = Array(this._n).fill(0);
		this._x = train_x.map(x => x);
		this._t = train_y;
		this._err = Array(this._n).fill(0);
		this._alldata = true;
	}

	fit() {
		let changed = this._fitOnce(this._alldata);
		if (this._alldata) {
			this._alldata = false;
			if (changed == 0) {
				return;
			}
		} else if (changed == 0) {
			this._alldata = true;
		}
	}

	_fitOnce(all = false) {
		let change = 0;

		const between_eps = v => this._eps < v && v < this._C - this._eps;
		for (let i = 0; i < this._n; i++) {
			let ei = 0;
			if (between_eps(this._a[i])) {
				ei = this._err[i];
			} else if (all) {
				ei = this.predict(this._x[i]) - this._t[i];
			} else {
				continue;
			}
			const yfi = ei * this._t[i];

			if ((this._a[i] >= (this._C - this._eps) || yfi >= -this._tolerance) && (this._a[i] <= this._eps || yfi <= this._tolerance)) {
				continue;
			}

			let max_e = 0;
			let max_j = -1;

			const offset = Math.floor(Math.random() * (this._n + 1));
			let in_eps = [];
			let out_eps = [];
			for (let j = 0; j < this._n; j++) {
				const p = (j + offset) % this._n;
				if (p === i) {
					continue;
				}
				if (between_eps(this._a[p])) {
					const ej = this._err[p];
					if (Math.abs(ei - ej) > max_e) {
						max_e = Math.abs(ei - ej);
						if (max_j >= 0) in_eps.push(max_j);
						max_j = p;
					} else {
						in_eps.push(p);
					}
				} else {
					out_eps.push(p);
				}
			}
			const checks = (max_j >= 0) ? [].concat(max_j, in_eps, out_eps) : [].concat(in_eps, out_eps);
			for (let ck = 0; ck < checks.length; ck++) {
				const j = checks[ck];

				const ai_old = this._a[i];
				const aj_old = this._a[j];
				let u, v;
				if (this._t[i] != this._t[j]) {
					u = Math.max(0, ai_old - aj_old);
					v = Math.min(this._C, this._C + ai_old - aj_old);
				} else {
					u = Math.max(0, ai_old + aj_old - this._C);
					v = Math.min(this._C, ai_old + aj_old);
				}
				if (u == v) {
					continue;
				}

				const kii = this._kernel(this._x[i], this._x[i]);
				const kjj = this._kernel(this._x[j], this._x[j]);
				const kij = this._kernel(this._x[i], this._x[j]);
				const k = kii + kjj - 2 * kij;
				const ej = between_eps(this._a[j]) ? this._err[j] : (this.predict(this._x[j]) - this._t[j]);

				let bClip = false;
				let ai_new = 0, aj_new = 0;
				if (k <= 0) {
					let lh = [u, v].map(t => {
						let ai_n = t;
						let aj_n = aj_old + this._t[i] * this._t[j] * (ai_old - ai_n);
						this._a[i] = ai_n;
						this._a[j] = aj_n;
						const v1 = this.predict(this._x[j]) + this._b - this._t[j] * aj_old * kjj - this._t[i] * ai_old * kij;
						const v2 = this.predict(this._x[i]) + this._b - this._t[j] * aj_old * kij - this._t[i] * ai_old * kii;
						const lobj = aj_n + ai_n - kjj * aj_n ** 2 / 2 - kii * ai_n ** 2 / 2 - this._t[j] * this._t[i] * kij * aj_n * ai_n - this._t[j] * aj_n * v1 - this._t[i] * ai_n * v2;
					});
					this._a[i] = ai_old;
					this._a[j] = aj_old;

					ai_new = (lh[0] > lh[1] + this._eps) ? u : (lh[0] < lh[1] - this._eps) ? v : ai_old;
					bClip = true;
				} else {
					ai_new = ai_old + (this._t[i] * (ej - ei) / k);
					if (ai_new > v) {
						bClip = true;
						ai_new = v;
					} else if (ai_new < u) {
						bClip = true;
						ai_new = u;
					}
				}

				if (Math.abs(ai_new - ai_old) < this._eps * (ai_new + ai_old  + this._eps)) {
					continue;
				}
				aj_new = aj_old  + this._t[i] * this._t[j] * (ai_old - ai_new);
				const b_old = this._b;
				if (between_eps(this._a[i])) {
					this._b += ei + (ai_new - ai_old) * this._t[i] * kii + (aj_new - aj_old) * this._t[j] * kij;
				} else if (between_eps(this._a[j])) {
					this._b += ej + (ai_new - ai_old) * this._t[i] * kij + (aj_new - aj_old) * this._t[j] * kjj;
				} else {
					this._b += (ei + ej + (ai_new - ai_old) * this._t[i] * (kii + kij) + (aj_new - aj_old) * this._t[j] * (kij + kjj)) / 2;
				}

				for (let m = 0; m < this._n; m++) {
					if (m == i || m == j) {
						continue;
					}
					this._err[m] += this._t[j] * (aj_new - aj_old) * this._kernel(this._x[j], this._x[m]) + this._t[i] * (ai_new - ai_old) * this._kernel(this._x[i], this._x[m]) + b_old - this._b;
				}

				this._a[i] = ai_new;
				this._a[j] = aj_new;

				if (!bClip) {
					this._err[i] = 0;
				} else if (between_eps(ai_new)) {
					this._err[i] = this.predict(this._x[i]) - this._t[i];
				}
				this._err[j] = this.predict(this._x[j]) - this._t[j];

				change++;
				break;
			}
		}
		return change;
	}

	predict(data) {
		const f = v => {
			let y = 0;
			for (let n = 0; n < this._n; n++) {
				if (this._a[n])
					y += this._a[n] * this._t[n] * this._kernel(v, this._x[n]);
			}
			return y - this._b;
		};
		return (!Array.isArray(data[0])) ? f(data) : data.map(f);
	}
}
