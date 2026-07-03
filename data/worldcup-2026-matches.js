/**
 * ReneBook — World Cup 2026 Dynamic Match Data
 * Archivo: data/worldcup-2026-matches.js
 *
 * REEMPLAZA completamente el arreglo estático anterior.
 *
 * Características:
 * - Conserva window.RENEBOOK_WORLDCUP_2026_MATCHES
 * - Descarga calendario, estados y resultados actualizados
 * - Convierte automáticamente los datos al formato usado por ReneBook
 * - Mantiene contenido bilingüe español / inglés
 * - Usa horario UTC como fuente y permite conversión local
 * - Guarda caché temporal en el navegador
 * - No requiere API key
 *
 * Fuente deportiva:
 * ESPN public scoreboard JSON.
 *
 * Nota:
 * Esta integración no está afiliada ni respaldada por FIFA o ESPN.
 */

(function initializeReneBookWorldCup2026() {
  "use strict";

  /* =========================================================
     CONFIGURACIÓN
  ========================================================= */

  const CONFIG = {
    tournamentYear: 2026,

    apiUrl:
      "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard",

    dateRange: "20260611-20260719",

    cacheKey: "renebook_worldcup_2026_dynamic_cache_v2",

    cacheDurationMs: 5 * 60 * 1000,

    requestTimeoutMs: 15000,

    defaultTimeZone: "America/Los_Angeles",

    defaultLocale: "es-US"
  };

  /*
   * Se crea inmediatamente para conservar compatibilidad
   * con las funciones existentes de ReneBook.
   */
  window.RENEBOOK_WORLDCUP_2026_MATCHES = [];

  window.RENEBOOK_WORLDCUP_2026_STATE = {
    loading: true,
    loaded: false,
    error: null,
    source: "ESPN",
    lastUpdated: null
  };

  /* =========================================================
     TRADUCCIONES DE EQUIPOS
  ========================================================= */

  const TEAM_TRANSLATIONS = {
    ARG: { es: "Argentina", en: "Argentina" },
    ALG: { es: "Argelia", en: "Algeria" },
    DZA: { es: "Argelia", en: "Algeria" },
    AUS: { es: "Australia", en: "Australia" },
    AUT: { es: "Austria", en: "Austria" },
    BEL: { es: "Bélgica", en: "Belgium" },
    BIH: {
      es: "Bosnia y Herzegovina",
      en: "Bosnia and Herzegovina"
    },
    BRA: { es: "Brasil", en: "Brazil" },
    CAN: { es: "Canadá", en: "Canada" },
    CPV: { es: "Cabo Verde", en: "Cape Verde" },
    COL: { es: "Colombia", en: "Colombia" },
    KOR: { es: "Corea del Sur", en: "South Korea" },
    CRC: { es: "Costa Rica", en: "Costa Rica" },
    CIV: { es: "Costa de Marfil", en: "Côte d'Ivoire" },
    CRO: { es: "Croacia", en: "Croatia" },
    CUW: { es: "Curaçao", en: "Curaçao" },
    DEN: { es: "Dinamarca", en: "Denmark" },
    ECU: { es: "Ecuador", en: "Ecuador" },
    EGY: { es: "Egipto", en: "Egypt" },
    ENG: { es: "Inglaterra", en: "England" },
    ESP: { es: "España", en: "Spain" },
    USA: { es: "Estados Unidos", en: "United States" },
    FRA: { es: "Francia", en: "France" },
    GER: { es: "Alemania", en: "Germany" },
    GHA: { es: "Ghana", en: "Ghana" },
    HAI: { es: "Haití", en: "Haiti" },
    NED: { es: "Países Bajos", en: "Netherlands" },
    IRN: { es: "Irán", en: "Iran" },
    IRQ: { es: "Irak", en: "Iraq" },
    JPN: { es: "Japón", en: "Japan" },
    JOR: { es: "Jordania", en: "Jordan" },
    MAR: { es: "Marruecos", en: "Morocco" },
    MEX: { es: "México", en: "Mexico" },
    NOR: { es: "Noruega", en: "Norway" },
    NZL: { es: "Nueva Zelanda", en: "New Zealand" },
    PAN: { es: "Panamá", en: "Panama" },
    PAR: { es: "Paraguay", en: "Paraguay" },
    POL: { es: "Polonia", en: "Poland" },
    POR: { es: "Portugal", en: "Portugal" },
    QAT: { es: "Qatar", en: "Qatar" },
    COD: { es: "RD Congo", en: "DR Congo" },
    KSA: { es: "Arabia Saudita", en: "Saudi Arabia" },
    SCO: { es: "Escocia", en: "Scotland" },
    SEN: { es: "Senegal", en: "Senegal" },
    SRB: { es: "Serbia", en: "Serbia" },
    RSA: { es: "Sudáfrica", en: "South Africa" },
    SUI: { es: "Suiza", en: "Switzerland" },
    SWE: { es: "Suecia", en: "Sweden" },
    TUN: { es: "Túnez", en: "Tunisia" },
    TUR: { es: "Türkiye", en: "Türkiye" },
    URU: { es: "Uruguay", en: "Uruguay" },
    UZB: { es: "Uzbekistán", en: "Uzbekistan" }
  };

  /* =========================================================
     TRADUCCIONES DE ETAPAS
  ========================================================= */

  const STAGE_TRANSLATIONS = {
    "group stage": {
      es: "Fase de grupos",
      en: "Group Stage"
    },
    group: {
      es: "Fase de grupos",
      en: "Group Stage"
    },
    "round of 32": {
      es: "Ronda de 32",
      en: "Round of 32"
    },
    "round of 16": {
      es: "Octavos de final",
      en: "Round of 16"
    },
    quarterfinal: {
      es: "Cuartos de final",
      en: "Quarterfinal"
    },
    quarterfinals: {
      es: "Cuartos de final",
      en: "Quarterfinals"
    },
    semifinal: {
      es: "Semifinal",
      en: "Semifinal"
    },
    semifinals: {
      es: "Semifinales",
      en: "Semifinals"
    },
    "third place": {
      es: "Partido por el tercer lugar",
      en: "Third-place Match"
    },
    "3rd place playoff": {
      es: "Partido por el tercer lugar",
      en: "Third-place Playoff"
    },
    final: {
      es: "Final",
      en: "Final"
    }
  };

  /* =========================================================
     FUNCIONES AUXILIARES
  ========================================================= */

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function safeText(value, fallback = "") {
    if (value === undefined || value === null) {
      return fallback;
    }

    return String(value).trim() || fallback;
  }

  function safeNumber(value) {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  function getTeamTranslation(code, apiName) {
    const normalizedCode = safeText(code).toUpperCase();
    const translation = TEAM_TRANSLATIONS[normalizedCode];

    if (translation) {
      return translation;
    }

    const fallbackName = safeText(apiName, "Por definir");

    return {
      es: fallbackName,
      en: fallbackName
    };
  }

  function detectStage(event, competition) {
    const candidates = [
      competition?.type?.text,
      competition?.type?.abbreviation,
      competition?.notes?.[0]?.headline,
      event?.seasonType?.name,
      event?.season?.type,
      event?.shortName
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (candidates.includes("round of 32")) {
      return {
        key: "round of 32",
        es: "Ronda de 32",
        en: "Round of 32"
      };
    }

    if (candidates.includes("round of 16")) {
      return {
        key: "round of 16",
        es: "Octavos de final",
        en: "Round of 16"
      };
    }

    if (
      candidates.includes("quarterfinal") ||
      candidates.includes("quarter-final")
    ) {
      return {
        key: "quarterfinal",
        es: "Cuartos de final",
        en: "Quarterfinal"
      };
    }

    if (
      candidates.includes("semifinal") ||
      candidates.includes("semi-final")
    ) {
      return {
        key: "semifinal",
        es: "Semifinal",
        en: "Semifinal"
      };
    }

    if (
      candidates.includes("third place") ||
      candidates.includes("3rd place")
    ) {
      return {
        key: "third place",
        es: "Partido por el tercer lugar",
        en: "Third-place Match"
      };
    }

    if (
      candidates.includes("final") &&
      !candidates.includes("semifinal") &&
      !candidates.includes("quarterfinal")
    ) {
      return {
        key: "final",
        es: "Final",
        en: "Final"
      };
    }

    return {
      key: "group stage",
      es: "Fase de grupos",
      en: "Group Stage"
    };
  }

  function detectGroup(event, competition) {
    const text = [
      competition?.notes?.[0]?.headline,
      competition?.type?.text,
      event?.name,
      event?.shortName
    ]
      .filter(Boolean)
      .join(" ");

    const match =
      text.match(/group\s+([A-L])/i) ||
      text.match(/grupo\s+([A-L])/i);

    return match ? match[1].toUpperCase() : "";
  }

  function translateStatus(statusType) {
    const state = normalizeText(statusType?.state);
    const name = normalizeText(statusType?.name);
    const detail = normalizeText(statusType?.detail);

    if (
      state === "in" ||
      name.includes("in progress") ||
      name.includes("halftime")
    ) {
      return {
        code: "live",
        es: "En vivo",
        en: "Live"
      };
    }

    if (
      state === "post" ||
      statusType?.completed === true ||
      name.includes("final")
    ) {
      return {
        code: "final",
        es: "Finalizado",
        en: "Final"
      };
    }

    if (name.includes("postponed") || detail.includes("postponed")) {
      return {
        code: "postponed",
        es: "Pospuesto",
        en: "Postponed"
      };
    }

    if (name.includes("canceled") || name.includes("cancelled")) {
      return {
        code: "cancelled",
        es: "Cancelado",
        en: "Cancelled"
      };
    }

    return {
      code: "scheduled",
      es: "Programado",
      en: "Scheduled"
    };
  }

  function getFlagUrl(competitor) {
    return (
      competitor?.team?.flag?.href ||
      competitor?.team?.logos?.[0]?.href ||
      ""
    );
  }

  function getTeamWinner(competitor) {
    return competitor?.winner === true;
  }

  function formatOfficialTime(kickoffUtc) {
    if (!kickoffUtc) {
      return "";
    }

    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short"
      }).format(new Date(kickoffUtc));
    } catch (error) {
      return "";
    }
  }

  function formatLocalDateTime(
    kickoffUtc,
    locale = CONFIG.defaultLocale,
    timeZone = CONFIG.defaultTimeZone
  ) {
    if (!kickoffUtc) {
      return "";
    }

    try {
      return new Intl.DateTimeFormat(locale, {
        timeZone,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }).format(new Date(kickoffUtc));
    } catch (error) {
      console.warn(
        "ReneBook: no se pudo convertir la fecha.",
        error
      );

      return kickoffUtc;
    }
  }

  function createNote(stage, status, homeName, awayName) {
    if (status.code === "live") {
      return {
        es: `${homeName.es} y ${awayName.es} están jugando en vivo.`,
        en: `${homeName.en} and ${awayName.en} are playing live.`
      };
    }

    if (status.code === "final") {
      return {
        es: `Partido finalizado de ${stage.es}.`,
        en: `Completed ${stage.en} match.`
      };
    }

    return {
      es: `Próximo partido de ${stage.es}.`,
      en: `Upcoming ${stage.en} match.`
    };
  }

  /* =========================================================
     TRANSFORMACIÓN DE DATOS ESPN → RENEBOOK
  ========================================================= */

  function transformEvent(event, index) {
    const competition = event?.competitions?.[0] || {};

    const competitors = Array.isArray(competition.competitors)
      ? competition.competitors
      : [];

    const homeCompetitor =
      competitors.find(
        (competitor) => competitor.homeAway === "home"
      ) || competitors[0] || {};

    const awayCompetitor =
      competitors.find(
        (competitor) => competitor.homeAway === "away"
      ) || competitors[1] || {};

    const homeCode = safeText(
      homeCompetitor?.team?.abbreviation,
      "TBD"
    ).toUpperCase();

    const awayCode = safeText(
      awayCompetitor?.team?.abbreviation,
      "TBD"
    ).toUpperCase();

    const homeApiName =
      homeCompetitor?.team?.displayName ||
      homeCompetitor?.team?.shortDisplayName ||
      homeCompetitor?.team?.name ||
      "TBD";

    const awayApiName =
      awayCompetitor?.team?.displayName ||
      awayCompetitor?.team?.shortDisplayName ||
      awayCompetitor?.team?.name ||
      "TBD";

    const homeName = getTeamTranslation(homeCode, homeApiName);
    const awayName = getTeamTranslation(awayCode, awayApiName);

    const kickoffUtc =
      event?.date ||
      competition?.date ||
      "";

    const stage = detectStage(event, competition);
    const group = detectGroup(event, competition);
    const status = translateStatus(event?.status?.type);

    const venueName =
      competition?.venue?.fullName ||
      competition?.venue?.shortName ||
      "";

    const city =
      competition?.venue?.address?.city ||
      "";

    const country =
      competition?.venue?.address?.country ||
      "";

    const location = [venueName, city, country]
      .filter(Boolean)
      .filter(
        (value, position, array) =>
          array.indexOf(value) === position
      )
      .join(" · ");

    const notes = createNote(
      stage,
      status,
      homeName,
      awayName
    );

    const homeScore = safeNumber(homeCompetitor?.score);
    const awayScore = safeNumber(awayCompetitor?.score);

    const broadcasts = Array.isArray(competition?.broadcasts)
      ? competition.broadcasts
          .flatMap((broadcast) => broadcast?.names || [])
          .filter(Boolean)
      : [];

    return {
      id: safeText(event?.id, String(index + 1)),

      espnId: safeText(event?.id),

      date: kickoffUtc
        ? new Date(kickoffUtc).toISOString().slice(0, 10)
        : "",

      officialTime: formatOfficialTime(kickoffUtc),

      kickoffUtc,

      localTime: formatLocalDateTime(kickoffUtc),

      stage: stage.en,

      stageKey: stage.key,

      stageEs: stage.es,

      stageEn: stage.en,

      group,

      source: "ESPN",

      status: status.code,

      statusEs: status.es,

      statusEn: status.en,

      completed: event?.status?.type?.completed === true,

      home: {
        id: safeText(homeCompetitor?.team?.id),
        code: homeCode,
        flag: homeCode,
        flagUrl: getFlagUrl(homeCompetitor),
        es: homeName.es,
        en: homeName.en,
        score: homeScore,
        winner: getTeamWinner(homeCompetitor)
      },

      away: {
        id: safeText(awayCompetitor?.team?.id),
        code: awayCode,
        flag: awayCode,
        flagUrl: getFlagUrl(awayCompetitor),
        es: awayName.es,
        en: awayName.en,
        score: awayScore,
        winner: getTeamWinner(awayCompetitor)
      },

      score: {
        home: homeScore,
        away: awayScore,
        display:
          homeScore !== null && awayScore !== null
            ? `${homeScore} - ${awayScore}`
            : ""
      },

      stadium: {
        es: location,
        en: location
      },

      venue: venueName,

      city,

      country,

      broadcasts,

      es: {
        title: `${homeName.es} vs ${awayName.es}`,
        teams: `${homeName.es} vs ${awayName.es}`,
        location,
        note: notes.es,
        stage: stage.es,
        status: status.es,
        localTime: formatLocalDateTime(
          kickoffUtc,
          "es-US",
          CONFIG.defaultTimeZone
        )
      },

      en: {
        title: `${homeName.en} vs ${awayName.en}`,
        teams: `${homeName.en} vs ${awayName.en}`,
        location,
        note: notes.en,
        stage: stage.en,
        status: status.en,
        localTime: formatLocalDateTime(
          kickoffUtc,
          "en-US",
          CONFIG.defaultTimeZone
        )
      },

      links: Array.isArray(event?.links)
        ? event.links.map((link) => ({
            text: safeText(link?.text),
            href: safeText(link?.href)
          }))
        : [],

      lastUpdated:
        event?.status?.type?.detail ||
        new Date().toISOString()
    };
  }

  /* =========================================================
     CACHÉ
  ========================================================= */

  function getCachedMatches() {
    try {
      const rawCache = localStorage.getItem(CONFIG.cacheKey);

      if (!rawCache) {
        return null;
      }

      const cache = JSON.parse(rawCache);

      if (
        !cache ||
        !Array.isArray(cache.matches) ||
        !cache.savedAt
      ) {
        return null;
      }

      const cacheAge = Date.now() - cache.savedAt;

      if (cacheAge > CONFIG.cacheDurationMs) {
        return null;
      }

      return cache.matches;
    } catch (error) {
      console.warn(
        "ReneBook: no se pudo leer la caché.",
        error
      );

      return null;
    }
  }

  function saveMatchesToCache(matches) {
    try {
      localStorage.setItem(
        CONFIG.cacheKey,
        JSON.stringify({
          savedAt: Date.now(),
          matches
        })
      );
    } catch (error) {
      console.warn(
        "ReneBook: no se pudo guardar la caché.",
        error
      );
    }
  }

  /* =========================================================
     SOLICITUD A ESPN
  ========================================================= */

  async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      return await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        cache: "no-store",
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function fetchWorldCupMatches(options = {}) {
    const forceRefresh = options.forceRefresh === true;

    if (!forceRefresh) {
      const cachedMatches = getCachedMatches();

      if (cachedMatches) {
        updateGlobalMatches(cachedMatches, "cache");
        return cachedMatches;
      }
    }

    const apiRequestUrl =
      `${CONFIG.apiUrl}` +
      `?dates=${encodeURIComponent(CONFIG.dateRange)}` +
      `&limit=200`;

    window.RENEBOOK_WORLDCUP_2026_STATE.loading = true;
    window.RENEBOOK_WORLDCUP_2026_STATE.error = null;

    dispatchDataEvent(
      "renebook:worldcup-loading",
      {
        source: "ESPN",
        loading: true
      }
    );

    try {
      const response = await fetchWithTimeout(
        apiRequestUrl,
        CONFIG.requestTimeoutMs
      );

      if (!response.ok) {
        throw new Error(
          `ESPN respondió con código ${response.status}.`
        );
      }

      const payload = await response.json();

      if (!payload || !Array.isArray(payload.events)) {
        throw new Error(
          "La respuesta deportiva no contiene una lista válida de partidos."
        );
      }

      const matches = payload.events
        .map(transformEvent)
        .filter(
          (match) =>
            match.home.code !== "TBD" ||
            match.away.code !== "TBD"
        )
        .sort((firstMatch, secondMatch) => {
          return (
            new Date(firstMatch.kickoffUtc).getTime() -
            new Date(secondMatch.kickoffUtc).getTime()
          );
        });

      saveMatchesToCache(matches);
      updateGlobalMatches(matches, "network");

      return matches;
    } catch (error) {
      console.error(
        "ReneBook World Cup 2026:",
        error
      );

      window.RENEBOOK_WORLDCUP_2026_STATE.loading = false;
      window.RENEBOOK_WORLDCUP_2026_STATE.loaded = false;
      window.RENEBOOK_WORLDCUP_2026_STATE.error =
        error instanceof Error
          ? error.message
          : "No fue posible cargar los partidos.";

      dispatchDataEvent(
        "renebook:worldcup-error",
        {
          error:
            window.RENEBOOK_WORLDCUP_2026_STATE.error
        }
      );

      return window.RENEBOOK_WORLDCUP_2026_MATCHES;
    }
  }

  /* =========================================================
     ACTUALIZACIÓN GLOBAL
  ========================================================= */

  function updateGlobalMatches(matches, loadSource) {
    /*
     * Usamos splice en lugar de reemplazar el arreglo.
     * De esta manera, cualquier parte de la app que conserve
     * una referencia al arreglo original recibirá los cambios.
     */
    window.RENEBOOK_WORLDCUP_2026_MATCHES.splice(
      0,
      window.RENEBOOK_WORLDCUP_2026_MATCHES.length,
      ...matches
    );

    window.RENEBOOK_WORLDCUP_2026_STATE.loading = false;
    window.RENEBOOK_WORLDCUP_2026_STATE.loaded = true;
    window.RENEBOOK_WORLDCUP_2026_STATE.error = null;
    window.RENEBOOK_WORLDCUP_2026_STATE.lastUpdated =
      new Date().toISOString();
    window.RENEBOOK_WORLDCUP_2026_STATE.loadSource =
      loadSource;

    dispatchDataEvent(
      "renebook:worldcup-ready",
      {
        matches:
          window.RENEBOOK_WORLDCUP_2026_MATCHES,
        state:
          window.RENEBOOK_WORLDCUP_2026_STATE
      }
    );

    /*
     * Evento alternativo para compatibilidad con posibles
     * componentes que escuchen un nombre más genérico.
     */
    dispatchDataEvent(
      "worldcup-data-loaded",
      {
        matches:
          window.RENEBOOK_WORLDCUP_2026_MATCHES
      }
    );

    /*
     * Si tu aplicación ya tiene alguna de estas funciones
     * globales, se intenta actualizar automáticamente.
     */
    const possibleRenderFunctions = [
      "renderWorldCupMatches",
      "renderWorldCup2026Matches",
      "renderWorldCupSchedule",
      "renderWorldCupSection",
      "updateWorldCupMatches",
      "refreshWorldCupMatches"
    ];

    possibleRenderFunctions.forEach((functionName) => {
      const callback = window[functionName];

      if (typeof callback === "function") {
        try {
          callback(
            window.RENEBOOK_WORLDCUP_2026_MATCHES
          );
        } catch (error) {
          console.warn(
            `ReneBook: ${functionName} no pudo ejecutarse.`,
            error
          );
        }
      }
    });

    console.log(
      `✅ ReneBook World Cup 2026: ${matches.length} partidos cargados desde ${loadSource}.`
    );
  }

  function dispatchDataEvent(eventName, detail) {
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail
      })
    );

    document.dispatchEvent(
      new CustomEvent(eventName, {
        detail
      })
    );
  }

  /* =========================================================
     FUNCIONES PÚBLICAS PARA RENEBOOK
  ========================================================= */

  window.ReneBookWorldCup2026 = {
    config: CONFIG,

    state: window.RENEBOOK_WORLDCUP_2026_STATE,

    load: fetchWorldCupMatches,

    refresh: function refreshWorldCupMatches() {
      return fetchWorldCupMatches({
        forceRefresh: true
      });
    },

    getAll: function getAllMatches() {
      return [
        ...window.RENEBOOK_WORLDCUP_2026_MATCHES
      ];
    },

    getById: function getMatchById(matchId) {
      return (
        window.RENEBOOK_WORLDCUP_2026_MATCHES.find(
          (match) =>
            String(match.id) === String(matchId)
        ) || null
      );
    },

    getByTeam: function getMatchesByTeam(teamValue) {
      const searchValue =
        normalizeText(teamValue);

      return window.RENEBOOK_WORLDCUP_2026_MATCHES.filter(
        (match) => {
          const searchableValues = [
            match.home.code,
            match.home.es,
            match.home.en,
            match.away.code,
            match.away.es,
            match.away.en
          ].map(normalizeText);

          return searchableValues.some((value) =>
            value.includes(searchValue)
          );
        }
      );
    },

    getByGroup: function getMatchesByGroup(group) {
      const normalizedGroup =
        safeText(group).toUpperCase();

      return window.RENEBOOK_WORLDCUP_2026_MATCHES.filter(
        (match) =>
          match.group === normalizedGroup
      );
    },

    getByStage: function getMatchesByStage(stage) {
      const normalizedStage =
        normalizeText(stage);

      return window.RENEBOOK_WORLDCUP_2026_MATCHES.filter(
        (match) =>
          normalizeText(match.stage).includes(
            normalizedStage
          ) ||
          normalizeText(match.stageEs).includes(
            normalizedStage
          )
      );
    },

    getLive: function getLiveMatches() {
      return window.RENEBOOK_WORLDCUP_2026_MATCHES.filter(
        (match) => match.status === "live"
      );
    },

    getCompleted: function getCompletedMatches() {
      return window.RENEBOOK_WORLDCUP_2026_MATCHES.filter(
        (match) => match.status === "final"
      );
    },

    getUpcoming: function getUpcomingMatches(limit = 10) {
      const currentTime = Date.now();

      return window.RENEBOOK_WORLDCUP_2026_MATCHES
        .filter((match) => {
          const kickoffTime =
            new Date(match.kickoffUtc).getTime();

          return (
            kickoffTime >= currentTime &&
            match.status !== "final"
          );
        })
        .slice(0, limit);
    },

    formatLocalTime: formatLocalDateTime,

    clearCache: function clearWorldCupCache() {
      try {
        localStorage.removeItem(CONFIG.cacheKey);
      } catch (error) {
        console.warn(
          "ReneBook: no se pudo eliminar la caché.",
          error
        );
      }
    }
  };

  /* =========================================================
     INICIO AUTOMÁTICO
  ========================================================= */

  function startLoading() {
    fetchWorldCupMatches().catch((error) => {
      console.error(
        "ReneBook: error inesperado al iniciar.",
        error
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startLoading,
      {
        once: true
      }
    );
  } else {
    startLoading();
  }
})();
