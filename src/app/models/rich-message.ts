export class MensajesBase {
    botImg: string = 'assets/images/lucy2.jpg';
    userImg: string = 'assets/images/avarUser.jpg';
    sentBy: string = 'lucy';
    sentOn = new Date().getTime;
}

export class RichMessage extends MensajesBase {

    type: string;
    imageUrl: string;
    text: string;
    videoUrl: string;
    audioUrl: string;
    webUrl: string;
    docUrl: string;
    chips: Chip[];
    codUser: string;
    constructor(o) {
        super();
        this.codUser = o.codUser;
        this.type = o.type;
        this.text = o.text;
        this.imageUrl = o.imageUrl;
        this.videoUrl = o.videoUrl;
        this.audioUrl = o.audioUrl;
        this.webUrl = o.webUrl;
        this.docUrl = o.docUrl;
        if (o.chips && o.chips.length) {
            this.chips = [];
            o.chips.forEach(chip => {
                this.chips.push(new Chip(chip));
            });
        }
        this.sentBy = o.sentBy;
    }
}

export class Chip {

    type: string;
    text: string;
    hintMsg: string;
    imageUrl: string;
    videoUrl: string;
    audioUrl: string;
    webUrl: string;
    docUrl: string;
    constructor(o) {
        this.type = o.type;
        this.text = o.text;
        this.imageUrl = o.imageUrl;
        this.videoUrl = o.videoUrl;
        this.audioUrl = o.audioUrl;
        this.webUrl = o.webUrl;
        this.docUrl = o.docUrl;
        this.hintMsg = o.hintMsg || o.input;
    }

}
