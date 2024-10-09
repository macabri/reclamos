const puerto = 3000; // Cambia esto al puerto que estés utilizando

document.getElementById('reclamoForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Previene el envío del formulario

    const asunto = document.getElementById('asunto').value;
    const descripcion = document.getElementById('descripcion').value;
    const idReclamoTipo = document.getElementById('idReclamoTipo').value;
    const idUsuarioCreador = document.getElementById('idUsuarioCreador').value;

    try {
        const response = await fetch(`http://localhost:${puerto}/reclamos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                asunto,
                descripcion,
                idReclamoTipo,
                idUsuarioCreador
            }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('resultado').innerText = `Reclamo creado con ID: ${data.idReclamo}`;
        } else {
            document.getElementById('resultado').innerText = `Error: ${data.mensaje}`;
        }
    } catch (error) {
        console.error('Error al enviar el reclamo:', error);
        document.getElementById('resultado').innerText = 'Error al crear el reclamo.';
    }
});
