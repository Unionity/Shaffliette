class ThreeDBooruModel extends AbstractDanbooruAPIModel {
    constructor() {
        super("http://behoimi.org");
		this.name = "TDB";
		this.ruleset.page = "&page=%PAGE%";
    }
}