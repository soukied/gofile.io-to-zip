// ==UserScript==
// @name         Gofile.io to Zip
// @namespace    https://github.com/soukied/gofile.io-to-zip
// @version      0.3
// @description  Plugin for a functional 'Create Zip' feature on Gofile.io
// @author       Adhya Adam Sulthan
// @updateURL	 https://raw.githack.com/soukied/gofile.io-to-zip/main/gofileio2zip.meta.js
// @downloadURL	 https://raw.githack.com/soukied/gofile.io-to-zip/main/gofileio2zip.js
// @match        https://gofile.io/d/*
// @icon         https://raw.githubusercontent.com/soukied/gofile.io-to-zip/main/gofileio-icon.png
// @grant        none
// ==/UserScript==

(function() {
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.5.0/jszip.min.js");
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/amcharts/3.21.15/plugins/export/libs/FileSaver.js/FileSaver.min.js");
    let downloading = false;
    let loadingCircle = new Image(31, 31);
    loadingCircle.src = "https://raw.githubusercontent.com/soukied/gofile.io-to-zip/main/loading-circle.gif";
    loadingCircle.style.display = "none";
    let downloadButton = document.createElement("button");
    let progressLabel = document.createElement("span");
    progressLabel.style.display = "none";
    progressLabel.style.marginLeft = progressLabel.style.marginRight = "5px";
    downloadButton.className = "btn btn-primary btn-sm";
    downloadButton.innerText = "Create Zip";
    downloadButton.onclick = () => {
        if (downloading) return;
        downloading = true;
        downloadButton.disabled = true;
        loadingCircle.style.display = "initial";
        progressLabel.style.display = "initial";
        let urlDatas= []
        for (let s of document.querySelectorAll("#datatable > tbody > tr > td > a.download")) {
            urlDatas.push(s.href);
        }
        downloadFile(urlDatas).then(()=>{
            downloading = false;
            downloadButton.disabled = false;
            loadingCircle.style.display = "none";
            progressLabel.style.display = "none";
            progressLabel.innerText = "";
        });
    }
    let table_el = null;
    let zipButtonDownload = null;
    let loopCheck = setInterval(()=>{
        table_el = document.getElementById("datatable");
        if (table_el !== null) {
            clearInterval(loopCheck);
            main();
        }
    }, 1000/30);
    function getTarget(str) {
        let arrstr = str.split("/");
        return arrstr[arrstr.length-1];
    }
    function URLtoArrayBuffer(url) {
        return new Promise((resolve)=>{
            let request = new XMLHttpRequest();
            request.responseType = "arraybuffer";
            request.onreadystatechange = () => {
                if (request.readyState == 4 && request.status == 200) resolve(request.response);
            };
            request.open("GET", url);
            request.send('');
        });
    }
    async function downloadFile(urls) {
        let zip = new JSZip();
        let num = 0;
        for (let url of urls) {
            progressLabel.innerText = `${num++}/${urls.length} file(s) downloaded`;
            zip.file(getTarget(url), await URLtoArrayBuffer(url), {binary:true});
        }
        progressLabel.innerText = "Downloading file...";
        zip.generateAsync({type:"blob"})
            .then(function(content) {
            saveAs(content, getTarget(location.pathname) + ".zip");
        });
    }
    function main() {

        zipButtonDownload = document.getElementById("createZipBtn");
        let headRow = zipButtonDownload.parentElement;
        headRow.removeChild(zipButtonDownload);
        headRow.appendChild(downloadButton);
        headRow.appendChild(progressLabel);
        headRow.appendChild(loadingCircle);
    }
    function loadScript(src) {
        let el_script = document.createElement("script");
        el_script.src = src;
        document.head.appendChild(el_script);
    }
    window.URLtoArrayBuffer = URLtoArrayBuffer;
})();
