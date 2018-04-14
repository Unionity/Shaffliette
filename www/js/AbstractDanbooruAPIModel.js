class AbstractDanbooruAPIModel extends AbstractModel {
	constructor(server) {
		super();
		this.ruleset = {
			server: server,
			search: "/post/index.xml?tags=%SEARCH_STRING%&limit=20",
			page: "&pid=%PAGE%",
			art: "/post/index.xml?page=dapi&s=post&q=index&id=%ID%",
			autocomplete: "/autocomplete.php?q=%SEARCH_STRING%",
			getArtByPage: false,
			pool: null,
			restrictions: {
				maxtaglength: 2
			},
			elements: {
				arts: {
					base: "post",
					thumbnail: "preview_url"
				},
				art: {
					image: "sample_url",
					thumbnail: "preview_url",
					pools: null,
					full: "file_url",
					tags: {
						misc: "tags"
					},
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
		//TODO
	}
	parseArtByXMLString(string) {
		let doc = new DOMParser().parseFromString(string, "application/xml");
		let art;
		let tags = {misc: []};
		if(doc.querySelector(this.ruleset.elements.arts.base).getAttribute(this.ruleset.elements.art.full).substr(0, 1) === "/") {
			art = this.ruleset.server+doc.querySelector(this.ruleset.elements.arts.base).getAttribute(this.ruleset.elements.art.full);
		} else {
			art = doc.querySelector(this.ruleset.elements.arts.base).getAttribute(this.ruleset.elements.art.full);
		}
		if(!art) reject("Bad response");
		doc.querySelector(this.ruleset.elements.arts.base).getAttribute(this.ruleset.elements.art.tags.misc).split(" ").forEach(item => { tags.misc.push(new Tag(item)); });
		return new Art(doc.querySelector(this.ruleset.elements.arts.base).getAttribute("id"), art, doc.querySelector(this.ruleset.elements.arts.base).getAttribute(this.ruleset.elements.art.thumbnail), null, null, null, tags);
	}
    parseCommentByXMLString(string) {
        let doc = new DOMParser().parseFromString(string, "application/xml");
        let comment = doc.querySelector(this.ruleset.elements.comments.base);
        let creator = comment.getAttribute(this.ruleset.elements.comments.creator);
        let body = comment.getAttribute(this.ruleset.elements.comments.body);
        let time = moment(comment.getAttribute(this.ruleset.elements.comments.time)).fromNow();
        return new Comment(creator, time, body);
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
					resolve(that.parseArtFromXMLString(response));
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
						collection.push(that.parseArtByXMLString(art.outerHTML));
					});
					that.xhr = new XMLHttpRequest();
					resolve(new ArtCollection(1, collection));
				}
			};
			that.xhr.send();
		});
	}
    getCommentCollectionById(post) {
        console.warn("Unimplemented!");
        return new Promise(resolve => resolve(new CommentCollection([])));
    }
}