import { Injectable } from '@angular/core';
import { ApiAiClient } from 'api-ai-javascript/es6/ApiAiClient';
import { RichMessage } from '../models/rich-message';
import { Subject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, count } from 'rxjs/operators';
import { Chat } from '../models/chats'


@Injectable({
  providedIn: 'root'
})
export class DialogflowService {

  public session: any;
  public chat: Chat;
  token: string = '480aeb50367e4ea1a0d693667f414f09'; //acces token del bot de dialogflow prueba
  //token: string = '2eedf1ebf9e044cabb8d8da5c8ade49b'; //acces token del bot de dialogflow lucy
  //token: string = 'eac3779412961c8fda42df172f984cdbecd71085'; //acces token del bot de dialogflow dev
  //ya29.c.Ko8B3Afei3zCX2tW100BZLbsZVj-Nxu85E43XN8xClqBgrNQwupeUPyW8lZscCCGgyFv5tBHzGuFQJrCAlDhcBgObF_xpFjPYoyO5vY20vhllUR2EPwrLu5J9LfLAF0Qc27_HUqQPjgVxibtrarktKdRKvF7Ui2FHL4iGhlvcCwS_PSHARBv4xcaxYxKf8z_tk4
  //token: string = 'ya29.c.Ko8B3Afei3zCX2tW100BZLbsZVj-Nxu85E43XN8xClqBgrNQwupeUPyW8lZscCCGgyFv5tBHzGuFQJrCAlDhcBgObF_xpFjPYoyO5vY20vhllUR2EPwrLu5J9LfLAF0Qc27_HUqQPjgVxibtrarktKdRKvF7Ui2FHL4iGhlvcCwS_PSHARBv4xcaxYxKf8z_tk4;'

  client: any;
  chatSubject = new Subject<RichMessage[]>(); //sera escuchado por todos los componentes que lo requieran
  sessionSubject = new Subject<String[]>();
  conversation: RichMessage[] = [];
  //uriCoordenadas = 'https://chatbotchecserver.com/lucyPruebas/coordenadas.php';
  public uriCoordenadas = 'http://localhost/ACTUALES/LUCYPRUEBA/lucyPruebas/coordenadas.php';
  public uriCoordenadasFinanciacion = 'http://localhost/ACTUALES/LUCYPRUEBA/lucyPruebas/financiacion.php';
  //public url = 'https://backchat.herokuapp.com';
  public url = 'https://backchatweb.herokuapp.com';


  constructor(private http: HttpClient) {
    this.chat = new Chat('');
  }

  connectToApi() {
    this.client = new ApiAiClient({ accessToken: this.token }); //instancia de DialogFlow   
    this.sentToBot({ text: 'hola', sentBy: 'human' });
  }

  sentToBot(messageObject) {
    this.publishMessage(new RichMessage(messageObject));
    this.postToDialofFlow(messageObject.text);
  }

  sentToHuman(messageObject) {
    this.publishMessage(new RichMessage(messageObject));
  }

  postToDialofFlow(mensajeParaEnviar: string) {   //peticion de mensaje a dialogflow - retorna respuesta  
    this.client.textRequest(mensajeParaEnviar).then(respuesta => { //hacer una peticion a dialogflow       
      if (respuesta.result.fulfillment.messages || respuesta.result.fulfillment.speech) {
        //console.log(respuesta)
        let msg = respuesta.result.fulfillment.messages; //capturando la respuesta(payload) que viene de dialogflow
        let sessionId = respuesta.sessionId;
        this.sessionSubject.next(sessionId)
        //console.log(msg);
        let flag = true; //controlar que tipo de mensaje se va a mostrar en el chat(desde consola de dialogflow o fulfillment)
        let payloadChatWebLucy = ''; //capturar el payload del fulfillment
        msg.forEach((values, key) => {
          var payload = values.payload;
          if (payload) { //validar que la respuesta de dialogflow tenga payload
            if (payload.chatWebLucy) {
              flag = false;
              payloadChatWebLucy = payload.chatWebLucy;
              this.messageWithPayload(payloadChatWebLucy);
              //parent.postMessage("GetWhiteLabel", "*");              
            }
          }
        });
        if (flag) {
          let msg = respuesta.result.fulfillment.speech; // capturamos la respuesta      
          this.messageWithOutPayload(msg);
        }
      }
    });
  }

