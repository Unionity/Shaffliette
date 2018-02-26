class AbstractGelbooruAPIModel extends AbstractDanbooruAPIModel {
	constructor(server) {
		super();
		this.ruleset.server = server;
		this.ruleset.search = "/index.php?page=dapi&s=post&q=index&limit=20";
		this.ruleset.art = "/index.php?page=dapi&s=post&q=index&id=%ID%";
	}
}