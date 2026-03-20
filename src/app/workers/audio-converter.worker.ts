/// <reference lib="webworker" />

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

addEventListener('message', async ({ data }) => {
  const { file, id } = data;

  try {
    // Cargar FFmpeg si no está cargado
    if (!ffmpeg.loaded) {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }

    // Escribir el archivo original en el sistema de archivos virtual de FFmpeg
    const fileName = 'input_audio';
    const outputName = 'output.opus';
    await ffmpeg.writeFile(fileName, await fetchFile(file));

    // Ejecutar la conversión a Opus
    // -i: input, -acodec: libopus, -b:a: bitrate (ajustable)
    await ffmpeg.exec(['-i', fileName, '-acodec', 'libopus', '-b:a', outputName]);

    // Leer el resultado
    const dataOutput = await ffmpeg.readFile(outputName);

    if (dataOutput instanceof Uint8Array) {
      const standardBuffer = dataOutput.slice().buffer;
      const opusBlob = new Blob([standardBuffer], { type: 'audio/opus' });

      // Limpieza
      await ffmpeg.deleteFile(fileName);
      await ffmpeg.deleteFile(outputName);

      // Enviar de vuelta
      postMessage({ id, blob: opusBlob, success: true });
    } else {
      throw new Error('El formato de salida no es válido.');
    }
  } catch (error: any) {
    postMessage({ id, error: error.message, success: false });
  }
});
