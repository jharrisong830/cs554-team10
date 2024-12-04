declare module 'imagemagick' {
    export function convert(options: object): Buffer;
    export function identify(options: object): Buffer;
  }
  