  //para los mensajes que vienen de la consola de dialog flow
  messageWithOutPayload(msg) { //PASAR COMO PARAMETRO LA SESSIONID
    msg = msg.split("&");
    msg.forEach((value, key) => {
      try {
        msg = value.replace(/\(/g, '{').replace(/\)/g, '}');
        //msg = value.replace(/{a}/gi, '(a)');
        msg = JSON.parse(`${msg}`); //toma una cadena JSON y la transforma en un objeto JavaScript
        //console.log(msg);
        msg.sentBy = 'Lucy';
        msg = new RichMessage(msg); //instancia del modelo de las tarjetas(RichMessage)        

      } catch (error) {
        msg = new RichMessage({
          text: msg,
          sentBy: 'Lucy'
        });
      }
      //console.log(msg);
      //setTimeout(() => {
      this.publishMessage(msg); //PASAR COMO PARAMETRO LA SESSIONID
      // }, 1500)
    });
  }

  //para los mensaje que vienen del fulfillment
  messageWithPayload(msg) { //PASAR COMO PARAMETRO LA SESSIONID
    try {
      //console.log(msg);
      msg.sentBy = 'Lucy';
      msg = new RichMessage(msg); //instancia del modelo de las tarjetas(RichMessage)        

    } catch (error) {
      msg = new RichMessage({
        text: msg,
        sentBy: 'Lucy'
      });
    }
    //console.log(msg);
    //setTimeout(() => {
    this.publishMessage(msg); //PASAR COMO PARAMETRO LA SESSIONID
    // }, 1500)
  }

  //almacena el mensaje que se va a mostrar en el chat
  publishMessage(rm: RichMessage) {
    if (rm.text != 'hola') {

      this.conversation.push(rm); //Se almacena el mensaje en un array tipo RichMessage    
      this.chatSubject.next(this.conversation); //Agregar un array al subject    
    }
  }

  //almacena el mensaje en la base de datod
  saveToDb(chat): Observable<any> {
    let params = JSON.stringify(chat);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.url}/saveChats`, params, { headers: headers });
  }

  //almacena la session en la base de datos
  saveSession(session): Observable<any> {
    let params = JSON.stringify(session);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.url}/saveSessionId`, params, { headers: headers });
  }

  //obtener la session en la base de datos
  getSession(session): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get(`${this.url}/getSessionId/` + session, { headers: headers });
  }

  //obtener la sessiones en la base de datos
  getSessions(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get(`${this.url}/getSessions`, { headers: headers });
  }

  //almacenar interaccion de puntos d atención
  saveInteractionPointsOfAttention(interaction): Observable<any> {
    let params = JSON.stringify(interaction);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    //console.log(params);
    return this.http.post(`${this.url}/saveInteraction`, params, { headers: headers });
  }

  saveRespondeAuth(response): Observable<any> {
    let params = JSON.stringify(response);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.url}/saveResponseAuth`, params, { headers: headers });
  }




  //Reemplaza toda la conversacion existente por un array vacio
  setConversation(con: RichMessage[]) {
    this.chatSubject.next(con);
  }

  //limpiar la conversacion del chat
  clear() {
    this.conversation = [];
    this.setConversation(this.conversation);
    this.sentToBot({ text: 'hola', sentBy: 'human' });
    // this.init();

  }

  //pintar puntos de atencion
  makeCapitalMarkers(distance, coordinates): Observable<any> {
    let coordenadas = JSON.stringify({
      coordenadas: coordinates,
      distancia: distance,
    });
    return this.http.post(`${this.uriCoordenadas}`, coordenadas);
  }

  //Guardar coordenadas
  saveCoordinates(coordinates, codUser, distance) {
    let coordenadas = JSON.stringify({
      coordenadas: coordinates,
      codUser: codUser,
      distance: distance
    });
    return this.http.post(`${this.uriCoordenadas}`, coordenadas);
  }

  //obtener documentos financiación
  getFilesFinancing(codUser): Observable<any> {
    let sesion = JSON.stringify(codUser);
    return this.http.post(`${this.uriCoordenadasFinanciacion}`, sesion);
  }

  /*
  https://backchatweb.herokuapp.com/saveChats
  https://backchatweb.herokuapp.com/saveSessionId
  https://backchatweb.herokuapp.com/getSessionId/
  https://backchatweb.herokuapp.com/getSessions
  */

}
