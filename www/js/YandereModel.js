class YandereModel extends AbstractDanbooruAPIModel {
	constructor() {
		super("https://yande.re");
		this.name = "YAN";
		this.ruleset.search = "/post.xml?tags=%SEARCH_STRING%&limit=20";
		this.ruleset.page = "&page=%PAGE%";
	}
}