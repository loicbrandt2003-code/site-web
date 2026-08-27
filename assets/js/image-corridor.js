// Image corridor: two rails of cards rushing from a vanishing point toward
// the viewer. Ported from a React/Tailwind component to vanilla JS: same
// projection math, same generated @keyframes, no framework or build step.
//
// Depth is authored as apparent size, geometrically, so consecutive cards
// keep a constant size ratio all the way out. The rails open hard early
// (fan > 1) so the ribbon leaves the centre flat before bending onto the
// diagonal. A card is born on the opposite side of the axis (railBirth < 0)
// so the centre is never left uncovered between cards.
//
// All lengths are in cqw (percent of the container's inline size), so the
// corridor keeps its proportions at any size. Call container.style
// .containerType = "inline-size" is set here; the container just needs a
// defined width (it does, as a hero section).

(function () {
  var PATH_DEFAULTS = {
    perspective: 30,
    cardWidth: 18,
    cardHeight: 25,
    cardRadius: 0.4,
    birthHeight: 2.6,
    exitHeight: 46,
    railBirth: -11,
    railExit: 44,
    fan: 3.3,
    turnBirth: 6,
    turnExit: 28,
    stops: 24,
  };

  function extend(base, overrides) {
    var out = {};
    for (var k in base) out[k] = base[k];
    if (overrides) for (var k2 in overrides) out[k2] = overrides[k2];
    return out;
  }

  function buildKeyframes(dir, name, p) {
    var steps = [];
    for (var s = 0; s <= p.stops; s++) {
      var u = s / p.stops;
      var scale = (p.birthHeight / p.cardHeight) * Math.pow(p.exitHeight / p.birthHeight, u);
      var z = p.perspective * (1 - 1 / scale);
      var rail = p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan);
      var turn = p.turnBirth + (p.turnExit - p.turnBirth) * u;
      steps.push(
        (u * 100).toFixed(2) +
          "%{transform:translate3d(" +
          (dir * rail).toFixed(2) +
          "cqw,0," +
          z.toFixed(2) +
          "cqw) rotateY(" +
          (-dir * turn).toFixed(2) +
          "deg)}"
      );
    }
    return "@keyframes " + name + "{" + steps.join("") + "}";
  }

  var uid = 0;

  /**
   * @param {HTMLElement} container - positioned element (relative/absolute),
   *   filled edge to edge by the corridor.
   * @param {Object} options
   * @param {Array<{src?:string,gradient?:string}>} options.images - cycled
   *   onto both rails. Each entry is either a photo (`src`) or a generated
   *   brand tile (`gradient`, any valid CSS background value).
   * @param {number} [options.cards=9] - cards per rail.
   * @param {number} [options.speed=18] - seconds for one card's full loop.
   * @param {number} [options.axis=55] - vertical placement of the vanishing
   *   point, percent of container height.
   * @param {Object} [options.path] - overrides for the projection geometry.
   */
  function initImageCorridor(container, options) {
    if (!container) return;
    options = options || {};
    var p = extend(PATH_DEFAULTS, options.path);
    var cards = options.cards || 9;
    var speed = options.speed || 18;
    var axis = options.axis != null ? options.axis : 55;
    var images = options.images || [];

    uid += 1;
    var id = "ic" + uid;
    var rightName = "ic-r-" + id;
    var leftName = "ic-l-" + id;
    var cardClass = "ic-c-" + id;

    var style = document.createElement("style");
    style.textContent =
      buildKeyframes(1, rightName, p) +
      buildKeyframes(-1, leftName, p) +
      // !important: each card also carries an inline `animation` shorthand
      // (set below), which otherwise outranks this external rule and would
      // keep the corridor spinning under prefers-reduced-motion.
      "@media(prefers-reduced-motion:reduce){." + cardClass + "{animation-play-state:paused!important}}";
    container.appendChild(style);

    container.style.containerType = "inline-size";

    var plane = document.createElement("div");
    plane.setAttribute("aria-hidden", "true");
    plane.className = "corridor-plane";
    plane.style.perspective = p.perspective + "cqw";
    plane.style.perspectiveOrigin = "50% " + axis + "%";

    var stage = document.createElement("div");
    stage.className = "corridor-stage";

    [rightName, leftName].forEach(function (railName) {
      for (var i = 0; i < cards; i++) {
        var img = images.length ? images[i % images.length] : null;
        var cardEl = document.createElement("div");
        cardEl.className = "corridor-card " + cardClass;
        cardEl.style.left = "50%";
        cardEl.style.top = axis + "%";
        cardEl.style.width = p.cardWidth + "cqw";
        cardEl.style.height = p.cardHeight + "cqw";
        cardEl.style.marginLeft = -p.cardWidth / 2 + "cqw";
        cardEl.style.marginTop = -p.cardHeight / 2 + "cqw";
        cardEl.style.borderRadius = p.cardRadius + "cqw";
        cardEl.style.animation = railName + " " + speed + "s linear infinite";
        // Negative delay drops each card mid-flight so the corridor is
        // already full on the first frame.
        cardEl.style.animationDelay = -((i * speed) / cards) + "s";

        if (img && img.src) {
          var imgEl = document.createElement("img");
          imgEl.src = img.src;
          imgEl.alt = "";
          imgEl.loading = "lazy";
          imgEl.decoding = "async";
          imgEl.draggable = false;
          cardEl.appendChild(imgEl);
        } else if (img && img.gradient) {
          cardEl.style.background = img.gradient;
        }

        stage.appendChild(cardEl);
      }
    });

    plane.appendChild(stage);
    container.appendChild(plane);
  }

  window.initImageCorridor = initImageCorridor;
})();
