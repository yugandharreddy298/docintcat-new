import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from '../user.service';
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private userService: UserService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                timezoneoffset: String(new Date().getTimezoneOffset())
            }
        });
        // add authorization header with jwt token if available
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const ip = JSON.parse(localStorage.getItem('myip')); // set ipAddress to every request
        const location = JSON.parse(localStorage.getItem('mylocation')); // set ipAddress to every request
        if (currentUser && currentUser.token && (location || ip)) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser.token}`,
                    IpAddress: (ip) ? ip.ip : location.ip
                }
            });
        } else if (currentUser && currentUser.token && !location && !ip) {
            const data = localStorage.getItem('ipaddress');
            const ipadress = this.userService.decryptData(data);
            if (ipadress) {
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${currentUser.token}`,
                        IpAddress: ipadress
                    }
                });
            } else {
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${currentUser.token}`,
                    }
                });
            }
        } else if (!currentUser && (location || ip)) {

            request = request.clone({
                setHeaders: {
                    IpAddress: (ip) ? ip.ip : location.ip

                }
            });

        }
        return next.handle(request);
    }
}
