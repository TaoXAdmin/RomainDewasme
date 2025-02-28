/**
 * ANIMATIONS JAVASCRIPT
 * Site web magicien
 * Animations avancées avec GSAP
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si GSAP est chargé
    if (typeof gsap !== 'undefined') {
        // Initialiser les plugins GSAP
        if (gsap.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        // Initialiser les animations
        initHeroAnimations();
        initScrollAnimations();
        initHoverAnimations();
        initMagicEffects();
    } else {
        console.warn('GSAP n\'est pas chargé. Les animations avancées ne fonctionneront pas.');
    }
});

/**
 * Animations de la section hero
 */
function initHeroAnimations() {
    // Animation du titre et sous-titre avec un décalage
    const heroTitle = document.querySelector('.hero__title');
    const heroSubtitle = document.querySelector('.hero__subtitle');
    const heroButton = document.querySelector('.hero .btn');
    
    if (heroTitle && heroSubtitle && heroButton) {
        // Animation au chargement de la page
        const heroTimeline = gsap.timeline({ delay: 0.5 });
        
        heroTimeline
            .from(heroTitle, { 
                opacity: 0, 
                y: 50, 
                duration: 1, 
                ease: "power3.out" 
            })
            .from(heroSubtitle, { 
                opacity: 0, 
                y: 30, 
                duration: 1, 
                ease: "power3.out" 
            }, "-=0.6")
            .from(heroButton, { 
                opacity: 0, 
                y: 20, 
                duration: 1, 
                ease: "power3.out" 
            }, "-=0.6");
    }
    
    // Animation de l'indicateur de défilement
    const scrollIndicator = document.querySelector('.hero__scroll-indicator');
    if (scrollIndicator) {
        gsap.from(scrollIndicator, { 
            opacity: 0, 
            y: -20, 
            duration: 1, 
            delay: 2,
            ease: "power2.out" 
        });
    }
    
    // Effet parallaxe sur la vidéo d'arrière-plan
    const heroVideo = document.querySelector('.hero__video-container');
    if (heroVideo) {
        gsap.to(heroVideo, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }
}

/**
 * Animations déclenchées au scroll
 */
function initScrollAnimations() {
    // Animation des cartes de service avec un effet de cascade
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        gsap.from(card, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none none"
            },
            delay: index * 0.15
        });
    });
    
    // Animation des éléments de la galerie
    const galleryItems = document.querySelectorAll('.gallery__item');
    galleryItems.forEach((item, index) => {
        gsap.from(item, {
            opacity: 0,
            scale: 0.9,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            delay: index * 0.1 % 0.5 // Créer un effet de groupe par ligne
        });
    });
    
    // Animation de la section biographie
    const bioImage = document.querySelector('.biography__image-container');
    const bioText = document.querySelectorAll('.biography__text p');
    
    if (bioImage) {
        gsap.from(bioImage, {
            opacity: 0,
            x: -50,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.biography',
                start: "top 70%",
                toggleActions: "play none none none"
            }
        });
    }
    
    if (bioText.length) {
        bioText.forEach((paragraph, index) => {
            gsap.from(paragraph, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: paragraph,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                delay: index * 0.2
            });
        });
    }
    
    // Animation du formulaire de contact
    const contactForm = document.querySelector('.contact__form');
    const formGroups = document.querySelectorAll('.form-group');
    
    if (contactForm && formGroups.length) {
        gsap.from(formGroups, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: contactForm,
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });
    }
}

/**
 * Animations au survol
 */
function initHoverAnimations() {
    // Effet de survol sur les boutons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
    

    
    // Effet de survol sur les liens de navigation
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                color: '#2A5B64', // Couleur secondaire (or)
                duration: 0.3,
                ease: "power1.out"
            });
        });
        
        link.addEventListener('mouseleave', () => {
            if (!link.classList.contains('active')) {
                gsap.to(link, {
                    color: '#ffffff', // Couleur blanche par défaut
                    duration: 0.3,
                    ease: "power1.out"
                });
            }
        });
    });
}

/**
 * Effets spéciaux liés à la thématique de la magie
 */
function initMagicEffects() {
    // Création de l'effet de particules
    
    // Animation des cartes dans la galerie (effet déplacement 3D)
    const galleryItems = document.querySelectorAll('.gallery__item');
    galleryItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left; // Position X de la souris dans l'élément
            const y = e.clientY - rect.top;  // Position Y de la souris dans l'élément
            
            const xPercent = x / rect.width;
            const yPercent = y / rect.height;
            
            // Calculer l'inclinaison en fonction de la position de la souris
            const tiltX = (0.5 - yPercent) * 10; // -5 à 5 degrés
            const tiltY = (xPercent - 0.5) * 10; // -5 à 5 degrés
            
            gsap.to(item, {
                rotationX: tiltX,
                rotationY: tiltY,
                transformPerspective: 1000,
                ease: "power1.out",
                duration: 0.4
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                rotationX: 0,
                rotationY: 0,
                ease: "power3.out",
                duration: 0.7
            });
        });
    });
    
    // Effet de disparition/apparition sur les images au clic (démo de magie)
    const serviceIcons = document.querySelectorAll('.service-card__icon');
    serviceIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            // Effet de disparition
            gsap.to(icon, {
                scale: 0.5,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    // Effet d'apparition après disparition
                    gsap.to(icon, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.6,
                        ease: "elastic.out(1, 0.3)",
                        delay: 0.1
                    });
                }
            });
        });
    });
}

