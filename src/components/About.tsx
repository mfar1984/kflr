"use client";
import { useEffect, useRef } from "react";

export default function About() {
  return (
    <section id="about" className="about section about-animated">
      <span className="float float-1"></span>
      <span className="float float-2"></span>
      <span className="float float-3"></span>
      <div className="container section-title" data-aos="fade-up">
        <h2>About Us</h2>
      </div>

      <div className="container">
        <div className="row gy-4 align-items-stretch">
          {/* Who We Are (full original text) */}
          <div className="col-lg-7" data-aos="fade-up" data-aos-delay="100">
            <h3 className="mb-3">Who We Are</h3>
            <div className="text-justify">
              <p>KF LEGACY RESOURCES was established in <strong>November 2015</strong>. We provide network service management to help clients focus on their core business while we deliver reliable, scalable support.</p>
              <p>At KF Legacy Resources, we strive to deliver the best service experience so clients meet high expectations and feel confident in the outcomes.</p>
              <p>We provide network infrastructure, management, security and technical support — from standalone networks to WAN — connecting branches securely with cost‑efficient, high‑speed networking.</p>
              <p className="mb-0">Through consultation, we deliver effective solutions aligned to each client’s objectives. Every customer is unique; we build long‑term trust by tailoring approaches to their potential, vision and goals.</p>
              <p className="mt-3 text-justify mb-0">
                KF Legacy Resources with Registration Number: <strong>201503318537 (002488335-X)</strong> valid until <strong>14 November 2026</strong>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary ms-3 align-baseline"
                  data-bs-toggle="modal"
                  data-bs-target="#ssmModal"
                >
                  View SSM
                </button>
              </p>
            </div>
          </div>

          {/* At a Glance (card) */}
          <div className="col-lg-5" data-aos="fade-up" data-aos-delay="150">
            <div className="h-100 p-4 bg-body-tertiary rounded-3 border">
              <h4 className="h6 text-uppercase text-secondary mb-3">At a Glance</h4>
              <ul className="list-unstyled mb-0">
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>Established 2015</span></li>
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>Network infrastructure &amp; management</span></li>
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>Security &amp; technical support</span></li>
                <li className="d-flex mb-2"><i className="bi bi-check2-circle text-primary me-2"></i><span>WAN &amp; inter-branch connectivity</span></li>
                <li className="d-flex"><i className="bi bi-check2-circle text-primary me-2"></i><span>Client-first, long-term partnership</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sub-features & stats for visual interest (optional) */}
        <div className="row row-cols-1 row-cols-md-3 g-4 mt-2" data-aos="fade-up" data-aos-delay="200">
          <div className="col">
            <div className="p-4 h-100 bg-white rounded-3 border shadow-sm feature-card">
              <div className="d-flex align-items-center mb-2"><i className="bi bi-shield-lock text-primary fs-4 me-2"></i><h5 className="h6 mb-0">Security First</h5></div>
              <p className="mb-0 text-justify">Hardened designs, monitoring and assessments to protect your network and data.</p>
            </div>
          </div>
          <div className="col">
            <div className="p-4 h-100 bg-white rounded-3 border shadow-sm feature-card">
              <div className="d-flex align-items-center mb-2"><i className="bi bi-hdd-network text-primary fs-4 me-2"></i><h5 className="h6 mb-0">Scalable Infrastructure</h5></div>
              <p className="mb-0 text-justify">From standalone networks to WAN, architectures that grow with your business.</p>
            </div>
          </div>
          <div className="col">
            <div className="p-4 h-100 bg-white rounded-3 border shadow-sm feature-card">
              <div className="d-flex align-items-center mb-2"><i className="bi bi-people text-primary fs-4 me-2"></i><h5 className="h6 mb-0">Trusted Delivery</h5></div>
              <p className="mb-0 text-justify">Outcomes, timelines and communication you can trust.</p>
            </div>
          </div>
        </div>

        <div className="row text-center mt-4" data-aos="fade-up" data-aos-delay="250">
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary counter" data-target="10">10+</div><div className="small text-secondary">Years Experience</div></div>
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary counter" data-target="50">50+</div><div className="small text-secondary">Projects Delivered</div></div>
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary counter" data-target="5">5</div><div className="small text-secondary">Core Domains</div></div>
          <div className="col-6 col-md-3 mb-3"><div className="fw-bold fs-3 text-primary">100%</div><div className="small text-secondary">Client Commitment</div></div>
        </div>
      </div>
      {/* SSM Modal */}
      <div className="modal fade" id="ssmModal" aria-hidden="true" aria-labelledby="ssmModalLabel" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" onContextMenu={(e) => e.preventDefault()}>
            <div className="modal-header">
              <h5 className="modal-title" id="ssmModalLabel">SSM Registration</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <SsmCanvas />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SsmCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const parent = c.parentElement;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height || 1;
      const maxW = (parent?.clientWidth || img.width);
      const w = Math.min(maxW, img.width);
      const h = Math.round(w / ratio);
      // Avoid hydration warnings for width/height changes
      c.setAttribute('width', String(w));
      c.setAttribute('height', String(h));
      ctx.drawImage(img, 0, 0, w, h);
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#000';
      ctx.font = 'bold 20px sans-serif';
      ctx.rotate(-Math.PI / 8);
      for (let y = -h; y < h * 2; y += 80) {
        for (let x = -w; x < w * 2; x += 220) {
          ctx.fillText('KF LEGACY RESOURCES', x, y);
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    img.crossOrigin = 'anonymous';
    img.src = '/assets/img/ssm/ssm.png';
  }, []);

  return (
    <div
      style={{ position: 'relative', userSelect: 'none' as const }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => { if (e.button === 2) e.preventDefault(); }}
    >
      <canvas
        ref={ref}
        suppressHydrationWarning
        className="w-100"
        style={{ maxWidth: '100%', height: 'auto', pointerEvents: 'none' }}
      />
    </div>
  );
}


