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
		        let html = `<section class="shaffl-art--thumb"  data-id="${art.id}" data-art='${JSON.stringify(art).replace(/'/g, "%27")}' style="background-image:url('${art.thumbUrl}');"><strong class="shaffl-art--thumb---selected">selected</strong><section onclick="event.stopPropagation();" class="shaffl-art--thumb---info"><h2 class="shaffl-art--thumb---id">#${art.id}</h2><p class="shaffl-art--thumb---favs">${art.rating} &#x2665;</p></section></section>`
			that.el.append(html);
		});
	}
}