function initRevealTextEffect() {
    const revealTextElements = document.querySelectorAll('.reveal-text');
    
    // Stocker le texte original comme attribut data-text
    revealTextElements.forEach(element => {
        const text = element.textContent;
        element.setAttribute('data-text', text);
    });
    
    // Configuration de l'observateur d'intersection
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                entry.target.classList.add('revealed');
                
                // Empêcher l'animation de se rejouer si l'élément revient dans la vue
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.01 });
    
    // Observer chaque élément
    revealTextElements.forEach(element => {
        observer.observe(element);
    });
}

// Appeler cette fonction après le chargement du DOM
document.addEventListener('DOMContentLoaded', initRevealTextEffect);

function initScrollEffects() {
    // Éléments à révéler au scroll
    const revealElements = document.querySelectorAll('.reveal-element:not(.revealed)');
    const revealTexts = document.querySelectorAll('.reveal-text:not(.revealed)');
    
    // Configuration de l'observateur d'intersection standard
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -10% 0px', // Déclencher l'animation un peu plus tôt (10% avant que l'élément soit complètement visible)
        threshold: 0.15 // 15% de l'élément doit être visible
    };
    
    // Configuration spécifique pour la section biographie
    const biographyObserverOptions = {
        root: null,
        rootMargin: '0px 0px -25% 0px', // Déclencher beaucoup plus tôt (25% avant que l'élément soit complètement visible)
        threshold: 0.1 // Seulement 10% de l'élément doit être visible
    };
    
    // Observer les éléments à révéler
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Appliquer l'effet approprié selon la classe
                if (element.classList.contains('reveal-text')) {
                    element.classList.add('revealed');
                } else {
                    // Délai basé sur l'attribut data-delay
                    const delay = element.dataset.delay ? parseFloat(element.dataset.delay) * 1000 : 0;
                    
                    setTimeout(() => {
                        element.classList.add('revealed');
                    }, delay);
                }
                
                // Arrêter d'observer l'élément après l'animation
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observateur spécifique pour la section biographie
    const biographyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Appliquer l'effet approprié selon la classe
                if (element.classList.contains('reveal-text')) {
                    element.classList.add('revealed');
                } else {
                    // Délai basé sur l'attribut data-delay
                    const delay = element.dataset.delay ? parseFloat(element.dataset.delay) * 1000 : 0;
                    
                    setTimeout(() => {
                        element.classList.add('revealed');
                    }, delay);
                }
                
                // Arrêter d'observer l'élément après l'animation
                observer.unobserve(element);
            }
        });
    }, biographyObserverOptions);
    
    // Observer chaque élément (utiliser l'observateur spécifique pour la biographie)
    revealElements.forEach(element => {
        // Vérifier si l'élément est dans la section biographie
        if (element.closest('#biographie') || element.closest('.biography')) {
            biographyObserver.observe(element);
        } else {
            observer.observe(element);
        }
    });
    
    revealTexts.forEach(element => {
        // Vérifier si l'élément est dans la section biographie
        if (element.closest('#biographie') || element.closest('.biography')) {
            biographyObserver.observe(element);
        } else {
            observer.observe(element);
        }
    });
    
    // Ajout: animation immédiate des éléments déjà visibles lors du chargement initial
    // Utile si l'utilisateur arrive directement sur une section via un lien d'ancrage
    setTimeout(() => {
        const elementsInView = [...revealElements, ...revealTexts].filter(el => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.top <= (window.innerHeight || document.documentElement.clientHeight)
            );
        });
        
        elementsInView.forEach(element => {
            if (element.classList.contains('reveal-text')) {
                element.classList.add('revealed');
            } else {
                element.classList.add('revealed');
            }
        });
    }, 300);
}

document.head.insertAdjacentHTML('beforeend', `
<style>
@keyframes ctaPulse {
    0% {
        box-shadow: 0 0 0 0 rgba(230, 197, 85, 0.4);
    }
    70% {
        box-shadow: 0 0 0 15px rgba(230, 197, 85, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(230, 197, 85, 0);
    }
}

.cta-pulse-animation {
    animation: ctaPulse 2s infinite;
}

@keyframes floatParticle {
    0%, 100% {
        transform: translateY(0) translateX(0);
        opacity: 0;
    }
    10% {
        opacity: 0.2;
    }
    50% {
        transform: translateY(-30px) translateX(15px);
        opacity: 0.1;
    }
    90% {
        opacity: 0.2;
    }
}
</style>
`);
