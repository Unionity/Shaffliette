class AbstractXMLModel {
    constructor(Model) {
        this.xml = new DOMParser().parseFromString(Model, "application/xml");
        this.xhr = new XMLHttpRequest();
        this.name = this.xml.querySelector("meta > name").textContent;
        this.ruleset = this._parseRuleset();
        this.ruleset.server = this.xml.querySelector("meta > base-url").textContent;
    }
    
    _normalizeURL(url) {
        if(url.substring(0, 1) === "/") {
            if(url.substring(0, 2) === "//") return url.replace("//", "http://");
            return this.ruleset.server + url;
        }
        return url;
    }
    
    _parsePostFromXMLString(xmlString) {
        let doc = new DOMParser().parseFromString(xmlString, "application/xml");
        let parseTagFromRuleset = tag => tag[1] ? doc.querySelector(tag[0]) === null ? null : doc.querySelector(tag[0]).textContent : doc.querySelector(this.ruleset.elements.art.base).getAttribute(tag[0]);
        let tags = {copyrights: [], artist: [], characters: [], misc: [], meta: []};
        let comments = [];
		let pools = [];
        if(parseTagFromRuleset(this.ruleset.elements.art.full) === null) {
            if(parseTagFromRuleset(this.ruleset.elements.art.banned) === "true") throw new Error("Image is banned!");
            throw new Error("Image is inaccessible!");
        }
        let image = this._normalizeURL(parseTagFromRuleset(this.ruleset.elements.art.full)),
        thumb = this._normalizeURL(parseTagFromRuleset(this.ruleset.elements.art.thumbnail));
        if(!image) throw new Error("Bad response");
        let poolTag = parseTagFromRuleset(this.ruleset.elements.art.pools),
            copyrightsTag = parseTagFromRuleset(this.ruleset.elements.art.tags.copyrights),
            charactersTag = parseTagFromRuleset(this.ruleset.elements.art.tags.characters),
            artistTag = parseTagFromRuleset(this.ruleset.elements.art.tags.artist),
            generalTag = parseTagFromRuleset(this.ruleset.elements.art.tags.misc), //for some reasons, it is ruleset.elements.art.tags.misc and not general
            metaTag = parseTagFromRuleset(this.ruleset.elements.art.tags.meta),
            id = doc.querySelector("id").textContent;
        if(poolTag !== null) poolTag.split(" ").forEach(item => { pools.push(item.replace("pool:", "")); });
        if(copyrightsTag !== null) copyrightsTag.split(" ").forEach(item => { tags.copyrights.push((item)); });
        if(charactersTag !== null) charactersTag.split(" ").forEach(item => { tags.characters.push((item)); });
        if(artistTag !== null) artistTag.split(" ").forEach(item => { tags.artist.push((item)); });
        if(generalTag !== null) generalTag.split(" ").forEach(item => { tags.misc.push((item)); });
        if(metaTag !== null) metaTag.split(" ").forEach(item => { tags.meta.push((item)); });
        return new Art(id, image, thumb, pools, doc.querySelector("fav-count").textContent, null, tags);
    }
    
    _parseArtCollectionFromDocument(doc) {
        let posts = doc.querySelectorAll(this.ruleset.elements.art.base);
        if(posts === null) return new ArtCollection([]);
        let collection = [];
        posts.forEach(post => {
            try {
                collection.push(this._parsePostFromXMLString(post.outerHTML));
            } catch(ex) {
                console.warn(`Could not parse post, therefore it has been skipped. The parser reported an error: ${ex.message}`);
            }
        });
        return new ArtCollection(collection);
    }
    
    async getArtCollectionByTags(tags, page = 1) {
        let tags;
        if(tag instanceof Tag) {
            tags = tag.name;
        } else if(tag instanceof TagCollection) {
            tags = tag.collection.join(" ");
        } else {
            throw new Error("Tags is not a collection or tag!");
        }
        //if(tags.split(" ")[0].substring(0, 1) === ":") return getArtCollectionByCommand(tags.split(" ")[0]);
        if(search === null) return new CommentCollection([]);
        let url = _normalizeURL(this.ruleset.search.replace("%tags%", tags).replace("%page%", page));
        this.xhr.open("GET", url);
        this.xhr.onreadystatechange = () => {
            if(this.xhr.readyState === XMLHttpRequest.DONE) {
                if(this.xhr.status !== 200) return this._handleError(response);
                let response = new DOMParser().parseFromString(this.xhr.responseText, "application/xml");
                return this._parseArtCollectionDocument(response);
            }
        }
        this.xhr.send();
    }
    
    _handleError(doc) {
        //TODO: handleError
        return new ArtCollection([]);
    }
    
    _parseRuleset() {
        let pe = (selector, relativeTo) => relativeTo.querySelector(selector) === null ? null : [relativeTo.querySelector(selector).textContent, relativeTo.querySelector(selector).getAttribute("t") == "element"];
        let getArtCollectionByTags = this.xml.querySelector("methods > getArtCollectionByTags"),
            getCommentsCollectionById = this.xml.querySelector("methods > getCommentsCollectionById"),
            getWikiPage = this.xml.querySelector("methods > getWikiPage");
        return {
            search: getArtCollectionByTags === null ? null : getArtCollectionByTags.querySelector("url").textContent,
            comments: getCommentsCollectionById === null ? null : getCommentsCollectionById.querySelector("url").textContent,
            wikipage: getWikiPage === null ? null : getWikiPage.querySelector("url").textContent,
            elements: {
                art: getArtCollectionByTags === null ? null : {
                    base: getArtCollectionByTags.querySelector("base-node").textContent,
                    image: pe("sample", getArtCollectionByTags),
                    thumbnail: pe("thumbnail", getArtCollectionByTags),
                    pools: pe("pools", getArtCollectionByTags),
                    full: pe("full", getArtCollectionByTags),
                    tags: {
                        copyrights: pe("tags > copyrights", getArtCollectionByTags),
                        artist: pe("tags > artist", getArtCollectionByTags),
                        characters: pe("tags > character", getArtCollectionByTags),
                        misc: pe("tags > general", getArtCollectionByTags),
                        meta: pe("tags > info", getArtCollectionByTags)
                    },
                    banned: pe("is-banned", getArtCollectionByTags)
                },
                comments: getCommentsCollectionById === null ? null : {
                    base: getCommentsCollectionById.querySelector("base-node").textContent,
                    score: pe("score", getCommentsCollectionById),
                    creator: pe("creator", getCommentsCollectionById),
                    updater: pe("updater", getCommentsCollectionById),
                    time: pe("time", getCommentsCollectionById),
                    id: pe("id", getCommentsCollectionById),
                    body: pe("body", getCommentsCollectionById)
                }
            }
        };
    }
}