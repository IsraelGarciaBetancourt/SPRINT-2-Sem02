import { supabase, requireAuth, formatSoles, formatFecha } from '../supabase.js';

const user = await requireAuth();
document.getElementById('userName').textContent = user.user_metadata?.full_name?.split(' ')[0] || user.email;

document.getElementById('btnLogout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.replace('/index.html');
});

// ── Cargar transacciones con filtros opcionales ────────

/**
 * Carga las transacciones del usuario desde Supabase aplicando los filtros de fecha y tipo seleccionados en el DOM.
 * Valida que la fecha de inicio no sea mayor a la de fin, muestra un indicador de carga durante la consulta,
 * y luego actualiza la tabla y el resumen en la interfaz.
 * * @async
 * @function cargarTransacciones
 * @returns {Promise<void>} No retorna ningún valor, actualiza el DOM directamente.
 */
async function cargarTransacciones() {
    const desde  = document.getElementById('filtroDesde').value;
    const hasta  = document.getElementById('filtroHasta').value;

    // NUEVA VALIDACIÓN DE FECHAS //
    if (desde && hasta && desde > hasta) {
        alert("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
        return; // Detenemos la ejecución aquí para no hacer la consulta a Supabase
    }

    mostrarCargando(); /* LLamas a la vista de load NUEVO */

    const tipo   = document.getElementById('filtroTipo').value;

    let query = supabase
        .from('transacciones')
        .select(`*, cuentas(tipo, numero_cuenta)`)
        .eq('user_id', user.id)
        .order('fecha', { ascending: false })
        .limit(20);

    if (tipo)  query = query.eq('tipo', tipo);
    if (desde) query = query.gte('fecha', desde);
    if (hasta) query = query.lte('fecha', hasta + 'T23:59:59');

    const { data: txns, error } = await query;
    renderTabla(txns || []);
    renderResumen(txns || []);
}

/**
 * Reemplaza el contenido de la tabla de transacciones con un indicador visual de carga (spinner).
 * Se utiliza para dar retroalimentación al usuario mientras se esperan los datos de la base de datos.
 * * @function mostrarCargando
 * @returns {void}
 */
function mostrarCargando() {
  const tbody = document.getElementById('txnBody');
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-4">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 mb-0">Buscando transacciones...</p>
      </td>
    </tr>
  `;
}

/**
 * Genera el HTML necesario para mostrar las transacciones y lo inserta en el cuerpo de la tabla.
 * Si el arreglo está vacío, muestra un mensaje indicando que no hay resultados.
 * * @function renderTabla
 * @param {Array<Object>} txns - Arreglo de transacciones a renderizar.
 * @param {string} txns[].fecha - Fecha de la transacción.
 * @param {string} txns[].tipo - Tipo de movimiento ('debito' o 'credito').
 * @param {string} txns[].descripcion - Descripción o concepto de la transacción.
 * @param {number|string} txns[].monto - Importe de la transacción.
 * @param {Object} [txns[].cuentas] - Objeto anidado con los datos de la cuenta vinculada.
 * @param {string} [txns[].cuentas.tipo] - Tipo de cuenta ('corriente' o 'ahorro').
 * @returns {void}
 */
function renderTabla(txns) {
    const tbody = document.getElementById('txnBody');
    if (txns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">
        <i class="bi bi-inbox fs-2 d-block mb-2"></i>No se encontraron transacciones con esos filtros.
        </td></tr>`;
        return;
    }
    tbody.innerHTML = txns.map(t => `
        <tr>
        <td class="ps-3 text-muted small">${formatFecha(t.fecha)}</td>
        <td>
            <div class="d-flex align-items-center gap-2">
            <i class="bi ${t.tipo === 'debito' ? 'bi-arrow-up-right-circle text-danger' : 'bi-arrow-down-left-circle text-success'} fs-5"></i>
            <span class="fw-semibold small">${t.descripcion}</span>
            </div>
        </td>
        <td class="text-muted small">
            ${t.cuentas ? (t.cuentas.tipo === 'corriente' ? 'Cta. Corriente' : 'Cta. Ahorro') : '—'}
        </td>
        <td>
            <span class="badge ${t.tipo === 'debito' ? 'badge-debito' : 'badge-credito'} px-2 py-1">
            ${t.tipo === 'debito' ? 'Débito' : 'Crédito'}
            </span>
        </td>
        <td class="text-end pe-3">
            <span class="${t.tipo === 'debito' ? 'monto-debito' : 'monto-credito'} fw-bold">
            ${t.tipo === 'debito' ? '- ' : '+ '}${formatSoles(t.monto)}
            </span>
        </td>
        </tr>
    `).join('');
}

/**
 * Calcula los totales de débitos, créditos y el balance neto a partir de las transacciones dadas.
 * Luego, actualiza los elementos correspondientes en el DOM para mostrar el resumen financiero.
 * * @function renderResumen
 * @param {Array<Object>} txns - Arreglo de transacciones para calcular el resumen.
 * @param {string} txns[].tipo - Tipo de movimiento ('debito' o 'credito').
 * @param {number|string} txns[].monto - Importe de la transacción utilizado para las sumas.
 * @returns {void}
 */
function renderResumen(txns) {
    const debitos  = txns.filter(t => t.tipo === 'debito').reduce((s, t)  => s + Number(t.monto), 0);
    const creditos = txns.filter(t => t.tipo === 'credito').reduce((s, t) => s + Number(t.monto), 0);
    const neto = creditos - debitos;
    
    document.getElementById('resTotal').textContent    = txns.length;
    document.getElementById('resDebitos').textContent  = formatSoles(debitos);
    document.getElementById('resCreditoss').textContent = formatSoles(creditos);
    
    const netoEl = document.getElementById('resNeto');
    netoEl.textContent = formatSoles(Math.abs(neto));
    netoEl.className   = `fw-bold fs-5 ${neto >= 0 ? 'text-success' : 'text-danger'}`;
}

// Eventos filtros
document.getElementById('btnFiltrar').addEventListener('click', cargarTransacciones);
document.getElementById('btnLimpiar').addEventListener('click', () => {
    document.getElementById('filtroTipo').value  = '';
    document.getElementById('filtroDesde').value = '';
    document.getElementById('filtroHasta').value = '';
    cargarTransacciones();
});

// Carga inicial
cargarTransacciones();