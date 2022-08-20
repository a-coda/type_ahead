/**
 * Tiny in-browser search engine.
 * See http://a-coda.tumblr.com/
 */
 
module SearchMe {
    interface FileSet {
        [filename:string]:File;
    }
 
    var index: {[word:string]:FileSet} = {};
 
    function isFileAPISupported (): boolean {
        return this.File && this.FileReader && this.FileList && this.Blob;
    }
 
    if (isFileAPISupported()) {
        document.getElementById('fileinput').addEventListener('change', startIndexingFiles, false);
        document.getElementById('searchinput').addEventListener('input', searchIndex, false);
    } else {
        alert('The JavaScript File API is not supported in your browser');
    }
 
    function startIndexingFiles(e: Event): void {
        var fs = (<HTMLInputElement>e.target).files; 
        if (fs) {
            for (var i=0, f; f=fs[i]; i++) {
                var r = new FileReader();
                r.onload = (function(f) { return function(e) { indexFile(e, f); }; })(f);
                r.readAsText(f);
            }   
        } else {
            alert("Failed to index any files"); 
        }
    }
 
    function indexFile(e: Event, f: File): void {
        var nWords = indexContents((<FileReader>e.target).result, f);
        document.getElementById('statistics').innerHTML = "Found " + Object.keys(index).length + " words";
    }
 
    function searchIndex(e: Event): void {
        var results = ""
        var text = (<HTMLInputElement>document.getElementById('searchinput')).value;
        var ks = text.split(/\s+/);
        var files = lookupKeywords(ks);
        if (Object.keys(files).length > 0) {
            results = Object.keys(files).map(function (f) { return "<li>" + f + "</li>"; }).join("");
        } else {
            results = "<li>Not found</li>";
        }
        document.getElementById('results').innerHTML = results;
    }
 
    function indexContents(contents: string, f: File): number {
        var words = contents.split(/\s+/);
        for (var i=0, w; w=words[i] && standardize(words[i]); i++) {
            var entry = index[w];
            if (!entry) {
                entry = <FileSet>{};
                index[w] = entry;
            }
            entry[f.name]=f;
        }
        return Object.keys(index).length
    }
 
    function lookupKeywords(ks: string[]): FileSet {
        return ks.map((keyword) => index[standardize(keyword)] || <FileSet>{})
                 .reduce((files1, files2) => intersect(files1, files2));
    }
 
    function intersect (as: FileSet, bs: FileSet): FileSet {
        var cs: FileSet = {};
        for (var a in as) {
            if (a in bs) {
                cs[a] = as[a];
            }
        }
        return cs;
    }
 
    function standardize (word: string): string {
        return word.toLowerCase();
    }
}
