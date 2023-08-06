import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { MeetingComponent } from './features/meeting/meeting.component';
import { VideocallComponent } from './features/videocall/videocall.component';
import { RefreshComponent } from './features/refresh/refresh.component';
const routes: Routes = [
  {path:'',redirectTo:'login',pathMatch:'full'},
  {path:'login',component:LoginComponent},
  {path: 'meeting',component:MeetingComponent},
  {path: 'videocall',component:VideocallComponent},
  {path: 'RefreshComponent',component:RefreshComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
