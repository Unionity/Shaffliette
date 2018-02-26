class BooruDOMModel {
	constructor() {
		this.xhr = new XMLHttpRequest();
		this.url = window.location.protocol+"//"+window.location.host;
		this.ruleset = {
			server: "https://danbooru.donmai.us",
			search: "/posts?utf8=✓&tags=%SEARCH_STRING%",
			page: "&page=%PAGE%",
			art: "/posts/%ID%",
			autocomplete: "/tags/autocomplete.json?search[name_matches]=%SEARCH_STRING%",
			pool: "/pools/%ID%",
			restrictions: {
				maxtaglength: 2
			},
			elements: {
				arts: {
					base: "article",
					link: "article > a",
					thumbnail: "article > a > img"
				},
				art: {
					image: "#image",
					full: "#image-resize-link",
					pool: {
						pool: ".pool-name",
						pool_id: ".pool-name > a",
						next: "a.next"
					},
					tags: {
						copyrights: ".category-3 a.search-tag",
						artist: ".category-1 a.search-tag",
						characters: ".category-4 a.search-tag",
						misc: ".category-0 a.search-tag",
						meta: ".category-5 a.search-tag"
					},
					comments: {
						comment: ".comment",
						author: ".comment > .author > h1",
						time: ".comment > .author > p",
						content: ".comment > .content > .body"
					}
				},
				nextpage: ".numbered-page > a",
				perviouspage: ".arrow > a",
				error: "p"
			}
		};
	}
	autocomplete(string) {
		let that = this;
		return new Promise((resolve, reject) => {
			that.xhr.open("GET", that.ruleset.server+that.ruleset.autocomplete.replace("%SEARCH_STRING%", string));
			that.xhr.onreadystatechange = () => {
				if(that.xhr.readyState === XMLHttpRequest.DONE) {
					if(that.xhr.status!==200) {
						that.xhr = new XMLHttpRequest();
						reject("Bad response");
					}
					let collection = [];
					JSON.parse(that.xhr.responseText).forEach(tag => {
						collection.push(tag.name);
					});
					resolve(collection);
					that.xhr = new XMLHttpRequest();
				}
			};
			that.xhr.send();
		});
	}
	getPoolById(id = 1, page = 1) {
		
	}
	getArtById(id = 1) {
		let that = this;
		return new Promise((resolve, reject) => {
			that.xhr.open("GET", that.ruleset.server+that.ruleset.art.replace("%ID%", id));
			that.xhr.onreadystatechange = () => {
				if(that.xhr.readyState === XMLHttpRequest.DONE) {
					if(that.xhr.status!==200) {
						that.xhr = new XMLHttpRequest();
						reject("Bad response");
					}
					let response = that.xhr.responseText;
					let doc = new DOMParser().parseFromString(response, "text/html");
					let art;
					let tags = {copyrights: [], artist: [], characters: [], misc: [], meta: []};
					let comments = [];
					art = doc.querySelector(that.ruleset.elements.art.image).src.replace(this.url, this.ruleset.server);
                    if(doc.querySelector(that.ruleset.elements.art.full)!= null) art = doc.querySelector(that.ruleset.elements.art.full).href.replace(this.url, this.ruleset.server); 
					if(!art) reject("Bad response");
					doc.querySelectorAll(that.ruleset.elements.art.tags.copyrights).forEach(item => { tags.copyrights.push(new Tag(item.innerText)); });
					doc.querySelectorAll(that.ruleset.elements.art.tags.characters).forEach(item => { tags.characters.push(new Tag(item.innerText)); });
					doc.querySelectorAll(that.ruleset.elements.art.tags.artist).forEach(item => { tags.artist.push(new Tag(item.innerText)); });
					doc.querySelectorAll(that.ruleset.elements.art.tags.misc).forEach(item => { tags.misc.push(new Tag(item.innerText)); });
					doc.querySelectorAll(that.ruleset.elements.art.tags.meta).forEach(item => { tags.meta.push(new Tag(item.innerText)); });
					let i = 0;
					if(doc.querySelectorAll(that.ruleset.elements.art.comments.comment)) doc.querySelectorAll(that.ruleset.elements.art.comments.comment).forEach(() => {
						comments.push(new Comment(doc.querySelectorAll(that.ruleset.elements.art.comments.author)[i].innerText.replace(" ", "").replace("\n", ""), doc.querySelectorAll(that.ruleset.elements.art.comments.time)[i].innerText.replace(" ", "").replace("\n", ""), doc.querySelectorAll(that.ruleset.elements.art.comments.content)[i].innerHTML.replace(" ", "").replace("\n", "")));
						i++;
					});
					resolve(new Art(id, art, null, undefined, doc.querySelector("#favcount-for-post-%ID%".replace("%ID%", id)).innerHTML, new CommentCollection(comments), tags));
				}
			};
			that.xhr.send();
		});
	}
	getArtCollectionByTags(tag, page = 1) {
		let tags;
		if(tag instanceof Tag) {
			tags = tag.name;
		} else if(tag instanceof TagCollection) {
			tags = tag.collection.join(" ");
		} else {
			throw new Error("Tags is not a collection or tag!");
		}
		let that = this;
		return new Promise((resolve, reject) => {
			that.xhr.open("GET", that.ruleset.server+that.ruleset.search.replace("%SEARCH_STRING%", tags)+that.ruleset.page.replace("%PAGE%", parseInt(page)));
			that.xhr.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");
			that.xhr.onreadystatechange = () => {
				if(that.xhr.readyState === XMLHttpRequest.DONE) {
					let response = that.xhr.responseText;
					let doc = new DOMParser().parseFromString(response, "text/html");
					if(that.xhr.status!==200) {
						that.xhr = new XMLHttpRequest();
						if(doc.querySelector(that.ruleset.elements.error) == null) reject("Bad response");
						reject(doc.querySelector(that.ruleset.elements.error).innerText);
					}
					let arts = doc.querySelectorAll(that.ruleset.elements.arts.base);
					let collection = [];
					if(arts == null) reject("Nobody here but us chickens!");
					arts.forEach(art => {
						let artAnchor = art.children[0];
						let artUrl = artAnchor.href.replace(that.url, that.ruleset.server);
						let artId = artUrl.replace(that.ruleset.server+that.ruleset.art.replace("%ID%", "") , "").replace(/[^0-9]/gi, "");
						collection.push(new Art( artId, that.ruleset.server+that.ruleset.art.replace("%ID%", artId), artAnchor.children[0].src.replace(that.url, that.ruleset.server), null, null, null));
					});
					that.xhr = new XMLHttpRequest();
					resolve(new ArtCollection(1, collection));
				}
			};
			that.xhr.send();
		});
	}
}