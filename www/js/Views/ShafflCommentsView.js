class ShafflCommentsView {
    constructor(comments, el) {
		this.comments = comments;
		this.el = el;
	}
	render(append) {
        if(!append) this.el.html("");
        this.comments.collection.forEach(comment => {
            this.el.append(`<article class="comment">${comment.content}<br/><em>&#x2014; ${comment.author}, ${comment.time}</em></article><br/>`);
        });
    }
}