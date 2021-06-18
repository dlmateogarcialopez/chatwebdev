import { Component } from '@angular/core';
import { DialogflowService } from './services/dialogflow.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as moment from 'moment'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chatWeb';


  //Almacenar la ip del cleinte
  public ipAddress = '';
  appName = "Chat de pruebas Lucy";
  loginForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]]
  });
  public conversacion: boolean = false
  public loginInicial: boolean = true

  get loginFields() {
    return this.loginForm.controls;
  }

  constructor(private _ds: DialogflowService, private http: HttpClient, private router: Router, private fb: FormBuilder) {
    //this._ds.connectToApi();
  }

  ngOnInit(): void {
    //console.log('probando este componente');
    //this.getIpAddress();
    setTimeout(() => {
      //console.log('router', this.router.url);
      let separar = this.router.url.split('/');
      if (separar[1] == '?chatWebLog=') {
        let d = new Date();
        let fecha = moment(d).format('YYYY-MM-DD HH:mm:ss');
        //console.log('proenabd', fecha);
        let params = {
          FECHA_LOG: fecha,
          NAME: 'logUrlLucy'
        }
        this._ds.saveLogUrlLucy(params).subscribe(
          response => {

          },
          error => {
            //console.log(error);
          }
        );
      }
    }, 0);
  }

  login() {
    if (this.loginForm.invalid) {
      this.validateAllFormFields(this.loginForm);
      return;
    } else {
      let credenciales = {
        correo: this.loginForm.value.email,
        contrasena: this.loginForm.value.password
      }
      this._ds.login(credenciales).subscribe(
        res => {
          if (res.status) {
            this.loginInicial = false
            this.conversacion = true
          } else {
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


  /*getIpAddress() {
    this.http.get("https://api.ipify.org/?format=json").subscribe((res: any) => {
      this.ipAddress = res.ip;
      //console.log('Mi ip es: ' + res.ip);
    });
  }*/
}

