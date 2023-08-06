import { Injectable } from '@angular/core';
import { HttpClient,HttpEvent,HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  uploadId(file1:File, file2:any):Observable<HttpEvent<any>>{

    const formData : FormData = new FormData()
    formData.append('apikey','BCGVoFvUulCI4jhr8PzNi21ARGP1PVUp');
    formData.append('file',file1);
    formData.append('face',file2);

    const req = new HttpRequest('POST','https://api.idanalyzer.com',formData,{
      reportProgress: true,
      responseType: 'json'
    })

    console.log(req)

    return this.http.request(req)
  }
}
