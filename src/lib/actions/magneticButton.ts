export function magneticButton(node: HTMLElement) {
	node.style.position = 'relative';
	node.style.overflow = 'hidden';

	const glow = document.createElement('div');
	glow.style.cssText = `
		position: absolute;
		inset: 0;
		border-radius: inherit;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		background: radial-gradient(circle 80px at var(--mx, 50%) var(--my, 50%),
			rgba(255,255,255,0.25) 0%,
			rgba(255,255,255,0.08) 40%,
			transparent 70%);
		z-index: 1;
	`;
	node.appendChild(glow);

	const borderGlow = document.createElement('div');
	borderGlow.style.cssText = `
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		background: radial-gradient(circle 100px at var(--mx, 50%) var(--my, 50%),
			rgba(255,255,255,0.6) 0%,
			rgba(255,255,255,0.15) 30%,
			transparent 60%);
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: exclude;
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		padding: 1.5px;
		z-index: 0;
	`;
	node.insertBefore(borderGlow, node.firstChild);

	const textEl = node.querySelector('span, p, div:not(:first-child):not(:last-child)');
	const hasTextContent = textEl || node.childNodes.length > 0;

	function onMouseEnter() {
		glow.style.opacity = '1';
		borderGlow.style.opacity = '1';
	}

	function onMouseMove(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const px = (x / rect.width) * 100;
		const py = (y / rect.height) * 100;

		node.style.setProperty('--mx', `${px}%`);
		node.style.setProperty('--my', `${py}%`);

		// Magnetic pull effect
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const pullX = (x - centerX) / centerX * 4;
		const pullY = (y - centerY) / centerY * 3;
		node.style.transform = `translate(${pullX}px, ${pullY}px)`;
	}

	function onMouseLeave() {
		glow.style.opacity = '0';
		borderGlow.style.opacity = '0';
		node.style.transform = 'translate(0px, 0px)';
		node.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
		setTimeout(() => { node.style.transition = ''; }, 400);
	}

	node.addEventListener('mouseenter', onMouseEnter);
	node.addEventListener('mousemove', onMouseMove);
	node.addEventListener('mouseleave', onMouseLeave);

	return {
		destroy() {
			node.removeEventListener('mouseenter', onMouseEnter);
			node.removeEventListener('mousemove', onMouseMove);
			node.removeEventListener('mouseleave', onMouseLeave);
			glow.remove();
			borderGlow.remove();
		}
	};
}
