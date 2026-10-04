const SUPABASE_URL = "https://tzfgutdoseyescbjocjg.supabase.co";

const SUPABASE_KEY = "Finanzas2027";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

let chart;

function guardarDatos() {
    localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

function agregarMovimiento() {

    const descripcion = document.getElementById("descripcion").value;
    const cantidad = parseFloat(document.getElementById("cantidad").value);
    const tipo = document.getElementById("tipo").value;
    const categoria = document.getElementById("categoria").value;

    if (descripcion === "" || isNaN(cantidad)) {
        alert("Completa todos los campos");
        return;
    }

  const nuevoMovimiento = {
    descripcion,
    cantidad,
    tipo,
    categoria,
    fecha: new Date().toLocaleDateString("es-MX")
};

movimientos.push(nuevoMovimiento);

guardarMovimientoSupabase(nuevoMovimiento);

    guardarDatos();
    actualizarPantalla();

    document.getElementById("descripcion").value = "";
    document.getElementById("cantidad").value = "";
}

function eliminarMovimiento(index) {

    movimientos.splice(index, 1);

    guardarDatos();
    actualizarPantalla();
}

function actualizarPantalla() {

    let ingresos = 0;
    let gastos = 0;

    movimientos.forEach(movimiento => {

        if (movimiento.tipo === "ingreso") {
            ingresos += movimiento.cantidad;
        } else {
            gastos += movimiento.cantidad;
        }

    });

    document.getElementById("totalIngresos").textContent =
        "$" + ingresos.toFixed(2);

    document.getElementById("totalGastos").textContent =
        "$" + gastos.toFixed(2);

    document.getElementById("saldo").textContent =
        "$" + (ingresos - gastos).toFixed(2);

    mostrarMovimientos();
    actualizarGrafica();
}

function mostrarMovimientos() {

    const lista = document.getElementById("listaMovimientos");

    lista.innerHTML = "";

    movimientos.forEach((movimiento, index) => {

        lista.innerHTML += `
            <div class="movimiento">
                <div>
    <strong>${movimiento.descripcion}</strong><br>
    ${movimiento.tipo}<br>
    ${movimiento.categoria}<br>
    📅 ${movimiento.fecha}<br>
    💰 $${movimiento.cantidad.toFixed(2)}
</div>
                <button
                    class="eliminar"
                    onclick="eliminarMovimiento(${index})">
                    X
                </button>
            </div>
        `;
    });
}

function actualizarGrafica() {

    const categorias = {};

    movimientos.forEach(movimiento => {

        if (movimiento.tipo === "gasto") {

            categorias[movimiento.categoria] =
                (categorias[movimiento.categoria] || 0)
                + movimiento.cantidad;
        }
    });

    const labels = Object.keys(categorias);
    const valores = Object.values(categorias);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(
        document.getElementById("grafica"),
        {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: [
                        "#e74c3c",
                        "#3498db",
                        "#27ae60",
                        "#f39c12",
                        "#9b59b6",
                        "#1abc9c",
                        "#7f8c8d"
                    ]
                }]
            }
        }
    );
}

actualizarPantalla();

async function guardarMovimientoSupabase(movimiento) {

    const { error } = await supabase
        .from("movimientos")
        .insert([movimiento]);

    if (error) {
        console.error("Error al guardar:", error);
    }
}

async function cargarMovimientosSupabase() {

    const { data, error } = await supabase
        .from("movimientos")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    movimientos = data || [];

    cargarMovimientosSupabase();
}
