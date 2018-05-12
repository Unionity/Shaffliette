class Note {
    constructor(x, y, w, h, d) {
        this.x = x; //X padding
        this.y = y; //Y padding
        this.w = w; //Width
        this.h = h; //Height
        this.d = d; //Data
    }
    relatify(scaled, original) {
        let mp = Math.fround(scaled/original);
        this.x = Math.fround(this.x*mp);
        this.y = Math.fround(this.y*mp);
        this.w = Math.fround(this.w*mp);
        this.h = Math.fround(this.h*mp);
        return true;
    }
}