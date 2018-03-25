class HypnoModel extends AbstractDanbooruAPIModel {
	constructor() {
		super("https://hypnohub.net");
		this.name = "HH";
		this.ruleset.search = "/post.xml?tags=%SEARCH_STRING%&limit=20";
		this.ruleset.page = "&page=%PAGE%";
	}
}