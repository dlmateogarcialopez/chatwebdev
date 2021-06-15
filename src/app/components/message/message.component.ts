import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Chip } from 'src/app/models/rich-message';
import { DialogflowService } from 'src/app/services/dialogflow.service';
import Swal from 'sweetalert2';
import * as $ from 'jquery';
import * as moment from 'moment'
//import * as L from 'leaflet';



// variable para que angular no muestre error, pues el metodo que usa viene un archivo js, en assets
declare const pdfToImg: any;

//filesaver es una libreria usada para descargar los pdf de otro servicio
declare var require: any;
const FileSaver = require('file-saver');
declare const L: any;
const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
const iconUrl = 'assets/images/marker-icon.png';
const MyiconUrl = 'assets/images/marker-icon_red.png';
const shadowUrl = 'assets/images/marker-shadow.png';
const iconUrl_init = 'assets/images/marker-icon_green.png';
var LeafIcon = L.Icon.extend({
  options: {
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    shadowSize: [41, 41],
    iconAnchor: [12, 41],
    shadowAnchor: [4, 62],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
  },
});
let greenIcon = new LeafIcon({ iconUrl: iconUrl_init });
let redIcon = new LeafIcon({ iconUrl: MyiconUrl });

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {


  public today = new Date();//para mostrar las horas en el chat
  public imagenDescarga: boolean = false;//flag para controlar que los iconos de descarga solo salgan en los mensajes que vienen con pdf
  public cargaYdescarga = "./assets/images/web.png";//falg para cambiar de imagen(de descarga a carga)
  public mensajeCuenta = false;
  public distance: number = 300    // 5.042848, -75.478340, -75.522120, 5.071584
  public mapa = false;
  public map

  @Input() message;
  @ViewChild('descarga') descarga; //controlar algunos atributos css
  @ViewChild('ovalo') ovalo; //controlar algunos atributos css
  constructor(private _dfs: DialogflowService) { }

  ngOnInit(): void {
    this.getCurrentLocation(this.message.codUser);
    if (this.message.text == 'Interrupción de Energía⚡') {
      //this.getCurrentLocation(this.message.codUser);
    }
    //controal cuando se va a mostrar los iconos de descarga
    if (this.message.docUrl) {

      var name = this.message.docUrl.split(".");


      if (name[0] == "https://chatbotchecserver" || name[0] == "https://adminchecweb") {
        this.imagenDescarga = true;
      }

      //cada que dialogflow retorne un documento, se va a ejecutar esta funcion, que sirve para mostrar la factura en el chat
      //funciona para mostrar imagenes en un canvas
      /*if (name[0] == "https://chatbotchecserver") {
        pdfToImg(this.message.docUrl);
        console.log("chatbotCHECUsuarios");

      } else if (name[0] == "https://adminchecweb") {
        var url = 'https://cors-lucy.herokuapp.com/' + this.message.docUrl;
        pdfToImg(url);
      }*/

    }
    this.limpiarMapa();
    this.dispararMapa(this.message.text);

    if (this.message.text.length == 9) {
      var cadena = `${this.message.text}`;
      var result = /^[0-9]*$/.test(cadena);
      if (result) {
        this.mensajeCuenta = true;
      }
    }
  }

  dispararMapa(message) {
    let separarFrase = message.split("(");
    let frase = separarFrase[0];
    if (frase == '¿Esta es tu ubicación con respecto al municipio donde te encunetras') {
      //this.getCurrentLocation(this.message.codUser);
      this.mapa = true;
    } else {
      this.mapa = false;
    }
  }

  limpiarMapa() {
    var container = L.DomUtil.get('map');
    if (container != null) {
      container.outerHTML = "";
    }
  }

  getCurrentLocation(codUser) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {

        let coordenadas = [position.coords.latitude, position.coords.longitude];

        //guardar cooredenadas
        this._dfs.saveCoordinates(coordenadas, codUser, this.distance).subscribe(
          res => {

            //Configuración inicial de leaflet
            let mymap = L.map('map').setView(coordenadas, 16);

            L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWF0ZW9nYXJjaWFsb3BleiIsImEiOiJja2w0b2JjY3cwdWpyMzJucjB2eGtqeGgyIn0.P1krDgOx17o2CvwOYCTzPA', {
              maxZoom: 18,
              id: 'mapbox/streets-v11',
              tileSize: 512,
              zoomOffset: -1,
              accessToken: 'your.mapbox.access.token'
            }).addTo(mymap);

            //posicion actual
            let marker = L.marker(coordenadas).addTo(mymap);
            var cadenaNodo = `` + `<span>Posición Actual</span>`;
            marker.bindTooltip(cadenaNodo).openTooltip();
            marker.setIcon(redIcon);

            //nodos
            this.makeCapitalMarkers(mymap, this.distance, coordenadas);

            //Circulo
            var circle = L.circle(coordenadas, {
              color: 'red',
              fillColor: '#f03',
              fillOpacity: 0.5,
              radius: 100
            }).addTo(mymap);
          },
          err => {
            console.log(err);
          }
        );
      });
    }
    else {
      alert("Geolocation is not supported by this browser.");
    }
  }


  makeCapitalMarkers(map, distance, coordenates) {
    let coordenadas = [coordenates[1], coordenates[0]];
    this._dfs.makeCapitalMarkers(distance, coordenadas).subscribe(
      res => {
        //console.log('res', res);
        for (const c of res) {
          const lon = c.latitud;
          const lat = c.longitud;
          const marker = L.marker([lat, lon]).addTo(map); //puntos de atención
          marker.setIcon(greenIcon);
          var cadenaNodo =
            `` +
            `<span>Nodo</span>`;
          marker.bindTooltip(cadenaNodo).openTooltip();

        }
      },
      error => {
        console.log(error);
      }
    );
  }

  makeCapitalPopup(data: any): string {
    var cadena = `` +
      `<h5><center>Punto de atención</center></h5>`
    return cadena
  }

  makeCirclePopup(radio: any): string {
    return `` +
      `<h3>Covertura de busqueda</h3>` +
      `<div><center>Radio: ${radio} metros </center></div>`
  }

  chipOperation(c) {
    if (c.text == 'Puntos de atención 🌎') {
      let d = new Date();
      let fecha = moment(d).format('YYYY-MM-DD h:mm:ss');
      let params = {
        interaction: 'puntos de atencion',
        fecha: fecha
      }
      //console.log(params);
      this._dfs.saveInteractionPointsOfAttention(params).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log(error);
        }
      );
    } else if (c.text == '👆 Registra aquí tu PQR') {
      let d = new Date();
      let fecha = moment(d).format('YYYY-MM-DD h:mm:ss');
      let params = {
        interaction: 'fpqr',
        fecha: fecha
      }
      //console.log(params);
      this._dfs.saveInteractionPointsOfAttention(params).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log(error);
        }
      );
    } else if (c.text == 'Habla con nuestro asesor remoto') {
      let d = new Date();
      let fecha = moment(d).format('YYYY-MM-DD h:mm:ss');
      let params = {
        interaction: 'fasesor_remoto',
        fecha: fecha
      }
      //console.log(params);
      this._dfs.saveInteractionPointsOfAttention(params).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log(error);
        }
      );
    } else if (c.text == 'Chatea con un asesor') {
      let d = new Date();
      let fecha = moment(d).format('YYYY-MM-DD h:mm:ss');
      let params = {
        interaction: 'fasesor_remoto_chat',
        fecha: fecha
      }
      //console.log(params);
      this._dfs.saveInteractionPointsOfAttention(params).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log(error);
        }
      );
    } else if (c.text == 'Ir a Pago en Línea') {
      let d = new Date();
      let fecha = moment(d).format('YYYY-MM-DD h:mm:ss');
      let params = {
        interaction: 'fpago_linea',
        fecha: fecha
      }
      //console.log(params);
      this._dfs.saveInteractionPointsOfAttention(params).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log(error);
        }
      );
    } else if (c.text == 'Cómo Pago en Línea') {
      let d = new Date();
      let fecha = moment(d).format('YYYY-MM-DD h:mm:ss');
      let params = {
        interaction: 'fcomo_pago_linea',
        fecha: fecha
      }
      //console.log(params);
      this._dfs.saveInteractionPointsOfAttention(params).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log(error);
        }
      );
    } else if (c.text == '😁Ver Ofertas de Empleo Chec') {
      let d = new Date();
      let fecha = moment(d).format('YYYY-MM-DD h:mm:ss');
      let params = {
        interaction: 'fvacantes',
        fecha: fecha
      }
      //console.log(params);
      this._dfs.saveInteractionPointsOfAttention(params).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log(error);
        }
      );
    } else if (c.text == '👆 Denunciar fraude') {
      let d = new Date();
      let fecha = moment(d).format('YYYY-MM-DD h:mm:ss');
      let params = {
        interaction: 'ffraude',
        fecha: fecha
      }
      //console.log(params);
      this._dfs.saveInteractionPointsOfAttention(params).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log(error);
        }
      );
    } else if (c.text == '👆 Puntos de recaudo') {
      let d = new Date();
      let fecha = moment(d).format('YYYY-MM-DD h:mm:ss');
      let params = {
        interaction: 'fpuntos_recaudo',
        fecha: fecha
      }
      //console.log(params);
      this._dfs.saveInteractionPointsOfAttention(params).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log(error);
        }
      );
    }

    if (c.hintMsg) {
      this._dfs.sentToBot({
        text: c.hintMsg,
        sentBy: 'human'
      })
    } else {
      window.open(c[c.type], '__blank');
    }

  }

  zoomImageInvoice() {
    //console.log('prueba factura');
  }

  //metodo para agrandar cierta imagen 
  zoomImage() {

    if (this.message.imageUrl == 'https://chatbotchecserver.com/chatbotCHECUsuarios/img/factura-creg.png') {
      Swal.fire({
        // title: 'Sweet!',
        //text: 'Modal with a custom image.',
        imageUrl: this.message.imageUrl,
        imageHeight: 200,
        imageWidth: 450,
        imageAlt: 'Custom image',
        confirmButtonColor: '#99be00',
      })
    }
  }

  //descargar la factura y cupon de pago
  /*downloadPdf(pdfUrl: string) {


    Promise.resolve().then(_ => this.cargaYdescarga = "./assets/images/loader.gif");

    var name = pdfUrl.split(".");
    var doc = pdfUrl.split("/");
    var docFull = doc[doc.length - 1].split("=");
    var url = "";

    if (name[0] == "https://chatbotchecserver") {
      var url = pdfUrl;
      var pdfName = 'cupon_' + doc[doc.length - 1];

    } else if (name[0] == "https://adminchecweb") {
      //http://chatbotchecserver.com:8080/
      //https://dl-dev.herokuapp.com/
      var url = pdfUrl;
      var pdfName = 'copia_factura_' + docFull[docFull.length - 1] + '.pdf';

    }
    //let url = 'https://cors-anywhere.herokuapp.com/' + pdfUrl;
    //https://cors-lucy.herokuapp.com/

    Promise.resolve().then(_ => FileSaver.saveAs(url, pdfName));
    Promise.resolve().then(_ => this.cargaYdescarga = "./assets/images/web.png");

    Promise.resolve().then(_ => this.chagePropertiesImages());
  }*/

  //descargar la factura y cupon de pago
  downloadPdf(pdfUrl: string) {


    Promise.resolve().then(_ => this.cargaYdescarga = "./assets/images/loader.gif");

    var name = pdfUrl.split(".");
    var doc = pdfUrl.split("/");
    var docFull = doc[doc.length - 1].split("=");
    var url = "";

    if (name[0] == "https://chatbotchecserver") {
      var url = pdfUrl;
      let separateDir = pdfUrl.split(".com");
      //let url = '/var/www/html' + separateDir[1];
      var pdfName = 'cupon_' + doc[doc.length - 1];

    } else if (name[0] == "https://adminchecweb") {
      //http://chatbotchecserver.com:8080/
      //https://dl-dev.herokuapp.com/
      var url = 'https://dl-dev.herokuapp.com/' + pdfUrl;
      var pdfName = 'copia_factura_' + docFull[docFull.length - 1] + '.pdf';
    }
    //let url = 'https://cors-anywhere.herokuapp.com/' + pdfUrl;
    //https://cors-lucy.herokuapp.com/

    Promise.resolve().then(_ => FileSaver.saveAs(url, pdfName));
    Promise.resolve().then(_ => this.cargaYdescarga = "./assets/images/web.png");

    Promise.resolve().then(_ => this.chagePropertiesImages());
  }



  //propiedades que seran cambiadas del css
  chagePropertiesImages() {
    this.descarga.nativeElement.style.top = "9px"
    this.descarga.nativeElement.style.cursor = "pointer"
    this.descarga.nativeElement.style.width = "44px"
    this.descarga.nativeElement.style.height = "34px"
    this.descarga.nativeElement.style.position = "absolute"
    this.descarga.nativeElement.style.left = "250px"
    this.descarga.nativeElement.style.borderRadius = "7px"
    this.descarga.nativeElement.style.backgroundColor = "#0707073d"
    this.ovalo.nativeElement.style.backgroundColor = "#07070700"
    this.ovalo.nativeElement.style.cursor = "default"
  }

}
