class Note {
    constructor(x, y, w, h, d) {
        this.x = x; //X padding
        this.y = y; //Y padding
        this.w = w; //Width
        this.h = h; //Height
        this.d = d; //Data
    }
    relatify(s1, s2) {
        let mp = (s2/(s1/100))/100;
        this.x = this.x*mp;
        this.y = this.y*mp;
        this.w = this.w*mp;
        this.h = this.h*mp;
        return true;
    }
}