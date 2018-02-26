class AbstractModel {
	constructor(ruleset) {
		this.xhr = new XMLHttpRequest();
		this.url = window.location.protocol+"//"+window.location.host;
		this.ruleset = ruleset;
	}
	autocomplete(string) {
		
	}
	getPoolById(id = 1, page = 1) {
		
	}
	getArtById(id = 1) {
		
	}
	getArtCollectionByTags(tag, page = 1) {
		
	}
}