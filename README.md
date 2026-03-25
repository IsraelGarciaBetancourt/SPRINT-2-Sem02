# Portal Financiero — Mi Banco · MVP v1.0
**Stack:** Bootstrap 5 + Supabase + Vercel

---

## Estructura del proyecto

```
portal/
├── index.html                  ← M1: Login
├── css/
│   └── styles.css              ← Estilos globales + variables corporativas
├── js/
│   └── supabase.js             ← Cliente Supabase + utilidades compartidas
├── modulos/
│   ├── registro.html           ← M1: Registro de nuevo cliente
│   ├── dashboard.html          ← M2: Dashboard con saldos
│   ├── transacciones.html      ← M3: Historial + filtros
│   ├── pagos.html              ← M4: Pagos de servicios
│   ├── prestamos.html          ← M5: Simulador + solicitud de préstamo
│   └── ahorro.html             ← M6: Cuenta de ahorro + progreso
└── supabase_setup.sql          ← Script SQL completo para Supabase
```

---

## CAMBIOS DEL SPRINT 2

1. Agregar registros de prueba en la BD
2. Separar el codigo HTML, CSS y JS en archivos independientes.
3. Mejoras de UI/UX en el frontend
4. Mejoras de validación en el formulario para la busqueda de transacciones, y el load.
5. Deploy en Vercel