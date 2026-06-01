'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

/* ─────────────────────────── Data ─────────────────────────── */

const WINES = [
  {
    name: 'Dominio Rutini Malbec',
    tagline: 'Sos intenso, elegante y con presencia natural. No necesitás ocupar toda la escena: cuando aparecés, la mesa cambia de ritmo.',
    color: '#6E1624',
    image: '/Rutini.png',
  },
  {
    name: 'Anaía Gran Rosé',
    tagline: 'Sos fresco, sutil y con un encanto que aparece sin esfuerzo. Llegás liviano, pero dejás una impresión que permanece.',
    color: '#D98C9F',
    image: '/Anaia.png',
  },
  {
    name: 'Cobos Felino Chardonnay',
    tagline: 'Sos vibrante, distinto y con energía propia. Tenés ese perfil que parece tranquilo, pero termina siendo el detalle que todos recuerdan.',
    color: '#2e7413',
    image: '/cobos.png',
  },
  {
    name: 'Trivento Golden Reserve Malbec',
    tagline: 'Sos clásico, seguro y con carácter. Tenés estructura, presencia y esa forma de quedar bien en cualquier plan.',
    color: '#e2b925ec',
    image: '/trivento.png',
  },
  {
    name: 'Alyda Van Salentein Brut Nature',
    tagline: 'Sos celebración, elegancia y momento especial. No aparecés todos los días: aparecés cuando la ocasión merece quedar en la memoria.',
    color: '#1e1d1a',
    image: '/ALYDA.png',
  },
  {
    name: 'Durigutti Proyecto Las Compuertas Malbec 5 Suelos',
    tagline: 'Sos profundo, intenso y con carácter propio. Tenés una presencia que no pasa rápido: aparecés, marcás el momento y dejás algo dando vueltas.',
    color: '#541225',
    image: '/durigutti.png',
  },
];

const GOLD = '#FAB915';
const SEG_COUNT = WINES.length;
const SEG_ANGLE = (2 * Math.PI) / SEG_COUNT;

/* ─────────────────────── Canvas helpers ───────────────────── */

function drawWheel(
  canvas: HTMLCanvasElement,
  rotation: number,
  size: number,
  images: (HTMLImageElement | null)[],
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;

  ctx.clearRect(0, 0, size, size);

  /* outer glow ring */
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 3, 0, 2 * Math.PI);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.restore();

  /* segments */
  for (let i = 0; i < SEG_COUNT; i++) {
    const startAngle = rotation + i * SEG_ANGLE;
    const endAngle = startAngle + SEG_ANGLE;
    const midAngle = startAngle + SEG_ANGLE / 2;

    /* fill */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = WINES[i].color;
    ctx.fill();

    /* gold divider */
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* wine bottle image */
    const img = images[i];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();

      /* clip to this segment */
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius - 1, startAngle, endAngle);
      ctx.closePath();
      ctx.clip();

      /* fit image preserving aspect ratio */
      const maxW = radius * 0.26;
      const maxH = radius * 0.52;
      const aspect = img.naturalWidth / img.naturalHeight;
      let imgW = maxH * aspect;
      let imgH = maxH;
      if (imgW > maxW) {
        imgW = maxW;
        imgH = maxW / aspect;
      }

      /* position at segment midpoint, textRadius from center
         rotation: midAngle + π/2 makes bottle "up" point outward */
      const imgRadius = radius * 0.60;
      ctx.translate(cx, cy);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.drawImage(img, -imgW / 2, -imgRadius - imgH / 2, imgW, imgH);

      ctx.restore();
    }
  }

  /* center circle */
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.13, 0, 2 * Math.PI);
  ctx.fillStyle = '#0A0A0A';
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  /* R&F text in center */
  const cfSize = Math.max(9, size * 0.028);
  ctx.font = `bold ${cfSize}px Georgia, serif`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('R&F', cx, cy);
}

/* ─────────────────────── Wheel pointer ────────────────────── */

