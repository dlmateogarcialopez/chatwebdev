import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http'; 



//components
import { AppComponent } from './app.component';
import { MessageComponent } from './components/message/message.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';

//pipes
import { SafePipe } from './pipes/safe.pipe';
import { appRoutingProviders, routing } from './app.routing';


@NgModule({
  declarations: [
    AppComponent,
    MessageComponent,
    ChatWindowComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing
  ],
  providers: [
    appRoutingProviders
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
