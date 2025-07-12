// importar_ispro.js
import fs from 'fs';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function importarIDENTIFI(path) {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({ input: fileStream });

  for await (const line of rl) {
    const rut = line.slice(0, 8).trim();
    const dv = line.slice(8, 9).trim();
    const nombre = line.slice(9, 109).trim();
    const telefono = line.slice(109, 124).trim();
    const domicilio = line.slice(124, 164).trim();
    const ciudad = line.slice(164, 184).trim();
    const region = parseInt(line.slice(184, 186).trim()) || null;
    const tipo_persona = line.slice(186, 187).trim();

    const { error } = await supabase.from('corredores').upsert({
      rut, dv, nombre, telefono, domicilio, ciudad, region, tipo_persona
    });

    if (error) console.error(`Error al insertar RUT ${rut}:`, error.message);
  }
}

async function main() {
  const year = '2013';
  await importarIDENTIFI(`./data/ispro/${year}/IDENTIFI.TXT`);
  console.log('Importación completada.');
}

main();
