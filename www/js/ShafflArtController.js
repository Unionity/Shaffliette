class ShafflArtController {
	addListeners() {
		$("#shaffl-download, #shaffl-copyImage, #shaffl-moreInfo, #shaffl-share, #shaffl-previous, #shaffl-next, .shaffl-logo, .shaffl-tag").unbind();
		$("#shaffl-download").bind("click", () => { this.save(); });
		$("#shaffl-share").bind("click", () => { this.share(); });
		$("#shaffl-copyImage").bind("click", () => { this.copy(); });
		$(".shaffl-tag").bind("click", event => {
			navigator.notification.confirm("What would you like to do with this tag?", button => {
				if(button === 1) {
					this.model._getWikiPageByTag($(event.target).text()).then(wiki => {
					    window.open(wiki, "_system");
					});
				} else {
					let e = jQuery.Event("keydown");
					e.which = 13;
					$("#shaffl-search").val($(event.target).text());
					$("#shaffl-search").trigger(e);
					$(".shaffl-logo").click();
				}
			}, $(event.target).text(), ["Wiki", "Search"]);
		});
		$("#shaffl-moreInfo").bind("click", () => {
			$(".shaffl-image-container").toggle();
			$(".shaffl-image-info").toggle();
		});
		$(".shaffl-logo").bind("click", () => {
			$("#shaffl-image-view, #shaffl-art-menu").hide();
			$("#shaffl-collection-view, #shaffl-collection-menu").show();
			$(".shaffl-main").css("overflow-y", "scroll");
		});
		document.addEventListener("backbutton", () => {
			$("#shaffl-image-view, #shaffl-art-menu").hide();
			$("#shaffl-collection-view, #shaffl-collection-menu").show();
			$(".shaffl-main").css("overflow-y", "scroll");
			return false;
		}, false);
		$("#shaffl-previous").bind("click", () => {
			let currentImage = $(".shaffl-art--thumb[data-viewing=true]");
			currentImage.attr("data-viewing", "false");
			if(currentImage.prev().data("art") !== undefined) {
				currentImage.prev().attr("data-viewing", "true");
				let artObject = Object.setPrototypeOf(JSON.parse(decodeURIComponent(currentImage.prev().get(0).dataset.art)), Art);
				this.id = artObject.id;
				this.art = artObject;
				this.view = new ShafflArtView(artObject, $(".shaffl-image-container"));
				this.init();
			}
		});
		$("#shaffl-next").bind("click", () => {
			let currentImage = $(".shaffl-art--thumb[data-viewing=true]");
			currentImage.attr("data-viewing", "false");
			if(currentImage.next().data("art") !== undefined) {
				currentImage.next().attr("data-viewing", "true");
				let artObject = Object.setPrototypeOf(JSON.parse(decodeURIComponent(currentImage.next().get(0).dataset.art)), Art);
				this.id = artObject.id;
				this.art = artObject;
				this.view = new ShafflArtView(artObject, $(".shaffl-image-container"));
				this.init();
			}
		});
	}
	log() {
		let db = openDatabase("Shaffl_Settings", "1", "Shaffl settings.", 9007199254740991);
		if(!db) alert("Could not open history");
		db.transaction(tx => {
			let timestamp = Date.now();
			tx.executeSql(`INSERT INTO shaffl_history ('name', 'url', 'timestamp') VALUES ("`+"#"+this.id+`", "${this.art.url}", ${timestamp})`);
		});
	}
	copy() {
		$("#shaffl-status").text("Copying");
		cordova.plugins.clipboard.copy(this.art.url);
		window.plugins.toast.showShortCenter("☑ Copied!");
		$("#shaffl-status").text("Ready");
	}
	save() {
		return new Promise((resolve, reject) => {
			let filename = this.id+".jpeg"; //maybe wrong, but ok
			$("#shaffl-status").text("Downloading");
			window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory+"Pictures/", directory => {
				directory.getFile(filename, {create: true}, file => {
					file.createWriter(writer => {
						writer.onwriteend = () => {
							window.plugins.toast.showShortCenter("File saved: "+cordova.file.externalRootDirectory+"Pictures/"+filename+".");
							$("#shaffl-status").text("Ready");
							resolve(true);
						};
						writer.onerror = navigator.app.exitApp;
						writer.write(this.imageBlob);
					}, navigator.app.exitApp);
				}, navigator.app.exitApp);
			}, navigator.app.exitApp);
		});
	}
	share() {
		this.save().then(() => {
			window.plugins.socialsharing.shareWithOptions({
				files: [cordova.file.externalRootDirectory+"Pictures/"+this.id+".jpeg"],
				url: this.art.url,
				chooserTitle: 'Share with...'
			});
		});
	}
	init() {
		this.view.render(false);
		$("#shaffl-status").text("Loading");
		let xhr = new XMLHttpRequest();
		xhr.open("GET", this.art.url, true);
		xhr.setRequestHeader("Server", "Shaffl Media Server");
		xhr.responseType = "blob";
		xhr.onreadystatechange = () => {
			if(xhr.readyState === XMLHttpRequest.DONE) {
				if(xhr.status == 200) {
					this.imageBlob = xhr.response;
					let image = window.URL.createObjectURL(this.imageBlob);
					$("#shaffl-art-image").attr("src", image);
					$("#shaffl-bgblur").get(0).style = "background-image: url("+image+");";
					$(".shaffl-actionButton").css({visibility: "visible"});
					this.log();
					$("#shaffl-status").text("Ready");
				} else {
					$("#shaffl-status").text("An error occured");
				}
			}
		};
		xhr.send();
		this.addListeners();
	}
	constructor(art) {
		$("html").css({cursor: "wait"});
		this.art = art;
		this.id = art.id;
		this.view = new ShafflArtView(art, $(".shaffl-image-container"));
		this.init();
		$("html").css({cursor: "unset"});
	}
}