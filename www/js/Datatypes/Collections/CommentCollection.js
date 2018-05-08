class CommentCollection {
	constructor(collection) {
		this.collection = collection;
	}
	getComment(id = 0) {
		return this.collection[id];
	}
}