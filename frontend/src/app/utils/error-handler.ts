import {
  EnvironmentProviders,
  ErrorHandler,
  inject,
  makeEnvironmentProviders,
  Type,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export class CustomErrorHandler implements ErrorHandler {
  snackBar = inject(MatSnackBar);
  handleError(error: any): void {
    const message = error.error?.message || error.message;
    this.snackBar.open(message, 'OK', { 
        panelClass: ['snackbar-alarm'] 
    });
  }
}

export function provideErrorHandler(
  errorHandler: Type<ErrorHandler>
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ErrorHandler, useClass: errorHandler },
  ]);
}
