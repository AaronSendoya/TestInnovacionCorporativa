export class ErrorHttp extends Error {
  codigoHttp: number;

  constructor(mensaje: string, codigoHttp: number) {
    super(mensaje);
    this.codigoHttp = codigoHttp;
  }
}
