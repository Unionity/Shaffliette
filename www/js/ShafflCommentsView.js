class ShafflCommentsView {
    constructor(comments, el) {
		this.comments = comments;
		this.el = el;
	}
	render(append) {
        if(!append) this.el.html("");
        this.comments.collection.forEach(comment => {
            $(el).append(`<article class="comment">${comment.content}<em>&#x2014; ${comment.author}, ${comment.time}</em></article>`);
        });
    }
}