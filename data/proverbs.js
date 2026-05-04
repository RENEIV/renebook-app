/* =========================================================
   RENEBOOK - DATA / PROVERBS
   Ruta pública esperada:
   https://renebook.org/data/proverbs.js
   ========================================================= */

window.PROVERBS = {
  es: {
    version: "RVR1909",
    book: "Proverbios",
    chapters: [
      {
        number: 1,
        chapter: 1,
        title: "Proverbios 1",
        verses: [
          {
            number: 1,
            verse: 1,
            text: "Los proverbios de Salomón, hijo de David, rey de Israel."
          },
          {
            number: 2,
            verse: 2,
            text: "Para entender sabiduría y doctrina; para conocer razones prudentes."
          },
          {
            number: 3,
            verse: 3,
            text: "Para recibir el consejo de prudencia, justicia, juicio y equidad."
          },
          {
            number: 4,
            verse: 4,
            text: "Para dar sagacidad a los simples, y a los jóvenes inteligencia y cordura."
          },
          {
            number: 5,
            verse: 5,
            text: "Oirá el sabio, y aumentará el saber; y el entendido adquirirá consejo."
          },
          {
            number: 6,
            verse: 6,
            text: "Para entender proverbio y declaración; palabras de sabios, y sus dichos oscuros."
          },
          {
            number: 7,
            verse: 7,
            text: "El principio de la sabiduría es el temor de Jehová: los insensatos desprecian la sabiduría y la enseñanza."
          }
        ],
        devotional: {
          title: "El principio de la sabiduría",
          reflection: "La sabiduría bíblica no comienza con información, sino con reverencia. El temor de Jehová ordena el corazón, la mente y las decisiones.",
          application: "Antes de decidir, estudiar o hablar, pide a Dios un corazón enseñable.",
          prayer: "Señor, dame sabiduría verdadera y un corazón humilde para obedecer tu Palabra. En el nombre de Jesús. Amén."
        }
      },
      {
        number: 2,
        chapter: 2,
        title: "Proverbios 2",
        verses: [
          {
            number: 1,
            verse: 1,
            text: "Hijo mío, si tomares mis palabras, y mis mandamientos guardares dentro de ti."
          },
          {
            number: 2,
            verse: 2,
            text: "Haciendo estar atento tu oído a la sabiduría; si inclinares tu corazón a la prudencia."
          },
          {
            number: 3,
            verse: 3,
            text: "Si clamares a la inteligencia, y a la prudencia dieres tu voz."
          }
        ],
        devotional: {
          title: "Buscar sabiduría con intención",
          reflection: "La sabiduría no se recibe de manera pasiva. Proverbios enseña a escuchar, guardar, inclinar el corazón y clamar a Dios.",
          application: "Haz de la Palabra una búsqueda diaria, no solo una lectura rápida.",
          prayer: "Señor, inclina mi corazón a tu sabiduría y guarda mis pasos en tu verdad. En el nombre de Jesús. Amén."
        }
      },
      {
        number: 3,
        chapter: 3,
        title: "Proverbios 3",
        verses: [
          {
            number: 1,
            verse: 1,
            text: "Hijo mío, no te olvides de mi ley; y tu corazón guarde mis mandamientos."
          },
          {
            number: 2,
            verse: 2,
            text: "Porque largura de días, y años de vida y paz te aumentarán."
          },
          {
            number: 3,
            verse: 3,
            text: "Misericordia y verdad no te desamparen; átalas a tu cuello, escríbelas en la tabla de tu corazón."
          }
        ],
        devotional: {
          title: "Guardar la Palabra en el corazón",
          reflection: "Dios no solo quiere que recordemos su Palabra, sino que la llevemos escrita en el corazón.",
          application: "Practica hoy misericordia y verdad en una conversación concreta.",
          prayer: "Señor, escribe tu verdad en mi corazón y ayúdame a caminar con misericordia. En el nombre de Jesús. Amén."
        }
      }
    ]
  }
};

/* Compatibilidad por si la app busca otro nombre */
window.proverbs = window.PROVERBS;
window.PROVERBIOS = window.PROVERBS;

console.log("✅ Renebook Proverbs data loaded:", window.PROVERBS);
