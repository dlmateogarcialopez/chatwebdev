import { Component } from '@angular/core';
import { DialogflowService } from './services/dialogflow.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chatWeb';


  //Almacenar la ip del cleinte
  public ipAddress = '';
  valor = '';

  constructor(private _ds: DialogflowService, private http: HttpClient, private route: ActivatedRoute, private router: Router) {
    //this._ds.connectToApi();


  }

  ngOnInit(): void {
    //console.log('probando este componente');
    //this.getIpAddress();
    setTimeout(() => {
      //console.log('router', this.router.url);
      this.route.params.subscribe(event =>
       console.log('')
      );
      //console.log(this.route.snapshot.params.prueba)
    }, 0);
  }


  /*getIpAddress() {
    this.http.get("https://api.ipify.org/?format=json").subscribe((res: any) => {
      this.ipAddress = res.ip;
      //console.log('Mi ip es: ' + res.ip);
    });
  }*/
}