function Pointer({ size }: { size: number }) {
  const tip = 18;
  const base = 12;
  return (
    <svg
      width={base}
      height={tip + 4}
      viewBox={`0 0 ${base} ${tip + 4}`}
      style={{
        position: 'absolute',
        top: -2,
        left: '50%',
        transform: 'translateX(-50%)',
        filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.8))`,
        zIndex: 10,
      }}
    >
      <polygon
        points={`${base / 2},${tip + 4} 0,0 ${base},0`}
        fill={GOLD}
      />
    </svg>
  );
}

/* ─────────────────────── Modal ────────────────────────────── */

interface ModalProps {
  wine: (typeof WINES)[number];
  onClose: () => void;
}

function WineModal({ wine, onClose }: ModalProps) {
  const WA_LINK =
    'https://wa.me/5491171540713?text=Hola!%20Quiero%20reservar%20para%20la%20Feria%20de%20Vinos.%20%C2%BFMe%20envi%C3%A1s%20m%C3%A1s%20informaci%C3%B3n%3F';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="animate-fade-scale-in relative w-full max-w-sm p-6 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #141414 0%, #1c1208 100%)',
          border: `1px solid ${GOLD}44`,
          boxShadow: `0 0 40px ${GOLD}22, 0 20px 60px rgba(0,0,0,0.8)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors"
          style={{ background: '#ffffff12' }}
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* pre-header */}
        <p
          className="text-center text-xs tracking-widest uppercase mb-1"
          style={{ color: GOLD, opacity: 0.7 }}
        >
          ¡Te salió...
        </p>

        <h2
          className="text-center font-bold text-2xl leading-tight mb-3"
          style={{
            fontFamily: '"majesti", Georgia, serif',
            color: GOLD,
          }}
        >
          {wine.name}
        </h2>

        {/* wine image */}
        <div className="flex justify-center mb-4">
          <img
            src={wine.image}
            alt={wine.name}
            style={{ maxHeight: 160, maxWidth: '55%', objectFit: 'contain' }}
          />
        </div>

        {/* tagline */}
        <p
          className="text-center font-strong mb-5"
          style={{ color: '#d4d4d4', fontFamily: 'gotham' }}
        >
          {wine.tagline}
        </p>

        {/* gold divider */}
        <div
          className="mx-auto mb-5"
        />

        {/* CTA */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 text-base font-family:'gotham-ultra' transition-transform active:scale-95"
          style={{
            background: '#fab915',
            color: 'white',
            textDecoration: 'none',
          }}
        >
          RESERVAR MI LUGAR
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────── Main page ────────────────────────── */

export default function WineWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const rotationRef = useRef(0);

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<(typeof WINES)[number] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [canvasSize, setCanvasSize] = useState(300);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const imagesRef = useRef<(HTMLImageElement | null)[]>(WINES.map(() => null));

  /* measure canvas size from container */
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    WINES.forEach((wine, i) => {
      const img = new window.Image();
      img.onload = () => {
        imagesRef.current[i] = img;
        setImagesLoaded((n) => n + 1);
      };
      img.src = wine.image;
    });
  }, []);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setCanvasSize(w);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /* draw on every size / rotation change / image load */
  useEffect(() => {
    if (!canvasRef.current) return;
    drawWheel(canvasRef.current, rotationRef.current, canvasSize, imagesRef.current);
  }, [canvasSize, imagesLoaded]);

  const spin = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowModal(false);
    setWinner(null);

    const duration = 4000 + Math.random() * 2000; // 4-6 s
    const extraRotations = (5 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const targetOffset = Math.random() * 2 * Math.PI;
    const totalDelta = extraRotations + targetOffset;
    const startRotation = rotationRef.current;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      /* cubic ease-out */
      const eased = 1 - Math.pow(1 - t, 3);
      const currentRotation = startRotation + totalDelta * eased;
      rotationRef.current = currentRotation;

      if (canvasRef.current) {
        drawWheel(canvasRef.current, currentRotation, canvasSize, imagesRef.current);
      }

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        /* find winner: pointer is at top (270° = -π/2 from canvas zero) */
        const normalised =
          (((-currentRotation - Math.PI / 2) % (2 * Math.PI)) + 2 * Math.PI) %
          (2 * Math.PI);
        const idx =
          Math.floor(normalised / SEG_ANGLE) % SEG_COUNT;
        // const safeIdx = ((idx % SEG_COUNT) + SEG_COUNT) % SEG_COUNT;
        setWinner(WINES[idx]);
        setIsSpinning(false);
        setTimeout(() => setShowModal(true), 300);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [isSpinning, canvasSize]);

  return (
    <div
      className="relative flex flex-col items-center w-full overflow-hidden"
      style={{ background: '#0A0A0A', maxWidth: 430, margin: '0 auto', height: '100dvh' }}
    >
      {/* ── Top bar ── */}
      <div
        className="w-full flex items-center justify-center py-3 px-4 shrink-0"
        style={{
          background: '#000',
          borderBottom: `1px solid ${GOLD}33`,
        }}
      >
        <span
          className="text-lg tracking-[0.22em] uppercase font-bold"
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            color: GOLD,
            letterSpacing: '0.22em',
          }}
        >
          <img src="/logotipo.png" alt="Rock&Feller's" width={'200px'} />
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-col items-center w-full px-5 pt-2 pb-3 flex-1 min-h-0">
        {/* H1 */}
        <img src="./bajada.png" alt="" style={{ maxHeight: '20vh', width: 'auto' }} />

        {/* event info */}
        <p
          className="text-xs uppercase mb-2 text-center"
          style={{ color: '#fab915' }}
        >
          10 de Junio | A partir de las 19hs
        </p>

        {/* H2 */}
        <h2
          className="text-lg italic tracking-widest font-semibold text-center mb-3"
          style={{
            fontFamily: '"majesti", Georgia, serif',
            color: '#fff',
          }}
        >
          ¿Qué vino sos?
        </h2>

        {/* ── Wheel area ── */}
        <div
          ref={containerRef}
          className="relative w-full"
          style={{ maxWidth: 340 }}
        >
          {/* pointer arrow */}
          <Pointer size={canvasSize} />

          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={{
              borderRadius: '50%',
              cursor: isSpinning ? 'default' : 'pointer',
              display: 'block',
              width: '100%',
              height: 'auto',
              touchAction: 'manipulation',
            }}
            onClick={spin}
            onTouchStart={(e) => {
              e.preventDefault();
              spin();
            }}
          />
        </div>

        {/* tap hint */}
        <div
          className={`flex items-center gap-2 mt-3 text-sm ${
            isSpinning ? 'opacity-0' : 'animate-pulse-soft'
          }`}
          style={{ color: '#ffffff88' }}
        >
          <span className="tracking-wide uppercase text-xs">Tocá para girar</span>
        </div>
      </div>

      {/* ── Gold bottom accent bar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{
          background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
        }}
      />

      {/* ── Modal ── */}
      {showModal && winner && (
        <WineModal wine={winner} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
