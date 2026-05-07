document.addEventListener('DOMContentLoaded', () => {
    const circlesContainer = document.getElementById('circles-container');
    const iconsContainer = document.getElementById('icons-container');

    // 1. Generate Concentric Circles
    const numCircles = 8;
    for (let i = 0; i < numCircles; i++) {
        const circle = document.createElement('div');
        circle.className = 'circle';
        const size = (i + 1) * 100; // 100px, 200px, etc.
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;
        circle.style.borderColor = `rgba(71, 85, 105, ${1 - (i + 1) * 0.1})`;
        
        circlesContainer.appendChild(circle);

        // Add visible class with delay
        setTimeout(() => {
            circle.classList.add('visible');
        }, i * 150);
    }

    // 2. Define Icons with Brand Colors
    const icons = [
        { label: 'Instagram', color: '#E4405F', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>', angle: 0, radius: 150, speed: 0.2 },
        { label: 'Facebook', color: '#1877F2', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>', angle: 60, radius: 250, speed: -0.15 },
        { label: 'YouTube', color: '#FF0000', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>', angle: 120, radius: 190, speed: 0.1 },
        { label: 'SEO', color: '#10B981', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6M8 11h6"/></svg>', angle: 180, radius: 220, speed: -0.12 },
        { label: 'Web Design', color: '#0EA5E9', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>', angle: 240, radius: 310, speed: 0.08 },
        { label: 'EMS', color: '#F59E0B', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>', angle: 300, radius: 270, speed: -0.18 },
    ];

    // 3. Generate Icons and start animation
    const iconElements = icons.map((item, index) => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-item';
        iconElement.style.setProperty('--brand-color', item.color);
        
        iconElement.innerHTML = `
            <div class="icon-box" style="color: ${item.color}; border-color: ${item.color}44;">${item.icon}</div>
            <div class="icon-text">${item.label}</div>
        `;

        iconsContainer.appendChild(iconElement);

        // Initial entrance
        setTimeout(() => {
            iconElement.classList.add('visible');
        }, 1000 + (index * 200));

        return { element: iconElement, data: item };
    });

    function animate() {
        iconElements.forEach(item => {
            // Update angle based on speed
            item.data.angle += item.data.speed;
            
            const radians = (item.data.angle - 90) * (Math.PI / 180);
            const x = Math.cos(radians) * item.data.radius;
            const y = Math.sin(radians) * item.data.radius;

            // Apply position
            item.element.style.left = `calc(50% + ${x}px)`;
            item.element.style.top = `calc(50% + ${y}px)`;
            item.element.style.transform = `translate(-50%, -50%)`;
        });

        requestAnimationFrame(animate);
    }

    animate();
});
