import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../user.service';
import { DocumentService } from '../document.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private userService: UserService,
        private documentService: DocumentService) { }
// Handle status codes
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.userService.logout();               
            } else if (err.status === 408) {
                this.documentService.openSnackBar('Request Timeout', 'X');
            } else if (err.status === 504) {
                this.documentService.openSnackBar('Gateway Timeout', 'X');
            }
            const error = err.error.message || err.statusText;
            return throwError(error);
        }));
    }
}


