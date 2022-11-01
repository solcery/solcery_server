import { ValueRender } from './components';

const DEFAULT_PREVIEW_WIDTH = 200;
class SImage {
	static fromString = () => new SImage({});
	constructor(data) {
		this.previewHeight = data.previewHeight;
		this.previewWidth = data.previewWidth ?? DEFAULT_PREVIEW_WIDTH;
		if (!this.previewHeight && !this.previewWidth) {
			this.previewWidth = DEFAULT_PREVIEW_WIDTH;
		}
	}
	construct = (value, meta) => value;
	valueRender = ValueRender;
	default = () => undefined;
	eq = (a, b) => a === b;
	clone = (a) => a;
}

export { SImage };
