import { Component } from '@angular/core';
import { DialogflowService } from './services/dialogflow.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as moment from 'moment'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chatWeb';


  //Almacenar la ip del cleinte
  public ipAddress = '';

  constructor(private _ds: DialogflowService, private http: HttpClient, private router: Router) {
    //this._ds.connectToApi();
  }

  ngOnInit(): void {
    //console.log('probando este componente');
    //this.getIpAddress();
    setTimeout(() => {
      //console.log('router', this.router.url);
      let separar = this.router.url.split('/');
      if(separar[1] == '?chatWebLog='){
        let d = new Date();
        let fecha = moment(d).format('YYYY-MM-DD HH:mm:ss');
        //console.log('proenabd', fecha);
        let params = {
          FECHA_LOG: fecha,
          NAME: 'logUrlLucy'
        }
        this._ds.saveLogUrlLucy(params).subscribe(
          response =>{

          },
          error =>{
            //console.log(error);
          }
        );
      }
    }, 0);
  }


  /*getIpAddress() {
    this.http.get("https://api.ipify.org/?format=json").subscribe((res: any) => {
      this.ipAddress = res.ip;
      //console.log('Mi ip es: ' + res.ip);
    });
  }*/
}

