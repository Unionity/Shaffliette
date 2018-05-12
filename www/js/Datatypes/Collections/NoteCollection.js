class NoteCollection {
	constructor(collection) {
		this.collection = collection;
	}
	getNote(id = 0) {
		return this.collection[id];
	}
}