class TagCollection {
	constructor(owner, collection) {
		this.owner = owner;
		this.collection = collection;
	}
	getTags() {
	    return this.collection;
    }
}