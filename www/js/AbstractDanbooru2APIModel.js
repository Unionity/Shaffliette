class AbstractDanbooru2APIModel extends AbstractModel {
	constructor(server, search = "/posts.xml?utf8=✓&tags=%SEARCH_STRING%") {
		super();
		this.ruleset = {
			server: server,
			search: search,
			page: "&page=%PAGE%",
			art: "/posts/%ID%.xml",
			wikipage: "/wiki_pages/%TAG%",
			autocomplete: "/tags/autocomplete.json?search[name_matches]=%SEARCH_STRING%",
			pool: "/pools/%ID%.xml",
			restrictions: {
				maxtaglength: 2
			},
			elements: {
				arts: {
					base: "post",
					thumbnail: "post > preview-file-url"
				},
				art: {
					image: "file-url",
					thumbnail: "preview-file-url",
					pools: "pool-string",
					full: "large-file-url",
					tags: {
						copyrights: "tag-string-copyright",
						artist: "tag-string-artist",
						characters: "tag-string-character",
						misc: "tag-string-general",
						meta: "tag-string-meta"
					},
					banned: "is-banned",
					comments: null
				}
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
	parseArtByXMLString(string) {
		let doc = new DOMParser().parseFromString(string, "application/xml");
		let art;
        let thumb;
		let tags = {copyrights: [], artist: [], characters: [], misc: [], meta: []};
		let comments = [];
		let pools = [];
		if(doc.querySelector(this.ruleset.elements.art.full) == null) {
			if(doc.querySelector(this.ruleset.elements.art.banned).innerHTML === "true") throw new Error("Image is banned!");
			throw new Error("Image is inaccessible!");
		}
        art = doc.querySelector(this.ruleset.elements.art.full).innerHTML;
        thumb = doc.querySelector(this.ruleset.elements.art.thumbnail).innerHTML;
		if(art.substr(0, 1) === "/") art = this.ruleset.server+art;
        if(thumb.substr(0, 1) === "/") thumb = this.ruleset.server+thumb;
		if(!art) reject("Bad response");
		let poolTag = doc.querySelector(this.ruleset.elements.art.pools),
			copyrightsTag = doc.querySelector(this.ruleset.elements.art.tags.copyrights),
			charactersTag = doc.querySelector(this.ruleset.elements.art.tags.characters),
			artistTag = doc.querySelector(this.ruleset.elements.art.tags.artist),
			generalTag = doc.querySelector(this.ruleset.elements.art.tags.misc), //for some reasons, it is ruleset.elements.art.tags.misc and not general
			metaTag = doc.querySelector(this.ruleset.elements.art.tags.meta),
			id = doc.querySelector("id").innerHTML;
		if(poolTag !== null) poolTag.innerHTML.split(" ").forEach(item => { pools.push(item.replace("pool:", "")); });
		if(copyrightsTag !== null) copyrightsTag.innerHTML.split(" ").forEach(item => { tags.copyrights.push(new Tag(item)); });
		if(charactersTag !== null) charactersTag.innerHTML.split(" ").forEach(item => { tags.characters.push(new Tag(item)); });
		if(artistTag !== null) artistTag.innerHTML.split(" ").forEach(item => { tags.artist.push(new Tag(item)); });
		if(generalTag !== null) generalTag.innerHTML.split(" ").forEach(item => { tags.misc.push(new Tag(item)); });
		if(metaTag !== null) metaTag.innerHTML.split(" ").forEach(item => { tags.meta.push(new Tag(item)); });
		return new Art(id, art, thumb, pools, doc.querySelector("fav-count").innerHTML, new CommentCollection(comments), tags);
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
					resolve(that.parseArtByXMLString(response));
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
			that.xhr.setRequestHeader("if-none-match", "null");
			that.xhr.onreadystatechange = () => {
				if(that.xhr.readyState === XMLHttpRequest.DONE) {
					let response = that.xhr.responseText;
					let doc = new DOMParser().parseFromString(response, "application/xml");
					if(that.xhr.status!==200) {
						that.xhr = new XMLHttpRequest();
						if(doc.querySelector(that.ruleset.elements.error) == null) reject("Bad response");
						reject(doc.querySelector(that.ruleset.elements.error).innerText);
					}
					let arts = doc.querySelectorAll(that.ruleset.elements.arts.base);
					let collection = [];
					if(arts == null) reject("Nobody here but us chickens!");
					arts.forEach(art => {
						try {
						    collection.push(that.parseArtByXMLString(art.outerHTML));
						} catch(e) {
							if(e.message === "Image is banned!") console.warn("Some images on this page are banned, therefore can't be displayed"); return;
							window.plugins.toast.hide(); console.warn("Some images on this page could not be displayed :(");
						}
					});
					that.xhr = new XMLHttpRequest();
					resolve(new ArtCollection(1, collection));
				}
			};
			that.xhr.send();
		});
	}
	_getWikiPageByTag(tag) {
		return new Promise((resolve, reject) => {
			resolve(this.ruleset.server+this.ruleset.wikipage.replace("%TAG%", tag));
		});
	}
}