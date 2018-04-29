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
            if(url.substring(0, 2) === "//") return url.replace("//", this.ruleset.server.match(/htt(p|ps):\/\//g)[0]);
            return this.ruleset.server + url;
        }
        return url;
    }
    
    _parseCommentFromXMLString(string) {
        let doc = new DOMParser().parseFromString(string, "application/xml");
        let parseTagFromRuleset = tag => tag === null ? null : tag[1] ? doc.querySelector(tag[0]) === null ? null : doc.querySelector(tag[0]).textContent : doc.querySelector(this.ruleset.elements.comments.base).getAttribute(tag[0]);
        let creator = parseTagFromRuleset(this.ruleset.elements.comments.creator)+" ("+parseTagFromRuleset(this.ruleset.elements.comments.updater)+")";
        let body = parseTagFromRuleset(this.ruleset.elements.comments.body).replace(/\[quote\]/g, "<blockquote>").replace(/\[\/quote\]/g, "</blockquote>");
        let time = moment(parseTagFromRuleset(this.ruleset.elements.comments.time)).fromNow();
        return new Comment(creator, time, body);
    }
    
    _parsePostFromXMLString(xmlString) {
        let doc = new DOMParser().parseFromString(xmlString, "application/xml");
        let parseTagFromRuleset = tag => tag === null ? null : tag[1] ? doc.querySelector(tag[0]) === null ? null : doc.querySelector(tag[0]).textContent : doc.querySelector(this.ruleset.elements.art.base).getAttribute(tag[0]);
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
            id = parseTagFromRuleset(this.ruleset.elements.art.id);
        if(poolTag !== null) poolTag.split(" ").forEach(item => { pools.push(item.replace("pool:", "")); });
        if(copyrightsTag !== null) copyrightsTag.split(" ").forEach(item => { tags.copyrights.push(new Tag(item)); });
        if(charactersTag !== null) charactersTag.split(" ").forEach(item => { tags.characters.push(new Tag(item)); });
        if(artistTag !== null) artistTag.split(" ").forEach(item => { tags.artist.push(new Tag(item)); });
        if(generalTag !== null) generalTag.split(" ").forEach(item => { tags.misc.push(new Tag(item)); });
        if(metaTag !== null) metaTag.split(" ").forEach(item => { tags.meta.push(new Tag(item)); });
        return new Art(id, image, thumb, pools, doc.querySelector("fav-count") === null ? 0 : doc.querySelector("fav-count").textContent, null, tags);
    }
    
    _parseArtCollectionByDocument(doc) {
        let posts = doc.querySelectorAll(this.ruleset.elements.art.base);
        if(posts === null) return new ArtCollection(1, []);
        let collection = [];
        posts.forEach(post => {
            try {
                collection.push(this._parsePostFromXMLString(post.outerHTML));
            } catch(ex) {
                console.warn(`Could not parse post, therefore it has been skipped. The parser reported an error: ${ex.message}`);
            }
        });
        return new ArtCollection(1, collection);
    }
    
    _parseCommentCollectionByDocument(doc) {
        let comments = doc.querySelectorAll(this.ruleset.elements.comments.base);
        if(comments === null) return new CommentCollection([]);
        let collection = [];
        comments.forEach(comment => {
            try {
                collection.push(this._parseCommentFromXMLString(comment.outerHTML));
            } catch(ex) {
                console.warn(`Could not parse comment, therefore it has been skipped. The parser reported an error: ${ex.message}`);
            }
        });
        return new CommentCollection(collection);
    }
    
    getCommentCollectionById(post) {
        return new Promise((resolve, reject) => {
            let url = this._normalizeURL(this.ruleset.comments.replace("%id%", post));
            this.xhr.open("GET", url);
            this.xhr.onreadystatechange = () => {
                if(this.xhr.readyState === XMLHttpRequest.DONE) {
                    if(this.xhr.status !== 200) resolve(this._handleError(response));
                    let response = new DOMParser().parseFromString(this.xhr.responseText, "application/xml");
                    resolve(this._parseCommentCollectionByDocument(response));
                }
            }
            this.xhr.send();
        });
    }
    
    getArtCollectionByTags(tags, page = 1) {
        return new Promise((resolve, reject) => {
            if(tags instanceof Tag) {
                tags = tags.name;
            } else if(tags instanceof TagCollection) {
                tags = tags.collection.join(" ");
            } else {
                reject(new Error("Tags is not a collection or tag!"));
            }
            //if(tags.split(" ")[0].substring(0, 1) === ":") resolve( getArtCollectionByCommand(tags.split(" ")[0]);
            if(this.ruleset.search === null) resolve(new ArtCollection(1, []));
            let url = this._normalizeURL(this.ruleset.search.replace("%tags%", tags).replace("%page%", page));
            this.xhr.open("GET", url);
            this.xhr.onreadystatechange = () => {
                if(this.xhr.readyState === XMLHttpRequest.DONE) {
                    if(this.xhr.status !== 200) resolve(this._handleError(response));
                    let response = new DOMParser().parseFromString(this.xhr.responseText, "application/xml");
                    resolve(this._parseArtCollectionByDocument(response));
                }
            }
            this.xhr.send();
        });
    }
    
    _handleError(doc) {
        //TODO: handleError
        return new ArtCollection(1, []);
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
                    id: pe("id", getArtCollectionByTags),
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