import {
  EnvironmentProviders,
  ErrorHandler,
  inject,
  makeEnvironmentProviders,
  Type,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type ShowErrorFn = (error: GenericError) => void;

export interface GenericError {
  error?: {
    message: string;
  };
  message: string;
}

export function injectShowError(): ShowErrorFn {
  const snackBar = inject(MatSnackBar);
  return (error: GenericError) => {
    const message = error.error?.message || error.message;
    snackBar.open(message, 'OK', {
      panelClass: ['snackbar-alarm'],
    });
    console.error(error);
  };
}

export class AppErrorHandler implements ErrorHandler {
  private showError = injectShowError();
  handleError(error: GenericError): void {
    this.showError(error);
  }
}

export function provideErrorHandler(
  errorHandler: Type<ErrorHandler>
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ErrorHandler, useClass: errorHandler },
  ]);
}
