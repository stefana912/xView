import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs';
import { config } from '../config/config';

@Injectable()
export class UserService {
  private getUserUrl = config.XOPSAPI+"/user";
  user = null;
  username:string;
  tenantId:string;

  constructor(private http:Http) {
    //this.user = this.getUserData();
  }

  getUserData() {
      return this.http.get(this.getUserUrl)
                  .map((res:Response) => res.json())
  }

 updateSettings(body: Object) {

        let headers      = new Headers({ 'Content-Type': 'application/json' });
        let options       = new RequestOptions({ headers: headers });
        return this.http.put(`${this.getUserUrl}/${body['email']}`, body, options)
                         .map((res:Response) => res.json())
                         .catch((error:any) => Observable.throw(error.json().error));
    }

  getUser() {
    if (this.user !== null) {
      return this.user;
    } else {
      this.getUserData().subscribe(res => {
        this.user = res;
        return this.user;
      });
    }
  }

  setUserName(loggedInUser) {
    this.username = loggedInUser;
  }

  setTenant(t_id) {
    this.tenantId = t_id;
  }

  getUsername() {
    return this.username;
  }

  getTenantId() {
    return this.tenantId;
  }
}
