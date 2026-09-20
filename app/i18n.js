/* IPTBe — idiomes de la interfície.
 *
 * Només es tradueix el que escrivim nosaltres. Els noms dels canals, els títols i les
 * categories venen del proveïdor i es queden tal com arriben.
 *
 * Per afegir un idioma: copia el bloc 'ca' sencer, tradueix els valors i posa'l a LANGS.
 * Les claus que faltin cauen automàticament al català.
 */
'use strict';

const LANGS = {
  ca: { nom: 'Català',  locale: 'ca-ES' },
  es: { nom: 'Español', locale: 'es-ES' },
};

const STR = {

// ─────────────────────────────────── CATALÀ ───────────────────────────────────
ca: {
  // Navegació i barra lateral
  'nav.home': 'Inici',
  'nav.live': 'TV en directe',
  'nav.vod': 'Pel·lícules',
  'nav.series': 'Sèries',
  'nav.favs': 'Favorits',
  'nav.mine': 'EL MEU',
  'nav.config': 'Configuració',
  'nav.quit': 'Aturar IPTBe',
  'nav.quit.title': 'Atura el servidor local',
  'search.all': 'Cerca a tot el catàleg',
  'search.aria': 'Cerca',
  'side.fresh.today': 'Dades actualitzades avui',
  'side.fresh.days': n => `Dades de fa ${n} ${n === 1 ? 'dia' : 'dies'}`,
  'lang.label': 'Idioma',

  // Barra de reproducció
  'now.live': 'EN DIRECTE',
  'now.playing': 'REPRODUINT',
  'now.stop': 'Aturar',

  // Accions generals
  'act.refresh': 'Actualitzar',
  'act.refreshing': 'Actualitzant…',
  'act.back': 'Tornar',
  'toast.refreshed': 'Dades actualitzades',

  // Càrrega
  'load.default': 'Carregant…',
  'load.slow1': 'Està trigant més del normal. Continuo esperant…',
  'load.slow2': 'El teu proveïdor va molt lent avui. Encara hi som.',
  'load.boot': 'Arrencant IPTBe…',
  'load.live': 'Carregant canals i guia de programació…',
  'load.vod': 'Carregant pel·lícules…',
  'load.series': 'Carregant sèries…',
  'load.sheet': 'Carregant la fitxa…',
  'load.favs': 'Carregant els teus favorits…',
  'load.search': 'Buscant a tot el catàleg…',

  // Errors — títol
  'err.t.timeout': 'Massa lent',
  'err.t.offline': 'Sense connexió',
  'err.t.auth': 'Credencials rebutjades',
  'err.t.network': 'No hi arribo',
  'err.t.dns': 'Adreça no trobada',
  'err.t.http': 'El proveïdor ha fallat',
  'err.t.malformed': 'Resposta estranya',
  'err.t.local': 'Servidor local aturat',
  'err.t.no_vlc': 'No trobo el VLC',
  'err.t.unconfigured': 'Falta configurar',
  'err.t.bad_request': 'Falten dades',
  'err.t.generic': 'Alguna cosa ha fallat',

  // Errors — explicació
  'err.m.timeout': 'El teu proveïdor no contesta. Pot ser que el seu servidor estigui saturat o caigut.',
  'err.m.offline': 'No tens connexió a internet.',
  'err.m.auth': 'El proveïdor rebutja les credencials. Revisa usuari i contrasenya a Configuració.',
  'err.m.network': "No s'ha pogut connectar amb el proveïdor.",
  'err.m.dns': "No trobo aquest servidor. Comprova que l'adreça estigui ben escrita, i que tinguis connexió a internet.",
  'err.m.http': 'El proveïdor ha respost amb un error.',
  'err.m.malformed': "El proveïdor ha enviat una resposta que no s'entén.",
  'err.m.local': "No he pogut parlar amb el servidor local. Potser s'ha aturat.",
  'err.m.no_vlc': "No trobo el VLC a /Applications. Instal·la'l per poder reproduir.",
  'err.m.unconfigured': 'Encara no has configurat el proveïdor.',
  'err.m.bad_request': 'Falten dades per completar la petició.',
  'err.m.generic': 'Hi ha hagut un error inesperat.',
  'err.m.wait': s => `Ha trigat més de ${s} segons i he aturat l'espera.`,
  'err.m.wait.detail': 'Pot ser que el teu proveïdor vagi molt lent ara mateix.',
  'err.m.illegible': 'El servidor local ha respost una cosa il·legible.',

  // Errors — què fer
  'err.h.timeout': "Prova-ho de nou d'aquí un moment. Si passa sempre, el servidor del teu proveïdor deu estar saturat.",
  'err.h.offline': 'Comprova el wifi i torna-ho a provar.',
  'err.h.dns': "Sol ser una errada a l'adreça del servidor. Revisa-la a Configuració.",
  'err.h.network': "Revisa la connexió i que l'adreça del servidor a Configuració sigui correcta.",
  'err.h.auth': 'Ves a Configuració i torna a escriure usuari i contrasenya.',
  'err.h.http': 'És un problema del seu costat, no del teu. Torna-ho a provar més tard.',
  'err.h.local': 'Torna a obrir IPTBe fent doble clic a iptbe.command.',
  'err.h.no_vlc': "Descarrega'l de videolan.org i posa'l a la carpeta Aplicacions.",
  'err.retry': 'Torna-ho a provar',
  'err.retrying': 'Provant…',
  'err.goconfig': 'Anar a Configuració',

  // Avís de servidor caigut
  'off.title': 'IPTBe no respon.',
  'off.default': 'Els canvis que facis ara no es desaran.',
  'off.favs': "Els favorits que has marcat NO s'han desat.",
  'off.tail': "Aquesta pestanya pot ser d'una arrencada anterior.",
  'off.retry': 'Reintentar',

  // Diàleg del VLC
  'vlc.title': 'Et falta el VLC',
  'vlc.intro': 'IPTBe no reprodueix el vídeo ell mateix: el passa al VLC, que és qui sap llegir '
             + 'els canals i les pel·lícules del teu proveïdor. Ara mateix no el trobo instal·lat '
             + 'en aquest Mac.',
  'vlc.s1': 'Descarrega el VLC de <a href="https://www.videolan.org/vlc/" target="_blank" '
          + 'rel="noopener">videolan.org/vlc</a>. És gratuït i de codi obert.',
  'vlc.s2': 'Obre el fitxer <code>.dmg</code> i arrossega el VLC a la carpeta <b>Aplicacions</b>.',
  'vlc.s3': 'Ha de quedar exactament a <code>/Applications/VLC.app</code>. Si el deixes a '
          + 'Descàrregues o dins una subcarpeta, no el trobaré.',
  'vlc.still': 'Segueixo sense trobar-lo a /Applications.',
  'vlc.later': 'Ara no',
  'vlc.done': "Ja l'he instal·lat",
  'vlc.checking': 'Comprovant…',
  'vlc.found': 'Perfecte, ja trobo el VLC. Torna-ho a provar.',
  'vlc.boot': 'No trobo el VLC a /Applications. Podràs navegar, però no reproduir.',

  // Reproducció
  'play.opening': 'Obrint el VLC…',
  'play.playing': label => `Reproduint «${label}» al VLC`,
  'play.stopped': 'Reproducció aturada',

  // Aturar l'aplicació
  'quit.confirm': 'Vols aturar IPTBe? El servidor es tancarà. El VLC continuarà obert.',
  'quit.title': "IPTBe s'ha aturat",
  'quit.body': 'El servidor ja no corre en segon pla. Pots tancar aquesta pestanya.',
  'quit.back': 'Per tornar-hi, doble clic a <b>iptbe.command</b>.',

  // Inici
  'home.sports': 'ESPORTS ARA',
  'home.sports.n': n => `${n} ${n === 1 ? 'partit en joc' : 'partits en joc'}`,
  'home.continue': 'CONTINUAR VEIENT',
  'home.new.series': 'NOVETATS · SÈRIES',
  'home.new.vod': 'NOVETATS · PEL·LÍCULES',
  'home.loading': 'carregant…',
  'home.added.today': 'afegides avui',
  'home.added.on': d => `afegides el ${d}`,
  'home.serie': 'Sèrie',

  // TV en directe
  'live.search': 'Cerca un canal',
  'live.cats': n => `CATEGORIES · ${n}`,
  'live.col.channel': 'CANAL',
  'live.col.now': h => `ARA · ${h}`,
  'live.col.next': 'A CONTINUACIÓ',
  'live.sub.search': (q, n) => `«${q}» · ${n} ${n === 1 ? 'canal' : 'canals'} a totes les categories`,
  'live.sub.cat': (cat, n) => `${cat} · ${n} canals`,
  'live.sub.guide': h => ` · guia de les ${h}`,
  'live.sub.noguide': ' · sense guia',
  'live.empty': q => `Cap canal per a «${q}».`,
  'live.noepg': 'Sense guia de programació',
  'live.now': 'ARA',
  'live.after': (h, t) => `Després · ${h} ${t}`,
  'live.next': h => `DESPRÉS · ${h}`,
  'live.fav': 'Favorit',
  'live.archive': 'Es pot recuperar',
  'live.epgfail': m => `Canals carregats, però la guia no: ${m}`,

  // Graelles de pel·lícules i sèries
  'grid.vod.search': 'Cerca una pel·lícula',
  'grid.series.search': 'Cerca una sèrie',
  'grid.sub.search': (q, n) => `«${q}» · ${n} ${n === 1 ? 'resultat' : 'resultats'} a totes les categories`,
  'grid.sub.cat': (cat, n) => `${cat} · ${n} títols`,
  'grid.empty.search': q => `Cap resultat per a «${q}».`,
  'grid.empty.cat': 'Aquesta categoria és buida.',
  'grid.more': (a, b) => `Carrega'n ${a} més (en queden ${b})`,

  // Fitxa de sèrie
  'serie.title': 'Sèrie',
  'serie.seasons': (s, e) => `${s} ${s === 1 ? 'temporada' : 'temporades'} · ${e} episodis`,
  'serie.runtime': m => `~${m} min`,
  'serie.season': k => `Temporada ${k}`,
  'serie.ep': n => `Episodi ${n}`,
  'serie.min': m => `${m} min`,
  'fav.on': 'Als favorits',
  'fav.add': 'Afegir a favorits',
  'sheet.cast': 'REPARTIMENT',

  // Fitxa de pel·lícula
  'movie.title': 'Pel·lícula',
  'movie.open': 'Obrir al VLC',

  // Favorits
  'favs.channels': 'CANALS',
  'favs.series': 'SÈRIES',
  'favs.vod': 'PEL·LÍCULES',
  'favs.empty': "Encara no tens res marcat. Toca l'estrella a qualsevol canal, pel·lícula o sèrie.",

  // Cerca
  'search.title': 'Cerca',
  'search.short': 'Escriu almenys dues lletres.',
  'search.n': n => `${n} resultats`,
  'search.empty': q => `Cap resultat per a «${q}».`,

  // Configuració
  'cfg.tagline': "Entra i gaudeix dels teus canals d'IPTV.",
  'cfg.f1': 'Guia de programació en directe',
  'cfg.f2': 'Favorits i historial, teus i locals',
  'cfg.f3': 'Reproducció al VLC amb un clic',
  'cfg.server': 'SERVIDOR',
  'cfg.user': 'USUARI',
  'cfg.pass': 'CONTRASENYA',
  'cfg.ph.server': 'https://el-teu-servidor.com:8443',
  'cfg.ph.user': 'el teu usuari',
  'cfg.ph.pass': 'la teva contrasenya',
  'cfg.test': 'Provar connexió',
  'cfg.testing': 'Provant…',
  'cfg.save': 'Desar i entrar',
  'cfg.start': 'Comencem',
  'cfg.intro': 'Enganxa les dades del teu proveïdor. Es desaran només en aquest ordinador.',
  'cfg.missing.t': 'Falten dades',
  'cfg.missing.b': 'Omple els tres camps abans de provar.',
  'cfg.ok.t': 'Connexió correcta',
  'cfg.acct': s => `Compte ${s}`,
  'cfg.acct.active': 'actiu',
  'cfg.acct.until': d => ` fins al ${d}`,
  'cfg.conns': n => `${n} ${n === '1' ? 'connexió simultània' : 'connexions simultànies'}`,
  'cfg.conns.one': ' — no podràs veure dues coses alhora.',
  'cfg.saved': 'Credencials desades',
  'cfg.savefail': 'No he pogut desar',
},

// ─────────────────────────────────── CASTELLÀ ───────────────────────────────────
es: {
  'nav.home': 'Inicio',
  'nav.live': 'TV en directo',
  'nav.vod': 'Películas',
  'nav.series': 'Series',
  'nav.favs': 'Favoritos',
  'nav.mine': 'LO MÍO',
  'nav.config': 'Configuración',
  'nav.quit': 'Parar IPTBe',
  'nav.quit.title': 'Para el servidor local',
  'search.all': 'Busca en todo el catálogo',
  'search.aria': 'Busca',
  'side.fresh.today': 'Datos actualizados hoy',
  'side.fresh.days': n => `Datos de hace ${n} ${n === 1 ? 'día' : 'días'}`,
  'lang.label': 'Idioma',

  'now.live': 'EN DIRECTO',
  'now.playing': 'REPRODUCIENDO',
  'now.stop': 'Parar',

  'act.refresh': 'Actualizar',
  'act.refreshing': 'Actualizando…',
  'act.back': 'Volver',
  'toast.refreshed': 'Datos actualizados',

  'load.default': 'Cargando…',
  'load.slow1': 'Está tardando más de lo normal. Sigo esperando…',
  'load.slow2': 'Tu proveedor va muy lento hoy. Seguimos aquí.',
  'load.boot': 'Arrancando IPTBe…',
  'load.live': 'Cargando canales y guía de programación…',
  'load.vod': 'Cargando películas…',
  'load.series': 'Cargando series…',
  'load.sheet': 'Cargando la ficha…',
  'load.favs': 'Cargando tus favoritos…',
  'load.search': 'Buscando en todo el catálogo…',

  'err.t.timeout': 'Demasiado lento',
  'err.t.offline': 'Sin conexión',
  'err.t.auth': 'Credenciales rechazadas',
  'err.t.network': 'No llego',
  'err.t.dns': 'Dirección no encontrada',
  'err.t.http': 'El proveedor ha fallado',
  'err.t.malformed': 'Respuesta extraña',
  'err.t.local': 'Servidor local parado',
  'err.t.no_vlc': 'No encuentro VLC',
  'err.t.unconfigured': 'Falta configurar',
  'err.t.bad_request': 'Faltan datos',
  'err.t.generic': 'Algo ha fallado',

  'err.m.timeout': 'Tu proveedor no contesta. Puede que su servidor esté saturado o caído.',
  'err.m.offline': 'No tienes conexión a internet.',
  'err.m.auth': 'El proveedor rechaza las credenciales. Revisa usuario y contraseña en Configuración.',
  'err.m.network': 'No se ha podido conectar con el proveedor.',
  'err.m.dns': 'No encuentro este servidor. Comprueba que la dirección esté bien escrita, y que tengas conexión a internet.',
  'err.m.http': 'El proveedor ha respondido con un error.',
  'err.m.malformed': 'El proveedor ha enviado una respuesta que no se entiende.',
  'err.m.local': 'No he podido hablar con el servidor local. Puede que se haya parado.',
  'err.m.no_vlc': 'No encuentro VLC en /Applications. Instálalo para poder reproducir.',
  'err.m.unconfigured': 'Todavía no has configurado el proveedor.',
  'err.m.bad_request': 'Faltan datos para completar la petición.',
  'err.m.generic': 'Ha habido un error inesperado.',
  'err.m.wait': s => `Ha tardado más de ${s} segundos y he parado la espera.`,
  'err.m.wait.detail': 'Puede que tu proveedor vaya muy lento ahora mismo.',
  'err.m.illegible': 'El servidor local ha respondido algo ilegible.',

  'err.h.timeout': 'Inténtalo de nuevo dentro de un momento. Si pasa siempre, el servidor de tu proveedor debe de estar saturado.',
  'err.h.offline': 'Comprueba el wifi y vuelve a intentarlo.',
  'err.h.dns': 'Suele ser un error en la dirección del servidor. Revísala en Configuración.',
  'err.h.network': 'Revisa la conexión y que la dirección del servidor en Configuración sea correcta.',
  'err.h.auth': 'Ve a Configuración y vuelve a escribir usuario y contraseña.',
  'err.h.http': 'Es un problema de su lado, no del tuyo. Vuelve a intentarlo más tarde.',
  'err.h.local': 'Vuelve a abrir IPTBe haciendo doble clic en iptbe.command.',
  'err.h.no_vlc': 'Descárgalo de videolan.org y ponlo en la carpeta Aplicaciones.',
  'err.retry': 'Vuelve a intentarlo',
  'err.retrying': 'Probando…',
  'err.goconfig': 'Ir a Configuración',

  'off.title': 'IPTBe no responde.',
  'off.default': 'Los cambios que hagas ahora no se guardarán.',
  'off.favs': 'Los favoritos que has marcado NO se han guardado.',
  'off.tail': 'Esta pestaña puede ser de un arranque anterior.',
  'off.retry': 'Reintentar',

  'vlc.title': 'Te falta VLC',
  'vlc.intro': 'IPTBe no reproduce el vídeo él mismo: se lo pasa a VLC, que es quien sabe leer '
             + 'los canales y las películas de tu proveedor. Ahora mismo no lo encuentro instalado '
             + 'en este Mac.',
  'vlc.s1': 'Descarga VLC de <a href="https://www.videolan.org/vlc/" target="_blank" '
          + 'rel="noopener">videolan.org/vlc</a>. Es gratuito y de código abierto.',
  'vlc.s2': 'Abre el archivo <code>.dmg</code> y arrastra VLC a la carpeta <b>Aplicaciones</b>.',
  'vlc.s3': 'Tiene que quedar exactamente en <code>/Applications/VLC.app</code>. Si lo dejas en '
          + 'Descargas o dentro de una subcarpeta, no lo encontraré.',
  'vlc.still': 'Sigo sin encontrarlo en /Applications.',
  'vlc.later': 'Ahora no',
  'vlc.done': 'Ya lo he instalado',
  'vlc.checking': 'Comprobando…',
  'vlc.found': 'Perfecto, ya encuentro VLC. Vuelve a intentarlo.',
  'vlc.boot': 'No encuentro VLC en /Applications. Podrás navegar, pero no reproducir.',

  'play.opening': 'Abriendo VLC…',
  'play.playing': label => `Reproduciendo «${label}» en VLC`,
  'play.stopped': 'Reproducción parada',

  'quit.confirm': '¿Quieres parar IPTBe? El servidor se cerrará. VLC seguirá abierto.',
  'quit.title': 'IPTBe se ha parado',
  'quit.body': 'El servidor ya no corre en segundo plano. Puedes cerrar esta pestaña.',
  'quit.back': 'Para volver, doble clic en <b>iptbe.command</b>.',

  'home.sports': 'DEPORTES AHORA',
  'home.sports.n': n => `${n} ${n === 1 ? 'partido en juego' : 'partidos en juego'}`,
  'home.continue': 'SEGUIR VIENDO',
  'home.new.series': 'NOVEDADES · SERIES',
  'home.new.vod': 'NOVEDADES · PELÍCULAS',
  'home.loading': 'cargando…',
  'home.added.today': 'añadidas hoy',
  'home.added.on': d => `añadidas el ${d}`,
  'home.serie': 'Serie',

  'live.search': 'Busca un canal',
  'live.cats': n => `CATEGORÍAS · ${n}`,
  'live.col.channel': 'CANAL',
  'live.col.now': h => `AHORA · ${h}`,
  'live.col.next': 'A CONTINUACIÓN',
  'live.sub.search': (q, n) => `«${q}» · ${n} ${n === 1 ? 'canal' : 'canales'} en todas las categorías`,
  'live.sub.cat': (cat, n) => `${cat} · ${n} canales`,
  'live.sub.guide': h => ` · guía de las ${h}`,
  'live.sub.noguide': ' · sin guía',
  'live.empty': q => `Ningún canal para «${q}».`,
  'live.noepg': 'Sin guía de programación',
  'live.now': 'AHORA',
  'live.after': (h, t) => `Después · ${h} ${t}`,
  'live.next': h => `DESPUÉS · ${h}`,
  'live.fav': 'Favorito',
  'live.archive': 'Se puede recuperar',
  'live.epgfail': m => `Canales cargados, pero la guía no: ${m}`,

  'grid.vod.search': 'Busca una película',
  'grid.series.search': 'Busca una serie',
  'grid.sub.search': (q, n) => `«${q}» · ${n} ${n === 1 ? 'resultado' : 'resultados'} en todas las categorías`,
  'grid.sub.cat': (cat, n) => `${cat} · ${n} títulos`,
  'grid.empty.search': q => `Ningún resultado para «${q}».`,
  'grid.empty.cat': 'Esta categoría está vacía.',
  'grid.more': (a, b) => `Carga ${a} más (quedan ${b})`,

  'serie.title': 'Serie',
  'serie.seasons': (s, e) => `${s} ${s === 1 ? 'temporada' : 'temporadas'} · ${e} episodios`,
  'serie.runtime': m => `~${m} min`,
  'serie.season': k => `Temporada ${k}`,
  'serie.ep': n => `Episodio ${n}`,
  'serie.min': m => `${m} min`,
  'fav.on': 'En favoritos',
  'fav.add': 'Añadir a favoritos',
  'sheet.cast': 'REPARTO',

  'movie.title': 'Película',
  'movie.open': 'Abrir en VLC',

  'favs.channels': 'CANALES',
  'favs.series': 'SERIES',
  'favs.vod': 'PELÍCULAS',
  'favs.empty': 'Todavía no tienes nada marcado. Toca la estrella en cualquier canal, película o serie.',

  'search.title': 'Búsqueda',
  'search.short': 'Escribe al menos dos letras.',
  'search.n': n => `${n} resultados`,
  'search.empty': q => `Ningún resultado para «${q}».`,

  'cfg.tagline': 'Entra y disfruta de tus canales de IPTV.',
  'cfg.f1': 'Guía de programación en directo',
  'cfg.f2': 'Favoritos e historial, tuyos y locales',
  'cfg.f3': 'Reproducción en VLC con un clic',
  'cfg.server': 'SERVIDOR',
  'cfg.user': 'USUARIO',
  'cfg.pass': 'CONTRASEÑA',
  'cfg.ph.server': 'https://tu-servidor.com:8443',
  'cfg.ph.user': 'tu usuario',
  'cfg.ph.pass': 'tu contraseña',
  'cfg.test': 'Probar conexión',
  'cfg.testing': 'Probando…',
  'cfg.save': 'Guardar y entrar',
  'cfg.start': 'Empecemos',
  'cfg.intro': 'Pega los datos de tu proveedor. Se guardarán solo en este ordenador.',
  'cfg.missing.t': 'Faltan datos',
  'cfg.missing.b': 'Rellena los tres campos antes de probar.',
  'cfg.ok.t': 'Conexión correcta',
  'cfg.acct': s => `Cuenta ${s}`,
  'cfg.acct.active': 'activa',
  'cfg.acct.until': d => ` hasta el ${d}`,
  'cfg.conns': n => `${n} ${n === '1' ? 'conexión simultánea' : 'conexiones simultáneas'}`,
  'cfg.conns.one': ' — no podrás ver dos cosas a la vez.',
  'cfg.saved': 'Credenciales guardadas',
  'cfg.savefail': 'No he podido guardar',
},

};

