/**
 * SERVICES SECTION JAVASCRIPT
 * Fonctionnalités pour la section Prestations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les fonctionnalités
    initServiceCardInteractions();
    initCardRevealAnimation();
    addCardRevealStyle();
});

/**
 * Interactions des cartes de service et de leurs boutons
 */
function initServiceCardInteractions() {
    // 1. Boutons "Découvrir" pour retourner les cartes
    const discoverButtons = document.querySelectorAll('.service-card__cta');
    
    discoverButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const card = button.closest('.luxury-card');
            if (!card) return;
            
            // Ajouter la classe flipped
            card.classList.add('flipped');
            
            // Appliquer la rotation directement
            const cardInner = card.querySelector('.service-card__inner');
            if (cardInner) {
                cardInner.style.transform = 'rotateY(180deg)';
            }
        });
    });

    // 2. Gestion des faces arrière des cartes pour les retourner au clic
    const backFaces = document.querySelectorAll('.service-card__face--back');

    backFaces.forEach(backFace => {
        backFace.addEventListener('click', (e) => {
            // Ne pas déclencher le retournement si on clique sur un lien ou un bouton
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || 
                e.target.closest('a') || e.target.closest('button')) {
                return;
            }
            
            const card = backFace.closest('.luxury-card');
            if (!card) return;
            
            // Retirer la classe flipped
            card.classList.remove('flipped');
            
            // Réinitialiser la rotation
            const cardInner = card.querySelector('.service-card__inner');
            if (cardInner) {
                cardInner.style.transform = '';
            }
        });
    });
    
    // 3. Effet de brillance sur les cartes au survol (desktop uniquement)
    const cards = document.querySelectorAll('.luxury-card');
    const isMobile = window.innerWidth <= 767;
    
    if (!isMobile) {
        // Appliquer les effets de survol uniquement sur desktop
        cards.forEach(card => {
            const frontFace = card.querySelector('.service-card__face--front');
            
            // Ajouter une transition pour contrôler la vitesse de transformation
            card.style.transition = 'transform 0.7s ease-out';
            
            // Effet de brillance au mouvement de la souris
            card.addEventListener('mousemove', (e) => {
                // Ne pas appliquer si la carte est retournée
                if (card.classList.contains('flipped')) return;
                
                const cardRect = card.getBoundingClientRect();
                
                // Calculer la position relative de la souris (0-1)
                const x = (e.clientX - cardRect.left) / cardRect.width;
                const y = (e.clientY - cardRect.top) / cardRect.height;
                
                // Appliquer un effet de brillance qui suit la souris
                if (frontFace) {
                    // Ajouter une transition pour l'effet de brillance
                    frontFace.style.transition = 'background 0.3s ease-out';
                    
                    frontFace.style.background = `
                        radial-gradient(circle at ${x * 100}% ${y * 100}%, 
                        rgba(255, 255, 255, 0.8) 0%, 
                        rgba(249, 249, 249, 0.6) 15%, 
                        rgba(240, 240, 240, 0.5) 30%, 
                        var(--color-off-white) 60%)
                    `;
                    
                    // Effet subtil d'inclinaison 3D avec valeurs ajustées
                    const rotateY = (x - 0.5) * 8;
                    const rotateX = (0.5 - y) * 8;
                    
                    // Appliquer une transformation 3D légère
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                }
            });

        });
    }
    
    // 4. Animation de la section CTA
    const ctaBox = document.querySelector('.services__cta-box');
    
    if (ctaBox) {
        // Animation au scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Ajouter un effet de pulsation
                    ctaBox.classList.add('cta-pulse-animation');
                    
                    // Arrêter d'observer après le déclenchement
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(ctaBox);
    }
}

/**
 * Animation spéciale pour la révélation des cartes
 */
function initCardRevealAnimation() {
    // Configuration de l'observateur d'intersection
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ajouter un délai progressif à chaque carte
                const card = entry.target;
                const index = Array.from(card.parentNode.children).indexOf(card);
                const delay = index * 0.2; // 0.2s de délai entre chaque carte
                
                // Appliquer l'animation avec le délai
                card.style.animation = `cardReveal 0.8s ease-out ${delay}s forwards`;
                
                // Ne déclencher qu'une fois
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.1 });
    
    // Observer toutes les cartes
    const cards = document.querySelectorAll('.luxury-card');
    cards.forEach(card => {
        // Définir l'état initial (invisible)
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        
        // Observer pour déclencher l'animation
        observer.observe(card);
    });
}

/**
 * Ajoute les styles CSS pour l'animation de révélation des cartes
 */
function addCardRevealStyle() {
    // Créer un élément style
    const styleElement = document.createElement('style');
    
    // Définir l'animation
    styleElement.textContent = `
        @keyframes cardReveal {
            0% {
                opacity: 0;
                transform: translateY(40px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Ajout de transitions globales pour les cartes */
        .luxury-card {
            transition: transform 0.2s ease-out;
        }
        
        .service-card__inner {
            transition: transform 0.5s ease-in-out;
        }
        
        .service-card__face--front, .service-card__face--back {
            transition: background 0.3s ease-out;
        }

        /* Améliorer le style sur mobile */
        @media (max-width: 767px) {
            .service-card__face--back {
                cursor: pointer;
            }
        }
    `;
    
    // Ajouter au head du document
    document.head.appendChild(styleElement);
}

/**
 * Empêcher le chevauchement des cartes et du CTA en ajustant les marges si nécessaire
 */
function adjustSpacing() {
    const servicesContainer = document.querySelector('.services__container');
    const ctaWrapper = document.querySelector('.cta-wrapper');
    
    if (!servicesContainer || !ctaWrapper) return;
    
    // Obtenir la hauteur réelle du conteneur de services
    const containerHeight = servicesContainer.offsetHeight;
    
    if (containerHeight > 0 && window.innerWidth > 991) {
        const newMargin = -550 + (containerHeight - 500);
        ctaWrapper.style.marginTop = `${newMargin}px`;
    } else if (window.innerWidth <= 991 && window.innerWidth > 767) {
        // Tablette
        const newMargin = -550 + (containerHeight - 350);
        ctaWrapper.style.marginTop = `${newMargin}px`;
    } else if (window.innerWidth <= 767) {
        // Mobile : fixer le margin-top à 1px pour éviter un espace trop grand
        ctaWrapper.style.marginTop = "1px";
    }
}

// Appeler adjustSpacing après le chargement et à chaque redimensionnement
window.addEventListener('load', adjustSpacing);
window.addEventListener('resize', adjustSpacing);
