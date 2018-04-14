class AbstractGelbooruAPIModel extends AbstractDanbooruAPIModel {
	constructor(server) {
		super();
		this.ruleset.server = server;
		this.ruleset.search = "/index.php?page=dapi&s=post&q=index&limit=20";
		this.ruleset.art = "/index.php?page=dapi&s=post&q=index&id=%ID%";
        this.ruleset.comments = "/index.php?page=dapi&s=comment&q=index&post_id=%ID%";
        this.ruleset.elements.comments = {
            base: "comment",
            creator: "creator",
            time: "created_at",
            id: "id",
            body: "body"
        };
	}
    getCommentCollectionById(post) {
        return new Promise((resolve, reject) => {
			this.xhr.open("GET", this.ruleset.server+this.ruleset.comments.replace("%ID%", post));
            this.xhr.onreadystatechange = () => {
                if(this.xhr.readyState === XMLHttpRequest.DONE) {
                    let response = this.xhr.responseText;
                    let doc = new DOMParser().parseFromString(response, "application/xml");
                    if(this.xhr.status!==200) {
                        this.xhr = new XMLHttpRequest();
                        if(doc.querySelector(this.ruleset.elements.error) == null) reject("Bad response");
                        reject(doc.querySelector(this.ruleset.elements.error).innerText);
                    }
                    let comments = doc.querySelectorAll(this.ruleset.elements.comments.base);
                    let collection = [];
                    comments.forEach(comment => {
                        collection.push(this.parseCommentByXMLString(comment.outerHTML));
                    });
                    this.xhr = new XMLHttpRequest();
                    resolve(new CommentCollection(collection));
                }
            };
			this.xhr.send();
		});
    }
}