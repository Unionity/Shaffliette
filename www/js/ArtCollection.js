class ArtCollection {
	constructor(type, collection) {
		this.collection = collection;
		this.type = type;
	}
	getArt(id = 0) {
		return this.collection[id];
	}
}