class ShafflCollectionView {
	constructor(collection, el) {
		this.collection = collection;
		this.el = el;
	}
	render(append) {
		let that = this;
		this.el.attr("data-model", "ShafflIndexView");
		if(!append) this.el.html("");
		this.collection.collection.forEach(art => {
			let html = `<img src="${art.thumbUrl}" data-id="${art.id}" class="shaffl-art--thumb" />`;
			that.el.append(html);
		});
	}
}