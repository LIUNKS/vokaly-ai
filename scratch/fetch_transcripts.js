const fs = require('fs');
const path = require('path');

// Leer .env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
let vapiPrivateKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('VAPI_PRIVATE_KEY=')) {
    vapiPrivateKey = line.replace('VAPI_PRIVATE_KEY=', '').trim();
  }
});

console.log("Vapi Private Key cargada:", vapiPrivateKey ? vapiPrivateKey.substring(0, 8) + '...' : 'NO ENCONTRADA');

async function getTranscripts() {
  try {
    const response = await fetch('https://api.vapi.ai/call?limit=20', {
      headers: {
        'Authorization': `Bearer ${vapiPrivateKey}`,
        'Content-Type': 'application/json'
      }
    });

    const calls = await response.json();
    console.log(`\n==============================================`);
    console.log(`TOTAL DE LLAMADAS ENCONTRADAS EN VAPI: ${Array.isArray(calls) ? calls.length : 0}`);
    console.log(`==============================================\n`);

    if (Array.isArray(calls)) {
      calls.forEach((c, index) => {
        console.log(`Llamada #${index + 1} | ID: ${c.id}`);
        console.log(`  Estado: ${c.status} | Causa de fin: ${c.endedReason || 'N/A'}`);
        console.log(`  Inicio: ${c.createdAt}`);
        if (c.transcript) {
          console.log(`  Transcripción: "${c.transcript.substring(0, 150)}..."`);
        } else if (c.artifact?.transcript) {
          console.log(`  Artifact Transcript: "${c.artifact.transcript.substring(0, 150)}..."`);
        } else {
          console.log(`  Transcripción: (Sin audio o llamada muy corta)`);
        }
        console.log(`----------------------------------------------`);
      });
    } else {
      console.error("Respuesta no es un array:", calls);
    }
  } catch (err) {
    console.error("Error consultando Vapi API:", err);
  }
}

getTranscripts();
