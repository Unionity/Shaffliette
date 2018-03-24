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
			$("body").append(`<dialog id=shaffl-settingsDialog title='Settings'>
			                        <em>Changes are saved automatically</em><br/>
									<label>Default source: </label><select onchange='new Settings().set(\"model\", this.value).then(() => { console.log(\"settings saved\"); });' >
									    <optgroup label='Danbooru'>
										    <option value='BooruModel'>Danbooru</option>
											<option value='BooruDOMModel'>Danbooru (alternative)</option>
											<option value='SafeBooruModel'>Safebooru</option>
									    </optgroup>
										<option value='KonachanModel'>Konachan</option>
										<!--<option value='ThreeDBooruModel'>3dBooru</option>-->
										<option value='XBooruModel'>XBooru</option>
										<option value='YukkuriModel'>One Yukkuri Place</option>
										<option value='GelbooruModel'>Gelbooru</option>
										<!--<option value='YandereJSONModel'>Yande.re</option>-->
									</select><br/>
									<label>Browsing History: </label><select readonly onchange='new Settings().set(\"model\", this.value).then(() => { console.log(\"settings saved\"); });' >
									    <option value='preserve'>Enable</option>
										<option value='disable'>Disable</option>
									</select><hr/>
									<section id=shaffl-settingsDialog--history>
									</section>
									<br/><hr/>
									<a href='about.html' class='hotblack'>Shaffl version: v0.0.1.5-pre Mobile Edition (26.03.18)</a>
								</dialog>`);
		    $("dialog").dialog({resizable: false, modal: true, draggable: false, show: {effect: "blind", duration: 500}, height: "auto", width: 400});
			let db = openDatabase("Shaffl_Settings", "1", "Shaffl settings.", 9007199254740991);
			if(!db) alert("Database fault");
			db.transaction(tx => {
				tx.executeSql("SELECT * FROM shaffl_history ORDER BY \"timestamp\" DESC", [], (tx, res) => {
					for(let i=0;i<res.rows.length;i++) {
						$("#shaffl-settingsDialog--history").append("<article onclick='window.open($(this).data(\"url\"), \"_system\");' data-url='"+res.rows[i].url+"' class='shaffl-historyEntry'><p>Art"+res.rows[i].name+"</p><time>"+moment(res.rows[i].timestamp).fromNow()+"</time></article><br/>");
					}
				});
			});
			$(".ui-dialog-titlebar-close").bind("click", () => { $(".ui-dialog, #shaffl-settingsDialog").remove(); });
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
		$("body").append("<dialog id=shaffl-downloadingDialog title=\"Downloading\">Downloading...<br/><progress min=\"1\" value=\"0\" max=\"100\"></progress></dialog>");
		$("#shaffl-status").text("Downloading");
		let DOWNLOAD_PATH = cordova.file.externalRootDirectory+"Pictures/";
		let downloadMgr = new DownloadManager(arts, DOWNLOAD_PATH);
		$("dialog").dialog({resizable: false, modal: true, draggable: false, show: {effect: "blind", duration: 500}, height: "auto", width: 400});
		downloadMgr.downloadAll(event => {
			if(event == "saved") {
				loaded++;
				if(loaded === arts.length) window.setTimeout(() => {$(".ui-dialog, #shaffl-downloadingDialog").remove();}, 500); $("#shaffl-status").text("Ready");
				let progress = 100/arts.length*loaded;
				$("#shaffl-downloadingDialog progress").val(progress);
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
		this.settings.get("model").then(model => {
		    this.model = eval("new "+model+"();"); //get model from settings and instanciate it
			$("html").css({cursor: "wait"});
			try {
				this.model.getArtCollectionByTags(this.tags, 1).then(collection => {
					this.view = new ShafflCollectionView(collection, $(".shaffl-collection-view"));
					this.init();
					$('#shaffl-search').autocomplete({
						minLegth: 1,
						source: (request, resolve) => {
							this.model.autocomplete(request.term).then(result => {
								resolve(result);
							});
						}
					});
					$("html").css({cursor: "unset"});
				});
			} catch(e) {
				alert(e);
				alert(e.stack);
			}
		});
	}
}