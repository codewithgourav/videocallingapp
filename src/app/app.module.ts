import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http'
import { LoginComponent } from './features/login/login.component';
import { MeetingComponent } from './features/meeting/meeting.component';
import { RefreshComponent } from './features/refresh/refresh.component';
import { VideocallComponent } from './features/videocall/videocall.component';
import { DialogModule } from 'primeng/dialog';
import { WebcamModule } from 'ngx-webcam';
import { FormsModule,ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MeetingComponent,
    RefreshComponent,
    VideocallComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    FontAwesomeModule,
    HttpClientModule,
    DialogModule,
    WebcamModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
