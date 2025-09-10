// src/composables/usePDFExport.js
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function usePDFExport() {
  const exportarPDF = async (elementId, nombreArchivo = 'hoja-de-vida') => {
    try {
      const elemento = document.getElementById(elementId)
      if (!elemento) {
        throw new Error(`Elemento con ID "${elementId}" no encontrado`)
      }

      // Configuración para html2canvas
      const canvas = await html2canvas(elemento, {
        scale: 2, // Mayor resolución
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Aplicar estilos específicos para PDF en el documento clonado
          const clonedElement = clonedDoc.getElementById(elementId)
          if (clonedElement) {
            clonedElement.style.transform = 'scale(1)'
            clonedElement.style.transformOrigin = 'top left'
            
            // Ocultar botones y elementos no deseados en el PDF
            const botones = clonedElement.querySelectorAll('button, .boton-guardar, .boton-actualizar, .boton-cerrar')
            botones.forEach(btn => btn.style.display = 'none')
            
            // Asegurar que las tablas se vean bien
            const tablas = clonedElement.querySelectorAll('table')
            tablas.forEach(tabla => {
              tabla.style.pageBreakInside = 'auto'
              tabla.style.borderCollapse = 'collapse'
            })
            
            // Mejorar la visualización de las secciones
            const secciones = clonedElement.querySelectorAll('.section')
            secciones.forEach(seccion => {
              seccion.style.marginBottom = '20px'
              seccion.style.pageBreakInside = 'avoid'
            })
          }
        }
      })

      // Crear el PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      
      // Configuración del PDF en tamaño carta
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter' // Tamaño carta (216 x 279 mm)
      })

      // Dimensiones de la página carta
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Márgenes
      const margin = 10
      const contentWidth = pageWidth - (margin * 2)
      const contentHeight = pageHeight - (margin * 2)

      // Calcular las dimensiones de la imagen
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = imgWidth / imgHeight

      let finalWidth = contentWidth
      let finalHeight = finalWidth / ratio

      // Si la imagen es muy alta, dividir en múltiples páginas
      if (finalHeight > contentHeight) {
        const totalPages = Math.ceil(finalHeight / contentHeight)
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage()
          }
          
          const sourceY = (i * contentHeight * imgHeight) / finalHeight
          const sourceHeight = Math.min((contentHeight * imgHeight) / finalHeight, imgHeight - sourceY)
          
          // Crear un canvas temporal para esta página
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')
          
          pageCanvas.width = imgWidth
          pageCanvas.height = (sourceHeight * finalHeight) / contentHeight
          
          // Crear imagen desde el canvas original
          const img = new Image()
          img.onload = () => {
            pageCtx.drawImage(img, 0, -sourceY * finalHeight / contentHeight)
            const pageImgData = pageCanvas.toDataURL('image/png', 1.0)
            
            pdf.addImage(
              pageImgData,
              'PNG',
              margin,
              margin,
              finalWidth,
              Math.min(contentHeight, (sourceHeight * finalHeight) / contentHeight)
            )
          }
          img.src = imgData
        }
      } else {
        // Si cabe en una página
        pdf.addImage(imgData, 'PNG', margin, margin, finalWidth, finalHeight)
      }

      // Agregar metadatos
      pdf.setProperties({
        title: `${nombreArchivo}.pdf`,
        subject: 'Hoja de Vida - Formato Único',
        author: 'Sistema de Hojas de Vida',
        creator: 'Aplicación Web HV'
      })

      // Descargar el PDF
      pdf.save(`${nombreArchivo}.pdf`)
      
      return { success: true, message: 'PDF generado exitosamente' }
      
    } catch (error) {
      console.error('Error al generar PDF:', error)
      return { success: false, error: error.message }
    }
  }

  const exportarHojaCompleta = async () => {
    try {
      // Crear un contenedor temporal con todas las hojas
      const contenedorCompleto = document.createElement('div')
      contenedorCompleto.id = 'hoja-completa-temp'
      contenedorCompleto.style.position = 'absolute'
      contenedorCompleto.style.left = '-9999px'
      contenedorCompleto.style.top = '0'
      contenedorCompleto.style.width = '210mm' // Ancho carta
      contenedorCompleto.style.backgroundColor = 'white'
      contenedorCompleto.style.padding = '20px'
      
      // Clonar el contenido de cada hoja
      const hojas = ['pdf-hoja1', 'pdf-hoja2', 'pdf-hoja3']
      
      hojas.forEach((hojaId, index) => {
        const hojaOriginal = document.getElementById(hojaId)
        if (hojaOriginal) {
          const hojaClonada = hojaOriginal.cloneNode(true)
          hojaClonada.id = `${hojaId}-clonada`
          
          // Agregar separador entre hojas
          if (index > 0) {
            const separador = document.createElement('div')
            separador.style.pageBreakBefore = 'always'
            separador.style.height = '20px'
            contenedorCompleto.appendChild(separador)
          }
          
          contenedorCompleto.appendChild(hojaClonada)
        }
      })
      
      document.body.appendChild(contenedorCompleto)
      
      // Exportar el contenedor completo
      const resultado = await exportarPDF('hoja-completa-temp', 'hoja-de-vida-completa')
      
      // Limpiar el contenedor temporal
      document.body.removeChild(contenedorCompleto)
      
      return resultado
      
    } catch (error) {
      console.error('Error al generar PDF completo:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    exportarPDF,
    exportarHojaCompleta
  }
}