// ─────────────────────────────── maquinària ───────────────────────────────

// L'idioma del navegador mana el primer cop. Mirem NOMÉS el principal: si el navegador
// està en anglès, encara que tingui el castellà com a segona opció a la llista, obrim en
// català. 'ca-ES' i 'ca' valen igual: ens quedem amb la part de davant del guionet.
function detectLang() {
  const principal = navigator.languages?.[0] || navigator.language || '';
  const base = String(principal).toLowerCase().split('-')[0];
  return LANGS[base] ? base : 'ca';
}

const LANG_KEY = 'iptbe.lang';
let LANG = (() => {
  let desat = null;
  try { desat = localStorage.getItem(LANG_KEY); } catch { /* finestra privada */ }
  return LANGS[desat] ? desat : detectLang();
})();

// Si falta la clau en l'idioma triat, cau al català; si tampoc hi és, ensenya la clau
// crua, que és lleig però visible — així un oblit es detecta de seguida.
function t(key, ...args) {
  const v = STR[LANG]?.[key] ?? STR.ca[key];
  if (v == null) return key;
  return typeof v === 'function' ? v(...args) : v;
}

const lang = () => LANG;
const locale = () => LANGS[LANG].locale;

function setLang(code) {
  if (!LANGS[code] || code === LANG) return false;
  LANG = code;
  try { localStorage.setItem(LANG_KEY, code); } catch { /* res greu: durarà la sessió */ }
  document.documentElement.lang = code;
  return true;
}

document.documentElement.lang = LANG;
