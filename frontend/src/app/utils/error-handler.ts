import {
  EnvironmentProviders,
  ErrorHandler,
  inject,
  makeEnvironmentProviders,
  Type,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

interface GenericError {
  error?: {
    message: string;
  };
  message: string;
}

export class CustomErrorHandler implements ErrorHandler {
  snackBar = inject(MatSnackBar);
  handleError(error: GenericError): void {
    const message = error.error?.message || error.message;
    this.snackBar.open(message, 'OK', {
      panelClass: ['snackbar-alarm'],
    });
    throw error;
  }
}

export function provideErrorHandler(
  errorHandler: Type<ErrorHandler>,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ErrorHandler, useClass: errorHandler },
  ]);
}
