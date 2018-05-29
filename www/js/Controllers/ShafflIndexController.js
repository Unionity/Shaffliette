class ShafflIndexController {
    addListeners() {
        $("#shaffl-moreActions, #shaffl-more, #shaffl-search, #shaffl-downloadSelected, #shaffl-settings, .shaffl-main, .shaffl-art--thumb, .shaffl-contextmenu-item").unbind();
        $(".shaffl-main").bind("scroll", function(){
            let el = $(this);
            if(el[0].scrollHeight - el.scrollTop() == el.outerHeight() && !window.loadCooling) {
                window.loadCooling = true; //prevent from constant loading
                $("#shaffl-more").click();
                window.setTimeout(() => { window.loadCooling = false; }, 1000);
            }
        });
        $(".shaffl-art--thumb").bind("click", event => {
            $(".shaffl-art--thumb[data-viewing=true]").attr("data-viewing", "false");
            event.target.dataset.viewing = "true";
            $("#shaffl-image-view, #shaffl-art-menu").show();
            $("#shaffl-collection-view, #shaffl-collection-menu").hide();
            $(".shaffl-main").css("overflow-y", "hidden");
            try {
                let artController = new ShafflArtController(Object.setPrototypeOf(JSON.parse(decodeURIComponent(event.target.dataset.art)), Art));
            } catch(e) {
                alert(e);
                alert(e.stack);
            }
        });
        $("#shaffl-more").bind("click", () => {
            this.offset++;
            this.append();
        });
        $(".shaffl-contextmenu-item").bind("click", event => {
            $("#shaffl-moreActions--menu").hide();
        });
        $("#shaffl-moreActions").bind("click", event => {
            if($("#shaffl-moreActions--menu").css("display") == "none") {
                $("#shaffl-moreActions--menu").show();
            } else {
                $("#shaffl-moreActions--menu").hide();
            }
        });
        $("#shaffl-selectAll").bind("click", () => {
            $(".shaffl-art--thumb").attr("data-selected", "selected");
        });
        $("#shaffl-unselectAll").bind("click", () => {
            $(".shaffl-art--thumb").attr("data-selected", "no");
        });
        $("#shaffl-invertChoice").bind("click", () => {
            let selected = $(".shaffl-art--thumb[data-selected=selected]");
            let unselected = $(".shaffl-art--thumb[data-selected=no]");
            selected.attr("data-selected", "no");
            unselected.attr("data-selected", "selected");
        });
        $("#shaffl-downloadSelected").bind("click", () => {
            this.download(true);
        });
        $("#shaffl-downloadAll").bind("click", () => {
            this.download(false);
        });
        $("#shaffl-settings").bind("click", () => {
            window.location.href = "settings.html";
        });
        $(".shaffl-art--thumb").bind("contextmenu", event => {
            if(event.target.dataset.selected == "selected") {
                event.target.dataset.selected = "no";
            } else {
                event.target.dataset.selected = "selected";
            }
            if(document.querySelectorAll(".shaffl-art--thumb[data-selected=selected]").length > 0) {
                $("#shaffl-downloadSelected").show();
            } else {
                $("#shaffl-downloadSelected").hide();
            }
            event.preventDefault();
        });
        $("#shaffl-search").bind("keydown", event => {
            if(event.keyCode === 13) {
                event.preventDefault();
                this.offset = 1;
                this.tags = new Tag(event.target.value);
                if(event.target.value.split(" ").length > 1) {
                    let collection = [];
                    event.target.value.split(" ").forEach(tag => {
                        collection.push(tag);
                    });
                    this.tags = new TagCollection(null, collection);
                }
                sessionStorage["tags"] = JSON.stringify(this.tags);
                this.model.getArtCollectionByTags(this.tags, this.offset).then(collection => {
                    this.view = new ShafflCollectionView(collection, $(".shaffl-collection-view"));
                    this.view.render(false);
                    this.addListeners();
                    $("html").css({cursor: "unset"});
                }).catch(err => {
                    $(".shaffl-collection-view").html("<em>"+err+"</em>");
                });
            } else if(event.keyCode === 9) event.preventDefault();
        });
    }
    download(selectedOnly = true) {
        let arts = [];
        let loaded = 0;
        let selector = selectedOnly ? ".shaffl-art--thumb[data-selected=selected]" : ".shaffl-art--thumb";
        document.querySelectorAll(selector).forEach(selected => {
            arts.push(Object.setPrototypeOf(JSON.parse(decodeURIComponent(selected.dataset.art)), Art));
        });
        cordova.plugin.pDialog.init({
            theme : "TRADITIONAL",
            progressStyle : "HORIZONTAL",
            cancelable : false,
            title : "",
            message : "Downloading..."
        });
        let DOWNLOAD_PATH = cordova.file.externalRootDirectory+"Pictures/";
        let downloadMgr = new DownloadManager(arts, DOWNLOAD_PATH);
        downloadMgr.downloadAll(event => {
            if(event == "saved") {
                loaded++;
                if(loaded === arts.length) window.setTimeout(() => {cordova.plugin.pDialog.dismiss();navigator.notification.beep(1);}, 500);
                cordova.plugin.pDialog.setProgress(100/arts.length*loaded);
            }
        });
    }
    append() {
        $("html").css({cursor: "progress"});
        this.model.getArtCollectionByTags(this.tags, this.offset).then(collection => {
            this.view = new ShafflCollectionView(collection, $(".shaffl-collection-view"));
            this.view.render(true);
            this.addListeners();
            $("html").css({cursor: "unset"});
        });
    }
    init() {
        window.shafflCache = {};
        window.loadCooling = false;
        this.view.render(false);
        this.addListeners();
    }
    constructor() {
        this.offset = 1; //aka page
        this.tags = new Tag("");
        if(typeof sessionStorage["tags"] !== "undefined") {
            let tags = JSON.parse(sessionStorage["tags"]);
            if(typeof tags.collection !== "undefined") {
                this.tags = new TagCollection(null, tags.collection);
            } else {
                this.tags = new Tag(tags.name);
            }
            if(this.tags instanceof TagCollection) {
                $("#shaffl-search").val(this.tags.collection.join(" "));
            } else {
                $("#shaffl-search").val(this.tags.name);
            }
        }
        this.settings = new Settings();
        this.settings.getModelXML().then(model => {
            this.model = new AbstractXMLModel(model);
            console.log(this.model);
            $("html").css({cursor: "wait"});
            this.model.getArtCollectionByTags(this.tags, 1).then(collection => {
                this.view = new ShafflCollectionView(collection, $(".shaffl-collection-view"));
                this.init();
                $("html").css({cursor: "unset"});
            }).catch(e => {
                console.error(`Error, while retrieving art list: ${e.message}\nStack trace:\n${e.stack}`);
            });
        });
    }
}
