// src/utils/showMessage.js
import Swal from 'sweetalert2';

export function showSuccess(msg = '') {
  Swal.fire({
    icon: 'success',
    title: 'Éxito',
    text: msg,
    confirmButtonColor: '#28a745'
  });
}

export function showError(msg = '') {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: msg,
    confirmButtonColor: '#dc3545'
  });
}

export function showWarning(msg = '') {
  Swal.fire({
    icon: 'warning',
    title: 'Advertencia',
    text: msg,
    confirmButtonColor: '#ffc107', // Color amarillo para advertencias
    confirmButtonText: 'Entendido'
  });
}

// Confirmación con botones Sí/No, retorna true si el usuario confirma
export async function showConfirm({
  title = 'Confirmar',
  text = '',
  confirmButtonText = 'Sí',
  cancelButtonText = 'No',
  icon = 'warning'
} = {}) {
  const result = await Swal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed === true;
}
