import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userName:any;
  password:any;
  defaultPassword = "Suite@402$"
  constructor(private router : Router) { }

  ngOnInit(): void {
  }
  getCode(){
    if(typeof this.userName != "undefined" && typeof this.password != null && this.password == this.defaultPassword){
      this.router.navigate(['meeting'])
    }else{
      console.log(this.userName)
      console.log(this.password)
    }

  }


}
