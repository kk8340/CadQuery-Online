import { showGlobalTooltip, hideGlobalTooltip } from './tooltip.js';

export function toggleToolSection(header) {
    const section = header.closest('.tool-section');
    if (!section) return;

    section.classList.toggle('collapsed');

    const sectionId = section.getAttribute('data-section');
    if (sectionId) {
        const collapsed = section.classList.contains('collapsed');
        localStorage.setItem('tool_section_' + sectionId, collapsed);
    }
}

window.toggleToolSection = toggleToolSection;

export function restoreToolSectionStates() {
    const sections = document.querySelectorAll('.tool-section[data-section]');
    sections.forEach(section => {
        const sectionId = section.getAttribute('data-section');
        const savedState = localStorage.getItem('tool_section_' + sectionId);
        if (savedState === 'true') {
            section.classList.add('collapsed');
        } else {
            section.classList.remove('collapsed');
        }
    });
}

export function initToolButtons() {
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            showGlobalTooltip(this);
        });

        btn.addEventListener('mouseleave', function () {
            hideGlobalTooltip();
        });
    });
}
