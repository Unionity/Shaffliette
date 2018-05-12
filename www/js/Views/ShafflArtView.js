class ShafflArtView {
	constructor(art, el) {
		this.art = art;
		this.el = el;
	}
	render(append) {
		this.el.attr("data-model", "ShafflArtView");
		if(!append) this.el.html("");
		this.el.append("<section id=\"shaffl-notes\"></section><div id=\"shaffl-bgblur\" ></div><center class=\"shaffl-art-view\"><div style=\"margin-top: calc(45vh - 136px)\" class=\"shaffl-loader\"></div><img id=\"shaffl-art-image\" /></center>");
		//$(".shaffl-image-info--brief").html("<em>"+this.art.tags.characters.join(" and ")+"</em> (<em>"+this.art.tags.copyrights.join(" and ")+"</em>)"+" drawn by <em>"+this.art.tags.artist.join(" and ")+"</em>");
		$(".shaffl-image-info--tags, .shaffl-image-info--comments").html("");
		if(typeof this.art.tags.copyrights !== "undefined") {
			this.art.tags.copyrights.forEach(tag => {
				$(".shaffl-image-info--tags").append(`<div class=shaffl-tag data-category=copyrights><div class=shaffl-tag--category><img src="assets/imgs/icons/tags/copyrights.png"></div><span>${tag.name}</span></div><br/>`);
			});
		}
		if(typeof this.art.tags.characters !== "undefined") {
			this.art.tags.characters.forEach(tag => {
				$(".shaffl-image-info--tags").append(`<div class=shaffl-tag data-category=character><div class=shaffl-tag--category><img src="assets/imgs/icons/tags/character.png"></div><span>${tag.name}</span></div><br/>`);
			});
		}
		if(typeof this.art.tags.artist !== "undefined") {
			this.art.tags.artist.forEach(tag => {
				$(".shaffl-image-info--tags").append(`<div class=shaffl-tag data-category=artist><div class=shaffl-tag--category><img src="assets/imgs/icons/tags/artist.png"></div><span>${tag.name}</span></div><br/>`);
			});
		}
		if(typeof this.art.tags.misc !== "undefined") {
			this.art.tags.misc.forEach(tag => {
				$(".shaffl-image-info--tags").append(`<div class=shaffl-tag data-category=general><div class=shaffl-tag--category><img src="assets/imgs/icons/tags/general.png"></div><span>${tag.name}</span></div><br/>`);
			});
		}
		if(typeof this.art.tags.meta !== "undefined") {
			this.art.tags.meta.forEach(tag => {
				$(".shaffl-image-info--tags").append(`<div class=shaffl-tag data-category=meta><div class=shaffl-tag--category><img src="assets/imgs/icons/tags/meta.png"></div><span>${tag.name}</span></div><br/>`);
			});
		}
		$(".shaffl-image-info--favs").text(this.art.rating);
		if(this.art.comments !== null) {
			this.art.comments.collection.forEach(comment => {
				$(".sahffl-image-info--comments").append(`<article class="comment">${comment.content}<em>&#x2014; ${comment.author}, ${comment.time}</em></article>`);
			});
		}
	}
}