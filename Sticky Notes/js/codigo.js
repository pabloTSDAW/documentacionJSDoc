var notaPinchada = false;
var posEX = 0;
var posEY = 0;
var posX = 0;
var posY = 0;

var colores = [['rgb(252, 255, 17)', 'rgb(234, 237, 14)'],
                ['rgb(23, 203, 202)', 'rgb(47, 153, 222)'],
                ['rgb(180, 142, 242)', 'rgb(165, 102, 228)'],
                ['rgb(255, 255, 255)', 'rgb(233, 225, 225)'],
                ['rgb(170, 231, 82)', 'rgb(155, 210, 76)'],
                ['rgb(245, 114, 114)', 'rgb(240, 90, 90)']];

//MODELO----------------------------------------------------------------------

/**
 * Represents a note.
 * @constructor
 * @param {number} id - The unique id of the note.
 * @param {string} titulo - The title of the note, can not be modified.
 * @param {string} texto - The content of the note.
 * @param {Date} hora - Time and date of creation of the note.
 * @param {string} color - Color of the note, obtained from a array of predefined colors.
 */
class Nota {
  constructor(id, titulo, texto, hora, color) {
    this.id = id;
    this.titulo = titulo;
    this.texto = texto;
    this.hora = hora;
    this.color = color;
  }
}

/**
 * Represents a list of notes.
 * @constructor
 * @param {string} id - The unique id of the list of notes.
 * @param {string} notas - The array of notes.
*/
class ListaNotas {
  constructor() {
    this.id = 0;
    this.notas = [];
  }
}


//VISTA-----------------------------------------------------------------------

/**
 * Represents the view of the notes.
 * @constructor
 * @param {object} controlador - Instance an element of the class Controlador.
 */
class NotaView {
  constructor(controlador) {
    this.controlador = controlador;
  }

  /** Create a view for the note. Receive as parameters id, title, text, time and color */
  nuevaNota(id, titulo, texto, hora, color) {
    //Crea una vista para la nota
    this.notaV = document.createElement('div');
    this.notaV.setAttribute('class', 'nota');
    this.notaV.setAttribute('id', `${id}`);
    this.notaV.setAttribute('style','left: 100px; top: 100px;');
    this.notaV.style.backgroundColor = colores[color][0];
    document.getElementById('tablero').appendChild(this.notaV);
    this.notaV.setAttribute('onmousedown', 'controlador.agarrar(this); controlador.cambiarDatos(event)');

    this.chincheta = document.createElement('img');
    this.chincheta.setAttribute('src', 'images/chicheta.png');
    this.chincheta.setAttribute('class', 'chicheta');
    this.notaV.appendChild(this.chincheta);

    this.tituloV = document.createElement('h4');
    this.notaV.appendChild(this.tituloV);
    this.tituloV.style.backgroundColor = colores[color][1];
    this.tituloV.innerHTML = titulo;

    this.textoV = document.createElement('textarea');
    this.textoV.setAttribute('onchange', 'controlador.actualizarNota(this)');
    this.notaV.appendChild(this.textoV);
    this.textoV.value = texto;
    this.textoV.style.backgroundColor = colores[color][0];

    this.horaV = document.createElement('p');
    this.notaV.appendChild(this.horaV);
    this.horaV.innerHTML = hora;

    this.boton = document.createElement('button');
    this.boton.setAttribute('type', 'button');
    this.boton.setAttribute('class', 'eliminar');
    this.boton.addEventListener('click', ()=>{
      this.borrarNota(id);
    });
    this.boton.innerHTML = 'X';
    this.tituloV.appendChild(this.boton);
  }

  /** Delete a note (represented by its id) from the list */
  borrarNota(id){
    //Elimina la nota seleccionada por id
    document.getElementById('tablero').removeChild(document.getElementById(id));
    this.controlador.lista.notas.splice(this.controlador.lista.notas[id], 1);
    this.controlador.saveLocalStorage();
  }

}


//CONTROLADOR-----------------------------------------------------------------

/**
 * Represents the driver that communicates View and Model.
 * @constructor
 * @param {object} lista - Instance an element of the class ListaNotas.
 * @param {object} notas - Instance an element of the class NotaView.
*/
class Controlador{
  constructor(){
    this.lista = new ListaNotas();
    this.nuevaVista = new NotaView(this);
    this.boton = document.getElementById('boton');
    this.boton.addEventListener('click',()=>{
      this.insertarPosit();
    });
    this.elemento;
    this.color;
  }

  /** Create a new note and save it in the list */
  insertarPosit(){
    //Crea una nueva nota y la guarda en la lista
    var title = prompt('Escribe un título para la nota');
    this.color = prompt('Selecciona un color: 0 (amarillo), 1 (azul), 2 (violeta), 3 (blanco), 4 (verde) o 5 (rojo).')
    this.hora = new Date();
    this.creada = this.hora.getDate() + '/' + this.hora.getMonth() + '/' + this.hora.getFullYear() + ' ' + this.hora.getHours() + ':' + this.hora.getMinutes() + ':' + this.hora.getSeconds();
    this.lista.notas.push(new Nota(this.lista.id, title, '', this.creada, this.color));
    if ((this.color >= 0) && (this.color <= colores.length)){
      this.nuevaVista.nuevaNota(this.lista.id, title, '', this.creada, this.color);
    }
    else {this.nuevaVista.nuevaNota(this.lista.id, 0)};
    // this.nuevaVista.tituloV.innerHTML = title;
    // this.nuevaVista.horaV.innerHTML = 'Creada el: ' + this.creada;
    this.lista.id++;
    this.saveLocalStorage();
  }

  /** Save in localStorage the textarea changes of the note when they are modified. */
  actualizarNota(elem){
    var x = elem.parentNode;
    for (var elemento of this.lista.notas){
      if(elemento.id == x.id)
        elemento.texto = elem.value;
    }
    this.saveLocalStorage();
  }

  /** When you click on a note, it changes the state of the notaPinchada to true. */
  agarrar(elemento) {
    //Pincha sobra la nota para moverla
    notaPinchada = true;
    this.elemento = elemento;
  }

  /** Saves the current position of the cursor where you clicked and the one of the note at that moment. */
  cambiarDatos(e){
    //Guarda la posición actual donde se ha pinchado y la de la nota en ese momento
    posEY = e.clientY;
    posEX = e.clientX;
    posY = parseInt(this.elemento.style.top);
    posX = parseInt(this.elemento.style.left);
  }

  /** Move the selected note. */
  mover(e) {
    //Mueve la nota seleccionada
    if (notaPinchada) {
      this.elemento.style.top = (posY + e.clientY - posEY) + 'px';
      this.elemento.style.left = (posX + e.clientX - posEX) + 'px';
      }
  }

  /** Store in localStorage. */
  saveLocalStorage() {
    localStorage.notas = JSON.stringify(this.lista.notas);
 }

 /** Load the items stored in localStorage */
  loadStorage () {
      if (localStorage.notas) {
          this.lista.notas = JSON.parse(localStorage.notas);
          for (let i = 0; i < this.lista.notas.length; i++) {
              this.nuevaVista.nuevaNota(this.lista.notas[i].id, this.lista.notas[i].titulo, this.lista.notas[i].texto, this.lista.notas[i].hora, this.lista.notas[i].color);
          }
          return this.lista.notas.length;
      } else return 0;
  }

}


//MAIN------------------------------------------------------------------------

window.onload = () => {
controlador = new Controlador();
controlador.loadStorage();
}

window.onmouseup = function(){
  notaPinchada = false;
}

document.addEventListener('mousemove', function(e) {
  controlador.mover(event);
}, false);
