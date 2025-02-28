/**
 * PARALLAX JAVASCRIPT
 * Site web magicien
 * Effets de parallaxe et animations de profondeur
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si GSAP est chargé
    if (typeof gsap !== 'undefined' && gsap.ScrollTrigger) {
        // Initialiser les effets de parallaxe
        initParallaxEffects();
    } else {
        // Utiliser une méthode de repli si GSAP n'est pas disponible
        initBasicParallax();
    }
});

/**
 * Initialisation des effets de parallaxe avec GSAP
 */
function initParallaxEffects() {
    // Sélectionner tous les éléments avec la classe parallax-element
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    parallaxElements.forEach(element => {
        // Obtenir la vitesse de parallaxe (ou utiliser une valeur par défaut)
        const speed = element.dataset.parallaxSpeed || 0.2;
        const direction = element.dataset.parallaxDirection || 'vertical';
        
        // Créer l'effet de parallaxe
        if (direction === 'vertical') {
            gsap.to(element, {
                y: `${speed * -100}%`,
                ease: "none",
                scrollTrigger: {
                    trigger: element.closest('section') || element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        } else if (direction === 'horizontal') {
            gsap.to(element, {
                x: `${speed * -50}%`,
                ease: "none",
                scrollTrigger: {
                    trigger: element.closest('section') || element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    });
    
    // Parallaxe sur les sections de fond
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Vérifier si la section a un fond à animer
        if (section.dataset.parallaxBg === 'true') {
            gsap.to(section, {
                backgroundPositionY: "50%",
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    });
    
    // Effet parallaxe spécial pour la section hero
    const heroContent = document.querySelector('.hero__content');
    if (heroContent) {
        gsap.to(heroContent, {
            y: 100,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }
    
    // Effet parallaxe pour la section biographie
    const bioImage = document.querySelector('.biography__image-container');
    const bioContent = document.querySelector('.biography__content');
    
    if (bioImage && bioContent) {
        // Image se déplace plus lentement que le contenu
        gsap.to(bioImage, {
            y: 50,
            ease: "none",
            scrollTrigger: {
                trigger: ".biography",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
        
        gsap.to(bioContent, {
            y: 30,
            ease: "none",
            scrollTrigger: {
                trigger: ".biography",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    }
}

/**
 * Version basique des effets parallaxe sans GSAP (repli)
 */
function initBasicParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    // Fonction pour mettre à jour la position au scroll
    const updateParallaxPositions = () => {
        const scrollY = window.scrollY;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallaxSpeed || 0.2;
            const section = element.closest('section');
            
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const viewportHeight = window.innerHeight;
                
                // Vérifier si la section est visible
                if (scrollY + viewportHeight > sectionTop && 
                    scrollY < sectionTop + sectionHeight) {
                    
                    // Calculer la position relative dans la fenêtre
                    const relativePos = (scrollY + viewportHeight - sectionTop) / (viewportHeight + sectionHeight);
                    
                    // Appliquer le décalage de parallaxe
                    const yOffset = (relativePos - 0.5) * speed * 100;
                    element.style.transform = `translateY(${-yOffset}px)`;
                }
            }
        });
    };
    
    // Ajouter l'écouteur d'événement de défilement
    window.addEventListener('scroll', updateParallaxPositions);
    
    // Initialiser les positions
    updateParallaxPositions();
}

/**
 * Effet de profondeur au mouvement de la souris
 */
document.addEventListener('mousemove', (e) => {
    // Obtenir la position de la souris par rapport au centre de l'écran
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;
    
    // Sélectionner les éléments qui réagissent au mouvement de la souris
    const depthElements = document.querySelectorAll('.depth-element');
    
    depthElements.forEach(element => {
        // Obtenir la sensibilité (ou utiliser une valeur par défaut)
        const sensitivity = element.dataset.depthSensitivity || 20;
        
        // Appliquer le décalage de position
        const xOffset = mouseX * sensitivity;
        const yOffset = mouseY * sensitivity;
        
        // Appliquer la transformation avec une transition fluide
        element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
});


