import { Component, OnInit } from '@angular/core';
import { DialogflowService } from 'src/app/services/dialogflow.service';
import { RichMessage } from 'src/app/models/rich-message';
import Swal from 'sweetalert2';
import { Chat } from '../../models/chats';
import { Session } from '../../models/session';
import * as moment from 'moment';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {

  public chat: Chat;
  public session: Session;
  public flag: boolean = false;
  conversation: RichMessage[] = []; //lista de conversaciones a mostrar en el chat
  sessionId: any;
  inputMessage: string = '';
  askInfo = false;
  loginForm = this.fb.group({
    correo: ["", [Validators.required, Validators.email]],
    contrasena: ["", [Validators.required]]
  });
  public conversacion: boolean = false
  public loginInicial: boolean = true

  get loginFields() {
    return this.loginForm.controls;
  }


  constructor(private _dfs: DialogflowService, private fb: FormBuilder) {
    this.chat = new Chat('');
    this.session = new Session('');

    /*setTimeout(()=>{
      this.askInfo = true;
      })*/
  }

  sendMessage() {
    if (this.inputMessage) {
      this._dfs.sentToBot({
        text: this.inputMessage,
        sentBy: 'human',
        //codUser: this.sessionId,
        //this.conversation.codUser
      });
      this.inputMessage = '';
    }
  }

  ngOnInit() {

    this._dfs.chatSubject.subscribe((conversation: RichMessage[]) => {
      this.conversation = conversation;
      //console.log(conversation);
      setTimeout(() => {
        //$(".message-content-inner").stop().animate({ scrollTop: $(".message-content-inner")[0].scrollHeight + 500 }, 100);
        document.getElementById('message-content-inner').scrollTop = 9999999;
      }, 100);

      //this.verificarAutorizacion(); //activar funcionalidad de autorización

      this.sendToDB();
    });

    this._dfs.sessionSubject.subscribe((session: any[]) => {
      this.sessionId = session;
    });


    this._dfs.connectToApi();
  }



  sendToDB() {

    let msg = this.conversation.length - 1
    let mensaje = this.conversation[msg]
    //console.log('prueba', mensaje);
    if (mensaje !== undefined) {

      mensaje['codUser'] = this.sessionId;
      mensaje['fecha'] = Date.now();
      this.chat.mensaje = mensaje;
      this._dfs.saveToDb(this.chat).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          console.log('error', error);
        }
      );


      this.getSession(this.sessionId);
      //this.getSessions(this.sessionId);    
      if (this.sessionId != undefined) {
        if (this.flag == false) {
          this.session.sessionId = this.sessionId;
          this._dfs.saveSession(this.session).subscribe(
            response => {
              //console.log(response);
            },
            error => {
              console.log(error);
            }
          );
        }

      }
    }

  }

  getSession(session) {

    this._dfs.getSession(session).subscribe(
      response => {
        this.flag = true;
      },
      error => {
        this.flag = false;
      }
    );

  }

  getSessions(sessionId) {
    this._dfs.getSessions().subscribe(
      r => {
        let sessions = r.sessionFound;

        for (let i = 0; i < sessions.length; i++) {
          if (sessions[i] == sessionId) {
            this.flag = true;
            break;
          }
        }

        this.flag = true;
      },
      e => {
        this.flag = false;
      }
    );

    var prueba = this.flag;
    var prube = 0
  }

  /*clearConversation() {
    this._dfs.clear();
  }*/
  verificarAutorizacion() {//------------------------------------------
    this.getSession(this.sessionId);
    //this.getSessions(this.sessionId);    
    if (this.sessionId != undefined) {
      if (this.flag == false) {
        this.autorizacion();
      }

    }
  }

  autorizacion() {//----------------------------------------------
    Swal.fire({
      html:
        'Autoriza a CHEC para el tratamiento de tus datos personales con fines comerciales diferentes a la prestación del servicio y conoce los productos y/o servicios ofrecidos por CHEC o sus aliados comerciales, consulta nuestra política de protección de datos personales publicada  ' +
        '<a href="https://www.chec.com.co/normatividad/politica-proteccion-datos-personales" style="color:#778D48;" target="_blank">Política de tratamiento de datos</a> ',
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonColor: '#649400',
      cancelButtonColor: '#6D6E71',
      focusConfirm: true,
      confirmButtonText:
        '<i class="fa fa-thumbs-up"></i> Autorizar',
      confirmButtonAriaLabel: 'Thumbs up, great!',
      cancelButtonText:
        '<i class="fa fa-thumbs-down"></i> No Autorizar',
      cancelButtonAriaLabel: 'Thumbs down'
    }).then((result) => {
      let d = new Date();
      let response = {};
      if (result.value) {
        response = {
          CODUSER: this.sessionId,
          RESPONSE: 'SI',
          FECHA: moment(d).format('YYYY-MM-DD h:mm:ss'),
        }
      } else {
        response = {
          CODUSER: this.sessionId,
          RESPONSE: 'NO',
          FECHA: moment(d).format('YYYY-MM-DD h:mm:ss'),
        }
      }

      this._dfs.saveRespondeAuth(response).subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      );

    })
  }

  clearConversationp() {
    Swal.fire({
      title: '¿Quieres limpiar el chat?',
      text: "¡Perderás toda la conversación!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#99be00',
      cancelButtonColor: '#99be00',
      confirmButtonText: 'Si',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this._dfs.clear();
        Swal.fire(
          'OK',
          'Tu conversación  ha sido eliminada',
          'success',
        )
      }
    })
  }

  onChipSelected(event) {
    console.log('onchip');
    console.log(event);
  }

  login() {
    if (this.loginForm.invalid) {
      this.validateAllFormFields(this.loginForm);
      return;
    } else {
      console.log(this.loginForm.value)
      this._dfs.login(this.loginForm.value).subscribe(
        res => {
          if (res.status) {
            this.loginInicial = false
            this.conversacion = true
          }else{
            //mostrar mensaje de error
          }
        },
        err => {
          console.log(err)
        }
      )

    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

}
