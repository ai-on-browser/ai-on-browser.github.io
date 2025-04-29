export default {
	setting: {
		data: {
			configElement: {
				replaceChildren: () => {},
			},
		},
	},
	platform: {
		init: () => {},
		render: () => {},
	},
	onReady: cb => {
		cb()
	},
}
