class ShafflNotesView {
    constructor(notes, el) {
        this.notes = notes;
        this.el = el;
    }
    render(append) {
        this.el.attr("data-model", "ShafflNotesView");
        if(!append) this.el.html("");
        this.notes.collection.forEach(note => {
            note.relatify($("#shaffl-art-image")[0].width, $("#shaffl-art-image")[0].naturalWidth);
            let style = `left: ${note.x}px; top: ${note.y}px; width: ${note.w}px; height: ${note.h}px;`;
            this.el.prepend(`<article style='${style}' data-d='${encodeURIComponent(note.d)}' class='shaffl-note'>&nbsp;</article>`);
        });
    }
}
