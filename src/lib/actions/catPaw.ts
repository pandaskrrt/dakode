export function catPaw(node: HTMLElement) {
	const paw = document.createElement('div');
	paw.innerHTML = `<svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<!-- Toe beans -->
		<ellipse cx="20" cy="16" rx="7" ry="8" fill="#f9a8d4" opacity="0.9"/>
		<ellipse cx="34" cy="12" rx="6" ry="7.5" fill="#f9a8d4" opacity="0.9"/>
		<ellipse cx="46" cy="18" rx="5.5" ry="7" fill="#f9a8d4" opacity="0.9"/>
		<ellipse cx="12" cy="26" rx="5" ry="6.5" fill="#f9a8d4" opacity="0.85"/>
		<!-- Main pad -->
		<path d="M16 34 C16 28, 24 24, 32 28 C40 24, 48 28, 48 34 C48 42, 42 50, 32 54 C22 50, 16 42, 16 34Z" fill="#f472b6" opacity="0.9"/>
		<!-- Highlights -->
		<ellipse cx="20" cy="15" rx="3" ry="3.5" fill="white" opacity="0.35"/>
		<ellipse cx="34" cy="11" rx="2.5" ry="3" fill="white" opacity="0.35"/>
		<ellipse cx="46" cy="17" rx="2.5" ry="3" fill="white" opacity="0.3"/>
		<ellipse cx="30" cy="32" rx="5" ry="4" fill="white" opacity="0.2"/>
	</svg>`;
	paw.style.cssText = `
		position: fixed;
		pointer-events: none;
		z-index: 9999;
		opacity: 0;
		transform: translate(8px, 4px) rotate(-15deg) scale(0.5);
		transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
		will-change: transform, opacity;
		filter: drop-shadow(0 2px 6px rgba(236, 72, 153, 0.3));
	`;
	document.body.appendChild(paw);

	let visible = false;
	let bobTimer: ReturnType<typeof setInterval> | null = null;
	let bobPhase = 0;

	function onMouseEnter() {
		visible = true;
		paw.style.opacity = '1';
		paw.style.transform = 'translate(8px, 4px) rotate(-15deg) scale(1)';
		// Gentle bobbing animation
		if (!bobTimer) {
			bobTimer = setInterval(() => {
				if (!visible) return;
				bobPhase = (bobPhase + 1) % 4;
				const offsets = [
					'translate(8px, 2px) rotate(-12deg) scale(1)',
					'translate(6px, 6px) rotate(-18deg) scale(0.95)',
					'translate(10px, 1px) rotate(-10deg) scale(1.02)',
					'translate(7px, 5px) rotate(-16deg) scale(0.97)',
				];
				paw.style.transform = offsets[bobPhase];
			}, 350);
		}
	}

	function onMouseMove(e: MouseEvent) {
		if (!visible) return;
		paw.style.left = `${e.clientX}px`;
		paw.style.top = `${e.clientY}px`;
	}

	function onMouseLeave() {
		visible = false;
		paw.style.opacity = '0';
		paw.style.transform = 'translate(8px, 4px) rotate(-15deg) scale(0.3)';
		if (bobTimer) {
			clearInterval(bobTimer);
			bobTimer = null;
		}
	}

	node.addEventListener('mouseenter', onMouseEnter);
	node.addEventListener('mousemove', onMouseMove);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		destroy() {
			node.removeEventListener('mouseenter', onMouseEnter);
			node.removeEventListener('mousemove', onMouseMove);
			node.removeEventListener('mouseleave', onMouseLeave);
			if (bobTimer) clearInterval(bobTimer);
			paw.remove();
		}
	};
}
