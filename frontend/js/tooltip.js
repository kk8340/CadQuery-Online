let globalTooltip = null;
let tooltipTimeout = null;

export function showGlobalTooltip(btn) {
    const tooltipEl = btn.querySelector('.tooltip');
    if (!tooltipEl) return;

    clearTimeout(tooltipTimeout);

    if (!globalTooltip) {
        globalTooltip = document.createElement('div');
        globalTooltip.id = 'global-tooltip';
        document.getElementById('tooltip-container').appendChild(globalTooltip);
    }

    globalTooltip.innerHTML = tooltipEl.innerHTML;
    globalTooltip.style.cssText = `
        position: fixed;
        background: #1e293b;
        border: 1px solid #475569;
        border-radius: 8px;
        padding: 12px;
        min-width: 240px;
        max-width: 320px;
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        opacity: 1;
        visibility: visible;
    `;

    const rect = btn.getBoundingClientRect();
    globalTooltip.style.left = (rect.right + 10) + 'px';
    globalTooltip.style.top = rect.top + 'px';

    const tooltipRect = globalTooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
        globalTooltip.style.left = (rect.left - tooltipRect.width - 10) + 'px';
    }

    if (tooltipRect.bottom > window.innerHeight) {
        globalTooltip.style.top = (window.innerHeight - tooltipRect.height - 10) + 'px';
    }
}

export function hideGlobalTooltip() {
    tooltipTimeout = setTimeout(() => {
        if (globalTooltip) {
            globalTooltip.style.opacity = '0';
            globalTooltip.style.visibility = 'hidden';
        }
    }, 100);
}
