class DownloadManager {
	constructor(arts, path, interval) {
		this.arts = arts;
		this.path = path;
		this.interval = interval;
	}
	downloadAll(callback) {
		let that = this;
		return new Promise((resolve, reject) => {
			let i = 0;
			let downloadJob = window.setInterval(() => {
				if(i>=(this.arts.length-1)) window.clearInterval(downloadJob);
				let xhr = new XMLHttpRequest();
				let art = this.arts[i];
				xhr.open("GET", art.url, true);
				xhr.responseType = "blob";
				xhr.onreadystatechange = () => {
					if(xhr.readyState === XMLHttpRequest.DONE) {
						if(xhr.status == 200) {
							this.imageBlob = xhr.response;
							window.resolveLocalFileSystemURL(this.path, directory => {
								directory.getFile(art.id+"."+xhr.getResponseHeader("content-type").replace(/[\s\S]*\//g, ""), {create: true}, file => {
									file.createWriter(writer => {
										writer.onwriteend = () => {
											callback("saved");
										};
										writer.onerror = navigator.app.exitApp;
										writer.write(this.imageBlob);
									}, navigator.app.exitApp);
								}, navigator.app.exitApp);
							}, navigator.app.exitApp);
						} else {
							callback("error");
						}
					}
				};
				xhr.send();
				i++;
			}, 1500);
			resolve(true);
		});
	}
}